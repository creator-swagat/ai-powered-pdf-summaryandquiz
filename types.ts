export interface QuizQuestion {
  question: string;
  options?: string[];
  answer: string;
  explanation: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
  userAnswer?: string;
  isCorrect?: boolean;
}

export interface StudyPlanWeek {
  week: number;
  topics: string[];
  goals: string[];
  reviewPoints: string[];
}

export type GeneratedContentType = 'summary' | 'studyPlan' | 'quiz';

export interface GeneratedContent {
  summary: string | null;
  studyPlan: StudyPlanWeek[] | null;
  quiz: QuizQuestion[] | null;
}