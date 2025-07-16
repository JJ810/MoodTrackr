import { createContext } from "react";
import type { User } from "./AuthContext";

// Define the AuthContext type
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
}

// Create the AuthContext
export const AuthContext = createContext<AuthContextType | undefined>(undefined);
