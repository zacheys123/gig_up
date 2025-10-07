import { Doc } from "@/convex/_generated/dataModel";

type User = Doc<"users">;

type Toast = {
  success: (url: string) => void;
  error: (msg: string) => void;
};
interface UpdateResponse {
  updateStatus: boolean;
  message?: string | undefined;
}
export const fileupload = async (
  event: React.ChangeEvent<HTMLInputElement>, // Correct type for event
  updatefileFunc: (file: string) => void, // Assuming the URL is a string
  toast: Toast,
  allowedTypes: string[], // Array of allowed MIME types
  fileUrl: string,
  setFileUrl: (file: string | undefined) => void, // URL can be string or undefined
  setIsUploading: (isUploading: boolean) => void, // Boolean to indicate uploading state
  dep: "image" | "video", // Dependent on file type, restrict to valid options,
  user: User
) => {
  const file = event.target.files ? event.target.files[0] : null;
  if (fileUrl) {
    URL.revokeObjectURL(fileUrl);
  }
  if (file) {
    const url = URL.createObjectURL(file);
    setFileUrl(url || "");
  } else {
    setFileUrl(undefined);
  }

  if (!file) {
    return;
  }

  // Check for file size (e.g., limit to 60MB)
  const MAX_FILE_SIZE = 60 * 1024 * 1024; // 60MB
  if (file.size > MAX_FILE_SIZE) {
    toast.error("File is too large. Maximum size is 50MB.");
    return;
  }

  // Check if the file is a ${dep}
  if (!allowedTypes.includes(file.type)) {
    toast.error(`Only ${dep} files are allowed`);
    return;
  }
  const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
  if (!apiKey) {
    console.error(
      "API key is missing. Please check your environment variables.",
      apiKey
    );
    toast.error("API key is missing. Please check your environment variables.");
    return;
  }

  // Reset error
  setIsUploading(true);

  try {
    // console.log(user);
    // Step 1: Get the signed upload URL from your API
    const response = await fetch("/api/image/sign-upload", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const { signature, timestamp, upload_preset, cloud_name } =
      await response.json();

    console.log(signature, timestamp, upload_preset, cloud_name);
    // Step 2: Upload the ${dep} file to Cloudinary
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", upload_preset);
    formData.append("api_key", apiKey);
    formData.append("signature", signature);
    formData.append("timestamp", timestamp);
    formData.append("cloud_name", cloud_name);

    const uploadResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${cloud_name}/${dep}/upload/`,
      {
        method: "POST",
        body: formData,
      }
    );

    const uploadResult = await uploadResponse.json();
    console.error("Upload result", uploadResult);

    if (uploadResponse.ok) {
      if (dep === "video") {
        updatefileFunc(uploadResult.secure_url);
        console.error("Upload result url", uploadResult.secure_url);

        console.log("Sending PUT request with url:", uploadResult.secure_url);

        if (user?._id && uploadResult.secure_url) {
          try {
            if (!user?._id) {
              console.error("User ID is missing.", user);
              toast.error("User ID is missing.");
              return;
            }

            const url = `/api/user/videoprofile/${user?._id}`;
            console.log("Fetching:", url);

            const response = await fetch(url, {
              method: "PUT", // Ensure it's PUT
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ videoUrl: uploadResult.secure_url }),
            });

            console.log("Raw response:", response.status, response.statusText);

            if (!response.ok) {
              console.error(
                "Response error:",
                response.status,
                response.statusText
              );
              toast.error(`Error: ${response.statusText}`);
              return;
            }

            const data: UpdateResponse = await response.json();
            console.log("API Response:", data);

            if (data.updateStatus) {
              toast.success(data.message || "Video updated successfully!");
            } else {
              toast.error(data.message || "Failed to upload video.");
            }
          } catch (error) {
            console.error("Error uploading video:", error);
            toast.error("An error occurred while uploading.");
          }
        }
      } else if (dep === "image") {
        console.error("Image Upload successful.", uploadResult?.secure_url);
        toast.success("Image Upload successful.");

        updatefileFunc(uploadResult.secure_url);
      } else {
        console.error("Upload failed, please try again.");
        toast.error("Upload failed, please try again.");
        console.log(uploadResult);
      }
    }
  } catch (error) {
    toast.error("An error occurred during upload.");
    console.error("An error occurred during upload.", error);
  } finally {
    setIsUploading(false);
  }
};
