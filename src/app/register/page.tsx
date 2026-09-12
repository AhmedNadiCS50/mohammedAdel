"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { registerStudent } from '@/lib/storage';
import { isFirebaseConfigured } from '@/lib/firebase';
import { firebaseRegisterUser } from '@/lib/firebaseAuth';
import { GradeLevel } from '@/lib/types';
import { User, Phone, Lock, GraduationCap, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [grade, setGrade] = useState<GradeLevel>('first_secondary_general');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!name.trim() || !phone.trim() || !parentPhone.trim() || !password) {
      setError('يرجى ملء جميع الحقول الإلزامية.');
      setLoading(false);
      return;
    }

    if (phone.trim() === parentPhone.trim()) {
      setError('يرجى إدخال رقم مختلف لولي الأمر عن رقم الطالب.');
      setLoading(false);
      return;
    }

    if (isFirebaseConfigured()) {
      const authRes = await firebaseRegisterUser(phone.trim(), password);
      if (!authRes.success && authRes.error?.includes('مسجل')) {
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
      router.push('/dashboard/subscription');
    } else {
      setError(result.error || 'حدث خطأ أثناء التسجيل.');
    }
    setLoading(false);
  };

  return (
    <div className="bg-gray-50 min-h-[90vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        
        {/* Top Header */}
        <div className="p-6 text-center border-b border-gray-100 bg-emerald-50/40">
          <div className="relative w-16 h-16 mx-auto mb-2 rounded-2xl overflow-hidden border-2 border-green-200">
            <Image
              src="/images/teacher.png"
              alt="مستر محمد عادل"
              fill
              className="object-cover object-top"
            />
          </div>
          <h2 className="text-2xl font-black text-gray-900">تسجيل طالب جديد على المنصة</h2>
          <p className="text-xs text-green-800 font-bold mt-1">
            مادة التكنولوجيا والبرمجة • الخبير مستر محمد عادل
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Student Full Name */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">اسم الطالب رباعي باللغة العربية</label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="مثال: أحمد محمود علي إبراهيم"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 text-sm"
              />
              <User className="w-4 h-4 text-gray-400 absolute right-3.5 top-3" />
            </div>
          </div>

          {/* Phone Numbers Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">رقم موبايل الطالب (واتساب)</label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  placeholder="01012345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 text-sm"
                />
                <Phone className="w-4 h-4 text-gray-400 absolute right-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">رقم موبايل ولي الأمر</label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  placeholder="01112345678"
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 text-sm"
                />
                <Phone className="w-4 h-4 text-gray-400 absolute right-3.5 top-3" />
              </div>
            </div>
          </div>

          {/* Grade Level Selection */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">الصف الدراسي والمسار</label>
            <div className="relative">
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value as GradeLevel)}
                className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-gray-300 text-gray-900 bg-white focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 text-sm appearance-none cursor-pointer"
              >
                <option value="first_secondary_general">الصف الأول الثانوي - عام (المنهج الجديد)</option>
                <option value="first_secondary_bac">الصف الأول الثانوي - بكالوريا تخصصية</option>
                <option value="second_secondary_general">الصف الثاني الثانوي - عام (علمي وأدبي)</option>
                <option value="second_secondary_bac">الصف الثاني الثانوي - بكالوريا برمجة (كتاب المستر)</option>
              </select>
              <GraduationCap className="w-4 h-4 text-gray-400 absolute right-3.5 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">كلمة مرور الحساب</label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="اختر كلمة مرور لتسجيل الدخول"
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
            className="w-full py-3.5 rounded-xl font-black text-white text-sm transition-all hover:opacity-95 shadow-sm mt-2 flex items-center justify-center gap-2"
            style={{ background: '#1B4332' }}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{loading ? 'جاري إنشاء الحساب...' : 'إنشاء الحساب ومتابعة الاشتراك'}</span>
          </button>

          {/* Login prompt */}
          <div className="mt-6 pt-4 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-600">
              لديك حساب مسجل بالفعل؟{' '}
              <Link href="/login" className="font-bold text-green-800 hover:underline">
                تسجيل الدخول من هنا
              </Link>
            </p>
          </div>
        </form>

      </div>
    </div>
  );
}
