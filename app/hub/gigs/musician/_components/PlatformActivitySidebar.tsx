// components/gigs/PlatformActivitySidebar.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Id } from "@/convex/_generated/dataModel";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Heart,
  Briefcase,
  Star,
  CheckCircle,
  Activity,
  Search,
  X,
  MapPin,
  Music,
  Calendar,
  Clock,
  TrendingUp,
  TrendingDown,
  Users,
  Sparkles,
  DollarSign,
  Timer,
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
  const [activityScores, setActivityScores] = useState<Record<string, number>>(
    {},
  );
  const [upcomingGigs, setUpcomingGigs] = useState<PlatformGig[]>([]);
  const [trendingGigs, setTrendingGigs] = useState<any[]>([]);

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
      .sort(() => 0.5 - Math.random())
      .slice(0, 5);

    setUpcomingGigs(upcoming);
  }, [allGigs, currentGigId]);

  // Simulate activity scores and trending data
  useEffect(() => {
    const interval = setInterval(() => {
      const newScores: Record<string, number> = {};
      allGigs.forEach((gig) => {
        newScores[gig._id] = Math.floor(Math.random() * 100);
      });
      setActivityScores(newScores);

      // Calculate trending gigs based on activity and user counts
      const trending = allGigs
        .filter((gig) => gig._id !== currentGigId)
        .map((gig) => {
          const totalActivity =
            (gig.interestedUsers?.length || 0) * 3 +
            (gig.appliedUsers?.length || 0) * 5 +
            (gig.viewCount?.length || 0) +
            (activityScores[gig._id] || 0);

          return {
            ...gig,
            trendScore: totalActivity,
            demandLevel:
              totalActivity > 50
                ? "high"
                : totalActivity > 20
                  ? "medium"
                  : "low",
            responseTime: Math.floor(Math.random() * 24) + "h",
            averageBid: gig.price ? Math.floor(gig.price * 0.8) : null,
          };
        })
        .sort((a, b) => b.trendScore - a.trendScore)
        .slice(0, 8);

      setTrendingGigs(trending);
    }, 5000);

    return () => clearInterval(interval);
  }, [allGigs, currentGigId, activityScores]);

  // Get gigs based on tab
  const getGigsForTab = useCallback(() => {
    switch (activeTab) {
      case "trending":
        return trendingGigs;
      case "high-demand":
        return trendingGigs
          .filter((g) => (g.interestedUsers?.length || 0) > 5)
          .sort(
            (a, b) =>
              (b.interestedUsers?.length || 0) -
              (a.interestedUsers?.length || 0),
          );
      case "recent":
        return [...allGigs]
          .filter((g) => g._id !== currentGigId)
          .sort((a, b) => b._creationTime - a._creationTime)
          .slice(0, 8);
      case "booking-soon":
        return allGigs
          .filter(
            (g) =>
              g._id !== currentGigId &&
              g.acceptInterestEndTime &&
              g.acceptInterestEndTime < Date.now() + 7 * 24 * 60 * 60 * 1000,
          )
          .slice(0, 8);
      default:
        return trendingGigs;
    }
  }, [activeTab, trendingGigs, allGigs, currentGigId]);

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

  // Get demand color
  const getDemandColor = (level: string) => {
    switch (level) {
      case "high":
        return "text-emerald-500";
      case "medium":
        return "text-amber-500";
      default:
        return "text-slate-400";
    }
  };

  // Anonymous activity indicators
  const AnonymousActivityIndicator = ({ count }: { count: number }) => (
    <div className="flex items-center gap-1">
      <div className="flex -space-x-1">
        {[...Array(Math.min(3, count))].map((_, i) => (
          <div
            key={i}
            className={cn(
              "w-4 h-4 rounded-full border-2",
              isDarkMode
                ? "bg-slate-700 border-slate-800"
                : "bg-slate-300 border-white",
            )}
          />
        ))}
      </div>
      <span className="text-[10px] text-slate-500">
        {count} {count === 1 ? "person" : "people"}
      </span>
    </div>
  );

  // Gig Card Component
  const GigActivityCard = ({ gig }: { gig: any }) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        "p-3 rounded-xl border transition-all cursor-pointer",
        isDarkMode
          ? "bg-slate-800/30 border-slate-700/50 hover:border-slate-600"
          : "bg-white/30 border-slate-200/50 hover:border-slate-300",
      )}
      onClick={() => onViewGig(gig)}
    >
      <div className="flex items-start gap-3">
        <Avatar className="w-10 h-10 rounded-lg">
          <AvatarImage src={gig.logo} />
          <AvatarFallback
            className={isDarkMode ? "bg-slate-700" : "bg-slate-200"}
          >
            {gig.title?.charAt(0)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4
                className={cn(
                  "font-medium text-sm truncate max-w-[150px]",
                  isDarkMode ? "text-white" : "text-slate-900",
                )}
              >
                {gig.title}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                  {gig.bussinesscat}
                </Badge>

                {/* Demand indicator */}
                <span
                  className={cn(
                    "text-[10px] font-medium",
                    getDemandColor(gig.demandLevel),
                  )}
                >
                  {gig.demandLevel === "high" && "🔥 High Demand"}
                  {gig.demandLevel === "medium" && "📈 Trending"}
                  {gig.demandLevel === "low" && "💤 Low Activity"}
                </span>
              </div>
            </div>

            {/* Live activity pulse */}
            <div className="relative">
              <div
                className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  gig.demandLevel === "high"
                    ? "bg-emerald-500"
                    : gig.demandLevel === "medium"
                      ? "bg-amber-500"
                      : "bg-slate-400",
                )}
              >
                <div
                  className={cn(
                    "absolute inset-0 rounded-full animate-ping",
                    gig.demandLevel === "high"
                      ? "bg-emerald-500/50"
                      : gig.demandLevel === "medium"
                        ? "bg-amber-500/50"
                        : "bg-slate-400/50",
                  )}
                />
              </div>
            </div>
          </div>

          {/* Location and Price */}
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-1 text-[10px] text-slate-500">
              <MapPin className="w-3 h-3" />
              <span className="truncate max-w-[80px]">
                {gig.location?.split(",")[0] || "Remote"}
              </span>
            </div>

            {gig.price && (
              <div className="flex items-center gap-1 text-[10px] text-emerald-500">
                <DollarSign className="w-3 h-3" />
                <span>{gig.price.toLocaleString()}</span>
              </div>
            )}
          </div>

          {/* Anonymous Activity Stats */}
          <div className="mt-2 flex items-center gap-3">
            {/* Interested count */}
            {gig.interestedUsers?.length > 0 && (
              <div className="flex items-center gap-1">
                <Heart className="w-3 h-3 text-rose-400" />
                <span className="text-[10px] text-slate-500">
                  {gig.interestedUsers.length}
                </span>
              </div>
            )}

            {/* Applied count */}
            {gig.appliedUsers?.length > 0 && (
              <div className="flex items-center gap-1">
                <Briefcase className="w-3 h-3 text-amber-400" />
                <span className="text-[10px] text-slate-500">
                  {gig.appliedUsers.length}
                </span>
              </div>
            )}

            {/* View count */}
            {gig.viewCount?.length > 0 && (
              <div className="flex items-center gap-1">
                <Activity className="w-3 h-3 text-blue-400" />
                <span className="text-[10px] text-slate-500">
                  {gig.viewCount.length}
                </span>
              </div>
            )}

            {/* Response time indicator */}
            {gig.responseTime && (
              <div className="flex items-center gap-1">
                <Timer className="w-3 h-3 text-purple-400" />
                <span className="text-[10px] text-slate-500">
                  {gig.responseTime}
                </span>
              </div>
            )}
          </div>

          {/* Anonymous avatars (just visual, no identity) */}
          {gig.interestedUsers && gig.interestedUsers.length > 0 && (
            <div className="mt-2">
              <AnonymousActivityIndicator count={gig.interestedUsers.length} />
            </div>
          )}

          {/* Live activity ticker */}
          <div className="mt-2 flex items-center gap-2 text-[8px] font-mono">
            <Activity className="w-2.5 h-2.5 text-emerald-500 animate-pulse" />
            <span className="text-slate-500">
              {Math.floor(Math.random() * 10)} new interactions •{" "}
              {Math.floor(Math.random() * 5)}m ago
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-4">
      {/* Main Activity Feed */}
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
            "px-4 py-3 border-b flex items-center justify-between",
            isDarkMode ? "border-slate-700/50" : "border-slate-200/50",
          )}
        >
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-500" />
            <h3
              className={cn(
                "text-sm font-semibold",
                isDarkMode ? "text-white" : "text-slate-900",
              )}
            >
              Market Activity
            </h3>
          </div>
          <Badge variant="outline" className="text-xs">
            Live
          </Badge>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-slate-200 dark:border-slate-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <Input
              placeholder="Search gigs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                "pl-8 h-9 text-sm",
                isDarkMode
                  ? "bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                  : "bg-slate-100 border-slate-200 text-slate-900 placeholder:text-slate-400",
              )}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="px-3 pt-3">
          <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
            {[
              {
                id: "trending",
                label: "Trending",
                icon: TrendingUp,
                color: "rose",
              },
              {
                id: "high-demand",
                label: "High Demand",
                icon: Sparkles,
                color: "amber",
              },
              { id: "recent", label: "Recent", icon: Clock, color: "blue" },
              {
                id: "booking-soon",
                label: "Closing Soon",
                icon: Timer,
                color: "purple",
              },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all",
                    "flex items-center gap-1.5",
                    activeTab === tab.id
                      ? isDarkMode
                        ? `bg-${tab.color}-500/20 text-${tab.color}-400 border border-${tab.color}-500/30`
                        : `bg-${tab.color}-50 text-${tab.color}-700 border border-${tab.color}-200`
                      : isDarkMode
                        ? "text-slate-400 hover:text-white hover:bg-slate-800"
                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-100",
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Gig List */}
        <div className="p-3 max-h-[400px] overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
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
            "p-3 border-t text-[10px] font-mono flex items-center justify-between",
            isDarkMode
              ? "border-slate-700/50 text-slate-500"
              : "border-slate-200/50 text-slate-400",
          )}
        >
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>LIVE MARKET</span>
          </div>
          <div className="flex items-center gap-3">
            <span>{allGigs.length} active gigs</span>
            <span>•</span>
            <span>{new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </div>

      {/* Upcoming Gigs Section */}
      <div
        className={cn(
          "rounded-2xl border overflow-hidden",
          isDarkMode
            ? "bg-slate-900/80 border-slate-700/50 backdrop-blur-md"
            : "bg-white/90 border-slate-200/50 backdrop-blur-md shadow-lg",
        )}
      >
        <div
          className={cn(
            "px-4 py-3 border-b flex items-center justify-between",
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
              Opening Soon
            </h3>
          </div>
          <Badge
            variant="outline"
            className="text-xs bg-blue-500/10 text-blue-500 border-blue-500/30"
          >
            {upcomingGigs.length} upcoming
          </Badge>
        </div>

        <div className="p-3 space-y-2 max-h-[300px] overflow-y-auto">
          {upcomingGigs.map((gig) => {
            const daysUntil = Math.ceil(
              (gig.acceptInterestStartTime! - Date.now()) /
                (1000 * 60 * 60 * 24),
            );

            return (
              <motion.div
                key={gig._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "p-3 rounded-xl border cursor-pointer transition-all",
                  isDarkMode
                    ? "bg-slate-800/30 border-slate-700/50 hover:border-blue-500/50"
                    : "bg-white/30 border-slate-200/50 hover:border-blue-500/50",
                )}
                onClick={() => onViewGig(gig)}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                    {daysUntil}d
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4
                      className={cn(
                        "font-medium text-sm truncate",
                        isDarkMode ? "text-white" : "text-slate-900",
                      )}
                    >
                      {gig.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">
                        {gig.location?.split(",")[0] || "Remote"}
                      </span>
                      <span>•</span>
                      <Clock className="w-3 h-3" />
                      <span>
                        Opens{" "}
                        {new Date(
                          gig.acceptInterestStartTime!,
                        ).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Show interest count anonymously */}
                    {gig.interestedUsers && gig.interestedUsers.length > 0 && (
                      <div className="mt-2 flex items-center gap-1">
                        <Heart className="w-3 h-3 text-rose-400" />
                        <span className="text-[10px] text-slate-500">
                          {gig.interestedUsers.length} waiting
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}

          {upcomingGigs.length === 0 && (
            <div className="text-center py-6">
              <Calendar className="w-10 h-10 mx-auto text-slate-400 mb-2" />
              <p className="text-xs text-slate-500">No upcoming gigs</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlatformActivitySidebar;
