// components/payments/PaymentConfirmation.tsx
import React, { useState } from "react";
import { useMutation } from "convex/react";
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
} from "lucide-react";
import { ExtractedDataType } from "@/convex/payment";

interface PaymentConfirmationProps {
  gigId: string;
  userRole: "musician" | "client";
  gigTitle?: string;
  expectedAmount?: number;
  onConfirmed: () => void;
}

export function PaymentConfirmation({
  gigId,
  userRole,
  gigTitle,
  expectedAmount,
  onConfirmed,
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

  const confirmPayment = useMutation(api.controllers.payments.confirmPayment);
  const generateUploadUrl = useMutation(api.upload.generateUploadUrl);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setScreenshot(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Auto-start OCR
    await processOCR(file);
  };

  const processOCR = async (file: File) => {
    setOcrProcessing(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/ocr/extract", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("OCR processing failed");
      }

      const data = await response.json();

      // Handle the OCR result
      const result: ExtractedDataType = {
        transactionId: data.transactionId || null,
        amount: data.amount || undefined,
        date: data.date || undefined,
        time: data.time || undefined,
        phoneNumber: data.phoneNumber || undefined,
        sender: data.sender || undefined,
        receiver: data.receiver || undefined,
        fullText: data.fullText || undefined,
        confidence: data.confidence || 0,
      };

      setOcrResult(result);

      // Auto-fill amount if high confidence
      if (result.confidence >= 70 && result.amount) {
        setAmount(result.amount.toString());
        toast.success(`Amount detected: KES ${result.amount}`);
      } else if (result.amount) {
        toast.warning(
          `Low confidence (${result.confidence}%). Please verify amount`,
        );
      }

      setStep("review");
    } catch (error) {
      console.error("OCR error:", error);
      toast.error("Failed to process image. Please enter details manually.");
      setStep("review"); // Still allow manual entry
    } finally {
      setOcrProcessing(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return "text-green-600 bg-green-50";
    if (confidence >= 70) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const handleSubmit = async () => {
    if (!screenshot || !amount) {
      toast.error("Please provide screenshot and amount");
      return;
    }

    setUploading(true);
    try {
      // Upload screenshot to Convex storage
      const uploadUrl = await generateUploadUrl();
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": screenshot.type },
        body: screenshot,
      });

      if (!result.ok) throw new Error("Upload failed");
      const { storageId } = await result.json();

      // Get clerkId from your auth system
      const clerkId = (window as any).Clerk?.user?.id;
      if (!clerkId) {
        throw new Error("User not authenticated");
      }

      // Submit confirmation with OCR data
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
  };

  const userLabel =
    userRole === "musician" ? "I received payment" : "I sent payment";

  return (
    <div className="space-y-6 p-6 bg-white dark:bg-slate-900 rounded-xl border">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30">
          {userRole === "musician" ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <CheckCircle className="w-5 h-5 text-blue-600" />
          )}
        </div>
        <div>
          <h3 className="text-lg text-neutral-500 font-semibold">
            {userLabel}
          </h3>
          <p className="text-sm text-slate-500">
            {step === "upload"
              ? "Upload screenshot for automatic detection"
              : "Review detected information"}
          </p>
        </div>
      </div>

      {expectedAmount && (
        <div className="p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            Expected amount: KES {expectedAmount.toLocaleString()}
          </p>
        </div>
      )}

      {step === "upload" ? (
        <div className="space-y-4">
          {/* Screenshot Upload */}
          <div>
            <Label htmlFor="screenshot">Transaction Screenshot</Label>
            <div className="mt-1">
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById("screenshot")?.click()}
                className="w-full h-32 border-dashed flex flex-col items-center justify-center gap-2"
                disabled={ocrProcessing}
              >
                {ocrProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
                    <span className="text-sm text-slate-500">
                      Processing OCR...
                    </span>
                  </>
                ) : (
                  <>
                    <Camera className="w-8 h-8 text-slate-400" />
                    <span className="text-sm text-slate-500">
                      Click to upload screenshot
                    </span>
                    <span className="text-xs text-slate-400">
                      We'll auto-detect payment details
                    </span>
                  </>
                )}
              </Button>
              <input
                id="screenshot"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                disabled={ocrProcessing}
              />
            </div>
          </div>

          {preview && (
            <div className="mt-2 relative">
              <img
                src={preview}
                alt="Preview"
                className="max-h-40 rounded-lg border mx-auto"
              />
              <Button
                size="sm"
                variant="ghost"
                className="absolute top-1 right-1"
                onClick={resetUpload}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* OCR Results */}
          {ocrResult && (
            <div className="p-4 bg-slate-50 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ScanLine className="w-4 h-4 text-blue-600" />
                  <span className="font-medium">OCR Detection Results</span>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded ${getConfidenceColor(ocrResult.confidence)}`}
                >
                  Confidence: {ocrResult.confidence}%
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-slate-500">Transaction ID</p>
                  <p className="font-mono font-medium">
                    {ocrResult.transactionId || "Not detected"}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Amount</p>
                  <p>
                    {ocrResult.amount
                      ? `KES ${ocrResult.amount}`
                      : "Not detected"}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Date</p>
                  <p>{ocrResult.date || "Not detected"}</p>
                </div>
                <div>
                  <p className="text-slate-500">Time</p>
                  <p>{ocrResult.time || "Not detected"}</p>
                </div>
                {ocrResult.sender && (
                  <div>
                    <p className="text-slate-500">Sender</p>
                    <p>{ocrResult.sender}</p>
                  </div>
                )}
                {ocrResult.receiver && (
                  <div>
                    <p className="text-slate-500">Receiver</p>
                    <p>{ocrResult.receiver}</p>
                  </div>
                )}
              </div>

              {ocrResult.confidence < 70 && (
                <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded text-sm">
                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                  <span className="text-yellow-700">
                    Low confidence - please verify all details
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Amount - Manual Entry */}
          <div>
            <Label htmlFor="amount">
              Amount (KES) {ocrResult?.amount && "(Verified or Correct Below)"}
            </Label>
            <Input
              id="amount"
              type="number"
              placeholder="e.g., 25000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1"
            />
          </div>

          {/* Payment Method */}
          <div>
            <Label>Payment Method</Label>
            <RadioGroup
              value={paymentMethod}
              onValueChange={(v: any) => setPaymentMethod(v)}
              className="mt-2 grid grid-cols-2 gap-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="mpesa" id="mpesa" />
                <Label htmlFor="mpesa">M-Pesa</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="cash" id="cash" />
                <Label htmlFor="cash">Cash</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="bank" id="bank" />
                <Label htmlFor="bank">Bank Transfer</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="other" id="other" />
                <Label htmlFor="other">Other</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Input
              id="notes"
              placeholder="Any additional info..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1"
            />
          </div>

          {/* Preview */}
          {preview && (
            <div className="mt-2">
              <p className="text-sm text-slate-500 mb-1">Screenshot:</p>
              <img
                src={preview}
                alt="Preview"
                className="max-h-20 rounded-lg border"
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={resetUpload} className="flex-1">
              Back
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={uploading || !amount}
              className="flex-1"
            >
              {uploading ? (
                <>Confirming...</>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Confirm Payment
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
