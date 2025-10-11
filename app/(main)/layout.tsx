// app/(main)/layout.tsx
"use client";
import { Toaster } from "sonner";
import { useUser } from "@clerk/nextjs";
import { useEffect, useMemo } from "react";
import { MobileNavigation } from "@/components/(main)/MobileNav";
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
      <MobileNavigation />
      <TrialExpiredModal />
      <TrialRemainingModal />
      {contact}
      {children}
    </div>
  );
};

export default MainLayout;
