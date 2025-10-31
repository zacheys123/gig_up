// hooks/useVideoComments.ts
import { useQuery, useMutation } from "convex/react";
import { useState, useCallback } from "react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export interface CommentWithUser {
  _id: Id<"comments">;
  userId: string;
  videoId: Id<"videos">;
  content: string;
  parentCommentId?: Id<"comments">;
  likes: number;
  createdAt: number;
  updatedAt?: number;
  user?: {
    _id: Id<"users">;
    clerkId: string;
    username: string;
    firstname?: string;
    lastname?: string;
    picture?: string;
    tier?: string;
    isMusician?: boolean;
    isClient?: boolean;
    instrument?: string;
    city?: string;
  };
}

export const useVideoComments = (
  videoId?: Id<"videos">,
  currentUserId?: Id<"users">
) => {
  const [replyingTo, setReplyingTo] = useState<Id<"comments"> | null>(null);
  const [editingComment, setEditingComment] = useState<Id<"comments"> | null>(
    null
  );

  // Queries
  const comments = useQuery(
    api.controllers.comments.getVideoComments,
    videoId ? { videoId } : "skip"
  ) as CommentWithUser[] | undefined;

  // Mutations
  const addCommentMutation = useMutation(api.controllers.comments.addComment);
  const deleteCommentMutation = useMutation(
    api.controllers.comments.deleteComment
  );

  // Group comments by parent (for threaded replies)
  const commentThreads = useCallback(() => {
    if (!comments) return [];

    const parentComments = comments.filter(
      (comment) => !comment.parentCommentId
    );
    const replies = comments.filter((comment) => comment.parentCommentId);

    return parentComments.map((parent) => ({
      ...parent,
      replies: replies.filter((reply) => reply.parentCommentId === parent._id),
    }));
  }, [comments]);

  // Actions
  const addComment = useCallback(
    async (content: string, parentCommentId?: Id<"comments">) => {
      if (!videoId || !currentUserId) {
        return {
          success: false,
          error: "Not authenticated or no video selected",
        };
      }

      try {
        const result = await addCommentMutation({
          userId: currentUserId.toString(),
          videoId,
          content: content.trim(),
          parentCommentId,
          isViewerInGracePeriod: false,
        });

        if (parentCommentId) {
          setReplyingTo(null);
        }

        return { success: true, commentId: result.commentId };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    },
    [videoId, currentUserId, addCommentMutation]
  );

  const deleteComment = useCallback(
    async (commentId: Id<"comments">) => {
      if (!currentUserId) {
        return { success: false, error: "Not authenticated" };
      }

      try {
        await deleteCommentMutation({
          commentId,
          userId: currentUserId.toString(),
        });

        if (editingComment === commentId) {
          setEditingComment(null);
        }

        return { success: true };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    },
    [currentUserId, deleteCommentMutation, editingComment]
  );

  const startReply = useCallback((commentId: Id<"comments">) => {
    setReplyingTo(commentId);
    setEditingComment(null);
  }, []);

  const cancelReply = useCallback(() => {
    setReplyingTo(null);
  }, []);

  const startEdit = useCallback((commentId: Id<"comments">) => {
    setEditingComment(commentId);
    setReplyingTo(null);
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingComment(null);
  }, []);

  return {
    // Data
    comments: comments || [],
    commentThreads: commentThreads(),

    // State
    replyingTo,
    editingComment,

    // Actions
    addComment,
    deleteComment,
    startReply,
    cancelReply,
    startEdit,
    cancelEdit,

    // Helpers
    hasComments: (comments?.length || 0) > 0,
    totalComments: comments?.length || 0,
  };
};
