import { SortingState } from "@tanstack/react-table";
import { useCallback, useEffect, useState } from "react";
import { useDisclosure, useToast } from "@chakra-ui/react";
import axiosClient from "lib/axios";
import { UserRowObj, UserObject } from "types/user";
import { useUserStore } from "../stores/users.store";
import useDepartments from "./departments.viewmodel";
import { useAuthStore } from "views/auth/stores/auth.store";

export default function useUsers() {
  /**
   * users display and search and filter
   */
  const { 
    usersData, 
    pageIndex, 
    countPerPage, 
    setUsersData, 
    setTotalUsers, 
    userSearchKey, 
    userFilters,
    oneUserForm,
    setOneUserForm,
    clearOneUserForm
  } = useUserStore();

  // Get auth store to update logged in user if needed
  const { user: currentUser, token } = useAuthStore();

  // Initialize toast
  const toast = useToast();

  // get departments and fetchDepartments function from the departments viewmodel
  const { departments, fetchDepartments } = useDepartments();
  
  // Ensure we have the latest departments data before any user operations
  useEffect(() => {
    // Fetch departments when the component mounts
    fetchDepartments();
    // Set up an interval to periodically refresh departments (every 30 seconds)
    const intervalId = setInterval(() => {
      fetchDepartments();
    }, 30000);
    
    // Clean up the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, [fetchDepartments]);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axiosClient.get("/users", {
        params: {
          page: pageIndex + 1,
          per_page: countPerPage,
          search: userSearchKey,
          ...userFilters,
        },
      });
      
      const transformedData: UserRowObj[] = response.data.data.map((user: any) => ({
        personal: [user.name, user.email, user.id],
        phone: user.phone,
        role: user.role,
        position: user.position,
        departments: user.departments || [], // Updated to use departments array
        status: user.status,
        hire_date: user.hire_date,
      }));
  
      setTotalUsers(response.data.total);
      setUsersData(transformedData);
      setError(false);
      setTimeout(() => setIsLoading(false), 1000);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      setIsLoading(false);
      setError(true);
    }
  }, [pageIndex, countPerPage, userSearchKey, userFilters, setTotalUsers, setUsersData]);
  
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers, setUsersData, pageIndex, countPerPage, userSearchKey, userFilters]);

  const retryUsersFetch = () => {
    fetchUsers();
  };

  /**
   * users select
   */
  const handleUserSelect = (id: number) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((userId) => userId !== id) : [...prev, id]
    );
  };

  const userIdsOnCurrentPage = usersData.map((user) => user.personal[2]); // IDs

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(userIdsOnCurrentPage);
    }
    setIsAllSelected(!isAllSelected);
  };

  /**
   * create user
   */
  const createUser = async () => {
    setFormLoading(true);
    setFormError("");
    setFormSuccess("");
    
    try {
      // Extract department IDs from the selected departments
      const departmentIds = oneUserForm.departments.map(dept => dept.id);
      
      const userData = {
        ...oneUserForm,
        department_ids: departmentIds, // Send array of department IDs
        hire_date: oneUserForm.hire_date instanceof Date 
          ? oneUserForm.hire_date.toISOString().split('T')[0] 
          : oneUserForm.hire_date
      };
      
      console.log("Sending user data:", userData);
      
      const response = await axiosClient.post("/users", userData);
      console.log("API response:", response.data);
      
      if (response.data.status === "error") {
        toast({
          title: "Error Creating User",
          description: response.data.message || "Failed to create user",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        return false;
      }
      
      toast({
        title: "User Created",
        description: "The user has been created successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      clearOneUserForm();
      await fetchUsers();
      return true;
    } catch (error: any) {
      console.error("Failed to create user:", error);
      
      const errorMessage = error.response?.data?.message || 
                           (error.response?.data?.status === "error" && error.response?.data?.data) || 
                           "Failed to create user";
      
      toast({
        title: "Error Creating User",
        description: errorMessage,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      
      return false;
    } finally {
      setFormLoading(false);
    }
  };

  /**
   * get user for editing
   */
  const fetchUserById = async (userId: number) => {
    setFormLoading(true);
    try {
      const response = await axiosClient.get(`/users/${userId}`);
      const userData = response.data.data;
      
      // Update all fields in the form
      Object.keys(userData).forEach((key) => {
        if (key in oneUserForm) {
          setOneUserForm(key as keyof UserObject, userData[key]);
        }
      });
    } catch (error) {
      console.error("Failed to fetch user:", error);
      setFormError("Failed to load user data");
    } finally {
      setFormLoading(false);
    }
  };

  /**
   * update user
   */
  const updateUser = async (userId: number) => {
    setFormLoading(true);
    setFormError("");
    setFormSuccess("");
    
    try {
      // Extract department IDs from the selected departments
      const departmentIds = oneUserForm.departments.map(dept => dept.id);
      
      const userData = {
        ...oneUserForm,
        department_ids: departmentIds, // Send array of department IDs
        hire_date: oneUserForm.hire_date instanceof Date 
          ? oneUserForm.hire_date.toISOString().split('T')[0] 
          : oneUserForm.hire_date
      };
      
      console.log("Updating user data:", userData);
      
      const response = await axiosClient.put(`/users/${userId}`, userData);
      console.log("API response:", response.data);
      
      if (response.data.status === "error") {
        toast({
          title: "Error Updating User",
          description: response.data.message || "Failed to update user",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        return false;
      }
      
      toast({
        title: "User Updated",
        description: "The user has been updated successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Check if the updated user is the currently logged-in user
      if (currentUser && userId === currentUser.id) {
        // Get the updated user data from the response or use the form data
        const updatedUser = response.data.data || {
          ...currentUser,
          ...userData,
          departments: oneUserForm.departments // Keep the department objects
        };
        
        // Update the user in localStorage
        localStorage.setItem("user", JSON.stringify(updatedUser));
        
        // No need to update the token
        if (token) {
          localStorage.setItem("token", token);
        }
      }
      
      await fetchUsers();
      return true;
    } catch (error: any) {
      console.error("Failed to update user:", error);
      
      const errorMessage = error.response?.data?.message || 
                          (error.response?.data?.status === "error" && error.response?.data?.data) || 
                          "Failed to update user";
      
      toast({
        title: "Error Updating User",
        description: errorMessage,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      
      return false;
    } finally {
      setFormLoading(false);
    }
  };

  /**
   * delete user
   */
  const deleteUser = async (userId: number) => {
    setFormLoading(true);
    setFormError("");
    setFormSuccess("");
    
    try {
      await axiosClient.delete(`/users/${userId}`);
      
      toast({
        title: "User Deleted",
        description: "The user has been deleted successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      await fetchUsers();
      return true;
    } catch (error: any) {
      console.error("Failed to delete user:", error);
      
      toast({
        title: "Error Deleting User",
        description: error.response?.data?.message || "Failed to delete user",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      
      return false;
    } finally {
      setFormLoading(false);
    }
  };

  /**
   * delete multiple users
   */
  const deleteSelectedUsers = async (userIds: number[]) => {
    setFormLoading(true);
    setFormError("");
    setFormSuccess("");
    
    try {
      // using Promise.all to delete multiple users in parallel
      await Promise.all(userIds.map(id => axiosClient.delete(`/users/${id}`)));
      
      setSelectedUsers([]);
      setIsAllSelected(false);
      
      toast({
        title: "Users Deleted",
        description: `${userIds.length} user(s) have been deleted successfully`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      await fetchUsers();
      return true;
    } catch (error: any) {
      console.error("Failed to delete users:", error);
      
      toast({
        title: "Error Deleting Users",
        description: error.response?.data?.message || "Failed to delete users",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      
      return false;
    } finally {
      setFormLoading(false);
    }
  };

  /**
   * users adding: add one user
   */
  const {
    isOpen: isOpenOneUserModal,
    onOpen: onOpenOneUserModal,
    onClose: onCloseOneUserModal,
  } = useDisclosure();

  /**
   * users adding: add many users
   */
  const {
    isOpen: isOpenManyUserModal,
    onOpen: onOpenManyUserModal,
    onClose: onCloseManyUserModal,
  } = useDisclosure();

  /**
   * request document
   */
  const [menuSelectedUserId, setMenumenuSelectedUserId] = useState<
    number | null
  >(null);

  const {
    isOpen: isOpenRequestDocumentModal,
    onOpen: onOpenRequestDocumentModal,
    onClose: onCloseRequestDocumentModal,
  } = useDisclosure();

  /**
   * edit user info
   */
  const {
    isOpen: isOpenEditUserInfoModal,
    onOpen: onOpenEditUserInfoModal,
    onClose: onCloseEditUserInfoModal,
  } = useDisclosure();

  /**
   * delete user
   */
  const {
    isOpen: isOpenDeleteUserModal,
    onOpen: onOpenDeleteUserModal,
    onClose: onCloseDeleteUserModal,
  } = useDisclosure();

  /**
   * delete selected users
   */
  const {
    isOpen: isOpenDeleteSelectedUsersModal,
    onOpen: onOpenDeleteSelectedUsersModal,
    onClose: onCloseDeleteSelectedUsersModal,
  } = useDisclosure();

  return {
    // user display, search & filter
    sorting,
    setSorting,
    selectedUsers,
    isAllSelected,
    handleSelectAll,
    setSelectedUsers,
    setIsAllSelected,
    handleUserSelect,
    isLoading,
    error,
    retryUsersFetch,
    // user adding
    isOpenOneUserModal,
    onOpenOneUserModal,
    onCloseOneUserModal,
    isOpenManyUserModal,
    onOpenManyUserModal,
    onCloseManyUserModal,
    // request document
    menuSelectedUserId,
    setMenumenuSelectedUserId,
    isOpenRequestDocumentModal,
    onOpenRequestDocumentModal,
    onCloseRequestDocumentModal,
    // edit user info
    isOpenEditUserInfoModal,
    onOpenEditUserInfoModal,
    onCloseEditUserInfoModal,
    fetchUserById,
    // delete user
    isOpenDeleteUserModal,
    onOpenDeleteUserModal,
    onCloseDeleteUserModal,
    // delete selected users
    isOpenDeleteSelectedUsersModal,
    onOpenDeleteSelectedUsersModal,
    onCloseDeleteSelectedUsersModal,
    // CRUD operations
    createUser,
    updateUser,
    deleteUser,
    deleteSelectedUsers,
    departments,
    formLoading,
    formError,
    formSuccess,
    setFormError,
    setFormSuccess
  };
}
