"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import {
  getCurrentStudent,
  GRADE_LABELS,
  normalizeGrade
} from '@/lib/storage';
import { Student, ForumPost, ForumReply, StudentMute } from '@/lib/types';
import {
  subscribePost,
  subscribePostReplies,
  addForumReply,
  setPostResolved,
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
  AlertCircle,
  CheckCheck,
  BookOpen,
  AudioLines
} from 'lucide-react';
import { formatTimeAgo, forumErrorMessage, forumTopicLabel } from '@/lib/forumUtils';
import { subscribeStudentMute, isStudentMuted, formatMuteUntil } from '@/lib/muteService';
import ForumImageUploader from '@/components/ForumImageUploader';
import VoiceRecorder from '@/components/VoiceRecorder';
import StaffIdentityBadge from '@/components/StaffIdentityBadge';
import StudentAvatar from '@/components/StudentAvatar';

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
  const [replyImages, setReplyImages] = useState<string[]>([]);
  const [replyAudio, setReplyAudio] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [error, setError] = useState('');
  const [myMute, setMyMute] = useState<StudentMute | null>(null);

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

  // Own mute status (blocks replying + posting while active)
  useEffect(() => {
    if (!student?.id || !authReady) return;
    if (!isFirebaseConfigured()) return;
    const unsub = subscribeStudentMute(student.id, setMyMute, () => {});
    return () => unsub();
  }, [student?.id, authReady]);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!student || !post) return;
    const hasText = replyText.trim();
    if (!hasText && !replyAudio) {
      setError('اكتب ردّك أو سجّل رسالة صوتية أولاً.');
      return;
    }
    setSending(true);
    const res = await addForumReply({
      postId: post.id,
      content: hasText ? replyText : 'رسالة صوتية',
      author: { studentId: student.id, name: student.name, phone: student.phone, photoUrl: student.photoUrl },
      imageUrls: replyImages,
      audioUrl: replyAudio || undefined,
    });
    setSending(false);
    if (res.success) {
      setReplyText('');
      setReplyImages([]);
      setReplyAudio(null);
    } else {
      setError(res.error || 'فشل إرسال الرد.');
    }
  };

  const handleResolve = async () => {
    if (!post || !student) return;
    setError('');
    setResolving(true);
    const res = await setPostResolved(post.id, !post.resolved, { authorStudentId: student.id });
    setResolving(false);
    if (!res.success) setError(res.error || 'فشل تحديث حالة السؤال.');
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
            {post.resolved && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[11px] font-black">
                <CheckCheck className="w-3 h-3" /> تم الحل
              </span>
            )}
            {post.topic && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-bold">
                {forumTopicLabel(post.topic)}
              </span>
            )}
            {post.lessonId && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 border border-green-200 text-green-800 text-[11px] font-bold">
                <BookOpen className="w-3 h-3" /> مرتبط بدرس
              </span>
            )}
            {post.authorRole && post.authorRole !== 'student' ? (
              <StaffIdentityBadge role={post.authorRole} name={post.authorName} />
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-50 text-green-800 border border-green-200 text-[11px] font-bold">
                <StudentAvatar name={post.authorName} photoUrl={post.authorPhotoUrl} className="w-5 h-5" textClass="text-[10px]" />
                {post.authorName}
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

          {post.imageUrls && post.imageUrls.length > 0 && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
              {post.imageUrls.map((url) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={url} src={url} alt="" className="w-full h-40 object-cover rounded-xl border border-gray-200" />
              ))}
            </div>
          )}

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

          {isAuthor && post.status === 'published' && (
            <div className="mt-4 pt-3.5 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-[11px] text-gray-500">
                {post.resolved
                  ? 'سؤالك عليه علامة "تم الحل". يمكنك إلغاؤها إذا ظهرت عليه إجابة جديدة.'
                  : 'بعدما تكون استفدت من الإجابات، أخبر زملاءك بوضع علامة "تم الحل" على سؤالك.'}
              </span>
              <button
                onClick={handleResolve}
                disabled={resolving}
                className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] font-black shrink-0 transition-colors cursor-pointer ${
                  post.resolved
                    ? 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                } disabled:opacity-50`}
              >
                {resolving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : post.resolved ? <XCircle className="w-3.5 h-3.5" /> : <CheckCheck className="w-3.5 h-3.5" />}
                {post.resolved ? 'إلغاء تم الحل' : 'تحديد كـ تم الحل'}
              </button>
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
              {[...replies]
                .sort((a, b) => {
                  const aStaff = a.authorRole && a.authorRole !== 'student' ? 1 : 0;
                  const bStaff = b.authorRole && b.authorRole !== 'student' ? 1 : 0;
                  if (aStaff !== bStaff) return bStaff - aStaff;
                  return a.createdAt < b.createdAt ? -1 : a.createdAt > b.createdAt ? 1 : 0;
                })
                .map((reply, idx) => {
                const isStaffReply = reply.authorRole && reply.authorRole !== 'student';
                return (
                  <div
                    key={reply.id}
                    className={`p-3.5 sm:p-4 rounded-xl border ${
                      isStaffReply
                        ? 'bg-green-50 border-green-300'
                        : idx % 2 === 0
                        ? 'bg-gray-50 border-gray-200'
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      {reply.authorRole !== 'student' ? (
                        <>
                          <StudentAvatar name={reply.authorName} className="w-5 h-5" textClass="text-[10px]" />
                          <StaffIdentityBadge role={reply.authorRole} name={reply.authorName} />
                        </>
                      ) : (
                        <>
                          <StudentAvatar name={reply.authorName} photoUrl={reply.authorPhotoUrl} className="w-5 h-5" textClass="text-[10px]" />
                          <span className="text-[11px] font-bold text-gray-700">{reply.authorName}</span>
                        </>
                      )}
                      <span className="w-1 h-1 rounded-full bg-gray-300" />
                      <span className="text-[10px] text-gray-400">{formatTimeAgo(reply.createdAt)}</span>
                    </div>
<p className="text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{reply.content}</p>
                      {reply.imageUrls && reply.imageUrls.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {reply.imageUrls.map((url) => (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img key={url} src={url} alt="" className="w-24 h-24 rounded-xl object-cover border border-gray-200" />
                          ))}
                        </div>
                      )}
                      {reply.audioUrl && (
                        <div className="flex items-center gap-2 mt-2.5">
                          <AudioLines className="w-4 h-4 text-green-700 shrink-0" />
                          <audio controls src={reply.audioUrl} preload="metadata" className="h-8 w-64 max-w-full rounded-xl bg-gray-50" />
                        </div>
                      )}
                    </div>
                );
              })}
            </div>
          )}

          {/* Reply box */}
          {isStudentMuted(myMute) ? (
            <div className="mt-5 pt-4 border-t border-gray-100 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-800">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">تم تقييد مشاركتك في المنتدى مؤقتاً {formatMuteUntil(myMute!.until)}</p>
                {myMute?.reason && <p className="mt-1 text-red-700">السبب: {myMute.reason}</p>}
                <p className="mt-1 text-red-600">يمكنك تصفح الأسئلة والردود، لكن لا يمكنك إرسال أسئلة أو ردود جديدة حتى ينتهي التقييد.</p>
              </div>
            </div>
          ) : canReply ? (
            <form onSubmit={handleReply} className="mt-5 pt-4 border-t border-gray-100 space-y-3">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                </div>
              )}
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="اكتب ردّك أو إجابتك على السؤال… (يُنشر فوراً)"
                rows={3}
                maxLength={1000}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 resize-none"
              />
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] text-gray-400">ردود الطلاب تُنشر فوراً بدون انتظار موافقة المدرس.</span>
                <div className="flex flex-wrap items-center gap-3">
                  <VoiceRecorder url={replyAudio} onChange={setReplyAudio} />
                  <ForumImageUploader urls={replyImages} onChange={setReplyImages} max={3} />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2">
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