
import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./provider";

export const metadata: Metadata = {
  title: "NewGigUp - Convex",
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
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}