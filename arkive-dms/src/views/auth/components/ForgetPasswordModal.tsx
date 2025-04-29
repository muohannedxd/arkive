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
import { useState } from "react";

export default function ForgetPasswordModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [email, setEmail] = useState("");
  /**
   * Submission
   */
  const handleSubmit = () => {
    setEmail("");
    onClose();
  };

  return (
    <Modal onClose={onClose} isOpen={isOpen} isCentered size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Forgot Password?</ModalHeader>
        <ModalCloseButton />
        <ModalBody className="z-10">
          <div className="z-10 flex flex-col gap-4">
            <div className=" text-sm font-bold text-gray-700">
              Once you confirm, your request will go to the admin to
              review it and you will be able to recover your password.
            </div>
            <div>
              <FormControl id="email" isRequired size={"lg"}>
                <FormLabel>Email Address</FormLabel>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="useruser@gmail.com"
                  borderRadius="lg"
                />
              </FormControl>
            </div>
            <div className="my-4 md:my-6">
              <Button
                onClick={handleSubmit}
                variant={"brand"}
                className="w-full bg-brand-700 text-base font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-800"
              >
                Confirm
              </Button>
            </div>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
