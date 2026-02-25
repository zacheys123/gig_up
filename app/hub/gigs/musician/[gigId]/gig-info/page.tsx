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
  TrendingUp,
  Sparkles,
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
  Activity,
  TrendingDown,
  BarChart3,
  LineChart,
  Zap,
  History,
  Info,
  FileText,
} from "lucide-react";

// Trust components
import { TrustStarsDisplay } from "@/components/trust/TrustStarsDisplay";
import { ChatIcon } from "@/components/chat/ChatIcon";
import { isUserQualifiedForRole } from "../../../utils";
import { useAllGigs } from "@/hooks/useAllGigs";
import PlatformActivitySidebar, {
  PlatformGig,
} from "../../_components/PlatformActivitySidebar";
import ComingSoonGigs from "../../_components/ComingSoon";
import { formatTimeAgo } from "@/utils";
import { EngagingGigCard } from "../../_components/GigCard";
import { SimilarGigCard } from "../../_components/SimilarGigCard";
import { InfoChip } from "../../_components/InfoChip";
import FollowButton from "@/components/pages/FollowButton";
import { OnlineBadge } from "@/components/chat/OnlineBadge";

// ============= COMPONENT PLACEHOLDERS =============

const GigModal = ({
  isOpen,
  onClose,
  gig,
}: {
  isOpen: boolean;
  onClose: () => void;
  gig: any;
}) => {
  const { isDarkMode } = useThemeColors();

  console.log("GigModal rendering:", { isOpen, gig: gig?.title });

  if (!gig) {
    console.log("No gig data in modal");
    return null;
  }

  // Helper function to check if a role is filled
  const isRoleFilled = (role: any) => {
    return role.filledSlots >= role.maxSlots;
  };

  // Helper function to get remaining slots
  const getRemainingSlots = (role: any) => {
    return role.maxSlots - role.filledSlots;
  };

  // Helper function to get slot status color
  const getSlotStatusColor = (role: any) => {
    const remaining = getRemainingSlots(role);
    if (remaining === 0) return "text-red-500";
    if (remaining <= 2) return "text-yellow-500";
    return "text-green-500";
  };

  // Helper function to get slot status icon
  const getSlotStatusIcon = (role: any) => {
    const remaining = getRemainingSlots(role);
    if (remaining === 0) return <XCircle className="w-4 h-4 text-red-500" />;
    if (remaining <= 2)
      return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    return <CheckCircle className="w-4 h-4 text-green-500" />;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-hidden p-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className={cn(
            "relative overflow-hidden",
            isDarkMode
              ? "bg-gradient-to-b from-slate-900 to-slate-800"
              : "bg-gradient-to-b from-white to-slate-50",
          )}
        >
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16 border-2 border-white shadow-lg">
                  <AvatarImage src={gig?.logo} />
                  <AvatarFallback className="bg-white/20 text-white text-xl">
                    {gig?.title?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {gig?.title}
                  </h2>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className="bg-white/20 text-white border-0">
                      {gig?.bussinesscat || "Gig"}
                    </Badge>
                    {gig?.isTaken && (
                      <Badge className="bg-red-500/20 text-white border-0">
                        Fully Booked
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-white hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[calc(90vh-200px)] overflow-y-auto">
            {/* Quick Info Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <InfoChip
                icon={MapPin}
                label="Location"
                value={gig?.location || "Remote"}
                color="blue"
                isDarkMode={isDarkMode}
              />
              <InfoChip
                icon={Calendar}
                label="Date"
                value={
                  gig?.date ? new Date(gig.date).toLocaleDateString() : "TBD"
                }
                color="emerald"
                isDarkMode={isDarkMode}
              />
              <InfoChip
                icon={Clock}
                label="Time"
                value={
                  gig?.time?.start
                    ? `${gig.time.start} - ${gig.time.end}`
                    : "TBD"
                }
                color="amber"
                isDarkMode={isDarkMode}
              />
              <InfoChip
                icon={DollarSign}
                label="Budget"
                value={
                  gig?.price
                    ? `${gig.currency || "$"}${gig.price.toLocaleString()}`
                    : "Negotiable"
                }
                color="purple"
                isDarkMode={isDarkMode}
              />
            </div>

            {/* Band Roles - Show detailed slot information */}
            {gig?.bandCategory && gig.bandCategory.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-500" />
                    Available Roles
                  </h3>
                  <Badge variant="outline" className="text-xs">
                    {
                      gig.bandCategory.filter(
                        (r: any) => getRemainingSlots(r) > 0,
                      ).length
                    }{" "}
                    open / {gig.bandCategory.length} total
                  </Badge>
                </div>

                <div className="space-y-3">
                  {gig.bandCategory.map((role: any, index: number) => {
                    const remaining = getRemainingSlots(role);
                    const isFilled = remaining === 0;
                    const statusColor = getSlotStatusColor(role);
                    const StatusIcon = getSlotStatusIcon(role);

                    return (
                      <div
                        key={index}
                        className={cn(
                          "p-4 rounded-lg border transition-all",
                          isFilled
                            ? isDarkMode
                              ? "bg-slate-800/50 border-slate-700 opacity-70"
                              : "bg-slate-50 border-slate-200 opacity-70"
                            : isDarkMode
                              ? "bg-slate-800/30 border-slate-700 hover:border-purple-500/50"
                              : "bg-white border-slate-200 hover:border-purple-300",
                        )}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-base">
                                {role.role}
                              </h4>
                              {role.requiredSkills &&
                                role.requiredSkills.length > 0 && (
                                  <Badge
                                    variant="outline"
                                    className="text-[10px]"
                                  >
                                    {role.requiredSkills.length} skills
                                  </Badge>
                                )}
                            </div>

                            {/* Slot Status */}
                            <div className="flex items-center gap-2 mt-1">
                              {StatusIcon}
                              <span
                                className={cn(
                                  "text-sm font-medium",
                                  statusColor,
                                )}
                              >
                                {remaining === 0
                                  ? "Filled"
                                  : `${remaining} slot${remaining > 1 ? "s" : ""} remaining`}
                              </span>
                            </div>

                            {/* Slot Progress Bar */}
                            <div className="mt-2 space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-500">Progress</span>
                                <span className={statusColor}>
                                  {role.filledSlots}/{role.maxSlots} filled
                                </span>
                              </div>
                              <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div
                                  className={cn(
                                    "h-full transition-all",
                                    isFilled
                                      ? "bg-red-500"
                                      : remaining <= 2
                                        ? "bg-yellow-500"
                                        : "bg-green-500",
                                  )}
                                  style={{
                                    width: `${(role.filledSlots / role.maxSlots) * 100}%`,
                                  }}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Price if available */}
                          {role.price && (
                            <div className="text-right">
                              <span className="text-xs text-slate-500">
                                Budget
                              </span>
                              <p className="font-bold text-emerald-500">
                                {role.currency || "$"}
                                {role.price}
                                {role.negotiable && (
                                  <span className="text-xs text-slate-400 ml-1">
                                    /neg
                                  </span>
                                )}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Description */}
                        {role.description && (
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 mb-2">
                            {role.description}
                          </p>
                        )}

                        {/* Skills */}
                        {role.requiredSkills &&
                          role.requiredSkills.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {role.requiredSkills.map(
                                (skill: string, i: number) => (
                                  <Badge
                                    key={i}
                                    variant="secondary"
                                    className="text-[10px]"
                                  >
                                    {skill}
                                  </Badge>
                                ),
                              )}
                            </div>
                          )}

                        {/* Applicants count if available */}
                        {role.applicants && role.applicants.length > 0 && (
                          <div className="mt-2 text-xs text-slate-500">
                            {role.applicants.length} applicant
                            {role.applicants.length > 1 ? "s" : ""}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Summary Card */}
                <div
                  className={cn(
                    "mt-4 p-3 rounded-lg border",
                    isDarkMode
                      ? "bg-slate-800/30 border-slate-700"
                      : "bg-slate-50 border-slate-200",
                  )}
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">
                      Total Slots:
                    </span>
                    <span className="font-medium">
                      {gig.bandCategory.reduce(
                        (acc: number, role: any) => acc + role.maxSlots,
                        0,
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-slate-600 dark:text-slate-400">
                      Filled Slots:
                    </span>
                    <span className="font-medium">
                      {gig.bandCategory.reduce(
                        (acc: number, role: any) => acc + role.filledSlots,
                        0,
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-slate-600 dark:text-slate-400">
                      Remaining:
                    </span>
                    <span
                      className={cn(
                        "font-medium",
                        gig.bandCategory.reduce(
                          (acc: number, role: any) =>
                            acc + (role.maxSlots - role.filledSlots),
                          0,
                        ) === 0
                          ? "text-red-500"
                          : "text-green-500",
                      )}
                    >
                      {gig.bandCategory.reduce(
                        (acc: number, role: any) =>
                          acc + (role.maxSlots - role.filledSlots),
                        0,
                      )}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Poster Info - if available */}
            {gig?.poster && (
              <div className={cn("mb-6 p-4 rounded-lg ",isDarkMode " bg-slate-50":"bg-slate-800/50")}>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={gig.poster.picture} />
                    <AvatarFallback>
                      {gig.poster.firstname?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {gig.poster.firstname} {gig.poster.lastname}
                    </p>
                    <TrustStarsDisplay
                      trustStars={gig.poster.trustStars || 0}
                      size="sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-500" />
                Description
              </h3>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {gig?.description}
              </p>
            </div>

            {/* Tags */}
            {gig?.tags && gig.tags.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {gig.tags.map((tag: string, i: number) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Requirements */}
            {gig?.requirements && gig.requirements.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  Requirements
                </h3>
                <ul className="space-y-2">
                  {gig.requirements.map((req: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                        <span className="text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                          {i + 1}
                        </span>
                      </div>
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {req}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
              <Button
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                onClick={() => {
                  // Handle contact host
                  onClose();
                }}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Contact Host
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  navigator.clipboard?.writeText(window.location.href);
                  toast.success("Link copied!");
                }}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
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
                      "flex items-center gap-1 text-[10px] md:text- px-2 py-1 rounded-full",
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
                      "flex items-center gap-1 text-[10px] md:text- px-2 py-1 rounded-full",
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
                        "flex items-center gap-1 text-[10px] md:text- px-2 py-1 rounded-full",
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
                      "text-[10px] font-medium",
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
              "text-[10px] font-semibold uppercase tracking-wider mb-2",
              isDarkMode ? "text-slate-400" : "text-slate-500",
            )}
          >
            Description
          </h3>
          <p
            className={cn(
              "text- leading-relaxed whitespace-pre-line",
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
                    "px-2 py-1 text-[10px] font-medium",
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
  metrics,
  canMessageUser,
  handleViewProfile,
  getTrustTierIcon,
  isDarkMode,
}: any) => {
  const display = metrics?.display || {
    reliability: {
      value: 0,
      label: "Reliability",
      icon: "🛡️",
      color: "text-slate-500",
    },
    completion: {
      value: 0,
      label: "Completed",
      icon: "✅",
      color: "text-slate-500",
    },
    myCancellations: {
      value: 0,
      label: "My Cancellations",
      icon: "❌",
      color: "text-slate-500",
    },
    otherCancellations: {
      value: 0,
      label: "Other's Cancellations",
      icon: "🤷",
      color: "text-slate-500",
    },
    response: { hours: null, style: "unknown", icon: "⏳" },
    badge: {
      tier: "new",
      label: "New",
      emoji: "🌱",
      color: "from-purple-500 to-pink-500",
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <Card
        className={cn(
          "border shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300",
          isDarkMode
            ? "bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700"
            : "bg-gradient-to-br from-white to-slate-50 border-slate-200",
        )}
      >
        {/* Badge gradient bar */}
        <div
          className={cn("h-1 w-full bg-gradient-to-r", display.badge.color)}
        />

        <CardContent className="p-4 md:p-6">
          {/* Header with badge */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users2 className="w-4 h-4 text-emerald-500" />
              <h3
                className={cn(
                  "text- font-semibold",
                  isDarkMode ? "text-white" : "text-slate-900",
                )}
              >
                Gig Owner
              </h3>
            </div>

            <div className="flex items-center gap-2">
              {/* Reliability Badge */}
              <Badge
                className={cn(
                  "text-[10px] capitalize bg-gradient-to-r text-white border-0 flex items-center gap-1",
                  display.badge.color,
                )}
              >
                <span>{display.badge.emoji}</span>
                <span>{display.badge.label}</span>
              </Badge>

              {/* Verified Badge */}
              {poster.verifiedIdentity && (
                <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 text-xs">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>
          </div>

          {/* Avatar and Basic Info */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Avatar Section */}
            <div className="flex-shrink-0 text-center sm:text-left">
              <div className="relative inline-block">
                <Avatar className="w-20 h-20 sm:w-24 sm:h-24 mx-auto sm:mx-0 border-4 border-white dark:border-slate-700 shadow-lg">
                  <AvatarImage src={poster.picture} />
                  <AvatarFallback className="bg-gradient-to-br from-emerald-600 to-teal-600 text-white text-xl sm:text-2xl font-bold">
                    {poster.firstname?.charAt(0) || poster.username?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-800" />
              </div>

              <div className="mt-3">
                <TrustStarsDisplay
                  trustStars={poster.trustStars || 0}
                  size="md"
                />
              </div>

              <p className="text-[10px] text-slate-500 mt-2">
                Member since {new Date(poster._creationTime).getFullYear()}
              </p>
            </div>

            {/* Info Section */}
            <div className="flex-1">
              {/* Name and Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4
                    className={cn(
                      "text-lg sm:text-xl font-bold",
                      isDarkMode ? "text-white" : "text-slate-900",
                    )}
                  >
                    {poster.firstname || poster.username}
                  </h4>

                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    {poster.roleType && (
                      <Badge variant="outline" className="text-xs">
                        {poster.roleType}
                      </Badge>
                    )}
                    {poster.city && (
                      <div className="flex items-center gap-1 text-[10px] text-slate-500">
                        <MapPin className="w-3 h-3" />
                        {poster.city}
                      </div>
                    )}
                  </div>
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

              {/* Simple Metrics Grid */}
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
                {/* Completion Rate */}
                <div
                  className={cn(
                    "text-center p-2 rounded-lg",
                    isDarkMode ? "bg-slate-800" : "bg-slate-50",
                  )}
                >
                  <div
                    className={cn(
                      "text-lg font-bold",
                      display.completion.color,
                    )}
                  >
                    {display.completion.value}%
                  </div>
                  <div className="text-[10px] text-slate-500 flex items-center justify-center gap-1">
                    <span>{display.completion.icon}</span>
                    {display.completion.label}
                  </div>
                </div>

                {/* My Cancellations */}
                <div
                  className={cn(
                    "text-center p-2 rounded-lg",
                    isDarkMode ? "bg-slate-800" : "bg-slate-50",
                  )}
                >
                  <div
                    className={cn(
                      "text-lg font-bold",
                      display.myCancellations.color,
                    )}
                  >
                    {display.myCancellations.value}%
                  </div>
                  <div className="text-[10px] text-slate-500 flex items-center justify-center gap-1">
                    <span>{display.myCancellations.icon}</span>
                    {display.myCancellations.label}
                  </div>
                </div>

                {/* Response Style */}
                <div
                  className={cn(
                    "text-center p-2 rounded-lg",
                    isDarkMode ? "bg-slate-800" : "bg-slate-50",
                  )}
                >
                  <div className="text-lg font-bold text-slate-900 dark:text-white">
                    {display.response.icon}
                  </div>
                  <div className="text-[10px] text-slate-500 capitalize">
                    {display.response.style === "quick" && "Quick"}
                    {display.response.style === "thoughtful" && "Thoughtful"}
                    {display.response.style === "fast" && "Fast"}
                    {display.response.style === "patient" && "Patient"}
                    {display.response.style === "unknown" && "—"}
                  </div>
                </div>
              </div>

              {/* Visual Breakdown Bar */}
              {metrics?.totalGigs > 0 && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                    <span>Gig History</span>
                    <span>
                      {metrics.completedByMe} completed •{" "}
                      {metrics.cancelledByMe} cancelled by me •{" "}
                      {metrics.cancelledByOther} cancelled by others
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex">
                    <div
                      className="h-full bg-emerald-500"
                      style={{ width: `${metrics.completionRate}%` }}
                    />
                    <div
                      className="h-full bg-rose-500"
                      style={{ width: `${metrics.myCancellationRate}%` }}
                    />
                    <div
                      className="h-full bg-slate-400"
                      style={{ width: `${metrics.otherCancellationRate}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Simple Summary */}
              <p className="text-[10px] text-slate-500 mt-3">
                {metrics?.summary ||
                  `${display.reliability.value}% reliable • ${display.response.icon} ${display.response.style}`}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

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
            "text- font-semibold flex items-center gap-2 mb-4",
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
                <span className="text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                  {i + 1}
                </span>
              </div>
              <span
                className={cn(
                  "text- flex-1",
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

// RoleCard Component
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
            "font-semibold text-[11px]",
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
            "text-[10px] mb-3",
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
  const [activeTab, setActiveTab] = useState("trending");
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
  const [isChangingGig, setIsChangingGig] = useState(false);
  const [selectedGigId, setSelectedGigId] = useState<Id<"gigs"> | null>(null);

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

  // Fetch poster data separately
  const poster = useQuery(api.controllers.user.getUserById, {
    userId: gig?.postedBy as Id<"users">,
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

  // Add these state variables near your other state declarations
  const [showGigModal, setShowGigModal] = useState(false);
  const [selectedGigForModal, setSelectedGigForModal] = useState<any>(null);

  // Update handleViewGig to just open modal with the selected gig
  // Update your handleViewGig function
  const handleViewGig = useCallback(
    (gig: any) => {
      console.log("Clicked gig:", gig); // Check if this logs
      console.log("Current gigId:", gigId); // Check if different
      console.log("Selected gig ID:", gig?._id); // Check the ID

      if (!gig?._id || gig._id === gigId) {
        console.log("Returning - same gig or no ID");
        return;
      }

      console.log("Opening modal for:", gig.title);
      setSelectedGigForModal(gig);
      setShowGigModal(true);
    },
    [gigId],
  );

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

  // Get application status badge
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

  // Base metrics
  const { allGigs: allGigsData, isLoading: allGigsLoading } = useAllGigs({
    limit: 100,
  });

  const baseMetrics = useMemo(() => {
    if (!allGigsData) return null;

    const totalInterests = allGigsData.reduce(
      (sum, gig) => sum + (gig.interestedUsers?.length || 0),
      0,
    );

    const totalApplications = allGigsData.reduce(
      (sum, gig) => sum + (gig.appliedUsers?.length || 0),
      0,
    );

    const categoryCount: Record<string, number> = {};
    allGigsData.forEach((gig) => {
      const cat = gig.bussinesscat || "other";
      categoryCount[cat] = (categoryCount[cat] || 0) + 1;
    });

    const locationCount: Record<string, number> = {};
    allGigsData.forEach((gig) => {
      if (gig.location) {
        const loc = gig.location.split(",")[0];
        locationCount[loc] = (locationCount[loc] || 0) + 1;
      }
    });

    const topLocation =
      Object.entries(locationCount).sort((a, b) => b[1] - a[1])[0]?.[0] ||
      "Remote";

    const prices = allGigsData.filter((g) => g.price).map((g) => g.price || 0);
    const avgPrice = prices.length
      ? Math.floor(prices.reduce((a, b) => a + b, 0) / prices.length)
      : 0;

    const hours = allGigsData.map((g) => new Date(g._creationTime).getHours());
    const hourCount: Record<number, number> = {};
    hours.forEach((h) => (hourCount[h] = (hourCount[h] || 0) + 1));
    const peakHourNum = Object.entries(hourCount).sort(
      (a, b) => b[1] - a[1],
    )[0]?.[0];

    const peakHour = peakHourNum
      ? `${parseInt(peakHourNum) > 12 ? parseInt(peakHourNum) - 12 : peakHourNum}${parseInt(peakHourNum) >= 12 ? "PM" : "AM"}`
      : "N/A";

    return {
      totalGigs: allGigsData.length,
      totalInterests,
      totalApplications,
      avgPrice,
      topLocation,
      peakHour,
    };
  }, [allGigsData]);

  // Live activity state
  const [liveActivity, setLiveActivity] = useState(() => {
    if (baseMetrics) {
      return {
        recentInterests: Math.floor(baseMetrics.totalInterests * 0.1),
        recentApplications: Math.floor(baseMetrics.totalApplications * 0.1),
        recentViews: Math.floor(baseMetrics.totalGigs * 3),
        activeUsers: Math.floor(baseMetrics.totalGigs * 1.5),
        peakHour: baseMetrics.peakHour,
        topLocation: baseMetrics.topLocation,
      };
    }
    return {
      recentInterests: 0,
      recentApplications: 0,
      recentViews: 0,
      activeUsers: 0,
      peakHour: "",
      topLocation: "",
    };
  });

  const [liveFeed, setLiveFeed] = useState<
    Array<{
      id: string;
      type: "interest" | "apply" | "view";
      gigTitle: string;
      timestamp: number;
      category: string;
    }>
  >([]);

  // Simulate live activity
  useEffect(() => {
    if (!baseMetrics || !allGigsData || allGigsData.length === 0) return;

    const feedInterval = setInterval(() => {
      const randomGig =
        allGigsData[Math.floor(Math.random() * allGigsData.length)];
      if (!randomGig) return;

      const types = ["interest", "apply", "view"] as const;
      const randomType = types[Math.floor(Math.random() * types.length)];

      const newFeedItem = {
        id: `${Date.now()}-${Math.random()}`,
        type: randomType,
        gigTitle: randomGig.title || "A gig",
        timestamp: Date.now(),
        category: randomGig.bussinesscat || "talent",
      };

      setLiveFeed((prev) => [newFeedItem, ...prev].slice(0, 5));

      setLiveActivity((prev) => ({
        ...prev,
        recentInterests:
          prev.recentInterests + (randomType === "interest" ? 1 : 0),
        recentApplications:
          prev.recentApplications + (randomType === "apply" ? 1 : 0),
        recentViews: prev.recentViews + (randomType === "view" ? 1 : 0),
        activeUsers: Math.max(
          5,
          prev.activeUsers + (Math.random() > 0.7 ? 1 : -1),
        ),
      }));
    }, 8000);

    const counterInterval = setInterval(() => {
      setLiveActivity((prev) => ({
        ...prev,
        recentInterests: Math.max(
          0,
          prev.recentInterests + (Math.random() > 0.5 ? 1 : -1),
        ),
        recentApplications: Math.max(
          0,
          prev.recentApplications + (Math.random() > 0.6 ? 1 : 0),
        ),
        recentViews: prev.recentViews + Math.floor(Math.random() * 3),
        activeUsers: Math.max(
          5,
          prev.activeUsers + (Math.random() > 0.5 ? 1 : -1),
        ),
      }));
    }, 3000);

    return () => {
      clearInterval(feedInterval);
      clearInterval(counterInterval);
    };
  }, [baseMetrics, allGigsData]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "interest":
        return <Heart className="w-3 h-3 text-rose-400" />;
      case "apply":
        return <Briefcase className="w-3 h-3 text-amber-400" />;
      default:
        return <Eye className="w-3 h-3 text-blue-400" />;
    }
  };

  // Upcoming gigs
  const upcomingInterestGigs = useMemo(() => {
    if (!allGigsData) return [];

    const now = Date.now();

    return allGigsData
      .filter(
        (gig) =>
          gig._id !== gigId &&
          gig.acceptInterestStartTime &&
          gig.acceptInterestStartTime > now &&
          !gig.isTaken &&
          gig.isActive !== false,
      )
      .sort(
        (a, b) =>
          (a.acceptInterestStartTime || 0) - (b.acceptInterestStartTime || 0),
      )
      .slice(0, 8);
  }, [allGigsData, gigId]);

  const upcomingEventGigs = useMemo(() => {
    if (!allGigsData) return [];

    const now = Date.now();

    return allGigsData
      .filter(
        (gig) =>
          gig._id !== gigId &&
          gig.date &&
          gig.date > now &&
          !gig.isTaken &&
          gig.isActive !== false,
      )
      .sort((a, b) => (a.date || 0) - (b.date || 0))
      .slice(0, 8);
  }, [allGigsData, gigId]);

  // Filtered gigs
  const filteredGigs = useMemo(() => {
    if (!allGigsData) return [];

    let filtered = [...allGigsData];

    switch (activeTab) {
      case "trending":
        filtered = allGigsData
          .map((gig) => ({
            ...gig,
            interactionScore:
              (gig.interestedUsers?.length || 0) * 2 +
              (gig.appliedUsers?.length || 0) * 3 +
              (gig.bookedBy ? 10 : 0) +
              (gig.viewCount?.length || 0),
          }))
          .sort((a, b) => b.interactionScore - a.interactionScore)
          .slice(0, 10);
        break;

      case "hot":
        filtered = allGigsData
          .map((gig) => {
            const bookingHistoryCount = gig.bookingHistory?.length || 0;
            const bandBookingCount = gig.bandBookingHistory?.length || 0;
            const bookCountEntries = gig.bookCount?.length || 0;
            const shortlistedCount = gig.shortlistedUsers?.length || 0;

            return {
              ...gig,
              engagementScore:
                bookingHistoryCount * 2 +
                bandBookingCount * 2 +
                bookCountEntries * 1.5 +
                shortlistedCount * 1.5,
            };
          })
          .sort((a, b) => b.engagementScore - a.engagementScore)
          .slice(0, 10);
        break;

      case "closing":
        const now = Date.now();
        const threeDaysFromNow = now + 3 * 24 * 60 * 60 * 1000;

        filtered = allGigsData
          .filter(
            (gig) =>
              gig.acceptInterestEndTime &&
              gig.acceptInterestEndTime > now &&
              gig.acceptInterestEndTime < threeDaysFromNow &&
              !gig.isTaken,
          )
          .sort(
            (a, b) =>
              (a.acceptInterestEndTime || 0) - (b.acceptInterestEndTime || 0),
          )
          .slice(0, 10);
        break;

      default:
        filtered = allGigsData.slice(0, 10);
    }

    return filtered;
  }, [activeTab, allGigsData]);

  // Online stats
  const onlineStats = useQuery(api.controllers.user.getOnlineUsersStats, {
    thresholdMinutes: 5,
  });

  // Check if user can message
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

  // Check if user is booked
  const isUserBookedInAnyRole = useMemo(() => {
    if (!currentUser?._id || !gig) return false;

    if (gig.bookedBy === currentUser._id) return true;
    if (
      gig.bandCategory?.some((role: any) =>
        role.bookedUsers?.includes(currentUser._id),
      )
    )
      return true;
    if (
      gig.bookCount?.some(
        (booking: any) =>
          booking.appliedBy === currentUser._id ||
          booking.performingMembers?.some(
            (m: any) => m.userId === currentUser._id,
          ),
      )
    )
      return true;

    return false;
  }, [gig, currentUser]);

  const bookedRoles = useMemo(() => {
    if (!isUserBookedInAnyRole || !gig || !currentUser) return [];

    const roles = [];

    if (gig.bookedBy === currentUser?._id) {
      roles.push({ type: "primary", role: "Main Act" });
    }

    gig.bandCategory?.forEach((role: any) => {
      if (role.bookedUsers?.includes(currentUser?._id)) {
        roles.push({
          type: "band",
          role: role.role,
          details: role,
        });
      }
    });

    gig.bookCount?.forEach((booking: any) => {
      if (booking.appliedBy === currentUser?._id) {
        roles.push({
          type: "band-booking",
          role: "Band",
          details: booking,
        });
      }
      if (
        booking.performingMembers?.some(
          (m: any) => m.userId === currentUser?._id,
        )
      ) {
        roles.push({
          type: "band-member",
          role: "Band Member",
          details: booking,
        });
      }
    });

    return roles;
  }, [isUserBookedInAnyRole, gig, currentUser]);

  const canWithdraw =
    userApplication &&
    ["interested", "applied", "band-applicant", "band-booking"].includes(
      userApplication.type,
    );

  // Loading state
  if (!gig || !users) {
    return (
      <TooltipProvider>
        <div
          className={cn(
            "min-h-screen relative",
            isDarkMode
              ? "bg-gradient-to-br from-slate-950/90 via-slate-900/80 to-slate-950/90"
              : "bg-gradient-to-br from-slate-50/80 via-white/70 to-slate-50/80",
          )}
        >
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

          <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
            {/* Header skeleton */}
            <div className="flex items-center justify-between mb-8">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <Skeleton className="h-10 w-32 rounded-xl" />
            </div>

            {/* Title skeleton */}
            <div className="mb-8">
              <Skeleton className="h-12 w-3/4 mb-4" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-24 rounded-full" />
                <Skeleton className="h-8 w-24 rounded-full" />
                <Skeleton className="h-8 w-24 rounded-full" />
              </div>
            </div>

            {/* Grid layout with skeletons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left Column Skeleton */}
              <div className="hidden md:block md:col-span-1">
                <div className="space-y-3">
                  <Skeleton className="h-96 w-full rounded-xl" />
                  <Skeleton className="h-48 w-full rounded-xl" />
                  <Skeleton className="h-24 w-full rounded-xl" />
                </div>
              </div>

              {/* Right Column Skeleton */}
              <div className="md:col-span-2 space-y-6">
                <Skeleton className="h-[600px] w-full rounded-xl" />
                <Skeleton className="h-48 w-full rounded-xl" />
              </div>
            </div>

            {/* Mobile bottom bar skeleton */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800" />
          </div>
        </div>
      </TooltipProvider>
    );
  }

  // Changing gig loading state
  if (isChangingGig) {
    return (
      <TooltipProvider>
        <div
          className={cn(
            "min-h-screen relative",
            isDarkMode
              ? "bg-gradient-to-br from-slate-950/90 via-slate-900/80 to-slate-950/90"
              : "bg-gradient-to-br from-slate-50/80 via-white/70 to-slate-50/80",
          )}
        >
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

          <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
            {/* Header - keep interactive */}
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
                <div className="hidden md:block">{getMyStatusBadge()}</div>
                <Skeleton className="md:hidden w-10 h-10 rounded-xl" />
                <Skeleton className="hidden md:block w-32 h-10 rounded-xl" />
              </div>
            </div>

            {/* Title - keep visible but dimmed */}
            <div className="mb-8 opacity-50">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
                {gig.title}
              </h1>
            </div>

            {/* Grid layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left Column - keep fully interactive */}
              <div className="hidden md:block md:col-span-1">
                <div className="space-y-3 sticky top-24">
                  {/* SECTION 1: THE BUZZ */}
                  <div
                    className={cn(
                      "rounded-xl border-2 overflow-hidden",
                      isDarkMode
                        ? "bg-gradient-to-b from-slate-900 via-slate-800/90 to-slate-900 border-purple-500/30"
                        : "bg-gradient-to-b from-white via-purple-50/30 to-white border-purple-200",
                    )}
                  >
                    <div
                      className={cn(
                        "px-4 py-3 border-b",
                        isDarkMode
                          ? "border-purple-500/20"
                          : "border-purple-200",
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-purple-500" />
                          <h3
                            className={cn(
                              "text-sm font-bold",
                              isDarkMode ? "text-white" : "text-slate-900",
                            )}
                          >
                            The Buzz
                          </h3>
                        </div>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs",
                            isDarkMode
                              ? "border-purple-500/30 text-purple-300"
                              : "border-purple-300 text-purple-700",
                          )}
                        >
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span>{onlineStats?.total || 0} here now</span>
                          </div>
                        </Badge>
                      </div>
                    </div>

                    {/* Live counters */}
                    <div
                      className={cn(
                        "px-4 py-2 border-b flex flex-wrap gap-3 text-xs",
                        isDarkMode
                          ? "bg-slate-800/50 border-slate-700"
                          : "bg-slate-100/50 border-slate-200",
                      )}
                    >
                      <span className="flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5 text-rose-400" />
                        {liveActivity.recentInterests} interested
                      </span>
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-3.5 h-3.5 text-amber-400" />
                        {liveActivity.recentApplications} applied
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {liveActivity.topLocation}
                      </span>
                    </div>

                    {/* Live feed */}
                    <div className="px-4 py-2 border-b">
                      <div
                        className={cn(
                          "text-xs font-semibold mb-2",
                          isDarkMode ? "text-slate-400" : "text-slate-500",
                        )}
                      >
                        LIVE ACTIVITY
                      </div>
                      <div className="space-y-1 max-h-[100px] overflow-hidden">
                        {liveFeed.slice(0, 3).map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-1.5 text-xs"
                          >
                            {getActivityIcon(item.type)}
                            <span
                              className={cn(
                                "truncate max-w-[120px]",
                                isDarkMode
                                  ? "text-slate-300"
                                  : "text-slate-700",
                              )}
                            >
                              {item.gigTitle}
                            </span>
                            <span className="text-slate-400">•</span>
                            <span
                              className={cn(
                                "text-xs",
                                isDarkMode
                                  ? "text-slate-500"
                                  : "text-slate-400",
                              )}
                            >
                              {Math.floor((Date.now() - item.timestamp) / 1000)}
                              s ago
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Mood Filters */}
                    <div className="px-4 pt-3">
                      <div
                        className={cn(
                          "flex gap-1 p-1 rounded-lg",
                          isDarkMode ? "bg-slate-800" : "bg-slate-100",
                        )}
                      >
                        {[
                          { id: "trending", label: "🔥 Trending" },
                          { id: "hot", label: "⚡ Hot" },
                          { id: "closing", label: "⏰ Closing" },
                        ].map((filter) => (
                          <button
                            key={filter.id}
                            onClick={() => setActiveTab(filter.id)}
                            className={cn(
                              "flex-1 py-1.5 rounded-md text-xs font-medium transition-all",
                              activeTab === filter.id
                                ? isDarkMode
                                  ? "bg-purple-600 text-white"
                                  : "bg-purple-500 text-white"
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

                    {/* Trending Picks */}
                    <div className="p-3">
                      <h4
                        className={cn(
                          "text-xs font-semibold mb-2",
                          isDarkMode ? "text-slate-400" : "text-slate-500",
                        )}
                      >
                        TRENDING PICKS
                      </h4>
                      <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto">
                        {filteredGigs
                          .slice(0, 6)
                          .map((gig: any, idx: number) => (
                            <div key={gig._id} className="relative">
                              {isChangingGig && selectedGigId === gig._id && (
                                <div className="absolute inset-0 bg-black/5 dark:bg-white/5 rounded-lg flex items-center justify-center z-10">
                                  <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
                                </div>
                              )}
                              <EngagingGigCard
                                gig={gig}
                                activeTab={activeTab}
                                index={idx}
                                onViewGig={handleViewGig}
                                isSelected={selectedGigId === gig._id}
                              />
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>

                  {/* SECTION 2: UPCOMING */}
                  <div className="space-y-3">
                    {/* Dropping Soon */}
                    <div
                      className={cn(
                        "rounded-xl border p-3",
                        isDarkMode
                          ? "bg-slate-900/80 border-purple-500/30"
                          : "bg-white/90 border-purple-200",
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Timer className="w-4 h-4 text-purple-500" />
                          <span
                            className={cn(
                              "text-sm font-bold",
                              isDarkMode ? "text-white" : "text-slate-900",
                            )}
                          >
                            Dropping Soon
                          </span>
                        </div>
                        <Badge
                          className={cn(
                            "text-xs",
                            isDarkMode
                              ? "bg-purple-500/20 text-purple-300"
                              : "bg-purple-100 text-purple-700",
                          )}
                        >
                          {upcomingInterestGigs.length}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {upcomingInterestGigs.slice(0, 3).map((gig) => {
                          const startTime = gig.acceptInterestStartTime!;
                          const daysUntil = Math.ceil(
                            (startTime - Date.now()) / (1000 * 60 * 60 * 24),
                          );
                          return (
                            <div
                              key={gig._id}
                              onClick={() => handleViewGig(gig)}
                              className={cn(
                                "relative text-center p-2 rounded-lg cursor-pointer transition-all",
                                isChangingGig &&
                                  selectedGigId === gig._id &&
                                  "pointer-events-none opacity-70",
                                isDarkMode
                                  ? "bg-slate-800/40 hover:bg-slate-800"
                                  : "bg-slate-50 hover:bg-slate-100",
                              )}
                            >
                              {isChangingGig && selectedGigId === gig._id && (
                                <div className="absolute inset-0 bg-black/5 dark:bg-white/5 rounded-lg flex items-center justify-center">
                                  <Loader2 className="w-3 h-3 animate-spin text-purple-500" />
                                </div>
                              )}
                              <div className="w-10 h-10 mx-auto rounded-full bg-purple-500 flex items-center justify-center text-white text-xs font-bold mb-1">
                                {daysUntil}d
                              </div>
                              <div className="text-xs truncate">
                                {gig.title}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* On the Horizon */}
                    <div
                      className={cn(
                        "rounded-xl border p-3",
                        isDarkMode
                          ? "bg-slate-900/80 border-emerald-500/30"
                          : "bg-white/90 border-emerald-200",
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-emerald-500" />
                          <span
                            className={cn(
                              "text-sm font-bold",
                              isDarkMode ? "text-white" : "text-slate-900",
                            )}
                          >
                            On the Horizon
                          </span>
                        </div>
                        <Badge
                          className={cn(
                            "text-xs",
                            isDarkMode
                              ? "bg-emerald-500/20 text-emerald-300"
                              : "bg-emerald-100 text-emerald-700",
                          )}
                        >
                          {upcomingEventGigs.length}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {upcomingEventGigs.slice(0, 3).map((gig) => {
                          const daysUntil = Math.ceil(
                            (gig.date - Date.now()) / (1000 * 60 * 60 * 24),
                          );
                          return (
                            <div
                              key={gig._id}
                              onClick={() => handleViewGig(gig)}
                              className={cn(
                                "relative text-center p-2 rounded-lg cursor-pointer transition-all",
                                isChangingGig &&
                                  selectedGigId === gig._id &&
                                  "pointer-events-none opacity-70",
                                isDarkMode
                                  ? "bg-slate-800/40 hover:bg-slate-800"
                                  : "bg-slate-50 hover:bg-slate-100",
                              )}
                            >
                              {isChangingGig && selectedGigId === gig._id && (
                                <div className="absolute inset-0 bg-black/5 dark:bg-white/5 rounded-lg flex items-center justify-center">
                                  <Loader2 className="w-3 h-3 animate-spin text-emerald-500" />
                                </div>
                              )}
                              <div className="w-10 h-10 mx-auto rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-bold mb-1">
                                {daysUntil}d
                              </div>
                              <div className="text-xs truncate">
                                {gig.title}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* SECTION 3: ONLINE STATS */}
                  <div
                    className={cn(
                      "rounded-xl border p-3",
                      isDarkMode
                        ? "bg-slate-900/60 border-slate-700"
                        : "bg-white/60 border-slate-200",
                    )}
                  >
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <div className="text-xs text-slate-500">Artists</div>
                        <div className="text-lg font-bold text-blue-500">
                          {onlineStats?.musicians || 0}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Bookers</div>
                        <div className="text-lg font-bold text-purple-500">
                          {onlineStats?.clients || 0}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Online</div>
                        <div className="text-lg font-bold text-emerald-500">
                          {onlineStats?.total || 0}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN - Loading Overlay */}
              <div className="md:col-span-2 space-y-6 relative">
                {/* Loading overlay */}
                <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm z-20 rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-purple-500 mx-auto mb-4" />
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Loading gig details...
                    </p>
                  </div>
                </div>

                {/* Existing right column content - dimmed */}
                <div className="opacity-30 pointer-events-none">
                  {/* Gig Info Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative group"
                  >
                    <Card
                      className={cn(
                        "relative border-2 overflow-hidden",
                        isDarkMode
                          ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-slate-700"
                          : "bg-gradient-to-br from-white via-slate-50 to-white border-slate-200",
                      )}
                    >
                      <CardContent className="p-6 relative">
                        {/* Poster Info */}
                        <div className="flex items-start justify-between mb-6">
                          <div className="flex items-center gap-4">
                            <Avatar className="w-14 h-14 border-2 border-white dark:border-slate-700">
                              <AvatarImage src={poster?.picture} />
                              <AvatarFallback className="bg-gradient-to-br from-purple-600 to-pink-600 text-white">
                                {poster?.firstname?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h4
                                className={cn(
                                  "font-semibold",
                                  isDarkMode ? "text-white" : "text-slate-900",
                                )}
                              >
                                {poster?.firstname} {poster?.lastname}
                              </h4>
                              <div className="flex items-center gap-2 mt-1">
                                <TrustStarsDisplay
                                  trustStars={poster?.trustStars || 0}
                                  size="sm"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Quick Info Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                          <InfoChip
                            icon={MapPin}
                            label="Location"
                            value={gig.location || "Remote"}
                            color="blue"
                            isDarkMode={isDarkMode}
                          />
                          <InfoChip
                            icon={Calendar}
                            label="Date"
                            value={formatDate(gig.date)}
                            color="emerald"
                            isDarkMode={isDarkMode}
                          />
                          <InfoChip
                            icon={Clock}
                            label="Time"
                            value={`${gig.time?.start || "TBD"} - ${gig.time?.end || "TBD"}`}
                            color="amber"
                            isDarkMode={isDarkMode}
                          />
                          <InfoChip
                            icon={DollarSign}
                            label="Budget"
                            value={
                              gig.price
                                ? `${gig.currency || "$"}${gig.price.toLocaleString()}`
                                : "Negotiable"
                            }
                            color="purple"
                            isDarkMode={isDarkMode}
                          />
                        </div>

                        {/* Description */}
                        <div className="mb-6">
                          <h3
                            className={cn(
                              "text-sm font-semibold mb-3 flex items-center gap-2",
                              isDarkMode ? "text-white" : "text-slate-900",
                            )}
                          >
                            <FileText className="w-4 h-4 text-purple-500" />
                            Description
                          </h3>
                          <p
                            className={cn(
                              "text-sm leading-relaxed",
                              isDarkMode ? "text-slate-300" : "text-slate-600",
                            )}
                          >
                            {gig.description}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Mobile Bottom Bar */}
            <div
              className={cn(
                "fixed bottom-0 left-0 right-0 z-30 md:hidden",
                "backdrop-blur-xl border-t p-3",
                isDarkMode
                  ? "bg-slate-900/80 border-slate-800"
                  : "bg-white/80 border-slate-200",
              )}
            >
              <div className="flex items-center justify-around">
                <button
                  onClick={() => setShowApplicantSidebar(true)}
                  className="flex flex-col items-center gap-1"
                >
                  <Activity className="w-5 h-5" />
                  <span className="text-xs">Activity</span>
                </button>
                {gig.bandCategory?.length && gig.bandCategory?.length > 0 && (
                  <button
                    onClick={() => setShowRoleDrawer(true)}
                    className="flex flex-col items-center gap-1"
                  >
                    <Music className="w-5 h-5" />
                    <span className="text-xs">Roles</span>
                  </button>
                )}
                {canWithdraw && (
                  <button
                    onClick={() => setShowWithdrawDialog(true)}
                    className="flex flex-col items-center gap-1 text-rose-500"
                  >
                    <XCircle className="w-5 h-5" />
                    <span className="text-xs">Withdraw</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(window.location.href);
                    toast.success("Link copied!");
                  }}
                  className="flex flex-col items-center gap-1"
                >
                  <Share2 className="w-5 h-5" />
                  <span className="text-xs">Share</span>
                </button>
              </div>
            </div>

            <div className="h-16 md:hidden" />
          </div>
        </div>
      </TooltipProvider>
    );
  }

  // Main render - fully loaded
  return (
    <TooltipProvider>
      <GigModal
        isOpen={showGigModal}
        onClose={() => {
          setShowGigModal(false);
          setSelectedGigForModal(null);
        }}
        gig={selectedGigForModal}
      />
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
              <div className="hidden md:block">{getMyStatusBadge()}</div>

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
                <Activity className="w-5 h-5" />
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
                onClick={() => {
                  navigator.clipboard?.writeText(window.location.href);
                  toast.success("Link copied to clipboard!");
                }}
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

          {/* Gig Title */}
          <div className="mb-8">
            <div className="relative mb-3">
              <h1
                className={cn(
                  "text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight",
                  isDarkMode ? "text-white" : "text-slate-900",
                )}
              >
                {gig.title}
              </h1>
              <div
                className={cn(
                  "absolute -bottom-1 left-0 w-16 h-1 rounded-full",
                  "bg-gradient-to-r from-purple-500 to-pink-500",
                )}
              />
            </div>

            {/* Meta information chips */}
            <div className="flex flex-wrap items-center gap-2 mt-4">
              <div
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full",
                  "text-xs font-medium transition-all border",
                  isDarkMode
                    ? "bg-purple-500/10 border-purple-500/30 text-purple-300"
                    : "bg-purple-50 border-purple-200 text-purple-700",
                )}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="capitalize">{gig.bussinesscat || "Gig"}</span>
              </div>

              <div
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full",
                  "text-xs font-medium transition-all border",
                  isDarkMode
                    ? "bg-blue-500/10 border-blue-500/30 text-blue-300"
                    : "bg-blue-50 border-blue-200 text-blue-700",
                )}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>{gig.location?.split(",")[0] || "Remote"}</span>
              </div>

              <div
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full",
                  "text-xs font-medium transition-all border",
                  isDarkMode
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                    : "bg-emerald-50 border-emerald-200 text-emerald-700",
                )}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>{formatDate(gig.date)}</span>
              </div>

              {gig.time?.start && (
                <div
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full",
                    "text-xs font-medium transition-all border",
                    isDarkMode
                      ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                      : "bg-amber-50 border-amber-200 text-amber-700",
                  )}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>
                    {gig.time.start} - {gig.time.end}
                  </span>
                </div>
              )}
            </div>

            {/* Stats Row */}
            <div className="flex items-center gap-4 mt-4 text-sm">
              {gig.interestedUsers && gig.interestedUsers.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-rose-500" />
                  <span
                    className={isDarkMode ? "text-slate-300" : "text-slate-600"}
                  >
                    {gig.interestedUsers.length} interested
                  </span>
                </div>
              )}

              {gig.viewCount && gig.viewCount.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-blue-500" />
                  <span
                    className={isDarkMode ? "text-slate-300" : "text-slate-600"}
                  >
                    {gig.viewCount.length} views
                  </span>
                </div>
              )}

              {gig.appliedUsers && gig.appliedUsers.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-amber-500" />
                  <span
                    className={isDarkMode ? "text-slate-300" : "text-slate-600"}
                  >
                    {gig.appliedUsers.length} applied
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Desktop Layout - Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* LEFT COLUMN - The Vibe */}
            <div className="hidden md:block md:col-span-1">
              {allGigsLoading ? (
                <Card
                  className={cn(
                    "border shadow-sm p-3",
                    isDarkMode
                      ? "bg-slate-900/50 border-slate-800"
                      : "bg-white border-slate-200",
                  )}
                >
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                </Card>
              ) : (
                <div className="space-y-3 sticky top-24">
                  {/* SECTION 1: THE BUZZ */}
                  <div
                    className={cn(
                      "rounded-xl border-2 overflow-hidden",
                      isDarkMode
                        ? "bg-gradient-to-b from-slate-900 via-slate-800/90 to-slate-900 border-purple-500/30"
                        : "bg-gradient-to-b from-white via-purple-50/30 to-white border-purple-200",
                    )}
                  >
                    <div
                      className={cn(
                        "px-4 py-3 border-b",
                        isDarkMode
                          ? "border-purple-500/20"
                          : "border-purple-200",
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-purple-500" />
                          <h3
                            className={cn(
                              "text-sm font-bold",
                              isDarkMode ? "text-white" : "text-slate-900",
                            )}
                          >
                            The Buzz
                          </h3>
                        </div>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs",
                            isDarkMode
                              ? "border-purple-500/30 text-purple-300"
                              : "border-purple-300 text-purple-700",
                          )}
                        >
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span>{onlineStats?.total || 0} here now</span>
                          </div>
                        </Badge>
                      </div>
                    </div>

                    {/* Live counters */}
                    <div
                      className={cn(
                        "px-4 py-2 border-b flex flex-wrap gap-3 text-xs",
                        isDarkMode
                          ? "bg-slate-800/50 border-slate-700"
                          : "bg-slate-100/50 border-slate-200",
                      )}
                    >
                      <span className="flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5 text-rose-400" />
                        {liveActivity.recentInterests} interested
                      </span>
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-3.5 h-3.5 text-amber-400" />
                        {liveActivity.recentApplications} applied
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {liveActivity.topLocation}
                      </span>
                    </div>

                    {/* Live feed */}
                    <div className="px-4 py-2 border-b">
                      <div
                        className={cn(
                          "text-xs font-semibold mb-2",
                          isDarkMode ? "text-slate-400" : "text-slate-500",
                        )}
                      >
                        LIVE ACTIVITY
                      </div>
                      <div className="space-y-1 max-h-[100px] overflow-hidden">
                        {liveFeed.slice(0, 3).map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-1.5 text-xs"
                          >
                            {getActivityIcon(item.type)}
                            <span
                              className={cn(
                                "truncate max-w-[120px]",
                                isDarkMode
                                  ? "text-slate-300"
                                  : "text-slate-700",
                              )}
                            >
                              {item.gigTitle}
                            </span>
                            <span className="text-slate-400">•</span>
                            <span
                              className={cn(
                                "text-xs",
                                isDarkMode
                                  ? "text-slate-500"
                                  : "text-slate-400",
                              )}
                            >
                              {Math.floor((Date.now() - item.timestamp) / 1000)}
                              s ago
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Mood Filters */}
                    <div className="px-4 pt-3">
                      <div
                        className={cn(
                          "flex gap-1 p-1 rounded-lg",
                          isDarkMode ? "bg-slate-800" : "bg-slate-100",
                        )}
                      >
                        {[
                          { id: "trending", label: "🔥 Trending" },
                          { id: "hot", label: "⚡ Hot" },
                          { id: "closing", label: "⏰ Closing" },
                        ].map((filter) => (
                          <button
                            key={filter.id}
                            onClick={() => setActiveTab(filter.id)}
                            className={cn(
                              "flex-1 py-1.5 rounded-md text-xs font-medium transition-all",
                              activeTab === filter.id
                                ? isDarkMode
                                  ? "bg-purple-600 text-white"
                                  : "bg-purple-500 text-white"
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

                    {/* Trending Picks */}
                    <div className="p-3">
                      <h4
                        className={cn(
                          "text-xs font-semibold mb-2",
                          isDarkMode ? "text-slate-400" : "text-slate-500",
                        )}
                      >
                        TRENDING PICKS
                      </h4>
                      <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto">
                        {filteredGigs
                          .slice(0, 6)
                          .map((gig: any, idx: number) => (
                            <div key={gig._id} className="relative">
                              {isChangingGig && selectedGigId === gig._id && (
                                <div className="absolute inset-0 bg-black/5 dark:bg-white/5 rounded-lg flex items-center justify-center z-10">
                                  <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
                                </div>
                              )}
                              <EngagingGigCard
                                gig={gig}
                                activeTab={activeTab}
                                index={idx}
                                onViewGig={handleViewGig}
                                isSelected={selectedGigId === gig._id}
                              />
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>

                  {/* SECTION 2: UPCOMING */}
                  <div className="space-y-3">
                    {/* Dropping Soon */}
                    <div
                      className={cn(
                        "rounded-xl border p-3",
                        isDarkMode
                          ? "bg-slate-900/80 border-purple-500/30"
                          : "bg-white/90 border-purple-200",
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Timer className="w-4 h-4 text-purple-500" />
                          <span
                            className={cn(
                              "text-sm font-bold",
                              isDarkMode ? "text-white" : "text-slate-900",
                            )}
                          >
                            Dropping Soon
                          </span>
                        </div>
                        <Badge
                          className={cn(
                            "text-xs",
                            isDarkMode
                              ? "bg-purple-500/20 text-purple-300"
                              : "bg-purple-100 text-purple-700",
                          )}
                        >
                          {upcomingInterestGigs.length}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {upcomingInterestGigs.slice(0, 3).map((gig) => {
                          const startTime = gig.acceptInterestStartTime!;
                          const daysUntil = Math.ceil(
                            (startTime - Date.now()) / (1000 * 60 * 60 * 24),
                          );
                          return (
                            <div
                              key={gig._id}
                              onClick={() => handleViewGig(gig)}
                              className={cn(
                                "relative text-center p-2 rounded-lg cursor-pointer transition-all",
                                isChangingGig &&
                                  selectedGigId === gig._id &&
                                  "pointer-events-none opacity-70",
                                isDarkMode
                                  ? "bg-slate-800/40 hover:bg-slate-800"
                                  : "bg-slate-50 hover:bg-slate-100",
                              )}
                            >
                              {isChangingGig && selectedGigId === gig._id && (
                                <div className="absolute inset-0 bg-black/5 dark:bg-white/5 rounded-lg flex items-center justify-center">
                                  <Loader2 className="w-3 h-3 animate-spin text-purple-500" />
                                </div>
                              )}
                              <div className="w-10 h-10 mx-auto rounded-full bg-purple-500 flex items-center justify-center text-white text-xs font-bold mb-1">
                                {daysUntil}d
                              </div>
                              <div className="text-xs truncate">
                                {gig.title}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* On the Horizon */}
                    <div
                      className={cn(
                        "rounded-xl border p-3",
                        isDarkMode
                          ? "bg-slate-900/80 border-emerald-500/30"
                          : "bg-white/90 border-emerald-200",
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-emerald-500" />
                          <span
                            className={cn(
                              "text-sm font-bold",
                              isDarkMode ? "text-white" : "text-slate-900",
                            )}
                          >
                            On the Horizon
                          </span>
                        </div>
                        <Badge
                          className={cn(
                            "text-xs",
                            isDarkMode
                              ? "bg-emerald-500/20 text-emerald-300"
                              : "bg-emerald-100 text-emerald-700",
                          )}
                        >
                          {upcomingEventGigs.length}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {upcomingEventGigs.slice(0, 3).map((gig) => {
                          const daysUntil = Math.ceil(
                            (gig.date - Date.now()) / (1000 * 60 * 60 * 24),
                          );
                          return (
                            <div
                              key={gig._id}
                              onClick={() => handleViewGig(gig)}
                              className={cn(
                                "relative text-center p-2 rounded-lg cursor-pointer transition-all",
                                isChangingGig &&
                                  selectedGigId === gig._id &&
                                  "pointer-events-none opacity-70",
                                isDarkMode
                                  ? "bg-slate-800/40 hover:bg-slate-800"
                                  : "bg-slate-50 hover:bg-slate-100",
                              )}
                            >
                              {isChangingGig && selectedGigId === gig._id && (
                                <div className="absolute inset-0 bg-black/5 dark:bg-white/5 rounded-lg flex items-center justify-center">
                                  <Loader2 className="w-3 h-3 animate-spin text-emerald-500" />
                                </div>
                              )}
                              <div className="w-10 h-10 mx-auto rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-bold mb-1">
                                {daysUntil}d
                              </div>
                              <div className="text-xs truncate">
                                {gig.title}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* SECTION 3: ONLINE STATS */}
                  <div
                    className={cn(
                      "rounded-xl border p-3",
                      isDarkMode
                        ? "bg-slate-900/60 border-slate-700"
                        : "bg-white/60 border-slate-200",
                    )}
                  >
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <div className="text-xs text-slate-500">Artists</div>
                        <div className="text-lg font-bold text-blue-500">
                          {onlineStats?.musicians || 0}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Bookers</div>
                        <div className="text-lg font-bold text-purple-500">
                          {onlineStats?.clients || 0}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Online</div>
                        <div className="text-lg font-bold text-emerald-500">
                          {onlineStats?.total || 0}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN - Main Content */}
            <div className="md:col-span-2 space-y-6">
              {/* Gig Info Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative group"
              >
                <Card
                  className={cn(
                    "relative border-2 overflow-hidden",
                    isDarkMode
                      ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-slate-700"
                      : "bg-gradient-to-br from-white via-slate-50 to-white border-slate-200",
                  )}
                >
                  <CardContent className="p-6 relative">
                    {/* BOOKED WATERMARK */}
                    {gig.isTaken && (
                      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-[-30deg] text-6xl font-bold text-red-500 whitespace-nowrap">
                          BOOKED
                        </div>
                      </div>
                    )}

                    {/* USER BOOKED STATUS */}
                    {isUserBookedInAnyRole && (
                      <div className="mb-6 p-4 rounded-xl border-2 border-emerald-500/30 bg-emerald-500/5">
                        <div className="flex items-center gap-2 mb-3">
                          <CheckCircle className="w-5 h-5 text-emerald-500" />
                          <h4 className="font-semibold text-emerald-500">
                            You're Booked! 🎉
                          </h4>
                        </div>
                        <div className="space-y-2">
                          {bookedRoles.map((role, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-2 p-2 rounded-lg bg-emerald-500/10"
                            >
                              <BadgeCheck className="w-4 h-4 text-emerald-500" />
                              <span className="text-sm text-emerald-500">
                                {role.role}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 flex items-center gap-2 text-xs text-emerald-600">
                          <Info className="w-3.5 h-3.5" />
                          <span>Check your messages for event details</span>
                        </div>
                      </div>
                    )}

                    {/* Poster Info */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <Avatar className="w-14 h-14 border-2 border-white dark:border-slate-700">
                          <AvatarImage src={poster?.picture} />
                          <AvatarFallback className="bg-gradient-to-br from-purple-600 to-pink-600 text-white">
                            {poster?.firstname?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4
                            className={cn(
                              "font-semibold",
                              isDarkMode ? "text-white" : "text-slate-900",
                            )}
                          >
                            {poster?.firstname} {poster?.lastname}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <TrustStarsDisplay
                              trustStars={poster?.trustStars || 0}
                              size="sm"
                            />
                            {poster?.verifiedIdentity && (
                              <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 text-xs">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <FollowButton
                        _id={gig.postedBy}
                        className={cn(
                          gig.isTaken && "opacity-50 pointer-events-none",
                        )}
                      />
                    </div>

                    {/* Quick Info Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                      <InfoChip
                        icon={MapPin}
                        label="Location"
                        value={gig.location || "Remote"}
                        color="blue"
                        isDarkMode={isDarkMode}
                      />
                      <InfoChip
                        icon={Calendar}
                        label="Date"
                        value={formatDate(gig.date)}
                        color="emerald"
                        isDarkMode={isDarkMode}
                      />
                      <InfoChip
                        icon={Clock}
                        label="Time"
                        value={`${gig.time?.start || "TBD"} - ${gig.time?.end || "TBD"}`}
                        color="amber"
                        isDarkMode={isDarkMode}
                      />
                      <InfoChip
                        icon={DollarSign}
                        label="Budget"
                        value={
                          gig.price
                            ? `${gig.currency || "$"}${gig.price.toLocaleString()}`
                            : "Negotiable"
                        }
                        color="purple"
                        isDarkMode={isDarkMode}
                      />
                    </div>

                    {/* Description */}
                    <div className="mb-6">
                      <h3
                        className={cn(
                          "text-sm font-semibold mb-3 flex items-center gap-2",
                          isDarkMode ? "text-white" : "text-slate-900",
                        )}
                      >
                        <FileText className="w-4 h-4 text-purple-500" />
                        Description
                      </h3>
                      <p
                        className={cn(
                          "text-sm leading-relaxed",
                          isDarkMode ? "text-slate-300" : "text-slate-600",
                        )}
                      >
                        {gig.description}
                      </p>
                    </div>

                    {/* Tags */}
                    {gig.tags && gig.tags.length > 0 && (
                      <div className="mb-6">
                        <h3
                          className={cn(
                            "text-sm font-semibold mb-3",
                            isDarkMode ? "text-white" : "text-slate-900",
                          )}
                        >
                          Tags
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {gig.tags.map((tag: string, i: number) => (
                            <Badge
                              key={i}
                              variant="secondary"
                              className={cn(
                                "px-3 py-1 text-xs",
                                isDarkMode
                                  ? "bg-slate-800 text-slate-300"
                                  : "bg-slate-100 text-slate-600",
                              )}
                            >
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Requirements */}
                    {gig.requirements && gig.requirements.length > 0 && (
                      <div className="mb-6">
                        <h3
                          className={cn(
                            "text-sm font-semibold mb-3 flex items-center gap-2",
                            isDarkMode ? "text-white" : "text-slate-900",
                          )}
                        >
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                          Requirements
                        </h3>
                        <ul className="space-y-2">
                          {gig.requirements.map((req: string, i: number) => (
                            <li key={i} className="flex items-start gap-2">
                              <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                                  {i + 1}
                                </span>
                              </div>
                              <span
                                className={cn(
                                  "text-sm",
                                  isDarkMode
                                    ? "text-slate-300"
                                    : "text-slate-600",
                                )}
                              >
                                {req}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Band Roles */}
                    {gig.bandCategory && gig.bandCategory.length > 0 && (
                      <div className="mb-6">
                        <h3
                          className={cn(
                            "text-sm font-semibold mb-3 flex items-center gap-2",
                            isDarkMode ? "text-white" : "text-slate-900",
                          )}
                        >
                          <Users className="w-4 h-4 text-purple-500" />
                          Band Roles
                        </h3>
                        <div className="grid grid-cols-2 gap-2">
                          {gig.bandCategory.map((role: any, index: number) => (
                            <div
                              key={index}
                              className={cn(
                                "p-3 rounded-lg border",
                                isDarkMode
                                  ? "bg-slate-800/30 border-slate-700"
                                  : "bg-slate-50 border-slate-200",
                              )}
                            >
                              <p className="text-sm font-medium">{role.role}</p>
                              <div className="flex items-center justify-between mt-2">
                                <Badge variant="outline" className="text-xs">
                                  {role.filledSlots}/{role.maxSlots} slots
                                </Badge>
                                {role.price && (
                                  <span className="text-xs text-emerald-500">
                                    {role.currency} {role.price}
                                  </span>
                                )}
                              </div>
                              {role.requiredSkills &&
                                role.requiredSkills.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {role.requiredSkills
                                      .slice(0, 2)
                                      .map((skill: string, i: number) => (
                                        <Badge
                                          key={i}
                                          variant="outline"
                                          className="text-[10px]"
                                        >
                                          {skill}
                                        </Badge>
                                      ))}
                                  </div>
                                )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <Button
                        className={cn(
                          "flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700",
                          gig.isTaken && "opacity-50 cursor-not-allowed",
                        )}
                        disabled={gig.isTaken}
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        {gig.isTaken ? "Gig Booked" : "Message"}
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          navigator.clipboard?.writeText(window.location.href);
                          toast.success("Link copied!");
                        }}
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Similar Gigs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h3
                  className={cn(
                    "text-lg font-semibold mb-4",
                    isDarkMode ? "text-white" : "text-slate-900",
                  )}
                >
                  Similar Gigs
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredGigs.slice(0, 2).map((similarGig: any) => (
                    <SimilarGigCard
                      key={similarGig._id}
                      gig={similarGig}
                      onView={handleViewGig}
                      isDarkMode={isDarkMode}
                    />
                  ))}
                </div>
              </motion.div>
            </div>
          </div>

          {/* Mobile Stats Bar */}
          <div className="md:hidden mt-4 flex items-center gap-4 overflow-x-auto pb-2">
            <div className="flex items-center gap-1.5 text-xs shrink-0">
              <Heart className="w-4 h-4 text-rose-500" />
              <span>
                {groupedApplicants?.interested?.length || 0} interested
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs shrink-0">
              <Briefcase className="w-4 h-4 text-amber-500" />
              <span>{groupedApplicants?.applied?.length || 0} applied</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs shrink-0">
              <Star className="w-4 h-4 text-emerald-500" />
              <span>
                {groupedApplicants?.shortlisted?.length || 0} shortlisted
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs shrink-0">
              <CheckCircle className="w-4 h-4 text-purple-500" />
              <span>{groupedApplicants?.booked?.length || 0} booked</span>
            </div>
          </div>

          {/* Mobile Bottom Bar */}
          <div
            className={cn(
              "fixed bottom-0 left-0 right-0 z-30 md:hidden",
              "backdrop-blur-xl border-t p-3",
              isDarkMode
                ? "bg-slate-900/80 border-slate-800"
                : "bg-white/80 border-slate-200",
            )}
          >
            <div className="flex items-center justify-around">
              <button
                onClick={() => setShowApplicantSidebar(true)}
                className="flex flex-col items-center gap-1"
              >
                <Activity className="w-5 h-5" />
                <span className="text-xs">Activity</span>
              </button>
              {gig?.bandCategory?.length && gig?.bandCategory?.length > 0 && (
                <button
                  onClick={() => setShowRoleDrawer(true)}
                  className="flex flex-col items-center gap-1"
                >
                  <Music className="w-5 h-5" />
                  <span className="text-xs">Roles</span>
                </button>
              )}
              {canWithdraw && (
                <button
                  onClick={() => setShowWithdrawDialog(true)}
                  className="flex flex-col items-center gap-1 text-rose-500"
                >
                  <XCircle className="w-5 h-5" />
                  <span className="text-xs">Withdraw</span>
                </button>
              )}
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(window.location.href);
                  toast.success("Link copied!");
                }}
                className="flex flex-col items-center gap-1"
              >
                <Share2 className="w-5 h-5" />
                <span className="text-xs">Share</span>
              </button>
            </div>
          </div>

          {/* Mobile Drawers */}
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
                  className={cn(
                    "fixed left-0 top-0 bottom-0 w-[85%] max-w-sm z-50 md:hidden",
                    "backdrop-blur-xl border-r p-4",
                    isDarkMode
                      ? "bg-slate-900/95 border-slate-800"
                      : "bg-white/95 border-slate-200",
                  )}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3
                      className={cn(
                        "font-semibold",
                        isDarkMode ? "text-white" : "text-slate-900",
                      )}
                    >
                      Platform Activity
                    </h3>
                    <button
                      onClick={() => setShowApplicantSidebar(false)}
                      className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <PlatformActivitySidebar
                    allGigs={allGigsData}
                    currentGigId={gigId as Id<"gigs">}
                    isDarkMode={isDarkMode}
                    onViewGig={handleViewGig}
                  />
                  <div className="mt-4">
                    <ComingSoonGigs
                      allGigs={allGigsData}
                      currentGigId={gigId as Id<"gigs">}
                      isDarkMode={isDarkMode}
                      onViewGig={handleViewGig}
                    />
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

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
                  className={cn(
                    "fixed left-0 right-0 bottom-0 z-50 md:hidden",
                    "backdrop-blur-xl border-t rounded-t-3xl p-4",
                    isDarkMode
                      ? "bg-slate-900/95 border-slate-800"
                      : "bg-white/95 border-slate-200",
                  )}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3
                      className={cn(
                        "font-semibold",
                        isDarkMode ? "text-white" : "text-slate-900",
                      )}
                    >
                      Band Roles
                    </h3>
                    <button
                      onClick={() => setShowRoleDrawer(false)}
                      className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="max-h-[60vh] overflow-y-auto space-y-3">
                    {gig.bandCategory?.map((role, index) => (
                      <RoleCard
                        key={index}
                        role={role}
                        index={index}
                        isDarkMode={isDarkMode}
                        currentUser={currentUser}
                        onApply={() => setShowRoleDrawer(false)}
                      />
                    ))}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          <div className="h-16 md:hidden" />
        </div>

        {/* Dialogs */}
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
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={selectedUser.picture} />
                      <AvatarFallback>
                        {selectedUser.firstname?.charAt(0)}
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
                      <TrustStarsDisplay
                        trustStars={selectedUser.trustStars || 0}
                        size="sm"
                      />
                    </div>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="text-lg font-bold">
                        {selectedUser.completedGigsCount || 0}
                      </div>
                      <div className="text-xs text-slate-500">Gigs</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold">
                        {selectedUser.followers?.length || 0}
                      </div>
                      <div className="text-xs text-slate-500">Followers</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold">
                        {selectedUser.avgRating?.toFixed(1) || "0.0"}
                      </div>
                      <div className="text-xs text-slate-500">Rating</div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      className="flex-1"
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
              <DialogTitle>Withdraw Application</DialogTitle>
              <DialogDescription>
                Are you sure you want to withdraw your application?
              </DialogDescription>
            </DialogHeader>
            <Textarea
              placeholder="Reason (optional)"
              value={withdrawReason}
              onChange={(e) => setWithdrawReason(e.target.value)}
              rows={3}
            />
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowWithdrawDialog(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleWithdraw}
                disabled={loading}
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Withdraw
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
