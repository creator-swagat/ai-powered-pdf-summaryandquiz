import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from "@google/genai";
import type { QuizQuestion, StudyPlanWeek } from '../types';

if (!process.env.API_KEY) {
  // This will cause the function to fail gracefully if the API key is not set in Vercel.
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const generateSummary = async (text: string): Promise<string> => {
    const prompt = `Please provide a detailed, well-structured summary of the following document content in Markdown format. Use headings, lists, and bold text to organize the information for readability. The goal is to capture the main ideas, arguments, and conclusions. Here is the content:\n\n${text}`;
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
    });
    return response.text;
};

const generateStudyPlan = async (text: string): Promise<StudyPlanWeek[]> => {
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
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: schema,
        },
    });
    return JSON.parse(response.text.trim());
};

const generateQuiz = async (text: string): Promise<QuizQuestion[]> => {
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
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: schema,
        },
    });
    return JSON.parse(response.text.trim());
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { text, type } = req.body;

    if (!text || !type) {
        return res.status(400).json({ error: 'Missing required parameters: text and type' });
    }

    try {
        let result;
        switch (type) {
            case 'summary':
                result = await generateSummary(text);
                break;
            case 'studyPlan':
                result = await generateStudyPlan(text);
                break;
            case 'quiz':
                result = await generateQuiz(text);
                break;
            default:
                return res.status(400).json({ error: 'Invalid type specified. Must be summary, studyPlan, or quiz.' });
        }
        return res.status(200).json(result);
    } catch (error: any) {
        console.error('Error in Vercel function while calling Gemini API:', error);
        return res.status(500).json({ error: 'Failed to generate content from the AI model.', details: error.message });
    }
}
