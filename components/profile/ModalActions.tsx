"use client";

import { Button } from "@/components/ui/button";
import { useThemeColors } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { Save, X, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

interface ModalActionsProps {
  onCancel: () => void;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  disabled?: boolean;
  variant?: "default" | "destructive" | "success";
  className?: string;
  fullWidth?: boolean;
}

export const ModalActions = ({
  onCancel,
  onConfirm,
  confirmText = "Save Changes",
  cancelText = "Cancel",
  loading = false,
  disabled = false,
  variant = "default",
  className,
  fullWidth = true,
}: ModalActionsProps) => {
  const { colors } = useThemeColors();

  const getVariantStyles = () => {
    switch (variant) {
      case "destructive":
        return {
          confirm:
            "bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white",
          cancel:
            "border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20",
        };
      case "success":
        return {
          confirm:
            "bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white",
          cancel:
            "border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-900/20",
        };
      default:
        return {
          confirm:
            "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white",
          cancel: cn("border", colors.border, colors.hoverBg, colors.text),
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "flex gap-3 mt-8 pt-6 border-t",
        colors.border,
        fullWidth && "w-full",
        className
      )}
    >
      <Button
        variant="outline"
        onClick={onCancel}
        disabled={loading || disabled}
        className={cn(
          "flex-1 py-3 rounded-xl font-medium transition-all duration-300",
          "hover:scale-105 hover:shadow-md",
          styles.cancel,
          loading && "opacity-50 cursor-not-allowed"
        )}
      >
        <span className="flex items-center justify-center gap-2">
          <X className="w-4 h-4" />
          {cancelText}
        </span>
      </Button>

      <Button
        onClick={onConfirm}
        disabled={loading || disabled}
        className={cn(
          "flex-1 py-3 rounded-xl font-medium transition-all duration-300",
          "hover:scale-105 hover:shadow-lg",
          styles.confirm,
          loading && "opacity-50 cursor-not-allowed"
        )}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Saving...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            {variant === "success" ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {confirmText}
          </span>
        )}
      </Button>
    </motion.div>
  );
};
