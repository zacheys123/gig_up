import { v } from "convex/values";
import { mutation, query } from "../_generated/server";

// Schema for testimonials
export const createTestimonial = mutation({
  args: {
    userId: v.string(),
    userName: v.string(),
    userRole: v.string(),
    userCity: v.string(),
    rating: v.number(),
    content: v.string(),
    stats: v.object({
      bookings: v.number(),
      earnings: v.string(),
      joinedDate: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    const testimonialId = await ctx.db.insert("testimonials", {
      ...args,
      featured: false,
      verified: true, // For now, mark all as verified
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return testimonialId;
  },
});

export const getFeaturedTestimonials = query({
  args: {},
  handler: async (ctx) => {
    const testimonials = await ctx.db
      .query("testimonials")
      .filter((q) => q.eq(q.field("featured"), true))
      .order("desc")
      .take(6);

    return testimonials;
  },
});

export const getAllTestimonials = query({
  args: {},
  handler: async (ctx) => {
    const testimonials = await ctx.db
      .query("testimonials")
      .order("desc")
      .collect();

    return testimonials;
  },
});

export const getUserTestimonials = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const testimonials = await ctx.db
      .query("testimonials")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .order("desc")
      .collect();

    return testimonials;
  },
});

export const featureTestimonial = mutation({
  args: { testimonialId: v.id("testimonials") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.testimonialId, {
      featured: true,
      updatedAt: Date.now(),
    });
  },
});

// For mock data initialization
export const createMockTestimonials = mutation({
  args: {},
  handler: async (ctx) => {
    const mockTestimonials = [
      {
        userId: "mock_1",
        userName: "Jamie",
        userRole: "Vocalist",
        userCity: "Brooklyn, NY",
        rating: 5,
        content:
          "I went from open mics to paid gigs in 3 weeks. The community here actually cares!",
        featured: true,
        verified: true,
        stats: {
          bookings: 12,
          earnings: "$4,200",
          joinedDate: "2024-01-15",
        },
      },
      {
        userId: "mock_2",
        userName: "The Loft",
        userRole: "Music Venue",
        userCity: "Chicago, IL",
        rating: 5,
        content:
          "Found our house band and 90% of featured artists here. Game changer for our programming.",
        featured: true,
        verified: true,
        stats: {
          bookings: 45,
          earnings: "$28,000",
          joinedDate: "2023-11-20",
        },
      },
      // Add more mock testimonials...
    ];

    for (const testimonial of mockTestimonials) {
      await ctx.db.insert("testimonials", {
        ...testimonial,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    return mockTestimonials.length;
  },
});
