// hooks/useThemeColors.ts - OPTIMIZED
import { useTheme as useNextTheme } from "next-themes";
import { useEffect, useState, useMemo } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/nextjs";

// Pre-defined color schemes to prevent runtime object creation
const LIGHT_COLORS = {
  background: "bg-white",
  backgroundMuted: "bg-gray-50",
  text: "text-gray-900",
  textMuted: "text-gray-600",
  textInverted: "text-white",
  primary: "text-orange-600",
  primaryBg: "bg-orange-600",
  primaryBgHover: "hover:bg-orange-700",
  border: "border-gray-200",
  borderMuted: "border-gray-300",
  hoverBg: "hover:bg-gray-100",
  activeBg: "bg-gray-100",
  navBackground: "bg-white",
  navBorder: "border-gray-200",
  navText: "text-gray-900",
  navHover: "hover:bg-gray-50",
  card: "bg-white",
  cardBorder: "border-gray-200",
  destructive: "text-red-600",
  destructiveBg: "bg-red-50",
  destructiveHover: "hover:bg-red-100",
  warning: "bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100",
  warningText: "text-amber-600",
  warningBg: "bg-amber-50",
  warningBorder: "border-amber-200",
  warningHover: "hover:bg-amber-100",
  successText: "text-green-600",
  successBg: "bg-green-50",
  successBorder: "border-green-200",
  secondaryBackground: "bg-gray-100",
  hoverBackground: "bg-gray-200",
  backgroundSecondary: "bg-gray-50",
  textSecondary: "text-gray-700",
  borderSecondary: "border-gray-300",
  focusBg: "focus:bg-gray-100",
  focusBorder: "focus:border-gray-400",
  infoText: "text-blue-600",
  infoBg: "bg-blue-50",
  infoBorder: "border-blue-200",
  gradientPrimary: "bg-gradient-to-r from-orange-400 to-red-400",
  gradientSecondary: "bg-gradient-to-br from-gray-50 via-white to-gray-100",
  shadow: "shadow-gray-400/20",
  overlay: "bg-white/50",
  disabledText: "text-gray-400",
  disabledBg: "bg-gray-200",
  disabledBorder: "border-gray-300",
  danger: "bg-red-50 border-red-200 text-red-800 hover:bg-red-100",
  skeleton: "border-gray-300",
};

const DARK_COLORS = {
  background: "bg-gray-900",
  backgroundMuted: "bg-gray-800",
  text: "text-gray-100",
  textMuted: "text-gray-400",
  textInverted: "text-gray-900",
  primary: "text-orange-400",
  primaryBg: "bg-orange-400",
  primaryBgHover: "hover:bg-orange-300",
  border: "border-gray-700",
  borderMuted: "border-gray-600",
  hoverBg: "hover:bg-gray-800",
  activeBg: "bg-gray-800",
  navBackground: "bg-gray-900",
  navBorder: "border-gray-700",
  navText: "text-gray-100",
  navHover: "hover:bg-gray-800",
  card: "bg-gray-800",
  cardBorder: "border-gray-700",
  destructive: "text-red-400",
  destructiveBg: "bg-red-900/20",
  destructiveHover: "hover:bg-red-900/30",
  warning:
    "bg-amber-900/20 border-amber-800 text-amber-200 hover:bg-amber-900/30",
  warningText: "text-amber-400",
  warningBg: "bg-amber-900/20",
  warningBorder: "border-amber-800",
  warningHover: "hover:bg-amber-900/30",
  successText: "text-green-400",
  successBg: "bg-green-900/20",
  successBorder: "border-green-700",
  secondaryBackground: "bg-gray-800",
  hoverBackground: "bg-gray-700",
  backgroundSecondary: "bg-gray-800",
  textSecondary: "text-gray-300",
  borderSecondary: "border-gray-600",
  focusBg: "focus:bg-gray-800",
  focusBorder: "focus:border-gray-600",
  infoText: "text-blue-400",
  infoBg: "bg-blue-900/20",
  infoBorder: "border-blue-700",
  gradientPrimary: "bg-gradient-to-r from-orange-500 to-red-500",
  gradientSecondary: "bg-gradient-to-br from-gray-900 via-gray-800 to-black",
  shadow: "shadow-gray-900/50",
  overlay: "bg-black/50",
  disabledText: "text-gray-500",
  disabledBg: "bg-gray-700",
  disabledBorder: "border-gray-600",
  danger: "bg-red-900/20 border-red-800 text-red-200 hover:bg-red-900/30",
  skeleton: "border-gray-600/30",
};

export function useThemeColors() {
  const { theme, setTheme, resolvedTheme } = useNextTheme();
  const { userId } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [localTheme, setLocalTheme] = useState<string | null>(null);

  // Get user's theme preference from Convex
  const userTheme = useQuery(
    api.controllers.theme.getUserTheme,
    userId ? { clerkId: userId } : "skip"
  );

  // Wait for both mounting AND userTheme to be available for authenticated users
  useEffect(() => {
    if (mounted) {
      if (userId && userTheme && userTheme !== theme) {
        setTheme(userTheme);
      }
    }
  }, [userTheme, mounted, userId, theme, setTheme]);

  useEffect(() => {
    setMounted(true);

    // Load local theme
    const theme = localStorage.getItem("theme");
    setLocalTheme(theme);
  }, []);

  // Only consider theme ready when mounted AND (for authenticated users, userTheme is loaded)
  const isThemeReady = mounted && (userId ? userTheme !== undefined : true);

  const getSystemTheme = () => {
    if (typeof window === "undefined") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  };

  const effectiveTheme = userTheme || getSystemTheme() || "light" || localTheme;
  const isDarkMode = effectiveTheme === "dark";

  // Memoize colors based on theme to prevent object recreation
  const colors = useMemo(
    () => (isDarkMode ? DARK_COLORS : LIGHT_COLORS),
    [isDarkMode]
  );

  return {
    colors,
    isDarkMode: isThemeReady ? isDarkMode : false,
    mounted: isThemeReady,
    theme: isThemeReady ? effectiveTheme : "light",
    userTheme,
    effectiveTheme: isThemeReady ? effectiveTheme : "light",
    resolvedTheme: isThemeReady ? resolvedTheme : "light",
  };
}

export function useThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useNextTheme();
  const { userId } = useAuth();
  const [mounted, setMounted] = useState(false);

  const updateTheme = useMutation(api.controllers.theme.updateUserTheme);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDarkMode = resolvedTheme === "dark";

  const toggleDarkMode = async () => {
    const newTheme = isDarkMode ? "light" : "dark";

    // Update local state immediately for responsiveness
    setTheme(newTheme);

    // Persist to Convex if user is logged in
    if (userId) {
      try {
        await updateTheme({
          clerkId: userId,
          theme: newTheme,
        });
      } catch (error) {
        console.error("Failed to save theme preference:", error);
      }
    }
  };

  const setThemeWithPersistence = async (
    newTheme: "light" | "dark" | "system"
  ) => {
    setTheme(newTheme);

    if (userId && newTheme !== "system") {
      try {
        await updateTheme({
          clerkId: userId,
          theme: newTheme,
        });
      } catch (error) {
        console.error("Failed to save theme preference:", error);
      }
    }
  };

  return {
    toggleDarkMode,
    setTheme: setThemeWithPersistence,
    isDarkMode: mounted ? isDarkMode : false,
    mounted,
    currentTheme: mounted ? theme : "light",
  };
}
