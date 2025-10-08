"use client";

import { Button } from "@/components/ui/button";
import { useThemeColors } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

interface ModalActionsProps {
  onCancel: () => void;
  onConfirm: () => void;
  confirmText?: string;
}

export const ModalActions = ({
  onCancel,
  onConfirm,
  confirmText = "Save",
}: ModalActionsProps) => {
  const { colors } = useThemeColors();

  return (
    <div className="flex gap-3 mt-6">
      <Button variant="outline" onClick={onCancel} className="flex-1">
        Cancel
      </Button>
      <Button
        onClick={onConfirm}
        className={cn("flex-1 bg-amber-500 hover:bg-amber-600 text-white")}
      >
        {confirmText}
      </Button>
    </div>
  );
};
