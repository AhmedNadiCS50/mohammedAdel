"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  getExamSubmissions, 
  gradeEssayAnswer, 
  getExams,
  getStudents,
  GRADE_LABELS,
  saveTeacherComment
} from '@/lib/storage';
import { getSubmissionsFromFirestore, getExamsFromFirestore, getStudentsFromFirestore } from '@/lib/firestoreService';
import { logModeratorAction } from '@/lib/moderatorService';
import { getCurrentModerator, isAdminLoggedIn } from '@/lib/storage';
import { isFirebaseConfigured } from '@/lib/firebase';
import { ExamSubmission, Exam, Student, Question, GradeLevel } from '@/lib/types';
import { 
  FileCheck, 
  Clock, 
  CheckCircle2, 
  Award, 
  User, 
  Phone, 
  HelpCircle, 
  Save, 
  Sparkles, 
  ArrowRight,
  Filter,
  Search,
  ChevronLeft,
  GraduationCap,
  Layers,
  BookOpen,
  MessageSquare,
  Send
} from 'lucide-react';

const GRADES_LIST: GradeLevel[] = [
  'first_secondary_general',
  'first_secondary_bac',
  'second_secondary_general',
  'second_secondary_bac',
];

export default function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState<ExamSubmission[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  
  // Navigation & Filtering hierarchy
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel>('first_secondary_general');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'graded'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [gradeInputs, setGradeInputs] = useState<Record<string, number>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    loadData();

    const handleDataChange = () => {
      loadData();
    };
    window.addEventListener('platform-data-changed', handleDataChange);
    return () => window.removeEventListener('platform-data-changed', handleDataChange);
  }, []);

  const loadData = async () => {
    let allSubs = getExamSubmissions();

    // Merge submissions created on other devices (synced via Firestore)
    if (isFirebaseConfigured()) {
      try {
        const remote = await getSubmissionsFromFirestore();
        if (remote && remote.length > 0) {
          const dedupe = new Map<string, ExamSubmission>();
          allSubs.forEach(s => dedupe.set(s.id, s));
          remote.forEach(s => dedupe.set(s.id, s)); // Firestore is source of truth
          allSubs = Array.from(dedupe.values());
        }
      } catch (err) {
        console.error('Error merging Firestore submissions:', err);
      }
    }

    const allExams = getExams();
    const allStudents = getStudents();
    setSubmissions(allSubs);

    // On a fresh device (e.g. moderator) pull exams/students from the cloud
    if (isFirebaseConfigured()) {
      try {
        const [remoteExams, remoteStudents] = await Promise.all([getExamsFromFirestore(), getStudentsFromFirestore()]);
        if (remoteExams && remoteExams.length > 0) {
          const examMap = new Map<string, Exam>();
          allExams.forEach(e => examMap.set(e.id, e));
          remoteExams.forEach(e => examMap.set(e.id, e));
          setExams(Array.from(examMap.values()));
        } else {
          setExams(allExams);
        }
        if (remoteStudents && remoteStudents.length > 0) {
          const studentMap = new Map<string, Student>();
          allStudents.forEach(s => studentMap.set(s.id, s));
          remoteStudents.forEach(s => studentMap.set(s.id, s));
          setStudents(Array.from(studentMap.values()));
        } else {
          setStudents(allStudents);
        }
      } catch (err) {
        console.error('Error merging Firestore exams/students:', err);
        setExams(allExams);
        setStudents(allStudents);
      }
    } else {
      setExams(allExams);
      setStudents(allStudents);
    }

    // Prepopulate inputs with existing grades
    const initialInputs: Record<string, number> = {};
    const initialComments: Record<string, string> = {};
    allSubs.forEach(sub => {
      if (sub.essayGrades) {
        Object.entries(sub.essayGrades).forEach(([qId, grade]) => {
          if (typeof grade === 'number') {
            initialInputs[`${sub.id}_${qId}`] = grade;
          }
        });
      }
      if (sub.teacherComment) initialComments[sub.id] = sub.teacherComment;
    });
    setGradeInputs(initialInputs);
    setCommentInputs(initialComments);
  };

  const handleGradeChange = (subId: string, qId: string, value: number) => {
    setGradeInputs(prev => ({
      ...prev,
      [`${subId}_${qId}`]: value,
    }));
  };

  const handleSaveGrade = (submission: ExamSubmission, question: Question) => {
    const key = `${submission.id}_${question.id}`;
    const grade = gradeInputs[key];

    if (grade === undefined || isNaN(grade)) {
      alert('يرجى كتابة الدرجة قبل الحفظ.');
      return;
    }

    if (grade < 0 || grade > question.points) {
      alert(`الدرجة يجب أن تكون بين 0 و ${question.points}.`);
      return;
    }

    const updated = gradeEssayAnswer(submission.id, question.id, grade, submission, exams.find(e => e.id === submission.examId));
    if (updated) {
      const moderator = getCurrentModerator();
      if (moderator) {
        logModeratorAction({
          actor: moderator,
          action: 'grade_essay',
          targetType: 'exam_submission',
          targetId: submission.id,
          detail: `رصد درجة ${grade} من ${question.points} للسؤال «${question.text.slice(0, 60)}» للطالب ${submission.studentName}`,
        });
      }
      setNotice(`تم حفظ واعتماد درجة الطالب (${submission.studentName}) بنجاح: ${grade} من ${question.points}.`);
      loadData();
      setTimeout(() => setNotice(null), 3500);
    }
  };

  const handleSaveComment = (submission: ExamSubmission) => {
    const comment = (commentInputs[submission.id] || '').trim();
    const updated = saveTeacherComment(submission.id, comment, submission);
    if (updated) {
      const moderator = getCurrentModerator();
      if (moderator) {
        logModeratorAction({
          actor: moderator,
          action: 'save_comment',
          targetType: 'exam_submission',
          targetId: submission.id,
          detail: comment ? `أضاف تعليقاً للطالب ${submission.studentName}` : 'مسح تعليقه على تسليم الطالب',
        });
      }
      setNotice(`تم حفظ تعليقك للطالب (${submission.studentName}).`);
      loadData();
      setTimeout(() => setNotice(null), 3500);
    }
  };

  // Submissions with essay questions
  const submissionsWithEssays = submissions.filter(s => {
    const hasAnswers = s.essayAnswers && Object.keys(s.essayAnswers).length > 0;
    const hasGradesKey = s.essayGrades && Object.keys(s.essayGrades).length > 0;
    return hasAnswers || hasGradesKey;
  });

  // Map each submission to its student and grade
  const getSubmissionGrade = (sub: ExamSubmission): GradeLevel => {
    const student = students.find(s => s.id === sub.studentId);
    if (student) return student.grade;
    const exam = exams.find(e => e.id === sub.examId);
    if (exam) return exam.grade;
    return 'first_secondary_general';
  };

  // Group submissions by grade
  const getSubmissionsForGrade = (grade: GradeLevel) => {
    return submissionsWithEssays.filter(s => getSubmissionGrade(s) === grade);
  };

  // Current grade submissions
  const gradeSubmissions = getSubmissionsForGrade(selectedGrade);

  // Extract unique students who submitted in this grade
  const studentMap = new Map<string, {
    student: Student | null;
    studentId: string;
    studentName: string;
    studentPhone: string;
    submissions: ExamSubmission[];
    pendingCount: number;
  }>();

  gradeSubmissions.forEach(sub => {
    const std = students.find(s => s.id === sub.studentId) || null;
    const stdId = sub.studentId;
    if (!studentMap.has(stdId)) {
      studentMap.set(stdId, {
        student: std,
        studentId: stdId,
        studentName: sub.studentName || std?.name || 'طالب',
        studentPhone: sub.studentPhone || std?.phone || '',
        submissions: [],
        pendingCount: 0,
      });
    }
    const record = studentMap.get(stdId)!;
    record.submissions.push(sub);
    if (sub.hasPendingEssays) {
      record.pendingCount++;
    }
  });

  const studentsWithSubmissions = Array.from(studentMap.values());

  // Filter students based on status and search query
  const filteredStudents = studentsWithSubmissions.filter(item => {
    // Status filter
    if (statusFilter === 'pending' && item.pendingCount === 0) return false;
    if (statusFilter === 'graded' && item.pendingCount > 0) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const matchName = item.studentName.toLowerCase().includes(q);
      const matchPhone = item.studentPhone.includes(q);
      return matchName || matchPhone;
    }
    return true;
  });

  // If a student is currently selected, find their record
  const selectedStudentRecord = selectedStudentId 
    ? studentMap.get(selectedStudentId) || null
    : null;

  // Global counts for badges
  const totalPendingAll = submissionsWithEssays.filter(s => s.hasPendingEssays).length;

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full mb-2">
            <FileCheck className="w-3.5 h-3.5" />
            <span>نظام التصحيح اليدوي المبوب (حسب الصف والطالب)</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">تسليمات الطلاب وتصحيح المقالي</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            قوائم مبسطة ومقسمة لكل صف دراسي؛ اختر الصف لاستعراض الطلاب وتسليماتهم بسهولة ورصد الدرجات فورياً.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isAdminLoggedIn() && (
            <Link
              href="/admin/exams"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 hover:text-emerald-800 text-xs font-bold rounded-xl shadow-xs transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
              <span>بنك الأسئلة والامتحانات</span>
            </Link>
          )}
        </div>
      </div>

      {/* Success Notification */}
      {notice && (
        <div className="p-4 bg-emerald-100 border border-emerald-300 text-emerald-950 font-bold rounded-2xl flex items-center gap-2 text-xs shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* LEVEL 1: Grade Selection Tabs / Cards */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-sm border border-slate-200">
        <div className="flex items-center gap-2 mb-3 px-1 text-xs font-bold text-slate-600">
          <GraduationCap className="w-4 h-4 text-emerald-700" />
          <span>اختر الصف الدراسي لاستعراض طلابه وتسليماتهم:</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {GRADES_LIST.map((grade) => {
            const isSelected = selectedGrade === grade;
            const subsInGrade = getSubmissionsForGrade(grade);
            const pendingInGrade = subsInGrade.filter(s => s.hasPendingEssays).length;
            const uniqueStudentsCount = new Set(subsInGrade.map(s => s.studentId)).size;

            return (
              <button
                key={grade}
                type="button"
                onClick={() => {
                  setSelectedGrade(grade);
                  setSelectedStudentId(null); // Reset selected student when changing grade
                }}
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
                  {pendingInGrade > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-slate-950 animate-pulse">
                      {pendingInGrade} معلق
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] pt-2 border-t border-white/10 text-slate-400">
                  <span className={isSelected ? 'text-emerald-300 font-medium' : 'text-slate-500'}>
                    {uniqueStudentsCount} طالب قاموا بالتسليم
                  </span>
                  <span className="font-mono font-bold">
                    {subsInGrade.length} تسليم
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* LEVEL 2 or LEVEL 3 based on whether a student is selected */}
      {/* ---------------------------------------------------- */}

      {selectedStudentRecord ? (
        /* ==================================================== */
        /* LEVEL 3: View Submissions of the Selected Student    */
        /* ==================================================== */
        <div className="space-y-6">
          {/* Breadcrumb / Back Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <button
              type="button"
              onClick={() => setSelectedStudentId(null)}
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-emerald-800 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl transition-all self-start"
            >
              <ChevronLeft className="w-4 h-4 rotate-180" />
              <span>العودة لقائمة طلاب {GRADE_LABELS[selectedGrade]}</span>
            </button>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>عرض تسليمات الطالب:</span>
              <strong className="text-slate-900 text-sm font-black">{selectedStudentRecord.studentName}</strong>
              <span className="font-mono">({selectedStudentRecord.studentPhone})</span>
            </div>
          </div>

          {/* Submissions List for this student */}
          <div className="space-y-6">
            {selectedStudentRecord.submissions.map((submission) => {
              const exam = exams.find(e => e.id === submission.examId);
              const essayQuestions = (exam?.questions || []).filter(q => q.type === 'essay');

              return (
                <div
                  key={submission.id}
                  className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6"
                >
                  {/* Submission Header */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          {exam?.month || 'اختبار'}
                        </span>
                        <h3 className="text-lg font-black text-slate-900">{submission.examTitle || exam?.title}</h3>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        تاريخ ووقت التسليم: {new Date(submission.submittedAt).toLocaleString('ar-EG')}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 self-start md:self-auto">
                      <div className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-2xl text-center">
                        <span className="text-[10px] text-slate-500 block">حالة التسليم:</span>
                        {submission.hasPendingEssays ? (
                          <span className="text-xs font-bold text-amber-700 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> بانتظار اعتماد المقالي
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> تم اعتماد كافة الدرجات
                          </span>
                        )}
                      </div>

                      <div className="bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-2xl text-center">
                        <span className="text-[10px] text-emerald-700 block font-bold">الدرجة الحالية:</span>
                        <span className="text-sm font-black text-emerald-900 font-mono">
                          {submission.score} / {submission.totalScore} ({submission.percentage}%)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Questions & Answers in this Submission */}
                  <div className="space-y-6">
                    {essayQuestions.map((q, qIndex) => {
                      const studentText = submission.essayAnswers?.[q.id] || 'لم يكتب إجابة لهذا السؤال.';
                      const currentGrade = submission.essayGrades?.[q.id];
                      const isGraded = typeof currentGrade === 'number';
                      const inputKey = `${submission.id}_${q.id}`;
                      const enteredGrade = gradeInputs[inputKey] ?? (isGraded ? currentGrade : '');

                      return (
                        <div 
                          key={q.id}
                          className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-4"
                        >
                          {/* Question Title & Points */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-gold-700 bg-gold-400/20 px-2.5 py-1 rounded-lg">
                                سؤال مقالي ({qIndex + 1})
                              </span>
                              <span className="text-xs text-slate-500 font-semibold">
                                الدرجة العظمى للسؤال: <strong>{q.points} درجات</strong>
                              </span>
                            </div>

                            <div>
                              {isGraded ? (
                                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> تم الاعتماد: {currentGrade} من {q.points}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
                                  <Clock className="w-3.5 h-3.5 text-amber-600" /> بانتظار وضع الدرجة
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Question Text */}
                          <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                            <span className="text-[11px] font-bold text-slate-500 block mb-1">نص السؤال:</span>
                            <p className="text-sm font-bold text-slate-900 leading-relaxed">{q.text}</p>
                          </div>

                          {/* Student Written Response */}
                          <div className="bg-white p-4 rounded-xl border-2 border-emerald-700/25 space-y-1.5 shadow-xs">
                            <span className="text-[11px] font-black text-emerald-800 flex items-center gap-1">
                              <User className="w-3.5 h-3.5" /> إجابة الطالب المكتوبة:
                            </span>
                            <p className="text-sm text-slate-800 whitespace-pre-line leading-relaxed font-medium">
                              {studentText}
                            </p>
                          </div>

                          {/* Attached photos from the student's notebook */}
                          {(submission.attachments || []).filter(a => a.name.startsWith(q.id + '-')).length > 0 && (
                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                              <span className="text-[11px] font-black text-slate-500 flex items-center gap-1 mb-2">
                                صور مرفقة من كراسة الطالب ({submission.attachments!.filter(a => a.name.startsWith(q.id + '-')).length}):
                              </span>
                              <div className="flex flex-wrap gap-2.5">
                                {submission.attachments!
                                  .filter(a => a.name.startsWith(q.id + '-'))
                                  .map(att => (
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

                          {/* Teacher's Model Answer / Reference */}
                          {q.explanation && (
                            <div className="p-3 bg-gold-50/80 rounded-xl border border-gold-200 text-xs text-gold-950">
                              <span className="font-bold">ملاحظاتك الاسترشادية للتصحيح: </span>
                              {q.explanation}
                            </div>
                          )}

                          {/* Grade Input and Save Button */}
                          <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <label className="text-xs font-bold text-slate-700">
                                رصد الدرجة المستحقة (من 0 إلى {q.points}):
                              </label>
                              <input
                                type="number"
                                min={0}
                                max={q.points}
                                value={enteredGrade}
                                onChange={(e) => handleGradeChange(submission.id, q.id, Number(e.target.value))}
                                placeholder={`0 - ${q.points}`}
                                className="w-24 px-3 py-1.5 border-2 border-slate-300 rounded-xl text-center text-sm font-black text-slate-900 focus:border-emerald-700 focus:outline-none bg-white"
                              />
                            </div>

                            <button
                              type="button"
                              onClick={() => handleSaveGrade(submission, q)}
                              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all self-end sm:self-auto"
                            >
                              <Save className="w-4 h-4" />
                              <span>{isGraded ? 'تعديل وحفظ الدرجة' : 'حفظ واعتماد الدرجة فورياً'}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Teacher overall comment for the student */}
                  <div className="pt-2 border-t border-slate-200 space-y-3">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-emerald-700" />
                      <h4 className="text-xs font-black text-slate-900">تعليق المدرس للطالب (اختياري):</h4>
                    </div>
                    <textarea
                      value={commentInputs[submission.id] || ''}
                      onChange={(e) => setCommentInputs(prev => ({ ...prev, [submission.id]: e.target.value }))}
                      rows={3}
                      placeholder="اكتب تعليقاً أو ملاحظة يراها الطالب مع نتيجة الواجب..."
                      className="w-full p-3.5 rounded-xl border border-slate-300 text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-emerald-700 bg-white resize-y"
                    />
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[11px] text-slate-400 font-medium">يظهر للطالب في صفحة نتيجة الامتحان وصفحة الواجبات.</p>
                      <button
                        type="button"
                        onClick={() => handleSaveComment(submission)}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                      >
                        <Send className="w-4 h-4" />
                        <span>حفظ التعليق وإرساله للطالب</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* ==================================================== */
        /* LEVEL 2: Students List in the Selected Grade        */
        /* ==================================================== */
        <div className="space-y-4">
          {/* Filter Bar & Search inside the Grade */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === 'all'
                    ? 'bg-emerald-800 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                جميع الطلاب ({studentsWithSubmissions.length})
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter('pending')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                  statusFilter === 'pending'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                }`}
              >
                <Clock className="w-3 h-3" />
                <span>بحاجة لتصحيح ({studentsWithSubmissions.filter(s => s.pendingCount > 0).length})</span>
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter('graded')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                  statusFilter === 'graded'
                    ? 'bg-emerald-800 text-white shadow-sm'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                }`}
              >
                <CheckCircle2 className="w-3 h-3" />
                <span>مكتمل ({studentsWithSubmissions.filter(s => s.pendingCount === 0).length})</span>
              </button>
            </div>

            {/* Student Search Box */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث باسم الطالب أو هاتفه..."
                className="w-full pr-9 pl-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-white"
              />
            </div>
          </div>

          {/* Students List Display */}
          {filteredStudents.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
              <BookOpen className="w-12 h-12 text-slate-400 mx-auto opacity-60" />
              <h3 className="text-base font-bold text-slate-800">
                {searchQuery.trim()
                  ? 'لا توجد نتائج مطابقة لبحثك في هذا الصف'
                  : `لا توجد تسليمات مقالية مسجلة لطلاب ${GRADE_LABELS[selectedGrade]} بعد`}
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                عندما يقوم أي طالب بحل امتحان في هذا الصف، سيظهر اسمه وبطاقته هنا لتستعرض تسليماته وتضع الدرجات.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStudents.map((item) => {
                const hasPending = item.pendingCount > 0;

                return (
                  <div
                    key={item.studentId}
                    onClick={() => setSelectedStudentId(item.studentId)}
                    className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs hover:shadow-md hover:border-emerald-600 transition-all cursor-pointer flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-2xl bg-emerald-950 text-gold-400 flex items-center justify-center font-black text-lg border border-gold-400 group-hover:scale-105 transition-transform">
                            {item.studentName.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-slate-900 group-hover:text-emerald-800 transition-colors">
                              {item.studentName}
                            </h4>
                            <span className="text-xs font-mono text-slate-500 flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3 text-emerald-700" /> {item.studentPhone}
                            </span>
                          </div>
                        </div>

                        {hasPending ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-700" /> {item.pendingCount} بانتظار التصحيح
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> مصحح بالكامل
                          </span>
                        )}
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 flex items-center justify-between">
                        <span>إجمالي الامتحانات المسلمة:</span>
                        <strong className="text-slate-900 font-mono text-sm">{item.submissions.length} تسليم</strong>
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-800 group-hover:text-emerald-600">
                      <span>عرض تسليمات الطالب ورصد الدرجات</span>
                      <ChevronLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
