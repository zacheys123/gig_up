// components/ui/SearchInput.tsx
"use client";
import { Search, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useThemeColors } from "@/hooks/useTheme";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { debounce } from "lodash";

interface SearchInputProps {
  // Core props
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;

  // Styling
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "filled" | "outline";

  // Features
  showClearButton?: boolean;
  showSearchIcon?: boolean;
  autoFocus?: boolean;
  disabled?: boolean;
  isLoading?: boolean;

  // Debounce
  debounceMs?: number;

  // Accessibility
  ariaLabel?: string;
}

export function SearchInput({
  value,
  onValueChange,
  placeholder = "Search...",
  className,
  size = "md",
  variant = "default",
  showClearButton = true,
  showSearchIcon = true,
  autoFocus = false,
  disabled = false,
  isLoading = false,
  debounceMs = 200,
  ariaLabel = "Search input",
}: SearchInputProps) {
  const { isDarkMode } = useThemeColors();
  const [localValue, setLocalValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Memoized debounced callback
  const debouncedOnChange = useMemo(
    () =>
      debounce((value: string) => {
        onValueChange(value);
      }, debounceMs),
    [onValueChange, debounceMs]
  );

  // Handle immediate input changes
  const handleInputChange = useCallback(
    (newValue: string) => {
      setLocalValue(newValue);
      debouncedOnChange(newValue);
    },
    [debouncedOnChange]
  );

  // Clear search
  const handleClear = useCallback(() => {
    setLocalValue("");
    onValueChange("");
    inputRef.current?.focus();
  }, [onValueChange]);

  // Sync with external value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Auto-focus
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Cleanup debounce
  useEffect(() => {
    return () => {
      debouncedOnChange.cancel();
    };
  }, [debouncedOnChange]);

  // Size classes
  const sizeClasses = {
    sm: "h-9 text-sm px-3",
    md: "h-11 text-base px-4",
    lg: "h-14 text-lg px-5",
  };

  // Variant classes
  const variantClasses = {
    default: cn(
      "border-2 bg-transparent",
      isDarkMode
        ? "border-gray-700 hover:border-gray-600 focus-within:border-amber-500"
        : "border-gray-200 hover:border-gray-300 focus-within:border-amber-500"
    ),
    filled: cn(
      "border-0",
      isDarkMode
        ? "bg-gray-800/60 hover:bg-gray-800/80 focus-within:bg-gray-800/80 focus-within:ring-2 focus-within:ring-amber-500/20"
        : "bg-gray-50/80 hover:bg-gray-100 focus-within:bg-white focus-within:ring-2 focus-within:ring-amber-500/20"
    ),
    outline: cn(
      "border bg-transparent",
      isDarkMode
        ? "border-gray-600 hover:border-gray-500 focus-within:border-amber-500 focus-within:ring-1 focus-within:ring-amber-500/30"
        : "border-gray-300 hover:border-gray-400 focus-within:border-amber-500 focus-within:ring-1 focus-within:ring-amber-500/30"
    ),
  };

  const hasValue = localValue.length > 0;
  const showClear = showClearButton && hasValue && !disabled;

  return (
    <div
      className={cn(
        "group relative flex items-center rounded-2xl transition-all duration-300",
        sizeClasses[size],
        variantClasses[variant],
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {/* Search Icon */}
      {showSearchIcon && (
        <Search
          className={cn(
            "flex-shrink-0 transition-colors duration-200",
            size === "sm" ? "size-4" : "size-5",
            isFocused
              ? "text-amber-500"
              : isDarkMode
                ? "text-gray-400"
                : "text-gray-500",
            disabled && "text-gray-400"
          )}
        />
      )}

      {/* Input Field */}
      <input
        ref={inputRef}
        value={localValue}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          "w-full bg-transparent border-none outline-none placeholder-gray-400 dark:placeholder-gray-500",
          "transition-colors duration-200",
          isDarkMode ? "text-white" : "text-gray-900",
          showSearchIcon && "ml-3",
          showClear && "pr-8",
          disabled && "cursor-not-allowed"
        )}
        aria-label={ariaLabel}
        aria-busy={isLoading}
      />

      {/* Loading Indicator */}
      {isLoading && (
        <div className="absolute right-3 flex items-center">
          <Loader2 className="size-4 text-amber-500 animate-spin" />
        </div>
      )}

      {/* Clear Button */}
      {showClear && !isLoading && (
        <button
          onClick={handleClear}
          type="button"
          className={cn(
            "absolute right-3 p-1 rounded-lg transition-all duration-200",
            "hover:bg-gray-200 dark:hover:bg-gray-700",
            "hover:scale-110 active:scale-95",
            "focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          )}
          aria-label="Clear search"
          disabled={disabled}
        >
          <X
            className={cn(
              size === "sm" ? "size-3" : "size-4",
              "text-gray-500 dark:text-gray-400"
            )}
          />
        </button>
      )}
    </div>
  );
}

// Hook for search input functionality
export function useSearchInput(
  initialValue = "",
  options?: {
    debounceMs?: number;
    onSearch?: (value: string) => void;
  }
) {
  const [value, setValue] = useState(initialValue);
  const [isSearching, setIsSearching] = useState(false);

  const debouncedOnSearch = useMemo(
    () =>
      debounce((searchValue: string) => {
        setIsSearching(false);
        options?.onSearch?.(searchValue);
      }, options?.debounceMs || 200),
    [options]
  );

  const handleValueChange = useCallback(
    (newValue: string) => {
      setValue(newValue);
      if (newValue) {
        setIsSearching(true);
      }
      debouncedOnSearch(newValue);
    },
    [debouncedOnSearch]
  );

  const clear = useCallback(() => {
    setValue("");
    setIsSearching(false);
    debouncedOnSearch("");
  }, [debouncedOnSearch]);

  // Cleanup
  useEffect(() => {
    return () => {
      debouncedOnSearch.cancel();
    };
  }, [debouncedOnSearch]);

  return {
    value,
    setValue,
    isSearching,
    onValueChange: handleValueChange,
    clear,
  };
}
