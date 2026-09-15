"use client";

import React, { useState, useEffect } from 'react';
import {
  getAssignments,
  getAssignmentSubmissions,
  saveAssignment,
  deleteAssignment,
  gradeAssignmentSubmission,
  GRADE_LABELS,
} from '@/lib/storage';
import { getAssignmentsFromFirestore, getAssignmentSubmissionsFromFirestore } from '@/lib/firestoreService';
import { isFirebaseConfigured } from '@/lib/firebase';
import { Assignment, AssignmentSubmission, GradeLevel } from '@/lib/types';
import {
  ClipboardList,
  Plus,
  Trash2,
  CalendarDays,
  User,
  Phone,
  CheckCircle2,
  Clock,
  Save,
  MessageSquare,
  ChevronLeft,
  BookOpen,
  Loader2,
  FileText,
} from 'lucide-react';

const GRADES_LIST: GradeLevel[] = [
  'first_secondary_general',
  'first_secondary_bac',
  'first_secondary_azhari',
  'second_secondary_general',
  'second_secondary_bac',
  'second_secondary_azhari',
];

export default function AdminAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel>('second_secondary_bac');
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [month, setMonth] = useState('');
  const [maxScore, setMaxScore] = useState(10);
  const [dueDate, setDueDate] = useState('');

  // Grading inputs
  const [scoreInputs, setScoreInputs] = useState<Record<string, number>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    loadData();
    window.addEventListener('platform-data-changed', loadData);
    return () => window.removeEventListener('platform-data-changed', loadData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    let allAssignments = getAssignments();
    let allSubs = getAssignmentSubmissions();

    if (isFirebaseConfigured()) {
      try {
        const [remoteAssignments, remoteSubs] = await Promise.all([
          getAssignmentsFromFirestore(),
          getAssignmentSubmissionsFromFirestore(),
        ]);
        const mergeById = <T extends { id: string }>(arr: T[], remote: T[]) => {
          const map = new Map<string, T>();
          arr.forEach(a => map.set(a.id, a));
          remote.forEach(r => map.set(r.id, r));
          return Array.from(map.values());
        };
        allAssignments = mergeById(allAssignments, remoteAssignments);
        allSubs = mergeById(allSubs, remoteSubs);
      } catch (err) {
        console.error('Error merging assignment data from Firestore:', err);
      }
    }

    setAssignments(allAssignments);
    setSubmissions(allSubs);

    const initialScores: Record<string, number> = {};
    const initialComments: Record<string, string> = {};
    allSubs.forEach(s => {
      if (typeof s.score === 'number') initialScores[s.id] = s.score;
      if (s.teacherComment) initialComments[s.id] = s.teacherComment;
    });
    setScoreInputs(initialScores);
    setCommentInputs(initialComments);
    setLoading(false);
  };

  const gradeAssignments = assignments.filter(a => a.grade === selectedGrade);
  const selectedAssignment = selectedAssignmentId
    ? assignments.find(a => a.id === selectedAssignmentId) || null
    : null;
  const visibleSubs = selectedAssignmentId
    ? submissions.filter(s => s.assignmentId === selectedAssignmentId)
    : [];

  const pendingCountFor = (assignment: Assignment) =>
    submissions.filter(s => s.assignmentId === assignment.id && s.status === 'submitted').length;

  const handleCreate = () => {
    if (!title.trim() || !description.trim()) {
      alert('يرجى كتابة عنوان الواجب والمهمة.');
      return;
    }
    const assignment = saveAssignment({
      title: title.trim(),
      description: description.trim(),
      grade: selectedGrade,
      month: month.trim() || 'واجب',
      maxScore: Math.max(1, Number(maxScore) || 10),
      dueDate: dueDate || undefined,
    });
    setNotice(`تم نشر الواجب "${assignment.title}" لصف ${GRADE_LABELS[selectedGrade]}.`);
    setTimeout(() => setNotice(null), 3500);
    setShowForm(false);
    setTitle('');
    setDescription('');
    setMonth('');
    setMaxScore(10);
    setDueDate('');
    loadData();
  };

  const handleDelete = (assignment: Assignment) => {
    if (!window.confirm(`حذف الواجب "${assignment.title}"؟ سيتم حذفه من جميع الطلاب.`)) return;
    deleteAssignment(assignment.id);
    setNotice(`تم حذف الواجب "${assignment.title}".`);
    setTimeout(() => setNotice(null), 3500);
    if (selectedAssignmentId === assignment.id) setSelectedAssignmentId(null);
    loadData();
  };

  const handleGrade = (sub: AssignmentSubmission) => {
    const score = Number(scoreInputs[sub.id]);
    if (isNaN(score) || score < 0 || score > (selectedAssignment?.maxScore || 10)) {
      alert(`الدرجة يجب أن تكون بين 0 و ${selectedAssignment?.maxScore || 10}.`);
      return;
    }
    const comment = commentInputs[sub.id] || '';
    const updated = gradeAssignmentSubmission(sub.id, score, comment, sub);
    if (updated) {
      setNotice(`تم تصحيح واجب الطالب (${sub.studentName}) بنجاح.`);
      setTimeout(() => setNotice(null), 3500);
      loadData();
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-40"><Loader2 className="w-8 h-8 text-emerald-700 animate-spin" /></div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full mb-2">
            <ClipboardList className="w-3.5 h-3.5" />
            <span>واجبات مستقلة عن الامتحانات</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">الواجبات وإدارة الردود</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            انشر واجباً بمهمة واضحة، والطالب يرد بكتابته وصور كراسته، ثم راجع وصحح بدرجة وتعليق.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(v => !v)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all self-start"
        >
          <Plus className="w-4 h-4" />
          <span>{showForm ? 'إلغاء' : 'واجب جديد'}</span>
        </button>
      </div>

      {notice && (
        <div className="p-4 bg-emerald-100 border border-emerald-300 text-emerald-950 font-bold rounded-2xl flex items-center gap-2 text-xs shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Create form */}
      {showForm && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <Plus className="w-5 h-5 text-emerald-700" />
            الواجب بيتنشر في {GRADE_LABELS[selectedGrade]}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="عنوان الواجب (مثال: مشروع الترم - برمجة صفحة هبوط)"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-white"
            />
            <div className="grid grid-cols-3 gap-2">
              <input
                value={month}
                onChange={e => setMonth(e.target.value)}
                placeholder="الشهر"
                className="w-full px-3 py-3 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-white"
              />
              <input
                type="number"
                min={1}
                value={maxScore}
                onChange={e => setMaxScore(Number(e.target.value))}
                placeholder="الدرجة"
                className="w-full px-3 py-3 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-white"
              />
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full px-2 py-3 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-white"
              />
            </div>
          </div>

          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={4}
            placeholder="مهمة الواجب بالتفصيل... اكتب المطلوب من الطالب بوضوح."
            className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-white resize-y"
          />

          <button
            type="button"
            onClick={handleCreate}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            نشر الواجب الآن
          </button>
        </div>
      )}

      {/* DETAIL VIEW of one assignment submissions */}
      {selectedAssignment ? (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => setSelectedAssignmentId(null)}
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-emerald-800 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl transition-all self-start"
            >
              <ChevronLeft className="w-4 h-4 rotate-180" />
              <span>العودة لقائمة الواجبات</span>
            </button>
            <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
              <span className="font-black text-slate-900 text-sm">{selectedAssignment.title}</span>
              <span className="bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-200 font-bold">
                {GRADE_LABELS[selectedAssignment.grade]}
              </span>
              <span>الدرجة: {selectedAssignment.maxScore}</span>
            </div>
          </div>

          {visibleSubs.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-2">
              <BookOpen className="w-12 h-12 text-slate-400 mx-auto opacity-60" />
              <h3 className="text-base font-bold text-slate-800">لا توجد ردود على هذا الواجب بعد</h3>
              <p className="text-xs text-slate-500">سيظهر رد الطالب هنا فور تسليمه من حسابه.</p>
            </div>
          ) : (
            visibleSubs.map((sub) => (
              <div key={sub.id} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 space-y-5">
                {/* Student row */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-emerald-950 text-gold-400 flex items-center justify-center font-black text-lg border border-gold-400">
                      {sub.studentName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{sub.studentName}</h4>
                      <span className="text-xs font-mono text-slate-500 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-emerald-700" /> {sub.studentPhone}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-start md:self-auto">
                    {sub.status === 'graded' ? (
                      <span className="px-3 py-1 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> مصحح · {sub.score}/{sub.maxScore}
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-[10px] font-black bg-amber-50 text-amber-900 border border-amber-200 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-700" /> بانتظار التصحيح
                      </span>
                    )}
                    <span className="text-[11px] text-slate-400 font-mono">
                      {new Date(sub.submittedAt).toLocaleString('ar-EG')}
                    </span>
                  </div>
                </div>

                {/* Student answer */}
                <div className="bg-slate-50 border-2 border-emerald-700/25 rounded-xl p-4">
                  <span className="text-[11px] font-black text-emerald-800 flex items-center gap-1 mb-2">
                    <FileText className="w-3.5 h-3.5" /> رد الطالب:
                  </span>
                  <p className="text-sm text-slate-800 whitespace-pre-line leading-relaxed font-medium">
                    {sub.answerText || 'لم يكتب الطالب نصاً.'}
                  </p>
                </div>

                {/* Attachments */}
                {sub.attachments && sub.attachments.length > 0 && (
                  <div className="bg-white border border-slate-200 rounded-xl p-4">
                    <span className="text-[11px] font-black text-slate-500 block mb-2">
                      صور مرفقة من كراسة الطالب ({sub.attachments.length}):
                    </span>
                    <div className="flex flex-wrap gap-2.5">
                      {sub.attachments.map(att => (
                        <a key={att.url} href={att.url} target="_blank" rel="noopener noreferrer" title={att.name}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={att.url}
                            alt={att.name}
                            className="w-24 h-24 rounded-xl object-cover border border-slate-200 shadow-sm hover:ring-2 hover:ring-emerald-600 hover:scale-105 transition-all cursor-pointer"
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Grading */}
                <div className="pt-2 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-[auto_1fr_auto] gap-3 items-end">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      الدرجة (من {selectedAssignment.maxScore}):
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={selectedAssignment.maxScore}
                      value={scoreInputs[sub.id] ?? ''}
                      onChange={e => setScoreInputs(prev => ({ ...prev, [sub.id]: Number(e.target.value) }))}
                      placeholder="0"
                      className="w-24 px-3 py-2 border-2 border-slate-300 rounded-xl text-center text-sm font-black text-slate-900 focus:border-emerald-700 focus:outline-none bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1 flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-700" /> تعليق المدرس (يظهر للطالب):
                    </label>
                    <input
                      value={commentInputs[sub.id] || ''}
                      onChange={e => setCommentInputs(prev => ({ ...prev, [sub.id]: e.target.value }))}
                      placeholder="ملاحظة أو إشادة للطالب..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-white"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleGrade(sub)}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                  >
                    <Save className="w-4 h-4" />
                    {sub.status === 'graded' ? 'تعديل وحفظ التصحيح' : 'تصحيح وإرسال للطالب'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <>
          {/* Grade tabs */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-sm border border-slate-200">
            <div className="flex items-center gap-2 mb-3 px-1 text-xs font-bold text-slate-600">
              <BookOpen className="w-4 h-4 text-emerald-700" />
              <span>اختر الصف الدراسي لاستعراض واجباته:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {GRADES_LIST.map((grade) => {
                const isSelected = selectedGrade === grade;
                const count = assignments.filter(a => a.grade === grade).length;
                const pending = assignments
                  .filter(a => a.grade === grade)
                  .reduce((acc, a) => acc + pendingCountFor(a), 0);
                return (
                  <button
                    key={grade}
                    type="button"
                    onClick={() => setSelectedGrade(grade)}
                    className={`p-4 rounded-2xl text-right transition-all flex flex-col justify-between border-2 ${
                      isSelected
                        ? 'border-emerald-700 bg-emerald-950 text-white shadow-md'
                        : 'border-slate-200 hover:border-emerald-300 bg-slate-50/70 text-slate-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className={`text-xs font-bold ${isSelected ? 'text-emerald-200' : 'text-slate-900'}`}>
                        {GRADE_LABELS[grade]}
                      </span>
                      {pending > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-slate-950 animate-pulse">
                          {pending} رد
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-[11px] pt-2 border-t border-white/10 text-slate-400">
                      <span className={isSelected ? 'text-emerald-300 font-medium' : 'text-slate-500'}>
                        {count} واجب
                      </span>
                      <ClipboardList className="w-3.5 h-3.5" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Assignments list */}
          {gradeAssignments.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
              <ClipboardList className="w-12 h-12 text-slate-400 mx-auto opacity-60" />
              <h3 className="text-base font-bold text-slate-800">
                لا توجد واجبات في {GRADE_LABELS[selectedGrade]} بعد
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                اضغط زر "واجب جديد" وضع مهمة الواجب وسيرد عليه الطلاب من لوحتهم.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {gradeAssignments.map((assignment) => {
                const subCount = submissions.filter(s => s.assignmentId === assignment.id).length;
                const gradedCount = submissions.filter(s => s.assignmentId === assignment.id && s.status === 'graded').length;
                const pendingCount = subCount - gradedCount;

                return (
                  <div key={assignment.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-emerald-600 transition-colors">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="w-11 h-11 rounded-2xl bg-emerald-950 text-gold-400 flex items-center justify-center shrink-0">
                        <ClipboardList className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-black text-slate-900 text-base truncate">{assignment.title}</h3>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-50 text-green-800 border border-green-200">
                            {assignment.month}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{assignment.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-[11px] text-slate-400 font-semibold">
                          <span>الدرجة: {assignment.maxScore}</span>
                          {assignment.dueDate && (
                            <span className="flex items-center gap-1">
                              <CalendarDays className="w-3 h-3" />
                              آخر موعد: {new Date(assignment.dueDate).toLocaleDateString('ar-EG')}
                            </span>
                          )}
                          <span className={pendingCount > 0 ? 'text-amber-700 font-black' : 'text-emerald-700 font-black'}>
                            {subCount} رد · {pendingCount} بدون تصحيح
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => { setSelectedAssignmentId(assignment.id); setSelectedGrade(assignment.grade); }}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                      >
                        <User className="w-3.5 h-3.5" />
                        عرض الردود
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(assignment)}
                        className="inline-flex items-center justify-center w-10 h-10 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                        title="حذف الواجب"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}