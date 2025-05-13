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
import { FiDownload, FiEdit3, FiLock } from "react-icons/fi";
import { RiDeleteBin2Line } from "react-icons/ri";

interface FileInterface {
  title: string;
  owner: string;
  document: string;
  extra?: string;
}

export default function FileCard(props: FileInterface) {
  const { title, owner, document, extra } = props;
  const [isOpen, setIsOpen] = useState(false); // Open document viewer

  // Extract file extension
  const fileExtension = title.toString().split(".").pop()?.toUpperCase() || "FILE";
  const isPdf = document.toString().toLowerCase().endsWith(".pdf");
  const isImage = /\.(jpg|jpeg|png|gif|bmp|svg)$/i.test(document);

  return (
    <>
      <Card
        extra={`flex flex-col w-full !p-4 3xl:p-![18px] bg-white hover:bg-gray-50 cursor-pointer duration-200 transition-all sm:max-w-80 ${extra}`}
        onClick={() => setIsOpen(true)}
      >
        <div className="w-full">
          <div className="relative w-full">
            {/* Handle PDFs and images */}
            {isImage ? (
              <img
                src={document}
                className="mb-3 max-h-56 w-full rounded-md border-2 border-gray-100 sm:max-h-52 md:max-h-48"
                alt="file"
              />
            ) : isPdf ? (
              <PdfPreview pdfUrl={document} />
            ) : (
              // Display file extension in gray box if no image
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
                  <MenuItem onClick={() => {}} icon={<FiDownload />}>
                    Download File
                  </MenuItem>
                  <MenuItem onClick={() => {}} icon={<FiEdit3 />}>
                    Edit File
                  </MenuItem>
                  <MenuItem onClick={() => {}} icon={<FiLock />}>
                    Manage Access
                  </MenuItem>
                  <MenuItem color="red.600" onClick={() => {}} icon={<RiDeleteBin2Line />}>
                    Delete File
                  </MenuItem>
                </MenuList>
              </Menu>
            </div>
          </div>
        </div>
      </Card>

      {/* Google Drive-Style Fullscreen Viewer */}
      <DocumentViewer isOpen={isOpen} onClose={() => setIsOpen(false)} fileUrl={document} title={title} />
    </>
  );
}
