import React from 'react';
import { useState, useEffect, useCallback } from 'react';
import type { GeneratedContent, GeneratedContentType, QuizQuestion, StudyPlanWeek } from '../types';

declare const marked: any;

const CopyButton: React.FC<{ textToCopy: string }> = ({ textToCopy }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(textToCopy).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };
    return (
        <button onClick={handleCopy} className="absolute top-4 right-4 p-2 rounded-md bg-slate-200/70 dark:bg-slate-700/70 hover:bg-slate-300 dark:hover:bg-slate-600 transition">
            {copied ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500 dark:text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M7 9a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9z" />
                    <path d="M5 3a2 2 0 00-2 2v6a2 2 0 002 2V5h6a2 2 0 00-2-2H5z" />
                </svg>
            )}
        </button>
    );
};

const SummaryView: React.FC<{ content: string }> = ({ content }) => {
    const [htmlContent, setHtmlContent] = useState('');
    useEffect(() => {
        if (typeof marked !== 'undefined') {
            setHtmlContent(marked.parse(content));
        } else {
            setHtmlContent(content.replace(/\n/g, '<br />'));
        }
    }, [content]);

    return (
        <div className="relative">
            <CopyButton textToCopy={content} />
            <div className="prose prose-slate dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: htmlContent }} />
        </div>
    );
};


const StudyPlanView: React.FC<{ content: StudyPlanWeek[] }> = ({ content }) => {
    const formatPlanForCopy = () => {
        return content.map(week => {
            const topics = week.topics.map(t => `- ${t}`).join('\n');
            const goals = week.goals.map(g => `- ${g}`).join('\n');
            const reviewPoints = week.reviewPoints.map(p => `- ${p}`).join('\n');
            return `Week ${week.week}\n\nTopics to Cover:\n${topics}\n\nGoals:\n${goals}\n\nReview Points:\n${reviewPoints}`;
        }).join('\n\n'+'-'.repeat(20)+'\n\n');
    };

    return (
        <div className="relative space-y-8">
            <CopyButton textToCopy={formatPlanForCopy()} />
            {content.map((week) => (
                <div key={week.week} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <h3 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mb-3">Week {week.week}</h3>
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-semibold text-slate-700 dark:text-slate-300">Topics to Cover:</h4>
                            <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 mt-1 space-y-1">
                                {week.topics.map((topic, i) => <li key={i}>{topic}</li>)}
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-slate-700 dark:text-slate-300">Goals:</h4>
                            <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 mt-1 space-y-1">
                                {week.goals.map((goal, i) => <li key={i}>{goal}</li>)}
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-slate-700 dark:text-slate-300">Review Points:</h4>
                            <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 mt-1 space-y-1">
                                {week.reviewPoints.map((point, i) => <li key={i}>{point}</li>)}
                            </ul>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};


const QuizView: React.FC<{ content: QuizQuestion[] }> = ({ content }) => {
    const [answers, setAnswers] = useState<{ [key: number]: string }>({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [score, setScore] = useState(0);

    useEffect(() => {
        setAnswers({});
        setIsSubmitted(false);
        setScore(0);
    }, [content]);

    const handleAnswerChange = (index: number, answer: string) => {
        setAnswers(prev => ({ ...prev, [index]: answer }));
    };

    const handleSubmit = () => {
        let currentScore = 0;
        content.forEach((q, index) => {
            if (answers[index] && answers[index].toLowerCase().trim() === q.answer.toLowerCase().trim()) {
                currentScore++;
            }
        });
        setScore(currentScore);
        setIsSubmitted(true);
    };

    const handleRetry = () => {
        setAnswers({});
        setIsSubmitted(false);
        setScore(0);
    };

    const getBorderColor = (q: QuizQuestion, index: number) => {
        if (!isSubmitted) return 'border-slate-200 dark:border-slate-700';
        const isCorrect = answers[index] && answers[index].toLowerCase().trim() === q.answer.toLowerCase().trim();
        return isCorrect ? 'border-green-500' : 'border-red-500';
    };

    return (
        <div>
            {isSubmitted && (
                 <div className="mb-6 p-6 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-center shadow-lg border border-indigo-200 dark:border-indigo-800 transition-all duration-300 animate-fade-in">
                    <p className="text-sm font-medium text-indigo-600 dark:text-indigo-300 uppercase tracking-wider">Quiz Complete!</p>
                    <h3 className="text-4xl md:text-5xl font-extrabold text-indigo-800 dark:text-indigo-200 mt-2">
                        {score} / {content.length}
                    </h3>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 mt-4 max-w-sm mx-auto">
                        <div className="bg-gradient-to-r from-green-400 to-blue-500 h-2.5 rounded-full" style={{ width: `${(score / content.length) * 100}%` }}></div>
                    </div>
                    <p className="text-lg font-semibold text-indigo-700 dark:text-indigo-300 mt-3">
                        You scored {Math.round((score / content.length) * 100)}%
                    </p>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                        {score / content.length >= 0.8 ? "Excellent work! You have a strong grasp of the material." : score / content.length >= 0.5 ? "Good effort! Review the explanations to solidify your knowledge." : "Keep trying! Review the material and try the quiz again."}
                    </p>
                </div>
            )}
            <div className="space-y-6">
                {content.map((q, index) => (
                    <div key={index} className={`p-4 border-2 ${getBorderColor(q, index)} rounded-lg transition-colors`}>
                        <p className="font-semibold text-slate-800 dark:text-slate-200">{index + 1}. {q.question}</p>
                        
                        {q.type === 'multiple-choice' && q.options && (
                            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {q.options.map((option, i) => (
                                    <button key={i} onClick={() => !isSubmitted && handleAnswerChange(index, option)} disabled={isSubmitted} className={`p-2 rounded-md text-left transition ${answers[index] === option ? 'bg-indigo-200 dark:bg-indigo-800 ring-2 ring-indigo-500' : 'bg-slate-100 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-600/50'} ${isSubmitted ? 'cursor-not-allowed opacity-70' : ''}`}>
                                        <span className="font-mono mr-2">{String.fromCharCode(65 + i)}.</span>
                                        <span>{option}</span>
                                    </button>
                                ))}
                            </div>
                        )}

                        {q.type === 'true-false' && (
                           <div className="mt-3 flex space-x-2">
                                {['True', 'False'].map(option => (
                                    <button key={option} onClick={() => !isSubmitted && handleAnswerChange(index, option)} disabled={isSubmitted} className={`px-4 py-2 rounded-md transition ${answers[index] === option ? 'bg-indigo-200 dark:bg-indigo-800 ring-2 ring-indigo-500' : 'bg-slate-100 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-600/50'} ${isSubmitted ? 'cursor-not-allowed opacity-70' : ''}`}>
                                        {option}
                                    </button>
                                ))}
                           </div>
                        )}
                        
                        {q.type === 'short-answer' && (
                            <input type="text" value={answers[index] || ''} onChange={(e) => !isSubmitted && handleAnswerChange(index, e.target.value)} disabled={isSubmitted} className="mt-3 w-full p-2 rounded-md bg-slate-100 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
                        )}

                        {isSubmitted && (
                            <div className={`mt-4 p-3 rounded-md border-l-4 ${getBorderColor(q, index) === 'border-green-500' ? 'bg-green-50 dark:bg-green-900/40 border-green-500' : 'bg-red-50 dark:bg-red-900/40 border-red-500'}`}>
                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Correct Answer: <span className="font-normal">{q.answer}</span></p>
                                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400"><span className="font-semibold">Explanation:</span> {q.explanation}</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="flex justify-center mt-8">
                <button
                    onClick={isSubmitted ? handleRetry : handleSubmit}
                    className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 transition-all transform hover:scale-105"
                    disabled={Object.keys(answers).length !== content.length && !isSubmitted}
                >
                    {isSubmitted ? 'Try Again' : 'Check Answers'}
                </button>
            </div>

        </div>
    );
};

// Fix: Defined the missing OutputDisplayProps interface.
interface OutputDisplayProps {
    content: GeneratedContent;
    view: GeneratedContentType | null;
}

const OutputDisplay: React.FC<OutputDisplayProps> = ({ content, view }) => {
    if (!view || !content) {
        return null;
    }

    const renderContent = () => {
        switch (view) {
            case 'summary':
                return content.summary ? <SummaryView content={content.summary} /> : <p>No summary available.</p>;
            case 'studyPlan':
                return content.studyPlan ? <StudyPlanView content={content.studyPlan} /> : <p>No study plan available.</p>;
            case 'quiz':
                return content.quiz ? <QuizView content={content.quiz} /> : <p>No quiz available.</p>;
            default:
                return <p className="text-center text-slate-500">Select an option to generate content.</p>;
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto mt-8">
            <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-lg animate-fade-in">
                {renderContent()}
            </div>
        </div>
    );
};

export default OutputDisplay;