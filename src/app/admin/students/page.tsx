"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getStudents, deleteStudent, GRADE_LABELS, getDaysRemaining, syncFromFirestore } from '@/lib/storage';
import { isFirebaseConfigured } from '@/lib/firebase';
import { Student, GradeLevel } from '@/lib/types';
import { 
  Users, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  ChevronLeft, 
  Phone, 
  ArrowRight,
  ShieldAlert,
  Trash2,
  RefreshCw
} from 'lucide-react';

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [notice, setNotice] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const loadStudents = () => {
    setStudents(getStudents());
  };

  useEffect(() => {
    loadStudents();
    if (isFirebaseConfigured()) {
      setIsSyncing(true);
      syncFromFirestore().then(() => {
        loadStudents();
        setIsSyncing(false);
      });
    }
  }, []);

  const handleSyncNow = async () => {
    setIsSyncing(true);
    await syncFromFirestore();
    loadStudents();
    setIsSyncing(false);
  };

  const handleDelete = (id: string, studentName: string) => {
    if (confirm(`تحذير: هل أنت متأكد من حذف الطالب "${studentName}" نهائياً من المنصة وقاعدة البيانات؟ سيتم مسح حسابه وسجلاته بالكامل.`)) {
      deleteStudent(id);
      loadStudents();
      setNotice(`تم حذف الطالب (${studentName}) نهائياً من المنصة.`);
      setTimeout(() => setNotice(null), 3500);
    }
  };

  const filtered = students.filter(s => {
    const matchesSearch = 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.phone.includes(searchQuery) ||
      s.parentPhone.includes(searchQuery);

    const matchesGrade = gradeFilter === 'all' || s.grade === gradeFilter;
    const matchesStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'active' && s.subscription.isActive) ||
      (statusFilter === 'inactive' && !s.subscription.isActive);

    return matchesSearch && matchesGrade && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">سجل الطلاب والاشتراكات (Owner Profile)</h1>
          <p className="text-xs text-slate-500 mt-1">
            اضغط على أي طالب لعرض سجله وتفعيل اشتراكه الشهري أو منحه وصولاً جزئياً لكورسات محددة.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleSyncNow}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl shadow-sm transition-all disabled:opacity-50"
            title="مزامنة بيانات الطلاب مع السحابة فوراً"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'جاري المزامنة...' : 'تحديث من السحابة'}</span>
          </button>
          <div className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3.5 py-2 rounded-xl">
            إجمالي الطلاب المسجلين: <span className="font-black text-base">{students.length}</span>
          </div>
        </div>
      </div>

      {notice && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm">
          <Trash2 className="w-4 h-4 text-red-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search input */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="بحث بالاسم أو رقم الهاتف..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-xs"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
        </div>

        {/* Grade & Status Selectors */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium bg-white focus:outline-none"
          >
            <option value="all">جميع الصفوف</option>
            <option value="first_secondary_general">الصف الأول الثانوي (عام)</option>
            <option value="first_secondary_bac">الصف الأول الثانوي (بكالوريا)</option>
            <option value="second_secondary_general">الصف الثاني الثانوي (عام)</option>
            <option value="second_secondary_bac">الصف الثاني الثانوي (بكالوريا)</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium bg-white focus:outline-none"
          >
            <option value="all">كافة الحالات</option>
            <option value="active">مفعّل حالياً</option>
            <option value="inactive">غير مفعّل</option>
          </select>
        </div>
      </div>

      {/* Students List Table / Cards */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-500 space-y-3">
            <Users className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="font-bold text-slate-800">لا يوجد طلاب مطابقين للبحث</p>
            <p className="text-xs">ستظهر بيانات الطلاب هنا فور قيام الطلاب بالتسجيل على المنصة.</p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-1 px-1">
            <table className="w-full text-right text-xs min-w-[720px]">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-4">اسم الطالب</th>
                  <th className="p-4">الصف الدراسي</th>
                  <th className="p-4">رقم الطالب</th>
                  <th className="p-4">رقم ولي الأمر</th>
                  <th className="p-4">حالة الاشتراك</th>
                  <th className="p-4">تاريخ الانتهاء</th>
                  <th className="p-4 text-center">الإجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((s) => {
                  const daysRemaining = getDaysRemaining(s.subscription.expiresAt);

                  return (
                    <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <Link
                          href={`/admin/students/${s.id}`}
                          className="font-bold text-slate-900 hover:text-emerald-800 text-sm block"
                        >
                          {s.name}
                        </Link>
                        <span className="text-[10px] text-slate-400">
                          مسجل: {new Date(s.createdAt).toLocaleDateString('ar-EG')}
                        </span>
                      </td>

                      <td className="p-4">
                        <span className="font-semibold text-slate-800 block">{GRADE_LABELS[s.grade]}</span>
                      </td>

                      <td className="p-4 font-mono font-bold text-slate-800">
                        {s.phone}
                      </td>

                      <td className="p-4 font-mono text-slate-600">
                        {s.parentPhone}
                      </td>

                      <td className="p-4">
                        {s.subscription.isActive ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                            <CheckCircle2 className="w-3.5 h-3.5" /> مفعّل
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                            <Clock className="w-3.5 h-3.5" /> غير مفعّل
                          </span>
                        )}
                      </td>

                      <td className="p-4">
                        {s.subscription.isActive ? (
                          <div>
                            <span className="font-mono text-slate-800 font-bold block">
                              {new Date(s.subscription.expiresAt!).toLocaleDateString('ar-EG')}
                            </span>
                            <span className="text-[10px] text-emerald-700">متبقي {daysRemaining} يوم</span>
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <Link
                            href={`/admin/students/${s.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                          >
                            <span>سجل الطالب</span>
                            <ChevronLeft className="w-3.5 h-3.5" />
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleDelete(s.id, s.name)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                            title="حذف الطالب نهائياً من المنصة"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
