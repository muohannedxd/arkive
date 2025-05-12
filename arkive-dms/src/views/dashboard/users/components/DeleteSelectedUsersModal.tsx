import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Button,
  Alert,
  AlertIcon,
  AlertTitle,
  Spinner,
} from "@chakra-ui/react";
import useUsers from "../viewmodels/users.viewmodel";

export default function DeleteSelectedUsersModal({
  isOpen,
  onClose,
  selectedUsers,
}: {
  isOpen: boolean;
  onClose: () => void;
  selectedUsers: number[];
}) {
  const { deleteSelectedUsers, formLoading, formError, formSuccess } = useUsers();

  /**
   * Submission
   */
  const handleSubmit = async () => {
    const success = await deleteSelectedUsers(selectedUsers);
    if (success) {
      setTimeout(() => {
        onClose();
      }, 1000);
    }
  };

  return (
    <Modal onClose={onClose} isOpen={isOpen} isCentered size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Delete Selected Users</ModalHeader>
        <ModalCloseButton />
        <ModalBody className="z-10">
          <div className="z-10 flex flex-col gap-4">
            {formError && (
              <Alert status="error" borderRadius="lg" mb={3}>
                <AlertIcon />
                <AlertTitle>{formError}</AlertTitle>
              </Alert>
            )}

            {formSuccess && (
              <Alert status="success" borderRadius="lg" mb={3}>
                <AlertIcon />
                <AlertTitle>{formSuccess}</AlertTitle>
              </Alert>
            )}
            
            <div className="font-bold">
              This action is permanent and you cannot recover the users. Are you
              sure you want to remove all {selectedUsers.length} selected users?
            </div>
            <div className="my-4 md:my-6">
              <Button
                onClick={handleSubmit}
                variant={"error"}
                isLoading={formLoading}
                disabled={formLoading}
                className="w-full bg-red-700 text-base font-medium text-white transition duration-200 hover:bg-red-600 active:bg-red-800"
              >
                {formLoading ? <Spinner size="sm" /> : `Delete ${selectedUsers.length} users`}
              </Button>
            </div>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
