"use client";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";

import { ThemeProvider as NextThemeProvider } from "next-themes";
import { Toaster } from "sonner";

// Create a safe Convex client that handles missing URLs
// function getConvexClient() {
//   const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

//   if (!convexUrl) {
//     console.warn("NEXT_PUBLIC_CONVEX_URL is not set. Convex will not work until you run 'npx convex dev'");
//     // Return a dummy client that won't crash
//     return new ConvexReactClient("https://dummy.convex.dev");
//   }

//   return new ConvexReactClient(convexUrl);
// }

// const convex = getConvexClient();

const clerkAppearance = {
  baseTheme: undefined,
  variables: {
    colorPrimary: "#667eea",
    colorText: "#1f2937",
    colorTextSecondary: "#6b7280",
    colorBackground: "#ffffff",
    colorInputBackground: "#f8fafc",
    colorDanger: "#ef4444",
    colorSuccess: "#10b981",
  },
  elements: {
    card: {
      backgroundColor: "#ffffff",
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
      borderRadius: "12px",
    },
    headerTitle: {
      color: "#1f2937",
    },
    headerSubtitle: {
      color: "#6b7280",
    },
    formFieldInput: {
      backgroundColor: "#f8fafc",
      border: "1px solid #e5e7eb",
      borderRadius: "8px",
    },
    formButtonPrimary: {
      backgroundColor: "#667eea",
      borderRadius: "8px",
      color: "#ffffff",
    },
    userButtonPopoverCard: {
      backgroundColor: "#ffffff",
      border: "1px solid #e5e7eb",
      borderRadius: "12px",
    },
  },
};
const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ClerkProvider
        publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
        signInForceRedirectUrl="/"
        signUpForceRedirectUrl="/about"
        appearance={clerkAppearance}
      >
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
          <Toaster position="top-center" />
          {children}
        </ConvexProviderWithClerk>
      </ClerkProvider>
    </NextThemeProvider>
  );
}
