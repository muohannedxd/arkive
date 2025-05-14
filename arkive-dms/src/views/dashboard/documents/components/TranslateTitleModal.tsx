import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Button,
  Text,
  Select,
  FormControl,
  FormLabel,
  useToast,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import axiosClient from "lib/axios";
import useDocument from "../viewmodels/document.viewmodel";

interface TranslateTitleModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: number;
  documentTitle: string;
  documentDepartment: string;
  onTranslateSuccess?: (newTitle: string) => void;
}

export default function TranslateTitleModal({
  isOpen,
  onClose,
  documentId,
  documentTitle,
  documentDepartment,
  onTranslateSuccess,
}: TranslateTitleModalProps) {
  const [targetLanguage, setTargetLanguage] = useState<string>("");
  const [translatedTitle, setTranslatedTitle] = useState<string>("");
  const [originalLanguage, setOriginalLanguage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [translationSuccess, setTranslationSuccess] = useState<boolean>(false);
  
  const toast = useToast();
  const { fetchDocuments } = useDocument();

  // Reset state when modal opens or closes
  useEffect(() => {
    // When modal opens or closes, reset the state
    if (!isOpen) {
      // Small delay to ensure the modal is closed before resetting state
      // to avoid visual jumps in the UI
      const timer = setTimeout(() => {
        setTargetLanguage("");
        setTranslatedTitle("");
        setOriginalLanguage("");
        setError(null);
        setTranslationSuccess(false);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // List of supported languages
  const languageOptions = [
    { code: "Arabic", name: "Arabic" },
    { code: "English", name: "English" },
    { code: "French", name: "French" },
    { code: "Spanish", name: "Spanish" },
    { code: "German", name: "German" },
    { code: "Italian", name: "Italian" },
    { code: "Portuguese", name: "Portuguese" },
    { code: "Korean", name: "Korean" },
    { code: "Japanese", name: "Japanese" },
    { code: "Chinese", name: "Chinese" },
    { code: "Russian", name: "Russian" },
    { code: "Norwegian", name: "Norwegian" },
    { code: "Swedish", name: "Swedish" },
    { code: "Dutch", name: "Dutch" },
  ];

  const handleTranslate = async () => {
    if (!targetLanguage) {
      setError("Please select a target language");
      return;
    }

    setError(null);
    setIsLoading(true);
    setTranslationSuccess(false);

    try {
      const response = await axiosClient.post(
        "http://localhost:8003/api/translation/translate/", 
        {
          title: documentTitle,
          target_language: targetLanguage
        }
      );
      
      if (response.data) {
        setTranslatedTitle(response.data.translated_title);
        setOriginalLanguage(response.data.original_language);
        setTranslationSuccess(true);
        
        toast({
          title: "Translation successful",
          description: `Translated from ${response.data.original_language} to ${targetLanguage}`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (err: any) {
      console.error("Error translating document title:", err);
      setError(err.response?.data?.message || "Failed to translate document title");
      
      toast({
        title: "Translation failed",
        description: err.response?.data?.message || "Failed to translate document title",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveTranslation = async () => {
    if (!translatedTitle) return;
    
    setIsLoading(true);
    
    try {
      // Update the document with the new translated title
      // IMPORTANT: Include the department to prevent it from being nulled out
      await axiosClient.put(`/documents/${documentId}`, {
        title: translatedTitle,
        department: documentDepartment
      });
      
      // Show success message
      toast({
        title: "Title updated",
        description: "The document title has been updated with the translation",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      // Call the success callback if provided
      if (onTranslateSuccess) {
        onTranslateSuccess(translatedTitle);
      }
      
      // Refresh the main documents list
      fetchDocuments();
      
      // Close the modal
      onClose();
    } catch (err: any) {
      console.error("Error updating document title:", err);
      
      toast({
        title: "Update failed",
        description: err.response?.data?.message || "Failed to update document title",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle modal close with cleanup
  const handleClose = () => {
    onClose();
  };

  return (
    <Modal onClose={handleClose} isOpen={isOpen} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Translate Document Title</ModalHeader>
        <ModalCloseButton />
        <ModalBody className="z-10">
          <div className="z-10 flex flex-col gap-4 mb-4">
            {/* Original Title */}
            <div>
              <FormLabel>Original Title</FormLabel>
              <Text fontSize="md" fontWeight="medium" p={2} bg="gray.100" borderRadius="lg">
                {documentTitle}
              </Text>
            </div>

            {/* Target Language Selection */}
            <FormControl isRequired>
              <FormLabel>Select Target Language</FormLabel>
              <Select
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value)}
                placeholder="Select language"
                borderRadius="lg"
                isDisabled={isLoading || translationSuccess}
              >
                {languageOptions.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </Select>
            </FormControl>

            {/* Translation Button */}
            <Button
              onClick={handleTranslate}
              variant={"brand"}
              className="bg-mainbrand text-base font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-800"
              isLoading={isLoading && !translationSuccess}
              loadingText="Translating..."
              isDisabled={!targetLanguage || isLoading || translationSuccess}
              mt={2}
            >
              Translate
            </Button>

            {/* Error Message */}
            {error && (
              <Text color="red.500" fontSize="sm" mt={1}>
                {error}
              </Text>
            )}

            {/* Translated Result */}
            {translationSuccess && (
              <div className="mt-4">
                <FormLabel>Translated Title ({targetLanguage})</FormLabel>
                <Text fontSize="md" fontWeight="medium" p={2} bg="green.100" borderRadius="lg">
                  {translatedTitle}
                </Text>
                <Text fontSize="xs" mt={1} color="gray.500">
                  Detected original language: {originalLanguage}
                </Text>

                {/* Apply Translation Button */}
                <Button
                  onClick={handleSaveTranslation}
                  colorScheme="green"
                  className="w-full mt-4"
                  isLoading={isLoading}
                  loadingText="Updating..."
                >
                  Apply This Translation
                </Button>
              </div>
            )}

            {/* Close Button */}
            <Button
              onClick={onClose}
              variant={"outline"}
              mt={2}
              isDisabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}