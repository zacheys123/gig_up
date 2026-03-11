// utils/paymentTypes.ts
export interface ExtractedPaymentData {
  transactionId: string | null | undefined; // Allow undefined
  amount: number | null | undefined; // Allow undefined
  date: string | null | undefined;
  time: string | null | undefined;
  phoneNumber: string | null | undefined;
  sender: string | null | undefined;
  receiver: string | null | undefined;
  fullText: string | null | undefined;
  confidence: number;
}

export interface PaymentConfirmation {
  confirmed: boolean;
  confirmedAt: number;
  amount: number;
  paymentMethod: "mpesa" | "cash" | "bank" | "other";
  screenshot: string;
  notes?: string;
  extractedData?: ExtractedPaymentData; // Add this
}

export function compareConfirmations(
  musicianConfirm: PaymentConfirmation,
  clientConfirm: PaymentConfirmation,
  extractedMusician?: ExtractedPaymentData | null,
  extractedClient?: ExtractedPaymentData | null,
) {
  if (!musicianConfirm || !clientConfirm) {
    return {
      match: false,
      reason: "Missing confirmation from one or both parties",
      code: "MISSING_CONFIRMATION",
    };
  }

  const results = {
    match: true,
    reasons: [] as string[],
    details: {} as any,
  };

  // Compare amounts
  if (musicianConfirm.amount !== clientConfirm.amount) {
    results.match = false;
    results.reasons.push(
      `Amount mismatch: Musician KES ${musicianConfirm.amount}, Client KES ${clientConfirm.amount}`,
    );
    results.details.amountMismatch = {
      musician: musicianConfirm.amount,
      client: clientConfirm.amount,
    };
  }

  // Compare payment methods
  if (musicianConfirm.paymentMethod !== clientConfirm.paymentMethod) {
    results.match = false;
    results.reasons.push(
      `Payment method mismatch: ${musicianConfirm.paymentMethod} vs ${clientConfirm.paymentMethod}`,
    );
    results.details.methodMismatch = {
      musician: musicianConfirm.paymentMethod,
      client: clientConfirm.paymentMethod,
    };
  }

  // Compare OCR extracted data if available
  if (extractedMusician && extractedClient) {
    // Compare transaction IDs
    if (extractedMusician.transactionId && extractedClient.transactionId) {
      if (extractedMusician.transactionId !== extractedClient.transactionId) {
        results.match = false;
        results.reasons.push(`Transaction ID mismatch`);
        results.details.transactionMismatch = {
          musician: extractedMusician.transactionId,
          client: extractedClient.transactionId,
        };
      }
    }

    // Compare amounts from OCR
    if (extractedMusician.amount && extractedClient.amount) {
      if (Math.abs(extractedMusician.amount - extractedClient.amount) > 0.01) {
        results.match = false;
        results.reasons.push(`OCR amount mismatch`);
        results.details.ocrAmountMismatch = {
          musician: extractedMusician.amount,
          client: extractedClient.amount,
        };
      }
    }

    // Check OCR confidence
    if (extractedMusician.confidence < 70 || extractedClient.confidence < 70) {
      results.reasons.push(
        `Low OCR confidence: Musician ${extractedMusician.confidence}%, Client ${extractedClient.confidence}%`,
      );
      results.details.lowConfidence = {
        musician: extractedMusician.confidence,
        client: extractedClient.confidence,
      };
    }
  }

  // Check if both confirmations are positive
  if (!musicianConfirm.confirmed || !clientConfirm.confirmed) {
    results.match = false;
    results.reasons.push(
      !musicianConfirm.confirmed
        ? "Musician has not confirmed"
        : "Client has not confirmed",
    );
  }

  return {
    match: results.match,
    reason: results.reasons.join(". "),
    reasons: results.reasons,
    details: results.details,
    extractedData: {
      musician: extractedMusician,
      client: extractedClient,
    },
  };
}
export function formatPaymentData(data: ExtractedPaymentData | null) {
  if (!data) return "No data extracted";

  return {
    transactionId: data.transactionId || "Not detected",
    amount: data.amount
      ? `KES ${data.amount.toLocaleString()}`
      : "Not detected",
    date: data.date || "Not detected",
    time: data.time || "Not detected",
    phone: data.phoneNumber || "Not detected",
    confidence: `${data.confidence.toFixed(1)}%`,
  };
}
