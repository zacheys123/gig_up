"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import EmailForm from "@/components/(main)/EmailForm";
import { cn } from "@/lib/utils";
import { useThemeColors } from "@/hooks/useTheme";
import GigLoader from "@/components/(main)/GigLoader";

const ContactPage = () => {
  const [open, setOpen] = useState<boolean>(true);
  const router = useRouter();
  const { colors, mounted, userTheme, effectiveTheme } = useThemeColors();

  const handleClose = () => {
    router.back();
    setOpen(false);
  };

  if (!mounted) {
    return <GigLoader color="border-gray-600" title="" />;
  }

  console.log("User theme from DB:", userTheme);
  console.log("Effective theme being used:", effectiveTheme);

  return (
    <div
      className={cn(
        "w-[100vw] h-[86%] overflow-y-auto flex justify-center items-center",
        colors.background
      )}
    >
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className={cn("border", colors.card, colors.cardBorder)}>
          <DialogHeader>
            <DialogTitle className={cn(colors.text)}>
              Email Us
              <span className={cn("text-xs ml-2", colors.textMuted)}>
                (Theme: {effectiveTheme})
              </span>
            </DialogTitle>
          </DialogHeader>
          <EmailForm handleClose={handleClose} />
        </DialogContent>
        <DialogFooter></DialogFooter>
      </Dialog>
    </div>
  );
};

export default ContactPage;
