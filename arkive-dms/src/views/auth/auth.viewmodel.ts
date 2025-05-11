import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "./stores/auth.store";

export default function useAuth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login, logout } = useAuthStore();

  const clearAuthForm = () => {
    setEmail("");
    setPassword("");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || !password) {
      setLoading(false);
      setError("Please enter both email and password");
      return;
    }
    
    if (!emailRegex.test(email)) {
      setLoading(false);
      setError("Invalid email format");
      return;
    }

    try {
      const success = await login(email, password);
      
      if (success) {
        setError("");
        clearAuthForm();
        navigate("/dashboard");
      } else {
        setError("Invalid email or password");
      }
    } catch (err) {
      setError("Failed to login. Please try again.");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    loading,
    error,
    setError,
    handleLogin,
    handleLogout,
    clearAuthForm,
  };
}
