"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerStudent } from "@/lib/storage";
import { isFirebaseConfigured } from "@/lib/firebase";
import { firebaseRegisterUser } from "@/lib/firebaseAuth";
import { GradeLevel } from "@/lib/types";
import { Phone, Lock, User, GraduationCap, MapPin, Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";
import AuthShell from "@/components/AuthShell";

const GOVERNORATES = [
  "القاهرة",
  "الجيزة",
  "الإسكندرية",
  "الدقهلية",
  "البحر الأحمر",
  "البحيرة",
  "الفيوم",
  "الغربية",
  "الإسماعيلية",
  "المنوفية",
  "المنيا",
  "القليوبية",
  "الوادي الجديد",
  "السويس",
  "أسوان",
  "أسيوط",
  "بني سويف",
  "بورسعيد",
  "دمياط",
  "الشرقية",
  "جنوب سيناء",
  "كفر الشيخ",
  "مطروح",
  "الأقصر",
  "قنا",
  "شمال سيناء",
  "سوهاج",
];

function buildGrade(level: "first" | "second", system: "general" | "azhari" | "bac"): GradeLevel {
  const base = level === "first" ? "first_secondary" : "second_secondary";
  return `${base}_${system}` as GradeLevel;
}

export default function RegisterPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [secondName, setSecondName] = useState("");
  const [thirdName, setThirdName] = useState("");
  const [fourthName, setFourthName] = useState("");
  const [phone, setPhone] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [gradeLevel, setGradeLevel] = useState<"first" | "second">("first");
  const [studySystem, setStudySystem] = useState<"general" | "azhari" | "bac">("general");
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

  const grade = buildGrade(gradeLevel, studySystem           
);

  const handleGovernorateSelect = (g: string) => {
    setGovernorate(g);
    setGovernorateQuery(g);
    setGovernorateOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const name = [
      firstName.trim(),
      secondName.trim(),
      thirdName.trim(),
      fourthName.trim(),
    ].filter(Boolean).join(" ");

    if (!name || !phone.trim() || !parentPhone.trim() || !governorate || !password || !confirmPassword) {
      setError("يرجى ملء جميع الحقول الإلزامية.");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("تأكيد كلمة المرور غير مطابق لكلمة المرور، يرجى إعادة الإدخال.");
      setLoading(false);
      return;
    }

    if (phone.trim() === parentPhone.trim()) {
      setError("يرجى إدخال رقم مختلف لولي الأمر عن رقم الطالب.");
      setLoading(false);
      return;
    }

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
    });

    if (result.success) {
      router.push("/dashboard/subscription");
    } else {
      setError(result.error || "حدث خطأ أثناء التسجيل.");
    }
    setLoading(false);
  };

  return (
    <AuthShell
      title="إنشاء حساب طالب جديد"
      subtitle="سجّل بياناتك والتحق بالمنصة مباشرةً لتبدأ رحلتك نحو الدرجة النهائية"
      footer={
        <p className="text-xs text-gray-600">
          لديك حساب مسجل بالفعل؟{" "}
          <Link href="/login" className="font-bold text-[#1B4332] hover:underline">
            تسجيل الدخول من هنا
          </Link>
        </p>
      }
    >
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F3F7F4] border border-[#D1E8D9]">
          <span className="w-2 h-2 rounded-full bg-[#1B4332]" />
          <span className="text-[11px] font-bold text-[#1B4332]">حساب مجاني • وصول فوري بعد التفعيل</span>
        </div>
      </div>

      {error && (
        <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name - رباعي */}
        <div>
          <label className="block text-[13px] font-bold text-gray-700 mb-1.5">اسم الطالب الرباعي باللغة العربية</label>
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

        {/* Governorate - قابل للبحث */}
        <div ref={governorateRef}>
          <label className="block text-[13px] font-bold text-gray-700 mb-1.5">
            المحافظة — اكتب محافظتك أو اخترها من القائمة
          </label>
          <div className="relative">
            <input
              type="text"
              required
              placeholder="أكتب اسم محافظتك وابحث عنها…"
              value={governorateQuery}
              onChange={(e) => {
                setGovernorateQuery(e.target.value);
                if (!governorateOpen) setGovernorateOpen(true);
              }}
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

        {/* Phones grid */}
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
            <label className="block text-[13px] font-bold text-gray-700 mb-1.5">رقم موبايل ولي الأمر</label>
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

        {/* Grade + نظام دراسي */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        </div>

        {/* Password */}
        <div>
          <label className="block text-[13px] font-bold text-gray-700 mb-1.5">كلمة مرور الحساب</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              placeholder="اختر كلمة مرور لتسجيل الدخول"
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

        {/* Confirm password */}
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

        <button
          type="submit"
          disabled={loading}
          className="btn-hero btn-hero--gold w-full py-3.5 text-sm mt-2"
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {loading ? "جاري إنشاء الحساب..." : "إنشاء الحساب والمتابعة"}
        </button>
      </form>
    </AuthShell>
  );
}
