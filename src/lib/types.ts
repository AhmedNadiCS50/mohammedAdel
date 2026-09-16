export type GradeLevel = 
  | 'first_secondary_general' 
  | 'first_secondary_bac' 
  | 'first_secondary_baccalaureate'
  | 'first_secondary_azhari'
  | 'second_secondary_general' 
  | 'second_secondary_bac'
  | 'second_secondary_baccalaureate'
  | 'second_secondary_azhari';
export type AcademicTrack =
  | 'general'
  | 'scientific'
  | 'literary'
  | 'bac_medical'       // بكالوريا: طب وعلوم حياة
  | 'bac_engineering'   // بكالوريا: هندسة وعلوم حاسب
  | 'bac_business'      // بكالوريا: إدارة أعمال ومحاسبة
  | 'bac_arts';         // بكالوريا: آداب وفنون
export type QuestionType = 'mcq' | 'essay';

export interface Student {
  id: string;
  name: string;
  phone: string;
  parentPhone: string;
  governorate?: string;
  grade: GradeLevel;
  track?: AcademicTrack;
  bacTrack?: string; // مسار البكالوريا: طب/هندسة/إدارة/آداب
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
  photoUrl?: string;
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
  chapters?: VideoChapter[];
  durationMinutes?: number;
  orderIndex: number;
  createdAt: string;
}

export interface VideoChapter {
  title: string;
  timeSeconds: number;
}

export interface LessonNote {
  id: string;
  studentId: string;
  lessonId: string;
  text: string;
  timeSeconds: number;
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
export type ForumAuthorRole = 'student' | 'teacher' | 'moderator';
export type ForumTopic = 'lesson' | 'homework' | 'exam' | 'general';

export interface Moderator {
  id: string;
  name: string;
  username: string;
  passwordHash: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export interface ModeratorAction {
  id: string;
  actorId: string;
  actorName: string;
  action: string;
  targetType: string;
  targetId?: string;
  detail?: string;
  timestamp: string;
}

export interface ForumPost {
  id: string;
  title: string;
  content: string;
  grade: GradeLevel;
  topic?: ForumTopic;
  lessonId?: string;
  authorStudentId: string;
  authorName: string;
  authorPhone: string;
  authorRole: ForumAuthorRole;
  authorPhotoUrl?: string;
  status: ForumPostStatus;
  pinned?: boolean;
  rejectionReason?: string;
  replyCount?: number;
  resolved?: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
  imageUrls?: string[];
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
  authorPhotoUrl?: string;
  status: ForumPostStatus;
  imageUrls?: string[];
  audioUrl?: string;
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

// Typed mute record stored in the `student_mutes` collection. A student is
// blocked from posting forum content while `until` is in the future.
export interface StudentMute {
  id: string;
  until: string;   // ISO timestamp; '' means not muted
  reason?: string;
  mutedBy?: string;
  setAt?: string;
}
