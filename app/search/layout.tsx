import { DesktopNavigation } from "@/components/(main)/DesktopNav";
import { MobileNavigation } from "@/components/(main)/MobileNav";
import MobileSheet from "@/components/pages/MobileSheet";

import { UserButton } from "@clerk/nextjs";

export default function FriendLayout({
  chat,
  reviews,
  children,
}: Readonly<{
  children: React.ReactNode;
  chat: React.ReactNode;
  reviews: React.ReactNode;
}>) {
  return (
    <div className="bg-black h-full w-full overflow-scroll">
      {/* Mobile Navigation (hidden on desktop) */}
      <MobileNavigation />
      {/* Desktop Navigation (hidden on mobile) */}
      <DesktopNavigation />
      {/* <NotificationHandler /> */}
      {chat}
      {reviews}
      {children}
    </div>
  );
}
