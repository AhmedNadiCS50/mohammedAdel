"use client";

import React, { useState, useEffect } from 'react';
import {
  getModeratorsFromFirestore,
  saveModeratorToFirestore,
  deleteModeratorFromFirestore,
  hashModeratorPassword,
  newModeratorId,
} from '@/lib/moderatorService';
import { Moderator } from '@/lib/types';
import { isFirebaseConfigured } from '@/lib/firebase';
import {
  Users2,
  PlusCircle,
  Loader2,
  CheckCircle2,
  Trash2,
  Power,
  KeyRound,
  AlertCircle,
  RefreshCw,
  ShieldCheck,
  LogIn,
} from 'lucide-react';

export default function AdminModeratorsPage() {
  const [moderators, setModerators] = useState<Moderator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const loadModerators = async () => {
    if (!isFirebaseConfigured()) {
      setLoading(false);
      setError('قاعدة بيانات Firebase غير مفعلة. فعّلها من إعدادات المدرس أولاً.');
      return;
    }
    setLoading(true);
    const list = await getModeratorsFromFirestore();
    setModerators(list);
    setLoading(false);
  };

  useEffect(() => {
    loadModerators();
  }, []);

  const flash = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 4000);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim() || !username.trim() || !password.trim()) {
      setError('أكمل الاسم واسم المستخدم وكلمة المرور.');
      return;
    }
    if (password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف/أرقام على الأقل.');
      return;
    }
    const cleanUser = username.trim().toLowerCase();
    if (moderators.some((m) => m.username.trim().toLowerCase() === cleanUser)) {
      setError('اسم المستخدم هذا مستخدم بالفعل — اختر اسماً آخر.');
      return;
    }

    setSaving(true);
    const hash = await hashModeratorPassword(cleanUser, password);
    const mod: Moderator = {
      id: newModeratorId(),
      name: name.trim(),
      username: cleanUser,
      passwordHash: hash,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    const ok = await saveModeratorToFirestore(mod);
    setSaving(false);
    if (ok) {
      setName('');
      setUsername('');
      setPassword('');
      setFormOpen(false);
      flash(`تمت إضافة المشرف «${mod.name}» بنجاح وإتاحته للدخول ببياناته.`);
      loadModerators();
    } else {
      setError('فشل حفظ المشرف في السحابة. تأكد من اتصال Firebase ثم أعد المحاولة.');
    }
  };

  const handleToggleActive = async (mod: Moderator) => {
    const updated: Moderator = { ...mod, isActive: !mod.isActive };
    await saveModeratorToFirestore(updated);
    flash(updated.isActive ? `تم تفعيل حساب «${mod.name}».` : `تم تعطيل حساب «${mod.name}». لا يستطيع الدخول الآن.`);
    loadModerators();
  };

  const handleDelete = async (mod: Moderator) => {
    if (!confirm(`حذف حساب المشرف «${mod.name}» نهائياً؟ لا يمكن التراجع.`)) return;
    await deleteModeratorFromFirestore(mod.id);
    flash(`تم حذف حساب «${mod.name}».`);
    loadModerators();
  };

  const handleResetPassword = async (mod: Moderator) => {
    const newPass = window.prompt(`امسح كلمة المرور الجديدة للمشرف «${mod.name}» (6 أحرف على الأقل):`);
    if (!newPass) return;
    if (newPass.length < 6) {
      setError('كلمة المرور الجديدة يجب أن تكون 6 أحرف/أرقام على الأقل.');
      return;
    }
    const hash = await hashModeratorPassword(mod.username, newPass);
    const updated: Moderator = { ...mod, passwordHash: hash };
    await saveModeratorToFirestore(updated);
    flash(`تم تغيير كلمة مرور «${mod.name}» بنجاح.`);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
              <Users2 className="w-6 h-6 text-emerald-800" />
            </div>
            <div>
              <h1 className="text-lg font-black text-gray-900">إدارة المشرفين المساعدين</h1>
              <p className="text-xs text-gray-500 mt-0.5">
                أضف مشرفين يتابعون المنتدى ويصححون المقالي ويراقبون الطلاب — بمهام محدودة بعيداً عن الأكواد والفلوس.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadModerators}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-gray-600 text-xs font-bold hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" /> تحديث
            </button>
            <button
              onClick={() => { setFormOpen(!formOpen); setError(''); }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-bold shadow-sm transition-all hover:-translate-y-0.5"
              style={{ background: '#1B4332' }}
            >
              <PlusCircle className="w-4 h-4" />
              {formOpen ? 'إغلاق' : 'إضافة مشرف جديد'}
            </button>
          </div>
        </div>
      </div>

      {notice && (
        <div className="p-3.5 bg-green-50 border border-green-300 rounded-xl text-xs text-green-800 font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-green-600" /> {notice}
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" /> {error}
        </div>
      )}

      {/* Add form */}
      {formOpen && (
        <form onSubmit={handleAdd} className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-black text-gray-800 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-700" /> بيانات المشرف الجديد
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">الاسم الظاهر للطلاب</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: كريم عبد السلام"
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">اسم المستخدم (للدخول)</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="مثال: kareem"
                dir="ltr"
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs text-left font-mono focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">كلمة المرور</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="6 أحرف على الأقل"
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-white text-xs font-bold disabled:opacity-60 transition-all hover:-translate-y-0.5 shadow-sm"
              style={{ background: '#1B4332' }}
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
              {saving ? 'جاري الحفظ…' : 'حفظ وإنشاء الحساب'}
            </button>
            <p className="text-[11px] text-gray-400">
              المشرف يدخل من صفحة تسجيل الدخول عبر بوابة المشرفين.
            </p>
          </div>
        </form>
      )}

      {/* List */}
      {loading ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-3" />
          <p className="text-xs text-gray-500">جاري تحميل المشرفين…</p>
        </div>
      ) : moderators.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
          <Users2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-700">لا يوجد مشرفون بعد</h3>
          <p className="text-xs text-gray-400 mt-1">أضف أول مشرف من الزر أعلاه لتفويضه بعض مهامك.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {moderators.map((mod) => (
            <div key={mod.id} className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-white text-sm shrink-0 ${mod.isActive ? 'bg-emerald-800' : 'bg-gray-400'}`}>
                    {mod.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-black text-gray-900 text-sm">{mod.name}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${mod.isActive ? 'bg-emerald-50 text-emerald-800 border border-emerald-300' : 'bg-gray-100 text-gray-500 border border-gray-300'}`}>
                        {mod.isActive ? 'نشط' : 'معطّل'}
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-2 flex-wrap">
                      <span className="font-mono" dir="ltr">@{mod.username}</span>
                      <span>·</span>
                      <span>أُنشئ: {new Date(mod.createdAt).toLocaleDateString('ar-EG')}</span>
                      {mod.lastLoginAt && (
                        <>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <LogIn className="w-3 h-3" /> آخر دخول: {new Date(mod.lastLoginAt).toLocaleString('ar-EG')}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  <button
                    onClick={() => handleResetPassword(mod)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-600 text-xs font-bold hover:bg-gray-100 transition-colors"
                    title="إعادة تعيين كلمة المرور"
                  >
                    <KeyRound className="w-3.5 h-3.5" /> تغيير كلمة المرور
                  </button>
                  <button
                    onClick={() => handleToggleActive(mod)}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                      mod.isActive
                        ? 'bg-amber-50 border border-amber-300 text-amber-800 hover:bg-amber-100'
                        : 'bg-emerald-50 border border-emerald-300 text-emerald-800 hover:bg-emerald-100'
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                    {mod.isActive ? 'تعطيل' : 'تفعيل'}
                  </button>
                  <button
                    onClick={() => handleDelete(mod)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 text-xs font-bold transition-colors"
                    title="حذف نهائي"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> حذف
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}