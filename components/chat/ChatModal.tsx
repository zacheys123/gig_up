// components/chat/ChatModal.tsx
"use client";
import { useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChat } from "@/app/context/ChatContext";
import { ChatInterface } from "./ChatInterface";
import { useThemeColors } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface ChatModalProps {
  chatId: string;
}

export function ChatModal({ chatId }: ChatModalProps) {
  const { closeChat, currentChatId } = useChat();
  const { colors } = useThemeColors();
  const router = useRouter();

  const handleClose = () => {
    closeChat();
    // Simple back navigation - this usually works best
    router.back();
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [handleClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!currentChatId || currentChatId !== chatId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleBackdropClick}
      />

      <div
        className={cn(
          "relative w-full max-w-2xl h-[80vh] rounded-2xl shadow-2xl mx-4",
          colors.card,
          colors.border
        )}
      >
        {/* Header */}
        <div
          className={cn(
            "flex items-center justify-between p-4 border-b",
            colors.border
          )}
        >
          <h3 className={cn("text-lg font-semibold", colors.text)}>Chat</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="rounded-full"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Chat Interface */}
        <div className="h-[calc(100%-80px)]">
          <ChatInterface chatId={chatId} isModal={true} />
        </div>
      </div>
    </div>
  );
}
