import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db, auth, isFirebaseConfigured } from './firebase';
import { ensureAdminFirebaseAuth } from './firebaseAuth';

async function makeSureAdminIsAuthenticated() {
  if (auth && (!auth.currentUser || auth.currentUser.email !== 'admin@adel-tech.local')) {
    const code = await ensureAdminFirebaseAuth();
    if (code !== 'ok') {
      throw new Error(code);
    }
  }
}

function isAuthFailure(err: any): boolean {
  return !!err && typeof err.message === 'string' && err.message.startsWith('auth/');
}
import {
  Student,
  Lesson,
  Exam,
  ExamSubmission,
  LessonProgress,
  AccessCode,
  PlatformSettings,
  GradeLevel,
  ActivationLog
} from './types';

// Collection Names
export const COLLECTIONS = {
  STUDENTS: 'students',
  LESSONS: 'lessons',
  EXAMS: 'exams',
  SUBMISSIONS: 'submissions',
  PROGRESS: 'progress',
  ACCESS_CODES: 'access_codes',
  ACTIVATION_LOGS: 'activation_logs',
  SETTINGS: 'settings'
} as const;

// -------------------------------------------------------------
// STUDENTS
// -------------------------------------------------------------
export async function getStudentsFromFirestore(): Promise<Student[]> {
  if (!isFirebaseConfigured() || !db) return [];
  try {
    const colRef = collection(db, COLLECTIONS.STUDENTS);
    const snap = await getDocs(colRef);
    return snap.docs.map((d) => d.data() as Student);
  } catch (err) {
    console.error('Error fetching students from Firestore:', err);
    return [];
  }
}

export async function getStudentByIdFromFirestore(studentId: string): Promise<Student | null> {
  if (!isFirebaseConfigured() || !db) return null;
  try {
    const docRef = doc(db, COLLECTIONS.STUDENTS, studentId);
    const snap = await getDoc(docRef);
    return snap.exists() ? (snap.data() as Student) : null;
  } catch (err) {
    console.error('Error fetching student by ID:', err);
    return null;
  }
}

export async function getLessonByIdFromFirestore(lessonId: string): Promise<Lesson | null> {
  if (!isFirebaseConfigured() || !db) return null;
  try {
    const docRef = doc(db, COLLECTIONS.LESSONS, lessonId);
    const snap = await getDoc(docRef);
    return snap.exists() ? (snap.data() as Lesson) : null;
  } catch (err) {
    console.error('Error fetching lesson by ID:', err);
    return null;
  }
}

export async function saveStudentToFirestore(student: Student): Promise<boolean> {
  if (!isFirebaseConfigured() || !db) return false;
  try {
    await makeSureAdminIsAuthenticated();
    const docRef = doc(db, COLLECTIONS.STUDENTS, student.id);
    await setDoc(docRef, student, { merge: true });
    return true;
  } catch (err: any) {
    console.error('Error saving student to Firestore:', err);
    if (isAuthFailure(err)) throw err;
    return false;
  }
}

export async function deleteStudentFromFirestore(studentId: string): Promise<boolean> {
  if (!isFirebaseConfigured() || !db) return false;
  try {
    await makeSureAdminIsAuthenticated();
    const docRef = doc(db, COLLECTIONS.STUDENTS, studentId);
    await deleteDoc(docRef);
    return true;
  } catch (err: any) {
    console.error('Error deleting student from Firestore:', err);
    if (isAuthFailure(err)) throw err;
    return false;
  }
}

// -------------------------------------------------------------
// LESSONS
// -------------------------------------------------------------
export async function getLessonsFromFirestore(grade?: GradeLevel): Promise<Lesson[]> {
  if (!isFirebaseConfigured() || !db) return [];
  try {
    const colRef = collection(db, COLLECTIONS.LESSONS);
    const q = grade ? query(colRef, where('grade', '==', grade)) : colRef;
    const snap = await getDocs(q);
    const list = snap.docs.map((d) => d.data() as Lesson);
    return list.sort((a, b) => a.orderIndex - b.orderIndex);
  } catch (err) {
    console.error('Error fetching lessons from Firestore:', err);
    return [];
  }
}

export async function saveLessonToFirestore(lesson: Lesson): Promise<boolean> {
  if (!isFirebaseConfigured() || !db) return false;
  try {
    await makeSureAdminIsAuthenticated();
    const docRef = doc(db, COLLECTIONS.LESSONS, lesson.id);
    await setDoc(docRef, lesson, { merge: true });
    return true;
  } catch (err: any) {
    console.error('Error saving lesson to Firestore:', err);
    throw err;
  }
}

export async function deleteLessonFromFirestore(lessonId: string): Promise<boolean> {
  if (!isFirebaseConfigured() || !db) return false;
  try {
    await makeSureAdminIsAuthenticated();
    await deleteDoc(doc(db, COLLECTIONS.LESSONS, lessonId));
    return true;
  } catch (err: any) {
    console.error('Error deleting lesson from Firestore:', err);
    throw err;
  }
}

// -------------------------------------------------------------
// EXAMS
// -------------------------------------------------------------
export async function getExamsFromFirestore(grade?: GradeLevel): Promise<Exam[]> {
  if (!isFirebaseConfigured() || !db) return [];
  try {
    const colRef = collection(db, COLLECTIONS.EXAMS);
    const q = grade ? query(colRef, where('grade', '==', grade)) : colRef;
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as Exam);
  } catch (err) {
    console.error('Error fetching exams from Firestore:', err);
    return [];
  }
}

export async function getExamByIdFromFirestore(examId: string): Promise<Exam | null> {
  if (!isFirebaseConfigured() || !db) return null;
  try {
    const docRef = doc(db, COLLECTIONS.EXAMS, examId);
    const snap = await getDoc(docRef);
    return snap.exists() ? (snap.data() as Exam) : null;
  } catch (err) {
    console.error('Error fetching exam by ID:', err);
    return null;
  }
}

export async function saveExamToFirestore(exam: Exam): Promise<boolean> {
  if (!isFirebaseConfigured() || !db) return false;
  try {
    await makeSureAdminIsAuthenticated();
    await setDoc(doc(db, COLLECTIONS.EXAMS, exam.id), exam, { merge: true });
    return true;
  } catch (err: any) {
    console.error('Error saving exam to Firestore:', err);
    if (isAuthFailure(err)) throw err;
    return false;
  }
}

export async function deleteExamFromFirestore(examId: string): Promise<boolean> {
  if (!isFirebaseConfigured() || !db) return false;
  try {
    await makeSureAdminIsAuthenticated();
    await deleteDoc(doc(db, COLLECTIONS.EXAMS, examId));
    return true;
  } catch (err: any) {
    console.error('Error deleting exam from Firestore:', err);
    if (isAuthFailure(err)) throw err;
    return false;
  }
}

// -------------------------------------------------------------
// SUBMISSIONS
// -------------------------------------------------------------
export async function getSubmissionsFromFirestore(studentId?: string, examId?: string): Promise<ExamSubmission[]> {
  if (!isFirebaseConfigured() || !db) return [];
  try {
    const colRef = collection(db, COLLECTIONS.SUBMISSIONS);
    let q = query(colRef);
    if (studentId && examId) {
      q = query(colRef, where('studentId', '==', studentId), where('examId', '==', examId));
    } else if (studentId) {
      q = query(colRef, where('studentId', '==', studentId));
    } else if (examId) {
      q = query(colRef, where('examId', '==', examId));
    }
    const snap = await getDocs(q);
    const list = snap.docs.map((d) => d.data() as ExamSubmission);
    return list.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  } catch (err) {
    console.error('Error fetching submissions from Firestore:', err);
    return [];
  }
}

export async function saveSubmissionToFirestore(sub: ExamSubmission): Promise<boolean> {
  if (!isFirebaseConfigured() || !db) return false;
  try {
    await setDoc(doc(db, COLLECTIONS.SUBMISSIONS, sub.id), sub, { merge: true });
    return true;
  } catch (err) {
    console.error('Error saving submission to Firestore:', err);
    return false;
  }
}

// -------------------------------------------------------------
// LESSON WATCH PROGRESS
// -------------------------------------------------------------
export async function getLessonProgressFromFirestore(studentId: string, lessonId: string): Promise<LessonProgress | null> {
  if (!isFirebaseConfigured() || !db) return null;
  try {
    const docId = `${studentId}_${lessonId}`;
    const snap = await getDoc(doc(db, COLLECTIONS.PROGRESS, docId));
    return snap.exists() ? (snap.data() as LessonProgress) : null;
  } catch (err) {
    console.error('Error fetching lesson progress from Firestore:', err);
    return null;
  }
}

export async function getAllProgressForStudentFromFirestore(studentId: string): Promise<LessonProgress[]> {
  if (!isFirebaseConfigured() || !db) return [];
  try {
    const colRef = collection(db, COLLECTIONS.PROGRESS);
    const q = query(colRef, where('studentId', '==', studentId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as LessonProgress);
  } catch (err) {
    console.error('Error fetching student progress from Firestore:', err);
    return [];
  }
}

export async function saveLessonProgressToFirestore(progress: LessonProgress): Promise<boolean> {
  if (!isFirebaseConfigured() || !db) return false;
  try {
    const docId = `${progress.studentId}_${progress.lessonId}`;
    await setDoc(doc(db, COLLECTIONS.PROGRESS, docId), progress, { merge: true });
    return true;
  } catch (err) {
    console.error('Error saving lesson progress to Firestore:', err);
    return false;
  }
}

// -------------------------------------------------------------
// ACCESS CODES
// -------------------------------------------------------------
export async function getAccessCodesFromFirestore(): Promise<AccessCode[]> {
  if (!isFirebaseConfigured() || !db) return [];
  try {
    const colRef = collection(db, COLLECTIONS.ACCESS_CODES);
    const snap = await getDocs(colRef);
    const list = snap.docs.map((d) => d.data() as AccessCode);
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    console.error('Error fetching access codes from Firestore:', err);
    return [];
  }
}

export async function saveAccessCodeToFirestore(code: AccessCode): Promise<boolean> {
  if (!isFirebaseConfigured() || !db) return false;
  try {
    await makeSureAdminIsAuthenticated();
    const docId = code.code.trim().toUpperCase();
    await setDoc(doc(db, COLLECTIONS.ACCESS_CODES, docId), code, { merge: true });
    return true;
  } catch (err: any) {
    console.error('Error saving access code to Firestore:', err);
    if (isAuthFailure(err)) throw err;
    return false;
  }
}

// -------------------------------------------------------------
// SETTINGS
// -------------------------------------------------------------
export async function getSettingsFromFirestore(): Promise<PlatformSettings | null> {
  if (!isFirebaseConfigured() || !db) return null;
  try {
    const snap = await getDoc(doc(db, COLLECTIONS.SETTINGS, 'platform_settings'));
    return snap.exists() ? (snap.data() as PlatformSettings) : null;
  } catch (err) {
    console.error('Error fetching settings from Firestore:', err);
    return null;
  }
}

export async function saveSettingsToFirestore(settings: PlatformSettings): Promise<boolean> {
  if (!isFirebaseConfigured() || !db) return false;
  try {
    await makeSureAdminIsAuthenticated();
    await setDoc(doc(db, COLLECTIONS.SETTINGS, 'platform_settings'), settings, { merge: true });
    return true;
  } catch (err: any) {
    console.error('Error saving settings to Firestore:', err);
    if (isAuthFailure(err)) throw err;
    return false;
  }
}

// -------------------------------------------------------------
// ONE-CLICK MIGRATION: Upload localStorage items to Firestore
// -------------------------------------------------------------
export async function migrateLocalStorageToFirestore(localData: {
  students: Student[];
  lessons: Lesson[];
  exams: Exam[];
  submissions: ExamSubmission[];
  accessCodes: AccessCode[];
  progress: LessonProgress[];
  settings?: PlatformSettings;
}): Promise<{ success: boolean; counts: Record<string, number>; error?: string }> {
  if (!isFirebaseConfigured() || !db) {
    return { success: false, counts: {}, error: 'Firebase is not configured yet with valid credentials.' };
  }

  const counts = {
    students: 0,
    lessons: 0,
    exams: 0,
    submissions: 0,
    accessCodes: 0,
    progress: 0,
  };

  try {
    await makeSureAdminIsAuthenticated();
    // 1. Students
    for (const student of localData.students) {
      await setDoc(doc(db, COLLECTIONS.STUDENTS, student.id), student, { merge: true });
      counts.students++;
    }

    // 2. Lessons
    for (const lesson of localData.lessons) {
      await setDoc(doc(db, COLLECTIONS.LESSONS, lesson.id), lesson, { merge: true });
      counts.lessons++;
    }

    // 3. Exams
    for (const exam of localData.exams) {
      await setDoc(doc(db, COLLECTIONS.EXAMS, exam.id), exam, { merge: true });
      counts.exams++;
    }

    // 4. Submissions
    for (const sub of localData.submissions) {
      await setDoc(doc(db, COLLECTIONS.SUBMISSIONS, sub.id), sub, { merge: true });
      counts.submissions++;
    }

    // 5. Access codes
    for (const code of localData.accessCodes) {
      await setDoc(doc(db, COLLECTIONS.ACCESS_CODES, code.code.toUpperCase()), code, { merge: true });
      counts.accessCodes++;
    }

    // 6. Progress
    for (const p of localData.progress) {
      await setDoc(doc(db, COLLECTIONS.PROGRESS, `${p.studentId}_${p.lessonId}`), p, { merge: true });
      counts.progress++;
    }

    // 7. Settings
    if (localData.settings) {
      await setDoc(doc(db, COLLECTIONS.SETTINGS, 'platform_settings'), localData.settings, { merge: true });
    }

    return { success: true, counts };
  } catch (err: any) {
    console.error('Migration failed:', err);
    return { success: false, counts, error: err?.message || 'Unknown error occurred during migration.' };
  }
}
