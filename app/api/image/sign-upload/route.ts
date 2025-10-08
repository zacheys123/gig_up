// app/api/upload/route.js
import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const apiSecret = process.env.CLOUDINARY_API_SECRET;
export async function GET() {
  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const params = {
      timestamp,
      upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET,
    };

    console.log("String to sign:", JSON.stringify(params));
    console.log("Using secret:", apiSecret ? "***" : "MISSING");

    const signature = cloudinary.utils.api_sign_request(
      params,
      apiSecret || ""
    );

    return NextResponse.json({
      signature,
      timestamp,
      upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET,
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    });
  } catch (error) {
    console.error("Error details:", error);
    return NextResponse.json(
      { error: "Error generating signed URL" },
      { status: 500 }
    );
  }
}
