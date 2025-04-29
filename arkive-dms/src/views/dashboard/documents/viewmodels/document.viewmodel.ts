import { useDisclosure } from "@chakra-ui/hooks";
import { useState, useEffect, useCallback } from "react";
import { useDocumentStore } from "../stores/document.store";
import { documents } from "../variables/docs.data";

export default function useDocument() {
  /**
   * Documents display, search, and filter
   */
  const { setDocumentsData, documentSearchKey, documentFilters } =
    useDocumentStore();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchDocuments = useCallback(async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulated delay

      let filteredDocs = documents;

      if (documentFilters.department) {
        filteredDocs = filteredDocs.filter(
          (doc) => doc.department === documentFilters.department
        );
      }

      if (documentSearchKey.trim()) {
        const lowerCaseSearchKey = documentSearchKey.toLowerCase();
        filteredDocs = filteredDocs.filter(
          (doc) =>
            doc.title.toLowerCase().includes(lowerCaseSearchKey) ||
            doc.owner.toLowerCase().includes(lowerCaseSearchKey)
        );
      }

      setDocumentsData(filteredDocs);
      setError(false);
    } catch (error) {
      console.error("Failed to fetch documents:", error);
      setError(true);
    } finally {
      setIsLoading(false);
    }
  }, [documentFilters, documentSearchKey, setDocumentsData]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments, setDocumentsData, documentSearchKey, documentFilters]);

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

    // Adding documents
    isOpenAddDocumentModal,
    onOpenAddDocumentModal,
    onCloseAddDocumentModal,
  };
}
