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
  Checkbox,
  CheckboxGroup,
  Stack,
  Box,
} from "@chakra-ui/react";
import { Datepicker } from "components/datepicker/Datepicker";
import { useState, useEffect } from "react";
import { useUserStore } from "../stores/users.store";
import { roles, statuses } from "lib/configData";
import useUsers from "../viewmodels/users.viewmodel";

export default function AddOneUserModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  /* password */
  const [show, setShow] = useState(false);
  const handleClick = () => setShow(!show);
  
  // Initialize toast for form validation errors
  const toast = useToast();

  /**
   * get data from zustand store of the user
   */
  const { oneUserForm, setOneUserForm, clearOneUserForm } = useUserStore();

  /**
   * Get departments and user operations from viewmodel
   */
  const {
    departments,
    createUser,
    formLoading,
    setFormError,
  } = useUsers();

  /**
   * Reset form state when the modal is opened
   */
  useEffect(() => {
    if (isOpen) {
      setFormError("");
    }
  }, [isOpen, setFormError]);

  /**
   * Handle date change
   */
  const handleDateChange = (date: Date) => {
    setOneUserForm("hire_date", date);
  };

  /**
   * Handle department selection
   */
  const handleDepartmentChange = (deptId: number, checked: boolean) => {
    const updatedDepartments = checked 
      ? [...oneUserForm.departments, departments.find(d => d.id === deptId)!]
      : oneUserForm.departments.filter(d => d.id !== deptId);
    
    setOneUserForm("departments", updatedDepartments);
  };

  /**
   * Submission
   */
  const handleSubmit = async () => {
    // Basic validation
    if (!oneUserForm.name || !oneUserForm.email || !oneUserForm.password) {
      toast({
        title: "Missing Information",
        description: "Name, email and password are required",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const success = await createUser();
    if (success) {
      clearOneUserForm();
      onClose();
    }
  };

  return (
    <Modal onClose={onClose} isOpen={isOpen} isCentered size="2xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add One User</ModalHeader>
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
              <FormControl id="password" isRequired>
                <FormLabel>Password</FormLabel>
                <InputGroup size="md">
                  <Input
                    value={oneUserForm.password}
                    onChange={(e) => setOneUserForm("password", e.target.value)}
                    pr="4.5rem"
                    type={show ? "text" : "password"}
                    placeholder="Enter password"
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
            <div className="flex flex-col justify-between gap-4">
              <FormControl id="departments" isRequired>
                <FormLabel>Departments (Select multiple)</FormLabel>
                <Box maxH="150px" overflowY="auto" border="1px solid" borderColor="gray.200" borderRadius="lg" p={3}>
                  <CheckboxGroup>
                    <Stack spacing={2}>
                      {departments.map((dept) => (
                        <Checkbox 
                          key={dept.id} 
                          isChecked={oneUserForm.departments.some(d => d.id === dept.id)}
                          onChange={(e) => handleDepartmentChange(dept.id, e.target.checked)}
                        >
                          {dept.name}
                        </Checkbox>
                      ))}
                    </Stack>
                  </CheckboxGroup>
                </Box>
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
                {formLoading ? <Spinner size="sm" /> : "Add the User"}
              </Button>
            </div>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
