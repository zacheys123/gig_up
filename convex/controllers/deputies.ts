// convex/deputies.ts
import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { createNotificationInternal } from "../createNotificationInternal";
import { getUserNotificationStatus } from "../notHelpers";

export const sendDeputyRequest = mutation({
  args: {
    principalId: v.id("users"),
    deputyId: v.id("users"),
    forMySkill: v.string(),
    gigType: v.optional(v.string()),
    note: v.optional(v.string()),
    isViewerInGracePeriod: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const {
      principalId,
      deputyId,
      forMySkill,
      gigType,
      note,
      isViewerInGracePeriod,
    } = args;

    console.log("🔍 [DEPUTY REQUEST] Starting with args:", {
      principalId,
      deputyId,
      forMySkill,
      gigType,
      isViewerInGracePeriod,
    });

    const [principal, deputy] = await Promise.all([
      ctx.db.get(principalId),
      ctx.db.get(deputyId),
    ]);

    if (!principal || !deputy) {
      console.error("❌ [DEPUTY REQUEST] User not found:", {
        principalId,
        deputyId,
      });
      throw new Error("User not found");
    }

    // Enhanced debugging with helper functions
    console.log(
      "💰 [DEPUTY REQUEST] Principal status:",
      getUserNotificationStatus(principal)
    );
    console.log(
      "💰 [DEPUTY REQUEST] Deputy status:",
      getUserNotificationStatus(deputy)
    );

    // Check if request already exists
    const existingRequest = deputy.backUpFor?.find(
      (rel) => rel.principalUserId === principalId
    );

    if (existingRequest) {
      console.log("⚠️ [DEPUTY REQUEST] Request already exists");
      throw new Error("Deputy request already sent");
    }

    // Create request data
    const requestData = {
      principalUserId: principalId,
      forTheirSkill: forMySkill,
      gigType: gigType || undefined,
      status: "pending" as const,
      dateAdded: Date.now(),
    };

    // Update deputy's backUpFor array
    const updatedDeputyBackUpFor = [...(deputy.backUpFor || []), requestData];

    await ctx.db.patch(deputyId, {
      backUpFor: updatedDeputyBackUpFor,
    });

    console.log("✅ [DEPUTY REQUEST] Request saved to database");

    // Create notification for the deputy
    console.log("🔔 [DEPUTY REQUEST] Creating notification...");
    const notificationResult = await createNotificationInternal(ctx, {
      userDocumentId: deputyId,
      type: "gig_invite",
      title: "Deputy Request",
      message: `${principal.firstname || principal.username} wants you as their ${forMySkill} deputy${gigType ? ` for ${gigType} gigs` : ""}`,
      image: principal.picture,
      actionUrl: `/community?tab=requests`,
      relatedUserDocumentId: principalId,
      isViewerInGracePeriod,
      metadata: {
        principalDocumentId: principalId.toString(),
        principalClerkId: principal.clerkId,
        principalName: principal.firstname,
        principalUsername: principal.username,
        principalPicture: principal.picture,
        forSkill: forMySkill,
        gigType,
        note,
        requestType: "deputy",
      },
    });

    console.log(
      "📢 [DEPUTY REQUEST] Notification creation result:",
      notificationResult
    );

    return {
      success: true,
      notificationCreated: !!notificationResult,
      debug: {
        principalStatus: getUserNotificationStatus(principal),
        deputyStatus: getUserNotificationStatus(deputy),
        notificationId: notificationResult,
      },
    };
  },
});
// convex/deputies.ts - Add this mutation
export const cancelDeputyRequest = mutation({
  args: {
    principalId: v.id("users"),
    deputyId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const { principalId, deputyId } = args;

    console.log("🔍 [CANCEL REQUEST] Starting cancellation:", {
      principalId,
      deputyId,
    });

    const [principal, deputy] = await Promise.all([
      ctx.db.get(principalId),
      ctx.db.get(deputyId),
    ]);

    if (!principal || !deputy) {
      console.error("❌ [CANCEL REQUEST] User not found");
      throw new Error("User not found");
    }

    // Check if there's a pending request
    const pendingRequest = deputy.backUpFor?.find(
      (rel) => rel.principalUserId === principalId && rel.status === "pending"
    );

    if (!pendingRequest) {
      console.log("⚠️ [CANCEL REQUEST] No pending request found to cancel");
      throw new Error("No pending deputy request found");
    }

    // Remove the pending request from deputy's backUpFor
    const updatedBackUpFor =
      deputy.backUpFor?.filter(
        (rel) =>
          !(rel.principalUserId === principalId && rel.status === "pending")
      ) || [];

    console.log("✅ [CANCEL REQUEST] Removing pending request");

    // Update deputy's data
    await ctx.db.patch(deputyId, {
      backUpFor: updatedBackUpFor,
    });

    // Optional: Send notification to deputy about cancellation
    try {
      await createNotificationInternal(ctx, {
        userDocumentId: deputyId,
        type: "gig_invite",
        title: "Deputy Request Cancelled",
        message: `${principal.firstname || principal.username} cancelled their deputy request for ${pendingRequest.forTheirSkill}`,
        image: principal.picture,
        actionUrl: `/community?tab=requests`,
        relatedUserDocumentId: principalId,
        metadata: {
          principalDocumentId: principalId.toString(),
          principalClerkId: principal.clerkId,
          principalName: principal.firstname,
          principalUsername: principal.username,
          principalPicture: principal.picture,
          forSkill: pendingRequest.forTheirSkill,
          gigType: pendingRequest.gigType,
          requestType: "deputy_cancellation",
        },
      });
      console.log("📢 [CANCEL REQUEST] Notification sent to deputy");
    } catch (error) {
      console.log(
        "ℹ️ [CANCEL REQUEST] Failed to send notification (may be expected):",
        error
      );
    }

    return { success: true };
  },
});
export const respondToDeputyRequest = mutation({
  args: {
    deputyId: v.id("users"),
    principalId: v.id("users"),
    status: v.union(v.literal("accepted"), v.literal("rejected")),
    isViewerInGracePeriod: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { deputyId, principalId, status, isViewerInGracePeriod } = args;

    const [deputy, principal] = await Promise.all([
      ctx.db.get(deputyId),
      ctx.db.get(principalId),
    ]);

    if (!deputy || !principal) {
      throw new Error("User not found");
    }

    // Find the relationship in deputy's backUpFor
    const deputyRelationship = deputy.backUpFor?.find(
      (rel) => rel.principalUserId === principalId
    );

    if (!deputyRelationship) {
      throw new Error("Deputy request not found");
    }

    let updates: any = {};

    if (status === "accepted") {
      // ✅ ACCEPTED: Update status and add to principal's myDeputies
      const updatedBackUpFor =
        deputy.backUpFor?.map((rel) =>
          rel.principalUserId === principalId ? { ...rel, status } : rel
        ) || [];

      updates.backUpFor = updatedBackUpFor;
      updates.backUpCount = (deputy.backUpCount || 0) + 1;

      // Add to principal's myDeputies array
      const principalDeputyData = {
        deputyUserId: deputyId,
        forMySkill: deputyRelationship.forTheirSkill,
        gigType: deputyRelationship.gigType,
        status: "accepted" as const,
        canBeBooked: true,
        dateAdded: Date.now(),
      };

      const updatedPrincipalDeputies = [
        ...(principal.myDeputies || []),
        principalDeputyData,
      ];

      await ctx.db.patch(principalId, {
        myDeputies: updatedPrincipalDeputies,
      });
    } else {
      // ❌ REJECTED: COMPLETELY REMOVE from backUpFor
      const updatedBackUpFor =
        deputy.backUpFor?.filter(
          (rel) => rel.principalUserId !== principalId
        ) || [];

      updates.backUpFor = updatedBackUpFor;
      // No change to backUpCount since it was never accepted
    }

    // Update deputy's data
    await ctx.db.patch(deputyId, updates);

    // Notify the principal about the response
    await createNotificationInternal(ctx, {
      userDocumentId: principalId,
      type: "gig_invite",
      title:
        status === "accepted"
          ? "Deputy Request Accepted"
          : "Deputy Request Declined",
      message: `${deputy.firstname || deputy.username} ${status === "accepted" ? "accepted" : "declined"} your deputy request for ${deputyRelationship.forTheirSkill}`,
      image: deputy.picture,
      actionUrl: `/community?tab=deputies`,
      relatedUserDocumentId: deputyId,
      isViewerInGracePeriod,
      metadata: {
        deputyDocumentId: deputyId.toString(),
        deputyClerkId: deputy.clerkId,
        deputyName: deputy.firstname,
        deputyUsername: deputy.username,
        deputyPicture: deputy.picture,
        forSkill: deputyRelationship.forTheirSkill,
        gigType: deputyRelationship.gigType,
        status,
        requestType: "deputy_response",
      },
    });

    return { success: true };
  },
});

// convex/deputies.ts - in removeDeputy mutation
export const removeDeputy = mutation({
  args: {
    principalId: v.id("users"),
    deputyId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const { principalId, deputyId } = args;

    const principal = await ctx.db.get(principalId);
    const deputy = await ctx.db.get(deputyId);
    if (!principal || !deputy) throw new Error("User not found");

    // Remove from principal's myDeputies
    const updatedMyDeputies =
      principal.myDeputies?.filter((dep) => dep.deputyUserId !== deputyId) ||
      [];

    // Remove from deputy's backUpFor
    const updatedBackupFor =
      deputy.backUpFor?.filter((rel) => rel.principalUserId !== principalId) ||
      [];

    // ✅ DECREMENT backupCount
    const newBackupCount = Math.max(0, (deputy.backUpCount || 0) - 1);

    // Update both users
    await ctx.db.patch(principalId, { myDeputies: updatedMyDeputies });
    await ctx.db.patch(deputyId, {
      backUpFor: updatedBackupFor,
      backUpCount: newBackupCount,
    });

    return { success: true };
  },
});

export const updateDeputySettings = mutation({
  args: {
    principalId: v.id("users"),
    deputyId: v.id("users"),
    updates: v.object({
      canBeBooked: v.optional(v.boolean()),
      note: v.optional(v.string()),
      gigType: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const { principalId, deputyId, updates } = args;

    const principal = await ctx.db.get(principalId);
    if (!principal) throw new Error("Principal not found");

    const updatedMyDeputies =
      principal.myDeputies?.map((deputy) =>
        deputy.deputyUserId === deputyId ? { ...deputy, ...updates } : deputy
      ) || [];

    await ctx.db.patch(principalId, {
      myDeputies: updatedMyDeputies,
    });

    return { success: true };
  },
});
// Helper function for safe instrument matching
const getInstrumentMatch = (
  currentInstrument: string | undefined | null,
  targetInstrument: string | undefined | null
): boolean => {
  if (!currentInstrument || !targetInstrument) return true;

  const current = currentInstrument.toLowerCase();
  const target = targetInstrument.toLowerCase();

  const instrumentCategories: Record<string, string[]> = {
    // Keyboard instruments
    piano: ["piano", "keyboard", "organ", "synthesizer"],
    keyboard: ["piano", "keyboard", "organ", "synthesizer"],
    organ: ["piano", "keyboard", "organ"],
    synthesizer: ["piano", "keyboard", "synthesizer"],

    // String instruments
    guitar: ["guitar", "bass", "ukulele"],
    bass: ["guitar", "bass"],
    violin: ["violin", "viola", "cello"],
    cello: ["violin", "viola", "cello"],
    viola: ["violin", "viola", "cello"],

    // Wind instruments
    saxophone: ["saxophone", "trumpet", "trombone"],
    trumpet: ["saxophone", "trumpet", "trombone"],
    trombone: ["saxophone", "trumpet", "trombone"],
    flute: ["flute", "clarinet", "oboe"],
    clarinet: ["flute", "clarinet", "oboe"],

    // Percussion
    drums: ["drums", "percussion"],
    percussion: ["drums", "percussion"],
  };

  const currentCategory = instrumentCategories[current] || [current];
  return currentCategory.some(
    (instr) => target.includes(instr) || instr.includes(target)
  );
};

export const searchDeputies = query({
  args: {
    currentUserId: v.id("users"),
    searchQuery: v.optional(v.string()),
    skill: v.optional(v.string()),
    city: v.optional(v.string()),
    instrument: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const {
      currentUserId,
      searchQuery,
      skill,
      city,
      instrument,
      limit = 20,
    } = args;

    const currentUser = await ctx.db.get(currentUserId);
    if (!currentUser) throw new Error("User not found");

    let users = await ctx.db
      .query("users")
      .withIndex("by_is_musician", (q) => q.eq("isMusician", true))
      .collect();

    // Filter out the current user
    users = users.filter((user) => user._id !== currentUserId);

    // SIMPLE ROLE-BASED FILTERING ONLY
    users = users.filter((user) => {
      const currentUserRole = currentUser.roleType;
      const targetUserRole = user.roleType;

      if (!currentUserRole) return true;

      // Simple role compatibility rules
      switch (currentUserRole) {
        case "instrumentalist":
          return (
            targetUserRole === "instrumentalist" ||
            targetUserRole === "vocalist"
          );

        case "vocalist":
          return (
            targetUserRole === "vocalist" ||
            targetUserRole === "instrumentalist"
          );

        case "dj":
          return targetUserRole === "dj" || targetUserRole === "mc";

        case "mc":
          return targetUserRole === "mc" || targetUserRole === "dj";

        case "teacher":
          return targetUserRole === "teacher" || targetUserRole === "vocalist";

        default:
          return true;
      }
    });

    // Apply search filters
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      users = users.filter(
        (user) =>
          user.firstname?.toLowerCase().includes(query) ||
          user.lastname?.toLowerCase().includes(query) ||
          user.username.toLowerCase().includes(query) ||
          user.instrument?.toLowerCase().includes(query) ||
          user.city?.toLowerCase().includes(query) ||
          user.roleType?.toLowerCase().includes(query)
      );
    }

    if (city) {
      users = users.filter((user) =>
        user.city?.toLowerCase().includes(city.toLowerCase())
      );
    }

    if (instrument) {
      users = users.filter((user) =>
        user.instrument?.toLowerCase().includes(instrument.toLowerCase())
      );
    }

    if (skill) {
      users = users.filter((user) => {
        return (
          user.roleType?.toLowerCase().includes(skill.toLowerCase()) ||
          user.instrument?.toLowerCase().includes(skill.toLowerCase()) ||
          user.djGenre?.toLowerCase().includes(skill.toLowerCase()) ||
          user.vocalistGenre?.toLowerCase().includes(skill.toLowerCase())
        );
      });
    }

    // Sort by relevance with role compatibility bonus
    users.sort((a, b) => {
      const aReferrals = a.confirmedReferredGigs || 0;
      const bReferrals = b.confirmedReferredGigs || 0;

      const aSameCity =
        a.city?.toLowerCase() === currentUser.city?.toLowerCase() ? 1 : 0;
      const bSameCity =
        b.city?.toLowerCase() === currentUser.city?.toLowerCase() ? 1 : 0;

      const aSimilarRole = a.roleType === currentUser.roleType ? 2 : 0; // Increased weight for same role
      const bSimilarRole = b.roleType === currentUser.roleType ? 2 : 0;

      // Bonus for same instrument (for instrumentalists)
      const aSameInstrument =
        currentUser.roleType === "instrumentalist" &&
        a.roleType === "instrumentalist" &&
        a.instrument?.toLowerCase() === currentUser.instrument?.toLowerCase()
          ? 3
          : 0;

      const bSameInstrument =
        currentUser.roleType === "instrumentalist" &&
        b.roleType === "instrumentalist" &&
        b.instrument?.toLowerCase() === currentUser.instrument?.toLowerCase()
          ? 3
          : 0;

      return (
        bReferrals * 3 +
        bSameCity * 2 +
        bSimilarRole +
        bSameInstrument -
        (aReferrals * 3 + aSameCity * 2 + aSimilarRole + aSameInstrument)
      );
    });

    const enhancedUsers = await Promise.all(
      users.slice(0, limit).map(async (user) => {
        const backupCount =
          user.backUpFor?.filter((rel) => rel.status === "accepted").length ||
          0;

        const existingRelationship = user.backUpFor?.find(
          (rel) => rel.principalUserId === args.currentUserId
        );

        return {
          ...user,
          backupCount,
          existingRelationship: existingRelationship
            ? {
                status: existingRelationship.status,
                forTheirSkill: existingRelationship.forTheirSkill,
              }
            : null,
        };
      })
    );

    // Log final results for debugging
    console.log("🎯 [SEARCH RESULTS]", {
      currentUser: currentUser.username,
      currentUserRole: currentUser.roleType,
      currentUserInstrument: currentUser.instrument,
      totalResults: enhancedUsers.length,
      results: enhancedUsers.map((u) => ({
        username: u.username,
        role: u.roleType,
        instrument: u.instrument,
        city: u.city,
      })),
    });

    return enhancedUsers;
  },
});
// You might want a cleanup function for expired relationships
export const cleanupDeputyRelationships = mutation({
  args: {},
  handler: async (ctx) => {
    const allUsers = await ctx.db.query("users").collect();

    for (const user of allUsers) {
      const activeRelationships =
        user.backUpFor?.filter((rel) => rel.status === "accepted") || [];

      // If backupCount doesn't match active relationships, fix it
      if (user.backUpCount !== activeRelationships.length) {
        await ctx.db.patch(user._id, {
          backUpCount: activeRelationships.length,
        });
      }
    }

    return { success: true };
  },
});

export const getMyDeputies = query({
  args: {
    principalId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const principal = await ctx.db.get(args.principalId);
    if (!principal) throw new Error("User not found");

    const deputies = await Promise.all(
      (principal.myDeputies || [])
        .filter((dep) => dep.status === "accepted")
        .map(async (deputyRel) => {
          const deputyUser = await ctx.db.get(deputyRel.deputyUserId);
          if (!deputyUser) return null;

          return {
            ...deputyUser,
            relationship: deputyRel,
            backupCount:
              deputyUser.backUpFor?.filter((rel) => rel.status === "accepted")
                .length || 0,
          };
        })
    );

    return deputies.filter(Boolean);
  },
});
// convex/deputies.ts
export const getPendingRequests = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    const pendingRequests = await Promise.all(
      (user.backUpFor || [])
        .filter((rel) => rel.status === "pending")
        .map(async (request) => {
          const principal = await ctx.db.get(request.principalUserId);
          if (!principal) return null;

          return {
            principal,
            request,
          };
        })
    );

    // Properly filter out null values with type guard
    return pendingRequests.filter(
      (req): req is NonNullable<typeof req> => req !== null
    );
  },
});
