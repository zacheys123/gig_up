import { MobileNavigation } from "@/components/(main)/MobileNav";
import MobileSheet from "@/components/MobileSheet";

import { UserButton } from "@clerk/nextjs";

import { Toaster } from "sonner";

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
      <div className="flex items-center justify-between mt-4 mx-6  ">
        <MobileNavigation />
      </div>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
        }}
      />
      {/* <NotificationHandler /> */}
      {chat}
      {reviews}
      {children}
    </div>
  );
}
