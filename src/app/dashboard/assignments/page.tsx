"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  getCurrentStudent,
  getAssignments,
  getAssignmentSubmissions,
  submitAssignment,
} from '@/lib/storage';
import { getAssignmentsFromFirestore, getAssignmentSubmissionsFromFirestore } from '@/lib/firestoreService';
import { uploadAssignmentImage, deleteSubmissionImage } from '@/lib/upload';
import { isStorageConfigured } from '@/lib/firebase';
import { Student, Assignment, AssignmentSubmission, SubmissionAttachment } from '@/lib/types';
import {
  ClipboardList,
  CheckCircle2,
  Clock,
  Loader2,
  ImagePlus,
  Trash2,
  FileText,
  Award,
  MessageSquare,
  CalendarDays,
  Send,
} from 'lucide-react';
import PageHeader from '@/components/PageHeader';

export default function StudentAssignmentsPage() {
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [existingSubs, setExistingSubs] = useState<Record<string, AssignmentSubmission>>({});

  const [answerTexts, setAnswerTexts] = useState<Record<string, string>>({});
  const [attachments, setAttachments] = useState<Record<string, SubmissionAttachment[]>>({});
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);
  const [submittingFor, setSubmittingFor] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const submissionIdRef = useRef('asu_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6));

  useEffect(() => {
    const s = getCurrentStudent();
    if (!s) { router.push('/login'); return; }
    setStudent(s);
    loadData(s);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const loadData = async (s: Student) => {
    let allAssignments = getAssignments(s.grade);

    if (isStorageConfigured() || true) {
      try {
        const [remoteAssignments, remoteSubs] = await Promise.all([
          getAssignmentsFromFirestore(s.grade),
          getAssignmentSubmissionsFromFirestore(undefined, s.id),
        ]);
        const map = new Map<string, Assignment>();
        allAssignments.forEach(a => map.set(a.id, a));
        remoteAssignments.forEach(a => map.set(a.id, a));
        allAssignments = Array.from(map.values());
      } catch (err) {
        console.error('Error loading assignments from Firestore:', err);
      }
    }

    setAssignments(allAssignments);

    const localSubs = getAssignmentSubmissions(undefined, s.id);
    const subMap: Record<string, AssignmentSubmission> = {};
    localSubs.forEach(sub => { if (sub.studentId === s.id) subMap[sub.assignmentId] = sub; });
    setExistingSubs(subMap);
  };

  const handleAttach = async (assignmentId: string, files: File[]) => {
    if (!files.length) return;
    if (!isStorageConfigured()) {
      alert('مرفق الصور غير متاح الآن، أرسل ردك النصي.');
      return;
    }
    setUploadingFor(assignmentId);
    try {
      const uploaded: SubmissionAttachment[] = [];
      for (const file of files) {
        const att = await uploadAssignmentImage(submissionIdRef.current, file);
        uploaded.push(att);
      }
      setAttachments(prev => ({
        ...prev,
        [assignmentId]: [...(prev[assignmentId] || []), ...uploaded],
      }));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'فشل رفع الصورة، حاول مرة أخرى.');
    } finally {
      setUploadingFor(null);
    }
  };

  const openFilePicker = (assignmentId: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/png,image/webp';
    input.multiple = true;
    input.onchange = () => {
      if (input.files) handleAttach(assignmentId, Array.from(input.files));
    };
    input.click();
  };

  const removeAttachment = async (assignmentId: string, att: SubmissionAttachment) => {
    await deleteSubmissionImage(submissionIdRef.current, att);
    setAttachments(prev => ({
      ...prev,
      [assignmentId]: (prev[assignmentId] || []).filter(a => a.url !== att.url),
    }));
  };

  const handleSubmit = async (assignment: Assignment) => {
    if (!student) return;
    const text = (answerTexts[assignment.id] || '').trim();
    const hasAttachments = (attachments[assignment.id] || []).length > 0;
    if (!text && !hasAttachments) {
      alert('اكتب ردك على الواجب أو ارفق صورة قبل التسليم.');
      return;
    }
    setSubmittingFor(assignment.id);
    try {
      const sub = submitAssignment({
        assignment,
        student,
        answerText: text,
        attachments: attachments[assignment.id] || undefined,
      });
      setNotice(`تم تسليم واجب "${assignment.title}" وسيصاحبه جهدك للمدرس للتصحيح.`);
      setTimeout(() => setNotice(null), 4000);
      setExistingSubs(prev => ({ ...prev, [assignment.id]: sub }));
      setAnswerTexts(prev => ({ ...prev, [assignment.id]: '' }));
      setAttachments(prev => ({ ...prev, [assignment.id]: [] }));
      submissionIdRef.current = 'asu_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
      window.dispatchEvent(new Event('platform-data-changed'));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'حدث خطأ أثناء التسليم.');
    } finally {
      setSubmittingFor(null);
    }
  };

  if (!student) return null;

  return (
    <div className="space-y-6">
      <PageHeader title="الواجبات" subtitle="أجب عن واجباتك واكتب ردك وأرفق صور كراستك" icon={<ClipboardList className="w-6 h-6" />} />

      {notice && (
        <div className="p-4 bg-emerald-100 border border-emerald-300 text-emerald-950 font-bold rounded-2xl flex items-center gap-2 text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {assignments.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
          <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-700">لا توجد واجبات بعد</h3>
          <p className="text-xs text-gray-400 mt-1">سيضيف المدرس الواجبات هنا قريباً.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {assignments.map((assignment) => {
            const submission = existingSubs[assignment.id];
            const myAttachments = attachments[assignment.id] || [];
            const isUploading = uploadingFor === assignment.id;
            const isSubmitting = submittingFor === assignment.id;

            return (
              <div key={assignment.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                {/* Assignment header */}
                <div className="p-5 sm:p-6 border-b border-gray-100">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-2xl bg-emerald-800 text-white flex items-center justify-center shrink-0 shadow-sm">
                        <ClipboardList className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="font-black text-gray-900 text-base leading-snug">{assignment.title}</h2>
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {assignment.month}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1.5 leading-relaxed whitespace-pre-line">{assignment.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-[11px] text-gray-400 font-semibold">
                          <span>الدرجة: {assignment.maxScore}</span>
                          {assignment.dueDate && (
                            <span className="flex items-center gap-1">
                              <CalendarDays className="w-3 h-3" />
                              آخر موعد: {new Date(assignment.dueDate).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {submission && (
                      <span className={`px-3 py-1.5 rounded-full text-[11px] font-black flex items-center gap-1 ${
                        submission.status === 'graded'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}>
                        {submission.status === 'graded' ? (
                          <><CheckCircle2 className="w-3.5 h-3.5" /> مصحح · {submission.score}/{submission.maxScore}</>
                        ) : (
                          <><Clock className="w-3.5 h-3.5" /> تم التسليم · بانتظار التصحيح</>
                        )}
                      </span>
                    )}
                  </div>
                </div>

                {!submission ? (
                  /* Submit form */
                  <div className="p-5 sm:p-6 space-y-4">
                    <textarea
                      value={answerTexts[assignment.id] || ''}
                      onChange={e => setAnswerTexts(prev => ({ ...prev, [assignment.id]: e.target.value }))}
                      rows={4}
                      placeholder="اكتب إجابتك على الواجب هنا بالتفصيل..."
                      className="w-full p-4 rounded-xl border border-gray-300 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-gray-900 text-sm leading-relaxed resize-y"
                    />

                    <div className="border-t border-gray-100 pt-4 space-y-3">
                      <button
                        type="button"
                        disabled={isUploading}
                        onClick={() => openFilePicker(assignment.id)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-emerald-900 bg-emerald-50 border border-emerald-300 hover:bg-emerald-100 disabled:opacity-50 transition-colors cursor-pointer"
                      >
                        {isUploading ? (
                          <><Loader2 className="w-4 h-4 animate-spin text-emerald-700" /> جارٍ رفع الصور...</>
                        ) : (
                          <>
                            <ImagePlus className="w-4 h-4 text-emerald-700" />
                            إرفاق صور من الكراسة (اختياري)
                            {myAttachments.length > 0 && (
                              <span className="bg-emerald-700 text-white px-1.5 py-0.5 rounded-md text-[10px] font-black">{myAttachments.length}</span>
                            )}
                          </>
                        )}
                      </button>

                      {myAttachments.length > 0 && (
                        <div className="flex flex-wrap gap-2.5">
                          {myAttachments.map(att => (
                            <div key={att.url} className="relative group">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={att.url} alt={att.name} className="w-20 h-20 rounded-xl object-cover border border-gray-200 shadow-sm" />
                              <button
                                type="button"
                                onClick={() => removeAttachment(assignment.id, att)}
                                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center shadow-md cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => handleSubmit(assignment)}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-white font-bold text-xs rounded-xl shadow-sm hover:opacity-90 disabled:opacity-60 transition-all"
                      style={{ background: '#1B4332' }}
                    >
                      {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> جارٍ التسليم...</> : <><Send className="w-4 h-4" /> تسليم الواجب للمدرس (مرة واحدة)</>}
                    </button>
                  </div>
                ) : (
                  /* Submitted view */
                  <div className="p-5 sm:p-6 space-y-4">
                    <div className="flex items-start gap-2">
                      <FileText className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <span className="text-[11px] font-black text-gray-500 block mb-1">ريدك:</span>
                        <p className="text-sm text-gray-800 whitespace-pre-line leading-relaxed font-medium">
                          {submission.answerText || 'لم تكتب نصاً.'}
                        </p>
                      </div>
                    </div>

                    {submission.attachments && submission.attachments.length > 0 && (
                      <div>
                        <span className="text-[11px] font-bold text-gray-500 block mb-2">صور كراستك المرفقة:</span>
                        <div className="flex flex-wrap gap-2.5">
                          {submission.attachments.map(att => (
                            <a key={att.url} href={att.url} target="_blank" rel="noopener noreferrer" title={att.name}>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={att.url} alt={att.name} className="w-20 h-20 rounded-xl object-cover border border-gray-200 shadow-sm hover:opacity-85 transition-all" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {submission.status === 'graded' && (
                      <div className="pt-3 border-t border-gray-100 space-y-3">
                        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-3.5">
                          <Award className="w-6 h-6 text-emerald-700 shrink-0" />
                          <div>
                            <span className="text-[11px] font-black text-emerald-800 block">درجتك في الواجب:</span>
                            <span className="text-lg font-black text-emerald-900 font-mono">{submission.score}/{submission.maxScore}</span>
                          </div>
                        </div>

                        {submission.teacherComment && (
                          <div className="flex items-start gap-2 bg-green-50/60 border border-green-200 rounded-r-xl rounded-l-lg border-r-[3px] border-r-green-700 p-3.5 text-xs">
                            <MessageSquare className="w-4 h-4 text-green-700 shrink-0 mt-0.5" />
                            <div>
                              <span className="text-[10px] font-black text-green-800 block mb-0.5">تعليق مستر عمرو شاهين:</span>
                              <p className="text-green-900 leading-relaxed font-medium whitespace-pre-line">{submission.teacherComment}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}