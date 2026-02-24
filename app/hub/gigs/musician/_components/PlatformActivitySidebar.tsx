// components/gigs/PlatformActivitySidebar.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Id } from "@/convex/_generated/dataModel";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Heart,
  Briefcase,
  Activity,
  Search,
  MapPin,
  Calendar,
  Clock,
  TrendingUp,
  Sparkles,
  DollarSign,
  Timer,
  Eye,
  Users,
} from "lucide-react";
import { BandApplication, BandRole } from "../../_components/gigs/GigCard";

export interface PlatformGig {
  _id: Id<"gigs">;
  title: string;
  bussinesscat?: string;
  location?: string;
  price?: number;
  currency?: string;
  date: number;
  isActive?: boolean;
  isTaken?: boolean;
  isPending?: boolean;
  acceptInterestStartTime?: number;
  acceptInterestEndTime?: number;
  interestedUsers?: Id<"users">[];
  appliedUsers?: Id<"users">[];
  shortlistedUsers?: any[];
  bookedBy?: Id<"users">;
  bandCategory?: BandRole[];
  bookCount?: BandApplication[];
  viewCount?: Id<"users">[];
  bookingHistory?: any;
  logo?: string;
  postedBy: Id<"users">;
  _creationTime: number;
}

interface PlatformActivitySidebarProps {
  allGigs: PlatformGig[];
  currentGigId: Id<"gigs">;
  isDarkMode: boolean;
  onViewGig: (gig: PlatformGig) => void;
}

const PlatformActivitySidebar = ({
  allGigs,
  currentGigId,
  isDarkMode,
  onViewGig,
}: PlatformActivitySidebarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("trending");
  const [upcomingGigs, setUpcomingGigs] = useState<PlatformGig[]>([]);

  // Filter upcoming gigs (interest period not started yet)
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
      .sort(
        (a, b) =>
          (a.acceptInterestStartTime || 0) - (b.acceptInterestStartTime || 0),
      )
      .slice(0, 10);

    setUpcomingGigs(upcoming);
  }, [allGigs, currentGigId]);

  // Get gigs based on tab
  const getGigsForTab = useCallback(() => {
    switch (activeTab) {
      case "trending":
        return [...allGigs]
          .filter((g) => g._id !== currentGigId)
          .map((gig) => ({
            ...gig,
            score:
              (gig.interestedUsers?.length || 0) * 2 +
              (gig.appliedUsers?.length || 0) * 3 +
              (gig.viewCount?.length || 0),
          }))
          .sort((a, b) => b.score - a.score)
          .slice(0, 8);

      case "hot":
        return [...allGigs]
          .filter((g) => g._id !== currentGigId)
          .map((gig) => ({
            ...gig,
            score:
              (gig.interestedUsers?.length || 0) * 3 +
              (gig.appliedUsers?.length || 0) * 4 +
              (gig.bookingHistory?.length || 0) * 2,
          }))
          .sort((a, b) => b.score - a.score)
          .slice(0, 8);

      case "closing":
        const now = Date.now();
        const threeDaysFromNow = now + 3 * 24 * 60 * 60 * 1000;

        return allGigs
          .filter(
            (g) =>
              g._id !== currentGigId &&
              g.acceptInterestEndTime &&
              g.acceptInterestEndTime > now &&
              g.acceptInterestEndTime < threeDaysFromNow &&
              !g.isTaken,
          )
          .sort(
            (a, b) =>
              (a.acceptInterestEndTime || 0) - (b.acceptInterestEndTime || 0),
          )
          .slice(0, 8);

      default:
        return allGigs.filter((g) => g._id !== currentGigId).slice(0, 8);
    }
  }, [activeTab, allGigs, currentGigId]);

  // Filter gigs based on search
  const filterGigs = (gigs: any[]) => {
    if (!searchQuery) return gigs;
    const query = searchQuery.toLowerCase();
    return gigs.filter(
      (gig) =>
        gig.title?.toLowerCase().includes(query) ||
        gig.bussinesscat?.toLowerCase().includes(query) ||
        gig.location?.toLowerCase().includes(query),
    );
  };

  const displayedGigs = filterGigs(getGigsForTab());

  // Gig Card Component - Modernized
  const GigActivityCard = ({ gig }: { gig: any }) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      whileHover={{ y: -2 }}
      className={cn(
        "p-3 rounded-xl border cursor-pointer transition-all duration-300",
        isDarkMode
          ? "bg-slate-800/30 border-slate-700/30 hover:border-slate-600 hover:bg-slate-800/40"
          : "bg-white/40 border-slate-200/40 hover:border-slate-300 hover:bg-white/60",
      )}
      onClick={() => onViewGig(gig)}
    >
      <div className="flex items-start gap-3">
        <Avatar className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700">
          <AvatarImage src={gig.logo} />
          <AvatarFallback
            className={cn(
              "text-xs",
              isDarkMode
                ? "bg-slate-700 text-slate-200"
                : "bg-slate-200 text-slate-700",
            )}
          >
            {gig.title?.charAt(0)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4
              className={cn(
                "font-medium text-sm truncate max-w-[120px]",
                isDarkMode ? "text-white" : "text-slate-900",
              )}
            >
              {gig.title}
            </h4>

            {/* Activity badge */}
            <Badge variant="outline" className="text-[10px] h-5 px-1.5">
              {activeTab === "trending" && "🔥"}
              {activeTab === "hot" && "⚡"}
              {activeTab === "closing" && "⏰"}
            </Badge>
          </div>

          {/* Category and location */}
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-slate-500">{gig.bussinesscat}</span>
            <span className="text-slate-400">•</span>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <MapPin className="w-3 h-3" />
              <span className="truncate max-w-[70px]">
                {gig.location?.split(",")[0] || "Remote"}
              </span>
            </div>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 text-rose-400" />
              <span className="text-xs text-slate-600 dark:text-slate-400">
                {gig.interestedUsers?.length || 0}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs text-slate-600 dark:text-slate-400">
                {gig.appliedUsers?.length || 0}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-xs text-slate-600 dark:text-slate-400">
                {gig.viewCount?.length || 0}
              </span>
            </div>
          </div>

          {/* Price */}
          {gig.price && gig.price > 0 && (
            <div className="mt-2 flex items-center gap-1">
              <DollarSign className="w-3 h-3 text-emerald-500" />
              <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                {gig.currency} {gig.price.toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-4">
      {/* Main Activity Feed */}
      <div
        className={cn(
          "rounded-xl border overflow-hidden",
          isDarkMode
            ? "bg-slate-900/80 border-slate-700/50"
            : "bg-white/90 border-slate-200/50",
        )}
      >
        {/* Header */}
        <div
          className={cn(
            "px-4 py-3 border-b flex items-center justify-between",
            isDarkMode ? "border-slate-700/50" : "border-slate-200/50",
          )}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            <h3
              className={cn(
                "text-sm font-bold uppercase tracking-wider",
                isDarkMode ? "text-white" : "text-slate-900",
              )}
            >
              The Buzz
            </h3>
          </div>
          <Badge variant="outline" className="text-xs h-5 px-2">
            Live
          </Badge>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-slate-200 dark:border-slate-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search gigs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                "pl-9 h-9 text-sm rounded-lg",
                isDarkMode
                  ? "bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                  : "bg-slate-100 border-slate-200 text-slate-900 placeholder:text-slate-400",
              )}
            />
          </div>
        </div>

        {/* Mood Filters */}
        <div className="px-3 pt-3">
          <div
            className={cn(
              "flex gap-1 p-1 rounded-lg",
              isDarkMode ? "bg-slate-800" : "bg-slate-100",
            )}
          >
            {[
              { id: "trending", label: "🔥 Trending", color: "rose" },
              { id: "hot", label: "⚡ Hot", color: "amber" },
              { id: "closing", label: "⏰ Last Call", color: "purple" },
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveTab(filter.id)}
                className={cn(
                  "flex-1 py-2 rounded-md text-sm font-medium transition-all",
                  activeTab === filter.id
                    ? isDarkMode
                      ? `bg-${filter.color}-600 text-white`
                      : `bg-${filter.color}-500 text-white`
                    : isDarkMode
                      ? "text-slate-400 hover:text-white hover:bg-slate-700"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-200",
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Gig List */}
        <div className="p-3 max-h-[400px] overflow-y-auto scrollbar-hide">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-2"
            >
              {displayedGigs.map((gig) => (
                <GigActivityCard key={gig._id} gig={gig} />
              ))}

              {displayedGigs.length === 0 && (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 mx-auto text-slate-400 mb-3" />
                  <p className="text-sm text-slate-500">No gigs found</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer Stats */}
        <div
          className={cn(
            "px-3 py-2 border-t text-xs font-mono flex items-center justify-between",
            isDarkMode
              ? "border-slate-700/50 text-slate-500"
              : "border-slate-200/50 text-slate-400",
          )}
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>LIVE</span>
          </div>
          <div className="flex items-center gap-3">
            <span>{allGigs.length} active</span>
            <span>•</span>
            <span>{new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </div>

      {/* Upcoming Gigs Section - Opening Soon - HORIZONTAL SCROLL */}
      <div
        className={cn(
          "rounded-xl border overflow-hidden",
          isDarkMode
            ? "bg-slate-900/60 border-purple-500/30"
            : "bg-white border-purple-200",
        )}
      >
        {/* Header */}
        <div
          className={cn(
            "px-3 py-2 border-b flex items-center justify-between",
            isDarkMode ? "border-purple-500/20" : "border-purple-200",
          )}
        >
          <div className="flex items-center gap-1.5">
            <Timer className="w-4 h-4 text-purple-500" />
            <h4
              className={cn(
                "text-sm font-bold uppercase",
                isDarkMode ? "text-white" : "text-slate-900",
              )}
            >
              Opening Soon
            </h4>
          </div>
          <Badge
            className={cn(
              "text-xs h-5 px-2",
              isDarkMode
                ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
                : "bg-purple-100 text-purple-700",
            )}
          >
            {upcomingGigs.length}
          </Badge>
        </div>

        {/* Horizontal Scrolling Cards */}
        <div className="w-full overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 p-3 min-w-min">
            {upcomingGigs.length > 0 ? (
              upcomingGigs.map((gig) => {
                const startTime = gig.acceptInterestStartTime!;
                const now = Date.now();
                const daysUntil = Math.ceil(
                  (startTime - now) / (1000 * 60 * 60 * 24),
                );
                const hoursUntil = Math.floor(
                  (startTime - now) / (1000 * 60 * 60),
                );
                const minutesUntil = Math.floor(
                  ((startTime - now) % (1000 * 60 * 60)) / (1000 * 60),
                );

                // Format time remaining
                const timeDisplay =
                  daysUntil > 0
                    ? `${daysUntil}d`
                    : hoursUntil > 0
                      ? `${hoursUntil}h`
                      : `${minutesUntil}m`;

                return (
                  <motion.div
                    key={gig._id}
                    whileHover={{ y: -2, scale: 1.02 }}
                    onClick={() => onViewGig(gig)}
                    className={cn(
                      "flex-shrink-0 w-24 p-2 rounded-lg border cursor-pointer transition-all group relative",
                      isDarkMode
                        ? "bg-slate-800/40 border-purple-500/20 hover:border-purple-500/50"
                        : "bg-white/40 border-purple-200/50 hover:border-purple-300",
                    )}
                  >
                    {/* Countdown Circle */}
                    <div className="flex flex-col items-center">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold mb-1",
                          daysUntil <= 1
                            ? "bg-gradient-to-br from-orange-500 to-red-500"
                            : "bg-gradient-to-br from-purple-500 to-pink-500",
                        )}
                      >
                        {timeDisplay}
                      </div>

                      {/* Gig Title - Truncated */}
                      <p
                        className={cn(
                          "text-xs font-medium text-center w-full truncate",
                          isDarkMode ? "text-slate-300" : "text-slate-700",
                        )}
                      >
                        {gig.title}
                      </p>

                      {/* Location - Optional small indicator */}
                      {gig.location && (
                        <div className="flex items-center gap-0.5 mt-1 text-[8px] text-slate-500">
                          <MapPin className="w-2 h-2" />
                          <span className="truncate max-w-[60px]">
                            {gig.location.split(",")[0]}
                          </span>
                        </div>
                      )}

                      {/* Interest count - Small indicator */}
                      {gig.interestedUsers &&
                        gig.interestedUsers.length > 0 && (
                          <div className="absolute top-1 right-1">
                            <div className="flex items-center gap-0.5 bg-rose-500/20 text-rose-500 rounded-full px-1 py-0.5 text-[6px]">
                              <Heart className="w-2 h-2" />
                              <span>{gig.interestedUsers.length}</span>
                            </div>
                          </div>
                        )}
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="flex items-center justify-center w-full py-4">
                <Calendar className="w-5 h-5 text-slate-400 mr-2" />
                <p className="text-sm text-slate-500">No upcoming gigs</p>
              </div>
            )}
          </div>
        </div>

        {/* Fade edges indicator for scrollable content */}
        <div className="relative h-0">
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white dark:from-slate-900 to-transparent pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white dark:from-slate-900 to-transparent pointer-events-none" />
        </div>
      </div>

      {/* Platform Stats */}
      <div
        className={cn(
          "rounded-xl border overflow-hidden",
          isDarkMode
            ? "bg-slate-900/60 border-slate-700/50"
            : "bg-white/60 border-slate-200/50",
        )}
      >
        <div className="grid grid-cols-2 divide-x divide-slate-200 dark:divide-slate-700">
          <div className="py-2 text-center">
            <div
              className={cn(
                "text-xs mb-1",
                isDarkMode ? "text-slate-400" : "text-slate-500",
              )}
            >
              Total Gigs
            </div>
            <div className="text-base font-bold text-blue-500">
              {allGigs.length}
            </div>
          </div>
          <div className="py-2 text-center">
            <div
              className={cn(
                "text-xs mb-1",
                isDarkMode ? "text-slate-400" : "text-slate-500",
              )}
            >
              Active
            </div>
            <div className="text-base font-bold text-emerald-500">
              {allGigs.filter((g) => g.isActive).length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlatformActivitySidebar;
