"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  subscribeAllPosts,
  subscribePendingReplies,
  setPostStatus,
  togglePostPin,
  deleteForumPost,
  setReplyStatus,
  deleteForumReply,
  addForumReply,
  setPostResolved,
  ensureForumAuth
} from '@/lib/forumService';
import { GRADE_LABELS } from '@/lib/storage';
import { ForumPost, ForumReply } from '@/lib/types';
import { isFirebaseConfigured } from '@/lib/firebase';
import { formatTimeAgo, forumErrorMessage, forumTopicLabel } from '@/lib/forumUtils';
import {
  MessagesSquare,
  CheckCircle2,
  XCircle,
  Trash2,
  Pin,
  PinOff,
  Send,
  Loader2,
  Inbox,
  AlertCircle,
  ExternalLink,
  CheckCheck
} from 'lucide-react';

export default function AdminForumPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [pendingReplies, setPendingReplies] = useState<ForumReply[]>([]);
  const [tab, setTab] = useState<'review' | 'published'>('review');
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [busyId, setBusyId] = useState('');
  const [actionMsg, setActionMsg] = useState('');
  const [teacherReply, setTeacherReply] = useState<Record<string, string>>({});
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setLoading(false);
      setError('لم تُفعّل قاعدة بيانات Firebase السحابية. المنتدى يتطلب قاعدة Firestore.');
      return;
    }
    ensureForumAuth();
    const unsubPosts = subscribeAllPosts(
      (list) => {
        setPosts(list);
        setLoading(false);
      },
      (err) => {
        setError(forumErrorMessage(err));
        setLoading(false);
      }
    );
    const unsubReplies = subscribePendingReplies(setPendingReplies, () => {});
    return () => {
      unsubPosts();
      unsubReplies();
    };
  }, []);

  const pendingPosts = posts.filter((p) => p.status === 'pending');
  const publishedPosts = posts.filter((p) => p.status === 'published');

  const flash = (msg: string) => {
    setActionMsg(msg);
    setTimeout(() => setActionMsg(''), 4000);
  };

  const handleApprovePost = async (post: ForumPost) => {
    setBusyId(post.id);
    const res = await setPostStatus(post.id, 'published');
    setBusyId('');
    flash(res.success ? 'تم نشر السؤال في المنتدى.' : res.error || 'فشل النشر.');
  };

  const handleRejectPost = async (post: ForumPost) => {
    const reason = rejectReason.trim();
    if (rejectingId !== post.id) {
      setRejectingId(post.id);
      setRejectReason('');
      return;
    }
    if (!reason) return;
    setBusyId(post.id);
    const res = await setPostStatus(post.id, 'rejected', reason);
    setBusyId('');
    setRejectingId(null);
    setRejectReason('');
    flash(res.success ? 'تم رفض السؤال وإرسال السبب للطالب.' : res.error || 'فشل الرفض.');
  };

  const handlePinToggle = async (post: ForumPost) => {
    setBusyId(post.id);
    await togglePostPin(post.id, !post.pinned);
    setBusyId('');
  };

  const handleResolveToggle = async (post: ForumPost) => {
    setBusyId(post.id);
    const res = await setPostResolved(post.id, !post.resolved, { asTeacher: true });
    setBusyId('');
    if (!res.success) flash(res.error || 'فشل تحديث حالة السؤال.');
  };

  const handleDeletePost = async (post: ForumPost) => {
    if (!confirm(`حذف السؤال «${post.title}» مع كل ردوده نهائياً؟`)) return;
    setBusyId(post.id);
    const res = await deleteForumPost(post.id);
    setBusyId('');
    flash(res.success ? 'تم حذف السؤال.' : res.error || 'فشل الحذف.');
  };

  const handleApproveReply = async (reply: ForumReply) => {
    setBusyId(reply.id);
    await setReplyStatus(reply.id, reply.postId, 'published');
    setBusyId('');
  };

  const handleDeleteReply = async (reply: ForumReply) => {
    if (!confirm('حذف هذا الرد؟')) return;
    setBusyId(reply.id);
    await deleteForumReply(reply.id, reply.postId, reply.status === 'published');
    setBusyId('');
  };

  const handleTeacherReply = async (post: ForumPost) => {
    const content = (teacherReply[post.id] || '').trim();
    if (!content) return;
    setBusyId(post.id);
    const res = await addForumReply({
      postId: post.id,
      content,
      author: { studentId: 'teacher', name: 'المدرس', phone: '' },
      asTeacher: true,
    });
    setBusyId('');
    if (res.success) {
      setTeacherReply((prev) => ({ ...prev, [post.id]: '' }));
      flash('تم نشر رد المدرس مباشرة.');
    } else {
      flash(res.error || 'فشل إرسال الرد.');
    }
  };

  const postById = new Map(posts.map((p) => [p.id, p]));

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
              <MessagesSquare className="w-6 h-6 text-green-800" />
            </div>
            <div>
              <h1 className="text-lg font-black text-gray-900">إدارة منتدى الأسئلة</h1>
              <p className="text-xs text-gray-500 mt-0.5">
                راجع أسئلة وردود الطلاب ثم انشرها، أو اردّ بنفسك لتنشر فوراً.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTab('review')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                tab === 'review' ? 'bg-green-800 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200'
              }`}
            >
              بانتظار الموافقة
              {pendingPosts.length + pendingReplies.length > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${tab === 'review' ? 'bg-amber-400 text-amber-950' : 'bg-amber-100 text-amber-700'}`}>
                  {pendingPosts.length + pendingReplies.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setTab('published')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                tab === 'published' ? 'bg-green-800 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200'
              }`}
            >
              المنشورات ({publishedPosts.length})
            </button>
          </div>
        </div>
      </div>

      {actionMsg && (
        <div className="p-3.5 bg-green-50 border border-green-300 rounded-xl text-xs text-green-800 font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-green-600" /> {actionMsg}
        </div>
      )}

      {error && (
        <div className="bg-amber-50 border border-amber-300 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center gap-3 text-xs text-amber-800">
          <div className="flex items-center gap-3 flex-1">
            <AlertCircle className="w-5 h-5 shrink-0 text-amber-600" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="shrink-0 px-4 py-2 rounded-xl bg-white border border-amber-300 text-amber-900 font-bold hover:bg-amber-100 transition-colors"
          >
            إعادة المحاولة
          </button>
        </div>
      )}

      {loading ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
          <Loader2 className="w-8 h-8 text-green-600 animate-spin mx-auto mb-3" />
          <p className="text-xs text-gray-500">جاري تحميل بيانات المنتدى…</p>
        </div>
      ) : tab === 'review' ? (
        <div className="space-y-6">
          {/* Pending posts */}
          <section>
            <h2 className="text-sm font-black text-gray-800 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              أسئلة معلقة ({pendingPosts.length})
            </h2>
            {pendingPosts.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
                <Inbox className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-xs text-gray-400">لا توجد أسئلة بانتظار المراجعة. كل شيء مُسلَّم!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingPosts.map((post) => (
                  <div key={post.id} className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-sm">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded-full bg-green-50 border border-green-300 text-green-800 text-[10px] font-bold">
                        {GRADE_LABELS[post.grade]}
                      </span>
                      <span className="text-[11px] font-bold text-gray-700">{post.authorName}</span>
                      <span className="text-[10px] text-gray-400">{post.authorPhone}</span>
                      <span className="text-[10px] text-gray-400 mr-auto">{formatTimeAgo(post.createdAt)}</span>
                    </div>
                    <h3 className="text-sm font-bold text-gray-900">{post.title}</h3>
                    <p className="text-xs text-gray-600 leading-relaxed mt-1.5 whitespace-pre-wrap line-clamp-4">{post.content}</p>

                    {rejectingId === post.id && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl space-y-2">
                        <label className="block text-[11px] font-bold text-red-800">سبب الرفض (سيظهر للطالب)</label>
                        <textarea
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          rows={2}
                          placeholder="مثال: يرجى إعادة الصياغة لأن السؤال غير متعلق بمادة التكنولوجيا…"
                          maxLength={300}
                          className="w-full px-3 py-2 rounded-lg border border-red-300 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-red-500 resize-none"
                        />
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                      <button
                        onClick={() => handleApprovePost(post)}
                        disabled={busyId === post.id}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-green-700 text-white text-xs font-bold disabled:opacity-50 hover:bg-green-800 transition-colors"
                      >
                        {busyId === post.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                        قبول ونشر
                      </button>
                      <button
                        onClick={() => handleRejectPost(post)}
                        disabled={busyId === post.id}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 text-red-700 border border-red-300 text-xs font-bold disabled:opacity-50 hover:bg-red-100 transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        {rejectingId === post.id ? (rejectReason.trim() ? 'تأكيد الرفض' : 'اكتب السبب') : 'رفض'}
                      </button>
                      {rejectingId === post.id && (
                        <button
                          onClick={() => { setRejectingId(null); setRejectReason(''); }}
                          className="inline-flex items-center px-3 py-2 rounded-xl text-xs font-bold text-gray-400 hover:text-gray-600"
                        >
                          إلغاء
                        </button>
                      )}
                      <button
                        onClick={() => handleDeletePost(post)}
                        disabled={busyId === post.id}
                        className="mr-auto inline-flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-bold text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="حذف السؤال"
                      >
                        {busyId === post.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Pending replies */}
          <section>
            <h2 className="text-sm font-black text-gray-800 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              ردود معلقة ({pendingReplies.length})
            </h2>
            {pendingReplies.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
                <Inbox className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-xs text-gray-400">لا توجد ردود معلقة.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingReplies.map((reply) => {
                  const parent = postById.get(reply.postId);
                  return (
                    <div key={reply.id} className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-sm">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="text-[11px] font-bold text-gray-700">{reply.authorName}</span>
                        <span className="text-[10px] text-gray-400">{reply.authorPhone}</span>
                        <span className="text-[10px] text-gray-400 mr-auto">{formatTimeAgo(reply.createdAt)}</span>
                      </div>
                      {parent && (
                        <a
                          href={`/forum/post/${reply.postId}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-green-800 hover:underline mb-1.5 max-w-full truncate"
                        >
                          <ExternalLink className="w-3 h-3 shrink-0" />
                          <span className="truncate">على سؤال: {parent.title}</span>
                        </a>
                      )}
                      <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap">{reply.content}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                        <button
                          onClick={() => handleApproveReply(reply)}
                          disabled={busyId === reply.id}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-green-700 text-white text-xs font-bold disabled:opacity-50 hover:bg-green-800 transition-colors"
                        >
                          {busyId === reply.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                          قبول ونشر
                        </button>
                        <button
                          onClick={() => handleDeleteReply(reply)}
                          disabled={busyId === reply.id}
                          className="inline-flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-bold text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> حذف
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      ) : (
        /* Published posts management */
        <div className="space-y-3">
          {publishedPosts.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
              <Inbox className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-gray-700">لا توجد منشورات بعد</h3>
              <p className="text-xs text-gray-400 mt-1">عندما توافق على الأسئلة ستظهر هنا.</p>
            </div>
          ) : (
            publishedPosts.map((post) => (
              <div key={post.id} className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-sm">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded-full bg-green-50 border border-green-300 text-green-800 text-[10px] font-bold">
                        {GRADE_LABELS[post.grade]}
                      </span>
                      {post.pinned && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-800 text-white text-[10px] font-bold">
                          <Pin className="w-3 h-3" /> مثبّت
                        </span>
                      )}
                      {post.resolved && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black">
                          <CheckCheck className="w-3 h-3" /> تم الحل
                        </span>
                      )}
                      {post.topic && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 border border-blue-300 text-blue-800 text-[10px] font-bold">
                          {forumTopicLabel(post.topic)}
                        </span>
                      )}
                      <span className="text-[10px] text-gray-400 mr-auto">{formatTimeAgo(post.createdAt)}</span>
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 line-clamp-1">{post.title}</h3>
                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mt-1">
                      {post.content}
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-[10px] text-gray-400">
                      <MessagesSquare className="w-3 h-3" /> {post.replyCount || 0} رد
                      {post.authorName !== 'المدرس' ? ` · ${post.authorName}` : ' · المدرس'}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <a
                      href={`/forum/post/${post.id}`}
                      target="_blank"
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-50 text-gray-700 border border-gray-200 text-xs font-bold hover:bg-gray-100 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> فتح
                    </a>
                    <button
                      onClick={() => handleResolveToggle(post)}
                      disabled={busyId === post.id}
                      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold disabled:opacity-50 transition-colors ${
                        post.resolved
                          ? 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100'
                      }`}
                      title={post.resolved ? 'إلغاء تم الحل' : 'تمييز كـ تم الحل'}
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      {post.resolved ? 'إلغاء الحل' : 'تم الحل'}
                    </button>
                    <button
                      onClick={() => handlePinToggle(post)}
                      disabled={busyId === post.id}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-gray-600 border border-gray-200 disabled:opacity-50 hover:bg-gray-50 transition-colors"
                      title={post.pinned ? 'إلغاء التثبيت' : 'تثبيت في الأعلى'}
                    >
                      {post.pinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
                      {post.pinned ? 'إلغاء التثبيت' : 'تثبيت'}
                    </button>
                    <button
                      onClick={() => handleDeletePost(post)}
                      disabled={busyId === post.id}
                      className="inline-flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Quick teacher reply */}
                <div className="mt-3 pt-3 border-t border-gray-100 flex flex-col sm:flex-row gap-2">
                  <input
                    value={teacherReply[post.id] || ''}
                    onChange={(e) => setTeacherReply((prev) => ({ ...prev, [post.id]: e.target.value }))}
                    placeholder="اكتب إجابة المدرس وسيتم نشرها فوراً…"
                    maxLength={1000}
                    className="flex-1 px-3 py-2 rounded-xl border border-gray-300 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"
                  />
                  <button
                    onClick={() => handleTeacherReply(post)}
                    disabled={busyId === post.id || !(teacherReply[post.id] || '').trim()}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-bold disabled:opacity-50 transition-all hover:-translate-y-0.5 shadow-sm shrink-0"
                    style={{ background: '#1B4332' }}
                  >
                    {busyId === post.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    ردّ المدرس
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}