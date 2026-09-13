"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  getCurrentStudent,
  GRADE_LABELS,
  normalizeGrade
} from '@/lib/storage';
import { Student, ForumPost, GradeLevel } from '@/lib/types';
import {
  subscribePublishedPosts,
  subscribeMyPosts,
  createForumPost,
  ensureForumAuth
} from '@/lib/forumService';
import { isFirebaseConfigured } from '@/lib/firebase';
import { formatTimeAgo, forumErrorMessage } from '@/lib/forumUtils';
import {
  MessagesSquare,
  MessageCircleQuestion,
  Send,
  Loader2,
  Search,
  Pin,
  Clock,
  CheckCircle2,
  XCircle,
  Lock,
  Inbox,
  AlertCircle
} from 'lucide-react';

const AVAILABLE_GRADES: GradeLevel[] = [
  'first_secondary_general',
  'first_secondary_bac',
  'second_secondary_general',
  'second_secondary_bac',
];

function statusBadge(post: ForumPost) {
  if (post.status === 'pending') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-300 text-amber-700 text-[11px] font-bold">
        <Clock className="w-3 h-3" /> قيد المراجعة
      </span>
    );
  }
  if (post.status === 'rejected') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 border border-red-300 text-red-700 text-[11px] font-bold">
        <XCircle className="w-3 h-3" /> مرفوض
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 border border-green-300 text-green-700 text-[11px] font-bold">
      <CheckCircle2 className="w-3 h-3" /> منشور
    </span>
  );
}

export default function StudentForumPage() {
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel>('first_secondary_general');
  const [tab, setTab] = useState<'forum' | 'mine'>('forum');
  const [published, setPublished] = useState<ForumPost[]>([]);
  const [myPosts, setMyPosts] = useState<ForumPost[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [authReady, setAuthReady] = useState(false);
  const [error, setError] = useState('');

  // Composer state
  const [composerOpen, setComposerOpen] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [sending, setSending] = useState(false);
  const [sentOk, setSentOk] = useState(false);

  useEffect(() => {
    const s = getCurrentStudent();
    if (!s) {
      router.push('/login');
      return;
    }
    const norm = normalizeGrade(s.grade);
    if (s.grade !== norm) {
      s.grade = norm;
    }
    setStudent(s);
    setSelectedGrade(norm);
    setLoading(true);
    if (isFirebaseConfigured()) {
      ensureForumAuth().finally(() => setAuthReady(true));
    } else {
      setAuthReady(true);
    }
  }, [router]);

  // Live subscription: published posts of selected grade
  useEffect(() => {
    if (!student || !authReady) return;
    if (!isFirebaseConfigured()) {
      setLoading(false);
      return;
    }
    const unsub = subscribePublishedPosts(
      selectedGrade,
      (posts) => {
        setPublished(posts);
        setLoading(false);
      },
      (err) => {
        if ((err?.code || '').includes('permission-denied')) {
          ensureForumAuth().finally(() => {
            setError(forumErrorMessage(err));
            setLoading(false);
          });
        } else {
          setError(forumErrorMessage(err));
          setLoading(false);
        }
      }
    );
    return () => unsub();
  }, [student, selectedGrade, authReady]);

  // Live subscription: my own posts (any status)
  useEffect(() => {
    if (!student || !authReady) return;
    if (!isFirebaseConfigured()) return;
    const unsub = subscribeMyPosts(student.id, setMyPosts, () => {});
    return () => unsub();
  }, [student, authReady]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!student) return;
    if (!postTitle.trim() || !postContent.trim()) {
      setError('اكتب عنوان السؤال وتفاصيله بالكامل.');
      return;
    }
    setSending(true);
    const res = await createForumPost({
      title: postTitle,
      content: postContent,
      grade: selectedGrade,
      author: { studentId: student.id, name: student.name, phone: student.phone },
    });
    setSending(false);
    if (res.success) {
      setSentOk(true);
      setPostTitle('');
      setPostContent('');
      setComposerOpen(false);
      setTimeout(() => setSentOk(false), 6000);
    } else {
      setError(res.error || 'فشل إرسال السؤال.');
    }
  };

  if (!student) return null;

  const isActivated = student.subscription.isActive || student.subscription.unlockedLessons?.length;
  const filteredPublished = search.trim()
    ? published.filter(
        (p) =>
          p.title.includes(search.trim()) ||
          p.content.includes(search.trim()) ||
          p.authorName.includes(search.trim())
      )
    : published;

  return (
    <div className="bg-gray-50 min-h-screen py-6 sm:py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">

        {/* Header */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
                <MessagesSquare className="w-6 h-6 text-green-800" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-black text-gray-900">منتدى الأسئلة والنقاش</h1>
                <p className="text-xs text-gray-500 mt-0.5">
                  اسأل عن أي نقطة صعبة — سؤالُك يُنشر بعد مراجعة المدرس ويستطيع الجميع التعليق عليه مباشرة.
                </p>
              </div>
            </div>
            {isActivated ? (
              <button
                onClick={() => setComposerOpen(!composerOpen)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-white text-xs sm:text-sm font-bold rounded-xl transition-all hover:-translate-y-0.5 shadow-sm shrink-0"
                style={{ background: '#1B4332' }}
              >
                <MessageCircleQuestion className="w-4 h-4" />
                {composerOpen ? 'إغلاق' : 'اسأل سؤالاً جديداً'}
              </button>
            ) : (
              <Link
                href="/dashboard/subscription"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-50 border border-amber-300 text-amber-800 text-xs font-bold rounded-xl shrink-0"
              >
                <Lock className="w-4 h-4" /> المنتدى للمشتركين فقط
              </Link>
            )}
          </div>

          {/* Not activated notice */}
          {!isActivated && (
            <div className="mt-4 p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-800">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p>
                أعضاء المنتدى هم الطلاب الذي فُعّلت اشتراكاتهم. فعّل اشتراكك بالتواصل مع المدرس أو باستخدام كود التفعيل
                من صفحة <Link href="/dashboard/subscription" className="font-bold underline">الاشتراك والتفعيل</Link>.
              </p>
            </div>
          )}

          {sentOk && (
            <div className="mt-4 p-3.5 bg-green-50 border border-green-300 rounded-xl flex items-center gap-2.5 text-xs text-green-800 font-bold">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-green-600" />
              تم إرسال سؤالك بنجاح! الآن هو قيد مراجعة المدرس وسيظهر فور الموافقة عليه.
            </div>
          )}

          {composerOpen && isActivated && (
            <form onSubmit={handleSubmit} className="mt-5 p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">عنوان السؤال</label>
                <input
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  placeholder="مثال: استفسار عن درس الـ Variables في المحاضرة الثانية"
                  maxLength={120}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">تفاصيل السؤال</label>
                <textarea
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="اشرح السؤال بتفصيل حتى تساعد المدرس وزملاءك على الإجابة بدقة…"
                  rows={4}
                  maxLength={2000}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 resize-none"
                />
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] text-gray-400">
                  يُرسل إلى المدرس للمراجعة قبل النشر، وسيظهر في منتدى صفّك.
                </span>
                <button
                  type="submit"
                  disabled={sending}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-white text-xs font-bold rounded-xl disabled:opacity-60 transition-all hover:-translate-y-0.5 shadow-sm"
                  style={{ background: '#1B4332' }}
                >
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {sending ? 'جاري الإرسال...' : 'إرسال السؤال'}
                </button>
              </div>
            </form>
          )}
        </div>

        {!isFirebaseConfigured() && (
          <div className="bg-amber-50 border border-amber-300 p-4 rounded-2xl flex items-center gap-3 text-xs text-amber-800">
            <AlertCircle className="w-5 h-5 shrink-0 text-amber-600" />
            لم تُفعّل قاعدة بيانات Firebase السحابية بعد، لذا المنتدى غير متاح حالياً. اطلب من المدرس تفعيلها من لوحة التحكم.
          </div>
        )}

        {/* Grade tabs + Search */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-gray-500">منتدى الصف:</span>
            {AVAILABLE_GRADES.map((g) => (
              <button
                key={g}
                onClick={() => setSelectedGrade(g)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedGrade === g
                    ? 'bg-green-800 text-white shadow-sm'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                }`}
              >
                {GRADE_LABELS[g].replace('الصف الأول الثانوي (', '').replace('الصف الثاني الثانوي (', '').replace(')', '')}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute right-3.5 top-3" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث في أسئلة وأجوبة المنتدى…"
              className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-gray-300 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 border-b border-gray-200 pb-3">
          <button
            onClick={() => setTab('forum')}
            className={`px-3.5 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all ${
              tab === 'forum' ? 'bg-green-800 text-white shadow-sm' : 'text-gray-600 border border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <MessagesSquare className="w-4 h-4" />
              أسئلة الصف ({published.length})
            </span>
          </button>
          <button
            onClick={() => setTab('mine')}
            className={`px-3.5 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all ${
              tab === 'mine' ? 'bg-green-800 text-white shadow-sm' : 'text-gray-600 border border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <MessageCircleQuestion className="w-4 h-4" />
              أسئلتي ({myPosts.length})
            </span>
          </button>
          <span className="text-[11px] text-gray-400 mr-auto">{GRADE_LABELS[selectedGrade]}</span>
        </div>

        {/* Content */}
        {loading && tab === 'forum' ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
            <Loader2 className="w-8 h-8 text-green-600 animate-spin mx-auto mb-3" />
            <p className="text-xs text-gray-500">جاري تحميل المناقشات…</p>
          </div>
        ) : error ? (
          <div className="bg-white border border-red-200 rounded-2xl p-10 text-center">
            <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-gray-700">تعذر الاتصال بالمنتدى</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto leading-relaxed">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white text-xs font-bold shadow-sm"
              style={{ background: '#1B4332' }}
            >
              إعادة المحاولة
            </button>
          </div>
        ) : tab === 'forum' ? (
          filteredPublished.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
              <Inbox className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-gray-700">{search ? 'لا نتائج مطابقة لبحثك' : 'لا توجد أسئلة بعد'}</h3>
              <p className="text-xs text-gray-400 mt-1">
                {search ? 'جرّب كلمات أخرى.' : 'كن أول من يطرح سؤالاً في منتدى هذا الصف، وسيرد عليه المدرس مباشرة.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPublished.map((post) => (
                <Link
                  key={post.id}
                  href={`/forum/post/${post.id}`}
                  className="block bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-green-300 transition-all"
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-2">
                      {post.pinned ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-800 text-white text-[11px] font-bold">
                          <Pin className="w-3 h-3" /> مثبّت
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-[11px] text-gray-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                          {post.authorRole === 'teacher' ? 'المدرس' : post.authorName}
                        </span>
                      )}
                      <span className="text-[11px] text-gray-400">{formatTimeAgo(post.createdAt)}</span>
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-gray-900 leading-snug line-clamp-1">{post.title}</h3>
                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{post.content}</p>
                    <div className="flex items-center gap-3 text-[11px] text-gray-400 mt-1">
                      <span className="inline-flex items-center gap-1">
                        <MessagesSquare className="w-3 h-3" /> {post.replyCount || 0} رد
                      </span>
                      {post.authorRole === 'teacher' && (
                        <span className="text-green-700 font-bold">إجابة المدرس</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )
        ) : tab === 'mine' ? (
          myPosts.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
              <Inbox className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-gray-700">لم تطرح أي سؤال بعد</h3>
              <p className="text-xs text-gray-400 mt-1">اسأل سؤالاً وسيظهر هنا فور مراجعته.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/forum/post/${post.id}`}
                  className="block bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-2">
                      {statusBadge(post)}
                      <span className="text-[11px] text-gray-400">{GRADE_LABELS[post.grade]} · {formatTimeAgo(post.createdAt)}</span>
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-gray-900 line-clamp-1">{post.title}</h3>
                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{post.content}</p>
                    {post.status === 'rejected' && post.rejectionReason && (
                      <div className="mt-1 p-2.5 bg-red-50 border border-red-200 rounded-xl text-[11px] text-red-700">
                        <span className="font-bold">سبب الرفض: </span>{post.rejectionReason}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )
        ) : null}
      </div>
    </div>
  );
}