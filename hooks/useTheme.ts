// hooks/useThemeColors.ts
import { useTheme as useNextTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/nextjs";

export function useThemeColors() {
  const { theme, setTheme, resolvedTheme } = useNextTheme();
  const { userId } = useAuth();
  const [mounted, setMounted] = useState(false);

  // Get user's theme preference from Convex
  const userTheme = useQuery(
    api.controllers.theme.getUserTheme,
    userId ? { clerkId: userId } : "skip"
  );

  // Sync Convex theme with next-themes
  useEffect(() => {
    if (mounted && userTheme && userTheme !== theme) {
      setTheme(userTheme);
    }
  }, [userTheme, theme, setTheme, mounted]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDarkMode = resolvedTheme === "dark";

  const colors = {
    // Background colors
    background: isDarkMode ? "bg-gray-900" : "bg-white",
    backgroundMuted: isDarkMode ? "bg-gray-800" : "bg-gray-60",

    // Text colors
    text: isDarkMode ? "text-gray-100" : "text-gray-900",
    textMuted: isDarkMode ? "text-gray-400" : "text-gray-600",
    textInverted: isDarkMode ? "text-gray-900" : "text-white",

    // Primary colors
    primary: isDarkMode ? "text-orange-400" : "text-orange-600",
    primaryBg: isDarkMode ? "bg-orange-400" : "bg-orange-600",
    primaryBgHover: isDarkMode ? "hover:bg-orange-300" : "hover:bg-orange-700",

    // Border colors
    border: isDarkMode ? "border-gray-700" : "border-gray-200",
    borderMuted: isDarkMode ? "border-gray-600" : "border-gray-300",

    // Interactive states
    hoverBg: isDarkMode ? "hover:bg-gray-800" : "hover:bg-gray-100",
    activeBg: isDarkMode ? "bg-gray-800" : "bg-gray-100",

    // Specific component colors
    navBackground: isDarkMode ? "bg-gray-900" : "bg-white",
    navBorder: isDarkMode ? "border-gray-700" : "border-gray-200",
    navText: isDarkMode ? "text-gray-100" : "text-gray-900",
    navHover: isDarkMode ? "hover:bg-gray-800" : "hover:bg-gray-50",

    // Card colors
    card: isDarkMode ? "bg-gray-800" : "bg-white",
    cardBorder: isDarkMode ? "border-gray-700" : "border-gray-200",

    // Destructive colors
    destructive: isDarkMode ? "text-red-400" : "text-red-600",
    destructiveBg: isDarkMode ? "bg-red-900/20" : "bg-red-50",
    destructiveHover: isDarkMode ? "hover:bg-red-900/30" : "hover:bg-red-100",

    // Warning colors
    warningText: isDarkMode ? "text-yellow-300" : "text-red-600",
    warningBg: isDarkMode ? "bg-yellow-900/20" : "bg-yellow-50",
    warningBorder: isDarkMode ? "border-yellow-700" : "border-yellow-200",

    // Success colors
    successText: isDarkMode ? "text-green-400" : "text-green-600",
    successBg: isDarkMode ? "bg-green-900/20" : "bg-green-50",
    successBorder: isDarkMode ? "border-green-700" : "border-green-200",

    // Secondary background
    secondaryBackground: isDarkMode ? "bg-gray-800" : "bg-gray-100",

    // Hover background
    hoverBackground: isDarkMode ? "bg-gray-700" : "bg-gray-200",

    // ADD THESE MISSING CLASSES:

    // Additional background variants
    backgroundSecondary: isDarkMode ? "bg-gray-800" : "bg-gray-50",

    // Additional text variants
    textSecondary: isDarkMode ? "text-gray-300" : "text-gray-700",

    // Additional border variants
    borderSecondary: isDarkMode ? "border-gray-600" : "border-gray-300",

    // Additional state colors
    focusBg: isDarkMode ? "focus:bg-gray-800" : "focus:bg-gray-100",
    focusBorder: isDarkMode ? "focus:border-gray-600" : "focus:border-gray-400",

    // Additional semantic colors
    infoText: isDarkMode ? "text-blue-400" : "text-blue-600",
    infoBg: isDarkMode ? "bg-blue-900/20" : "bg-blue-50",
    infoBorder: isDarkMode ? "border-blue-700" : "border-blue-200",

    // Gradient backgrounds
    gradientPrimary: isDarkMode
      ? "bg-gradient-to-r from-orange-500 to-red-500"
      : "bg-gradient-to-r from-orange-400 to-red-400",

    // Shadow colors
    shadow: isDarkMode ? "shadow-gray-900/50" : "shadow-gray-400/20",

    // Overlay colors
    overlay: isDarkMode ? "bg-black/50" : "bg-white/50",

    // Disabled states
    disabledText: isDarkMode ? "text-gray-500" : "text-gray-400",
    disabledBg: isDarkMode ? "bg-gray-700" : "bg-gray-200",
    disabledBorder: isDarkMode ? "border-gray-600" : "border-gray-300",
  };

  return {
    colors,
    isDarkMode: mounted ? isDarkMode : false,
    mounted,
    theme: mounted ? theme : "light",
    resolvedTheme: mounted ? resolvedTheme : "light",
  };
}

// Updated toggle hook with Convex persistence
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
