// components/payments/PaymentHub.tsx
import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api"; // This is correct
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
  Upload,
  Camera,
  X,
  ScanLine,
  ChevronDown,
  ChevronUp,
  Shield,
  Star,
  TrendingUp,
  Download,
  Eye,
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
import { PaymentConfirmation } from "./PaymentConfirmation"; // Make sure this path is correct
import { toast } from "sonner";

interface PaymentHubProps {
  gigId: Id<"gigs">;
  userId: Id<"users">;
}

export function PaymentHub({ gigId, userId }: PaymentHubProps) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "confirm" | "history"
  >("overview");
  const [showFullOcr, setShowFullOcr] = useState(false);

  // Fetch all necessary data - FIXED PATHS
  const gig = useQuery(api.controllers.gigs.getGigById, { gigId });
  const { user } = useCurrentUser();
  const paymentStatus = useQuery(api.controllers.payments.getGigPaymentStatus, {
    gigId,
  }); // FIXED: added controllers.
  const gigMails = useQuery(api.controllers.payments.getGigMail, {
    // FIXED: added controllers.
    userId,
    gigId,
    limit: 20,
  });

  // Get the other party's info
  const otherParty = useQuery(
    api.controllers.user.getUserById,
    user?.isMusician ? { userId: gig?.postedBy } : { userId: gig?.bookedBy },
  );

  // Loading state
  if (!gig || !user || !paymentStatus || !gigMails) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  const isMusician = gig.bookedBy === userId;
  const isClient = gig.postedBy === userId;
  const userRole = isMusician ? "musician" : "client";
  const otherPartyName =
    otherParty?.firstname || otherParty?.username || "Loading...";
  const otherPartyRole = isMusician ? "Client" : "Musician";

  // Determine payment status
  const getPaymentStatus = () => {
    // Make sure paymentStatus has the right properties
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

  const StatusIcon = getPaymentStatus().icon;
  const status = getPaymentStatus();

  // Confidence color helper
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return "text-green-600 bg-green-50";
    if (confidence >= 70) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header with Gig Title and Quick Actions */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{gig.title}</h1>
          <p className="text-slate-500">Payment Management</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <MessageSquare className="w-4 h-4 mr-2" />
            Contact Support
          </Button>
        </div>
      </div>

      {/* Main Status Card */}
      <Card className="border-l-4 border-l-blue-500">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-full ${status.color}`}>
                <StatusIcon className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">{status.label}</h2>
                <p className="text-slate-500">{status.message}</p>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1 text-sm">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>{format(gig.date, "MMM d, yyyy")}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>
                      {gig.time?.start} - {gig.time?.end}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span>{gig.location || "Location TBD"}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500">Amount</p>
              <p className="text-3xl font-bold">
                KES {gig.price?.toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Two Column Layout: Left - Gig Details, Right - Party Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Gig Details */}
        <div className="md:col-span-2 space-y-6">
          {/* Tabs Navigation */}
          <Tabs
            value={activeTab}
            onValueChange={(v: any) => setActiveTab(v)}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="confirm">
                Confirm Payment
                {(!paymentStatus.musicianConfirmed ||
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
              {/* Payment Status Progress */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment Progress</CardTitle>
                  <CardDescription>
                    Current status of payment confirmations
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Musician Confirmation</span>
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
                      <span>Client Confirmation</span>
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
                    <div className="mt-4 p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-700">
                          System Verification Complete
                        </span>
                      </div>
                      {paymentStatus.verification.ocrConfidence && (
                        <div className="mt-2 text-sm">
                          <p>OCR Confidence:</p>
                          <div className="flex gap-4 mt-1">
                            <span>
                              Musician:{" "}
                              {
                                paymentStatus.verification.ocrConfidence
                                  .musician
                              }
                              %
                            </span>
                            <span>
                              Client:{" "}
                              {paymentStatus.verification.ocrConfidence.client}%
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* OCR Data Display (if available) */}
              {(paymentStatus.musicianConfirm?.extractedData ||
                paymentStatus.clientConfirm?.extractedData) && (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>OCR Extracted Data</CardTitle>
                      <CardDescription>
                        Automatically detected from screenshots
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowFullOcr(!showFullOcr)}
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
                          <p className="font-medium flex items-center gap-2">
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
                              <span className="text-slate-500">Tx ID:</span>{" "}
                              {paymentStatus.musicianConfirm.extractedData
                                .transactionId || "Not detected"}
                            </p>
                            <p>
                              <span className="text-slate-500">Amount:</span>{" "}
                              KES{" "}
                              {paymentStatus.musicianConfirm.extractedData.amount?.toLocaleString() ||
                                "Not detected"}
                            </p>
                            {showFullOcr && (
                              <>
                                <p>
                                  <span className="text-slate-500">Date:</span>{" "}
                                  {paymentStatus.musicianConfirm.extractedData
                                    .date || "Not detected"}
                                </p>
                                <p>
                                  <span className="text-slate-500">Time:</span>{" "}
                                  {paymentStatus.musicianConfirm.extractedData
                                    .time || "Not detected"}
                                </p>
                                <p>
                                  <span className="text-slate-500">
                                    Sender:
                                  </span>{" "}
                                  {paymentStatus.musicianConfirm.extractedData
                                    .sender || "Not detected"}
                                </p>
                                <p>
                                  <span className="text-slate-500">
                                    Receiver:
                                  </span>{" "}
                                  {paymentStatus.musicianConfirm.extractedData
                                    .receiver || "Not detected"}
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Client OCR */}
                      {paymentStatus.clientConfirm?.extractedData && (
                        <div className="space-y-2">
                          <p className="font-medium flex items-center gap-2">
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
                              <span className="text-slate-500">Tx ID:</span>{" "}
                              {paymentStatus.clientConfirm.extractedData
                                .transactionId || "Not detected"}
                            </p>
                            <p>
                              <span className="text-slate-500">Amount:</span>{" "}
                              KES{" "}
                              {paymentStatus.clientConfirm.extractedData.amount?.toLocaleString() ||
                                "Not detected"}
                            </p>
                            {showFullOcr && (
                              <>
                                <p>
                                  <span className="text-slate-500">Date:</span>{" "}
                                  {paymentStatus.clientConfirm.extractedData
                                    .date || "Not detected"}
                                </p>
                                <p>
                                  <span className="text-slate-500">Time:</span>{" "}
                                  {paymentStatus.clientConfirm.extractedData
                                    .time || "Not detected"}
                                </p>
                                <p>
                                  <span className="text-slate-500">
                                    Sender:
                                  </span>{" "}
                                  {paymentStatus.clientConfirm.extractedData
                                    .sender || "Not detected"}
                                </p>
                                <p>
                                  <span className="text-slate-500">
                                    Receiver:
                                  </span>{" "}
                                  {paymentStatus.clientConfirm.extractedData
                                    .receiver || "Not detected"}
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
                        <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                          <p className="text-sm font-medium mb-2">
                            Comparison Result:
                          </p>
                          <div className="grid grid-cols-3 gap-2 text-sm">
                            <div className="text-center">
                              <p className="text-slate-500">Transaction ID</p>
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
                              <p className="text-slate-500">Amount</p>
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
                                paymentStatus.clientConfirm.extractedData.amount
                                  ? "✓ Match"
                                  : "✗ Mismatch"}
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-slate-500">Confidence</p>
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
              {!paymentStatus.musicianConfirmed ||
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
                />
              ) : (
                <Card>
                  <CardContent className="p-6 text-center">
                    <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      All Confirmations Received
                    </h3>
                    <p className="text-slate-500 mb-4">
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
              <Card>
                <CardHeader>
                  <CardTitle>Payment Activity</CardTitle>
                  <CardDescription>
                    All payment-related updates for this gig
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {gigMails.length === 0 ? (
                      <p className="text-center text-slate-500 py-8">
                        No activity yet
                      </p>
                    ) : (
                      gigMails.map((mail) => (
                        <div
                          key={mail._id}
                          className="flex gap-3 p-3 bg-slate-50 rounded-lg"
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
                              <p className="font-medium">{mail.subject}</p>
                              <span className="text-xs text-slate-400">
                                {format(mail.createdAt, "MMM d, h:mm a")}
                              </span>
                            </div>
                            <p className="text-sm text-slate-600 mt-1">
                              {mail.message}
                            </p>
                            {mail.amount && (
                              <p className="text-sm font-medium mt-1">
                                KES {mail.amount.toLocaleString()}
                              </p>
                            )}
                            {mail.transactionId && (
                              <p className="text-xs font-mono text-slate-400 mt-1">
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
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column - Other Party Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{otherPartyRole} Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={otherParty?.picture} />
                  <AvatarFallback>{otherPartyName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{otherPartyName}</p>
                  <div className="flex items-center gap-1 text-sm text-slate-500">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span>{otherParty?.avgRating?.toFixed(1) || "New"}</span>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                {otherParty?.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span>{otherParty.phone}</span>
                  </div>
                )}
                {otherParty?.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span>{otherParty.email}</span>
                  </div>
                )}
                {otherParty?.city && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span>{otherParty.city}</span>
                  </div>
                )}
              </div>

              <Separator />

              {/* Trust/Reliability Stats */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Trust Score</span>
                  <span className="font-medium">
                    {otherParty?.trustScore || 50}%
                  </span>
                </div>
                <Progress
                  value={otherParty?.trustScore || 50}
                  className="h-2"
                />

                <div className="flex justify-between text-xs text-slate-400 mt-2">
                  <span>Completed: {otherParty?.completedGigsCount || 0}</span>
                  <span>Disputes: {otherParty?.disputesCount || 0}</span>
                </div>
              </div>

              <Button variant="outline" className="w-full">
                <MessageSquare className="w-4 h-4 mr-2" />
                Message {otherPartyRole}
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="ghost" className="w-full justify-start">
                <Eye className="w-4 h-4 mr-2" />
                View Gig Details
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Download className="w-4 h-4 mr-2" />
                Download Receipts
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <AlertCircle className="w-4 h-4 mr-2" />
                Report Issue
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
