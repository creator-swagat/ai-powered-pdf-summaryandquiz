
import React from 'react';
import { useState, useEffect } from 'react';

// pdfjs-dist is loaded from a CDN in index.html, so we declare the global object
declare const pdfjsLib: any;

export const usePdfProcessor = (file: File | null) => {
  const [pdfText, setPdfText] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!file) return;

    const processPdf = async () => {
      setIsProcessing(true);
      setError(null);
      setPdfText(null);

      try {
        if (typeof pdfjsLib === 'undefined') {
          throw new Error('PDF.js library is not loaded.');
        }

        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

        const fileReader = new FileReader();
        
        fileReader.onload = async (event) => {
          if (!event.target?.result) {
            setError("Failed to read file.");
            setIsProcessing(false);
            return;
          }

          const typedarray = new Uint8Array(event.target.result as ArrayBuffer);
          const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
          let fullText = "";

          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map((item: any) => item.str).join(" ");
            fullText += pageText + "\n\n";
          }
          
          setPdfText(fullText);
          setIsProcessing(false);
        };

        fileReader.onerror = () => {
          setError("Error reading PDF file.");
          setIsProcessing(false);
        };
        
        fileReader.readAsArrayBuffer(file);

      } catch (err: any) {
        console.error("Error processing PDF:", err);
        setError(err.message || "An unknown error occurred while processing the PDF.");
        setIsProcessing(false);
      }
    };

    processPdf();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file]);

  return { pdfText, isProcessing, error };
};
