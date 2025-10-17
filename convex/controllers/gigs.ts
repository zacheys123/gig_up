// convex/controllers/gigs.ts
import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { createNotificationInternal } from "../createNotificationInternal";

// export const getAllGigs = query({
//   args: {
//     // Optional filters
//     category: v.optional(v.string()),
//     location: v.optional(v.string()),
//     isTaken: v.optional(v.boolean()),
//     limit: v.optional(v.number()),
//   },
//   handler: async (ctx, args) => {
//     let query = ctx.db.query("gigs");

//     // Apply filters if provided
//     if (args.category) {
//       query = query.withIndex("by_category", (q) => q.eq("category", args.category!));
//     } else if (args.location) {
//       query = query.withIndex("by_location", (q) => q.eq("location", args.location!));
//     } else if (args.isTaken !== undefined) {
//       query = query.withIndex("by_isTaken", (q) => q.eq("isTaken", args.isTaken!));
//     }

//     const gigs = await query.collect();

//     // Apply limit if specified
//     if (args.limit) {
//       return gigs.slice(0, args.limit);
//     }

//     return gigs;
//   },
// });
// convex/controllers/gigs.ts

export const getAllGigs = query({
  args: {}, // No arguments needed
  handler: async (ctx) => {
    return await ctx.db.query("gigs").collect();
  },
});
export const getActiveGigs = query({
  args: {
    category: v.optional(v.string()),
    location: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("gigs")
      .withIndex("by_isTaken", (q) => q.eq("isTaken", false));

    // Additional filters
    if (args.category) {
      const allGigs = await query.collect();
      return allGigs.filter((gig) => gig.category === args.category);
    }

    if (args.location) {
      const allGigs = await query.collect();
      return allGigs.filter((gig) => gig.location === args.location);
    }

    return await query.collect();
  },
});

export const getGigsWithUsers = query({
  args: {},
  handler: async (ctx, args) => {
    const gigs = await ctx.db.query("gigs").collect();

    // Fetch user details for each gig
    const gigsWithUsers = await Promise.all(
      gigs.map(async (gig) => {
        const postedByUser = await ctx.db.get(gig.postedBy);
        const bookedByUser = gig.bookedBy
          ? await ctx.db.get(gig.bookedBy)
          : null;

        return {
          ...gig,
          postedByUser,
          bookedByUser,
        };
      })
    );

    return gigsWithUsers;
  },
});

export const getGigsByFilters = query({
  args: {
    categories: v.optional(v.array(v.string())),
    locations: v.optional(v.array(v.string())),
    priceRange: v.optional(
      v.object({
        min: v.optional(v.number()),
        max: v.optional(v.number()),
      })
    ),
    dateRange: v.optional(
      v.object({
        start: v.optional(v.number()),
        end: v.optional(v.number()),
      })
    ),
  },
  handler: async (ctx, args) => {
    let gigs = await ctx.db.query("gigs").collect();

    // Apply multiple filters
    if (args.categories && args.categories.length > 0) {
      gigs = gigs.filter(
        (gig) => gig.category && args.categories!.includes(gig.category)
      );
    }

    if (args.locations && args.locations.length > 0) {
      gigs = gigs.filter(
        (gig) => gig.location && args.locations!.includes(gig.location)
      );
    }

    if (args.priceRange) {
      gigs = gigs.filter((gig) => {
        if (!gig.price) return false;
        const price = parseFloat(gig.price);
        return (
          (!args.priceRange!.min || price >= args.priceRange!.min) &&
          (!args.priceRange!.max || price <= args.priceRange!.max)
        );
      });
    }

    if (args.dateRange) {
      gigs = gigs.filter((gig) => {
        return (
          (!args.dateRange!.start || gig.date >= args.dateRange!.start) &&
          (!args.dateRange!.end || gig.date <= args.dateRange!.end)
        );
      });
    }

    return gigs;
  },
});

// Paginated gigs query
export const getPaginatedGigs = query({
  args: {
    cursor: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;

    let gigsQuery = ctx.db.query("gigs");

    const gigs = await gigsQuery.collect();

    // Simple pagination (Convex has built-in pagination you can use too)
    const startIndex = args.cursor ? parseInt(args.cursor) : 0;
    const paginatedGigs = gigs.slice(startIndex, startIndex + limit);

    return {
      gigs: paginatedGigs,
      nextCursor:
        startIndex + limit < gigs.length
          ? (startIndex + limit).toString()
          : null,
      total: gigs.length,
    };
  },
});

// Basic gig operations from previous example
// followers
// export const createGig = mutation({
//   args: {
//     postedBy: v.id("users"),
//     title: v.string(),
//     secret: v.string(),
//     bussinesscat: v.string(),
//     logo: v.string(),
//     time: v.object({
//       from: v.string(),
//       to: v.string(),
//     }),
//   },
//   handler: async (ctx, args) => {
//     const { postedBy, title } = args;

//     // 1. Create the gig
//     const gigId = await ctx.db.insert("gigs", {
//       ...args,
//       date: Date.now(),
//       isTaken: false,
//       isPending: false,
//       bandCategory: [],
//       viewCount: [],
//       bookCount: [],
//       bookingHistory: [],
//       paymentStatus: "pending",
//       gigRating: 0,
//       vocalistGenre: [],
//     });

//     // 2. Get poster info
//     const posterUser = await ctx.db.get(postedBy);
//     if (!posterUser) return gigId;

//     // 3. Compute followers dynamically - find users who have this user in their following list
//     const allUsers = await ctx.db
//       .query("users")
//       .filter((q) => q.neq(q.field("clerkId"), posterUser.clerkId)) // Exclude poster
//       .collect();

//     const followers = allUsers.filter((user) => {
//       // Check if user.following array exists and contains the poster's clerkId
//       return user.followings && user.followings.includes(posterUser.clerkId);
//     });

//     // 4. Create notifications for followers
//     const notificationPromises = followers.map(async (follower) => {
//       return createNotificationInternal(ctx, {
//         userId: follower.clerkId,
//         type: "gig_invite",
//         title: "New Gig Posted!",
//         message: `${posterUser.firstname} posted: "${title}"`,
//         image: posterUser.picture,
//         actionUrl: `/gigs/${gigId}`,
//         relatedUserId: posterUser.clerkId,
//         metadata: {
//           senderId: posterUser.clerkId,
//           senderName: posterUser.firstname,
//           gigId: gigId,
//           gigTitle: title,
//         },
//       });
//     });

//     await Promise.all(notificationPromises);

//     return gigId;
//   },
// });
// interest based
export const createGig = mutation({
  args: {
    postedBy: v.id("users"),
    title: v.string(),
    secret: v.string(),
    bussinesscat: v.string(),
    logo: v.string(),
    time: v.object({
      from: v.string(),
      to: v.string(),
    }),
    // Add genre/category if available
    genre: v.optional(v.string()),
    location: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { postedBy, title, genre, location } = args;

    // 1. Create the gig
    const gigId = await ctx.db.insert("gigs", {
      ...args,
      date: Date.now(),
      isTaken: false,
      isPending: false,
      bandCategory: [],
      viewCount: [],
      bookCount: [],
      bookingHistory: [],
      paymentStatus: "pending",
      gigRating: 0,
      vocalistGenre: [],
    });

    // 2. Get poster info
    const posterUser = await ctx.db.get(postedBy);
    if (!posterUser) return gigId;

    // 3. Find relevant musicians based on criteria
    let relevantUsersQuery = ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("isMusician"), true)) // Only musicians
      .filter((q) => q.neq(q.field("clerkId"), posterUser.clerkId)); // Exclude poster

    // Add filters based on available data
    if (genre) {
      // Find musicians who have this genre in their preferences
      relevantUsersQuery = relevantUsersQuery.filter((q) =>
        q.eq(q.field("genres"), genre)
      );
    }

    if (location && posterUser.city) {
      // Find musicians in the same city
      relevantUsersQuery = relevantUsersQuery.filter((q) =>
        q.eq(q.field("city"), posterUser.city)
      );
    }

    const relevantUsers = await relevantUsersQuery.take(20); // Limit to avoid spam

    // 4. Create notifications
    const notificationPromises = relevantUsers.map(async (user) => {
      return createNotificationInternal(ctx, {
        userId: user.clerkId,
        type: "gig_invite",
        title: "New Gig Opportunity! 🎵",
        message: `New ${genre || "gig"} posted in ${posterUser.city || "your area"}: "${title}"`,
        image: posterUser.picture,
        actionUrl: `/gigs/${gigId}`,
        relatedUserId: posterUser.clerkId,
        metadata: {
          senderId: posterUser.clerkId,
          senderName: posterUser.firstname,
          gigId: gigId,
          gigTitle: title,
          genre: genre,
          location: posterUser.city,
        },
      });
    });

    await Promise.all(notificationPromises);

    return gigId;
  },
});
export const getGigById = query({
  args: { gigId: v.id("gigs") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.gigId);
  },
});

export const getGigsByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("gigs")
      .withIndex("by_postedBy", (q) => q.eq("postedBy", args.userId))
      .collect();
  },
});

export const updateGig = mutation({
  args: {
    gigId: v.id("gigs"),
    updates: v.object({
      title: v.optional(v.string()),
      description: v.optional(v.string()),
      price: v.optional(v.string()),
      location: v.optional(v.string()),
      isTaken: v.optional(v.boolean()),
      // Add other updatable fields
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.gigId, args.updates);
    return { success: true };
  },
});
