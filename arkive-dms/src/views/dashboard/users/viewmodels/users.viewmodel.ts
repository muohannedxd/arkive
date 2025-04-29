import { SortingState } from "@tanstack/react-table";
import { useCallback, useEffect, useState } from "react";
import { useDisclosure } from "@chakra-ui/react";
import axiosClient from "lib/axios";
import { UserRowObj, UserObject } from "types/user";
import { useUserStore } from "../stores/users.store";

export default function useUsers() {
  /**
   * Users display and search and filter
   */
  const { usersData, pageIndex, countPerPage, setUsersData, setTotalUsers, userSearchKey, userFilters } =
    useUserStore();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axiosClient.get("./users", {
        params: {
          page: pageIndex + 1,
          per_page: countPerPage,
          search: userSearchKey,
          ...userFilters,
        },
      });
      
  
      const transformedData: UserRowObj[] = response.data.data.map((user: UserObject) => ({
        personal: [user.name, user.email, user.id],
        phone: user.phone,
        role: user.role,
        position: user.position,
        department: user.department,
        status: user.status,
        hire_date: user.hire_date,
      }));
  
      setTotalUsers(response.data.total);
      setUsersData(transformedData);
      setError(false);
      setTimeout(() => setIsLoading(false), 1000);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      setIsLoading(false);
      setError(true);
    }
  }, [pageIndex, countPerPage, userSearchKey, userFilters, setTotalUsers, setUsersData]);
  
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers, setUsersData, pageIndex, countPerPage, userSearchKey, userFilters]);

  const retryUsersFetch = () => {
    fetchUsers();
  };

  /**
   * Users select
   */
  const handleUserSelect = (id: number) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((userId) => userId !== id) : [...prev, id]
    );
  };

  const userIdsOnCurrentPage = usersData.map((user) => user.personal[2]); // IDs

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(userIdsOnCurrentPage);
    }
    setIsAllSelected(!isAllSelected);
  };

  /**
   * Users adding: add one user
   */
  const {
    isOpen: isOpenOneUserModal,
    onOpen: onOpenOneUserModal,
    onClose: onCloseOneUserModal,
  } = useDisclosure();

  /**
   * Users adding: add many users
   */
  const {
    isOpen: isOpenManyUserModal,
    onOpen: onOpenManyUserModal,
    onClose: onCloseManyUserModal,
  } = useDisclosure();

  /**
   * Request document
   */
  const [menuSelectedUserId, setMenumenuSelectedUserId] = useState<
    number | null
  >(null);

  const {
    isOpen: isOpenRequestDocumentModal,
    onOpen: onOpenRequestDocumentModal,
    onClose: onCloseRequestDocumentModal,
  } = useDisclosure();

  /**
   * Edit user info
   */
  const {
    isOpen: isOpenEditUserInfoModal,
    onOpen: onOpenEditUserInfoModal,
    onClose: onCloseEditUserInfoModal,
  } = useDisclosure();

  /**
   * Delete user
   */
  const {
    isOpen: isOpenDeleteUserModal,
    onOpen: onOpenDeleteUserModal,
    onClose: onCloseDeleteUserModal,
  } = useDisclosure();

  /**
   * Delete selected users
   */
  const {
    isOpen: isOpenDeleteSelectedUsersModal,
    onOpen: onOpenDeleteSelectedUsersModal,
    onClose: onCloseDeleteSelectedUsersModal,
  } = useDisclosure();

  return {
    // user display, search & filter
    sorting,
    setSorting,
    selectedUsers,
    isAllSelected,
    handleSelectAll,
    setSelectedUsers,
    handleUserSelect,
    isLoading,
    error,
    retryUsersFetch,
    // user adding
    isOpenOneUserModal,
    onOpenOneUserModal,
    onCloseOneUserModal,
    isOpenManyUserModal,
    onOpenManyUserModal,
    onCloseManyUserModal,
    // request document
    menuSelectedUserId,
    setMenumenuSelectedUserId,
    isOpenRequestDocumentModal,
    onOpenRequestDocumentModal,
    onCloseRequestDocumentModal,
    // edit user info
    isOpenEditUserInfoModal,
    onOpenEditUserInfoModal,
    onCloseEditUserInfoModal,
    // delete user
    isOpenDeleteUserModal,
    onOpenDeleteUserModal,
    onCloseDeleteUserModal,
    // delete selected users
    isOpenDeleteSelectedUsersModal,
    onOpenDeleteSelectedUsersModal,
    onCloseDeleteSelectedUsersModal,
  };
}
