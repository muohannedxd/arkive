import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Alert,
  AlertIcon,
  Spinner,
  List,
  ListItem,
  IconButton,
  Flex,
  Text,
  Divider
} from "@chakra-ui/react";
import { RiDeleteBin2Line } from "react-icons/ri";
import useDepartments from "../viewmodels/departments.viewmodel";
import { useEffect } from "react";

export default function DepartmentsModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const {
    departments,
    newDepartmentName,
    setNewDepartmentName,
    isLoading,
    error,
    success,
    setError,
    setSuccess,
    fetchDepartments,
    addDepartment,
    deleteDepartment,
  } = useDepartments();

  // refresh departments when modal opens and clear messages
  useEffect(() => {
    if (isOpen) {
      fetchDepartments();
      // clear any previous success/error messages when opening the modal
      setError(null);
      setSuccess(null);
    }
  }, [isOpen, fetchDepartments, setError, setSuccess]);

  const handleAddDepartment = async () => {
    await addDepartment();
  };

  const handleDeleteDepartment = async (id: number) => {
    await deleteDepartment(id);
  };

  // custom close handler to clear messages
  const handleClose = () => {
    setError(null);
    setSuccess(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Manage Departments</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          {error && (
            <Alert status="error" mb={4} borderRadius="md">
              <AlertIcon />
              {error}
            </Alert>
          )}

          {success && (
            <Alert status="success" mb={4} borderRadius="md">
              <AlertIcon />
              {success}
            </Alert>
          )}

          {/* Add new department section */}
          <FormControl>
            <FormLabel>Add New Department</FormLabel>
            <Flex>
              <Input
                value={newDepartmentName}
                onChange={(e) => setNewDepartmentName(e.target.value)}
                placeholder="Department name"
                mr={2}
              />
              <Button
                colorScheme="blue"
                onClick={handleAddDepartment}
                isLoading={isLoading}
              >
                Add
              </Button>
            </Flex>
          </FormControl>

          <Divider my={4} />

          {/* List existing departments */}
          <Text fontWeight="medium" mb={2}>
            Existing Departments
          </Text>
          {isLoading ? (
            <Flex justify="center" py={4}>
              <Spinner size="md" />
            </Flex>
          ) : (
            <List spacing={2}>
              {departments.map((dept) => (
                <ListItem
                  key={dept.id}
                  p={2}
                  borderWidth="1px"
                  borderRadius="md"
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Text>{dept.name}</Text>
                  <IconButton
                    aria-label="Delete department"
                    icon={<RiDeleteBin2Line />}
                    size="sm"
                    colorScheme="red"
                    variant="ghost"
                    onClick={() => handleDeleteDepartment(dept.id)}
                  />
                </ListItem>
              ))}
              {departments.length === 0 && (
                <Text color="gray.500" textAlign="center" py={2}>
                  No departments found
                </Text>
              )}
            </List>
          )}
        </ModalBody>

        <ModalFooter>
          <Button onClick={handleClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}