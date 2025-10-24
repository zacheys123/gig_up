// hooks/useChatToasts.ts
import { toast } from "sonner";

export function useChatToasts() {
  // MESSAGE TOASTS (Core functionality)
  const showMessageSent = () => {
    toast.success("Message sent", {
      duration: 2000,
    });
  };

  const showMessageError = (error?: string) => {
    toast.error("Failed to send message", {
      description: error || "Please try again",
      duration: 4000,
    });
  };

  const showNetworkError = () => {
    toast.error("Connection issue", {
      description: "Check your internet connection",
      duration: 5000,
    });
  };

  // CHAT CREATION (Essential only)
  const showChatCreationPromise = async (
    promise: Promise<any>,
    userName: string
  ): Promise<any> => {
    return new Promise((resolve, reject) => {
      toast.promise(promise, {
        loading: `Starting chat with ${userName}...`,
        success: (data) => {
          resolve(data);
          return `Chat with ${userName} started!`;
        },
        error: (error) => {
          reject(error);
          return `Failed to start chat: ${error.message || "Please try again"}`;
        },
      });
    });
  };

  // MESSAGE STATUS (For real-time updates)
  const showMessageDelivered = () => {
    toast.success("Delivered", {
      duration: 1500,
      position: "bottom-right",
    });
  };

  const showMessageRead = () => {
    toast.success("Read", {
      duration: 1500,
      position: "bottom-right",
    });
  };

  // TYPING INDICATOR (For active chats)
  const showTypingStart = (userName: string) => {
    return toast.info(`${userName} is typing...`, {
      duration: Infinity, // Will dismiss manually
      position: "bottom-right",
    });
  };

  const dismissToast = (toastId: string | number) => {
    toast.dismiss(toastId);
  };

  return {
    // Core messaging
    showMessageSent,
    showMessageError,
    showNetworkError,

    // Chat management
    showChatCreationPromise,

    // Message status
    showMessageDelivered,
    showMessageRead,

    // Real-time features
    showTypingStart,
    dismissToast,
  };
}
