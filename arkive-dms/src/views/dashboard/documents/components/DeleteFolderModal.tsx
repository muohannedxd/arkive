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
} from "@chakra-ui/react";

interface DeleteFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

export default function DeleteFolderModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
}: DeleteFolderModalProps) {
  return (
    <Modal onClose={onClose} isOpen={isOpen} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Delete Folder</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text>
            Are you sure you want to delete this folder? All documents inside the folder will also be deleted.
            This action cannot be undone.
          </Text>
        </ModalBody>
        <ModalFooter>
          <Button mr={3} onClick={onClose} variant="outline">
            Cancel
          </Button>
          <Button 
            colorScheme="red" 
            onClick={onConfirm}
            isLoading={isLoading}
          >
            Delete
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}