"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  getCurrentModerator,
  getStudents,
  getPendingEssaySubmissions,
  getAssignmentSubmissions,
} from '@/lib/storage';
import { getSubmissionsFromFirestore, getAssignmentSubmissionsFromFirestore } from '@/lib/firestoreService';
import { isFirebaseConfigured } from '@/lib/firebase';
import { subscribePendingPostsCount } from '@/lib/forumService';
import {
  Users,
  FileCheck,
  MessagesSquare,
  ShieldCheck,
  Sparkles,
  ClipboardList,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';

export default function ModeratorOverviewPage() {
  const [studentTotal, setStudentTotal] = useState(0);
  const [pendingEssays, setPendingEssays] = useState(0);
  const [pendingAssignments, setPendingAssignments] = useState(0);
  const [pendingPosts, setPendingPosts] = useState(0);

  useEffect(() => {
    const mod = getCurrentModerator();
    if (!mod) return;

    setStudentTotal(getStudents().length);
    setPendingEssays(getPendingEssaySubmissions().length);
    setPendingAssignments(getAssignmentSubmissions().filter((s) => s.status === 'submitted').length);

    let unsub = () => {};
    if (isFirebaseConfigured()) {
      unsub = subscribePendingPostsCount((n) => setPendingPosts(n), () => {});
      getSubmissionsFromFirestore().then((list) => {
        const pending = list.filter((s) => s.hasPendingEssays).length;
        setPendingEssays((prev) => Math.max(prev, pending));
      }).catch(() => {});
      getAssignmentSubmissionsFromFirestore().then((list) => {
        setPendingAssignments((prev) => Math.max(prev, list.filter((s) => s.status === 'submitted').length));
      }).catch(() => {});
    }
    return () => unsub();
  }, []);

  const mod = useMemo(() => getCurrentModerator(), []);
  if (typeof window !== 'undefined' && !mod) {
    return null;
  }

  const stats = [
    { label: 'طلاب المنصة', value: studentTotal, icon: Users, color: 'bg-emerald-50 text-emerald-800' },
    { label: 'أسئلة بانتظار الموافقة', value: pendingPosts, icon: MessagesSquare, color: 'bg-amber-50 text-amber-700' },
    { label: 'تسليمات مقالية للتصحيح', value: pendingEssays, icon: FileCheck, color: 'bg-amber-50 text-amber-800' },
    { label: 'واجبات بانتظار التصحيح', value: pendingAssignments, icon: ClipboardList, color: 'bg-slate-100 text-slate-800' },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-teal-950 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md border border-teal-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-800/80 text-teal-100 text-xs font-bold border border-teal-700">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>لوحة المشرفين المساعدين</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              أهلاً {mod?.name}
            </h1>
            <p className="text-xs sm:text-sm text-teal-200">
              مهمتك: مساعدة المدرس في مراجعة المنتدى وتصحيح المقالي ومتابعة الطلاب — بعيداً عن الأكواد والاشتراكات.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/moderator/forum"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-white text-xs font-black rounded-xl transition-colors hover:brightness-110 shadow-lg shadow-teal-950/30 cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #0D9488, #14B8A6)' }}
            >
              <MessagesSquare className="w-4 h-4" />
              <span>مراجعة المنتدى</span>
            </Link>
            <Link
              href="/moderator/submissions"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-teal-950 text-xs font-black rounded-xl transition-colors hover:brightness-110 border border-teal-300/70 shadow-lg shadow-teal-900/30 cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #99F6E4, #5EEAD4)' }}
            >
              <FileCheck className="w-4 h-4" />
              <span>تصحيح المقالي</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${s.color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-500 block font-bold">{s.label}</span>
                <span className="text-2xl font-black text-slate-900 font-mono">{s.value}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tasks explainer */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
          <Sparkles className="w-5 h-5 text-teal-600" />
          <h2 className="text-lg font-black text-slate-900">مهمتك في المنصة</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              icon: MessagesSquare,
              title: 'منتدى الأسئلة',
              desc: 'وافق على أسئلة الطلاب أو ارفضها بسبب واضح، وثبّت المهم، وردّ بنفسك — ردّك يظهر للطلاب باسمك مع شارة "مشرف المنصة".',
              href: '/moderator/forum',
            },
            {
              icon: FileCheck,
              title: 'تصحيح المقالي والواجبات',
              desc: 'رصد درجات امتحانات الواجبات المقالية وتعليقك للطالب. كل تصحيح منك يُسجّل في سجل النشاط باسمك.',
              href: '/moderator/submissions',
            },
            {
              icon: Users,
              title: 'متابعة الطلاب',
              desc: 'عرض قائمة الطلاب والاشتراكات للقراءة فقط — لا تعديل على الاشتراكات ولا إتاحة أكواد، ذلك للمدرس وحده.',
              href: '/moderator/students',
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.title}
                href={item.href}
                className="group p-5 rounded-2xl border border-slate-200 hover:border-teal-500 hover:shadow-md transition-all block"
              >
                <div className="w-11 h-11 rounded-2xl bg-teal-50 text-teal-800 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-black text-sm text-slate-900 mb-1">{item.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                <span className="inline-flex items-center gap-1 mt-3 text-[11px] font-black text-teal-700 group-hover:text-teal-600">
                  افتح القسم <ArrowLeft className="w-3 h-3" />
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {pendingEssays > 0 && (
        <div className="bg-amber-500 text-slate-950 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md border border-amber-600">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-950 text-amber-400 flex items-center justify-center shrink-0">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-black text-sm">يوجد {pendingEssays} تسليم مقالي بانتظار تصحيحك!</p>
              <p className="text-xs text-slate-900 mt-0.5">الطلاب في انتظار رصد درجاتهم — افتح قسم التصحيح لاستعراضها.</p>
            </div>
          </div>
          <Link
            href="/moderator/submissions"
            className="px-5 py-2.5 bg-slate-950 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors shrink-0 text-center"
          >
            الانتقال للتصحيح الآن
          </Link>
        </div>
      )}

      {pendingPosts === 0 && pendingEssays === 0 && pendingAssignments === 0 && (
        <div className="bg-white rounded-2xl border border-emerald-200 p-6 flex items-center gap-3 text-xs text-emerald-900">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          كل المهام الحالية مُنجزة — لا أسئلة معلقة ولا تسليمات محتاجة تصحيح. عد لاحقاً أو ردّ في المنتدى على أسئلة الزملاء.
        </div>
      )}
    </div>
  );
}