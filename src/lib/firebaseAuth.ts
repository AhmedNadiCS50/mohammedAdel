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
  const trimmed = phone.trim().toLowerCase();
  if (trimmed === 'admin' || trimmed === 'mohamed') {
    return 'admin@adel-tech.local';
  }
  const cleanPhone = trimmed.replace(/[^0-9]/g, '');
  return `${cleanPhone}@adel-tech.local`;
}

export async function ensureAdminFirebaseAuth(): Promise<boolean> {
  if (!isFirebaseConfigured() || !auth) return false;
  if (auth.currentUser && auth.currentUser.email === 'admin@adel-tech.local') {
    return true;
  }
  try {
    const cred = await signInWithEmailAndPassword(auth, 'admin@adel-tech.local', 'adel2027');
    return !!cred.user;
  } catch (err) {
    try {
      const reg = await createUserWithEmailAndPassword(auth, 'admin@adel-tech.local', 'adel2027');
      return !!reg.user;
    } catch (regErr) {
      console.error('ensureAdminFirebaseAuth error:', regErr);
      return false;
    }
  }
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
