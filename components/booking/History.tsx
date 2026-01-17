// components/gigs/tabs/HistoryTab.tsx
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Bookmark,
  ShoppingBag,
  XCircle,
  Eye,
  User,
  Clock,
  MessageSquare,
  CheckCircle,
  Star,
  Music,
  Sparkles,
  History as HistoryIcon,
  TrendingUp,
  UserPlus,
  UserMinus,
  DollarSign,
  ThumbsUp,
  ThumbsDown,
  Download,
  Filter,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useThemeColors } from "@/hooks/useTheme";
import { Skeleton } from "../ui/skeleton";

interface HistoryTabProps {
  selectedGigData: any;
  formatTime: (timestamp: number) => string;
  getStatusColor: (status: string) => string;
}

export const HistoryTab: React.FC<HistoryTabProps> = ({
  selectedGigData,
  formatTime,
  getStatusColor,
}) => {
  const { colors, isDarkMode, mounted } = useThemeColors();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
      },
    },
  };
  const getActionIcon = (entry: any) => {
    const status = entry.status?.toLowerCase();
    switch (status) {
      case "shortlisted":
        return <Bookmark className="w-4 h-4 text-green-500" />;
      case "booked":
        return <ShoppingBag className="w-4 h-4 text-purple-500" />;
      case "rejected":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "viewed":
        return <Eye className="w-4 h-4 text-blue-500" />;
      case "approved":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "rated":
        return <Star className="w-4 h-4 text-yellow-500" />;
      case "messaged":
        return <MessageSquare className="w-4 h-4 text-cyan-500" />;
      case "hired":
        return <UserPlus className="w-4 h-4 text-emerald-500" />;
      case "removed":
        return <UserMinus className="w-4 h-4 text-rose-500" />;
      case "price_set":
        return <DollarSign className="w-4 h-4 text-amber-500" />;
      case "recommended":
        return <ThumbsUp className="w-4 h-4 text-sky-500" />;
      case "not_recommended":
        return <ThumbsDown className="w-4 h-4 text-orange-500" />;
      case "promoted":
        return <TrendingUp className="w-4 h-4 text-violet-500" />;
      default:
        return <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />;
    }
  };

  const getActionBgColor = (entry: any) => {
    const status = entry.status?.toLowerCase();
    if (isDarkMode) {
      switch (status) {
        case "shortlisted":
          return "bg-green-900/30 border-green-800";
        case "booked":
          return "bg-purple-900/30 border-purple-800";
        case "rejected":
          return "bg-red-900/30 border-red-800";
        case "viewed":
          return "bg-blue-900/30 border-blue-800";
        case "approved":
          return "bg-emerald-900/30 border-emerald-800";
        case "rated":
          return "bg-amber-900/30 border-amber-800";
        default:
          return "bg-gray-800 border-gray-700";
      }
    } else {
      switch (status) {
        case "shortlisted":
          return "bg-green-50 border-green-200";
        case "booked":
          return "bg-purple-50 border-purple-200";
        case "rejected":
          return "bg-red-50 border-red-200";
        case "viewed":
          return "bg-blue-50 border-blue-200";
        case "approved":
          return "bg-emerald-50 border-emerald-200";
        case "rated":
          return "bg-amber-50 border-amber-200";
        default:
          return "bg-gray-50 border-gray-200";
      }
    }
  };

  const formatRelativeTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return formatTime(timestamp);
  };

  if (!mounted) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-3 items-start">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const historyEntries = selectedGigData.gig.bookingHistory
    ? [...selectedGigData.gig.bookingHistory].sort(
        (a: any, b: any) => b.timestamp - a.timestamp
      )
    : [];

  if (historyEntries.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className={cn(
          "text-center py-12 rounded-xl border-2 border-dashed",
          isDarkMode
            ? "bg-gray-900/50 border-gray-700"
            : "bg-gray-50 border-gray-200"
        )}
      >
        <div className="relative inline-block mb-4">
          <div
            className={cn(
              "w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4",
              isDarkMode
                ? "bg-gradient-to-br from-gray-800 to-gray-900"
                : "bg-gradient-to-br from-gray-100 to-gray-200"
            )}
          >
            <HistoryIcon className="w-10 h-10 text-gray-400" />
          </div>
          <div className="absolute -top-2 -right-2 w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center animate-pulse shadow-lg">
            <Clock className="w-5 h-5 text-white" />
          </div>
        </div>
        <h3 className={cn("text-xl font-bold mb-2", colors.text)}>
          No Activity Yet
        </h3>
        <p className={cn("max-w-md mx-auto mb-6", colors.textMuted)}>
          Actions you take on applicants will appear here in a timeline
        </p>
        <Button
          variant="outline"
          className={cn(
            "border-2 hover:scale-105 transition-transform",
            isDarkMode
              ? "border-gray-700 hover:bg-gray-800"
              : "border-gray-300 hover:bg-gray-100"
          )}
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Start Your First Action
        </Button>
      </motion.div>
    );
  }

  // Calculate stats for summary
  const stats = {
    total: historyEntries.length,
    booked: historyEntries.filter((e: any) => e.status === "booked").length,
    shortlisted: historyEntries.filter((e: any) => e.status === "shortlisted")
      .length,
    viewed: historyEntries.filter((e: any) => e.status === "viewed").length,
  };

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="space-y-4">
        <div>
          <h2 className={cn("text-2xl font-bold mb-1", colors.text)}>
            Activity Timeline
          </h2>
          <p className={cn("text-sm mb-4", colors.textMuted)}>
            {stats.total} action{stats.total !== 1 ? "s" : ""} taken on this gig
          </p>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div
            className={cn(
              "p-3 rounded-lg border text-center",
              isDarkMode
                ? "bg-gray-800/50 border-gray-700"
                : "bg-gray-50 border-gray-200"
            )}
          >
            <p className={cn("text-2xl font-bold mb-1", colors.text)}>
              {stats.total}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
          </div>
          <div
            className={cn(
              "p-3 rounded-lg border text-center",
              isDarkMode
                ? "bg-green-900/20 border-green-800"
                : "bg-green-50 border-green-200"
            )}
          >
            <p className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
              {stats.booked}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Booked</p>
          </div>
          <div
            className={cn(
              "p-3 rounded-lg border text-center",
              isDarkMode
                ? "bg-blue-900/20 border-blue-800"
                : "bg-blue-50 border-blue-200"
            )}
          >
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
              {stats.shortlisted}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Shortlisted
            </p>
          </div>
          <div
            className={cn(
              "p-3 rounded-lg border text-center",
              isDarkMode
                ? "bg-gray-800/50 border-gray-700"
                : "bg-gray-50 border-gray-200"
            )}
          >
            <p className="text-2xl font-bold mb-1 text-amber-600 dark:text-amber-400">
              {stats.viewed}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Viewed</p>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "gap-2",
            isDarkMode
              ? "border-gray-700 hover:bg-gray-800"
              : "border-gray-300 hover:bg-gray-100"
          )}
          onClick={() => {
            const data = JSON.stringify(historyEntries, null, 2);
            const blob = new Blob([data], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `history-${selectedGigData.gig._id}.json`;
            a.click();
            URL.revokeObjectURL(url);
          }}
        >
          <Download className="w-4 h-4" />
          Export
        </Button>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "gap-2",
            isDarkMode
              ? "border-gray-700 hover:bg-gray-800"
              : "border-gray-300 hover:bg-gray-100"
          )}
        >
          <Filter className="w-4 h-4" />
          Filter
        </Button>
      </div>

      {/* Timeline */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative"
      >
        {/* Timeline line */}
        <div
          className={cn(
            "absolute left-5 top-0 bottom-0 w-0.5",
            isDarkMode
              ? "bg-gradient-to-b from-blue-900/50 via-purple-900/50 to-pink-900/50"
              : "bg-gradient-to-b from-blue-100 via-purple-100 to-pink-100"
          )}
        />

        {/* Timeline items */}
        <div className="space-y-4">
          {historyEntries.map((entry: any, index: number) => {
            const user = selectedGigData.userDetails.get(entry.userId);
            const userInitial =
              user?.firstname?.charAt(0) || user?.username?.charAt(0) || "U";
            const userName =
              user?.firstname || user?.username || "Unknown User";
            const userRole = user?.roleType || "User";

            return (
              <motion.div
                key={`${entry.timestamp}-${index}`}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                className="relative flex gap-4 group"
              >
                {/* Timeline dot with glow effect */}
                <div className="relative z-10 flex-shrink-0">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center shadow-lg",
                      isDarkMode
                        ? "bg-gradient-to-br from-gray-800 to-gray-900"
                        : "bg-gradient-to-br from-white to-gray-100"
                    )}
                  >
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center border",
                        getActionBgColor(entry)
                      )}
                    >
                      {getActionIcon(entry)}
                    </div>
                  </div>
                  {/* Latest indicator */}
                  {index === 0 && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full animate-pulse border-2 shadow-lg border-white dark:border-gray-900" />
                  )}
                </div>

                {/* Content */}
                <div
                  className={cn(
                    "flex-1 pb-4",
                    index !== historyEntries.length - 1 && "border-b",
                    isDarkMode ? "border-gray-800" : "border-gray-200"
                  )}
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                    {/* User info */}
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8 ring-2 ring-offset-2 ring-gray-200 dark:ring-gray-800">
                        <AvatarImage src={user?.picture} />
                        <AvatarFallback
                          className={cn(
                            "bg-gradient-to-br text-white font-semibold text-xs",
                            isDarkMode
                              ? userRole?.toLowerCase() === "vocalist"
                                ? "from-pink-600 to-rose-600"
                                : userRole?.toLowerCase() === "dj"
                                  ? "from-purple-600 to-violet-600"
                                  : userRole?.toLowerCase() === "mc"
                                    ? "from-orange-600 to-amber-600"
                                    : userRole?.toLowerCase() === "musician"
                                      ? "from-amber-600 to-orange-600"
                                      : userRole?.toLowerCase() === "booker"
                                        ? "from-emerald-600 to-teal-600"
                                        : "from-blue-600 to-cyan-600"
                              : userRole?.toLowerCase() === "vocalist"
                                ? "from-pink-500 to-rose-500"
                                : userRole?.toLowerCase() === "dj"
                                  ? "from-purple-500 to-violet-500"
                                  : userRole?.toLowerCase() === "mc"
                                    ? "from-orange-500 to-amber-500"
                                    : userRole?.toLowerCase() === "musician"
                                      ? "from-amber-500 to-orange-500"
                                      : userRole?.toLowerCase() === "booker"
                                        ? "from-emerald-500 to-teal-500"
                                        : "from-blue-500 to-cyan-500"
                          )}
                        >
                          {userInitial}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p
                          className={cn(
                            "font-semibold text-sm",
                            isDarkMode ? "text-gray-200" : "text-gray-800"
                          )}
                        >
                          {userName}
                        </p>
                        <div className="flex items-center gap-2">
                          {userRole && (
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-xs px-2 py-0 h-5",
                                isDarkMode
                                  ? "border-gray-700 bg-gray-800 text-gray-300"
                                  : "border-gray-300 bg-gray-100 text-gray-700"
                              )}
                            >
                              <Music className="w-3 h-3 mr-1" />
                              {userRole}
                            </Badge>
                          )}
                          {user?.verifiedIdentity && (
                            <Badge
                              variant="secondary"
                              className="text-xs px-2 py-0 h-5 bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20"
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Status and time */}
                    <div className="flex items-center gap-2 md:ml-auto">
                      <Badge
                        className={cn(
                          "px-3 py-1 text-xs font-semibold shadow-sm",
                          getStatusColor(entry.status)
                        )}
                      >
                        {entry.status?.charAt(0).toUpperCase() +
                          entry.status?.slice(1)}
                      </Badge>
                      <div
                        className={cn(
                          "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
                          isDarkMode
                            ? "bg-gray-800 text-gray-300"
                            : "bg-gray-100 text-gray-700"
                        )}
                      >
                        <Clock className="w-3 h-3" />
                        <span>{formatRelativeTime(entry.timestamp)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Notes with better dark mode styling */}
                  {entry.notes && (
                    <div
                      className={cn(
                        "mt-3 p-3 rounded-lg border shadow-sm transition-all duration-200",
                        getActionBgColor(entry),
                        "group-hover:scale-[1.002] group-hover:shadow-md"
                      )}
                    >
                      <p
                        className={cn(
                          "text-sm leading-relaxed",
                          isDarkMode ? "text-gray-300" : "text-gray-700"
                        )}
                      >
                        {entry.notes}
                      </p>
                      {entry.metadata && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {Object.entries(entry.metadata).map(
                            ([key, value]: [string, any]) => (
                              <Badge
                                key={key}
                                variant="outline"
                                className={cn(
                                  "text-xs px-2 py-0 h-5",
                                  isDarkMode
                                    ? "border-gray-700 bg-gray-800/50 text-gray-400"
                                    : "border-gray-300 bg-gray-100 text-gray-600"
                                )}
                              >
                                <span className="font-medium">{key}:</span>
                                <span className="ml-1">
                                  {value?.toString()}
                                </span>
                              </Badge>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Summary footer */}
      <div
        className={cn(
          "rounded-xl p-4 border",
          isDarkMode
            ? "bg-gray-900/30 border-gray-800"
            : "bg-gray-50 border-gray-200"
        )}
      >
        <p className={cn("text-sm mb-3", colors.textMuted)}>
          Timeline Summary • Latest action was{" "}
          {formatRelativeTime(historyEntries[0].timestamp)}
        </p>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {stats.booked} booked
            </span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {stats.shortlisted} shortlisted
            </span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {stats.viewed} viewed
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
