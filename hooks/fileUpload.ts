import { Doc } from "@/convex/_generated/dataModel";

type User = Doc<"users">;

type Toast = {
  success: (message: string) => void;
  error: (message: string) => void;
};

export const fileupload = async (
  event: React.ChangeEvent<HTMLInputElement>,
  updatefileFunc: (file: string) => void,
  toast: Toast,
  allowedTypes: string[],
  fileUrl: string,
  setFileUrl: (file: string | undefined) => void,
  setIsUploading: (isUploading: boolean) => void,
  dep: "image" | "video",
  user: User
  // Removed generateSignature parameter
) => {
  const file = event.target.files ? event.target.files[0] : null;

  // Clean up previous URL
  if (fileUrl) {
    URL.revokeObjectURL(fileUrl);
  }

  if (file) {
    const url = URL.createObjectURL(file);
    setFileUrl(url);
  } else {
    setFileUrl(undefined);
  }

  if (!file) {
    return;
  }

  // Check for file size
  const MAX_FILE_SIZE = 60 * 1024 * 1024;
  if (file.size > MAX_FILE_SIZE) {
    toast.error("File is too large. Maximum size is 60MB.");
    return;
  }

  // Check if the file type is allowed
  if (!allowedTypes.includes(file.type)) {
    toast.error(`Only ${dep} files are allowed`);
    return;
  }

  setIsUploading(true);

  try {
    // Step 1: Get the signed upload URL from your existing API route
    const response = await fetch("/api/image/sign-upload", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to get upload signature");
    }

    const { signature, timestamp, upload_preset, cloud_name } =
      await response.json();
    const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;

    if (!apiKey) {
      throw new Error("Cloudinary API key not found");
    }

    // Step 2: Upload the file to Cloudinary
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", upload_preset);
    formData.append("api_key", apiKey);
    formData.append("signature", signature);
    formData.append("timestamp", timestamp.toString());
    formData.append("cloud_name", cloud_name);

    const uploadResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${cloud_name}/${dep}/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const uploadResult = await uploadResponse.json();

    if (uploadResponse.ok) {
      const secureUrl = uploadResult.secure_url;

      // For videos, just call the update function - no separate API call needed
      if (dep === "video") {
        updatefileFunc(secureUrl);
        toast.success("Video uploaded successfully!");
      } else if (dep === "image") {
        updatefileFunc(secureUrl);
        toast.success("Image uploaded successfully!");
      }
    } else {
      console.error("Upload failed:", uploadResult);
      toast.error("Upload failed, please try again.");
    }
  } catch (error) {
    console.error("Upload error:", error);
    toast.error("An error occurred during upload.");
  } finally {
    setIsUploading(false);
  }
};
