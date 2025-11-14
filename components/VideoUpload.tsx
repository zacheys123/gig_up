"use client";

import React, { useState, useCallback, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Upload,
  Video,
  Music,
  Globe,
  Lock,
  Tag,
  Clock,
  Calendar,
  Briefcase,
  User,
  Sparkles,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { useThemeColors } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

import { useCurrentUser } from "@/hooks/useCurrentUser";
import { fileupload } from "@/hooks/fileUpload";

interface VideoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
}

type VideoType = "profile" | "gig" | "casual" | "promo" | "other";

export const VideoUploadModal: React.FC<VideoUploadModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
}) => {
  const { userId: clerkId } = useAuth();
  const { user: currentUser } = useCurrentUser();
  const { colors, isDarkMode } = useThemeColors();
  const createVideo = useMutation(api.controllers.videos.createVideo);

  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | undefined>(undefined);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoType, setVideoType] = useState<VideoType>("casual");
  const [isPublic, setIsPublic] = useState(true);
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Video type options
  const videoTypeOptions = [
    {
      value: "profile" as VideoType,
      label: "Profile Video",
      icon: User,
      description: "Showcase your main talent",
      color: "blue",
    },
    {
      value: "gig" as VideoType,
      label: "Live Performance",
      icon: Music,
      description: "From concerts or events",
      color: "green",
    },
    {
      value: "casual" as VideoType,
      label: "Casual Jam",
      icon: Sparkles,
      description: "Informal practice sessions",
      color: "purple",
    },
    {
      value: "promo" as VideoType,
      label: "Promo Video",
      icon: Briefcase,
      description: "Professional promotional content",
      color: "orange",
    },
    {
      value: "other" as VideoType,
      label: "Other",
      icon: Video,
      description: "Other types of performances",
      color: "gray",
    },
  ];

  // Allowed video types
  const allowedVideoTypes = [
    "video/mp4",
    "video/mov",
    "video/avi",
    "video/webm",
    "video/quicktime",
  ];

  // Handle file upload using your existing fileupload function
  const handleFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      if (!currentUser) {
        toast.error("Please sign in to upload videos");
        return;
      }

      await fileupload(
        event,
        (url: string) => {
          setVideoUrl(url);
          toast.success("Video uploaded successfully!");
        },
        toast,
        allowedVideoTypes,
        videoUrl || "",
        setVideoUrl,
        setIsUploading,
        "video",
        currentUser
      );

      // Create preview
      const file = event.target.files?.[0];
      if (file) {
        setSelectedFile(file);
        const previewUrl = URL.createObjectURL(file);
        setVideoPreview(previewUrl);
      }
    },
    [currentUser, videoUrl]
  );

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropZoneRef.current) {
      dropZoneRef.current.classList.add(
        "border-amber-400",
        "bg-amber-50/50",
        "dark:bg-amber-900/20"
      );
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropZoneRef.current) {
      dropZoneRef.current.classList.remove(
        "border-amber-400",
        "bg-amber-50/50",
        "dark:bg-amber-900/20"
      );
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (dropZoneRef.current) {
        dropZoneRef.current.classList.remove(
          "border-amber-400",
          "bg-amber-50/50",
          "dark:bg-amber-900/20"
        );
      }

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        // Create a synthetic event for fileupload
        const syntheticEvent = {
          target: { files },
        } as React.ChangeEvent<HTMLInputElement>;

        handleFileUpload(syntheticEvent);
      }
    },
    [handleFileUpload]
  );

  // Handle tag input
  const handleAddTag = useCallback(() => {
    if (currentTag.trim() && tags.length < 5) {
      setTags((prev) => [...prev, currentTag.trim()]);
      setCurrentTag("");
    }
  }, [currentTag, tags]);

  const handleRemoveTag = useCallback((tagToRemove: string) => {
    setTags((prev) => prev.filter((tag) => tag !== tagToRemove));
  }, []);

  const handleTagKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleAddTag();
      }
    },
    [handleAddTag]
  );

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!videoUrl || !title.trim() || !clerkId) {
      toast.error("Please upload a video and fill in all required fields");
      return;
    }

    setIsUploading(true);

    try {
      // Create video record in Convex
      await createVideo({
        userId: clerkId,
        title: title.trim(),
        description: description.trim(),
        url: videoUrl,
        thumbnail: "", // You might want to generate a thumbnail
        duration: 0, // You can calculate this from the video
        isPublic,
        videoType,
        tags,
      });

      toast.success("Performance uploaded successfully!");
      onUploadSuccess();
      handleClose();
    } catch (error) {
      console.error("Error creating video:", error);
      toast.error("Failed to upload video. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // Reset form and close modal
  const handleClose = () => {
    setSelectedFile(null);
    setVideoUrl(undefined);
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }
    setVideoPreview(null);
    setTitle("");
    setDescription("");
    setVideoType("casual");
    setIsPublic(true);
    setTags([]);
    setCurrentTag("");
    onClose();
  };

  // Clean up preview URL
  React.useEffect(() => {
    return () => {
      if (videoPreview) {
        URL.revokeObjectURL(videoPreview);
      }
    };
  }, [videoPreview]);

  const getColorClass = (color: string) => {
    const colors = {
      blue: "bg-blue-500",
      green: "bg-green-500",
      purple: "bg-purple-500",
      orange: "bg-orange-500",
      gray: "bg-gray-500",
    };
    return colors[color as keyof typeof colors] || colors.gray;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={cn(
              "fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2",
              "w-full max-w-2xl max-h-[90vh] overflow-hidden",
              "rounded-3xl shadow-2xl border z-50",
              colors.card,
              colors.border
            )}
          >
            {/* Header */}
            <div
              className={cn(
                "flex items-center justify-between p-6 border-b",
                colors.border
              )}
            >
              <div>
                <h2 className={cn("text-2xl font-bold", colors.text)}>
                  Upload Performance
                </h2>
                <p className={cn("text-sm mt-1", colors.textMuted)}>
                  Share your musical talent with the world
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleClose}
                className={cn(
                  "p-2 rounded-xl transition-colors",
                  colors.hoverBg,
                  colors.text
                )}
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* File Upload Section */}
                <div>
                  <label
                    className={cn(
                      "block text-sm font-medium mb-3",
                      colors.text
                    )}
                  >
                    Video File *
                  </label>

                  {!videoUrl ? (
                    <motion.div
                      ref={dropZoneRef}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={cn(
                        "border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all",
                        "hover:border-amber-400 hover:bg-amber-50/50 dark:hover:bg-amber-900/20",
                        colors.border,
                        isUploading && "opacity-50 pointer-events-none"
                      )}
                    >
                      {isUploading ? (
                        <div className="flex flex-col items-center">
                          <Loader2 className="w-12 h-12 animate-spin text-amber-500 mb-4" />
                          <h3
                            className={cn(
                              "text-lg font-semibold mb-2",
                              colors.text
                            )}
                          >
                            Uploading...
                          </h3>
                          <p className={cn("text-sm", colors.textMuted)}>
                            Please wait while we upload your video
                          </p>
                        </div>
                      ) : (
                        <>
                          <Upload
                            className={cn(
                              "w-12 h-12 mx-auto mb-4",
                              colors.textMuted
                            )}
                          />
                          <h3
                            className={cn(
                              "text-lg font-semibold mb-2",
                              colors.text
                            )}
                          >
                            Drop your video here
                          </h3>
                          <p className={cn("text-sm mb-4", colors.textMuted)}>
                            or click to browse files
                          </p>
                          <div
                            className={cn(
                              "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm",
                              "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                            )}
                          >
                            <Video className="w-4 h-4" />
                            MP4, MOV, AVI up to 60MB
                          </div>
                        </>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={cn(
                        "rounded-2xl overflow-hidden border",
                        colors.border
                      )}
                    >
                      <div className="relative aspect-video bg-black">
                        <video
                          src={videoPreview || videoUrl}
                          className="w-full h-full object-cover"
                          controls
                        />
                        <div className="absolute top-3 right-3">
                          <div
                            className={cn(
                              "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                              "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                            )}
                          >
                            <CheckCircle className="w-3 h-3" />
                            Uploaded
                          </div>
                        </div>
                      </div>
                      <div className="p-4 flex items-center justify-between">
                        <div>
                          <p className={cn("font-medium", colors.text)}>
                            {selectedFile?.name || "Video file"}
                          </p>
                          <p className={cn("text-sm", colors.textMuted)}>
                            {selectedFile
                              ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`
                              : "Ready to publish"}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setVideoUrl(undefined);
                            setSelectedFile(null);
                            if (videoPreview) {
                              URL.revokeObjectURL(videoPreview);
                              setVideoPreview(null);
                            }
                          }}
                          className={cn(
                            "px-3 py-1 rounded-lg text-sm transition-colors",
                            "text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                          )}
                        >
                          Change
                        </button>
                      </div>
                    </motion.div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={isUploading}
                  />
                </div>

                {/* Title */}
                <div>
                  <label
                    className={cn(
                      "block text-sm font-medium mb-2",
                      colors.text
                    )}
                  >
                    Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Give your performance a captivating title..."
                    className={cn(
                      "w-full px-4 py-3 rounded-xl border transition-all",
                      "focus:ring-2 focus:ring-amber-500 focus:border-transparent",
                      colors.text,
                      colors.border,
                      colors.backgroundMuted
                    )}
                    required
                    disabled={isUploading}
                  />
                </div>

                {/* Description */}
                <div>
                  <label
                    className={cn(
                      "block text-sm font-medium mb-2",
                      colors.text
                    )}
                  >
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Tell the story behind this performance..."
                    rows={3}
                    className={cn(
                      "w-full px-4 py-3 rounded-xl border transition-all resize-none",
                      "focus:ring-2 focus:ring-amber-500 focus:border-transparent",
                      colors.text,
                      colors.border,
                      colors.backgroundMuted
                    )}
                    disabled={isUploading}
                  />
                </div>

                {/* Video Type */}
                <div>
                  <label
                    className={cn(
                      "block text-sm font-medium mb-3",
                      colors.text
                    )}
                  >
                    Performance Type *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {videoTypeOptions.map((option) => (
                      <motion.button
                        key={option.value}
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setVideoType(option.value)}
                        disabled={isUploading}
                        className={cn(
                          "p-3 rounded-xl border text-left transition-all",
                          "hover:border-amber-400 hover:bg-amber-50/50 dark:hover:bg-amber-900/20",
                          videoType === option.value
                            ? "border-amber-400 bg-amber-50 dark:bg-amber-900/20"
                            : colors.border,
                          isUploading && "opacity-50 pointer-events-none"
                        )}
                      >
                        <div
                          className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center mb-2",
                            getColorClass(option.color),
                            "text-white"
                          )}
                        >
                          <option.icon className="w-4 h-4" />
                        </div>
                        <p
                          className={cn(
                            "text-sm font-medium mb-1",
                            videoType === option.value
                              ? colors.text
                              : colors.textMuted
                          )}
                        >
                          {option.label}
                        </p>
                        <p className={cn("text-xs", colors.textMuted)}>
                          {option.description}
                        </p>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Privacy Settings */}
                <div>
                  <label
                    className={cn(
                      "block text-sm font-medium mb-3",
                      colors.text
                    )}
                  >
                    Visibility
                  </label>
                  <div className="flex gap-4">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setIsPublic(true)}
                      disabled={isUploading}
                      className={cn(
                        "flex-1 p-4 rounded-xl border text-center transition-all",
                        "hover:border-green-400 hover:bg-green-50/50 dark:hover:bg-green-900/20",
                        isPublic
                          ? "border-green-400 bg-green-50 dark:bg-green-900/20"
                          : colors.border,
                        isUploading && "opacity-50 pointer-events-none"
                      )}
                    >
                      <Globe
                        className={cn(
                          "w-5 h-5 mx-auto mb-2",
                          isPublic
                            ? "text-green-600 dark:text-green-400"
                            : colors.textMuted
                        )}
                      />
                      <p
                        className={cn(
                          "text-sm font-medium mb-1",
                          isPublic ? colors.text : colors.textMuted
                        )}
                      >
                        Public
                      </p>
                      <p className={cn("text-xs", colors.textMuted)}>
                        Anyone can view
                      </p>
                    </motion.button>

                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setIsPublic(false)}
                      disabled={isUploading}
                      className={cn(
                        "flex-1 p-4 rounded-xl border text-center transition-all",
                        "hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/20",
                        !isPublic
                          ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20"
                          : colors.border,
                        isUploading && "opacity-50 pointer-events-none"
                      )}
                    >
                      <Lock
                        className={cn(
                          "w-5 h-5 mx-auto mb-2",
                          !isPublic
                            ? "text-blue-600 dark:text-blue-400"
                            : colors.textMuted
                        )}
                      />
                      <p
                        className={cn(
                          "text-sm font-medium mb-1",
                          !isPublic ? colors.text : colors.textMuted
                        )}
                      >
                        Private
                      </p>
                      <p className={cn("text-xs", colors.textMuted)}>
                        Followers only
                      </p>
                    </motion.button>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label
                    className={cn(
                      "block text-sm font-medium mb-2",
                      colors.text
                    )}
                  >
                    Tags{" "}
                    {tags.length > 0 && (
                      <span className="text-amber-500">({tags.length}/5)</span>
                    )}
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={currentTag}
                      onChange={(e) => setCurrentTag(e.target.value)}
                      onKeyDown={handleTagKeyDown}
                      placeholder="Add tags to help others find your video..."
                      className={cn(
                        "flex-1 px-4 py-2 rounded-xl border transition-all",
                        "focus:ring-2 focus:ring-amber-500 focus:border-transparent",
                        colors.text,
                        colors.border,
                        colors.backgroundMuted
                      )}
                      disabled={isUploading || tags.length >= 5}
                    />
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleAddTag}
                      disabled={
                        !currentTag.trim() || tags.length >= 5 || isUploading
                      }
                      className={cn(
                        "px-4 py-2 rounded-xl font-medium transition-all",
                        "bg-amber-500 text-white hover:bg-amber-600",
                        "disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
                      )}
                    >
                      Add
                    </motion.button>
                  </div>

                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag, index) => (
                        <motion.span
                          key={index}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className={cn(
                            "inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm",
                            "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                          )}
                        >
                          <Tag className="w-3 h-3" />
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            disabled={isUploading}
                            className="hover:text-amber-900 dark:hover:text-amber-100"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </motion.span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <div className="flex gap-3 pt-4">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleClose}
                    disabled={isUploading}
                    className={cn(
                      "flex-1 px-6 py-3 rounded-xl font-medium transition-all",
                      "border hover:bg-gray-50 dark:hover:bg-gray-800",
                      colors.border,
                      colors.text,
                      isUploading && "opacity-50 pointer-events-none"
                    )}
                  >
                    Cancel
                  </motion.button>

                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={!videoUrl || !title.trim() || isUploading}
                    className={cn(
                      "flex-1 px-6 py-3 rounded-xl font-medium transition-all",
                      "bg-gradient-to-r from-amber-500 to-orange-500 text-white",
                      "hover:from-amber-600 hover:to-orange-600 shadow-lg",
                      "disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed",
                      "flex items-center justify-center gap-2"
                    )}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Publishing...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        Publish Performance
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default VideoUploadModal;
