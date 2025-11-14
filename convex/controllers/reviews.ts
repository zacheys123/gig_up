// convex/controllers/reviews.ts - FIXED VERSION
import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import {
  addReviewToMusician,
  addReviewToMyReviews,
  updateMusicianRating,
  getMusicianReviews,
  getUserWrittenReviews,
  removeReviewFromMusician,
} from "../musicianmetrics";

export const createReview = mutation({
  args: {
    gigId: v.id("gigs"),
    musicianId: v.id("users"),
    clientId: v.id("users"), // The person writing the review
    rating: v.number(),
    comment: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { gigId, musicianId, clientId, rating, comment } = args;

    // 1. Add review to musician's allReviews and get the review object
    const musicianReviewResult = await addReviewToMusician(ctx, musicianId, {
      gigId,
      clientId,
      rating,
      comment,
    });

    // 2. Add review to client's myReviews (reviews they've written)
    const myReviewResult = await addReviewToMyReviews(ctx, clientId, {
      gigId,
      musicianId,
      rating,
      comment,
    });

    return {
      musicianReviewId: musicianReviewResult.id, // This comes from addReviewToMusician return value
      myReviewId: myReviewResult.id, // This comes from addReviewToMyReviews return value
    };
  },
});

export const updateReview = mutation({
  args: {
    musicianId: v.id("users"),
    reviewId: v.string(), // The ID in the allReviews array
    rating: v.number(),
    comment: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { musicianId, reviewId, rating, comment } = args;

    const musician = await ctx.db.get(musicianId);
    if (!musician) throw new Error("Musician not found");

    // Update the specific review in allReviews array
    const updatedReviews = (musician.allreviews || []).map((review: any) =>
      review.id === reviewId
        ? { ...review, rating, comment: comment || review.comment }
        : review
    );

    await ctx.db.patch(musicianId, {
      allreviews: updatedReviews,
    });

    // Recalculate metrics
    return await updateMusicianRating(ctx, musicianId);
  },
});

export const deleteReview = mutation({
  args: {
    musicianId: v.id("users"),
    reviewId: v.string(),
  },
  handler: async (ctx, args) => {
    return await removeReviewFromMusician(ctx, args.musicianId, args.reviewId);
  },
});

// Query to get musician reviews
export const getReviewsForMusician = query({
  args: { musicianId: v.id("users") },
  handler: async (ctx, args) => {
    return await getMusicianReviews(ctx, args.musicianId);
  },
});

// Query to get reviews written by user
export const getReviewsWrittenByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await getUserWrittenReviews(ctx, args.userId);
  },
});
