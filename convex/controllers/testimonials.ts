import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { Doc } from "../_generated/dataModel";

// Add this interface for featuring criteria
const FEATURING_CRITERIA = {
  MIN_RATING: 4, // Minimum rating to be considered
  MIN_CONTENT_LENGTH: 50, // Minimum characters
  MIN_BOOKINGS: 1, // User must have at least 1 booking
  MAX_FEATURED: 6, // Maximum number of featured testimonials
} as const;

// Define testimonial type
type Testimonial = Doc<"testimonials">;

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
      earnings: v.number(),
      joinedDate: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    // Auto-feature based on criteria
    const shouldFeature = shouldAutoFeatureTestimonial(args);

    // Check if we have too many featured testimonials
    let featured = shouldFeature;
    if (shouldFeature) {
      const currentFeatured = await ctx.db
        .query("testimonials")
        .filter((q) => q.eq(q.field("featured"), true))
        .collect();

      // If we have too many, don't auto-feature new ones
      if (currentFeatured.length >= FEATURING_CRITERIA.MAX_FEATURED) {
        featured = false;
      }
    }

    const testimonialId = await ctx.db.insert("testimonials", {
      ...args,
      featured,
      verified: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // If auto-featured, also rotate old featured testimonials
    if (featured) {
      await rotateFeaturedTestimonials(ctx);
    }

    return { id: testimonialId, featured };
  },
});

// Helper function to determine if testimonial should be auto-featured
function shouldAutoFeatureTestimonial(args: any): boolean {
  // Primary criteria: High rating
  if (args.rating < FEATURING_CRITERIA.MIN_RATING) {
    return false;
  }

  // Content quality
  if (args.content.length < FEATURING_CRITERIA.MIN_CONTENT_LENGTH) {
    return false;
  }

  // User credibility (has bookings)
  if (args.stats.bookings < FEATURING_CRITERIA.MIN_BOOKINGS) {
    return false;
  }

  // Content contains positive keywords
  const positiveKeywords = [
    "great",
    "amazing",
    "excellent",
    "professional",
    "recommend",
    "helped",
    "success",
    "easy",
    "wonderful",
    "perfect",
    "love",
  ];
  const hasPositiveKeywords = positiveKeywords.some((keyword) =>
    args.content.toLowerCase().includes(keyword),
  );

  if (!hasPositiveKeywords) {
    return false;
  }

  return true;
}

// Rotate featured testimonials to prevent stale content
async function rotateFeaturedTestimonials(ctx: any) {
  const allFeatured = await ctx.db
    .query("testimonials")
    .filter((q: any) => q.eq(q.field("featured"), true))
    .order("desc")
    .collect();

  // If we have more than max, unfeature the oldest ones
  if (allFeatured.length > FEATURING_CRITERIA.MAX_FEATURED) {
    const toUnfeature = allFeatured.slice(FEATURING_CRITERIA.MAX_FEATURED);

    for (const testimonial of toUnfeature) {
      await ctx.db.patch(testimonial._id, {
        featured: false,
        updatedAt: Date.now(),
      });
    }
  }
}

// Get featured testimonials - PURE QUERY (no modifications)
export const getFeaturedTestimonials = query({
  args: {},
  handler: async (ctx) => {
    const testimonials = await ctx.db
      .query("testimonials")
      .filter((q) => q.eq(q.field("featured"), true))
      .order("desc")
      .take(FEATURING_CRITERIA.MAX_FEATURED);

    // If not enough featured, show high-rated ones (without changing them)
    if (testimonials.length < 4) {
      const highRated = await ctx.db
        .query("testimonials")
        .filter((q) => q.gte(q.field("rating"), FEATURING_CRITERIA.MIN_RATING))
        .order("desc")
        .take(4 - testimonials.length);

      // Return combined results (some may be duplicates)
      const allTestimonials = [...testimonials];
      const existingIds = new Set(testimonials.map((t) => t._id));

      for (const testimonial of highRated) {
        if (!existingIds.has(testimonial._id)) {
          allTestimonials.push(testimonial);
        }
      }

      return allTestimonials.slice(0, 4);
    }

    return testimonials;
  },
});

// New query to get testimonials that could be featured
export const getEligibleForFeaturing = query({
  args: {},
  handler: async (ctx) => {
    const testimonials = await ctx.db
      .query("testimonials")
      .filter((q) =>
        q.and(
          q.gte(q.field("rating"), FEATURING_CRITERIA.MIN_RATING),
          q.eq(q.field("featured"), false),
          q.neq(q.field("verified"), false),
        ),
      )
      .order("desc")
      .collect();

    // Score each testimonial for featuring potential
    return testimonials
      .map((t) => ({
        ...t,
        featuringScore: calculateFeaturingScore(t),
      }))
      .sort((a, b) => b.featuringScore - a.featuringScore);
  },
});

// Calculate a score for featuring
function calculateFeaturingScore(testimonial: Testimonial): number {
  let score = 0;

  // Rating score (5 stars = 100 points, 4 stars = 80 points, etc.)
  score += testimonial.rating * 20;

  // Content length score
  score += Math.min(testimonial.content.length / 5, 50); // Max 50 points

  // User credibility score
  score += Math.min(testimonial.stats.bookings * 5, 50); // Max 50 points

  // Age score (newer testimonials get higher scores)
  const daysOld = (Date.now() - testimonial.createdAt) / (1000 * 60 * 60 * 24);
  score += Math.max(100 - daysOld, 0); // Newer = higher score

  return score;
}

// Admin function to manually feature/unfeature
export const toggleFeatureTestimonial = mutation({
  args: {
    testimonialId: v.id("testimonials"),
    featured: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.testimonialId, {
      featured: args.featured,
      updatedAt: Date.now(),
    });
  },
});

// Add analytics for featuring decisions
export const getFeaturingAnalytics = query({
  args: {},
  handler: async (ctx) => {
    const allTestimonials = await ctx.db
      .query("testimonials")
      .order("desc")
      .collect();

    const featured = allTestimonials.filter((t) => t.featured);
    const notFeatured = allTestimonials.filter((t) => !t.featured);

    return {
      total: allTestimonials.length,
      featured: featured.length,
      notFeatured: notFeatured.length,
      avgRatingFeatured:
        featured.length > 0
          ? featured.reduce((sum, t) => sum + t.rating, 0) / featured.length
          : 0,
      avgRatingNotFeatured:
        notFeatured.length > 0
          ? notFeatured.reduce((sum, t) => sum + t.rating, 0) /
            notFeatured.length
          : 0,
      featuringCriteria: FEATURING_CRITERIA,
    };
  },
});

// Keep existing functions
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

// Update mock testimonials to be 4-5 stars
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
          "I went from open mics to paid gigs in 3 weeks. The community here actually cares! The platform is incredibly easy to use and the support team is amazing. Highly recommend to any musician looking to grow their career.",
        stats: {
          bookings: 12,
          earnings: 4200,
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
          "Found our house band and 90% of featured artists here. Game changer for our programming. The quality of performers is exceptional and the booking process is seamless. Our events have never been better!",
        stats: {
          bookings: 45,
          earnings: 28000,
          joinedDate: "2023-11-20",
        },
      },
      {
        userId: "mock_3",
        userName: "DJ Luna",
        userRole: "DJ",
        userCity: "Miami, FL",
        rating: 5,
        content:
          "Built my entire residency schedule through gigUp. Consistent bookings all season long. The payment system is reliable and the venue communication is professional. Perfect for serious DJs!",
        stats: {
          bookings: 28,
          earnings: 12600,
          joinedDate: "2024-02-10",
        },
      },
      {
        userId: "mock_4",
        userName: "Marcus",
        userRole: "Wedding Planner",
        userCity: "San Diego, CA",
        rating: 4,
        content:
          "Found the perfect acoustic duo for 15 weddings this year. Clients are thrilled with the music quality! The search filters make it easy to find exactly what we need. Great service overall.",
        stats: {
          bookings: 15,
          earnings: 9750,
          joinedDate: "2024-01-05",
        },
      },
      // Lower rated testimonials (won't be auto-featured)
      {
        userId: "mock_5",
        userName: "Alex",
        userRole: "Guitarist",
        userCity: "Austin, TX",
        rating: 3,
        content: "It's okay, could be better.",
        stats: {
          bookings: 2,
          earnings: 300,
          joinedDate: "2024-03-01",
        },
      },
    ];

    let insertedCount = 0;
    for (const testimonial of mockTestimonials) {
      // Only auto-feature high-rated ones
      const shouldFeature = shouldAutoFeatureTestimonial(testimonial);

      await ctx.db.insert("testimonials", {
        ...testimonial,
        featured: shouldFeature,
        verified: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      insertedCount++;
    }

    return insertedCount;
  },
});
export const getPlatformStats = query({
  args: {},
  handler: async (ctx) => {
    // Get all users
    const users = await ctx.db.query("users").collect();

    // Get all testimonials
    const testimonials = await ctx.db.query("testimonials").collect();

    // Calculate totals
    const totalArtists = users.filter((u) => u.isMusician).length;
    const totalVenues = users.filter((u) => u.isClient || u.isBooker).length;
    const totalUsers = users.length;

    // Calculate earnings from testimonials
    const totalEarnings = testimonials.reduce((sum, t) => {
      const earnings = t.stats.earnings || 0;
      return sum + earnings;
    }, 0);

    // Calculate success rate (example: percentage of users with testimonials)
    const usersWithTestimonials = new Set(testimonials.map((t) => t.userId));
    const successRate =
      totalUsers > 0
        ? ((usersWithTestimonials.size / totalUsers) * 100).toFixed(0)
        : 0;

    return {
      totalArtists,
      totalVenues,
      totalUsers,
      totalEarnings: `$${(totalEarnings / 1000000).toFixed(1)}M+`,
      successRate: `${successRate}%`,
      totalBookings: testimonials.reduce(
        (sum, t) => sum + (t.stats.bookings || 0),
        0,
      ),
    };
  },
});
