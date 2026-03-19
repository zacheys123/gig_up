// components/payments/PaymentHub.tsx
import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { format } from "date-fns";
import {
  DollarSign,
  CheckCircle,
  AlertCircle,
  Clock,
  User,
  Calendar,
  MapPin,
  Phone,
  Mail,
  MessageSquare,
  Download,
  Eye,
  Shield,
  Star,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PaymentConfirmation } from "./PaymentConfirmation";
import { toast } from "sonner";
import { useThemeColors } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { ChatIcon } from "../chat/ChatIcon";

interface PaymentHubProps {
  gigId: Id<"gigs">;
  userId: Id<"users">;
  autoOpenConfirm?: boolean;
}

export function PaymentHub({
  gigId,
  userId,
  autoOpenConfirm,
}: PaymentHubProps) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "confirm" | "history"
  >(autoOpenConfirm ? "confirm" : "overview");
  const [showFullOcr, setShowFullOcr] = useState(false);
  const { isDarkMode } = useThemeColors();

  // Fetch all necessary data independently
  const gig = useQuery(api.controllers.gigs.getGigById, { gigId });
  const { user } = useCurrentUser();
  const paymentStatus = useQuery(api.controllers.payments.getGigPaymentStatus, {
    gigId,
  });
  const gigMails = useQuery(api.controllers.payments.getGigMail, {
    userId,
    gigId,
    limit: 20,
  });

  // Get the other party's info - depends on gig and user
  const otherParty = useQuery(
    api.controllers.user.getUserById,
    gig && user
      ? user?.isMusician
        ? { userId: gig?.postedBy }
        : { userId: gig?.bookedBy }
      : "skip",
  );

  // Show toast when auto-opened to confirm tab
  useEffect(() => {
    if (autoOpenConfirm) {
      toast.info("Ready to confirm payment", {
        duration: 3000,
      });
    }
  }, [autoOpenConfirm]);

  // Handle loading states independently
  if (!gig) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div
          className={cn(
            "animate-spin rounded-full h-8 w-8 border-b-2",
            isDarkMode ? "border-blue-500" : "border-blue-600",
          )}
        />
        <p
          className={cn(
            "text-sm",
            isDarkMode ? "text-slate-400" : "text-slate-500",
          )}
        >
          Loading gig details...
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div
          className={cn(
            "animate-spin rounded-full h-8 w-8 border-b-2",
            isDarkMode ? "border-blue-500" : "border-blue-600",
          )}
        />
        <p
          className={cn(
            "text-sm",
            isDarkMode ? "text-slate-400" : "text-slate-500",
          )}
        >
          Loading user data...
        </p>
      </div>
    );
  }

  // Determine user role in this gig
  const isMusician = gig.bookedBy === userId;
  const isClient = gig.postedBy === userId;
  const userRole = isMusician ? "musician" : "client";
  const otherPartyRole = isMusician ? "Client" : "Musician";

  // Determine payment status
  const getPaymentStatus = () => {
    if (!paymentStatus) {
      return {
        label: "Loading...",
        color: "text-slate-400 bg-slate-100",
        icon: Clock,
        message: "Fetching payment status",
      };
    }

    const verified = paymentStatus?.verified || false;
    const match = paymentStatus?.match || false;
    const paymentStatusValue = paymentStatus?.paymentStatus || "pending";
    const musicianConfirmed = paymentStatus?.musicianConfirmed || false;
    const clientConfirmed = paymentStatus?.clientConfirmed || false;

    if (verified && match) {
      return {
        label: "Verified",
        color: "text-green-600 bg-green-50",
        icon: CheckCircle,
        message: "Payment successfully verified",
      };
    }
    if (paymentStatusValue === "disputed") {
      return {
        label: "Disputed",
        color: "text-red-600 bg-red-50",
        icon: AlertCircle,
        message: "Payment dispute - under review",
      };
    }
    if (musicianConfirmed && clientConfirmed) {
      return {
        label: "Both Confirmed",
        color: "text-yellow-600 bg-yellow-50",
        icon: Clock,
        message: "Awaiting system verification",
      };
    }
    if (musicianConfirmed) {
      return {
        label: "Musician Confirmed",
        color: "text-blue-600 bg-blue-50",
        icon: CheckCircle,
        message: isMusician ? "You confirmed" : "Musician confirmed receipt",
      };
    }
    if (clientConfirmed) {
      return {
        label: "Client Confirmed",
        color: "text-purple-600 bg-purple-50",
        icon: CheckCircle,
        message: isClient ? "You confirmed" : "Client confirmed payment",
      };
    }
    return {
      label: "Pending",
      color: "text-gray-600 bg-gray-50",
      icon: Clock,
      message: "No payment confirmations yet",
    };
  };

  const status = getPaymentStatus();
  const StatusIcon = status.icon;

  // Confidence color helper
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return "text-green-600 bg-green-50 border-green-200";
    if (confidence >= 70)
      return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header with Gig Title and Quick Actions */}
      <div className="flex items-start justify-between">
        <div>
          <h1
            className={cn(
              "text-2xl font-bold",
              isDarkMode ? "text-white" : "text-slate-900",
            )}
          >
            {gig.title}
          </h1>
          <p className={isDarkMode ? "text-slate-400" : "text-slate-500"}>
            Payment Management
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className={cn(
              isDarkMode ? "border-slate-700 hover:bg-slate-800" : "",
            )}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              isDarkMode ? "border-slate-700 hover:bg-slate-800" : "",
            )}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Support
          </Button>
        </div>
      </div>

      {/* Main Status Card */}
      <Card
        className={cn(
          "border-l-4 border-l-blue-500",
          isDarkMode
            ? "bg-slate-900 border-slate-800"
            : "bg-white border-slate-200",
        )}
      >
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              {!paymentStatus ? (
                // Skeleton loading for status
                <>
                  <div
                    className={cn(
                      "p-3 rounded-full animate-pulse",
                      isDarkMode ? "bg-slate-800" : "bg-slate-200",
                    )}
                  >
                    <div className="w-6 h-6" />
                  </div>
                  <div className="space-y-2">
                    <div
                      className={cn(
                        "h-6 w-32 rounded animate-pulse",
                        isDarkMode ? "bg-slate-800" : "bg-slate-200",
                      )}
                    />
                    <div
                      className={cn(
                        "h-4 w-48 rounded animate-pulse",
                        isDarkMode ? "bg-slate-800" : "bg-slate-200",
                      )}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className={`p-3 rounded-full ${status.color}`}>
                    <StatusIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h2
                      className={cn(
                        "text-xl font-semibold",
                        isDarkMode ? "text-white" : "text-slate-900",
                      )}
                    >
                      {status.label}
                    </h2>
                    <p
                      className={
                        isDarkMode ? "text-slate-400" : "text-slate-500"
                      }
                    >
                      {status.message}
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar
                          className={cn(
                            "w-4 h-4",
                            isDarkMode ? "text-slate-500" : "text-slate-400",
                          )}
                        />
                        <span
                          className={
                            isDarkMode ? "text-slate-300" : "text-slate-600"
                          }
                        >
                          {format(gig.date, "MMM d, yyyy")}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <Clock
                          className={cn(
                            "w-4 h-4",
                            isDarkMode ? "text-slate-500" : "text-slate-400",
                          )}
                        />
                        <span
                          className={
                            isDarkMode ? "text-slate-300" : "text-slate-600"
                          }
                        >
                          {gig.time?.start} - {gig.time?.end}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <MapPin
                          className={cn(
                            "w-4 h-4",
                            isDarkMode ? "text-slate-500" : "text-slate-400",
                          )}
                        />
                        <span
                          className={
                            isDarkMode ? "text-slate-300" : "text-slate-600"
                          }
                        >
                          {gig.location || "Location TBD"}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="text-right">
              <p className={isDarkMode ? "text-slate-400" : "text-slate-500"}>
                Amount
              </p>
              <p
                className={cn(
                  "text-3xl font-bold",
                  isDarkMode ? "text-white" : "text-slate-900",
                )}
              >
                KES {gig.price?.toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Gig Details */}
        <div className="md:col-span-2 space-y-6">
          {/* Tabs Navigation */}
          <Tabs
            value={activeTab}
            onValueChange={(v: any) => setActiveTab(v)}
            className="w-full"
          >
            <TabsList
              className={cn(
                "grid w-full grid-cols-3",
                isDarkMode ? "bg-slate-800" : "bg-slate-100",
              )}
            >
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="confirm">
                Confirm Payment
                {paymentStatus &&
                  (!paymentStatus.musicianConfirmed ||
                    !paymentStatus.clientConfirmed) && (
                    <Badge variant="destructive" className="ml-2">
                      1
                    </Badge>
                  )}
              </TabsTrigger>
              <TabsTrigger value="history">Activity History</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4 mt-4">
              {/* Payment Progress Card */}
              <Card
                className={isDarkMode ? "bg-slate-900 border-slate-800" : ""}
              >
                <CardHeader>
                  <CardTitle className={isDarkMode ? "text-white" : ""}>
                    Payment Progress
                  </CardTitle>
                  <CardDescription
                    className={isDarkMode ? "text-slate-400" : ""}
                  >
                    Current status of payment confirmations
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!paymentStatus ? (
                    // Skeleton loading
                    <div className="space-y-4">
                      <div
                        className={cn(
                          "h-2 w-full rounded animate-pulse",
                          isDarkMode ? "bg-slate-800" : "bg-slate-200",
                        )}
                      />
                      <div
                        className={cn(
                          "h-2 w-full rounded animate-pulse",
                          isDarkMode ? "bg-slate-800" : "bg-slate-200",
                        )}
                      />
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span
                            className={
                              isDarkMode ? "text-slate-300" : "text-slate-600"
                            }
                          >
                            Musician Confirmation
                          </span>
                          <span className="font-medium">
                            {paymentStatus.musicianConfirmed
                              ? "✅ Done"
                              : "⏳ Pending"}
                          </span>
                        </div>
                        <Progress
                          value={paymentStatus.musicianConfirmed ? 100 : 0}
                          className="h-2"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span
                            className={
                              isDarkMode ? "text-slate-300" : "text-slate-600"
                            }
                          >
                            Client Confirmation
                          </span>
                          <span className="font-medium">
                            {paymentStatus.clientConfirmed
                              ? "✅ Done"
                              : "⏳ Pending"}
                          </span>
                        </div>
                        <Progress
                          value={paymentStatus.clientConfirmed ? 100 : 0}
                          className="h-2"
                        />
                      </div>

                      {paymentStatus.verification && (
                        <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-green-600 dark:text-green-400" />
                            <span className="text-sm font-medium text-green-700 dark:text-green-300">
                              System Verification Complete
                            </span>
                          </div>
                          {paymentStatus.verification.ocrConfidence && (
                            <div className="mt-2 text-sm">
                              <p
                                className={
                                  isDarkMode
                                    ? "text-slate-300"
                                    : "text-slate-600"
                                }
                              >
                                OCR Confidence:
                              </p>
                              <div className="flex gap-4 mt-1">
                                <span
                                  className={isDarkMode ? "text-slate-300" : ""}
                                >
                                  Musician:{" "}
                                  {
                                    paymentStatus.verification.ocrConfidence
                                      .musician
                                  }
                                  %
                                </span>
                                <span
                                  className={isDarkMode ? "text-slate-300" : ""}
                                >
                                  Client:{" "}
                                  {
                                    paymentStatus.verification.ocrConfidence
                                      .client
                                  }
                                  %
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>

              {/* OCR Data Display */}
              {paymentStatus &&
                (paymentStatus.musicianConfirm?.extractedData ||
                  paymentStatus.clientConfirm?.extractedData) && (
                  <Card
                    className={
                      isDarkMode ? "bg-slate-900 border-slate-800" : ""
                    }
                  >
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle className={isDarkMode ? "text-white" : ""}>
                          OCR Extracted Data
                        </CardTitle>
                        <CardDescription
                          className={isDarkMode ? "text-slate-400" : ""}
                        >
                          Automatically detected from screenshots
                        </CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowFullOcr(!showFullOcr)}
                        className={isDarkMode ? "hover:bg-slate-800" : ""}
                      >
                        {showFullOcr ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-6">
                        {/* Musician OCR */}
                        {paymentStatus.musicianConfirm?.extractedData && (
                          <div className="space-y-2">
                            <p
                              className={cn(
                                "font-medium flex items-center gap-2",
                                isDarkMode ? "text-white" : "text-slate-900",
                              )}
                            >
                              <User className="w-4 h-4" /> Musician's Upload
                              <span
                                className={`text-xs px-2 py-1 rounded ${getConfidenceColor(
                                  paymentStatus.musicianConfirm.extractedData
                                    .confidence,
                                )}`}
                              >
                                {
                                  paymentStatus.musicianConfirm.extractedData
                                    .confidence
                                }
                                %
                              </span>
                            </p>
                            <div className="text-sm space-y-1">
                              <p>
                                <span
                                  className={
                                    isDarkMode
                                      ? "text-slate-400"
                                      : "text-slate-500"
                                  }
                                >
                                  Tx ID:
                                </span>{" "}
                                <span
                                  className={
                                    isDarkMode
                                      ? "text-slate-300"
                                      : "text-slate-700"
                                  }
                                >
                                  {paymentStatus.musicianConfirm.extractedData
                                    .transactionId || "Not detected"}
                                </span>
                              </p>
                              <p>
                                <span
                                  className={
                                    isDarkMode
                                      ? "text-slate-400"
                                      : "text-slate-500"
                                  }
                                >
                                  Amount:
                                </span>{" "}
                                <span
                                  className={
                                    isDarkMode
                                      ? "text-slate-300"
                                      : "text-slate-700"
                                  }
                                >
                                  KES{" "}
                                  {paymentStatus.musicianConfirm.extractedData.amount?.toLocaleString() ||
                                    "Not detected"}
                                </span>
                              </p>
                              {showFullOcr && (
                                <>
                                  <p>
                                    <span
                                      className={
                                        isDarkMode
                                          ? "text-slate-400"
                                          : "text-slate-500"
                                      }
                                    >
                                      Date:
                                    </span>{" "}
                                    <span
                                      className={
                                        isDarkMode
                                          ? "text-slate-300"
                                          : "text-slate-700"
                                      }
                                    >
                                      {paymentStatus.musicianConfirm
                                        .extractedData.date || "Not detected"}
                                    </span>
                                  </p>
                                  <p>
                                    <span
                                      className={
                                        isDarkMode
                                          ? "text-slate-400"
                                          : "text-slate-500"
                                      }
                                    >
                                      Time:
                                    </span>{" "}
                                    <span
                                      className={
                                        isDarkMode
                                          ? "text-slate-300"
                                          : "text-slate-700"
                                      }
                                    >
                                      {paymentStatus.musicianConfirm
                                        .extractedData.time || "Not detected"}
                                    </span>
                                  </p>
                                </>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Client OCR */}
                        {paymentStatus.clientConfirm?.extractedData && (
                          <div className="space-y-2">
                            <p
                              className={cn(
                                "font-medium flex items-center gap-2",
                                isDarkMode ? "text-white" : "text-slate-900",
                              )}
                            >
                              <User className="w-4 h-4" /> Client's Upload
                              <span
                                className={`text-xs px-2 py-1 rounded ${getConfidenceColor(
                                  paymentStatus.clientConfirm.extractedData
                                    .confidence,
                                )}`}
                              >
                                {
                                  paymentStatus.clientConfirm.extractedData
                                    .confidence
                                }
                                %
                              </span>
                            </p>
                            <div className="text-sm space-y-1">
                              <p>
                                <span
                                  className={
                                    isDarkMode
                                      ? "text-slate-400"
                                      : "text-slate-500"
                                  }
                                >
                                  Tx ID:
                                </span>{" "}
                                <span
                                  className={
                                    isDarkMode
                                      ? "text-slate-300"
                                      : "text-slate-700"
                                  }
                                >
                                  {paymentStatus.clientConfirm.extractedData
                                    .transactionId || "Not detected"}
                                </span>
                              </p>
                              <p>
                                <span
                                  className={
                                    isDarkMode
                                      ? "text-slate-400"
                                      : "text-slate-500"
                                  }
                                >
                                  Amount:
                                </span>{" "}
                                <span
                                  className={
                                    isDarkMode
                                      ? "text-slate-300"
                                      : "text-slate-700"
                                  }
                                >
                                  KES{" "}
                                  {paymentStatus.clientConfirm.extractedData.amount?.toLocaleString() ||
                                    "Not detected"}
                                </span>
                              </p>
                              {showFullOcr && (
                                <>
                                  <p>
                                    <span
                                      className={
                                        isDarkMode
                                          ? "text-slate-400"
                                          : "text-slate-500"
                                      }
                                    >
                                      Date:
                                    </span>{" "}
                                    <span
                                      className={
                                        isDarkMode
                                          ? "text-slate-300"
                                          : "text-slate-700"
                                      }
                                    >
                                      {paymentStatus.clientConfirm.extractedData
                                        .date || "Not detected"}
                                    </span>
                                  </p>
                                  <p>
                                    <span
                                      className={
                                        isDarkMode
                                          ? "text-slate-400"
                                          : "text-slate-500"
                                      }
                                    >
                                      Time:
                                    </span>{" "}
                                    <span
                                      className={
                                        isDarkMode
                                          ? "text-slate-300"
                                          : "text-slate-700"
                                      }
                                    >
                                      {paymentStatus.clientConfirm.extractedData
                                        .time || "Not detected"}
                                    </span>
                                  </p>
                                </>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Comparison Result */}
                      {paymentStatus.musicianConfirm?.extractedData &&
                        paymentStatus.clientConfirm?.extractedData && (
                          <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                            <p
                              className={cn(
                                "text-sm font-medium mb-2",
                                isDarkMode ? "text-white" : "text-slate-900",
                              )}
                            >
                              Comparison Result:
                            </p>
                            <div className="grid grid-cols-3 gap-2 text-sm">
                              <div className="text-center">
                                <p
                                  className={
                                    isDarkMode
                                      ? "text-slate-400"
                                      : "text-slate-500"
                                  }
                                >
                                  Transaction ID
                                </p>
                                <p
                                  className={
                                    paymentStatus.musicianConfirm.extractedData
                                      .transactionId ===
                                    paymentStatus.clientConfirm.extractedData
                                      .transactionId
                                      ? "text-green-600"
                                      : "text-red-600"
                                  }
                                >
                                  {paymentStatus.musicianConfirm.extractedData
                                    .transactionId ===
                                  paymentStatus.clientConfirm.extractedData
                                    .transactionId
                                    ? "✓ Match"
                                    : "✗ Mismatch"}
                                </p>
                              </div>
                              <div className="text-center">
                                <p
                                  className={
                                    isDarkMode
                                      ? "text-slate-400"
                                      : "text-slate-500"
                                  }
                                >
                                  Amount
                                </p>
                                <p
                                  className={
                                    paymentStatus.musicianConfirm.extractedData
                                      .amount ===
                                    paymentStatus.clientConfirm.extractedData
                                      .amount
                                      ? "text-green-600"
                                      : "text-red-600"
                                  }
                                >
                                  {paymentStatus.musicianConfirm.extractedData
                                    .amount ===
                                  paymentStatus.clientConfirm.extractedData
                                    .amount
                                    ? "✓ Match"
                                    : "✗ Mismatch"}
                                </p>
                              </div>
                              <div className="text-center">
                                <p
                                  className={
                                    isDarkMode
                                      ? "text-slate-400"
                                      : "text-slate-500"
                                  }
                                >
                                  Confidence
                                </p>
                                <p
                                  className={
                                    paymentStatus.musicianConfirm.extractedData
                                      .confidence >= 70 &&
                                    paymentStatus.clientConfirm.extractedData
                                      .confidence >= 70
                                      ? "text-green-600"
                                      : "text-yellow-600"
                                  }
                                >
                                  {paymentStatus.musicianConfirm.extractedData
                                    .confidence >= 70 &&
                                  paymentStatus.clientConfirm.extractedData
                                    .confidence >= 70
                                    ? "✓ Good"
                                    : "⚠ Low"}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                    </CardContent>
                  </Card>
                )}
            </TabsContent>

            {/* Confirm Payment Tab */}
            <TabsContent value="confirm" className="mt-4">
              {!paymentStatus ? (
                <Card
                  className={isDarkMode ? "bg-slate-900 border-slate-800" : ""}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center justify-center py-8">
                      <div
                        className={cn(
                          "animate-spin rounded-full h-8 w-8 border-b-2",
                          isDarkMode ? "border-blue-500" : "border-blue-600",
                        )}
                      />
                      <p
                        className={cn(
                          "mt-4 text-sm",
                          isDarkMode ? "text-slate-400" : "text-slate-500",
                        )}
                      >
                        Loading payment status...
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : !paymentStatus.musicianConfirmed ||
                !paymentStatus.clientConfirmed ? (
                <PaymentConfirmation
                  gigId={gigId}
                  userRole={userRole}
                  gigTitle={gig.title}
                  expectedAmount={gig.price}
                  onConfirmed={() => {
                    setActiveTab("overview");
                    toast.success("Payment confirmation submitted!");
                  }}
                  isDarkMode={isDarkMode}
                />
              ) : (
                <Card
                  className={isDarkMode ? "bg-slate-900 border-slate-800" : ""}
                >
                  <CardContent className="p-6 text-center">
                    <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                    <h3
                      className={cn(
                        "text-lg font-semibold mb-2",
                        isDarkMode ? "text-white" : "text-slate-900",
                      )}
                    >
                      All Confirmations Received
                    </h3>
                    <p
                      className={cn(
                        "mb-4",
                        isDarkMode ? "text-slate-400" : "text-slate-500",
                      )}
                    >
                      Both parties have confirmed. Waiting for system
                      verification.
                    </p>
                    <Button onClick={() => setActiveTab("overview")}>
                      View Status
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Activity History Tab */}
            <TabsContent value="history" className="space-y-4 mt-4">
              {!gigMails ? (
                <Card
                  className={isDarkMode ? "bg-slate-900 border-slate-800" : ""}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center justify-center py-8">
                      <div
                        className={cn(
                          "animate-spin rounded-full h-8 w-8 border-b-2",
                          isDarkMode ? "border-blue-500" : "border-blue-600",
                        )}
                      />
                      <p
                        className={cn(
                          "mt-4 text-sm",
                          isDarkMode ? "text-slate-400" : "text-slate-500",
                        )}
                      >
                        Loading activity history...
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card
                  className={isDarkMode ? "bg-slate-900 border-slate-800" : ""}
                >
                  <CardHeader>
                    <CardTitle className={isDarkMode ? "text-white" : ""}>
                      Payment Activity
                    </CardTitle>
                    <CardDescription
                      className={isDarkMode ? "text-slate-400" : ""}
                    >
                      All payment-related updates for this gig
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {gigMails.length === 0 ? (
                        <p
                          className={cn(
                            "text-center py-8",
                            isDarkMode ? "text-slate-400" : "text-slate-500",
                          )}
                        >
                          No activity yet
                        </p>
                      ) : (
                        gigMails.map((mail) => (
                          <div
                            key={mail._id}
                            className={cn(
                              "flex gap-3 p-3 rounded-lg",
                              isDarkMode ? "bg-slate-800" : "bg-slate-50",
                            )}
                          >
                            <div className="mt-1">
                              {mail.type === "payment_verified" && (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              )}
                              {mail.type === "payment_dispute" && (
                                <AlertCircle className="w-4 h-4 text-red-600" />
                              )}
                              {mail.type === "payment_confirmed" && (
                                <DollarSign className="w-4 h-4 text-blue-600" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <p
                                  className={cn(
                                    "font-medium",
                                    isDarkMode
                                      ? "text-white"
                                      : "text-slate-900",
                                  )}
                                >
                                  {mail.subject}
                                </p>
                                <span
                                  className={cn(
                                    "text-xs",
                                    isDarkMode
                                      ? "text-slate-500"
                                      : "text-slate-400",
                                  )}
                                >
                                  {format(mail.createdAt, "MMM d, h:mm a")}
                                </span>
                              </div>
                              <p
                                className={cn(
                                  "text-sm mt-1",
                                  isDarkMode
                                    ? "text-slate-400"
                                    : "text-slate-600",
                                )}
                              >
                                {mail.message}
                              </p>
                              {mail.amount && (
                                <p
                                  className={cn(
                                    "text-sm font-medium mt-1",
                                    isDarkMode
                                      ? "text-white"
                                      : "text-slate-900",
                                  )}
                                >
                                  KES {mail.amount.toLocaleString()}
                                </p>
                              )}
                              {mail.transactionId && (
                                <p
                                  className={cn(
                                    "text-xs font-mono mt-1",
                                    isDarkMode
                                      ? "text-slate-500"
                                      : "text-slate-400",
                                  )}
                                >
                                  TX: {mail.transactionId}
                                </p>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column - Other Party Info */}
        <div className="space-y-6">
          {!otherParty ? (
            <Card className={isDarkMode ? "bg-slate-900 border-slate-800" : ""}>
              <CardContent className="p-6">
                <div className="flex items-center justify-center py-4">
                  <div
                    className={cn(
                      "animate-spin rounded-full h-6 w-6 border-b-2",
                      isDarkMode ? "border-blue-500" : "border-blue-600",
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card
                className={isDarkMode ? "bg-slate-900 border-slate-800" : ""}
              >
                <CardHeader>
                  <CardTitle className={isDarkMode ? "text-white" : ""}>
                    {otherPartyRole} Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={otherParty?.picture} />
                      <AvatarFallback
                        className={isDarkMode ? "bg-slate-800" : ""}
                      >
                        {otherParty?.firstname?.charAt(0) ||
                          otherParty?.username?.charAt(0) ||
                          "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p
                        className={cn(
                          "font-semibold",
                          isDarkMode ? "text-white" : "text-slate-900",
                        )}
                      >
                        {otherParty?.firstname ||
                          otherParty?.username ||
                          "Unknown"}
                      </p>
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span
                          className={
                            isDarkMode ? "text-slate-400" : "text-slate-500"
                          }
                        >
                          {otherParty?.trustStars?.toFixed(1) || "New"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Separator className={isDarkMode ? "bg-slate-800" : ""} />

                  <div className="space-y-2 text-sm">
                    {otherParty?.phone && (
                      <div className="flex items-center gap-2">
                        <Phone
                          className={cn(
                            "w-4 h-4",
                            isDarkMode ? "text-slate-500" : "text-slate-400",
                          )}
                        />
                        <span
                          className={
                            isDarkMode ? "text-slate-300" : "text-slate-600"
                          }
                        >
                          {otherParty.phone}
                        </span>
                      </div>
                    )}
                    {otherParty?.email && (
                      <div className="flex items-center gap-2">
                        <Mail
                          className={cn(
                            "w-4 h-4",
                            isDarkMode ? "text-slate-500" : "text-slate-400",
                          )}
                        />
                        <span
                          className={
                            isDarkMode ? "text-slate-300" : "text-slate-600"
                          }
                        >
                          {otherParty.email}
                        </span>
                      </div>
                    )}
                    {otherParty?.city && (
                      <div className="flex items-center gap-2">
                        <MapPin
                          className={cn(
                            "w-4 h-4",
                            isDarkMode ? "text-slate-500" : "text-slate-400",
                          )}
                        />
                        <span
                          className={
                            isDarkMode ? "text-slate-300" : "text-slate-600"
                          }
                        >
                          {otherParty.city}
                        </span>
                      </div>
                    )}
                  </div>

                  <Separator className={isDarkMode ? "bg-slate-800" : ""} />

                  {/* Trust/Reliability Stats */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span
                        className={
                          isDarkMode ? "text-slate-400" : "text-slate-500"
                        }
                      >
                        Trust Score
                      </span>
                      <span
                        className={cn(
                          "font-medium",
                          isDarkMode ? "text-white" : "text-slate-900",
                        )}
                      >
                        {otherParty?.trustScore || 50}%
                      </span>
                    </div>
                    <Progress
                      value={otherParty?.trustScore || 50}
                      className={cn(
                        "h-2",
                        isDarkMode ? "bg-slate-800" : "bg-slate-100",
                      )}
                    />

                    <div className="flex justify-between text-xs mt-2">
                      <span
                        className={
                          isDarkMode ? "text-slate-500" : "text-slate-400"
                        }
                      >
                        Completed: {otherParty?.completedGigsCount || 0}
                      </span>
                      <span
                        className={
                          isDarkMode ? "text-slate-500" : "text-slate-400"
                        }
                      >
                        Disputes: {otherParty?.disputesCount || 0}
                      </span>
                    </div>
                  </div>

                  <ChatIcon
                    userId={otherParty?._id}
                    showText={true}
                    text={`Message ${otherPartyRole}`}
                  />
                </CardContent>
              </Card>

              {/* Quick Actions Card */}
              <Card
                className={isDarkMode ? "bg-slate-900 border-slate-800" : ""}
              >
                <CardHeader>
                  <CardTitle className={isDarkMode ? "text-white" : ""}>
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start",
                      isDarkMode ? "hover:bg-slate-800 text-slate-300" : "",
                    )}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Gig Details
                  </Button>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start",
                      isDarkMode ? "hover:bg-slate-800 text-slate-300" : "",
                    )}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Receipts
                  </Button>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start",
                      isDarkMode ? "hover:bg-slate-800 text-slate-300" : "",
                    )}
                  >
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Report Issue
                  </Button>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
