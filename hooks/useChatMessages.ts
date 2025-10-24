// hooks/useChatMessages.ts
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

import { Id } from "@/convex/_generated/dataModel";
import { useChatToasts } from "./useToasts";

export function useChatMessages(chatId: Id<"chats">) {
  const sendMessageMutation = useMutation(api.controllers.chat.sendMessage);
  const { showMessageSent, showMessageError, showNetworkError } =
    useChatToasts();

  const sendMessage = async (content: string, senderId: Id<"users">) => {
    try {
      await sendMessageMutation({
        chatId,
        content: content.trim(),
        senderId,
      });
      showMessageSent();
    } catch (error: any) {
      console.error("Failed to send message:", error);

      if (error.message?.includes("network") || !navigator.onLine) {
        showNetworkError();
      } else {
        showMessageError(error.message);
      }
      throw error; // Re-throw so component can handle it
    }
  };

  return { sendMessage };
}
