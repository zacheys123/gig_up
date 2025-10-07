import { MobileNavigation } from "@/components/(main)/MobileNav";
import MobileSheet from "@/components/MobileSheet";
import UserNav from "@/components/profile/UsersNav";
import { UserButton } from "@clerk/nextjs";

import { Toaster } from "sonner";

export default function ProfileLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="bg-black h-full w-full overflow-scroll">
      <div className="flex items-center justify-between mt-4 mx-6  ">
        {/* <MobileSheet /> */}
        <MobileNavigation />
      </div>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
        }}
      />
      {/* <NotificationHandler /> */}
      {children} <UserNav />
    </div>
  );
}
