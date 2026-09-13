export type GradeLevel = 
  | 'first_secondary_general' 
  | 'first_secondary_bac' 
  | 'first_secondary_baccalaureate'
  | 'second_secondary_general' 
  | 'second_secondary_bac'
  | 'second_secondary_baccalaureate';
export type AcademicTrack = 'general' | 'scientific' | 'literary';
export type QuestionType = 'mcq' | 'essay';

export interface Student {
  id: string;
  name: string;
  phone: string;
  parentPhone: string;
  grade: GradeLevel;
  track?: AcademicTrack;
  governorate?: string;
  createdAt: string;
  subscription: {
    isActive: boolean;
    expiresAt: string | null;
    monthName?: string;
    activatedAt?: string;
    activatedVia: 'code' | 'manual' | 'none';
    customAccessCourses?: string[];   // lesson IDs with partial access
    unlockedLessons?: string[];       // manually unlocked lessons (sequential override)
  };
  notes?: string;
}

export type LessonVideoSource = 'youtube' | 'hls';

export interface Lesson {
  id: string;
  title: string;
  description: string;
  grade: GradeLevel;
  track?: AcademicTrack | 'all';
  month: string;
  videoSource?: LessonVideoSource;
  youtubeVideoId?: string;
  hlsPath?: string;
  pdfAttachmentUrl?: string;
  durationMinutes?: number;
  orderIndex: number;
  createdAt: string;
}

// Track student watch progress for sequential unlock
export interface LessonProgress {
  studentId: string;
  lessonId: string;
  watchedSeconds: number;
  durationSeconds: number;       // total video duration (fetched from YT API)
  watchPercentage: number;       // 0–100
  completed: boolean;            // true when >= completionThreshold
  lastUpdated: string;
}

export interface Question {
  id: string;
  type: QuestionType;            // 'mcq' | 'essay'
  text: string;
  options: string[];             // 4 options (empty for essay)
  correctOptionIndex: number;    // 0-3 for MCQ, -1 for essay
  points: number;
  explanation?: string;
}

export interface Exam {
  id: string;
  title: string;
  description: string;
  grade: GradeLevel;
  month: string;
  lessonId?: string;
  durationMinutes: number;
  passingScore: number;
  questions: Question[];
  createdAt: string;
}

export interface ExamSubmission {
  id: string;
  examId: string;
  examTitle: string;
  studentId: string;
  studentName: string;
  studentPhone: string;
  score: number;
  totalScore: number;
  percentage: number;
  passed: boolean;
  answers: Record<string, number>;           // MCQ: questionId -> chosenOptionIndex
  essayAnswers: Record<string, string>;      // Essay: questionId -> text answer
  essayGrades: Record<string, number | null>; // Essay grades set by teacher (null = pending)
  hasPendingEssays: boolean;
  submittedAt: string;
  // Homework attachments (photos of the notebook etc.)
  attachments?: SubmissionAttachment[];
  // Overall teacher feedback shown to the student with the result
  teacherComment?: string;
}

export interface SubmissionAttachment {
  name: string;
  url: string;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  grade: GradeLevel;
  month: string;
  maxScore: number;
  dueDate?: string;
  createdAt: string;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  studentId: string;
  studentName: string;
  studentPhone: string;
  answerText: string;
  attachments?: SubmissionAttachment[];
  status: 'submitted' | 'graded';
  score?: number;
  maxScore: number;
  passed: boolean;
  teacherComment?: string;
  submittedAt: string;
  gradedAt?: string;
}

export interface AccessCode {
  code: string;
  grade: GradeLevel;
  month: string;
  durationDays: number;
  courseId?: string;
  isUsed: boolean;
  usedByStudentId?: string;
  usedByStudentName?: string;
  usedAt?: string;
  createdAt: string;
}

export interface ActivationLog {
  id: string;
  studentId: string;
  studentName: string;
  studentPhone: string;
  type: 'full_month' | 'partial_course' | 'code_redemption';
  detail: string;
  activatedBy: 'teacher' | 'student_code';
  timestamp: string;
}

export type ForumPostStatus = 'pending' | 'published' | 'rejected';
export type ForumAuthorRole = 'student' | 'teacher';

export interface ForumPost {
  id: string;
  title: string;
  content: string;
  grade: GradeLevel;
  authorStudentId: string;
  authorName: string;
  authorPhone: string;
  authorRole: ForumAuthorRole;
  status: ForumPostStatus;
  pinned?: boolean;
  rejectionReason?: string;
  replyCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ForumReply {
  id: string;
  postId: string;
  content: string;
  authorStudentId: string;
  authorName: string;
  authorPhone: string;
  authorRole: ForumAuthorRole;
  status: ForumPostStatus;
  createdAt: string;
}

export interface PlatformSettings {
  teacherName: string;
  platformTitle: string;
  vodafoneCashNumber: string;
  instapayUsername: string;
  whatsappNumber: string;
  adminPasswordHash?: string;
  announcementText?: string;
  // Sequential unlock threshold (0-100), default 90
  completionThreshold?: number;
}
