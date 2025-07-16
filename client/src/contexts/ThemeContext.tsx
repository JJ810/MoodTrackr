import { useEffect, useState } from "react";
import { ThemeProviderContext } from "./theme-context";

export type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

// ThemeProviderContext is imported from theme-context.ts

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "mood-trackr-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Check if theme is stored in localStorage
    if (typeof window !== "undefined") {
      const storedTheme = localStorage.getItem(storageKey);
      return (storedTheme as Theme) || defaultTheme;
    }
    return defaultTheme;
  });
  
  const [resolvedTheme, setResolvedTheme] = useState<"dark" | "light">();

  // Update theme in localStorage when it changes
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
      setResolvedTheme(systemTheme);
    } else {
      root.classList.add(theme);
      setResolvedTheme(theme);
    }

    localStorage.setItem(storageKey, theme);
  }, [theme, storageKey]);

  // Listen for changes in system theme preference
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    
    const handleChange = () => {
      if (theme === "system") {
        const newResolvedTheme = mediaQuery.matches ? "dark" : "light";
        document.documentElement.classList.remove("light", "dark");
        document.documentElement.classList.add(newResolvedTheme);
        setResolvedTheme(newResolvedTheme);
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeProviderContext.Provider 
      value={{ theme, resolvedTheme, setTheme }} 
      {...props}
    >
      {children}
    </ThemeProviderContext.Provider>
  );
}

// useTheme hook is now imported from theme-hooks.ts
