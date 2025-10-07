"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface MpesaPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPaymentInitiated: (phoneNumber: string) => Promise<void>;
  isProcessing: boolean;
}

export function MpesaPaymentDialog({
  open,
  onOpenChange,
  onPaymentInitiated,
  isProcessing,
}: MpesaPaymentDialogProps) {
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");
  const [isValid, setIsValid] = useState(false);
  const { user } = useCurrentUser();
  // Format the phone number for display and validation
  useEffect(() => {
    // Remove all non-digit characters
    const digitsOnly = inputValue.replace(/\D/g, "");

    // Convert to Safaricom format (254 + 9 digits)
    let formattedNumber = "";
    if (digitsOnly.startsWith("0") && digitsOnly.length === 10) {
      formattedNumber = "254" + digitsOnly.substring(1);
    } else if (digitsOnly.length === 9) {
      formattedNumber = "254" + digitsOnly;
    } else if (digitsOnly.startsWith("254") && digitsOnly.length === 12) {
      formattedNumber = digitsOnly;
    } else {
      formattedNumber = "254" + digitsOnly;
    }

    // Trim to max 12 digits (254 + 9)
    formattedNumber = formattedNumber.substring(0, 12);

    // Validate - must be exactly 254 followed by 9 digits starting with 7 or 1
    const valid = /^254[17]\d{8}$/.test(formattedNumber);
    setIsValid(valid);

    if (inputValue && !valid) {
      setError("Please enter a valid 9-digit Safaricom number");
    } else {
      setError("");
    }
  }, [inputValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ""); // Remove non-digits
    if (value.length <= 9) {
      // Only allow up to 9 digits (after 254)
      setInputValue(value);
    }
  };

  const formatDisplayNumber = (digits: string) => {
    if (!digits) return "";
    // Format as XXX XXX XXX
    if (digits.length <= 3) return digits;
    if (digits.length <= 6)
      return `${digits.substring(0, 3)} ${digits.substring(3)}`;
    return `${digits.substring(0, 3)} ${digits.substring(
      3,
      6
    )} ${digits.substring(6)}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) {
      setError("Please enter a valid Safaricom number");
      return;
    }
    setError("");
    await onPaymentInitiated(
      "254" + inputValue.replace(/\D/g, "").substring(0, 9)
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[70vw] max-w-sm bg-white dark:bg-gray-900 rounded-xl shadow-xl p-5 animate-in fade-in-90 slide-in-from-bottom-10">
        {/* Header with floating M-Pesa icon */}
        <DialogHeader className="relative">
          <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
            <div className="bg-gradient-to-br from-green-600 to-green-800 p-3 rounded-full shadow-lg border-4 border-white dark:border-gray-900 transition-all duration-300 hover:rotate-12">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-white"
              >
                <path
                  d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                  fill="currentColor"
                />
                <path
                  d="M12 17C14.7614 17 17 14.7614 17 12C17 9.23858 14.7614 7 12 7C9.23858 7 7 9.23858 7 12C7 14.7614 9.23858 17 12 17Z"
                  fill="#FFC72C"
                />
              </svg>
            </div>
          </div>
          <div className="mt-8 text-center">
            <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
              M-Pesa Payment
            </DialogTitle>
            <DialogDescription className="text-gray-500 dark:text-gray-400 mt-1">
              Enter your Safaricom number to proceed
            </DialogDescription>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {/* Phone Input */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-gray-700 dark:text-gray-300">
              Phone Number
            </Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <span className="text-gray-500">+254</span>
              </div>
              <Input
                id="phone"
                type="tel"
                placeholder="712 345 678"
                value={formatDisplayNumber(inputValue)}
                onChange={handleInputChange}
                className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white pl-16 pr-10 h-12 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                inputMode="numeric"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-gray-400"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </div>
            </div>
            {error && (
              <p className="text-red-500 text-sm animate-in fade-in">{error}</p>
            )}
            <p className="text-gray-500 dark:text-gray-400 text-xs">
              Your 9-digit Safaricom number
            </p>
          </div>

          {/* Payment Summary */}
          <div className="bg-gray-100 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700 transition-all duration-200 hover:shadow-sm">
            <div className="flex justify-between items-center py-1">
              <span className="text-gray-600 dark:text-gray-400">Number:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {inputValue ? (
                  <span className="font-mono">
                    +254 {formatDisplayNumber(inputValue)}
                  </span>
                ) : (
                  <span className="text-gray-400 dark:text-gray-500">
                    ______
                  </span>
                )}
              </span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-gray-600 dark:text-gray-400">Amount:</span>
              <span className="font-bold text-green-600 dark:text-green-500">
                {user?.isClient ? "KES 2,000" : "KES 1,500"}
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isProcessing || !isValid}
            className="w-full h-12 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:transform-none"
          >
            {isProcessing ? (
              <span className="flex items-center justify-center space-x-2">
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>Processing Payment...</span>
              </span>
            ) : (
              <span className="flex items-center justify-center space-x-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                </svg>
                <span>Lipa Na M-pesa</span>
              </span>
            )}
          </Button>
        </form>

        {/* Footer Note */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 animate-pulse">
            {`You'll receive an M-Pesa push notification`}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
