// app/api/ocr/extract/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createWorker, PSM } from "tesseract.js";
import path from "path";
import fs from "fs";

// Define LANG_DIR at the top level
const LANG_DIR = path.join(process.cwd(), "public", "tessdata");

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

// Check if language files exist
function checkLanguageFiles() {
  console.log("Checking language files in:", LANG_DIR);

  if (!fs.existsSync(LANG_DIR)) {
    console.log("Language directory does not exist");
    return false;
  }

  const files = fs.readdirSync(LANG_DIR);
  console.log("Files in tessdata directory:", files);

  const hasLangFile = files.some((f) => f.includes("eng.traineddata"));
  console.log("Has English language file:", hasLangFile);

  return hasLangFile;
}

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
    // Check language files at startup
    console.log("=== OCR API Started ===");
    const hasLocalFiles = checkLanguageFiles();

    // Parse FormData
    let formData;
    try {
      formData = await req.formData();
    } catch (formError) {
      console.error("Failed to parse FormData:", formError);
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid FormData - make sure you're sending a multipart/form-data request",
          details:
            formError instanceof Error ? formError.message : String(formError),
          code: "INVALID_FORMDATA",
        },
        { status: 400 },
      );
    }

    // Log all fields in FormData for debugging
    const formDataEntries: any = {};
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        formDataEntries[key] = {
          type: "File",
          name: value.name,
          size: value.size,
          mimeType: value.type,
        };
      } else {
        formDataEntries[key] = value;
      }
    }
    console.log("FormData received:", JSON.stringify(formDataEntries, null, 2));

    // Get the image file from FormData
    const imageFile = formData.get("image") as File | null;

    if (!imageFile) {
      return NextResponse.json(
        {
          success: false,
          error:
            "No image file provided in FormData. Expected field name 'image'",
          receivedFields: Object.keys(Object.fromEntries(formData.entries())),
          code: "MISSING_IMAGE_FILE",
        },
        { status: 400 },
      );
    }

    if (!(imageFile instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          error: "The 'image' field is not a valid file",
          receivedType: typeof imageFile,
          code: "INVALID_FILE_TYPE",
        },
        { status: 400 },
      );
    }

    console.log("Processing OCR for image:", {
      name: imageFile.name,
      type: imageFile.type,
      size: imageFile.size,
      lastModified: new Date(imageFile.lastModified).toISOString(),
    });

    // Validate and process the image file
    let imageBuffer;
    try {
      const result = await validateAndFetchImage(imageFile);
      imageBuffer = result.buffer;
    } catch (error) {
      console.error("Image validation failed:", error);
      return NextResponse.json(
        {
          success: false,
          error:
            error instanceof Error ? error.message : "Image validation failed",
          details: error instanceof Error ? error.stack : String(error),
          code: "INVALID_IMAGE",
        },
        { status: 400 },
      );
    }

    console.log("Image validated, size:", imageBuffer.length, "bytes");

    // Initialize worker with simpler configuration first
    console.log("Initializing Tesseract worker with simple config...");
    let worker;
    try {
      // Try the simplest possible configuration first
      console.log("Attempting to create worker with defaults...");
      worker = await createWorker();
      console.log("Worker created successfully");

      console.log("Loading English language...");
      await worker.loadLanguage("eng");
      console.log("Language loaded successfully");

      console.log("Initializing English...");
      await worker.initialize("eng");
      console.log("Initialization successful");

      console.log("Setting parameters...");
      await worker.setParameters({
        tessedit_char_whitelist:
          "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz/:.,- ",
        tessedit_pageseg_mode: PSM.SINGLE_BLOCK,
        preserve_interword_spaces: "1",
      });
      console.log("Parameters set successfully");
    } catch (workerError) {
      console.error(
        "Failed to initialize Tesseract worker with simple config:",
        workerError,
      );

      // If simple config fails, try with explicit paths
      console.log("Attempting with explicit CDN paths...");
      try {
        if (worker) await worker.terminate().catch(() => {});

        worker = await createWorker({
          langPath: "https://tessdata.projectnaptha.com/4.0.0",
          corePath:
            "https://cdn.jsdelivr.net/npm/tesseract.js-core@4.0.2/tesseract-core.wasm.js",
          workerPath:
            "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/worker.min.js",
          logger: (m) => console.log("Tesseract CDN:", m),
        });

        console.log("Worker created with CDN paths");

        console.log("Loading English language from CDN...");
        await worker.loadLanguage("eng");
        await worker.initialize("eng");

        console.log("Setting parameters...");
        await worker.setParameters({
          tessedit_char_whitelist:
            "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz/:.,- ",
          tessedit_pageseg_mode: PSM.SINGLE_BLOCK,
          preserve_interword_spaces: "1",
        });
      } catch (cdnError) {
        console.error("CDN fallback also failed:", cdnError);

        return NextResponse.json(
          {
            success: false,
            error: "Failed to initialize OCR engine",
            details: {
              simple:
                workerError instanceof Error
                  ? workerError.message
                  : String(workerError),
              cdn:
                cdnError instanceof Error ? cdnError.message : String(cdnError),
            },
            code: "WORKER_INIT_FAILED",
            message: "Could not start OCR engine. Please try again later.",
          },
          { status: 500 },
        );
      }
    }

    // Recognize text
    console.log("Running OCR recognition...");
    let data;
    try {
      const result = await worker.recognize(imageBuffer);
      data = result.data;
      console.log("OCR completed successfully");
    } catch (recognizeError) {
      console.error("OCR recognition failed:", recognizeError);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to recognize text in image",
          details:
            recognizeError instanceof Error
              ? recognizeError.message
              : String(recognizeError),
          code: "RECOGNITION_FAILED",
        },
        { status: 500 },
      );
    } finally {
      await worker.terminate();
    }

    console.log("OCR confidence:", data.confidence);
    console.log("Extracted text length:", data.text.length);
    console.log("Extracted text preview:", data.text.substring(0, 200));

    if (!data.text || data.text.trim().length === 0) {
      return NextResponse.json({
        success: false,
        error: "No text could be extracted from the image",
        code: "NO_TEXT_EXTRACTED",
        message:
          "The image appears to contain no readable text. Please ensure it's a clear screenshot of an M-Pesa message.",
      });
    }

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
      console.log("Low confidence extraction:", response);
      return NextResponse.json({
        ...response,
        message:
          "Could not reliably extract payment details. Please ensure the screenshot shows the transaction clearly.",
        suggestedAction:
          "Try uploading a clearer screenshot showing the full M-Pesa message with transaction ID, amount, and date.",
      });
    }

    console.log("Successful extraction:", response);
    return NextResponse.json(response);
  } catch (error) {
    console.error("OCR extraction failed with unexpected error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "OCR processing failed";
    const errorStack = error instanceof Error ? error.stack : undefined;

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: errorStack,
        code: "UNEXPECTED_ERROR",
        message:
          "An unexpected error occurred during OCR processing. Please try again.",
      },
      { status: 500 },
    );
  }
}
