import { Button } from "@chakra-ui/react";
import { FiArrowLeft } from "react-icons/fi";

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
  return (
    <div className="mt-4">
      <div className="mb-6 flex items-center gap-4">
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
      
      <div className="mt-6 text-center">
        <p className="text-lg text-gray-600">
          This folder's documents will be listed here in the future implementation.
        </p>
        <p className="mt-2 text-sm text-gray-500">
          Folder ID: {folderId}
        </p>
      </div>
    </div>
  );
}