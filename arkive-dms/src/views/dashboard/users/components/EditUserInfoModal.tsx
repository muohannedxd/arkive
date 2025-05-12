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
  Select,
  InputGroup,
  InputRightElement,
  Spinner,
  useToast,
} from "@chakra-ui/react";
import { Datepicker } from "components/datepicker/Datepicker";
import { useState, useEffect, useRef } from "react";
import { useUserStore } from "../stores/users.store";
import { roles, statuses } from "lib/configData";
import useUsers from "../viewmodels/users.viewmodel";

export default function EditUserInfoModal({
  isOpen,
  onClose,
  userId,
}: {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
}) {
  /* password */
  const [show, setShow] = useState(false);
  const handleClick = () => setShow(!show);

  // Initialize toast for form validation errors
  const toast = useToast();

  // Track if initial fetch has happened
  const hasInitialFetchRef = useRef(false);

  /**
   * get data from zustand store of the user
   */
  const { oneUserForm, setOneUserForm, clearOneUserForm } = useUserStore();

  /**
   * Get departments and user operations from viewmodel
   */
  const {
    departments,
    fetchUserById,
    updateUser,
    formLoading,
    setFormError
  } = useUsers();

  /**
   * Reset form state and fetch user data when modal opens
   */
  useEffect(() => {
    // Only fetch user data when the modal is open and we have a userId
    if (isOpen && userId) {
      // Reset form messages
      setFormError("");
      
      // Only fetch user data once when modal opens to prevent infinite loop
      if (!hasInitialFetchRef.current) {
        fetchUserById(userId);
        hasInitialFetchRef.current = true;
      }
    } else {
      // Reset the ref when modal is closed
      hasInitialFetchRef.current = false;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, userId, setFormError]);

  /**
   * Handle date change
   */
  const handleDateChange = (date: Date) => {
    setOneUserForm("hire_date", date);
  };

  /**
   * Submission
   */
  const handleSubmit = async () => {
    // Basic validation
    if (!oneUserForm.name || !oneUserForm.email) {
      toast({
        title: "Missing Information",
        description: "Name and email are required",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const success = await updateUser(userId);
    if (success) {
      clearOneUserForm();
      onClose();
    }
  };

  return (
    <Modal onClose={onClose} isOpen={isOpen} isCentered size="2xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit User</ModalHeader>
        <ModalCloseButton />
        <ModalBody className="z-10">
          <div className="z-10 flex flex-col gap-4">
            <div>
              <FormControl id="full-name" isRequired>
                <FormLabel>Full name</FormLabel>
                <Input
                  value={oneUserForm.name}
                  onChange={(e) => setOneUserForm("name", e.target.value)}
                  placeholder="Juan"
                  borderRadius="lg"
                />
              </FormControl>
            </div>
            <div className="flex flex-col justify-between gap-4 md:flex-row">
              <FormControl id="email" isRequired>
                <FormLabel>Email Address</FormLabel>
                <Input
                  value={oneUserForm.email}
                  onChange={(e) => setOneUserForm("email", e.target.value)}
                  placeholder="useruser@gmail.com"
                  borderRadius="lg"
                />
              </FormControl>
              <FormControl id="phone-number" isRequired>
                <FormLabel>Phone Number</FormLabel>
                <Input
                  value={oneUserForm.phone}
                  onChange={(e) => setOneUserForm("phone", e.target.value)}
                  placeholder="+213 123456789"
                  borderRadius="lg"
                />
              </FormControl>
            </div>
            <div>
              <FormControl id="password">
                <FormLabel>Password (leave empty to keep current)</FormLabel>
                <InputGroup size="md">
                  <Input
                    value={oneUserForm.password}
                    onChange={(e) => setOneUserForm("password", e.target.value)}
                    pr="4.5rem"
                    type={show ? "text" : "password"}
                    placeholder="Enter new password"
                    borderRadius="lg"
                  />
                  <InputRightElement width="4.5rem" borderRadius="lg">
                    <Button
                      h="1.75rem"
                      size="sm"
                      onClick={handleClick}
                      borderRadius="10px"
                    >
                      {show ? "Hide" : "Show"}
                    </Button>
                  </InputRightElement>
                </InputGroup>
              </FormControl>
            </div>
            <div>
              <FormControl id="role" isRequired>
                <FormLabel>Role</FormLabel>
                <Select
                  value={oneUserForm.role}
                  onChange={(e) => setOneUserForm("role", e.target.value)}
                  placeholder="Select role"
                  borderRadius="lg"
                >
                  {roles.map((role) => (
                    <option key={role}>{role}</option>
                  ))}
                </Select>
              </FormControl>
            </div>
            <div className="flex flex-col justify-between gap-4 md:flex-row">
              <FormControl id="department" isRequired>
                <FormLabel>Department</FormLabel>
                <Select
                  value={oneUserForm.department}
                  onChange={(e) => setOneUserForm("department", e.target.value)}
                  placeholder="Select department"
                  borderRadius="lg"
                >
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.name}>
                      {dept.name}
                    </option>
                  ))}
                </Select>
              </FormControl>
              <FormControl id="position" isRequired>
                <FormLabel>Position</FormLabel>
                <Input
                  value={oneUserForm.position}
                  onChange={(e) => setOneUserForm("position", e.target.value)}
                  placeholder="IT Manager"
                  borderRadius="lg"
                />
              </FormControl>
            </div>
            <div>
              <FormControl id="hire-date" isRequired>
                <FormLabel>Hire Date</FormLabel>
                <Datepicker 
                  position="relative" 
                  onChange={handleDateChange}
                />
              </FormControl>
            </div>
            <div>
              <FormControl id="status" isRequired>
                <FormLabel>Status</FormLabel>
                <Select
                  value={oneUserForm.status}
                  onChange={(e) => setOneUserForm("status", e.target.value)}
                  placeholder="Select status"
                  borderRadius="lg"
                >
                  {statuses.map((status) => (
                    <option key={status}>{status}</option>
                  ))}
                </Select>
              </FormControl>
            </div>
            <div className="my-4 md:my-6">
              <Button
                onClick={handleSubmit}
                variant={"brand"}
                isLoading={formLoading}
                disabled={formLoading}
                className="w-full bg-mainbrand text-base font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-800"
              >
                {formLoading ? <Spinner size="sm" /> : "Update User"}
              </Button>
            </div>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
