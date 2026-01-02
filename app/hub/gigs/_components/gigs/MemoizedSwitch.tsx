import { cn } from "@/lib/utils";
import React from "react";

// Memoized Switch Component
export const MemoizedSwitch = React.memo(
  ({
    checked,
    onChange,
    label,
    description,
    icon: Icon,
    colors,
  }: {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label: string;
    description?: string;
    icon?: any;
    colors?: {
      text: string;
      textMuted: string;
    };
  }) => {
    return (
      <div className="flex items-center justify-between p-4 rounded-xl border transition-all hover:shadow-md">
        <div className="flex items-center gap-3">
          {Icon && (
            <div
              className={cn(
                "p-2 rounded-lg",
                checked
                  ? "bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-600"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-500"
              )}
            >
              <Icon className="w-4 h-4" />
            </div>
          )}
          <div>
            <span className={cn("block font-medium", colors?.text)}>
              {label}
            </span>
            {description && (
              <span className={cn("block text-sm mt-1", colors?.textMuted)}>
                {description}
              </span>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => onChange(!checked)}
          className={cn(
            "relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300",
            checked
              ? "bg-gradient-to-r from-green-500 to-emerald-500"
              : "bg-gray-300 dark:bg-gray-700"
          )}
        >
          <span
            className={cn(
              "inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-300",
              checked ? "translate-x-6" : "translate-x-1"
            )}
          />
        </button>
      </div>
    );
  }
);
MemoizedSwitch.displayName = "MemoizedSwitch";
