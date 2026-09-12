"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { studentLoginAsync, setAdminLoggedIn } from '@/lib/storage';
import { isFirebaseConfigured } from '@/lib/firebase';
import { firebaseLoginUser, firebaseRegisterUser } from '@/lib/firebaseAuth';
import { User, Lock, Phone, ShieldCheck, AlertCircle, GraduationCap } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<'student' | 'admin'>('student');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [adminUser, setAdminUser] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!phone) {
      setError('يرجى إدخال رقم الهاتف المسجل به.');
      setLoading(false);
      return;
    }

    if (isFirebaseConfigured() && password) {
      // Try to login with Firebase Auth
      const fbLogin = await firebaseLoginUser(phone, password);
      if (!fbLogin.success) {
        // Student might have been created by admin (no Firebase Auth account yet)
        // Auto-create their Firebase Auth account on first login
        const fbReg = await firebaseRegisterUser(phone, password);
        if (!fbReg.success) {
          // Account might exist with different password - try to sign in again
          await firebaseLoginUser(phone, password).catch(() => {});
        }
      }
    }

    const result = await studentLoginAsync(phone, password);
    if (result.success) {
      router.push('/dashboard');
    } else {
      setError(result.error || 'فشل تسجيل الدخول.');
    }
    setLoading(false);
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const cleanUser = adminUser.trim().toLowerCase();
    if ((cleanUser === 'admin' || cleanUser === 'mohamed') && adminPassword === 'adel2027') {
      // Authenticate with Firebase Auth so Firestore rules recognize admin
      if (isFirebaseConfigured()) {
        const loginResult = await firebaseLoginUser('admin', adminPassword);
        if (!loginResult.success) {
          // Admin Firebase account doesn't exist yet - create it
          await firebaseRegisterUser('admin', adminPassword);
        }
      }
      setAdminLoggedIn(true);
      router.push('/admin');
    } else {
      setError('اسم المستخدم أو كلمة مرور لوحة المدرس غير صحيحة.');
      setLoading(false);
    }
    setLoading(false);
  };

  return (
    <div className="bg-gray-50 min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        
        {/* Card Header */}
        <div className="p-6 text-center border-b border-gray-100 bg-emerald-50/40">
          <div className="relative w-16 h-16 mx-auto mb-3 rounded-2xl overflow-hidden border-2 border-green-200">
            <Image
              src="/images/teacher.png"
              alt="مستر محمد عادل"
              fill
              className="object-cover object-top"
            />
          </div>
          <h2 className="text-2xl font-black text-gray-900">تسجيل الدخول للمنصة</h2>
          <p className="text-xs text-green-800 font-bold mt-1">
            مادة التكنولوجيا والبرمجة • الخبير مستر محمد عادل
          </p>

          {/* Role Toggle Tabs */}
          <div className="grid grid-cols-2 gap-1 p-1 rounded-xl mt-5 bg-gray-100 border border-gray-200">
            <button
              type="button"
              onClick={() => { setRole('student'); setError(''); }}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                role === 'student'
                  ? 'bg-white text-green-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              حساب طالب
            </button>
            <button
              type="button"
              onClick={() => { setRole('admin'); setError(''); }}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                role === 'admin'
                  ? 'bg-white text-green-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              بوابة المدرس (Admin)
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8">
          {error && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {role === 'student' ? (
            /* Student Form */
            <form onSubmit={handleStudentLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">رقم هاتف الطالب</label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    placeholder="مثال: 01012345678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 text-sm"
                  />
                  <Phone className="w-4 h-4 text-gray-400 absolute right-3.5 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">كلمة المرور</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 text-sm"
                  />
                  <Lock className="w-4 h-4 text-gray-400 absolute right-3.5 top-3" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-black text-white text-sm transition-all hover:opacity-95 shadow-sm mt-2 flex items-center justify-center gap-2"
                style={{ background: '#1B4332' }}
              >
                <GraduationCap className="w-4 h-4" />
                <span>{loading ? 'جاري التحقق...' : 'دخول إلى حسابي'}</span>
              </button>
            </form>
          ) : (
            /* Admin Form */
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">اسم المستخدم (المدرس)</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="admin"
                    value={adminUser}
                    onChange={(e) => setAdminUser(e.target.value)}
                    className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 text-sm"
                  />
                  <ShieldCheck className="w-4 h-4 text-gray-400 absolute right-3.5 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">كلمة مرور الإدارة</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 text-sm"
                  />
                  <Lock className="w-4 h-4 text-gray-400 absolute right-3.5 top-3" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-black text-white text-sm transition-all hover:opacity-95 shadow-sm mt-2 flex items-center justify-center gap-2"
                style={{ background: '#1B4332' }}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{loading ? 'جاري التحقق...' : 'دخول لوحة التحكم'}</span>
              </button>
            </form>
          )}

          {/* Footer link */}
          <div className="mt-6 pt-4 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-600">
              طالب جديد وليس لديك حساب؟{' '}
              <Link href="/register" className="font-bold text-green-800 hover:underline">
                أنشئ حسابك الآن مجاناً
              </Link>
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
