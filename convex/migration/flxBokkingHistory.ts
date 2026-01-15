// convex/migrations/fixBookingHistory.ts

import { v } from "convex/values";
import { mutation } from "../_generated/server";

export const cleanBookingHistoryIsBandRole = mutation({
  args: {},
  handler: async (ctx) => {
    // Get all gigs
    const allGigs = await ctx.db.query("gigs").collect();
    let updatedCount = 0;

    for (const gig of allGigs) {
      if (gig.bookingHistory && gig.bookingHistory.length > 0) {
        let needsUpdate = false;
        const updatedHistory = gig.bookingHistory.map((entry: any) => {
          // Check if entry has isBandRole field
          if ("isBandRole" in entry) {
            needsUpdate = true;
            // Remove isBandRole field
            const { isBandRole, ...rest } = entry;
            return rest;
          }
          return entry;
        });

        if (needsUpdate) {
          await ctx.db.patch(gig._id, {
            bookingHistory: updatedHistory,
          });
          updatedCount++;
          console.log(`Updated gig: ${gig._id}`);
        }
      }
    }

    return {
      success: true,
      processedGigs: allGigs.length,
      updatedGigs: updatedCount,
    };
  },
});
