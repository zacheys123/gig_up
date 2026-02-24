// app/hub/gigs/musician/[gigId]/gig-info/page.tsx
"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useThemeColors } from "@/hooks/useTheme";
import { toast } from "sonner";

// UI Components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// Icons
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  Users,
  Music,
  Mic,
  Volume2,
  Star,
  CheckCircle,
  XCircle,
  AlertCircle,
  MessageSquare,
  Heart,
  Briefcase,
  User as UserIcon,
  Users2,
  Award,
  Shield,
  TrendingUp, // You already have this
  Sparkles, // You already have this
  Eye,
  Crown,
  Medal,
  BadgeCheck,
  UserRound,
  UserRoundCheck,
  UserRoundX,
  UserRoundPlus,
  UserRoundSearch,
  Loader2,
  Instagram,
  Twitter,
  Youtube,
  Facebook,
  Linkedin,
  Globe,
  Mail,
  Phone,
  Github,
  Camera,
  Edit3,
  MoreHorizontal,
  Bookmark,
  Share2,
  Flag,
  Ban,
  Trash2,
  ExternalLink,
  Copy,
  Check,
  X,
  ChevronRight,
  ChevronLeft,
  Plus,
  Minus,
  Filter,
  Search,
  SlidersHorizontal,
  Grid,
  List,
  CalendarDays,
  Clock3,
  Timer,
  UsersRound,
  VerifiedIcon,
  ThumbsUp,
  Activity, // You already have this
  // ADD THESE NEW ONES
  TrendingDown,
  // You have Minus already, but adding for clarity
  BarChart3,
  LineChart,
  Zap,
} from "lucide-react";
// Trust components
import { TrustStarsDisplay } from "@/components/trust/TrustStarsDisplay";
import { ChatIcon } from "@/components/chat/ChatIcon";
import { isUserQualifiedForRole } from "../../../utils";

// ============= COMPONENT PLACEHOLDERS =============

const ApplicantSidebar = ({
  groupedApplicants,
  filterUsers,
  getUserStatusBadge,
  handleViewProfile,
  canMessageUser,
  isDarkMode,
  searchQuery,
  setSearchQuery,
  activeTab,
  setActiveTab,
  isMobile = false,
}: any) => {
  const [activityScores, setActivityScores] = useState<Record<string, number>>(
    {},
  );
  const [categoryStats, setCategoryStats] = useState<
    Record<string, { active: number; trending: boolean }>
  >({});
  const [feedMood, setFeedMood] = useState<"active" | "calm" | "busy">("calm");
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [onlineCount, setOnlineCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      // Update individual activity scores
      const newScores: Record<string, number> = {};
      Object.values(groupedApplicants).forEach((category: any) => {
        category?.forEach((user: any) => {
          if (user?._id) {
            newScores[user._id] = Math.floor(Math.random() * 100); // 0-99 activity score
          }
        });
      });
      setActivityScores(newScores);

      // Update category stats
      const newStats: Record<string, { active: number; trending: boolean }> =
        {};
      Object.keys(groupedApplicants).forEach((key) => {
        const users = groupedApplicants[key] || [];
        const active = Math.floor(Math.random() * users.length); // Random active count
        const trending = Math.random() > 0.7; // 30% chance of trending
        newStats[key] = { active, trending };
      });
      setCategoryStats(newStats);

      // Update feed mood
      const moods = ["active", "calm", "busy"] as const;
      setFeedMood(moods[Math.floor(Math.random() * moods.length)]);

      // Random online count (between 1 and total users)
      const totalUsers = Object.values(groupedApplicants).reduce(
        (acc: number, arr: any) => acc + (arr?.length || 0),
        0,
      );
      setOnlineCount(Math.floor(Math.random() * totalUsers) + 1);

      setLastUpdated(new Date());
    }, 4000);

    return () => clearInterval(interval);
  }, [groupedApplicants]);

  const getActivityColor = (score: number = 0) => {
    if (score > 66) return "text-emerald-500";
    if (score > 33) return "text-amber-500";
    return "text-slate-400";
  };

  const getActivityBar = (score: number = 0) => {
    const width = Math.min(100, Math.max(10, score));
    return (
      <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            score > 66
              ? "bg-emerald-500"
              : score > 33
                ? "bg-amber-500"
                : "bg-slate-400",
          )}
          style={{ width: `${width}%` }}
        />
      </div>
    );
  };

  const totalActive = Object.values(categoryStats).reduce(
    (acc, stat) => acc + (stat?.active || 0),
    0,
  );

  return (
    <div
      className={cn(
        "rounded-2xl border overflow-hidden",
        isDarkMode
          ? "bg-slate-900/80 border-slate-700/50 backdrop-blur-md"
          : "bg-white/90 border-slate-200/50 backdrop-blur-md shadow-lg",
      )}
    >
      {/* Header with activity mood */}
      <div
        className={cn(
          "px-4 py-3 border-b flex items-center justify-between",
          isDarkMode ? "border-slate-700/50" : "border-slate-200/50",
        )}
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-2 h-2 rounded-full animate-pulse",
              feedMood === "busy"
                ? "bg-emerald-500"
                : feedMood === "active"
                  ? "bg-amber-500"
                  : "bg-slate-400",
            )}
          />
          <div className="flex items-center gap-2">
            <h3
              className={cn(
                "text-sm font-semibold uppercase tracking-wider",
                isDarkMode ? "text-slate-300" : "text-slate-700",
              )}
            >
              Activity Feed
            </h3>
            {feedMood === "busy" && (
              <Zap className="w-3.5 h-3.5 text-emerald-500" />
            )}
            {feedMood === "active" && (
              <Activity className="w-3.5 h-3.5 text-amber-500" />
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={cn(
              "text-xs font-mono",
              isDarkMode
                ? "border-slate-700 text-slate-400"
                : "border-slate-200 text-slate-500",
            )}
          >
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {Object.values(groupedApplicants).reduce(
                (acc: number, arr: any) => acc + (arr?.length || 0),
                0,
              )}
            </span>
          </Badge>
          <Badge
            variant="outline"
            className={cn(
              "text-xs font-mono",
              isDarkMode
                ? "border-slate-700 text-slate-400"
                : "border-slate-200 text-slate-500",
            )}
          >
            <span className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {onlineCount} online
            </span>
          </Badge>
        </div>
      </div>

      {/* Live activity ticker */}
      <div
        className={cn(
          "px-3 py-2 border-b flex items-center gap-3 overflow-x-auto text-[10px] font-mono",
          isDarkMode
            ? "border-slate-700/50 bg-slate-800/30"
            : "border-slate-200/50 bg-slate-100/30",
        )}
      >
        <Activity
          className={cn(
            "w-3 h-3 animate-pulse",
            isDarkMode ? "text-amber-400" : "text-amber-500",
          )}
        />
        {Object.entries(categoryStats).map(([key, data]) => (
          <div
            key={key}
            className="flex items-center gap-1.5 whitespace-nowrap"
          >
            <span className={isDarkMode ? "text-slate-400" : "text-slate-500"}>
              {key.toUpperCase()}:
            </span>
            <span
              className={data?.trending ? "text-emerald-500" : "text-slate-400"}
            >
              {data?.active || 0} active
            </span>
            {data?.trending && (
              <Sparkles className="w-2.5 h-2.5 text-emerald-500 animate-pulse" />
            )}
          </div>
        ))}
      </div>

      {/* Search */}
      <div
        className={cn(
          "p-3 border-b",
          isDarkMode ? "border-slate-700/50" : "border-slate-200/50",
        )}
      >
        <div className="relative">
          <Search
            className={cn(
              "absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5",
              isDarkMode ? "text-slate-500" : "text-slate-400",
            )}
          />
          <Input
            placeholder="Search participants..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              "pl-8 h-9 text-sm rounded-lg border-0 bg-transparent",
              "focus:ring-1 focus:ring-blue-500/30",
              isDarkMode
                ? "bg-slate-800/50 text-white placeholder:text-slate-500"
                : "bg-slate-100/50 text-slate-900 placeholder:text-slate-400",
            )}
          />
        </div>
      </div>

      {/* Category Tabs with live indicators */}
      <div className="px-3 pt-3">
        <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
          {[
            { id: "all", label: "ALL", color: "blue" },
            { id: "interested", label: "INTERESTED", color: "rose" },
            { id: "applied", label: "APPLIED", color: "amber" },
            { id: "shortlisted", label: "SHORTLISTED", color: "emerald" },
            { id: "booked", label: "BOOKED", color: "purple" },
          ].map((tab) => {
            const count =
              tab.id === "all"
                ? Object.values(groupedApplicants).reduce(
                    (acc: number, arr: any) => acc + (arr?.length || 0),
                    0,
                  )
                : groupedApplicants[tab.id as keyof typeof groupedApplicants]
                    ?.length || 0;

            const stat = categoryStats[tab.id];
            const active = stat?.active || 0;

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
                <span>{tab.label}</span>
                {active > 0 && (
                  <span
                    className={cn(
                      "text-[8px]",
                      isDarkMode ? "text-slate-500" : "text-slate-400",
                    )}
                  >
                    {active} now
                  </span>
                )}
                {stat?.trending && (
                  <Sparkles className="w-2.5 h-2.5 text-emerald-500 animate-pulse" />
                )}
                {count > 0 && (
                  <span
                    className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded-full",
                      activeTab === tab.id
                        ? isDarkMode
                          ? `bg-${tab.color}-500/30 text-${tab.color}-300`
                          : `bg-${tab.color}-200 text-${tab.color}-800`
                        : isDarkMode
                          ? "bg-slate-800 text-slate-400"
                          : "bg-slate-200 text-slate-500",
                    )}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Participants List - Like activity feed */}
      <ScrollArea
        className={cn("px-3", isMobile ? "h-[calc(100vh-350px)]" : "h-[400px]")}
      >
        <div className="space-y-2 pt-2 pb-3">
          {activeTab === "all" ? (
            // Show all categories grouped like feed sections
            <>
              {[
                "interested",
                "applied",
                "shortlisted",
                "booked",
                "bandApplicants",
              ].map((category) => {
                const users =
                  groupedApplicants[
                    category as keyof typeof groupedApplicants
                  ] || [];
                const filtered = filterUsers(users);
                if (filtered.length === 0) return null;

                const categoryColors = {
                  interested: "rose",
                  applied: "amber",
                  shortlisted: "emerald",
                  booked: "purple",
                  bandApplicants: "indigo",
                };

                const color =
                  categoryColors[category as keyof typeof categoryColors] ||
                  "slate";

                return (
                  <div key={category} className="space-y-1">
                    <div
                      className={cn(
                        "sticky top-0 py-1.5 px-2 text-[10px] font-mono uppercase tracking-wider flex items-center justify-between",
                        isDarkMode
                          ? "bg-slate-900/90 text-slate-400"
                          : "bg-white/90 text-slate-500",
                        "backdrop-blur-sm z-10",
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            `bg-${color}-500`,
                          )}
                        />
                        <span>
                          {category === "bandApplicants"
                            ? "BAND APPLICANTS"
                            : category.toUpperCase()}
                        </span>
                        {categoryStats[category]?.trending && (
                          <Sparkles className="w-2.5 h-2.5 text-emerald-500 animate-pulse" />
                        )}
                      </div>
                      <span className="font-mono">
                        {filtered.length} •{" "}
                        {categoryStats[category]?.active || 0} active
                      </span>
                    </div>

                    {filtered.map((user: any) => {
                      const statusBadge = getUserStatusBadge(user._id);
                      const activityScore = activityScores[user._id] || 0;

                      return (
                        <motion.div
                          key={user._id}
                          whileHover={{ x: 2 }}
                          className={cn(
                            "flex items-center gap-2 p-2 rounded-lg transition-all cursor-pointer group",
                            isDarkMode
                              ? "hover:bg-slate-800/80"
                              : "hover:bg-slate-100/80",
                          )}
                          onClick={() => handleViewProfile(user._id)}
                        >
                          {/* Avatar with activity indicator */}
                          <div className="relative">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={user.picture} />
                              <AvatarFallback
                                className={cn(
                                  "text-xs",
                                  isDarkMode ? "bg-slate-800" : "bg-slate-200",
                                )}
                              >
                                {user.firstname?.charAt(0) || "U"}
                              </AvatarFallback>
                            </Avatar>
                            {/* Online indicator */}
                            <div
                              className={cn(
                                "absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2",
                                isDarkMode ? "ring-slate-900" : "ring-white",
                                Math.random() > 0.5
                                  ? "bg-emerald-500"
                                  : "bg-slate-400",
                              )}
                            />
                          </div>

                          {/* User info with activity data */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p
                                className={cn(
                                  "font-medium text-xs truncate",
                                  isDarkMode ? "text-white" : "text-slate-900",
                                )}
                              >
                                {user.firstname || user.username}
                              </p>
                              {statusBadge && (
                                <span
                                  className={cn(
                                    "text-[8px] px-1.5 py-0.5 rounded-full font-mono",
                                    statusBadge.bg,
                                    statusBadge.text,
                                  )}
                                >
                                  {statusBadge.label}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-3 mt-1">
                              <div className="flex items-center gap-1">
                                <TrustStarsDisplay
                                  trustStars={user.trustStars || 0}
                                  size="sm"
                                />
                              </div>

                              {/* Activity bar */}
                              <div className="flex items-center gap-1.5">
                                {getActivityBar(activityScore)}
                                <span
                                  className={cn(
                                    "text-[8px] font-mono",
                                    getActivityColor(activityScore),
                                  )}
                                >
                                  {activityScore}%
                                </span>
                              </div>

                              {user.city && (
                                <span
                                  className={cn(
                                    "text-[8px]",
                                    isDarkMode
                                      ? "text-slate-600"
                                      : "text-slate-400",
                                  )}
                                >
                                  {user.city}
                                </span>
                              )}
                            </div>

                            {/* Last active indicator */}
                            <p
                              className={cn(
                                "text-[8px] mt-1",
                                isDarkMode
                                  ? "text-slate-600"
                                  : "text-slate-400",
                              )}
                            >
                              {Math.floor(Math.random() * 10)}m ago
                            </p>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              className={cn(
                                "p-1 rounded-md transition-colors",
                                isDarkMode
                                  ? "hover:bg-slate-700 text-slate-400 hover:text-white"
                                  : "hover:bg-slate-200 text-slate-500 hover:text-slate-900",
                              )}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewProfile(user._id);
                              }}
                            >
                              <Eye className="w-3 h-3" />
                            </button>
                            {canMessageUser(user._id) && (
                              <ChatIcon
                                userId={user._id}
                                size="sm"
                                variant="ghost"
                                className="p-1"
                              />
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                );
              })}
            </>
          ) : (
            // Show single category
            <div className="space-y-1">
              {filterUsers(
                groupedApplicants[
                  activeTab as keyof typeof groupedApplicants
                ] || [],
              ).map((user: any) => {
                const statusBadge = getUserStatusBadge(user._id);
                const activityScore = activityScores[user._id] || 0;

                return (
                  <motion.div
                    key={user._id}
                    whileHover={{ x: 2 }}
                    className={cn(
                      "flex items-center gap-2 p-2 rounded-lg transition-all cursor-pointer group",
                      isDarkMode
                        ? "hover:bg-slate-800/80"
                        : "hover:bg-slate-100/80",
                    )}
                    onClick={() => handleViewProfile(user._id)}
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user.picture} />
                      <AvatarFallback
                        className={cn(
                          "text-xs",
                          isDarkMode ? "bg-slate-800" : "bg-slate-200",
                        )}
                      >
                        {user.firstname?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p
                          className={cn(
                            "font-medium text-xs truncate",
                            isDarkMode ? "text-white" : "text-slate-900",
                          )}
                        >
                          {user.firstname || user.username}
                        </p>
                        {statusBadge && (
                          <span
                            className={cn(
                              "text-[8px] px-1.5 py-0.5 rounded-full font-mono",
                              statusBadge.bg,
                              statusBadge.text,
                            )}
                          >
                            {statusBadge.label}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 mt-1">
                        <TrustStarsDisplay
                          trustStars={user.trustStars || 0}
                          size="sm"
                        />

                        {/* Activity bar */}
                        <div className="flex items-center gap-1.5">
                          {getActivityBar(activityScore)}
                          <span
                            className={cn(
                              "text-[8px] font-mono",
                              getActivityColor(activityScore),
                            )}
                          >
                            {activityScore}%
                          </span>
                        </div>

                        {user.city && (
                          <span
                            className={cn(
                              "text-[8px]",
                              isDarkMode ? "text-slate-600" : "text-slate-400",
                            )}
                          >
                            {user.city}
                          </span>
                        )}
                      </div>

                      <p
                        className={cn(
                          "text-[8px] mt-1",
                          isDarkMode ? "text-slate-600" : "text-slate-400",
                        )}
                      >
                        {Math.floor(Math.random() * 10)}m ago
                      </p>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        className={cn(
                          "p-1 rounded-md",
                          isDarkMode
                            ? "hover:bg-slate-700 text-slate-400"
                            : "hover:bg-slate-200 text-slate-500",
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewProfile(user._id);
                        }}
                      >
                        <Eye className="w-3 h-3" />
                      </button>
                      {canMessageUser(user._id) && (
                        <ChatIcon
                          userId={user._id}
                          size="sm"
                          variant="ghost"
                          className="p-1"
                        />
                      )}
                    </div>
                  </motion.div>
                );
              })}

              {filterUsers(
                groupedApplicants[
                  activeTab as keyof typeof groupedApplicants
                ] || [],
              ).length === 0 && (
                <div className="text-center py-8">
                  <div
                    className={cn(
                      "w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-3",
                      isDarkMode ? "bg-slate-800" : "bg-slate-100",
                    )}
                  >
                    <Users
                      className={cn(
                        "w-6 h-6",
                        isDarkMode ? "text-slate-600" : "text-slate-400",
                      )}
                    />
                  </div>
                  <p
                    className={cn(
                      "text-sm font-medium mb-1",
                      isDarkMode ? "text-slate-300" : "text-slate-700",
                    )}
                  >
                    No {activeTab} participants
                  </p>
                  <p
                    className={cn(
                      "text-xs",
                      isDarkMode ? "text-slate-400" : "text-slate-500",
                    )}
                  >
                    Check back later for activity
                  </p>
                </div>
              )}
            </div>
          )}

          {Object.values(groupedApplicants).every(
            (arr) => Array.isArray(arr) && arr.length === 0,
          ) &&
            activeTab === "all" && (
              <div className="text-center py-8">
                <div
                  className={cn(
                    "w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4",
                    isDarkMode ? "bg-slate-800" : "bg-slate-100",
                  )}
                >
                  <Users
                    className={cn(
                      "w-8 h-8",
                      isDarkMode ? "text-slate-600" : "text-slate-400",
                    )}
                  />
                </div>
                <p
                  className={cn(
                    "text-sm font-medium mb-2",
                    isDarkMode ? "text-white" : "text-slate-900",
                  )}
                >
                  No Activity Yet
                </p>
                <p
                  className={cn(
                    "text-xs max-w-[200px] mx-auto",
                    isDarkMode ? "text-slate-400" : "text-slate-500",
                  )}
                >
                  No participants have shown interest in this gig yet
                </p>
              </div>
            )}
        </div>
      </ScrollArea>

      {/* Footer with live stats */}
      <div
        className={cn(
          "p-3 border-t text-[10px] font-mono flex items-center justify-between",
          isDarkMode
            ? "border-slate-700/50 text-slate-500"
            : "border-slate-200/50 text-slate-400",
        )}
      >
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "w-1.5 h-1.5 rounded-full",
              feedMood === "busy"
                ? "bg-emerald-500 animate-pulse"
                : feedMood === "active"
                  ? "bg-amber-500 animate-pulse"
                  : "bg-slate-400",
            )}
          />
          <span>{feedMood.toUpperCase()} FEED</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Activity className="w-3 h-3" />
            {totalActive} active
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {lastUpdated.toLocaleTimeString()}
          </span>
        </div>
      </div>
    </div>
  );
};

// GigInfoCard Component
const GigInfoCard = ({ gig, formatDate, formatTime, isDarkMode }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <Card
      className={cn(
        "border shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300",
        isDarkMode
          ? "bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700"
          : "bg-gradient-to-br from-white to-slate-50 border-slate-200",
      )}
    >
      {/* Gradient Accent Bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 to-teal-500" />

      <CardContent className="p-4 md:p-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-start gap-4">
          {/* Logo/Avatar */}
          <div className="flex-shrink-0">
            <div className="relative">
              <Avatar className="w-16 h-16 md:w-20 md:h-20 rounded-xl border-4 border-white dark:border-slate-700 shadow-lg">
                <AvatarImage src={gig.logo} />
                <AvatarFallback className="bg-gradient-to-br from-emerald-600 to-teal-600 text-white text-xl md:text-xl font-bold">
                  {gig.title?.charAt(0)}
                </AvatarFallback>
              </Avatar>

              {/* Live Badge */}
              {gig.isActive && (
                <div className="absolute -top-2 -right-2">
                  <span className="flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white"></span>
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Title & Meta */}
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
              <div>
                <h2
                  className={cn(
                    "text-xl md:text-xl font-bold tracking-tight mb-2",
                    isDarkMode ? "text-white" : "text-slate-900",
                  )}
                >
                  {gig.title}
                </h2>

                <div className="flex flex-wrap gap-2">
                  {/* Location */}
                  <div
                    className={cn(
                      "flex items-center gap-1 text-xs md:text-sm px-2 py-1 rounded-full",
                      isDarkMode
                        ? "bg-slate-800 text-slate-300"
                        : "bg-slate-100 text-slate-600",
                    )}
                  >
                    <MapPin className="w-3 h-3" />
                    {gig.location || "Remote"}
                  </div>

                  {/* Date */}
                  <div
                    className={cn(
                      "flex items-center gap-1 text-xs md:text-sm px-2 py-1 rounded-full",
                      isDarkMode
                        ? "bg-slate-800 text-slate-300"
                        : "bg-slate-100 text-slate-600",
                    )}
                  >
                    <Calendar className="w-3 h-3" />
                    {formatDate(gig.date)}
                  </div>

                  {/* Time */}
                  {gig.time?.start && (
                    <div
                      className={cn(
                        "flex items-center gap-1 text-xs md:text-sm px-2 py-1 rounded-full",
                        isDarkMode
                          ? "bg-slate-800 text-slate-300"
                          : "bg-slate-100 text-slate-600",
                      )}
                    >
                      <Clock className="w-3 h-3" />
                      {gig.time.start} - {gig.time.end}
                    </div>
                  )}
                </div>
              </div>

              {/* Price Section */}
              <div className="flex flex-col items-start md:items-end">
                <div className="flex items-baseline gap-1">
                  <span
                    className={cn(
                      "text-xs font-medium",
                      isDarkMode ? "text-slate-400" : "text-slate-500",
                    )}
                  >
                    {gig.currency || "$"}
                  </span>
                  <span
                    className={cn(
                      "text-xl md:text-3xl font-bold",
                      isDarkMode ? "text-emerald-400" : "text-emerald-600",
                    )}
                  >
                    {gig.price?.toLocaleString()}
                  </span>
                </div>
                {gig.negotiable && (
                  <Badge
                    variant="outline"
                    className={cn(
                      "mt-1 border-emerald-500 text-emerald-600 dark:text-emerald-400 text-xs",
                    )}
                  >
                    Negotiable
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mt-6">
          <h3
            className={cn(
              "text-xs font-semibold uppercase tracking-wider mb-2",
              isDarkMode ? "text-slate-400" : "text-slate-500",
            )}
          >
            Description
          </h3>
          <p
            className={cn(
              "text-sm leading-relaxed whitespace-pre-line",
              isDarkMode ? "text-slate-300" : "text-slate-600",
            )}
          >
            {gig.description}
          </p>
        </div>

        {/* Tags */}
        {gig.tags && gig.tags.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex flex-wrap gap-2">
              {gig.tags.map((tag: string, i: number) => (
                <Badge
                  key={i}
                  variant="secondary"
                  className={cn(
                    "px-2 py-1 text-xs font-medium",
                    isDarkMode
                      ? "bg-slate-800 text-slate-300 border-slate-700"
                      : "bg-slate-100 text-slate-600 border-slate-200",
                  )}
                >
                  #{tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  </motion.div>
);

// PosterInfoCard Component
const PosterInfoCard = ({
  poster,
  canMessageUser,
  handleViewProfile,
  getTrustTierIcon,
  isDarkMode,
}: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay: 0.1 }}
  >
    <Card
      className={cn(
        "border shadow-lg overflow-hidden",
        isDarkMode
          ? "bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700"
          : "bg-gradient-to-br from-white to-slate-50 border-slate-200",
      )}
    >
      <CardContent className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3
            className={cn(
              "text-sm font-semibold flex items-center gap-2",
              isDarkMode ? "text-white" : "text-slate-900",
            )}
          >
            <Users2 className="w-4 h-4 text-emerald-500" />
            Gig Owner
          </h3>
          {poster.verifiedIdentity && (
            <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 text-xs">
              <CheckCircle className="w-3 h-3 mr-1" />
              Verified
            </Badge>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          {/* Avatar Section */}
          <div className="flex-shrink-0 text-center sm:text-left">
            <Avatar className="w-16 h-16 sm:w-20 sm:h-20 mx-auto sm:mx-0 border-4 border-white dark:border-slate-700 shadow-lg">
              <AvatarImage src={poster.picture} />
              <AvatarFallback className="bg-gradient-to-br from-emerald-600 to-teal-600 text-white text-lg sm:text-xl font-bold">
                {poster.firstname?.charAt(0) || poster.username?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="mt-2">
              <TrustStarsDisplay
                trustStars={poster.trustStars || 0}
                size="sm"
              />
            </div>
          </div>

          {/* Info Section */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4
                  className={cn(
                    "text-base sm:text-lg font-semibold",
                    isDarkMode ? "text-white" : "text-slate-900",
                  )}
                >
                  {poster.firstname || poster.username}
                </h4>
                {poster.city && (
                  <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
                    <MapPin className="w-3 h-3" />
                    {poster.city}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {canMessageUser(poster._id) && (
                  <ChatIcon
                    userId={poster._id}
                    size="sm"
                    variant="default"
                    showPulse
                  />
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewProfile(poster._id)}
                  className="gap-1 text-xs"
                >
                  <Eye className="w-3 h-3" />
                  Profile
                </Button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="mt-4 grid grid-cols-3 gap-2">
              <div
                className={cn(
                  "text-center p-2 rounded-lg",
                  isDarkMode ? "bg-slate-800" : "bg-slate-50",
                )}
              >
                <div
                  className={cn(
                    "text-base font-bold",
                    isDarkMode ? "text-white" : "text-slate-900",
                  )}
                >
                  {poster.completedGigsCount || 0}
                </div>
                <div
                  className={cn(
                    "text-[10px]",
                    isDarkMode ? "text-slate-400" : "text-slate-500",
                  )}
                >
                  Gigs
                </div>
              </div>
              <div
                className={cn(
                  "text-center p-2 rounded-lg",
                  isDarkMode ? "bg-slate-800" : "bg-slate-50",
                )}
              >
                <div
                  className={cn(
                    "text-base font-bold",
                    isDarkMode ? "text-white" : "text-slate-900",
                  )}
                >
                  {poster.followers?.length || 0}
                </div>
                <div
                  className={cn(
                    "text-[10px]",
                    isDarkMode ? "text-slate-400" : "text-slate-500",
                  )}
                >
                  Followers
                </div>
              </div>
              <div
                className={cn(
                  "text-center p-2 rounded-lg",
                  isDarkMode ? "bg-slate-800" : "bg-slate-50",
                )}
              >
                <div
                  className={cn(
                    "text-base font-bold",
                    isDarkMode ? "text-white" : "text-slate-900",
                  )}
                >
                  {new Date().getFullYear() -
                    new Date(poster._creationTime).getFullYear()}
                </div>
                <div
                  className={cn(
                    "text-[10px]",
                    isDarkMode ? "text-slate-400" : "text-slate-500",
                  )}
                >
                  Years
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

// RequirementsCard Component
const RequirementsCard = ({ requirements, isDarkMode }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay: 0.2 }}
  >
    <Card
      className={cn(
        "border shadow-lg",
        isDarkMode
          ? "bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700"
          : "bg-gradient-to-br from-white to-slate-50 border-slate-200",
      )}
    >
      <CardContent className="p-4 md:p-6">
        <h3
          className={cn(
            "text-sm font-semibold flex items-center gap-2 mb-4",
            isDarkMode ? "text-white" : "text-slate-900",
          )}
        >
          <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
            <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          Requirements
        </h3>

        <div className="space-y-2">
          {requirements.map((req: string, i: number) => (
            <div key={i} className="flex items-start gap-2 group">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                  {i + 1}
                </span>
              </div>
              <span
                className={cn(
                  "text-sm flex-1",
                  isDarkMode ? "text-slate-300" : "text-slate-600",
                )}
              >
                {req}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

// Then in your RoleCard component, use it:
const RoleCard = ({ role, index, isDarkMode, currentUser, onApply }: any) => {
  const isQualified = isUserQualifiedForRole(currentUser, role);

  return (
    <div
      className={cn(
        "p-4 rounded-xl border",
        isDarkMode
          ? "bg-slate-800/30 border-slate-700/50"
          : "bg-white/30 border-slate-200/50",
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <h4
          className={cn(
            "font-semibold text-sm",
            isDarkMode ? "text-white" : "text-slate-900",
          )}
        >
          {role.role}
        </h4>
        <Badge variant="outline" className="text-xs">
          {role.filledSlots}/{role.maxSlots}
        </Badge>
      </div>

      {role.description && (
        <p
          className={cn(
            "text-xs mb-3",
            isDarkMode ? "text-slate-400" : "text-slate-500",
          )}
        >
          {role.description}
        </p>
      )}

      {role.requiredSkills && role.requiredSkills.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {role.requiredSkills.slice(0, 3).map((skill: string, i: number) => (
            <Badge
              key={i}
              variant="outline"
              className="text-[10px] px-1.5 py-0"
            >
              {skill}
            </Badge>
          ))}
        </div>
      )}

      {/* Qualification indicator */}
      <div className="flex items-center gap-2 mb-3">
        <div
          className={cn(
            "w-2 h-2 rounded-full",
            isQualified ? "bg-emerald-500" : "bg-amber-500",
          )}
        />
        <span
          className={cn(
            "text-xs",
            isQualified ? "text-emerald-500" : "text-amber-500",
          )}
        >
          {isQualified ? "You qualify" : "Missing requirements"}
        </span>
      </div>

      <Button
        size="sm"
        onClick={onApply}
        disabled={!isQualified}
        className={cn(
          "w-full text-xs",
          isQualified
            ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600"
            : "opacity-50 cursor-not-allowed",
        )}
      >
        {isQualified ? "Apply Now" : "Not Qualified"}
      </Button>
    </div>
  );
};
// ============= MAIN COMPONENT =============
// Types
interface PageProps {
  params: Promise<{
    gigId: string;
  }>;
}
export default function GigDetailsPage({ params }: PageProps) {
  const { gigId } = React.use(params);

  const router = useRouter();
  const { colors, isDarkMode } = useThemeColors();
  const { user: currentUser } = useCurrentUser();
  const [activeTab, setActiveTab] = useState("all");
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<Id<"users"> | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [withdrawReason, setWithdrawReason] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showRoleDrawer, setShowRoleDrawer] = useState(false);
  const [showApplicantSidebar, setShowApplicantSidebar] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Mutations
  const removeInterestFromGig = useMutation(
    api.controllers.gigs.removeInterestFromGig,
  );

  // Fetch gig data
  const gig = useQuery(api.controllers.gigs.getGigById, {
    gigId: gigId as Id<"gigs">,
  });

  // Fetch ALL users that are involved in this gig
  const userIds = useMemo(() => {
    if (!gig) return [];

    const ids = new Set<Id<"users">>();

    // 1. Add poster (gig owner)
    ids.add(gig.postedBy);

    // 2. Add interested users
    gig.interestedUsers?.forEach((id) => ids.add(id as Id<"users">));

    // 3. Add applied users
    gig.appliedUsers?.forEach((id) => ids.add(id as Id<"users">));

    // 4. Add shortlisted users
    gig.shortlistedUsers?.forEach((item) =>
      ids.add(item.userId as Id<"users">),
    );

    // 5. Add booked user
    if (gig.bookedBy) ids.add(gig.bookedBy as Id<"users">);

    // 6. Add band role applicants
    gig.bandCategory?.forEach((role) => {
      role.applicants?.forEach((id) => ids.add(id as Id<"users">));
      role.bookedUsers?.forEach((id) => ids.add(id as Id<"users">));
    });

    // 7. Add band booking applicants
    gig.bookCount?.forEach((booking) => {
      ids.add(booking.appliedBy as Id<"users">);
      booking.performingMembers?.forEach((member) =>
        ids.add(member.userId as Id<"users">),
      );
    });

    return Array.from(ids);
  }, [gig]);

  // Fetch all users data
  const users = useQuery(api.controllers.user.getUsersByIds, {
    userIds: userIds,
  });

  // Create user map for easy lookup
  const userMap = useMemo(() => {
    if (!users) return new Map();
    const map = new Map<Id<"users">, any>();
    users.forEach((user: any) => map.set(user._id, user));
    return map;
  }, [users]);

  // Get selected user data
  const selectedUser = useMemo(() => {
    if (!selectedUserId) return null;
    return userMap.get(selectedUserId);
  }, [selectedUserId, userMap]);

  // Get poster data
  const poster = useMemo(() => {
    return gig?.postedBy ? userMap.get(gig.postedBy as Id<"users">) : null;
  }, [gig, userMap]);

  // Get user's own application status
  const userApplication = useMemo(() => {
    if (!currentUser?._id || !gig) return null;

    if (gig.postedBy === currentUser._id) {
      return { type: "poster", status: "owner" };
    }

    if (gig.interestedUsers?.includes(currentUser._id)) {
      return { type: "interested", status: "pending" };
    }

    if (gig.appliedUsers?.includes(currentUser._id)) {
      return { type: "applied", status: "pending" };
    }

    const shortlistedEntry = gig.shortlistedUsers?.find(
      (item: any) => item.userId === currentUser._id,
    );
    if (shortlistedEntry) {
      return { type: "shortlisted", status: "active" };
    }

    if (gig.bookedBy === currentUser._id) {
      return { type: "booked", status: "confirmed" };
    }

    if (gig.bandCategory) {
      for (const role of gig.bandCategory) {
        if (role.applicants?.includes(currentUser._id)) {
          return { type: "band-applicant", status: "pending", role: role.role };
        }
        if (role.bookedUsers?.includes(currentUser._id)) {
          return { type: "band-booked", status: "booked", role: role.role };
        }
      }
    }

    if (gig.bookCount) {
      for (const booking of gig.bookCount) {
        if (booking.appliedBy === currentUser._id) {
          return { type: "band-booking", status: "applied" };
        }
      }
    }

    return null;
  }, [gig, currentUser]);

  // Get user's role in this gig
  const getUserRoleInGig = (userId: Id<"users">) => {
    if (!gig) return null;

    if (gig.postedBy === userId) return "poster";
    if (gig.bookedBy === userId) return "booked";
    if (gig.interestedUsers?.includes(userId)) return "interested";
    if (gig.appliedUsers?.includes(userId)) return "applied";

    const shortlisted = gig.shortlistedUsers?.find(
      (item) => item.userId === userId,
    );
    if (shortlisted) return "shortlisted";

    for (const role of gig.bandCategory || []) {
      if (role.applicants?.includes(userId)) return "band-applicant";
      if (role.bookedUsers?.includes(userId)) return "band-booked";
    }

    for (const booking of gig.bookCount || []) {
      if (booking.appliedBy === userId) return "band-booking";
      if (booking.performingMembers?.some((m) => m.userId === userId))
        return "band-member";
    }

    return null;
  };

  // Get status badge for a user
  const getUserStatusBadge = (userId: Id<"users">) => {
    const role = getUserRoleInGig(userId);

    const styles = {
      poster: {
        bg: isDarkMode ? "bg-indigo-900/30" : "bg-indigo-50",
        text: isDarkMode ? "text-indigo-300" : "text-indigo-700",
        border: isDarkMode ? "border-indigo-800" : "border-indigo-200",
        icon: <Crown className="w-3 h-3 mr-1" />,
        label: "Gig Owner",
      },
      booked: {
        bg: isDarkMode ? "bg-emerald-900/30" : "bg-emerald-50",
        text: isDarkMode ? "text-emerald-300" : "text-emerald-700",
        border: isDarkMode ? "border-emerald-800" : "border-emerald-200",
        icon: <CheckCircle className="w-3 h-3 mr-1" />,
        label: "Booked",
      },
      shortlisted: {
        bg: isDarkMode ? "bg-emerald-900/30" : "bg-emerald-50",
        text: isDarkMode ? "text-emerald-300" : "text-emerald-700",
        border: isDarkMode ? "border-emerald-800" : "border-emerald-200",
        icon: <Star className="w-3 h-3 mr-1" />,
        label: "Shortlisted",
      },
      interested: {
        bg: isDarkMode ? "bg-sky-900/30" : "bg-sky-50",
        text: isDarkMode ? "text-sky-300" : "text-sky-700",
        border: isDarkMode ? "border-sky-800" : "border-sky-200",
        icon: <Heart className="w-3 h-3 mr-1" />,
        label: "Interested",
      },
      applied: {
        bg: isDarkMode ? "bg-amber-900/30" : "bg-amber-50",
        text: isDarkMode ? "text-amber-300" : "text-amber-700",
        border: isDarkMode ? "border-amber-800" : "border-amber-200",
        icon: <Briefcase className="w-3 h-3 mr-1" />,
        label: "Applied",
      },
      "band-applicant": {
        bg: isDarkMode ? "bg-amber-900/30" : "bg-amber-50",
        text: isDarkMode ? "text-amber-300" : "text-amber-700",
        border: isDarkMode ? "border-amber-800" : "border-amber-200",
        icon: <Briefcase className="w-3 h-3 mr-1" />,
        label: "Applied",
      },
      "band-booking": {
        bg: isDarkMode ? "bg-amber-900/30" : "bg-amber-50",
        text: isDarkMode ? "text-amber-300" : "text-amber-700",
        border: isDarkMode ? "border-amber-800" : "border-amber-200",
        icon: <Users2 className="w-3 h-3 mr-1" />,
        label: "Band Applied",
      },
      "band-booked": {
        bg: isDarkMode ? "bg-emerald-900/30" : "bg-emerald-50",
        text: isDarkMode ? "text-emerald-300" : "text-emerald-700",
        border: isDarkMode ? "border-emerald-800" : "border-emerald-200",
        icon: <CheckCircle className="w-3 h-3 mr-1" />,
        label: "Booked",
      },
      "band-member": {
        bg: isDarkMode ? "bg-sky-900/30" : "bg-sky-50",
        text: isDarkMode ? "text-sky-300" : "text-sky-700",
        border: isDarkMode ? "border-sky-800" : "border-sky-200",
        icon: <Users className="w-3 h-3 mr-1" />,
        label: "Band Member",
      },
    };

    const style = styles[role as keyof typeof styles];
    if (!style) return null;

    return {
      ...style,
      className: cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border",
        style.bg,
        style.text,
        style.border,
      ),
    };
  };

  // Check if user can message another user
  const canMessageUser = (targetUserId: Id<"users">) => {
    if (!currentUser?._id) return false;
    if (targetUserId === currentUser._id) return false;

    if (targetUserId === gig?.postedBy) return true;
    if (gig?.postedBy === currentUser._id) return true;

    return false;
  };

  // Format helpers
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (timeStr: string) => {
    return new Date(`2000-01-01T${timeStr}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const formatRelativeTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return "just now";
  };

  // Get trust tier icon
  const getTrustTierIcon = (tier?: string) => {
    switch (tier) {
      case "elite":
        return <Crown className="w-4 h-4 text-amber-500" />;
      case "trusted":
        return <Medal className="w-4 h-4 text-sky-500" />;
      case "verified":
        return <BadgeCheck className="w-4 h-4 text-emerald-500" />;
      case "basic":
        return <Shield className="w-4 h-4 text-gray-400" />;
      default:
        return null;
    }
  };

  // Get role icon
  const getRoleIcon = (roleType?: string) => {
    switch (roleType?.toLowerCase()) {
      case "vocalist":
        return <Mic className="w-4 h-4 text-rose-500" />;
      case "dj":
        return <Volume2 className="w-4 h-4 text-violet-500" />;
      case "mc":
        return <Mic className="w-4 h-4 text-amber-500" />;
      case "instrumentalist":
        return <Music className="w-4 h-4 text-sky-500" />;
      default:
        return <UserRound className="w-4 h-4 text-gray-400" />;
    }
  };

  // Handle view profile
  const handleViewProfile = (userId: Id<"users">) => {
    setSelectedUserId(userId);
    setShowProfileDialog(true);
  };

  // Handle withdraw
  const handleWithdraw = async () => {
    if (!currentUser?._id || !gig) return;

    setLoading(true);
    try {
      const isBooked =
        userApplication?.type === "booked" ||
        userApplication?.type === "band-booked";

      await removeInterestFromGig({
        gigId: gig._id,
        userId: currentUser._id,
        reason: withdrawReason || undefined,
        isFromBooked: isBooked,
      });

      toast.success(isBooked ? "Booking cancelled" : "Application withdrawn");

      setShowWithdrawDialog(false);
      setWithdrawReason("");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to withdraw");
    } finally {
      setLoading(false);
    }
  };

  // Get application status badge for current user
  const getMyStatusBadge = () => {
    if (!userApplication) return null;

    const badges = {
      poster: {
        gradient: "from-indigo-600 via-purple-600 to-pink-600",
        icon: Crown,
        label: "Gig Owner",
      },
      interested: {
        gradient: "from-sky-600 via-blue-600 to-indigo-600",
        icon: Heart,
        label: "Interested",
      },
      applied: {
        gradient: "from-amber-600 via-orange-600 to-red-600",
        icon: Briefcase,
        label: "Applied",
      },
      shortlisted: {
        gradient: "from-emerald-600 via-teal-600 to-cyan-600",
        icon: Star,
        label: "Shortlisted ✨",
      },
      booked: {
        gradient: "from-emerald-600 via-teal-600 to-cyan-600",
        icon: CheckCircle,
        label: "Booked ✓",
      },
    };

    const badge = badges[userApplication.type as keyof typeof badges];
    if (!badge) return null;

    const Icon = badge.icon;

    return (
      <div className="relative group">
        <div
          className={cn(
            "absolute -inset-0.5 rounded-full opacity-75 group-hover:opacity-100",
            "bg-gradient-to-r blur transition duration-500 group-hover:duration-200",
            badge.gradient,
          )}
        />
        <Badge
          className={cn(
            "relative px-3 py-1.5 rounded-full border-0",
            "bg-slate-900 dark:bg-slate-950",
            "text-white",
            "flex items-center gap-1.5",
            "shadow-xl text-xs",
          )}
        >
          <Icon className="w-3.5 h-3.5" />
          <span className="font-medium">
            {badge.label}
            {userApplication.role && ` • ${userApplication.role}`}
          </span>
        </Badge>
      </div>
    );
  };

  // Group applicants by type
  const groupedApplicants = useMemo(() => {
    if (!gig || !userMap)
      return {
        interested: [],
        applied: [],
        shortlisted: [],
        booked: [],
        bandApplicants: [],
      };

    const groups = {
      interested: [] as any[],
      applied: [] as any[],
      shortlisted: [] as any[],
      booked: [] as any[],
      bandApplicants: [] as any[],
    };

    gig.interestedUsers?.forEach((id) => {
      const user = userMap.get(id as Id<"users">);
      if (user) groups.interested.push(user);
    });

    gig.appliedUsers?.forEach((id) => {
      const user = userMap.get(id as Id<"users">);
      if (user) groups.applied.push(user);
    });

    gig.shortlistedUsers?.forEach((item) => {
      const user = userMap.get(item.userId as Id<"users">);
      if (user) groups.shortlisted.push(user);
    });

    if (gig.bookedBy) {
      const user = userMap.get(gig.bookedBy as Id<"users">);
      if (user) groups.booked.push(user);
    }

    gig.bandCategory?.forEach((role) => {
      role.applicants?.forEach((id) => {
        const user = userMap.get(id as Id<"users">);
        if (user) groups.bandApplicants.push(user);
      });
    });

    Object.keys(groups).forEach((key) => {
      groups[key as keyof typeof groups] = groups[
        key as keyof typeof groups
      ].filter((user) => user._id !== currentUser?._id);
    });

    return groups;
  }, [gig, userMap, currentUser]);

  // Filtered applicants based on search
  const filterUsers = (users: any[]) => {
    if (!searchQuery) return users;
    const query = searchQuery.toLowerCase();
    return users.filter(
      (user) =>
        user.firstname?.toLowerCase().includes(query) ||
        user.username?.toLowerCase().includes(query) ||
        user.roleType?.toLowerCase().includes(query) ||
        user.city?.toLowerCase().includes(query),
    );
  };

  // Inside the component, add these states and effects
  const [priceChanges, setPriceChanges] = useState<Record<string, number>>({});
  const [tickerData, setTickerData] = useState<
    Record<string, { volume: number; change: number }>
  >({});
  const [marketTrend, setMarketTrend] = useState<"bull" | "bear" | "neutral">(
    "neutral",
  );

  // Simulate market movements
  useEffect(() => {
    const interval = setInterval(() => {
      // Random price movements for each user
      const newChanges: Record<string, number> = {};
      Object.values(groupedApplicants).forEach((category: any) => {
        category.forEach((user: any) => {
          newChanges[user._id] = Math.random() * 4 - 2; // -2 to +2 change
        });
      });
      setPriceChanges(newChanges);

      // Update ticker data for categories
      const newTicker: Record<string, { volume: number; change: number }> = {};
      // Fix 1: Cast the key as keyof the type
      Object.keys(groupedApplicants).forEach((key) => {
        const typedKey = key as keyof typeof groupedApplicants;
        const users = groupedApplicants[typedKey] || [];
        const volume = users.length * (10 + Math.floor(Math.random() * 90));
        const change = Number((Math.random() * 10 - 5).toFixed(2));
        newTicker[key] = { volume, change };
      });
      setTickerData(newTicker);

      // Random market trend
      const trends = ["bull", "bear", "neutral"] as const;
      setMarketTrend(trends[Math.floor(Math.random() * trends.length)]);
    }, 3000);

    return () => clearInterval(interval);
  }, [groupedApplicants]);

  // Add this before the return
  const getTrendIcon = (change: number) => {
    if (change > 0.5)
      return <TrendingUp className="w-3 h-3 text-emerald-500" />;
    if (change < -0.5)
      return <TrendingDown className="w-3 h-3 text-rose-500" />;
    return <Minus className="w-3 h-3 text-slate-400" />;
  };

  const getTrendColor = (change: number) => {
    if (change > 0.5) return "text-emerald-500";
    if (change < -0.5) return "text-rose-500";
    return "text-slate-400";
  };
  const canWithdraw =
    userApplication &&
    ["interested", "applied", "band-applicant", "band-booking"].includes(
      userApplication.type,
    );

  // Loading state
  if (!gig || !users) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <div className="max-w-7xl mx-auto space-y-4 w-full">
          <Skeleton className="h-8 w-24" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Skeleton className="h-96 rounded-xl lg:col-span-1" />
            <Skeleton className="h-96 rounded-xl lg:col-span-2" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "min-h-screen relative",
        isDarkMode
          ? "bg-gradient-to-br from-slate-950/90 via-slate-900/80 to-slate-950/90"
          : "bg-gradient-to-br from-slate-50/80 via-white/70 to-slate-50/80",
      )}
    >
      {/* Subtle background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={cn(
            "absolute top-0 left-0 right-0 h-96 bg-gradient-to-b",
            isDarkMode
              ? "from-indigo-500/5 via-transparent to-transparent"
              : "from-amber-500/5 via-transparent to-transparent",
          )}
        />
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => router.back()}
            className={cn(
              "p-2 rounded-xl transition-all hover:scale-105",
              isDarkMode
                ? "text-slate-400 hover:text-white hover:bg-slate-800/50"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-100/50",
            )}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <div className="hidden md:block">
              {getMyStatusBadge && getMyStatusBadge()}
            </div>

            {/* Mobile menu buttons */}
            <button
              onClick={() => setShowApplicantSidebar(true)}
              className={cn(
                "md:hidden p-2 rounded-xl",
                isDarkMode
                  ? "bg-slate-800/50 text-slate-300"
                  : "bg-slate-100/50 text-slate-600",
              )}
            >
              <Users className="w-5 h-5" />
            </button>

            {gig.bandCategory && gig.bandCategory.length > 0 && (
              <button
                onClick={() => setShowRoleDrawer(true)}
                className={cn(
                  "md:hidden p-2 rounded-xl",
                  isDarkMode
                    ? "bg-slate-800/50 text-slate-300"
                    : "bg-slate-100/50 text-slate-600",
                )}
              >
                <Music className="w-5 h-5" />
              </button>
            )}

            {/* Share Button */}
            <button
              className={cn(
                "hidden md:flex p-2 rounded-xl",
                isDarkMode
                  ? "text-slate-400 hover:text-white hover:bg-slate-800/50"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-100/50",
              )}
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Gig Title - Mobile friendly */}
        <div className="mb-6">
          <h1
            className={cn(
              "text-xl sm:text-xl md:text-3xl font-bold mb-2",
              isDarkMode ? "text-white" : "text-slate-900",
            )}
          >
            {gig.title}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span
              className={cn(
                "px-2 py-1 rounded-lg text-xs",
                isDarkMode
                  ? "bg-slate-800/50 text-slate-300"
                  : "bg-slate-100/50 text-slate-600",
              )}
            >
              {gig.bussinesscat || "Gig"}
            </span>
            <span
              className={cn(
                "flex items-center gap-1 text-xs",
                isDarkMode ? "text-slate-400" : "text-slate-500",
              )}
            >
              <MapPin className="w-3.5 h-3.5" />
              {gig.location?.split(",")[0] || "Remote"}
            </span>
            <span
              className={cn(
                "flex items-center gap-1 text-xs",
                isDarkMode ? "text-slate-400" : "text-slate-500",
              )}
            >
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(gig.date)}
            </span>
          </div>
        </div>

        {/* Desktop Layout - Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* LEFT COLUMN - Desktop Applicant Sidebar */}
          <div className="hidden md:block md:col-span-1">
            <Card
              className={cn(
                "border shadow-sm",
                isDarkMode
                  ? "bg-slate-900/50 border-slate-800"
                  : "bg-white border-slate-200",
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3
                    className={cn(
                      "font-semibold text-sm",
                      isDarkMode ? "text-white" : "text-slate-900",
                    )}
                  >
                    All Applicants
                  </h3>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs",
                      isDarkMode
                        ? "border-slate-700 text-slate-300"
                        : "border-slate-200 text-slate-600",
                    )}
                  >
                    {userIds.length - 1} total
                  </Badge>
                </div>

                <ApplicantSidebar
                  groupedApplicants={groupedApplicants}
                  filterUsers={filterUsers}
                  getUserStatusBadge={getUserStatusBadge}
                  handleViewProfile={handleViewProfile}
                  canMessageUser={canMessageUser}
                  isDarkMode={isDarkMode}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                />
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN - Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Gig Info Card */}
            <GigInfoCard
              gig={gig}
              formatDate={formatDate}
              formatTime={formatTime}
              isDarkMode={isDarkMode}
            />

            {/* Poster Info Card - Desktop */}
            {poster && (
              <PosterInfoCard
                poster={poster}
                canMessageUser={canMessageUser}
                handleViewProfile={handleViewProfile}
                getTrustTierIcon={getTrustTierIcon}
                isDarkMode={isDarkMode}
              />
            )}

            {/* Requirements */}
            {gig.requirements && gig.requirements.length > 0 && (
              <RequirementsCard
                requirements={gig.requirements}
                isDarkMode={isDarkMode}
              />
            )}
          </div>
        </div>

        {/* Applicant Stats Bar - Mobile */}
        <div className="md:hidden mt-4 flex items-center gap-4 overflow-x-auto pb-2 scrollbar-hide">
          <div className="flex items-center gap-1.5 text-xs shrink-0">
            <Heart className="w-3.5 h-3.5 text-rose-500" />
            <span className={isDarkMode ? "text-slate-300" : "text-slate-700"}>
              {groupedApplicants?.interested?.length || 0}
            </span>
            <span className={isDarkMode ? "text-slate-500" : "text-slate-400"}>
              Interested
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs shrink-0">
            <Briefcase className="w-3.5 h-3.5 text-amber-500" />
            <span className={isDarkMode ? "text-slate-300" : "text-slate-700"}>
              {groupedApplicants?.applied?.length || 0}
            </span>
            <span className={isDarkMode ? "text-slate-500" : "text-slate-400"}>
              Applied
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs shrink-0">
            <Star className="w-3.5 h-3.5 text-emerald-500" />
            <span className={isDarkMode ? "text-slate-300" : "text-slate-700"}>
              {groupedApplicants?.shortlisted?.length || 0}
            </span>
            <span className={isDarkMode ? "text-slate-500" : "text-slate-400"}>
              Shortlisted
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs shrink-0">
            <CheckCircle className="w-3.5 h-3.5 text-purple-500" />
            <span className={isDarkMode ? "text-slate-300" : "text-slate-700"}>
              {groupedApplicants?.booked?.length || 0}
            </span>
            <span className={isDarkMode ? "text-slate-500" : "text-slate-400"}>
              Booked
            </span>
          </div>
        </div>

        {/* Bottom Action Bar - Mobile */}
        <div
          className={cn(
            "fixed bottom-0 left-0 right-0 z-30 md:hidden",
            "backdrop-blur-xl border-t",
            isDarkMode
              ? "bg-slate-900/80 border-slate-800/50"
              : "bg-white/80 border-slate-200/50",
          )}
        >
          <div className="flex items-center justify-around p-3">
            <button
              onClick={() => setShowApplicantSidebar(true)}
              className="flex flex-col items-center gap-1"
            >
              <Users className="w-5 h-5" />
              <span className="text-[10px]">The Network</span>
            </button>
            {gig.bandCategory && gig.bandCategory.length > 0 && (
              <button
                onClick={() => setShowRoleDrawer(true)}
                className="flex flex-col items-center gap-1"
              >
                <Music className="w-5 h-5" />
                <span className="text-[10px]">Roles</span>
              </button>
            )}
            {canWithdraw && (
              <button
                onClick={() => setShowWithdrawDialog(true)}
                className="flex flex-col items-center gap-1 text-rose-500"
              >
                <XCircle className="w-5 h-5" />
                <span className="text-[10px]">Withdraw</span>
              </button>
            )}
            <button className="flex flex-col items-center gap-1">
              <Share2 className="w-5 h-5" />
              <span className="text-[10px]">Share</span>
            </button>
          </div>
        </div>

        {/* Applicant Sidebar Drawer - Mobile */}
        <AnimatePresence>
          {showApplicantSidebar && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowApplicantSidebar(false)}
                className="fixed inset-0 bg-black/40 z-40 md:hidden"
              />
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25 }}
                className={cn(
                  "fixed left-0 top-0 bottom-0 w-[85%] max-w-sm z-50 md:hidden",
                  "backdrop-blur-xl border-r",
                  isDarkMode
                    ? "bg-slate-900/95 border-slate-800/50"
                    : "bg-white/95 border-slate-200/50",
                )}
              >
                <div className="p-4 h-full overflow-y-auto">
                  <div className="flex items-center justify-between mb-4">
                    <h3
                      className={cn(
                        "font-semibold text-sm",
                        isDarkMode ? "text-white" : "text-slate-900",
                      )}
                    >
                      Applicants
                    </h3>
                    <button
                      onClick={() => setShowApplicantSidebar(false)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <ApplicantSidebar
                    groupedApplicants={groupedApplicants}
                    filterUsers={filterUsers}
                    getUserStatusBadge={getUserStatusBadge}
                    handleViewProfile={handleViewProfile}
                    canMessageUser={canMessageUser}
                    isDarkMode={isDarkMode}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    isMobile={true}
                  />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Role Drawer - Mobile */}
        <AnimatePresence>
          {showRoleDrawer && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowRoleDrawer(false)}
                className="fixed inset-0 bg-black/40 z-40 md:hidden"
              />
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25 }}
                className={cn(
                  "fixed left-0 right-0 bottom-0 z-50 md:hidden",
                  "backdrop-blur-xl border-t rounded-t-3xl",
                  isDarkMode
                    ? "bg-slate-900/95 border-slate-800/50"
                    : "bg-white/95 border-slate-200/50",
                )}
              >
                <div className="p-4 max-h-[80vh] overflow-y-auto">
                  <div className="flex items-center justify-between mb-4">
                    <h3
                      className={cn(
                        "font-semibold text-sm",
                        isDarkMode ? "text-white" : "text-slate-900",
                      )}
                    >
                      Band Roles
                    </h3>
                    <button
                      onClick={() => setShowRoleDrawer(false)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  {gig.bandCategory && gig.bandCategory.length > 0 ? (
                    <div className="space-y-3">
                      {gig.bandCategory.map((role, index) => (
                        <RoleCard
                          key={index}
                          role={role}
                          index={index}
                          isDarkMode={isDarkMode}
                          currentUser={currentUser}
                          onApply={() => {
                            // Handle role application
                            setShowRoleDrawer(false);
                          }}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-slate-500 py-8 text-sm">
                      No band roles available
                    </p>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Add bottom padding for mobile nav */}
        <div className="h-16 md:hidden" />
      </div>

      {/* Profile Dialog */}
      <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
        <DialogContent
          className={cn(
            "sm:max-w-md",
            isDarkMode
              ? "bg-slate-900 border-slate-800"
              : "bg-white border-slate-200",
          )}
        >
          {selectedUser && (
            <>
              <DialogHeader>
                <DialogTitle
                  className={isDarkMode ? "text-white" : "text-slate-900"}
                >
                  User Profile
                </DialogTitle>
                <DialogDescription
                  className={isDarkMode ? "text-slate-400" : "text-slate-500"}
                >
                  {selectedUser.firstname || selectedUser.username}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                <div className="flex items-center gap-3">
                  <Avatar className="w-16 h-16 border-2 border-slate-200 dark:border-slate-700">
                    <AvatarImage src={selectedUser.picture} />
                    <AvatarFallback
                      className={cn(
                        "bg-gradient-to-br from-slate-700 to-slate-800 text-white text-xl",
                        isDarkMode
                          ? "from-slate-700 to-slate-800"
                          : "from-slate-200 to-slate-300",
                      )}
                    >
                      {selectedUser.firstname?.charAt(0) ||
                        selectedUser.username?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  <div>
                    <h3
                      className={cn(
                        "font-semibold text-lg",
                        isDarkMode ? "text-white" : "text-slate-900",
                      )}
                    >
                      {selectedUser.firstname || selectedUser.username}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <TrustStarsDisplay
                        trustStars={selectedUser.trustStars || 0}
                        size="sm"
                      />
                      {selectedUser.verifiedIdentity && (
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                      )}
                      {getTrustTierIcon(selectedUser.trustTier)}
                    </div>
                  </div>
                </div>

                <Separator
                  className={isDarkMode ? "bg-slate-800" : "bg-slate-200"}
                />

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div
                      className={cn(
                        "text-base font-semibold",
                        isDarkMode ? "text-white" : "text-slate-900",
                      )}
                    >
                      {selectedUser.completedGigsCount || 0}
                    </div>
                    <div
                      className={
                        isDarkMode ? "text-slate-400" : "text-slate-500"
                      }
                    >
                      Gigs
                    </div>
                  </div>
                  <div>
                    <div
                      className={cn(
                        "text-base font-semibold",
                        isDarkMode ? "text-white" : "text-slate-900",
                      )}
                    >
                      {selectedUser.followers?.length || 0}
                    </div>
                    <div
                      className={
                        isDarkMode ? "text-slate-400" : "text-slate-500"
                      }
                    >
                      Followers
                    </div>
                  </div>
                  <div>
                    <div
                      className={cn(
                        "text-base font-semibold",
                        isDarkMode ? "text-white" : "text-slate-900",
                      )}
                    >
                      {selectedUser.avgRating?.toFixed(1) || "0.0"}
                    </div>
                    <div
                      className={
                        isDarkMode ? "text-slate-400" : "text-slate-500"
                      }
                    >
                      Rating
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  {selectedUser.roleType && (
                    <div
                      className={cn(
                        "flex items-center gap-2 text-sm",
                        isDarkMode ? "text-slate-300" : "text-slate-600",
                      )}
                    >
                      {getRoleIcon(selectedUser.roleType)}
                      <span className="capitalize">
                        {selectedUser.roleType}
                      </span>
                    </div>
                  )}
                  {selectedUser.city && (
                    <div
                      className={cn(
                        "flex items-center gap-2 text-sm",
                        isDarkMode ? "text-slate-300" : "text-slate-600",
                      )}
                    >
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span>{selectedUser.city}</span>
                    </div>
                  )}
                  {selectedUser.instrument && (
                    <div
                      className={cn(
                        "flex items-center gap-2 text-sm",
                        isDarkMode ? "text-slate-300" : "text-slate-600",
                      )}
                    >
                      <Music className="w-4 h-4 text-slate-400" />
                      <span>{selectedUser.instrument}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button
                    className="flex-1 text-sm"
                    onClick={() => {
                      setShowProfileDialog(false);
                      router.push(`/profile/${selectedUser._id}`);
                    }}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Full Profile
                  </Button>
                  {canMessageUser(selectedUser._id) && (
                    <ChatIcon
                      userId={selectedUser._id}
                      size="md"
                      variant="default"
                      className="flex-1"
                    />
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Withdraw Dialog */}
      <Dialog open={showWithdrawDialog} onOpenChange={setShowWithdrawDialog}>
        <DialogContent
          className={cn(
            "sm:max-w-md",
            isDarkMode
              ? "bg-slate-900 border-slate-800"
              : "bg-white border-slate-200",
          )}
        >
          <DialogHeader>
            <DialogTitle
              className={isDarkMode ? "text-white" : "text-slate-900"}
            >
              Withdraw Application
            </DialogTitle>
            <DialogDescription
              className={isDarkMode ? "text-slate-400" : "text-slate-500"}
            >
              Are you sure you want to withdraw your application?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <Textarea
              placeholder="Reason (optional)"
              value={withdrawReason}
              onChange={(e) => setWithdrawReason(e.target.value)}
              rows={3}
              className={cn(
                isDarkMode
                  ? "bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                  : "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400",
              )}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowWithdrawDialog(false)}
              className={cn(
                isDarkMode
                  ? "border-slate-700 text-slate-300 hover:bg-slate-800"
                  : "",
              )}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleWithdraw}
              disabled={loading}
              className="text-sm"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Withdraw
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
