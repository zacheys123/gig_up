// components/ThemeWrapper.tsx
"use client";

import { useThemeColors } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

export const ThemeWrapper = ({ children }: { children: React.ReactNode }) => {
  const { colors } = useThemeColors();

  return (
    <div className={cn("min-h-screen", colors.background)}>{children}</div>
  );
};
