// components/payments/PaymentConfirmation.tsx
import React, { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { Upload, Camera, CheckCircle, AlertCircle, X } from "lucide-react";

interface PaymentConfirmationProps {
  gigId: string;
  userRole: "musician" | "client";
  onConfirmed: () => void;
}

export function PaymentConfirmation({
  gigId,
  userRole,
  onConfirmed,
}: PaymentConfirmationProps) {
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<
    "mpesa" | "cash" | "bank" | "other"
  >("mpesa");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [notes, setNotes] = useState("");
  const confirmPayment = useMutation(api.controllers.payments.confirmPayment);
  const generateUploadUrl = useMutation(
    api.controllers.upload.generateUploadUrl,
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setScreenshot(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!screenshot || !amount) {
      toast.error("Please provide screenshot and amount");
      return;
    }

    setUploading(true);
    try {
      // Upload screenshot
      const uploadUrl = await generateUploadUrl();
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": screenshot.type },
        body: screenshot,
      });

      if (!result.ok) throw new Error("Upload failed");
      const { storageId } = await result.json();

      // Submit confirmation
      await confirmPayment({
        gigId: gigId as any,
        role: userRole,
        confirmed: true,
        amount: parseFloat(amount),
        paymentMethod,
        screenshot: storageId,
        notes: notes || undefined,
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
          <h3 className="text-lg font-semibold">{userLabel}</h3>
          <p className="text-sm text-slate-500">
            Upload screenshot of transaction
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Amount */}
        <div>
          <Label htmlFor="amount">Amount (KES)</Label>
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
            className="mt-2"
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

        {/* Screenshot Upload */}
        <div>
          <Label htmlFor="screenshot">Transaction Screenshot</Label>
          <div className="mt-1 flex items-center gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById("screenshot")?.click()}
              className="w-full h-24 border-dashed flex flex-col items-center justify-center gap-2"
            >
              <Camera className="w-6 h-6 text-slate-400" />
              <span className="text-sm text-slate-500">Click to upload</span>
            </Button>
            <input
              id="screenshot"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
          {preview && (
            <div className="mt-2 relative">
              <img
                src={preview}
                alt="Preview"
                className="max-h-32 rounded-lg border"
              />
              <Button
                size="sm"
                variant="ghost"
                className="absolute top-1 right-1"
                onClick={() => {
                  setScreenshot(null);
                  setPreview(null);
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
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

        <Button
          onClick={handleSubmit}
          disabled={uploading || !screenshot || !amount}
          className="w-full"
        >
          {uploading ? (
            <>Uploading...</>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Submit Confirmation
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
