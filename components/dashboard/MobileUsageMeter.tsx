import { cn } from "@/lib/utils";

type UsageMeterProps = {
  current: number;
  max: number;
  label: string;
  className?: string;
  showPercentage?: boolean;
};

export function MobileUsageMeter({
  current,
  max,
  label,
  className,
  showPercentage = true,
}: UsageMeterProps) {
  const percentage = Math.min(Math.round((current / max) * 100), 100);
  const isNearLimit = percentage > 75;
  const isOverLimit = current > max;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex justify-between text-sm">
        <span className="text-gray-400">{label}</span>
        {showPercentage && (
          <span
            className={cn(
              "font-medium",
              isOverLimit
                ? "text-red-500"
                : isNearLimit
                ? "text-orange-500"
                : "text-gray-400"
            )}
          >
            {current}/{max === Infinity ? "∞" : max}
            {showPercentage && ` (${percentage}%)`}
          </span>
        )}
      </div>

      <div className="h-2 w-full rounded-full bg-gray-800 overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full",
            isOverLimit
              ? "bg-red-500"
              : isNearLimit
              ? "bg-orange-500"
              : "bg-blue-500"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {isNearLimit && !isOverLimit && (
        <p className="text-xs text-orange-500">
          {max === Infinity
            ? ""
            : `You've used ${percentage}% of your ${label.toLowerCase()}`}
        </p>
      )}

      {isOverLimit && (
        <p className="text-xs text-red-500">
          Limit exceeded! Upgrade for more {label.toLowerCase()}.
        </p>
      )}
    </div>
  );
}
