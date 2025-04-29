import { useState, useEffect, useMemo } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { FiDownload, FiX, FiZoomIn, FiZoomOut } from "react-icons/fi";
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

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      setTimeout(() => setAnimate(true), 10);
    } else {
      setAnimate(false);
      setTimeout(() => setVisible(false), 300);
    }
  }, [isOpen]);

  const fileType = useMemo(() => {
    const ext = fileUrl.toString().split(".").pop()?.toLowerCase();
    return ext || "";
  }, [fileUrl]);

  useEffect(() => {
    if (fileType === "txt" || fileType === "json") {
      fetch(fileUrl)
        .then((res) => res.text())
        .then((text) => {
          setFileContent(
            fileType === "json"
              ? JSON.stringify(JSON.parse(text), null, 2)
              : text
          );
        })
        .catch(() => setFileContent("Error loading file."));
    }
  }, [fileUrl, fileType]);

  useEffect(() => {
    if (["xls", "xlsx", "csv"].includes(fileType)) {
      fetch(fileUrl)
        .then((res) => res.arrayBuffer())
        .then((buffer) => {
          const workbook = XLSX.read(buffer, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          setFileContent(XLSX.utils.sheet_to_csv(sheet));
        })
        .catch(() => setFileContent("Error loading spreadsheet."));
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
        {fileType === "pdf" && (
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
          {fileType === "pdf" ? (
            <Document
              file={fileUrl}
              onLoadSuccess={({ numPages }) => setNumPages(numPages)}
            >
              <Page
                pageNumber={1}
                scale={scale}
                renderTextLayer
                renderAnnotationLayer
              />
            </Document>
          ) : fileType.match(/(png|jpg|jpeg|gif|webp|svg)/) ? (
            <img
              src={fileUrl}
              alt={title}
              className="max-h-full max-w-full object-contain"
            />
          ) : fileType.match(/(doc|docx)/) ? (
            <DocViewer
              className="h-[80vh] w-[80vw]"
              documents={[{ uri: fileUrl }]}
              pluginRenderers={DocViewerRenderers}
            />
          ) : fileType.match(/(xls|xlsx|csv|txt|json)/) ? (
            <pre className="h-[80vh] w-[80vw] overflow-auto bg-gray-800 p-4 text-white">
              {fileContent}
            </pre>
          ) : (
            <div className="max-h-full max-w-full text-2xl text-white">
              Unsupported file type.{" "}
              <a href={fileUrl} download className="text-blue-300 underline">
                Download instead
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
