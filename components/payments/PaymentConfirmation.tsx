// components/payments/PaymentConfirmation.tsx

import React, { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import {
  Upload,
  Camera,
  CheckCircle,
  AlertCircle,
  X,
  ScanLine,
  Sparkles,
  Shield,
  CreditCard,
  Smartphone,
  Banknote,
  Landmark,
  FileText,
  Image,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ExtractedDataType } from "@/convex/payment";

interface PaymentConfirmationProps {
  gigId: string;
  userRole: "musician" | "client";
  gigTitle?: string;
  expectedAmount?: number;
  onConfirmed: () => void;
  isDarkMode: boolean;
}

// Helper function for conditional classes
const cn = (...classes: any[]) => {
  return classes.filter(Boolean).join(" ");
};

export function PaymentConfirmation({
  gigId,
  userRole,
  gigTitle,
  expectedAmount,
  onConfirmed,
  isDarkMode,
}: PaymentConfirmationProps) {
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<
    "mpesa" | "cash" | "bank" | "other"
  >("mpesa");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [ocrProcessing, setOcrProcessing] = useState(false);
  const [notes, setNotes] = useState("");
  const [ocrResult, setOcrResult] = useState<ExtractedDataType | null>(null);
  const [step, setStep] = useState<"upload" | "review">("upload");
  const [ocrError, setOcrError] = useState<string | null>(null);

  const confirmPayment = useMutation(api.controllers.payments.confirmPayment);
  const generateUploadUrl = useMutation(api.upload.generateUploadUrl);

  // Add payment status query to check if already confirmed
  const paymentStatus = useQuery(api.controllers.payments.getGigPaymentStatus, {
    gigId: gigId as any,
  });

  // Check if user has already confirmed
  const hasUserConfirmed =
    userRole === "musician"
      ? paymentStatus?.musicianConfirmed
      : paymentStatus?.clientConfirmed;

  // Add this state
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (paymentStatus !== undefined) {
      setIsChecking(false);
    }
  }, [paymentStatus]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setScreenshot(file);
    setOcrError(null);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    await processOCR(file);
  };

  const processOCR = async (file: File) => {
    setOcrProcessing(true);
    setOcrError(null);

    try {
      console.log(
        "Starting OCR for file:",
        file.name,
        "size:",
        file.size,
        "type:",
        file.type,
      );

      const formData = new FormData();
      formData.append("image", file);

      console.log("Sending request to /api/ocr/extract...");

      const response = await fetch("/api/ocr/extract", {
        method: "POST",
        body: formData,
      });

      console.log("Response status:", response.status, response.statusText);

      // Get the response text first for debugging
      const responseText = await response.text();
      console.log("Raw response text:", responseText.substring(0, 500));

      // Try to parse as JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Failed to parse response as JSON:", parseError);
        console.error("Raw response:", responseText);
        throw new Error(
          `Invalid JSON response from server: ${responseText.substring(0, 100)}`,
        );
      }

      if (!response.ok) {
        console.error("OCR API error:", data);
        throw new Error(
          data.error ||
            data.message ||
            `OCR failed with status ${response.status}`,
        );
      }

      if (!data.success) {
        console.warn("OCR extraction low confidence:", data);

        // Still set the data but show warning
        if (data.data) {
          setOcrResult({
            transactionId: data.data.transactionId,
            amount: data.data.amount,
            date: data.data.date,
            time: data.data.time,
            phoneNumber: data.data.phoneNumber,
            sender: data.data.sender,
            receiver: data.data.receiver,
            fullText: data.data.fullText,
            confidence: data.confidence?.overall || 0,
          });

          // Auto-fill amount if detected
          if (data.data.amount) {
            setAmount(data.data.amount.toString());
          }

          setStep("review");
          toast.warning(
            data.message ||
              "Low confidence detection - please verify all details",
          );
        } else {
          throw new Error(data.message || "Failed to extract payment details");
        }
      } else {
        console.log("OCR successful:", data);

        // Set OCR result
        setOcrResult({
          transactionId: data.data.transactionId,
          amount: data.data.amount,
          date: data.data.date,
          time: data.data.time,
          phoneNumber: data.data.phoneNumber,
          sender: data.data.sender,
          receiver: data.data.receiver,
          fullText: data.data.fullText,
          confidence: data.confidence?.overall || 0,
        });

        // Auto-fill amount if detected
        if (data.data.amount) {
          setAmount(data.data.amount.toString());
        }

        setStep("review");
        toast.success("Payment details extracted successfully!");
      }
    } catch (error) {
      console.error("OCR processing error details:", {
        error:
          error instanceof Error
            ? {
                message: error.message,
                stack: error.stack,
                name: error.name,
              }
            : error,
        file: file
          ? {
              name: file.name,
              size: file.size,
              type: file.type,
            }
          : null,
      });

      setOcrError(
        error instanceof Error ? error.message : "Failed to process receipt",
      );
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to process receipt image. Please try again.",
      );

      // Don't move to review step on error
      setStep("upload");
    } finally {
      setOcrProcessing(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90)
      return "text-green-500 bg-green-500/10 border-green-500/20";
    if (confidence >= 70)
      return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
    return "text-red-500 bg-red-500/10 border-red-500/20";
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case "mpesa":
        return <Smartphone className="w-4 h-4" />;
      case "cash":
        return <Banknote className="w-4 h-4" />;
      case "bank":
        return <Landmark className="w-4 h-4" />;
      default:
        return <CreditCard className="w-4 h-4" />;
    }
  };

  const handleSubmit = async () => {
    if (!screenshot || !amount) {
      toast.error("Please provide screenshot and amount");
      return;
    }

    setUploading(true);
    try {
      const uploadUrl = await generateUploadUrl();
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": screenshot.type },
        body: screenshot,
      });

      if (!result.ok) throw new Error("Upload failed");
      const { storageId } = await result.json();

      const clerkId = (window as any).Clerk?.user?.id;
      if (!clerkId) throw new Error("User not authenticated");

      await confirmPayment({
        gigId: gigId as any,
        role: userRole,
        confirmed: true,
        amount: parseFloat(amount),
        paymentMethod,
        clerkId,
        screenshot: storageId,
        notes: notes || undefined,
        extractedData: ocrResult
          ? {
              transactionId: ocrResult.transactionId ?? null,
              amount: ocrResult.amount,
              date: ocrResult.date,
              time: ocrResult.time,
              phoneNumber: ocrResult.phoneNumber,
              sender: ocrResult.sender,
              receiver: ocrResult.receiver,
              fullText: ocrResult.fullText,
              confidence: ocrResult.confidence,
            }
          : undefined,
      });

      toast.success("Payment confirmation submitted!");
      onConfirmed();
    } catch (error) {
      console.error("Confirmation failed:", error);
      toast.error("Failed to submit confirmation");
    } finally {
      setUploading(false);
    }
  };

  const resetUpload = () => {
    setScreenshot(null);
    setPreview(null);
    setOcrResult(null);
    setStep("upload");
    setAmount("");
    setOcrError(null);
  };

  const userLabel =
    userRole === "musician"
      ? "Confirm Payment Received"
      : "Confirm Payment Sent";

  // Add this loading UI before the already confirmed check
  if (isChecking) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="relative">
          <div
            className={cn(
              "w-12 h-12 border-4 rounded-full animate-spin",
              isDarkMode
                ? "border-blue-800/30 border-t-blue-500"
                : "border-blue-200 border-t-blue-600",
            )}
          />
        </div>
      </div>
    );
  }

  // If already confirmed, show different UI
  if (hasUserConfirmed) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "relative overflow-hidden rounded-2xl border p-8 text-center",
          isDarkMode
            ? "bg-slate-900/90 border-slate-800"
            : "bg-white/90 border-slate-200",
          "backdrop-blur-xl shadow-2xl",
        )}
      >
        {/* Background Decorations */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-emerald-500/5 pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-green-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl" />

        <div className="relative">
          <div
            className={cn(
              "w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6",
              isDarkMode ? "bg-green-500/20" : "bg-green-100",
            )}
          >
            <CheckCircle
              className={cn(
                "w-10 h-10",
                isDarkMode ? "text-green-400" : "text-green-600",
              )}
            />
          </div>

          <h3
            className={cn(
              "text-2xl font-bold mb-3",
              isDarkMode ? "text-white" : "text-slate-900",
            )}
          >
            Already Confirmed
          </h3>

          <p
            className={cn(
              "text-base mb-6 max-w-md mx-auto",
              isDarkMode ? "text-slate-400" : "text-slate-500",
            )}
          >
            You have already confirmed payment for this gig.
            {paymentStatus?.verified && " It has been verified successfully."}
            {paymentStatus?.paymentStatus === "disputed" &&
              " It is currently under dispute."}
          </p>

          <div className="flex gap-3 justify-center">
            <Button
              variant="outline"
              onClick={() =>
                (window.location.href = `/hub/gigs?tab=payments&gigId=${gigId}`)
              }
              className={cn(
                "px-6",
                isDarkMode
                  ? "border-slate-700 hover:bg-slate-800"
                  : "border-slate-200 hover:bg-slate-100",
              )}
            >
              View Status
            </Button>

            {paymentStatus?.paymentStatus === "disputed" && (
              <Button
                variant="destructive"
                onClick={() =>
                  (window.location.href = `/hub/gigs/${gigId}/dispute`)
                }
                className="px-6"
              >
                View Dispute
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative overflow-hidden rounded-2xl border p-6",
        isDarkMode
          ? "bg-slate-900/90 border-slate-800"
          : "bg-white/90 border-slate-200",
        "backdrop-blur-xl shadow-2xl",
      )}
    >
      {/* Background Decorations */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl" />

      {/* Header */}
      <div className="relative flex items-start gap-4 mb-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.1 }}
          className={cn(
            "p-3 rounded-xl",
            userRole === "musician"
              ? isDarkMode
                ? "bg-green-500/20"
                : "bg-green-100"
              : isDarkMode
                ? "bg-blue-500/20"
                : "bg-blue-100",
          )}
        >
          {userRole === "musician" ? (
            <CheckCircle
              className={cn(
                "w-6 h-6",
                isDarkMode ? "text-green-400" : "text-green-600",
              )}
            />
          ) : (
            <CheckCircle
              className={cn(
                "w-6 h-6",
                isDarkMode ? "text-blue-400" : "text-blue-600",
              )}
            />
          )}
        </motion.div>

        <div className="flex-1">
          <h3
            className={cn(
              "text-xl font-semibold",
              isDarkMode ? "text-white" : "text-slate-900",
            )}
          >
            {userLabel}
          </h3>
          <p
            className={cn(
              "text-sm mt-1",
              isDarkMode ? "text-slate-400" : "text-slate-500",
            )}
          >
            {step === "upload"
              ? "Upload a screenshot and we'll auto-detect the details"
              : "Review the detected information and confirm"}
          </p>
        </div>

        {/* Step Indicator */}
        <div
          className={cn(
            "px-3 py-1.5 rounded-full text-xs font-medium",
            isDarkMode
              ? "bg-slate-800 text-slate-300"
              : "bg-slate-100 text-slate-600",
          )}
        >
          Step {step === "upload" ? "1" : "2"} of 2
        </div>
      </div>

      {/* Expected Amount Banner */}
      {expectedAmount && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={cn(
            "relative mb-6 p-4 rounded-xl border overflow-hidden",
            isDarkMode
              ? "bg-blue-500/10 border-blue-500/20"
              : "bg-blue-50 border-blue-200",
          )}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent" />
          <div className="relative flex items-center gap-3">
            <Sparkles
              className={cn(
                "w-5 h-5",
                isDarkMode ? "text-blue-400" : "text-blue-600",
              )}
            />
            <div>
              <p
                className={cn(
                  "text-sm font-medium",
                  isDarkMode ? "text-blue-400" : "text-blue-700",
                )}
              >
                Expected Amount
              </p>
              <p
                className={cn(
                  "text-lg font-bold",
                  isDarkMode ? "text-white" : "text-slate-900",
                )}
              >
                KES {expectedAmount.toLocaleString()}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* OCR Error Display */}
      {ocrError && (
        <div className="relative mb-6 p-4 rounded-xl border border-red-500/20 bg-red-500/10">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <div>
              <p className="text-sm font-medium text-red-600 dark:text-red-400">
                OCR Failed
              </p>
              <p className="text-sm text-red-500/80">{ocrError}</p>
            </div>
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {step === "upload" ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            {/* Upload Area */}
            <div>
              <Label
                className={cn(
                  "text-sm font-medium mb-2 block",
                  isDarkMode ? "text-slate-300" : "text-slate-700",
                )}
              >
                Payment Screenshot
              </Label>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="relative"
              >
                <input
                  id="screenshot"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={ocrProcessing}
                />
                <label
                  htmlFor="screenshot"
                  className={cn(
                    "relative block w-full cursor-pointer rounded-xl border-2 border-dashed p-8 transition-all",
                    "group",
                    isDarkMode
                      ? "border-slate-700 hover:border-blue-500/50 bg-slate-800/50"
                      : "border-slate-200 hover:border-blue-500/50 bg-slate-50/50",
                    ocrProcessing && "pointer-events-none opacity-50",
                  )}
                >
                  <div className="flex flex-col items-center gap-3">
                    {ocrProcessing ? (
                      <>
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full border-4 border-blue-500/30 border-t-blue-500 animate-spin" />
                          <RefreshCw className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-5 h-5 text-blue-500 animate-pulse" />
                        </div>
                        <div className="text-center">
                          <p
                            className={cn(
                              "font-medium",
                              isDarkMode ? "text-white" : "text-slate-900",
                            )}
                          >
                            Processing OCR...
                          </p>
                          <p
                            className={cn(
                              "text-sm mt-1",
                              isDarkMode ? "text-slate-400" : "text-slate-500",
                            )}
                          >
                            Extracting payment details
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div
                          className={cn(
                            "p-3 rounded-full transition-colors",
                            isDarkMode
                              ? "bg-slate-700 group-hover:bg-slate-600"
                              : "bg-slate-200 group-hover:bg-slate-300",
                          )}
                        >
                          <Camera
                            className={cn(
                              "w-6 h-6",
                              isDarkMode ? "text-slate-300" : "text-slate-600",
                            )}
                          />
                        </div>
                        <div className="text-center">
                          <p
                            className={cn(
                              "font-medium",
                              isDarkMode ? "text-white" : "text-slate-900",
                            )}
                          >
                            Click to upload screenshot
                          </p>
                          <p
                            className={cn(
                              "text-sm mt-1",
                              isDarkMode ? "text-slate-400" : "text-slate-500",
                            )}
                          >
                            PNG, JPG up to 5MB
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </label>
              </motion.div>
            </div>

            {/* Preview */}
            {preview && !ocrProcessing && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative group"
              >
                <div
                  className={cn(
                    "absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity",
                  )}
                />
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full max-h-48 object-contain rounded-xl border"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={resetUpload}
                  className="absolute top-2 right-2"
                >
                  <X className="w-4 h-4" />
                </Button>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="review"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* OCR Results Card */}
            {ocrResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "rounded-xl border p-5",
                  isDarkMode
                    ? "bg-slate-800/50 border-slate-700"
                    : "bg-slate-50 border-slate-200",
                )}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <ScanLine
                      className={cn(
                        "w-5 h-5",
                        isDarkMode ? "text-blue-400" : "text-blue-600",
                      )}
                    />
                    <span
                      className={cn(
                        "font-medium",
                        isDarkMode ? "text-white" : "text-slate-900",
                      )}
                    >
                      OCR Detection
                    </span>
                  </div>
                  <span
                    className={cn(
                      "text-xs px-2 py-1 rounded-full border",
                      getConfidenceColor(ocrResult.confidence),
                    )}
                  >
                    {Math.round(ocrResult.confidence)}% Confidence
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p
                      className={cn(
                        "text-xs",
                        isDarkMode ? "text-slate-400" : "text-slate-500",
                      )}
                    >
                      Transaction ID
                    </p>
                    <p
                      className={cn(
                        "font-mono text-sm font-medium",
                        isDarkMode ? "text-white" : "text-slate-900",
                      )}
                    >
                      {ocrResult.transactionId || "—"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p
                      className={cn(
                        "text-xs",
                        isDarkMode ? "text-slate-400" : "text-slate-500",
                      )}
                    >
                      Amount
                    </p>
                    <p
                      className={cn(
                        "text-sm font-medium",
                        isDarkMode ? "text-white" : "text-slate-900",
                      )}
                    >
                      {ocrResult.amount ? `KES ${ocrResult.amount}` : "—"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p
                      className={cn(
                        "text-xs",
                        isDarkMode ? "text-slate-400" : "text-slate-500",
                      )}
                    >
                      Date
                    </p>
                    <p
                      className={cn(
                        "text-sm",
                        isDarkMode ? "text-slate-300" : "text-slate-700",
                      )}
                    >
                      {ocrResult.date || "—"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p
                      className={cn(
                        "text-xs",
                        isDarkMode ? "text-slate-400" : "text-slate-500",
                      )}
                    >
                      Time
                    </p>
                    <p
                      className={cn(
                        "text-sm",
                        isDarkMode ? "text-slate-300" : "text-slate-700",
                      )}
                    >
                      {ocrResult.time || "—"}
                    </p>
                  </div>
                </div>

                {ocrResult.confidence < 70 && (
                  <div className="mt-4 flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm text-yellow-700">
                      Low confidence - please verify all details
                    </span>
                  </div>
                )}
              </motion.div>
            )}

            {/* Amount Input */}
            <div className="space-y-2">
              <Label
                className={isDarkMode ? "text-slate-300" : "text-slate-700"}
              >
                Amount (KES)
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                  KES
                </span>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={cn(
                    "pl-12 h-12 text-lg",
                    isDarkMode
                      ? "bg-slate-800 border-slate-700 text-white"
                      : "bg-white border-slate-200 text-slate-900",
                  )}
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-3">
              <Label
                className={isDarkMode ? "text-slate-300" : "text-slate-700"}
              >
                Payment Method
              </Label>
              <RadioGroup
                value={paymentMethod}
                onValueChange={(v: any) => setPaymentMethod(v)}
                className="grid grid-cols-2 gap-3"
              >
                {[
                  { value: "mpesa", label: "M-Pesa", icon: Smartphone },
                  { value: "cash", label: "Cash", icon: Banknote },
                  { value: "bank", label: "Bank", icon: Landmark },
                  { value: "other", label: "Other", icon: CreditCard },
                ].map((method) => (
                  <div key={method.value}>
                    <RadioGroupItem
                      value={method.value}
                      id={method.value}
                      className="peer sr-only"
                    />
                    <label
                      htmlFor={method.value}
                      className={cn(
                        "flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all",
                        "peer-checked:border-blue-500 peer-checked:bg-blue-500/10",
                        isDarkMode
                          ? "border-slate-700 hover:border-slate-600"
                          : "border-slate-200 hover:border-slate-300",
                        paymentMethod === method.value &&
                          "border-blue-500 bg-blue-500/10",
                      )}
                    >
                      <method.icon
                        className={cn(
                          "w-4 h-4",
                          paymentMethod === method.value
                            ? "text-blue-500"
                            : isDarkMode
                              ? "text-slate-400"
                              : "text-slate-500",
                        )}
                      />
                      <span
                        className={cn(
                          "text-sm",
                          isDarkMode ? "text-slate-300" : "text-slate-700",
                        )}
                      >
                        {method.label}
                      </span>
                    </label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label
                className={isDarkMode ? "text-slate-300" : "text-slate-700"}
              >
                Notes (Optional)
              </Label>
              <Input
                placeholder="Add any additional notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className={cn(
                  isDarkMode
                    ? "bg-slate-800 border-slate-700 text-white"
                    : "bg-white border-slate-200 text-slate-900",
                )}
              />
            </div>

            {/* Preview */}
            {preview && (
              <div className="space-y-2">
                <Label
                  className={isDarkMode ? "text-slate-300" : "text-slate-700"}
                >
                  Screenshot Preview
                </Label>
                <div className="relative group">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-24 object-cover rounded-lg border"
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={resetUpload}
                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={resetUpload}
                className={cn(
                  "flex-1 h-12",
                  isDarkMode
                    ? "border-slate-700 hover:bg-slate-800 text-slate-300"
                    : "border-slate-200 hover:bg-slate-100 text-slate-700",
                )}
              >
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={uploading || !amount}
                className={cn(
                  "flex-1 h-12 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                )}
              >
                {uploading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Confirming...</span>
                  </div>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Confirm Payment
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Security Badge */}
      <div className="relative mt-6 flex items-center justify-center gap-2">
        <Shield
          className={cn(
            "w-3 h-3",
            isDarkMode ? "text-slate-600" : "text-slate-400",
          )}
        />
        <span
          className={cn(
            "text-xs",
            isDarkMode ? "text-slate-500" : "text-slate-400",
          )}
        >
          End-to-end encrypted • Secure payment verification
        </span>
      </div>
    </motion.div>
  );
}
