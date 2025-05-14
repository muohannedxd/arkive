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
    userDepartments,
    selectedDepartment,
    setSelectedDepartment
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

  // Check if user has at least one department associated
  const canCreateFolder = userDepartments.length > 0;

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
              <div>
                <h4 className="text-2xl font-bold text-navy-700">Folders</h4>
                <div className="flex items-center text-sm text-gray-600 mt-1">
                  {canCreateFolder && (
                    <div className="flex flex-wrap items-center">
                      <span className="mr-1">Your Department:</span>
                      <span className="italic">
                        {userDepartments.join(", ")}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <Button
                onClick={onOpenCreateFolderModal}
                leftIcon={<TiFolderAdd />}
                variant={"brand"}
                className="bg-mainbrand text-base font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-800"
                isDisabled={!canCreateFolder}
                title={!canCreateFolder ? "You must be associated with a department to create folders" : ""}
              >
                Create a Folder
              </Button>
            </div>

            {/* Folders Grid */}
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
                  Error Loading Folders
                </p>
                <p className="text-gray-700">{foldersError}</p>
              </div>
            ) : foldersData.length === 0 ? (
              <div className="mt-4 flex min-h-[20vh] flex-col items-center justify-center space-y-3">
                <p className="text-xl font-semibold text-gray-700">
                  No Folders Yet
                </p>
                <p className="text-gray-600">
                  {canCreateFolder
                    ? "Click 'Create a Folder' to add your first folder."
                    : "You must be assigned to a department to create folders. Contact your administrator."
                  }
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5">
                {foldersData.map((folder) => (
                  <Folder
                    key={folder.id}
                    id={folder.id}
                    title={folder.title}
                    department={folder.department}
                    createdAt={folder.createdAt}
                    onNavigate={navigateToFolder}
                    onEdit={(id, title) => startEditFolder({
                      id,
                      title,
                      department: folder.department,
                      createdAt: folder.createdAt,
                      updatedAt: folder.updatedAt
                    })}
                    onDelete={confirmDeleteFolder}
                    formatDate={formatDate}
                  />
                ))}
              </div>
            )}

            {/* Documents without Folder Section */}
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
              <div className="mt-10 flex min-h-[40vh] flex-col items-center justify-center space-y-3">
                <p className="text-xl font-semibold text-red-600">
                  Error Loading Documents
                </p>
                <p className="text-gray-700">{documentsError}</p>
                <Button
                  onClick={retryDocumentsFetch}
                  variant={"brand"}
                  className="bg-mainbrand text-base font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-800"
                >
                  Retry
                </Button>
              </div>
            ) : (
              <>
                <div className="mb-5 mt-10 flex items-center justify-between">
                  <h4 className="text-2xl font-bold text-navy-700">Documents</h4>
                  <Button
                    onClick={onOpenAddDocumentModal}
                    leftIcon={<RiFileAddLine />}
                    variant={"brand"}
                    className="bg-mainbrand text-base font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-800"
                  >
                    Add Document
                  </Button>
                </div>

                {documentsData.length === 0 ? (
                  <div className="mt-4 flex min-h-[20vh] flex-col items-center justify-center space-y-3 bg-gray-50 rounded-lg py-10">
                    <p className="text-xl font-semibold text-gray-700">
                      No Documents Found
                    </p>
                    <p className="text-gray-600 text-center max-w-md">
                      {userDepartments.length > 0
                        ? `There are no documents in your departments yet. Click 'Add Document' to upload your first document.`
                        : "There are no documents to display. Contact your administrator if you need access to documents."
                      }
                    </p>
                    <Button
                      onClick={onOpenAddDocumentModal}
                      leftIcon={<RiFileAddLine />}
                      variant={"brand"}
                      className="bg-mainbrand text-base font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-800 mt-4"
                    >
                      Add Your First Document
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5">
                    {documentsData.map((doc) => (
                      <FileCard
                        key={doc.id}
                        id={doc.id}
                        title={doc.title}
                        owner={doc.owner}
                        document={doc.document}
                        department={doc.department}
                      />
                    ))}
                  </div>
                )}
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
        userDepartments={userDepartments}
        selectedDepartment={selectedDepartment}
        setSelectedDepartment={setSelectedDepartment}
      />

      <EditFolderModal
        isOpen={isOpenEditFolderModal}
        onClose={onCloseEditFolderModal}
        folderTitle={folderTitle}
        setFolderTitle={setFolderTitle}
        handleSubmit={handleSubmit}
        isLoading={foldersLoading}
        selectedDepartment={selectedDepartment}
        setSelectedDepartment={setSelectedDepartment}
        userDepartments={userDepartments} currentDepartment={""} />

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
