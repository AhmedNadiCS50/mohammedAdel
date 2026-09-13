"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import {
  getCurrentStudent,
  GRADE_LABELS,
  normalizeGrade
} from '@/lib/storage';
import { Student, ForumPost, ForumReply } from '@/lib/types';
import {
  subscribePost,
  subscribePostReplies,
  addForumReply,
  ensureForumAuth
} from '@/lib/forumService';
import { isFirebaseConfigured } from '@/lib/firebase';
import {
  ArrowRight,
  MessagesSquare,
  Send,
  Loader2,
  Pin,
  Clock,
  CheckCircle2,
  XCircle,
  Lock,
  GraduationCap,
  AlertCircle
} from 'lucide-react';
import { formatTimeAgo, forumErrorMessage } from '@/lib/forumUtils';

export default function ForumPostPage() {
  const router = useRouter();
  const params = useParams();
  const postId = typeof params?.id === 'string' ? params.id : '';

  const [student, setStudent] = useState<Student | null>(null);
  const [post, setPost] = useState<ForumPost | null>(null);
  const [replies, setReplies] = useState<ForumReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const s = getCurrentStudent();
    if (!s) {
      router.push('/login');
      return;
    }
    const norm = normalizeGrade(s.grade);
    if (s.grade !== norm) s.grade = norm;
    setStudent(s);
    if (isFirebaseConfigured()) {
      ensureForumAuth().finally(() => setAuthReady(true));
    } else {
      setAuthReady(true);
    }
  }, [router]);

  // Live post doc
  useEffect(() => {
    if (!postId || !authReady) return;
    if (!isFirebaseConfigured()) {
      setLoading(false);
      return;
    }
    const unsub = subscribePost(
      postId,
      (p) => {
        setPost(p);
        setLoading(false);
        if (!p) setNotFound(true);
        else if (student && p.grade !== student.grade) setNotFound(true);
      },
      (err) => {
        if ((err?.code || '').includes('permission-denied')) {
          ensureForumAuth().finally(() => setError(forumErrorMessage(err)));
        } else {
          setNotFound(true);
        }
        setLoading(false);
      }
    );
    return () => unsub();
  }, [postId, authReady, student]);

  // Live replies
  useEffect(() => {
    if (!postId || !authReady) return;
    if (!isFirebaseConfigured()) return;
    const unsub = subscribePostReplies(postId, false, setReplies, () => {});
    return () => unsub();
  }, [postId, authReady]);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!student || !post) return;
    if (!replyText.trim()) {
      setError('اكتب ردّك أولاً.');
      return;
    }
    setSending(true);
    const res = await addForumReply({
      postId: post.id,
      content: replyText,
      author: { studentId: student.id, name: student.name, phone: student.phone },
    });
    setSending(false);
    if (res.success) {
      setReplyText('');
    } else {
      setError(res.error || 'فشل إرسال الرد.');
    }
  };

  if (!student || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-green-600 animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500 font-medium">جاري تحميل السؤال…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md bg-white border border-red-200 rounded-2xl p-10">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-800">تعذر الاتصال بالسؤال</h3>
          <p className="text-xs text-gray-500 mt-2 leading-relaxed">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white text-xs font-bold shadow-sm"
            style={{ background: '#1B4332' }}
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-sm bg-white border border-gray-200 rounded-2xl p-10">
          <XCircle className="w-10 h-10 text-red-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-800">السؤال غير موجود</h3>
          <p className="text-xs text-gray-500 mt-1">ربما تم حذفه من قبل المدرس.</p>
          <Link href="/forum" className="inline-block mt-4 text-xs font-bold text-green-800 hover:underline">
            العودة إلى المنتدى
          </Link>
        </div>
      </div>
    );
  }

  const isAuthor = post.authorStudentId === student.id;
  const canRead = post.status === 'published' || isAuthor;
  const canReply = canRead && (student.subscription.isActive || !!student.subscription.unlockedLessons?.length);

  if (!canRead) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-sm bg-white border border-gray-200 rounded-2xl p-10">
          <Lock className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-800">هذا السؤال غير منشور بعد</h3>
          <p className="text-xs text-gray-500 mt-1">عندما يوافق عليه المدرس سيكون مرئياً لك.</p>
          <Link href="/forum" className="inline-block mt-4 text-xs font-bold text-green-800 hover:underline">
            العودة إلى المنتدى
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-6 sm:py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
        <Link href="/forum" className="inline-flex items-center gap-1.5 text-xs font-bold text-green-800 hover:underline">
          <ArrowRight className="w-3.5 h-3.5" /> العودة إلى المنتدى
        </Link>

        {/* Post Card */}
        <article className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-sm">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {post.pinned && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-800 text-white text-[11px] font-bold">
                <Pin className="w-3 h-3" /> مثبّت
              </span>
            )}
            {post.authorRole === 'teacher' ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-800 border border-green-300 text-[11px] font-bold">
                <GraduationCap className="w-3 h-3" /> منشور بواسطة المدرس
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-50 text-green-800 border border-green-200 text-[11px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-green-600" /> {post.authorName}
              </span>
            )}
            {post.status === 'pending' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-300 text-amber-700 text-[11px] font-bold">
                <Clock className="w-3 h-3" /> قيد المراجعة
              </span>
            )}
            {post.status === 'rejected' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 border border-red-300 text-red-700 text-[11px] font-bold">
                <XCircle className="w-3 h-3" /> مرفوض
              </span>
            )}
            <span className="text-[11px] text-gray-400 mr-auto">{GRADE_LABELS[post.grade]} · {formatTimeAgo(post.createdAt)}</span>
          </div>

          <h1 className="text-base sm:text-lg font-black text-gray-900 leading-snug">{post.title}</h1>
          <p className="text-sm text-gray-600 leading-relaxed mt-3 whitespace-pre-wrap">{post.content}</p>

          {post.status === 'rejected' && post.rejectionReason && (
            <div className="mt-4 p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
              <span className="font-bold">السبب: </span>{post.rejectionReason}
            </div>
          )}
          {post.status === 'pending' && isAuthor && (
            <div className="mt-4 p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-800">
              <Clock className="w-4 h-4 shrink-0 mt-0.5" />
              سؤالك الآن بانتظار مراجعة المدرس. سيظهر للجميع فور الموافقة عليه.
            </div>
          )}
        </article>

        {/* Replies Section */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <MessagesSquare className="w-4 h-4 text-green-800" />
            <h2 className="text-sm font-black text-gray-900">الردود ({replies.length})</h2>
          </div>

          {replies.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-6">
              لا توجد ردود بعد. كن أول من يشارك بالنقاش.
            </p>
          ) : (
            <div className="space-y-3">
              {replies.map((reply, idx) => {
                const isTeacherReply = reply.authorRole === 'teacher';
                return (
                  <div
                    key={reply.id}
                    className={`p-3.5 sm:p-4 rounded-xl border ${
                      isTeacherReply
                        ? 'bg-green-50 border-green-300'
                        : idx % 2 === 0
                        ? 'bg-gray-50 border-gray-200'
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      {isTeacherReply ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-black text-green-800">
                          <GraduationCap className="w-3.5 h-3.5" /> إجابة المدرس
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-gray-700">{reply.authorName}</span>
                      )}
                      <span className="w-1 h-1 rounded-full bg-gray-300" />
                      <span className="text-[10px] text-gray-400">{formatTimeAgo(reply.createdAt)}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{reply.content}</p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Reply box */}
          {canReply ? (
            <form onSubmit={handleReply} className="mt-5 pt-4 border-t border-gray-100 space-y-3">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                </div>
              )}
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="اكتب ردّك أو إجابتك على السؤال… (يُرسل للمراجعة قبل النشر)"
                rows={3}
                maxLength={1000}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 resize-none"
              />
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] text-gray-400">ردود الطلاب تُنشر بعد موافقة المدرس.</span>
                <button
                  type="submit"
                  disabled={sending}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-white text-xs font-bold rounded-xl disabled:opacity-60 transition-all hover:-translate-y-0.5 shadow-sm"
                  style={{ background: '#1B4332' }}
                >
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {sending ? 'جاري الإرسال…' : 'إرسال الرد'}
                </button>
              </div>
            </form>
          ) : (
            <div className="mt-5 pt-4 border-t border-gray-100 p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2.5 text-xs text-amber-800">
              <Lock className="w-4 h-4 shrink-0" />
              <span>التعليق متاح للطلاب المشتركين فقط.{!isAuthor && post.status === 'pending' ? ' هذا السؤال سيكون متاحاً بعد نشره.' : ''}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}