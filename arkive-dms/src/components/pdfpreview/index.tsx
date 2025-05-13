import { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";

// Use the CDN worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

interface PdfPreviewProps {
  pdfUrl: string;
  onError?: () => void;
}

export default function PdfPreview({ pdfUrl, onError }: PdfPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const loadPdf = async () => {
      if (!canvasRef.current) return;

      try {
        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1); // Load first page

        const viewport = page.getViewport({ scale: 1.5 }); // Better quality
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");

        if (!context) {
          setHasError(true);
          if (onError) onError();
          return;
        }

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvasContext: context, viewport }).promise;
        setLoaded(true);
      } catch (error) {
        console.error("Error loading PDF preview:", error);
        setHasError(true);
        if (onError) onError();
      }
    };

    loadPdf();
  }, [pdfUrl, onError]);

  return (
    <div>
      {!loaded && !hasError && <p>Loading preview...</p>}
      {hasError ? (
        <div className="mb-3 flex h-48 w-full flex-col items-center justify-center rounded-md border-2 border-red-100 bg-red-50 sm:max-h-52 md:max-h-48">
          <p className="text-sm text-red-600 text-center px-4">Failed to load PDF preview</p>
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
