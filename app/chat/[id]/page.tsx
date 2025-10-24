// app/chat/[id]/page.tsx
"use client";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const chatId = params.id as string;

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="border-b p-4 flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={handleBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-lg font-semibold">Chaty</h1>
      </div>

      {/* Chat Interface */}
      <div className="flex-1">
        <ChatInterface chatId={chatId} onBack={handleBack} />
      </div>
    </div>
  );
}
