// convex/controllers/upload.ts
import { mutation } from "./_generated/server";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    // Convex built-in function to generate upload URL
    return await ctx.storage.generateUploadUrl();
  },
});
