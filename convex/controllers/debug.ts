import { v } from "convex/values";
import { mutation, query } from "../_generated/server";

export const testSendMessage = mutation({
  args: {
    chatId: v.id("chats"),
    senderId: v.id("users"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert("messages", {
      chatId: args.chatId,
      senderId: args.senderId,
      content: args.content,
      messageType: "text",
      attachments: [],
      repliedTo: undefined,
      readBy: [args.senderId],
      deliveredTo: [args.senderId], // ✅ ADD THIS - REQUIRED
      status: "sent", // ✅ ADD THIS - REQUIRED
      isDeleted: false, // ✅ ADD THIS - REQUIRED
    });

    // Update chat last message
    await ctx.db.patch(args.chatId, {
      lastMessage: args.content,
      lastMessageAt: Date.now(),
    });

    return messageId;
  },
});

// convex/debugChats.ts
export const debugGetUserChatsRaw = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    console.log("🔍 DEBUG: Getting RAW chats data for user:", args.userId);

    const allChats = await ctx.db.query("chats").collect();
    const userChats = allChats.filter((chat) =>
      chat.participantIds.includes(args.userId)
    );

    console.log(
      "📊 DEBUG: Raw user chats from DB:",
      userChats.map((chat) => ({
        id: chat._id,
        unreadCounts: chat.unreadCounts,
        participantIds: chat.participantIds,
        currentUserUnread: chat.unreadCounts?.[args.userId] || 0,
      }))
    );

    return userChats;
  },
});
