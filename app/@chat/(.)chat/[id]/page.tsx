// app/@chat/(.)chat/[id]/page.tsx
"use client";
import { ChatModal } from "@/components/chat/ChatModal";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { useChat } from "@/app/context/ChatContext";

export default function InterceptedChatPage() {
  const params = useParams();
  const chatId = params.id as string;
  const { openChat, currentChatId } = useChat();

  useEffect(() => {
    if (chatId && chatId !== currentChatId) {
      console.log("Intercepted route opening chat:", chatId);
      openChat(chatId);
    }
  }, [chatId, currentChatId, openChat]);

  // Don't render if no chatId or if it's not the current chat
  if (!chatId || chatId !== currentChatId) {
    console.log(
      "Intercepted route not rendering - chatId:",
      chatId,
      "currentChatId:",
      currentChatId
    );
    return null;
  }

  return <ChatModal chatId={chatId} />;
}
