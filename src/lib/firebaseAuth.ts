import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from './firebase';

// Helper to convert phone to internal Firebase email
export function phoneToEmail(phone: string): string {
  const cleanPhone = phone.trim().replace(/[^0-9]/g, '');
  return `${cleanPhone}@adel-tech.local`;
}

export async function firebaseRegisterUser(phone: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
  if (!isFirebaseConfigured() || !auth) {
    return { success: false, error: 'Firebase is not configured' };
  }
  try {
    const email = phoneToEmail(phone);
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (err: any) {
    console.error('Firebase registration error:', err);
    let message = 'فشل إنشاء الحساب في السحابة.';
    if (err.code === 'auth/email-already-in-use') {
      message = 'رقم الهاتف هذا مسجل به حساب بالفعل مسبقاً.';
    } else if (err.code === 'auth/weak-password') {
      message = 'كلمة المرور ضعيفة، يرجى كتابة 6 أحرف أو أرقام على الأقل.';
    }
    return { success: false, error: message };
  }
}

export async function firebaseLoginUser(phone: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
  if (!isFirebaseConfigured() || !auth) {
    return { success: false, error: 'Firebase is not configured' };
  }
  try {
    const email = phoneToEmail(phone);
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (err: any) {
    console.error('Firebase login error:', err);
    let message = 'رقم الهاتف أو كلمة المرور غير صحيحة.';
    if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
      message = 'بيانات تسجيل الدخول غير صحيحة أو الحساب غير موجود.';
    }
    return { success: false, error: message };
  }
}

export async function firebaseLogoutUser(): Promise<void> {
  if (isFirebaseConfigured() && auth) {
    await signOut(auth);
  }
}
