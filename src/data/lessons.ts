import { Lesson } from '@/lib/types';

/**
 * قائمة المحاضرات المعتمدة للمنصة (بدون الحاجة لأي قاعدة بيانات سحابية)
 * يتم قراءة هذه المحاضرات مباشرة وتظهر لجميع الطلاب تلقائياً وفوراً.
 */
export const STATIC_LESSONS: Lesson[] = [
  {
    id: 'les_sec2_bac_01',
    title: 'الدرس الأول مادة البرمجة 2027 | تطور تكنولوجيا المعلومات والتحول الاجتماعي 2027 مسار الهندسة',
    description: 'شرح الدرس الأول في مادة البرمجة وتكنولوجيا المعلومات لطلاب الصف الثاني الثانوي بكالوريا - مسار الهندسة.',
    grade: 'second_secondary_bac',
    track: 'all',
    month: 'شهر أكتوبر',
    youtubeVideoId: 'vCSzHBIfORg',
    pdfAttachmentUrl: 'https://drive.google.com/file/d/1BOjr3M7RNUyWJZQ2PNyUWIJbqjL7aVAI/view?usp=drivesdk',
    durationMinutes: 45,
    orderIndex: 1,
    createdAt: '2026-09-13T01:53:00.000Z'
  }
];
