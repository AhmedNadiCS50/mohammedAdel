export function formatTimeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'الآن';
  if (mins < 60) return `منذ ${mins} دقيقة`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `منذ ${hours} ساعة`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `منذ ${days} يوم`;
  return new Date(iso).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long' });
}

export function forumErrorMessage(err: any): string {
  const code = err?.code || err?.name || '';
  const raw = String(err?.message || '').toLowerCase();
  if (code.includes('permission-denied') || raw.includes('permission-denied')) {
    return 'صلاحيات المنتدى غير مفعّلة بعد. اطلب من المدرس: نشر مجموعتي forum_posts و forum_replies في قواعد Firebase، وتفعيل تسجيل الدخول (البريد الإلكتروني أو Anonymous) في Firebase Authentication.';
  }
  if (raw.includes('index')) {
    return 'الفهرس المطلوب للمنتدى لم يُنشأ بعد. افتح رابط الخطأ الظاهر في Console المتصفح وأنشئه مرة واحدة ثم حدّث الصفحة.';
  }
  return String(err?.message || 'تعذر الاتصال بالمنتدى.');
}