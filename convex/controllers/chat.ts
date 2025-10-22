// convex/controllers/chat.ts - Fixed version
import { query, mutation, action } from "../_generated/server";
import { v } from "convex/values";
import { Id } from "../_generated/dataModel";
import { api } from "../_generated/api";
import { createMessageNotifications } from "../createNotificationInternal";

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
// In your getOrCreateDirectChat function - add logging
export const getOrCreateDirectChat = mutation({
  args: {
    user1Id: v.id("users"),
    user2Id: v.id("users"),
  },
  handler: async (ctx, args) => {
    const { user1Id, user2Id } = args;

    console.log("Creating chat between:", user1Id, user2Id);

    // Sort IDs to ensure consistent chat creation
    const participantIds = [user1Id, user2Id].sort();
    console.log("Participant IDs:", participantIds);

    // Check if chat already exists
    const existingChat = await ctx.db
      .query("chats")
      .withIndex("by_participants", (q) =>
        q.eq("participantIds", participantIds)
      )
      .first();

    if (existingChat) {
      console.log("Found existing chat:", existingChat._id);
      return existingChat._id;
    }

    // Create new chat
    console.log("Creating new chat...");
    const chatId = await ctx.db.insert("chats", {
      participantIds,
      type: "direct",
      createdBy: user1Id,
      lastMessageAt: Date.now(),
      unreadCounts: {},
    });

    console.log("Created chat:", chatId);
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

    // Get sender details for notification
    const sender = await ctx.db.get(senderId);
    if (!sender) throw new Error("Sender not found");

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

    // ✅ CREATE NOTIFICATIONS FOR OTHER PARTICIPANTS (only if they don't have chat open)
    try {
      await createMessageNotifications(ctx, {
        chat,
        sender,
        messageContent: content,
        messageType,
        otherParticipants: chat.participantIds.filter((id) => id !== senderId),
      });
    } catch (notificationError) {
      console.error(
        "Failed to create message notifications:",
        notificationError
      );
      // Don't throw - we don't want message sending to fail if notifications fail
    }

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

// In convex/controllers/chat.ts - getUserChats
export const getUserChats = query({
  args: {
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    if (!args.userId) return [];

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

        // ✅ Make sure unreadCount is calculated properly
        const unreadCount = chat.unreadCounts?.[userId] || 0;

        return {
          ...chat,
          participants: participants.filter(Boolean),
          displayName: chatName,
          otherParticipants,
          unreadCount, // ✅ This is important for fallback
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

// Add these to your existing chat.ts file

// Get unread counts for a user
// In convex/controllers/chat.ts - getUnreadCounts
export const getUnreadCounts = query({
  args: {
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    if (!args.userId) {
      console.log("No user ID provided");
      return { total: 0, byChat: {} };
    }

    const chats = await ctx.db
      .query("chats")
      .withIndex("by_participants", (q) =>
        q.eq("participantIds", [args.userId!])
      )
      .collect();

    console.log("Found chats for user:", chats.length);

    let total = 0;
    const byChat: Record<string, number> = {};

    chats.forEach((chat) => {
      const count = chat.unreadCounts?.[args.userId!] || 0;
      byChat[chat._id] = count;
      total += count;
    });

    console.log("Calculated unread counts:", { total, byChat });

    return { total, byChat };
  },
});

// Mark all chats as read for a user
export const markAllAsRead = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const chats = await ctx.db
      .query("chats")
      .withIndex("by_participants", (q) =>
        q.eq("participantIds", [args.userId])
      )
      .collect();

    // Reset unread counts for all chats
    const updatePromises = chats.map(async (chat) => {
      await ctx.db.patch(chat._id, {
        unreadCounts: {
          ...chat.unreadCounts,
          [args.userId]: 0,
        },
      });
    });

    await Promise.all(updatePromises);
  },
});

// Delete a message
export const deleteMessage = mutation({
  args: {
    messageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    // Soft delete by setting content to "[deleted]"
    await ctx.db.patch(args.messageId, {
      content: "[deleted]",
      isDeleted: true,
    });
  },
});

// Clear all messages in a chat
export const clearChat = mutation({
  args: {
    chatId: v.id("chats"),
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chatId", (q) => q.eq("chatId", args.chatId))
      .collect();

    // Delete all messages
    const deletePromises = messages.map((message) =>
      ctx.db.delete(message._id)
    );

    await Promise.all(deletePromises);

    // Reset chat last message
    await ctx.db.patch(args.chatId, {
      lastMessage: "",
      lastMessageAt: Date.now(),
    });
  },
});

// convex/chat.ts
export const createActiveChatSession = mutation({
  args: {
    userId: v.id("users"),
    chatId: v.id("chats"),
  },
  handler: async (ctx, args) => {
    const { userId, chatId } = args;

    // Check if session already exists
    const existingSession = await ctx.db
      .query("activeChatSessions")
      .withIndex("by_user_and_chat", (q) =>
        q.eq("userId", userId).eq("chatId", chatId)
      )
      .first();

    if (existingSession) {
      // Update lastActive if session exists
      await ctx.db.patch(existingSession._id, {
        lastActive: Date.now(),
      });
      return existingSession._id;
    }

    // Create new session
    const sessionId = await ctx.db.insert("activeChatSessions", {
      userId,
      chatId,
      lastActive: Date.now(),
    });

    return sessionId;
  },
});

export const deleteActiveChatSession = mutation({
  args: {
    userId: v.id("users"),
    chatId: v.id("chats"),
  },
  handler: async (ctx, args) => {
    const { userId, chatId } = args;

    const session = await ctx.db
      .query("activeChatSessions")
      .withIndex("by_user_and_chat", (q) =>
        q.eq("userId", userId).eq("chatId", chatId)
      )
      .first();

    if (session) {
      await ctx.db.delete(session._id);
      return true;
    }

    return false;
  },
});
// convex/chat.ts
export const updateActiveSession = mutation({
  args: {
    userId: v.id("users"),
    chatId: v.id("chats"),
  },
  handler: async (ctx, args) => {
    const { userId, chatId } = args;

    const session = await ctx.db
      .query("activeChatSessions")
      .withIndex("by_user_and_chat", (q) =>
        q.eq("userId", userId).eq("chatId", chatId)
      )
      .first();

    if (session) {
      await ctx.db.patch(session._id, {
        lastActive: Date.now(),
      });
      return true;
    }

    return false;
  },
});

// In convex/controllers/chat.ts - Add this temporary query
export const getAllChatsDebug = query({
  handler: async (ctx) => {
    const allChats = await ctx.db.query("chats").collect();
    console.log("ALL CHATS:", allChats);

    // Also log all users
    const allUsers = await ctx.db.query("users").collect();
    console.log(
      "ALL USERS:",
      allUsers.map((u) => ({ id: u._id, name: u.firstname }))
    );

    return allChats;
  },
});
