// hooks/useChat.ts (Optimized version)
"use client";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useCurrentUser } from "./useCurrentUser";
import { useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";

// Constants
const ONLINE_TIMEOUT_MS = 300000; // 5 minutes

export function useUserCurrentChat() {
  const { user: currentUser } = useCurrentUser();
  const router = useRouter();
  const userId = currentUser?._id;

  // Memoize query args
  const chatsArgs = useMemo(() => (userId ? { userId } : "skip"), [userId]);

  // Queries
  const chatsQuery = useQuery(api.controllers.chat.getUserChats, chatsArgs);

  // Memoize mutations
  const markAsReadMutation = useMutation(api.controllers.chat.markAsRead);
  const markAllAsReadMutation = useMutation(api.controllers.chat.markAllAsRead);
  const deleteMessageMutation = useMutation(api.controllers.chat.deleteMessage);
  const clearChatMutation = useMutation(api.controllers.chat.clearChat);
  const createDirectChatMutation = useMutation(
    api.controllers.chat.getOrCreateDirectChat
  );
  const sendMessageMutation = useMutation(api.controllers.chat.sendMessage);

  // Memoize chats data
  const chats = useMemo(() => chatsQuery || [], [chatsQuery]);

  // Online status calculation (memoized)
  const getOnlineStatus = useCallback((user: any): boolean => {
    if (!user?.lastActive) return false;
    return Date.now() - user.lastActive < ONLINE_TIMEOUT_MS;
  }, []);

  // Memoize participants and online users
  const { allParticipants, onlineUsers } = useMemo(() => {
    if (!chats.length) {
      return { allParticipants: [], onlineUsers: [] };
    }

    const participants = chats.flatMap(
      (chat) => chat.participants?.filter((p) => p && p._id !== userId) || []
    );

    // Deduplicate participants by ID
    const uniqueParticipantsMap = new Map<string, any>();
    participants.forEach((p) => {
      if (p?._id) {
        uniqueParticipantsMap.set(p._id, p);
      }
    });

    const uniqueParticipants = Array.from(uniqueParticipantsMap.values());
    const online = uniqueParticipants.filter((user) => getOnlineStatus(user));

    return { allParticipants: uniqueParticipants, onlineUsers: online };
  }, [chats, userId, getOnlineStatus]);

  // Memoized online status checks
  const isUserOnline = useCallback(
    (userId: string): boolean => {
      const user = allParticipants.find((u) => u?._id === userId);
      return getOnlineStatus(user);
    },
    [allParticipants, getOnlineStatus]
  );

  const getChatOnlineParticipants = useCallback(
    (chatId: string) => {
      const chat = chats.find((c) => c._id === chatId);
      if (!chat) return [];

      return (
        chat.participants?.filter(
          (participant) =>
            participant &&
            participant._id !== userId &&
            isUserOnline(participant._id)
        ) || []
      );
    },
    [chats, userId, isUserOnline]
  );

  const hasOnlineParticipants = useCallback(
    (chatId: string): boolean => {
      return getChatOnlineParticipants(chatId).length > 0;
    },
    [getChatOnlineParticipants]
  );

  // Chat Actions (memoized)
  const handleMarkAsRead = useCallback(
    async (chatId: Id<"chats">) => {
      if (!userId) return;
      await markAsReadMutation({ chatId, userId });
    },
    [markAsReadMutation, userId]
  );

  const handleMarkAllAsRead = useCallback(async () => {
    if (!userId) return;
    await markAllAsReadMutation({ userId });
  }, [markAllAsReadMutation, userId]);

  const handleDeleteMessage = useCallback(
    async (messageId: Id<"messages">) => {
      await deleteMessageMutation({ messageId });
    },
    [deleteMessageMutation]
  );

  const handleClearChat = useCallback(
    async (chatId: Id<"chats">) => {
      await clearChatMutation({ chatId });
    },
    [clearChatMutation]
  );

  // Chat Creation Logic
  const createNewChat = useCallback(
    async (otherUserId: string): Promise<string> => {
      if (!userId) {
        throw new Error("User not authenticated");
      }

      try {
        console.log("Creating new chat between:", userId, otherUserId);

        const chatId = await createDirectChatMutation({
          user1Id: userId,
          user2Id: otherUserId as Id<"users">,
        });

        console.log("Successfully created chat:", chatId);
        return chatId;
      } catch (error) {
        console.error("Failed to create chat:", error);
        throw new Error(
          error instanceof Error ? error.message : "Failed to create chat"
        );
      }
    },
    [createDirectChatMutation, userId]
  );

  const createAndOpenChat = useCallback(
    async (otherUserId: string) => {
      try {
        const chatId = await createNewChat(otherUserId);
        router.push(`/chat/${chatId}`, { scroll: false });
        return chatId;
      } catch (error) {
        console.error("Failed to create and open chat:", error);
        throw error;
      }
    },
    [createNewChat, router]
  );

  const sendNewMessage = useCallback(
    async (chatId: string, content: string) => {
      if (!userId) {
        throw new Error("User not authenticated");
      }

      if (!content.trim()) {
        throw new Error("Message cannot be empty");
      }

      try {
        await sendMessageMutation({
          chatId: chatId as Id<"chats">,
          senderId: userId,
          content: content.trim(),
          messageType: "text",
        });
      } catch (error) {
        console.error("Failed to send message:", error);
        throw new Error(
          error instanceof Error ? error.message : "Failed to send message"
        );
      }
    },
    [sendMessageMutation, userId]
  );

  // Existing chat lookup (memoized)
  const getExistingChatWithUser = useCallback(
    (otherUserId: string) => {
      return chats.find(
        (chat) =>
          chat.participantIds.includes(otherUserId as Id<"users">) &&
          chat.type === "direct"
      );
    },
    [chats]
  );

  // Smart chat creation with deduplication
  const smartCreateOrOpenChat = useCallback(
    async (otherUserId: string): Promise<string> => {
      try {
        const existingChat = getExistingChatWithUser(otherUserId);
        if (existingChat) {
          console.log("Found existing chat:", existingChat._id);
          return existingChat._id;
        }

        console.log("Creating new chat with user:", otherUserId);
        const newChatId = await createNewChat(otherUserId);
        console.log("✅ New chat created with ID:", newChatId);
        return newChatId;
      } catch (error) {
        console.error("Failed to create or open chat:", error);
        throw error;
      }
    },
    [getExistingChatWithUser, createNewChat]
  );

  // Get user details from participants
  const getUserFromParticipants = useCallback(
    (participants: any[]) => {
      return participants?.find((p: any) => p?._id !== userId);
    },
    [userId]
  );

  // Memoize the return object to prevent unnecessary re-renders
  const result = useMemo(
    () => ({
      // Data
      chats,
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
      isLoading: chatsQuery === undefined,
      isEmpty: chats.length === 0,
    }),
    [
      chats,
      onlineUsers,
      isUserOnline,
      getChatOnlineParticipants,
      hasOnlineParticipants,
      handleMarkAsRead,
      handleMarkAllAsRead,
      handleDeleteMessage,
      handleClearChat,
      createNewChat,
      createAndOpenChat,
      smartCreateOrOpenChat,
      sendNewMessage,
      getExistingChatWithUser,
      getUserFromParticipants,
      chatsQuery,
    ]
  );

  return result;
}

// Optional: Specialized hook for a specific chat
export function useChat(chatId?: Id<"chats">) {
  const generalChat = useUserCurrentChat();

  const chatArgs = useMemo(() => (chatId ? { chatId } : "skip"), [chatId]);

  const specificChat = useQuery(api.controllers.chat.getChat, chatArgs);

  const messagesArgs = useMemo(() => (chatId ? { chatId } : "skip"), [chatId]);

  const messages = useQuery(api.controllers.chat.getMessages, messagesArgs);

  const result = useMemo(
    () => ({
      ...generalChat,
      specificChat,
      messages: messages || [],
      isChatLoading: specificChat === undefined || messages === undefined,
    }),
    [generalChat, specificChat, messages]
  );

  return result;
}

// Optional: Hook for chat notifications
export function useChatNotifications() {
  const { chats, markAllAsRead } = useUserCurrentChat();

  const unreadCount = useMemo(() => {
    return chats.reduce((count, chat) => {
      return count + (chat.unreadCount || 0);
    }, 0);
  }, [chats]);

  const hasUnread = unreadCount > 0;

  return {
    unreadCount,
    hasUnread,
    markAllAsRead,
  };
}
