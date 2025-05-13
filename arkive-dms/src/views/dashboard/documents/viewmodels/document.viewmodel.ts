import { useDisclosure } from "@chakra-ui/hooks";
import { useState, useEffect, useCallback } from "react";
import { useDocumentStore } from "../stores/document.store";
import axiosClient from "lib/axios";
import { useToast } from "@chakra-ui/react";
import { useAuthStore } from "views/auth/stores/auth.store";

export default function useDocument() {
  /**
   * Documents display, search, and filter
   */
  const { setDocumentsData, documentSearchKey, documentFilters } =
    useDocumentStore();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Toast for notifications
  const toast = useToast();
  
  // Get user information from auth store to determine department
  const { user } = useAuthStore();
  // Get the primary department name (first one) or an empty string if no departments
  const userDepartment = user?.departments && user.departments.length > 0 
    ? user.departments[0].name 
    : "";

  const fetchDocuments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get user departments
      const userDepartments = user?.departments?.map(dept => dept.name) || [];
      
      if (userDepartments.length === 0) {
        // If user has no departments, set empty documents and return
        setDocumentsData([]);
        return;
      }
      
      console.log("User departments:", userDepartments);
      
      // Use the filter endpoint to get documents without folders
      const response = await axiosClient.post('/documents/filter', {
        departments: userDepartments,
        noFolderId: true
      });
      
      console.log("Documents response:", response.data);
      
      let documentsData = response.data?.data || [];

      // Apply additional filters from UI
      if (documentFilters.department) {
        documentsData = documentsData.filter(
          (doc: any) => doc.department === documentFilters.department
        );
      }

      // Apply search filter
      if (documentSearchKey.trim()) {
        const lowerCaseSearchKey = documentSearchKey.toLowerCase();
        documentsData = documentsData.filter(
          (doc: any) =>
            doc.title.toLowerCase().includes(lowerCaseSearchKey) ||
            doc.ownerName?.toLowerCase().includes(lowerCaseSearchKey)
        );
      }

      // Transform API response to match DocumentObject structure
      const formattedDocuments = documentsData.map((doc: any) => ({
        id: doc.id,
        title: doc.title,
        owner: doc.ownerName || "Unknown",
        department: doc.department,
        document: doc.url,
        folder_id: doc.folderId
      }));

      setDocumentsData(formattedDocuments);
    } catch (err: any) {
      console.error("Failed to fetch documents:", err);
      setError(err.response?.data?.message || "Failed to fetch documents");
      toast({
        title: "Error fetching documents",
        description: err.response?.data?.message || "Failed to fetch documents",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, [documentFilters, documentSearchKey, setDocumentsData, toast, user?.departments]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const retryDocumentsFetch = () => {
    fetchDocuments();
  };

  // Document addition modal controls
  const {
    isOpen: isOpenAddDocumentModal,
    onOpen: onOpenAddDocumentModal,
    onClose: onCloseAddDocumentModal,
  } = useDisclosure();

  return {
    // Document fetching, search, and filter
    isLoading,
    error,
    retryDocumentsFetch,
    fetchDocuments,
    userDepartment,

    // Adding documents
    isOpenAddDocumentModal,
    onOpenAddDocumentModal,
    onCloseAddDocumentModal,
  };
}
