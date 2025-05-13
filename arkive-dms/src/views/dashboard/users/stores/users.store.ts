import { UserObject, DocumentRequestObject, UserRowObj } from "types/user";
import { create } from "zustand";

interface UserStore {
  // user search and filter
  usersData: UserRowObj[];
  setUsersData: (data: UserRowObj[]) => void;
  pageIndex: number;
  setPageIndex: (page: number) => void;
  countPerPage: number;
  setCountPerPage: (count: number) => void;
  totalUsers: number;
  setTotalUsers: (count: number) => void;
  userSearchKey: string;
  setUserSearchKey: (key: string) => void;
  userFilters: { role?: string; status?: string; department?: string };
  setUserFilters: (filters: Partial<UserStore["userFilters"]>) => void;
  // add one user
  oneUserForm: UserObject;
  clearOneUserForm: () => void;
  setOneUserForm: (field: keyof UserObject, value: any) => void;
  // request document from user
  docRequestForm: DocumentRequestObject;
  clearDocRequestForm: () => void;
  setDocRequestForm: (field: keyof DocumentRequestObject, value: any) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  /**
   * User search and filter
   */
  usersData: [],
  setUsersData: (data) => set({ usersData: data }),
  pageIndex: 0,
  setPageIndex: (page) => set({ pageIndex: page }),
  countPerPage: 10,
  setCountPerPage: (count) => set({ countPerPage: count }),
  totalUsers: 0,
  setTotalUsers: (count) => set({ totalUsers: count }),
  userSearchKey: "",
  setUserSearchKey: (key) => set({ userSearchKey: key }),
  userFilters: {},
  setUserFilters: (filters) => set({ userFilters: filters }),

  /**
   * Add one user
   */
  oneUserForm: {
    id: 0,
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "User",
    departments: [], // Changed from department to departments array
    position: "",
    status: "Active",
    hire_date: new Date(),
  },
  clearOneUserForm: () =>
    set({
      oneUserForm: {
        id: 0,
        name: "",
        email: "",
        phone: "",
        password: "",
        role: "User",
        departments: [], // Changed from department to departments array
        position: "",
        status: "Active",
        hire_date: new Date(),
      },
    }),
  setOneUserForm: (field, value) =>
    set((state) => ({
      oneUserForm: { ...state.oneUserForm, [field]: value },
    })),

  /**
   * Request document from user
   */
  docRequestForm: {
    userid: "",
    title: "",
    description: "",
  },
  clearDocRequestForm: () =>
    set({
      docRequestForm: {
        userid: "",
        title: "",
        description: "",
      },
    }),
  setDocRequestForm: (field, value) =>
    set((state) => ({
      docRequestForm: { ...state.docRequestForm, [field]: value },
    })),
}));
