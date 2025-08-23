import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "../config/axios";
import { keepAliveService } from "../utils/keepAlive";

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
          // Reduce timeout to 3 seconds for faster perceived loading
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Timeout")), 3000)
          );

          const authPromise = axios.get("/api/auth/me");

          const response = await Promise.race([authPromise, timeoutPromise]);
          setUser(response.data);
        } catch (error) {
          console.error("Auth check failed:", error);
          // If timeout or server error, don't logout but continue with cached token
          if (error.message === "Timeout" || error.response?.status >= 500) {
            console.warn(
              "Auth check timed out or server error, continuing with cached token..."
            );
            // Create a minimal user object from token if we have one
            if (token) {
              try {
                const tokenPayload = JSON.parse(atob(token.split(".")[1]));
                setUser({
                  id: tokenPayload.userId,
                  email: tokenPayload.email || "user@example.com",
                  username: tokenPayload.username || "user",
                  _isFromCache: true,
                });
              } catch (parseError) {
                console.error("Token parse error:", parseError);
                logout();
              }
            }
          } else {
            // Only logout on actual auth errors (401, 403)
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

      // Start keep-alive service when user logs in
      keepAliveService.start();

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
      console.log("Attempting registration for:", username, email);
      const response = await axios.post("/api/auth/register", {
        username,
        email,
        password,
      });
      console.log("Registration response:", response.data);
      
      const { token: newToken, user: userData } = response.data;

      localStorage.setItem("token", newToken);
      setToken(newToken);
      setUser(userData);

      return { success: true };
    } catch (error) {
      console.error("Registration error:", error);
      console.error("Error response:", error.response);
      
      let errorMessage = "Registration failed";

      if (error.response?.status === 503) {
        errorMessage =
          "Database not connected. Please ensure MongoDB is running and try again.";
      } else if (error.response?.data?.error === "DATABASE_NOT_CONNECTED") {
        errorMessage =
          "Database connection required. Please start MongoDB service.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        // Handle validation errors
        errorMessage = error.response.data.errors.map(err => err.msg).join(", ");
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

    // Stop keep-alive service when user logs out
    keepAliveService.stop();
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
