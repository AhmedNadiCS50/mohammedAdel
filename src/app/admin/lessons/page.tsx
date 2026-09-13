"use client";

import React, { useState, useEffect } from 'react';
import { getLessons, saveLesson, deleteLesson, extractYoutubeId, GRADE_LABELS } from '@/lib/storage';
import { getLessonsFromFirestore, saveLessonToFirestore, deleteLessonFromFirestore } from '@/lib/firestoreService';
import { isFirebaseConfigured } from '@/lib/firebase';
import { adminAuthErrorMessage } from '@/lib/firebaseAuth';
import { Lesson, GradeLevel } from '@/lib/types';
import { 
  Video, 
  PlusCircle, 
  Trash2, 
  Edit3, 
  Check, 
  AlertCircle, 
  FileText, 
  ExternalLink,
  Sparkles,
  Play,
  Loader2,
  XCircle
} from 'lucide-react';

export default function AdminLessonsPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [grade, setGrade] = useState<GradeLevel>('first_secondary_general');

  const [month, setMonth] = useState('شهر أكتوبر');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    loadLessons();
  }, []);

  const loadLessons = async () => {
    setPageLoading(true);
    try {
      if (isFirebaseConfigured()) {
        const remoteLessons = await getLessonsFromFirestore();
        setLessons(remoteLessons);
      } else {
        setLessons(getLessons());
      }
    } catch (err) {
      setLessons(getLessons()); // fallback to localStorage
    } finally {
      setPageLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setTitle('');
    setDescription('');
    setGrade('first_secondary_general');

    setMonth('شهر أكتوبر');
    setYoutubeUrl('');
    setPdfUrl('');
    setEditingId(null);
    setIsAdding(true);
  };

  const handleEdit = (lesson: Lesson) => {
    setTitle(lesson.title);
    setDescription(lesson.description);
    setGrade(lesson.grade);

    setMonth(lesson.month);
    setYoutubeUrl(`https://youtu.be/${lesson.youtubeVideoId}`);
    setPdfUrl(lesson.pdfAttachmentUrl || '');
    setEditingId(lesson.id);
    setIsAdding(true);
  };

  const handleDelete = async (id: string, lessonTitle: string) => {
    if (confirm(`هل أنت متأكد من حذف درس "${lessonTitle}"؟`)) {
      setSaving(true);
      try {
        if (isFirebaseConfigured()) {
          await deleteLessonFromFirestore(id);
        } else {
          deleteLesson(id);
        }
        await loadLessons();
        setNotice('تم حذف الدرس بنجاح.');
        setTimeout(() => setNotice(null), 3000);
      } catch (err) {
        setSaveError('فشل حذف الدرس من قاعدة البيانات.');
      } finally {
        setSaving(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    const videoId = extractYoutubeId(youtubeUrl);

    if (!videoId) {
      alert('يرجى إدخال رابط يوتيوب صحيح (Unlisted Video Link).');
      return;
    }

    setSaving(true);
    try {
      if (isFirebaseConfigured()) {
        // Build lesson object manually so we can await Firestore
        const existingLesson = editingId ? lessons.find(l => l.id === editingId) : null;
        const lessonToSave: Lesson = {
          id: editingId || ('les_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6)),
          title: title.trim(),
          description: description.trim(),
          grade,
          month: month.trim(),
          youtubeVideoId: videoId,
          pdfAttachmentUrl: pdfUrl.trim() || undefined,
          orderIndex: existingLesson?.orderIndex ?? (lessons.length + 1),
          createdAt: existingLesson?.createdAt ?? new Date().toISOString(),
        };

        const success = await saveLessonToFirestore(lessonToSave);
        if (!success) {
          setSaveError('❌ فشل الحفظ في قاعدة البيانات. تأكد من:\n1. تسجيل خروجك ودخولك كأدمن مرة أخرى\n2. إن الـ Firestore Rules مطبقة صح');
          setSaving(false);
          return;
        }
      } else {
        // Fallback to localStorage if Firebase not configured
        saveLesson({
          title: title.trim(),
          description: description.trim(),
          grade,
          month: month.trim(),
          youtubeVideoId: videoId,
          pdfAttachmentUrl: pdfUrl.trim() || undefined,
          orderIndex: lessons.length + 1,
        }, editingId || undefined);
      }

setIsAdding(false);
      setEditingId(null);
      await loadLessons();
      setNotice(editingId ? 'تم تعديل بيانات المحاضرة بنجاح. ✅' : 'تم إضافة المحاضرة بنجاح وحُفظت في قاعدة البيانات. ✅');
      setTimeout(() => setNotice(null), 5000);
    } catch (err: any) {
      if (typeof err?.message === 'string' && err.message.startsWith('auth/')) {
        setSaveError(adminAuthErrorMessage(err.message));
      } else {
        setSaveError('حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.');
      }
    } finally {
      setSaving(false);
    }
  };

  const previewId = extractYoutubeId(youtubeUrl);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">إدارة محاضرات وفيديوهات اليوتيوب</h1>
          <p className="text-xs text-slate-500 mt-1">
            أضف روابط محاضرات يوتيوب غير المدرجة (Unlisted) لتظهر حصرياً داخل مشغل المنصة المحمي.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-all self-start"
        >
          <PlusCircle className="w-4 h-4" />
          <span>إضافة محاضرة جديدة</span>
        </button>
      </div>

      {notice && (
        <div className="p-3.5 bg-emerald-100 border border-emerald-300 text-emerald-950 font-bold rounded-xl text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-700" />
          <span>{notice}</span>
        </div>
      )}

      {saveError && (
        <div className="p-3.5 bg-red-50 border border-red-300 text-red-800 font-bold rounded-xl text-xs flex items-start gap-2">
          <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <span style={{ whiteSpace: 'pre-line' }}>{saveError}</span>
        </div>
      )}

      {/* Add / Edit Form Modal or Card */}
      {isAdding && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border-2 border-emerald-700/40 space-y-5">
          <div className="flex items-center justify-between border-b pb-3">
            <h2 className="text-lg font-black text-slate-900">
              {editingId ? 'تعديل بيانات المحاضرة' : 'إضافة محاضرة جديدة للمنصة'}
            </h2>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-xs font-bold text-slate-400 hover:text-slate-600"
            >
              إلغاء
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">عنوان المحاضرة</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: مدخل إلى البرمجة والخوارزميات (المحاضرة 1)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الشهر أو الوحدة الدراسية</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: شهر أكتوبر / الوحدة الأولى"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                </select>
              </div>


            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                رابط فيديو يوتيوب (Unlisted YouTube Link أو معرف الفيديو)
              </label>
              <input
                type="text"
                required
                dir="ltr"
                placeholder="https://youtu.be/xxxxxx أو https://youtube.com/watch?v=xxxxxx"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono text-left focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                * ملاحظة هامة: اضبط حالة الفيديو على قناتك كـ <strong>Unlisted (غير مدرج)</strong> حتى لا يظهر في نتائج بحث يوتيوب العامة، وسيقوم نظام المنصة بحمايته وتضمينه للطلاب فقط.
              </p>
            </div>

            {/* Live Video Preview if valid ID */}
            {previewId && (
              <div className="p-3 bg-slate-900 rounded-2xl">
                <span className="text-[11px] font-bold text-gold-400 block mb-2">معاينة مشغل الفيديو:</span>
                <div className="aspect-video w-full max-w-sm mx-auto rounded-xl overflow-hidden border border-slate-700">
                  <iframe
                    className="w-full h-full border-0"
                    src={`https://www.youtube-nocookie.com/embed/${previewId}?modestbranding=1`}
                    title="معاينة"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                رابط مذكرة الشرح أو ملخص PDF (اختياري)
              </label>
              <input
                type="url"
                dir="ltr"
                placeholder="https://drive.google.com/... أو رابط مباشر للملف"
                value={pdfUrl}
                onChange={(e) => setPdfUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono text-left focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">وصف المحاضرة وتوجيهات المذاكرة</label>
              <textarea
                rows={3}
                placeholder="اكتب النقاط الرئيسية للمحاضرة أو التنبيهات للطلاب..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                className="px-6 py-3 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>{editingId ? 'حفظ التعديلات' : 'نشر المحاضرة'}</span>
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

      {/* Lessons Table / List */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        {lessons.length === 0 ? (
          <div className="py-16 text-center text-slate-500 space-y-3">
            <Video className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="font-bold text-slate-800">لا توجد أي محاضرات مضافة حتى الآن</p>
            <p className="text-xs max-w-sm mx-auto">
              المنصة نظيفة من أي بيانات وهمية. اضغط على زر <strong>"إضافة محاضرة جديدة"</strong> بالأعلى لوضع أول فيديو يوتيوب حقيقي لطلابك.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {lessons.map((les) => (
              <div key={les.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                    <Play className="w-5 h-5 fill-emerald-800" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-slate-900">{les.title}</h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {les.month}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">{les.description || 'لا يوجد وصف'}</p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-2 font-mono">
                      <span>{GRADE_LABELS[les.grade]}</span>
                      <span>•</span>
                      <span>YouTube ID: {les.youtubeVideoId}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center">
                  <button
                    type="button"
                    onClick={() => handleEdit(les)}
                    className="p-2 text-slate-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-xl transition-colors"
                    title="تعديل"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(les.id, les.title)}
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
