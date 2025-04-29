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

  const handleLogin = (e: React.FormEvent) => {
    setLoading(true);
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || !password) {
      setLoading(false);
      setError(
        "Invalid email address or password!\n\n" +
          "Creds for admin: adminuser@gmail.com: adminuser\n" +
          "Creds for user: useruser@gmail.com: useruser"
      );

      return;
    }
    if (!emailRegex.test(email)) {
      setLoading(false);
      setError("Invalid email format!");
      return;
    }
    if (login(email, password)) {
      setError("");
      setLoading(false);
      navigate("/dashboard");
    } else {
      setLoading(false);
      setError(
        "Invalid email address or password!\n\n" +
          "Creds for admin: adminuser@gmail.com: adminuser\n" +
          "Creds for user: useruser@gmail.com: useruser"
      );
    }
    clearAuthForm();
  };

  const handleLogout = () => {
    logout();
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
