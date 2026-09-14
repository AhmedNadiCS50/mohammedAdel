import { collection, doc, setDoc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { ensureAdminFirebaseAuth } from './firebaseAuth';
import { StudentMute } from './types';

const MUTE_COLLECTION = 'student_mutes';

async function requireAdminAuth(): Promise<boolean> {
  if (!isFirebaseConfigured() || !db) return false;
  await ensureAdminFirebaseAuth();
  return true;
}

function withData<T extends { id?: string }>(snap: { id: string; data(): any }): T {
  return { id: snap.id, ...snap.data() } as T;
}

function toIso(v: any): string {
  if (!v) return '';
  if (typeof v === 'string') return v;
  if (typeof v.toDate === 'function') return new Date(v.toDate()).toISOString();
  if (v instanceof Date) return v.toISOString();
  return String(v);
}

/** Live listener over ALL mute records — used by the forum admin view. */
export function subscribeAllMutes(
  onData: (mutes: StudentMute[]) => void,
  onError?: (error: any) => void
): Unsubscribe {
  if (!isFirebaseConfigured() || !db) return () => {};
  return onSnapshot(
    collection(db, MUTE_COLLECTION),
    (snap) => {
      const list = snap.docs.map((d) => {
        const raw = d.data() as any;
        return {
          id: d.id,
          until: toIso(raw.until),
          setAt: toIso(raw.setAt),
          ...(raw.reason ? { reason: String(raw.reason) } : {}),
          ...(raw.mutedBy ? { mutedBy: String(raw.mutedBy) } : {}),
        } as StudentMute;
      });
      onData(list);
    },
    (err) => {
      console.error('subscribeAllMutes error:', err);
      onError?.(err);
    }
  );
}

/** Live listener for ONE student's mute record — used on student forum pages. */
export function subscribeStudentMute(
  studentId: string,
  onData: (mute: StudentMute | null) => void,
  onError?: (error: any) => void
): Unsubscribe {
  if (!isFirebaseConfigured() || !db || !studentId) return () => {};
  return onSnapshot(
    doc(db, MUTE_COLLECTION, studentId),
    (snap) => {
      if (!snap.exists()) {
        onData(null);
        return;
      }
      const raw = snap.data() as any;
      onData({
        id: snap.id,
        until: toIso(raw.until),
        setAt: toIso(raw.setAt),
        ...(raw.reason ? { reason: String(raw.reason) } : {}),
        ...(raw.mutedBy ? { mutedBy: String(raw.mutedBy) } : {}),
      } as StudentMute);
    },
    (err) => {
      console.error('subscribeStudentMute error:', err);
      onError?.(err);
    }
  );
}

/** Mute a student for a given number of hours (teacher/moderator action). */
export async function setStudentMute(
  studentId: string,
  hours: number,
  reason: string,
  actorName: string
): Promise<{ success: boolean; error?: string }> {
  if (!isFirebaseConfigured() || !db) return { success: false, error: 'Firebase غير مفعل.' };
  if (!studentId) return { success: false, error: 'بيانات الطالب غير مكتملة.' };
  try {
    if (!(await requireAdminAuth())) return { success: false, error: 'غير مصرح.' };
    const now = new Date();
    const until = new Date(now.getTime() + hours * 3600 * 1000);
    await setDoc(
      doc(db, MUTE_COLLECTION, studentId),
      {
        until: until, // stored as Firestore timestamp so rules can compare with request.time
        reason: reason.trim().slice(0, 200) || '',
        mutedBy: actorName,
        setAt: new Date(),
      },
      { merge: true }
    );
    return { success: true };
  } catch (err: any) {
    console.error('setStudentMute error:', err);
    return { success: false, error: err?.message || 'فشل تقييد الطالب.' };
  }
}

/** Remove a student's mute (teacher/moderator action). */
export async function clearStudentMute(studentId: string): Promise<{ success: boolean; error?: string }> {
  if (!isFirebaseConfigured() || !db) return { success: false, error: 'Firebase غير مفعل.' };
  try {
    if (!(await requireAdminAuth())) return { success: false, error: 'غير مصرح.' };
    await setDoc(
      doc(db, MUTE_COLLECTION, studentId),
      { until: '', reason: '', mutedBy: '', setAt: '' },
      { merge: true }
    );
    return { success: true };
  } catch (err: any) {
    console.error('clearStudentMute error:', err);
    return { success: false, error: err?.message || 'فشل إلغاء التقييد.' };
  }
}

export function isStudentMuted(mute: StudentMute | null | undefined, nowMs = Date.now()): boolean {
  return !!mute && !!mute.until && new Date(mute.until).getTime() > nowMs;
}

export function formatMuteUntil(until: string): string {
  try {
    const d = new Date(until);
    const now = new Date();
    const days = Math.max(0, Math.floor((d.getTime() - now.getTime()) / 86400000));
    if (days > 0) {
      return `حتى ${d.toLocaleDateString('ar-EG')} (متبقٍ ${days} ${days === 1 ? 'يوم' : 'أيام'})`;
    }
    return `حتى ${d.toLocaleDateString('ar-EG')} الساعة ${d.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}`;
  } catch {
    return until;
  }
}