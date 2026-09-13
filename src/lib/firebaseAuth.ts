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

export async function ensureAdminFirebaseAuth(): Promise<string> {
  if (!isFirebaseConfigured() || !auth) return 'auth/not-configured';
  if (auth.currentUser && auth.currentUser.email === 'admin@adel-tech.local') {
    return 'ok';
  }
  try {
    const cred = await signInWithEmailAndPassword(auth, 'admin@adel-tech.local', 'adel2027');
    return cred.user ? 'ok' : 'auth/signed-out';
  } catch (err: any) {
    const code = err?.code || 'auth/unknown';
    // Try to register the admin account only when it genuinely doesn't exist.
    const canRegister = ['auth/user-not-found', 'auth/invalid-credential', 'auth/invalid-login-credentials', 'auth/internal-error', 'auth/network-request-failed'].includes(code);
    if (code === 'auth/network-request-failed') {
      console.error('ensureAdminFirebaseAuth network error:', err);
      return 'auth/network-request-failed';
    }
    if (canRegister) {
      try {
        const reg = await createUserWithEmailAndPassword(auth, 'admin@adel-tech.local', 'adel2027');
        return reg.user ? 'ok' : code;
      } catch (regErr: any) {
        // If account exists but with a different password -> email-already-in-use
        console.error('ensureAdminFirebaseAuth create failed:', regErr);
        return regErr?.code || code;
      }
    }
    console.error('ensureAdminFirebaseAuth login failed:', err);
    return code;
  }
}

export function adminAuthErrorMessage(code: string | null | undefined): string {
  switch (code) {
    case 'auth/api-key-not-valid':
    case 'auth/invalid-api-key':
      return 'مفتاح Firebase API غير صالح. انسخ المفتاح الصحيح من Firebase Console → ⚙️ إعدادات المشروع → الويب، وحدّث القيمة في Vercel و .env.local ثم أعد النشر.';
    case 'auth/operation-not-allowed':
      return 'مزوّد تسجيل الدخول بالبريد الإلكتروني (Email/Password) غير مفعّل. فعّله من Firebase Console → Authentication → Sign-in method ثم حاول الحفظ مرة أخرى.';
    case 'auth/email-already-in-use':
      return 'حساب الأدمن موجود لكن كلمة المرور غير مطابقة (adel2027). غيّر كلمة مرور admin@adel-tech.local من Firebase Console أو صحّحها في firebaseAuth.ts.';
    case 'auth/network-request-failed':
      return 'تعذّر الاتصال بخوادم Firebase. تحقق من الإنترنت، ومن أن الـ domain بتاع الموقع مضاف في Authentication → Settings → Authorized domains.';
    case 'auth/unauthorized-domain':
      return 'نطاق الموقع الحالي غير مصرح به في Firebase. أضفه من Firebase Console → Authentication → Settings → Authorized domains.';
    case 'auth/popup-blocked':
      return 'المتصفح منع نافذة تسجيل الدخول. اسمح بالنوافذ المنبثقة للموقع ثم أعد المحاولة.';
    case 'auth/user-disabled':
      return 'حساب الأدمن مُعطّل في Firebase Console → Authentication → Users.';
    case 'auth/not-configured':
      return 'متغيرات Firebase ناقصة في الموقع. أضف NEXT_PUBLIC_FIREBASE_* الصحيحة في Vercel و .env.local.';
    default:
      return `فشل الاتصال بخدمة Firebase (${code || 'خطأ غير معروف'}). تأكد من صحة مفتاح API وفعّالة الـ Rules وفعّل Email/Password.`;
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
