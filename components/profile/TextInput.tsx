"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { useThemeColors } from "@/hooks/useTheme";

interface TextInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  Icon?: ReactNode;
  className?: string;
}

export const TextInput = ({
  label,
  value,
  onChange,
  disabled,
  placeholder,
  Icon,
  className,
}: TextInputProps) => {
  const { colors } = useThemeColors();

  return (
    <div className="space-y-2">
      <Label className={cn("text-sm font-medium", colors.text)}>{label}</Label>
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            {Icon}
          </div>
        )}
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          className={cn(
            "w-full transition-all duration-200",
            Icon && "pl-10",
            colors.background,
            colors.border,
            colors.text,
            "focus:ring-2 focus:ring-amber-500 focus:border-transparent",
            className
          )}
        />
      </div>
    </div>
  );
};
