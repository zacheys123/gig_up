// components/ButtonComponent.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type ButtonVariant =
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "link";

interface ButtonComponentProps {
  children?: React.ReactNode;
  variant?: ButtonVariant;
  size?: "default" | "sm" | "lg" | "icon";
  onclick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  loading?: boolean;
  type?: "button" | "submit" | "reset";
  className?: string;
  classname?: string; // Alias for className for backward compatibility
  title?: string;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
  rounded?: boolean;
  gradient?: boolean;
  success?: boolean;
  danger?: boolean;
  warning?: boolean;
  info?: boolean;
}

const ButtonComponent: React.FC<ButtonComponentProps> = ({
  children,
  variant = "default",
  size = "default",
  onclick,
  disabled = false,
  loading = false,
  type = "button",
  className,
  classname,
  title,
  icon,
  iconPosition = "left",
  fullWidth = false,
  rounded = false,
  gradient = false,
  success = false,
  danger = false,
  warning = false,
  info = false,
}) => {
  // Merge className and classname (for backward compatibility)
  const mergedClassName = classname || className;

  // Determine actual variant based on props
  let actualVariant = variant;
  if (success) actualVariant = "default";
  if (danger) actualVariant = "destructive";
  if (warning) actualVariant = "outline";
  if (info) actualVariant = "secondary";

  // Custom styling based on props
  const customStyles = cn(
    // Full width
    fullWidth && "w-full",

    // Rounded corners
    rounded && "rounded-full",

    // Gradient styling
    gradient &&
      "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300",

    // Success styling
    success &&
      "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-none",

    // Warning styling
    warning &&
      "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white border-none",

    // Info styling
    info &&
      "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white border-none",

    // Disabled styling
    disabled && "opacity-50 cursor-not-allowed",

    // Loading styling
    loading && "relative",

    // Additional custom classes
    mergedClassName
  );

  return (
    <Button
      type={type}
      variant={actualVariant}
      size={size}
      onClick={onclick}
      disabled={disabled || loading}
      className={customStyles}
      title={title}
      aria-label={title}
    >
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}

      {!loading && icon && iconPosition === "left" && (
        <span className="mr-2">{icon}</span>
      )}

      {children || title}

      {!loading && icon && iconPosition === "right" && (
        <span className="ml-2">{icon}</span>
      )}
    </Button>
  );
};

export default ButtonComponent;
