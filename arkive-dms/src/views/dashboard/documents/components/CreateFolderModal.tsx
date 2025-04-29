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
  Textarea,
} from "@chakra-ui/react";
import useFolders from "../viewmodels/folders.viewmodel";

export default function CreateFolderModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const {
    folderTitle,
    setFolderTitle,
    folderDescription,
    setFolderDescription,
    handleSubmit,
  } = useFolders();

  return (
    <Modal onClose={onClose} isOpen={isOpen} isCentered size="2xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create a Folder</ModalHeader>
        <ModalCloseButton />
        <ModalBody className="z-10">
          <div className="z-10 flex flex-col gap-4">
            <div>
              <FormControl id="folder-title" isRequired>
                <FormLabel>Folder Title</FormLabel>
                <Input
                  value={folderTitle}
                  onChange={(e) => setFolderTitle(e.target.value)}
                  placeholder="Registrants CVs"
                  borderRadius="lg"
                />
              </FormControl>
            </div>
            <div>
              <FormControl id="folder-description" isRequired>
                <FormLabel>Description</FormLabel>
                <Textarea
                  value={folderDescription}
                  onChange={(e) => setFolderDescription(e.target.value)}
                  placeholder="The folder contains all the curriculum vitae files..."
                  id="textarea"
                  rows={5}
                />
              </FormControl>
            </div>
            <div className="my-4 md:my-6">
              <Button
                onClick={() => {
                  handleSubmit();
                  onClose();
                }}
                variant={"error"}
                className="w-full bg-mainbrand text-base font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-800"
              >
                Create Folder
              </Button>
            </div>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
