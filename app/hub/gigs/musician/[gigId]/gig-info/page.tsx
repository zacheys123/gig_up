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
  Mic,
  Volume2,
  Star,
  XCircle,
  MessageSquare,
  HeartIcon,
  Briefcase,
  StarIcon, // Filled star
  CheckCircle,
  Music,
  AlertCircle,
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

  // Helper functions for roles
  const isRoleFilled = (role: any) => role.filledSlots >= role.maxSlots;
  const getRemainingSlots = (role: any) => role.maxSlots - role.filledSlots;
  const getTotalSlots = (roles: any[]) =>
    roles.reduce((acc, role) => acc + role.maxSlots, 0);
  const getTotalFilled = (roles: any[]) =>
    roles.reduce((acc, role) => acc + role.filledSlots, 0);
  const getTotalRemaining = (roles: any[]) =>
    roles.reduce((acc, role) => acc + (role.maxSlots - role.filledSlots), 0);

  const getSlotStatusColor = (role: any) => {
    const remaining = getRemainingSlots(role);
    if (remaining === 0) return "text-red-500";
    if (remaining <= 2) return "text-yellow-500";
    return "text-green-500";
  };

  const getSlotStatusBg = (role: any) => {
    const remaining = getRemainingSlots(role);
    if (remaining === 0) return "bg-red-500";
    if (remaining <= 2) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getSlotStatusIcon = (role: any) => {
    const remaining = getRemainingSlots(role);
    if (remaining === 0) return <XCircle className="w-4 h-4 text-red-500" />;
    if (remaining <= 2)
      return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    return <CheckCircle className="w-4 h-4 text-green-500" />;
  };

  // Format date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get overall gig status
  const overallStatus = useMemo(() => {
    if (!gig?.bandCategory?.length) return null;
    const total = getTotalRemaining(gig.bandCategory);
    if (total === 0)
      return { color: "red", text: "Fully Booked", icon: XCircle };
    if (total <= 3)
      return { color: "yellow", text: "Almost Full", icon: AlertCircle };
    return { color: "green", text: "Open for Applications", icon: CheckCircle };
  }, [gig]);

  if (!gig) {
    console.log("No gig data in modal");
    return null;
  }
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden p-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className={cn(
            "relative overflow-hidden h-full",
            isDarkMode
              ? "bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900"
              : "bg-gradient-to-b from-white via-slate-50 to-white",
          )}
        >
          {/* Header with gradient - Responsive */}
          <div className="relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-90" />
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay" />

            <div className="relative p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-center gap-3 sm:gap-4">
                  {/* Avatar - Responsive sizing */}
                  <Avatar className="w-12 h-12 sm:w-16 sm:h-16 border-2 border-white/50 shadow-xl">
                    <AvatarImage src={gig?.logo} />
                    <AvatarFallback className="bg-white/20 text-white text-base sm:text-xl">
                      {gig?.title?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  {/* Title and badges - Responsive text */}
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg sm:text-2xl font-bold text-white truncate">
                      {gig?.title}
                    </h2>
                    <div className="flex flex-wrap items-center gap-2 mt-1 sm:mt-2">
                      <Badge className="bg-white/20 text-white border-0 text-[10px] sm:text-xs">
                        {gig?.bussinesscat || "Gig"}
                      </Badge>

                      {/* Overall Status Badge */}
                      {overallStatus && (
                        <Badge
                          className={cn(
                            "border-0 text-[10px] sm:text-xs",
                            overallStatus.color === "red" &&
                              "bg-red-500/20 text-white",
                            overallStatus.color === "yellow" &&
                              "bg-yellow-500/20 text-white",
                            overallStatus.color === "green" &&
                              "bg-green-500/20 text-white",
                          )}
                        >
                          {overallStatus.text}
                        </Badge>
                      )}

                      {gig?.isTaken && (
                        <Badge className="bg-red-500/20 text-white border-0 text-[10px] sm:text-xs">
                          Fully Booked
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Close button - Always visible */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="absolute top-2 right-2 sm:relative sm:top-0 sm:right-0 text-white hover:bg-white/20 shrink-0"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </div>

              {/* Quick Stats under header */}
              {gig?.bandCategory?.length > 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-3 text-white/80 text-xs sm:text-sm">
                  <div className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    <span>{getTotalSlots(gig.bandCategory)} total slots</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>{getTotalFilled(gig.bandCategory)} filled</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{getTotalRemaining(gig.bandCategory)} remaining</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Content - Responsive scrolling */}
          <div className="p-4 sm:p-6 max-h-[calc(90vh-180px)] overflow-y-auto">
            {/* Quick Info Grid - Responsive grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-6">
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
                value={gig?.date ? formatDate(gig.date) : "TBD"}
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

            {/* Stats Row */}
            {(gig?.interestedUsers?.length > 0 ||
              gig?.viewCount?.length > 0 ||
              gig?.appliedUsers?.length > 0) && (
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-4 sm:mb-6 p-3 sm:p-4 rounded-xl bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                {gig?.interestedUsers?.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <HeartIcon className="w-4 h-4 text-rose-500" />
                    <span className="text-xs sm:text-sm font-medium">
                      {gig.interestedUsers.length} interested
                    </span>
                  </div>
                )}
                {gig?.viewCount?.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-blue-500" />
                    <span className="text-xs sm:text-sm font-medium">
                      {gig.viewCount.length} views
                    </span>
                  </div>
                )}
                {gig?.appliedUsers?.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-amber-500" />
                    <span className="text-xs sm:text-sm font-medium">
                      {gig.appliedUsers.length} applied
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Band Roles - Enhanced with individual role checking */}
            {gig?.bandCategory && gig.bandCategory.length > 0 && (
              <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                  <h3 className="text-sm sm:text-base font-semibold flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                      <Users className="w-4 h-4 text-purple-500" />
                    </div>
                    Available Roles
                  </h3>

                  {/* Role summary */}
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs">
                      {
                        gig.bandCategory.filter(
                          (r: any) => getRemainingSlots(r) > 0,
                        ).length
                      }{" "}
                      open roles
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {getTotalRemaining(gig.bandCategory)} slots left
                    </Badge>
                  </div>
                </div>

                <div className="space-y-3">
                  {gig.bandCategory.map((role: any, index: number) => {
                    const remaining = getRemainingSlots(role);
                    const isFilled = remaining === 0;
                    const statusColor = getSlotStatusColor(role);
                    const statusBg = getSlotStatusBg(role);
                    const StatusIcon = getSlotStatusIcon(role);
                    const fillPercentage =
                      (role.filledSlots / role.maxSlots) * 100;

                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={cn(
                          "p-4 rounded-xl border transition-all",
                          isFilled
                            ? isDarkMode
                              ? "bg-slate-800/50 border-slate-700 opacity-70"
                              : "bg-slate-50 border-slate-200 opacity-70"
                            : isDarkMode
                              ? "bg-slate-800/30 border-slate-700 hover:border-purple-500/50 hover:shadow-lg"
                              : "bg-white border-slate-200 hover:border-purple-300 hover:shadow-md",
                        )}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                          {/* Left side - Role info */}
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold text-sm sm:text-base">
                                    {role.role}
                                  </h4>
                                  {role.requiredSkills?.length > 0 && (
                                    <Badge
                                      variant="outline"
                                      className="text-[10px] sm:text-xs"
                                    >
                                      {role.requiredSkills.length} skills
                                    </Badge>
                                  )}
                                </div>

                                {/* Slot Status with Icon */}
                                <div className="flex items-center gap-2 mt-2">
                                  {StatusIcon}
                                  <span
                                    className={cn(
                                      "text-xs sm:text-sm font-medium",
                                      statusColor,
                                    )}
                                  >
                                    {remaining === 0
                                      ? "Position filled"
                                      : `${remaining} slot${remaining > 1 ? "s" : ""} available`}
                                  </span>
                                </div>
                              </div>

                              {/* Price - Mobile friendly */}
                              {role.price && (
                                <div className="text-right sm:hidden">
                                  <span className="text-xs text-slate-500">
                                    Budget
                                  </span>
                                  <p className="font-bold text-emerald-500 text-sm">
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

                            {/* Progress Bar with details */}
                            <div className="mt-3 space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-500">Filled</span>
                                <span
                                  className={cn("font-medium", statusColor)}
                                >
                                  {role.filledSlots}/{role.maxSlots} positions
                                </span>
                              </div>
                              <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${fillPercentage}%` }}
                                  transition={{
                                    duration: 0.5,
                                    delay: index * 0.1,
                                  }}
                                  className={cn(
                                    "h-full transition-all",
                                    statusBg,
                                  )}
                                />
                              </div>
                            </div>

                            {/* Description - if available */}
                            {role.description && (
                              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-3">
                                {role.description}
                              </p>
                            )}

                            {/* Skills */}
                            {role.requiredSkills?.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-3">
                                {role.requiredSkills.map(
                                  (skill: string, i: number) => (
                                    <Badge
                                      key={i}
                                      variant="secondary"
                                      className="text-[8px] sm:text-[10px] px-1.5 py-0"
                                    >
                                      {skill}
                                    </Badge>
                                  ),
                                )}
                              </div>
                            )}

                            {/* Applicants count */}
                            {role.applicants?.length > 0 && (
                              <div className="mt-3 text-xs text-slate-500 flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {role.applicants.length} applicant
                                {role.applicants.length > 1 ? "s" : ""}
                              </div>
                            )}
                          </div>

                          {/* Right side - Price (Desktop) */}
                          {role.price && (
                            <div className="hidden sm:block text-right min-w-[100px]">
                              <span className="text-xs text-slate-500">
                                Budget per slot
                              </span>
                              <p className="font-bold text-emerald-500 text-lg">
                                {role.currency || "$"}
                                {role.price}
                              </p>
                              {role.negotiable && (
                                <span className="text-xs text-slate-400">
                                  Negotiable
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Overall Summary Card */}
                <div
                  className={cn(
                    "mt-4 p-4 rounded-xl border",
                    isDarkMode
                      ? "bg-slate-800/30 border-slate-700"
                      : "bg-slate-50 border-slate-200",
                  )}
                >
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <span className="text-xs text-slate-500">
                        Total Roles
                      </span>
                      <p className="text-lg font-bold">
                        {gig.bandCategory.length}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500">
                        Total Slots
                      </span>
                      <p className="text-lg font-bold">
                        {getTotalSlots(gig.bandCategory)}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500">Filled</span>
                      <p className="text-lg font-bold text-emerald-500">
                        {getTotalFilled(gig.bandCategory)}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500">Remaining</span>
                      <p
                        className={cn(
                          "text-lg font-bold",
                          getTotalRemaining(gig.bandCategory) === 0
                            ? "text-red-500"
                            : "text-green-500",
                        )}
                      >
                        {getTotalRemaining(gig.bandCategory)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Poster Info */}
            {gig?.poster && (
              <div
                className={cn(
                  "mb-6 p-4 rounded-xl flex items-center gap-3",
                  isDarkMode ? "bg-slate-800/30" : "bg-slate-50",
                )}
              >
                <Avatar className="w-10 h-10 sm:w-12 sm:h-12">
                  <AvatarImage src={gig.poster.picture} />
                  <AvatarFallback>
                    {gig.poster.firstname?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium text-sm sm:text-base">
                    {gig.poster.firstname} {gig.poster.lastname}
                  </p>
                  <TrustStarsDisplay
                    trustStars={gig.poster.trustStars || 0}
                    size="sm"
                  />
                </div>
                {gig.poster.verifiedIdentity && (
                  <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
            )}

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-sm sm:text-base font-semibold mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-500" />
                Description
              </h3>
              <p className="text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {gig?.description}
              </p>
            </div>

            {/* Tags */}
            {gig?.tags?.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold mb-3">Tags</h3>
                <div className="flex flex-wrap gap-1.5">
                  {gig.tags.map((tag: string, i: number) => (
                    <Badge
                      key={i}
                      variant="secondary"
                      className="text-[10px] sm:text-xs"
                    >
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Requirements */}
            {gig?.requirements?.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm sm:text-base font-semibold mb-3 flex items-center gap-2">
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
                      <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                        {req}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Buttons - Stack on mobile, row on desktop */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
              <Button
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white order-2 sm:order-1"
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
                className="flex-1 order-1 sm:order-2"
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

  console.log(currentUser?.firstname);
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
  const getMyStatusBadge = () => {
    if (!userApplication) return null;

    const badges = {
      poster: {
        gradient: "from-indigo-600 via-purple-600 to-pink-600",
        icon: Crown,
        label: "Gig Owner",
        description: "You created this gig",
        iconColor: "text-pink-300 group-hover:text-pink-200",
      },
      interested: {
        gradient: "from-sky-600 via-blue-600 to-indigo-600",
        icon: HeartIcon,
        label: "Interested",
        description: "You've shown interest in this gig",
        iconColor: "text-orange-400 group-hover:text-sky-200",
      },
      applied: {
        gradient: "from-amber-600 via-orange-600 to-red-600",
        icon: Briefcase,
        label: "Applied",
        description: "Your application is pending",
        iconColor: "text-amber-300 group-hover:text-amber-200",
      },
      shortlisted: {
        gradient: "from-emerald-600 via-teal-600 to-cyan-600",
        icon: StarIcon,
        label: "Shortlisted ✨",
        description: "You've been shortlisted!",
        iconColor: "text-emerald-300 group-hover:text-emerald-200",
      },
      booked: {
        gradient: "from-emerald-600 via-teal-600 to-cyan-600",
        icon: CheckCircle,
        label: "Booked ✓",
        description: "You're booked for this gig",
        iconColor: "text-emerald-300 group-hover:text-emerald-200",
      },
      "band-applicant": {
        gradient: "from-amber-600 via-orange-600 to-red-600",
        icon: Music,
        label: "Band Applicant For",
        description: `Applied as ${userApplication.role}`,
        iconColor: "text-amber-300 group-hover:text-amber-200",
      },
      "band-booked": {
        gradient: "from-emerald-600 via-teal-600 to-cyan-600",
        icon: CheckCircle,
        label: "Band Booked",
        description: `Booked as ${userApplication.role}`,
        iconColor: "text-emerald-300 group-hover:text-emerald-200",
      },
    };

    const badge = badges[userApplication.type as keyof typeof badges];
    if (!badge) return null;

    const Icon = badge.icon;

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative group cursor-help">
            {/* Glow effect behind badge */}
            <div
              className={cn(
                "absolute -inset-0.5 rounded-full opacity-75 group-hover:opacity-100",
                "bg-gradient-to-r blur transition duration-500 group-hover:duration-200",
                badge.gradient,
              )}
            />
            {/* Main badge */}
            <Badge
              className={cn(
                "relative px-4 py-2 rounded-full border-0",
                "bg-gradient-to-r",
                badge.gradient, // This is sky blue for interested
                "text-white", // This makes text white
                "flex items-center gap-2",
                "shadow-xl text-sm font-medium",
                "transition-all duration-300 group-hover:scale-105",
              )}
            >
              {/* Icon with orange color - overrides the white text color */}
              <Icon className="w-4 h-4  [&>path]:fill-current" />

              <span>
                {badge.label}
                {userApplication.role && (
                  <>
                    <span className="mx-1 opacity-50">•</span>
                    <span className="opacity-90">{userApplication.role}</span>
                  </>
                )}
              </span>
            </Badge>
          </div>
        </TooltipTrigger>

        <TooltipContent side="bottom" className="max-w-xs">
          <p className="text-sm">{badge.description}</p>
          {canWithdraw && (
            <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              You can withdraw your application
            </p>
          )}
        </TooltipContent>
      </Tooltip>
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
        return <HeartIcon className="w-3 h-3 text-rose-400" />;
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
  // Add this near your other useMemo hooks
  const similarGigs = useMemo(() => {
    if (!allGigsData || !gig) return [];

    // Get current gig's business category
    const currentCategory = gig.bussinesscat;

    // Filter gigs that:
    // 1. Are not the current gig
    // 2. Have the same business category
    // 3. Are active/not taken
    // 4. Sort by relevance (interested count, views, etc.)
    return allGigsData
      .filter(
        (g) =>
          g._id !== gig._id &&
          g.bussinesscat === currentCategory &&
          !g.isTaken &&
          g.isActive !== false,
      )
      .map((g) => ({
        ...g,
        relevanceScore:
          (g.interestedUsers?.length || 0) * 2 +
          (g.viewCount?.length || 0) +
          (g.appliedUsers?.length || 0) * 1.5,
      }))
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 4); // Show top 4 similar gigs
  }, [allGigsData, gig]);

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

                {/* Desktop Withdraw Button - Quick Action */}
                {canWithdraw && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowWithdrawDialog(true)}
                        className="hidden md:flex border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-400 dark:hover:bg-rose-950/30"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Withdraw
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Withdraw your application</p>
                    </TooltipContent>
                  </Tooltip>
                )}

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
                        <HeartIcon className="w-3.5 h-3.5 text-rose-400" />
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
          {/* Modern Header - Sticky & Integrated */}
          <div
            className={cn(
              "sticky top-0 z-30 -mx-3 sm:-mx-4 px-3 sm:px-4 py-3 mb-6",
              "backdrop-blur-xl",
              isDarkMode
                ? "bg-slate-900/80 border-b border-slate-800/50"
                : "bg-white/80 border-b border-slate-200/50",
              "shadow-lg shadow-slate-200/20 dark:shadow-slate-900/20",
            )}
          >
            <div className="max-w-7xl mx-auto">
              {/* Top Row: Navigation + Actions */}
              <div className="flex items-center justify-between">
                {/* Left: Back button with context */}
                <div className="flex items-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => router.back()}
                    className={cn(
                      "p-2.5 rounded-xl transition-all",
                      "border",
                      isDarkMode
                        ? "bg-slate-800/50 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 hover:border-slate-600"
                        : "bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300",
                      "shadow-sm hover:shadow-md",
                    )}
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </motion.button>

                  {/* Breadcrumb */}
                  <div className="hidden sm:block">
                    <div className="flex items-center gap-2 text-sm">
                      <span
                        className={cn(
                          "text-xs",
                          isDarkMode ? "text-slate-500" : "text-slate-400",
                        )}
                      >
                        Gigs / {gig.bussinesscat || "Talent"} /
                      </span>
                      <span
                        className={cn(
                          "font-medium text-sm max-w-[200px] truncate",
                          isDarkMode ? "text-slate-300" : "text-slate-700",
                        )}
                      >
                        {gig.title}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Center: Status Badge - Hidden on mobile */}
                <div className="absolute left-1/2 -translate-x-1/2 hidden lg:block">
                  {getMyStatusBadge()}
                </div>

                {/* Right: Action Buttons */}
                <div className="flex items-center gap-2">
                  {/* Desktop Withdraw Button */}
                  {canWithdraw && (
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="hidden md:block"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowWithdrawDialog(true)}
                        className={cn(
                          "gap-2 border shadow-sm",
                          isDarkMode
                            ? "border-rose-800/50 text-rose-400 hover:bg-rose-950/30 hover:border-rose-700"
                            : "border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300",
                        )}
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Withdraw</span>
                      </Button>
                    </motion.div>
                  )}

                  {/* Mobile menu buttons */}
                  <button
                    onClick={() => setShowApplicantSidebar(true)}
                    className={cn(
                      "md:hidden p-2.5 rounded-xl border transition-all",
                      isDarkMode
                        ? "bg-slate-800/50 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800"
                        : "bg-white border-slate-200 text-slate-600 hover:text-slate-900",
                      "shadow-sm",
                    )}
                  >
                    <Activity className="w-5 h-5" />
                  </button>

                  {gig.bandCategory && gig.bandCategory.length > 0 && (
                    <button
                      onClick={() => setShowRoleDrawer(true)}
                      className={cn(
                        "md:hidden p-2.5 rounded-xl border transition-all",
                        isDarkMode
                          ? "bg-slate-800/50 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800"
                          : "bg-white border-slate-200 text-slate-600 hover:text-slate-900",
                        "shadow-sm",
                      )}
                    >
                      <Music className="w-5 h-5" />
                    </button>
                  )}

                  {/* Share Button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      navigator.clipboard?.writeText(window.location.href);
                      toast.success("Link copied!");
                    }}
                    className={cn(
                      "p-2.5 rounded-xl border transition-all",
                      isDarkMode
                        ? "bg-slate-800/50 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800"
                        : "bg-white border-slate-200 text-slate-600 hover:text-slate-900",
                      "shadow-sm hover:shadow-md",
                    )}
                  >
                    <Share2 className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>

              {/* Mobile Status Badge - Visible only on mobile */}
              <div className="mt-3 flex justify-center md:hidden">
                {getMyStatusBadge()}
              </div>
            </div>
          </div>

          {/* Gig Title Section - Now separate from header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-4">
              <div className="relative">
                <div
                  className={cn(
                    "absolute -bottom-2 left-0 w-20 h-1.5 rounded-full",
                    "bg-gradient-to-r from-purple-500 to-pink-500",
                  )}
                />
              </div>

              {/* Quick action chips */}
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium",
                    "bg-purple-100 dark:bg-purple-900/30",
                    "text-purple-700 dark:text-purple-300",
                    "border border-purple-200 dark:border-purple-800",
                  )}
                >
                  ID: #{gig._id.slice(-6)}
                </div>
                {gig.isTaken && (
                  <div className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
                    Booked
                  </div>
                )}
              </div>
            </div>

            {/* BOOKING DISCLAIMER */}
            {isUserBookedInAnyRole && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <div
                  className={cn(
                    "inline-flex items-center gap-3 px-5 py-3 rounded-2xl",
                    "bg-gradient-to-r from-emerald-500/10 to-teal-500/10",
                    "border border-emerald-500/30",
                    "shadow-lg shadow-emerald-500/10",
                    "backdrop-blur-sm",
                  )}
                >
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-emerald-500" />
                    </div>
                    <motion.div
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 rounded-full bg-emerald-500/20"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                      You've already booked this gig
                    </p>
                    <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70">
                      Viewing booking details • {formatDate(gig.date)}
                    </p>
                  </div>
                  <Badge className="bg-emerald-500 text-white border-0 px-3 py-1">
                    Confirmed
                  </Badge>
                </div>
              </motion.div>
            )}

            {/* Meta information chips - Enhanced */}
            <div className="flex flex-wrap items-center gap-2 mt-4">
              <div
                className={cn(
                  "inline-flex items-center gap-1.5 px-4 py-2 rounded-xl",
                  "text-xs font-medium transition-all",
                  isDarkMode
                    ? "bg-purple-500/10 text-purple-300 border border-purple-500/20"
                    : "bg-purple-50 text-purple-700 border border-purple-200",
                  "shadow-sm",
                )}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="capitalize">{gig.bussinesscat || "Gig"}</span>
              </div>

              <div
                className={cn(
                  "inline-flex items-center gap-1.5 px-4 py-2 rounded-xl",
                  "text-xs font-medium transition-all",
                  isDarkMode
                    ? "bg-blue-500/10 text-blue-300 border border-blue-500/20"
                    : "bg-blue-50 text-blue-700 border border-blue-200",
                  "shadow-sm",
                )}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>{gig.location?.split(",")[0] || "Remote"}</span>
              </div>

              <div
                className={cn(
                  "inline-flex items-center gap-1.5 px-4 py-2 rounded-xl",
                  "text-xs font-medium transition-all",
                  isDarkMode
                    ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                    : "bg-emerald-50 text-emerald-700 border border-emerald-200",
                  "shadow-sm",
                )}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>{formatDate(gig.date)}</span>
              </div>

              {gig.time?.start && (
                <div
                  className={cn(
                    "inline-flex items-center gap-1.5 px-4 py-2 rounded-xl",
                    "text-xs font-medium transition-all",
                    isDarkMode
                      ? "bg-amber-500/10 text-amber-300 border border-amber-500/20"
                      : "bg-amber-50 text-amber-700 border border-amber-200",
                    "shadow-sm",
                  )}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>
                    {gig.time.start}
                    {gig.time.durationFrom} - {gig.time.end}
                    {gig?.time?.durationTo}
                  </span>
                </div>
              )}
            </div>

            {/* Stats Row - Enhanced */}
            <div className="flex items-center gap-6 mt-6">
              {gig.interestedUsers && gig.interestedUsers.length > 0 && (
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-rose-100 dark:bg-rose-900/30">
                    <HeartIcon className="w-4 h-4 text-rose-500" />
                  </div>
                  <div>
                    <span
                      className={cn(
                        "text-sm font-semibold",
                        isDarkMode ? "text-white" : "text-slate-900",
                      )}
                    >
                      {gig.interestedUsers.length}
                    </span>
                    <span
                      className={cn(
                        "text-xs ml-1",
                        isDarkMode ? "text-slate-400" : "text-slate-500",
                      )}
                    >
                      interested
                    </span>
                  </div>
                </div>
              )}

              {gig.viewCount && gig.viewCount.length > 0 && (
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    <Eye className="w-4 h-4 text-blue-500" />
                  </div>
                  <div>
                    <span
                      className={cn(
                        "text-sm font-semibold",
                        isDarkMode ? "text-white" : "text-slate-900",
                      )}
                    >
                      {gig.viewCount.length}
                    </span>
                    <span
                      className={cn(
                        "text-xs ml-1",
                        isDarkMode ? "text-slate-400" : "text-slate-500",
                      )}
                    >
                      views
                    </span>
                  </div>
                </div>
              )}

              {gig.appliedUsers && gig.appliedUsers.length > 0 && (
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                    <Briefcase className="w-4 h-4 text-amber-500" />
                  </div>
                  <div>
                    <span
                      className={cn(
                        "text-sm font-semibold",
                        isDarkMode ? "text-white" : "text-slate-900",
                      )}
                    >
                      {gig.appliedUsers.length}
                    </span>
                    <span
                      className={cn(
                        "text-xs ml-1",
                        isDarkMode ? "text-slate-400" : "text-slate-500",
                      )}
                    >
                      applied
                    </span>
                  </div>
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
                        <HeartIcon className="w-3.5 h-3.5 text-rose-400" />
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
                          "px-4 py-2 rounded-lg text-sm font-medium",
                          "transition-all duration-200",
                          colors.primaryBg,
                          "text-white",
                          colors.primaryBgHover,
                          "shadow-sm hover:shadow",
                          "active:scale-95",
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
                    <div className="flex gap-3 items-center">
                      {/* {currentUser?.instrument === gig?.category && (
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
                      )} */}
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

                    {/* DESKTOP WITHDRAW BUTTON - Add this right after action buttons */}
                    {canWithdraw && (
                      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <Button
                          variant="destructive"
                          onClick={() => setShowWithdrawDialog(true)}
                          className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:from-rose-600 hover:to-pink-600"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Withdraw Application
                        </Button>
                        <p className="text-xs text-center mt-2 text-slate-500">
                          Withdraw your interest or application from this gig
                        </p>
                      </div>
                    )}
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
                  {similarGigs.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3
                          className={cn(
                            "text-lg font-semibold",
                            isDarkMode ? "text-white" : "text-slate-900",
                          )}
                        >
                          Similar {gig.bussinesscat} Gigs
                        </h3>
                        <Badge variant="outline" className="text-xs">
                          {similarGigs.length} available
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {similarGigs.map((similarGig: any) => (
                          <SimilarGigCard
                            key={similarGig._id}
                            gig={similarGig}
                            onView={handleViewGig}
                            isDarkMode={isDarkMode}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                  {similarGigs.length === 0 && allGigsData && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center p-8 rounded-xl border border-dashed"
                    >
                      <p
                        className={cn(
                          "text-sm",
                          isDarkMode ? "text-slate-400" : "text-slate-500",
                        )}
                      >
                        No other {gig.bussinesscat} gigs available right now
                      </p>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </div>
          </div>

          {/* Mobile Stats Bar - Updated to match desktop */}
          <div className="md:hidden mt-4 flex items-center gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {/* Optional: Show count of visible stats */}
            {gig.interestedUsers?.length +
              gig.viewCount?.length +
              gig.appliedUsers?.length >
              3 && (
              <div className="shrink-0">
                <div
                  className={cn(
                    "px-2 py-1 rounded-lg text-xs font-medium",
                    isDarkMode
                      ? "bg-slate-800 text-slate-300"
                      : "bg-slate-100 text-slate-600",
                  )}
                >
                  +
                  {gig.interestedUsers?.length +
                    gig.viewCount?.length +
                    gig.appliedUsers?.length -
                    3}{" "}
                  more
                </div>
              </div>
            )}
            {/* Interested count - matches desktop */}
            {gig.interestedUsers && gig.interestedUsers.length > 0 && (
              <div className="flex items-center gap-1.5 shrink-0">
                <div className="p-1 rounded-lg bg-rose-100 dark:bg-rose-900/30">
                  <HeartIcon className="w-3.5 h-3.5 text-rose-500" />
                </div>
                <div>
                  <span
                    className={cn(
                      "text-sm font-semibold",
                      isDarkMode ? "text-white" : "text-slate-900",
                    )}
                  >
                    {gig.interestedUsers.length}
                  </span>
                  <span
                    className={cn(
                      "text-xs ml-1",
                      isDarkMode ? "text-slate-400" : "text-slate-500",
                    )}
                  >
                    interested
                  </span>
                </div>
              </div>
            )}

            {/* Views count - matches desktop */}
            {gig.viewCount && gig.viewCount.length > 0 && (
              <div className="flex items-center gap-1.5 shrink-0">
                <div className="p-1 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <Eye className="w-3.5 h-3.5 text-blue-500" />
                </div>
                <div>
                  <span
                    className={cn(
                      "text-sm font-semibold",
                      isDarkMode ? "text-white" : "text-slate-900",
                    )}
                  >
                    {gig.viewCount.length}
                  </span>
                  <span
                    className={cn(
                      "text-xs ml-1",
                      isDarkMode ? "text-slate-400" : "text-slate-500",
                    )}
                  >
                    views
                  </span>
                </div>
              </div>
            )}

            {/* Applied count - matches desktop */}
            {gig.appliedUsers && gig.appliedUsers.length > 0 && (
              <div className="flex items-center gap-1.5 shrink-0">
                <div className="p-1 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                  <Briefcase className="w-3.5 h-3.5 text-amber-500" />
                </div>
                <div>
                  <span
                    className={cn(
                      "text-sm font-semibold",
                      isDarkMode ? "text-white" : "text-slate-900",
                    )}
                  >
                    {gig.appliedUsers.length}
                  </span>
                  <span
                    className={cn(
                      "text-xs ml-1",
                      isDarkMode ? "text-slate-400" : "text-slate-500",
                    )}
                  >
                    applied
                  </span>
                </div>
              </div>
            )}

            {/* Shortlisted count - if available */}
            {gig.shortlistedUsers && gig.shortlistedUsers.length > 0 && (
              <div className="flex items-center gap-1.5 shrink-0">
                <div className="p-1 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                  <StarIcon className="w-3.5 h-3.5 text-emerald-500" />
                </div>
                <div>
                  <span
                    className={cn(
                      "text-sm font-semibold",
                      isDarkMode ? "text-white" : "text-slate-900",
                    )}
                  >
                    {gig.shortlistedUsers.length}
                  </span>
                  <span
                    className={cn(
                      "text-xs ml-1",
                      isDarkMode ? "text-slate-400" : "text-slate-500",
                    )}
                  >
                    shortlisted
                  </span>
                </div>
              </div>
            )}

            {/* Booked count - if available */}
            {gig.bookedBy && (
              <div className="flex items-center gap-1.5 shrink-0">
                <div className="p-1 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                  <CheckCircle className="w-3.5 h-3.5 text-purple-500" />
                </div>
                <div>
                  <span
                    className={cn(
                      "text-sm font-semibold",
                      isDarkMode ? "text-white" : "text-slate-900",
                    )}
                  >
                    1
                  </span>
                  <span
                    className={cn(
                      "text-xs ml-1",
                      isDarkMode ? "text-slate-400" : "text-slate-500",
                    )}
                  >
                    booked
                  </span>
                </div>
              </div>
            )}

            {/* Band roles count - additional info for mobile */}
            {gig.bandCategory && gig.bandCategory.length > 0 && (
              <div className="flex items-center gap-1.5 shrink-0">
                <div className="p-1 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                  <Users className="w-3.5 h-3.5 text-indigo-500" />
                </div>
                <div>
                  <span
                    className={cn(
                      "text-sm font-semibold",
                      isDarkMode ? "text-white" : "text-slate-900",
                    )}
                  >
                    {gig.bandCategory.length}
                  </span>
                  <span
                    className={cn(
                      "text-xs ml-1",
                      isDarkMode ? "text-slate-400" : "text-slate-500",
                    )}
                  >
                    roles
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Add scrollbar hiding styles */}
          <style jsx>{`
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
            .scrollbar-hide {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
          `}</style>

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
