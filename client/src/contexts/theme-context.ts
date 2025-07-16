import { createContext } from "react";
import type { Theme } from "./ThemeContext";

export type ThemeProviderState = {
  theme: Theme;
  resolvedTheme?: "dark" | "light";
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
};

export const ThemeProviderContext = createContext<ThemeProviderState>(initialState);
