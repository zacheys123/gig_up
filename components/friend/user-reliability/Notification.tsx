import { motion } from "framer-motion";
import { FaAward } from "react-icons/fa";

interface NotificationToastProps {
  title: string;
  message: string;
  onClose: () => void;
}

export const NotificationToast = ({
  title,
  message,
  onClose,
}: NotificationToastProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed top-4 right-4 bg-white p-4 rounded-lg shadow-xl border-l-4 border-green-500 z-50 max-w-sm"
    >
      <div className="flex items-start">
        <div className="flex-shrink-0 text-green-500 text-xl">
          <FaAward />
        </div>
        <div className="ml-3">
          <h3 className="font-bold text-gray-900">{title}</h3>
          <p className="text-gray-700">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="ml-auto text-gray-400 hover:text-gray-500"
        >
          ✕
        </button>
      </div>
    </motion.div>
  );
};
