// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./provider";
import { AuthSync } from "@/components/AuthSync";
import { GigUpAssistant } from "@/components/ai/GigupAssistant";
import { NotificationSystemProvider } from "@/hooks/useNotifications";
import { NotificationToastContainer } from "@/components/notifications/NotificationToastContainer";

export const metadata: Metadata = {
  title: "Gigup",
  description: "New Gigup",
  manifest: "/manifest.json",
  themeColor: "#f59e0b",
  appleWebApp: {
    capable: true,
    title: "gigup",
    statusBarStyle: "default",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <AuthSync />{" "}
          <NotificationSystemProvider>
            {children} <NotificationToastContainer />
          </NotificationSystemProvider>
        </Providers>
      </body>
    </html>
  );
}
