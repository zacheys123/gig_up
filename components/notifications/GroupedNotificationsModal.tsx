// components/notifications/GroupedNotificationsModal.tsx - UPDATED
"use client";

import { useThemeColors } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiX,
  FiMessageSquare,
  FiUsers,
  FiEye,
  FiCalendar,
  FiArrowLeft,
  FiChevronRight,
} from "react-icons/fi";
import { GroupedNotification } from "@/utils";
import { Notification } from "@/convex/notificationsTypes";

interface GroupedNotificationsModalProps {
  group: GroupedNotification;
  isOpen: boolean;
  onClose: () => void;
  onNotificationClick: (notification: Notification) => void;
}

const getGroupConfig = (type: string) => {
  const configs = {
    message_group: {
      icon: FiMessageSquare,
      title: "Messages",
      color:
        "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400",
      border: "border-indigo-200 dark:border-indigo-800",
    },
    follow_group: {
      icon: FiUsers,
      title: "Follow Activities",
      color:
        "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400",
      border: "border-green-200 dark:border-green-800",
    },
    profile_view_group: {
      icon: FiEye,
      title: "Profile Views",
      color: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
      border: "border-blue-200 dark:border-blue-800",
    },
    gig_group: {
      icon: FiCalendar,
      title: "Gig Activities",
      color:
        "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400",
      border: "border-purple-200 dark:border-purple-800",
    },
  };

  return configs[type as keyof typeof configs] || configs.message_group;
};

export function GroupedNotificationsModal({
  group,
  isOpen,
  onClose,
  onNotificationClick,
}: GroupedNotificationsModalProps) {
  const { colors } = useThemeColors();
  const router = useRouter();
  const config = getGroupConfig(group.type);

  const handleNotificationClick = (notification: Notification) => {
    // For message notifications, use the chatId from metadata to navigate
    if (notification.type === "new_message" && notification.metadata?.chatId) {
      router.push(`/chat/${notification.metadata.chatId}`);
    } else if (notification.actionUrl) {
      // For other notifications, use the actionUrl
      router.push(notification.actionUrl);
    }
    onClose();
  };

  const getTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  // Group messages by chat for better organization in the modal
  const groupMessagesByChat = () => {
    if (group.type !== "message_group") return null;

    const chats = new Map();

    group.notifications.forEach((notification) => {
      const chatId = notification.metadata?.chatId;
      if (chatId) {
        if (!chats.has(chatId)) {
          chats.set(chatId, {
            chatId,
            chatName: notification.metadata?.chatName || `Chat ${chatId}`,
            notifications: [],
            latestTimestamp: notification.createdAt,
          });
        }
        const chat = chats.get(chatId);
        chat.notifications.push(notification);
        chat.latestTimestamp = Math.max(
          chat.latestTimestamp,
          notification.createdAt
        );
      }
    });

    return Array.from(chats.values()).sort(
      (a, b) => b.latestTimestamp - a.latestTimestamp
    );
  };

  const chats = groupMessagesByChat();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black bg-opacity-50"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className={cn(
            "relative w-full max-w-md max-h-[80vh] rounded-xl shadow-xl",
            colors.background,
            colors.border,
            "border"
          )}
        >
          {/* Header */}
          <div
            className={cn(
              "flex items-center gap-3 p-4 border-b",
              colors.border
            )}
          >
            <button
              onClick={onClose}
              className={cn(
                "p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800",
                colors.textMuted
              )}
            >
              <FiX size={20} />
            </button>

            <div className={cn("p-2 rounded-lg", config.color)}>
              <config.icon size={20} />
            </div>

            <div className="flex-1">
              <h2 className={cn("font-semibold", colors.text)}>
                {config.title}
              </h2>
              <p className={cn("text-sm", colors.textMuted)}>
                {group.count}{" "}
                {group.count === 1 ? "notification" : "notifications"}
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 overflow-y-auto max-h-[60vh]">
            {group.type === "message_group" && chats ? (
              // Show messages organized by chat
              <div className="space-y-4">
                {chats.map((chat) => (
                  <div key={chat.chatId} className="space-y-2">
                    <h3 className={cn("font-medium text-sm", colors.text)}>
                      {chat.chatName}
                    </h3>
                    <div className="space-y-2">
                      {chat.notifications.map(
                        (notification: Notification, index: number) => (
                          <motion.div
                            key={notification._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() =>
                              handleNotificationClick(notification)
                            }
                            className={cn(
                              "p-3 rounded-lg border cursor-pointer transition-all",
                              "hover:shadow-md active:scale-[0.98]",
                              notification.isRead
                                ? cn(
                                    "bg-gray-50 dark:bg-gray-900/50",
                                    colors.border
                                  )
                                : cn(
                                    config.color,
                                    config.border,
                                    "ring-1 ring-opacity-50"
                                  )
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex-1 min-w-0">
                                <h4
                                  className={cn(
                                    "font-medium text-sm mb-1",
                                    notification.isRead
                                      ? colors.text
                                      : colors.text
                                  )}
                                >
                                  {notification.title}
                                </h4>
                                <p className={cn("text-sm", colors.textMuted)}>
                                  {notification.message}
                                </p>
                                <p
                                  className={cn(
                                    "text-xs mt-1",
                                    colors.textMuted
                                  )}
                                >
                                  {getTimeAgo(notification.createdAt)}
                                </p>
                              </div>

                              <FiChevronRight
                                className={cn(
                                  "flex-shrink-0",
                                  colors.textMuted
                                )}
                              />
                            </div>
                          </motion.div>
                        )
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Show other notifications normally
              <div className="space-y-3">
                {group.notifications.map((notification, index) => (
                  <motion.div
                    key={notification._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleNotificationClick(notification)}
                    className={cn(
                      "p-3 rounded-lg border cursor-pointer transition-all",
                      "hover:shadow-md active:scale-[0.98]",
                      notification.isRead
                        ? cn("bg-gray-50 dark:bg-gray-900/50", colors.border)
                        : cn(
                            config.color,
                            config.border,
                            "ring-1 ring-opacity-50"
                          )
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <h3
                          className={cn(
                            "font-medium text-sm mb-1",
                            notification.isRead ? colors.text : colors.text
                          )}
                        >
                          {notification.title}
                        </h3>
                        <p className={cn("text-sm", colors.textMuted)}>
                          {notification.message}
                        </p>
                        <p className={cn("text-xs mt-1", colors.textMuted)}>
                          {getTimeAgo(notification.createdAt)}
                        </p>
                      </div>

                      <FiChevronRight
                        className={cn("flex-shrink-0", colors.textMuted)}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className={cn("p-4 border-t", colors.border)}>
            <button
              onClick={onClose}
              className={cn(
                "w-full py-2 px-4 rounded-lg font-medium transition-colors",
                "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700",
                colors.text
              )}
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
