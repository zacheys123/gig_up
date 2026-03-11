// app/api/ocr/extract/route.ts
import { NextResponse } from "next/server";
import { createWorker } from "tesseract.js";

// M-Pesa message patterns
const MPESA_PATTERNS = {
  transactionId: /[A-Z0-9]{6,12}/,
  amount: /Ksh\s*([0-9,]+\.?[0-9]*)/i,
  date: /(\d{1,2}\/\d{1,2}\/\d{4})/,
  time: /(\d{1,2}:\d{2}\s*(?:AM|PM)?)/i,
  phoneNumber: /(?:0|\+?254)[71]\d{8}/,
  amountAlt: /(?:amount|amt|paid|sent)?\s*[:\s]*([0-9,]+\.?[0-9]*)/i,
};

export async function POST(req: Request) {
  try {
    const { imageUrl } = await req.json();

    if (!imageUrl) {
      return NextResponse.json(
        { success: false, error: "No image URL provided" },
        { status: 400 }
      );
    }

    // Initialize worker
    const worker = await createWorker("eng");
    
    // Recognize text from image
    const { data: { text, confidence } } = await worker.recognize(imageUrl);
    
    // Terminate worker
    await worker.terminate();

    // Clean the text
    const cleanText = text.replace(/\s+/g, " ").trim();

    // Extract data using regex patterns
    const transactionIdMatch = cleanText.match(MPESA_PATTERNS.transactionId);
    const amountMatch = cleanText.match(MPESA_PATTERNS.amount);
    const dateMatch = cleanText.match(MPESA_PATTERNS.date);
    const timeMatch = cleanText.match(MPESA_PATTERNS.time);
    const phoneMatch = cleanText.match(MPESA_PATTERNS.phoneNumber);

    // Parse amount
    let amount = null;
    if (amountMatch) {
      amount = parseFloat(amountMatch[1].replace(/,/g, ""));
    } else {
      const altMatch = cleanText.match(MPESA_PATTERNS.amountAlt);
      if (altMatch) {
        amount = parseFloat(altMatch[1].replace(/,/g, ""));
      }
    }

    // Extract sender/receiver
    const namePattern = /(?:to|from|sent to|received from)\s+([A-Za-z\s]+?)(?:\s+on|\s+at|\s+\d|$)/i;
    const nameMatch = cleanText.match(namePattern);

    const extractedData = {
      transactionId: transactionIdMatch?.[0] || null,
      amount: amount,
      date: dateMatch?.[0] || null,
      time: timeMatch?.[0] || null,
      phoneNumber: phoneMatch?.[0] || null,
      sender: nameMatch?.[1]?.trim() || null,
      receiver: nameMatch?.[1]?.trim() || null,
      fullText: cleanText.substring(0, 200),
      confidence,
    };

    return NextResponse.json({ 
      success: true, 
      data: extractedData 
    });

  } catch (error) {
    console.error("OCR extraction failed:", error);
    return NextResponse.json(
      { success: false, error: "OCR processing failed" },
      { status: 500 }
    );
  }
}