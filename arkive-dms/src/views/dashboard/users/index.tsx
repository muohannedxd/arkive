import { ReactNode } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import Checkbox from "components/checkbox";
import Card from "components/card";
import { Avatar, Button, IconButton, Spinner } from "@chakra-ui/react";
import { Menu, MenuButton, MenuList, MenuItem } from "@chakra-ui/react";
import { MdAdd, MdArrowDropDown, MdOutlineReport } from "react-icons/md";
import { Badge } from "@chakra-ui/react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { RiDeleteBin2Line } from "react-icons/ri";
import { FiEdit3, FiFile } from "react-icons/fi";
import PaginationTable from "./components/PaginationTable";
import { FaArrowDown, FaArrowUp } from "react-icons/fa";
import useUsers from "./viewmodels/users.viewmodel";
import useDepartments from "./viewmodels/departments.viewmodel";
import AddOneUserModal from "./components/AddOneUserModal";
import AddManyUserModal from "./components/AddManyUsersModal";
import RequestDocumentModal from "./components/RequestDocumentModal";
import EditUserInfoModal from "./components/EditUserInfoModal";
import DeleteUserModal from "./components/DeleteUserModal";
import DepartmentsModal from "./components/DepartmentsModal";
import { UserRowObj } from "types/user";
import { useUserStore } from "./stores/users.store";
import DeleteSelectedUsersModal from "./components/DeleteSelectedUsersModal";

export default function Users() {
  const {
    sorting,
    setSorting,
    selectedUsers,
    isAllSelected,
    handleSelectAll,
    handleUserSelect,
    isLoading,
    error,
    retryUsersFetch,
    // add users modals
    isOpenOneUserModal,
    onOpenOneUserModal,
    onCloseOneUserModal,
    isOpenManyUserModal,
    onOpenManyUserModal,
    onCloseManyUserModal,
    // user menu modals
    menuSelectedUserId,
    setMenumenuSelectedUserId,
    isOpenRequestDocumentModal,
    onOpenRequestDocumentModal,
    onCloseRequestDocumentModal,
    isOpenEditUserInfoModal,
    onOpenEditUserInfoModal,
    onCloseEditUserInfoModal,
    isOpenDeleteUserModal,
    onOpenDeleteUserModal,
    onCloseDeleteUserModal,
    // delete selected users
    isOpenDeleteSelectedUsersModal,
    onOpenDeleteSelectedUsersModal,
    onCloseDeleteSelectedUsersModal,
  } = useUsers();

  // Add departments modal controls
  const { 
    isOpenDepartmentsModal, 
    onOpenDepartmentsModal, 
    onCloseDepartmentsModal 
  } = useDepartments();

  const columns = [
    columnHelper.accessor("personal", {
      id: "personal",
      header: () => (
        <p className="text-sm font-bold text-gray-600">PERSONAL INFORMATION</p>
      ),
      cell: (info: any) => {
        const userId = info.getValue()[2];
        return (
          <div className="flex items-center gap-4 md:gap-6">
            <Checkbox
              defaultChecked={selectedUsers.includes(userId)}
              onChange={() => handleUserSelect(userId)}
              colorScheme="brandScheme"
              me="12px"
            />
            <Avatar
              size={window.innerWidth < 768 ? "sm" : "md"}
              name={info.getValue()[0]}
              src={info.getValue()[0]}
            />

            <div className="flex flex-col">
              <p className="text-sm font-semibold text-navy-700 md:text-base">
                {info.getValue()[0]}
              </p>
              <p className="text-sm text-gray-700 md:text-base">
                {info.getValue()[1]}
              </p>
            </div>
          </div>
        );
      },
    }),
    columnHelper.accessor("phone", {
      id: "phone",
      header: () => (
        <p className="text-sm font-bold text-gray-600 ">PHONE NUMBER</p>
      ),
      cell: (info: { getValue: () => ReactNode }) => (
        <p className="text-sm font-semibold text-navy-700 md:text-base">
          {info.getValue()}
        </p>
      ),
    }),
    columnHelper.accessor("role", {
      id: "role",
      header: () => <p className="text-sm font-bold text-gray-600 ">ROLE</p>,
      cell: (info: { getValue: () => string }) => (
        <div className="flex flex-wrap gap-2">
          <Badge
            colorScheme={
              info.getValue().toString().toLowerCase() === "admin"
                ? "purple"
                : info.getValue().toLowerCase() === "user"
                  ? "teal"
                  : ""
            }
          >
            <p className="text-sm md:text-base">{info.getValue()}</p>
          </Badge>
        </div>
      ),
    }),
    columnHelper.accessor("position", {
      id: "position",
      header: () => (
        <p className="text-sm font-bold text-gray-600 ">POSITION</p>
      ),
      cell: (info: { getValue: () => ReactNode }) => (
        <p className="text-sm font-semibold text-navy-700 md:text-base ">
          {info.getValue()}
        </p>
      ),
    }),
    columnHelper.accessor("departments", {
      id: "departments",
      header: () => (
        <p className="text-sm font-bold text-gray-600 ">DEPARTMENTS</p>
      ),
      cell: (info: { getValue: () => Array<{id: number, name: string}> }) => {
        const departments = info.getValue() || [];
        return (
          <div className="flex flex-wrap gap-1">
            {departments.length > 0 ? (
              departments.map((dept, index) => (
                <Badge 
                  key={dept.id} 
                  colorScheme="blue" 
                  className="mr-1 mb-1"
                >
                  {dept.name}
                </Badge>
              ))
            ) : (
              <p className="text-sm font-semibold text-gray-500">None</p>
            )}
          </div>
        );
      },
    }),
    columnHelper.accessor("status", {
      id: "progress",
      header: () => <p className="text-sm font-bold text-gray-600 ">STATUS</p>,
      cell: (info: { getValue: () => ReactNode }) => (
        <p className="text-sm font-bold text-navy-700 ">
          <Badge
            colorScheme={
              info.getValue().toString().toLowerCase() === "active"
                ? "green"
                : info.getValue().toString().toLowerCase() === "inactive"
                  ? "red"
                  : "orange"
            }
          >
            <p className="text-sm md:text-base"> {info.getValue()} </p>
          </Badge>
        </p>
      ),
    }),
    columnHelper.accessor("hire_date", {
      id: "hire_date",
      header: () => (
        <p className="text-sm font-bold text-gray-600 ">HIRE DATE</p>
      ),
      cell: (info: { getValue: () => ReactNode }) => (
        <p className="text-sm font-semibold text-navy-700 md:text-base ">
          {info.getValue()}
        </p>
      ),
    }),
    // Adding the last column for the menu
    columnHelper.display({
      id: "menu",
      header: () => <></>, // No header for the last column
      cell: (info) => {
        const userId = info.row.original.personal[2];
        return (
          <Menu>
            <MenuButton
              as={IconButton}
              aria-label="Options"
              icon={<BsThreeDotsVertical />}
              variant="outline"
            />
            <MenuList>
              <MenuItem
                onClick={() => {
                  setMenumenuSelectedUserId(userId);
                  onOpenRequestDocumentModal();
                }}
                icon={<MdOutlineReport />}
              >
                Request Document
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setMenumenuSelectedUserId(userId);
                  onOpenEditUserInfoModal();
                }}
                icon={<FiEdit3 />}
              >
                Edit Information
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setMenumenuSelectedUserId(userId);
                  onOpenDeleteUserModal();
                }}
                color="red.600"
                icon={<RiDeleteBin2Line />}
              >
                Delete User
              </MenuItem>
            </MenuList>
          </Menu>
        );
      },
    }),
  ];

  const { usersData, totalUsers } = useUserStore();

  const table = useReactTable({
    data: usersData,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    debugTable: true,
  });

  return (
    <Card extra={`mt-3 mb-6 w-full sm:overflow-auto px-6`}>
      {isLoading ? (
        <div className="flex min-h-[80vh] items-center justify-center">
          <Spinner
            size="xl"
            color="brand"
            className="text-mainbrand"
            borderWidth={"4px"}
          />
        </div>
      ) : error ? (
        <div className="flex min-h-[80vh] flex-col items-center justify-center space-y-4">
          <p className="text-3xl font-semibold text-red-600 md:text-4xl">
            Error Loading Users...
          </p>
          <p className="text-gray-700">
            Something went wrong while fetching the user data.
          </p>
          <Button
            variant={"solid"}
            colorScheme={"red"}
            onClick={retryUsersFetch}
            className="rounded-md bg-red-600 px-6 py-2 text-white shadow-md transition duration-200 hover:bg-red-500"
          >
            Retry
          </Button>
        </div>
      ) : (
        <>
          <header className="relative mb-2 flex flex-col items-center justify-between gap-2 pt-4 sm:mb-0 sm:flex-row sm:gap-0">
            <div className="text-xl font-bold text-navy-700">
              Total Number of Users: {totalUsers}
            </div>
            <div className="flex justify-center items-center gap-3">
              <Button
                onClick={onOpenDepartmentsModal}
                leftIcon={<MdAdd />}
                variant={"brand"}
                className="bg-mainbrand text-base font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-800"
              >
                Add a Department
              </Button>
              <Menu>
                <MenuButton className="rounded-md bg-mainbrand py-2 pl-3 pr-4 text-base font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-800">
                  <button className="linear flex items-center gap-2">
                    <MdArrowDropDown />
                    <p>Add Users</p>
                  </button>
                </MenuButton>
                <MenuList>
                  <MenuItem onClick={onOpenOneUserModal} icon={<MdAdd />}>
                    Add one user
                  </MenuItem>
                  <MenuItem onClick={onOpenManyUserModal} icon={<FiFile />}>
                    Load users from a file
                  </MenuItem>
                </MenuList>
              </Menu>
            </div>
          </header>

          {/* Modals */}
          <AddOneUserModal
            isOpen={isOpenOneUserModal}
            onClose={onCloseOneUserModal}
          />
          <AddManyUserModal
            isOpen={isOpenManyUserModal}
            onClose={onCloseManyUserModal}
          />
          <RequestDocumentModal
            isOpen={isOpenRequestDocumentModal}
            onClose={onCloseRequestDocumentModal}
            userId={menuSelectedUserId}
          />
          <EditUserInfoModal
            isOpen={isOpenEditUserInfoModal}
            onClose={onCloseEditUserInfoModal}
            userId={menuSelectedUserId}
          />
          <DeleteUserModal
            isOpen={isOpenDeleteUserModal}
            onClose={onCloseDeleteUserModal}
            userId={menuSelectedUserId}
          />
          <DeleteSelectedUsersModal
            isOpen={isOpenDeleteSelectedUsersModal}
            onClose={onCloseDeleteSelectedUsersModal}
            selectedUsers={selectedUsers}
          />
          <DepartmentsModal
            isOpen={isOpenDepartmentsModal}
            onClose={onCloseDepartmentsModal}
          />

          <div className="mt-2 flex items-center gap-2">
            <Checkbox
              defaltChecked={isAllSelected}
              onChange={handleSelectAll}
              colorScheme="brandScheme"
              me="12px"
            />
            <p>Select All</p>
            {selectedUsers.length > 0 && (
              <div
                className="fixed bottom-4 left-1/2 z-50 flex w-[90%] -translate-x-1/2 transform items-center justify-between gap-4 rounded-lg border border-gray-300 bg-brand-50 
              px-6 py-3 shadow-lg sm:w-[80%] md:w-[60%]"
              >
                <p className="text-lg font-medium">
                  Selected Users: {selectedUsers.length}
                </p>
                <Button
                  onClick={onOpenDeleteSelectedUsersModal}
                  colorScheme="red"
                  size="md"
                >
                  <RiDeleteBin2Line />
                </Button>
              </div>
            )}
          </div>

          <div className="w-full overflow-x-auto">
            <div className="">
              <table className="min-w-full">
                <thead>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id} className="border-gray-400">
                      {headerGroup.headers.map((header) => {
                        const isSorted = header.column.getIsSorted();
                        return (
                          <th
                            key={header.id}
                            colSpan={header.colSpan}
                            onClick={header.column.getToggleSortingHandler()}
                            className="cursor-pointer border-b-[1px] border-gray-200 pb-2 pr-4 pt-4 text-start"
                          >
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                              {isSorted === "asc" && <FaArrowDown />}
                              {isSorted === "desc" && <FaArrowUp />}
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  ))}
                </thead>

                <tbody>
                  {table.getRowModel().rows.map((row) => (
                    <tr key={row.id}>
                      {row.getVisibleCells().map((cell, index) => {
                        const isLastCell =
                          index === row.getVisibleCells().length - 1;
                        return (
                          <td
                            key={cell.id}
                            className={`min-w-[150px] py-3 pr-4 ${isLastCell ? "text-right" : ""
                              }`}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <PaginationTable pageSizeOptions={[10, 25, 50]} />
        </>
      )}
    </Card>
  );
}

const columnHelper = createColumnHelper<UserRowObj>();
