import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  onSnapshot,
  increment,
  deleteField,
  Unsubscribe,
  Query
} from 'firebase/firestore';
import { db, auth, isFirebaseConfigured } from './firebase';
import { ensureAdminFirebaseAuth } from './firebaseAuth';
import {
  ForumPost,
  ForumReply,
  ForumPostStatus,
  GradeLevel,
  ForumAuthorRole,
  ForumTopic
} from './types';

const POST_COLLECTION = 'forum_posts';
const REPLY_COLLECTION = 'forum_replies';

// -------------------------------------------------------------
// Helpers
// -------------------------------------------------------------
function withData<T extends { id?: string }>(snap: { id: string; data(): any }): T {
  return { id: snap.id, ...snap.data() } as T;
}

async function requireAdminAuth(): Promise<boolean> {
  if (!isFirebaseConfigured() || !db) return false;
  await ensureAdminFirebaseAuth();
  return true;
}

/**
 * Make sure a non-null Firebase Auth session exists so Firestore
 * rules (request.auth != null) allow reading the forum. Students who
 * signed in before Firebase was configured fall back to an anonymous
 * session; posting still requires a real activated student record.
 */
export async function ensureForumAuth(): Promise<boolean> {
  if (!isFirebaseConfigured() || !auth) return false;
  if (auth.currentUser) return true;
  try {
    const { signInAnonymously } = await import('firebase/auth');
    await signInAnonymously(auth);
    return true;
  } catch (err) {
    console.warn('ensureForumAuth error:', err);
    return false;
  }
}

// -------------------------------------------------------------
// POSTS — Realtime subscriptions
// -------------------------------------------------------------
/** Live listener for published posts of a specific grade (student forum). */
export function subscribePublishedPosts(
  grade: GradeLevel,
  onData: (posts: ForumPost[]) => void,
  onError?: (error: any) => void
): Unsubscribe {
  if (!isFirebaseConfigured() || !db) return () => {};
  const q: Query = query(
    collection(db, POST_COLLECTION),
    where('grade', '==', grade),
    where('status', '==', 'published')
  );
  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs
        .map((d) => withData<ForumPost>(d))
        .sort((a, b) => {
          if (!!b.pinned !== !!a.pinned) return Number(!!b.pinned) - Number(!!a.pinned);
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
      onData(list);
    },
    (err) => {
      console.error('subscribePublishedPosts error:', err);
      onError?.(err);
    }
  );
}

/** Live listener for one student's own posts (any status: pending/published/rejected). */
export function subscribeMyPosts(
  studentId: string,
  onData: (posts: ForumPost[]) => void,
  onError?: (error: any) => void
): Unsubscribe {
  if (!isFirebaseConfigured() || !db) return () => {};
  const q: Query = query(collection(db, POST_COLLECTION), where('authorStudentId', '==', studentId));
  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs
        .map((d) => withData<ForumPost>(d))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onData(list);
    },
    (err) => {
      console.error('subscribeMyPosts error:', err);
      onError?.(err);
    }
  );
}

/** Live listener for ALL pending posts (teacher moderation queue). */
export function subscribePendingPosts(
  onData: (posts: ForumPost[]) => void,
  onError?: (error: any) => void
): Unsubscribe {
  if (!isFirebaseConfigured() || !db) return () => {};
  const q: Query = query(collection(db, POST_COLLECTION), where('status', '==', 'pending'));
  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs
        .map((d) => withData<ForumPost>(d))
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      onData(list);
    },
    (err) => {
      console.error('subscribePendingPosts error:', err);
      onError?.(err);
    }
  );
}

/** Live listener for the pending-moderation count (admin sidebar badge). */
export function subscribePendingPostsCount(
  onCount: (count: number) => void,
  onError?: (error: any) => void
): Unsubscribe {
  if (!isFirebaseConfigured() || !db) return () => {};
  const q: Query = query(collection(db, POST_COLLECTION), where('status', '==', 'pending'));
  return onSnapshot(
    q,
    (snap) => onCount(snap.size),
    (err) => {
      console.error('subscribePendingPostsCount error:', err);
      onError?.(err);
    }
  );
}

// -------------------------------------------------------------
// POSTS — Mutations
// -------------------------------------------------------------
export async function createForumPost(params: {
  title: string;
  content: string;
  grade: GradeLevel;
  author: { studentId: string; name: string; phone: string };
  asTeacher?: boolean;
  topic?: ForumTopic;
  lessonId?: string;
  imageUrls?: string[];
}): Promise<{ success: boolean; id?: string; error?: string }> {
  if (!isFirebaseConfigured() || !db) return { success: false, error: 'منصة الدردشة تتطلب تفعيل Firebase Cloud من إعدادات المدرس.' };

  const now = new Date().toISOString();
  const post: Omit<ForumPost, 'id'> = {
    title: params.title.trim(),
    content: params.content.trim(),
    grade: params.grade,
    ...(params.topic ? { topic: params.topic } : {}),
    ...(params.lessonId ? { lessonId: params.lessonId } : {}),
    authorStudentId: params.author.studentId,
    authorName: params.author.name,
    authorPhone: params.author.phone,
    authorRole: params.asTeacher ? 'teacher' : 'student',
    status: params.asTeacher ? 'published' : 'pending',
    pinned: false,
    replyCount: 0,
    ...(params.imageUrls?.length ? { imageUrls: params.imageUrls.slice(0, 6) } : {}),
    createdAt: now,
    updatedAt: now,
  };

  try {
    if (params.asTeacher && !(await requireAdminAuth())) {
      return { success: false, error: 'غير مصرح: فشل التحقق من جلسة المدرس.' };
    }
    const docRef = await addDoc(collection(db, POST_COLLECTION), post);
    return { success: true, id: docRef.id };
  } catch (err: any) {
    console.error('createForumPost error:', err);
    return { success: false, error: err?.message || 'فشل إرسال السؤال. حاول مرة أخرى.' };
  }
}

/** Teacher approves/rejects a post. pending -> published | rejected. */
export async function setPostStatus(
  postId: string,
  status: Exclude<ForumPostStatus, 'pending'>,
  rejectionReason?: string
): Promise<{ success: boolean; error?: string }> {
  if (!isFirebaseConfigured() || !db) return { success: false, error: 'Firebase غير مفعل.' };
  try {
    if (!(await requireAdminAuth())) return { success: false, error: 'غير مصرح.' };
    const payload: Record<string, any> = {
      status,
      updatedAt: new Date().toISOString(),
    };
    if (status === 'published') {
      payload.rejectionReason = deleteField();
    } else {
      payload.rejectionReason = (rejectionReason || 'لم يتم تحديد سبب.').trim();
    }
    await updateDoc(doc(db, POST_COLLECTION, postId), payload);
    return { success: true };
  } catch (err: any) {
    console.error('setPostStatus error:', err);
    return { success: false, error: err?.message || 'فشل تحديث حالة السؤال.' };
  }
}

/** Teacher pins/unpins a published post. */
export async function togglePostPin(postId: string, pinned: boolean): Promise<{ success: boolean; error?: string }> {
  if (!isFirebaseConfigured() || !db) return { success: false, error: 'Firebase غير مفعل.' };
  try {
    if (!(await requireAdminAuth())) return { success: false, error: 'غير مصرح.' };
    await updateDoc(doc(db, POST_COLLECTION, postId), { pinned, updatedAt: new Date().toISOString() });
    return { success: true };
  } catch (err: any) {
    console.error('togglePostPin error:', err);
    return { success: false, error: err?.message || 'فشل تحديث تثبيت السؤال.' };
  }
}

/** Mark/unmark a post as "resolved". Owner students or the teacher may toggle. */
export async function setPostResolved(
  postId: string,
  resolved: boolean,
  opts: { asTeacher?: boolean; authorStudentId?: string }
): Promise<{ success: boolean; error?: string }> {
  if (!isFirebaseConfigured() || !db) return { success: false, error: 'Firebase غير مفعل.' };
  try {
    if (opts.asTeacher) {
      if (!(await requireAdminAuth())) return { success: false, error: 'غير مصرح.' };
    } else if (!opts.authorStudentId) {
      return { success: false, error: 'غير مصرح.' };
    }
    const payload: Record<string, any> = {
      resolved,
      resolvedBy: opts.asTeacher ? 'teacher' : opts.authorStudentId,
      resolvedAt: resolved ? new Date().toISOString() : null,
      updatedAt: new Date().toISOString(),
    };
    await updateDoc(doc(db, POST_COLLECTION, postId), payload);
    return { success: true };
  } catch (err: any) {
    console.error('setPostResolved error:', err);
    return { success: false, error: err?.message || 'فشل تحديث حالة السؤال.' };
  }
}

/** Teacher deletes a post and all of its replies. */
export async function deleteForumPost(postId: string): Promise<{ success: boolean; error?: string }> {
  if (!isFirebaseConfigured() || !db) return { success: false, error: 'Firebase غير مفعل.' };
  try {
    if (!(await requireAdminAuth())) return { success: false, error: 'غير مصرح.' };
    const replies = await getDocs(query(collection(db, REPLY_COLLECTION), where('postId', '==', postId)));
    for (const r of replies.docs) {
      await deleteDoc(r.ref);
    }
    await deleteDoc(doc(db, POST_COLLECTION, postId));
    return { success: true };
  } catch (err: any) {
    console.error('deleteForumPost error:', err);
    return { success: false, error: err?.message || 'فشل حذف السؤال.' };
  }
}

/** Live listener for ALL posts (teacher moderation page). */
export function subscribeAllPosts(
  onData: (posts: ForumPost[]) => void,
  onError?: (error: any) => void
): Unsubscribe {
  if (!isFirebaseConfigured() || !db) return () => {};
  const q: Query = query(collection(db, POST_COLLECTION));
  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs
        .map((d) => withData<ForumPost>(d))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onData(list);
    },
    (err) => {
      console.error('subscribeAllPosts error:', err);
      onError?.(err);
    }
  );
}

/** Live listener for a single post document (status/pin changes). */
export function subscribePost(
  postId: string,
  onData: (post: ForumPost | null) => void,
  onError?: (error: any) => void
): Unsubscribe {
  if (!isFirebaseConfigured() || !db) return () => {};
  return onSnapshot(
    doc(db, POST_COLLECTION, postId),
    (snap) => onData(snap.exists() ? withData<ForumPost>(snap) : null),
    (err) => {
      console.error('subscribePost error:', err);
      onError?.(err);
    }
  );
}

// -------------------------------------------------------------
// REPLIES — Realtime subscriptions
// -------------------------------------------------------------
/**
 * Live listener for replies of a post.
 * Student view: filter published only; teacher view: include pending.
 */
export function subscribePostReplies(
  postId: string,
  includePending = false,
  onData: (replies: ForumReply[]) => void,
  onError?: (error: any) => void
): Unsubscribe {
  if (!isFirebaseConfigured() || !db) return () => {};
  const q: Query = query(collection(db, REPLY_COLLECTION), where('postId', '==', postId));
  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs
        .map((d) => withData<ForumReply>(d))
        .filter((r) => includePending || r.status === 'published')
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      onData(list);
    },
    (err) => {
      console.error('subscribePostReplies error:', err);
      onError?.(err);
    }
  );
}

/** Live listener for ALL pending replies (teacher moderation queue). */
export function subscribePendingReplies(
  onData: (replies: ForumReply[]) => void,
  onError?: (error: any) => void
): Unsubscribe {
  if (!isFirebaseConfigured() || !db) return () => {};
  const q: Query = query(collection(db, REPLY_COLLECTION), where('status', '==', 'pending'));
  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs
        .map((d) => withData<ForumReply>(d))
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      onData(list);
    },
    (err) => {
      console.error('subscribePendingReplies error:', err);
      onError?.(err);
    }
  );
}

// -------------------------------------------------------------
// REPLIES — Mutations
// -------------------------------------------------------------
export async function addForumReply(params: {
  postId: string;
  content: string;
  author: { studentId: string; name: string; phone: string };
  asTeacher?: boolean;
  imageUrls?: string[];
}): Promise<{ success: boolean; id?: string; error?: string }> {
  if (!isFirebaseConfigured() || !db) return { success: false, error: 'منتدى النقاش يتطلب تفعيل Firebase Cloud.' };

  const content = params.content.trim();
  if (!content) return { success: false, error: 'اكتب محتوى الرد أولاً.' };

  const now = new Date().toISOString();
  const reply: Omit<ForumReply, 'id'> = {
    postId: params.postId,
    content,
    authorStudentId: params.author.studentId,
    authorName: params.author.name,
    authorPhone: params.author.phone,
    authorRole: (params.asTeacher ? 'teacher' : 'student') as ForumAuthorRole,
    // Student replies publish instantly (no moderation needed); posts still get reviewed.
    status: 'published',
    ...(params.imageUrls?.length ? { imageUrls: params.imageUrls.slice(0, 6) } : {}),
    createdAt: now,
  };

  try {
    if (params.asTeacher) {
      if (!(await requireAdminAuth())) return { success: false, error: 'غير مصرح.' };
    }
    const docRef = await addDoc(collection(db, REPLY_COLLECTION), reply);
    await updateDoc(doc(db, POST_COLLECTION, params.postId), {
      replyCount: increment(1),
      updatedAt: now,
    });
    return { success: true, id: docRef.id };
  } catch (err: any) {
    console.error('addForumReply error:', err);
    return { success: false, error: err?.message || 'فشل إرسال الرد. حاول مرة أخرى.' };
  }
}

export async function setReplyStatus(
  replyId: string,
  postId: string,
  status: Exclude<ForumPostStatus, 'pending'>
): Promise<{ success: boolean; error?: string }> {
  if (!isFirebaseConfigured() || !db) return { success: false, error: 'Firebase غير مفعل.' };
  try {
    if (!(await requireAdminAuth())) return { success: false, error: 'غير مصرح.' };
    await updateDoc(doc(db, REPLY_COLLECTION, replyId), { status });
    if (status === 'published') {
      await updateDoc(doc(db, POST_COLLECTION, postId), {
        replyCount: increment(1),
        updatedAt: new Date().toISOString(),
      });
    }
    return { success: true };
  } catch (err: any) {
    console.error('setReplyStatus error:', err);
    return { success: false, error: err?.message || 'فشل تحديث الرد.' };
  }
}

/** Teacher deletes a reply; published ones decrease the thread counter. */
export async function deleteForumReply(replyId: string, postId: string, wasPublished: boolean): Promise<{ success: boolean; error?: string }> {
  if (!isFirebaseConfigured() || !db) return { success: false, error: 'Firebase غير مفعل.' };
  try {
    if (!(await requireAdminAuth())) return { success: false, error: 'غير مصرح.' };
    await deleteDoc(doc(db, REPLY_COLLECTION, replyId));
    if (wasPublished) {
      await updateDoc(doc(db, POST_COLLECTION, postId), {
        replyCount: increment(-1),
        updatedAt: new Date().toISOString(),
      });
    }
    return { success: true };
  } catch (err: any) {
    console.error('deleteForumReply error:', err);
    return { success: false, error: err?.message || 'فشل حذف الرد.' };
  }
}

// -------------------------------------------------------------
// One-off helpers
// -------------------------------------------------------------
export async function getForumPostById(postId: string): Promise<ForumPost | null> {
  const firestore = db;
  if (!isFirebaseConfigured() || !firestore) return null;
  try {
    const { getDoc } = await import('firebase/firestore');
    const snap = await getDoc(doc(firestore, POST_COLLECTION, postId));
    return snap.exists() ? withData<ForumPost>(snap) : null;
  } catch (err) {
    console.error('getForumPostById error:', err);
    return null;
  }
}