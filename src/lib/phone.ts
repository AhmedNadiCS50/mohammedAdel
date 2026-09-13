// Normalize any Egyptian phone to the canonical local form: 010xxxxxxxx (11 digits)
export function normalizePhone(input: string): string {
  const digits = (input || '').trim().replace(/[^0-9]/g, '');
  if (!digits) return (input || '').trim();
  if (digits.startsWith('002') && digits.length > 11) {
    return '0' + digits.slice(3);
  }
  if (digits.startsWith('20') && digits.length === 13) {
    return '0' + digits.slice(2);
  }
  return digits;
}