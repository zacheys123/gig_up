// components/followers/FollowersHeader.tsx
import { motion } from "framer-motion";
import { Users, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FollowersHeaderProps {
  stats: { total: number };
  colors: any;
  highlightedFollower: string | null;
  onViewFollowing: () => void;
  onDiscover: () => void;
}

export default function FollowersHeader({
  stats,
  colors,
  highlightedFollower,
  onViewFollowing,
  onDiscover,
}: FollowersHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 md:mb-8"
    >
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 md:gap-6">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="md:hidden">
            <div
              className={cn(
                "p-3 rounded-xl",
                colors.gradientPrimary,
                "shadow-lg"
              )}
            >
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="hidden md:block">
            <div
              className={cn(
                "p-4 rounded-2xl",
                colors.gradientPrimary,
                "shadow-lg"
              )}
            >
              <Users className="w-8 h-8 text-white" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h1
              className={cn(
                "text-2xl md:text-3xl font-bold mb-1 md:mb-2",
                colors.text
              )}
            >
              Your Followers
            </h1>
            <p className={cn("text-base md:text-lg", colors.textMuted)}>
              {stats.total} people following your journey
              {highlightedFollower && (
                <span className="text-orange-400 ml-1 md:ml-2">• New!</span>
              )}
            </p>
          </div>
        </div>

        <div className="flex gap-2 md:gap-3">
          <div className="md:hidden flex gap-2">
            <Button
              onClick={onViewFollowing}
              variant="outline"
              size="sm"
              className={cn("rounded-xl border-2 h-10 px-3", colors.border)}
            >
              <Users className="w-4 h-4" />
            </Button>
            <Button
              onClick={onDiscover}
              size="sm"
              className={cn(
                "rounded-xl gap-1 h-10 px-3",
                colors.primaryBg,
                colors.primaryBgHover
              )}
            >
              <UserPlus className="w-4 h-4" />
            </Button>
          </div>
          <div className="hidden md:flex gap-3">
            <Button
              onClick={onViewFollowing}
              variant="outline"
              className={cn("rounded-xl border-2", colors.border)}
            >
              View Following
            </Button>
            <Button
              onClick={onDiscover}
              className={cn(
                "rounded-xl gap-2",
                colors.primaryBg,
                colors.primaryBgHover
              )}
            >
              <UserPlus className="w-4 h-4" />
              Find More
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
