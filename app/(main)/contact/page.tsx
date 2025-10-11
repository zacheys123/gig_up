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

const ContactPage = () => {
  const [open, setOpen] = useState<boolean>(true);
  const router = useRouter();
  const { colors, mounted } = useThemeColors();

  const handleClose = () => {
    router.back();
    setOpen(false);
  };

  if (!mounted) {
    return (
      <div
        className={cn(
          "w-[100vw] h-[86%] flex justify-center items-center",
          colors.background
        )}
      >
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

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
            <DialogTitle className={cn(colors.text)}>Email Us</DialogTitle>
          </DialogHeader>
          <EmailForm handleClose={handleClose} />
        </DialogContent>
        <DialogFooter></DialogFooter>
      </Dialog>
    </div>
  );
};

export default ContactPage;
