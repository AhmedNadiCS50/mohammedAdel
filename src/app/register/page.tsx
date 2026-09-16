"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerStudent } from "@/lib/storage";
import { isFirebaseConfigured } from "@/lib/firebase";
import { firebaseRegisterUser } from "@/lib/firebaseAuth";
import { GradeLevel, AcademicTrack } from "@/lib/types";
import {
  User, Phone, Lock, MapPin, Eye, EyeOff, AlertCircle, CheckCircle2,
  ChevronRight, ChevronLeft, GraduationCap, BookOpen, UserRound,
  Stethoscope, Cpu, Briefcase, Palette,
} from "lucide-react";
import AuthShell from "@/components/AuthShell";

const GOVERNORATES = [
  "القاهرة", "الجيزة", "الإسكندرية", "الدقهلية", "البحر الأحمر",
  "البحيرة", "الفيوم", "الغربية", "الإسماعيلية", "المنوفية",
  "المنيا", "القليوبية", "الوادي الجديد", "السويس", "أسوان",
  "أسيوط", "بني سويف", "بورسعيد", "دمياط", "الشرقية",
  "جنوب سيناء", "كفر الشيخ", "مطروح", "الأقصر", "قنا",
  "شمال سيناء", "سوهاج",
];

// مسارات البكالوريا الأربعة
const BAC_TRACKS: { value: AcademicTrack; label: string; desc: string }[] = [
  { value: "bac_medical", label: "طب وعلوم حياة", desc: "طب، أسنان، صيدلة، تمريض" },
  { value: "bac_engineering", label: "هندسة وعلوم حاسب", desc: "هندسة، برمجة، ذكاء اصطناعي" },
  { value: "bac_business", label: "إدارة أعمال ومحاسبة", desc: "تجارة، محاسبة، اقتصاد" },
  { value: "bac_arts", label: "آداب وفنون", desc: "آداب، لغات، إعلام، فنون" },
];

function buildGrade(level: "first" | "second", system: "general" | "azhari" | "bac"): GradeLevel {
  const base = level === "first" ? "first_secondary" : "second_secondary";
  return `${base}_${system}` as GradeLevel;
}

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [firstName, setFirstName] = useState("");
  const [secondName, setSecondName] = useState("");
  const [thirdName, setThirdName] = useState("");
  const [fourthName, setFourthName] = useState("");
  const [phone, setPhone] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [gradeLevel, setGradeLevel] = useState<"first" | "second">("first");
  const [studySystem, setStudySystem] = useState<"general" | "azhari" | "bac">("general");
  const [bacTrack, setBacTrack] = useState<AcademicTrack | "">("");
  const [governorate, setGovernorate] = useState("");
  const [governorateQuery, setGovernorateQuery] = useState("");
  const [governorateOpen, setGovernorateOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const governorateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (governorateRef.current && !governorateRef.current.contains(e.target as Node)) {
        setGovernorateOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const filteredGovernorates = GOVERNORATES.filter((g) =>
    g.includes(governorateQuery.trim())
  );

  const grade = buildGrade(gradeLevel, studySystem);

  const handleGovernorateSelect = (g: string) => {
    setGovernorate(g);
    setGovernorateQuery(g);
    setGovernorateOpen(false);
  };

  const step1Valid = () => {
    if (!firstName.trim() || !secondName.trim() || !thirdName.trim() || !fourthName.trim()) {
      setError("اكتب كل أجزاء اسمك الأربعة بالعربي زي اللي في البطاقة.");
      return false;
    }
    const arabic = /^[\u0600-\u06FF\u0750-\u077F\s]+$/;
    if (
      !arabic.test(firstName) || !arabic.test(secondName) ||
      !arabic.test(thirdName) || !arabic.test(fourthName)
    ) {
      setError("الاسم لازم يكون بالعربي فقط زي اللي في البطاقة (بدون أرقام أو أحرف لاتينية).");
      return false;
    }
    if (!governorate) {
      setError("اختر محافظتك من القائمة أولًا.");
      return false;
    }
    return true;
  };

  const step2Valid = () => {
    if (!phone.trim() || !parentPhone.trim()) {
      setError("اكتب أرقام الموبايل كاملة (الطلاب وولي الأمر).");
      return false;
    }
    if (phone.trim() === parentPhone.trim()) {
      setError("رقم ولي الأمر لازم يكون مختلف عن رقم الطالب.");
      return false;
    }
    if (password.length < 6) {
      setError("كلمة المرور لازم تكون 6 أحرف أو أرقام على الأقل.");
      return false;
    }
    if (password !== confirmPassword) {
      setError("تأكيد كلمة المرور غير مطابق لكلمة المرور، يرجى إعادة الإدخال.");
      return false;
    }
    return true;
  };

  const step3Valid = () => {
    if (studySystem === "bac" && !bacTrack) {
      setError("اختر مسارك في نظام البكالوريا الجديد (واحد من الأربعة).");
      return false;
    }
    return true;
  };

  const goNext = () => {
    setError("");
    if (step === 1 && !step1Valid()) return;
    if (step === 2 && !step2Valid()) return;
    setStep((s) => (s === 3 ? 3 : ((s + 1) as 1 | 2 | 3)));
  };

  const goBack = () => {
    setError("");
    setStep((s) => (s === 1 ? 1 : ((s - 1) as 1 | 2 | 3)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!step3Valid()) return;
    setLoading(true);

    const name = [
      firstName.trim(), secondName.trim(), thirdName.trim(), fourthName.trim(),
    ].filter(Boolean).join(" ");

    if (isFirebaseConfigured()) {
      const authRes = await firebaseRegisterUser(phone.trim(), password);
      if (!authRes.success && authRes.error?.includes("مسجل")) {
        setError(authRes.error);
        setLoading(false);
        return;
      }
    }

    const result = registerStudent({
      name,
      phone: phone.trim(),
      parentPhone: parentPhone.trim(),
      grade,
      governorate,
      track: studySystem === "bac" && bacTrack ? bacTrack : undefined,
    });

    if (result.success) {
      router.push("/dashboard/subscription");
    } else {
      setError(result.error || "حدث خطأ أثناء التسجيل.");
    }
    setLoading(false);
  };

  const handleGovernorateQuery = (v: string) => {
    setGovernorateQuery(v);
    setGovernorateOpen(true);
    // اتبع اختيار تلقائي عند تطابق تام
    const exact = GOVERNORATES.find((g) => g === v.trim());
    if (exact) {
      setGovernorate(exact);
    }
  };

  const steps = [
    { n: 1, label: "البيانات الأساسية" },
    { n: 2, label: "أرقام وكلمة المرور" },
    { n: 3, label: "الصف والنظام" },
  ];

  return (
    <AuthShell
      title="إنشاء حساب طالب جديد"
      subtitle="سجّل بياناتك في 3 خطوات بسيطة والتحق بالمنصة مباشرةً"
      footer={
        <p className="text-xs text-gray-600">
          لديك حساب مسجل بالفعل؟{" "}
          <Link href="/login" className="font-bold text-[#1B4332] hover:underline">
            تسجيل الدخول من هنا
          </Link>
        </p>
      }
    >
      {/* مؤشر الخطوات */}
      <div className="flex items-center justify-between gap-2 mb-6">
        {steps.map((s) => (
          <div key={s.n} className="flex-1">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-black border-2 transition-colors ${
                  step === s.n
                    ? "bg-[#1B4332] border-[#1B4332] text-white"
                    : step > s.n
                    ? "bg-[#D4EFDF] border-[#74C69D] text-[#1B4332]"
                    : "bg-white border-slate-200 text-gray-400"
                }`}
              >
                {step > s.n ? <CheckCircle2 className="w-4 h-4" /> : s.n}
              </div>
              <span className={`text-[11px] font-bold ${step === s.n ? "text-[#1B4332]" : "text-gray-400"}`}>
                {s.label}
              </span>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* ===== الخطوة 1: الاسم الرباعي + المحافظة ===== */}
        {step === 1 && (
          <>
            <div>
              <label className="block text-[13px] font-bold text-gray-700 mb-1.5">
                اسمك الرباعي باللغة العربية — زي اللي في البطاقة
              </label>
              <div className="space-y-2.5">
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="اكتب اسمك الأول بالعربي زي اللي في البطاقة"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="prem-input pr-12"
                  />
                  <User className="w-4 h-4 text-gray-400 absolute right-4 top-4" />
                </div>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="اكتب اسمك التاني بالعربي زي اللي في البطاقة"
                    value={secondName}
                    onChange={(e) => setSecondName(e.target.value)}
                    className="prem-input pr-12"
                  />
                  <User className="w-4 h-4 text-gray-400 absolute right-4 top-4" />
                </div>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="اكتب اسمك التالت بالعربي زي اللي في البطاقة"
                    value={thirdName}
                    onChange={(e) => setThirdName(e.target.value)}
                    className="prem-input pr-12"
                  />
                  <User className="w-4 h-4 text-gray-400 absolute right-4 top-4" />
                </div>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="اكتب اسمك الرابع بالعربي زي اللي في البطاقة"
                    value={fourthName}
                    onChange={(e) => setFourthName(e.target.value)}
                    className="prem-input pr-12"
                  />
                  <User className="w-4 h-4 text-gray-400 absolute right-4 top-4" />
                </div>
              </div>
            </div>

            {/* المحافظة قابلة للبحث */}
            <div ref={governorateRef}>
              <label className="block text-[13px] font-bold text-gray-700 mb-1.5">المحافظة</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="اكتب اسم محافظتك وابحث عنها…"
                  value={governorateQuery}
                  onChange={(e) => handleGovernorateQuery(e.target.value)}
                  onFocus={() => setGovernorateOpen(true)}
                  className="prem-input pr-12"
                />
                <MapPin className="w-4 h-4 text-gray-400 absolute right-4 top-4" />
              </div>
              {governorateOpen && (
                <div className="absolute z-20 mt-1.5 w-full max-h-52 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg py-1">
                  {filteredGovernorates.length === 0 ? (
                    <p className="px-4 py-2.5 text-xs text-gray-400">لا توجد محافظة مطابقة للبحث</p>
                  ) : (
                    filteredGovernorates.map((g) => (
                      <button
                        type="button"
                        key={g}
                        onClick={() => handleGovernorateSelect(g)}
                        className={`w-full px-4 py-2.5 text-right text-xs font-semibold transition-colors ${
                          governorate === g
                            ? "bg-[#F3F7F4] text-[#1B4332]"
                            : "text-gray-700 hover:bg-slate-50"
                        }`}
                      >
                        {g}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={goNext}
              className="w-full flex items-center justify-center gap-2 bg-[#1B4332] text-white font-bold text-sm rounded-xl py-3.5 transition-colors hover:bg-[#244D3B]"
            >
              التالي
              <ChevronLeft className="w-4 h-4" />
            </button>
          </>
        )}

        {/* ===== الخطوة 2: أرقام الموبايل + كلمة المرور ===== */}
        {step === 2 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-1.5">رقم موبايل الطالب (واتساب)</label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    placeholder="01012345678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="prem-input pr-12"
                  />
                  <Phone className="w-4 h-4 text-gray-400 absolute right-4 top-4" />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-1.5">رقم موبايل ولي الأمر (واتساب)</label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    placeholder="01112345678"
                    value={parentPhone}
                    onChange={(e) => setParentPhone(e.target.value)}
                    className="prem-input pr-12"
                  />
                  <Phone className="w-4 h-4 text-gray-400 absolute right-4 top-4" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-bold text-gray-700 mb-1.5">كلمة مرور الحساب</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="اختر كلمة مرور 6 أحرف على الأقل"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="prem-input pr-12"
                />
                <Lock className="w-4 h-4 text-gray-400 absolute right-4 top-4" />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute left-3 top-3 text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-bold text-gray-700 mb-1.5">تأكيد كلمة المرور</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="أعد كتابة كلمة المرور مرة أخرى للتأكيد"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="prem-input pr-12"
                />
                <Lock className="w-4 h-4 text-gray-400 absolute right-4 top-4" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={goBack}
                className="flex items-center justify-center gap-1.5 bg-white border border-slate-300 text-gray-700 font-bold text-sm rounded-xl py-3.5 transition-colors hover:bg-slate-50"
              >
                <ChevronRight className="w-4 h-4" />
                رجوع
              </button>
              <button
                type="button"
                onClick={goNext}
                className="flex items-center justify-center gap-2 bg-[#1B4332] text-white font-bold text-sm rounded-xl py-3.5 transition-colors hover:bg-[#244D3B]"
              >
                التالي
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </>
        )}

        {/* ===== الخطوة 3: الصف + النظام الدراسي + مسارات البكالوريا ===== */}
        {step === 3 && (
          <>
            <div>
              <label className="block text-[13px] font-bold text-gray-700 mb-1.5">الصف الدراسي</label>
              <div className="grid grid-cols-2 gap-2">
                {(["first", "second"] as const).map((lv) => (
                  <button
                    key={lv}
                    type="button"
                    onClick={() => setGradeLevel(lv)}
                    className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs font-bold transition-colors ${
                      gradeLevel === lv
                        ? "border-[#1B4332] bg-[#1B4332] text-white"
                        : "border-slate-300 bg-white text-gray-600 hover:border-[#1B4332]"
                    }`}
                  >
                    <GraduationCap className="w-4 h-4" />
                    {lv === "first" ? "الصف الأول الثانوي" : "الصف الثاني الثانوي"}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-bold text-gray-700 mb-1.5">النظام الدراسي</label>
              <div className="grid grid-cols-3 gap-2">
                {(["general", "azhari", "bac"] as const).map((sys) => (
                  <button
                    key={sys}
                    type="button"
                    onClick={() => setStudySystem(sys)}
                    className={`flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-xl border text-xs font-bold transition-colors ${
                      studySystem === sys
                        ? "border-[#1B4332] bg-[#1B4332] text-white"
                        : "border-slate-300 bg-white text-gray-600 hover:border-[#1B4332]"
                    }`}
                  >
                    {sys === "general" ? "عام" : sys === "azhari" ? "أزهر" : "بكالوريا"}
                  </button>
                ))}
              </div>
            </div>

            {/* مسارات البكالوريا الأربعة */}
            {studySystem === "bac" && (
              <div>
                <label className="flex items-center gap-1.5 text-[13px] font-bold text-gray-700 mb-1.5">
                  <BookOpen className="w-4 h-4 text-[#D4AF37]" />
                  اختر مسارك في نظام البكالوريا الجديد
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {BAC_TRACKS.map((t, i) => {
                    const icons = [Stethoscope, Cpu, Briefcase, Palette];
                    const Icon = icons[i];
                    return (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => setBacTrack(t.value)}
                        className={`flex items-start gap-3 p-3 rounded-xl border text-right transition-colors ${
                          bacTrack === t.value
                            ? "border-[#1B4332] bg-[#F3F7F4] ring-2 ring-[#1B4332]/10"
                            : "border-slate-300 bg-white hover:border-[#1B4332]"
                        }`}
                      >
                        <span className={`mt-0.5 w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                          bacTrack === t.value ? "bg-[#1B4332] text-white" : "bg-slate-100 text-gray-500"
                        }`}>
                          <Icon className="w-4 h-4" />
                        </span>
                        <span>
                          <span className="block text-xs font-black text-gray-800">{t.label}</span>
                          <span className="block mt-0.5 text-[11px] text-gray-500">{t.desc}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#1B4332] text-white font-bold text-sm rounded-xl py-3.5 transition-colors hover:bg-[#244D3B] disabled:opacity-60"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              {loading ? "جاري إنشاء الحساب..." : "إنشاء الحساب والمتابعة"}
            </button>

            <button
              type="button"
              onClick={goBack}
              className="w-full flex items-center justify-center gap-1.5 bg-white border border-slate-300 text-gray-700 font-bold text-sm rounded-xl py-3.5 transition-colors hover:bg-slate-50"
            >
              <ChevronRight className="w-4 h-4" />
              رجوع للخطوة السابقة
            </button>
          </>
        )}
      </form>
    </AuthShell>
  );
}
