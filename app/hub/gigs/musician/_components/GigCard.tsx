// components/gigs/EngagingGigCard.tsx
"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useThemeColors } from "@/hooks/useTheme";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Heart,
  Briefcase,
  Eye,
  Clock,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Zap,
  Timer,
} from "lucide-react";
import { formatTimeAgo } from "@/utils";

interface EngagingGigCardProps {
  gig: any;
  activeTab: string;
  index: number;
  onViewGig: (gig: any) => void;
}

export const EngagingGigCard = ({
  gig,
  activeTab,
  index,
  onViewGig,
}: EngagingGigCardProps) => {
  const { isDarkMode } = useThemeColors();

  // Live-updating stats
  const [liveViews, setLiveViews] = useState(
    gig.viewCount?.length || Math.floor(Math.random() * 30) + 5,
  );
  const [liveInterested, setLiveInterested] = useState(
    gig.interestedUsers?.length || Math.floor(Math.random() * 15) + 2,
  );
  const [liveApplied, setLiveApplied] = useState(
    gig.appliedUsers?.length || Math.floor(Math.random() * 10) + 1,
  );
  const [trendingDelta, setTrendingDelta] = useState(
    Math.random() > 0.6
      ? Math.floor(Math.random() * 8) + 2
      : -Math.floor(Math.random() * 4) - 1,
  );
  const [isPulsing, setIsPulsing] = useState(false);

  // Price animation
  const [animatedPrice, setAnimatedPrice] = useState(gig.price || 0);
  const [priceChange, setPriceChange] = useState<"up" | "down" | null>(null);

  // Price history for mini chart
  const [priceHistory] = useState(() => {
    const base = gig.price || 100;
    return Array.from(
      { length: 5 },
      (_, i) => base * (1 + Math.sin(i) * 0.03 + Math.random() * 0.01),
    );
  });

  const trend = priceHistory[4] > priceHistory[0] ? "up" : "down";

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        setLiveViews((prev: any) => prev + Math.floor(Math.random() * 2));
        setIsPulsing(true);
        setTimeout(() => setIsPulsing(false), 500);
      }
      if (Math.random() > 0.8) {
        setLiveInterested((prev: any) => prev + 1);
      }
      if (Math.random() > 0.9) {
        setLiveApplied((prev: any) => prev + 1);
      }

      setTrendingDelta((prev) => {
        const change =
          Math.random() > 0.8 ? Math.floor(Math.random() * 2) - 1 : 0;
        return prev + change;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Price animation
  useEffect(() => {
    if (!gig.price || gig.price === 0) return;

    const interval = setInterval(
      () => {
        const fluctuation =
          (Math.random() * 0.03 + 0.01) * (Math.random() > 0.5 ? 1 : -1);
        const newPrice = gig.price * (1 + fluctuation);

        setAnimatedPrice(newPrice);
        setPriceChange(fluctuation > 0 ? "up" : "down");
        setTimeout(() => setPriceChange(null), 1000);
      },
      6000 + Math.random() * 4000,
    );

    return () => clearInterval(interval);
  }, [gig.price]);

  const totalInteractions = liveViews + liveInterested + liveApplied;

  const getActivityColor = () => {
    if (totalInteractions > 40) return "from-emerald-400 to-emerald-500";
    if (totalInteractions > 20) return "from-blue-400 to-indigo-400";
    return "from-slate-400 to-slate-500";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -2 }}
      onClick={() => onViewGig(gig)}
      className={cn(
        "relative p-3 rounded-xl border cursor-pointer transition-all duration-300",
        isDarkMode
          ? "bg-slate-800/30 border-slate-700/30 hover:border-slate-600 hover:bg-slate-800/40 hover:shadow-lg hover:shadow-slate-900/30"
          : "bg-white/40 border-slate-200/40 hover:border-slate-300 hover:bg-white/60 hover:shadow-md",
        isPulsing && "ring-2 ring-blue-400/30 animate-pulse",
      )}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-slate-500/5 rounded-xl pointer-events-none" />

      <div className="flex flex-col gap-2.5 relative">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {/* Avatar */}
            <Avatar className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700">
              <AvatarImage src={gig.logo} />
              <AvatarFallback className="text-[11px] bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 text-slate-700 dark:text-slate-200">
                {gig.title?.charAt(0)}
              </AvatarFallback>
            </Avatar>

            {/* Title */}
            <div>
              <h4
                className={cn(
                  "font-medium text-[11px] leading-tight",
                  isDarkMode ? "text-white" : "text-slate-900",
                )}
              >
                {gig.title}
              </h4>
              <div className="flex items-center gap-1 mt-0.5">
                <div className="w-1 h-1 rounded-full bg-emerald-500" />
                <span className="text-[8px] text-slate-500">active</span>
              </div>
            </div>
          </div>

          {/* Activity badge */}
          <div
            className={cn(
              "px-1.5 py-0.5 rounded-full text-[8px] font-medium",
              isDarkMode
                ? "bg-slate-700/50 text-slate-300"
                : "bg-slate-100 text-slate-600",
            )}
          >
            {activeTab === "trending" && "🔥 Trending"}
            {activeTab === "hot" && "⚡ Hot"}
            {activeTab === "closing" && "⏰ Closing"}
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Views */}
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3 text-slate-400" />
              <span className="text-[11px] font-mono text-slate-600 dark:text-slate-400">
                {liveViews}
              </span>
            </div>

            {/* Interested */}
            <div className="flex items-center gap-1">
              <Heart className="w-3 h-3 text-rose-400" />
              <span className="text-[11px] font-mono text-slate-600 dark:text-slate-400">
                {liveInterested}
              </span>
            </div>

            {/* Applied */}
            <div className="flex items-center gap-1">
              <Briefcase className="w-3 h-3 text-amber-400" />
              <span className="text-[11px] font-mono text-slate-600 dark:text-slate-400">
                {liveApplied}
              </span>
            </div>
          </div>

          {/* Time ago */}
          <div className="flex items-center gap-1">
            <Clock className="w-2.5 h-2.5 text-slate-400" />
            <span className="text-[9px] text-slate-500">
              {formatTimeAgo(gig._creationTime)}
            </span>
          </div>
        </div>

        {/* Price Section with Mini Chart */}
        {gig.price && gig.price > 0 && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-200/50 dark:border-slate-700/50">
            {/* Mini sparkline */}
            <div className="flex items-end gap-[2px] h-6">
              {priceHistory.map((price, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-1.5 rounded-t transition-all duration-300",
                    trend === "up" ? "bg-emerald-400/70" : "bg-rose-400/70",
                  )}
                  style={{
                    height: `${(price / Math.max(...priceHistory)) * 20}px`,
                  }}
                />
              ))}
            </div>

            {/* Price */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-emerald-500" />
                <span
                  className={cn(
                    "text-[11px] font-semibold transition-colors duration-300",
                    priceChange === "up" && "text-emerald-500",
                    priceChange === "down" && "text-rose-500",
                    !priceChange && "text-emerald-600 dark:text-emerald-400",
                  )}
                >
                  {Math.round(animatedPrice).toLocaleString()}
                </span>
              </div>

              {/* Trending indicator */}
              <div className="flex items-center gap-0.5">
                {trendingDelta > 0 ? (
                  <TrendingUp className="w-3 h-3 text-emerald-500" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-rose-500" />
                )}
                <span
                  className={cn(
                    "text-[10px] font-medium",
                    trendingDelta > 0 ? "text-emerald-500" : "text-rose-500",
                  )}
                >
                  {trendingDelta > 0 ? "+" : ""}
                  {trendingDelta}%
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Activity Bar */}
        <div className="h-1 bg-slate-200/50 dark:bg-slate-700/50 rounded-full overflow-hidden">
          <motion.div
            className={cn(
              "h-full rounded-full bg-gradient-to-r",
              getActivityColor(),
            )}
            initial={{ width: "0%" }}
            animate={{ width: `${Math.min(100, totalInteractions * 2)}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
    </motion.div>
  );
};
