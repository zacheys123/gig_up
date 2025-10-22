// hooks/useChat.ts (Improved version)
"use client";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useCurrentUser } from "./useCurrentUser";

export function useUserCurrentChat() {
  const { user: currentUser } = useCurrentUser();

  // Queries
  const chats = useQuery(api.controllers.chat.getUserChats, {
    userId: currentUser?._id,
  });

  const unreadCounts = useQuery(api.controllers.chat.getUnreadCounts, {
    userId: currentUser?._id,
  });

  // Mutations
  const markAsRead = useMutation(api.controllers.chat.markAsRead);
  const markAllAsRead = useMutation(api.controllers.chat.markAllAsRead);
  const deleteMessage = useMutation(api.controllers.chat.deleteMessage);
  const clearChat = useMutation(api.controllers.chat.clearChat);

  // ✅ IMPROVED: Better unread count handling with fallback calculations
  const safeUnreadCounts = unreadCounts || { total: 0, byChat: {} };

  // Calculate total unread from chats as fallback if query returns 0
  const calculatedTotalUnread =
    chats?.reduce((total, chat) => {
      return total + (chat.unreadCount || 0);
    }, 0) || 0;

  // Use query result if available and > 0, otherwise use calculated fallback
  const finalTotalUnread =
    safeUnreadCounts.total > 0 ? safeUnreadCounts.total : calculatedTotalUnread;

  // Enhanced byChat with fallback to chat.unreadCount
  const enhancedByChat: Record<string, number> = {};
  chats?.forEach((chat) => {
    const queryCount = safeUnreadCounts.byChat[chat._id] || 0;
    const chatCount = chat.unreadCount || 0;
    enhancedByChat[chat._id] = queryCount > 0 ? queryCount : chatCount;
  });

  const finalUnreadCounts = {
    total: finalTotalUnread,
    byChat: enhancedByChat,
  };

  // Online status based on lastActive field from chat participants
  const getOnlineStatus = (user: any) => {
    if (!user?.lastActive) return false;
    return Date.now() - user.lastActive < 300000; // 5 minutes
  };

  // Get all unique participants from your chats for online status
  const allParticipants =
    chats?.flatMap(
      (chat) =>
        chat.participants?.filter((p) => p && p._id !== currentUser?._id) || []
    ) || [];

  const onlineUsers = allParticipants.filter((user) => getOnlineStatus(user));

  // Get online status for a specific user
  const isUserOnline = (userId: string) => {
    const user = allParticipants.find((u) => u?._id === userId);
    return getOnlineStatus(user);
  };

  // Get online participants in a specific chat
  const getChatOnlineParticipants = (chatId: string) => {
    const chat = chats?.find((c) => c._id === chatId);
    if (!chat) return [];

    return (
      chat.participants?.filter(
        (participant) =>
          participant &&
          participant._id !== currentUser?._id &&
          isUserOnline(participant._id)
      ) || []
    );
  };

  // Check if a specific chat has online participants
  const hasOnlineParticipants = (chatId: string) => {
    return getChatOnlineParticipants(chatId).length > 0;
  };

  // Actions
  const handleMarkAsRead = async (chatId: Id<"chats">) => {
    if (!currentUser?._id) return;
    await markAsRead({ chatId, userId: currentUser._id });
  };

  const handleMarkAllAsRead = async () => {
    if (!currentUser?._id) return;
    await markAllAsRead({ userId: currentUser._id });
  };

  const handleDeleteMessage = async (messageId: Id<"messages">) => {
    await deleteMessage({ messageId });
  };

  const handleClearChat = async (chatId: Id<"chats">) => {
    await clearChat({ chatId });
  };

  // Debug logging (remove in production)
  if (process.env.NODE_ENV === "development") {
    console.log("🔍 Chat Hook Debug:");
    console.log("Chats:", chats?.length);
    console.log("Query unreadCounts:", unreadCounts);
    console.log("Calculated total unread:", calculatedTotalUnread);
    console.log("Final total unread:", finalTotalUnread);
    console.log("Enhanced byChat:", enhancedByChat);
  }

  return {
    // Data
    chats: chats || [],
    unreadCounts: finalUnreadCounts, // ✅ Use the enhanced version
    totalUnread: finalTotalUnread, // ✅ This should now work properly
    onlineUsers,

    // Status helpers
    isUserOnline,
    getChatOnlineParticipants,
    hasOnlineParticipants,

    // Actions
    markAsRead: handleMarkAsRead,
    markAllAsRead: handleMarkAllAsRead,
    deleteMessage: handleDeleteMessage,
    clearChat: handleClearChat,

    // Loading states
    isLoading: chats === undefined,
  };
}
