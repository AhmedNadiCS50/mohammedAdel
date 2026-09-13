import { Student, Lesson, Exam, ExamSubmission, AccessCode, ActivationLog, PlatformSettings, GradeLevel, AcademicTrack, LessonProgress } from './types';
export type { Student, Lesson, Exam, ExamSubmission, AccessCode, ActivationLog, PlatformSettings, GradeLevel, AcademicTrack, LessonProgress };
import { STATIC_LESSONS } from '@/data/lessons';
import { isFirebaseConfigured } from './firebase';
import {
  getStudentsFromFirestore,
  findStudentByPhoneFromFirestore,
  saveStudentToFirestore,
  deleteStudentFromFirestore,
  getLessonsFromFirestore,
  saveLessonToFirestore,
  deleteLessonFromFirestore,
  getExamsFromFirestore,
  saveExamToFirestore,
  deleteExamFromFirestore,
  getSubmissionsFromFirestore,
  saveSubmissionToFirestore,
  saveLessonProgressToFirestore,
  getAccessCodesFromFirestore,
  saveAccessCodeToFirestore,
  getSettingsFromFirestore,
  saveSettingsToFirestore,
  migrateLocalStorageToFirestore
} from './firestoreService';
import { normalizePhone } from './phone';

// Default platform settings
export const DEFAULT_SETTINGS: PlatformSettings = {
  teacherName: 'مستر محمد عادل',
  platformTitle: 'مادة التكنولوجيا مع الخبير مستر محمد عادل',
  vodafoneCashNumber: '01000000000', // قابل للتعديل فوراً من لوحة تحكم المدرس
  instapayUsername: 'mr-mohamed-adel@instapay',
  whatsappNumber: '201000000000',
  announcementText: 'أهلاً بكم في المنصة الرسمية لمادة التكنولوجيا والبرمجة - دفعة 2027',
  completionThreshold: 90,
};

// Storage Keys
const KEYS = {
  STUDENTS: 'tech_adel_students',
  LESSONS: 'tech_adel_lessons',
  EXAMS: 'tech_adel_exams',
  SUBMISSIONS: 'tech_adel_submissions',
  CODES: 'tech_adel_codes',
  LOGS: 'tech_adel_logs',
  SETTINGS: 'tech_adel_settings',
  CURRENT_USER: 'tech_adel_session_user',
  ADMIN_AUTH: 'tech_adel_admin_logged_in',
  PROGRESS: 'tech_adel_progress',
};

// Safe Local Storage access (runs in browser)
function getLocal<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch (e) {
    console.error(`Error reading ${key} from storage:`, e);
    return fallback;
  }
}

function setLocal<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    // Trigger storage event so open tabs/components can re-render if needed
    window.dispatchEvent(new Event('platform-data-changed'));
  } catch (e) {
    console.error(`Error saving ${key} to storage:`, e);
  }
}

// ---------------------------
// SETTINGS
// ---------------------------
export function getSettings(): PlatformSettings {
  return getLocal<PlatformSettings>(KEYS.SETTINGS, DEFAULT_SETTINGS);
}

export function updateSettings(newSettings: Partial<PlatformSettings>): PlatformSettings {
  const current = getSettings();
  const updated = { ...current, ...newSettings };
  setLocal(KEYS.SETTINGS, updated);
  return updated;
}

// ---------------------------
// AUTHENTICATION & SESSION
// ---------------------------
export function getCurrentStudent(): Student | null {
  return getLocal<Student | null>(KEYS.CURRENT_USER, null);
}

export function setCurrentStudent(student: Student | null): void {
  setLocal(KEYS.CURRENT_USER, student);
}

export function isAdminLoggedIn(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(KEYS.ADMIN_AUTH) === 'true';
}

export function setAdminLoggedIn(status: boolean): void {
  if (typeof window === 'undefined') return;
  if (status) {
    localStorage.setItem(KEYS.ADMIN_AUTH, 'true');
  } else {
    localStorage.removeItem(KEYS.ADMIN_AUTH);
  }
  window.dispatchEvent(new Event('platform-data-changed'));
}

// -----------------------------------------------------------------
// CENTRAL FIRESTORE SYNC (Auto-sync cloud data to local state)
// -----------------------------------------------------------------
export async function syncFromFirestore(): Promise<{ synced: boolean; count: number }> {
  if (!isFirebaseConfigured()) return { synced: false, count: 0 };
  try {
    const [remoteStudents, remoteLessons, remoteExams, remoteSubs, remoteCodes, remoteSettings] = await Promise.all([
      getStudentsFromFirestore(),
      getLessonsFromFirestore(),
      getExamsFromFirestore(),
      getSubmissionsFromFirestore(),
      getAccessCodesFromFirestore(),
      getSettingsFromFirestore()
    ]);

    let count = 0;
    if (remoteStudents && remoteStudents.length > 0) {
      setLocal(KEYS.STUDENTS, remoteStudents);
      count += remoteStudents.length;
    }
    if (remoteLessons && remoteLessons.length > 0) {
      setLocal(KEYS.LESSONS, remoteLessons);
    }
    if (remoteExams && remoteExams.length > 0) {
      setLocal(KEYS.EXAMS, remoteExams);
    }
    if (remoteSubs && remoteSubs.length > 0) {
      setLocal(KEYS.SUBMISSIONS, remoteSubs);
    }
    if (remoteCodes && remoteCodes.length > 0) {
      setLocal(KEYS.CODES, remoteCodes);
    }
    if (remoteSettings) {
      setLocal(KEYS.SETTINGS, remoteSettings);
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('platform-data-changed'));
    }
    return { synced: true, count };
  } catch (err) {
    console.error('Failed to sync from Firestore:', err);
    return { synced: false, count: 0 };
  }
}

export async function executeMigrationToFirestore() {
  return await migrateLocalStorageToFirestore({
    students: getStudents(),
    lessons: getLessons(),
    exams: getExams(),
    submissions: getExamSubmissions(),
    accessCodes: getAccessCodes(),
    progress: getLocal<LessonProgress[]>(KEYS.PROGRESS, []),
    settings: getSettings(),
  });
}

// Async student login that checks Firestore if the user logged in from another device
export async function studentLoginAsync(phone: string, pin: string): Promise<{ success: boolean; student?: Student; error?: string }> {
  let students = getStudents();
  const cleanPhone = normalizePhone(phone);
  let found = students.find(s => normalizePhone(s.phone) === cleanPhone);

  if (!found && isFirebaseConfigured()) {
    try {
      // Query by exact phone so only the student's own readable document
      // is evaluated (a full collection read is denied by rules).
      const remoteStudent = await findStudentByPhoneFromFirestore(cleanPhone);
      if (remoteStudent) {
        // Merge this one student into the local list instead of replacing it
        if (!students.some(s => s.id === remoteStudent.id)) {
          students.push(remoteStudent);
        } else {
          students = students.map(s => s.id === remoteStudent.id ? remoteStudent : s);
        }
        setLocal(KEYS.STUDENTS, students);
        found = remoteStudent;
      }
    } catch (err) {
      console.warn('Could not query Firestore on login:', err);
    }
  }

  if (!found) {
    return { success: false, error: 'رقم الهاتف غير مسجل في المنصة. يرجى إنشاء حساب جديد أولاً.' };
  }

  const updatedStudent = verifySubscriptionExpiry(found);
  setCurrentStudent(updatedStudent);
  return { success: true, student: updatedStudent };
}

export function studentLogin(phone: string, pin: string): { success: boolean; student?: Student; error?: string } {
  const students = getStudents();
  const cleanPhone = normalizePhone(phone);
  const found = students.find(s => normalizePhone(s.phone) === cleanPhone);

  if (!found) {
    return { success: false, error: 'رقم الهاتف غير مسجل في المنصة. يرجى إنشاء حساب جديد أولاً.' };
  }

  // Refresh student's subscription expiration status dynamically
  const updatedStudent = verifySubscriptionExpiry(found);
  setCurrentStudent(updatedStudent);
  return { success: true, student: updatedStudent };
}

// ---------------------------
// STUDENTS MANAGEMENT
// ---------------------------
export function getStudents(): Student[] {
  const students = getLocal<Student[]>(KEYS.STUDENTS, []);
  // Refresh expiry status for all students
  return students.map(s => verifySubscriptionExpiry(s));
}

export function getStudentById(id: string): Student | null {
  const students = getStudents();
  const student = students.find(s => s.id === id);
  return student ? verifySubscriptionExpiry(student) : null;
}

export function registerStudent(studentData: Omit<Student, 'id' | 'createdAt' | 'subscription'>): { success: boolean; student?: Student; error?: string } {
  const students = getStudents();
  const cleanPhone = normalizePhone(studentData.phone);

  if (students.some(s => normalizePhone(s.phone) === cleanPhone)) {
    return { success: false, error: 'رقم الهاتف مسجل بالفعل مسبقاً. يرجى تسجيل الدخول.' };
  }

  const newStudent: Student = {
    ...studentData,
    id: 'std_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    phone: cleanPhone,
    createdAt: new Date().toISOString(),
    subscription: {
      isActive: false,
      expiresAt: null,
      activatedVia: 'none',
      customAccessCourses: [],
    },
  };

  students.push(newStudent);
  setLocal(KEYS.STUDENTS, students);
  setCurrentStudent(newStudent);

  // Sync to Firestore immediately
  if (isFirebaseConfigured()) {
    saveStudentToFirestore(newStudent).catch(err => console.error('Firestore saveStudent error:', err));
  }

  return { success: true, student: newStudent };
}

export function updateStudent(id: string, updates: Partial<Student>): Student | null {
  const students = getStudents();
  const index = students.findIndex(s => s.id === id);
  if (index === -1) return null;

  const current = students[index];
  const normalizedUpdates = updates.phone
    ? { ...updates, phone: normalizePhone(updates.phone) }
    : updates;
  const updated: Student = {
    ...current,
    ...normalizedUpdates,
    subscription: {
      ...current.subscription,
      ...(updates.subscription || {}),
    },
  };

  students[index] = updated;
  setLocal(KEYS.STUDENTS, students);

  // Sync to Firestore immediately
  if (isFirebaseConfigured()) {
    saveStudentToFirestore(updated).catch(err => console.error('Firestore updateStudent error:', err));
  }

  // If current logged-in user is this student, update session too
  const currentSession = getCurrentStudent();
  if (currentSession && currentSession.id === id) {
    setCurrentStudent(updated);
  }

  return updated;
}

export function deleteStudent(id: string): boolean {
  const students = getStudents();
  const student = students.find(s => s.id === id);
  const filtered = students.filter(s => s.id !== id);
  setLocal(KEYS.STUDENTS, filtered);

  if (isFirebaseConfigured()) {
    deleteStudentFromFirestore(id).catch(err => console.error('Firestore deleteStudent error:', err));
  }

  // If this student is currently in active session on this device, clear it
  const current = getCurrentStudent();
  if (current && current.id === id) {
    setCurrentStudent(null);
  }

  // Also clean up any exam submissions by this student
  const subs = getLocal<ExamSubmission[]>(KEYS.SUBMISSIONS, []);
  setLocal(KEYS.SUBMISSIONS, subs.filter(s => s.studentId !== id));

  if (student) {
    addLog({
      studentId: student.id,
      studentName: student.name,
      studentPhone: student.phone,
      type: 'full_month',
      detail: `تم حذف الطالب (${student.name}) نهائياً من المنصة وقاعدة البيانات بواسطة مستر محمد عادل`,
      activatedBy: 'teacher',
    });
  }

  return true;
}

// Check and update if student subscription has expired
export function verifySubscriptionExpiry(student: Student): Student {
  if (!student.subscription.isActive || !student.subscription.expiresAt) {
    return student;
  }

  const expiryDate = new Date(student.subscription.expiresAt);
  const now = new Date();

  if (now > expiryDate) {
    // Expired!
    student.subscription.isActive = false;
  }

  return student;
}

export function getDaysRemaining(expiresAt: string | null): number {
  if (!expiresAt) return 0;
  const expiry = new Date(expiresAt).getTime();
  const now = new Date().getTime();
  const diff = expiry - now;
  if (diff <= 0) return 0;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function isSubscriptionExpiringSoon(expiresAt: string | null): boolean {
  const days = getDaysRemaining(expiresAt);
  return days > 0 && days <= 3;
}

// ---------------------------
// MANUAL ACTIVATION & PERMISSIONS
// ---------------------------
export function manuallyActivateStudentMonth(studentId: string, monthName: string, durationDays: number = 30): { success: boolean; student?: Student } {
  const student = getStudentById(studentId);
  if (!student) return { success: false };

  const expiresDate = new Date();
  expiresDate.setDate(expiresDate.getDate() + durationDays);

  const updatedSubscription = {
    isActive: true,
    expiresAt: expiresDate.toISOString(),
    monthName,
    activatedAt: new Date().toISOString(),
    activatedVia: 'manual' as const,
    customAccessCourses: student.subscription.customAccessCourses || [],
  };

  const updated = updateStudent(studentId, { subscription: updatedSubscription });

  // Log the manual activation
  addLog({
    studentId: student.id,
    studentName: student.name,
    studentPhone: student.phone,
    type: 'full_month',
    detail: `تفعيل اشتراك شهر كامل: ${monthName} لمدة ${durationDays} يوم (تفعيل يدوي بواسطة مستر محمد عادل)`,
    activatedBy: 'teacher',
  });

  return { success: true, student: updated || undefined };
}

export function toggleStudentCourseAccess(studentId: string, courseId: string): { success: boolean; student?: Student; granted: boolean } {
  const student = getStudentById(studentId);
  if (!student) return { success: false, granted: false };

  const currentAccess = student.subscription.customAccessCourses || [];
  const exists = currentAccess.includes(courseId);

  let newAccess: string[];
  let granted = false;

  if (exists) {
    newAccess = currentAccess.filter(id => id !== courseId);
    granted = false;
  } else {
    newAccess = [...currentAccess, courseId];
    granted = true;
  }

  const updated = updateStudent(studentId, {
    subscription: {
      ...student.subscription,
      customAccessCourses: newAccess,
    }
  });

  addLog({
    studentId: student.id,
    studentName: student.name,
    studentPhone: student.phone,
    type: 'partial_course',
    detail: granted ? `إتاحة وصول خاص للدرس/الكورس [${courseId}]` : `إلغاء الوصول للدرس/الكورس [${courseId}]`,
    activatedBy: 'teacher',
  });

  return { success: true, student: updated || undefined, granted };
}

// ---------------------------
// ACCESS CODES
// ---------------------------
export function getAccessCodes(): AccessCode[] {
  return getLocal<AccessCode[]>(KEYS.CODES, []);
}

export function generateAccessCode(params: {
  grade: GradeLevel;
  month: string;
  durationDays?: number;
  courseId?: string;
}): AccessCode {
  const codes = getAccessCodes();
  // Generate code: ADEL-TECH-XXXX
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();
  const codeString = `ADEL-${randomSuffix}`;

  const newCode: AccessCode = {
    code: codeString,
    grade: params.grade,
    month: params.month,
    durationDays: params.durationDays || 30,
    courseId: params.courseId,
    isUsed: false,
    createdAt: new Date().toISOString(),
  };

  codes.unshift(newCode);
  setLocal(KEYS.CODES, codes);
  if (isFirebaseConfigured()) {
    saveAccessCodeToFirestore(newCode).catch(err => console.error('Firestore saveCode error:', err));
  }
  return newCode;
}

export function redeemAccessCode(codeString: string, studentId: string): { success: boolean; message: string; student?: Student } {
  const cleanCode = codeString.trim().toUpperCase();
  const codes = getAccessCodes();
  const codeIndex = codes.findIndex(c => c.code.toUpperCase() === cleanCode);

  if (codeIndex === -1) {
    return { success: false, message: 'كود التفعيل غير صحيح، يرجى التأكد من كتابته بدقة.' };
  }

  const code = codes[codeIndex];
  if (code.isUsed) {
    return { success: false, message: 'عفواً، هذا الكود تم استخدامه مسبقاً.' };
  }

  const student = getStudentById(studentId);
  if (!student) {
    return { success: false, message: 'تعذر العثور على بيانات الطالب.' };
  }

  // ✅ التحقق من تطابق الصف الدراسي
  if (code.grade !== student.grade) {
    return {
      success: false,
      message: `هذا الكود مخصص لـ ${GRADE_LABELS[code.grade]} فقط، وأنت مسجل في ${GRADE_LABELS[student.grade]}. يرجى التواصل مع المدرس للحصول على الكود الصحيح.`,
    };
  }

  // Calculate new expiration date
  const expiresDate = new Date();
  expiresDate.setDate(expiresDate.getDate() + (code.durationDays || 30));

  const customCourses = student.subscription.customAccessCourses || [];
  if (code.courseId && !customCourses.includes(code.courseId)) {
    customCourses.push(code.courseId);
  }

  const updatedSubscription = {
    isActive: true,
    expiresAt: expiresDate.toISOString(),
    monthName: code.month,
    activatedAt: new Date().toISOString(),
    activatedVia: 'code' as const,
    customAccessCourses: customCourses,
  };

  const updatedStudent = updateStudent(studentId, { subscription: updatedSubscription });

  // Mark code as used
  codes[codeIndex] = {
    ...code,
    isUsed: true,
    usedByStudentId: student.id,
    usedByStudentName: student.name,
    usedAt: new Date().toISOString(),
  };
  setLocal(KEYS.CODES, codes);

  if (isFirebaseConfigured()) {
    saveAccessCodeToFirestore(codes[codeIndex]).catch(err => console.error('Firestore redeemCode error:', err));
  }

  // Log redemption
  addLog({
    studentId: student.id,
    studentName: student.name,
    studentPhone: student.phone,
    type: 'code_redemption',
    detail: `تفعيل الاشتراك باستخدام كود تفعيل [${code.code}] لشهر: ${code.month} (${code.durationDays} يوم)`,
    activatedBy: 'student_code',
  });

  return { success: true, message: `تم تفعيل اشتراكك بنجاح لشهر ${code.month}! نتمنى لك التوفيق والدرجات النهائية.`, student: updatedStudent || undefined };
}

// ---------------------------
// Helper to normalize grade level variations (e.g. bac vs baccalaureate)
export function normalizeGrade(grade?: string): GradeLevel {
  if (!grade) return 'first_secondary_general';
  if (grade === 'second_secondary_baccalaureate' || grade === 'second_secondary_bac') {
    return 'second_secondary_bac';
  }
  if (grade === 'first_secondary_baccalaureate' || grade === 'first_secondary_bac') {
    return 'first_secondary_bac';
  }
  if (grade === 'second_secondary_general') {
    return 'second_secondary_general';
  }
  return 'first_secondary_general';
}

// ---------------------------
// LESSONS MANAGEMENT
// ---------------------------
export function getLessons(grade?: GradeLevel): Lesson[] {
  const local = getLocal<Lesson[]>(KEYS.LESSONS, []);
  const map = new Map<string, Lesson>();
  for (const l of STATIC_LESSONS) {
    map.set(l.id, l);
  }
  for (const l of local) {
    map.set(l.id, l);
  }
  const all = Array.from(map.values()).sort((a, b) => a.orderIndex - b.orderIndex);
  if (grade) {
    const norm = normalizeGrade(grade);
    return all.filter(l => normalizeGrade(l.grade) === norm);
  }
  return all;
}

export function getLessonById(id: string): Lesson | null {
  const lessons = getLessons();
  return lessons.find(l => l.id === id) || null;
}

export function saveLesson(lessonData: Omit<Lesson, 'id' | 'createdAt'>, existingId?: string): Lesson {
  const lessons = getLessons();
  if (existingId) {
    const index = lessons.findIndex(l => l.id === existingId);
    if (index !== -1) {
      lessons[index] = {
        ...lessons[index],
        ...lessonData,
      };
      setLocal(KEYS.LESSONS, lessons);
      if (isFirebaseConfigured()) {
        saveLessonToFirestore(lessons[index]).catch(err => console.error('Firestore saveLesson error:', err));
      }
      return lessons[index];
    }
  }

  const newLesson: Lesson = {
    ...lessonData,
    id: 'les_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    createdAt: new Date().toISOString(),
  };
  lessons.push(newLesson);
  setLocal(KEYS.LESSONS, lessons);
  if (isFirebaseConfigured()) {
    saveLessonToFirestore(newLesson).catch(err => console.error('Firestore saveLesson error:', err));
  }
  return newLesson;
}

export function deleteLesson(id: string): boolean {
  const lessons = getLessons();
  const filtered = lessons.filter(l => l.id !== id);
  setLocal(KEYS.LESSONS, filtered);
  if (isFirebaseConfigured()) {
    deleteLessonFromFirestore(id).catch(err => console.error('Firestore deleteLesson error:', err));
  }
  return true;
}

// Helper to extract YouTube video ID from normal/short/unlisted URLs
export function extractYoutubeId(urlOrId: string): string {
  if (!urlOrId) return '';
  const trimmed = urlOrId.trim();
  if (trimmed.length === 11 && !trimmed.includes('/') && !trimmed.includes('.')) {
    return trimmed;
  }
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = trimmed.match(regExp);
  return (match && match[2].length === 11) ? match[2] : trimmed;
}

// Check student permission for a specific lesson
export function canStudentAccessLesson(student: Student | null, lesson: Lesson): boolean {
  if (!student) return false;
  // If student has active subscription for this grade
  if (student.subscription.isActive && normalizeGrade(student.grade) === normalizeGrade(lesson.grade)) {
    return true;
  }
  // Or if teacher gave specific custom access to this lesson
  if (student.subscription.customAccessCourses?.includes(lesson.id)) {
    return true;
  }
  return false;
}

// ---------------------------
// LESSON PROGRESS & SEQUENTIAL UNLOCK
// ---------------------------
export function getLessonProgress(studentId: string, lessonId: string): LessonProgress | null {
  const allProgress = getLocal<LessonProgress[]>(KEYS.PROGRESS, []);
  return allProgress.find(p => p.studentId === studentId && p.lessonId === lessonId) || null;
}

export function getAllProgressForStudent(studentId: string): LessonProgress[] {
  const allProgress = getLocal<LessonProgress[]>(KEYS.PROGRESS, []);
  return allProgress.filter(p => p.studentId === studentId);
}

export function saveLessonProgress(progressData: {
  studentId: string;
  lessonId: string;
  watchedSeconds: number;
  durationSeconds: number;
  watchPercentage: number;
  completed: boolean;
}): LessonProgress {
  const allProgress = getLocal<LessonProgress[]>(KEYS.PROGRESS, []);
  const index = allProgress.findIndex(p => p.studentId === progressData.studentId && p.lessonId === progressData.lessonId);

  const updatedItem: LessonProgress = {
    ...progressData,
    lastUpdated: new Date().toISOString(),
  };

  // If already was completed, don't revert to uncompleted
  if (index !== -1 && allProgress[index].completed) {
    updatedItem.completed = true;
  }

  if (index !== -1) {
    allProgress[index] = updatedItem;
  } else {
    allProgress.push(updatedItem);
  }

  setLocal(KEYS.PROGRESS, allProgress);
  if (isFirebaseConfigured()) {
    saveLessonProgressToFirestore(updatedItem).catch(err => console.error('Firestore saveProgress error:', err));
  }
  return updatedItem;
}

export function isLessonCompleted(studentId: string, lessonId: string): boolean {
  const progress = getLessonProgress(studentId, lessonId);
  return !!progress?.completed;
}

export function canStudentAccessLessonSequential(
  student: Student | null,
  lesson: Lesson,
  allLessons: Lesson[]
): { canAccess: boolean; reason: 'subscription_needed' | 'previous_locked' | 'allowed'; previousLesson?: Lesson } {
  if (!student) {
    return { canAccess: false, reason: 'subscription_needed' };
  }

  // First check: does student have subscription or course permission?
  const hasBaseAccess = canStudentAccessLesson(student, lesson);
  if (!hasBaseAccess) {
    return { canAccess: false, reason: 'subscription_needed' };
  }

  // Teacher manual override for this specific student:
  if (student.subscription.unlockedLessons?.includes(lesson.id)) {
    return { canAccess: true, reason: 'allowed' };
  }

  // Sort lessons of same grade by orderIndex (or createdAt)
  const gradeLessons = allLessons
    .filter(l => l.grade === lesson.grade)
    .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0) || a.createdAt.localeCompare(b.createdAt));

  const currentIndex = gradeLessons.findIndex(l => l.id === lesson.id);

  // If it's the very first lesson (or not found in list), allow access
  if (currentIndex <= 0) {
    return { canAccess: true, reason: 'allowed' };
  }

  // Otherwise, must complete the previous lesson
  const prevLesson = gradeLessons[currentIndex - 1];
  const prevCompleted = isLessonCompleted(student.id, prevLesson.id);

  if (prevCompleted) {
    return { canAccess: true, reason: 'allowed' };
  }

  return { canAccess: false, reason: 'previous_locked', previousLesson: prevLesson };
}

// Teacher manually unlocks a specific lesson for a student (override sequential lock)
export function manuallyUnlockLesson(studentId: string, lessonId: string): boolean {
  const student = getStudentById(studentId);
  if (!student) return false;

  const currentUnlocked = student.subscription.unlockedLessons || [];
  if (!currentUnlocked.includes(lessonId)) {
    const updated = [...currentUnlocked, lessonId];
    updateStudent(studentId, {
      subscription: {
        ...student.subscription,
        unlockedLessons: updated,
      },
    });

    addLog({
      studentId: student.id,
      studentName: student.name,
      studentPhone: student.phone,
      type: 'partial_course',
      detail: `تجاوز يدوي: فتح المحاضرة [${lessonId}] للطالب دون اشتراط إنهاء المحاضرة السابقة`,
      activatedBy: 'teacher',
    });
  }
  return true;
}

// Teacher manually removes unlock override for a lesson
export function manuallyLockLesson(studentId: string, lessonId: string): boolean {
  const student = getStudentById(studentId);
  if (!student) return false;

  const currentUnlocked = student.subscription.unlockedLessons || [];
  if (currentUnlocked.includes(lessonId)) {
    const updated = currentUnlocked.filter(id => id !== lessonId);
    updateStudent(studentId, {
      subscription: {
        ...student.subscription,
        unlockedLessons: updated,
      },
    });
  }
  return true;
}

// ---------------------------
// EXAMS MANAGEMENT
// ---------------------------
export function getExams(grade?: GradeLevel): Exam[] {
  const exams = getLocal<Exam[]>(KEYS.EXAMS, []);
  if (grade) {
    const norm = normalizeGrade(grade);
    return exams.filter(e => normalizeGrade(e.grade) === norm);
  }
  return exams;
}

export function getExamById(id: string): Exam | null {
  const exams = getExams();
  return exams.find(e => e.id === id) || null;
}

export function saveExam(examData: Omit<Exam, 'id' | 'createdAt'>, existingId?: string): Exam {
  const exams = getExams();
  if (existingId) {
    const index = exams.findIndex(e => e.id === existingId);
    if (index !== -1) {
      exams[index] = {
        ...exams[index],
        ...examData,
      };
      setLocal(KEYS.EXAMS, exams);
      if (isFirebaseConfigured()) {
        saveExamToFirestore(exams[index]).catch(err => console.error('Firestore saveExam error:', err));
      }
      return exams[index];
    }
  }

  const newExam: Exam = {
    ...examData,
    id: 'ex_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    createdAt: new Date().toISOString(),
  };
  exams.push(newExam);
  setLocal(KEYS.EXAMS, exams);
  if (isFirebaseConfigured()) {
    saveExamToFirestore(newExam).catch(err => console.error('Firestore saveExam error:', err));
  }
  return newExam;
}

export function deleteExam(id: string): boolean {
  const exams = getExams();
  const filtered = exams.filter(e => e.id !== id);
  setLocal(KEYS.EXAMS, filtered);
  if (isFirebaseConfigured()) {
    deleteExamFromFirestore(id).catch(err => console.error('Firestore deleteExam error:', err));
  }
  return true;
}

// ---------------------------
// EXAM SUBMISSIONS & GRADING
// ---------------------------
export function getExamSubmissions(studentId?: string, examId?: string): ExamSubmission[] {
  let list = getLocal<ExamSubmission[]>(KEYS.SUBMISSIONS, []);
  if (studentId) list = list.filter(s => s.studentId === studentId);
  if (examId) list = list.filter(s => s.examId === examId);
  return list;
}

export function submitExamAnswers(params: {
  exam: Exam;
  student: Student;
  answers: Record<string, number>; // questionId -> selectedIndex
  essayAnswers?: Record<string, string>; // questionId -> student text
}): ExamSubmission {
  const { exam, student, answers, essayAnswers = {} } = params;
  let earnedScore = 0;
  let totalScore = 0;
  const essayGrades: Record<string, number | null> = {};
  let hasPendingEssays = false;

  exam.questions.forEach(q => {
    totalScore += q.points;
    if (q.type === 'essay') {
      essayGrades[q.id] = null; // initially unreviewed
      hasPendingEssays = true;
    } else {
      const selected = answers[q.id];
      if (selected !== undefined && selected === q.correctOptionIndex) {
        earnedScore += q.points;
      }
    }
  });

  const percentage = totalScore > 0 ? Math.round((earnedScore / totalScore) * 100) : 0;
  // If exam has essay questions, final pass/fail is determined after teacher review
  const passed = hasPendingEssays ? false : percentage >= (exam.passingScore || 50);

  const submission: ExamSubmission = {
    id: 'sub_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    examId: exam.id,
    examTitle: exam.title,
    studentId: student.id,
    studentName: student.name,
    studentPhone: student.phone,
    score: earnedScore,
    totalScore,
    percentage,
    passed,
    answers,
    essayAnswers,
    essayGrades,
    hasPendingEssays,
    submittedAt: new Date().toISOString(),
  };

  const list = getExamSubmissions();
  list.unshift(submission);
  setLocal(KEYS.SUBMISSIONS, list);

  if (isFirebaseConfigured()) {
    saveSubmissionToFirestore(submission).catch(err => console.error('Firestore saveSubmission error:', err));
  }

  return submission;
}

// Teacher manually grades an essay answer
export function gradeEssayAnswer(submissionId: string, questionId: string, grade: number): ExamSubmission | null {
  const list = getLocal<ExamSubmission[]>(KEYS.SUBMISSIONS, []);
  const subIndex = list.findIndex(s => s.id === submissionId);
  if (subIndex === -1) return null;

  const sub = list[subIndex];
  const exam = getExamById(sub.examId);

  // Update this question's grade
  const updatedGrades = { ...sub.essayGrades, [questionId]: grade };

  // Recalculate score
  let newEarnedScore = 0;
  if (exam) {
    exam.questions.forEach(q => {
      if (q.type === 'essay') {
        const g = updatedGrades[q.id];
        if (typeof g === 'number') {
          newEarnedScore += g;
        }
      } else {
        const selected = sub.answers[q.id];
        if (selected !== undefined && selected === q.correctOptionIndex) {
          newEarnedScore += q.points;
        }
      }
    });
  } else {
    newEarnedScore = sub.score + grade;
  }

  // Check if any essay questions are still pending (null)
  const stillHasPending = Object.values(updatedGrades).some(g => g === null);

  const newPercentage = sub.totalScore > 0 ? Math.round((newEarnedScore / sub.totalScore) * 100) : 0;
  const passingThreshold = exam?.passingScore || 50;
  const newPassed = stillHasPending ? false : newPercentage >= passingThreshold;

  const updatedSubmission: ExamSubmission = {
    ...sub,
    essayGrades: updatedGrades,
    score: newEarnedScore,
    percentage: newPercentage,
    passed: newPassed,
    hasPendingEssays: stillHasPending,
  };

  list[subIndex] = updatedSubmission;
  setLocal(KEYS.SUBMISSIONS, list);

  if (isFirebaseConfigured()) {
    saveSubmissionToFirestore(updatedSubmission).catch(err => console.error('Firestore gradeEssay error:', err));
  }

  return updatedSubmission;
}

// Get all submissions waiting for essay grading
export function getPendingEssaySubmissions(): ExamSubmission[] {
  const list = getLocal<ExamSubmission[]>(KEYS.SUBMISSIONS, []);
  return list.filter(s => s.hasPendingEssays === true);
}

// ---------------------------
// ACTIVATION LOGS
// ---------------------------
export function getActivationLogs(): ActivationLog[] {
  return getLocal<ActivationLog[]>(KEYS.LOGS, []);
}

export function addLog(entry: Omit<ActivationLog, 'id' | 'timestamp'>): void {
  const logs = getActivationLogs();
  const newLog: ActivationLog = {
    ...entry,
    id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    timestamp: new Date().toISOString(),
  };
  logs.unshift(newLog);
  // Keep last 300 logs
  setLocal(KEYS.LOGS, logs.slice(0, 300));
}

export const GRADE_LABELS: Record<GradeLevel, string> = {
  first_secondary_general: 'الصف الأول الثانوي (عام)',
  first_secondary_bac: 'الصف الأول الثانوي (بكالوريا)',
  first_secondary_baccalaureate: 'الصف الأول الثانوي (بكالوريا)',
  second_secondary_general: 'الصف الثاني الثانوي (عام)',
  second_secondary_bac: 'الصف الثاني الثانوي (بكالوريا)',
  second_secondary_baccalaureate: 'الصف الثاني الثانوي (بكالوريا)',
};

export const TRACK_LABELS: Record<AcademicTrack, string> = {
  general: 'عام',
  scientific: 'علمي',
  literary: 'أدبي',
};
