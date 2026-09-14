"use client";

import AdminForumPage from '@/app/admin/forum/page';

/**
 * لوحة منتدى المشرفين: تعيد استخدام نفس واجهة مراجعة المنتدى،
 * لكن الردود تصدر باسم المشرف الحالي مع شارة "مشرف المنصة"
 * (الهوية تُحدّد داخلياً من جلسة المشرف في AdminForumPage).
 */
export default function ModeratorForumPage() {
  return <AdminForumPage />;
}