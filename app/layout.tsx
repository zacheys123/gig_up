// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./provider";
import { AuthSync } from "@/components/AuthSync";
import { GigUpAssistant } from "@/components/ai/GigupAssistant";
import { NotificationSystemProvider } from "@/hooks/useNotifications";
import { NotificationToastContainer } from "@/components/notifications/NotificationToastContainer";
import { GlobalActivityTracker } from "@/components/GlobalActivityTracker";

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
  chat,
}: {
  children: React.ReactNode;
  chat: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
      </head>
      <body>
        <Providers>
          <GlobalActivityTracker /> {/* Add this here */}
          <AuthSync />
          <NotificationSystemProvider>
            {children}
            {chat}
            <NotificationToastContainer />
          </NotificationSystemProvider>
        </Providers>
      </body>
    </html>
  );
}
