// convex/auth.config.ts
export default {
  providers: [
    {
      domain: process.env.CLERK_ISSUER_URL || "https://your-app.clerk.accounts.dev",
      applicationID: "convex",
    },
  ],
};