// convex/controllers/chat.ts - Fixed version
import { query, mutation, action } from "../_generated/server";
import { v } from "convex/values";
import { Id } from "../_generated/dataModel";
import { api } from "../_generated/api";

// Get a specific chat by ID
export const getChat = query({
  args: {
    chatId: v.optional(v.id("chats")),
  },
  handler: async (ctx, args) => {
    if (!args.chatId) return null;

    const chat = await ctx.db.get(args.chatId);
    if (!chat) return null;

    // Get participant details
    const participants = await Promise.all(
      chat.participantIds.map((id) => ctx.db.get(id))
    );

    const otherParticipants = participants.filter(
      (p) => p && p._id !== chat.createdBy
    );
    const chatName =
      chat.type === "direct"
        ? `${otherParticipants[0]?.firstname} ${otherParticipants[0]?.lastname}`.trim() ||
          otherParticipants[0]?.username
        : chat.name;

    return {
      ...chat,
      participants: participants.filter(Boolean),
      displayName: chatName,
      otherParticipants,
    };
  },
});

// Get or create a direct chat between two users
export const getOrCreateDirectChat = mutation({
  args: {
    user1Id: v.id("users"),
    user2Id: v.id("users"),
  },
  handler: async (ctx, args) => {
    const { user1Id, user2Id } = args;

    // Sort IDs to ensure consistent chat creation
    const participantIds = [user1Id, user2Id].sort();

    // Check if chat already exists
    const existingChat = await ctx.db
      .query("chats")
      .withIndex("by_participants", (q) =>
        q.eq("participantIds", participantIds)
      )
      .first();

    if (existingChat) {
      return existingChat._id;
    }

    // Create new chat
    const chatId = await ctx.db.insert("chats", {
      participantIds,
      type: "direct",
      createdBy: user1Id,
      lastMessageAt: Date.now(),
      unreadCounts: {},
    });

    return chatId;
  },
});

// Send a message
export const sendMessage = mutation({
  args: {
    chatId: v.id("chats"),
    senderId: v.id("users"),
    content: v.string(),
    messageType: v.optional(
      v.union(
        v.literal("text"),
        v.literal("image"),
        v.literal("file"),
        v.literal("audio")
      )
    ),
    attachments: v.optional(
      v.array(
        v.object({
          url: v.string(),
          type: v.string(),
          name: v.optional(v.string()),
          size: v.optional(v.number()),
        })
      )
    ),
    repliedTo: v.optional(v.id("messages")),
  },
  handler: async (ctx, args) => {
    const {
      chatId,
      senderId,
      content,
      messageType = "text",
      attachments,
      repliedTo,
    } = args;

    // Verify chat exists and user is participant
    const chat = await ctx.db.get(chatId);
    if (!chat || !chat.participantIds.includes(senderId)) {
      throw new Error("Chat not found or user not participant");
    }

    // Create message
    const messageId = await ctx.db.insert("messages", {
      chatId,
      senderId,
      content,
      messageType,
      attachments,
      repliedTo,
      readBy: [senderId], // Mark as read by sender
    });

    // Update chat last message
    await ctx.db.patch(chatId, {
      lastMessage: content,
      lastMessageAt: Date.now(),
    });

    // Update unread counts for other participants
    const otherParticipants = chat.participantIds.filter(
      (id) => id !== senderId
    );
    const updates = otherParticipants.map(async (participantId) => {
      const currentCount = chat.unreadCounts?.[participantId] || 0;
      await ctx.db.patch(chatId, {
        unreadCounts: {
          ...chat.unreadCounts,
          [participantId]: currentCount + 1,
        },
      });
    });

    await Promise.all(updates);

    return messageId;
  },
});

// Get messages for a chat
export const getMessages = query({
  args: {
    chatId: v.optional(v.id("chats")),
  },
  handler: async (ctx, args) => {
    if (!args.chatId) return [];

    // Store in a variable to help TypeScript narrow the type
    const chatId = args.chatId;

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chatId", (q) => q.eq("chatId", chatId))
      .order("desc")
      .take(100);

    return messages.reverse();
  },
});

// Get user's chats
export const getUserChats = query({
  args: {
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    if (!args.userId) return [];

    // Store in a variable to help TypeScript narrow the type
    const userId = args.userId;

    const chats = await ctx.db
      .query("chats")
      .withIndex("by_participants", (q) => q.eq("participantIds", [userId]))
      .collect();

    // Get chat details with participant info
    const chatsWithDetails = await Promise.all(
      chats.map(async (chat) => {
        const participants = await Promise.all(
          chat.participantIds.map((id) => ctx.db.get(id))
        );

        const otherParticipants = participants.filter((p) => p?._id !== userId);
        const chatName =
          chat.type === "direct"
            ? `${otherParticipants[0]?.firstname} ${otherParticipants[0]?.lastname}`.trim() ||
              otherParticipants[0]?.username
            : chat.name;

        return {
          ...chat,
          participants: participants.filter(Boolean),
          displayName: chatName,
          otherParticipants,
          unreadCount: chat.unreadCounts?.[userId] || 0,
        };
      })
    );

    return chatsWithDetails.sort(
      (a, b) => (b.lastMessageAt || 0) - (a.lastMessageAt || 0)
    );
  },
});

// Mark messages as read
export const markAsRead = mutation({
  args: {
    chatId: v.id("chats"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const chat = await ctx.db.get(args.chatId);
    if (!chat) return;

    // Reset unread count for this user
    await ctx.db.patch(args.chatId, {
      unreadCounts: {
        ...chat.unreadCounts,
        [args.userId]: 0,
      },
    });

    // Mark all messages in this chat as read by this user
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chatId", (q) => q.eq("chatId", args.chatId))
      .collect();

    const updatePromises = messages.map(async (message) => {
      if (!message.readBy?.includes(args.userId)) {
        await ctx.db.patch(message._id, {
          readBy: [...(message.readBy || []), args.userId],
        });
      }
    });

    await Promise.all(updatePromises);
  },
});

// Update user presence in chat
export const updatePresence = mutation({
  args: {
    userId: v.id("users"),
    chatId: v.id("chats"),
    isOnline: v.boolean(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("chatPresence")
      .withIndex("by_userId_chatId", (q) =>
        q.eq("userId", args.userId).eq("chatId", args.chatId)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        lastSeen: Date.now(),
        isOnline: args.isOnline,
      });
    } else {
      await ctx.db.insert("chatPresence", {
        userId: args.userId,
        chatId: args.chatId,
        lastSeen: Date.now(),
        isOnline: args.isOnline,
      });
    }
  },
});

// Get online status for chat participants
export const getChatPresence = query({
  args: {
    chatId: v.optional(v.id("chats")),
  },
  handler: async (ctx, args) => {
    if (!args.chatId) return [];

    // Store in a variable to help TypeScript narrow the type
    const chatId = args.chatId;

    const presence = await ctx.db
      .query("chatPresence")
      .withIndex("by_chatId", (q) => q.eq("chatId", chatId))
      .collect();

    return presence;
  },
});
