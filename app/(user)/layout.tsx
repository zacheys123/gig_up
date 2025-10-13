// app/profile/layout.tsx
import { MobileNavigation } from "@/components/(main)/MobileNav";
import UserNav from "@/components/profile/UsersNav";
import { UserButton } from "@clerk/nextjs";
import { Toaster } from "sonner";
import { DesktopNavigation } from "@/components/(main)/DesktopNav";
import DesktopUserNav from "@/components/profile/DesktopUsernav";

export default function ProfileLayout({
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
      <DesktopUserNav /> {/* Use the new desktop nav */}
      {/* Mobile Navigation */}
      <MobileNavigation />
      <DesktopNavigation />
      {/* Main Content */}
      <div className="lg:ml-80 min-h-screen">{children}</div>
      {/* Mobile Bottom Nav */}
      <div className="lg:hidden">
        <UserNav />
      </div>
    </div>
  );
}
