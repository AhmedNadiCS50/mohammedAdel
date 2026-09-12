"use client";

import React, { useState, useEffect } from 'react';
import { getSettings, updateSettings } from '@/lib/storage';
import { PlatformSettings } from '@/lib/types';
import { 
  Settings, 
  Save, 
  Check, 
  Smartphone, 
  MessageCircle, 
  ShieldCheck, 
  Bell,
  Sparkles
} from 'lucide-react';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<PlatformSettings>(getSettings());
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    setSettings(getSettings());
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(settings);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900">إعدادات المنصة وطرق الدفع اليدوية</h1>
        <p className="text-xs text-slate-500 mt-1">
          عدل بيانات السداد والتواصل مع مستر محمد عادل لتنعكس فوراً في صفحات الطلاب والفووتر.
        </p>
      </div>

      {savedNotice && (
        <div className="p-4 bg-emerald-100 border border-emerald-300 text-emerald-950 font-bold rounded-2xl flex items-center gap-2 text-xs shadow-sm">
          <Check className="w-4 h-4 text-emerald-700" />
          <span>تم حفظ الإعدادات بنجاح وتحديث بيانات المنصة فوراً.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
        {/* Payment Channels */}
        <div className="space-y-4">
          <h2 className="text-base font-black text-slate-900 flex items-center gap-2 border-b pb-2">
            <Smartphone className="w-4 h-4 text-emerald-800" />
            <span>بيانات المحافظ والتحويل اليدوي:</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                رقم محفظة فودافون كاش (Vodafone Cash)
              </label>
              <input
                type="text"
                required
                dir="ltr"
                value={settings.vodafoneCashNumber}
                onChange={(e) => setSettings({ ...settings, vodafoneCashNumber: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono text-left focus:outline-none focus:ring-2 focus:ring-emerald-700"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                اسم مستخدم إنستاباي (InstaPay Username)
              </label>
              <input
                type="text"
                required
                dir="ltr"
                value={settings.instapayUsername}
                onChange={(e) => setSettings({ ...settings, instapayUsername: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono text-left focus:outline-none focus:ring-2 focus:ring-emerald-700"
              />
            </div>
          </div>
        </div>

        {/* WhatsApp & Contact */}
        <div className="space-y-4 pt-2">
          <h2 className="text-base font-black text-slate-900 flex items-center gap-2 border-b pb-2">
            <MessageCircle className="w-4 h-4 text-emerald-800" />
            <span>رقم واتساب المعتمد للاستفسارات وإثباتات الدفع:</span>
          </h2>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              رقم الواتساب بالصيغة الدولية (بدون علامة +)
            </label>
            <input
              type="text"
              required
              dir="ltr"
              placeholder="2010xxxxxxxx"
              value={settings.whatsappNumber}
              onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
              className="w-full sm:w-80 px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono text-left focus:outline-none focus:ring-2 focus:ring-emerald-700"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              مثال: إذا كان الرقم 01012345678 اكتبه: <code className="bg-slate-100 px-1 py-0.5 rounded">201012345678</code>
            </p>
          </div>
        </div>

        {/* Announcement Banner */}
        <div className="space-y-4 pt-2">
          <h2 className="text-base font-black text-slate-900 flex items-center gap-2 border-b pb-2">
            <Bell className="w-4 h-4 text-emerald-800" />
            <span>شريط الإعلانات والرسائل الترحيبية:</span>
          </h2>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              نص الإعلان بأعلى الموقع
            </label>
            <input
              type="text"
              value={settings.announcementText || ''}
              onChange={(e) => setSettings({ ...settings, announcementText: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-700"
            />
          </div>
        </div>

        {/* Sequential Unlock Settings */}
        <div className="space-y-4 pt-2">
          <h2 className="text-base font-black text-slate-900 flex items-center gap-2 border-b pb-2">
            <Sparkles className="w-4 h-4 text-emerald-800" />
            <span>إعدادات فتح المحاضرات بالترتيب (Sequential Unlock):</span>
          </h2>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              نسبة المشاهدة المطلوبة لاعتبار المحاضرة مكتملة وفتح المحاضرة التالية (%)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={10}
                max={100}
                required
                value={settings.completionThreshold ?? 90}
                onChange={(e) => setSettings({ ...settings, completionThreshold: Number(e.target.value) })}
                className="w-32 px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-bold text-center focus:outline-none focus:ring-2 focus:ring-emerald-700"
              />
              <span className="text-xs text-slate-500 font-bold">% من إجمالي مدة الفيديو</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
              القيمة الافتراضية الموصى بها هي <strong>90%</strong>. عندما يصل الطالب لهذه النسبة من مدة فيديو الشرح، يعتبر الدرس مكتملاً في سجله وتفتح له المحاضرة التالية تلقائياً.
            </p>
          </div>
        </div>

        <div className="pt-4 border-t">
          <button
            type="submit"
            className="px-6 py-3 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>حفظ كافة الإعدادات</span>
          </button>
        </div>
      </form>
    </div>
  );
}
