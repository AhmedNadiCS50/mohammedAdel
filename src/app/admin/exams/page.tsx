"use client";

import React, { useState, useEffect } from 'react';
import { getExams, saveExam, deleteExam, GRADE_LABELS } from '@/lib/storage';
import { Exam, Question, GradeLevel } from '@/lib/types';
import { 
  HelpCircle, 
  PlusCircle, 
  Trash2, 
  Edit3, 
  Check, 
  Clock, 
  Award, 
  AlertCircle,
  Plus
} from 'lucide-react';

export default function AdminExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [grade, setGrade] = useState<GradeLevel>('first_secondary_general');
  const [month, setMonth] = useState('شهر أكتوبر');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [passingScore, setPassingScore] = useState(60);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = () => {
    setExams(getExams());
  };

  const handleOpenAdd = () => {
    setTitle('');
    setDescription('');
    setGrade('first_secondary_general');
    setMonth('شهر أكتوبر');
    setDurationMinutes(30);
    setPassingScore(60);
    // Add default single question template
    setQuestions([
      {
        id: 'q_' + Date.now(),
        type: 'mcq',
        text: '',
        options: ['', '', '', ''],
        correctOptionIndex: 0,
        points: 2,
        explanation: '',
      }
    ]);
    setEditingId(null);
    setIsAdding(true);
  };

  const handleEdit = (exam: Exam) => {
    setTitle(exam.title);
    setDescription(exam.description);
    setGrade(exam.grade);
    setMonth(exam.month);
    setDurationMinutes(exam.durationMinutes);
    setPassingScore(exam.passingScore);
    setQuestions(exam.questions.map(q => ({
      ...q,
      type: q.type || 'mcq',
    })));
    setEditingId(exam.id);
    setIsAdding(true);
  };

  const handleDelete = (id: string, examTitle: string) => {
    if (confirm(`هل أنت متأكد من حذف امتحان "${examTitle}"؟`)) {
      deleteExam(id);
      loadExams();
      setNotice('تم حذف الامتحان بنجاح.');
      setTimeout(() => setNotice(null), 3000);
    }
  };

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: 'q_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
        type: 'mcq',
        text: '',
        options: ['', '', '', ''],
        correctOptionIndex: 0,
        points: 2,
        explanation: '',
      }
    ]);
  };

  const handleRemoveQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleUpdateQuestion = (index: number, updates: Partial<Question>) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], ...updates };
    setQuestions(updated);
  };

  const handleOptionChange = (qIndex: number, optIndex: number, value: string) => {
    const updated = [...questions];
    const opts = [...(updated[qIndex].options || ['', '', '', ''])];
    opts[optIndex] = value;
    updated[qIndex].options = opts;
    setQuestions(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (questions.length === 0) {
      alert('يرجى إضافة سؤال واحد على الأقل.');
      return;
    }

    // Verify all questions have text
    const emptyQ = questions.find(q => !q.text.trim());
    if (emptyQ) {
      alert('يرجى كتابة نص السؤال لجميع الأسئلة.');
      return;
    }

    // Verify MCQ questions have options filled
    const invalidMcq = questions.find(q => (q.type || 'mcq') === 'mcq' && (!q.options || q.options.some(o => !o.trim())));
    if (invalidMcq) {
      alert('يرجى كتابة جميع الخيارات الأربعة لأسئلة الاختيار من متعدد.');
      return;
    }

    const cleanQuestions: Question[] = questions.map(q => {
      if (q.type === 'essay') {
        return {
          ...q,
          type: 'essay',
          options: [],
          correctOptionIndex: -1,
        };
      }
      return {
        ...q,
        type: 'mcq',
        options: q.options || ['', '', '', ''],
      };
    });

    saveExam({
      title: title.trim(),
      description: description.trim(),
      grade,
      month: month.trim(),
      durationMinutes: Number(durationMinutes),
      passingScore: Number(passingScore),
      questions: cleanQuestions,
    }, editingId || undefined);

    setIsAdding(false);
    setEditingId(null);
    loadExams();
    setNotice(editingId ? 'تم تعديل الامتحان بنجاح.' : 'تم إضافة الامتحان الجديد بنجاح.');
    setTimeout(() => setNotice(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">بنك الأسئلة والامتحانات الإلكترونية</h1>
          <p className="text-xs text-slate-500 mt-1">
            أضف امتحانات اختيار من متعدد بتصحيح فوري ونسبة نجاح وتوضيحات نموذجية للحل.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-all self-start"
        >
          <PlusCircle className="w-4 h-4" />
          <span>إنشاء امتحان جديد</span>
        </button>
      </div>

      {notice && (
        <div className="p-3.5 bg-emerald-100 border border-emerald-300 text-emerald-950 font-bold rounded-xl text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-700" />
          <span>{notice}</span>
        </div>
      )}

      {/* Exam Form Modal or Card */}
      {isAdding && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border-2 border-emerald-700/40 space-y-6">
          <div className="flex items-center justify-between border-b pb-3">
            <h2 className="text-lg font-black text-slate-900">
              {editingId ? 'تعديل الامتحان' : 'إنشاء امتحان إلكتروني جديد'}
            </h2>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-xs font-bold text-slate-400 hover:text-slate-600"
            >
              إلغاء
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Exam Meta */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">عنوان الامتحان</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: اختبار الباب الأول في الخوارزميات"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الشهر أو الفصل</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: شهر أكتوبر"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الصف الدراسي</label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value as GradeLevel)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold bg-white focus:outline-none"
                >
                  <option value="first_secondary_general">الصف الأول الثانوي (عام)</option>
                  <option value="first_secondary_bac">الصف الأول الثانوي (بكالوريا)</option>
                  <option value="second_secondary_general">الصف الثاني الثانوي (عام)</option>
                  <option value="second_secondary_bac">الصف الثاني الثانوي (بكالوريا)</option>
                  <option value="first_secondary_azhari">الصف الأول الثانوي (أزهر)</option>
                  <option value="second_secondary_azhari">الصف الثاني الثانوي (أزهر)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">وقت الامتحان (بالدقائق)</label>
                <input
                  type="number"
                  min={5}
                  max={180}
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">درجة النجاح المئوية (%)</label>
                <input
                  type="number"
                  min={10}
                  max={100}
                  value={passingScore}
                  onChange={(e) => setPassingScore(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">وصف أو تعليمات الامتحان للطلاب</label>
              <input
                type="text"
                placeholder="مثال: يرجى التركيز والحل في الوقت المحدد دون استخدام مذكرات جانبية."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none"
              />
            </div>

            {/* Questions Builder Section */}
            <div className="pt-4 border-t border-slate-200 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900">أسئلة الامتحان ({questions.length})</h3>
                  <p className="text-[11px] text-slate-500">نظام الاختيار من متعدد مع تحديد الإجابة الصحيحة وتوزيع الدرجات</p>
                </div>
                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold text-xs rounded-xl transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إضافة سؤال آخر</span>
                </button>
              </div>

              <div className="space-y-6">
                {questions.map((q, qIndex) => (
                  <div key={q.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-xs text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-lg">
                          سؤال ({qIndex + 1})
                        </span>

                        {/* Question Type Toggle */}
                        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-xs">
                          <button
                            type="button"
                            onClick={() => handleUpdateQuestion(qIndex, { type: 'mcq' })}
                            className={`px-3 py-1 rounded-lg font-bold transition-all ${
                              (q.type || 'mcq') === 'mcq'
                                ? 'bg-emerald-800 text-white shadow-sm'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            اختيار من متعدد (MCQ)
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateQuestion(qIndex, { type: 'essay' })}
                            className={`px-3 py-1 rounded-lg font-bold transition-all ${
                              q.type === 'essay'
                                ? 'bg-gold-500 text-slate-950 shadow-sm'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            سؤال مقالي (نص حر)
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-auto">
                        <div className="flex items-center gap-1 text-xs">
                          <span className="text-slate-500 font-bold">الدرجة:</span>
                          <input
                            type="number"
                            min={1}
                            max={20}
                            value={q.points}
                            onChange={(e) => handleUpdateQuestion(qIndex, { points: Number(e.target.value) })}
                            className="w-14 px-2 py-1 border rounded text-center text-xs font-bold bg-white"
                          />
                        </div>

                        {questions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveQuestion(qIndex)}
                            className="text-red-500 hover:text-red-700 text-xs p-1"
                            title="حذف هذا السؤال"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        نص السؤال {q.type === 'essay' ? 'المقالي' : ''}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={q.type === 'essay' ? "اكتب صيغة السؤال المقالي المطلوب من الطالب الإجابة عنه كتابياً..." : "اكتب نص السؤال هنا..."}
                        value={q.text}
                        onChange={(e) => handleUpdateQuestion(qIndex, { text: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none bg-white"
                      />
                    </div>

                    {/* Conditional render based on question type */}
                    {q.type === 'essay' ? (
                      <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-1.5">
                        <div className="flex items-center gap-1.5 text-xs font-black text-amber-900">
                          <HelpCircle className="w-4 h-4 text-amber-700" />
                          <span>سؤال مقالي (تصحيح يدوي من المدرس):</span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-relaxed">
                          سيكتب الطالب إجابته بالتفصيل في خانة نصية أثناء حل الامتحان. ستصلك إجابته في صفحة <strong>التسليمات</strong> لمراجعتها ورصد الدرجة له من ({q.points} درجة).
                        </p>
                      </div>
                    ) : (
                      /* Options (Choices) */
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-2">
                          الخيارات الأربعة (حدد الإجابة الصحيحة بالضغط على الدائرة):
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {(q.options || ['', '', '', '']).map((opt, optIndex) => {
                            const isCorrect = q.correctOptionIndex === optIndex;
                            return (
                              <div
                                key={optIndex}
                                className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all ${
                                  isCorrect ? 'bg-emerald-50 border-emerald-500' : 'bg-white border-slate-200'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={`correct_${q.id}`}
                                  checked={isCorrect}
                                  onChange={() => handleUpdateQuestion(qIndex, { correctOptionIndex: optIndex })}
                                  className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                />
                                <span className="text-xs font-bold text-slate-500">
                                  {['أ', 'ب', 'ج', 'د'][optIndex]}:
                                </span>
                                <input
                                  type="text"
                                  required
                                  placeholder={`الخيار ${optIndex + 1}`}
                                  value={opt}
                                  onChange={(e) => handleOptionChange(qIndex, optIndex, e.target.value)}
                                  className="w-full text-xs bg-transparent border-0 focus:outline-none font-medium"
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">
                        {q.type === 'essay' ? 'ملاحظات تصحيح أو إجابة استرشادية لك (اختياري)' : 'توضيح الإجابة النموذجية للطالب بعد التصحيح (اختياري)'}
                      </label>
                      <input
                        type="text"
                        placeholder={q.type === 'essay' ? "النقاط الرئيسية التي يجب توفرها في إجابة الطالب..." : "توضيح سبب صحة الإجابة أو المرجع في الكتاب..."}
                        value={q.explanation || ''}
                        onChange={(e) => handleUpdateQuestion(qIndex, { explanation: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t">
              <button
                type="submit"
                className="px-6 py-3 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>{editingId ? 'حفظ تعديلات الامتحان' : 'نشر الامتحان للطلاب'}</span>
              </button>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-all"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Exams List */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        {exams.length === 0 ? (
          <div className="py-16 text-center text-slate-500 space-y-3">
            <HelpCircle className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="font-bold text-slate-800">لا توجد امتحانات مضافة حتى الآن</p>
            <p className="text-xs max-w-sm mx-auto">
              المنصة نظيفة من أي أسئلة أو درجات وهمية. اضغط على <strong>"إنشاء امتحان جديد"</strong> لإضافة اختبارك الحقيقي لطلابك.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {exams.map((ex) => (
              <div key={ex.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-slate-900">{ex.title}</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {ex.month}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{ex.description || 'امتحان تقييمي دوري'}</p>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-2">
                    <span>{GRADE_LABELS[ex.grade]}</span>
                    <span>•</span>
                    <span>{ex.questions.length} أسئلة</span>
                    <span>•</span>
                    <span className="font-mono">{ex.durationMinutes} دقيقة</span>
                    <span>•</span>
                    <span>النجاح: {ex.passingScore}%</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center">
                  <button
                    type="button"
                    onClick={() => handleEdit(ex)}
                    className="p-2 text-slate-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-xl transition-colors"
                    title="تعديل"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(ex.id, ex.title)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
