import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { Id } from "../_generated/dataModel";
// convex/instantGigs.ts (continued)

// Get instant gigs for a client
export const getClientInstantGigs = query({
  args: {
    clientId: v.id("users"),
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("accepted"),
        v.literal("declined"),
        v.literal("deputy-suggested"),
        v.literal("cancelled")
      )
    ),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("instantgigs")
      .withIndex("by_client", (q) => q.eq("clientId", args.clientId));

    if (args.status) {
      query = query.filter((q) => q.eq(q.field("status"), args.status));
    }

    const gigs = await query.order("desc").collect();
    return gigs;
  },
});

// Get instant gigs for a musician
export const getMusicianInstantGigs = query({
  args: {
    musicianId: v.id("users"),
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("accepted"),
        v.literal("declined"),
        v.literal("deputy-suggested"),
        v.literal("cancelled")
      )
    ),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("instantgigs")
      .withIndex("by_musician", (q) =>
        q.eq("invitedMusicianId", args.musicianId)
      );

    if (args.status) {
      query = query.filter((q) => q.eq(q.field("status"), args.status));
    }

    const gigs = await query.order("desc").collect();
    return gigs;
  },
});

// Get instant gig by ID
export const getInstantGigById = query({
  args: {
    gigId: v.id("instantgigs"),
  },
  handler: async (ctx, args) => {
    const gig = await ctx.db.get(args.gigId as Id<"instantgigs">);
    return gig;
  },
});

// Get template by ID
export const getTemplateById = query({
  args: {
    templateId: v.id("instantGigsTemplate"),
  },
  handler: async (ctx, args) => {
    const template = await ctx.db.get(args.templateId);
    return template;
  },
});

// Get popular templates for a client
export const getPopularTemplates = query({
  args: {
    clientId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const templates = await ctx.db
      .query("instantGigsTemplate")
      .withIndex("by_client", (q) => q.eq("clientId", args.clientId))
      .order("desc")
      .take(args.limit || 5);

    return templates.sort((a, b) => b.timesUsed - a.timesUsed);
  },
});

// Get templates with caching support
export const getClientTemplates = query({
  args: {
    clientId: v.id("users"),
    refetchTrigger: v.optional(v.number()), // ADD THIS
  },
  handler: async (ctx, args) => {
    const templates = await ctx.db
      .query("instantGigsTemplate")
      .withIndex("by_client", (q) => q.eq("clientId", args.clientId))
      .order("desc")
      .collect();

    return templates;
  },
});

export const saveTemplate = mutation({
  args: {
    templateId: v.optional(v.string()),
    title: v.string(),
    description: v.string(),
    date: v.optional(v.string()),
    venue: v.optional(v.string()),
    budget: v.string(),
    gigType: v.string(),
    duration: v.string(),
    setlist: v.optional(v.string()),
    icon: v.string(),
    clientId: v.id("users"),
    clientName: v.string(),
    fromTime: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    console.log("🏁 [CONVEX DEBUG] saveTemplate called with args:", args);
    console.log("🆔 [CONVEX DEBUG] Template ID:", args.templateId);

    // Extract templateId from args to avoid including it in the document
    const { templateId, ...templateData } = args;

    if (templateId) {
      console.log(
        "📝 [CONVEX DEBUG] Attempting to patch existing template:",
        templateId
      );
      try {
        const result = await ctx.db.patch(
          templateId as Id<"instantGigsTemplate">,
          {
            ...templateData,
            updatedAt: now,
          }
        );
        console.log(
          "✅ [CONVEX DEBUG] Template patched successfully:",
          templateId
        );
        return templateId;
      } catch (error) {
        console.log(
          "❌ [CONVEX DEBUG] Patch failed, creating new template. Error:",
          error
        );
        // Continue to create new template if patch fails
      }
    }

    console.log("🆕 [CONVEX DEBUG] Creating new template");
    const newTemplateId = await ctx.db.insert("instantGigsTemplate", {
      ...templateData,
      timesUsed: 0,
      createdAt: now,
      updatedAt: now,
    });

    console.log(
      "🎉 [CONVEX DEBUG] New template created with ID:",
      newTemplateId
    );
    return newTemplateId;
  },
});

// Delete template
export const deleteTemplate = mutation({
  args: {
    templateId: v.id("instantGigsTemplate"),
    clientId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const template = await ctx.db.get(args.templateId);

    if (!template) {
      throw new Error("Template not found");
    }

    if (template.clientId !== args.clientId) {
      throw new Error("Unauthorized to delete this template");
    }

    await ctx.db.delete(args.templateId);
    return true;
  },
});

// Create instant gig (simplified - no template relationship tracking)
export const createInstantGig = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    date: v.string(),
    venue: v.string(),
    budget: v.string(),
    gigType: v.string(),
    duration: v.string(),
    setlist: v.optional(v.string()),
    clientId: v.id("users"),
    clientName: v.string(),
    invitedMusicianId: v.id("users"),
    musicianName: v.string(),
    fromTime: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    console.log(args);
    const gigId = await ctx.db.insert("instantgigs", {
      ...args,
      status: "pending",
      createdAt: Date.now(),
    });

    return gigId;
  },
});

// Get client stats
export const getClientInstantGigsStats = query({
  args: {
    clientId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const allGigs = await ctx.db
      .query("instantgigs")
      .withIndex("by_client", (q) => q.eq("clientId", args.clientId))
      .collect();

    const stats = {
      total: allGigs.length,
      pending: allGigs.filter((gig) => gig.status === "pending").length,
      accepted: allGigs.filter((gig) => gig.status === "accepted").length,
      declined: allGigs.filter((gig) => gig.status === "declined").length,
      deputySuggested: allGigs.filter(
        (gig) => gig.status === "deputy-suggested"
      ).length,
    };

    return stats;
  },
});

// Update instant gig status - ONLY use allowed statuses
export const updateInstantGigStatus = mutation({
  args: {
    gigId: v.id("instantgigs"),
    status: v.union(
      // ONLY use statuses that exist in your schema
      v.literal("accepted"),
      v.literal("declined"),
      v.literal("deputy-suggested")
      // REMOVED: v.literal("cancelled") - not in your schema
    ),
    musicianId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const gig = await ctx.db.get(args.gigId);

    if (!gig) {
      throw new Error("Gig not found");
    }

    // Verify the musician is the one invited
    if (gig.invitedMusicianId !== args.musicianId) {
      throw new Error("Unauthorized to update this gig");
    }

    await ctx.db.patch(args.gigId, {
      status: args.status,
    });

    return args.gigId;
  },
});

// Archive a template
export const archiveTemplate = mutation({
  args: {
    templateId: v.id("instantGigsTemplate"),
    clientId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const template = await ctx.db.get(args.templateId);

    if (!template) {
      throw new Error("Template not found");
    }

    if (template.clientId !== args.clientId) {
      throw new Error("Unauthorized to archive this template");
    }

    await ctx.db.patch(args.templateId, {
      updatedAt: Date.now(),
    });

    return true;
  },
});
