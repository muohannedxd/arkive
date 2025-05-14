import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Text,
  useToast,
} from "@chakra-ui/react";
import { useState } from "react";
import axiosClient from "lib/axios";
import useDocument from "../viewmodels/document.viewmodel";

interface DeleteDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: number;
  documentTitle: string;
}

export default function DeleteDocumentModal({
  isOpen,
  onClose,
  documentId,
  documentTitle,
}: DeleteDocumentModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { fetchDocuments } = useDocument();
  const toast = useToast();

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      // Delete document via API
      await axiosClient.delete(`/documents/${documentId}`);
      
      // Show success message
      toast({
        title: "Document deleted",
        description: "The document has been successfully deleted.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      // Refresh documents list
      fetchDocuments();
      
      // Close modal
      onClose();
    } catch (error: any) {
      console.error("Error deleting document:", error);
      toast({
        title: "Error deleting document",
        description: error.response?.data?.message || "Failed to delete document",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal onClose={onClose} isOpen={isOpen} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Delete Document</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text>
            Are you sure you want to delete the document <Text as="span" fontWeight="bold">"{documentTitle}"</Text>?
            This action cannot be undone.
          </Text>
        </ModalBody>
        <ModalFooter>
          <Button mr={3} onClick={onClose} variant="outline">
            Cancel
          </Button>
          <Button 
            colorScheme="red" 
            onClick={handleDelete}
            isLoading={isLoading}
          >
            Delete
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}