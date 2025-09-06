import React from 'react';
import type { GeneratedContentType } from '../types';

interface OptionButtonsProps {
  onSelect: (option: GeneratedContentType) => void;
  isLoading: boolean;
  activeButton: GeneratedContentType | null;
}

const OptionButton: React.FC<{
  onClick: () => void;
  label: string;
  // Fix: Replaced JSX.Element with React.ReactElement to fix 'Cannot find namespace JSX' error.
  icon: React.ReactElement;
  isLoading: boolean;
  isActive: boolean;
}> = ({ onClick, label, icon, isLoading, isActive }) => {
  const baseClasses = "flex-1 flex items-center justify-center px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed";
  const activeClasses = "bg-indigo-600 text-white shadow-md scale-105";
  const inactiveClasses = "bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600";
  
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
    >
      {icon}
      <span className="ml-2">{label}</span>
    </button>
  );
};


const OptionButtons: React.FC<OptionButtonsProps> = ({ onSelect, isLoading, activeButton }) => {
  return (
    <div className="w-full max-w-2xl mx-auto bg-slate-100 dark:bg-slate-800 p-2 rounded-lg shadow-inner">
      <div className="flex space-x-2">
        <OptionButton
          onClick={() => onSelect('summary')}
          label="Summary"
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>}
          isLoading={isLoading}
          isActive={activeButton === 'summary'}
        />
        <OptionButton
          onClick={() => onSelect('studyPlan')}
          label="Study Plan"
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>}
          isLoading={isLoading}
          isActive={activeButton === 'studyPlan'}
        />
        <OptionButton
          onClick={() => onSelect('quiz')}
          label="Quiz"
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>}
          isLoading={isLoading}
          isActive={activeButton === 'quiz'}
        />
      </div>
    </div>
  );
};

export default OptionButtons;