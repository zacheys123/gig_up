"use client";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useThemeColors } from "@/hooks/useTheme";

interface ToggleSwitchProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
}

export const ToggleSwitch = ({
  label,
  checked,
  onChange,
  description,
}: ToggleSwitchProps) => {
  const { colors } = useThemeColors();

  return (
    <div className="flex items-center justify-between p-3 rounded-lg border transition-colors hover:bg-opacity-50">
      <div className="flex gap-3 flex-col">
        <Label className={cn("text-sm font-medium flex-1", colors.text)}>
          {label}
        </Label>
        <span className="text-xs text-neutral-400">{description}</span>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2",
          checked
            ? "bg-amber-500"
            : cn("bg-gray-300 dark:bg-gray-600", colors.backgroundMuted)
        )}
      >
        <span
          className={cn(
            "inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-lg",
            checked ? "translate-x-6" : "translate-x-1"
          )}
        />
      </button>
    </div>
  );
};
