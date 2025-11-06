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
  text?: string;
}

export function ChatIcon({
  userId,
  className,
  size = "md",
  variant = "cozy",
  children,
  showText = false,
  showPulse = false,
  text,
}: ChatIconProps) {
  const { openChat } = useChat();
  const { user: currentUser } = useCurrentUser();
  const router = useRouter();
  const pathname = usePathname();
  const { colors, isDarkMode, mounted } = useThemeColors();
  const getOrCreateChat = useMutation(
    api.controllers.chat.getOrCreateDirectChat
  );

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const buttonSize = showText ? "default" : "icon";

  // Cozy theme styles using theme colors
  const cozyStyles = {
    background: isDarkMode
      ? cn(
          colors.warningBg,
          "hover:bg-amber-900/30" // Fallback hover
        )
      : cn(
          colors.warningBg,
          "hover:bg-amber-100" // Fallback hover
        ),
    border: isDarkMode
      ? cn(colors.warningBorder, "hover:border-amber-400/50")
      : cn(colors.warningBorder, "hover:border-amber-400"),
    text: colors.warningText,
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
      colors.primaryBg,
      colors.primaryBgHover,
      "text-white",
      "shadow-lg hover:shadow-xl shadow-blue-500/25",
      "transition-all duration-300 hover:scale-105 active:scale-95"
    ),
    secondary: cn(
      colors.secondaryBackground,
      "hover:bg-gray-700 dark:hover:bg-gray-600", // Fallback hovers
      colors.text,
      "border",
      colors.border,
      "shadow-lg hover:shadow-xl shadow-gray-500/10",
      "transition-all duration-300 hover:scale-105 active:scale-95"
    ),
    outline: cn(
      "border-2 bg-transparent",
      colors.border,
      colors.text,
      colors.hoverBg,
      "hover:border-amber-400 hover:text-amber-300 dark:hover:text-amber-400", // Fallback hovers
      "transition-all duration-300 hover:scale-105 active:scale-95"
    ),
    ghost: cn(
      "bg-transparent",
      colors.textSecondary,
      colors.hoverBg,
      "hover:text-amber-300 dark:hover:text-amber-400", // Fallback hovers
      "transition-all duration-300 hover:scale-105 active:scale-95"
    ),
  };

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

      if (isMobile && !isMessagesPage) {
        router.push(`/chat/${chatId}`, { scroll: false });
        openChat(chatId);
      } else if (isMessagesPage) {
        router.push(`/messages?chat=${chatId}`);
      } else {
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

  // Show loading state until theme is mounted
  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size={buttonSize}
        className={cn(
          showText ? "w-full justify-start" : "rounded-full",
          "animate-pulse",
          colors.disabledBg,
          className
        )}
        disabled
      >
        <div className="flex items-center gap-2">
          <div
            className={cn(sizeClasses[size], colors.disabledBg, "rounded")}
          />
          {showText && (
            <div className={cn("h-4 w-16 rounded", colors.disabledBg)} />
          )}
        </div>
      </Button>
    );
  }

  return (
    <div className="relative">
      {/* Animated pulse effect */}
      {showPulse && (
        <div
          className={cn(
            "absolute inset-0 rounded-full animate-ping",
            variant === "cozy" && "bg-amber-400/30",
            variant === "default" && "bg-blue-400/30",
            variant === "secondary" && colors.backgroundMuted
          )}
        />
      )}

      <Button
        variant={variant === "cozy" ? "default" : variant}
        size={buttonSize}
        onClick={handleStartChat}
        className={cn(
          showText ? "w-full justify-start" : "rounded-full",
          "relative transition-all duration-300 font-medium",
          variantStyles[variant],
          showText && "px-4 py-2.5",
          className
        )}
        title="Start a conversation"
        disabled={!currentUser?._id}
      >
        <div className="flex items-center gap-2">
          {getIcon()}
          {showText && (
            <span
              className={cn(
                "font-medium",
                variant === "cozy" && colors.warningText,
                variant === "default" && "text-white",
                variant === "secondary" && colors.text,
                variant === "outline" && colors.text,
                variant === "ghost" && colors.text
              )}
            >
              {text ? text : `Let's Chat`}
            </span>
          )}
          {children}
        </div>
      </Button>
    </div>
  );
}
