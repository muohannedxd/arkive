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

export default function AddManyUserModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    if (event.dataTransfer.files.length > 0) {
      setSelectedFile(event.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleUpload = () => {
    if (!selectedFile) {
      alert("Please select a file first.");
      return;
    }
    console.log("Uploading file:", selectedFile.name);
    setSelectedFile(null);
    onClose();
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  // Manually trigger file input on box click
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
        <ModalHeader>Add Many Users</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <div className="mb-4 text-sm text-gray-700">
            <p>
              The file (.csv, .txt, .xsl, .xlsx) must contain a header with the following information:
            </p>
            <p>
              name, email, phone, password, role, department,
              position, status, hire_date
            </p>
          </div>
          <VStack spacing={4} align="stretch">
            {/* Drag & Drop Upload Box */}
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
                accept=".csv, .txt, .xls, .xlsx"
                onChange={handleFileChange}
                ref={fileInputRef}
                style={{ display: "none" }}
              />
              <Text fontSize="md" fontWeight="bold">
                {selectedFile
                  ? "File Selected: " + selectedFile.name
                  : "Choose a file or drag it here."}
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
                <Button size="xs" colorScheme="red" onClick={handleRemoveFile}>
                  <IoClose />
                </Button>
              </HStack>
            )}
          </VStack>

          <div className="my-4 md:my-6">
            <Button
              onClick={handleUpload}
              isDisabled={!selectedFile}
              colorScheme="brand"
              className="w-full bg-mainbrand text-base font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-800"
            >
              Upload Users
            </Button>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
