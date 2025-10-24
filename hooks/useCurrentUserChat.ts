// hooks/useChat.ts (Improved version with chat creation)
"use client";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useCurrentUser } from "./useCurrentUser";
import { useRouter } from "next/navigation";

export function useUserCurrentChat() {
  const { user: currentUser } = useCurrentUser();
  const router = useRouter();

  // Queries
  const chats = useQuery(api.controllers.chat.getUserChats, {
    userId: currentUser?._id,
  });

  // Mutations
  const markAsRead = useMutation(api.controllers.chat.markAsRead);
  const markAllAsRead = useMutation(api.controllers.chat.markAllAsRead);
  const deleteMessage = useMutation(api.controllers.chat.deleteMessage);
  const clearChat = useMutation(api.controllers.chat.clearChat);
  const createDirectChat = useMutation(
    api.controllers.chat.getOrCreateDirectChat
  );
  const sendMessage = useMutation(api.controllers.chat.sendMessage);

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

  // Chat Actions
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

  // New Chat Creation
  const createNewChat = async (otherUserId: string): Promise<string> => {
    if (!currentUser?._id) {
      throw new Error("User not authenticated");
    }

    try {
      console.log("Creating new chat between:", currentUser._id, otherUserId);

      const chatId = await createDirectChat({
        user1Id: currentUser._id,
        user2Id: otherUserId as Id<"users">,
      });

      console.log("Successfully created chat:", chatId);
      return chatId;
    } catch (error) {
      console.error("Failed to create chat:", error);
      throw new Error("Failed to create chat");
    }
  };

  const createAndOpenChat = async (otherUserId: string) => {
    try {
      const chatId = await createNewChat(otherUserId);
      // Open the newly created chat
      router.push(`/chat/${chatId}`, { scroll: false });
      return chatId;
    } catch (error) {
      console.error("Failed to create and open chat:", error);
      throw error;
    }
  };

  const sendNewMessage = async (chatId: string, content: string) => {
    if (!currentUser?._id) {
      throw new Error("User not authenticated");
    }

    try {
      await sendMessage({
        chatId: chatId as Id<"chats">,
        senderId: currentUser._id,
        content,
        messageType: "text",
      });
    } catch (error) {
      console.error("Failed to send message:", error);
      throw new Error("Failed to send message");
    }
  };

  // Check if user already has a chat with another user
  const getExistingChatWithUser = (otherUserId: string) => {
    return chats?.find(
      (chat) =>
        chat.participantIds.includes(otherUserId as Id<"users">) &&
        chat.type === "direct"
    );
  };

  // In your useUserCurrentChat hook
  const smartCreateOrOpenChat = async (
    otherUserId: string
  ): Promise<string> => {
    try {
      // First, check if a chat already exists
      const existingChat = chats?.find((chat) =>
        chat.otherParticipants?.some(
          (participant) => participant?._id === otherUserId
        )
      );

      if (existingChat) {
        console.log("Found existing chat:", existingChat._id);
        return existingChat._id;
      }

      // If no existing chat, create a new one
      console.log("Creating new chat with user:", otherUserId);
      const newChatId = await createNewChat(otherUserId); // Use the context method
      return newChatId;
    } catch (error) {
      console.error("Failed to create or open chat:", error);
      throw error;
    }
  };

  // Get user details from participants
  const getUserFromParticipants = (participants: any[]) => {
    return participants?.find((p: any) => p?._id !== currentUser?._id);
  };

  return {
    // Data
    chats: chats || [],
    onlineUsers,

    // Status helpers
    isUserOnline,
    getChatOnlineParticipants,
    hasOnlineParticipants,

    // Chat management actions
    markAsRead: handleMarkAsRead,
    markAllAsRead: handleMarkAllAsRead,
    deleteMessage: handleDeleteMessage,
    clearChat: handleClearChat,

    // Chat creation actions
    createNewChat,
    createAndOpenChat,
    smartCreateOrOpenChat,
    sendNewMessage,

    // Utility functions
    getExistingChatWithUser,
    getUserFromParticipants,

    // Loading states
    isLoading: chats === undefined,
  };
}
