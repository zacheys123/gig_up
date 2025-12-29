// app/provider.tsx (remove StatusBanner from here)
"use client";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ThemeProvider as NextThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { NotificationSystemProvider } from "@/hooks/useNotifications";
import { ChatProvider } from "./context/ChatContext";
// REMOVE: import { StatusBanner } from "@/components/StatusBanner";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ClerkProvider
        publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
        signInForceRedirectUrl="/"
        signUpForceRedirectUrl="/about"
      >
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
          <ChatProvider>
            <NotificationSystemProvider>
              {/* REMOVE: <StatusBanner /> from here */}
              <Toaster position="top-right" />
              {children}
            </NotificationSystemProvider>
          </ChatProvider>
        </ConvexProviderWithClerk>
      </ClerkProvider>
    </NextThemeProvider>
  );
}
