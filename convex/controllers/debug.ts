import { v } from "convex/values";
import { mutation, query } from "../_generated/server";

// convex/debugChats.ts - Add this test mutation
export const testSendMessage = mutation({
  args: {
    chatId: v.id("chats"),
    senderId: v.id("users"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    console.log("🧪 TEST: Sending message to debug unread counts");

    const chat = await ctx.db.get(args.chatId);
    console.log("📊 BEFORE - Chat unreadCounts:", chat?.unreadCounts);
    console.log("👥 Participants:", chat?.participantIds);

    // Call the actual sendMessage
    const messageId = await ctx.db.insert("messages", {
      chatId: args.chatId,
      senderId: args.senderId,
      content: args.content,
      messageType: "text",
      readBy: [args.senderId],
    });

    console.log("✅ Message created:", messageId);

    // Update unread counts manually to be sure
    const otherParticipants = chat!.participantIds.filter(
      (id) => id !== args.senderId
    );

    console.log("🎯 Other participants:", otherParticipants);

    const updates = otherParticipants.map(async (participantId) => {
      const currentCount = chat!.unreadCounts?.[participantId] || 0;
      const newCount = currentCount + 1;

      console.log(
        `📈 Updating ${participantId}: ${currentCount} → ${newCount}`
      );

      await ctx.db.patch(args.chatId, {
        unreadCounts: {
          ...chat!.unreadCounts,
          [participantId]: newCount,
        },
      });
    });

    await Promise.all(updates);

    // Verify
    const updatedChat = await ctx.db.get(args.chatId);
    console.log("📊 AFTER - Updated unreadCounts:", updatedChat?.unreadCounts);

    return { messageId, unreadCounts: updatedChat?.unreadCounts };
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
