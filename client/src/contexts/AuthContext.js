import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "../config/axios";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("token"));

  // Set axios default auth header
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [token]);

  // Check for existing user on mount with timeout for faster perceived loading
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          // Set a reasonable timeout to avoid long loading times
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout')), 5000)
          );
          
          const authPromise = axios.get("/api/auth/me");
          
          const response = await Promise.race([authPromise, timeoutPromise]);
          setUser(response.data);
        } catch (error) {
          console.error("Auth check failed:", error);
          // If timeout or error, clear auth but don't block the UI
          if (error.message === 'Timeout' || error.response?.status >= 500) {
            console.warn('Auth check timed out or server error, continuing...');
          } else {
            logout();
          }
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await axios.post("/api/auth/login", { email, password });
      const { token: newToken, user: userData } = response.data;

      localStorage.setItem("token", newToken);
      setToken(newToken);
      setUser(userData);

      return { success: true };
    } catch (error) {
      let errorMessage = "Login failed";

      if (error.response?.status === 503) {
        errorMessage =
          "Database not connected. Please ensure MongoDB is running and try again.";
      } else if (error.response?.data?.error === "DATABASE_NOT_CONNECTED") {
        errorMessage =
          "Database connection required. Please start MongoDB service.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      return {
        success: false,
        error: errorMessage,
        isDBError:
          error.response?.status === 503 ||
          error.response?.data?.error === "DATABASE_NOT_CONNECTED",
      };
    }
  };

  const register = async (username, email, password) => {
    try {
      const response = await axios.post("/api/auth/register", {
        username,
        email,
        password,
      });
      const { token: newToken, user: userData } = response.data;

      localStorage.setItem("token", newToken);
      setToken(newToken);
      setUser(userData);

      return { success: true };
    } catch (error) {
      let errorMessage = "Registration failed";

      if (error.response?.status === 503) {
        errorMessage =
          "Database not connected. Please ensure MongoDB is running and try again.";
      } else if (error.response?.data?.error === "DATABASE_NOT_CONNECTED") {
        errorMessage =
          "Database connection required. Please start MongoDB service.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      return {
        success: false,
        error: errorMessage,
        isDBError:
          error.response?.status === 503 ||
          error.response?.data?.error === "DATABASE_NOT_CONNECTED",
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common["Authorization"];
  };

  const updateUser = (userData) => {
    setUser(userData);
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    updateUser,
    loading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
