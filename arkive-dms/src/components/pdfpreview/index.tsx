import { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { BiError } from "react-icons/bi";

// Use the same worker URL that's working in DocumentViewer.tsx
pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

interface PdfPreviewProps {
  pdfUrl: string;
  onError?: () => void;
}

export default function PdfPreview({ pdfUrl, onError }: PdfPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isComponentMounted, setIsComponentMounted] = useState(true);

  // Set component mounted flag
  useEffect(() => {
    setIsComponentMounted(true);
    return () => {
      // Clean up when component unmounts
      setIsComponentMounted(false);
    };
  }, []);

  useEffect(() => {
    const loadPdf = async () => {
      // Exit early if component is unmounted or canvas ref is not available
      if (!isComponentMounted || !canvasRef.current) return;

      try {
        // Simple load without extra options that might cause issues
        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        
        const pdf = await loadingTask.promise;
        
        // Check if component is still mounted before proceeding
        if (!isComponentMounted) return;
        
        const page = await pdf.getPage(1); // Load first page

        // Double check the canvas ref is still valid
        if (!canvasRef.current) {
          throw new Error("Canvas element is not available");
        }

        const viewport = page.getViewport({ scale: 1.5 }); // Better quality
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");

        if (!context) {
          throw new Error("Canvas context could not be created");
        }

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvasContext: context, viewport }).promise;
        
        // Only update state if component is still mounted
        if (isComponentMounted) {
          setLoaded(true);
        }
      } catch (error) {
        console.error("Error loading PDF preview:", error);
        
        // Only update state if component is still mounted
        if (isComponentMounted) {
          setHasError(true);
          // Provide more specific error messages
          if (error instanceof Error) {
            setErrorMessage(error.message);
          } else {
            setErrorMessage("Failed to load PDF preview");
          }
          if (onError) onError();
        }
      }
    };

    // Delay PDF loading slightly to ensure canvas is ready
    const timer = setTimeout(() => {
      loadPdf();
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, [pdfUrl, onError, isComponentMounted]);

  return (
    <div>
      {!loaded && !hasError && (
        <div className="mb-3 flex h-48 w-full flex-col items-center justify-center rounded-md border-2 border-gray-100 bg-gray-50 sm:max-h-52 md:max-h-48">
          <div className="animate-pulse">Loading preview...</div>
        </div>
      )}
      {hasError ? (
        <div className="mb-3 flex h-48 w-full flex-col items-center justify-center rounded-md border-2 border-red-100 bg-red-50 sm:max-h-52 md:max-h-48">
          <BiError className="text-4xl text-red-500 mb-2" />
          <p className="text-sm text-red-600 text-center px-4">Failed to preview</p>
          {errorMessage && (
            <p className="text-xs text-gray-600 text-center px-4 mt-1">{errorMessage}</p>
          )}
        </div>
      ) : (
        <canvas
          ref={canvasRef}
          className="mb-3 max-h-56 w-full rounded-md border-2 border-gray-100 sm:max-h-52 md:max-h-48"
        />
      )}
    </div>
  );
}
