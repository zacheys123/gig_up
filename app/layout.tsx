// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./provider";
import { AuthSync } from "@/components/AuthSync";

export const metadata: Metadata = {
  title: "gigup",
  description: "Find your next gig",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <Providers>
          <AuthSync />
          {children}
        </Providers>
      </body>
    </html>
  );
}