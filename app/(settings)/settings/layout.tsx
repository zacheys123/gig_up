import NotificationHandler from "@/components/NotificationHandler";
import MobileSheet from "@/components/pages/MobileSheet";
import UserNav from "@/components/user/UsersNav";
import { UserButton } from "@clerk/nextjs";

import { Toaster } from "sonner";

export default function SettingsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="bg-black h-full w-full overflow-scroll">
      <div className="flex items-center justify-between mt-4 mx-6  ">
        <MobileSheet />
        <UserButton />
      </div>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
        }}
      />
      <NotificationHandler />
      {children} <UserNav />
    </div>
  );
}
