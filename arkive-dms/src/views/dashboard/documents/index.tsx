import Folder from "./components/folder";
import FileCard from "./components/fileCard";
import { Button, Spinner } from "@chakra-ui/react";
import { TiFolderAdd } from "react-icons/ti";
import { RiFileAddLine } from "react-icons/ri";
import CreateFolderModal from "./components/CreateFolderModal";
import EditFolderModal from "./components/EditFolderModal";
import DeleteFolderModal from "./components/DeleteFolderModal";
import AddDocumentModal from "./components/AddDocumentModal";
import FolderContent from "./components/FolderContent";
import useFolders from "./viewmodels/folders.viewmodel";
import useDocument from "./viewmodels/document.viewmodel";
import { useDocumentStore } from "./stores/document.store";

export default function Documents() {
  // Folder hooks
  const {
    foldersData,
    isLoading: foldersLoading,
    error: foldersError,
    formatDate,
    folderTitle,
    setFolderTitle,
    handleSubmit,
    navigateToFolder,
    navigateBack,
    currentFolderId,
    startEditFolder,
    confirmDeleteFolder,
    isOpenCreateFolderModal,
    onOpenCreateFolderModal,
    onCloseCreateFolderModal,
    isOpenEditFolderModal,
    onCloseEditFolderModal,
    isOpenDeleteFolderModal,
    onCloseDeleteFolderModal,
    handleConfirmDelete,
  } = useFolders();

  // Document hooks
  const {
    isLoading: documentsLoading,
    error: documentsError,
    retryDocumentsFetch,
    isOpenAddDocumentModal,
    onOpenAddDocumentModal,
    onCloseAddDocumentModal,
  } = useDocument();

  const { documentsData } = useDocumentStore();

  // Get current folder details
  const currentFolder = foldersData.find(folder => folder.id === currentFolderId);

  return (
    <div className="mb-6 mt-3 h-full">
      <div className="h-fit">
        {/* Show folder contents if a folder is selected, otherwise show folders and documents */}
        {currentFolderId ? (
          <FolderContent 
            folderId={currentFolderId} 
            folderTitle={currentFolder?.title} 
            onBack={navigateBack}
          />
        ) : (
          <>
            {/* Folders */}
            <div className="mb-5 mt-5 flex items-center justify-between">
              <h4 className="text-2xl font-bold text-navy-700">Folders</h4>
              <Button
                onClick={onOpenCreateFolderModal}
                leftIcon={<TiFolderAdd />}
                variant={"brand"}
                className="bg-mainbrand text-base font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-800"
              >
                Create a Folder
              </Button>
            </div>

            {foldersLoading ? (
              <div className="mt-4 flex min-h-[20vh] items-center justify-center">
                <Spinner
                  size="lg"
                  color="brand"
                  className="text-mainbrand"
                  borderWidth={"4px"}
                />
              </div>
            ) : foldersError ? (
              <div className="mt-4 flex min-h-[20vh] flex-col items-center justify-center space-y-3">
                <p className="text-xl font-semibold text-red-600">
                  Error Loading Folders {foldersError}
                </p>
                <p className="text-gray-700">
                  {foldersError}
                </p>
              </div>
            ) : foldersData.length === 0 ? (
              <div className="mt-4 flex min-h-[20vh] flex-col items-center justify-center space-y-3">
                <p className="text-xl font-semibold text-gray-700">
                  No Folders Yet
                </p>
                <p className="text-gray-600">
                  Click 'Create a Folder' to add your first folder.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5">
                {foldersData.map((folder) => (
                  <Folder
                    key={folder.id}
                    id={folder.id}
                    title={folder.title}
                    createdAt={folder.createdAt}
                    onNavigate={navigateToFolder}
                    onEdit={(id, title) => startEditFolder({ id, title, createdAt: folder.createdAt, updatedAt: folder.updatedAt })}
                    onDelete={confirmDeleteFolder}
                    formatDate={formatDate}
                  />
                ))}
              </div>
            )}

            {/* Documents Section */}
            {documentsLoading ? (
              <div className="mt-10 flex min-h-[40vh] items-center justify-center">
                <Spinner
                  size="xl"
                  color="brand"
                  className="text-mainbrand"
                  borderWidth={"4px"}
                />
              </div>
            ) : documentsError ? (
              <div className="mt-10 flex min-h-[40vh] flex-col items-center justify-center space-y-4">
                <p className="text-3xl font-semibold text-red-600 md:text-4xl">
                  Error Loading Documents...
                </p>
                <p className="text-gray-700">
                  Something went wrong while fetching the documents data.
                </p>
                <Button
                  variant={"solid"}
                  colorScheme={"red"}
                  onClick={retryDocumentsFetch}
                  className="rounded-md bg-red-600 px-6 py-2 text-white shadow-md transition duration-200 hover:bg-red-500"
                >
                  Retry
                </Button>
              </div>
            ) : documentsData.length === 0 ? (
              <div className="mt-10 flex min-h-[40vh] flex-col items-center justify-center space-y-4">
                <p className="text-3xl font-semibold md:text-4xl">
                  No Documents To Show...
                </p>
                <p className="text-gray-700">
                  There are no documents loaded yet, try adding new ones.
                </p>
              </div>
            ) : (
              <>
                <div className="mb-5 mt-10 flex items-center justify-between">
                  <h4 className="text-2xl font-bold text-navy-700">Files</h4>
                  <Button
                    onClick={onOpenAddDocumentModal}
                    leftIcon={<RiFileAddLine />}
                    variant={"brand"}
                    className="bg-mainbrand text-base font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-800"
                  >
                    Add a Document
                  </Button>
                </div>

                {/* Documents */}
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5">
                  {documentsData.map((doc) => (
                    <FileCard
                      key={doc.id}
                      title={doc.title}
                      owner={doc.owner}
                      document={doc.document}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <CreateFolderModal
        isOpen={isOpenCreateFolderModal}
        onClose={onCloseCreateFolderModal}
        folderTitle={folderTitle}
        setFolderTitle={setFolderTitle}
        handleSubmit={handleSubmit}
        isLoading={foldersLoading}
      />
      
      <EditFolderModal
        isOpen={isOpenEditFolderModal}
        onClose={onCloseEditFolderModal}
        folderTitle={folderTitle}
        setFolderTitle={setFolderTitle}
        handleSubmit={handleSubmit}
        isLoading={foldersLoading}
      />
      
      <DeleteFolderModal
        isOpen={isOpenDeleteFolderModal}
        onClose={onCloseDeleteFolderModal}
        onConfirm={handleConfirmDelete}
        isLoading={foldersLoading}
      />
      
      <AddDocumentModal
        isOpen={isOpenAddDocumentModal}
        onClose={onCloseAddDocumentModal}
      />
    </div>
  );
}
