// app/(ai)/@ai/(.)ai/page.tsx
"use client";
import { GigUpAssistantModal } from "@/components/ai/GigupAssistantModal";
import { useThemeColors } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AiModalPage() {
  const router = useRouter();
  const { colors } = useThemeColors();
  // Close modal when clicking outside or pressing escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        router.back();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      // Close when clicking on backdrop (the main layout area)
      if (e.target === e.currentTarget) {
        router.back();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [router]);

  return (
    <div
      className={cn("fixed inset-0 z-50 ", colors.background)}
      onClick={() => router.back()}
    >
      <GigUpAssistantModal onClose={() => router.back()} />
    </div>
  );
}
