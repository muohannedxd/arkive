import { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";

// Use the CDN worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export default function PdfPreview({ pdfUrl }: { pdfUrl: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loaded, setLoaded] = useState(false);

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

        if (!context) return;

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvasContext: context, viewport }).promise;
        setLoaded(true);
      } catch (error) {
        console.error("Error loading PDF preview:", error);
      }
    };

    loadPdf();
  }, [pdfUrl]);

  return (
    <div>
      {!loaded && <p>Loading preview...</p>}
      <canvas
        ref={canvasRef}
        className="mb-3 max-h-56 w-full rounded-md border-2 border-gray-100 sm:max-h-52 md:max-h-48"
      />
    </div>
  );
}
