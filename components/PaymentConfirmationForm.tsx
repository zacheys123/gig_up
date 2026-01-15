// PaymentConfirmationForm.tsx
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export function PaymentConfirmationForm({
  gigId,
  clerkId,
}: {
  gigId: string;
  clerkId: string;
}) {
  const gig = useQuery(api.controllers.gigs.getGigById, {
    gigId: gigId as Id<"gigs">,
  });
  const paymentStatus = useQuery(api.controllers.payments.getPaymentStatus, {
    gigId: gigId as Id<"gigs">,
  });
  const confirmPayment = useMutation(api.controllers.payments.confirmPayment);

  const [paymentCode, setPaymentCode] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<
    "mpesa" | "cash" | "bank" | "other"
  >("mpesa");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!gig || !paymentStatus) return null;

  const user = useQuery(api.controllers.user.getUserByClerkId, { clerkId });
  const isClient = gig.postedBy === user?._id;
  const alreadyConfirmed = isClient
    ? paymentStatus.clientConfirmed
    : paymentStatus.musicianConfirmed;

  const handleSubmit = async (confirmed: boolean) => {
    setIsSubmitting(true);
    try {
      const result = await confirmPayment({
        gigId: gigId as Id<"gigs">,
        clerkId,
        confirmPayment: confirmed,
        paymentCode: paymentCode.toUpperCase(),
        amountConfirmed: parseFloat(amount),
        paymentMethod,
        notes,
      });

      if (result.verificationStatus === "verified") {
        alert("✅ Payment verified! Codes match perfectly.");
      } else if (result.codesMatch) {
        alert("⚠️ Codes match but needs review.");
      } else {
        alert(
          "❌ Payment codes don't match. Please coordinate with the other party."
        );
      }
    } catch (error) {
      alert("An error occurred while confirming payment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (alreadyConfirmed) {
    return (
      <div className="alert alert-info">
        <p>
          ✅ You've already confirmed payment.
          {paymentStatus.bothConfirmed
            ? " Both parties have confirmed."
            : " Waiting for other party to confirm."}
        </p>
        {paymentStatus.codesMatch && (
          <p className="text-green-600">✓ Payment codes match!</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="font-semibold text-lg">
        Confirm {isClient ? "Sending" : "Receiving"} Payment
      </h3>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">
            Payment Code (M-Pesa/Cash Code)
          </label>
          <input
            type="text"
            value={paymentCode}
            onChange={(e) => setPaymentCode(e.target.value.toUpperCase())}
            placeholder="e.g., OGB7H3 or BLUE42"
            className="input input-bordered w-full"
            maxLength={10}
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter the first 4-6 characters of M-Pesa transaction code or agreed
            cash code
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Amount {isClient ? "Sent" : "Received"}
          </label>
          <div className="flex">
            <span className="inline-flex items-center px-3 border border-r-0 rounded-l">
              {gig.currency || "KES"}
            </span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="input input-bordered w-full rounded-l-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Payment Method
          </label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as any)}
            className="select select-bordered w-full"
          >
            <option value="mpesa">M-Pesa</option>
            <option value="cash">Cash</option>
            <option value="bank">Bank Transfer</option>
            <option value="other">Other</option>
          </select>
        </div>

        {paymentMethod === "mpesa" && (
          <div>
            <label className="block text-sm font-medium mb-1">
              Full Transaction ID (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g., OGB7H3H5Z8"
              className="input input-bordered w-full"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">
            Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any additional information..."
            className="textarea textarea-bordered w-full"
            rows={2}
          />
        </div>
      </div>

      <div className="flex space-x-4 pt-4">
        <button
          onClick={() => handleSubmit(true)}
          disabled={isSubmitting || !paymentCode || !amount}
          className="btn btn-success flex-1"
        >
          {isSubmitting ? "Confirming..." : "✅ Confirm Payment"}
        </button>

        <button
          onClick={() => handleSubmit(false)}
          disabled={isSubmitting}
          className="btn btn-error flex-1"
        >
          ❌ Dispute Payment
        </button>
      </div>

      <div className="text-xs text-gray-500 pt-4 border-t">
        <p className="font-medium">How it works:</p>
        <ul className="list-disc pl-4 mt-1 space-y-1">
          <li>Both parties enter the same payment code</li>
          <li>System automatically verifies when codes match</li>
          <li>For M-Pesa: Use first 4-6 characters of transaction code</li>
          <li>For Cash: Agree on a verification code with the other party</li>
        </ul>
      </div>
    </div>
  );
}
