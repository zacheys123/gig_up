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

const ContactPage = () => {
  const [open, setOpen] = useState<boolean>(true);
  const router = useRouter();
  
  const handleClose = () => {
    router.back();
    setOpen(false);
  };

  return (
    <div className="w-[100vw] h-[86%] overflow-y-auto flex justify-center items-center bg-background">
      <Dialog
        open={open}
        onOpenChange={handleClose}
      >
        <DialogContent className="border-border bg-background">
          <DialogHeader>
            <DialogTitle className="text-foreground">Email Us</DialogTitle>
          </DialogHeader>
          <EmailForm handleClose={handleClose} />
        </DialogContent>
        <DialogFooter></DialogFooter>
      </Dialog>
    </div>
  );
};

export default ContactPage;