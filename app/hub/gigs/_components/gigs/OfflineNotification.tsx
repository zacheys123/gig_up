// components/OfflineNotification.tsx
import { motion, AnimatePresence } from "framer-motion";
import { WifiOff, X } from "lucide-react";

export const OfflineNotification = ({ onClose }: { onClose: () => void }) => {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -50, opacity: 0 }}
        transition={{ type: "spring", damping: 25 }}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999]"
      >
        <div className="bg-red-500/90 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-3 backdrop-blur-sm">
          <WifiOff className="w-4 h-4" />
          <span className="text-sm font-medium">
            {`           You're offline - changes saved locally`}
          </span>
          <button
            onClick={onClose}
            className="ml-2 p-1 rounded-full hover:bg-red-600/80 transition-colors"
            aria-label="Close notification"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
