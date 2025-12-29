// components/report/ReportButton.tsx
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
import {
  Loader2,
  Flag,
  AlertCircle,
  Shield,
  Ban,
  MessageSquare,
  AlertTriangle,
  HelpCircle,
} from "lucide-react";
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
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Badge } from "../ui/badge";

const ReportButton = ({ userId }: { userId: string }) => {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useCurrentUser();

  const createReport = useMutation(api.controllers.reports.createReport);

  const reportReasons = [
    {
      value: "harassment",
      label: "Harassment",
      description: "Bullying, threats, or abusive behavior",
      icon: <Ban className="h-4 w-4" />,
    },
    {
      value: "spam",
      label: "Spam",
      description: "Excessive messages or promotional content",
      icon: <AlertTriangle className="h-4 w-4" />,
    },
    {
      value: "inappropriate_content",
      label: "Inappropriate Content",
      description: "Offensive or explicit material",
      icon: <Shield className="h-4 w-4" />,
    },
    {
      value: "impersonation",
      label: "Impersonation",
      description: "Pretending to be someone else",
      icon: <MessageSquare className="h-4 w-4" />,
    },
    {
      value: "suspicious_activity",
      label: "Suspicious Activity",
      description: "Fraudulent or scam behavior",
      icon: <AlertCircle className="h-4 w-4" />,
    },
    {
      value: "other",
      label: "Other",
      description: "Any other concern",
      icon: <HelpCircle className="h-4 w-4" />,
    },
  ];

  const getReasonIcon = (value: string) => {
    return (
      reportReasons.find((r) => r.value === value)?.icon || (
        <Flag className="h-4 w-4" />
      )
    );
  };

  const handleSubmit = async () => {
    if (!user?.clerkId) {
      toast.error("Authentication Required", {
        description: "Please sign in to submit a report",
        icon: "🔒",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await createReport({
        reportedUserId: userId,
        reason,
        additionalInfo: details,
        category: "user_behavior",
        createdByClerkId: user.clerkId,
      });

      toast.success("Report Submitted", {
        description: "Our team will review this within 24 hours",
        icon: "✅",
        action: {
          label: "Dismiss",
          onClick: () => {},
        },
      });
      setOpen(false);
      setReason("");
      setDetails("");
    } catch (error: any) {
      console.error("Error creating report:", error);

      if (error.message.includes("already reported")) {
        toast.warning("Report Already Submitted", {
          description:
            "You've already reported this user recently. Please wait 24 hours.",
          icon: "⏰",
        });
      } else if (error.message.includes("cannot report yourself")) {
        toast.error("Self-Reporting Not Allowed", {
          description: "You cannot submit a report about your own account.",
          icon: "🚫",
        });
      } else {
        toast.error("Submission Failed", {
          description: "Please try again in a few moments",
          icon: "❌",
        });
      }
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
          className="group relative overflow-hidden bg-gradient-to-r from-white via-rose-50/50 to-white hover:from-rose-50 hover:via-rose-100 hover:to-rose-50 border-rose-200/80 hover:border-rose-300 text-rose-600 hover:text-rose-700 shadow-sm hover:shadow-md transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-rose-500/0 via-rose-500/5 to-rose-500/0 group-hover:from-rose-500/10 group-hover:via-rose-500/20 group-hover:to-rose-500/10 transition-all duration-500" />
          <Flag className="h-4 w-4 mr-2 transition-transform group-hover:scale-110" />
          <span className="relative font-medium">Report</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-w-[90vw] rounded-2xl border-0 shadow-2xl bg-gradient-to-br from-white via-white to-rose-50/30 p-0 overflow-hidden">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-rose-500 to-pink-500 p-6">
          <DialogHeader className="text-white">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <Flag className="h-6 w-6" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold">
                  Report User
                </DialogTitle>
                <DialogDescription className="text-white/90">
                  Help us maintain a safe community
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Reason Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="reason"
                className="text-sm font-semibold text-gray-700"
              >
                Reason for Report
              </Label>
              <Badge
                variant="outline"
                className="text-xs border-rose-200 text-rose-600"
              >
                Required
              </Badge>
            </div>

            <Select onValueChange={setReason} value={reason} required>
              <SelectTrigger className="h-12 bg-white/50 border-gray-200 hover:border-rose-200 focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-all">
                <div className="flex items-center gap-2">
                  {reason ? (
                    <>
                      {getReasonIcon(reason)}
                      <span>
                        {reportReasons.find((r) => r.value === reason)?.label}
                      </span>
                    </>
                  ) : (
                    <SelectValue placeholder="Select a reason..." />
                  )}
                </div>
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-200 shadow-xl rounded-xl">
                {reportReasons.map((reason) => (
                  <SelectItem
                    key={reason.value}
                    value={reason.value}
                    className="py-3 px-4 hover:bg-rose-50 focus:bg-rose-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-rose-500">{reason.icon}</div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-800">
                          {reason.label}
                        </div>
                        <div className="text-xs text-gray-500">
                          {reason.description}
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Details */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="details"
                className="text-sm font-semibold text-gray-700"
              >
                Additional Details
              </Label>
              <div className="text-xs text-gray-400">
                {details.length}/500 characters
              </div>
            </div>

            <div className="relative">
              <Textarea
                id="details"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Please provide specific details about the issue (e.g., what happened, when, how it affected you)..."
                className="min-h-[140px] bg-white/50 border-gray-200 focus:border-rose-300 focus:ring-2 focus:ring-rose-100 resize-none transition-all"
                maxLength={500}
              />
              <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                Optional but helpful
              </div>
            </div>
          </div>

          {/* Information Box */}
          <div className="bg-gradient-to-r from-blue-50/50 to-cyan-50/50 rounded-xl p-4 border border-blue-100">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <AlertCircle className="h-5 w-5 text-blue-600" />
              </div>
              <div className="space-y-1">
                <h4 className="font-semibold text-sm text-blue-800">
                  What happens next?
                </h4>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li className="flex items-start gap-1">
                    <span className="text-blue-500 mt-0.5">•</span>
                    Our moderation team reviews reports within 24-48 hours
                  </li>
                  <li className="flex items-start gap-1">
                    <span className="text-blue-500 mt-0.5">•</span>
                    All reports are confidential and anonymous
                  </li>
                  <li className="flex items-start gap-1">
                    <span className="text-blue-500 mt-0.5">•</span>
                    False reporting may result in account restrictions
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 pb-6 pt-4 bg-gradient-to-t from-white to-white/80 border-t border-gray-100">
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
              className="flex-1 border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-600 transition-all"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!reason || isSubmitting}
              className="flex-1 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 group"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Flag className="h-4 w-4 mr-2 transition-transform group-hover:scale-110" />
                  Submit Report
                </>
              )}
            </Button>
          </div>

          <p className="text-center text-xs text-gray-400 mt-4">
            By submitting, you agree to our{" "}
            <a
              href="/terms"
              className="text-rose-500 hover:text-rose-600 underline"
            >
              Community Guidelines
            </a>
          </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReportButton;
