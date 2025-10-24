import { DesktopNavigation } from "@/components/(main)/DesktopNav";
import { MobileNavigation } from "@/components/(main)/MobileNav";

export default function SearchLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="bg-black h-full w-full overflow-scroll">
      {/* Mobile Navigation (hidden on desktop) */}
      <MobileNavigation />

      {/* Desktop Navigation (hidden on mobile) */}
      <DesktopNavigation />
      {/* <NotificationHandler /> */}
      {children}
    </div>
  );
}
