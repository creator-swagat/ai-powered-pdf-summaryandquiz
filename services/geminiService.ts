import type { QuizQuestion, StudyPlanWeek } from '../types';

const generateContent = async <T,>(text: string, type: 'summary' | 'studyPlan' | 'quiz'): Promise<T> => {
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text, type }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'An unknown error occurred while processing the request.' }));
    throw new Error(`Failed to generate content: ${errorData.error || response.statusText}`);
  }
  
  return response.json();
};

export const generateSummary = async (text: string): Promise<string> => {
  return generateContent<string>(text, 'summary');
};

export const generateStudyPlan = async (text: string): Promise<StudyPlanWeek[]> => {
  return generateContent<StudyPlanWeek[]>(text, 'studyPlan');
};

export const generateQuiz = async (text: string): Promise<QuizQuestion[]> => {
  return generateContent<QuizQuestion[]>(text, 'quiz');
};