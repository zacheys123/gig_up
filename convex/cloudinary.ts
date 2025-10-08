// convex/cloudinary.ts
import { mutation } from "./_generated/server";
import sha1 from "crypto-js/sha1";

export const generateCloudinarySignature = mutation({
  args: {},
  handler: async (ctx) => {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !apiKey || !apiSecret || !uploadPreset) {
      throw new Error(
        "Cloudinary environment variables are not properly configured"
      );
    }

    const timestamp = Math.round(new Date().getTime() / 1000);

    // Create the signature string
    const signatureString = `upload_preset=${uploadPreset}&timestamp=${timestamp}${apiSecret}`;

    // Generate SHA-1 signature using crypto-js
    const signature = sha1(signatureString).toString();

    return {
      signature,
      timestamp,
      upload_preset: uploadPreset,
      cloud_name: cloudName,
      api_key: apiKey,
    };
  },
});
