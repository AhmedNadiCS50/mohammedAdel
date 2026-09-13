import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';

export const runtime = 'nodejs';

const ALLOWED_TYPES = [
  'video/mp2t',                    // .ts segments
  'application/vnd.apple.mpegurl', // .m3u8 manifest
  'application/octet-stream',      // .bin key
];

function diag() {
  const rw = process.env.BLOB_READ_WRITE_TOKEN ?? '';
  return {
    rw: !!rw,
    rwLooksMasked: !!rw && rw.includes('*'),
    storeId: !!process.env.BLOB_STORE_ID,
    oidc: !!process.env.VERCEL_OIDC_TOKEN,
    vercelEnv: process.env.VERCEL_ENV ?? '(local)',
    projectName: process.env.VERCEL_PROJECT_NAME ?? '',
    region: process.env.VERCEL_REGION ?? '',
  };
}

export async function GET(_request: Request): Promise<Response> {
  return Response.json(diag());
}

export async function POST(request: Request): Promise<Response> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ALLOWED_TYPES,
        maximumSizeInBytes: 60 * 1024 * 1024,
        addRandomSuffix: false,
        allowOverwrite: true,
        cacheControlMaxAge: 3600,
      }),
      onUploadCompleted: async () => {
        // no-op: manifest write completes the package
      },
    });

    return Response.json(jsonResponse);
  } catch (error) {
    return Response.json(
      { error: (error as Error).message || 'upload failed', diag: diag() },
      { status: 400 }
    );
  }
}