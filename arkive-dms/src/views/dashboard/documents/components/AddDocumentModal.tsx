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
} from "@chakra-ui/react";
import { useRef, useState } from "react";
import { IoClose } from "react-icons/io5";

export default function AddDocumentModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [fileLimitWarning, setFileLimitWarning] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const numberOfAllowedFiles = 50;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      if (selectedFiles.length + newFiles.length > numberOfAllowedFiles) {
        setFileLimitWarning(
          `You can only upload up to ${numberOfAllowedFiles} files.`
        );
        return;
      }
      setFileLimitWarning("");
      setSelectedFiles([...selectedFiles, ...newFiles]);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const newFiles = Array.from(event.dataTransfer.files);
    if (selectedFiles.length + newFiles.length > numberOfAllowedFiles) {
      setFileLimitWarning(
        `You can only upload up to ${numberOfAllowedFiles} files.`
      );
      return;
    }
    setFileLimitWarning("");
    setSelectedFiles([...selectedFiles, ...newFiles]);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleUpload = () => {
    if (selectedFiles.length === 0) {
      setFileLimitWarning("Please select at least one file.");
      return;
    }
    console.log(
      "Uploading files:",
      selectedFiles.map((file) => file.name)
    );
    setSelectedFiles([]);
    setFileLimitWarning("");
    onClose();
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
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
        <ModalHeader>Add Documents</ModalHeader>
        <ModalCloseButton />
        <ModalBody className="z-10">
          <div className="z-10 flex flex-col gap-4">
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
                  multiple
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  style={{ display: "none" }}
                />
                <Text fontSize="md" fontWeight="bold">
                  {selectedFiles.length > 0
                    ? `${selectedFiles.length} file(s) selected`
                    : "Choose files or drag them here."}
                </Text>
              </Box>

              {selectedFiles.length > 0 && (
                <VStack spacing={2} w="full">
                  {selectedFiles.map((file, index) => (
                    <HStack
                      key={index}
                      justify="space-between"
                      w="full"
                      p={2}
                      borderRadius="md"
                      bg="gray.200"
                    >
                      <Text fontSize="sm" fontWeight="medium" color="gray.700">
                        {file.name}
                      </Text>
                      <Button
                        size="xs"
                        colorScheme="red"
                        onClick={() => handleRemoveFile(index)}
                      >
                        <IoClose />
                      </Button>
                    </HStack>
                  ))}
                </VStack>
              )}
            </VStack>
            <div className="my-4 md:my-6">
              <Button
                onClick={handleUpload}
                variant={"error"}
                className="w-full bg-mainbrand text-base font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-800"
              >
                Add Document(s)
              </Button>
            </div>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
