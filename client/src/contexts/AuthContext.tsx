import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { authAPI } from "../lib/api";

// Define the User type
export interface User {
  id: string;
  name: string;
  email: string;
  picture?: string;
}

// Define the AuthContext type
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
}

// Create the AuthContext
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider props
interface AuthProviderProps {
  children: ReactNode;
}

// Create the AuthProvider component
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is authenticated on page load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("authToken");
      if (token) {
        setLoading(true);
        try {
          await fetchUserInfo();
        } catch (err) {
          // If token is invalid, remove it
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

  // Fetch user info from the backend
  const fetchUserInfo = async () => {
    try {
      const response = await authAPI.getCurrentUser();
      setUser(response.data);
      setError(null);
    } catch (err) {
      setUser(null);
      setError("Failed to fetch user information");
      throw err;
    }
  };

  // Login function
  const login = async (googleToken: string) => {
    setLoading(true);
    try {
      // Exchange Google token for JWT token
      const response = await authAPI.googleLogin(googleToken);
      
      // Get JWT token from response
      const { token } = response.data;
      
      // Store JWT token in localStorage
      localStorage.setItem("authToken", token);
      
      // Fetch user info using the JWT token
      await fetchUserInfo();
    } catch (err) {
      console.error("Login error:", err);
      setError("Login failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("authToken");
    setUser(null);
  };

  // Context value
  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
