// hooks/use-theme-debug.ts
"use client";
import { useTheme as useNextTheme } from "next-themes";
import { useEffect, useState } from "react";

export function useThemeDebug() {
  const { theme, setTheme, resolvedTheme } = useNextTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    console.log("Theme Debug - Mounted:", {
      theme,
      resolvedTheme,
      htmlClass: document.documentElement.className
    });
  }, []);

  useEffect(() => {
    if (mounted) {
      console.log("Theme Debug - Updated:", {
        theme,
        resolvedTheme,
        htmlClass: document.documentElement.className
      });
    }
  }, [theme, resolvedTheme, mounted]);

  const isDarkMode = resolvedTheme === 'dark';
  
  const toggleDarkMode = () => {
    const newTheme = isDarkMode ? 'light' : 'dark';
    console.log("Theme Debug - Toggling to:", newTheme);
    setTheme(newTheme);
    
    // Force the HTML class change immediately
    const html = document.documentElement;
    html.classList.remove('light', 'dark');
    html.classList.add(newTheme);
    console.log("Theme Debug - HTML class after toggle:", html.className);
  };
  
  return { 
    toggleDarkMode, 
    isDarkMode: mounted ? isDarkMode : false,
    mounted 
  };
}