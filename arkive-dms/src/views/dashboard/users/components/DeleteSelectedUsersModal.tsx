import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Button,
} from "@chakra-ui/react";

export default function DeleteSelectedUsersModal({
  isOpen,
  onClose,
  selectedUsers,
}: {
  isOpen: boolean;
  onClose: () => void;
  selectedUsers: number[];
}) {
  /**
   * Submission
   */
  const handleSubmit = () => {
    onClose();
  };

  return (
    <Modal onClose={onClose} isOpen={isOpen} isCentered size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Delete Selected Users</ModalHeader>
        <ModalCloseButton />
        <ModalBody className="z-10">
          <div className="z-10 flex flex-col gap-4">
            <div className=" font-bold">
              This action is permanent and you cannot recover the user. Are you
              sure you want to remove all the selected users?
            </div>
            <div className="my-4 md:my-6">
              <Button
                onClick={handleSubmit}
                variant={"error"}
                className="w-full bg-red-700 text-base font-medium text-white transition duration-200 hover:bg-red-600 active:bg-red-800"
              >
                Delete {selectedUsers.length} users
              </Button>
            </div>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
