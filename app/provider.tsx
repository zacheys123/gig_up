"use client";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";

import { ThemeProvider as NextThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/providers/theme_providers";

// Create a safe Convex client that handles missing URLs
function getConvexClient() {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  
  if (!convexUrl) {
    console.warn("NEXT_PUBLIC_CONVEX_URL is not set. Convex will not work until you run 'npx convex dev'");
    // Return a dummy client that won't crash
    return new ConvexReactClient("https://dummy.convex.dev");
  }
  
  return new ConvexReactClient(convexUrl);
}

const convex = getConvexClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ClerkProvider
        publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
        // This ensures Clerk uses the correct JWT template for Convex
        appearance={{
          variables: {
            colorPrimary: "#3b82f6",
          },
        }}
      >
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
          <ThemeProvider>
            <Toaster position="top-center" />
            {children}
          </ThemeProvider>
        </ConvexProviderWithClerk>
      </ClerkProvider>
    </NextThemeProvider>
  );
}