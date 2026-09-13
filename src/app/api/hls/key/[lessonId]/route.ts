import { NextResponse } from 'next/server';
import { storageDownloadUrl, isSafeHlsToken } from '@/lib/hlsStorage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: { lessonId: string } }) {
  const { lessonId } = params;
  if (!isSafeHlsToken(lessonId)) {
    return new NextResponse('invalid lesson', { status: 400 });
  }
  const path = `lessons/${lessonId}/hls/key.bin`;
  try {
    const res = await fetch(storageDownloadUrl(path), { cache: 'no-store' });
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
    return new NextResponse('key error', { status: 500 });
  }
}