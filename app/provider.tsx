// app/provider.tsx
"use client";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ThemeProvider as NextThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { NotificationSystemProvider } from "@/hooks/useNotifications";
import { ChatProvider } from "./context/ChatContext";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

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
          <ChatProvider>
            <NotificationSystemProvider>
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 3000,
                  classNames: {
                    toast: "bg-card border-border text-card-foreground",
                    title: "text-card-foreground",
                    description: "text-muted-foreground",
                    actionButton:
                      "bg-primary text-primary-foreground hover:bg-primary/90",
                    cancelButton:
                      "bg-muted text-muted-foreground hover:bg-muted/80",
                    closeButton:
                      "bg-muted text-muted-foreground hover:bg-muted/80",
                  },
                }}
              />
              {children}
            </NotificationSystemProvider>
          </ChatProvider>
        </ConvexProviderWithClerk>
      </ClerkProvider>
    </NextThemeProvider>
  );
}
