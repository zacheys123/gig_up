"use client";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useThemeColors } from "@/hooks/useTheme";

interface SelectInputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}

export const SelectInput = ({
  label,
  value,
  onChange,
  options,
  className,
}: SelectInputProps) => {
  const { colors } = useThemeColors();

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label className={cn("text-sm font-medium", colors.text)}>
          {label}
        </Label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "w-full p-2 rounded-lg border text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent",
          colors.background,
          colors.border,
          colors.text
        )}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};
