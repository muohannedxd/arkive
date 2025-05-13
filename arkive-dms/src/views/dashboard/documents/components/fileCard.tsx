import { useState } from "react";
import {
  Menu,
  MenuButton,
  IconButton,
  MenuList,
  MenuItem,
} from "@chakra-ui/react";
import Card from "components/card";
import PdfPreview from "components/pdfpreview";
import DocumentViewer from "./DocumentViewer";
import { BsThreeDotsVertical, BsEye } from "react-icons/bs";
import { FiDownload, FiEdit3 } from "react-icons/fi";
import { RiDeleteBin2Line } from "react-icons/ri";
import { BiError } from "react-icons/bi";

interface FileInterface {
  title: string;
  owner: string;
  document: string;
  extra?: string;
}

export default function FileCard(props: FileInterface) {
  const { title, owner, document, extra } = props;
  const [isOpen, setIsOpen] = useState(false); // Open document viewer
  const [previewError, setPreviewError] = useState(false);

  // Extract file extension from title
  const fileExtension = title.split(".").pop()?.toUpperCase() || "FILE";
  
  // Build the proper document URL for storage service
  const getDocumentUrl = (docPath: string): string => {
    // If already a full URL, use it
    if (docPath.startsWith('http://') || docPath.startsWith('https://')) {
      return docPath;
    }
    
    // Check if it's just a filename or a full path
    const filename = docPath.includes('/') 
      ? docPath.split('/').pop() 
      : docPath;
      
    // Use gateway port (8003) instead of direct storage service (8085)
    return `http://localhost:8003/api/storage/download/${filename}`;
  };

  const documentUrl = getDocumentUrl(document);
  
  // Determine file type for preview
  const isPdf = document.toLowerCase().endsWith(".pdf");
  const isImage = /\.(jpg|jpeg|png|gif|bmp|svg)$/i.test(document);

  const handleImageError = () => {
    setPreviewError(true);
  };

  return (
    <>
      <Card
        extra={`flex flex-col w-full !p-4 3xl:p-![18px] bg-white hover:bg-gray-50 cursor-pointer duration-200 transition-all sm:max-w-80 ${extra}`}
        onClick={() => setIsOpen(true)}
      >
        <div className="w-full">
          <div className="relative w-full">
            {/* Handle PDFs and images with error fallback */}
            {isImage && !previewError ? (
              <img
                src={documentUrl}
                className="mb-3 min-h-48 max-h-56 w-full rounded-md border-2 border-gray-100 sm:max-h-52 md:max-h-48 object-contain"
                alt={title}
                onError={handleImageError}
              />
            ) : isPdf && !previewError ? (
              <PdfPreview 
                pdfUrl={documentUrl} 
                onError={() => setPreviewError(true)}
              />
            ) : previewError ? (
              // Display error state if preview failed
              <div className="mb-3 flex h-56 w-full flex-col items-center justify-center rounded-md border-2 border-red-100 bg-red-50 sm:max-h-52 md:max-h-48">
                <BiError className="text-4xl text-red-500 mb-2" />
                <p className="text-sm text-red-600 text-center px-4">Preview failed to load</p>
                <p className="text-xs text-gray-600 mt-1">{fileExtension} file</p>
              </div>
            ) : (
              // Display file extension in gray box if no image/pdf or as fallback
              <div className="mb-3 flex h-56 w-full items-center justify-center rounded-md border-2 border-gray-200 bg-gray-100 text-3xl font-semibold text-gray-600 sm:max-h-52 md:max-h-48">
                {fileExtension}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between px-1">
            <div className="flex flex-col gap-1">
              <h5 className="max-w-56 truncate text-base font-bold text-navy-700" title={title}>
                {title}
              </h5>
              <p className="max-w-56 truncate text-sm font-normal text-gray-600" title={owner}>
                By {owner}
              </p>
            </div>
            <div className="ml-auto">
              <Menu>
                <MenuButton
                  as={IconButton}
                  aria-label="Options"
                  icon={
                    <BsThreeDotsVertical className="ml-auto h-6 w-6 text-gray-700 transition-all duration-200 hover:text-gray-800" />
                  }
                  variant="unstyled"
                  onClick={(e) => e.stopPropagation()}
                />
                <MenuList>
                  <MenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsOpen(true);
                    }}
                    icon={<BsEye />}
                  >
                    View File
                  </MenuItem>
                  <MenuItem 
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(documentUrl, '_blank');
                    }} 
                    icon={<FiDownload />}
                  >
                    Download File
                  </MenuItem>
                  <MenuItem onClick={(e) => e.stopPropagation()} icon={<FiEdit3 />}>
                    Edit File
                  </MenuItem>
                  <MenuItem color="red.600" onClick={(e) => e.stopPropagation()} icon={<RiDeleteBin2Line />}>
                    Delete File
                  </MenuItem>
                </MenuList>
              </Menu>
            </div>
          </div>
        </div>
      </Card>

      {/* Google Drive-Style Fullscreen Viewer with proper document URL */}
      <DocumentViewer 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        fileUrl={documentUrl} 
        title={title} 
      />
    </>
  );
}
