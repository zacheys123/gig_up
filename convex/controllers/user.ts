
import { mutationGeneric, queryGeneric } from "convex/server";
import { v } from "convex/values";

export const createOrUpdateUser = mutationGeneric({
  args: {
    clerkId: v.string(),
    email: v.string(),
    username: v.string(),
    picture: v.optional(v.string()),
    firstname: v.optional(v.string()),
    lastname: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    const now = Date.now();
    const userData = {
      ...args,
      lastActive: now,
      updatedAt: now,
    };

    if (existingUser) {
      // Update existing user
      return await ctx.db.patch(existingUser._id, userData);
    } else {
      // Create new user with defaults
      return await ctx.db.insert("users", {
        ...userData,
        // Default values
        isMusician: false,
        isClient: false,
        isAdmin: false,
        isBanned: false,
        followers: [],
        followings: [],
        refferences: [],
        allreviews: [],
        myreviews: [],
        videosProfile: [],
        musicianhandles: [],
        musiciangenres: [],
        tier: "free",
        earnings: 0,
        totalSpent: 0,
        monthlyGigsPosted: 0,
        monthlyMessages: 0,
        monthlyGigsBooked: 0,
        completedGigsCount: 0,
        reportsCount: 0,
        cancelgigCount: 0,
        savedGigs: [],
        favoriteGigs: [],
        likedVideos: [],
        bookingHistory: [],
        gigsBookedThisWeek: { count: 0, weekStart: now },
        theme: "system",
        firstLogin: true,
        onboardingComplete: false,
        firstTimeInProfile: true,
        renewalAttempts: 0,
        adminPermissions: [],
        createdAt: now,
      });
    }
  },
});

export const updateUserProfile = mutationGeneric({
  args: {
    userId: v.id("users"),
    updates: v.object({
      firstname: v.optional(v.string()),
      lastname: v.optional(v.string()),
      city: v.optional(v.string()),
      address: v.optional(v.string()),
      phone: v.optional(v.string()),
      instrument: v.optional(v.string()),
      experience: v.optional(v.string()),
      bio: v.optional(v.string()),
      roleType: v.optional(v.string()),
      isMusician: v.optional(v.boolean()),
      isClient: v.optional(v.boolean()),
      musiciangenres: v.optional(v.array(v.string())),
      rate: v.optional(v.object({
        regular: v.optional(v.string()),
        function: v.optional(v.string()),
        concert: v.optional(v.string()),
        corporate: v.optional(v.string()),
      })),
    }),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");
    if (user.clerkId !== identity.subject) throw new Error("Not authorized");

    return await ctx.db.patch(args.userId, {
      ...args.updates,
      updatedAt: Date.now(),
    });
  },
});

export const followUser = mutationGeneric({
  args: {
    targetUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (!currentUser) throw new Error("User not found");

    // Add to current user's followings
    if (!currentUser.followings.includes(args.targetUserId)) {
      await ctx.db.patch(currentUser._id, {
        followings: [...currentUser.followings, args.targetUserId],
        updatedAt: Date.now(),
      });
    }

    // Add to target user's followers
    const targetUser = await ctx.db.get(args.targetUserId);
    if (targetUser && !targetUser.followers.includes(currentUser._id)) {
      await ctx.db.patch(args.targetUserId, {
        followers: [...targetUser.followers, currentUser._id],
        updatedAt: Date.now(),
      });
    }

    return { success: true };
  },
});

export const addReview = mutationGeneric({
  args: {
    targetUserId: v.id("users"),
    rating: v.number(),
    comment: v.optional(v.string()),
    gigId: v.optional(v.id("gigs")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (!currentUser) throw new Error("User not found");

    const reviewId = crypto.randomUUID();
    const review = {
      _id: reviewId,
      postedBy: currentUser._id,
      postedTo: args.targetUserId,
      rating: args.rating,
      comment: args.comment,
      gigId: args.gigId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    // Add to target user's allreviews
    const targetUser = await ctx.db.get(args.targetUserId);
    if (targetUser) {
      await ctx.db.patch(args.targetUserId, {
        allreviews: [...targetUser.allreviews, review],
        updatedAt: Date.now(),
      });
    }

    // Add to current user's myreviews
    await ctx.db.patch(currentUser._id, {
      myreviews: [...currentUser.myreviews, review],
      updatedAt: Date.now(),
    });

    return reviewId;
  },
});

export const getCurrentUser = queryGeneric({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    return await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();
  },
});

export const getUserById = queryGeneric({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

export const searchUsers = queryGeneric({
  args: {
    query: v.string(),
    isMusician: v.optional(v.boolean()),
    city: v.optional(v.string()),
    instrument: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let usersQuery = ctx.db.query("users");

    // Apply filters
    if (args.isMusician !== undefined) {
      usersQuery = usersQuery.withIndex("by_isMusician", (q) => 
        q.eq("isMusician", args.isMusician!)
      );
    }

    if (args.city) {
      usersQuery = usersQuery.withIndex("by_city", (q) => 
        q.eq("city", args.city!)
      );
    }

    if (args.instrument) {
      usersQuery = usersQuery.withIndex("by_instrument", (q) => 
        q.eq("instrument", args.instrument!)
      );
    }

    const users = await usersQuery.collect();

    // Simple text search (Convex will have better search features soon)
    const searchTerm = args.query.toLowerCase();
    return users.filter(user => 
      user.firstname?.toLowerCase().includes(searchTerm) ||
      user.lastname?.toLowerCase().includes(searchTerm) ||
      user.username.toLowerCase().includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm) ||
      user.city?.toLowerCase().includes(searchTerm) ||
      user.instrument?.toLowerCase().includes(searchTerm)
    );
  },
});

export const updateUserTier = mutationGeneric({
  args: {
    userId: v.id("users"),
    tier: v.union(v.literal("free"), v.literal("pro")),
    tierStatus: v.union(
      v.literal("active"),
      v.literal("pending"),
      v.literal("canceled"),
      v.literal("expired")
    ),
    nextBillingDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    // Check if user is admin or the user themselves
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();
    
    if (!currentUser) throw new Error("User not found");
    if (!currentUser.isAdmin && currentUser._id !== args.userId) {
      throw new Error("Not authorized");
    }

    return await ctx.db.patch(args.userId, {
      tier: args.tier,
      tierStatus: args.tierStatus,
      nextBillingDate: args.nextBillingDate,
      updatedAt: Date.now(),
    });
  },
});