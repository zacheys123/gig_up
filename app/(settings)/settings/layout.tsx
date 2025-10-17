"use client";
import { UserButton } from "@clerk/nextjs";
import { Toaster } from "sonner";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function SettingsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();

  const handleBack = () => {
    router.back(); // Go back to previous page
    // OR use specific route:
    // router.push("/"); // Go to home page
    // router.push("/dashboard"); // Go to dashboard
  };

  return (
    <div className="bg-black h-full w-full overflow-scroll">
      <div className="flex items-center justify-between mt-4 mx-6">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </button>

        {/* User Button */}
        <UserButton />
      </div>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
        }}
      />

      {/* <NotificationHandler /> */}
      {children}
    </div>
  );
}
