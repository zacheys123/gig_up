// convex/bandChats.ts - CONTINUED
import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { getUserByClerkId } from "./bookings";
import { Id } from "../_generated/dataModel";
import { createNotificationInternal } from "../createNotificationInternal";

// Get band chat for a gig
export const getBandChat = query({
  args: { gigId: v.id("gigs") },
  handler: async (ctx, args) => {
    const gig = await ctx.db.get(args.gigId);
    if (!gig?.bandChatId) return null;

    const chat = await ctx.db.get(gig.bandChatId);
    if (!chat) return null;

    // Get last few messages
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chatId", (q) => q.eq("chatId", chat._id))
      .order("desc")
      .take(50);

    // Get participant details
    const participants = await Promise.all(
      chat.participantIds.map(async (userId: Id<"users">) => {
        const user = await ctx.db.get(userId);
        if (!user) return null;

        // For band gigs, get the user's role
        let role = "Member";
        if (gig.isClientBand && gig.bandCategory) {
          for (const bandRole of gig.bandCategory) {
            if (bandRole.bookedUsers?.includes(userId)) {
              role = bandRole.role;
              break;
            }
          }
        }

        return {
          _id: user._id,
          firstname: user.firstname,
          username: user.username,
          picture: user.picture,
          roleType: user.roleType,
          bandRole: role,
          isClient: gig.postedBy === user._id,
        };
      })
    );

    return {
      chat: {
        ...chat,
        participants: participants.filter(Boolean),
      },
      messages: messages.reverse(),
      gigInfo: {
        title: gig.title,
        date: gig.date,
        location: gig.location,
        clientRole: gig.crewChatSettings?.clientRole || "member",
      },
      permissions: gig.crewChatSettings?.chatPermissions || {
        canSendMessages: true,
        canAddMembers: false,
        canRemoveMembers: false,
        canEditChatInfo: false,
      },
    };
  },
});

// Add musician to band chat (for when new musicians get booked)
export const addToBandChat = mutation({
  args: {
    gigId: v.id("gigs"),
    musicianId: v.id("users"),
    clerkId: v.string(), // Client's Clerk ID
  },
  handler: async (ctx, args) => {
    const client = await getUserByClerkId(ctx, args.clerkId);
    const gig = await ctx.db.get(args.gigId);

    if (!gig) throw new Error("Gig not found");
    if (gig.postedBy !== client._id) {
      throw new Error("Only band creator can add to chat");
    }

    const chat = gig.bandChatId ? await ctx.db.get(gig.bandChatId) : null;
    if (!chat) {
      throw new Error("Band chat not created yet");
    }

    // Check if user is already in chat
    if (chat.participantIds.includes(args.musicianId)) {
      return { success: true, alreadyInChat: true };
    }

    // Get musician details
    const musician = await ctx.db.get(args.musicianId);
    if (!musician) throw new Error("Musician not found");

    // Get musician's role in the band
    let musicianRole = "Musician";
    if (gig.bandCategory) {
      for (const role of gig.bandCategory) {
        if (role.bookedUsers?.includes(args.musicianId)) {
          musicianRole = role.role;
          break;
        }
      }
    }

    // Add musician to chat participants
    const updatedParticipantIds = [...chat.participantIds, args.musicianId];
    await ctx.db.patch(chat._id, {
      participantIds: updatedParticipantIds,
      lastMessage: `${musician.firstname || musician.username} joined the crew`,
      lastMessageAt: Date.now(),
    });

    // Add system message
    await ctx.db.insert("messages", {
      chatId: chat._id,
      senderId: client._id,
      content: `${musician.firstname || musician.username} has joined the crew as ${musicianRole}!`,
      messageType: "text",
      attachments: [],
      readBy: [],
      deliveredTo: updatedParticipantIds,
      status: "sent",
      isDeleted: false,
    });

    // Update chat metadata if needed
    if (chat.metadata) {
      await ctx.db.patch(chat._id, {
        metadata: {
          ...chat.metadata,
          lastUpdated: Date.now(),
        },
      });
    }

    // Instead of "added_to_crew_chat", use "band_joined"
    await createNotificationInternal(ctx, {
      userDocumentId: args.musicianId,
      type: "band_joined",
      title: "👋 Welcome to Crew Chat!",
      message: `You've been added to the crew chat for "${gig.title}"`,
      actionUrl: `/chat/${chat._id}`,
      relatedUserDocumentId: client._id,
      metadata: {
        gigId: gig._id,
        gigTitle: gig.title,
        chatId: chat._id,
      },
    });

    return { success: true };
  },
});

// Remove musician from band chat
export const removeFromBandChat = mutation({
  args: {
    gigId: v.id("gigs"),
    musicianId: v.id("users"),
    clerkId: v.string(), // Client's Clerk ID
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const client = await getUserByClerkId(ctx, args.clerkId);
    const gig = await ctx.db.get(args.gigId);

    if (!gig) throw new Error("Gig not found");

    // Check permissions
    const canRemove = await checkRemovePermission(ctx, gig, client._id);
    if (!canRemove) {
      throw new Error("Not authorized to remove members from chat");
    }

    const chat = gig.bandChatId ? await ctx.db.get(gig.bandChatId) : null;
    if (!chat) {
      throw new Error("Band chat not found");
    }

    // Check if user is in the chat
    if (!chat.participantIds.includes(args.musicianId)) {
      return { success: true, notInChat: true };
    }

    // Don't allow removing the client/creator
    if (args.musicianId === gig.postedBy) {
      throw new Error("Cannot remove the chat creator");
    }

    // Remove musician from chat participants
    const updatedParticipantIds = chat.participantIds.filter(
      (id) => id !== args.musicianId
    );

    await ctx.db.patch(chat._id, {
      participantIds: updatedParticipantIds,
      lastMessage: `${args.musicianId === client._id ? "You" : "A member"} left the crew`,
      lastMessageAt: Date.now(),
    });

    // Add system message
    const musician = await ctx.db.get(args.musicianId);
    await ctx.db.insert("messages", {
      chatId: chat._id,
      senderId: client._id,
      content: `${musician?.firstname || musician?.username || "A member"} has left the crew chat${args.reason ? ` (${args.reason})` : ""}.`,
      messageType: "text",
      attachments: [],
      readBy: [],
      deliveredTo: updatedParticipantIds,
      status: "sent",
      isDeleted: false,
    });

    // Instead of "removed_from_crew_chat", use "removed_from_band"
    await createNotificationInternal(ctx, {
      userDocumentId: args.musicianId,
      type: "removed_from_band",
      title: "👋 Removed from Crew Chat",
      message: `You've been removed from the crew chat for "${gig.title}"${args.reason ? ` (Reason: ${args.reason})` : ""}`,
      actionUrl: `/gigs/${gig._id}`,
      relatedUserDocumentId: client._id,
      metadata: {
        gigId: gig._id,
        gigTitle: gig.title,
        reason: args.reason,
      },
    });

    return { success: true };
  },
});

// Helper: Check if user can remove members
const checkRemovePermission = async (
  ctx: any,
  gig: any,
  userId: Id<"users">
) => {
  // Client can remove if they're admin
  if (gig.postedBy === userId) {
    return (
      gig.crewChatSettings?.clientRole === "admin" &&
      gig.crewChatSettings?.chatPermissions?.canRemoveMembers
    );
  }
  return false;
};

// Update crew chat settings
export const updateCrewChatSettings = mutation({
  args: {
    gigId: v.id("gigs"),
    clerkId: v.string(),
    settings: v.object({
      clientRole: v.optional(v.union(v.literal("admin"), v.literal("member"))),
      chatPermissions: v.optional(
        v.object({
          canSendMessages: v.optional(v.boolean()),
          canAddMembers: v.optional(v.boolean()),
          canRemoveMembers: v.optional(v.boolean()),
          canEditChatInfo: v.optional(v.boolean()),
        })
      ),
    }),
  },
  handler: async (ctx, args) => {
    const client = await getUserByClerkId(ctx, args.clerkId);
    const gig = await ctx.db.get(args.gigId);

    if (!gig) throw new Error("Gig not found");
    if (gig.postedBy !== client._id) {
      throw new Error("Only band creator can update chat settings");
    }

    if (!gig.bandChatId) {
      throw new Error("Crew chat not created yet");
    }

    // Build updated settings
    const currentSettings = gig.crewChatSettings || {
      clientRole: "member",
      chatPermissions: {
        canSendMessages: true,
        canAddMembers: false,
        canRemoveMembers: false,
        canEditChatInfo: false,
      },
      createdBy: client._id,
      createdAt: Date.now(),
    };

    const updatedSettings = {
      ...currentSettings,
      ...args.settings,
      chatPermissions: {
        ...currentSettings.chatPermissions,
        ...(args.settings.chatPermissions || {}),
      },
    };

    // Update gig settings
    await ctx.db.patch(gig._id, {
      crewChatSettings: updatedSettings,
      updatedAt: Date.now(),
    });

    // Update chat metadata if chat exists
    const chat = await ctx.db.get(gig.bandChatId);
    if (chat) {
      await ctx.db.patch(chat._id, {
        metadata: {
          ...chat.metadata,
          clientRole: updatedSettings.clientRole,
          permissions: updatedSettings.chatPermissions,
        },
      });

      // Add system message about settings change
      await ctx.db.insert("messages", {
        chatId: chat._id,
        senderId: client._id,
        content: `Chat settings updated. Client is now ${updatedSettings.clientRole}.`,
        messageType: "text",
        attachments: [],
        readBy: [],
        deliveredTo: chat.participantIds,
        status: "sent",
        isDeleted: false,
      });
    }

    return { success: true, settings: updatedSettings };
  },
});

// Get all crew chats for a user
export const getUserCrewChats = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await getUserByClerkId(ctx, args.clerkId);
    if (!user) return [];

    // Find all chats where user is a participant and is a crew chat
    const allChats = await ctx.db
      .query("chats")
      .filter((q) => q.eq(q.field("type"), "group"))
      .collect();

    const crewChats = [];

    for (const chat of allChats) {
      // Check if this is a crew chat
      if (chat.metadata?.isCrewChat && chat.participantIds.includes(user._id)) {
        // Get gig info
        const gig = await ctx.db
          .query("gigs")
          .withIndex("by_bandChatId", (q) => q.eq("bandChatId", chat._id))
          .first();

        if (gig) {
          // Get unread count
          const unreadCount = chat.unreadCounts?.[user._id] || 0;

          // Get last message
          const lastMessage = await ctx.db
            .query("messages")
            .withIndex("by_chatId", (q) => q.eq("chatId", chat._id))
            .order("desc")
            .first();

          crewChats.push({
            chatId: chat._id,
            name: chat.name,
            gigTitle: gig.title,
            gigId: gig._id,
            lastMessage: lastMessage?.content || chat.lastMessage,
            lastMessageAt: lastMessage?._creationTime || chat.lastMessageAt,
            unreadCount,
            participantCount: chat.participantIds.length,
            clientRole: gig.crewChatSettings?.clientRole || "member",
            isClient: gig.postedBy === user._id,
          });
        }
      }
    }

    // Sort by most recent activity
    return crewChats.sort(
      (a: any, b: any) => b.lastMessageAt - a.lastMessageAt
    );
  },
});

// Check if crew chat can be created for a gig
export const canCreateCrewChat = query({
  args: { gigId: v.id("gigs"), clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await getUserByClerkId(ctx, args.clerkId);
    const gig = await ctx.db.get(args.gigId);

    if (!gig || !user) {
      return { canCreate: false, reason: "Gig or user not found" };
    }

    // Check if user is gig creator
    if (gig.postedBy !== user._id) {
      return {
        canCreate: false,
        reason: "Only gig creator can create crew chat",
      };
    }

    // Check if it's a band gig
    if (!gig.isClientBand) {
      return { canCreate: false, reason: "Not a band gig" };
    }

    // Check if chat already exists
    if (gig.bandChatId) {
      const existingChat = await ctx.db.get(gig.bandChatId);
      if (existingChat) {
        return {
          canCreate: false,
          reason: "Crew chat already exists",
          chatId: gig.bandChatId,
          alreadyExists: true,
        };
      }
    }

    // Check if all roles are filled
    if (!gig.bandCategory || gig.bandCategory.length === 0) {
      return { canCreate: false, reason: "No band roles defined" };
    }

    const allRolesFilled = gig.bandCategory.every(
      (role: any) => role.filledSlots >= role.maxSlots
    );

    if (!allRolesFilled) {
      const unfilledRoles = gig.bandCategory
        .filter((role: any) => role.filledSlots < role.maxSlots)
        .map((role: any) => role.role);

      return {
        canCreate: false,
        reason: "All roles must be filled",
        unfilledRoles,
      };
    }

    // Check if there are any booked musicians
    const hasBookedMusicians = gig.bandCategory.some(
      (role: any) => role.bookedUsers && role.bookedUsers.length > 0
    );

    if (!hasBookedMusicians) {
      return { canCreate: false, reason: "No musicians booked yet" };
    }

    return {
      canCreate: true,
      musicianCount: gig.bandCategory.reduce(
        (total: number, role: any) => total + (role.bookedUsers?.length || 0),
        0
      ),
    };
  },
});
