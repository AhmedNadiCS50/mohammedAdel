import { NextResponse } from 'next/server';
import { head } from '@vercel/blob';
import { isSafeHlsToken, hlsContentType } from '@/lib/hlsStorage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: { lessonId: string; file: string } }) {
  const { lessonId, file } = params;
  if (!isSafeHlsToken(lessonId) || !/^[a-zA-Z0-9._-]+$/.test(file)) {
    return new NextResponse('invalid request', { status: 400 });
  }
  const pathname = `lessons/${lessonId}/hls/${file}`;
  try {
    const blob = await head(pathname);
    const res = await fetch(blob.url);
    if (!res.ok) {
      return new NextResponse('segment unavailable', { status: 404 });
    }
    const buf = await res.arrayBuffer();
    return new NextResponse(buf, {
      headers: {
        'Content-Type': hlsContentType(file),
        'Cache-Control': file.endsWith('.ts') ? 'public, max-age=3600' : 'no-store',
      },
    });
  } catch (err) {
    console.error('hls play error:', err);
    return new NextResponse('segment unavailable', { status: 404 });
  }
}