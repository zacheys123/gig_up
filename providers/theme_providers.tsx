"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { useTheme as useNextTheme } from "next-themes";
import { ThemeContextType } from "@/types/theme";
import { darkColors } from "@/theme/darkTheme";
import { lightColors } from "@/theme/lightTheme";

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useNextTheme();
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const isDarkMode = theme === "dark";
  
  const toggleDarkMode = () => {
    setTheme(isDarkMode ? "light" : "dark");
  };

  const colors = isDarkMode ? darkColors : lightColors;

  // Prevent flash of unstyled content
  if (!mounted) {
    return (
      <div style={{ visibility: "hidden" }}>
        {children}
      </div>
    );
  }

  const value: ThemeContextType = {
    isDarkMode,
    toggleDarkMode,
    colors,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};