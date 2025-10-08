"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useThemeColors } from "@/hooks/useTheme";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  const { colors } = useThemeColors();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          "rounded-2xl p-6 w-full max-w-md",
          colors.card,
          colors.border
        )}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className={cn("text-lg font-semibold", colors.text)}>{title}</h3>
          <button
            onClick={onClose}
            className={cn(
              "text-gray-500 hover:text-gray-700",
              colors.textMuted
            )}
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </motion.div>
    </div>
  );
};
