"use client";
import FriendReviewComponent from "@/components/friend/FriendReviewComponent";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
const ReviewPage = () => {
  const [open, setOpen] = useState<boolean>(true);
  const router = useRouter();
  const handleClose = () => {
    router.back();
    setOpen(false);
  };
  return (
    <div className=" w-[100vw] h-[86%] bg-slate-900 overflow-y-auto">
      <Dialog
        open={open}
        onOpenChange={handleClose} // use onOpenChange to handle closing the dialog
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle style={{ color: "lightgray" }}>Reviews</DialogTitle>
          </DialogHeader>
          <FriendReviewComponent rev={false} />
        </DialogContent>
      </Dialog>{" "}
    </div>
  );
};

export default ReviewPage;
