// contexts/ChatContext.tsx - Updated version
"use client";
import React, { createContext, useContext, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface ChatContextType {
  openChat: (chatId: string) => void;
  closeChat: () => void;
  createNewChat: (otherUserId: string) => Promise<string>;
  currentChatId: string | null;
  isChatOpen: boolean;
  mobileModal: boolean;
  setMobileModal: (enabled: boolean) => void;
  enableMobileModal: () => void;
  disableMobileModal: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [mobileModal, setMobileModal] = useState(false);
  const { user } = useCurrentUser();
  // Mutation to create new chat
  const createDirectChat = useMutation(
    api.controllers.chat.getOrCreateDirectChat
  );

  const enableMobileModal = () => setMobileModal(true);
  const disableMobileModal = () => setMobileModal(false);

  const openChat = (chatId: string) => {
    setCurrentChatId(chatId);
    router.push(`/chat/${chatId}`, { scroll: false });
  };

  const closeChat = () => {
    setCurrentChatId(null);
    if (pathname.includes("/chat/")) {
      router.back();
    }
  };

  const createNewChat = async (otherUserId: string): Promise<string> => {
    try {
      // You'll need to get the current user's ID - you might need to pass it in or get it from your auth
      const currentUserId = user?._id; // You'll need to replace this

      console.log("Creating new chat between:", currentUserId, otherUserId);

      const chatId = await createDirectChat({
        user1Id: currentUserId as Id<"users">,
        user2Id: otherUserId as Id<"users">,
      });

      console.log("Created chat:", chatId);
      return chatId;
    } catch (error) {
      console.error("Failed to create chat:", error);
      throw new Error("Failed to create chat");
    }
  };

  return (
    <ChatContext.Provider
      value={{
        openChat,
        closeChat,
        createNewChat,
        currentChatId,
        isChatOpen: !!currentChatId,
        mobileModal,
        setMobileModal,
        enableMobileModal,
        disableMobileModal,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
