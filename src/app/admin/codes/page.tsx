"use client";

import React, { useState, useEffect } from 'react';
import { getAccessCodes, generateAccessCode, GRADE_LABELS } from '@/lib/storage';
import { AccessCode, GradeLevel } from '@/lib/types';
import { 
  KeyRound, 
  PlusCircle, 
  Copy, 
  Check, 
  CheckCircle2, 
  Clock, 
  MessageCircle, 
  Sparkles,
  Search
} from 'lucide-react';

export default function AdminCodesPage() {
  const [codes, setCodes] = useState<AccessCode[]>([]);
  const [grade, setGrade] = useState<GradeLevel>('first_secondary_general');
  const [month, setMonth] = useState('شهر أكتوبر');
  const [durationDays, setDurationDays] = useState(30);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'unused' | 'used'>('all');
  const [search, setSearch] = useState('');
  const [recentGenerated, setRecentGenerated] = useState<AccessCode | null>(null);

  useEffect(() => {
    loadCodes();
  }, []);

  const loadCodes = () => {
    setCodes(getAccessCodes());
  };

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    const newCode = generateAccessCode({
      grade,
      month: month.trim(),
      durationDays: Number(durationDays),
    });

    setRecentGenerated(newCode);
    loadCodes();
  };

  const handleCopyCode = (codeStr: string, monthName: string) => {
    const textToCopy = `أهلاً بك يا بطل، تم استلام تحويل الاشتراك بنجاح. كود التفعيل الخاص بك لمنصة مستر محمد عادل لمادة التكنولوجيا هو:
${codeStr}
ادخل على صفحة "اشتراكي" وضع الكود لتفعيل شهر (${monthName}) فوراً. بالتوفيق دائماً!`;

    navigator.clipboard.writeText(textToCopy);
    setCopiedCode(codeStr);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const filtered = codes.filter(c => {
    const matchSearch = c.code.toLowerCase().includes(search.toLowerCase()) || 
      (c.usedByStudentName && c.usedByStudentName.toLowerCase().includes(search.toLowerCase()));

    const matchStatus = 
      filterStatus === 'all' || 
      (filterStatus === 'unused' && !c.isUsed) || 
      (filterStatus === 'used' && c.isUsed);

    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900">توليد وإدارة أكواد التفعيل (Access Codes)</h1>
        <p className="text-xs text-slate-500 mt-1">
          قم بتوليد كود عشوائي مؤمن لكل طالب بعد استلام قيمة الاشتراك عبر فودافون كاش أو إنستاباي، وانسخ الرسالة بضغطة زر لإرسالها له على واتساب.
        </p>
      </div>

      {/* Code Generator Form */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gold-500/10 text-gold-600 flex items-center justify-center font-bold">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900">توليد كود جديد فوري</h2>
            <p className="text-xs text-slate-500">اختر الصف والشهر ومدة الصلاحية</p>
          </div>
        </div>

        <form onSubmit={handleGenerate} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">الصف الدراسي</label>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value as GradeLevel)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700"
            >
              <option value="first_secondary_general">الصف الأول الثانوي (عام)</option>
              <option value="first_secondary_bac">الصف الأول الثانوي (بكالوريا)</option>
              <option value="second_secondary_general">الصف الثاني الثانوي (عام)</option>
              <option value="second_secondary_bac">الصف الثاني الثانوي (بكالوريا)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">اسم الشهر أو الكورس</label>
            <input
              type="text"
              required
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              placeholder="مثال: شهر أكتوبر"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-700"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">مدة الصلاحية</label>
            <select
              value={durationDays}
              onChange={(e) => setDurationDays(Number(e.target.value))}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold bg-white focus:outline-none"
            >
              <option value={30}>30 يوماً (شهر كامل)</option>
              <option value={60}>60 يوماً</option>
              <option value={90}>90 يوماً (ترم كامل)</option>
              <option value={15}>15 يوماً</option>
            </select>
          </div>

          <div>
            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-emerald-800 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-gold-400" />
              <span>توليد الكود الآن</span>
            </button>
          </div>
        </form>

        {/* Highlight Recently Generated Code */}
        {recentGenerated && (
          <div className="mt-6 p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold text-emerald-800 block">تم توليد الكود بنجاح:</span>
              <span className="font-mono text-xl font-black text-slate-900 tracking-widest">{recentGenerated.code}</span>
              <span className="text-xs text-slate-600 block mt-0.5">
                {GRADE_LABELS[recentGenerated.grade]} • {recentGenerated.month} ({recentGenerated.durationDays} يوم)
              </span>
            </div>

            <button
              type="button"
              onClick={() => handleCopyCode(recentGenerated.code, recentGenerated.month)}
              className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-sm transition-all shrink-0"
            >
              {copiedCode === recentGenerated.code ? (
                <>
                  <Check className="w-4 h-4 text-gold-400" />
                  <span>تم نسخ الرسالة لواتساب!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>نسخ الكود ورسالة واتساب</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Codes Table & Filter */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden space-y-4 p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="بحث في الأكواد أو أسماء الطلاب..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-4 pr-9 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-700"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5" />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                filterStatus === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              الكل ({codes.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('unused')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                filterStatus === 'unused' ? 'bg-emerald-800 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              أكواد جديدة متبقية ({codes.filter(c => !c.isUsed).length})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('used')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                filterStatus === 'used' ? 'bg-slate-600 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              مستخدمة ({codes.filter(c => c.isUsed).length})
            </button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            لا توجد أكواد مسجلة مطابقة للبحث.
          </div>
        ) : (
          <div className="overflow-x-auto -mx-1 px-1">
            <table className="w-full text-right text-xs min-w-[680px]">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">الكود</th>
                  <th className="p-3.5">الصف والمحتوى</th>
                  <th className="p-3.5">المدة</th>
                  <th className="p-3.5">الحالة</th>
                  <th className="p-3.5">المستخدم</th>
                  <th className="p-3.5 text-center">نسخ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((c) => (
                  <tr key={c.code} className="hover:bg-slate-50">
                    <td className="p-3.5 font-mono font-bold text-slate-900 text-sm">
                      {c.code}
                    </td>

                    <td className="p-3.5">
                      <span className="font-bold text-slate-800 block">{GRADE_LABELS[c.grade]}</span>
                      <span className="text-[10px] text-slate-500">{c.month}</span>
                    </td>

                    <td className="p-3.5 font-mono">
                      {c.durationDays} يوم
                    </td>

                    <td className="p-3.5">
                      {c.isUsed ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                          تم استخدامه
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          جاهز للإرسال
                        </span>
                      )}
                    </td>

                    <td className="p-3.5">
                      {c.usedByStudentName ? (
                        <div>
                          <span className="font-bold text-slate-800 block">{c.usedByStudentName}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(c.usedAt!).toLocaleDateString('ar-EG')}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    <td className="p-3.5 text-center">
                      <button
                        type="button"
                        onClick={() => handleCopyCode(c.code, c.month)}
                        className="p-1.5 bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800 rounded-lg transition-colors"
                        title="نسخ رسالة الكود"
                      >
                        {copiedCode === c.code ? <Check className="w-4 h-4 text-emerald-700" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
