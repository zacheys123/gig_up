// components/chat/ChatIcon.tsx
"use client";
import { MessageCircle, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChat } from "@/app/context/ChatContext";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { cn } from "@/lib/utils";
import { Id } from "@/convex/_generated/dataModel";
import { useRouter, usePathname } from "next/navigation";
import { useThemeColors } from "@/hooks/useTheme";

interface ChatIconProps {
  userId: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "ghost" | "outline" | "default" | "secondary" | "cozy";
  children?: React.ReactNode;
  showText?: boolean;
  showPulse?: boolean;
}

export function ChatIcon({
  userId,
  className,
  size = "md",
  variant = "cozy", // New cozy variant as default
  children,
  showText = false,
  showPulse = false,
}: ChatIconProps) {
  const { openChat, mobileModal } = useChat();
  const { user: currentUser } = useCurrentUser();
  const router = useRouter();
  const pathname = usePathname();
  const { colors, isDarkMode } = useThemeColors();
  const getOrCreateChat = useMutation(
    api.controllers.chat.getOrCreateDirectChat
  );

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const buttonSize = showText ? "default" : "icon";

  // Cozy theme styles
  const cozyStyles = {
    background: isDarkMode
      ? "bg-gradient-to-br from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30"
      : "bg-gradient-to-br from-amber-100 to-orange-100 hover:from-amber-200 hover:to-orange-200",
    border: isDarkMode
      ? "border-amber-500/30 hover:border-amber-400/50"
      : "border-amber-300 hover:border-amber-400",
    text: isDarkMode ? "text-amber-300" : "text-amber-700",
    shadow:
      "shadow-lg hover:shadow-xl shadow-amber-500/10 hover:shadow-amber-500/20",
  };

  const variantStyles = {
    cozy: cn(
      cozyStyles.background,
      cozyStyles.border,
      cozyStyles.text,
      cozyStyles.shadow,
      "border-2 transition-all duration-300",
      "hover:scale-105 active:scale-95",
      "backdrop-blur-sm"
    ),
    default: cn(
      "bg-blue-500 hover:bg-blue-600 text-white",
      "shadow-lg hover:shadow-xl shadow-blue-500/25",
      "transition-all duration-300 hover:scale-105 active:scale-95"
    ),
    secondary: cn(
      "bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white",
      "shadow-lg hover:shadow-xl shadow-purple-500/25",
      "transition-all duration-300 hover:scale-105 active:scale-95"
    ),
    outline: cn(
      "border-2 bg-transparent",
      isDarkMode
        ? "border-gray-600 text-gray-300 hover:border-amber-400 hover:text-amber-300 hover:bg-amber-500/10"
        : "border-gray-300 text-gray-700 hover:border-amber-400 hover:text-amber-700 hover:bg-amber-50",
      "transition-all duration-300 hover:scale-105 active:scale-95"
    ),
    ghost: cn(
      "bg-transparent hover:bg-opacity-20",
      isDarkMode
        ? "text-gray-400 hover:text-amber-300 hover:bg-amber-500/10"
        : "text-gray-600 hover:text-amber-600 hover:bg-amber-100",
      "transition-all duration-300 hover:scale-105 active:scale-95"
    ),
  };

  // components/chat/ChatIcon.tsx - Simplified
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

      if (isMobile && !isMessagesPage && mobileModal) {
        // Use modal on mobile
        router.push(`/chat/${chatId}`, { scroll: false });
        openChat(chatId);
      } else if (isMessagesPage) {
        // Stay on messages page
        router.push(`/messages?chat=${chatId}`);
      } else {
        // Use modal on desktop or full page
        router.push(`/chat/${chatId}`, { scroll: false });
        openChat(chatId);
      }
    } catch (error) {
      console.error("Failed to start chat:", error);
    }
  };

  // Get appropriate icon based on variant
  const getIcon = () => {
    if (variant === "cozy" || variant === "secondary") {
      return (
        <MessageSquare
          className={cn(sizeClasses[size], "animate-soft-bounce")}
        />
      );
    }
    return <MessageCircle className={cn(sizeClasses[size])} />;
  };

  return (
    <div className="relative">
      {/* Animated pulse effect */}
      {showPulse && (
        <div
          className={cn(
            "absolute inset-0 rounded-full animate-ping",
            variant === "cozy" && "bg-amber-400/30",
            variant === "default" && "bg-blue-400/30",
            variant === "secondary" && "bg-purple-400/30"
          )}
        />
      )}

      <Button
        variant={variant === "cozy" ? "default" : variant} // Use default for cozy since it's custom
        size={buttonSize}
        onClick={handleStartChat}
        className={cn(
          showText ? "w-full justify-start" : "rounded-full",
          "relative transition-all duration-300 font-medium",
          variantStyles[variant],
          showText && "px-4 py-2.5",
          className
        )}
        title="Start a cozy conversation"
        disabled={!currentUser?._id}
      >
        <div className="flex items-center gap-2">
          {getIcon()}
          {showText && (
            <span
              className={cn(
                "font-medium",
                variant === "cozy" && "text-sm",
                variant === "default" && "text-white",
                variant === "secondary" && "text-white"
              )}
            >
              Let's Chat
            </span>
          )}
          {children}
        </div>
      </Button>
    </div>
  );
}
