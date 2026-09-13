import { NextResponse } from 'next/server';
import { storageDownloadUrl, isSafeHlsToken, hlsContentType } from '@/lib/hlsStorage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: { lessonId: string; file: string } }) {
  const { lessonId, file } = params;
  if (!isSafeHlsToken(lessonId) || !/^[a-zA-Z0-9._-]+$/.test(file)) {
    return new NextResponse('invalid request', { status: 400 });
  }
  const path = `lessons/${lessonId}/hls/${file}`;
  try {
    const res = await fetch(storageDownloadUrl(path), { cache: 'no-store' });
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
    return new NextResponse('segment error', { status: 500 });
  }
}