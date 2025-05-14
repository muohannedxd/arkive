import { UserObject } from "types/user";
import { create } from "zustand";
import axiosClient from "lib/axios";

interface AuthStore {
  user: UserObject | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateCurrentUser: (updatedUser: UserObject) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: JSON.parse(localStorage.getItem("user") || "null"),
  token: localStorage.getItem("token"),
  isLoading: false,
  
  login: async (email, password) => {
    try {
      set({ isLoading: true });
      
      const response = await axiosClient.post('/auth/login', { 
        email, 
        password 
      });
      
      // check if the response contains token and user
      if (response.data && response.data.token && response.data.user) {
        const { token, user } = response.data;
        
        // only update localStorage on successful login
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        
        set({ 
          user,
          token,
          isLoading: false 
        });
        
        return true;
      } else {
        set({ isLoading: false });
        return false;
      }
    } catch (error) {
      console.error("Login error:", error);
      set({ isLoading: false });
      return false;
    }
  },
  
  logout: async () => {
    try {
      await axiosClient.post('/auth/logout');
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      set({ user: null, token: null });
    }
  },

  // Update the current logged-in user in both the store and localStorage
  updateCurrentUser: (updatedUser) => {
    localStorage.setItem("user", JSON.stringify(updatedUser));
    set({ user: updatedUser });
  },
}));
