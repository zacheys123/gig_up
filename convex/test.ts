// convex/test.ts
import { mutation } from "./_generated/server";

export const testMutation = mutation({
  handler: async (ctx) => {
    return "Hello from Convex!";
  },
});
