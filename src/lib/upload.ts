"use client";

import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, isStorageConfigured } from '@/lib/firebase';
import { SubmissionAttachment } from '@/lib/types';

const MAX_IMAGE_SIZE_MB = 5;
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];

export function isValidSubmissionImage(file: File): boolean {
  if (!file.type.startsWith('image/')) return false;
  const ext = (file.name.split('.').pop() || '').toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) return false;
  if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) return false;
  return true;
}

export async function uploadSubmissionImage(
  submissionId: string,
  file: File
): Promise<SubmissionAttachment> {
  if (!isStorageConfigured() || !storage) {
    throw new Error('Firebase Storage غير مفعل على جهازك.');
  }

  if (!isValidSubmissionImage(file)) {
    throw new Error(`الصورة غير صالحة. يُسمح بصور JPG/PNG/WebP حتى ${MAX_IMAGE_SIZE_MB} ميجا.`);
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
  const storagePath = `submissions/${submissionId}/${Date.now()}-${safeName}`;
  const fileRef = ref(storage, storagePath);

  const snapshot = await uploadBytes(fileRef, file, {
    contentType: file.type,
  });
  const url = await getDownloadURL(snapshot.ref);

  return { name: safeName, url };
}

export async function deleteSubmissionImage(
  submissionId: string,
  attachment: SubmissionAttachment
): Promise<void> {
  if (!isStorageConfigured() || !storage) return;
  try {
    const fileRef = ref(storage, `submissions/${submissionId}/${attachment.name}`);
    await import('firebase/storage').then(({ deleteObject }) => deleteObject(fileRef));
  } catch (e) {
    console.error('deleteSubmissionImage error:', e);
  }
}