"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { useThemeColors } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { Sun, Moon, Monitor, CheckCircle } from "lucide-react";

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
  const { colors } = useThemeColors();

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
          className={`w-full fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm ${
            dep === "videos" ? "overflow-y-auto h-full" : ""
          }`}
          onClick={handleOutsideClick}
        >
          {/* Overlay with theme-aware background */}
          <div
            className={cn("fixed inset-0", colors.overlay || "bg-black/50")}
          />

          <motion.div
            ref={modalRef}
            initial={{ y: 20, scale: 0.98 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 500 }}
            className={cn(
              "relative w-full max-w-md rounded-xl shadow-2xl overflow-hidden",
              colors.card,
              colors.border,
              "border"
            )}
          >
            {/* Header with close button */}
            <div
              className={cn(
                "flex items-center justify-between p-6 border-b",
                colors.border
              )}
            >
              <div className="flex flex-col gap-1">
                <h3 className={cn("text-xl font-semibold", colors.text)}>
                  {title}
                </h3>
                {description && (
                  <p className={cn("text-sm", colors.textMuted)}>
                    {description}
                  </p>
                )}
              </div>
              {onClose && (
                <button
                  onClick={onClose}
                  className={cn(
                    "p-2 rounded-full transition-colors",
                    colors.hoverBg,
                    "text-gray-500 hover:text-gray-700"
                  )}
                  aria-label="Close modal"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
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
            <div className="p-6">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
