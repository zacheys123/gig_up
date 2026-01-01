// convex/controllers/gigs.ts
import { mutation, query } from "../_generated/server";

import { v } from "convex/values";
import { createNotificationInternal } from "../createNotificationInternal";

import { applyFirstGigBonusInternal } from "./trustScore"; // Import the internal helper

export const createGig = mutation({
  args: {
    // Required fields (must match schema)
    postedBy: v.id("users"),
    title: v.string(),
    secret: v.string(),
    bussinesscat: v.string(),
    date: v.number(),
    time: v.object({
      start: v.string(),
      end: v.string(),
    }),
    logo: v.string(),

    // Optional fields that schema requires as non-optional
    description: v.optional(v.string()),
    phone: v.optional(v.string()),
    price: v.optional(v.number()),
    category: v.optional(v.string()),
    location: v.optional(v.string()),

    // Optional fields with defaults in schema
    font: v.optional(v.string()),
    fontColor: v.optional(v.string()),
    backgroundColor: v.optional(v.string()),
    gigtimeline: v.optional(v.string()),
    otherTimeline: v.optional(v.string()),
    day: v.optional(v.string()),

    // Musician-specific optional fields
    mcType: v.optional(v.string()),
    mcLanguages: v.optional(v.string()),
    djGenre: v.optional(v.string()),
    djEquipment: v.optional(v.string()),
    pricerange: v.optional(v.string()),
    currency: v.optional(v.string()),
    scheduleDate: v.optional(v.number()),
    schedulingProcedure: v.optional(v.string()),

    // Arrays (optional in mutation, required in schema with defaults)
    tags: v.optional(v.array(v.string())),
    requirements: v.optional(v.array(v.string())),
    benefits: v.optional(v.array(v.string())),
    bandCategory: v.optional(v.array(v.string())),
    vocalistGenre: v.optional(v.array(v.string())),

    // Fields that should not be in create mutation (set later)
    bookedBy: v.optional(v.id("users")),
    paymentStatus: v.optional(
      v.union(v.literal("pending"), v.literal("paid"), v.literal("refunded"))
    ),
    cancellationReason: v.optional(v.string()),

    // Legacy fields for backward compatibility
    phoneNo: v.optional(v.string()),
    negotiable: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const {
      postedBy,
      title,
      secret,
      bussinesscat,
      date,
      time,
      logo,
      description,
      phone,
      price,
      category,
      location,
      font,
      fontColor,
      backgroundColor,
      gigtimeline,
      otherTimeline,
      day,
      mcType,
      mcLanguages,
      djGenre,
      djEquipment,
      pricerange,
      currency,
      scheduleDate,
      schedulingProcedure,
      tags,
      requirements,
      benefits,
      bandCategory,
      vocalistGenre,
      bookedBy,
      paymentStatus,
      cancellationReason,
      phoneNo,
      negotiable,
    } = args;

    // Validate required fields
    if (
      !postedBy ||
      !title ||
      !secret ||
      !bussinesscat ||
      !date ||
      !time ||
      !logo
    ) {
      throw new Error("Missing required fields");
    }

    const user = await ctx.db.get(postedBy);
    if (!user) {
      throw new Error("User not found");
    }

    const isFirstGig = !user.gigsPosted || user.gigsPosted === 0;

    // Combine phone and phoneNo for backward compatibility
    const phoneNumber = phone || phoneNo || "";

    // Create the gig with all required schema fields
    const gigId = await ctx.db.insert("gigs", {
      // Required fields
      postedBy,
      title,
      secret,
      bussinesscat,
      date,
      time,
      logo,

      // Optional fields with defaults
      description: description || "",
      phone: phoneNumber,
      price: price || 0,
      category: category || "",
      location: location || "",
      font: font || "Arial, sans-serif",
      fontColor: fontColor || "#000000",
      backgroundColor: backgroundColor || "#FFFFFF",
      gigtimeline: gigtimeline || "",
      otherTimeline: otherTimeline || "",
      day: day || "",

      // Musician-specific fields
      mcType: mcType || "",
      mcLanguages: mcLanguages || "",
      djGenre: djGenre || "",
      djEquipment: djEquipment || "",
      pricerange: pricerange || "",
      currency: currency || "USD",
      scheduleDate: scheduleDate || date,
      schedulingProcedure: schedulingProcedure || "manual",

      // Arrays with defaults
      tags: tags || [],
      requirements: requirements || [],
      benefits: benefits || [],
      bandCategory: bandCategory || [],
      vocalistGenre: vocalistGenre || [],

      // Arrays required by schema
      interestedUsers: [],
      appliedUsers: [],
      viewCount: [],
      bookCount: [],
      bookingHistory: [],

      // Status fields
      isTaken: false,
      isPending: false,
      isActive: true,
      isPublic: true,

      // Payment fields
      paymentStatus: paymentStatus || "pending",
      cancellationReason: cancellationReason || "",
      musicianConfirmPayment: undefined,
      clientConfirmPayment: undefined,
      gigRating: 0,

      negotiable,

      // Timestamps
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Get poster info for notifications
    const posterUser = await ctx.db.get(postedBy);
    if (!posterUser) {
      return gigId;
    }

    // Determine notification criteria
    let notificationCriteria = "";
    if (bussinesscat === "mc" && mcType) {
      notificationCriteria = `MC (${mcType})`;
    } else if (bussinesscat === "dj" && djGenre) {
      notificationCriteria = `DJ (${djGenre})`;
    } else if (bussinesscat === "vocalist" && vocalistGenre?.length) {
      notificationCriteria = `Vocalist (${vocalistGenre.join(", ")})`;
    } else if (
      (bussinesscat === "full" || bussinesscat === "other") &&
      bandCategory?.length
    ) {
      notificationCriteria = `Band (${bandCategory.join(", ")})`;
    } else {
      notificationCriteria = bussinesscat;
    }

    // Apply first gig bonus if applicable
    if (isFirstGig) {
      try {
        // Use internal helper instead of calling mutation
        await applyFirstGigBonusInternal(ctx, posterUser._id);
      } catch (error) {
        console.error("First gig bonus error:", error);
        // Don't fail gig creation if bonus fails
      }
    }

    // Find relevant musicians for notifications
    try {
      let relevantUsersQuery = ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("isMusician"), true))
        .filter((q) => q.neq(q.field("clerkId"), posterUser.clerkId));

      // Filter by role type
      if (["mc", "dj", "vocalist"].includes(bussinesscat)) {
        relevantUsersQuery = relevantUsersQuery.filter((q) =>
          q.eq(q.field("roleType"), bussinesscat)
        );
      }

      // Filter by location if available
      if (location && posterUser.city) {
        relevantUsersQuery = relevantUsersQuery.filter((q) =>
          q.eq(q.field("city"), posterUser.city)
        );
      }

      const relevantUsers = await relevantUsersQuery.take(15);

      // Create notifications
      if (relevantUsers.length > 0) {
        const notificationPromises = relevantUsers.map(async (user) => {
          return createNotificationInternal(ctx, {
            userDocumentId: user._id,
            type: "gig_opportunity",
            title: "🎵 New Gig Opportunity!",
            message: `${posterUser.firstname || "Someone"} posted a ${notificationCriteria} gig: "${title}"`,
            image: posterUser.picture,
            actionUrl: `/gigs/${gigId}`,
            relatedUserDocumentId: posterUser._id,
            metadata: {
              senderId: posterUser.clerkId,
              senderName: posterUser.firstname,
              gigId: gigId,
              gigTitle: title,
              bussinesscat: bussinesscat,
              location: location || "Unknown location",
              price: price || 0,
              currency: currency || "USD",
            },
          });
        });

        await Promise.all(notificationPromises);
      }

      // Create confirmation notification for poster
      await createNotificationInternal(ctx, {
        userDocumentId: posterUser._id,
        type: "gig_created",
        title: "✅ Gig Created Successfully!",
        message: `Your "${title}" gig has been posted. ${relevantUsers.length} musicians have been notified.`,
        image: posterUser.picture,
        actionUrl: `/gigs/${gigId}`,
        relatedUserDocumentId: posterUser._id,
        metadata: {
          gigId: gigId,
          gigTitle: title,
          notifiedCount: relevantUsers.length,
        },
      });

      // Update user's gig count
      await ctx.db.patch(posterUser._id, {
        gigsPosted: (posterUser.gigsPosted || 0) + 1,
      });
    } catch (error) {
      console.error("Error creating notifications:", error);
      // Continue even if notifications fail
    }

    return gigId;
  },
});

export const updateGig = mutation({
  args: {
    gigId: v.id("gigs"),
    updates: v.object({
      // Basic info
      title: v.optional(v.string()),
      description: v.optional(v.string()),
      location: v.optional(v.string()),
      phone: v.optional(v.string()),
      phoneNo: v.optional(v.string()), // For backward compatibility
      price: v.optional(v.number()),
      currency: v.optional(v.string()),
      secret: v.optional(v.string()),

      // Status flags
      isActive: v.optional(v.boolean()),
      isPublic: v.optional(v.boolean()),
      isTaken: v.optional(v.boolean()),
      isPending: v.optional(v.boolean()),

      // Payment status - must match schema literal values
      paymentStatus: v.optional(
        v.union(v.literal("pending"), v.literal("paid"), v.literal("refunded"))
      ),

      // Rating
      gigRating: v.optional(v.number()),

      // Customization
      font: v.optional(v.string()),
      fontColor: v.optional(v.string()),
      backgroundColor: v.optional(v.string()),
      logo: v.optional(v.string()),

      // Timeline fields
      gigtimeline: v.optional(v.string()),
      otherTimeline: v.optional(v.string()),
      day: v.optional(v.string()),

      // Musician-specific fields
      mcType: v.optional(v.string()),
      mcLanguages: v.optional(v.string()),
      djGenre: v.optional(v.string()),
      djEquipment: v.optional(v.string()),
      pricerange: v.optional(v.string()),
      category: v.optional(v.string()),

      // Arrays
      tags: v.optional(v.array(v.string())),
      requirements: v.optional(v.array(v.string())),
      benefits: v.optional(v.array(v.string())),
      bandCategory: v.optional(v.array(v.string())),
      vocalistGenre: v.optional(v.array(v.string())),

      // Other
      cancellationReason: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const { gigId, updates } = args;

    // Handle phone/phoneNo backward compatibility
    const normalizedUpdates: any = { ...updates };

    // If phoneNo is provided, also set phone for consistency
    if (normalizedUpdates.phoneNo !== undefined) {
      normalizedUpdates.phone = normalizedUpdates.phoneNo;
    }

    // Add updated timestamp
    normalizedUpdates.updatedAt = Date.now();

    await ctx.db.patch(gigId, normalizedUpdates);

    return gigId;
  },
});

// Delete gig mutation
export const deleteGig = mutation({
  args: { gigId: v.id("gigs") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.gigId);
    return args.gigId;
  },
});

// convex/controllers/gigs.ts
export const exploreGigs = query({
  args: {
    category: v.optional(v.string()),
    location: v.optional(v.string()),
    minPrice: v.optional(v.number()),
    maxPrice: v.optional(v.number()),
    bussinesscat: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("gigs");

    // Only show active, public gigs
    query = query.filter((q) => q.eq(q.field("isActive"), true));
    query = query.filter((q) => q.eq(q.field("isPublic"), true));

    // Apply filters with explicit checks
    if (args.category) {
      query = query.filter((q) => q.eq(q.field("category"), args.category!));
    }

    if (args.location) {
      query = query.filter((q) => q.eq(q.field("location"), args.location!));
    }

    if (args.bussinesscat) {
      query = query.filter((q) =>
        q.eq(q.field("bussinesscat"), args.bussinesscat!)
      );
    }

    if (args.minPrice !== undefined) {
      query = query.filter((q) => q.gte(q.field("price"), args.minPrice!));
    }

    if (args.maxPrice !== undefined) {
      query = query.filter((q) => q.lte(q.field("price"), args.maxPrice!));
    }

    const gigs = await query.order("desc").take(args.limit || 20);

    // Get poster info for each gig
    const gigsWithPosters = await Promise.all(
      gigs.map(async (gig) => {
        const poster = await ctx.db.get(gig.postedBy);
        return {
          ...gig,
          poster: poster
            ? {
                _id: poster._id,
                firstname: poster.firstname,
                picture: poster.picture,
                city: poster.city,
              }
            : null,
        };
      })
    );

    return gigsWithPosters;
  },
});

// Query for gig stats
export const getGigStats = query({
  args: { userId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    let gigsQuery = ctx.db.query("gigs");

    if (args.userId) {
      gigsQuery = gigsQuery.filter((q) =>
        q.eq(q.field("postedBy"), args.userId)
      );
    } else {
      gigsQuery = gigsQuery.filter((q) => q.eq(q.field("isActive"), true));
    }

    const gigs = await gigsQuery.collect();

    const stats = {
      totalGigs: gigs.length,
      activeGigs: gigs.filter((g) => g.isActive).length,
      takenGigs: gigs.filter((g) => g.isTaken).length,
      pendingGigs: gigs.filter((g) => g.isPending).length,
      totalEarnings: gigs
        .filter((g) => g.paymentStatus === "paid")
        .reduce((sum, gig) => sum + (gig.price || 0), 0),
      averageRating:
        gigs.length > 0
          ? gigs.reduce((sum, gig) => sum + (gig.gigRating || 0), 0) /
            gigs.length
          : 0,
      totalViews: gigs.reduce(
        (sum, gig) => sum + (gig.viewCount.length || 0),
        0
      ),
    };

    return stats;
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
// Query for user's gig applications
export const getUserApplications = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return [];

    // Get all gigs where user is in appliedUsers array
    const gigs = await ctx.db
      .query("gigs")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    const userApplications = gigs
      .filter((gig) => gig.appliedUsers?.includes(args.userId))
      .map((gig) => ({
        gig,
        appliedAt: gig.updatedAt, // Use updatedAt as applied time
        status: "pending", // Default status
      }));

    return userApplications;
  },
});

// Add helper query for getting user's gigs
export const getUserGigs = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const gigs = await ctx.db
      .query("gigs")
      .filter((q) => q.eq(q.field("postedBy"), args.userId))
      .order("desc")
      .collect();

    return gigs;
  },
});

// Query for getting gig by ID
export const getGigById = query({
  args: { gigId: v.id("gigs") },
  handler: async (ctx, args) => {
    const gig = await ctx.db.get(args.gigId);
    if (!gig) return null;

    // Get poster info
    const poster = await ctx.db.get(gig.postedBy);

    return {
      ...gig,
      poster: poster
        ? {
            _id: poster._id,
            firstname: poster.firstname,
            lastname: poster.lastname,
            picture: poster.picture,
            city: poster.city,

            totalGigs: poster.gigsPosted || 0,
          }
        : null,
    };
  },
});
// convex/controllers/gigs.ts

// Book a user for a specific role in a gig
export const bookUserForGig = mutation({
  args: {
    gigId: v.id("gigs"),
    userId: v.id("users"),
    role: v.string(), // e.g., "vocalist", "guitarist", "drummer"
    price: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { gigId, userId, role, price, notes } = args;

    const gig = await ctx.db.get(gigId);
    if (!gig) throw new Error("Gig not found");

    // Check if user is already in bookCount (simple array of user IDs)
    const isAlreadyInBookCount = gig.bookCount?.includes(userId);

    // Check if user has existing booking in bookingHistory for same role
    const existingBooking = gig.bookingHistory?.find(
      (booking) =>
        booking.userId === userId &&
        booking.role === role &&
        booking.status === "booked"
    );

    if (existingBooking) {
      throw new Error("User is already booked for this role");
    }

    // Create booking history entry
    const newBooking = {
      userId,
      status: "booked" as const, // Use "booked" to match your type
      date: Date.now(),
      role,
      notes,
    };

    // Update both arrays
    await ctx.db.patch(gigId, {
      // Add user ID to bookCount if not already there
      bookCount: isAlreadyInBookCount
        ? gig.bookCount
        : [...(gig.bookCount || []), userId],
      // Add detailed booking to bookingHistory
      bookingHistory: [...(gig.bookingHistory || []), newBooking],
      updatedAt: Date.now(),
    });

    // Create notification for the booked user
    const booker = await ctx.db.get(gig.postedBy);
    const bookedUser = await ctx.db.get(userId);

    if (booker && bookedUser) {
      await createNotificationInternal(ctx, {
        userDocumentId: userId,
        type: "booking_request",
        title: "🎵 Booking Request!",
        message: `${booker.firstname || "A client"} wants to book you as ${role} for "${gig.title}"`,
        image: booker.picture,
        actionUrl: `/gigs/${gigId}`,
        relatedUserDocumentId: booker._id,
        metadata: {
          gigId,
          gigTitle: gig.title,
          role,
          price,
          status: "booked",
        },
      });
    }

    return { success: true, booking: newBooking };
  },
});

// Update booking status (in bookingHistory)
export const updateBookingStatus = mutation({
  args: {
    gigId: v.id("gigs"),
    userId: v.id("users"),
    role: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("booked"), // Changed from "confirmed" to "booked" to match your type
      v.literal("completed"),
      v.literal("cancelled")
    ),
  },
  handler: async (ctx, args) => {
    const { gigId, userId, role, status } = args;

    const gig = await ctx.db.get(gigId);
    if (!gig) throw new Error("Gig not found");

    // Update bookingHistory
    const updatedBookingHistory = gig.bookingHistory?.map((booking) => {
      if (booking.userId === userId && booking.role === role) {
        return { ...booking, status };
      }
      return booking;
    });

    // If status is cancelled, remove from bookCount
    let updatedBookCount = gig.bookCount;
    if (status === "cancelled") {
      updatedBookCount = gig.bookCount?.filter((id) => id !== userId);
    }

    await ctx.db.patch(gigId, {
      bookingHistory: updatedBookingHistory,
      bookCount: updatedBookCount,
      updatedAt: Date.now(),
    });

    // Update notification based on status
    const gigOwner = await ctx.db.get(gig.postedBy);
    const bookedUser = await ctx.db.get(userId);

    if (gigOwner && bookedUser) {
      let title = "";
      let message = "";

      if (status === "booked") {
        title = "✅ Booking Confirmed!";
        message = `${bookedUser.firstname} confirmed your booking as ${role} for "${gig.title}"`;
      } else if (status === "cancelled") {
        title = "❌ Booking Cancelled";
        message = `${bookedUser.firstname} cancelled the booking as ${role} for "${gig.title}"`;
      } else if (status === "completed") {
        title = "🎉 Gig Completed!";
        message = `The gig "${gig.title}" has been marked as completed`;
      }

      if (title && message) {
        await createNotificationInternal(ctx, {
          userDocumentId: gigOwner._id,
          type: "booking_update",
          title,
          message,
          image: bookedUser.picture,
          actionUrl: `/gigs/${gigId}`,
          relatedUserDocumentId: userId,
          metadata: {
            gigId,
            gigTitle: gig.title,
            role,
            status,
          },
        });
      }
    }

    return { success: true };
  },
});

// Remove a booking completely
export const removeBooking = mutation({
  args: {
    gigId: v.id("gigs"),
    userId: v.id("users"),
    role: v.string(),
  },
  handler: async (ctx, args) => {
    const { gigId, userId, role } = args;

    const gig = await ctx.db.get(gigId);
    if (!gig) throw new Error("Gig not found");

    // Remove from bookCount
    const updatedBookCount = gig.bookCount?.filter((id) => id !== userId);

    // Remove from bookingHistory
    const updatedBookingHistory = gig.bookingHistory?.filter(
      (booking) => !(booking.userId === userId && booking.role === role)
    );

    await ctx.db.patch(gigId, {
      bookCount: updatedBookCount,
      bookingHistory: updatedBookingHistory,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Query to get bookings with user details
export const getGigBookings = query({
  args: { gigId: v.id("gigs") },
  handler: async (ctx, args) => {
    const gig = await ctx.db.get(args.gigId);
    if (!gig) return [];

    // Get unique booked user IDs from bookingHistory
    const bookedUserIds = Array.from(
      new Set(
        (gig.bookingHistory || [])
          .filter((booking) => booking.status === "booked")
          .map((booking) => booking.userId)
      )
    );

    // Get user details for each booked user
    const bookingsWithUsers = await Promise.all(
      bookedUserIds.map(async (userId) => {
        const user = await ctx.db.get(userId);

        // Get all roles this user is booked for
        const userBookings = (gig.bookingHistory || []).filter(
          (booking) => booking.userId === userId && booking.status === "booked"
        );

        return {
          userId,
          user: user
            ? {
                _id: user._id,
                firstname: user.firstname,
                picture: user.picture,
                city: user.city,
              }
            : null,
          bookings: userBookings.map((booking) => ({
            role: booking.role,
            date: booking.date,
            notes: booking.notes,
          })),
        };
      })
    );

    return bookingsWithUsers;
  },
});

// Simplified booking function using bookingHistory only
export const bookUserForRole = mutation({
  args: {
    gigId: v.id("gigs"),
    userId: v.id("users"),
    role: v.string(), // e.g., "vocalist", "guitarist", "drummer"
    price: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { gigId, userId, role, price, notes } = args;

    const gig = await ctx.db.get(gigId);
    if (!gig) throw new Error("Gig not found");

    // Check if user is already booked for this role
    const existingBooking = gig.bookingHistory?.find(
      (booking) =>
        booking.userId === userId &&
        booking.role === role &&
        booking.status === "booked"
    );

    if (existingBooking) {
      throw new Error("User is already booked for this role");
    }

    // Create booking history entry
    const newBooking = {
      userId,
      status: "booked" as const,
      date: Date.now(),
      role,
      notes,
    };

    // Add to bookCount if not already there
    const isAlreadyInBookCount = gig.bookCount?.includes(userId);
    const updatedBookCount = isAlreadyInBookCount
      ? gig.bookCount
      : [...(gig.bookCount || []), userId];

    await ctx.db.patch(gigId, {
      bookCount: updatedBookCount,
      bookingHistory: [...(gig.bookingHistory || []), newBooking],
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});
// In your convex/users.ts
export const saveGig = mutation({
  args: {
    userId: v.id("users"),
    gigId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    const savedGigs = user.savedGigs || [];
    if (!savedGigs.includes(args.gigId)) {
      await ctx.db.patch(args.userId, {
        savedGigs: [...savedGigs, args.gigId],
      });
    }
  },
});

export const favoriteGig = mutation({
  args: {
    userId: v.id("users"),
    gigId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    const favoriteGigs = user.favoriteGigs || [];
    if (!favoriteGigs.includes(args.gigId)) {
      await ctx.db.patch(args.userId, {
        favoriteGigs: [...favoriteGigs, args.gigId],
      });
    }
  },
});

export const unsaveGig = mutation({
  args: {
    userId: v.id("users"),
    gigId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    const savedGigs = user.savedGigs || [];
    await ctx.db.patch(args.userId, {
      savedGigs: savedGigs.filter((id) => id !== args.gigId),
    });
  },
});

export const unfavoriteGig = mutation({
  args: {
    userId: v.id("users"),
    gigId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    const favoriteGigs = user.favoriteGigs || [];
    await ctx.db.patch(args.userId, {
      favoriteGigs: favoriteGigs.filter((id) => id !== args.gigId),
    });
  },
});

// In your convex/gigs.ts
export const incrementViewCount = mutation({
  args: {
    gigId: v.id("gigs"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const gig = await ctx.db.get(args.gigId);
    if (!gig) throw new Error("Gig not found");

    const viewCount = gig.viewCount || [];
    if (!viewCount.includes(args.userId)) {
      await ctx.db.patch(args.gigId, {
        viewCount: [...viewCount, args.userId],
      });
    }
  },
});

export const bookGig = mutation({
  args: {
    gigId: v.id("gigs"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const gig = await ctx.db.get(args.gigId);
    if (!gig) throw new Error("Gig not found");

    const bookCount = gig.bookCount || [];
    if (!bookCount.includes(args.userId)) {
      await ctx.db.patch(args.gigId, {
        bookCount: [...bookCount, args.userId],
      });
    }
  },
});
// convex/gigs.ts - Additional mutations
export const cancelGig = mutation({
  args: {
    gigId: v.id("gigs"),
    musicianId: v.id("users"),
    reason: v.string(),
    cancelerType: v.union(v.literal("client"), v.literal("musician")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const gig = await ctx.db.get(args.gigId);
    if (!gig) {
      throw new Error("Gig not found");
    }

    // Verify permissions
    if (args.cancelerType === "client" && gig.postedBy !== identity.subject) {
      throw new Error("Only the client can cancel this gig");
    }

    if (args.cancelerType === "musician" && gig.bookedBy !== args.musicianId) {
      throw new Error("Only the booked musician can cancel this gig");
    }

    // Update gig status
    await ctx.db.patch(args.gigId, {
      isActive: false,
      isTaken: false,
      bookedBy: undefined,
      paymentStatus: "refunded",
      cancellationReason: args.reason,
      cancelledBy: args.cancelerType,
      cancelledAt: Date.now(),
    });

    // Notify other party (you can add WebSocket/Socket.io notification here)

    return {
      success: true,
      message: "Gig cancelled successfully",
    };
  },
});
