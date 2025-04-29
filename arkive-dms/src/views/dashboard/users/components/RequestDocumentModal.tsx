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

import { useUserStore } from "../stores/users.store";

export default function RequestDocumentModal({
  isOpen,
  onClose,
  userId,
}: {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
}) {
  /**
   * get data from zustand store of the user
   */
  const { docRequestForm, setDocRequestForm, clearDocRequestForm } = useUserStore();

  /**
   * Submission
   */
  const handleSubmit = () => {
    clearDocRequestForm();
    onClose();
  };

  return (
    <Modal onClose={onClose} isOpen={isOpen} isCentered size="2xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Request Document</ModalHeader>
        <ModalCloseButton />
        <ModalBody className="z-10">
          <div className="z-10 flex flex-col gap-4">
            <div>
              <FormControl id="document-title" isRequired>
                <FormLabel>Document Title</FormLabel>
                <Input
                  value={docRequestForm.title}
                  onChange={(e) => setDocRequestForm("title", e.target.value)}
                  placeholder="Event Registration Sheet"
                  borderRadius="lg"
                />
              </FormControl>
            </div>
            <div>
              <FormControl id="document-description" isRequired>
                <FormLabel>Description</FormLabel>
                <Textarea
                  value={docRequestForm.description}
                  onChange={(e) =>
                    setDocRequestForm("description", e.target.value)
                  }
                  placeholder="The document should highlight..."
                  id="textarea"
                  rows={5}
                />
              </FormControl>
            </div>
            <div className="my-4 md:my-6">
              <Button
                onClick={handleSubmit}
                variant={"brand"}
                className="w-full bg-mainbrand text-base font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-800"
              >
                Make Request
              </Button>
            </div>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
