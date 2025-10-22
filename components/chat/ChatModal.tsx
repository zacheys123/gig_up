// components/chat/ChatModal.tsx - UPDATED
"use client";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChat } from "@/app/context/ChatContext";
import { ChatInterface } from "./ChatInterface";
import { useThemeColors } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface ChatModalProps {
  chatId: string;
}

export function ChatModal({ chatId }: ChatModalProps) {
  const { closeChat, currentChatId } = useChat();
  const { colors } = useThemeColors();
  const router = useRouter();
  const { user: currentUser } = useCurrentUser();

  // Convex mutations
  const createActiveSession = useMutation(
    api.controllers.chat.createActiveChatSession
  );
  const deleteActiveSession = useMutation(
    api.controllers.chat.deleteActiveChatSession
  );

  const [isSessionActive, setIsSessionActive] = useState(false);

  // Create active session when modal opens
  useEffect(() => {
    if (currentUser?._id && chatId && currentChatId === chatId) {
      const activateSession = async () => {
        try {
          await createActiveSession({
            userId: currentUser._id,
            chatId: chatId as any,
          });
          setIsSessionActive(true);
        } catch (error) {
          console.error("Failed to create active session:", error);
        }
      };

      activateSession();
    }
  }, [currentUser?._id, chatId, currentChatId, createActiveSession]);

  // Delete active session when modal closes
  const handleClose = async () => {
    if (currentUser?._id && chatId && isSessionActive) {
      try {
        await deleteActiveSession({
          userId: currentUser._id,
          chatId: chatId as any,
        });
        setIsSessionActive(false);
      } catch (error) {
        console.error("Failed to delete active session:", error);
      }
    }

    closeChat();
    router.back();
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
      // Cleanup session on unmount
      if (currentUser?._id && chatId && isSessionActive) {
        deleteActiveSession({
          userId: currentUser._id,
          chatId: chatId as any,
        }).catch(console.error);
      }
    };
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
