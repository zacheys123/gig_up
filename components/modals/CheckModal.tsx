"use client";
import { UserProps } from "@/types/userTypes";
import { motion } from "framer-motion";
// import Chat from "./chat/Chat";

interface ModalProps {
  onOpenX: () => void;
  onClose: () => void;
  modal: {
    type: "chat" | "video";
    user: UserProps;
  };
  user: UserProps | null | undefined; // Allow null/undefined
}

const CheckModal: React.FC<ModalProps> = ({
  onClose,
  modal,
  user,
  onOpenX,
}) => {
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle case where user is null/undefined
  if (!user) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-[12px]"
        onClick={handleBackdropClick}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-neutral-900 rounded-xl p-6 text-center"
        >
          <p className="text-white">User not available</p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
          >
            Close
          </button>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 overflow-y-auto"
      onClick={handleBackdropClick}
    >
      {/* Background overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-[12px]" />

      {/* Modal container */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{
            duration: 0.3,
            ease: "easeOut",
          }}
          className="relative bg-neutral-900 rounded-xl shadow-2xl border border-neutral-700 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-neutral-700 bg-neutral-800/50">
            <h2 className="text-lg font-semibold text-white capitalize">
              {modal.type === "chat" ? "Start Conversation" : "Video Call"}
            </h2>

            {/* Close button */}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-all duration-200 p-2 rounded-lg hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-500"
              aria-label="Close modal"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Content area */}
          <div className="flex-1 overflow-hidden">
            {/* {modal.type === "chat" && (
              <Chat
                onClose={onClose}
                modal={modal}
                myuser={user} // Now user is guaranteed to be defined here
                onOpenX={onOpenX}
              />
            )} */}

            {modal.type === "video" && (
              <div className="flex items-center justify-center h-full p-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Video Call with {modal.user.firstname}
                  </h3>
                  <p className="text-neutral-400 mb-6">
                    Video calling feature coming soon!
                  </p>
                  <button
                    onClick={onClose}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                  >
                    Got it
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default CheckModal;
