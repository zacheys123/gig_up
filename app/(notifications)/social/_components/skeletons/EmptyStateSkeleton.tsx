// components/skeletons/followers/EmptyFollowersState.tsx
import { cn } from "@/lib/utils";

interface EmptyFollowersStateProps {
  searchQuery: string;
  colors: any;
  onShareProfile: () => void;
}

export default function EmptyFollowersState({
  searchQuery,
  colors,
  onShareProfile,
}: EmptyFollowersStateProps) {
  return (
    <div
      className={cn(
        "rounded-xl md:rounded-2xl p-8 md:p-12 text-center border-2 border-dashed",
        colors.card,
        colors.border
      )}
    >
      <div
        className={cn(
          "w-16 h-16 md:w-24 md:h-24 rounded-full mx-auto mb-4 md:mb-6 flex items-center justify-center",
          colors.secondaryBackground
        )}
      >
        <div
          className={cn(
            "w-8 h-8 md:w-10 md:h-10 rounded-full",
            colors.secondaryBackground
          )}
        ></div>
      </div>
      <div
        className={cn(
          "h-6 md:h-8 w-48 mx-auto mb-3 md:mb-4 rounded-lg",
          colors.secondaryBackground
        )}
      ></div>
      <div
        className={cn(
          "h-4 md:h-5 w-64 mx-auto mb-6 md:mb-8 rounded",
          colors.secondaryBackground
        )}
      ></div>
      {!searchQuery && (
        <div
          className={cn(
            "w-32 h-10 mx-auto rounded-xl",
            colors.secondaryBackground
          )}
        ></div>
      )}
    </div>
  );
}
