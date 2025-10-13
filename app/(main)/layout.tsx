// app/(main)/layout.tsx
"use client";
import { Toaster } from "sonner";
import { useUser } from "@clerk/nextjs";
import { useEffect, useMemo } from "react";
import { MobileNavigation } from "@/components/(main)/MobileNav";
import { DesktopNavigation } from "@/components/(main)/DesktopNav"; // Add this import
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useCheckTrial } from "@/hooks/useCheckTrial";
import { TrialExpiredModal } from "@/components/dashboard/subscription/TrialExpired";
import { TrialRemainingModal } from "@/components/dashboard/subscription/TrialRemainingComp";

const MainLayout = ({
  contact,
  children,
}: Readonly<{
  children: React.ReactNode;
  contact: React.ReactNode;
}>) => {
  // Check trial status
  useCheckTrial();

  return (
    <div className="h-screen overflow-x-hidden">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 2000,
          className: "toast",
        }}
      />

      {/* Mobile Navigation (hidden on desktop) */}
      <MobileNavigation />

      {/* Desktop Navigation (hidden on mobile) */}
      <DesktopNavigation />

      <TrialExpiredModal />
      <TrialRemainingModal />
      {contact}

      {/* Main content with proper spacing for fixed navbars */}
      <div className="pt-16 lg:pt-0">
        {" "}
        {/* Mobile nav height is 4rem (16) */}
        {children}
      </div>
    </div>
  );
};

export default MainLayout;
