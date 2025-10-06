// hooks/useThemeColors.ts
import { useTheme as useNextTheme } from "next-themes";
import { useEffect, useState } from "react";

export function useThemeColors() {
  const { theme, resolvedTheme } = useNextTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDarkMode = resolvedTheme === 'dark';

  // Return color classes based on theme
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
  };

  return {
    colors,
    isDarkMode: mounted ? isDarkMode : false,
    mounted,
    theme: mounted ? theme : 'light',
    resolvedTheme: mounted ? resolvedTheme : 'light',
  };
}

// Convenience hook for just the toggle functionality
export function useThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useNextTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDarkMode = resolvedTheme === 'dark';
  
  const toggleDarkMode = () => {
    setTheme(isDarkMode ? 'light' : 'dark');
  };
  
  return { 
    toggleDarkMode, 
    isDarkMode: mounted ? isDarkMode : false,
    mounted 
  };
}
