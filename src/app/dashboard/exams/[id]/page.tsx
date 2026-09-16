"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { getCurrentStudent, getExamById, GRADE_LABELS } from '@/lib/storage';
import { getExamByIdFromFirestore } from '@/lib/firestoreService';
import { isFirebaseConfigured } from '@/lib/firebase';
import { Student, Exam } from '@/lib/types';
import ExamRunner from '@/components/ExamRunner';
import { ArrowRight, Lock, AlertCircle } from 'lucide-react';

export default function TakeExamPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params.id as string;

  const [student, setStudent] = useState<Student | null>(null);
  const [exam, setExam] = useState<Exam | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const s = getCurrentStudent();
    if (!s) {
      router.push('/login');
      return;
    }
    setStudent(s);

    const loadExam = async () => {
      let e = getExamById(examId);

      // New exams are stored in Firestore, not localStorage — fetch as fallback.
      if (!e && isFirebaseConfigured()) {
        const remote = await getExamByIdFromFirestore(examId);
        if (remote && remote.grade === s.grade) {
          e = remote;
        }
      }

      setExam(e);
      setIsLoading(false);
    };

    loadExam();
  }, [examId, router]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-green-800 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-gray-800">عفواً، لم يتم العثور على هذا الامتحان</h2>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 text-white rounded-xl text-xs font-bold shadow-sm"
          style={{ background: '#1B4332' }}
        >
          <ArrowRight className="w-4 h-4" />
          العودة للوحة الطالب
        </Link>
      </div>
    );
  }

  if (!student) return null;

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-green-800 bg-white border border-gray-200 px-3.5 py-2 rounded-xl transition-colors shadow-sm shrink-0"
          >
            <ArrowRight className="w-4 h-4" />
            <span className="hidden min-[400px]:inline">العودة للوحة الدروس</span>
          </Link>

          <span className="text-xs font-bold text-green-800 bg-green-50 px-3 py-1.5 rounded-xl border border-green-200">
            {GRADE_LABELS[exam.grade]} • {exam.month}
          </span>
        </div>

        <ExamRunner exam={exam} student={student} />
      </div>
    </div>
  );
}
