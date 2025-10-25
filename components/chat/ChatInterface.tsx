// components/chat/ChatInterface.tsx - COMPLETE REWRITTEN VERSION
"use client";
import { useState, useRef, useEffect, useCallback } from "react";
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
  Check,
  CheckCheck,
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
import { useChatMessages } from "@/hooks/useChatMessages";

interface ChatInterfaceProps {
  chatId: string;
  onBack?: () => void;
}

// Message Status Component - IMPROVED VERSION
const MessageStatus = ({
  message,
  isOwn,
  chat,
}: {
  message: any;
  isOwn: boolean;
  chat: any;
}) => {
  if (!isOwn) return null;

  const getStatusInfo = () => {
    const totalParticipants = chat?.participantIds?.length || 1;

    // Count other participants (excluding sender)
    const otherParticipantsCount = totalParticipants - 1;

    // Count read/delivered for OTHER participants (excluding sender)
    const readByOthers =
      message.readBy?.filter((id: string) => id !== message.senderId)?.length ||
      0;
    const deliveredToOthers =
      message.deliveredTo?.filter((id: string) => id !== message.senderId)
        ?.length || 0;

    console.log("Message Status Debug:", {
      messageId: message._id,
      totalParticipants,
      otherParticipantsCount,
      readByOthers,
      deliveredToOthers,
      readBy: message.readBy,
      deliveredTo: message.deliveredTo,
      status: message.status,
    });

    if (readByOthers === otherParticipantsCount && otherParticipantsCount > 0) {
      return {
        icon: <CheckCheck className="w-3 h-3 fill-blue-500 text-blue-500" />,
        text: "Read",
        color: "text-blue-500",
      };
    } else if (readByOthers > 0) {
      return {
        icon: <CheckCheck className="w-3 h-3 fill-blue-400 text-blue-400" />,
        text: `Read by ${readByOthers}`,
        color: "text-blue-400",
      };
    } else if (
      deliveredToOthers === otherParticipantsCount &&
      otherParticipantsCount > 0
    ) {
      return {
        icon: <CheckCheck className="w-3 h-3 text-gray-500" />,
        text: "Delivered",
        color: "text-gray-500",
      };
    } else if (deliveredToOthers > 0) {
      return {
        icon: <CheckCheck className="w-3 h-3 text-gray-400" />,
        text: `Delivered to ${deliveredToOthers}`,
        color: "text-gray-400",
      };
    } else {
      return {
        icon: <Check className="w-3 h-3 text-gray-400" />,
        text: "Sent",
        color: "text-gray-400",
      };
    }
  };

  const status = getStatusInfo();

  return (
    <div className={cn("flex items-center gap-1 mt-1", status.color)}>
      {status.icon}
      <span className="text-xs">{status.text}</span>
    </div>
  );
};

export function ChatInterface({ chatId, onBack }: ChatInterfaceProps) {
  const { user: currentUser } = useCurrentUser();
  const { colors } = useThemeColors();
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Use the chat messages hook with proper typing
  const { sendMessage } = useChatMessages(chatId as Id<"chats">);

  // Use typed chatId consistently
  const typedChatId = chatId as Id<"chats">;

  // Queries
  const chat = useQuery(api.controllers.chat.getChat, {
    chatId: typedChatId,
  });
  const messages = useQuery(api.controllers.chat.getMessages, {
    chatId: typedChatId,
  });
  const typingUsers = useQuery(api.controllers.chat.getTypingUsers, {
    chatId: typedChatId,
  });
  const userChats = useQuery(api.controllers.chat.getUserChats, {
    userId: currentUser?._id as Id<"users">,
  });

  // Mutations - ALL INCLUDED
  const markAsRead = useMutation(api.controllers.chat.markAsRead);
  const markMessageAsRead = useMutation(api.controllers.chat.markMessageAsRead);
  const markAllMessagesAsRead = useMutation(
    api.controllers.chat.markAllMessagesAsRead
  );
  const bulkMarkMessagesAsRead = useMutation(
    api.controllers.chat.bulkMarkMessagesAsRead
  );
  const startTyping = useMutation(api.controllers.chat.startTyping);
  const stopTyping = useMutation(api.controllers.chat.stopTyping);
  const markMessageAsDelivered = useMutation(
    api.controllers.chat.markMessageAsDelivered
  );
  const createActiveSession = useMutation(
    api.controllers.chat.createActiveChatSession
  );
  const deleteActiveSession = useMutation(
    api.controllers.chat.deleteActiveChatSession
  );
  const updateActiveSession = useMutation(
    api.controllers.chat.updateActiveSession
  );

  // Refs for typing management
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const markReadTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Filter out current user from typing users
  const otherUsersTyping =
    typingUsers?.filter((user) => user?._id !== currentUser?._id) || [];

  // Active session management
  useEffect(() => {
    if (!currentUser?._id || !typedChatId) return;

    let intervalId: NodeJS.Timeout;

    const setupActiveSession = async () => {
      try {
        await createActiveSession({
          userId: currentUser._id,
          chatId: typedChatId,
        });

        // Update session every 30 seconds to keep it active
        intervalId = setInterval(async () => {
          try {
            await updateActiveSession({
              userId: currentUser._id,
              chatId: typedChatId,
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
        chatId: typedChatId,
      }).catch(console.error);
    };
  }, [
    currentUser?._id,
    typedChatId,
    createActiveSession,
    deleteActiveSession,
    updateActiveSession,
  ]);

  // Mark chat as read when opened (chat-level unread count)
  useEffect(() => {
    if (typedChatId && currentUser && chat) {
      markAsRead({
        chatId: typedChatId,
        userId: currentUser._id,
      }).catch(console.error);
    }
  }, [typedChatId, currentUser, markAsRead, chat]);

  // IMPROVED: Mark messages as read with debouncing and bulk operations
  useEffect(() => {
    if (!currentUser?._id || !messages || !chat) return;

    // Clear any existing timeout
    if (markReadTimeoutRef.current) {
      clearTimeout(markReadTimeoutRef.current);
    }

    markReadTimeoutRef.current = setTimeout(async () => {
      const unreadMessages = messages.filter(
        (message) =>
          message.senderId !== currentUser._id &&
          !message.readBy.includes(currentUser._id)
      );

      if (unreadMessages.length === 0) return;

      console.log(`📖 Found ${unreadMessages.length} unread messages`);

      try {
        // Use bulk operation for efficiency
        if (unreadMessages.length > 5) {
          console.log(
            "🚀 Using bulk operation for",
            unreadMessages.length,
            "messages"
          );
          await bulkMarkMessagesAsRead({
            messageIds: unreadMessages.map((m) => m._id),
            userId: currentUser._id,
          });
        } else {
          // Individual calls for small numbers
          console.log(
            "📝 Using individual calls for",
            unreadMessages.length,
            "messages"
          );
          const promises = unreadMessages.map((message) =>
            markMessageAsRead({
              messageId: message._id,
              userId: currentUser._id,
            }).catch((error) => {
              console.error(
                `Failed to mark message ${message._id} as read:`,
                error
              );
              return null;
            })
          );
          await Promise.all(promises);
        }
        console.log("✅ Successfully marked messages as read");
      } catch (error) {
        console.error("❌ Failed to mark messages as read:", error);
      }
    }, 500); // Debounce to avoid rapid fires

    return () => {
      if (markReadTimeoutRef.current) {
        clearTimeout(markReadTimeoutRef.current);
      }
    };
  }, [
    messages,
    currentUser?._id,
    markMessageAsRead,
    bulkMarkMessagesAsRead,
    chat,
  ]);

  // IMPROVED: Track message delivery status
  useEffect(() => {
    if (!currentUser?._id || !messages) return;

    // Mark messages as delivered when they appear in the chat
    const markMessagesAsDelivered = async () => {
      const messagesToMark = messages.filter(
        (message) =>
          message.senderId !== currentUser._id &&
          !message.deliveredTo.includes(currentUser._id)
      );

      if (messagesToMark.length === 0) return;

      console.log(`📬 Marking ${messagesToMark.length} messages as delivered`);

      // Use Promise.all for efficiency
      const deliveryPromises = messagesToMark.map((message) =>
        markMessageAsDelivered({
          messageId: message._id,
          userId: currentUser._id,
        }).catch((error) => {
          console.error(`Failed to mark message as delivered:`, error);
          return null;
        })
      );

      await Promise.all(deliveryPromises);
      console.log("✅ Successfully marked messages as delivered");
    };

    markMessagesAsDelivered();
  }, [messages, currentUser?._id, markMessageAsDelivered]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, otherUsersTyping]);

  // Real-time typing management
  const sendTypingStart = useCallback(async () => {
    if (!currentUser?._id || !typedChatId) return;

    try {
      await startTyping({
        chatId: typedChatId,
        userId: currentUser._id,
      });
    } catch (error) {
      console.error("Failed to send typing start:", error);
    }
  }, [currentUser?._id, typedChatId, startTyping]);

  const sendTypingStop = useCallback(async () => {
    if (!currentUser?._id || !typedChatId) return;

    try {
      await stopTyping({
        chatId: typedChatId,
        userId: currentUser._id,
      });
    } catch (error) {
      console.error("Failed to send typing stop:", error);
    }
  }, [currentUser?._id, typedChatId, stopTyping]);

  // Handle typing events
  useEffect(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (message.length > 0) {
      sendTypingStart();
      typingTimeoutRef.current = setTimeout(() => {
        sendTypingStop();
      }, 1000);
    } else {
      sendTypingStop();
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [message, sendTypingStart, sendTypingStop]);

  // Clean up typing indicator when component unmounts
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (markReadTimeoutRef.current) {
        clearTimeout(markReadTimeoutRef.current);
      }
      sendTypingStop();
    };
  }, [sendTypingStop]);

  const handleSendMessage = async () => {
    if (!message.trim() || !currentUser || isSending) return;

    setIsSending(true);
    try {
      await sendTypingStop();
      await sendMessage(message.trim(), currentUser._id);
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

  // Typing indicator component
  const TypingIndicator = () => {
    if (otherUsersTyping.length === 0) return null;

    const typingUser = otherUsersTyping[0];
    const typingText =
      otherUsersTyping.length > 1
        ? `${otherUsersTyping.length} people are typing...`
        : `${typingUser?.firstname || "Someone"} is typing...`;

    return (
      <div className="flex gap-3 animate-in fade-in duration-300">
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarImage src={typingUser?.picture} />
          <AvatarFallback className={cn("text-xs", colors.text)}>
            {typingUser?.firstname?.[0]}
            {typingUser?.lastname?.[0]}
          </AvatarFallback>
        </Avatar>
        <div
          className={cn(
            "max-w-xs lg:max-w-md px-4 py-3 rounded-2xl",
            colors.backgroundMuted,
            colors.text
          )}
        >
          <div className="flex items-center gap-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
              <div
                className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div
                className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
            </div>
            <span className="text-sm text-gray-600">{typingText}</span>
          </div>
        </div>
      </div>
    );
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
  if (
    chat === undefined ||
    messages === undefined ||
    typingUsers === undefined
  ) {
    return (
      <div className="flex flex-col h-full">
        {/* Header Skeleton */}
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

        {/* Messages Skeleton */}
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

        {/* Input Skeleton */}
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
            {otherUsersTyping.length > 0 ? (
              <div className="flex items-center gap-1">
                <div className="flex space-x-1">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                  <div
                    className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                  <div
                    className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"
                    style={{ animationDelay: "0.4s" }}
                  ></div>
                </div>
                <span className={cn("text-xs font-medium", "text-green-600")}>
                  typing...
                </span>
              </div>
            ) : (
              <OnlineBadge
                userId={otherParticipant?._id as Id<"users">}
                size="xs"
                showText={true}
                showLastActive={true}
              />
            )}

            {chat.type === "group" && (
              <span className={cn("text-xs", colors.textMuted)}>
                {chat.participants?.length} members
              </span>
            )}
          </div>
        </div>

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
                  data-message-id={msg._id} // For potential intersection observer
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

                    <div className="flex items-center justify-between mt-2">
                      <p
                        className={cn(
                          `text-xs opacity-70 ${
                            isOwn ? "text-blue-100" : colors.textMuted
                          }`
                        )}
                      >
                        {new Date(msg._creationTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>

                      {/* Message status for own messages */}
                      {isOwn && (
                        <MessageStatus
                          message={msg}
                          isOwn={isOwn}
                          chat={chat}
                        />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Real-time Typing Indicator */}
            <TypingIndicator />
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

        {message.length > 0 && (
          <div className={cn("text-xs text-right mt-2", colors.textMuted)}>
            {message.length}/1000
          </div>
        )}
      </div>
    </div>
  );
}
