import { collection, doc, setDoc, updateDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { ensureAdminFirebaseAuth } from './firebaseAuth';
import { Moderator, ModeratorAction } from './types';

const MODERATORS = 'moderators';
const ACTIONS = 'moderator_actions';

async function requireAdminAuth(): Promise<boolean> {
  if (!isFirebaseConfigured() || !db) return false;
  await ensureAdminFirebaseAuth();
  return true;
}

function withData<T extends { id?: string }>(snap: { id: string; data(): any }): T {
  return { id: snap.id, ...snap.data() } as T;
}

export async function hashModeratorPassword(username: string, password: string): Promise<string> {
  const material = `${username.trim().toLowerCase()}|adel-md|${password}`;
  const data = new TextEncoder().encode(material);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function newModeratorId(): string {
  return 'mod_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
}

export async function getModeratorsFromFirestore(): Promise<Moderator[]> {
  if (!isFirebaseConfigured() || !db) return [];
  try {
    await requireAdminAuth();
    const snap = await getDocs(collection(db, MODERATORS));
    const list = snap.docs.map((d) => withData<Moderator>(d));
    return list.sort((a, b) => a.name.localeCompare(b.name));
  } catch (err) {
    console.error('getModeratorsFromFirestore error:', err);
    return [];
  }
}

export async function saveModeratorToFirestore(moderator: Moderator): Promise<boolean> {
  if (!isFirebaseConfigured() || !db) return false;
  try {
    await requireAdminAuth();
    await setDoc(doc(db, MODERATORS, moderator.id), moderator, { merge: true });
    return true;
  } catch (err) {
    console.error('saveModeratorToFirestore error:', err);
    return false;
  }
}

export async function updateModeratorLastLogin(moderatorId: string, lastLoginAt: string): Promise<void> {
  if (!isFirebaseConfigured() || !db) return;
  try {
    await requireAdminAuth();
    await updateDoc(doc(db, MODERATORS, moderatorId), { lastLoginAt });
  } catch (err) {
    console.error('updateModeratorLastLogin error:', err);
  }
}

export async function deleteModeratorFromFirestore(moderatorId: string): Promise<boolean> {
  if (!isFirebaseConfigured() || !db) return false;
  try {
    await requireAdminAuth();
    await deleteDoc(doc(db, MODERATORS, moderatorId));
    return true;
  } catch (err) {
    console.error('deleteModeratorFromFirestore error:', err);
    return false;
  }
}

export async function authenticateModerator(
  username: string,
  password: string
): Promise<{ success: boolean; moderator?: Moderator; error?: string }> {
  if (!isFirebaseConfigured() || !db) {
    return { success: false, error: 'قاعدة بيانات Firebase غير مفعلة. اطلب من المدرس تفعيلها.' };
  }
  try {
    const mods = await getModeratorsFromFirestore();
    const cleanUser = username.trim().toLowerCase();
    const found = mods.find((m) => m.username.trim().toLowerCase() === cleanUser);
    if (!found) {
      return { success: false, error: 'اسم المستخدم غير مسجل في قائمة المشرفين.' };
    }
    if (!found.isActive) {
      return { success: false, error: 'هذا الحساب معطّل. تواصل مع المدرس لتفعيله.' };
    }
    const hash = await hashModeratorPassword(found.username, password);
    if (hash !== found.passwordHash) {
      return { success: false, error: 'كلمة المرور غير صحيحة.' };
    }
    const now = new Date().toISOString();
    const sessionMod: Moderator = { ...found, lastLoginAt: now };
    delete (sessionMod as Partial<Moderator>).passwordHash;
    updateModeratorLastLogin(found.id, now);
    return { success: true, moderator: sessionMod };
  } catch (err) {
    console.error('authenticateModerator error:', err);
    return { success: false, error: 'تعذّر الاتصال بقاعدة بيانات المشرفين. حاول مرة أخرى.' };
  }
}

export async function logModeratorAction(params: {
  actor: Moderator;
  action: string;
  targetType: string;
  targetId?: string;
  detail?: string;
}): Promise<void> {
  if (!isFirebaseConfigured() || !db) return;
  try {
    await requireAdminAuth();
    const entry: ModeratorAction = {
      id: 'act_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      actorId: params.actor.id,
      actorName: params.actor.name,
      action: params.action,
      targetType: params.targetType,
      ...(params.targetId ? { targetId: params.targetId } : {}),
      ...(params.detail ? { detail: params.detail } : {}),
      timestamp: new Date().toISOString(),
    };
    await setDoc(doc(db, ACTIONS, entry.id), entry);
  } catch (err) {
    console.error('logModeratorAction error:', err);
  }
}