// components/chat/ChatInterface.tsx
"use client";
import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import {
  Send,
  Paperclip,
  Mic,
  Image,
  ArrowLeft,
  MessageCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useThemeColors } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { Id } from "@/convex/_generated/dataModel";

interface ChatInterfaceProps {
  chatId: string;
  isModal: boolean;
  onBack?: () => void;
}

export function ChatInterface({ chatId, isModal, onBack }: ChatInterfaceProps) {
  const { user: currentUser } = useCurrentUser();
  const { colors } = useThemeColors();
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const typedUser = chatId as Id<"chats">;
  const chat = useQuery(api.controllers.chat.getChat, { chatId: typedUser });
  const messages = useQuery(api.controllers.chat.getMessages, {
    chatId: typedUser,
  });
  const presence = useQuery(api.controllers.chat.getChatPresence, {
    chatId: typedUser,
  });

  const sendMessage = useMutation(api.controllers.chat.sendMessage);
  const markAsRead = useMutation(api.controllers.chat.markAsRead);
  const updatePresence = useMutation(api.controllers.chat.updatePresence);

  useEffect(() => {
    if (typedUser && currentUser) {
      markAsRead({ chatId: typedUser, userId: currentUser._id });
      updatePresence({
        userId: currentUser._id,
        chatId: typedUser,
        isOnline: true,
      });
    }
  }, [typedUser, currentUser, markAsRead, updatePresence]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!message.trim() || !currentUser || !typedUser) return;

    try {
      await sendMessage({
        chatId: typedUser,
        content: message.trim(),
        senderId: currentUser._id,
      });
      setMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!chat) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className={colors.textMuted}>Loading chat...</p>
      </div>
    );
  }

  const otherParticipant = chat.participants?.find(
    (p) => p?._id !== currentUser?._id
  );

  return (
    <div className="flex flex-col h-full">
      {/* Minimal Chat Header */}
      <div
        className={cn(
          "flex items-center gap-3 p-4 border-b",
          colors.border,
          colors.card
        )}
      >
        {/* Back Button - Show on mobile and when not in modal */}
        {!isModal && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="mr-2 md:hidden"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
        )}

        <Avatar className="w-8 h-8">
          <AvatarImage src={otherParticipant?.picture} />
          <AvatarFallback className={cn("text-xs", colors.text)}>
            {otherParticipant?.firstname?.[0]}
            {otherParticipant?.lastname?.[0]}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <h3 className={cn("font-semibold text-sm", colors.text)}>
            {chat.displayName}
          </h3>
          <p className={cn("text-xs", colors.textMuted)}>
            {presence?.some(
              (p) => p.userId === otherParticipant?._id && p.isOnline
            ) ? (
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Online
              </span>
            ) : (
              "Offline"
            )}
          </p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages?.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div
                className={cn(
                  "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4",
                  colors.backgroundMuted
                )}
              >
                <MessageCircle className={cn("w-8 h-8", colors.textMuted)} />
              </div>
              <p className={cn("font-medium mb-2", colors.text)}>
                No messages yet
              </p>
              <p className={cn("text-sm", colors.textMuted)}>
                Send a message to start the conversation
              </p>
            </div>
          </div>
        ) : (
          messages?.map((msg) => {
            const isOwn = msg.senderId === currentUser?._id;
            const sender = chat.participants?.find(
              (p) => p?._id === msg.senderId
            );

            return (
              <div
                key={msg._id}
                className={`flex gap-3 ${isOwn ? "flex-row-reverse" : "flex-row"}`}
              >
                {!isOwn && (
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={sender?.picture} />
                    <AvatarFallback className={cn("text-xs", colors.text)}>
                      {sender?.firstname?.[0]}
                      {sender?.lastname?.[0]}
                    </AvatarFallback>
                  </Avatar>
                )}

                <div
                  className={cn(
                    `max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                      isOwn
                        ? "bg-blue-500 text-white rounded-br-md"
                        : colors.backgroundMuted
                    }`,
                    !isOwn && colors.text
                  )}
                >
                  {!isOwn && (
                    <p className="text-xs font-medium mb-1">
                      {sender?.firstname} {sender?.lastname}
                    </p>
                  )}
                  <p className="text-sm">{msg.content}</p>
                  <p
                    className={cn(
                      `text-xs opacity-70 mt-1 text-right ${
                        isOwn ? "text-blue-100" : colors.textMuted
                      }`
                    )}
                  >
                    {new Date(msg._creationTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className={cn("border-t p-4", colors.border, colors.card)}>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" className="rounded-full">
            <Paperclip className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="rounded-full">
            <Image className="w-4 h-4" />
          </Button>
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className={cn("flex-1 rounded-full", colors.backgroundMuted)}
          />
          <Button variant="ghost" size="sm" className="rounded-full">
            <Mic className="w-4 h-4" />
          </Button>
          <Button
            onClick={handleSendMessage}
            disabled={!message.trim()}
            className="bg-blue-500 hover:bg-blue-600 text-white rounded-full"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
