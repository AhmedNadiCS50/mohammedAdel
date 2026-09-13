"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerStudent } from "@/lib/storage";
import { isFirebaseConfigured } from "@/lib/firebase";
import { firebaseRegisterUser } from "@/lib/firebaseAuth";
import { GradeLevel } from "@/lib/types";
import { Phone, Lock, User, GraduationCap, AlertCircle, CheckCircle2 } from "lucide-react";
import AuthShell from "@/components/AuthShell";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [grade, setGrade] = useState<GradeLevel>("first_secondary_general");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!name.trim() || !phone.trim() || !parentPhone.trim() || !password) {
      setError("يرجى ملء جميع الحقول الإلزامية.");
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
      name: name.trim(),
      phone: phone.trim(),
      parentPhone: parentPhone.trim(),
      grade,
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
        {/* Name */}
        <div>
          <label className="block text-[13px] font-bold text-gray-700 mb-1.5">اسم الطالب رباعي باللغة العربية</label>
          <div className="relative">
            <input
              type="text"
              required
              placeholder="مثال: أحمد محمود علي إبراهيم"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="prem-input pr-10"
            />
            <User className="w-4 h-4 text-gray-400 absolute right-3.5 top-3.5" />
          </div>
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
                className="prem-input pr-10"
              />
              <Phone className="w-4 h-4 text-gray-400 absolute right-3.5 top-3.5" />
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
                className="prem-input pr-10"
              />
              <Phone className="w-4 h-4 text-gray-400 absolute right-3.5 top-3.5" />
            </div>
          </div>
        </div>

        {/* Grade */}
        <div>
          <label className="block text-[13px] font-bold text-gray-700 mb-1.5">الصف الدراسي والمسار</label>
          <div className="relative">
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value as GradeLevel)}
              className="prem-input pr-10 appearance-none cursor-pointer"
            >
              <option value="first_secondary_general">الصف الأول الثانوي - عام (المنهج الجديد)</option>
              <option value="first_secondary_bac">الصف الأول الثانوي - بكالوريا تخصصية</option>
              <option value="second_secondary_general">الصف الثاني الثانوي - عام (علمي وأدبي)</option>
              <option value="second_secondary_bac">الصف الثاني الثانوي - بكالوريا برمجة (كتاب المستر)</option>
            </select>
            <GraduationCap className="w-4 h-4 text-gray-400 absolute right-3.5 top-3.5 pointer-events-none" />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-[13px] font-bold text-gray-700 mb-1.5">كلمة مرور الحساب</label>
          <div className="relative">
            <input
              type="password"
              required
              placeholder="اختر كلمة مرور لتسجيل الدخول"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="prem-input pr-10"
            />
            <Lock className="w-4 h-4 text-gray-400 absolute right-3.5 top-3.5" />
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