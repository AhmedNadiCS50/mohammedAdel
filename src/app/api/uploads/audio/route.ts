import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ALLOWED = new Map<string, string>([
  ['audio/webm', 'webm'],
  ['audio/webm;codecs=opus', 'webm'],
  ['audio/ogg', 'ogg'],
  ['audio/opus', 'opus'],
  ['audio/mpeg', 'mp3'],
  ['audio/mp4', 'm4a'],
  ['audio/x-m4a', 'm4a'],
  ['audio/wav', 'wav'],
  ['audio/x-wav', 'wav'],
  ['audio/aac', 'aac'],
]);
const MAX_BYTES = 15 * 1024 * 1024; // 15MB

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const form = await request.formData();
    const file = form.get('file');
    if (!file || typeof file === 'string' || !file.name) {
      return NextResponse.json({ error: 'الملف الصوتي غير موجود.' }, { status: 400 });
    }
    // Some browsers send "audio/webm;codecs=opus" — normalize on the base type.
    const baseType = (file.type || '').split(';')[0].trim();
    const ext = ALLOWED.get(baseType) || ALLOWED.get(file.type || '');
    if (!ext) {
      return NextResponse.json(
        { error: 'صيغة الصوت غير مدعومة. استخدم WebM أو MP3 أو M4A أو OGG أو WAV.' },
        { status: 400 }
      );
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'حجم التسجيل الصوتي أكبر من 15MB.' }, { status: 400 });
    }

    const buf = Buffer.from(await file.arrayBuffer());
    const pathname = `forum-audio/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;
    const blob = await put(pathname, buf, {
      access: 'public',
      contentType: baseType || file.type,
      addRandomSuffix: false,
      cacheControlMaxAge: 60 * 60 * 24 * 30,
    });

    return NextResponse.json({ url: blob.url });
  } catch (err) {
    console.error('forum audio upload error:', err);
    return NextResponse.json(
      { error: (err as Error).message || 'فشل رفع التسجيل الصوتي.' },
      { status: 500 }
    );
  }
}