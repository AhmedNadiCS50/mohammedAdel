import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { Student } from './types';

const STUDENTS = 'students';

/**
 * Read the authoritative student doc from Firestore (own account session).
 * Requires the signed-in Firebase user to match the student's phone.
 */
export async function getOwnStudentFromFirestore(student: Student): Promise<Student | null> {
  if (!isFirebaseConfigured() || !db || !student.id) return null;
  try {
    const snap = await getDoc(doc(db, STUDENTS, student.id));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as Student;
  } catch (err) {
    console.warn('getOwnStudentFromFirestore error:', err);
    return null;
  }
}

/**
 * Save editable profile fields to the student's own Firestore doc.
 * Firestore rules only allow the matching student to change these fields.
 */
export async function saveOwnProfile(
  studentId: string,
  fields: { parentPhone?: string; governorate?: string; photoUrl?: string }
): Promise<{ success: boolean; error?: string }> {
  if (!isFirebaseConfigured() || !db) {
    return { success: false, error: 'الحفظ يتطلب تفعيل قاعدة بيانات Firebase السحابية.' };
  }
  try {
    await updateDoc(doc(db, STUDENTS, studentId), fields);
    return { success: true };
  } catch (err: any) {
    console.error('saveOwnProfile error:', err);
    return { success: false, error: err?.message || 'فشل حفظ التعديلات. تأكد من تسجيل دخولك بنفس رقم الهاتف.' };
  }
}