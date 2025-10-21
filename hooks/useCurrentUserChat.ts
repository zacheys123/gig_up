// hooks/useChat.ts (Optimized version)
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

  return {
    // Data
    chats: chats || [],
    unreadCounts: unreadCounts || { total: 0, byChat: {} },
    totalUnread: unreadCounts?.total || 0,
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
