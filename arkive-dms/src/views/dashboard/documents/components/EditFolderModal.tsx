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
} from "@chakra-ui/react";

interface EditFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  folderTitle: string;
  setFolderTitle: (title: string) => void;
  handleSubmit: () => void;
  isLoading: boolean;
}

export default function EditFolderModal({
  isOpen,
  onClose,
  folderTitle,
  setFolderTitle,
  handleSubmit,
  isLoading,
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