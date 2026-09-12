"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  getStudents, 
  getLessons, 
  getExams, 
  getAccessCodes, 
  getDaysRemaining, 
  isSubscriptionExpiringSoon, 
  getPendingEssaySubmissions,
  syncFromFirestore,
  executeMigrationToFirestore,
  GRADE_LABELS
} from '@/lib/storage';
import { isFirebaseConfigured } from '@/lib/firebase';
import { Student } from '@/lib/types';
import { 
  Users, 
  Video, 
  HelpCircle, 
  KeyRound, 
  AlertTriangle, 
  CheckCircle2, 
  MessageCircle, 
  PlusCircle, 
  Sparkles, 
  ArrowRight,
  ShieldCheck,
  FileCheck,
  Cloud,
  CloudUpload,
  RefreshCw
} from 'lucide-react';

export default function AdminOverviewPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [lessonCount, setLessonCount] = useState(0);
  const [examCount, setExamCount] = useState(0);
  const [codeCount, setCodeCount] = useState(0);
  const [pendingEssaysCount, setPendingEssaysCount] = useState(0);
  const [isCloudConfigured, setIsCloudConfigured] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationNotice, setMigrationNotice] = useState<string | null>(null);

  const refreshData = () => {
    const stds = getStudents();
    setStudents(stds);
    setLessonCount(getLessons().length);
    setExamCount(getExams().length);
    setCodeCount(getAccessCodes().length);
    setPendingEssaysCount(getPendingEssaySubmissions().length);
  };

  useEffect(() => {
    refreshData();
    const cloudReady = isFirebaseConfigured();
    setIsCloudConfigured(cloudReady);

    if (cloudReady) {
      syncFromFirestore().then(() => {
        refreshData();
      });
    }
  }, []);

  const handleMigration = async () => {
    if (!isCloudConfigured) {
      alert('يرجى أولاً إدخال بيانات الربط بـ Firebase في ملف .env.local حتى يتمكن النظام من الاتصال بقاعدة بيانات السحابة.');
      return;
    }

    if (confirm('هل تريد ترحيل ونقل كافة البيانات الحالية (الطلاب، المحاضرات، الامتحانات، الأكواد) إلى قاعدة بيانات Firestore السحابية؟')) {
      setIsMigrating(true);
      setMigrationNotice('جاري رفع البيانات إلى السحابة...');
      const res = await executeMigrationToFirestore();
      setIsMigrating(false);
      if (res.success) {
        setMigrationNotice(`تم بنجاح ترحيل ${res.counts.students} طالب، و ${res.counts.lessons} محاضرة، و ${res.counts.exams} امتحان إلى السحابة!`);
        refreshData();
      } else {
        setMigrationNotice(`حدث خطأ أثناء الترحيل: ${res.error || 'تأكد من صلاحيات Firestore'}`);
      }
    }
  };

  const activeStudents = students.filter(s => s.subscription.isActive);
  const expiringStudents = students.filter(s => isSubscriptionExpiringSoon(s.subscription.expiresAt));

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md border border-emerald-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-800/80 text-gold-400 text-xs font-bold border border-emerald-700">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>لوحة الإدارة الرسمية • مستر محمد عادل</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              أهلاً بحضرتك يا مستر محمد
            </h1>
            <p className="text-xs sm:text-sm text-emerald-200">
              جميع الإحصائيات والأرقام المعروضة حقيقية 100% ومربوطة مباشرة بالطلاب والمحتوى.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/lessons"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>إضافة درس جديد</span>
            </Link>
            <Link
              href="/admin/codes"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-gold-500 hover:bg-gold-400 text-slate-950 text-xs font-black rounded-xl transition-all shadow-sm"
            >
              <KeyRound className="w-4 h-4" />
              <span>توليد كود تفعيل</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Cloud Database (Firebase) Status & Migration Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${isCloudConfigured ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-slate-900 text-sm sm:text-base">
                  قاعدة البيانات السحابية المركزية (Firebase Firestore)
                </h3>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${isCloudConfigured ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-amber-50 text-amber-800 border-amber-300'}`}>
                  {isCloudConfigured ? '🟢 متصل بالسحابة' : '🟡 وضع محلي (localStorage)'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {isCloudConfigured 
                  ? 'المنصة متزامنة سحابياً: أي طالب يسجل حسابه من أي موبايل أو كمبيوتر سيظهر لك في لوحة الأدمن فوراً.' 
                  : 'أدخل مفاتيح Firebase في ملف .env.local لتفعيل التزامن السحابي الحقيقي بين مختلف الأجهزة.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
            <button
              onClick={() => {
                syncFromFirestore().then(() => {
                  refreshData();
                  alert('تمت مزامنة البيانات من السحابة بنجاح!');
                });
              }}
              disabled={!isCloudConfigured}
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all disabled:opacity-40"
              title="سحب أحدث البيانات المسجلة من الطلاب فوراً"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
              <span>مزامنة سريعة</span>
            </button>

            <button
              onClick={handleMigration}
              disabled={!isCloudConfigured || isMigrating}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-all shadow-sm disabled:opacity-40"
              title="رفع كافة بيانات الطلاب والدروس الحالية من جهازك إلى السحابة"
            >
              <CloudUpload className={`w-4 h-4 ${isMigrating ? 'animate-bounce' : ''}`} />
              <span>{isMigrating ? 'جاري الرفع...' : 'رفع بيانات المتصفح للسحابة (One-Click)'}</span>
            </button>
          </div>
        </div>

        {migrationNotice && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-bold flex items-center justify-between">
            <span>{migrationNotice}</span>
            <button onClick={() => setMigrationNotice(null)} className="text-emerald-700 hover:text-emerald-950 font-black mr-2">✕</button>
          </div>
        )}
      </div>

      {/* Pending Essay Submissions Alert Banner */}
      {pendingEssaysCount > 0 && (
        <div className="bg-amber-500 text-slate-950 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md border border-amber-600">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-950 text-gold-400 flex items-center justify-center font-bold shrink-0">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-black text-sm">يوجد {pendingEssaysCount} تسليم مقالي بانتظار تصحيحك ورصد الدرجة!</p>
              <p className="text-xs text-slate-900 mt-0.5">
                قام طلاب بحل امتحانات تتضمن أسئلة مقالية، إجاباتهم جاهزة في صفحة التسليمات لاعتماد درجاتهم.
              </p>
            </div>
          </div>
          <Link
            href="/admin/submissions"
            className="px-5 py-2.5 bg-slate-950 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors shrink-0 text-center"
          >
            الانتقال لصفحة التسليمات الآن
          </Link>
        </div>
      )}

      {/* Real Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 block font-bold">إجمالي الطلاب</span>
            <span className="text-2xl font-black text-slate-900 font-mono">{students.length}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6 text-emerald-700" />
          </div>
          <div>
            <span className="text-xs text-slate-500 block font-bold">الاشتراكات النشطة</span>
            <span className="text-2xl font-black text-emerald-700 font-mono">{activeStudents.length}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-800 flex items-center justify-center font-bold">
            <Video className="w-6 h-6 text-emerald-800" />
          </div>
          <div>
            <span className="text-xs text-slate-500 block font-bold">الدروس المرفوعة</span>
            <span className="text-2xl font-black text-slate-900 font-mono">{lessonCount}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 block font-bold">الامتحانات والواجبات</span>
            <span className="text-2xl font-black text-slate-900 font-mono">{examCount}</span>
          </div>
        </div>
      </div>

      {/* Expiry Alert Section (طلاب اشتراكهم قرب ينتهي خلال 2-3 أيام) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-black text-slate-900">
              تنبيهات انتهاء الاشتراك (خلال 2-3 أيام)
            </h2>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-900">
            {expiringStudents.length} طالب
          </span>
        </div>

        {expiringStudents.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-500">
            لا يوجد طلاب تنتهي اشتراكاتهم خلال الثلاثة أيام القادمة حالياً.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {expiringStudents.map((std) => {
              const daysLeft = getDaysRemaining(std.subscription.expiresAt);
              const whatsappReminderMsg = `مرحباً يا ${std.name}، نود تذكيرك بأن اشتراكك في مادة التكنولوجيا مع مستر محمد عادل سينتهي خلال ${daysLeft} أيام. يرجى المبادرة بالتجديد لضمان استمرار وصولك للدروس.`;

              return (
                <div key={std.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <Link
                      href={`/admin/students/${std.id}`}
                      className="font-bold text-slate-900 hover:text-emerald-800 text-sm"
                    >
                      {std.name}
                    </Link>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {GRADE_LABELS[std.grade]} • هاتف: <span className="font-mono">{std.phone}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                      متبقي {daysLeft} أيام
                    </span>
                    <a
                      href={`https://wa.me/${std.phone.replace(/^0/, '20')}?text=${encodeURIComponent(whatsappReminderMsg)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-xl transition-all shadow-sm"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>تذكير واتساب</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Access to Student Records */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">سجل الطلاب الكامل وتفعيل الاشتراكات اليدوي</h3>
          <p className="text-xs text-slate-500 mt-1">
            ادخل على صفحة سجل الطالب لتفعيل شهر كامل بضغطة زر أو إتاحة وصول جزئي لكورس معين بعد استلام فودافون كاش.
          </p>
        </div>
        <Link
          href="/admin/students"
          className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-2 shrink-0 transition-colors"
        >
          <Users className="w-4 h-4" />
          <span>فتح سجل الطلاب</span>
        </Link>
      </div>
    </div>
  );
}
