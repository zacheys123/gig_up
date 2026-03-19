// app/api/ocr/extract/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createWorker, PSM } from "tesseract.js";
import path from "path";
import fs from "fs";

// Enhanced M-Pesa patterns
const MPESA_PATTERNS = {
  transactionId:
    /(?:Transaction\s*(?:ID|Code|No|Number|#)?[:\s]*|^)([A-Z0-9]{6,12})(?:\s|$)/i,
  amount:
    /(?:KES|Ksh|KSh|Ksh\.?|KSh\.?|Shillings?)?\s*([0-9,]+(?:\.[0-9]{2})?)|([0-9,]+(?:\.[0-9]{2})?)\s*(?:KES|Ksh|KSh)/i,
  date: /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})|(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4})|(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/i,
  time: /(\d{1,2}:\d{2}(?:\s*(?:AM|PM|am|pm))?)/,
  phoneNumber:
    /(?:0|\+?254|254)[71]\d{8}|(?:0|\+?254|254)[71]\d{2}\s*\d{3}\s*\d{3}/,
  name: /(?:to|from|sent to|received from|by|for|paying|paid to|paid by)\s+([A-Za-z\s]+?)(?:\s+on|\s+at|\s+on\s+\d|\s*$)/i,
  mpesaRef: /(?:MPESA|M-PESA)[\s:]*([A-Z0-9]{6,12})/i,
  balance: /(?:New|Account)?\s*Balance[\s:]*([0-9,]+(?:\.[0-9]{2})?)/i,
};

// Maximum image size (5MB)
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

// Supported image types
const SUPPORTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
];

// Get the path to downloaded language files
const LANG_DIR = path.join(process.cwd(), "public", "tessdata");

async function validateAndFetchImage(imageFile: File) {
  try {
    const buffer = Buffer.from(await imageFile.arrayBuffer());
    const contentType = imageFile.type;

    if (!SUPPORTED_TYPES.includes(contentType)) {
      throw new Error(
        `Unsupported image type: ${contentType}. Please upload JPEG, PNG, or WEBP.`,
      );
    }

    if (buffer.length > MAX_IMAGE_SIZE) {
      throw new Error(
        `Image too large: ${(buffer.length / 1024 / 1024).toFixed(2)}MB (max 5MB)`,
      );
    }

    return { buffer, contentType };
  } catch (error) {
    throw new Error(
      `Image validation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

function cleanExtractedText(text: string): string {
  return text
    .replace(/\s+/g, " ")
    .replace(/[^\x20-\x7E\n\r]/g, "")
    .replace(/\n\s*\n/g, "\n")
    .trim();
}

function extractStructuredData(text: string) {
  const cleanText = cleanExtractedText(text);

  // Try to find transaction ID with multiple strategies
  let transactionId = null;

  const mpesaRefMatch = cleanText.match(MPESA_PATTERNS.mpesaRef);
  if (mpesaRefMatch) {
    transactionId = mpesaRefMatch[1];
  }

  if (!transactionId) {
    const txMatch = cleanText.match(MPESA_PATTERNS.transactionId);
    if (txMatch) {
      transactionId = txMatch[1];
    }
  }

  if (!transactionId) {
    const txCodeMatch = cleanText.match(
      /Transaction\s*(?:ID|Code|No)?[:\s]*([A-Z0-9]{6,12})/i,
    );
    if (txCodeMatch) {
      transactionId = txCodeMatch[1];
    }
  }

  // Extract amount
  let amount = null;
  const amountMatches = [
    cleanText.match(MPESA_PATTERNS.amount),
    cleanText.match(/[0-9,]+(?:\.[0-9]{2})?\s*(?:paid|sent|received)/i),
    cleanText.match(/[0-9,]+(?:\.[0-9]{2})?(?=\s*(?:KES|Ksh))/i),
  ];

  for (const match of amountMatches) {
    if (match) {
      const amountStr = (match[1] || match[2] || match[0]).replace(/,/g, "");
      const parsed = parseFloat(amountStr);
      if (!isNaN(parsed) && parsed > 0) {
        amount = parsed;
        break;
      }
    }
  }

  // Extract date
  let date = null;
  const dateMatch = cleanText.match(MPESA_PATTERNS.date);
  if (dateMatch) {
    date = dateMatch[0];
  }

  // Extract time
  let time = null;
  const timeMatch = cleanText.match(MPESA_PATTERNS.time);
  if (timeMatch) {
    time = timeMatch[1];
  }

  // Extract phone number
  let phoneNumber = null;
  const phoneMatch = cleanText.match(MPESA_PATTERNS.phoneNumber);
  if (phoneMatch) {
    phoneNumber = phoneMatch[0].replace(/\s+/g, "");
  }

  // Extract sender/receiver name
  let name = null;
  const nameMatch = cleanText.match(MPESA_PATTERNS.name);
  if (nameMatch) {
    name = nameMatch[1].trim();
  }

  return {
    transactionId,
    amount,
    date,
    time,
    phoneNumber,
    sender: name,
    receiver: name,
    fullText: cleanText,
  };
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    // Parse FormData
    let formData;
    try {
      formData = await req.formData();
    } catch (formError) {
      console.error("Failed to parse FormData:", formError);
      return NextResponse.json(
        {
          success: false,
          error: "Invalid FormData",
          code: "INVALID_FORMDATA",
        },
        { status: 400 },
      );
    }

    // Get the image file from FormData
    const imageFile = formData.get("image") as File | null;

    if (!imageFile) {
      return NextResponse.json(
        {
          success: false,
          error: "No image file provided in FormData",
          code: "MISSING_IMAGE_FILE",
        },
        { status: 400 },
      );
    }

    console.log(
      "Processing OCR for image:",
      imageFile.name,
      "type:",
      imageFile.type,
      "size:",
      imageFile.size,
    );

    // Validate and process the image file
    let imageBuffer;
    try {
      const result = await validateAndFetchImage(imageFile);
      imageBuffer = result.buffer;
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error:
            error instanceof Error ? error.message : "Image validation failed",
          code: "INVALID_IMAGE",
        },
        { status: 400 },
      );
    }

    console.log("Image validated, size:", imageBuffer.length, "bytes");

    // Initialize worker with language and options
    console.log("Initializing Tesseract worker...");

    // Create worker with language in options object
    const worker = await createWorker({
      langPath: LANG_DIR, // Use the downloaded language files
      logger: (m) => {
        if (process.env.NODE_ENV === "development") {
          console.log("Tesseract:", m);
        }
      },
      // You can also specify corePath and workerPath if needed
      // corePath: 'https://cdn.jsdelivr.net/npm/tesseract.js-core@4.0.2/tesseract-core.wasm.js',
      // workerPath: 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/worker.min.js'
    });

    // Load the English language
    await worker.loadLanguage("eng");
    await worker.initialize("eng");

    // Set parameters for better accuracy with screenshots
    await worker.setParameters({
      tessedit_char_whitelist:
        "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz/:.,- ",
      tessedit_pageseg_mode: PSM.SINGLE_BLOCK,
      preserve_interword_spaces: "1",
    });

    console.log("Running OCR...");
    const { data } = await worker.recognize(imageBuffer);
    await worker.terminate();

    console.log("OCR complete, confidence:", data.confidence);
    console.log("Extracted text preview:", data.text.substring(0, 200));

    const extractedData = extractStructuredData(data.text);

    const confidenceScore = data.confidence;
    const extractionSuccess = [
      extractedData.transactionId,
      extractedData.amount,
      extractedData.date,
    ].filter(Boolean).length;

    const isSuccessful = extractionSuccess >= 2 && confidenceScore >= 60;

    const processingTime = Date.now() - startTime;

    const response = {
      success: isSuccessful,
      data: extractedData,
      confidence: {
        overall: confidenceScore,
        extraction: extractionSuccess / 3,
      },
      metadata: {
        processingTimeMs: processingTime,
        textLength: data.text.length,
        hasTransactionId: !!extractedData.transactionId,
        hasAmount: !!extractedData.amount,
        hasDate: !!extractedData.date,
      },
    };

    if (!isSuccessful) {
      return NextResponse.json({
        ...response,
        message:
          "Could not reliably extract payment details. Please ensure the screenshot shows the transaction clearly.",
        suggestedAction:
          "Try uploading a clearer screenshot showing the full M-Pesa message.",
      });
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("OCR extraction failed:", error);

    const errorMessage =
      error instanceof Error ? error.message : "OCR processing failed";
    const isTimeout =
      errorMessage.includes("timeout") || errorMessage.includes("TIMEOUT");

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        code: isTimeout ? "TIMEOUT" : "PROCESSING_ERROR",
        message: isTimeout
          ? "Processing took too long. Please try again with a smaller image."
          : "Failed to process the image. Please try again.",
      },
      { status: isTimeout ? 408 : 500 },
    );
  }
}
