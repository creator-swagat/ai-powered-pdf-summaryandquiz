
import React from 'react';
import { useState, useCallback } from 'react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  maxSizeMB?: number;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, maxSizeMB = 20 }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateAndSelectFile = useCallback((file: File | null) => {
    setError(null);
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Invalid file type. Please upload a PDF.');
      return;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File size exceeds ${maxSizeMB}MB limit.`);
      return;
    }

    onFileSelect(file);
  }, [onFileSelect, maxSizeMB]);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSelectFile(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     if (e.target.files && e.target.files.length > 0) {
      validateAndSelectFile(e.target.files[0]);
    }
  }

  const borderStyle = isDragging ? 'border-indigo-500' : 'border-slate-300 dark:border-slate-600';

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div 
        className={`relative flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-lg transition-colors duration-300 ${borderStyle} bg-white dark:bg-slate-800/50`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 mb-4 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <p className="mb-2 text-lg text-slate-600 dark:text-slate-300">
          <span className="font-semibold">Click to upload</span> or drag and drop
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400">PDF only (max {maxSizeMB}MB)</p>
        <input 
          id="file-upload" 
          type="file" 
          className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer" 
          accept=".pdf"
          onChange={handleFileChange}
        />
      </div>
      {error && <p className="mt-4 text-center text-red-500 font-medium">{error}</p>}
    </div>
  );
};

export default FileUpload;
