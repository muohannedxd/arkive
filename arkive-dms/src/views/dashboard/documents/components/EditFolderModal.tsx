import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Button,
  FormControl,
  FormLabel,
  Input,
  Text,
  Box,
  Tag,
  TagLabel,
  TagCloseButton,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";

interface EditFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  folderTitle: string;
  setFolderTitle: (title: string) => void;
  handleSubmit: () => void;
  isLoading: boolean;
  folderDepartments: string[];
  setFolderDepartments: (departments: string[]) => void;
  userDepartments: string[];
}

export default function EditFolderModal({
  isOpen,
  onClose,
  folderTitle,
  setFolderTitle,
  handleSubmit,
  isLoading,
  folderDepartments = [],
  setFolderDepartments,
  userDepartments = [],
}: EditFolderModalProps) {
  const handleSave = () => {
    handleSubmit();
    onClose();
  };
  
  // Add a department from user departments to the folder
  const addDepartment = (dept: string) => {
    if (!folderDepartments.includes(dept)) {
      setFolderDepartments([...folderDepartments, dept]);
    }
  };
  
  // Remove a department from the folder
  const removeDepartment = (dept: string) => {
    setFolderDepartments(folderDepartments.filter(d => d !== dept));
  };

  return (
    <Modal onClose={onClose} isOpen={isOpen} isCentered size="2xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit Folder</ModalHeader>
        <ModalCloseButton />
        <ModalBody className="z-10">
          <div className="z-10 flex flex-col gap-4">
            <div>
              <FormControl id="folder-title" isRequired>
                <FormLabel>Folder Title</FormLabel>
                <Input
                  value={folderTitle}
                  onChange={(e) => setFolderTitle(e.target.value)}
                  placeholder="Enter folder title"
                  borderRadius="lg"
                />
              </FormControl>
            </div>
            
            <div>
              <FormLabel>Departments</FormLabel>
              <Box mb={3}>
                <Wrap spacing={2}>
                  {folderDepartments.map((dept, index) => (
                    <WrapItem key={index}>
                      <Tag size="md" colorScheme="blue" borderRadius="full" variant="solid">
                        <TagLabel>{dept}</TagLabel>
                        <TagCloseButton onClick={() => removeDepartment(dept)} />
                      </Tag>
                    </WrapItem>
                  ))}
                </Wrap>
                {folderDepartments.length === 0 && (
                  <Text fontSize="sm" color="gray.500">No departments assigned</Text>
                )}
              </Box>
              
              {userDepartments.length > 0 && (
                <Box mt={2}>
                  <Text fontSize="sm" fontWeight="medium" mb={1}>Add department:</Text>
                  <Wrap spacing={2}>
                    {userDepartments
                      .filter(dept => !folderDepartments.includes(dept))
                      .map((dept, index) => (
                        <WrapItem key={index}>
                          <Tag 
                            size="md" 
                            colorScheme="gray" 
                            borderRadius="full" 
                            cursor="pointer"
                            onClick={() => addDepartment(dept)}
                          >
                            <TagLabel>{dept}</TagLabel>
                            <Box as="span" ml={1}>+</Box>
                          </Tag>
                        </WrapItem>
                      ))}
                  </Wrap>
                </Box>
              )}
            </div>
            
            <div className="my-4 md:my-6">
              <Button
                onClick={handleSave}
                isLoading={isLoading}
                variant={"error"}
                className="w-full bg-mainbrand text-base font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-800"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}