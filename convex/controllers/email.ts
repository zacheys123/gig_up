import { v } from "convex/values";
import { internalMutation } from "./_generated/server";

// Email template interface
interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

// Generate HTML email templates
const generateSecretKeyResetEmail = (data: {
  gigTitle: string;
  resetToken: string;
  resetLink: string;
  userEmail: string;
  expiryTime: string;
}): EmailTemplate => {
  const { gigTitle, resetToken, resetLink, userEmail, expiryTime } = data;

  return {
    subject: `🔐 Reset Your Secret Key for "${gigTitle}"`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Secret Key</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f9fafb;
          }
          .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          }
          .header {
            background: linear-gradient(135deg, #f97316 0%, #f59e0b 100%);
            padding: 32px;
            text-align: center;
            color: white;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 700;
          }
          .header p {
            margin: 8px 0 0;
            opacity: 0.9;
            font-size: 14px;
          }
          .content {
            padding: 32px;
          }
          .gig-info {
            background: linear-gradient(135deg, #fef3c7 0%, #fef9c3 100%);
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 24px;
            border-left: 4px solid #f59e0b;
          }
          .gig-info h2 {
            margin: 0 0 8px;
            font-size: 18px;
            color: #92400e;
          }
          .reset-section {
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
            border-radius: 8px;
            padding: 24px;
            margin-bottom: 24px;
            text-align: center;
            border: 1px solid #bae6fd;
          }
          .reset-code {
            font-family: 'Courier New', monospace;
            font-size: 32px;
            font-weight: 700;
            letter-spacing: 8px;
            background: white;
            padding: 16px;
            border-radius: 8px;
            margin: 16px 0;
            color: #0c4a6e;
            border: 2px solid #0ea5e9;
            display: inline-block;
          }
          .reset-button {
            display: inline-block;
            background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
            color: white;
            text-decoration: none;
            padding: 14px 32px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            margin: 16px 0;
            transition: all 0.2s ease;
          }
          .reset-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(14, 165, 233, 0.2);
          }
          .security-info {
            background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
            border-radius: 8px;
            padding: 20px;
            margin-top: 24px;
            border-left: 4px solid #64748b;
          }
          .security-info h3 {
            margin: 0 0 12px;
            font-size: 16px;
            color: #475569;
          }
          .security-info ul {
            margin: 0;
            padding-left: 20px;
            color: #64748b;
          }
          .security-info li {
            margin-bottom: 8px;
          }
          .footer {
            text-align: center;
            padding: 24px;
            color: #64748b;
            font-size: 14px;
            border-top: 1px solid #e2e8f0;
          }
          .footer a {
            color: #0ea5e9;
            text-decoration: none;
          }
          .divider {
            height: 1px;
            background: linear-gradient(90deg, transparent, #e2e8f0, transparent);
            margin: 24px 0;
          }
          .info-item {
            display: flex;
            align-items: center;
            margin-bottom: 12px;
            color: #475569;
          }
          .info-item svg {
            margin-right: 12px;
            color: #0ea5e9;
            flex-shrink: 0;
          }
          @media (max-width: 600px) {
            .content {
              padding: 20px;
            }
            .reset-code {
              font-size: 24px;
              letter-spacing: 4px;
              padding: 12px;
            }
            .reset-button {
              padding: 12px 24px;
            }
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <!-- Header -->
          <div class="header">
            <h1>🔐 Secret Key Reset</h1>
            <p>Secure access to your gig</p>
          </div>

          <!-- Content -->
          <div class="content">
            <p>Hello,</p>
            <p>You requested to reset the secret key for your gig. Use the information below to complete the reset process.</p>

            <!-- Gig Info -->
            <div class="gig-info">
              <h2>🎵 Gig Details</h2>
              <p><strong>Title:</strong> ${gigTitle}</p>
              <p><strong>Requested by:</strong> ${userEmail}</p>
              <p><strong>Request time:</strong> ${new Date().toLocaleString()}</p>
            </div>

            <!-- Reset Section -->
            <div class="reset-section">
              <h2>Reset Your Secret Key</h2>
              <p>Use the 6-digit code below in the verification modal:</p>
              
              <div class="reset-code">${resetToken.slice(-6)}</div>
              
              <p>Or click the button below to reset directly:</p>
              
              <a href="${resetLink}" class="reset-button" target="_blank">
                🔄 Reset Secret Key
              </a>
              
              <p><small>This link expires: ${expiryTime}</small></p>
            </div>

            <!-- Important Information -->
            <div class="divider"></div>
            
            <div class="info-item">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              <span><strong>Email:</strong> ${userEmail}</span>
            </div>
            
            <div class="info-item">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
              </svg>
              <span><strong>Expires in:</strong> 15 minutes</span>
            </div>
            
            <div class="info-item">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
              </svg>
              <span><strong>One-time use:</strong> Code can only be used once</span>
            </div>

            <!-- Security Info -->
            <div class="security-info">
              <h3>🔒 Security Tips</h3>
              <ul>
                <li>Never share this email or code with anyone</li>
                <li>Our team will never ask for your secret key</li>
                <li>If you didn't request this, please ignore this email</li>
                <li>Reset your key immediately if you suspect unauthorized access</li>
              </ul>
            </div>

            <div class="divider"></div>
            
            <p>Need help? <a href="mailto:support@gigplatform.com">Contact our support team</a></p>
          </div>

          <!-- Footer -->
          <div class="footer">
            <p>© ${new Date().getFullYear()} GigPlatform. All rights reserved.</p>
            <p>This is an automated security email. Please do not reply.</p>
            <p><a href="https://gigplatform.com/privacy">Privacy Policy</a> | <a href="https://gigplatform.com/security">Security</a></p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      SECRET KEY RESET REQUEST
      ========================

      Hello,

      You requested to reset the secret key for your gig: "${gigTitle}"

      GIG DETAILS:
      - Title: ${gigTitle}
      - Requested by: ${userEmail}
      - Request time: ${new Date().toLocaleString()}

      RESET INFORMATION:
      ------------------
      Reset Code: ${resetToken.slice(-6)}
      Reset Link: ${resetLink}
      Expires: ${expiryTime} (15 minutes from now)

      SECURITY TIPS:
      --------------
      1. Never share this code or link with anyone
      2. Our team will never ask for your secret key
      3. If you didn't request this, please ignore this email
      4. Reset your key immediately if you suspect unauthorized access

      NEED HELP?
      ----------
      Contact our support team: support@gigplatform.com

      ---
      © ${new Date().getFullYear()} GigPlatform
      This is an automated security email. Please do not reply.
    `,
  };
};

// Main email sending mutation
export const sendSecretKeyResetEmail = internalMutation({
  args: {
    toEmail: v.string(),
    gigTitle: v.string(),
    resetToken: v.string(),
    gigId: v.id("gigs"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const { toEmail, gigTitle, resetToken, gigId, userId } = args;

    try {
      // Generate reset link
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://your-app.com";
      const resetLink = `${baseUrl}/reset-secret?token=${resetToken}&gigId=${gigId}&userId=${userId}`;

      // Calculate expiry time
      const expiryTime = new Date(Date.now() + 15 * 60 * 1000).toLocaleString();

      // Generate email content
      const emailContent = generateSecretKeyResetEmail({
        gigTitle,
        resetToken,
        resetLink,
        userEmail: toEmail,
        expiryTime,
      });

      // Log email for development
      console.log("📧 Email would be sent:", {
        to: toEmail,
        subject: emailContent.subject,
        resetLink,
        resetCode: resetToken.slice(-6),
        expiryTime,
      });

      // In production, you would integrate with an email service
      await sendEmailWithService(toEmail, emailContent);

      // Log the email send
      await ctx.db.insert("emailLogs", {
        type: "secret_key_reset",
        toEmail,
        gigId,
        userId,
        subject: emailContent.subject,
        sentAt: Date.now(),
        status: "sent",
        metadata: {
          resetToken: resetToken.slice(-6),
          gigTitle,
          expiryTime,
        },
      });

      return true;
    } catch (error) {
      console.error("Error sending email:", error);

      // Log the failure
      await ctx.db.insert("emailLogs", {
        type: "secret_key_reset",
        toEmail,
        gigId,
        userId,
        subject: `Secret Key Reset for "${gigTitle}"`,
        sentAt: Date.now(),
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error",
      });

      throw new Error("Failed to send reset email");
    }
  },
});

// Helper function to send email with your preferred service
async function sendEmailWithService(
  toEmail: string,
  emailContent: EmailTemplate
) {
  // Choose your email service provider:

  // Option 1: Resend (Recommended for Next.js)
  if (process.env.RESEND_API_KEY) {
    const resend = await import("resend");
    const resendClient = new resend.Resend(process.env.RESEND_API_KEY);

    const { data, error } = await resendClient.emails.send({
      from: process.env.EMAIL_FROM || "GigPlatform <security@gigplatform.com>",
      to: toEmail,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
      tags: [
        { name: "category", value: "security" },
        { name: "type", value: "secret_key_reset" },
      ],
    });

    if (error) throw error;
    return data;
  }

  // Option 2: SendGrid
  else if (process.env.SENDGRID_API_KEY) {
    const sgMail = await import("@sendgrid/mail");
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const msg = {
      to: toEmail,
      from: process.env.EMAIL_FROM || "security@gigplatform.com",
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
      mailSettings: {
        sandboxMode: {
          enable: process.env.NODE_ENV === "development",
        },
      },
    };

    return await sgMail.send(msg);
  }

  // Option 3: AWS SES
  else if (process.env.AWS_SES_ACCESS_KEY_ID) {
    const AWS = await import("aws-sdk");

    const ses = new AWS.SES({
      accessKeyId: process.env.AWS_SES_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SES_SECRET_ACCESS_KEY,
      region: process.env.AWS_SES_REGION || "us-east-1",
    });

    const params = {
      Destination: {
        ToAddresses: [toEmail],
      },
      Message: {
        Body: {
          Html: {
            Charset: "UTF-8",
            Data: emailContent.html,
          },
          Text: {
            Charset: "UTF-8",
            Data: emailContent.text,
          },
        },
        Subject: {
          Charset: "UTF-8",
          Data: emailContent.subject,
        },
      },
      Source: process.env.EMAIL_FROM || "security@gigplatform.com",
    };

    return await ses.sendEmail(params).promise();
  }

  // Option 4: Nodemailer (for self-hosted SMTP)
  else if (process.env.SMTP_HOST) {
    const nodemailer = await import("nodemailer");

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    return await transporter.sendMail({
      from: process.env.EMAIL_FROM || "security@gigplatform.com",
      to: toEmail,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    });
  }

  // Development fallback
  else {
    console.log("📧 Development mode - Email content:", {
      to: toEmail,
      subject: emailContent.subject,
      html: emailContent.html.substring(0, 200) + "...",
    });

    // Simulate successful send
    return { id: "dev-" + Date.now(), status: "sent" };
  }
}

// // Additional email mutations for different types
// export const sendVerificationEmail = internalMutation({
//   args: {
//     toEmail: v.string(),
//     verificationToken: v.string(),
//     userId: v.id("users"),
//   },
//   handler: async (ctx, args) => {
//     // Similar implementation for email verification
//     // ...
//     return true;
//   },
// });

// export const sendBookingNotification = internalMutation({
//   args: {
//     toEmail: v.string(),
//     gigTitle: v.string(),
//     bookingId: v.id("bookings"),
//     action: v.union(
//       v.literal("booked"),
//       v.literal("cancelled"),
//       v.literal("updated")
//     ),
//   },
//   handler: async (ctx, args) => {
//     // Implementation for booking notifications
//     // ...
//     return true;
//   },
// });
