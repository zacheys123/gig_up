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
  Users,
  Clock,
  AlertCircle,
  RefreshCw,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useThemeColors } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { Id } from "@/convex/_generated/dataModel";
import { OnlineBadge } from "./OnlineBadge";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface ChatInterfaceProps {
  chatId: string;

  onBack?: () => void;
}

export function ChatInterface({ chatId, onBack }: ChatInterfaceProps) {
  const { user: currentUser } = useCurrentUser();
  const { colors } = useThemeColors();
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const typedUser = chatId as Id<"chats">;

  // Queries with loading states
  const chat = useQuery(api.controllers.chat.getChat, { chatId: typedUser });
  const messages = useQuery(api.controllers.chat.getMessages, {
    chatId: typedUser,
  });

  // Get user's chats to show suggestions when no chat is selected
  const userChats = useQuery(api.controllers.chat.getUserChats, {
    userId: currentUser?._id,
  });

  // Mutations
  const sendMessage = useMutation(api.controllers.chat.sendMessage);
  const markAsRead = useMutation(api.controllers.chat.markAsRead);
  const updatePresence = useMutation(api.controllers.chat.updatePresence);
  const createActiveSession = useMutation(
    api.controllers.chat.createActiveChatSession
  );
  const deleteActiveSession = useMutation(
    api.controllers.chat.deleteActiveChatSession
  );
  const updateActiveSession = useMutation(
    api.controllers.chat.updateActiveSession
  );

  // Active session management
  useEffect(() => {
    if (!currentUser?._id || !chatId) return;

    let intervalId: NodeJS.Timeout;

    const setupActiveSession = async () => {
      try {
        await createActiveSession({
          userId: currentUser._id,
          chatId: chatId as any,
        });

        intervalId = setInterval(async () => {
          try {
            await updateActiveSession({
              userId: currentUser._id,
              chatId: chatId as any,
            });
          } catch (error) {
            console.error("Failed to update active session:", error);
          }
        }, 30000);
      } catch (error) {
        console.error("Failed to create active session:", error);
      }
    };

    setupActiveSession();

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
      deleteActiveSession({
        userId: currentUser._id,
        chatId: chatId as any,
      }).catch(console.error);
    };
  }, [
    currentUser?._id,
    chatId,
    createActiveSession,
    deleteActiveSession,
    updateActiveSession,
  ]);

  // In your ChatInterface component
  // In your ChatInterface component - FIXED useEffect
  useEffect(() => {
    if (typedUser && currentUser && chat) {
      console.log("🔔 Marking chat as read:", {
        chatId: typedUser,
        userId: currentUser._id,
        currentUnreadCounts: chat.unreadCounts,
      });

      markAsRead({ chatId: typedUser, userId: currentUser._id });

      // We can't use ctx in frontend, but we can verify by re-querying
      console.log("📊 Before markAsRead - Unread counts:", chat.unreadCounts);
    }
  }, [typedUser, currentUser, markAsRead, chat]);

  // Add this to see if markAsRead is working
  const updatedChat = useQuery(api.controllers.chat.getChat, {
    chatId: typedUser,
  });
  useEffect(() => {
    if (updatedChat) {
      console.log(
        "📊 After markAsRead - Updated unread counts:",
        updatedChat.unreadCounts
      );
    }
  }, [updatedChat]);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!message.trim() || !currentUser || !typedUser || isSending) return;

    setIsSending(true);
    try {
      await sendMessage({
        chatId: typedUser,
        content: message.trim(),
        senderId: currentUser._id,
      });
      setMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // No chat selected state
  if (!chatId) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div
          className={cn(
            "w-20 h-20 rounded-full flex items-center justify-center mb-6",
            colors.backgroundMuted
          )}
        >
          <MessageCircle className={cn("w-10 h-10", colors.textMuted)} />
        </div>
        <h3 className={cn("text-xl font-bold mb-3", colors.text)}>
          Select a Conversation
        </h3>
        <p className={cn("text-sm max-w-md mb-6", colors.textMuted)}>
          Choose a conversation from your list to start messaging, or start a
          new conversation with another user.
        </p>

        {userChats && userChats.length > 0 && (
          <div className="w-full max-w-sm">
            <div
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl mb-4",
                colors.backgroundMuted
              )}
            >
              <Search className={cn("w-4 h-4", colors.textMuted)} />
              <span className={cn("text-sm", colors.textMuted)}>
                {userChats.length} conversation
                {userChats.length !== 1 ? "s" : ""} available
              </span>
            </div>
          </div>
        )}

        <Button
          onClick={onBack}
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          <Users className="w-4 h-4 mr-2" />
          View Conversations
        </Button>
      </div>
    );
  }

  // Chat loading state
  if (chat === undefined || messages === undefined) {
    return (
      <div className="flex flex-col h-full">
        {/* Loading Header */}
        <div
          className={cn(
            "flex items-center gap-3 p-4 border-b",
            colors.border,
            colors.card
          )}
        >
          <Skeleton className="w-8 h-8 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>

        {/* Loading Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={`flex gap-3 ${i % 2 === 0 ? "flex-row-reverse" : "flex-row"}`}
            >
              {i % 2 !== 0 && <Skeleton className="w-8 h-8 rounded-full" />}
              <div className="space-y-2">
                <Skeleton className={`h-16 ${i % 2 === 0 ? "w-48" : "w-56"}`} />
              </div>
            </div>
          ))}
        </div>

        {/* Loading Input */}
        <div className={cn("border-t p-4", colors.border, colors.card)}>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-10 flex-1 rounded-full" />
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  // Chat not found state
  if (chat === null) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div
          className={cn(
            "w-20 h-20 rounded-full flex items-center justify-center mb-6",
            "bg-red-100 dark:bg-red-900/20"
          )}
        >
          <AlertCircle className="w-10 h-10 text-red-500" />
        </div>
        <h3 className={cn("text-xl font-bold mb-3", colors.text)}>
          Conversation Not Found
        </h3>
        <p className={cn("text-sm max-w-md mb-6", colors.textMuted)}>
          The conversation you're looking for doesn't exist or you don't have
          permission to access it.
        </p>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className={cn(colors.border)}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={onBack}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const otherParticipant = chat.participants?.find(
    (p) => p?._id !== currentUser?._id
  );

  // No messages state (but chat exists)
  const isEmptyChat = messages?.length === 0;

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div
        className={cn(
          "flex items-center gap-3 p-4 border-b",
          colors.border,
          colors.card
        )}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="mr-2 md:hidden"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>

        <Avatar className="w-8 h-8">
          <AvatarImage src={otherParticipant?.picture} />
          <AvatarFallback className={cn("text-xs", colors.text)}>
            {otherParticipant?.firstname?.[0]}
            {otherParticipant?.lastname?.[0]}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className={cn("font-semibold text-sm truncate", colors.text)}>
              {chat.displayName}
            </h3>
            {otherParticipant?.verified && (
              <Badge variant="secondary" className="h-4 px-1 text-xs">
                ✓
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <OnlineBadge
              userId={otherParticipant?._id as Id<"users">}
              size="xs"
              showText={true}
              showLastActive={true}
            />
            {chat.type === "group" && (
              <span className={cn("text-xs", colors.textMuted)}>
                {chat.participants?.length} members
              </span>
            )}
          </div>
        </div>

        {/* Connection status indicator */}
        <div className="flex items-center gap-2">
          {isSending && (
            <div className="flex items-center gap-1">
              <RefreshCw className="w-3 h-3 animate-spin text-blue-500" />
              <span className={cn("text-xs", colors.textMuted)}>
                Sending...
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isEmptyChat ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div
              className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4",
                colors.backgroundMuted
              )}
            >
              <MessageCircle className={cn("w-8 h-8", colors.textMuted)} />
            </div>
            <p className={cn("font-medium mb-2", colors.text)}>
              Start a conversation with {otherParticipant?.firstname}
            </p>
            <p className={cn("text-sm mb-6", colors.textMuted)}>
              Send the first message to begin your chat
            </p>
            <div
              className={cn(
                "px-4 py-3 rounded-xl text-sm max-w-md",
                colors.backgroundMuted,
                colors.textMuted
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4" />
                <span className="font-medium">
                  Tips for great conversations:
                </span>
              </div>
              <ul className="text-left space-y-1 text-xs">
                <li>• Introduce yourself and be friendly</li>
                <li>• Ask open-ended questions</li>
                <li>• Share common interests</li>
              </ul>
            </div>
          </div>
        ) : (
          <>
            {/* Message count indicator */}
            <div className="text-center">
              <Badge variant="outline" className={cn("text-xs", colors.border)}>
                {messages.length} message{messages.length !== 1 ? "s" : ""}
              </Badge>
            </div>

            {/* Messages */}
            {messages?.map((msg) => {
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
                    <Avatar className="w-8 h-8 flex-shrink-0">
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
                    {!isOwn && chat.type === "group" && (
                      <p className="text-xs font-medium mb-1">
                        {sender?.firstname} {sender?.lastname}
                      </p>
                    )}
                    <p className="text-sm break-words">{msg.content}</p>
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
            })}
          </>
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
            placeholder={isEmptyChat ? "Say hello..." : "Type a message..."}
            className={cn("flex-1 rounded-full", colors.backgroundMuted)}
            disabled={isSending}
          />
          <Button variant="ghost" size="sm" className="rounded-full">
            <Mic className="w-4 h-4" />
          </Button>
          <Button
            onClick={handleSendMessage}
            disabled={!message.trim() || isSending}
            className="bg-blue-500 hover:bg-blue-600 text-white rounded-full disabled:opacity-50"
          >
            {isSending ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Character count */}
        {message.length > 0 && (
          <div className={cn("text-xs text-right mt-2", colors.textMuted)}>
            {message.length}/1000
          </div>
        )}
      </div>
    </div>
  );
}
