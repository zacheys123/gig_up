"use client";
import { useThemeColors } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import React from "react";

type LoaderType = "spinner" | "dots" | "pulse" | "bars";
type LoaderSize = "sm" | "md" | "lg" | "xl";

interface GigLoaderProps {
  type?: LoaderType;
  color?: string;
  title?: string;
  size?: LoaderSize;
  fullScreen?: boolean;
  className?: string;
}

const GigLoader = ({
  type = "spinner",
  color,
  title,
  size = "md",
  fullScreen = true,
  className,
}: GigLoaderProps) => {
  const { colors, isDarkMode } = useThemeColors();

  // Size mappings
  const sizeClasses = {
    sm: { spinner: "h-6 w-6", dots: "h-1.5 w-1.5", bars: "h-3 w-1" },
    md: { spinner: "h-12 w-12", dots: "h-2 w-2", bars: "h-4 w-1.5" },
    lg: { spinner: "h-16 w-16", dots: "h-3 w-3", bars: "h-6 w-2" },
    xl: { spinner: "h-20 w-20", dots: "h-4 w-4", bars: "h-8 w-2.5" },
  };

  // Default color based on theme
  const loaderColor = color || (isDarkMode ? "bg-orange-400" : "bg-orange-600");
  const borderColor =
    color || (isDarkMode ? "border-orange-400" : "border-orange-600");

  const renderLoader = () => {
    switch (type) {
      case "spinner":
        return (
          <div
            className={cn(
              "animate-spin rounded-full border-b-2 border-l-2",
              sizeClasses[size].spinner,
              borderColor,
              className
            )}
          ></div>
        );

      case "dots":
        return (
          <div className="flex space-x-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={cn(
                  "animate-bounce rounded-full",
                  sizeClasses[size].dots,
                  loaderColor,
                  className
                )}
                style={{ animationDelay: `${i * 0.1}s` }}
              ></div>
            ))}
          </div>
        );

      case "pulse":
        return (
          <div
            className={cn(
              "animate-pulse rounded-full",
              sizeClasses[size].spinner,
              loaderColor,
              className
            )}
          ></div>
        );

      case "bars":
        return (
          <div className="flex space-x-1 items-end">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={cn(
                  "animate-pulse",
                  sizeClasses[size].bars,
                  loaderColor,
                  className
                )}
                style={{
                  animationDelay: `${i * 0.1}s`,
                  height: `${(i + 1) * 20}%`,
                }}
              ></div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  const loaderContent = (
    <div className="flex flex-col items-center justify-center gap-4">
      {renderLoader()}

      {title && (
        <p
          className={cn(
            "text-lg font-medium",
            colors.textMuted,
            type === "pulse" && "animate-pulse"
          )}
        >
          {title}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div
        className={cn(
          "flex justify-center items-center min-h-screen w-full",
          colors.background
        )}
      >
        {loaderContent}
      </div>
    );
  }

  return loaderContent;
};

export default GigLoader;
