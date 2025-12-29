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
  clientPrimary: "#3b82f6",
  clientSecondary: "#06b6d4",
  clientBg: "rgba(59, 130, 246, 0.1)",
  clientText: "#1d4ed8",
  clientBorder: "rgba(59, 130, 246, 0.3)",

  bookerPrimary: "#10b981",
  bookerSecondary: "#14b8a6",
  bookerBg: "rgba(16, 185, 129, 0.1)",
  bookerText: "#047857",
  bookerBorder: "rgba(16, 185, 129, 0.3)",

  vocalistPrimary: "#ec4899",
  vocalistSecondary: "#f43f5e",
  vocalistBg: "rgba(236, 72, 153, 0.1)",
  vocalistText: "#be185d",
  vocalistBorder: "rgba(236, 72, 153, 0.3)",

  djPrimary: "#8b5cf6",
  djSecondary: "#7c3aed",
  djBg: "rgba(139, 92, 246, 0.1)",
  djText: "#6d28d9",
  djBorder: "rgba(139, 92, 246, 0.3)",

  mcPrimary: "#f97316",
  mcSecondary: "#f59e0b",
  mcBg: "rgba(249, 115, 22, 0.1)",
  mcText: "#c2410c",
  mcBorder: "rgba(249, 115, 22, 0.3)",

  musicianPrimary: "#f59e0b",
  musicianSecondary: "#ea580c",
  musicianBg: "rgba(245, 158, 11, 0.1)",
  musicianText: "#b45309",
  musicianBorder: "rgba(245, 158, 11, 0.3)",

  defaultPrimary: "#6b7280",
  defaultSecondary: "#4b5563",
  defaultBg: "rgba(107, 114, 128, 0.1)",
  defaultText: "#374151",
  defaultBorder: "rgba(107, 114, 128, 0.3)",

  // Stats colors
  followersBg: "rgba(59, 130, 246, 0.05)",
  followersText: "#3b82f6",

  gigsBg: "rgba(16, 185, 129, 0.05)",
  gigsText: "#10b981",

  viewsBg: "rgba(139, 92, 246, 0.05)",
  viewsText: "#8b5cf6",

  // Card gradients
  cardBgStart: "#ffffff",
  cardBgEnd: "#f9fafb",

  // Tag colors
  tagBg: "rgba(0, 0, 0, 0.05)",
  tagText: "#4b5563",
  tagBorder: "rgba(0, 0, 0, 0.1)",

  // Button colors
  buttonSecondaryBg: "#f3f4f6",

  // Pro badge
  proBadgeBg: "rgba(139, 92, 246, 0.1)",
  proBadgeBorder: "rgba(139, 92, 246, 0.3)",
  proBadgeIcon: "#8b5cf6",
  proBadgeText: "#7c3aed",

  // Skeleton colors
  skeletonBg: "#f3f4f6",
  skeletonBgDark: "#e5e7eb",

  // Border variations
  borderStrong: "#d1d5db",
  borderLight: "#e5e7eb",

  primaryRing: "ring-orange-500",
  borderColor: "#d1d5db",

  primaryLight: "#fb923c", // Lighter version of orange
  primaryContrast: "#ffffff", // White for contrast on primary
  primaryDark: "#c2410c", // Darker version of orange

  secondary: "#4b5563", // Gray color
  accent: "#8b5cf6", // Purple accent

  textStrong: "#1f2937", // Very dark text

  success: "#10b981", // Green for success states

  // Additional gradient colors
  gradientFrom: "#f97316", // Orange start
  gradientTo: "#ef4444", // Red end

  // Button states
  buttonHover: "#ea580c", // Darker orange on hover

  // Glass effects
  glassBg: "rgba(255, 255, 255, 0.8)",
  glassBorder: "rgba(255, 255, 255, 0.2)",

  // Shadows
  shadowLight: "rgba(0, 0, 0, 0.1)",
  shadowDark: "rgba(0, 0, 0, 0.2)",

  // Overlays
  overlayLight: "rgba(255, 255, 255, 0.5)",
  overlayDark: "rgba(0, 0, 0, 0.5)",
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
  clientPrimary: "#60a5fa",
  clientSecondary: "#22d3ee",
  clientBg: "rgba(96, 165, 250, 0.15)",
  clientText: "#93c5fd",
  clientBorder: "rgba(96, 165, 250, 0.3)",

  bookerPrimary: "#34d399",
  bookerSecondary: "#2dd4bf",
  bookerBg: "rgba(52, 211, 153, 0.15)",
  bookerText: "#a7f3d0",
  bookerBorder: "rgba(52, 211, 153, 0.3)",

  vocalistPrimary: "#f472b6",
  vocalistSecondary: "#fb7185",
  vocalistBg: "rgba(244, 114, 182, 0.15)",
  vocalistText: "#fbcfe8",
  vocalistBorder: "rgba(244, 114, 182, 0.3)",

  djPrimary: "#a78bfa",
  djSecondary: "#8b5cf6",
  djBg: "rgba(167, 139, 250, 0.15)",
  djText: "#ddd6fe",
  djBorder: "rgba(167, 139, 250, 0.3)",

  mcPrimary: "#fb923c",
  mcSecondary: "#fbbf24",
  mcBg: "rgba(251, 146, 60, 0.15)",
  mcText: "#fed7aa",
  mcBorder: "rgba(251, 146, 60, 0.3)",

  musicianPrimary: "#fbbf24",
  musicianSecondary: "#fb923c",
  musicianBg: "rgba(251, 191, 36, 0.15)",
  musicianText: "#fde68a",
  musicianBorder: "rgba(251, 191, 36, 0.3)",

  defaultPrimary: "#9ca3af",
  defaultSecondary: "#6b7280",
  defaultBg: "rgba(156, 163, 175, 0.15)",
  defaultText: "#d1d5db",
  defaultBorder: "rgba(156, 163, 175, 0.3)",

  // Stats colors
  followersBg: "rgba(96, 165, 250, 0.1)",
  followersText: "#60a5fa",

  gigsBg: "rgba(52, 211, 153, 0.1)",
  gigsText: "#34d399",

  viewsBg: "rgba(167, 139, 250, 0.1)",
  viewsText: "#a78bfa",

  // Card gradients
  cardBgStart: "#1f2937",
  cardBgEnd: "#111827",

  // Tag colors
  tagBg: "rgba(255, 255, 255, 0.1)",
  tagText: "#d1d5db",
  tagBorder: "rgba(255, 255, 255, 0.2)",

  // Button colors
  buttonSecondaryBg: "#374151",

  // Pro badge
  proBadgeBg: "rgba(167, 139, 250, 0.2)",
  proBadgeBorder: "rgba(167, 139, 250, 0.4)",
  proBadgeIcon: "#a78bfa",
  proBadgeText: "#c4b5fd",

  // Skeleton colors
  skeletonBg: "#374151",
  skeletonBgDark: "#4b5563",

  // Border variations
  borderStrong: "#4b5563",
  borderLight: "#374151",
  primaryRing: "ring-orange-400",
  borderColor: "#4b5563",

  primaryLight: "#fb923c", // Orange light
  primaryContrast: "#ffffff", // White for contrast
  primaryDark: "#c2410c", // Orange dark

  secondary: "#9ca3af", // Light gray
  accent: "#a78bfa", // Purple accent

  textStrong: "#f9fafb", // Very light text

  success: "#34d399", // Green for success states

  // Additional gradient colors
  gradientFrom: "#f97316", // Orange start
  gradientTo: "#ef4444", // Red end

  // Button states
  buttonHover: "#fb923c", // Lighter orange on hover

  // Glass effects
  glassBg: "rgba(31, 41, 55, 0.8)",
  glassBorder: "rgba(255, 255, 255, 0.1)",

  // Shadows
  shadowLight: "rgba(0, 0, 0, 0.3)",
  shadowDark: "rgba(0, 0, 0, 0.5)",

  // Overlays
  overlayLight: "rgba(255, 255, 255, 0.1)",
  overlayDark: "rgba(0, 0, 0, 0.7)",
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
