"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { studentLoginAsync, setAdminLoggedIn } from "@/lib/storage";
import { isFirebaseConfigured } from "@/lib/firebase";
import { firebaseLoginUser, firebaseRegisterUser } from "@/lib/firebaseAuth";
import { Phone, Lock, ShieldCheck, AlertCircle, GraduationCap } from "lucide-react";
import AuthShell from "@/components/AuthShell";

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<"student" | "admin">("student");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [adminUser, setAdminUser] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!phone) {
      setError("يرجى إدخال رقم الهاتف المسجل به.");
      setLoading(false);
      return;
    }

    if (isFirebaseConfigured() && password) {
      const fbLogin = await firebaseLoginUser(phone, password);
      if (!fbLogin.success) {
        const fbReg = await firebaseRegisterUser(phone, password);
        if (!fbReg.success) {
          await firebaseLoginUser(phone, password).catch(() => {});
        }
      }
    }

    const result = await studentLoginAsync(phone, password);
    if (result.success) {
      router.push("/dashboard");
    } else {
      setError(result.error || "فشل تسجيل الدخول.");
    }
    setLoading(false);
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const cleanUser = adminUser.trim().toLowerCase();
    if ((cleanUser === "admin" || cleanUser === "mohamed") && adminPassword === "adel2027") {
      if (isFirebaseConfigured()) {
        const loginResult = await firebaseLoginUser("admin", adminPassword);
        if (!loginResult.success) {
          await firebaseRegisterUser("admin", adminPassword);
        }
      }
      setAdminLoggedIn(true);
      router.push("/admin");
    } else {
      setError("اسم المستخدم أو كلمة مرور لوحة المدرس غير صحيحة.");
    }
    setLoading(false);
  };

  return (
    <AuthShell
      title="تسجيل الدخول للمنصة"
      subtitle="أدخل بياناتك للوصول إلى المحتوى التعليمي والواجبات والامتحانات"
      footer={
        <p className="text-xs text-gray-600">
          طالب جديد وليس لديك حساب؟{" "}
          <Link href="/register" className="font-bold text-[#1B4332] hover:underline">
            أنشئ حسابك الآن مجاناً
          </Link>
        </p>
      }
    >
      {/* Role Tabs */}
      <div className="grid grid-cols-2 gap-1 p-1 rounded-xl mb-6 bg-gray-100 border border-gray-200">
        <button
          type="button"
          onClick={() => { setRole("student"); setError(""); }}
          className={`py-2.5 text-xs font-bold rounded-lg transition-all ${
            role === "student"
              ? "bg-white text-[#1B4332] shadow-sm border border-gray-200"
              : "text-gray-500 hover:text-gray-800"
          }`}
        >
          حساب طالب
        </button>
        <button
          type="button"
          onClick={() => { setRole("admin"); setError(""); }}
          className={`py-2.5 text-xs font-bold rounded-lg transition-all ${
            role === "admin"
              ? "bg-white text-[#1B4332] shadow-sm border border-gray-200"
              : "text-gray-500 hover:text-gray-800"
          }`}
        >
          بوابة المدرس (Admin)
        </button>
      </div>

      {error && (
        <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {role === "student" ? (
        <form onSubmit={handleStudentLogin} className="space-y-4">
          <div>
            <label className="block text-[13px] font-bold text-gray-700 mb-1.5">رقم هاتف الطالب</label>
            <div className="relative">
              <input
                type="tel"
                required
                placeholder="مثال: 01012345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="prem-input pr-10"
              />
              <Phone className="w-4 h-4 text-gray-400 absolute right-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-bold text-gray-700 mb-1.5">كلمة المرور</label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
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
            className="btn-hero btn-hero--green w-full py-3 text-sm mt-2"
          >
            <GraduationCap className="w-4 h-4 shrink-0" />
            {loading ? "جاري التحقق..." : "دخول إلى حسابي"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div>
            <label className="block text-[13px] font-bold text-gray-700 mb-1.5">اسم المستخدم (المدرس)</label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="admin"
                value={adminUser}
                onChange={(e) => setAdminUser(e.target.value)}
                className="prem-input pr-10"
              />
              <ShieldCheck className="w-4 h-4 text-gray-400 absolute right-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-bold text-gray-700 mb-1.5">كلمة مرور الإدارة</label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="prem-input pr-10"
              />
              <Lock className="w-4 h-4 text-gray-400 absolute right-3.5 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-hero btn-hero--green w-full py-3 text-sm mt-2"
          >
            <ShieldCheck className="w-4 h-4 shrink-0" />
            {loading ? "جاري التحقق..." : "دخول لوحة التحكم"}
          </button>
        </form>
      )}
    </AuthShell>
  );
}