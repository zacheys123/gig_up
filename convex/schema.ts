// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { userModel } from "./models/userModel";
import { gigModel } from "./models/gigModel";
import { notificationModel } from "./models/notificationsModel"; // Make sure this path is correct
import { notificationSettingsModel } from "./models/notificationSettings";
import { pushSubscriptions } from "./models/push";

export default defineSchema({
  users: userModel,
  gigs: gigModel,
  notifications: notificationModel,
  notificationSettings: notificationSettingsModel,

  // Other tables...
  aiSuggestions: defineTable({
    questions: v.object({
      musician: v.array(v.string()),
      client: v.array(v.string()),
      guest: v.array(v.string()),
    }),
    updatesReady: v.boolean(),
    version: v.string(),
    lastUpdated: v.number(),
  }),
  videos: defineTable({
    title: v.string(),
    url: v.string(),
  }),
  pushSubscriptions: pushSubscriptions,
  chats: defineTable({
    participantIds: v.array(v.id("users")),
    lastMessage: v.optional(v.string()),
    lastMessageAt: v.optional(v.number()),
    unreadCounts: v.optional(v.record(v.id("users"), v.number())), // ← Use document IDs
    type: v.union(v.literal("direct"), v.literal("group")),
    isPinned: v.optional(v.boolean()),
    isArchived: v.optional(v.boolean()),
    name: v.optional(v.string()),
    createdBy: v.id("users"),
  })
    .index("by_participants", ["participantIds"])
    .index("by_lastMessageAt", ["lastMessageAt"]),

  messages: defineTable({
    chatId: v.id("chats"),
    senderId: v.id("users"),
    content: v.string(),
    isDeleted: v.optional(v.boolean()),
    messageType: v.union(
      v.literal("text"),
      v.literal("image"),
      v.literal("file"),
      v.literal("audio")
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
    readBy: v.optional(v.array(v.id("users"))),
    repliedTo: v.optional(v.id("messages")),
  })
    .index("by_chatId", ["chatId"])
    .index("by_senderId", ["senderId"]),
  // Remove the by_chatId_creationTime index entirely

  // For tracking user online status in chats
  chatPresence: defineTable({
    userId: v.id("users"),
    chatId: v.id("chats"),
    lastSeen: v.number(),
    isOnline: v.boolean(),
  })
    .index("by_userId_chatId", ["userId", "chatId"])
    .index("by_chatId", ["chatId"]),
  userPresence: defineTable({
    userId: v.id("users"),
    lastSeen: v.number(),
    isOnline: v.boolean(),
  })
    .index("by_userId", ["userId"])
    .index("by_lastSeen", ["lastSeen"]),
  activeChatSessions: defineTable({
    userId: v.id("users"), // User who has the chat open
    chatId: v.id("chats"), // Chat that is currently open
    lastActive: v.number(), // Timestamp of last activity
  })
    .index("by_user_id", ["userId"])
    .index("by_chat_id", ["chatId"])
    .index("by_user_and_chat", ["userId", "chatId"]),
});
