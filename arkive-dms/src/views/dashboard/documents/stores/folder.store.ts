import { create } from "zustand";
import { FolderObject } from "types/document";

interface FolderStore {
  /**
   * Folders data and current folder
   */
  foldersData: FolderObject[];
  setFoldersData: (data: FolderObject[]) => void;
  currentFolderId: number | null;
  setCurrentFolderId: (id: number | null) => void;
  
  /**
   * Loading and error states
   */
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
}

export const useFolderStore = create<FolderStore>((set) => ({
  /**
   * Folders data and current folder
   */
  foldersData: [],
  setFoldersData: (data) => set({ foldersData: data }),
  currentFolderId: null,
  setCurrentFolderId: (id) => set({ currentFolderId: id }),
  
  /**
   * Loading and error states
   */
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
  error: null,
  setError: (error) => set({ error: error }),
}));