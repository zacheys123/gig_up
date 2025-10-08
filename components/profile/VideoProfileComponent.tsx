"use client";

import { fileupload } from "@/hooks/fileUpload";
import { UserProps, VideoProfileProps } from "@/types/userTypes";
import { CircularProgress } from "@mui/material";
import { motion } from "framer-motion";
import React, { ChangeEvent, useCallback, useState } from "react";
import { toast } from "sonner";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { Music, Play, Trash2, Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useThemeColors } from "@/hooks/useTheme";

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

  // State for file upload
  const [fileUrl, setFileUrl] = useState<string>("");
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadModal, setUploadModal] = useState<boolean>(false);
  const [videopreview, setVideopreview] = useState<boolean>(false);
  const [videomenu, setVideomenu] = useState<boolean>(false);
  const [currentvideo, setCurrentVideo] = useState<VideoProfileProps>();
  const [addedVideos, setAddedVideos] = useState<string[]>([]);

  const handleFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const dep = "video";
      const allowedTypes = ["video/mp4", "video/webm", "video/ogg"];

      if (addedVideos.includes(fileUrl)) return;
      if (!user) {
        toast.error("User not found");
        return;
      }

      fileupload(
        event,
        (file: string) => {
          if (file) {
            // Create a new video object and add it
            const newVideo: VideoProfileProps = {
              _id: Date.now().toString(),
              title: `Performance Video ${videos.length + 1}`,
              url: file,
            };
            onAddVideo(newVideo);
            setAddedVideos((prev) =>
              prev.length < 3 ? [...prev, file] : prev
            );
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
    [fileUrl, addedVideos, videos.length, onAddVideo, user]
  );

  const deleteVideo = (videoId: string) => {
    onRemoveVideo(videoId);
    setAddedVideos(addedVideos.filter((video) => video !== videoId));
    setCurrentVideo(undefined);
    setVideopreview(false);
    setVideomenu(false);
    toast.success("Video removed! Don't forget to save your profile.");
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
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveVideo(video._id);
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
                  <div className="flex justify-between items-center">
                    <Badge
                      variant="outline"
                      className={cn("text-xs", colors.border)}
                    >
                      {getPlatformFromUrl(video.url)}
                    </Badge>
                    {video.createdAt && (
                      <p className={cn("text-xs", colors.textMuted)}>
                        {new Date(video.createdAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {uploadModal && (
        <div className="flex justify-center items-center fixed inset-0 z-50 bg-black/40">
          <div className="relative w-[80%] mx-auto max-w-2xl bg-neutral-700 rounded-lg p-6 shadow-lg">
            {/* Close Button */}
            <button
              onClick={() => setUploadModal(false)}
              className="absolute right-4 top-4 text-white text-2xl font-bold hover:text-gray-300"
            >
              &times;
            </button>

            {(videos.length || 0) < 3 && addedVideos.length < 3 && (
              <h2 className="text-center text-white text-xl font-semibold mb-4">
                Upload Your Video
              </h2>
            )}

            {videos.length < 3 && addedVideos.length < 3 ? (
              <div className="flex flex-col items-center gap-4">
                {addedVideos.length < 3 && (
                  <>
                    <label
                      htmlFor="postvideo"
                      className={
                        !uploading
                          ? "bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 px-5 rounded-lg cursor-pointer transition"
                          : "pointer-events-none"
                      }
                    >
                      {!uploading ? (
                        "Upload Video"
                      ) : (
                        <CircularProgress
                          size="16px"
                          style={{ color: "white" }}
                        />
                      )}
                    </label>
                    <input
                      id="postvideo"
                      className="hidden"
                      type="file"
                      accept="video/*"
                      onChange={handleFileChange}
                      disabled={uploading}
                    />
                  </>
                )}
              </div>
            ) : (
              <p className="text-neutral-400 text-center">
                {`You've reached the maximum number of clips (3). Delete one to upload another.`}
              </p>
            )}

            {/* Display Added Videos */}
            {addedVideos.length > 0 && videos.length < 4 && (
              <div className="mt-6">
                <h3 className="text-white text-md font-semibold mb-2">
                  Recently Added Videos
                </h3>
                <div className="flex gap-3 overflow-x-auto">
                  {addedVideos.map((vid, index) => (
                    <div
                      key={index}
                      className="relative group w-24 h-24 rounded-lg overflow-hidden border"
                    >
                      <video
                        className="w-full h-full object-cover"
                        src={vid}
                        muted
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Display Permanent Videos */}
            {videos.length > 0 && (
              <div className="mt-6">
                <h3 className="text-white text-lg font-semibold mb-2">
                  Your Videos
                </h3>
                <div className="flex gap-3 overflow-x-auto">
                  {videos.map((vid) => (
                    <div
                      onClick={() => openVideoPreview(vid)}
                      key={vid._id}
                      className="relative group w-24 h-24 rounded-lg overflow-hidden border cursor-pointer"
                    >
                      <video
                        className="w-full h-full object-cover"
                        src={vid.url}
                        muted
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
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
                  <li className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-blue-600 cursor-pointer transition-transform transform hover:translate-x-2">
                    👥 <span>Share with Clients</span>
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
