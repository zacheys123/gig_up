"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import { Textarea } from "../ui/textarea";
import { Loader2, Flag } from "lucide-react";
import { toast } from "sonner";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useCurrentUser } from "@/hooks/useCurrentUser";

const ReportButton = ({ userId }: { userId: string }) => {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useCurrentUser();
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/user/reports/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reportedUserId: userId,
          reason,
          additionalInfo: details,
          userid: user?.user?._id,
        }),
      });

      if (!res.ok) throw new Error("Failed to submit report");

      toast.success("Report submitted successfully", {
        description: "Our team will review your report shortly.",
        style: {
          background: "#f0fdf4",
          color: "#15803d",
          border: "1px solid #bbf7d0",
        },
      });
      setOpen(false);
      setReason("");
      setDetails("");
    } catch (error) {
      console.log(error);
      toast.error("Failed to submit report", {
        description: "Please try again later.",
        style: {
          background: "#fef2f2",
          color: "#b91c1c",
          border: "1px solid #fecaca",
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="bg-white hover:bg-gray-50 text-rose-600 hover:text-rose-700 border-rose-200 shadow-sm"
        >
          <Flag className="h-4 w-4 mr-2" />
          Report
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[325px] max-w-[365px] rounded-lg border-0 shadow-xl bg-gradient-to-br from-white to-gray-50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-rose-600">
            <Flag className="h-5 w-5" />
            Report User
          </DialogTitle>
          <DialogDescription className="text-gray-500">
            Help us keep the community safe by reporting inappropriate behavior.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="reason" className="text-right text-gray-600">
              Reason
            </Label>
            <Select onValueChange={setReason} value={reason} required>
              <SelectTrigger className="col-span-3 bg-white border-gray-200 hover:border-rose-200 focus:ring-rose-100">
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-200 shadow-lg">
                <SelectItem
                  value="Harassment"
                  className="hover:bg-rose-50 focus:bg-rose-50"
                >
                  Harassment
                </SelectItem>
                <SelectItem
                  value="Spam"
                  className="hover:bg-rose-50 focus:bg-rose-50"
                >
                  Spam
                </SelectItem>
                <SelectItem
                  value="Inappropriate Content"
                  className="hover:bg-rose-50 focus:bg-rose-50"
                >
                  Inappropriate Content
                </SelectItem>
                <SelectItem
                  value="Impersonation"
                  className="hover:bg-rose-50 focus:bg-rose-50"
                >
                  Impersonation
                </SelectItem>
                <SelectItem
                  value="Other"
                  className="hover:bg-rose-50 focus:bg-rose-50"
                >
                  Other
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="details" className="text-right mt-2 text-gray-600">
              Details
            </Label>
            <Textarea
              id="details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Please provide specific details..."
              className="col-span-3 min-h-[120px] bg-white border-gray-200 focus:border-rose-200 focus:ring-rose-100"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isSubmitting}
            className="text-gray-600 border-gray-300 hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!reason || isSubmitting}
            className="gap-2 bg-rose-600 hover:bg-rose-700 text-white shadow-sm hover:shadow-md transition-all"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Report"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReportButton;
