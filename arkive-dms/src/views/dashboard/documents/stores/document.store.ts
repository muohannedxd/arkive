import { DocumentObject } from "types/document";
import { create } from "zustand";

interface DocumentStore {
  /**
   * Document search and filter
   */
  documentsData: DocumentObject[];
  setDocumentsData: (data: DocumentObject[]) => void;
  documentSearchKey: string;
  setDocumentSearchKey: (key: string) => void;
  documentFilters: { department?: string };
  setDocumentFilters: (filters: Partial<DocumentStore["documentFilters"]>) => void;
}

export const useDocumentStore = create<DocumentStore>((set) => ({
  /**
   * Document search and filter
   */
  documentsData: [],
  setDocumentsData: (data) => set({ documentsData: data }),
  documentSearchKey: "",
  setDocumentSearchKey: (key) => set({ documentSearchKey: key }),
  documentFilters: {},
  setDocumentFilters: (filters) => set({ documentFilters: filters }),
}));
