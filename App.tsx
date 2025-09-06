import React from 'react';
import { useState, useCallback } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import FileUpload from './components/FileUpload';
import LoadingSpinner from './components/LoadingSpinner';
import OptionButtons from './components/OptionButtons';
import OutputDisplay from './components/OutputDisplay';
import { usePdfProcessor } from './hooks/usePdfProcessor';
import { generateSummary, generateStudyPlan, generateQuiz } from './services/geminiService';
import type { GeneratedContent, GeneratedContentType } from './types';

const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent>({
    summary: null,
    studyPlan: null,
    quiz: null,
  });
  const [currentView, setCurrentView] = useState<GeneratedContentType | null>(null);

  const { pdfText, isProcessing: isPdfProcessing, error: pdfError } = usePdfProcessor(file);

  const resetState = () => {
    setFile(null);
    setError(null);
    setGeneratedContent({ summary: null, studyPlan: null, quiz: null });
    setCurrentView(null);
  }

  const handleFileSelect = (selectedFile: File) => {
    resetState();
    setFile(selectedFile);
  };

  const handleOptionSelect = useCallback(async (option: GeneratedContentType) => {
    if (!pdfText) {
      setError("PDF text is not available. Please re-upload the file.");
      return;
    }
    
    // Avoid re-fetching if content is already generated
    if (generatedContent[option]) {
      setCurrentView(option);
      return;
    }

    setIsGenerating(true);
    setCurrentView(option);
    setError(null);

    try {
      let result;
      switch (option) {
        case 'summary':
          result = await generateSummary(pdfText);
          setGeneratedContent(prev => ({ ...prev, summary: result }));
          break;
        case 'studyPlan':
          result = await generateStudyPlan(pdfText);
          setGeneratedContent(prev => ({ ...prev, studyPlan: result }));
          break;
        case 'quiz':
          result = await generateQuiz(pdfText);
          setGeneratedContent(prev => ({ ...prev, quiz: result }));
          break;
      }
    } catch (err: any) {
      console.error("Error generating content:", err);
      setError(err.message || "An error occurred while generating content.");
      setCurrentView(null);
    } finally {
      setIsGenerating(false);
    }
  }, [pdfText, generatedContent]);

  const getLoadingMessage = () => {
    if (isPdfProcessing) return "Processing your PDF...";
    if (isGenerating) {
        switch(currentView) {
            case 'summary': return "Crafting a concise summary...";
            case 'studyPlan': return "Developing your 4-week study plan...";
            case 'quiz': return "Creating your personalized quiz...";
            default: return "Generating content...";
        }
    }
    return "";
  };
  
  const currentError = error || pdfError;
  const isLoading = isPdfProcessing || isGenerating;
  
  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-800 dark:text-slate-200">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white">Unlock Your Document's Potential</h2>
            <p className="mt-2 text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">Upload a PDF to instantly generate summaries, study plans, and quizzes.</p>
        </div>

        {!file && <FileUpload onFileSelect={handleFileSelect} />}

        {currentError && (
          <div className="mt-6 text-center text-red-500 bg-red-100 dark:bg-red-900/50 p-4 rounded-lg max-w-2xl mx-auto">
              <p className="font-medium">Oops! Something went wrong.</p>
              <p className="text-sm">{currentError}</p>
              <button onClick={resetState} className="mt-2 px-4 py-1 text-sm font-semibold text-red-700 dark:text-red-200 bg-red-200 dark:bg-red-800/50 rounded-full hover:bg-red-300 dark:hover:bg-red-700/50">
                Try Again
              </button>
          </div>
        )}
        
        {pdfText && !isLoading && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-2xl mx-auto p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm">
                <div className="flex items-center space-x-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    <p className="font-medium text-slate-700 dark:text-slate-200 truncate" title={file?.name}>{file?.name}</p>
                </div>
                 <button onClick={resetState} className="flex-shrink-0 px-4 py-2 text-sm font-semibold text-indigo-700 dark:text-indigo-200 bg-indigo-100 dark:bg-indigo-900/50 rounded-md hover:bg-indigo-200 dark:hover:bg-indigo-800/50 transition">
                    Start Over
                </button>
            </div>
            <OptionButtons onSelect={handleOptionSelect} isLoading={isGenerating} activeButton={currentView} />
          </div>
        )}

        {isLoading && <div className="mt-8"><LoadingSpinner message={getLoadingMessage()} /></div>}
        
        {!isLoading && currentView && <OutputDisplay content={generatedContent} view={currentView} />}

      </main>
      <Footer />
    </div>
  );
};

export default App;