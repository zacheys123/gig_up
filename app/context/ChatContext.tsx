// contexts/ChatContext.tsx
"use client";
import React, { createContext, useContext, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

interface ChatContextType {
  openChat: (chatId: string) => void;
  closeChat: () => void;
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

  const enableMobileModal = () => setMobileModal(true);
  const disableMobileModal = () => setMobileModal(false);
  // contexts/ChatContext.tsx - Update the openChat function
  const openChat = (chatId: string) => {
    setCurrentChatId(chatId);
    // Just navigate to the chat route - let intercepting routes handle the modal
    router.push(`/chat/${chatId}`, { scroll: false });
  };

  const closeChat = () => {
    setCurrentChatId(null);
    // Let the modal handle the navigation
  };

  return (
    <ChatContext.Provider
      value={{
        openChat,
        closeChat,
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
