import { useState, useEffect, useMemo } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { FiDownload, FiX, FiZoomIn, FiZoomOut } from "react-icons/fi";
import { BiError } from "react-icons/bi";
import DocViewer, { DocViewerRenderers } from "react-doc-viewer";
import * as XLSX from "xlsx";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface DocumentViewerProps {
  isOpen: boolean;
  onClose: () => void;
  fileUrl: string;
  title: string;
}

export default function DocumentViewer({
  isOpen,
  onClose,
  fileUrl,
  title,
}: DocumentViewerProps) {
  const [visible, setVisible] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [, setNumPages] = useState<number | null>(null);
  const [scale, setScale] = useState(1.0);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      setTimeout(() => setAnimate(true), 10);
      // Reset error state when opening a new file
      setLoadError(false);
    } else {
      setAnimate(false);
      setTimeout(() => setVisible(false), 300);
    }
  }, [isOpen]);

  const fileType = useMemo(() => {
    // First try to get extension from title as it's most reliable
    const titleExt = title.split(".").pop()?.toLowerCase();
    if (titleExt && titleExt !== title.toLowerCase()) {
      return titleExt;
    }
    
    // Try to get from URL if it has an extension
    const urlExt = fileUrl.split("/").pop()?.split(".")?.pop()?.toLowerCase();
    if (urlExt && urlExt.length <= 5 && urlExt !== "download") {
      return urlExt;
    }
    
    // If URL ends with /download/filename, extract extension from filename
    const downloadMatch = fileUrl.match(/\/download\/([^/?#]+)/);
    if (downloadMatch) {
      const filename = downloadMatch[1];
      const fileExt = filename.split(".").pop()?.toLowerCase();
      if (fileExt && fileExt.length <= 5) {
        return fileExt;
      }
    }
    
    // If title contains known file type indicators, use that
    if (title.toLowerCase().includes("pdf")) return "pdf";
    if (title.toLowerCase().includes("doc")) return "doc";
    if (title.toLowerCase().includes("xls")) return "xls";
    if (title.toLowerCase().includes("csv")) return "csv";
    if (title.toLowerCase().includes("txt")) return "txt";
    if (title.toLowerCase().includes("json")) return "json";
    
    // Try to determine from Content-Type header
    fetch(fileUrl, { method: 'HEAD' })
      .then(response => {
        const contentType = response.headers.get('Content-Type');
        if (contentType) {
          if (contentType.includes('pdf')) return 'pdf';
          if (contentType.includes('image')) return 'png'; // Just to trigger image viewer
          if (contentType.includes('word')) return 'doc';
          if (contentType.includes('excel') || contentType.includes('spreadsheet')) return 'xls';
          if (contentType.includes('text/plain')) return 'txt';
          if (contentType.includes('application/json')) return 'json';
        }
      })
      .catch(() => {
        // Silently fail - we'll use fallback
      });
    
    // Default to a generic extension to trigger at least basic file viewer
    return "";
  }, [fileUrl, title]);

  useEffect(() => {
    if (fileType === "txt" || fileType === "json") {
      fetch(fileUrl)
        .then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP error! Status: ${res.status}`);
          }
          return res.text();
        })
        .then((text) => {
          setFileContent(
            fileType === "json"
              ? JSON.stringify(JSON.parse(text), null, 2)
              : text
          );
          setLoadError(false);
        })
        .catch(() => {
          setFileContent("Error loading file.");
          setLoadError(true);
        });
    }
  }, [fileUrl, fileType]);

  useEffect(() => {
    if (["xls", "xlsx", "csv"].includes(fileType)) {
      fetch(fileUrl)
        .then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP error! Status: ${res.status}`);
          }
          return res.arrayBuffer();
        })
        .then((buffer) => {
          const workbook = XLSX.read(buffer, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          setFileContent(XLSX.utils.sheet_to_csv(sheet));
          setLoadError(false);
        })
        .catch(() => {
          setFileContent("Error loading spreadsheet.");
          setLoadError(true);
        });
    }
  }, [fileUrl, fileType]);

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = fileUrl;
    a.download = title || "download";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (!visible) return null;

  const renderErrorContent = () => (
    <div className="flex flex-col items-center justify-center h-[50vh] text-white">
      <BiError className="text-6xl text-red-500 mb-4" />
      <h3 className="text-2xl font-bold mb-2">Failed to load document</h3>
      <p className="text-gray-300 mb-4">The document couldn't be retrieved from storage.</p>
      <div className="flex gap-2 mt-2">
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
        >
          Reload page
        </button>
        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-mainbrand rounded hover:bg-brand-600"
        >
          Try direct download
        </a>
      </div>
    </div>
  );

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-70 backdrop-blur-md transition-opacity duration-300 ${
        animate ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="fixed right-4 top-4 z-50 flex gap-3">
        <button
          onClick={onClose}
          className="rounded-full bg-mainbrand p-3 transition duration-200 hover:bg-brand-600"
        >
          <FiX className="text-white" size={24} />
        </button>
      </div>
      <div className="fixed left-4 top-4 z-50 flex gap-3">
        <button
          onClick={handleDownload}
          className="rounded-full bg-mainbrand p-3 transition duration-200 hover:bg-brand-600"
        >
          <FiDownload className="text-white" size={24} />
        </button>
        {fileType === "pdf" && !loadError && (
          <>
            <button
              onClick={() => setScale(scale + 0.2)}
              className="rounded-full bg-mainbrand p-3 transition duration-200 hover:bg-brand-600"
            >
              <FiZoomIn className="text-white" size={24} />
            </button>
            <button
              onClick={() => setScale(Math.max(0.5, scale - 0.2))}
              className="rounded-full bg-mainbrand p-3 transition duration-200 hover:bg-brand-600"
            >
              <FiZoomOut className="text-white" size={24} />
            </button>
            <span className="mt-2 text-white">{Math.round(scale * 100)}%</span>
          </>
        )}
      </div>
      <div
        className={`relative flex h-[100vh] w-[100vw] flex-col items-center overflow-auto px-6 pb-12 pt-6 shadow-lg transition-transform duration-300 ${
          animate ? "scale-100" : "scale-95"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mt-12 flex w-full flex-grow justify-center">
          {loadError ? (
            renderErrorContent()
          ) : fileType === "pdf" || fileUrl.toLowerCase().includes(".pdf") ? (
            <Document
              file={fileUrl}
              onLoadSuccess={({ numPages }) => setNumPages(numPages)}
              onLoadError={() => setLoadError(true)}
              loading={<div className="text-white text-xl">Loading PDF...</div>}
              error={<div className="text-red-500 text-xl">Failed to load PDF</div>}
            >
              <Page
                pageNumber={1}
                scale={scale}
                renderTextLayer
                renderAnnotationLayer
                error={renderErrorContent}
              />
            </Document>
          ) : fileType.match(/(png|jpg|jpeg|gif|webp|svg)/) ? (
            <div className="relative">
              <img
                src={fileUrl}
                alt={title}
                className="max-h-full max-w-full object-contain"
                onError={() => setLoadError(true)}
              />
              {loadError && renderErrorContent()}
            </div>
          ) : fileType.match(/(doc|docx)/) ? (
            <DocViewer
              className="h-[80vh] w-[80vw]"
              documents={[{ uri: fileUrl }]}
              pluginRenderers={DocViewerRenderers}
              config={{
                header: {
                  disableHeader: true,
                },
              }}
            />
          ) : fileType.match(/(xls|xlsx|csv|txt|json)/) ? (
            <pre className="h-[80vh] w-[80vw] overflow-auto bg-gray-800 p-4 text-white">
              {fileContent}
            </pre>
          ) : (
            // Try auto-detection mode with DocViewer as fallback
            <div className="h-full w-full">
              <DocViewer 
                className="h-[80vh] w-[80vw]"
                documents={[{ uri: fileUrl }]}
                pluginRenderers={DocViewerRenderers}
                config={{
                  header: {
                    disableHeader: true,
                  },
                }}
              />
              <div className="mt-4 flex justify-center">
                <a href={fileUrl} download className="text-blue-300 underline">
                  Download this file
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
