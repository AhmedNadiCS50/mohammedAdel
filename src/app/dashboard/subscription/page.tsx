"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  getCurrentStudent, 
  redeemAccessCode, 
  getSettings, 
  getDaysRemaining, 
  isSubscriptionExpiringSoon,
  GRADE_LABELS
} from '@/lib/storage';
import { Student, PlatformSettings } from '@/lib/types';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Copy, 
  Check, 
  MessageCircle, 
  Sparkles, 
  ShieldCheck, 
  KeyRound, 
  Smartphone,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function SubscriptionPage() {
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);
  const [settings, setSettings] = useState<PlatformSettings>(getSettings());
  const [code, setCode] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isRedeeming, setIsRedeeming] = useState(false);

  useEffect(() => {
    const s = getCurrentStudent();
    if (!s) {
      router.push('/login');
      return;
    }
    setStudent(s);
    setSettings(getSettings());
  }, [router]);

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleRedeem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!student || !code.trim()) return;

    setIsRedeeming(true);
    setMessage(null);

    const result = redeemAccessCode(code, student.id);
    if (result.success && result.student) {
      setStudent(result.student);
      setMessage({ type: 'success', text: result.message });
      setCode('');
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // Safe fallback
      }
    } else {
      setMessage({ type: 'error', text: result.message });
    }
    setIsRedeeming(false);
  };

  if (!student) return null;

  const daysRemaining = getDaysRemaining(student.subscription.expiresAt);
  const isExpiringSoon = isSubscriptionExpiringSoon(student.subscription.expiresAt);

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Top Banner / Expiry Alert */}
        {isExpiringSoon && (
          <div className="bg-amber-50 border border-amber-300 p-4 rounded-xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <p className="font-bold text-amber-900 text-sm">تنبيه بقرب انتهاء الاشتراك!</p>
                <p className="text-xs text-amber-700">
                  متبقي <strong>{daysRemaining} أيام</strong> فقط على انتهاء اشتراكك. يرجى تجديد الاشتراك لتجنب إيقاف المحتوى.
                </p>
              </div>
            </div>
            <a
              href={`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(
                `مرحباً مستر عمرو شاهين، أود تجديد اشتراكي في المنصة (${student.name} - ${GRADE_LABELS[student.grade]})`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-colors shrink-0"
            >
              تجديد عبر واتساب
            </a>
          </div>
        )}

        {/* Subscription Status Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
            <div>
              <span className="text-xs text-gray-500 font-medium">حساب الطالب</span>
              <h1 className="text-2xl font-black text-gray-900">{student.name}</h1>
              <p className="text-xs text-green-800 font-bold mt-1">
                {GRADE_LABELS[student.grade]} • {student.phone}
              </p>
            </div>

            <div>
              {student.subscription.isActive ? (
                <div className="bg-green-50 border border-green-200 p-4 rounded-xl text-right sm:text-left">
                  <div className="flex items-center gap-1.5 text-green-800 font-black text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-700" />
                    <span>الاشتراك مفعّل بنجاح</span>
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    الشهر: <strong className="text-gray-900">{student.subscription.monthName || 'الحالي'}</strong>
                  </div>
                  <div className="text-xs text-green-700 font-bold mt-0.5">
                    متبقي {daysRemaining} يوم
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-right sm:text-left">
                  <div className="flex items-center gap-1.5 text-amber-800 font-bold text-sm">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>الاشتراك غير مفعّل حالياً</span>
                  </div>
                  <p className="text-xs text-amber-700 mt-0.5">
                    يرجى سداد الاشتراك وإدخال كود التفعيل أدناه
                  </p>
                </div>
              )}
            </div>
          </div>

          {student.subscription.isActive && (
            <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-gray-100">
              <span className="text-xs text-gray-500 leading-normal">
                يمكنك الآن مشاهدة كافة محاضرات هذا الشهر وحل الامتحانات.
              </span>
              <Link
                href="/dashboard"
                className="self-start sm:self-auto inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-sm"
                style={{ background: '#1B4332' }}
              >
                <span>الذهاب إلى المحاضرات</span>
                <ArrowRight className="w-3.5 h-3.5 rotate-180" />
              </Link>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Code Redemption */}
          <div className="lg:col-span-6 bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl text-white flex items-center justify-center font-bold shrink-0"
                style={{ background: '#1B4332' }}
              >
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-gray-900 leading-snug">تفعيل كود الاشتراك</h2>
                <p className="text-xs text-gray-500">أدخل الكود الذي استلمته من مستر عمرو شاهين</p>
              </div>
            </div>

            {message && (
              <div
                className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
                  message.type === 'success'
                    ? 'bg-green-50 border-green-200 text-green-800 font-bold'
                    : 'bg-red-50 border-red-200 text-red-700'
                }`}
              >
                {message.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-green-700" />
                ) : (
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                )}
                <span>{message.text}</span>
              </div>
            )}

            <form onSubmit={handleRedeem} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  كود التفعيل (Access Code)
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: ADEL-TECH-7K82"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 rounded-xl text-base font-mono uppercase tracking-widest text-center text-gray-900 border border-gray-300 focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 font-bold"
                />
              </div>

              <button
                type="submit"
                disabled={isRedeeming}
                className="w-full py-3 font-bold text-sm rounded-xl text-white shadow-sm transition-all flex items-center justify-center gap-2 hover:opacity-95"
                style={{ background: '#1B4332' }}
              >
                <Sparkles className="w-4 h-4" />
                <span>{isRedeeming ? 'جاري التحقق...' : 'تفعيل الاشتراك فوراً'}</span>
              </button>
            </form>

            <p className="text-xs text-gray-500 leading-relaxed pt-2 border-t border-gray-100">
              * كل كود صالح للاستخدام لمرة واحدة فقط ويرتبط بحسابك مباشرة لمدة شهر كامل.
            </p>
          </div>

          {/* Right Column: Payment Methods */}
          <div className="lg:col-span-6 bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-100 text-green-800 flex items-center justify-center font-bold shrink-0">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-gray-900 leading-snug">طرق سداد الاشتراك</h2>
                <p className="text-xs text-gray-500">تحويل يدوي آمن ومباشر للمستر</p>
              </div>
            </div>

            <div className="space-y-3">
              {/* Vodafone Cash */}
              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5">
                <div>
                  <span className="text-xs text-gray-500 block font-medium">فودافون كاش (Vodafone Cash)</span>
                  <span className="font-mono text-base font-black text-gray-900 tracking-wider">
                    {settings.vodafoneCashNumber}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(settings.vodafoneCashNumber, 'vodafone')}
                  className="px-3 py-1.5 bg-white hover:bg-gray-100 border border-gray-300 rounded-lg text-xs font-bold text-gray-700 flex items-center gap-1.5 transition-colors shrink-0"
                >
                  {copiedField === 'vodafone' ? <Check className="w-3.5 h-3.5 text-green-700" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedField === 'vodafone' ? 'تم النسخ' : 'نسخ'}</span>
                </button>
              </div>

              {/* InstaPay */}
              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5">
                <div className="min-w-0">
                  <span className="text-xs text-gray-500 block font-medium">إنستاباي (InstaPay Username)</span>
                  <span className="font-mono text-xs sm:text-sm font-black text-gray-900 break-all">
                    {settings.instapayUsername}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(settings.instapayUsername, 'instapay')}
                  className="px-3 py-1.5 bg-white hover:bg-gray-100 border border-gray-300 rounded-lg text-xs font-bold text-gray-700 flex items-center gap-1.5 transition-colors shrink-0"
                >
                  {copiedField === 'instapay' ? <Check className="w-3.5 h-3.5 text-green-700" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedField === 'instapay' ? 'تم النسخ' : 'نسخ'}</span>
                </button>
              </div>
            </div>

            {/* WhatsApp Confirmation CTA */}
            <div className="pt-2">
              <a
                href={`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(
                  `مرحباً مستر عمرو شاهين، أنا الطالب (${student.name}) بالصف (${GRADE_LABELS[student.grade]}). قمت بالتحويل وأرسل لحضرتك إثبات الدفع لاستلام كود التفعيل.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 bg-green-700 hover:bg-green-800 text-white font-bold text-sm rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span>إرسال إثبات الدفع للمستر على واتساب</span>
              </a>
              <p className="text-[11px] text-gray-500 text-center mt-2">
                بعد التحويل، أرسل سكرين شوت بالتحويل على واتساب وسيقوم المستر بالرد فوراً وإرسال كود التفعيل لك.
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
