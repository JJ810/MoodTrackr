import { useState, useEffect, type ReactNode } from "react";
import { AuthContext } from "./auth-context";
import { authService } from "../lib/api/auth.service";
import type { User } from "../lib/api/types";
import { toast } from "sonner";

// Using User type from API types

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("authToken");
      if (token) {
        setLoading(true);
        try {
          await fetchUserInfo();
        } catch (error) {
          console.error("Authentication error:", error);
          localStorage.removeItem("authToken");
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const userData = await authService.getCurrentUser();

      if (userData) {
        setUser(userData);
        setError(null);
      } else {
        console.error("No user data received from getCurrentUser");
        setUser(null);
        setError("Failed to fetch user information");
        localStorage.removeItem("authToken");
      }
    } catch (err) {
      console.error("Error fetching user information:", err);
      setUser(null);
      setError("Failed to fetch user information");
      localStorage.removeItem("authToken");
      throw err;
    }
  };

  const login = async (googleToken: string) => {
    setLoading(true);
    try {
      // Add detailed logging to track the API response
      const authResponse = await authService.googleLogin(googleToken);

      console.log("Login successful, auth response:", {
        hasToken: !!authResponse.token,
        tokenLength: authResponse.token?.length,
        hasUser: !!authResponse.user,
        user: authResponse.user
          ? {
              id: authResponse.user.id,
              email: authResponse.user.email,
              name: authResponse.user.name,
              picture: authResponse.user.picture,
            }
          : null,
      });

      setUser(authResponse.user);
      setError(null);
      toast.success("Successfully logged in");
    } catch (err) {
      console.error("Login error:", err);
      setError("Login failed");
      toast.error("Login failed. Please try again.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    toast.success("Successfully logged out");
  };

  const isAuthenticated =
    !!user || (!!localStorage.getItem("authToken") && !error);

  const value = {
    user,
    loading,
    error,
    isAuthenticated,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
