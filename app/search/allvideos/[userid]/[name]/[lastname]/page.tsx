"use client";
import VideoUploadModal from "@/components/videos/VideoModal";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { VideoProps } from "@/types/userinterfaces";
import { CircularProgress } from "@mui/material";
import { motion } from "framer-motion";
import { ArrowBigLeftIcon, RefreshCw, Upload } from "lucide-react";
import moment from "moment";
import { useParams, useRouter } from "next/navigation";
import React, { FormEvent, useEffect, useState } from "react";
import { Heart, Share2 } from "react-feather";
import { BsThreeDotsVertical } from "react-icons/bs";
import { toast } from "sonner";

interface UpdateResponse {
  updateStatus: boolean;
  message?: string;
}

const AllVideosPage = () => {
  const { userid, name } = useParams();
  const [friendvideos, setFriendVideos] = useState<VideoProps[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [editloading, setVideoEdittingLoading] = useState<boolean>(false);
  const [refetch, setRefetch] = useState<boolean>(false);
  const [videoactions, setVideoActions] = useState<boolean>(false);
  const [editVideo, setEditVideo] = useState<boolean>(false);
  const { user } = useCurrentUser();
  const [currentVideo, setCurrentVideo] = useState<string | null>(null);
  const [currentV, setCurrentV] = useState<string | null>(null);
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const router = useRouter();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const [shareUrl, setShareUrl] = useState<string>("");
  console.log(shareUrl);
  // In your useState initialization:
  const [likedVideos, setLikedVideos] = useState<Set<string>>(new Set());

  // In your useEffect where you initialize from localStorage:
  useEffect(() => {
    if (!userid) return;

    setLoading(true);
    fetch(`/api/videos/getvideos/${userid}`)
      .then((response) => response.json())
      .then((data) => {
        setFriendVideos(data.videos || []);
        setLoading(false);

        // Initialize liked videos from localStorage
        const storedLikes = localStorage.getItem("likedVideos");
        if (storedLikes) {
          try {
            const parsedLikes = JSON.parse(storedLikes);
            // Ensure it's an array before converting to Set
            setLikedVideos(
              new Set(Array.isArray(parsedLikes) ? parsedLikes : [])
            );
          } catch (e) {
            console.log(e);
            setLikedVideos(new Set());
          }
        } else if (user?.user?.likedVideos) {
          // Ensure user.likedVideos is an array before converting to Set
          const userLikes = Array.isArray(user.user.likedVideos)
            ? user.user.likedVideos
            : [];
          setLikedVideos(new Set(userLikes));
          localStorage.setItem("likedVideos", JSON.stringify(userLikes));
        }
      })
      .catch((error) => {
        console.error("Error fetching videos:", error);
        setLoading(false);
      });
  }, [refetch, userid]);

  const deleteVideo = async (id: string) => {
    try {
      const res = await fetch(`/api/videos/deletevideo/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      const data: UpdateResponse = await res.json();
      toast.success(data?.message);
      setRefetch((prev) => !prev);
      setFriendVideos(friendvideos.filter((v) => v._id !== id));
    } catch (error) {
      console.error("Error deleting video:", error);
      toast.error("Failed to delete video");
    }
  };

  const handleEdit = async (
    event: FormEvent<HTMLFormElement>,
    video: VideoProps
  ) => {
    event.preventDefault();
    try {
      setVideoEdittingLoading(true);
      const res = await fetch(`/api/videos/editvideo/${video._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });
      const data: UpdateResponse = await res.json();
      toast.success(data?.message);
      setFriendVideos(
        friendvideos.map((v) =>
          v._id === video._id ? { ...v, title, description } : v
        )
      );
      setEditVideo(false);
      setCurrentV(null);
      setRefetch((prev) => !prev);
    } catch (error) {
      console.error("Error editing video:", error);
      toast.error("Failed to update video");
    } finally {
      setVideoEdittingLoading(false);
    }
  };

  const [isLikeLoading, setIsLikeLoading] = useState<string | null>(null);
  const toggleLike = async (videoId: string) => {
    setIsLikeLoading(videoId);
    const newLikedVideos = new Set(likedVideos);
    const wasLiked = newLikedVideos.has(videoId);

    try {
      // 1. Optimistically update the UI

      // Toggle like status optimistically
      if (wasLiked) {
        newLikedVideos.delete(videoId);
      } else {
        newLikedVideos.add(videoId);
      }
      setLikedVideos(newLikedVideos);

      // 2. Update the local storage optimistically
      localStorage.setItem(
        "likedVideos",
        JSON.stringify(Array.from(newLikedVideos))
      );

      // 3. Update the video's like count optimistically (if needed)
      setFriendVideos((prevVideos) =>
        prevVideos.map((video) =>
          video._id === videoId
            ? {
                ...video,
                likes: wasLiked
                  ? video.likes?.filter((id) => id !== user?.user?._id) // Decrement like
                  : [...(video.likes || []), user?.user?._id], // Increment like
              }
            : video
        )
      );

      // 4. Make the API call
      const endpoint = wasLiked
        ? `/api/videos/unlike/${videoId}`
        : `/api/videos/like/${videoId}`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.user?._id }),
      });

      if (!response.ok) {
        throw new Error("Failed to update like");
      }
    } catch (error) {
      console.error("Error toggling like:", error);

      // 5. Revert optimistic update on error
      const originalLikedVideos = new Set(likedVideos);
      setLikedVideos(originalLikedVideos);

      localStorage.setItem(
        "likedVideos",
        JSON.stringify(Array.from(originalLikedVideos))
      );

      setFriendVideos((prevVideos) =>
        prevVideos.map((video) =>
          video._id === videoId
            ? {
                ...video,
                likes: wasLiked
                  ? [...(video.likes || []), user?.user?._id] // Revert unlike
                  : video.likes?.filter((id) => id !== user?.user?._id), // Revert like
              }
            : video
        )
      );

      toast.error("Failed to update like. Please try again.");
    } finally {
      setIsLikeLoading(null);
    }
  };

  const handleShare = (videoId: string) => {
    const url = `${window.location.origin}/video/${videoId}`;
    setShareUrl(url);
    if (navigator.share) {
      navigator
        .share({
          title: "Check out this performance!",
          text: "I found this amazing performance you might like",
          url: url,
        })
        .catch((err) => {
          console.error("Error sharing:", err);
          copyToClipboard(url);
        });
    } else {
      copyToClipboard(url);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.success("Link copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy:", err);
        toast.error("Failed to copy link");
      });
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center gap-4"
        >
          <CircularProgress
            size={60}
            thickness={4}
            className="text-amber-500"
          />
          <p className="text-gray-400 font-medium">Loading videos...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen w-full bg-gradient-to-br from-gray-900 to-black flex flex-col"
    >
      <VideoUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={() => {
          setRefetch((prev) => !prev);
        }}
      />

      <header className="sticky top-0 z-10 bg-gradient-to-r from-gray-900/95 to-black/95 backdrop-blur-md border-b border-gray-800/50 shadow-lg">
        <div className="px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center justify-between gap-4">
            {/* Back Button */}
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 group transition-all"
            >
              <div className="p-2 rounded-full bg-gray-800/70 group-hover:bg-amber-500/20 transition-colors">
                <ArrowBigLeftIcon
                  size={20}
                  className="text-gray-400 group-hover:text-amber-400 transition-colors"
                />
              </div>
              <span className="hidden sm:inline text-gray-400 group-hover:text-amber-400 font-medium transition-colors">
                Back
              </span>
            </button>

            {/* Main Title with User Info */}
            <div className="flex flex-col items-center">
              <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-purple-400 to-pink-500 animate-gradient">
                {user?.user?._id === userid
                  ? "My Video Gallery"
                  : `${name?.slice(1)}'s Performances`}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs bg-gray-800/70 text-amber-400 px-2 py-1 rounded-full">
                  {friendvideos.length}{" "}
                  {friendvideos.length === 1 ? "video" : "videos"}
                </span>
                {user?.user?._id !== userid && (
                  <span className="text-xs bg-purple-900/40 text-purple-300 px-2 py-1 rounded-full">
                    {friendvideos.filter((v) => v.isPublic).length} public
                  </span>
                )}
              </div>
            </div>

            {/* Right Side Buttons */}
            <div className="flex items-center gap-3">
              {/* Refresh Button */}
              <button
                onClick={() => setRefetch((prev) => !prev)}
                className="p-2 rounded-full bg-gray-800/70 hover:bg-amber-500/20 text-gray-400 hover:text-amber-400 transition-all group"
                title="Refresh videos"
              >
                <motion.div
                  animate={{ rotate: refetch ? 360 : 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <RefreshCw
                    size={18}
                    className={loading ? "animate-spin" : ""}
                  />
                </motion.div>
              </button>

              {/* Upload Button (only shows for current user) */}
              {user?.user?._id === userid && (
                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500/90 to-amber-600/90 hover:from-amber-500 hover:to-amber-600 rounded-full shadow-lg hover:shadow-amber-500/30 transition-all group"
                >
                  <Upload size={18} className="text-white" />
                  <span className="text-sm font-medium text-white">
                    Upload New
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content with Scrollable Videos */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-6 md:px-8 max-w-6xl mx-auto">
          {friendvideos.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="flex flex-col items-center justify-center py-16 px-4 text-center"
            >
              <div className="max-w-md w-full bg-gradient-to-br from-gray-800/50 to-gray-900/30 p-8 rounded-3xl border border-gray-700/50 backdrop-blur-sm shadow-2xl relative overflow-hidden">
                <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-amber-500/10 filter blur-3xl"></div>
                <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-purple-500/10 filter blur-3xl"></div>

                <div className="relative z-10">
                  <div className="mx-auto w-20 h-20 bg-gradient-to-r from-amber-400/20 to-purple-500/20 rounded-full flex items-center justify-center mb-6">
                    <Upload size={36} className="text-gray-400" />
                  </div>

                  <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-purple-300 mb-2">
                    {user?.user?._id === userid
                      ? "Your Stage Awaits"
                      : "No Performances Yet"}
                  </h3>

                  <p className="text-gray-400 mb-6">
                    {user?.user?._id === userid
                      ? "Upload your first performance to showcase your talent to the world. Record your gigs, rehearsals, or special moments."
                      : `This artist hasn't shared any performances yet. Check back later!`}
                  </p>

                  {user?.user?._id === userid ? (
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <button
                        onClick={() => setIsUploadModalOpen(true)}
                        className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-medium rounded-full shadow-lg hover:shadow-amber-500/30 transition-all flex items-center justify-center gap-2"
                      >
                        <Upload className="h-5 w-5" />
                        Upload First Video
                      </button>
                      <button
                        onClick={() => router.push("/tips")}
                        className="px-6 py-3 bg-gray-700/50 hover:bg-gray-700 border border-gray-600 text-gray-300 font-medium rounded-full shadow transition-all"
                      >
                        Recording Tips
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => router.push("/artists")}
                      className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-medium rounded-full shadow-lg hover:shadow-purple-500/30 transition-all"
                    >
                      Discover Other Artists
                    </button>
                  )}
                </div>
              </div>

              {user?.user?._id === userid && (
                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="fixed bottom-6 right-6 z-20 w-14 h-14 bg-gradient-to-r from-amber-500 to-purple-600 text-white rounded-full shadow-xl hover:shadow-amber-500/40 transition-all flex items-center justify-center sm:hidden"
                >
                  <Upload className="h-6 w-6" />
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-6"
              style={{
                maxHeight: "calc(100vh - 150px)", // Adjust based on your header height
                overflowY: "auto",
              }}
            >
              {friendvideos.map((video) => (
                <motion.div
                  key={video._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.3 }}
                  className="bg-gradient-to-br from-gray-800/50 to-gray-900/30 rounded-xl border border-gray-700/50 hover:border-amber-400/30 overflow-hidden backdrop-blur-sm"
                >
                  {/* Video Header */}
                  <div className="p-4 flex justify-between items-start border-b border-gray-700/50">
                    <div>
                      <h3 className="text-lg font-semibold text-white line-clamp-1">
                        {video.title}
                      </h3>
                      <p className="text-xs text-gray-400 mt-1">
                        {moment(video.createdAt).format("MMM D, YYYY")}
                      </p>
                    </div>

                    {user?.user?._id === userid && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentVideo(video._id);
                          setVideoActions(!videoactions);
                        }}
                        className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700/50"
                      >
                        <BsThreeDotsVertical size={18} />
                      </button>
                    )}
                  </div>

                  {/* Video Content */}
                  <div className="relative aspect-video bg-black">
                    <video
                      controls
                      className="w-full h-full object-cover"
                      src={video.source}
                      poster={video.thumbnail}
                    />
                  </div>

                  {/* Video Footer */}
                  <div className="p-4">
                    <p className="text-sm text-gray-300 line-clamp-2 mb-3">
                      {video.description}
                    </p>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>
                          @
                          {typeof video.postedBy === "object"
                            ? video.postedBy?.username
                            : video.postedBy || "user"}
                        </span>
                        <span>•</span>
                        <span>{moment(video.createdAt).fromNow()}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleLike(video._id)}
                          disabled={isLikeLoading === video._id}
                          className="flex items-center gap-1 text-xs"
                        >
                          {isLikeLoading === video._id ? (
                            <CircularProgress size={16} />
                          ) : (
                            <Heart
                              size={16}
                              className={
                                likedVideos.has(video._id)
                                  ? "text-red-500 fill-red-500"
                                  : "text-gray-400"
                              }
                            />
                          )}
                          <span className="text-gray-400">
                            {video.likes?.length || 0}
                          </span>
                        </button>
                        <button
                          onClick={() => handleShare(video._id)}
                          className="text-gray-400 hover:text-purple-400"
                        >
                          <Share2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Video Actions Dropdown */}
                  {currentVideo === video._id && videoactions && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-gray-700/50 p-2">
                        <button
                          onClick={() => {
                            setEditVideo(true);
                            setCurrentV(video._id);
                            setTitle(video.title);
                            setDescription(video.description || "");
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700/50 rounded flex items-center gap-2"
                        >
                          ✏️ Edit Details
                        </button>
                        <button
                          onClick={() => deleteVideo(video._id)}
                          className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-gray-700/50 rounded flex items-center gap-2"
                        >
                          🗑️ Delete Video
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* Edit Video Modal */}
                  {currentV === video._id && editVideo && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
                      onClick={() => {
                        setEditVideo(false);
                        setCurrentV(null);
                      }}
                    >
                      <motion.div
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700/50 w-full max-w-md p-6"
                      >
                        <h3 className="text-xl font-bold text-white mb-4">
                          Edit Video
                        </h3>
                        <form
                          onSubmit={(e) => handleEdit(e, video)}
                          className="space-y-4"
                        >
                          <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">
                              Title
                            </label>
                            <input
                              type="text"
                              value={title}
                              onChange={(e) => setTitle(e.target.value)}
                              className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">
                              Description
                            </label>
                            <textarea
                              value={description}
                              onChange={(e) => setDescription(e.target.value)}
                              rows={3}
                              className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                            />
                          </div>
                          <div className="flex justify-end gap-3 pt-2">
                            <button
                              type="button"
                              onClick={() => {
                                setEditVideo(false);
                                setCurrentV(null);
                              }}
                              className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={editloading}
                              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg hover:from-amber-600 hover:to-amber-700 transition-colors disabled:opacity-70 flex items-center gap-2"
                            >
                              {editloading ? (
                                <>
                                  <CircularProgress size={16} color="inherit" />
                                  Saving...
                                </>
                              ) : (
                                "Save Changes"
                              )}
                            </button>
                          </div>
                        </form>
                      </motion.div>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default AllVideosPage;
