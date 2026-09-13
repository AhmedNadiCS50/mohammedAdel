"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Exam, ExamSubmission, Student, SubmissionAttachment } from '@/lib/types';
import { submitExamAnswers, getExamSubmissions } from '@/lib/storage';
import { uploadSubmissionImage, deleteSubmissionImage } from '@/lib/upload';
import { isStorageConfigured } from '@/lib/firebase';
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Award, 
  AlertTriangle, 
  ArrowLeft, 
  ArrowRight,
  HelpCircle,
  FileText,
  Sparkles,
  Info,
  ImagePlus,
  Trash2,
  Loader2
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ExamRunnerProps {
  exam: Exam;
  student: Student;
  onFinished?: (submission: ExamSubmission) => void;
}

export default function ExamRunner({ exam, student, onFinished }: ExamRunnerProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [essayAnswers, setEssayAnswers] = useState<Record<string, string>>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState((exam.durationMinutes || 20) * 60);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<ExamSubmission | null>(null);
  // Homework photo attachments: questionId -> uploaded attachments
  const submissionIdRef = useRef('sub_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6));
  const [attachmentsByQuestion, setAttachmentsByQuestion] = useState<Record<string, SubmissionAttachment[]>>({});
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);

  useEffect(() => {
    const loadExisting = () => {
      const existingSubs = getExamSubmissions(student.id, exam.id);
      if (existingSubs && existingSubs.length > 0) {
        setSubmissionResult(existingSubs[0]);
        setIsSubmitted(true);
      }
    };

    loadExisting();
    window.addEventListener('platform-data-changed', loadExisting);
    return () => window.removeEventListener('platform-data-changed', loadExisting);
  }, [student.id, exam.id]);

  useEffect(() => {
    if (isSubmitted || timeLeftSeconds <= 0) return;

    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isSubmitted, timeLeftSeconds]);

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleEssayChange = (questionId: string, text: string) => {
    if (isSubmitted) return;
    setEssayAnswers((prev) => ({
      ...prev,
      [questionId]: text,
    }));
  };

  const openFilePicker = (questionId: string) => {
    if (isSubmitted || uploadingKey) return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/png,image/webp';
    input.multiple = true;
    input.onchange = () => {
      const files = input.files ? Array.from(input.files) : [];
      if (files.length) handleAttach(questionId, files);
    };
    input.click();
  };

  const handleAttach = async (questionId: string, files: File[]) => {
    if (isSubmitted || !files.length) return;
    if (!isStorageConfigured()) {
      alert('مرفق الصور غير متاح الآن، اكتب إجابتك النصية وأرسلها.');
      return;
    }
    setUploadingKey(questionId);
    try {
      const uploaded: SubmissionAttachment[] = [];
      for (const file of files) {
        const att = await uploadSubmissionImage(submissionIdRef.current, file);
        uploaded.push(att);
      }
      setAttachmentsByQuestion((prev) => ({
        ...prev,
        [questionId]: [...(prev[questionId] || []), ...uploaded],
      }));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'فشل رفع الصورة، حاول مرة أخرى.');
    } finally {
      setUploadingKey(null);
    }
  };

  const removeAttachment = async (questionId: string, attachment: SubmissionAttachment) => {
    await deleteSubmissionImage(submissionIdRef.current, attachment);
    setAttachmentsByQuestion((prev) => ({
      ...prev,
      [questionId]: (prev[questionId] || []).filter((a) => a.url !== attachment.url),
    }));
  };

  const handleSubmit = () => {
    if (isSubmitted) return;
    const submitAttachments = Object.entries(attachmentsByQuestion).reduce<SubmissionAttachment[]>(
      (acc, [qid, list]) => acc.concat(list.map((a) => ({ name: `${qid}-${a.name}`, url: a.url }))),
      []
    );
    const result = submitExamAnswers({
      exam,
      student,
      answers: selectedAnswers,
      essayAnswers,
      submissionId: submissionIdRef.current,
      attachments: submitAttachments.length > 0 ? submitAttachments : undefined,
    });
    setSubmissionResult(result);
    setIsSubmitted(true);

    if (result.passed && !result.hasPendingEssays) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // Safe fallback
      }
    }

    if (onFinished) onFinished(result);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestion = exam.questions[currentQuestionIndex];
  const mcqAnsweredCount = Object.keys(selectedAnswers).length;
  const essayAnsweredCount = Object.values(essayAnswers).filter(t => t.trim().length > 0).length;
  const answeredCount = mcqAnsweredCount + essayAnsweredCount;

  if (exam.questions.length === 0) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center shadow-sm">
        <HelpCircle className="w-12 h-12 text-green-700 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-gray-900">لا توجد أسئلة مضافة في هذا الامتحان بعد</h3>
        <p className="text-gray-500 text-sm mt-1">يقوم مستر محمد عادل بإعداد وتحديث بنك الأسئلة.</p>
      </div>
    );
  }

  // RESULT VIEW AFTER SUBMISSION
  if (isSubmitted && submissionResult) {
    const hasPending = submissionResult.hasPendingEssays;

    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Header Summary */}
        <div className={`p-8 text-center text-white ${
          hasPending
            ? 'bg-slate-800'
            : submissionResult.passed
              ? 'bg-[#1B4332]'
              : 'bg-slate-800'
        }`}>
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 backdrop-blur-md mb-4 border border-white/20">
            {hasPending ? (
              <Clock className="w-8 h-8 text-amber-300 animate-pulse" />
            ) : submissionResult.passed ? (
              <Award className="w-8 h-8 text-amber-300" />
            ) : (
              <AlertTriangle className="w-8 h-8 text-amber-300" />
            )}
          </div>
          <h2 className="text-2xl font-black mb-1">
            {hasPending
              ? 'تم تسليم إجاباتك بنجاح! الإجابات المقالية قيد المراجعة'
              : submissionResult.passed
                ? 'أحسنت! لقد اجتزت الامتحان بنجاح'
              : 'حظ أوفر في المحاولة القادمة'}
          </h2>
          <p className="text-emerald-100 text-sm">
            الطالب: {student.name} • {exam.title}
          </p>

          <div className="mt-6 flex justify-center items-center gap-4">
            <div className="bg-white/10 backdrop-blur-sm px-5 py-3 rounded-xl border border-white/15 text-center">
              <span className="text-xs text-emerald-100 block">
                {hasPending ? 'درجة الاختيار من متعدد' : 'درجتك النهائية'}
              </span>
              <span className="text-2xl font-black text-white font-mono">
                {submissionResult.score} / {submissionResult.totalScore}
              </span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm px-5 py-3 rounded-xl border border-white/15 text-center">
              <span className="text-xs text-emerald-100 block">
                {hasPending ? 'النسبة الحالية' : 'النسبة المئوية'}
              </span>
              <span className="text-2xl font-black text-white font-mono">
                {submissionResult.percentage}%
              </span>
            </div>
          </div>
        </div>

        {/* Pending Essays Alert Banner */}
        {hasPending && (
          <div className="m-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start sm:items-center gap-3 text-xs">
            <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
            <div>
              <strong className="block text-amber-900 font-bold mb-0.5">
                تنبيه: يتضمن هذا الامتحان أسئلة مقالية بانتظار مراجعة مستر محمد عادل!
              </strong>
              <span className="text-amber-800 leading-relaxed">
                تم تصحيح أسئلة الاختيار من متعدد فورياً. سيقوم مستر محمد عادل بقراءة إجابتك المقالية ورصد الدرجة المستحقة لك، وستظهر الدرجة في صفحتك فور اعتمادها.
              </span>
            </div>
          </div>
        )}

        {submissionResult.teacherComment && (
          <div className="mx-6 p-4 bg-white border border-green-300 rounded-xl flex items-start gap-3 text-xs shadow-sm">
            <FileText className="w-5 h-5 text-green-700 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-green-900 font-black mb-0.5">تعليق مستر محمد عادل على واجبك:</strong>
              <p className="text-green-900 whitespace-pre-line leading-relaxed font-medium">{submissionResult.teacherComment}</p>
            </div>
          </div>
        )}

        {/* Detailed Question Review */}
        <div className="p-6 md:p-8 space-y-6">
          <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
            مراجعة الأسئلة وتفاصيل إجاباتك:
          </h3>

          <div className="space-y-4">
            {exam.questions.map((q, qIndex) => {
              const isEssay = q.type === 'essay';

              if (isEssay) {
                const studentText = submissionResult.essayAnswers?.[q.id] || 'لم تتم كتابة إجابة لهذا السؤال.';
                const essayGrade = submissionResult.essayGrades?.[q.id];
                const isGraded = typeof essayGrade === 'number';

                return (
                  <div 
                    key={q.id} 
                    className={`p-5 rounded-xl border transition-all ${
                      isGraded ? 'border-green-200 bg-green-50/30' : 'border-amber-200 bg-amber-50/20'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                      <div className="flex items-start gap-2.5">
                        <span className="w-7 h-7 rounded-lg bg-gray-100 text-gray-800 font-bold text-xs flex items-center justify-center shrink-0">
                          {qIndex + 1}
                        </span>
                        <div>
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded mb-1 inline-block">
                            سؤال مقالي
                          </span>
                          <h4 className="font-bold text-gray-900 text-sm sm:text-base leading-relaxed">{q.text}</h4>
                        </div>
                      </div>

                      <div className="self-end sm:self-auto">
                        {isGraded ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-green-800 bg-green-100 px-3 py-1 rounded-full">
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-700" /> +{essayGrade} من {q.points} درجة
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full border border-amber-200">
                            <Clock className="w-3.5 h-3.5 text-amber-600" /> قيد المراجعة ({q.points} درجة)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Student Written Response */}
                    <div className="mt-3 p-3.5 bg-white rounded-lg border border-gray-200 space-y-1">
                      <span className="text-[11px] font-bold text-gray-500 block">إجابتك المكتوبة:</span>
                      <p className="text-xs sm:text-sm text-gray-800 whitespace-pre-line leading-relaxed font-medium">
                        {studentText}
                      </p>
                    </div>

                    {/* Attachments for this essay question */}
                    {(submissionResult.attachments || []).filter(a => a.name.startsWith(q.id + '-')).length > 0 && (
                      <div className="mt-3 p-3.5 bg-white rounded-lg border border-gray-200">
                        <span className="text-[11px] font-bold text-gray-500 block mb-2">صور مرفقة من كراستك:</span>
                        <div className="flex flex-wrap gap-2.5">
                          {(submissionResult.attachments || [])
                            .filter(a => a.name.startsWith(q.id + '-'))
                            .map(att => (
                              <a key={att.url} href={att.url} target="_blank" rel="noopener noreferrer" title={att.name}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={att.url} alt={att.name} className="w-24 h-24 rounded-lg object-cover border border-gray-200 shadow-sm hover:opacity-85 hover:scale-105 transition-all" />
                              </a>
                            ))}
                        </div>
                      </div>
                    )}

                    {q.explanation && isGraded && (
                      <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200 text-xs text-gray-700">
                        <span className="font-bold text-green-800">ملاحظات المدرس النموذجية: </span>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                );
              }

              // MCQ Question Review
              const studentAnswer = submissionResult.answers[q.id];
              const isCorrect = studentAnswer === q.correctOptionIndex;

              return (
                <div 
                  key={q.id} 
                  className={`p-5 rounded-xl border transition-all ${
                    isCorrect ? 'border-green-200 bg-green-50/20' : 'border-red-200 bg-red-50/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-start gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-gray-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                        {qIndex + 1}
                      </span>
                      <div>
                        <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded mb-1 inline-block">
                          اختيار من متعدد
                        </span>
                        <h4 className="font-bold text-gray-900 text-sm sm:text-base">{q.text}</h4>
                      </div>
                    </div>
                    <div>
                      {isCorrect ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-green-800 bg-green-100 px-2.5 py-1 rounded-full">
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-700" /> +{q.points} درجة
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-red-700 bg-red-100 px-2.5 py-1 rounded-full">
                          <XCircle className="w-3.5 h-3.5 text-red-600" /> 0 / {q.points}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Options List */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 text-sm">
                    {q.options.map((opt, optIdx) => {
                      const isOptionCorrect = optIdx === q.correctOptionIndex;
                      const isOptionSelected = optIdx === studentAnswer;

                      let style = "bg-white border-gray-200 text-gray-700";
                      if (isOptionCorrect) {
                        style = "bg-green-100 border-green-400 text-green-900 font-bold";
                      } else if (isOptionSelected && !isOptionCorrect) {
                        style = "bg-red-50 border-red-300 text-red-900 font-semibold line-through";
                      }

                      return (
                        <div key={optIdx} className={`p-3 rounded-lg border flex items-center justify-between ${style}`}>
                          <span>{opt}</span>
                          {isOptionCorrect && <CheckCircle2 className="w-4 h-4 text-green-700 shrink-0" />}
                          {isOptionSelected && !isOptionCorrect && <XCircle className="w-4 h-4 text-red-600 shrink-0" />}
                        </div>
                      );
                    })}
                  </div>

                  {q.explanation && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200 text-xs text-gray-700">
                      <span className="font-bold text-green-800">توضيح مستر محمد عادل: </span>
                      {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* One attempt notice */}
          <div className="pt-2">
            <div className="flex items-center gap-3 p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-600">
              <Info className="w-4 h-4 text-green-700 shrink-0" />
              <span>
                <strong className="text-gray-900 font-bold">محاولة واحدة فقط:</strong> هذا الامتحان مسموح بدخوله مرة واحدة فقط. النتائج المعروضة أعلاه هي نتيجتك الرسمية المسجلة.
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ACTIVE EXAM VIEW
  const isCurrentEssay = currentQuestion.type === 'essay';

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Exam Header */}
      <div className="p-6 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-green-800 bg-green-100 px-2.5 py-1 rounded-full border border-green-200">
              امتحان إلكتروني وتطبيقي مباشر
            </span>
            <h2 className="text-xl font-black mt-2 text-gray-900">{exam.title}</h2>
            <p className="text-xs text-gray-500 mt-0.5">{exam.description || 'أجب على جميع الأسئلة بدقة'}</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl font-mono text-sm bg-white border border-gray-200 shadow-sm">
              <Clock className="w-4 h-4 text-green-700" />
              <span className="text-gray-500">الوقت:</span>
              <span className="text-gray-900 font-bold text-base">{formatTime(timeLeftSeconds)}</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-5 flex items-center justify-between text-xs text-gray-500 mb-1.5 font-medium">
          <span>تمت الإجابة: {answeredCount} من {exam.questions.length} أسئلة</span>
          <span>السؤال الحالي: {currentQuestionIndex + 1} / {exam.questions.length}</span>
        </div>
        <div className="w-full rounded-full h-2 bg-gray-200 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${(answeredCount / exam.questions.length) * 100}%`, background: '#1B4332' }}
          />
        </div>
      </div>

      {/* Main Question Card */}
      <div className="p-6 md:p-8">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs font-bold mb-2">
            <span className="text-green-800 bg-green-50 px-2.5 py-0.5 rounded-lg border border-green-200">
              سؤال رقم ({currentQuestionIndex + 1})
            </span>
            <span className="text-gray-500">• {currentQuestion.points} درجات</span>
            {isCurrentEssay ? (
              <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200 font-bold">
                سؤال مقالي
              </span>
            ) : (
              <span className="text-gray-500 bg-gray-100 px-2 py-0.5 rounded-lg">
                اختيار من متعدد
              </span>
            )}
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 leading-relaxed">
            {currentQuestion.text}
          </h3>
        </div>

        {/* ESSAY QUESTION INPUT */}
        {isCurrentEssay ? (
          <div className="space-y-4 mb-8">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-xs font-bold text-amber-900">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span>اكتب إجابتك بالتفصيل أدناه وسيتم مراجعتها واعتماد درجتك بواسطة مستر محمد عادل.</span>
            </div>

            <textarea
              rows={6}
              value={essayAnswers[currentQuestion.id] || ''}
              onChange={(e) => handleEssayChange(currentQuestion.id, e.target.value)}
              placeholder="اكتب إجابتك النموذجية هنا بوضوح وبالتفصيل..."
              className="w-full p-4 rounded-xl border border-gray-300 focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 text-gray-900 text-sm leading-relaxed resize-y"
            />

            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>عدد الحروف: {(essayAnswers[currentQuestion.id] || '').length}</span>
              <span>درجة السؤال: {currentQuestion.points} درجات</span>
            </div>

            {/* Attach photos from the notebook */}
            <div className="border-t border-gray-100 pt-4 space-y-3">
              <button
                type="button"
                disabled={uploadingKey !== null}
                onClick={() => openFilePicker(currentQuestion.id)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-green-900 bg-green-50 border border-green-300 hover:bg-green-100 disabled:opacity-50 transition-colors cursor-pointer"
              >
                {uploadingKey === currentQuestion.id ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-green-700" />
                    جارٍ رفع الصور...
                  </>
                ) : (
                  <>
                    <ImagePlus className="w-4 h-4 text-green-700" />
                    إرفاق صور من الكراسة (اختياري)
                    {(attachmentsByQuestion[currentQuestion.id] || []).length > 0 && (
                      <span className="bg-green-700 text-white px-1.5 py-0.5 rounded-md text-[10px] font-black">
                        {(attachmentsByQuestion[currentQuestion.id] || []).length}
                      </span>
                    )}
                  </>
                )}
              </button>

              {(attachmentsByQuestion[currentQuestion.id] || []).length > 0 && (
                <div className="flex flex-wrap gap-2.5">
                  {(attachmentsByQuestion[currentQuestion.id] || []).map((att) => (
                    <div key={att.url} className="relative group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={att.url}
                        alt={att.name}
                        className="w-20 h-20 rounded-xl object-cover border border-gray-200 shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => removeAttachment(currentQuestion.id, att)}
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center shadow-md opacity-90 hover:opacity-100 cursor-pointer"
                        title="حذف الصورة"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-[11px] text-gray-400 font-medium">
                يمكنك تصوير حل الكراسة وإرفاقه هنا لتقوم مراجعة واعتماد درجتك.
              </p>
            </div>
          </div>
        ) : (
          /* MCQ OPTIONS */
          <div className="space-y-3 mb-8">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswers[currentQuestion.id] === index;
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSelectOption(currentQuestion.id, index)}
                  className={`w-full text-right p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                    isSelected
                      ? 'border-green-700 bg-green-50 text-green-900 font-bold shadow-sm'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                      isSelected ? 'bg-green-700 text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {['أ', 'ب', 'ج', 'د'][index] || index + 1}
                    </span>
                    <span className="text-sm sm:text-base">{option}</span>
                  </div>
                  {isSelected && <CheckCircle2 className="w-5 h-5 text-green-700 shrink-0" />}
                </button>
              );
            })}
          </div>
        )}

        {/* Navigation & Submit footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <button
            type="button"
            disabled={currentQuestionIndex === 0}
            onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 font-bold text-xs sm:text-sm"
          >
            <ArrowRight className="w-4 h-4" />
            السابق
          </button>

          {currentQuestionIndex < exam.questions.length - 1 ? (
            <button
              type="button"
              onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white shadow-sm"
              style={{ background: '#1B4332' }}
            >
              التالي
              <ArrowLeft className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white shadow-sm hover:opacity-95"
              style={{ background: '#1B4332' }}
            >
              <CheckCircle2 className="w-4 h-4" />
              إرسال الإجابات وإنهاء الامتحان
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
