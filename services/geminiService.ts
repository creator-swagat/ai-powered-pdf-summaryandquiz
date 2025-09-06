import { GoogleGenAI, Type } from "@google/genai";
import type { QuizQuestion, StudyPlanWeek } from '../types';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const callGeminiWithRetry = async <T,>(prompt: string, schema?: object): Promise<T> => {
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: schema ? {
          responseMimeType: "application/json",
          responseSchema: schema,
        } : {},
      });
      
      const textResponse = response.text.trim();
      if (schema) {
        return JSON.parse(textResponse) as T;
      }
      return textResponse as T;
    } catch (error) {
      console.error(`Gemini API call failed (attempt ${i + 1}):`, error);
      if (i === MAX_RETRIES - 1) {
        throw new Error("Failed to get a response from the AI model after multiple retries.");
      }
      await new Promise(res => setTimeout(res, RETRY_DELAY * (i + 1)));
    }
  }
  throw new Error("Gemini API call failed unexpectedly.");
};

export const generateSummary = async (text: string): Promise<string> => {
  const prompt = `Please provide a detailed, well-structured summary of the following document content in Markdown format. Use headings, lists, and bold text to organize the information for readability. The goal is to capture the main ideas, arguments, and conclusions. Here is the content:\n\n${text}`;
  return callGeminiWithRetry<string>(prompt);
};

export const generateStudyPlan = async (text: string): Promise<StudyPlanWeek[]> => {
  const prompt = `Based on the provided document content, create a comprehensive 4-week study plan. For each week, specify the main topics to cover, suggest daily or weekly study goals, and list key points for review. The output should be easy to follow for a student trying to master this material. Here is the content:\n\n${text}`;
  const schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        week: { type: Type.INTEGER },
        topics: { type: Type.ARRAY, items: { type: Type.STRING } },
        goals: { type: Type.ARRAY, items: { type: Type.STRING } },
        reviewPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: ["week", "topics", "goals", "reviewPoints"],
    },
  };
  return callGeminiWithRetry<StudyPlanWeek[]>(prompt, schema);
};

export const generateQuiz = async (text: string): Promise<QuizQuestion[]> => {
  const prompt = `Generate a quiz with 10 questions based on the following document content. Include a mix of multiple-choice, true/false, and short-answer questions. For each multiple-choice question, provide 4 options. For each question, provide the correct answer and a brief explanation. Ensure the questions cover a range of topics from the document. Here is the content:\n\n${text}`;
  const schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        question: { type: Type.STRING },
        options: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "List of options for multiple-choice questions. Omit for other types.",
        },
        answer: { type: Type.STRING },
        explanation: { type: Type.STRING },
        type: { type: Type.STRING, enum: ["multiple-choice", "true-false", "short-answer"] },
      },
      required: ["question", "answer", "explanation", "type"],
    },
  };
  return callGeminiWithRetry<QuizQuestion[]>(prompt, schema);
};