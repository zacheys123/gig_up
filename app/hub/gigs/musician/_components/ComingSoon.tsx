// components/gigs/ComingSoonGigs.tsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Id } from "@/convex/_generated/dataModel";
import { Calendar, MapPin, Clock, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PlatformGig } from "./PlatformActivitySidebar";

interface ComingSoonGigsProps {
  allGigs: PlatformGig[];
  currentGigId: Id<"gigs">;
  isDarkMode: boolean;
  onViewGig: (gig: PlatformGig) => void;
}

const ComingSoonGigs = ({
  allGigs,
  currentGigId,
  isDarkMode,
  onViewGig,
}: ComingSoonGigsProps) => {
  const [upcomingGigs, setUpcomingGigs] = useState<PlatformGig[]>([]);

  useEffect(() => {
    if (!allGigs) return;

    const now = Date.now();
    const upcoming = allGigs
      .filter(
        (gig) =>
          gig._id !== currentGigId &&
          gig.acceptInterestStartTime &&
          gig.acceptInterestStartTime > now &&
          !gig.isTaken &&
          gig.isActive !== false,
      )
      .sort(() => 0.5 - Math.random()) // Randomize
      .slice(0, 3); // Show only 3 upcoming gigs

    setUpcomingGigs(upcoming);
  }, [allGigs, currentGigId]);

  if (upcomingGigs.length === 0) return null;

  return (
    <div
      className={cn(
        "rounded-2xl border overflow-hidden",
        isDarkMode
          ? "bg-slate-900/80 border-slate-700/50 backdrop-blur-md"
          : "bg-white/90 border-slate-200/50 backdrop-blur-md shadow-lg",
      )}
    >
      {/* Header */}
      <div
        className={cn(
          "px-4 py-2 border-b flex items-center justify-between",
          isDarkMode ? "border-slate-700/50" : "border-slate-200/50",
        )}
      >
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-500" />
          <h3
            className={cn(
              "text-sm font-semibold",
              isDarkMode ? "text-white" : "text-slate-900",
            )}
          >
            Coming Soon
          </h3>
        </div>
        <Badge
          variant="outline"
          className="text-xs bg-blue-500/10 text-blue-500 border-blue-500/30"
        >
          {upcomingGigs.length} opening
        </Badge>
      </div>

      {/* Gig List - Compact */}
      <div className="p-2 space-y-2 max-h-[200px] overflow-y-auto">
        {upcomingGigs.map((gig) => {
          const daysUntil = Math.ceil(
            (gig.acceptInterestStartTime! - Date.now()) / (1000 * 60 * 60 * 24),
          );

          return (
            <motion.div
              key={gig._id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "p-2 rounded-xl border cursor-pointer transition-all",
                isDarkMode
                  ? "bg-slate-800/30 border-slate-700/50 hover:border-blue-500/50"
                  : "bg-white/30 border-slate-200/50 hover:border-blue-500/50",
              )}
              onClick={() => onViewGig(gig)}
            >
              <div className="flex items-center gap-2">
                {/* Days counter - smaller */}
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex flex-col items-center justify-center text-white">
                  <span className="text-xs font-bold leading-tight">
                    {daysUntil}
                  </span>
                  <span className="text-[8px] uppercase tracking-wider">
                    days
                  </span>
                </div>

                {/* Gig info - compact */}
                <div className="flex-1 min-w-0">
                  <h4
                    className={cn(
                      "font-medium text-xs truncate",
                      isDarkMode ? "text-white" : "text-slate-900",
                    )}
                  >
                    {gig.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5 text-[8px] text-slate-500">
                    <MapPin className="w-2.5 h-2.5" />
                    <span className="truncate max-w-[60px]">
                      {gig.location?.split(",")[0] || "Remote"}
                    </span>
                    {gig.interestedUsers && gig.interestedUsers.length > 0 && (
                      <>
                        <span>•</span>
                        <Heart className="w-2.5 h-2.5 text-rose-400" />
                        <span>{gig.interestedUsers.length}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Date - very compact */}
                <div className="flex-shrink-0 text-[8px] text-slate-500">
                  {new Date(gig.acceptInterestStartTime!).toLocaleDateString(
                    undefined,
                    {
                      month: "short",
                      day: "numeric",
                    },
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default ComingSoonGigs;
