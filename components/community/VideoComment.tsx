// components/VideoComments.tsx
import React, { useState, useCallback, useRef, useEffect } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { CommentWithUser } from "@/hooks/useVideoComments.ts";
import { useThemeColors } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import {
  Smile,
  Image,
  Video,
  Send,
  Reply,
  Trash2,
  MessageCircle,
} from "lucide-react";
import { motion } from "framer-motion";

interface VideoCommentsProps {
  videoId: Id<"videos">;
  currentUserId?: string;
  onAddComment: (
    content: string,
    parentCommentId?: Id<"comments">
  ) => Promise<{
    success: boolean;
    error?: string;
    commentId?: Id<"comments">;
  }>; // Updated return type
  onDeleteComment: (
    commentId: Id<"comments">
  ) => Promise<{ success: boolean; error?: string }>;
  comments: CommentWithUser[];
}

export const VideoComments: React.FC<VideoCommentsProps> = ({
  videoId,
  currentUserId,
  onAddComment,
  onDeleteComment,
  comments,
}) => {
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<Id<"comments"> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFormattingOptions, setShowFormattingOptions] = useState(false);
  const { colors, isDarkMode } = useThemeColors();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newComment.trim() || isSubmitting) return;

      setIsSubmitting(true);
      const result = await onAddComment(
        // Changed from 'success' to 'result'
        newComment.trim(),
        replyingTo || undefined
      );

      if (result.success) {
        // Check result.success instead of success
        setNewComment("");
        setReplyingTo(null);
        setShowFormattingOptions(false);
      } else {
        // Optional: Show error message to user
        console.error("Failed to add comment:", result.error);
      }

      setIsSubmitting(false);
    },
    [newComment, replyingTo, onAddComment, isSubmitting]
  );

  const handleReply = useCallback((commentId: Id<"comments">) => {
    setReplyingTo(commentId);
    // Focus the textarea when replying
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
  }, []);

  const handleCancelReply = useCallback(() => {
    setReplyingTo(null);
  }, []);

  const handleDelete = useCallback(
    async (commentId: Id<"comments">) => {
      if (window.confirm("Are you sure you want to delete this comment?")) {
        await onDeleteComment(commentId);
      }
    },
    [onDeleteComment]
  );

  // Auto-resize textarea
  const handleTextareaChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setNewComment(e.target.value);

      // Auto-resize
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
      }
    },
    []
  );

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleSubmit(e as any);
      }
      if (e.key === "Escape" && replyingTo) {
        handleCancelReply();
      }
    },
    [handleSubmit, replyingTo, handleCancelReply]
  );

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;

    if (diff < 60000) return "just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;

    return new Date(timestamp).toLocaleDateString();
  };

  const commentsEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when comments change
  useEffect(() => {
    if (commentsEndRef.current) {
      commentsEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [comments]);

  return (
    <div className="space-y-6">
      {/* Enhanced Comment Input for Desktop */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {replyingTo && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "flex items-center justify-between p-3 rounded-xl",
              "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
            )}
          >
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Replying to comment
            </span>
            <button
              type="button"
              onClick={handleCancelReply}
              className={cn(
                "text-sm font-medium transition-colors",
                "text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
              )}
            >
              Cancel
            </button>
          </motion.div>
        )}

        <div
          className={cn(
            "p-4 rounded-xl border-2 transition-all duration-200",
            "focus-within:border-blue-500 focus-within:shadow-lg",
            colors.border,
            colors.background
          )}
        >
          <textarea
            ref={textareaRef}
            value={newComment}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowFormattingOptions(true)}
            onBlur={() => {
              if (!newComment.trim()) setShowFormattingOptions(false);
            }}
            placeholder={
              replyingTo
                ? "Write your reply..."
                : "Add a comment... (Ctrl+Enter to send)"
            }
            rows={3}
            className={cn(
              "w-full text-sm resize-none transition-all duration-200",
              "focus:outline-none focus:ring-0",
              "placeholder-gray-500 dark:placeholder-gray-400",
              colors.text,
              colors.background
            )}
          />

          {/* Enhanced Action Bar for Desktop */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t">
            <div className="flex items-center gap-3">
              {/* Formatting Options - Show on focus or when typing */}
              {(showFormattingOptions || newComment.trim()) && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className={cn(
                      "p-2 rounded-lg transition-all duration-200",
                      "hover:bg-gray-100 dark:hover:bg-gray-800",
                      "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    )}
                    title="Add emoji"
                  >
                    <Smile className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    className={cn(
                      "p-2 rounded-lg transition-all duration-200",
                      "hover:bg-gray-100 dark:hover:bg-gray-800",
                      "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    )}
                    title="Add image"
                  >
                    <Image className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    className={cn(
                      "p-2 rounded-lg transition-all duration-200",
                      "hover:bg-gray-100 dark:hover:bg-gray-800",
                      "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    )}
                    title="Add video"
                  >
                    <Video className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={!newComment.trim() || isSubmitting}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm",
                "transition-all duration-200 transform hover:scale-105",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none",
                newComment.trim()
                  ? "bg-blue-500 text-white hover:bg-blue-600 shadow-lg"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
              )}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Post
                </>
              )}
            </button>
          </div>

          {/* Keyboard shortcut hint */}
          {newComment.trim() && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
              Press Ctrl+Enter to send
            </div>
          )}
        </div>
      </form>

      {/* Enhanced Comments List for Desktop */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600">
              <MessageCircle className="w-full h-full" />
            </div>
            <p className={cn("text-lg font-medium mb-2", colors.text)}>
              No comments yet
            </p>
            <p className={cn("text-sm", colors.textMuted)}>
              Be the first to comment on this performance
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <CommentItem
                key={comment._id}
                comment={comment}
                currentUserId={currentUserId}
                onReply={handleReply}
                onDelete={handleDelete}
                formatTime={formatTime}
              />
            ))}
          </div>
        )}
      </div>

      <div ref={commentsEndRef} />
    </div>
  );
};

const CommentItem: React.FC<{
  comment: CommentWithUser;
  currentUserId?: string;
  onReply: (commentId: Id<"comments">) => void;
  onDelete: (commentId: Id<"comments">) => void;
  formatTime: (timestamp: number) => string;
}> = ({ comment, currentUserId, onReply, onDelete, formatTime }) => {
  const { colors, isDarkMode } = useThemeColors();
  const canDelete =
    currentUserId && comment.user?.clerkId === currentUserId.toString();

  return (
    <div
      className={cn(
        "flex gap-4 p-4 rounded-xl transition-all duration-200",
        "hover:shadow-lg border",
        colors.card,
        colors.border,
        "hover:scale-[1.02]"
      )}
    >
      {/* Enhanced User Avatar */}
      <div className="flex-shrink-0">
        <img
          src={comment.user?.picture || "/default-avatar.png"}
          alt={comment.user?.username}
          className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-lg"
        />
      </div>

      <div className="flex-1 min-w-0">
        {/* Enhanced Comment Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center gap-2">
            <span className={cn("font-semibold text-sm", colors.text)}>
              {comment.user?.firstname || comment.user?.username}
            </span>
            {comment.user?.isMusician && (
              <span
                className={cn(
                  "text-xs font-medium px-2 py-1 rounded-full",
                  "bg-green-100 dark:bg-green-900/30",
                  "text-green-700 dark:text-green-300"
                )}
              >
                Musician
              </span>
            )}
          </div>
          <span className={cn("text-xs", colors.textMuted)}>
            {formatTime(comment.createdAt)}
          </span>
        </div>

        {/* Enhanced Comment Content */}
        <p className={cn("text-sm leading-relaxed mb-3", colors.text)}>
          {comment.content}
        </p>

        {/* Enhanced Comment Actions */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => onReply(comment._id)}
            className={cn(
              "flex items-center gap-1 text-xs font-medium transition-all duration-200",
              "hover:scale-105",
              "text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
            )}
          >
            <Reply className="w-3 h-3" />
            Reply
          </button>

          {canDelete && (
            <button
              onClick={() => onDelete(comment._id)}
              className={cn(
                "flex items-center gap-1 text-xs font-medium transition-all duration-200",
                "hover:scale-105",
                "text-red-500 hover:text-red-700"
              )}
            >
              <Trash2 className="w-3 h-3" />
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
