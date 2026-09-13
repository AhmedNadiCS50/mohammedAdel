import { NextResponse } from 'next/server';
import { head } from '@vercel/blob';
import { isSafeHlsToken } from '@/lib/hlsStorage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: { lessonId: string } }) {
  const { lessonId } = params;
  if (!isSafeHlsToken(lessonId)) {
    return new NextResponse('invalid lesson', { status: 400 });
  }
  const pathname = `lessons/${lessonId}/hls/key.bin`;
  try {
    const blob = await head(pathname);
    const res = await fetch(blob.url);
    if (!res.ok) {
      return new NextResponse('key unavailable', { status: 404 });
    }
    const buf = await res.arrayBuffer();
    return new NextResponse(buf, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    console.error('hls key error:', err);
    return new NextResponse('key unavailable', { status: 404 });
  }
}