// convex/verifyGig.ts

import { v } from "convex/values";
import { mutation } from "../_generated/server";

// Regular mutation without auth middleware
export const verifyGigSecretKey = mutation({
  args: {
    gigId: v.id("gigs"),
    secretKey: v.string(),
    clerkId: v.string(), // Pass Clerk ID from client
  },
  handler: async (ctx, args) => {
    const { gigId, secretKey, clerkId } = args;

    // Find user by clerkId
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Get the gig
    const gig = await ctx.db.get(gigId);
    if (!gig) {
      throw new Error("Gig not found");
    }

    // Check if user is the gig owner
    if (gig.postedBy !== user._id) {
      throw new Error("Unauthorized: Not the gig owner");
    }

    // Verify secret key
    const isMatch = gig.secret === secretKey.trim();

    // Create security log
    try {
      await ctx.db.insert("securityLogs", {
        gigId,
        userId: user._id,
        clerkId: user.clerkId,
        action: isMatch ? "secret_key_verified" : "secret_key_failed",
        timestamp: Date.now(),
        success: isMatch,
      });
    } catch (error) {
      console.warn("Failed to create security log:", error);
    }

    return isMatch;
  },
});

export const requestSecretKeyReset = mutation({
  args: {
    gigId: v.id("gigs"),
    email: v.string(),
    clerkId: v.string(), // Pass Clerk ID from client
  },
  handler: async (ctx, args) => {
    const { gigId, email, clerkId } = args;

    // Find user by clerkId
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Get the gig
    const gig = await ctx.db.get(gigId);
    if (!gig) {
      throw new Error("Gig not found");
    }

    // Check if user is the gig owner
    if (gig.postedBy !== user._id) {
      throw new Error("Unauthorized: Not the gig owner");
    }

    // Verify email matches user's email
    if (user.email !== email) {
      throw new Error("Email does not match registered account");
    }

    // Generate reset token (6-digit code)
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetToken = `${Date.now()}-${resetCode}-${gigId}`;

    // Store reset token with expiration (15 minutes)
    await ctx.db.insert("secretKeyResets", {
      gigId,
      userId: user._id,
      clerkId: user.clerkId,
      resetToken,
      resetCode,
      email,
      expiresAt: Date.now() + 15 * 60 * 1000, // 15 minutes
      createdAt: Date.now(),
      used: false,
    });

    // Log reset request
    await ctx.db.insert("securityLogs", {
      gigId,
      userId: user._id,
      clerkId: user.clerkId,
      action: "secret_key_reset_requested",
      timestamp: Date.now(),
      success: true,
    });

    return resetToken;
  },
});

export const resetSecretKey = mutation({
  args: {
    gigId: v.id("gigs"),
    resetToken: v.string(),
    resetCode: v.string(),
    newSecretKey: v.string(),
    clerkId: v.string(), // Pass Clerk ID from client
  },
  handler: async (ctx, args) => {
    const { gigId, resetToken, resetCode, newSecretKey, clerkId } = args;

    // Find user by clerkId
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Get the gig
    const gig = await ctx.db.get(gigId);
    if (!gig) {
      throw new Error("Gig not found");
    }

    // Check if user is the gig owner
    if (gig.postedBy !== user._id) {
      throw new Error("Unauthorized: Not the gig owner");
    }

    // Find reset record using clerkId
    const resetRecords = await ctx.db
      .query("secretKeyResets")
      .withIndex("by_gig_and_clerk", (q) =>
        q.eq("gigId", gigId).eq("clerkId", user.clerkId)
      )
      .collect();

    const validReset = resetRecords.find(
      (record) =>
        record.resetToken === resetToken &&
        record.resetCode === resetCode &&
        !record.used &&
        record.expiresAt > Date.now()
    );

    if (!validReset) {
      throw new Error("Invalid or expired reset token");
    }

    // Validate new secret key
    if (newSecretKey.length < 6) {
      throw new Error("Secret key must be at least 6 characters");
    }

    // Update gig secret
    await ctx.db.patch(gigId, {
      secret: newSecretKey,
      updatedAt: Date.now(),
    });

    // Mark reset as used
    await ctx.db.patch(validReset._id, { used: true });

    // Log successful reset
    await ctx.db.insert("securityLogs", {
      gigId,
      userId: user._id,
      clerkId: user.clerkId,
      action: "secret_key_reset_success",
      timestamp: Date.now(),
      success: true,
    });

    return true;
  },
});

// Email sending function (no auth needed)
export const sendSecretKeyResetEmail = mutation({
  args: {
    toEmail: v.string(),
    gigTitle: v.string(),
    resetToken: v.string(),
    gigId: v.id("gigs"),
  },
  handler: async (ctx, args) => {
    const { toEmail, gigTitle, resetToken, gigId } = args;

    // Extract reset code from token
    const resetCode = resetToken.split("-")[1];

    // Example email content
    const emailContent = {
      to: toEmail,
      subject: `Secret Key Reset for "${gigTitle}"`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Secret Key Reset Request</h2>
          <p>You requested to reset the secret key for your gig: <strong>${gigTitle}</strong></p>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-size: 18px; font-weight: bold;">Reset Code:</p>
            <div style="font-size: 32px; font-weight: bold; letter-spacing: 4px; text-align: center; margin: 10px 0;">
              ${resetCode}
            </div>
            <p style="margin: 10px 0 0 0; color: #666;">
              Enter this code in the reset form to create a new secret key.
            </p>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            This code will expire in 15 minutes. If you didn't request this reset, please ignore this email.
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
          
          <p style="color: #999; font-size: 12px;">
            This is an automated message from GigPlatform.
          </p>
        </div>
      `,
    };

    // Log that email would be sent
    await ctx.db.insert("emailLogs", {
      toEmail,
      subject: emailContent.subject,
      gigId,
      timestamp: Date.now(),
      status: "sent",
    });

    console.log("Email would be sent to:", toEmail);
    console.log("Reset code:", resetCode);

    return { success: true, resetCode };
  },
});
