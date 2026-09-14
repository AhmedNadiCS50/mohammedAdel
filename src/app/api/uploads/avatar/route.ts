import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ALLOWED = new Map<string, string>([
  ['image/png', 'png'],
  ['image/jpeg', 'jpg'],
  ['image/webp', 'webp'],
]);
const MAX_BYTES = 2 * 1024 * 1024; // 2MB

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const form = await request.formData();
    const file = form.get('file');
    if (!file || typeof file === 'string' || !file.name) {
      return NextResponse.json({ error: 'الملف غير موجود.' }, { status: 400 });
    }
    const ext = ALLOWED.get(file.type);
    if (!ext) {
      return NextResponse.json({ error: 'صيغة الصورة غير مدعومة. استخدم PNG أو JPG أو WebP.' }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'حجم الصورة أكبر من 2MB.' }, { status: 400 });
    }

    const buf = Buffer.from(await file.arrayBuffer());
    const pathname = `avatars/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;
    const blob = await put(pathname, buf, {
      access: 'public',
      contentType: file.type,
      addRandomSuffix: false,
      cacheControlMaxAge: 60 * 60 * 24 * 30,
    });

    return NextResponse.json({ url: blob.url });
  } catch (err) {
    console.error('avatar upload error:', err);
    return NextResponse.json(
      { error: (err as Error).message || 'فشل رفع الصورة.' },
      { status: 500 }
    );
  }
}