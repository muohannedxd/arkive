import { useDisclosure } from "@chakra-ui/hooks";
import { useState } from "react";

export default function useFolders() {
  const [folderTitle, setFolderTitle] = useState("");
  const [folderDescription, setFolderDescription] = useState("");

  const clearCreateFolderForm = () => {
    setFolderTitle("");
    setFolderDescription("");
  };
  /**
   * Submission
   */
  const handleSubmit = () => {
    console.log(folderTitle, folderDescription);
    clearCreateFolderForm();
  };

  /**
   * modals
   */
  const {
    isOpen: isOpenCreateFolderModal,
    onOpen: onOpenCreateFolderModal,
    onClose: onCloseCreateFolderModal,
  } = useDisclosure();

  return {
    folderTitle,
    setFolderTitle,
    folderDescription,
    setFolderDescription,
    clearCreateFolderForm,
    handleSubmit,
    isOpenCreateFolderModal,
    onOpenCreateFolderModal,
    onCloseCreateFolderModal,
  };
}
