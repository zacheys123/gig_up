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
// In convex/controllers/chat.ts - Add detailed logging to sendMessage
// convex/controllers/chat.ts - Enhanced sendMessage
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

    console.log("💌 Sending message to chat:", chatId);

    // Verify chat exists and user is participant
    const chat = await ctx.db.get(chatId);
    if (!chat || !chat.participantIds.includes(senderId)) {
      console.log("❌ Chat not found or user not participant");
      throw new Error("Chat not found or user not participant");
    }

    // Get sender details
    const sender = await ctx.db.get(senderId);
    if (!sender) throw new Error("Sender not found");

    // Create message with initial status
    const messageId = await ctx.db.insert("messages", {
      chatId,
      senderId,
      content,
      messageType,
      attachments: attachments || [],
      repliedTo,
      readBy: [senderId], // Mark as read by sender immediately
      deliveredTo: [senderId], // ✅ ADD THIS - Mark as delivered to sender
      status: "sent", // ✅ ADD THIS - Initial status
      isDeleted: false, // ✅ ADD THIS - Default value
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
      const newCount = currentCount + 1;

      await ctx.db.patch(chatId, {
        unreadCounts: {
          ...chat.unreadCounts,
          [participantId]: newCount,
        },
      });
    });

    await Promise.all(updates);

    // Return message ID for potential real-time delivery tracking
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

// convex/controllers/chat.ts - COMPLETELY REWRITTEN getUserChats
// convex/controllers/chat.ts - Enhanced getUserChats
export const getUserChats = query({
  args: {
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    if (!args.userId) return [];

    const allChats = await ctx.db.query("chats").collect();
    const userChats = allChats.filter(
      (chat) =>
        chat.participantIds && chat.participantIds.includes(args.userId!)
    );

    const chatsWithDetails = await Promise.all(
      userChats.map(async (chat) => {
        const participants = await Promise.all(
          chat.participantIds.map((id) => ctx.db.get(id))
        );

        const validParticipants = participants.filter(Boolean);
        const otherParticipants = validParticipants.filter(
          (p) => p?._id !== args.userId
        );

        // Get the actual last message for more context
        const lastMessages = await ctx.db
          .query("messages")
          .withIndex("by_chatId", (q) => q.eq("chatId", chat._id))
          .order("desc")
          .first();

        return {
          ...chat,
          participants: validParticipants,
          displayName:
            chat.type === "direct" && otherParticipants.length > 0
              ? `${otherParticipants[0]?.firstname} ${otherParticipants[0]?.lastname}`.trim()
              : chat.name || "Unknown User",
          otherParticipants,
          unreadCount: chat.unreadCounts?.[args.userId!] || 0,
          lastMessageWithSender: lastMessages
            ? {
                content: lastMessages.content,
                senderId: lastMessages.senderId,
                messageType: lastMessages.messageType,
                timestamp: lastMessages._creationTime,
              }
            : null,
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

// Update user presence (call this when user performs any action)

// Start typing indicator
export const startTyping = mutation({
  args: {
    chatId: v.id("chats"),
    userId: v.id("users"),
  },
  handler: async (ctx, { chatId, userId }) => {
    const existing = await ctx.db
      .query("typingIndicators")
      .withIndex("by_chat_user", (q) =>
        q.eq("chatId", chatId).eq("userId", userId)
      )
      .first();

    const now = Date.now();

    if (existing) {
      // Update existing typing indicator
      await ctx.db.patch(existing._id, {
        isTyping: true,
        lastUpdated: now,
      });
    } else {
      // Create new typing indicator
      await ctx.db.insert("typingIndicators", {
        chatId,
        userId,
        isTyping: true,
        lastUpdated: now,
      });
    }

    return { success: true };
  },
});

// Stop typing indicator
export const stopTyping = mutation({
  args: {
    chatId: v.id("chats"),
    userId: v.id("users"),
  },
  handler: async (ctx, { chatId, userId }) => {
    const existing = await ctx.db
      .query("typingIndicators")
      .withIndex("by_chat_user", (q) =>
        q.eq("chatId", chatId).eq("userId", userId)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        isTyping: false,
        lastUpdated: Date.now(),
      });
    }

    return { success: true };
  },
});

// Clean up expired typing indicators (older than 3 seconds)
export const cleanupTypingIndicators = mutation({
  args: {},
  handler: async (ctx) => {
    const typingIndicators = await ctx.db.query("typingIndicators").collect();

    const now = Date.now();
    const expired = typingIndicators.filter(
      (indicator) => now - indicator.lastUpdated > 3000
    );

    for (const indicator of expired) {
      await ctx.db.delete(indicator._id);
    }

    return { cleaned: expired.length };
  },
});

// Get active typing users for a chat
export const getTypingUsers = query({
  args: {
    chatId: v.id("chats"),
  },
  handler: async (ctx, { chatId }) => {
    const now = Date.now();
    const typingIndicators = await ctx.db
      .query("typingIndicators")
      .withIndex("by_chat", (q) => q.eq("chatId", chatId))
      .collect();

    // Filter active typing indicators (updated in last 3 seconds and isTyping: true)
    const activeTyping = typingIndicators.filter(
      (indicator) => indicator.isTyping && now - indicator.lastUpdated < 3000
    );

    // Get user details for active typers
    const typingUsers = await Promise.all(
      activeTyping.map(async (indicator) => {
        const user = await ctx.db.get(indicator.userId);
        return user;
      })
    );

    return typingUsers.filter(Boolean);
  },
});

// convex/controllers/chat.ts - Add message status mutations
// convex/controllers/chat.ts - FIXED markMessageAsDelivered
export const markMessageAsDelivered = mutation({
  args: {
    messageId: v.id("messages"),
    userId: v.id("users"),
  },
  handler: async (ctx, { messageId, userId }) => {
    const message = await ctx.db.get(messageId);
    if (!message) throw new Error("Message not found");

    // Add user to deliveredTo array if not already there
    if (!message.deliveredTo.includes(userId)) {
      const updatedDeliveredTo = [...message.deliveredTo, userId];

      await ctx.db.patch(messageId, {
        deliveredTo: updatedDeliveredTo,
      });

      // Update status to "delivered" if all participants have received it
      const chat = await ctx.db.get(message.chatId);
      if (chat) {
        const allParticipantsDelivered = chat.participantIds.every(
          (id) => updatedDeliveredTo.includes(id) // Use the UPDATED array
        );

        if (allParticipantsDelivered && message.status === "sent") {
          await ctx.db.patch(messageId, {
            status: "delivered",
          });
        }
      }
    }

    return { success: true };
  },
});

// Mark message as read by a user
// convex/controllers/chat.ts - FIXED markMessageAsRead
export const markMessageAsRead = mutation({
  args: {
    messageId: v.id("messages"),
    userId: v.id("users"),
  },
  handler: async (ctx, { messageId, userId }) => {
    const message = await ctx.db.get(messageId);
    if (!message) throw new Error("Message not found");

    // Add user to readBy array if not already there
    if (!message.readBy.includes(userId)) {
      const updatedReadBy = [...message.readBy, userId];

      await ctx.db.patch(messageId, {
        readBy: updatedReadBy,
      });

      // Update status to "read" if all participants have read it
      const chat = await ctx.db.get(message.chatId);
      if (chat) {
        const allParticipantsRead = chat.participantIds.every(
          (id) => updatedReadBy.includes(id) // Use the UPDATED array
        );

        if (allParticipantsRead) {
          await ctx.db.patch(messageId, {
            status: "read",
          });
        }
      }

      // Update chat unread count
      const currentCount = chat?.unreadCounts?.[userId] || 0;
      if (currentCount > 0) {
        await ctx.db.patch(message.chatId, {
          unreadCounts: {
            ...chat?.unreadCounts,
            [userId]: currentCount - 1,
          },
        });
      }
    }

    return { success: true };
  },
});

// Mark all messages in chat as read
export const markAllMessagesAsRead = mutation({
  args: {
    chatId: v.id("chats"),
    userId: v.id("users"),
  },
  handler: async (ctx, { chatId, userId }) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chatId", (q) => q.eq("chatId", chatId))
      .collect();

    const updatePromises = messages.map(async (message) => {
      if (!message.readBy.includes(userId)) {
        await ctx.db.patch(message._id, {
          readBy: [...message.readBy, userId],
          status: message.status === "delivered" ? "read" : message.status,
        });
      }
    });

    await Promise.all(updatePromises);

    // Reset unread count for this user
    const chat = await ctx.db.get(chatId);
    if (chat) {
      await ctx.db.patch(chatId, {
        unreadCounts: {
          ...chat.unreadCounts,
          [userId]: 0,
        },
      });
    }

    return { success: true };
  },
});

// convex/controllers/chat.ts - Add this mutation
export const bulkMarkMessagesAsRead = mutation({
  args: {
    messageIds: v.array(v.id("messages")),
    userId: v.id("users"),
  },
  handler: async (ctx, { messageIds, userId }) => {
    console.log(
      `📚 Bulk marking ${messageIds.length} messages as read for user:`,
      userId
    );

    const updates = messageIds.map(async (messageId) => {
      const message = await ctx.db.get(messageId);
      if (message && !message.readBy.includes(userId)) {
        const updatedReadBy = [...message.readBy, userId];

        await ctx.db.patch(messageId, {
          readBy: updatedReadBy,
        });

        // Update status to "read" if all participants have read it
        const chat = await ctx.db.get(message.chatId);
        if (chat) {
          const allParticipantsRead = chat.participantIds.every((id) =>
            updatedReadBy.includes(id)
          );

          if (allParticipantsRead) {
            await ctx.db.patch(messageId, {
              status: "read",
            });
          }
        }
      }
    });

    await Promise.all(updates);
    return { success: true, count: messageIds.length };
  },
});
