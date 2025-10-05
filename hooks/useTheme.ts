// hooks/use-theme.ts
import { useTheme } from "@/providers/theme_providers";

export function useThemeColors() {
  const { isDarkMode } = useTheme();
  
  // Return Tailwind class names based on theme
  return {
    background: isDarkMode ? "bg-background dark" : "bg-background",
    text: isDarkMode ? "text-foreground dark" : "text-foreground",
    card: isDarkMode ? "bg-card dark" : "bg-card",
    primary: "bg-primary text-primary-foreground",
    secondary: "bg-secondary text-secondary-foreground",
    muted: "bg-muted text-muted-foreground",
    accent: "bg-accent text-accent-foreground",
    destructive: "bg-destructive text-destructive-foreground",
    border: "border-border",
  };
}

export function useThemeToggle() {
  const { toggleDarkMode, isDarkMode } = useTheme();
  return { toggleDarkMode, isDarkMode };
}