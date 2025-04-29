import Folder from "./components/folder";
import FileCard from "./components/fileCard";
import { Button, Spinner } from "@chakra-ui/react";
import { TiFolderAdd } from "react-icons/ti";
import { RiFileAddLine } from "react-icons/ri";
import CreateFolderModal from "./components/CreateFolderModal";
import AddDocumentModal from "./components/AddDocumentModal";
import useFolders from "./viewmodels/folders.viewmodel";
import useDocument from "./viewmodels/document.viewmodel";
import { useDocumentStore } from "./stores/document.store";

export default function Documents() {
  const {
    isOpenCreateFolderModal,
    onOpenCreateFolderModal,
    onCloseCreateFolderModal,
  } = useFolders();

  const {
    isLoading,
    error,
    retryDocumentsFetch,
    isOpenAddDocumentModal,
    onOpenAddDocumentModal,
    onCloseAddDocumentModal,
  } = useDocument();

  const { documentsData } =
    useDocumentStore();

  return (
    <div className="mb-6 mt-3 h-full">
      <div className="h-fit">
        {/* Folders */}
        <div className="mb-5 mt-5 flex items-center justify-between">
          <h4 className="text-2xl font-bold text-navy-700 ">Folders</h4>
          <Button
            onClick={onOpenCreateFolderModal}
            leftIcon={<TiFolderAdd />}
            variant={"brand"}
            className="bg-mainbrand text-base font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-800"
          >
            Create a Folder
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5">
          <Folder
            title="title of this filder that is tooo long for this to handle"
            owner="owner of folder, name too long to handle"
          />
          <Folder title="title of this folder" owner="owner of folder" />
          <Folder title="title of this folder" owner="owner of folder" />
          <Folder title="title of this folder" owner="owner of folder" />
          <Folder title="title of this folder" owner="owner of folder" />
          <Folder title="title of this folder" owner="owner of folder" />
          <Folder title="title of this folder" owner="owner of folder" />
          <Folder title="title of this folder" owner="owner of folder" />
          <Folder title="title of this folder" owner="owner of folder" />
          <Folder title="title of this folder" owner="owner of folder" />
          <Folder title="title of this folder" owner="owner of folder" />
        </div>

        {isLoading ? (
          <div className="mt-10 flex min-h-[40vh] items-center justify-center">
            <Spinner
              size="xl"
              color="brand"
              className="text-mainbrand"
              borderWidth={"4px"}
            />
          </div>
        ) : error ? (
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
              <h4 className="text-2xl font-bold text-navy-700 ">Files</h4>
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
      </div>

      {/* Modals */}
      <CreateFolderModal
        isOpen={isOpenCreateFolderModal}
        onClose={onCloseCreateFolderModal}
      />
      <AddDocumentModal
        isOpen={isOpenAddDocumentModal}
        onClose={onCloseAddDocumentModal}
      />
    </div>
  );
}
