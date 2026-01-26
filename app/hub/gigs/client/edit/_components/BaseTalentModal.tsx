// app/components/talent/BaseTalentModal.tsx
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Save, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useThemeColors } from "@/hooks/useTheme";

interface BaseTalentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  submitText?: string;
  disableSubmit?: boolean;
  isLoading?: boolean;
  description?: string;
  maxWidth?:
    | "sm"
    | "md"
    | "lg"
    | "xl"
    | "2xl"
    | "3xl"
    | "4xl"
    | "5xl"
    | "6xl"
    | "7xl";
}

export function BaseTalentModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  icon,
  children,
  submitText = "Save Details",
  disableSubmit = false,
  isLoading = false,
  description,
  maxWidth = "2xl",
}: BaseTalentModalProps) {
  const { colors, isDarkMode } = useThemeColors();

  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
    "5xl": "max-w-5xl",
    "6xl": "max-w-6xl",
    "7xl": "max-w-7xl",
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={cn(
          maxWidthClasses[maxWidth],
          "max-h-[90vh] overflow-hidden p-0",
          isDarkMode
            ? "bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700/50"
            : "bg-gradient-to-br from-white to-gray-50 border-gray-200",
          "shadow-2xl",
        )}
      >
        {/* Header with gradient */}
        <div
          className={cn(
            "px-6 py-5 border-b",
            isDarkMode
              ? "border-gray-700/50 bg-gradient-to-r from-gray-900/80 to-gray-800/80"
              : "border-gray-200 bg-gradient-to-r from-gray-50 to-white",
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "p-2.5 rounded-xl",
                  isDarkMode
                    ? "bg-gradient-to-br from-orange-900/40 to-red-900/20"
                    : "bg-gradient-to-br from-orange-50 to-red-50",
                )}
              >
                <div className="text-orange-500">{icon}</div>
              </div>
              <div>
                <DialogTitle
                  className={cn(
                    "text-xl font-bold tracking-tight",
                    isDarkMode ? "text-white" : "text-gray-900",
                  )}
                >
                  {title}
                </DialogTitle>
                {description && (
                  <DialogDescription
                    className={cn(
                      "text-sm mt-1",
                      isDarkMode ? "text-gray-400" : "text-gray-600",
                    )}
                  >
                    {description}
                  </DialogDescription>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className={cn(
                "h-9 w-9 rounded-lg transition-all hover:scale-110",
                isDarkMode
                  ? "text-gray-400 hover:text-white hover:bg-gray-800"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-100",
              )}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Scrollable content area */}
        <div className="flex flex-col h-[calc(90vh-9rem)]">
          <div
            className={cn(
              "flex-1 overflow-y-auto px-6 py-5",
              isDarkMode ? "bg-gray-900/30" : "bg-transparent",
            )}
          >
            <div className="space-y-6">{children}</div>
          </div>

          {/* Footer with gradient border */}
          <div
            className={cn(
              "px-6 py-4 border-t mt-2",
              isDarkMode
                ? "border-gray-700/50 bg-gradient-to-t from-gray-900/80 to-transparent"
                : "border-gray-200 bg-gradient-to-t from-gray-50/80 to-transparent",
            )}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                {disableSubmit && (
                  <span
                    className={cn(
                      "text-sm",
                      isDarkMode ? "text-amber-400" : "text-amber-600",
                    )}
                  >
                    <Sparkles className="w-4 h-4 inline mr-1" />
                    Please select at least one item to save
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className={cn(
                    "px-5 rounded-lg transition-all hover:scale-105",
                    isDarkMode
                      ? "border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
                      : "border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                  )}
                >
                  Cancel
                </Button>
                <Button
                  onClick={onSubmit}
                  disabled={disableSubmit || isLoading}
                  className={cn(
                    "px-6 rounded-lg gap-2 transition-all duration-300 hover:scale-105 hover:shadow-lg",
                    "bg-gradient-to-r from-orange-500 to-red-500 text-white",
                    "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none",
                    !disableSubmit && !isLoading
                      ? "shadow-md shadow-orange-500/20"
                      : "",
                  )}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      {submitText}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
