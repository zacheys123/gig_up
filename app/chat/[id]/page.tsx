// app/chat/[id]/page.tsx
"use client";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { useParams } from "next/navigation";

export default function ChatPage() {
  const params = useParams();
  const chatId = params.id as string;

  return (
    <div className="h-screen">
      <ChatInterface chatId={chatId} isModal={false} />
    </div>
  );
}
