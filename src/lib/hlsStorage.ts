export function isSafeHlsToken(value: string): boolean {
  return typeof value === 'string' && /^[a-zA-Z0-9_-]+$/.test(value);
}

const MIME_BY_EXT: Record<string, string> = {
  '.m3u8': 'application/vnd.apple.mpegurl',
  '.ts': 'video/mp2t',
  '.bin': 'application/octet-stream',
};

export function hlsContentType(file: string): string {
  const ext = '.' + (file.split('.').pop() || 'bin');
  return MIME_BY_EXT[ext] || 'application/octet-stream';
}