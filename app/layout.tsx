// app/layout.tsx (simplified version)
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./provider";
import { AuthSync } from "@/components/AuthSync";
import { StatusBanner } from "@/components/StatusBanner";
import { GlobalActivityTracker } from "@/components/GlobalActivityTracker";

export const metadata: Metadata = {
  title: "Gigup",
  description: "New Gigup",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#f59e0b",
};

export default function RootLayout({
  children,
  chat,
}: {
  children: React.ReactNode;
  chat: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          {/* StatusBanner should be at the VERY TOP */}
          <StatusBanner />

          <GlobalActivityTracker />
          <AuthSync />

          {/* Main content */}
          {children}
          {chat}
        </Providers>
      </body>
    </html>
  );
}
