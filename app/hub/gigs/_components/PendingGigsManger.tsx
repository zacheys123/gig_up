// components/gigs/PendingGigsManager.tsx
import React, { useMemo, useState, useEffect, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import {
  Search,
  Calendar,
  MapPin,
  DollarSign,
  Music,
  Users,
  Briefcase,
  Clock,
  Eye,
  Heart,
  Star,
  TrendingUp,
  User as UserIcon,
  Users2,
  Mic,
  Volume2,
  CheckCircle,
  XCircle,
  Sparkles,
  Filter,
  History,
  MessageSquare,
  FileText,
  MapPin as MapPinIcon,
  Tag,
  Grid,
  List,
  CalendarDays,
  Kanban,
  Activity,
  X,
  Share2,
  Receipt,
  Send,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

import { filterUserApplications } from "@/utils";
import { useUserApplications } from "@/hooks/useAllGigs";
import { useThemeColors } from "@/hooks/useTheme";
import { toast } from "sonner";
import GigLoader from "@/components/(main)/GigLoader";

// Types
type DisplayMode = "grid" | "timeline" | "list" | "calendar" | "kanban";
type GigStatus =
  | "interested"
  | "applied"
  | "shortlisted"
  | "completed"
  | "history";

interface PendingGigsManagerProps {
  initialUser?: any;
}

export const PendingGigsManager: React.FC<PendingGigsManagerProps> = ({
  initialUser,
}) => {
  const router = useRouter();
  const { user: currentUser } = useCurrentUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<GigStatus | "all">("all");
  const [displayMode, setDisplayMode] = useState<DisplayMode>("grid");
  const { isDarkMode } = useThemeColors();
  const user = currentUser || initialUser;

  // Preferences
  const userPreferences = useQuery(
    api.controllers.userPrefferences.getUserPreferences,
    user?._id ? { userId: user._id } : "skip",
  );
  const updateComponentPrefs = useMutation(
    api.controllers.userPrefferences.updateComponentPreferences,
  );

  // Load preferences
  useEffect(() => {
    if (userPreferences?.preferences?.pendingGigs) {
      const prefs = userPreferences.preferences.pendingGigs;
      if (prefs.displayMode) setDisplayMode(prefs.displayMode as DisplayMode);
      if (prefs.activeTab) setActiveTab(prefs.activeTab as GigStatus | "all");
    }
  }, [userPreferences]);

  // Save display mode
  const handleDisplayModeChange = useCallback(
    async (mode: DisplayMode) => {
      setDisplayMode(mode);

      if (!user?._id) return;

      try {
        await updateComponentPrefs({
          userId: user._id,
          component: "pendingGigs",
          settings: { displayMode: mode },
        });
        toast.success("Display mode saved");
      } catch (error) {
        console.error("Error saving display mode:", error);
        toast.error("Failed to save display mode");
      }
    },
    [user?._id, updateComponentPrefs],
  );

  // Save active tab
  const handleTabChange = useCallback(
    async (tab: string) => {
      setActiveTab(tab as GigStatus | "all");

      if (!user?._id) return;

      try {
        await updateComponentPrefs({
          userId: user._id,
          component: "pendingGigs",
          settings: { activeTab: tab },
        });
      } catch (error) {
        console.error("Error saving tab preference:", error);
      }
    },
    [user?._id, updateComponentPrefs],
  );

  const { categorizedApplications, isLoading } = useUserApplications(user?._id);

  const safeCategorizedApplications = useMemo(
    () => ({
      all: categorizedApplications.all || [],
      interested: categorizedApplications.interested || [],
      applied: categorizedApplications.applied || [],
      shortlisted: categorizedApplications.shortlisted || [],
      history: categorizedApplications.history || [],
    }),
    [categorizedApplications],
  );

  const filteredGigs = useMemo(() => {
    let gigs = [];

    switch (activeTab) {
      case "interested":
        gigs = safeCategorizedApplications.interested;
        break;
      case "applied":
        gigs = safeCategorizedApplications.applied;
        break;
      case "shortlisted":
        gigs = safeCategorizedApplications.shortlisted;
        break;
      case "completed":
      case "history":
        gigs = safeCategorizedApplications.history;
        break;
      default:
        gigs = safeCategorizedApplications.all;
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      gigs = gigs.filter(
        (gig: any) =>
          gig.title?.toLowerCase().includes(query) ||
          gig.location?.toLowerCase().includes(query) ||
          gig.applicationDetails?.role?.toLowerCase().includes(query) ||
          gig.bussinesscat?.toLowerCase().includes(query) ||
          gig.applicationDetails?.status?.toLowerCase().includes(query),
      );
    }

    return gigs;
  }, [activeTab, searchQuery, safeCategorizedApplications]);

  const [isTabLoading, setIsTabLoading] = useState(true);
  const showContentLoading = isLoading || isTabLoading;
  // Update the filteredGigs useMemo to track loading
  useEffect(() => {
    setIsTabLoading(true);

    // Small timeout to ensure loading state shows
    const timer = setTimeout(() => {
      setIsTabLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [activeTab, searchQuery, categorizedApplications]);

  const getStatusConfig = (gig: any) => {
    if (gig.isHistorical) {
      const status = gig.applicationDetails?.status || "completed";
      return {
        label: status.charAt(0).toUpperCase() + status.slice(1),
        color: isDarkMode
          ? "bg-slate-700 text-slate-300 border-slate-600"
          : "bg-slate-100 text-slate-700 border-slate-200",
        icon: <History className="w-3.5 h-3.5" />,
        badgeColor: isDarkMode ? "slate" : "slate",
        gradient: isDarkMode
          ? "from-slate-700 to-slate-600"
          : "from-slate-500 to-slate-600",
        lightColor: "text-slate-600",
        darkColor: "text-slate-400",
        bgLight: "bg-slate-100",
        bgDark: "bg-slate-800",
        borderLight: "border-slate-200",
        borderDark: "border-slate-700",
      };
    }

    const { userStatus, gigType, applicationDetails } = gig;

    const statusConfigs = {
      interested: {
        label: "Interested",
        color: isDarkMode
          ? "bg-blue-900/50 text-blue-300 border-blue-800"
          : "bg-blue-100 text-blue-700 border-blue-200",
        icon: <Heart className="w-3.5 h-3.5" />,
        badgeColor: "blue",
        gradient: isDarkMode
          ? "from-blue-600 to-blue-500"
          : "from-blue-500 to-blue-600",
        lightColor: "text-blue-600",
        darkColor: "text-blue-400",
        bgLight: "bg-blue-50",
        bgDark: "bg-blue-950",
        borderLight: "border-blue-200",
        borderDark: "border-blue-800",
        buttonGradient: isDarkMode
          ? "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
          : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
      },
      applied: {
        label:
          gigType === "band-role"
            ? `Applied for ${applicationDetails?.role || "Role"}`
            : gigType === "full-band"
              ? "Applied with Band"
              : "Applied",
        color: isDarkMode
          ? "bg-amber-900/50 text-amber-300 border-amber-800"
          : "bg-amber-100 text-amber-700 border-amber-200",
        icon: <Briefcase className="w-3.5 h-3.5" />,
        badgeColor: "amber",
        gradient: isDarkMode
          ? "from-amber-600 to-amber-500"
          : "from-amber-500 to-amber-600",
        lightColor: "text-amber-600",
        darkColor: "text-amber-400",
        bgLight: "bg-amber-50",
        bgDark: "bg-amber-950",
        borderLight: "border-amber-200",
        borderDark: "border-amber-800",
        buttonGradient: isDarkMode
          ? "bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600"
          : "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700",
      },
      shortlisted: {
        label:
          gigType === "band-role"
            ? `Shortlisted: ${applicationDetails?.role || "Role"}`
            : gigType === "full-band"
              ? "Band Shortlisted"
              : "Shortlisted",
        color: isDarkMode
          ? "bg-emerald-900/50 text-emerald-300 border-emerald-800"
          : "bg-emerald-100 text-emerald-700 border-emerald-200",
        icon: <Star className="w-3.5 h-3.5" />,
        badgeColor: "emerald",
        gradient: isDarkMode
          ? "from-emerald-600 to-emerald-500"
          : "from-emerald-500 to-emerald-600",
        lightColor: "text-emerald-600",
        darkColor: "text-emerald-400",
        bgLight: "bg-emerald-50",
        bgDark: "bg-emerald-950",
        borderLight: "border-emerald-200",
        borderDark: "border-emerald-800",
        buttonGradient: isDarkMode
          ? "bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600"
          : "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700",
      },
      completed: {
        label: "Completed",
        color: isDarkMode
          ? "bg-purple-900/50 text-purple-300 border-purple-800"
          : "bg-purple-100 text-purple-700 border-purple-200",
        icon: <CheckCircle className="w-3.5 h-3.5" />,
        badgeColor: "purple",
        gradient: isDarkMode
          ? "from-purple-600 to-purple-500"
          : "from-purple-500 to-purple-600",
        lightColor: "text-purple-600",
        darkColor: "text-purple-400",
        bgLight: "bg-purple-50",
        bgDark: "bg-purple-950",
        borderLight: "border-purple-200",
        borderDark: "border-purple-800",
        buttonGradient: isDarkMode
          ? "bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600"
          : "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700",
      },
    };

    return (
      statusConfigs[userStatus as keyof typeof statusConfigs] ||
      statusConfigs.applied
    );
  };

  const getGigIcon = (gig: any) => {
    const iconClass = "w-5 h-5";

    if (gig.isHistorical) {
      return <History className={cn(iconClass, "text-slate-500")} />;
    }

    if (gig.gigType === "full-band") {
      return <Users2 className={cn(iconClass, "text-orange-500")} />;
    }

    if (gig.gigType === "band-role") {
      const { applicationDetails } = gig;
      const role = applicationDetails?.role?.toLowerCase();

      const roleIconMap: Record<
        string,
        { icon: React.ReactNode; color: string }
      > = {
        vocalist: {
          icon: <Mic className={iconClass} />,
          color: "text-pink-500",
        },
        dj: {
          icon: <Volume2 className={iconClass} />,
          color: "text-purple-500",
        },
        mc: { icon: <Mic className={iconClass} />, color: "text-red-500" },
        guitarist: {
          icon: <Music className={iconClass} />,
          color: "text-blue-500",
        },
        drummer: {
          icon: <Music className={iconClass} />,
          color: "text-amber-500",
        },
        pianist: {
          icon: <Music className={iconClass} />,
          color: "text-green-500",
        },
        bassist: {
          icon: <Music className={iconClass} />,
          color: "text-indigo-500",
        },
        saxophonist: {
          icon: <Music className={iconClass} />,
          color: "text-teal-500",
        },
        trumpeter: {
          icon: <Music className={iconClass} />,
          color: "text-yellow-500",
        },
      };

      const matchedRole = roleIconMap[role || ""];
      if (matchedRole) {
        return <span className={matchedRole.color}>{matchedRole.icon}</span>;
      }
      return <Briefcase className={cn(iconClass, "text-purple-500")} />;
    }

    switch (gig.bussinesscat?.toLowerCase()) {
      case "mc":
        return <Mic className={cn(iconClass, "text-red-500")} />;
      case "dj":
        return <Volume2 className={cn(iconClass, "text-purple-500")} />;
      case "vocalist":
        return <Music className={cn(iconClass, "text-green-500")} />;
      case "full":
        return <Users className={cn(iconClass, "text-orange-500")} />;
      default:
        return <Briefcase className={cn(iconClass, "text-blue-500")} />;
    }
  };

  const formatDate = (date: number) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const formatFullDate = (date: number) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getPriceDisplay = (gig: any): { text: string; color: string } => {
    if (gig.price === undefined || gig.price === null) {
      return {
        text: "Price negotiable",
        color: isDarkMode ? "text-slate-400" : "text-slate-500",
      };
    }
    if (gig.price === 0) {
      return {
        text: "Free event",
        color: "text-emerald-600 dark:text-emerald-400",
      };
    }
    return {
      text: `$${gig.price.toLocaleString()}`,
      color: "text-emerald-600 dark:text-emerald-400",
    };
  };

  const tabCounts = {
    all: safeCategorizedApplications.all.length,
    interested: safeCategorizedApplications.interested.length,
    applied: safeCategorizedApplications.applied.length,
    shortlisted: safeCategorizedApplications.shortlisted.length,
    history: safeCategorizedApplications.history.length,
  };

  // Empty State Component
  const EmptyState = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        className={cn(
          "text-center py-16 border-2 border-dashed",
          isDarkMode
            ? "bg-slate-900/50 border-slate-800"
            : "bg-white border-slate-200",
        )}
      >
        <CardContent className="space-y-6">
          <div
            className={cn(
              "w-20 h-20 mx-auto rounded-2xl flex items-center justify-center",
              isDarkMode
                ? "bg-gradient-to-br from-slate-800 to-slate-900"
                : "bg-gradient-to-br from-slate-100 to-slate-200",
            )}
          >
            <Search
              className={cn(
                "w-10 h-10",
                isDarkMode ? "text-slate-600" : "text-slate-400",
              )}
            />
          </div>

          <div className="space-y-2">
            <h3
              className={cn(
                "text-xl font-bold",
                isDarkMode ? "text-white" : "text-slate-900",
              )}
            >
              No gigs found
            </h3>
            <p
              className={cn(
                "text-base max-w-md mx-auto",
                isDarkMode ? "text-slate-400" : "text-slate-500",
              )}
            >
              {searchQuery
                ? `No results match "${searchQuery}"`
                : `You don't have any ${activeTab === "all" ? "" : activeTab} gigs yet`}
            </p>
          </div>

          {searchQuery && (
            <Button
              variant="outline"
              onClick={() => setSearchQuery("")}
              className={cn(
                "h-10 px-6 font-medium border-2",
                isDarkMode
                  ? "border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
                  : "border-slate-200 text-slate-700 hover:bg-slate-100",
              )}
            >
              <X className="w-4 h-4 mr-2" />
              Clear search
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
  // Render functions for different display modes
  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <AnimatePresence mode="popLayout">
        {filteredGigs.map((gig: any, index: number) => {
          const statusConfig = getStatusConfig(gig);
          const priceDisplay = getPriceDisplay(gig);

          return (
            <motion.div
              key={gig._id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{
                duration: 0.3,
                delay: index * 0.05,
              }}
              whileHover={{ y: -4 }}
            >
              <Card
                className={cn(
                  "cursor-pointer hover:shadow-md transition-all",
                  isDarkMode
                    ? "bg-gray-900/50 border-gray-800"
                    : "bg-white border-gray-200",
                )}
                onClick={() =>
                  router.push(`/hub/gigs/musician/${gig._id}/gig-info`)
                }
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "p-2 rounded-lg",
                        isDarkMode ? "bg-gray-800" : "bg-gray-100",
                      )}
                    >
                      {getGigIcon(gig)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3
                        className={cn(
                          "font-semibold truncate",
                          isDarkMode ? "text-white" : "text-gray-900",
                        )}
                      >
                        {gig.title}
                      </h3>
                      <div className="flex items-center gap-2 text-sm mt-1">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs px-2 py-0.5",
                            statusConfig.color,
                          )}
                        >
                          {statusConfig.label}
                        </Badge>
                        <span
                          className={
                            isDarkMode ? "text-gray-400" : "text-gray-500"
                          }
                        >
                          {formatDate(gig.date)}
                        </span>
                      </div>
                    </div>
                    {!gig.isHistorical && gig.price > 0 && (
                      <span className={cn("font-semibold", priceDisplay.color)}>
                        {priceDisplay.text}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );

  const renderListView = () => (
    <Card
      className={cn(
        "overflow-hidden border-2",
        isDarkMode
          ? "bg-slate-900 border-slate-800"
          : "bg-white border-slate-200",
      )}
    >
      <div className="divide-y divide-slate-200 dark:divide-slate-800">
        <AnimatePresence mode="popLayout">
          {filteredGigs.map((gig: any, index: number) => {
            const statusConfig = getStatusConfig(gig);
            const priceDisplay = getPriceDisplay(gig);

            return (
              <motion.div
                key={gig._id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.05,
                  layout: { duration: 0.2 },
                }}
                className={cn(
                  "p-4 transition-all duration-200",
                  isDarkMode ? "hover:bg-slate-800/50" : "hover:bg-slate-50",
                )}
              >
                <div className="flex items-center gap-4">
                  {/* Status indicator */}
                  <div
                    className={cn(
                      "w-1.5 h-12 rounded-full bg-gradient-to-b",
                      statusConfig.gradient,
                    )}
                  />

                  {/* Icon */}
                  <div
                    className={cn(
                      "p-3 rounded-xl",
                      isDarkMode ? statusConfig.bgDark : statusConfig.bgLight,
                    )}
                  >
                    {getGigIcon(gig)}
                  </div>

                  {/* Content - flex grow */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <h3
                        className={cn(
                          "font-semibold truncate",
                          isDarkMode ? "text-white" : "text-slate-900",
                        )}
                      >
                        {gig.title}
                      </h3>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs px-2 py-0.5 font-medium shrink-0",
                          statusConfig.color,
                        )}
                      >
                        <span className="flex items-center gap-1">
                          {statusConfig.icon}
                          {statusConfig.label}
                        </span>
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-sm mt-1">
                      <span
                        className={cn(
                          "flex items-center gap-1",
                          isDarkMode ? "text-slate-400" : "text-slate-500",
                        )}
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(gig.date)}
                      </span>

                      <span
                        className={cn(
                          "flex items-center gap-1",
                          isDarkMode ? "text-slate-400" : "text-slate-500",
                        )}
                      >
                        <MapPin className="w-3.5 h-3.5" />
                        {gig.location?.split(",")[0] || "Location TBD"}
                      </span>

                      {!gig.isHistorical && (
                        <span
                          className={cn(
                            "flex items-center gap-1 font-medium",
                            priceDisplay.color,
                          )}
                        >
                          <DollarSign className="w-3.5 h-3.5" />
                          {priceDisplay.text}
                        </span>
                      )}
                    </div>

                    {gig.applicationDetails?.role && (
                      <div className="flex items-center gap-2 mt-2">
                        <Tag
                          className={cn(
                            "w-3.5 h-3.5",
                            isDarkMode ? "text-slate-500" : "text-slate-400",
                          )}
                        />
                        <span
                          className={cn(
                            "text-xs",
                            isDarkMode ? "text-slate-400" : "text-slate-500",
                          )}
                        >
                          Applied as: {gig.applicationDetails.role}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      className={cn(
                        "h-9 px-4 font-medium shadow-sm hover:shadow transition-all",
                        isDarkMode
                          ? "bg-orange-600 hover:bg-orange-700 text-white"
                          : "bg-orange-500 hover:bg-orange-600 text-white",
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/hub/gigs/musician/${gig._id}/gig-info`);
                      }}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      className={cn(
                        "h-9 px-4 font-medium border-2",
                        isDarkMode
                          ? "border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white hover:border-slate-600"
                          : "border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300",
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle message
                      }}
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Message
                    </Button>

                    {!gig.isHistorical && gig.userStatus === "interested" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className={cn(
                          "h-9 px-4 font-medium border-2",
                          isDarkMode
                            ? "border-rose-800 text-rose-400 hover:bg-rose-950/50 hover:text-rose-300"
                            : "border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300",
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle withdraw
                        }}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Withdraw
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </Card>
  );

  const renderTimelineView = () => (
    <div className="space-y-4">
      <AnimatePresence mode="popLayout">
        {filteredGigs.map((gig: any, index: number) => {
          const statusConfig = getStatusConfig(gig);
          const priceDisplay = getPriceDisplay(gig);

          return (
            <motion.div
              key={gig._id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{
                duration: 0.3,
                delay: index * 0.05,
                layout: { duration: 0.2 },
              }}
              className="relative"
            >
              {/* Timeline connector */}
              {index < filteredGigs.length - 1 && (
                <div
                  className={cn(
                    "absolute left-5 top-12 bottom-0 w-0.5",
                    isDarkMode ? "bg-slate-800" : "bg-slate-200",
                  )}
                />
              )}

              <Card
                className={cn(
                  "border-2 transition-all duration-200 hover:shadow-lg",
                  isDarkMode
                    ? "bg-slate-900 border-slate-800 hover:border-slate-700"
                    : "bg-white border-slate-200 hover:border-orange-200",
                )}
              >
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    {/* Timeline dot */}
                    <div className="relative">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center border-2",
                          isDarkMode
                            ? statusConfig.bgDark
                            : statusConfig.bgLight,
                          isDarkMode
                            ? `border-${statusConfig.badgeColor}-800`
                            : `border-${statusConfig.badgeColor}-200`,
                        )}
                      >
                        {getGigIcon(gig)}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3
                            className={cn(
                              "text-lg font-semibold",
                              isDarkMode ? "text-white" : "text-slate-900",
                            )}
                          >
                            {gig.title}
                          </h3>

                          <div className="flex items-center gap-3 mt-1">
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-xs px-2 py-0.5 font-medium",
                                statusConfig.color,
                              )}
                            >
                              <span className="flex items-center gap-1">
                                {statusConfig.icon}
                                {statusConfig.label}
                              </span>
                            </Badge>

                            <span
                              className={cn(
                                "text-sm",
                                isDarkMode
                                  ? "text-slate-400"
                                  : "text-slate-500",
                              )}
                            >
                              {formatFullDate(gig.date)}
                            </span>
                          </div>
                        </div>

                        {!gig.isHistorical && (
                          <div
                            className={cn(
                              "text-lg font-bold",
                              priceDisplay.color,
                            )}
                          >
                            {priceDisplay.text}
                          </div>
                        )}
                      </div>

                      {/* Details grid */}
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        {gig.location && (
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin
                              className={cn(
                                "w-4 h-4",
                                isDarkMode
                                  ? "text-slate-500"
                                  : "text-slate-400",
                              )}
                            />
                            <span
                              className={
                                isDarkMode ? "text-slate-300" : "text-slate-600"
                              }
                            >
                              {gig.location}
                            </span>
                          </div>
                        )}

                        {gig.time?.start && (
                          <div className="flex items-center gap-2 text-sm">
                            <Clock
                              className={cn(
                                "w-4 h-4",
                                isDarkMode
                                  ? "text-slate-500"
                                  : "text-slate-400",
                              )}
                            />
                            <span
                              className={
                                isDarkMode ? "text-slate-300" : "text-slate-600"
                              }
                            >
                              {gig.time.start} - {gig.time.end || "TBD"}
                            </span>
                          </div>
                        )}

                        {gig.applicationDetails?.role && (
                          <div className="flex items-center gap-2 text-sm">
                            <Tag
                              className={cn(
                                "w-4 h-4",
                                isDarkMode
                                  ? "text-slate-500"
                                  : "text-slate-400",
                              )}
                            />
                            <span
                              className={
                                isDarkMode ? "text-slate-300" : "text-slate-600"
                              }
                            >
                              Role: {gig.applicationDetails.role}
                            </span>
                          </div>
                        )}

                        {gig.bussinesscat && (
                          <div className="flex items-center gap-2 text-sm">
                            <Briefcase
                              className={cn(
                                "w-4 h-4",
                                isDarkMode
                                  ? "text-slate-500"
                                  : "text-slate-400",
                              )}
                            />
                            <span
                              className={
                                isDarkMode ? "text-slate-300" : "text-slate-600"
                              }
                            >
                              {gig.bussinesscat}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Progress indicator for active gigs */}
                      {!gig.isHistorical && (
                        <div className="mt-4">
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span
                              className={
                                isDarkMode ? "text-slate-400" : "text-slate-500"
                              }
                            >
                              Application progress
                            </span>
                            <span
                              className={cn(
                                "font-medium",
                                statusConfig.lightColor,
                                isDarkMode && statusConfig.darkColor,
                              )}
                            >
                              {gig.userStatus === "interested" &&
                                "Interest shown"}
                              {gig.userStatus === "applied" &&
                                "Application submitted"}
                              {gig.userStatus === "shortlisted" &&
                                "Shortlisted!"}
                            </span>
                          </div>

                          <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{
                                width:
                                  gig.userStatus === "interested"
                                    ? "33%"
                                    : gig.userStatus === "applied"
                                      ? "66%"
                                      : gig.userStatus === "shortlisted"
                                        ? "100%"
                                        : "0%",
                              }}
                              transition={{ duration: 0.5, delay: 0.2 }}
                              className={cn(
                                "h-full rounded-full bg-gradient-to-r",
                                statusConfig.gradient,
                              )}
                            />
                          </div>
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="flex gap-2 mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                        <Button
                          size="sm"
                          className={cn(
                            "h-9 px-4 font-medium shadow-sm hover:shadow transition-all",
                            isDarkMode
                              ? "bg-orange-600 hover:bg-orange-700 text-white"
                              : "bg-orange-500 hover:bg-orange-600 text-white",
                          )}
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(
                              `/hub/gigs/musician/${gig._id}/gig-info`,
                            );
                          }}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View details
                        </Button>

                        {!gig.isHistorical ? (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className={cn(
                                "h-9 px-4 font-medium border-2",
                                isDarkMode
                                  ? "border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
                                  : "border-slate-200 text-slate-700 hover:bg-slate-100",
                              )}
                              onClick={(e) => {
                                e.stopPropagation();
                                // Handle message
                              }}
                            >
                              <MessageSquare className="w-4 h-4 mr-2" />
                              Message
                            </Button>

                            {gig.userStatus === "interested" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className={cn(
                                  "h-9 px-4 font-medium border-2",
                                  isDarkMode
                                    ? "border-rose-800 text-rose-400 hover:bg-rose-950/50 hover:text-rose-300"
                                    : "border-rose-200 text-rose-600 hover:bg-rose-50",
                                )}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Handle withdraw
                                }}
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Withdraw
                              </Button>
                            )}
                          </>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className={cn(
                                "h-9 px-4 font-medium border-2",
                                isDarkMode
                                  ? "border-amber-800 text-amber-400 hover:bg-amber-950/50 hover:text-amber-300"
                                  : "border-amber-200 text-amber-600 hover:bg-amber-50",
                              )}
                              onClick={(e) => {
                                e.stopPropagation();
                                // Handle rating
                              }}
                            >
                              <Star className="w-4 h-4 mr-2 fill-amber-500 text-amber-500" />
                              Rate
                            </Button>

                            <Button
                              size="sm"
                              variant="ghost"
                              className={cn(
                                "h-9 px-4 font-medium",
                                isDarkMode
                                  ? "text-slate-400 hover:text-white hover:bg-slate-800"
                                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100",
                              )}
                              onClick={(e) => {
                                e.stopPropagation();
                                // Handle receipt
                              }}
                            >
                              <Receipt className="w-4 h-4 mr-2" />
                              Receipt
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );

  const renderCalendarView = () => {
    // Group gigs by date
    const groupedByDate = filteredGigs.reduce((acc: any, gig: any) => {
      const dateKey = new Date(gig.date).toDateString();
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(gig);
      return acc;
    }, {});

    return (
      <div className="space-y-4">
        {Object.entries(groupedByDate).map(([date, gigs]: [string, any]) => (
          <Card
            key={date}
            className={cn(
              "overflow-hidden border-2",
              isDarkMode
                ? "bg-slate-900 border-slate-800"
                : "bg-white border-slate-200",
            )}
          >
            <CardHeader
              className={cn(
                "py-3 px-4",
                isDarkMode ? "bg-slate-800/50" : "bg-slate-50",
              )}
            >
              <CardTitle className="text-sm font-medium">
                {new Date(date).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                {gigs.map((gig: any) => {
                  const statusConfig = getStatusConfig(gig);
                  return (
                    <div
                      key={gig._id}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                      onClick={() =>
                        router.push(`/hub/gigs/musician/${gig._id}/gig-info`)
                      }
                    >
                      <div className="flex items-center gap-3">
                        <Badge className={statusConfig.color}>
                          {statusConfig.label}
                        </Badge>
                        <span
                          className={cn(
                            "font-medium",
                            isDarkMode ? "text-white" : "text-slate-900",
                          )}
                        >
                          {gig.title}
                        </span>
                      </div>
                      {gig.time?.start && (
                        <span
                          className={cn(
                            "text-sm",
                            isDarkMode ? "text-slate-400" : "text-slate-500",
                          )}
                        >
                          {gig.time.start}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderKanbanView = () => {
    const columns = [
      { id: "interested", title: "Interested", icon: Heart },
      { id: "applied", title: "Applied", icon: Briefcase },
      { id: "shortlisted", title: "Shortlisted", icon: Star },
      { id: "history", title: "History", icon: History },
    ];

    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((column) => (
          <div key={column.id} className="flex-shrink-0 w-80">
            <Card
              className={cn(
                "h-full border-2",
                isDarkMode
                  ? "bg-slate-900 border-slate-800"
                  : "bg-white border-slate-200",
              )}
            >
              <CardHeader
                className={cn(
                  "py-3 px-4 border-b",
                  isDarkMode ? "border-slate-800" : "border-slate-200",
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <column.icon className="w-4 h-4" />
                    <CardTitle className="text-sm font-medium">
                      {column.title}
                    </CardTitle>
                  </div>
                  <Badge variant="outline">
                    {
                      filteredGigs.filter((gig: any) =>
                        column.id === "history"
                          ? gig.isHistorical
                          : gig.userStatus === column.id,
                      ).length
                    }
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-3 space-y-3 max-h-[600px] overflow-y-auto">
                {filteredGigs
                  .filter((gig: any) =>
                    column.id === "history"
                      ? gig.isHistorical
                      : gig.userStatus === column.id,
                  )
                  .map((gig: any) => {
                    const statusConfig = getStatusConfig(gig);
                    return (
                      <div
                        key={gig._id}
                        className="cursor-pointer"
                        onClick={() =>
                          router.push(`/hub/gigs/musician/${gig._id}/gig-info`)
                        }
                      >
                        <Card
                          className={cn(
                            "p-3 border-2 hover:shadow-md transition-all",
                            isDarkMode
                              ? "bg-slate-800/50 border-slate-700 hover:border-slate-600"
                              : "bg-white border-slate-200 hover:border-slate-300",
                          )}
                        >
                          <div className="flex items-start gap-2">
                            <div
                              className={cn(
                                "p-2 rounded-lg",
                                isDarkMode
                                  ? statusConfig.bgDark
                                  : statusConfig.bgLight,
                              )}
                            >
                              {getGigIcon(gig)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p
                                className={cn(
                                  "font-medium text-sm line-clamp-1",
                                  isDarkMode ? "text-white" : "text-slate-900",
                                )}
                              >
                                {gig.title}
                              </p>
                              <p
                                className={cn(
                                  "text-xs mt-1",
                                  isDarkMode
                                    ? "text-slate-400"
                                    : "text-slate-500",
                                )}
                              >
                                {formatDate(gig.date)}
                              </p>
                            </div>
                          </div>
                        </Card>
                      </div>
                    );
                  })}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    );
  };

  const renderGigs = () => {
    switch (displayMode) {
      case "list":
        return renderListView();
      case "timeline":
        return renderTimelineView();
      case "calendar":
        return renderCalendarView();
      case "kanban":
        return renderKanbanView();
      default:
        return renderGridView();
    }
  };

  const [showHeader, setShowHeader] = useState(false);
  if (isLoading) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-64" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-12 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (safeCategorizedApplications.all.length === 0) {
    return (
      <Card
        className={cn(
          "text-center py-16 border-2 border-dashed",
          isDarkMode
            ? "bg-slate-900/50 border-slate-800"
            : "bg-white border-slate-200",
        )}
      >
        <CardContent className="space-y-6">
          <div
            className={cn(
              "w-24 h-24 mx-auto rounded-2xl flex items-center justify-center",
              isDarkMode
                ? "bg-gradient-to-br from-slate-800 to-slate-900"
                : "bg-gradient-to-br from-slate-100 to-slate-200",
            )}
          >
            <Sparkles
              className={cn(
                "w-12 h-12",
                isDarkMode ? "text-slate-600" : "text-slate-400",
              )}
            />
          </div>

          <div className="space-y-2">
            <h3
              className={cn(
                "text-xl font-bold",
                isDarkMode ? "text-white" : "text-slate-900",
              )}
            >
              No gig applications yet
            </h3>
            <p
              className={cn(
                "text-base max-w-md mx-auto",
                isDarkMode ? "text-slate-400" : "text-slate-500",
              )}
            >
              Start exploring gigs and apply to opportunities that match your
              skills
            </p>
          </div>

          <Button
            onClick={() => router.push("/hub/gigs")}
            className={cn(
              "h-12 px-8 text-base font-medium shadow-lg hover:shadow-xl transition-all duration-300",
              isDarkMode
                ? "bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white"
                : "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white",
            )}
          >
            <TrendingUp className="w-5 h-5 mr-2" />
            Browse available gigs
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen relative">
        {/* Background gradient */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div
            className={cn(
              "absolute top-0 left-0 right-0 h-96 bg-gradient-to-b",
              isDarkMode
                ? "from-orange-500/5 via-transparent to-transparent"
                : "from-orange-500/10 via-transparent to-transparent",
            )}
          />
        </div>

        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6">
          {/* Header with Chevron */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1
                  className={cn(
                    "text-xl sm:text-xl md:text-3xl font-bold tracking-tight",
                    isDarkMode ? "text-white" : "text-slate-900",
                  )}
                >
                  My gig applications
                </h1>
                <button
                  onClick={() => setShowHeader(!showHeader)}
                  className={cn(
                    "p-1.5 rounded-full transition-all md:hidden",
                    isDarkMode
                      ? "text-slate-400 hover:text-white hover:bg-slate-800"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-100",
                  )}
                >
                  {showHeader ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p
                className={cn(
                  "text-xs sm:text-sm mt-1 hidden sm:block",
                  isDarkMode ? "text-slate-400" : "text-slate-500",
                )}
              >
                Track and manage all your gig opportunities
              </p>
            </div>

            {/* Search - Desktop */}
            <div className="hidden md:block relative w-72">
              <Search
                className={cn(
                  "absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4",
                  isDarkMode ? "text-slate-500" : "text-slate-400",
                )}
              />
              <Input
                placeholder="Search gigs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(
                  "pl-9 h-10 rounded-xl border-2 transition-all",
                  "focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500",
                  isDarkMode
                    ? "bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                    : "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400",
                )}
              />
            </div>
          </div>

          {/* Expandable Header Content */}
          <AnimatePresence>
            {showHeader && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="pt-2 pb-4 space-y-4">
                  {/* Stats Cards - Horizontal Scroll on Mobile */}
                  <div className="relative">
                    {/* Mobile Horizontal Scroll */}
                    <div className="md:hidden -mx-3 px-3 overflow-x-auto scrollbar-hide">
                      <div className="flex gap-3 pb-2 min-w-min">
                        {[
                          {
                            label: "Total",
                            value: tabCounts.all,
                            icon: Briefcase,
                            gradient: "from-blue-500 to-cyan-500",
                          },
                          {
                            label: "Interested",
                            value: tabCounts.interested,
                            icon: Heart,
                            gradient: "from-sky-500 to-blue-500",
                          },
                          {
                            label: "Applied",
                            value: tabCounts.applied,
                            icon: Send,
                            gradient: "from-amber-500 to-yellow-500",
                          },
                          {
                            label: "Shortlisted",
                            value: tabCounts.shortlisted,
                            icon: Star,
                            gradient: "from-emerald-500 to-green-500",
                          },
                          {
                            label: "History",
                            value: tabCounts.history,
                            icon: History,
                            gradient: "from-purple-500 to-pink-500",
                          },
                        ].map((stat, index) => (
                          <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex-shrink-0 w-36"
                          >
                            <Card
                              className={cn(
                                "border shadow-sm",
                                isDarkMode
                                  ? "bg-slate-900 border-slate-800"
                                  : "bg-white border-slate-200",
                              )}
                            >
                              <CardContent className="p-3">
                                <div className="flex items-center justify-between mb-2">
                                  <p
                                    className={cn(
                                      "text-[10px] font-medium uppercase tracking-wider",
                                      isDarkMode
                                        ? "text-slate-400"
                                        : "text-slate-500",
                                    )}
                                  >
                                    {stat.label}
                                  </p>
                                  <div
                                    className={cn(
                                      "p-1.5 rounded-lg bg-gradient-to-br",
                                      stat.gradient,
                                    )}
                                  >
                                    <stat.icon className="w-3 h-3 text-white" />
                                  </div>
                                </div>
                                <p
                                  className={cn(
                                    "text-lg font-bold",
                                    isDarkMode
                                      ? "text-white"
                                      : "text-slate-900",
                                  )}
                                >
                                  {stat.value}
                                </p>
                                <div className="mt-2 h-1 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                  <div
                                    className={cn(
                                      "h-full rounded-full bg-gradient-to-r",
                                      stat.gradient,
                                    )}
                                    style={{
                                      width: `${(stat.value / Math.max(tabCounts.all, 1)) * 100}%`,
                                    }}
                                  />
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                      {/* Scroll hint */}
                      <div className="flex items-center justify-center gap-1 mt-2">
                        <div className="flex gap-1">
                          <div className="w-1 h-1 rounded-full bg-slate-400 animate-pulse" />
                          <div className="w-1 h-1 rounded-full bg-slate-400 animate-pulse delay-150" />
                          <div className="w-1 h-1 rounded-full bg-slate-400 animate-pulse delay-300" />
                        </div>
                        <span
                          className={cn(
                            "text-[10px]",
                            isDarkMode ? "text-slate-500" : "text-slate-400",
                          )}
                        >
                          scroll for more
                        </span>
                      </div>
                    </div>

                    {/* Desktop Stats Grid */}
                    <div className="hidden md:grid grid-cols-5 gap-4">
                      {[
                        {
                          label: "Total involved",
                          value: tabCounts.all,
                          icon: Briefcase,
                          gradient: "from-blue-500 to-cyan-500",
                        },
                        {
                          label: "Interested",
                          value: tabCounts.interested,
                          icon: Heart,
                          gradient: "from-sky-500 to-blue-500",
                        },
                        {
                          label: "Applied",
                          value: tabCounts.applied,
                          icon: Send,
                          gradient: "from-amber-500 to-yellow-500",
                        },
                        {
                          label: "Shortlisted",
                          value: tabCounts.shortlisted,
                          icon: Star,
                          gradient: "from-emerald-500 to-green-500",
                        },
                        {
                          label: "History",
                          value: tabCounts.history,
                          icon: History,
                          gradient: "from-purple-500 to-pink-500",
                        },
                      ].map((stat, index) => (
                        <motion.div
                          key={stat.label}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          whileHover={{ y: -4 }}
                        >
                          <Card
                            className={cn(
                              "overflow-hidden border-2 shadow-lg hover:shadow-xl transition-all duration-300",
                              isDarkMode
                                ? "bg-slate-900 border-slate-800"
                                : "bg-white border-slate-200",
                            )}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p
                                    className={cn(
                                      "text-xs font-medium uppercase tracking-wider",
                                      isDarkMode
                                        ? "text-slate-400"
                                        : "text-slate-500",
                                    )}
                                  >
                                    {stat.label}
                                  </p>
                                  <p
                                    className={cn(
                                      "text-xl font-bold mt-1",
                                      isDarkMode
                                        ? "text-white"
                                        : "text-slate-900",
                                    )}
                                  >
                                    {stat.value}
                                  </p>
                                </div>
                                <div
                                  className={cn(
                                    "p-3 rounded-xl bg-gradient-to-br",
                                    stat.gradient,
                                  )}
                                >
                                  <stat.icon className="w-5 h-5 text-white" />
                                </div>
                              </div>
                              <div className="mt-3 h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{
                                    width: `${(stat.value / Math.max(tabCounts.all, 1)) * 100}%`,
                                  }}
                                  transition={{ duration: 0.5, delay: 0.2 }}
                                  className={cn(
                                    "h-full rounded-full bg-gradient-to-r",
                                    stat.gradient,
                                  )}
                                />
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Search - Mobile */}
                  <div className="md:hidden">
                    <div className="relative">
                      <Search
                        className={cn(
                          "absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4",
                          isDarkMode ? "text-slate-500" : "text-slate-400",
                        )}
                      />
                      <Input
                        placeholder="Search gigs..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={cn(
                          "pl-9 h-10 rounded-xl border-2 w-full",
                          "focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500",
                          isDarkMode
                            ? "bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                            : "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400",
                        )}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Fixed View Controls - Always visible */}
          <div className="sticky top-0 z-10 pt-2 pb-3 bg-inherit backdrop-blur-sm">
            <div className="flex items-center justify-between gap-4">
              {/* Left side - View Toggle */}
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "text-xs font-medium hidden sm:block",
                    isDarkMode ? "text-slate-400" : "text-slate-500",
                  )}
                >
                  View:
                </span>
                <div
                  className={cn(
                    "flex gap-1 p-1 rounded-xl",
                    isDarkMode
                      ? "bg-slate-800/50 border border-slate-700"
                      : "bg-slate-100 border border-slate-200",
                  )}
                >
                  {[
                    { mode: "grid", icon: Grid },
                    { mode: "list", icon: List },
                    { mode: "timeline", icon: Activity },
                    { mode: "calendar", icon: CalendarDays },
                    { mode: "kanban", icon: Kanban },
                  ].map(({ mode, icon: Icon }) => (
                    <Tooltip key={mode}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => handleDisplayModeChange(mode as any)}
                          className={cn(
                            "h-8 w-8 rounded-lg transition-all duration-200 flex items-center justify-center",
                            displayMode === mode
                              ? isDarkMode
                                ? "bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-lg"
                                : "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md"
                              : isDarkMode
                                ? "text-slate-400 hover:text-white hover:bg-slate-700"
                                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200",
                          )}
                        >
                          <Icon className="w-4 h-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="text-xs">
                        {mode.charAt(0).toUpperCase() + mode.slice(1)} view
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </div>

              {/* Right side - Results count and filter toggle */}
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs",
                    isDarkMode
                      ? "bg-slate-800/50 text-slate-300"
                      : "bg-slate-100 text-slate-600",
                  )}
                >
                  <span className="font-semibold text-orange-500">
                    {filteredGigs.length}
                  </span>
                  <span className="hidden xs:inline">of</span>
                  <span className="font-semibold hidden xs:inline">
                    {tabCounts.all}
                  </span>
                </div>

                {/* Mobile filter button */}
                <button
                  onClick={() => setShowHeader(!showHeader)}
                  className={cn(
                    "md:hidden p-2 rounded-lg",
                    isDarkMode
                      ? "bg-slate-800/50 text-slate-300"
                      : "bg-slate-100 text-slate-600",
                  )}
                >
                  <Filter className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Tabs - Below view controls */}
          <div className="mt-4">
            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <TabsList
                className={cn(
                  "grid grid-cols-5 gap-1 p-1 rounded-lg w-full",
                  isDarkMode ? "bg-slate-800/50" : "bg-slate-100",
                )}
              >
                {[
                  { value: "all", label: "All", icon: Filter },
                  { value: "interested", label: "Interested", icon: Heart },
                  { value: "applied", label: "Applied", icon: Send },
                  { value: "shortlisted", label: "Shortlisted", icon: Star },
                  { value: "history", label: "History", icon: History },
                ].map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className={cn(
                      "relative px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-all",
                      "data-[state=active]:shadow-sm",
                      isDarkMode
                        ? "data-[state=active]:bg-orange-600 data-[state=active]:text-white"
                        : "data-[state=active]:bg-orange-500 data-[state=active]:text-white",
                      !isDarkMode &&
                        "data-[state=inactive]:text-slate-600 hover:text-slate-900 hover:bg-slate-200/50",
                      isDarkMode &&
                        "data-[state=inactive]:text-slate-400 hover:text-white hover:bg-slate-700",
                    )}
                  >
                    <div className="flex items-center justify-center gap-1 sm:gap-1.5">
                      <tab.icon className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{tab.label}</span>
                      {tabCounts[tab.value as keyof typeof tabCounts] > 0 && (
                        <span
                          className={cn(
                            "ml-0.5 px-1.5 py-0.5 text-[10px] rounded-full",
                            activeTab === tab.value
                              ? "bg-white/20 text-white"
                              : isDarkMode
                                ? "bg-slate-700 text-slate-300"
                                : "bg-slate-200 text-slate-600",
                          )}
                        >
                          {tabCounts[tab.value as keyof typeof tabCounts]}
                        </span>
                      )}
                    </div>
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value={activeTab} className="mt-6">
                {showContentLoading ? (
                  <div className="space-y-4">
                    {displayMode === "grid" ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {[...Array(6)].map((_, i) => (
                          <Skeleton key={i} className="h-48 rounded-xl" />
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {[...Array(4)].map((_, i) => (
                          <Skeleton key={i} className="h-24 rounded-xl" />
                        ))}
                      </div>
                    )}
                  </div>
                ) : filteredGigs.length > 0 ? (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`gigs-${displayMode}-${activeTab}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {renderGigs()}
                    </motion.div>
                  </AnimatePresence>
                ) : (
                  <EmptyState />
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Add padding at bottom for mobile */}
          <div className="h-4 sm:h-6" />
        </div>
      </div>
    </TooltipProvider>
  );
};
