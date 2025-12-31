// hooks/useChatMessages.ts
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCallback, useMemo } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { useChatToasts } from "./useToasts";
import { useCheckTrial } from "./useCheckTrial";

export function useChatMessages(chatId: Id<"chats">) {
  const { showMessageSent, showMessageError, showNetworkError } =
    useChatToasts();
  const { isInGracePeriod } = useCheckTrial();

  // Use const for mutation function reference
  const sendMessageMutation = useMutation(api.controllers.chat.sendMessage);

  // Memoize the mutation args creator
  const createMessageArgs = useCallback(
    (content: string, senderId: Id<"users">) => ({
      chatId,
      content: content.trim(),
      senderId,
      isViewerInGracePeriod: isInGracePeriod,
    }),
    [chatId, isInGracePeriod]
  );

  // Wrap the mutation in a stable callback
  const sendMessage = useCallback(
    async (content: string, senderId: Id<"users">): Promise<void> => {
      // Early validation
      const trimmedContent = content.trim();
      if (!trimmedContent) {
        showMessageError("Message cannot be empty");
        return;
      }

      try {
        const args = createMessageArgs(trimmedContent, senderId);
        await sendMessageMutation(args);
        showMessageSent();
      } catch (error: unknown) {
        console.error("Failed to send message:", error);

        // Type-safe error handling
        const errorMessage =
          error instanceof Error ? error.message : "Failed to send message";

        if (errorMessage.includes("network") || !navigator.onLine) {
          showNetworkError();
        } else {
          showMessageError(errorMessage);
        }

        // Re-throw with proper typing
        throw new Error(errorMessage);
      }
    },
    [
      sendMessageMutation,
      createMessageArgs,
      showMessageSent,
      showMessageError,
      showNetworkError,
    ]
  );

  // Optional: Add message fetching if needed
  const messages = useQuery(
    api.controllers.chat.getMessages,
    useMemo(() => ({ chatId }), [chatId])
  );

  // Optional: Add pagination support
  const isLoading = messages === undefined;

  // Memoize the return object
  const result = useMemo(
    () => ({
      sendMessage,
      messages: messages || [],
      isLoading,
      isInGracePeriod, // Expose this for UI decisions
    }),
    [sendMessage, messages, isLoading, isInGracePeriod]
  );

  return result;
}

// Optional: Create a specialized hook for optimistic updates
export function useOptimisticChatMessages(chatId: Id<"chats">) {
  const baseHook = useChatMessages(chatId);

  // This would be enhanced with optimistic updates
  // using Convex's optimistic updates feature

  return baseHook;
}
