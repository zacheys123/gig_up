"use client";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChat } from "@/app/context/ChatContext";
import { ChatInterface } from "./ChatInterface";
import { useThemeColors } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { useRouter, usePathname } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface ChatModalProps {
  chatId: string;
}

export function ChatModal({ chatId }: ChatModalProps) {
  const { closeChat, currentChatId } = useChat();
  const { colors } = useThemeColors();
  const router = useRouter();
  const pathname = usePathname();
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

  const handleClose = async () => {
    console.log("Closing chat modal for:", chatId);

    // Delete active session first
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

    // Close chat in context
    closeChat();

    // Use router.push to navigate to current path without the intercepted route
    // This ensures we don't go back to a previous page unexpectedly
    if (pathname.includes("/chat/")) {
      // If we're on a chat page, navigate to the parent route
      const basePath = pathname.split("/chat/")[0] || "/";
      router.push(basePath);
    } else {
      // Otherwise just use replace to remove the intercepted route from history
      router.replace(pathname);
    }
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [handleClose]);

  // Cleanup session on unmount
  useEffect(() => {
    return () => {
      if (currentUser?._id && chatId && isSessionActive) {
        deleteActiveSession({
          userId: currentUser._id,
          chatId: chatId as any,
        }).catch(console.error);
      }
    };
  }, [currentUser?._id, chatId, isSessionActive, deleteActiveSession]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // Don't render if this isn't the current chat
  if (!currentChatId || currentChatId !== chatId) {
    console.log(
      "Not rendering modal - currentChatId:",
      currentChatId,
      "chatId:",
      chatId
    );
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        onClick={handleBackdropClick}
      />

      <div
        className={cn(
          "relative w-full max-w-2xl h-[80vh] rounded-2xl shadow-2xl mx-4 flex flex-col",
          colors.card,
          colors.border
        )}
      >
        {/* Header */}
        <div
          className={cn(
            "flex items-center justify-between p-4 border-b flex-shrink-0",
            colors.border
          )}
        >
          <h3 className={cn("text-lg font-semibold", colors.text)}>Chat</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="rounded-full hover:bg-red-100 hover:text-red-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Chat Interface */}
        <div className="flex-1 min-h-0">
          <ChatInterface chatId={chatId} />
        </div>
      </div>
    </div>
  );
}
