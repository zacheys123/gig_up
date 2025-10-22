// app/@chat/(.)chat/[id]/page.tsx
"use client";
import { ChatModal } from "@/components/chat/ChatModal";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { useChat } from "@/app/context/ChatContext";

export default function InterceptedChatPage() {
  const params = useParams();
  const chatId = params.id as string;
  const { openChat, closeChat, currentChatId, isChatOpen } = useChat();

  useEffect(() => {
    if (chatId && chatId !== currentChatId) {
      openChat(chatId);
    }
  }, [chatId, currentChatId, openChat]);

  // Don't render if no chatId or if it's not the current chat
  if (!chatId || chatId !== currentChatId) return null;

  return <ChatModal chatId={chatId} />;
}
