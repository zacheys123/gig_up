// utils/paymentVerification.ts
import { createWorker } from "tesseract.js";

// M-Pesa message patterns
const MPESA_PATTERNS = {
  // Example: "TXL9Q8K1 Confirmed. Ksh 2,500.00 sent to John Doe on 15/3/2024 at 10:30 AM"
  transactionId: /[A-Z0-9]{6,12}/,
  amount: /Ksh\s*([0-9,]+\.?[0-9]*)/i,
  date: /(\d{1,2}\/\d{1,2}\/\d{4})/,
  time: /(\d{1,2}:\d{2}\s*(?:AM|PM)?)/i,
  phoneNumber: /(?:0|\+?254)[71]\d{8}/,

  // Alternative formats
  amountAlt: /(?:amount|amt|paid|sent)?\s*[:\s]*([0-9,]+\.?[0-9]*)/i,
  fullMessage: /(.+)/,
};

export interface ExtractedPaymentData {
  transactionId: string | null;
  amount: number | null;
  date: string | null;
  time: string | null;
  phoneNumber: string | null;
  sender: string | null;
  receiver: string | null;
  fullText: string;
  confidence: number;
  _creationTime?: number; // ADD THIS (optional)
  timestamp?: number; // OR ADD THIS (optional)
}

export async function extractMpesaData(
  imageUrl: string,
): Promise<ExtractedPaymentData | null> {
  try {
    // Initialize worker
    const worker = await createWorker("eng");

    // Recognize text from image
    const {
      data: { text, confidence },
    } = await worker.recognize(imageUrl);

    // Terminate worker to free memory
    await worker.terminate();

    // Clean the text
    const cleanText = text.replace(/\s+/g, " ").trim();

    // Extract data using regex patterns
    const transactionIdMatch = cleanText.match(MPESA_PATTERNS.transactionId);
    const amountMatch = cleanText.match(MPESA_PATTERNS.amount);
    const dateMatch = cleanText.match(MPESA_PATTERNS.date);
    const timeMatch = cleanText.match(MPESA_PATTERNS.time);
    const phoneMatch = cleanText.match(MPESA_PATTERNS.phoneNumber);

    // Try alternative amount pattern if first fails
    let amount = null;
    if (amountMatch) {
      amount = parseFloat(amountMatch[1].replace(/,/g, ""));
    } else {
      const altMatch = cleanText.match(MPESA_PATTERNS.amountAlt);
      if (altMatch) {
        amount = parseFloat(altMatch[1].replace(/,/g, ""));
      }
    }

    // Try to extract sender/receiver names (simplified)
    const namePattern =
      /(?:to|from|sent to|received from)\s+([A-Za-z\s]+?)(?:\s+on|\s+at|\s+\d|$)/i;
    const nameMatch = cleanText.match(namePattern);

    const sender = nameMatch?.[1]?.trim() || null;
    const receiver = nameMatch?.[1]?.trim() || null;

    return {
      transactionId: transactionIdMatch?.[0] || null,
      amount: amount,
      date: dateMatch?.[0] || null,
      time: timeMatch?.[0] || null,
      phoneNumber: phoneMatch?.[0] || null,
      sender,
      receiver,
      fullText: cleanText.substring(0, 200), // Store first 200 chars
      confidence,
    };
  } catch (error) {
    console.error("OCR extraction failed:", error);
    return null;
  }
}

export function compareConfirmations(
  musicianConfirm: any,
  clientConfirm: any,
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
