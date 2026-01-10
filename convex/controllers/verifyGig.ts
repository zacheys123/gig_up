// In your Convex gigs.ts file

export const verifyGigSecretKey = mutationWithAuth({
  args: {
    gigId: v.id("gigs"),
    secretKey: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const { gigId, secretKey, userId } = args;

    // Get the gig
    const gig = await ctx.db.get(gigId);
    if (!gig) {
      throw new Error("Gig not found");
    }

    // Check if user is the gig owner
    if (gig.postedBy !== userId) {
      throw new Error("Unauthorized");
    }

    // Verify secret key
    const isMatch = gig.secret === secretKey.trim();

    if (isMatch) {
      // Log successful verification
      await ctx.db.insert("securityLogs", {
        gigId,
        userId,
        action: "secret_key_verified",
        timestamp: Date.now(),
        ipAddress: ctx.auth.getSessionClaims()?.ipAddress || "unknown",
        userAgent: ctx.headers?.get("user-agent") || "unknown",
        success: true,
      });
    } else {
      // Log failed attempt
      await ctx.db.insert("securityLogs", {
        gigId,
        userId,
        action: "secret_key_failed",
        timestamp: Date.now(),
        ipAddress: ctx.auth.getSessionClaims()?.ipAddress || "unknown",
        userAgent: ctx.headers?.get("user-agent") || "unknown",
        success: false,
        metadata: { attempts: 1 },
      });
    }

    return isMatch;
  },
});

export const requestSecretKeyReset = mutationWithAuth({
  args: {
    gigId: v.id("gigs"),
    email: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const { gigId, email, userId } = args;

    // Get the gig
    const gig = await ctx.db.get(gigId);
    if (!gig) {
      throw new Error("Gig not found");
    }

    // Check if user is the gig owner
    if (gig.postedBy !== userId) {
      throw new Error("Unauthorized");
    }

    // Get user to verify email
    const user = await ctx.db.get(userId);
    if (!user || user.email !== email) {
      throw new Error("Email does not match registered account");
    }

    // Generate reset token (6-digit code)
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetToken = `${Date.now()}-${resetCode}-${gigId}`;

    // Store reset token with expiration (15 minutes)
    await ctx.db.insert("secretKeyResets", {
      gigId,
      userId,
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
      userId,
      action: "secret_key_reset_requested",
      timestamp: Date.now(),
      ipAddress: ctx.auth.getSessionClaims()?.ipAddress || "unknown",
      userAgent: ctx.headers?.get("user-agent") || "unknown",
      success: true,
    });

    return resetToken;
  },
});

export const resetSecretKey = mutationWithAuth({
  args: {
    gigId: v.id("gigs"),
    resetToken: v.string(),
    resetCode: v.string(),
    newSecretKey: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const { gigId, resetToken, resetCode, newSecretKey, userId } = args;

    // Get the gig
    const gig = await ctx.db.get(gigId);
    if (!gig) {
      throw new Error("Gig not found");
    }

    // Check if user is the gig owner
    if (gig.postedBy !== userId) {
      throw new Error("Unauthorized");
    }

    // Find reset record
    const resetRecords = await ctx.db
      .query("secretKeyResets")
      .withIndex("by_gig_and_user", (q) =>
        q.eq("gigId", gigId).eq("userId", userId)
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
      userId,
      action: "secret_key_reset_success",
      timestamp: Date.now(),
      ipAddress: ctx.auth.getSessionClaims()?.ipAddress || "unknown",
      userAgent: ctx.headers?.get("user-agent") || "unknown",
      success: true,
    });

    return true;
  },
});

// Email sending function
export const sendSecretKeyResetEmail = mutation({
  args: {
    toEmail: v.string(),
    gigTitle: v.string(),
    resetToken: v.string(),
    gigId: v.id("gigs"),
  },
  handler: async (ctx, args) => {
    const { toEmail, gigTitle, resetToken, gigId } = args;

    // In a real implementation, you would:
    // 1. Use an email service (SendGrid, AWS SES, etc.)
    // 2. Generate a secure reset link
    // 3. Send the email with instructions

    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-secret?token=${resetToken}&gigId=${gigId}`;

    // Example email content
    const emailContent = {
      to: toEmail,
      subject: `Secret Key Reset for "${gigTitle}"`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Secret Key Reset Request</h2>
          <p>You requested to reset the secret key for your gig: <strong>${gigTitle}</strong></p>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;">To reset your secret key, click the link below:</p>
            <a href="${resetLink}" style="display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; margin-top: 10px;">
              Reset Secret Key
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            This link will expire in 15 minutes. If you didn't request this reset, please ignore this email.
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
          
          <p style="color: #999; font-size: 12px;">
            This is an automated message from GigPlatform.
          </p>
        </div>
      `,
    };

    // Here you would actually send the email
    // await sendEmail(emailContent);

    console.log("Email would be sent:", emailContent);

    return true;
  },
});
