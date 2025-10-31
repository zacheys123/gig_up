// components/VideoComments.tsx
import React, { useState, useCallback } from "react";

import { Id } from "@/convex/_generated/dataModel";
import { CommentWithUser } from "@/hooks/useVideoComments.ts";

interface VideoCommentsProps {
  videoId: Id<"videos">;
  currentUserId?: Id<"users">;
  onAddComment: (
    content: string,
    parentCommentId?: Id<"comments">
  ) => Promise<boolean>;
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

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newComment.trim() || isSubmitting) return;

      setIsSubmitting(true);
      const success = await onAddComment(
        newComment.trim(),
        replyingTo || undefined
      );

      if (success) {
        setNewComment("");
        setReplyingTo(null);
      }

      setIsSubmitting(false);
    },
    [newComment, replyingTo, onAddComment, isSubmitting]
  );

  const handleReply = useCallback((commentId: Id<"comments">) => {
    setReplyingTo(commentId);
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

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;

    if (diff < 60000) return "just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;

    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className="space-y-4">
      {/* Comment Input */}
      <form onSubmit={handleSubmit} className="space-y-3">
        {replyingTo && (
          <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-lg">
            <span className="text-sm text-blue-700 dark:text-blue-300">
              Replying to comment
            </span>
            <button
              type="button"
              onClick={handleCancelReply}
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 text-sm"
            >
              Cancel
            </button>
          </div>
        )}

        <div className="flex gap-3">
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={
                replyingTo ? "Write your reply..." : "Add a comment..."
              }
              rows={2}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
            />
          </div>
          <button
            type="submit"
            disabled={!newComment.trim() || isSubmitting}
            className="self-end px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? "Posting..." : "Post"}
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 text-sm py-4">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment._id}
              comment={comment}
              currentUserId={currentUserId}
              onReply={handleReply}
              onDelete={handleDelete}
              formatTime={formatTime}
            />
          ))
        )}
      </div>
    </div>
  );
};

const CommentItem: React.FC<{
  comment: CommentWithUser;
  currentUserId?: Id<"users">;
  onReply: (commentId: Id<"comments">) => void;
  onDelete: (commentId: Id<"comments">) => void;
  formatTime: (timestamp: number) => string;
}> = ({ comment, currentUserId, onReply, onDelete, formatTime }) => {
  const canDelete =
    currentUserId && comment.user?.clerkId === currentUserId.toString();

  return (
    <div className="flex gap-3">
      {/* User Avatar */}
      <img
        src={comment.user?.picture || "/default-avatar.png"}
        alt={comment.user?.username}
        className="w-8 h-8 rounded-full flex-shrink-0"
      />

      <div className="flex-1 min-w-0">
        {/* Comment Header */}
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-sm text-gray-900 dark:text-white">
            {comment.user?.firstname || comment.user?.username}
          </span>
          {comment.user?.isMusician && (
            <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-1.5 py-0.5 rounded">
              Musician
            </span>
          )}
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {formatTime(comment.createdAt)}
          </span>
        </div>

        {/* Comment Content */}
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
          {comment.content}
        </p>

        {/* Comment Actions */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => onReply(comment._id)}
            className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            Reply
          </button>

          {canDelete && (
            <button
              onClick={() => onDelete(comment._id)}
              className="text-xs text-red-500 hover:text-red-700 transition-colors"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
