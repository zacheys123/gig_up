// app/components/talent/BaseTalentModal.tsx
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
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
}: BaseTalentModalProps) {
  const { colors } = useThemeColors();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle
              className={cn("text-xl flex items-center gap-2", colors.text)}
            >
              {icon}
              {title}
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex flex-col h-[calc(90vh-8rem)]">
          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto pr-2">{children}</div>

          {/* Footer */}
          <div className="pt-4 border-t mt-4">
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={onSubmit}
                disabled={disableSubmit || isLoading}
                className="bg-gradient-to-r from-orange-500 to-red-500"
              >
                {isLoading ? "Saving..." : submitText}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
