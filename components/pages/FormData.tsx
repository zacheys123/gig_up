"use client";
import { Search } from "lucide-react";
import SearchInput from "./SearchInput";
import { useThemeColors } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

const FormData = () => {
  const { colors } = useThemeColors();

  return (
    <form
      className={cn(
        "w-full h-[70px] fixed z-30 shadow-lg",
        colors.background,
        "bg-gradient-to-r from-black to-gray-900" // Fallback gradient
      )}
    >
      <div className="flex justify-center items-center w-full max-w-4xl mx-auto h-full px-4">
        <div
          className={cn(
            "flex items-center w-full h-12 backdrop-blur-sm rounded-lg border transition-all duration-300 px-4",
            colors.card,
            colors.border,
            "hover:border-gray-600" // You could also make this theme-aware if needed
          )}
        >
          <Search size="17px" className={cn("my-6", colors.textMuted)} />
          <SearchInput />
        </div>
      </div>
    </form>
  );
};

export default FormData;
