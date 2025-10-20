// app/@chat/[id]/page.tsx
"use client";
import { ChatModal } from "@/components/chat/ChatModal";
import { useParams } from "next/navigation";

export default function ChatModalPage() {
  const params = useParams();
  const chatId = params.id as string;

  return <ChatModal chatId={chatId} />;
}
