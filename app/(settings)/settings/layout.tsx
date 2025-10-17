"use client";
import { UserButton } from "@clerk/nextjs";
import { Toaster } from "sonner";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";

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
    <div className="bg-background text-foreground h-full w-full overflow-scroll">
      <div className="flex items-center justify-between mt-4 mx-6">
        {/* Back Button */}
        <Logo />

        {/* User Button */}
        <UserButton
          appearance={{
            elements: {
              rootBox: "text-foreground",
              userButtonTrigger: "text-foreground hover:bg-accent",
              userButtonPopoverCard:
                "bg-card border-border text-card-foreground",
              userPreviewMainIdentifier: "text-card-foreground",
              userPreviewSecondaryIdentifier: "text-muted-foreground",
              userButtonPopoverActionButton:
                "text-card-foreground hover:bg-accent",
              userButtonPopoverActionButtonText: "text-card-foreground",
              userButtonPopoverFooter: "bg-muted",
            },
          }}
        />
      </div>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          classNames: {
            toast: "bg-card border-border text-card-foreground",
            title: "text-card-foreground",
            description: "text-muted-foreground",
            actionButton:
              "bg-primary text-primary-foreground hover:bg-primary/90",
            cancelButton: "bg-muted text-muted-foreground hover:bg-muted/80",
            closeButton: "bg-muted text-muted-foreground hover:bg-muted/80",
          },
        }}
      />

      {/* <NotificationHandler /> */}
      {children}
    </div>
  );
}
