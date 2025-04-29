import { UserObject } from "types/user";
import { create } from "zustand";

// Hardcoded users (no registration)
const USERS: UserObject[] = [
  {
    id: 1,
    name: "Admin User",
    email: "adminuser@gmail.com",
    password: "adminuser",
    role: "admin",
    position: "Engineer",
    department: "IT",
    phone: "+1-234-567-8901",
    status: "active",
    hire_date: new Date("2022-01-01"),
  },
  {
    id: 2,
    name: "User User",
    email: "useruser@gmail.com",
    password: "useruser",
    role: "user",
    position: "Manager",
    department: "Marketing",
    phone: "+1-987-654-3210",
    status: "inactive",
    hire_date: new Date("2022-01-01"),
  },
];

interface AuthStore {
  user: UserObject | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: JSON.parse(localStorage.getItem("user") || "null"),
  login: (email, password) => {
    const foundUser = USERS.find(
      (user) => user.email === email && user.password === password
    );

    if (foundUser) {
      localStorage.setItem("user", JSON.stringify(foundUser));
      set({ user: foundUser });
      return true;
    }
    return false;
  },
  logout: () => {
    localStorage.removeItem("user");
    set({ user: null });
  },
}));
