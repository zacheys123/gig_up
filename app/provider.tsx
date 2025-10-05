"use client";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";

import { ThemeProvider as NextThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/providers/theme_providers";

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
const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ClerkProvider
        publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
        signInForceRedirectUrl="/authenticate"
  signUpForceRedirectUrl="/authenticate"
        appearance={{
          baseTheme: undefined,
          variables: {
            colorPrimary: "#6366f1",
            colorTextOnPrimaryBackground: "#ffffff",
            colorBackground: "#111827",
            colorInputBackground: "#1f2937",
            
            // Add these for text visibility
            colorText: "#f9fafb", // Main text color
            colorInputText: "#f9fafb", // Input text color
            colorTextSecondary: "#d1d5db", // Secondary text
   
          },
          elements: {
            // Main container
            rootBox: "w-full max-w-md mx-auto",
            card: "bg-gray-900 border border-gray-700 rounded-xl shadow-xl p-6",
            
            // Header
            header: "text-center mb-6",
            headerTitle: "text-2xl font-bold text-white mb-2",
            headerSubtitle: "text-gray-300 text-sm",
            
            // Forms
            form: "space-y-4",
            formField: "space-y-2",
            formFieldLabel: "text-sm font-medium text-gray-300 block mb-2",
            formFieldInput: `
              bg-gray-800 
              border border-gray-600 
              text-white 
              rounded-lg 
              px-3 py-2 
              w-full 
              focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 
              transition-colors
              placeholder-gray-500
            `,
            formFieldSuccessText: "text-green-400 text-sm mt-1",
            formFieldErrorText: "text-red-400 text-sm mt-1",
            
            // Buttons
            formButtonPrimary: `
              bg-indigo-600 
              hover:bg-indigo-700 
              text-white
              font-semibold
              py-3
              w-full
              rounded-lg
              transition-colors
              focus:ring-2 focus:ring-indigo-500
            `,
            
            // Social buttons
            socialButtonsBlockButton: `
              bg-gray-800 
              text-gray-200 
              border border-gray-700
              hover:bg-gray-700
              font-medium
              py-3
              w-full
              rounded-lg
              transition-colors
            `,
            
            // Footer
            footer: "text-center mt-6 pt-4 border-t border-gray-800",
            footerAction: "text-sm text-gray-300",
            footerActionLink: `
              text-indigo-400 
              hover:text-indigo-300
              font-medium
              transition-colors
            `,
            
            // Divider
            dividerLine: "bg-gray-700",
            dividerText: "text-gray-400 bg-gray-900 px-2",
            
            // Identity preview
            userButtonBox: "border border-gray-600 rounded-lg",
            userButtonTrigger: "bg-gray-800 hover:bg-gray-700 text-gray-200",
            
            // Alert messages
            alert: "bg-blue-900 border border-blue-700 text-blue-200 rounded-lg p-3",
            alertError: "bg-red-900 border border-red-700 text-red-200 rounded-lg p-3",
            
            // OTP input
            otpCodeField: "space-x-2",
            otpCodeFieldInput: `
              bg-gray-800 
              border border-gray-600 
              text-white 
              rounded-lg 
              text-center 
              font-semibold 
              focus:ring-2 focus:ring-indigo-500
            `,
            
            // Back link
            backLink: "text-indigo-400 hover:text-indigo-300 flex items-center gap-2 text-sm",
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