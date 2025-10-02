import { useTheme } from "@/providers/theme_providers";


export function useThemeColors() {
  const { colors } = useTheme();
  return colors;
}

export function useThemeToggle() {
  const { toggleDarkMode, isDarkMode } = useTheme();
  return { toggleDarkMode, isDarkMode };
}