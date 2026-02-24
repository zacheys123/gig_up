"use client";
import { useAuth } from "@clerk/nextjs";
import { Pencil, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useCallback, useState } from "react";
import { BsCameraFill } from "react-icons/bs";
import { Button } from "../ui/button";
import { toast } from "sonner";

import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Input } from "../ui/input";
import { fileupload } from "@/hooks/fileUpload";

const RouteProfile = ({ isMobile }: { isMobile: boolean }) => {
  const { userId } = useAuth();
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isfile, setIsfile] = useState<boolean>(false);
  const [imageUrl, setUrl] = useState<string>("");
  const [fileUrl, setFileUrl] = useState<string>("");
  const { user } = useCurrentUser();

  const router = useRouter();
  console.log(isMobile);
  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const dep = "image";
      const allowedTypes = [
        "image/png",
        "image/jpeg",
        "image/gif",
        "image/webp",
      ];
      fileupload(
        event,
        (file: string) => setUrl(file),
        toast,
        allowedTypes,
        fileUrl,
        (file: string | undefined) => file && setFileUrl(file),
        setIsUploading,
        dep,
        user?.user,
      );
    },
    [fileUrl],
  );

  const handleUpload = async (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    if (!fileUrl) {
      toast.error("Please select an image to upload.");
      return;
    }
    try {
      await fetch(`/api/user/updateImage/${user?.user?._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: imageUrl }),
      });
      toast.success("Profile picture updated successfully!");
      setIsfile(false);
    } catch (error) {
      toast.error("Image upload failed");
      console.error("Error:", error);
      setIsfile(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-purple-500/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />

        <div className="relative w-32 h-32 md:w-40 md:h-40">
          {!fileUrl && !isfile && (
            <label
              className="absolute bottom-2 right-2 p-2 bg-gradient-to-br from-amber-500 to-purple-600 rounded-full shadow-lg cursor-pointer hover:shadow-amber-500/20 transition-all"
              htmlFor="imageId"
            >
              <BsCameraFill className="text-white text-lg" />
            </label>
          )}

          {user?.user?.picture && (
            <img
              src={fileUrl || user.user.picture}
              className="object-cover w-full h-full rounded-full border-2 border-amber-500/30 hover:border-amber-400 transition-all"
              alt={user.user.firstname || "User"}
              width={160}
              height={160}
            />
          )}

          <form onSubmit={handleUpload}>
            <Input
              type="file"
              id="imageId"
              className="hidden"
              name="media"
              accept="image/*"
              onChange={handleFileChange}
            />
            {fileUrl && !isfile && (
              <Button
                type="submit"
                className="absolute bottom-2 right-2 text-xs h-8 bg-gradient-to-br from-amber-500 to-purple-600 hover:from-amber-600 hover:to-purple-700 shadow-lg"
                disabled={isUploading}
              >
                {isUploading ? "Uploading..." : "Save"}
                <Upload className="ml-1 h-3 w-3" />
              </Button>
            )}
          </form>
        </div>
      </div>

      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-2 group">
          <h3 className="text-xl md:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-purple-400">
            {user?.user?.firstname} {user?.user?.lastname}
          </h3>
          <button
            onClick={() => router.push(`/profile/${userId}/user`)}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-amber-500/10"
          >
            <Pencil className="text-amber-400 h-4 w-4" />
          </button>
        </div>
        <p className="text-sm text-gray-400">{user?.user?.email}</p>
      </div>
    </div>
  );
};

export default RouteProfile;
