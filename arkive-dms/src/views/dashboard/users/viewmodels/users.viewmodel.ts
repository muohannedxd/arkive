import { SortingState } from "@tanstack/react-table";
import { useCallback, useEffect, useState } from "react";
import { useDisclosure } from "@chakra-ui/react";
import axiosClient from "lib/axios";
import { UserRowObj, UserObject } from "types/user";
import { useUserStore } from "../stores/users.store";

export default function useUsers() {
  /**
   * Users display and search and filter
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

  const [sorting, setSorting] = useState<SortingState>([]);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  // Default departments in case API fails
  const defaultDepartments = [
    { id: 1, name: "Information Technology" },
    { id: 2, name: "Marketing" },
    { id: 3, name: "Human Resources" },
    { id: 4, name: "Finance" },
    { id: 5, name: "Operations" }
  ];
  
  const [departments, setDepartments] = useState<{ id: number, name: string }[]>(defaultDepartments);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  // Fetch departments from API
  const fetchDepartments = useCallback(async () => {
    try {
      const response = await axiosClient.get("/departments");
      // Check if the response has the expected shape
      const deptData = response.data?.data || response.data;
      if (Array.isArray(deptData) && deptData.length > 0) {
        setDepartments(deptData);
      }
    } catch (error) {
      console.error("Failed to fetch departments:", error);
      // Keep using default departments if API fails
    }
  }, []);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

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
      
      const transformedData: UserRowObj[] = response.data.data.map((user: UserObject) => ({
        personal: [user.name, user.email, user.id],
        phone: user.phone,
        role: user.role,
        position: user.position,
        department: user.department,
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
   * Users select
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
   * Create user
   */
  const createUser = async () => {
    setFormLoading(true);
    setFormError("");
    setFormSuccess("");
    
    try {
      // Find the department id based on the department name
      const selectedDepartmentName = oneUserForm.department;
      const selectedDepartment = departments.find(dept => dept.name === selectedDepartmentName);
      
      // Format the user data for the API
      const userData = {
        ...oneUserForm,
        // Map department name to department_id for API request
        department_id: selectedDepartment ? selectedDepartment.id : null,
        // Make sure hire_date is in ISO format string 
        hire_date: oneUserForm.hire_date instanceof Date 
          ? oneUserForm.hire_date.toISOString().split('T')[0] 
          : oneUserForm.hire_date
      };
      
      console.log("Sending user data:", userData);
      
      const response = await axiosClient.post("/users", userData);
      console.log("API response:", response.data);
      
      if (response.data.status === "error") {
        // If the API returns an error status, show the error message
        setFormError(response.data.message || "Failed to create user");
        return false;
      }
      
      setFormSuccess("User created successfully!");
      clearOneUserForm();
      await fetchUsers();
      return true;
    } catch (error: any) {
      console.error("Failed to create user:", error);
      // More detailed error logging and error message extraction
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        
        // Extract the error message from the response
        const errorMessage = error.response.data?.message || 
                            (error.response.data?.status === "error" && error.response.data?.data) || 
                            "Failed to create user";
        setFormError(errorMessage);
      } else {
        setFormError("Failed to connect to the server");
      }
      return false;
    } finally {
      setFormLoading(false);
    }
  };

  /**
   * Get user for editing
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
   * Update user
   */
  const updateUser = async (userId: number) => {
    setFormLoading(true);
    setFormError("");
    setFormSuccess("");
    
    try {
      // Format the user data for the API
      const userData = {
        ...oneUserForm,
        // Make sure hire_date is in ISO format string 
        hire_date: oneUserForm.hire_date instanceof Date 
          ? oneUserForm.hire_date.toISOString().split('T')[0] 
          : oneUserForm.hire_date
      };
      
      console.log("Updating user data:", userData);
      
      const response = await axiosClient.put(`/users/${userId}`, userData);
      console.log("API response:", response.data);
      
      if (response.data.status === "error") {
        // If the API returns an error status, show the error message
        setFormError(response.data.message || "Failed to update user");
        return false;
      }
      
      setFormSuccess("User updated successfully!");
      await fetchUsers();
      return true;
    } catch (error: any) {
      console.error("Failed to update user:", error);
      // More detailed error logging and error message extraction
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        
        // Extract the error message from the response
        const errorMessage = error.response.data?.message || 
                            (error.response.data?.status === "error" && error.response.data?.data) || 
                            "Failed to update user";
        setFormError(errorMessage);
      } else {
        setFormError("Failed to connect to the server");
      }
      return false;
    } finally {
      setFormLoading(false);
    }
  };

  /**
   * Delete user
   */
  const deleteUser = async (userId: number) => {
    setFormLoading(true);
    setFormError("");
    setFormSuccess("");
    
    try {
      await axiosClient.delete(`/users/${userId}`);
      setFormSuccess("User deleted successfully!");
      await fetchUsers();
      return true;
    } catch (error: any) {
      console.error("Failed to delete user:", error);
      setFormError(error.response?.data?.message || "Failed to delete user");
      return false;
    } finally {
      setFormLoading(false);
    }
  };

  /**
   * Delete multiple users
   */
  const deleteSelectedUsers = async (userIds: number[]) => {
    setFormLoading(true);
    setFormError("");
    setFormSuccess("");
    
    try {
      // Using Promise.all to delete multiple users in parallel
      await Promise.all(userIds.map(id => axiosClient.delete(`/users/${id}`)));
      
      // Clear selection after successful deletion
      setSelectedUsers([]);
      setIsAllSelected(false);
      
      setFormSuccess("Selected users deleted successfully!");
      await fetchUsers();
      return true;
    } catch (error: any) {
      console.error("Failed to delete users:", error);
      setFormError(error.response?.data?.message || "Failed to delete users");
      return false;
    } finally {
      setFormLoading(false);
    }
  };

  /**
   * Users adding: add one user
   */
  const {
    isOpen: isOpenOneUserModal,
    onOpen: onOpenOneUserModal,
    onClose: onCloseOneUserModal,
  } = useDisclosure();

  /**
   * Users adding: add many users
   */
  const {
    isOpen: isOpenManyUserModal,
    onOpen: onOpenManyUserModal,
    onClose: onCloseManyUserModal,
  } = useDisclosure();

  /**
   * Request document
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
   * Edit user info
   */
  const {
    isOpen: isOpenEditUserInfoModal,
    onOpen: onOpenEditUserInfoModal,
    onClose: onCloseEditUserInfoModal,
  } = useDisclosure();

  /**
   * Delete user
   */
  const {
    isOpen: isOpenDeleteUserModal,
    onOpen: onOpenDeleteUserModal,
    onClose: onCloseDeleteUserModal,
  } = useDisclosure();

  /**
   * Delete selected users
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
