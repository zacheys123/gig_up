"use client";

import { fileupload } from "@/hooks/fileUpload";
import { UserProps, VideoProfileProps } from "@/types/userTypes";
import { CircularProgress } from "@mui/material";
import { motion } from "framer-motion";
import React, { ChangeEvent, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { Music, Play, Trash2, Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useThemeColors } from "@/hooks/useTheme";
import { Globe, Lock, Users } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface VideoProfileComponentProps {
  videos: VideoProfileProps[];
  onAddVideo: (video: VideoProfileProps) => void;
  onRemoveVideo: (videoId: string) => void;
  loading?: boolean;
  user?: UserProps;
}

const VideoProfileComponent = ({
  videos,
  onAddVideo,
  onRemoveVideo,
  loading = false,
  user,
}: VideoProfileComponentProps) => {
  const { colors } = useThemeColors();

  // Convex queries and mutations
  const createVideo = useMutation(api.controllers.videos.createVideo);
  const deleteVideoMutation = useMutation(api.controllers.videos.deleteVideo);
  const userVideos = useQuery(
    api.controllers.videos.getUserProfileVideos,
    user ? { userId: user.clerkId } : "skip"
  );

  // State for file upload
  const [fileUrl, setFileUrl] = useState<string>("");
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadModal, setUploadModal] = useState<boolean>(false);
  const [videopreview, setVideopreview] = useState<boolean>(false);
  const [videomenu, setVideomenu] = useState<boolean>(false);
  const [currentvideo, setCurrentVideo] = useState<VideoProfileProps>();
  const [addedVideos, setAddedVideos] = useState<string[]>([]);
  const [newVideoTitle, setNewVideoTitle] = useState("");
  const [newVideoDescription, setNewVideoDescription] = useState("");
  const [newVideoPrivacy, setNewVideoPrivacy] = useState<boolean>(true);
  const [newVideoType, setNewVideoType] = useState<
    "profile" | "gig" | "casual" | "promo" | "other"
  >("profile");
  const [newVideoTags, setNewVideoTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState("");

  // Sync with database videos when component mounts
  useEffect(() => {
    if (userVideos && user) {
      // You might want to sync the local state with database videos here
      // Or handle this in the parent component
    }
  }, [userVideos, user]);

  const handleFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const dep = "video";
      const allowedTypes = ["video/mp4", "video/webm", "video/ogg"];

      if (addedVideos.includes(fileUrl)) return;
      if (!user) {
        toast.error("User not found");
        return;
      }

      if (!newVideoTitle.trim()) {
        toast.error("Please enter a video title first");
        return;
      }

      fileupload(
        event,
        async (file: string) => {
          if (file) {
            try {
              // Create video in database
              const videoId = await createVideo({
                userId: user.clerkId,
                title: newVideoTitle,
                description: newVideoDescription || "",
                url: file,
                isPublic: newVideoPrivacy,
                videoType: newVideoType,
                tags: newVideoTags,
                // You might want to calculate duration or get thumbnail from Cloudinary
                duration: 0, // You can extract this from the video file if needed
                thumbnail: "", // You can generate thumbnail from video
                gigId: undefined,
                gigName: undefined,
              });

              // Create local video object for immediate UI update
              const newVideo: VideoProfileProps = {
                _id: videoId,
                userId: user.clerkId,
                title: newVideoTitle,
                description: newVideoDescription || undefined,
                url: file,
                thumbnail: "",
                duration: 0,
                isPublic: newVideoPrivacy,
                videoType: newVideoType,
                isProfileVideo: newVideoType === "profile",
                gigId: undefined,
                gigName: undefined,
                tags: newVideoTags,
                views: 0,
                likes: 0,
                createdAt: Date.now(),
                updatedAt: Date.now(),
              };

              onAddVideo(newVideo);
              setAddedVideos((prev) =>
                prev.length < 3 ? [...prev, file] : prev
              );

              // Reset form
              setNewVideoTitle("");
              setNewVideoDescription("");
              setNewVideoPrivacy(true);
              setNewVideoType("profile");
              setNewVideoTags([]);
              setNewTagInput("");
              setUploadModal(false);

              toast.success("Video uploaded successfully!");
            } catch (error) {
              console.error("Error creating video:", error);
              toast.error("Failed to save video to database");
            }
          }
        },
        toast,
        allowedTypes,
        fileUrl,
        (file: string | undefined) => {
          if (file) {
            setFileUrl(file);
          }
        },
        setUploading,
        dep,
        user
      );
    },
    [
      fileUrl,
      addedVideos,
      newVideoTitle,
      newVideoDescription,
      newVideoPrivacy,
      newVideoType,
      newVideoTags,
      createVideo,
      onAddVideo,
      user,
    ]
  );

  const deleteVideo = async (videoId: string) => {
    try {
      await deleteVideoMutation({ videoId });
      onRemoveVideo(videoId);
      setAddedVideos(addedVideos.filter((video) => video !== videoId));
      setCurrentVideo(undefined);
      setVideopreview(false);
      setVideomenu(false);
      toast.success("Video deleted successfully!");
    } catch (error) {
      console.error("Error deleting video:", error);
      toast.error("Failed to delete video");
    }
  };

  const addTag = () => {
    if (newTagInput.trim() && !newVideoTags.includes(newTagInput.trim())) {
      setNewVideoTags([...newVideoTags, newTagInput.trim()]);
      setNewTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setNewVideoTags(newVideoTags.filter((tag) => tag !== tagToRemove));
  };

  const openVideoPreview = (video: VideoProfileProps) => {
    setCurrentVideo(video);
    setVideopreview(true);
    setVideomenu(false);
  };

  const closeVideoPreview = () => {
    setCurrentVideo(undefined);
    setVideopreview(false);
    setVideomenu(false);
  };

  const getPlatformFromUrl = (url: string): string => {
    if (url.includes("youtube.com") || url.includes("youtu.be"))
      return "YouTube";
    if (url.includes("vimeo.com")) return "Vimeo";
    if (url.includes("dailymotion.com")) return "Dailymotion";
    if (url.match(/\.(mp4|mov|avi|wmv|flv|webm)$/)) return "Direct Video";
    return "Video";
  };

  const PrivacyOption = ({
    isSelected,
    onClick,
    icon,
    title,
    description,
  }: {
    isSelected: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    title: string;
    description: string;
  }) => (
    <div
      onClick={onClick}
      className={cn(
        "border-2 rounded-lg p-4 cursor-pointer transition-all duration-200",
        isSelected
          ? "border-amber-500 bg-amber-50 dark:bg-amber-950/20"
          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "p-2 rounded-full",
            isSelected ? "text-amber-600" : "text-gray-500"
          )}
        >
          {icon}
        </div>
        <div className="flex-1">
          <h4
            className={cn(
              "font-semibold",
              isSelected
                ? "text-amber-900 dark:text-amber-100"
                : "text-gray-900 dark:text-gray-100"
            )}
          >
            {title}
          </h4>
          <p
            className={cn(
              "text-sm mt-1",
              isSelected
                ? "text-amber-700 dark:text-amber-300"
                : "text-gray-600 dark:text-gray-400"
            )}
          >
            {description}
          </p>
        </div>
        <div
          className={cn(
            "w-5 h-5 rounded-full border-2 flex items-center justify-center",
            isSelected ? "border-amber-500 bg-amber-500" : "border-gray-400"
          )}
        >
          {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
        </div>
      </div>
    </div>
  );

  const videoTypes = [
    { value: "profile", label: "Profile Showcase" },
    { value: "gig", label: "Gig Recording" },
    { value: "casual", label: "Casual Performance" },
    { value: "promo", label: "Promotional Content" },
    { value: "other", label: "Other" },
  ];

  return (
    <>
      <div className="space-y-4">
        {/* Header with Add Button */}
        <div className="flex justify-between items-center">
          <div>
            <h3 className={cn("text-lg font-semibold", colors.text)}>
              Performance Videos
            </h3>
            <p className={cn("text-sm", colors.textMuted)}>
              Showcase your talent with performance videos ({videos.length}/3)
            </p>
          </div>
          <Button
            onClick={() => setUploadModal(true)}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
            disabled={loading || videos.length >= 3}
          >
            <Plus size={16} className="mr-1" /> Add Video
          </Button>
        </div>

        {/* Videos Grid */}
        {videos.length === 0 ? (
          <div
            className={cn(
              "text-center py-8 rounded-lg border-2 border-dashed",
              colors.border
            )}
          >
            <Music size={48} className={cn("mx-auto mb-4", colors.textMuted)} />
            <p className={cn("text-lg font-medium mb-2", colors.text)}>
              No videos yet
            </p>
            <p className={cn("text-sm", colors.textMuted)}>
              Add performance videos to showcase your talent
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {videos.map((video) => (
              <div
                key={video._id}
                className={cn(
                  "rounded-lg border overflow-hidden group hover:shadow-lg transition-all duration-300 cursor-pointer",
                  colors.card,
                  colors.border
                )}
                onClick={() => openVideoPreview(video)}
              >
                <div className="aspect-video bg-black relative">
                  {/* Video Thumbnail */}
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-900 to-black">
                    {video.thumbnail ? (
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center">
                        <Play
                          size={32}
                          className={cn("mx-auto mb-2", colors.textMuted)}
                        />
                        <p className={cn("text-sm font-medium", colors.text)}>
                          {video.title}
                        </p>
                        <p className={cn("text-xs mt-1", colors.textMuted)}>
                          Click to play
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Privacy Badge */}
                  <div className="absolute top-2 left-2">
                    <Badge
                      variant={video.isPublic ? "default" : "secondary"}
                      className={cn(
                        "text-xs",
                        video.isPublic
                          ? "bg-green-500 hover:bg-green-600"
                          : "bg-blue-500 hover:bg-blue-600"
                      )}
                    >
                      {video.isPublic ? (
                        <Globe size={12} className="mr-1" />
                      ) : (
                        <Users size={12} className="mr-1" />
                      )}
                      {video.isPublic ? "Public" : "Private"}
                    </Badge>
                  </div>

                  {/* Video Type Badge */}
                  <div className="absolute top-2 right-12">
                    <Badge
                      variant="outline"
                      className="text-xs bg-gray-800 text-white border-gray-600"
                    >
                      {video.videoType}
                    </Badge>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteVideo(video._id);
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    disabled={loading}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                {/* Video Info */}
                <div className={cn("p-3", colors.background)}>
                  <p
                    className={cn(
                      "text-sm font-medium mb-1 truncate",
                      colors.text
                    )}
                  >
                    {video.title}
                  </p>
                  {video.description && (
                    <p
                      className={cn(
                        "text-xs mb-2 line-clamp-2",
                        colors.textMuted
                      )}
                    >
                      {video.description}
                    </p>
                  )}
                  <div className="flex justify-between items-center">
                    <div className="flex gap-1">
                      <Badge
                        variant="outline"
                        className={cn("text-xs", colors.border)}
                      >
                        {getPlatformFromUrl(video.url)}
                      </Badge>
                      {video.views > 0 && (
                        <Badge
                          variant="outline"
                          className={cn("text-xs", colors.border)}
                        >
                          {video.views} views
                        </Badge>
                      )}
                    </div>
                    {video.createdAt && (
                      <p className={cn("text-xs", colors.textMuted)}>
                        {new Date(video.createdAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  {video.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {video.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className={cn(
                            "text-xs px-1.5 py-0.5 rounded",
                            colors.secondaryBackground,
                            colors.textMuted
                          )}
                        >
                          #{tag}
                        </span>
                      ))}
                      {video.tags.length > 3 && (
                        <span className={cn("text-xs", colors.textMuted)}>
                          +{video.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {uploadModal && (
        <div className="flex justify-center items-center fixed inset-0 z-50 bg-black/40">
          <div className="relative w-[90%] mx-auto max-w-2xl bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
            {/* Close Button */}
            <button
              onClick={() => {
                setUploadModal(false);
                setNewVideoTitle("");
                setNewVideoDescription("");
                setNewVideoPrivacy(true);
                setNewVideoType("profile");
                setNewVideoTags([]);
                setNewTagInput("");
              }}
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl font-bold"
            >
              &times;
            </button>

            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Upload Performance Video
            </h2>

            <div className="space-y-6">
              {/* Video Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Video Title *
                </label>
                <input
                  type="text"
                  value={newVideoTitle}
                  onChange={(e) => setNewVideoTitle(e.target.value)}
                  placeholder="My Amazing Piano Performance"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Video Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={newVideoDescription}
                  onChange={(e) => setNewVideoDescription(e.target.value)}
                  placeholder="Describe your performance..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                />
              </div>

              {/* Video Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Video Type
                </label>
                <select
                  value={newVideoType}
                  onChange={(e) => setNewVideoType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {videoTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {newVideoTags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X size={12} />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    placeholder="Add a tag..."
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-3 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Privacy Settings */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Privacy Settings
                </label>
                <div className="space-y-3">
                  <PrivacyOption
                    isSelected={newVideoPrivacy === true}
                    onClick={() => setNewVideoPrivacy(true)}
                    icon={<Globe size={20} />}
                    title="Public"
                    description="Visible to everyone on the platform"
                  />
                  <PrivacyOption
                    isSelected={newVideoPrivacy === false}
                    onClick={() => setNewVideoPrivacy(false)}
                    icon={<Users size={20} />}
                    title="Followers Only"
                    description="Only visible to your mutual followers"
                  />
                </div>
              </div>

              {/* File Upload Section */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Upload Video
                </h3>

                {(videos.length || 0) < 3 ? (
                  <div className="flex flex-col items-center gap-4">
                    <label
                      htmlFor="postvideo"
                      className={
                        !uploading
                          ? "bg-amber-500 hover:bg-amber-600 text-white font-medium py-3 px-6 rounded-lg cursor-pointer transition-colors duration-200"
                          : "bg-gray-400 cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg"
                      }
                    >
                      {!uploading ? (
                        "Choose Video File"
                      ) : (
                        <div className="flex items-center gap-2">
                          <CircularProgress
                            size={16}
                            style={{ color: "white" }}
                          />
                          Uploading...
                        </div>
                      )}
                    </label>
                    <input
                      id="postvideo"
                      className="hidden"
                      type="file"
                      accept="video/*"
                      onChange={handleFileChange}
                      disabled={uploading || !newVideoTitle.trim()}
                    />
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                      Maximum 3 videos allowed • MP4, WebM, OGG formats • 60MB
                      max
                    </p>
                  </div>
                ) : (
                  <p className="text-amber-600 dark:text-amber-400 text-center py-4">
                    You've reached the maximum number of videos (3). Delete one
                    to upload another.
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setUploadModal(false);
                    setNewVideoTitle("");
                    setNewVideoDescription("");
                    setNewVideoPrivacy(true);
                    setNewVideoType("profile");
                    setNewVideoTags([]);
                    setNewTagInput("");
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    document.getElementById("postvideo")?.click();
                  }}
                  disabled={uploading || !newVideoTitle.trim()}
                  className={cn(
                    "flex-1 px-4 py-2 rounded-md transition-colors",
                    !newVideoTitle.trim() || uploading
                      ? "bg-gray-400 cursor-not-allowed text-white"
                      : "bg-amber-500 hover:bg-amber-600 text-white"
                  )}
                >
                  Upload Video
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Video Preview Modal */}
      {currentvideo?._id && videopreview && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative h-[87%] w-[85%] max-w-4xl bg-gray-700 rounded-lg overflow-hidden"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {/* Header with Menu and Close */}
            <div className="absolute top-4 left-4 right-4 z-50 flex justify-between items-center">
              <button
                className="text-white p-2 hover:bg-white/20 rounded-full transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setVideomenu(!videomenu);
                }}
              >
                <HiOutlineDotsVertical size={20} />
              </button>
              <button
                className="text-white p-2 hover:bg-white/20 rounded-full transition-colors"
                onClick={closeVideoPreview}
              >
                <X size={20} />
              </button>
            </div>

            {/* Video Player */}
            <video
              className="w-full h-full object-contain"
              src={currentvideo?.url}
              controls
              autoPlay
              onClick={() => setVideomenu(false)}
            />

            {/* Video Menu */}
            {videomenu && (
              <motion.div
                className="absolute top-16 left-4 bg-white shadow-2xl rounded-xl w-full max-w-[280px] p-4 border border-gray-200 overflow-hidden z-50"
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
              >
                <ul className="flex flex-col gap-3">
                  <li className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-blue-600 cursor-pointer transition-transform transform hover:translate-x-2">
                    🌍 <span>Share Publicly</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-blue-600 cursor-pointer transition-transform transform hover:translate-x-2">
                    🔒 <span>Share Privately</span>
                  </li>

                  <li
                    className="flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-800 cursor-pointer transition-transform transform hover:translate-x-2"
                    onClick={() => deleteVideo(currentvideo?._id || "")}
                  >
                    🗑️ <span>Delete</span>
                  </li>
                </ul>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </>
  );
};

export default VideoProfileComponent;
