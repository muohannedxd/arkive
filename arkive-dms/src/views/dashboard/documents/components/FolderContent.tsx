import { Button, Spinner, useDisclosure } from "@chakra-ui/react";
import { FiArrowLeft } from "react-icons/fi";
import { RiFileAddLine } from "react-icons/ri";
import FileCard from "./fileCard";
import AddFolderDocumentModal from "./AddFolderDocumentModal";
import { useState, useEffect, useCallback } from "react";
import axiosClient from "lib/axios";
import { DocumentObject } from "types/document";

interface FolderContentProps {
  folderId: number;
  folderTitle: string | undefined;
  onBack: () => void;
}

export default function FolderContent({
  folderId,
  folderTitle,
  onBack,
}: FolderContentProps) {
  const [documents, setDocuments] = useState<DocumentObject[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Add document modal controls
  const { isOpen: isOpenAddDocumentModal, onOpen: onOpenAddDocumentModal, onClose: onCloseAddDocumentModal } = useDisclosure();

  // Function to fetch folder documents - wrap in useCallback to avoid dependency issues
  const fetchFolderDocuments = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Call the API endpoint to get documents by folder ID
      const response = await axiosClient.get(`/documents/folder/${folderId}`);
      
      if (response.data?.data) {
        // Transform the API response to match DocumentObject structure
        const formattedDocuments = response.data.data.map((doc: any) => ({
          id: doc.id,
          title: doc.title,
          owner: doc.ownerName || "Unknown",
          department: doc.department,
          document: doc.url,
          folder_id: doc.folderId
        }));
        
        setDocuments(formattedDocuments);
      } else {
        setDocuments([]);
      }
    } catch (err: any) {
      console.error("Failed to fetch folder documents:", err);
      setError(err.response?.data?.message || "Failed to fetch folder documents");
    } finally {
      setIsLoading(false);
    }
  }, [folderId]);  // Include folderId in dependencies

  useEffect(() => {
    if (folderId) {
      fetchFolderDocuments();
    }
  }, [folderId, fetchFolderDocuments]);  // Include fetchFolderDocuments in dependencies

  return (
    <div className="mt-4">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            leftIcon={<FiArrowLeft />} 
            onClick={onBack}
            variant="outline"
            colorScheme="gray"
          >
            Back
          </Button>
          <h3 className="text-xl font-bold text-navy-700">
            Folder: {folderTitle}
          </h3>
        </div>
        
        {/* Add Document button */}
        <Button
          onClick={onOpenAddDocumentModal}
          leftIcon={<RiFileAddLine />}
          variant={"brand"}
          className="bg-mainbrand mt-3 text-base font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-800"
        >
          Add Document
        </Button>
      </div>
      
      {isLoading ? (
        <div className="mt-10 flex min-h-[40vh] items-center justify-center">
          <Spinner
            size="xl"
            color="brand"
            className="text-mainbrand"
            borderWidth={"4px"}
          />
        </div>
      ) : error ? (
        <div className="mt-10 flex min-h-[40vh] flex-col items-center justify-center space-y-3">
          <p className="text-xl font-semibold text-red-600">
            Error Loading Folder Documents
          </p>
          <p className="text-gray-700">{error}</p>
          <Button
            onClick={() => {
              setIsLoading(true);
              fetchFolderDocuments();
            }}
            variant={"brand"}
            className="bg-mainbrand text-base font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-800"
          >
            Retry
          </Button>
        </div>
      ) : documents.length === 0 ? (
        <div className="mt-4 flex min-h-[20vh] flex-col items-center justify-center space-y-3 bg-gray-50 rounded-lg py-10">
          <p className="text-xl font-semibold text-gray-700">
            No Documents in this Folder
          </p>
          <p className="text-gray-600 text-center max-w-md">
            This folder is empty. Click 'Add Document' to upload documents to this folder.
          </p>
          <Button
            onClick={onOpenAddDocumentModal}
            leftIcon={<RiFileAddLine />}
            variant={"brand"}
            className="bg-mainbrand text-base font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-800 mt-4"
          >
            Add Your First Document
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5">
          {documents.map((doc) => (
            <FileCard
              key={doc.id}
              id={doc.id}
              title={doc.title}
              owner={doc.owner}
              document={doc.document}
              department={doc.department}
              folder_id={doc.folder_id || folderId}
              onRefresh={fetchFolderDocuments}
            />
          ))}
        </div>
      )}

      {/* Add Document to Folder Modal */}
      <AddFolderDocumentModal
        isOpen={isOpenAddDocumentModal}
        onClose={onCloseAddDocumentModal}
        folderId={folderId}
        folderTitle={folderTitle}
        onSuccess={fetchFolderDocuments}
      />
    </div>
  );
}