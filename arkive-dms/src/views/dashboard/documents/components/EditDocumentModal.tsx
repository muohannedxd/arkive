import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Button,
  Text,
  FormControl,
  FormLabel,
  Input,
  Select,
  FormErrorMessage,
  Spinner,
  useToast,
} from "@chakra-ui/react";
import { useState, useEffect, useMemo } from "react";
import { useAuthStore } from "views/auth/stores/auth.store";
import axiosClient from "lib/axios";
import useDocument from "../viewmodels/document.viewmodel";

interface EditDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: number;
  currentTitle: string;
  currentDepartment: string;
}

export default function EditDocumentModal({
  isOpen,
  onClose,
  documentId,
  currentTitle,
  currentDepartment,
}: EditDocumentModalProps) {
  // Form state
  const [documentTitle, setDocumentTitle] = useState(currentTitle);
  const [selectedDepartment, setSelectedDepartment] = useState(currentDepartment);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get user information (for department selection)
  const { user } = useAuthStore();
  const { fetchDocuments } = useDocument();
  
  // Toast notifications
  const toast = useToast();

  // Get user departments using useMemo to prevent unnecessary re-renders
  const userDepartments = useMemo(() => {
    return user?.departments?.map(dept => dept.name) || [];
  }, [user?.departments]);

  // Reset form when modal opens with current document values
  useEffect(() => {
    if (isOpen) {
      setDocumentTitle(currentTitle);
      setSelectedDepartment(currentDepartment);
      setFormError(null);
    }
  }, [isOpen, currentTitle, currentDepartment]);

  const handleSubmit = async () => {
    // Validation
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
    setIsSubmitting(true);
    
    try {
      // Update the document using API
      await axiosClient.put(`/documents/${documentId}`, {
        title: documentTitle,
        department: selectedDepartment,
      });
      
      // Show success message
      toast({
        title: "Document updated",
        description: "The document has been updated successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      // Refresh the document list
      fetchDocuments();
      
      // Close the modal
      onClose();
    } catch (err: any) {
      console.error("Error updating document:", err);
      setFormError(err.response?.data?.message || "Failed to update document");
      toast({
        title: "Error updating document",
        description: err.response?.data?.message || "Failed to update document",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal onClose={onClose} isOpen={isOpen} isCentered size="2xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit Document</ModalHeader>
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
                  You must be associated with at least one department to edit documents.
                </Text>
              )}
              {formError === "Please select a department" && (
                <FormErrorMessage>Department is required</FormErrorMessage>
              )}
            </FormControl>
            
            {/* General form error */}
            {formError && formError !== "Document title is required" && formError !== "Please select a department" && (
              <Text color="red.500" fontSize="sm">
                {formError}
              </Text>
            )}
            
            <div className="my-4 md:my-6">
              <Button
                onClick={handleSubmit}
                variant={"brand"}
                className="w-full bg-mainbrand text-base font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-800"
                isLoading={isSubmitting}
                isDisabled={isSubmitting || userDepartments.length === 0}
              >
                {isSubmitting ? <Spinner size="sm" /> : "Update Document"}
              </Button>
            </div>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}