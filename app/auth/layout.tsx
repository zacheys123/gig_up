import { DesktopNavigation } from "@/components/(main)/DesktopNav";
import { MobileNavigation } from "@/components/(main)/MobileNav";
import MobileSheet from "@/components/pages/MobileSheet";
import UserNav from "@/components/profile/UsersNav";
import { UserButton } from "@clerk/nextjs";

import { Toaster } from "sonner";

export default function SearchLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="bg-black h-full w-full overflow-scroll">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
        }}
      />
      {/* Mobile Navigation (hidden on desktop) */}
      <MobileNavigation />

      {/* Desktop Navigation (hidden on mobile) */}
      <DesktopNavigation />
      {/* <NotificationHandler /> */}
      {children}
    </div>
  );
}
