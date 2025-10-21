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
import { useRouter, usePathname } from "next/navigation";

interface ChatIconProps {
  userId: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "ghost" | "outline" | "default";
  children?: React.ReactNode;
}

export function ChatIcon({
  userId,
  className,
  size = "md",
  variant = "ghost",
  children,
}: ChatIconProps) {
  const { openChat, mobileModal } = useChat();
  const { user: currentUser } = useCurrentUser();
  const router = useRouter();
  const pathname = usePathname();
  const getOrCreateChat = useMutation(
    api.controllers.chat.getOrCreateDirectChat
  );

  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
  };

  // components/chat/ChatIcon.tsx - UPDATED NAVIGATION
  const handleStartChat = async () => {
    if (!currentUser?._id) return;

    try {
      const typedUserId = userId as Id<"users">;
      const chatId = await getOrCreateChat({
        user1Id: currentUser._id,
        user2Id: typedUserId,
      });

      const isMobile = window.innerWidth < 768;
      const isMessagesPage = pathname === "/messages";

      console.log("🔍 ChatIcon Debug:", {
        isMobile,
        mobileModal,
        isMessagesPage,
        pathname,
      });

      if (isMessagesPage) {
        // Always use full page when already on messages page
        router.push(`/messages?chat=${chatId}`);
      } else if (isMobile) {
        if (mobileModal) {
          // Use modal on mobile when enabled - NAVIGATE TO REGULAR ROUTE
          router.push(`/chat/${chatId}`); // This will be intercepted by @chat/(.)[id]
          openChat(chatId);
        } else {
          // Use full page on mobile when modals disabled
          router.push(`/messages?chat=${chatId}`);
        }
      } else {
        // DESKTOP: Respect the modal setting
        if (mobileModal) {
          // Use modal on desktop - NAVIGATE TO REGULAR ROUTE
          router.push(`/chat/${chatId}`); // This will be intercepted by @chat/(.)[id]
          openChat(chatId);
        } else {
          router.push(`/chat/${chatId}`); // Full page on desktop
        }
      }
    } catch (error) {
      console.error("Failed to start chat:", error);
    }
  };

  return (
    <Button
      variant={variant}
      size={children ? "default" : "icon"}
      onClick={handleStartChat}
      className={cn(
        children ? "w-full justify-start" : "rounded-full",
        className
      )}
      title="Start chat"
      disabled={!currentUser?._id}
    >
      {children || <MessageCircle className={cn(sizeClasses[size])} />}
    </Button>
  );
}
