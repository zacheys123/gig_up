"use client";

import { fileupload } from "@/hooks/fileUpload";
import { UserProps, VideoProfileProps } from "@/types/userTypes";
import { CircularProgress } from "@mui/material";
import { motion } from "framer-motion";
import React, { ChangeEvent, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { HiOutlineDotsVertical } from "react-icons/hi";
import {
  Music,
  Play,
  Trash2,
  Plus,
  X,
  Edit,
  Save,
  RotateCcw,
  MessageCircle,
  Eye,
  ThumbsUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useThemeColors } from "@/hooks/useTheme";
import { Globe, Lock, Users } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

interface VideoProfileComponentProps {
  videos: VideoProfileProps[];
  onAddVideo: (video: VideoProfileProps) => void;
  onRemoveVideo: (videoId: string) => void;
  onUpdateVideo: (videoId: string, updates: Partial<VideoProfileProps>) => void;
  loading?: boolean;
  user?: UserProps;
}

const VideoProfileComponent = ({
  videos,
  onAddVideo,
  onRemoveVideo,
  onUpdateVideo,
  loading = false,
  user,
}: VideoProfileComponentProps) => {
  const { colors } = useThemeColors();
  const { userId } = useAuth();
  const router = useRouter();

  // Convex queries and mutations
  const createVideo = useMutation(api.controllers.videos.createVideo);
  const deleteVideoMutation = useMutation(api.controllers.videos.deleteVideo);
  const updateVideoMutation = useMutation(api.controllers.videos.updateVideo);
  const userVideos = useQuery(
    api.controllers.videos.getUserProfileVideos,
    user ? { userId: user.clerkId } : "skip",
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

  // Editing state
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    isPublic: true,
    videoType: "profile" as "profile" | "gig" | "casual" | "promo" | "other",
    tags: [] as string[],
  });
  const [editTagInput, setEditTagInput] = useState("");

  // Sync with database videos when component mounts
  useEffect(() => {
    if (userVideos && user) {
      // Sync logic if needed
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
                duration: 0,
                thumbnail: "",
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
                commentCount: 0, // Add comment count
                createdAt: Date.now(),
                updatedAt: Date.now(),
              };

              onAddVideo(newVideo);
              setAddedVideos((prev) =>
                prev.length < 3 ? [...prev, file] : prev,
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
        user,
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
    ],
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

  // Navigate to video detail page for comments
  const navigateToVideoDetail = (videoId: string) => {
    router.push(`/video/${videoId}`);
  };

  // Edit functionality
  const startEditing = (video: VideoProfileProps) => {
    setEditingVideoId(video._id);
    setEditForm({
      title: video.title,
      description: video.description || "",
      isPublic: video.isPublic,
      videoType: video.videoType,
      tags: video.tags || [],
    });
    setEditTagInput("");
  };

  const cancelEditing = () => {
    setEditingVideoId(null);
    setEditForm({
      title: "",
      description: "",
      isPublic: true,
      videoType: "profile",
      tags: [],
    });
  };

  const saveEdit = async () => {
    if (!editingVideoId) return;

    try {
      const updates = {
        title: editForm.title,
        description: editForm.description,
        isPublic: editForm.isPublic,
        videoType: editForm.videoType,
        tags: editForm.tags,
      };

      // Update in database
      await updateVideoMutation({
        videoId: editingVideoId,
        updates,
      });

      // Update local state
      onUpdateVideo(editingVideoId, updates);

      setEditingVideoId(null);
      toast.success("Video updated successfully!");
    } catch (error) {
      console.error("Error updating video:", error);
      toast.error("Failed to update video");
    }
  };

  const addEditTag = () => {
    if (editTagInput.trim() && !editForm.tags.includes(editTagInput.trim())) {
      setEditForm((prev) => ({
        ...prev,
        tags: [...prev.tags, editTagInput.trim()],
      }));
      setEditTagInput("");
    }
  };

  const removeEditTag = (tagToRemove: string) => {
    setEditForm((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
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
    if (editingVideoId) return; // Don't open preview if editing
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
        "border-2 rounded-lg p-3 sm:p-4 cursor-pointer transition-all duration-200",
        isSelected
          ? "border-amber-500 bg-amber-50 dark:bg-amber-950/20"
          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600",
      )}
    >
      <div className="flex items-start gap-2 sm:gap-3">
        <div
          className={cn(
            "p-1.5 sm:p-2 rounded-full flex-shrink-0",
            isSelected ? "text-amber-600" : "text-gray-500",
          )}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h4
            className={cn(
              "font-semibold text-sm sm:text-base",
              isSelected
                ? "text-amber-900 dark:text-amber-100"
                : "text-gray-900 dark:text-gray-100",
            )}
          >
            {title}
          </h4>
          <p
            className={cn(
              "text-xs sm:text-sm mt-1",
              isSelected
                ? "text-amber-700 dark:text-amber-300"
                : "text-gray-600 dark:text-gray-400",
            )}
          >
            {description}
          </p>
        </div>
        <div
          className={cn(
            "w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5",
            isSelected ? "border-amber-500 bg-amber-500" : "border-gray-400",
          )}
        >
          {isSelected && (
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-white" />
          )}
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
        <div className="flex flex-col xs:flex-row xs:justify-between xs:items-center gap-3">
          <div className="flex-1 min-w-0">
            <h3 className={cn("text-lg font-semibold truncate", colors.text)}>
              Performance Videos
            </h3>
            <p className={cn("text-sm", colors.textMuted)}>
              Showcase your talent with performance videos ({videos.length}/3)
            </p>
          </div>
          <Button
            onClick={() => setUploadModal(true)}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white w-full xs:w-auto"
            disabled={loading || videos.length >= 3}
            size="sm"
          >
            <Plus size={16} className="mr-1" />
            <span className="hidden xs:inline">Add Video</span>
            <span className="xs:hidden">Add</span>
          </Button>
        </div>

        {/* Videos Grid */}
        {videos.length === 0 ? (
          <div
            className={cn(
              "text-center py-8 sm:py-12 rounded-lg border-2 border-dashed",
              colors.border,
            )}
          >
            <Music
              size={40}
              className={cn("mx-auto mb-3 sm:mb-4", colors.textMuted)}
            />
            <p
              className={cn(
                "text-base sm:text-lg font-medium mb-2",
                colors.text,
              )}
            >
              No videos yet
            </p>
            <p className={cn("text-xs sm:text-sm px-4", colors.textMuted)}>
              Add performance videos to showcase your talent
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {videos.map((video) => (
              <div
                key={video._id}
                className={cn(
                  "rounded-lg border overflow-hidden group hover:shadow-lg transition-all duration-300",
                  colors.card,
                  colors.border,
                  editingVideoId === video._id
                    ? "ring-2 ring-amber-500 shadow-lg"
                    : "",
                )}
              >
                <div className="aspect-video bg-black relative">
                  {/* Video Thumbnail */}
                  <div
                    className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-900 to-black cursor-pointer"
                    onClick={() => !editingVideoId && openVideoPreview(video)}
                  >
                    {video.thumbnail ? (
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-2">
                        <Play
                          size={24}
                          className={cn(
                            "mx-auto mb-1 sm:mb-2 text-white",
                            colors.textMuted,
                          )}
                        />
                        <p
                          className={cn(
                            "text-xs sm:text-sm font-medium line-clamp-1 text-white",
                            colors.text,
                          )}
                        >
                          {video.title}
                        </p>
                        <p
                          className={cn(
                            "text-xs mt-1 hidden xs:block text-gray-300",
                            colors.textMuted,
                          )}
                        >
                          {editingVideoId ? "Editing..." : "Click to play"}
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
                          : "bg-blue-500 hover:bg-blue-600",
                      )}
                    >
                      {video.isPublic ? (
                        <>
                          <Globe size={10} className="mr-1" />
                          <span className="hidden xs:inline">Public</span>
                        </>
                      ) : (
                        <>
                          <Users size={10} className="mr-1" />
                          <span className="hidden xs:inline">Private</span>
                        </>
                      )}
                    </Badge>
                  </div>

                  {/* Video Type Badge - Only profile videos are clickable */}
                  <div className="absolute top-2 right-10 xs:right-12">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs max-w-[60px] truncate",
                        video.videoType === "profile"
                          ? "bg-amber-500 hover:bg-amber-600 text-white border-amber-600 cursor-pointer"
                          : "bg-gray-800 text-white border-gray-600 cursor-default",
                      )}
                      onClick={(e) => {
                        if (video.videoType === "profile") {
                          e.stopPropagation();
                          navigateToVideoDetail(video._id);
                        }
                      }}
                    >
                      {video.videoType}
                    </Badge>
                  </div>

                  {/* Action Buttons - ALWAYS VISIBLE NOW */}
                  <div className="absolute top-2 right-2 flex gap-1">
                    {editingVideoId === video._id ? (
                      <>
                        <button
                          onClick={saveEdit}
                          className="bg-green-500 text-white p-1.5 rounded-full hover:bg-green-600 transition-colors"
                          disabled={loading}
                          title="Save changes"
                        >
                          <Save size={14} />
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="bg-gray-500 text-white p-1.5 rounded-full hover:bg-gray-600 transition-colors"
                          disabled={loading}
                          title="Cancel editing"
                        >
                          <RotateCcw size={14} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditing(video);
                          }}
                          className="bg-blue-500 text-white p-1.5 rounded-full hover:bg-blue-600 transition-colors"
                          disabled={loading || !!editingVideoId}
                          title="Edit video"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteVideo(video._id);
                          }}
                          className="bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors"
                          disabled={loading || !!editingVideoId}
                          title="Delete video"
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div
                  className={cn(
                    "p-3 sm:p-4 rounded-lg border",
                    colors.border,
                    colors.background,
                  )}
                >
                  {editingVideoId === video._id ? (
                    // EDIT MODE - Full edit form
                    <div className="space-y-4">
                      <div>
                        <label
                          className={cn(
                            "block text-sm font-medium mb-2",
                            colors.text,
                          )}
                        >
                          Title *
                        </label>
                        <input
                          type="text"
                          value={editForm.title}
                          onChange={(e) =>
                            setEditForm((prev) => ({
                              ...prev,
                              title: e.target.value,
                            }))
                          }
                          className={cn(
                            "w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors",
                            colors.border,
                            colors.background,
                            colors.text,
                          )}
                          placeholder="Enter video title"
                        />
                      </div>

                      <div>
                        <label
                          className={cn(
                            "block text-sm font-medium mb-2",
                            colors.text,
                          )}
                        >
                          Description
                        </label>
                        <textarea
                          value={editForm.description}
                          onChange={(e) =>
                            setEditForm((prev) => ({
                              ...prev,
                              description: e.target.value,
                            }))
                          }
                          rows={2}
                          className={cn(
                            "w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors resize-none",
                            colors.border,
                            colors.background,
                            colors.text,
                          )}
                          placeholder="Enter video description (optional)"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {/* Privacy Toggle */}
                        <div>
                          <label
                            className={cn(
                              "block text-sm font-medium mb-2",
                              colors.textMuted,
                            )}
                          >
                            Privacy
                          </label>
                          <button
                            type="button"
                            onClick={() =>
                              setEditForm((prev) => ({
                                ...prev,
                                isPublic: !prev.isPublic,
                              }))
                            }
                            className={cn(
                              "w-full flex items-center justify-between px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all duration-200",
                              editForm.isPublic
                                ? "border-green-500 bg-green-400/70" +
                                    colors.destructive
                                : "border-blue-500 bg-violet-400/70",
                              colors.warning,
                            )}
                          >
                            <span className="text-sm font-medium">
                              {editForm.isPublic ? "Public" : "Private"}
                            </span>
                            {editForm.isPublic ? (
                              <Globe size={16} />
                            ) : (
                              <Users size={16} />
                            )}
                          </button>
                        </div>

                        {/* Video Type */}
                        <div>
                          <label
                            className={cn(
                              "block text-sm font-medium mb-2",
                              colors.text,
                            )}
                          >
                            Type
                          </label>
                          <select
                            value={editForm.videoType}
                            onChange={(e) =>
                              setEditForm((prev) => ({
                                ...prev,
                                videoType: e.target.value as any,
                              }))
                            }
                            className={cn(
                              "w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors",
                              colors.border,
                              colors.background,
                              colors.text,
                            )}
                          >
                            {videoTypes.map((type) => (
                              <option key={type.value} value={type.value}>
                                {type.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Tags */}
                      <div>
                        <label
                          className={cn(
                            "block text-sm font-medium mb-2",
                            colors.text,
                          )}
                        >
                          Tags
                        </label>
                        <div className="flex flex-wrap gap-2 mb-3 min-h-[32px]">
                          {editForm.tags.length > 0 ? (
                            editForm.tags.map((tag, index) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="flex items-center gap-1 text-sm bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200 border border-amber-200 dark:border-amber-800 transition-colors"
                              >
                                {tag}
                                <button
                                  type="button"
                                  onClick={() => removeEditTag(tag)}
                                  className="text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200 ml-1 transition-colors"
                                >
                                  <X size={14} />
                                </button>
                              </Badge>
                            ))
                          ) : (
                            <span
                              className={cn("text-sm italic", colors.textMuted)}
                            >
                              No tags added
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={editTagInput}
                            onChange={(e) => setEditTagInput(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                addEditTag();
                              }
                            }}
                            placeholder="Add tag and press Enter..."
                            className={cn(
                              "flex-1 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors",
                              colors.border,
                              colors.background,
                              colors.text,
                            )}
                          />
                          <button
                            type="button"
                            onClick={addEditTag}
                            disabled={!editTagInput.trim()}
                            className={cn(
                              "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                              editTagInput.trim()
                                ? "bg-amber-500 text-white hover:bg-amber-600 shadow-sm hover:shadow"
                                : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed",
                            )}
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // VIEW MODE - Clean Professional Layout
                    <>
                      {/* Title and Description */}
                      <div className="space-y-2 mb-4">
                        <h3
                          className={cn(
                            "font-semibold text-sm leading-tight line-clamp-2",
                            colors.text,
                          )}
                        >
                          {video.title}
                        </h3>
                        {video.description && (
                          <p
                            className={cn(
                              "text-xs leading-relaxed line-clamp-2",
                              colors.textMuted,
                            )}
                          >
                            {video.description}
                          </p>
                        )}
                      </div>

                      {/* Compact Engagement Stats */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {/* Platform Badge */}
                          <div
                            className={cn(
                              "text-xs font-medium px-2 py-1 rounded border",
                              colors.border,
                              colors.text,
                            )}
                          >
                            {getPlatformFromUrl(video.url)}
                          </div>

                          {/* Stats Row */}
                          <div className="flex items-center gap-3 text-xs">
                            {video.views > 0 && (
                              <div className="flex items-center gap-1">
                                <Eye size={10} className={colors.textMuted} />
                                <span className={colors.textMuted}>
                                  {video.views}
                                </span>
                              </div>
                            )}
                            {video.likes > 0 && (
                              <div className="flex items-center gap-1">
                                <ThumbsUp
                                  size={10}
                                  className={colors.textMuted}
                                />
                                <span className={colors.textMuted}>
                                  {video.likes}
                                </span>
                              </div>
                            )}
                            {(video.commentCount || 0) > 0 && (
                              <div
                                className="flex items-center gap-1 cursor-pointer hover:text-amber-600 transition-colors"
                                onClick={() => navigateToVideoDetail(video._id)}
                              >
                                <MessageCircle
                                  size={10}
                                  className={colors.textMuted}
                                />
                                <span className={colors.textMuted}>
                                  {video.commentCount || 0}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Upload Date */}
                        {video.createdAt && (
                          <span className={cn("text-xs", colors.textMuted)}>
                            {new Date(video.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                              },
                            )}
                          </span>
                        )}
                      </div>

                      {/* Tags and Action Button */}
                      <div className="flex items-center justify-between">
                        {/* Tags */}
                        {video.tags.length > 0 && (
                          <div className="flex items-center gap-1 flex-1 min-w-0">
                            {video.tags.slice(0, 2).map((tag, index) => (
                              <span
                                key={index}
                                className={cn(
                                  "text-xs px-1.5 py-0.5 rounded font-medium truncate max-w-[60px]",
                                  "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200",
                                  "border border-amber-200 dark:border-amber-800",
                                )}
                                title={tag}
                              >
                                #{tag}
                              </span>
                            ))}
                            {video.tags.length > 2 && (
                              <span
                                className={cn("text-xs px-1", colors.textMuted)}
                              >
                                +{video.tags.length - 2}
                              </span>
                            )}
                          </div>
                        )}

                        {/* View Comments Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigateToVideoDetail(video._id)}
                          className={cn(
                            "h-7 px-2 text-xs font-medium transition-all duration-200",
                            "hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-950/20 dark:hover:text-amber-300",
                            colors.textMuted,
                          )}
                        >
                          <MessageCircle size={12} className="mr-1" />
                          View
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rest of your modals remain the same */}
      {/* Upload Modal */}
      {uploadModal && (
        <div className="flex justify-center items-center fixed inset-0 z-50 bg-black/40 p-2 sm:p-4">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg">
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
              className="absolute right-3 top-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-xl sm:text-xl font-bold z-10"
            >
              &times;
            </button>

            <div className="p-4 sm:p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
                Upload Performance Video
              </h2>

              <div className="space-y-4 sm:space-y-6">
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
                    className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                    className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
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
                    className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {videoTypes.map((type) => (
                      <option
                        key={type.value}
                        value={type.value}
                        disabled={type.value !== "profile"} // Only profile is selectable
                        className={
                          type.value !== "profile" ? "text-gray-400" : ""
                        }
                      >
                        {type.label}{" "}
                        {type.value !== "profile" && "(Coming Soon)"}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-1 sm:gap-2 mb-2">
                    {newVideoTags.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="flex items-center gap-1 text-xs text-black bg-gray-200 whitespace-nowrap"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="text-red-500 hover:text-red-800"
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
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      className="px-3 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 text-sm whitespace-nowrap"
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
                  <div className="space-y-2 sm:space-y-3">
                    <PrivacyOption
                      isSelected={newVideoPrivacy === true}
                      onClick={() => setNewVideoPrivacy(true)}
                      icon={<Globe size={18} className="sm:w-5 sm:h-5" />}
                      title="Public"
                      description="Visible to everyone on the platform"
                    />
                    <PrivacyOption
                      isSelected={newVideoPrivacy === false}
                      onClick={() => setNewVideoPrivacy(false)}
                      icon={<Users size={18} className="sm:w-5 sm:h-5" />}
                      title="Followers Only"
                      description="Only visible to your mutual followers"
                    />
                  </div>
                </div>

                {/* File Upload Section */}
                <div className="border-t pt-4 sm:pt-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3 sm:mb-4">
                    Upload Video
                  </h3>

                  {(videos.length || 0) < 3 ? (
                    <div className="flex flex-col items-center gap-3 sm:gap-4">
                      <label
                        htmlFor="postvideo"
                        className={
                          !uploading
                            ? "bg-amber-500 hover:bg-amber-600 text-white font-medium py-2 sm:py-3 px-4 sm:px-6 rounded-lg cursor-pointer transition-colors duration-200 text-sm sm:text-base w-full sm:w-auto text-center"
                            : "bg-gray-400 cursor-not-allowed text-white font-medium py-2 sm:py-3 px-4 sm:px-6 rounded-lg text-sm sm:text-base w-full sm:w-auto text-center"
                        }
                      >
                        {!uploading ? (
                          "Choose Video File"
                        ) : (
                          <div className="flex items-center gap-2 justify-center">
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
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 text-center">
                        Maximum 3 videos allowed • MP4, WebM, OGG formats • 60MB
                        max
                      </p>
                    </div>
                  ) : (
                    <p className="text-amber-600 dark:text-amber-400 text-center py-3 sm:py-4 text-sm sm:text-base">
                      You've reached the maximum number of videos (3). Delete
                      one to upload another.
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 sm:gap-3 pt-4">
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
                    className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      document.getElementById("postvideo")?.click();
                    }}
                    disabled={uploading || !newVideoTitle.trim()}
                    className={cn(
                      "flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base rounded-md transition-colors",
                      !newVideoTitle.trim() || uploading
                        ? "bg-gray-400 cursor-not-allowed text-white"
                        : "bg-amber-500 hover:bg-amber-600 text-white",
                    )}
                  >
                    Upload Video
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Video Preview Modal */}
      {currentvideo?._id && videopreview && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-2 sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative w-full h-auto max-w-4xl max-h-[90vh] bg-gray-700 rounded-lg overflow-hidden"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {/* Header with Menu and Close */}
            <div className="absolute top-2 sm:top-4 left-2 sm:left-4 right-2 sm:right-4 z-50 flex justify-between items-center">
              <button
                className="text-white p-1.5 sm:p-2 hover:bg-white/20 rounded-full transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setVideomenu(!videomenu);
                }}
              >
                <HiOutlineDotsVertical size={18} className="sm:w-5 sm:h-5" />
              </button>
              <button
                className="text-white p-1.5 sm:p-2 hover:bg-white/20 rounded-full transition-colors"
                onClick={closeVideoPreview}
              >
                <X size={18} className="sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* Video Player */}
            <div className="aspect-video w-full">
              <video
                className="w-full h-full object-contain"
                src={currentvideo?.url}
                controls
                autoPlay
                onClick={() => setVideomenu(false)}
              />
            </div>

            {/* Video Menu */}
            {videomenu && (
              <motion.div
                className="absolute top-10 sm:top-16 left-2 sm:left-4 bg-white shadow-2xl rounded-xl w-full max-w-[280px] p-3 sm:p-4 border border-gray-200 overflow-hidden z-50"
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
              >
                <ul className="flex flex-col gap-2 sm:gap-3">
                  <li className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-blue-600 cursor-pointer transition-transform transform hover:translate-x-1">
                    🌍 <span>Share Publicly</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-blue-600 cursor-pointer transition-transform transform hover:translate-x-1">
                    🔒 <span>Share Privately</span>
                  </li>
                  <li
                    className="flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-800 cursor-pointer transition-transform transform hover:translate-x-1"
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
