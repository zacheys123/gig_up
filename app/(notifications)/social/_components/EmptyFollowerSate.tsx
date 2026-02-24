// components/followers/EmptyFollowersState.tsx
import { motion } from "framer-motion";
import { Users, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    <motion.div
      key="empty-state"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "rounded-xl md:rounded-2xl p-8 md:p-12 text-center border-2 border-dashed",
        colors.card,
        colors.border,
      )}
    >
      <div
        className={cn(
          "w-16 h-16 md:w-24 md:h-24 rounded-full mx-auto mb-4 md:mb-6 flex items-center justify-center",
          colors.secondaryBackground,
        )}
      >
        <Users className={cn("w-8 h-8 md:w-10 md:h-10", colors.textMuted)} />
      </div>
      <h3
        className={cn("text-xl md:text-xl font-bold mb-3 md:mb-4", colors.text)}
      >
        {searchQuery ? "No matching followers" : "Your community awaits"}
      </h3>
      <p
        className={cn(
          "text-sm md:text-lg mb-6 md:mb-8 max-w-md mx-auto",
          colors.textMuted,
        )}
      >
        {searchQuery
          ? "Try adjusting your search terms to find more followers."
          : "Share your profile and engage with others to grow your network!"}
      </p>
      {!searchQuery && (
        <Button
          onClick={onShareProfile}
          className={cn(
            "rounded-xl gap-2",
            colors.primaryBg,
            colors.primaryBgHover,
          )}
        >
          <Share2 className="w-4 h-4" />
          Share Your Profile
        </Button>
      )}
    </motion.div>
  );
}
