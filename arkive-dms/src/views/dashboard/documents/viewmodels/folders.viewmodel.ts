import { useDisclosure } from "@chakra-ui/hooks";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useFolderStore } from "../stores/folder.store";
import { FolderObject } from "types/document";
import axiosClient from "lib/axios";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@chakra-ui/react";
import { useAuthStore } from "views/auth/stores/auth.store";

export default function useFolders() {
  // State for create/edit folder form
  const [folderTitle, setFolderTitle] = useState("");
  const [editFolderId, setEditFolderId] = useState<number | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");

  // Toast for notifications
  const toast = useToast();
  
  // Get user information from auth store to determine departments
  const { user } = useAuthStore();
  
  // Get all user departments
  const userDepartments = useMemo(() => (
    user?.departments && user.departments.length > 0 
      ? user.departments.map(dept => dept.name) 
      : []
  ), [user?.departments]);

  // Set default selected department when userDepartments change
  useEffect(() => {
    if (userDepartments.length > 0 && !selectedDepartment) {
      setSelectedDepartment(userDepartments[0]);
    }
  }, [userDepartments, selectedDepartment]);

  // Get folder store data and actions
  const {
    foldersData,
    setFoldersData,
    isLoading,
    setIsLoading,
    error,
    setError,
    currentFolderId,
    setCurrentFolderId
  } = useFolderStore();

  /**
   * Fetch folders from backend
   */
  const fetchFolders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      let response;
      
      if (userDepartments.length > 0) {
        // Send departments as an array in request body instead of query params
        response = await axiosClient.post("/folders/filter", {
          departments: userDepartments
        });
      } else {
        response = await axiosClient.get("/folders");
      }
      
      if (response.data?.data) {
        setFoldersData(response.data.data);
      } else {
        setFoldersData([]);
      }
    } catch (err: any) {
      console.error("Error fetching folders:", err);
      setError(err.response?.data?.message || "Failed to fetch folders");
    } finally {
      setIsLoading(false);
    }
  }, [setFoldersData, setIsLoading, setError, userDepartments]);

  // Fetch folders on component mount or when user departments change
  useEffect(() => {
    fetchFolders();
  }, [fetchFolders]);

  /**
   * Format date for display
   */
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return "Unknown date";
    }
  };

  /**
   * Form handlers
   */
  const clearCreateFolderForm = () => {
    setFolderTitle("");
    setEditFolderId(null);
    setSelectedDepartment(userDepartments[0] || "");
  };

  /**
   * Create new folder or update existing one
   */
  const handleSubmit = async () => {
    if (!folderTitle.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter a folder title",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    // Ensure user has at least one department before creating folders
    if (userDepartments.length === 0 && !editFolderId) {
      toast({
        title: "Department Required",
        description: "You must be associated with a department to create folders",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    
    try {
      if (editFolderId) {
        // Update existing folder
        await axiosClient.put(`/folders/${editFolderId}`, {
          title: folderTitle.trim(),
          department: selectedDepartment
        });
        
        toast({
          title: "Folder updated",
          description: "The folder has been updated successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        // Create new folder
        await axiosClient.post("/folders", {
          title: folderTitle.trim(),
          department: selectedDepartment || userDepartments[0]
        });
        
        toast({
          title: "Folder created",
          description: "The folder has been created successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
      
      // Refetch folders
      fetchFolders();
      clearCreateFolderForm();
    } catch (err: any) {
      console.error("Error saving folder:", err);
      toast({
        title: "Error saving folder",
        description: err.response?.data?.message || "Failed to save folder",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Delete a folder
   */
  const deleteFolder = async (folderId: number) => {
    setIsLoading(true);
    try {
      await axiosClient.delete(`/folders/${folderId}`);
      toast({
        title: "Folder deleted",
        description: "The folder has been deleted successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      // Refetch folders
      fetchFolders();
    } catch (err: any) {
      console.error("Error deleting folder:", err);
      toast({
        title: "Error deleting folder",
        description: err.response?.data?.message || "Failed to delete folder",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle folder navigation
   */
  const navigateToFolder = (folderId: number) => {
    setCurrentFolderId(folderId);
  };

  const navigateBack = () => {
    setCurrentFolderId(null);
  };

  /**
   * Edit folder
   */
  const startEditFolder = (folder: FolderObject) => {
    setFolderTitle(folder.title);
    setEditFolderId(folder.id);
    setSelectedDepartment(folder.department);
    onOpenEditFolderModal();
  };

  /**
   * Modals
   */
  const {
    isOpen: isOpenCreateFolderModal,
    onOpen: onOpenCreateFolderModal,
    onClose: onCloseCreateFolderModalRaw,
  } = useDisclosure();
  
  const {
    isOpen: isOpenEditFolderModal,
    onOpen: onOpenEditFolderModal,
    onClose: onCloseEditFolderModalRaw,
  } = useDisclosure();
  
  const {
    isOpen: isOpenDeleteFolderModal,
    onOpen: onOpenDeleteFolderModal,
    onClose: onCloseDeleteFolderModal,
  } = useDisclosure();

  const [folderToDelete, setFolderToDelete] = useState<number | null>(null);

  const onCloseCreateFolderModal = () => {
    onCloseCreateFolderModalRaw();
    clearCreateFolderForm();
  };

  const onCloseEditFolderModal = () => {
    onCloseEditFolderModalRaw();
    clearCreateFolderForm();
  };

  const confirmDeleteFolder = (folderId: number) => {
    setFolderToDelete(folderId);
    onOpenDeleteFolderModal();
  };

  const handleConfirmDelete = async () => {
    if (folderToDelete !== null) {
      await deleteFolder(folderToDelete);
      onCloseDeleteFolderModal();
      setFolderToDelete(null);
    }
  };

  return {
    // Folder data
    foldersData,
    isLoading,
    error,
    formatDate,
    
    // Form state
    folderTitle,
    setFolderTitle,
    clearCreateFolderForm,
    handleSubmit,
    editFolderId,
    selectedDepartment,
    setSelectedDepartment,
    
    // Navigation
    currentFolderId,
    navigateToFolder,
    navigateBack,
    
    // Folder actions
    startEditFolder,
    confirmDeleteFolder,
    
    // Modals - Create
    isOpenCreateFolderModal,
    onOpenCreateFolderModal,
    onCloseCreateFolderModal,
    
    // Modals - Edit
    isOpenEditFolderModal,
    onOpenEditFolderModal,
    onCloseEditFolderModal,
    
    // Modals - Delete
    isOpenDeleteFolderModal,
    onCloseDeleteFolderModal,
    handleConfirmDelete,
    folderToDelete,
    
    // Utils
    fetchFolders,
    
    // User info
    userDepartments,
  };
}
