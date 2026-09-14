"use client";

import AdminSubmissionsPage from '@/app/admin/submissions/page';

/**
 * صفحة تصحيح المقالي للمشرف: تعيد استخدام نفس واجهة التصحيح،
 * مع إخفاء رابط بنك الأسئلة وربط كل عملية تصحيح بسجل نشاط المشرف.
 */
export default function ModeratorSubmissionsPage() {
  return <AdminSubmissionsPage />;
}