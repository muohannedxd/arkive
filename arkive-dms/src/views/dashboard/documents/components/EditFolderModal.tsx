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
  Select,
} from "@chakra-ui/react";

interface EditFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  folderTitle: string;
  setFolderTitle: (title: string) => void;
  handleSubmit: () => void;
  isLoading: boolean;
  currentDepartment: string;
  selectedDepartment: string;
  setSelectedDepartment: (department: string) => void;
  userDepartments: string[];
}

export default function EditFolderModal({
  isOpen,
  onClose,
  folderTitle,
  setFolderTitle,
  handleSubmit,
  isLoading,
  currentDepartment,
  selectedDepartment,
  setSelectedDepartment,
  userDepartments = [],
}: EditFolderModalProps) {
  const handleSave = () => {
    handleSubmit();
    onClose();
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
              <FormControl id="folder-department" isRequired>
                <FormLabel>Department</FormLabel>
                {userDepartments.length > 0 ? (
                  <Select 
                    value={selectedDepartment || currentDepartment} 
                    onChange={(e) => setSelectedDepartment(e.target.value)}
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
                    You must be associated with at least one department to edit folders.
                  </Text>
                )}
              </FormControl>
            </div>
            
            <div className="my-4 md:my-6">
              <Button
                onClick={handleSave}
                isLoading={isLoading}
                variant={"error"}
                className="w-full bg-mainbrand text-base font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-800"
                isDisabled={userDepartments.length === 0}
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