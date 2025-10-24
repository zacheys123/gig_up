"use client";
import { UserButton } from "@clerk/nextjs";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";
import { useThemeColors } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

export default function SettingsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const { colors } = useThemeColors();
  const handleBack = () => {
    router.back(); // Go back to previous page
    // OR use specific route:
    // router.push("/"); // Go to home page
    // router.push("/dashboard"); // Go to dashboard
  };

  return (
    <div className="bg-background text-foreground h-full w-full overflow-scroll">
      <div className="flex items-center justify-around mt-4 mx-6">
        {/* Back Button */}

        <button
          onClick={() => router.back()}
          className={cn(
            "flex items-center gap-2 p-2 rounded-lg transition-all duration-300",
            colors.hoverBg,
            colors.textMuted,
            "hover:text-opacity-100"
          )}
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Back</span>
        </button>
        <Logo />

        {/* User Button */}
        <UserButton
          appearance={{
            elements: {
              rootBox: "text-foreground",
              userButtonTrigger: "text-foreground hover:bg-accent",
              userButtonPopoverCard:
                colors.card + " border-border text-card-foreground",
              userPreviewMainIdentifier: colors.textMuted,
              userPreviewSecondaryIdentifier: colors.textMuted,
              userButtonPopoverActionButton: colors.textMuted + colors.hoverBg,

              userButtonPopoverActionButtonText: colors.textMuted,
              userButtonPopoverFooter: colors.background,
            },
          }}
        />
      </div>

      {/* <NotificationHandler /> */}
      {children}
    </div>
  );
}
