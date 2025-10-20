// components/chat/ChatIcon.tsx
"use client";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChat } from "@/app/context/ChatContext";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { cn } from "@/lib/utils";
import { Id } from "@/convex/_generated/dataModel";

interface ChatIconProps {
  userId: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "ghost" | "outline" | "default";
}

export function ChatIcon({
  userId,
  className,
  size = "md",
  variant = "ghost",
}: ChatIconProps) {
  const { openChat } = useChat();
  const { user: currentUser } = useCurrentUser();
  const getOrCreateChat = useMutation(
    api.controllers.chat.getOrCreateDirectChat
  );

  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
  };

  const handleStartChat = async () => {
    if (!currentUser?._id) return;

    try {
      const typedUserId = userId as Id<"users">;
      const chatId = await getOrCreateChat({
        user1Id: currentUser._id,
        user2Id: typedUserId,
      });
      openChat(chatId);
    } catch (error) {
      console.error("Failed to start chat:", error);
    }
  };

  return (
    <Button
      variant={variant}
      size="icon"
      onClick={handleStartChat}
      className={cn("rounded-full", sizeClasses[size], className)}
      title="Start chat"
      disabled={!currentUser?._id}
    >
      <MessageCircle className={cn(sizeClasses[size])} />
    </Button>
  );
}
