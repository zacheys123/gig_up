// convex/paymentTypes.ts
import { v } from "convex/values";

// Shared validator for extracted data (use this in ALL your schemas)
export const extractedDataValidator = v.object({
  transactionId: v.optional(v.union(v.string(), v.null())), // string | null | undefined
  amount: v.optional(v.number()),
  date: v.optional(v.string()),
  time: v.optional(v.string()),
  phoneNumber: v.optional(v.string()),
  sender: v.optional(v.string()),
  receiver: v.optional(v.string()),
  fullText: v.optional(v.string()),
  confidence: v.number(),
});

// Type for use in your app
export type ExtractedDataType = {
  transactionId?: string | null;
  amount?: number;
  date?: string;
  time?: string;
  phoneNumber?: string;
  sender?: string;
  receiver?: string;
  fullText?: string;
  confidence: number;
};

// Helper to safely handle transactionId everywhere
export function safeTransactionId(value: any): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  return String(value);
}
