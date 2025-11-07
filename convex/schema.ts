// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { userModel } from "./models/userModel";
import { gigModel } from "./models/gigModel";
import { notificationModel } from "./models/notificationsModel"; // Make sure this path is correct
import { notificationSettingsModel } from "./models/notificationSettings";
import { pushSubscriptions } from "./models/push";
import { videoModel } from "./models/videoModel";
import { commentsModel } from "./models/commentsModel";
import { instantGigs, instantGigsTemplate } from "./models/instanGigsModel";

export default defineSchema({
  users: userModel,
  gigs: gigModel,
  notifications: notificationModel,
  notificationSettings: notificationSettingsModel,
  instantgigs: instantGigs,
  instantGigsTemplate: instantGigsTemplate,
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
  videos: videoModel,
  comments: commentsModel,
  pushSubscriptions: pushSubscriptions,
  chats: defineTable({
    participantIds: v.array(v.id("users")),
    lastMessage: v.optional(v.string()),
    lastMessageAt: v.optional(v.number()),
    unreadCounts: v.optional(v.record(v.string(), v.number())), // ← Use document IDs
    type: v.union(v.literal("direct"), v.literal("group")),
    isPinned: v.optional(v.boolean()),
    isArchived: v.optional(v.boolean()),
    name: v.optional(v.string()),
    createdBy: v.id("users"),
  })
    .index("by_participants", ["participantIds"])
    .index("by_lastMessageAt", ["lastMessageAt"]),

  // In your convex/schema.ts - Make fields optional
  // convex/schema.ts - Update messages table
  messages: defineTable({
    chatId: v.id("chats"),
    senderId: v.id("users"),
    content: v.string(),
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
    repliedTo: v.optional(v.id("messages")),
    readBy: v.array(v.id("users")),
    deliveredTo: v.array(v.id("users")), // Remove optional
    status: v.union(
      // Remove optional
      v.literal("sent"),
      v.literal("delivered"),
      v.literal("read")
    ),
    isDeleted: v.boolean(),
    _creationTime: v.number(),
  })
    .index("by_chatId", ["chatId"])
    .index("by_senderId", ["senderId"]),

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
  // convex/schema.ts - Add this table
  typingIndicators: defineTable({
    chatId: v.id("chats"),
    userId: v.id("users"),
    isTyping: v.boolean(),
    lastUpdated: v.number(),
    _creationTime: v.number(),
  }) // convex/schema.ts - Add these indexes
    .index("by_chat_user", ["chatId", "userId"]) // For typingIndicators
    .index("by_chat", ["chatId"]) // For typingIndicators
    .index("by_lastUpdated", ["lastUpdated"]), // For cleanup
  connections: defineTable({
    user1Id: v.id("users"),
    user2Id: v.id("users"),
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("rejected"),
      v.literal("blocked")
    ),
    initiatedBy: v.id("users"),
    createdAt: v.number(),
    acceptedAt: v.optional(v.number()),
  })
    .index("by_user1", ["user1Id"])
    .index("by_user2", ["user2Id"])
    .index("by_user_pair", ["user1Id", "user2Id"]),
});
