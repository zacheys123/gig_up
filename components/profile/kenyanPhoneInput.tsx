import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";
import { useState, useEffect } from "react";
import { validateKenyanPhone } from "./ValidationSummary";
import { useThemeColors } from "@/hooks/useTheme";
import { Input } from "../ui/input";

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
}

export const KenyanPhoneInput = ({
  value,
  onChange,
  label = "Phone Number",
  required = false,
}: PhoneInputProps) => {
  const [isValid, setIsValid] = useState(true);
  const [touched, setTouched] = useState(false);
  const { colors } = useThemeColors();

  useEffect(() => {
    if (value && touched) {
      const validation = validateKenyanPhone(value);
      setIsValid(validation.isValid);
    }
  }, [value, touched]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    if (!touched) setTouched(true);
  };

  const handleBlur = () => {
    setTouched(true);
    if (value) {
      const validation = validateKenyanPhone(value);
      setIsValid(validation.isValid);
      if (validation.isValid && validation.formatted) {
        onChange(validation.formatted);
      }
    }
  };

  return (
    <div className="space-y-2">
      <label className={cn("text-sm font-medium", colors.text)}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <Input
          type="tel"
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="e.g., 0712 345 678 or +254712345678"
          className={cn(
            colors.background,
            colors.border,
            colors.text,
            "focus:ring-2 focus:ring-amber-500 focus:border-transparent",
            !isValid && touched && "border-red-500 focus:ring-red-500"
          )}
        />
        {!isValid && touched && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <X size={16} className="text-red-500" />
          </div>
        )}
        {isValid && value && touched && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Check size={16} className="text-green-500" />
          </div>
        )}
      </div>

      {!isValid && touched && (
        <p className="text-red-600 dark:text-red-400 text-xs">
          Please enter a valid Kenyan phone number
        </p>
      )}

      {!value && (
        <p className={cn("text-xs", colors.textMuted)}>
          Format: 0712 345 678 or +254712345678
        </p>
      )}
    </div>
  );
};
