// convex/helpers/musicianMetrics.ts - FIXED WITH PROPER TYPES

import { v } from "convex/values";

// Type definitions
interface Review {
  id: string;
  gigId: any;
  rating: number;
  comment: string;
  createdAt: number;
  clientId?: any;
  musicianId?: any;
}

interface Musician {
  _id: any;
  allReviews?: Review[];
  myReviews?: Review[];
  avgRating?: number;
  totalReviews?: number;
  reliabilityScore?: number;
  completedGigsCount?: number;
  tier?: string;
  isMusician?: boolean;
}

interface Gig {
  _id: any;
  musicianId: any;
  status: string;
}

/**
 * Reusable function to update musician ratings and reliability
 * Uses allReviews field from user schema instead of separate reviews table
 */
export const updateMusicianMetrics = async (
  ctx: any,
  musicianId: any
): Promise<{
  avgRating: number;
  totalReviews: number;
  reliabilityScore: number;
  completedGigsCount: number;
}> => {
  // Get the musician with their allReviews array
  const musician = (await ctx.db.get(musicianId)) as Musician | null;
  if (!musician) throw new Error("Musician not found");

  // 1. Calculate average rating from allReviews array in user schema
  const reviews = musician.allReviews || [];
  const totalRating = reviews.reduce(
    (sum: number, review: Review) => sum + review.rating,
    0
  );
  const avgRating =
    reviews.length > 0
      ? Math.round((totalRating / reviews.length) * 10) / 10
      : 0;
  const totalReviews = reviews.length;

  // 2. Calculate reliability score from gig history
  const allGigs = (await ctx.db
    .query("gigs")
    .withIndex("by_musician", (q: any) => q.eq("musicianId", musicianId))
    .collect()) as Gig[];

  const completedGigs = allGigs.filter(
    (gig: Gig) => gig.status === "completed"
  );
  const completedGigsCount = completedGigs.length;

  // Reliability: completed gigs vs total accepted gigs (excluding cancelled by client)
  const acceptedGigs = allGigs.filter(
    (gig: Gig) =>
      gig.status !== "cancelled_by_client" && gig.status !== "pending"
  );

  const reliabilityScore =
    acceptedGigs.length > 0
      ? Math.round((completedGigs.length / acceptedGigs.length) * 100)
      : 80; // Default score for new musicians

  // 3. Update the musician's profile
  await ctx.db.patch(musicianId, {
    avgRating,
    totalReviews,
    reliabilityScore: Math.max(50, Math.min(100, reliabilityScore)), // Clamp between 50-100
    completedGigsCount,
    lastMetricsUpdate: Date.now(),
  });

  return {
    avgRating,
    totalReviews,
    reliabilityScore,
    completedGigsCount,
  };
};

/**
 * Quick update for just rating (when only reviews change)
 * Uses allReviews field from user schema
 */
export const updateMusicianRating = async (ctx: any, musicianId: any) => {
  const musician = (await ctx.db.get(musicianId)) as Musician | null;
  if (!musician) throw new Error("Musician not found");

  const reviews = musician.allReviews || [];
  const totalRating = reviews.reduce(
    (sum: number, review: Review) => sum + review.rating,
    0
  );
  const avgRating =
    reviews.length > 0
      ? Math.round((totalRating / reviews.length) * 10) / 10
      : 0;

  await ctx.db.patch(musicianId, {
    avgRating,
    totalReviews: reviews.length,
  });

  return { avgRating, totalReviews: reviews.length };
};

/**
 * Quick update for just reliability (when gig status changes)
 */
export const updateMusicianReliability = async (ctx: any, musicianId: any) => {
  const allGigs = (await ctx.db
    .query("gigs")
    .withIndex("by_musician", (q: any) => q.eq("musicianId", musicianId))
    .collect()) as Gig[];

  const completedGigs = allGigs.filter(
    (gig: Gig) => gig.status === "completed"
  );
  const acceptedGigs = allGigs.filter(
    (gig: Gig) =>
      gig.status !== "cancelled_by_client" && gig.status !== "pending"
  );

  const reliabilityScore =
    acceptedGigs.length > 0
      ? Math.round((completedGigs.length / acceptedGigs.length) * 100)
      : 80;

  const completedGigsCount = completedGigs.length;

  await ctx.db.patch(musicianId, {
    reliabilityScore: Math.max(50, Math.min(100, reliabilityScore)),
    completedGigsCount,
  });

  return { reliabilityScore, completedGigsCount };
};

/**
 * Add a review to musician's allReviews and update metrics
onvex/helpers/musicianMetrics.ts - FIXED RETURN TYPES

/**
 * Add a review to musician's allReviews and update metrics
 */
export const addReviewToMusician = async (
  ctx: any,
  musicianId: any,
  reviewData: {
    gigId: any;
    clientId: any;
    rating: number;
    comment?: string;
    createdAt?: number;
  }
): Promise<{
  id: string;
  metrics: { avgRating: number; totalReviews: number };
}> => {
  const musician = (await ctx.db.get(musicianId)) as Musician | null;
  if (!musician) throw new Error("Musician not found");

  const newReview: Review = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    gigId: reviewData.gigId,
    clientId: reviewData.clientId,
    rating: reviewData.rating,
    comment: reviewData.comment || "",
    createdAt: reviewData.createdAt || Date.now(),
  };

  const updatedReviews = [...(musician.allReviews || []), newReview];

  await ctx.db.patch(musicianId, {
    allReviews: updatedReviews,
  });

  // Update metrics and return both the review ID and metrics
  const metrics = await updateMusicianRating(ctx, musicianId);

  return {
    id: newReview.id,
    metrics,
  };
};

/**
 * Add a review to myReviews (reviews I've written about others)
 */
export const addReviewToMyReviews = async (
  ctx: any,
  userId: any,
  reviewData: {
    gigId: any;
    musicianId: any;
    rating: number;
    comment?: string;
    createdAt?: number;
  }
): Promise<Review> => {
  const user = (await ctx.db.get(userId)) as Musician | null;
  if (!user) throw new Error("User not found");

  const newReview: Review = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    gigId: reviewData.gigId,
    musicianId: reviewData.musicianId,
    rating: reviewData.rating,
    comment: reviewData.comment || "",
    createdAt: reviewData.createdAt || Date.now(),
  };

  const updatedMyReviews = [...(user.myReviews || []), newReview];

  await ctx.db.patch(userId, {
    myReviews: updatedMyReviews,
  });

  return newReview; // Return the full review object with id
};

/**
 * Remove a review from musician's allReviews and update metrics
 */
export const removeReviewFromMusician = async (
  ctx: any,
  musicianId: any,
  reviewId: string
): Promise<{ avgRating: number; totalReviews: number }> => {
  const musician = (await ctx.db.get(musicianId)) as Musician | null;
  if (!musician) throw new Error("Musician not found");

  const updatedReviews = (musician.allReviews || []).filter(
    (review: Review) => review.id !== reviewId
  );

  await ctx.db.patch(musicianId, {
    allReviews: updatedReviews,
  });

  // Update metrics and return them
  return await updateMusicianRating(ctx, musicianId);
};
/**
 * Get all reviews for a musician
 */
export const getMusicianReviews = async (
  ctx: any,
  musicianId: any
): Promise<Review[]> => {
  const musician = (await ctx.db.get(musicianId)) as Musician | null;
  return musician?.allReviews || [];
};

/**
 * Get all reviews written by a user
 */
export const getUserWrittenReviews = async (
  ctx: any,
  userId: any
): Promise<Review[]> => {
  const user = (await ctx.db.get(userId)) as Musician | null;
  return user?.myReviews || [];
};
