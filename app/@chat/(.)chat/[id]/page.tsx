// app/@chat/(.)chat/[id]/page.tsx
"use client";
import { ChatModal } from "@/components/chat/ChatModal";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { useChat } from "@/app/context/ChatContext";

export default function InterceptedChatPage() {
  const params = useParams();
  const chatId = params.id as string;
  const { openChat, closeChat, currentChatId } = useChat();

  useEffect(() => {
    if (chatId && chatId !== currentChatId) {
      openChat(chatId);
    }
  }, [chatId, currentChatId, openChat]);

  useEffect(() => {
    return () => {
      if (chatId === currentChatId) {
        closeChat();
      }
    };
  }, [chatId, currentChatId, closeChat]);

  if (!chatId || chatId !== currentChatId) return null;

  return <ChatModal chatId={chatId} />;
}
