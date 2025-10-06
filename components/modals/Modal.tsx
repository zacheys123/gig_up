"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef } from "react";

const Modal = ({
  isOpen,
  onClose,
  title,
  description,
  width,
  children,
  dep,
}: {
  isOpen: boolean;
  onClose?: () => void;
  title: string;
  width?: string;
  description?: string;
  children: React.ReactNode;
  dep?: string;
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Close modal on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && onClose) onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden"; // Prevent scrolling
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [isOpen, onClose]);

  // Close modal when clicking outside
  const handleOutsideClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose?.();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={`   w-full
           fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm ${
             dep === "videos" ? "oveflow-y-auto h-full" : ""
           }`}
          onClick={handleOutsideClick}
        >
          {/* Overlay with subtle gradient */}
          <div className="fixed inset-0 bg-gradient-to-br from-black/80 to-purple-900/20" />

          <motion.div
            ref={modalRef}
            initial={{ y: 20, scale: 0.98 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 500 }}
            className={`relative ${
              width ? "w-[width]" : " w-full"
            } max-w-md rounded-xl bg-neutral-900 border border-neutral-700/50 shadow-2xl overflow-hidden`}
          >
            {/* Header with close button */}
            <div className="flex items-center justify-between p-5 border-b border-neutral-800">
              <div className="flex flex-col gap-2 ">
                <h3 className="text-xl font-semibold text-white">{title}</h3>
                <h3 className="gigtitle  text-neutral-400 text-center">
                  {description}
                </h3>
              </div>
              {onClose && (
                <button
                  onClick={onClose}
                  className="p-1 rounded-full hover:bg-neutral-800 transition-colors text-neutral-400 hover:text-white"
                  aria-label="Close modal"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 13 27"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>

            {/* Content */}
            <div className="p-5 text-neutral-300">{children}</div>

            {/* Subtle glow effect */}
            <div className="absolute inset-0 pointer-events-none border border-transparent group-hover:border-purple-500/30 transition-all duration-500 rounded-xl" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
export default Modal;
