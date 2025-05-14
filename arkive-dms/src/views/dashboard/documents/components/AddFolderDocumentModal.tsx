import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Button,
  Text,
  VStack,
  Box,
  useColorModeValue,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Select,
  FormErrorMessage,
  Spinner,
  useToast,
} from "@chakra-ui/react";
import { useRef, useState, useEffect, useMemo } from "react";
import { IoClose } from "react-icons/io5";
import { useAuthStore } from "views/auth/stores/auth.store";
import axiosClient from "lib/axios";

interface AddFolderDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  folderId: number;
  folderTitle: string | undefined;
  onSuccess: () => void; // Callback to refresh documents after successful upload
}

export default function AddFolderDocumentModal({
  isOpen,
  onClose,
  folderId,
  folderTitle,
  onSuccess,
}: AddFolderDocumentModalProps) {
  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileLimitWarning, setFileLimitWarning] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form state
  const [documentTitle, setDocumentTitle] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get user information (for department selection)
  const { user } = useAuthStore();
  
  // Toast notifications
  const toast = useToast();

  // Get user departments using useMemo to prevent unnecessary re-renders
  const userDepartments = useMemo(() => {
    return user?.departments?.map(dept => dept.name) || [];
  }, [user?.departments]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormError(null);
      // Set default department if available
      if (userDepartments.length > 0 && !selectedDepartment) {
        setSelectedDepartment(userDepartments[0]);
      }
    } else {
      // Reset form state
      setSelectedFile(null);
      setDocumentTitle("");
      setFileLimitWarning("");
      setFormError(null);
    }
  }, [isOpen, userDepartments, selectedDepartment]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
      // Try to set document title from filename if empty
      if (!documentTitle) {
        const filename = event.target.files[0].name;
        const titleWithoutExtension = filename.substring(0, filename.lastIndexOf('.')) || filename;
        setDocumentTitle(titleWithoutExtension);
      }
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    if (event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      setSelectedFile(file);
      
      // Try to set document title from filename if empty
      if (!documentTitle) {
        const filename = file.name;
        const titleWithoutExtension = filename.substring(0, filename.lastIndexOf('.')) || filename;
        setDocumentTitle(titleWithoutExtension);
      }
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleUpload = async () => {
    // Validation
    if (!selectedFile) {
      setFileLimitWarning("Please select a file to upload.");
      return;
    }
    
    if (!documentTitle.trim()) {
      setFormError("Document title is required");
      return;
    }
    
    if (!selectedDepartment) {
      setFormError("Please select a department");
      return;
    }
    
    // Clear any previous errors
    setFormError(null);
    setFileLimitWarning("");
    setIsSubmitting(true);
    
    try {
      // Create form data for multipart upload
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', documentTitle);
      formData.append('department', selectedDepartment);
      formData.append('ownerId', user?.id?.toString() || "1");
      formData.append('ownerName', user?.name || "Unknown");
      formData.append('folderId', folderId.toString()); // Add the folder ID
      
      // Upload the document
      await axiosClient.post('/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Show success message
      toast({
        title: "Document uploaded",
        description: `The document has been uploaded to folder: ${folderTitle}`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      // Call the success callback to refresh folder documents
      onSuccess();
      
      // Close the modal and reset form
      setSelectedFile(null);
      setDocumentTitle("");
      onClose();
    } catch (err: any) {
      console.error("Error uploading document:", err);
      setFormError(err.response?.data?.message || "Failed to upload document");
      toast({
        title: "Error uploading document",
        description: err.response?.data?.message || "Failed to upload document",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  const handleBoxClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const dropZoneBg = useColorModeValue(
    isDragging ? "gray.300" : "gray.100",
    isDragging ? "gray.600" : "gray.700"
  );

  return (
    <Modal onClose={onClose} isOpen={isOpen} isCentered size="2xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add Document to {folderTitle}</ModalHeader>
        <ModalCloseButton />
        <ModalBody className="z-10">
          <div className="z-10 flex flex-col gap-4">
            {/* Document Title */}
            <FormControl isRequired isInvalid={formError === "Document title is required"}>
              <FormLabel>Document Title</FormLabel>
              <Input
                value={documentTitle}
                onChange={(e) => setDocumentTitle(e.target.value)}
                placeholder="Enter document title"
                borderRadius="lg"
              />
              {formError === "Document title is required" && (
                <FormErrorMessage>Document title is required</FormErrorMessage>
              )}
            </FormControl>
            
            {/* Department Selection */}
            <FormControl isRequired isInvalid={formError === "Please select a department"}>
              <FormLabel>Department</FormLabel>
              {userDepartments.length > 0 ? (
                <Select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  placeholder="Select department"
                  borderRadius="lg"
                >
                  {userDepartments.map((dept, index) => (
                    <option key={index} value={dept}>
                      {dept}
                    </option>
                  ))}
                </Select>
              ) : (
                <Text color="red.500">
                  You must be associated with at least one department to add documents.
                </Text>
              )}
              {formError === "Please select a department" && (
                <FormErrorMessage>Department is required</FormErrorMessage>
              )}
            </FormControl>
            
            {/* File Upload */}
            <VStack spacing={4} align="stretch">
              {fileLimitWarning && (
                <Text color="red.500" fontSize="sm" textAlign="center">
                  {fileLimitWarning}
                </Text>
              )}
              <Box
                border="2px dashed"
                borderColor={isDragging ? "gray.200" : "gray.400"}
                bg={dropZoneBg}
                p={6}
                textAlign="center"
                alignItems={"center"}
                justifyContent={"center"}
                borderRadius="md"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                cursor="pointer"
                position="relative"
                className="transition-all duration-300"
                onClick={handleBoxClick}
              >
                <input
                  type="file"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  style={{ display: "none" }}
                />
                <Text fontSize="md" fontWeight="bold">
                  {selectedFile
                    ? `File selected: ${selectedFile.name}`
                    : "Choose a file or drag it here"}
                </Text>
              </Box>

              {selectedFile && (
                <HStack
                  justify="space-between"
                  w="full"
                  p={2}
                  borderRadius="md"
                  bg="gray.200"
                >
                  <Text fontSize="sm" fontWeight="medium" color="gray.700">
                    {selectedFile.name}
                  </Text>
                  <Button
                    size="xs"
                    colorScheme="red"
                    onClick={handleRemoveFile}
                  >
                    <IoClose />
                  </Button>
                </HStack>
              )}
            </VStack>
            
            {/* General form error */}
            {formError && formError !== "Document title is required" && formError !== "Please select a department" && (
              <Text color="red.500" fontSize="sm">
                {formError}
              </Text>
            )}
            
            <div className="my-4 md:my-6">
              <Button
                onClick={handleUpload}
                variant={"brand"}
                className="w-full bg-mainbrand text-base font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-800"
                isLoading={isSubmitting}
                isDisabled={isSubmitting || userDepartments.length === 0}
              >
                {isSubmitting ? <Spinner size="sm" /> : `Add to ${folderTitle || 'Folder'}`}
              </Button>
            </div>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}