// components/dashboard/skeletons/BookerDashboardSkeleton.tsx
import { cn } from "@/lib/utils";
import { useThemeColors } from "@/hooks/useTheme";

interface BookerDashboardSkeletonProps {
  isPro: boolean;
  showUpgradeModal?: boolean;
  colors: { background: string; backgroundMuted: string; border: string };
}

export function BookerDashboardSkeleton({
  isPro,
  showUpgradeModal = false,
  colors,
}: BookerDashboardSkeletonProps) {
  return (
    <div
      className={cn(
        "space-y-6 p-6 rounded-3xl border-2 backdrop-blur-xl",
        "bg-gradient-to-br from-card/80 via-card/60 to-card/40",
        colors.border,
        "shadow-2xl shadow-black/5 dark:shadow-black/30",
        "relative overflow-hidden"
      )}
    >
      {/* Header Skeleton */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="space-y-2">
          <div
            className={cn(
              "h-8 w-64 rounded-lg bg-gray-300 animate-pulse",
              colors.backgroundMuted
            )}
          ></div>
          <div
            className={cn(
              "h-4 w-48 rounded bg-gray-300 animate-pulse",
              colors.backgroundMuted
            )}
          ></div>
        </div>
        <div
          className={cn(
            "h-10 w-32 rounded-lg bg-gray-300 animate-pulse",
            colors.backgroundMuted
          )}
        ></div>
      </div>

      {/* Content Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className={cn(
              "p-6 rounded-xl border animate-pulse",
              colors.background,
              colors.border
            )}
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={cn(
                  "h-6 w-32 rounded bg-gray-300",
                  colors.backgroundMuted
                )}
              ></div>
              <div
                className={cn(
                  "h-8 w-8 rounded bg-gray-300",
                  colors.backgroundMuted
                )}
              ></div>
            </div>
            <div
              className={cn(
                "h-8 w-16 rounded bg-gray-300 mb-2",
                colors.backgroundMuted
              )}
            ></div>
            <div
              className={cn(
                "h-4 w-20 rounded bg-gray-300",
                colors.backgroundMuted
              )}
            ></div>
          </div>
        ))}
      </div>

      {/* Footer Skeleton */}
      {isPro && (
        <div
          className={cn(
            "flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl",
            "bg-gradient-to-r from-muted/30 to-muted/10",
            "border border-border/50 animate-pulse"
          )}
        >
          <div
            className={cn(
              "h-4 w-32 rounded bg-gray-300",
              colors.backgroundMuted
            )}
          ></div>
          <div
            className={cn(
              "h-4 w-40 rounded bg-gray-300",
              colors.backgroundMuted
            )}
          ></div>
        </div>
      )}
    </div>
  );
}
