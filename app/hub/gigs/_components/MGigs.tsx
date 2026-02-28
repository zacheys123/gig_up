// components/gigs/MyGigs.tsx
"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { motion, Variants } from "framer-motion";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useGigs } from "@/hooks/useAllGigs";
import clsx from "clsx";

// Components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Types
type DisplayMode = "grid" | "list" | "timeline" | "calendar" | "kanban";
type ViewFilter = "all" | "client" | "musician";
type DateFilter = "all" | "upcoming" | "past" | "today";
type PaymentFilter = "all" | "paid" | "pending";

// Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 400, damping: 30 },
  },
  hover: {
    scale: 1.02,
    transition: { type: "spring", stiffness: 400, damping: 20 },
  },
  tap: { scale: 0.98 },
};

const statsVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      type: "spring",
      stiffness: 300,
      damping: 25,
    },
  }),
};

const filterVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", stiffness: 400, damping: 30 },
  },
};
import { AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useThemeColors } from "@/hooks/useTheme";
import {
  X,
  Calendar,
  MapPin,
  DollarSign,
  Clock,
  Heart,
  Eye,
  Users,
  Users2,
  Music,
  Mic,
  Volume2,
  User,
  Edit3,
  Copy,
  Share2,
  Star,
  Briefcase,
  Award,
  CheckCircle,
  AlertCircle,
  Phone,
  Mail,
  Globe,
  Instagram,
  Twitter,
  Youtube,
  Facebook,
  MessageSquare,
  Bookmark,
  Send,
  Download,
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  Plus,
  Grid3x3,
  List,
  CalendarDays,
  Kanban,
  ChevronUp,
  MoreHorizontal,
  Info,
  Activity,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { TrustStarsDisplay } from "@/components/trust/TrustStarsDisplay";

interface GigDetailModalProps {
  gig: any;
  onClose: () => void;
  onEdit?: () => void;
  onShare?: () => void;
}

const GigDetailModal: React.FC<GigDetailModalProps> = ({
  gig,
  onClose,
  onEdit,
  onShare,
}) => {
  const { isDarkMode } = useThemeColors();
  const [activeTab, setActiveTab] = useState("overview");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Mock images for gallery (you can replace with actual gig images)
  const images = gig.gallery || [gig.logo, gig.logo, gig.logo].filter(Boolean);

  // Determine gig type
  const gigType = gig.bussinesscat?.toLowerCase() || "";
  const isVocalistGig = gigType === "vocalist";
  const isMcGig = gigType === "mc";
  const isDjGig = gigType === "dj";
  const isPersonalGig = gigType === "personal";
  const isFullBandGig = gigType === "full";
  const isBandCreationGig = gigType === "other";

  // Get gig type icon and color
  const getGigTypeInfo = () => {
    if (isVocalistGig)
      return {
        icon: Music,
        color: "text-pink-500",
        bg: "bg-pink-500/10",
        label: "Vocalist",
      };
    if (isMcGig)
      return {
        icon: Mic,
        color: "text-orange-500",
        bg: "bg-orange-500/10",
        label: "MC",
      };
    if (isDjGig)
      return {
        icon: Volume2,
        color: "text-purple-500",
        bg: "bg-purple-500/10",
        label: "DJ",
      };
    if (isPersonalGig)
      return {
        icon: User,
        color: "text-emerald-500",
        bg: "bg-emerald-500/10",
        label: "Personal",
      };
    if (isFullBandGig)
      return {
        icon: Users2,
        color: "text-blue-500",
        bg: "bg-blue-500/10",
        label: "Full Band",
      };
    if (isBandCreationGig)
      return {
        icon: Users,
        color: "text-indigo-500",
        bg: "bg-indigo-500/10",
        label: "Band Creation",
      };
    return {
      icon: Music,
      color: "text-slate-500",
      bg: "bg-slate-500/10",
      label: "Gig",
    };
  };

  const gigTypeInfo = getGigTypeInfo();
  const TypeIcon = gigTypeInfo.icon;

  // Format date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Format time
  const formatTime = (timeStr?: string) => {
    if (!timeStr) return "TBD";
    return timeStr;
  };

  // Handle share
  const handleShare = () => {
    if (onShare) {
      onShare();
    } else {
      navigator.clipboard.writeText(
        window.location.origin + `/hub/gigs/${gig._id}`,
      );
      toast.success("Link copied to clipboard!");
    }
  };

  // Handle next/prev image
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className={cn(
          "relative w-full max-w-5xl max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl",
          isDarkMode ? "bg-slate-900" : "bg-white",
        )}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className={cn(
            "absolute top-4 right-4 z-20 p-2 rounded-full transition-all",
            "bg-black/50 hover:bg-black/70 text-white",
            "backdrop-blur-sm",
          )}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col h-full">
          {/* Hero Section with Image Gallery */}
          <div className="relative h-64 md:h-80 lg:h-96 bg-gradient-to-br from-slate-900 to-slate-800">
            {images.length > 0 ? (
              <>
                <img
                  src={images[currentImageIndex]}
                  alt={gig.title}
                  className="w-full h-full object-cover"
                />
                {/* Image navigation */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-all"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-all"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    {/* Image indicators */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {images.map((_: any, i: number) => (
                        <button
                          key={i}
                          onClick={() => setCurrentImageIndex(i)}
                          className={cn(
                            "w-2 h-2 rounded-full transition-all",
                            i === currentImageIndex
                              ? "bg-white w-4"
                              : "bg-white/50 hover:bg-white/80",
                          )}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <TypeIcon className="w-24 h-24 text-white/20" />
              </div>
            )}

            {/* Status badge overlay */}
            <div className="absolute top-4 left-4 flex gap-2">
              <Badge
                className={cn(
                  "px-3 py-1 text-xs font-medium",
                  gig.isTaken
                    ? "bg-red-500 text-white"
                    : gig.isPending
                      ? "bg-amber-500 text-white"
                      : "bg-emerald-500 text-white",
                )}
              >
                {gig.isTaken ? "Booked" : gig.isPending ? "Pending" : "Active"}
              </Badge>
              <Badge
                className={cn(
                  "px-3 py-1 text-xs font-medium",
                  gigTypeInfo.bg,
                  gigTypeInfo.color,
                  "border-0",
                )}
              >
                <TypeIcon className="w-3 h-3 mr-1" />
                {gigTypeInfo.label}
              </Badge>
            </div>
          </div>

          {/* Content Section */}
          <div className="flex-1 overflow-hidden">
            <div className="p-6">
              {/* Title and quick actions */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2
                    className={cn(
                      "text-2xl font-bold",
                      isDarkMode ? "text-white" : "text-slate-900",
                    )}
                  >
                    {gig.title}
                  </h2>
                  <div className="flex items-center gap-2 mt-2">
                    <TrustStarsDisplay
                      trustStars={gig.poster?.trustStars || 0}
                      size="sm"
                    />
                    {gig.poster?.verifiedIdentity && (
                      <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShare}
                    className="gap-2"
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </Button>
                  {onEdit && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onEdit}
                      className="gap-2"
                    >
                      <Edit3 className="w-4 h-4" />
                      Edit
                    </Button>
                  )}
                </div>
              </div>

              {/* Quick Info Chips */}
              <div className="flex flex-wrap gap-2 mb-6">
                <div
                  className={cn(
                    "flex items-center gap-1 px-3 py-1.5 rounded-full text-xs",
                    isDarkMode ? "bg-slate-800" : "bg-slate-100",
                  )}
                >
                  <Calendar className="w-3 h-3 text-blue-500" />
                  <span>{formatDate(gig.date)}</span>
                </div>

                {gig.time?.start && (
                  <div
                    className={cn(
                      "flex items-center gap-1 px-3 py-1.5 rounded-full text-xs",
                      isDarkMode ? "bg-slate-800" : "bg-slate-100",
                    )}
                  >
                    <Clock className="w-3 h-3 text-amber-500" />
                    <span>
                      {gig.time.start} - {gig.time.end}
                    </span>
                  </div>
                )}

                <div
                  className={cn(
                    "flex items-center gap-1 px-3 py-1.5 rounded-full text-xs",
                    isDarkMode ? "bg-slate-800" : "bg-slate-100",
                  )}
                >
                  <MapPin className="w-3 h-3 text-purple-500" />
                  <span>{gig.location || "Remote"}</span>
                </div>

                {gig.price > 0 && (
                  <div
                    className={cn(
                      "flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium",
                      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
                    )}
                  >
                    <DollarSign className="w-3 h-3" />
                    <span>
                      {gig.currency || "KES"} {gig.price.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-4 gap-3 mb-6">
                <div
                  className={cn(
                    "text-center p-2 rounded-lg",
                    isDarkMode ? "bg-slate-800/50" : "bg-slate-50",
                  )}
                >
                  <Heart
                    className={cn(
                      "w-4 h-4 mx-auto mb-1",
                      gig.interestedUsers?.length > 0
                        ? "text-rose-500"
                        : "text-slate-400",
                    )}
                  />
                  <div className="text-sm font-bold">
                    {gig.interestedUsers?.length || 0}
                  </div>
                  <div className="text-[10px] text-slate-500">Interested</div>
                </div>

                <div
                  className={cn(
                    "text-center p-2 rounded-lg",
                    isDarkMode ? "bg-slate-800/50" : "bg-slate-50",
                  )}
                >
                  <Eye className="w-4 h-4 mx-auto mb-1 text-blue-500" />
                  <div className="text-sm font-bold">
                    {gig.viewCount?.length || 0}
                  </div>
                  <div className="text-[10px] text-slate-500">Views</div>
                </div>

                <div
                  className={cn(
                    "text-center p-2 rounded-lg",
                    isDarkMode ? "bg-slate-800/50" : "bg-slate-50",
                  )}
                >
                  <Briefcase className="w-4 h-4 mx-auto mb-1 text-amber-500" />
                  <div className="text-sm font-bold">
                    {gig.appliedUsers?.length || 0}
                  </div>
                  <div className="text-[10px] text-slate-500">Applied</div>
                </div>

                <div
                  className={cn(
                    "text-center p-2 rounded-lg",
                    isDarkMode ? "bg-slate-800/50" : "bg-slate-50",
                  )}
                >
                  <Award className="w-4 h-4 mx-auto mb-1 text-purple-500" />
                  <div className="text-sm font-bold">{gig.maxSlots || 1}</div>
                  <div className="text-[10px] text-slate-500">Slots</div>
                </div>
              </div>

              {/* Tabs for detailed info */}
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="poster">Poster</TabsTrigger>
                </TabsList>

                <ScrollArea className="h-[200px] mt-4 pr-4">
                  <TabsContent value="overview" className="space-y-4">
                    <div>
                      <h4
                        className={cn(
                          "font-semibold mb-2",
                          isDarkMode ? "text-white" : "text-slate-900",
                        )}
                      >
                        Description
                      </h4>
                      <p
                        className={cn(
                          "text-sm",
                          isDarkMode ? "text-slate-300" : "text-slate-600",
                        )}
                      >
                        {gig.description || "No description provided."}
                      </p>
                    </div>

                    {gig.requirements && gig.requirements.length > 0 && (
                      <div>
                        <h4
                          className={cn(
                            "font-semibold mb-2",
                            isDarkMode ? "text-white" : "text-slate-900",
                          )}
                        >
                          Requirements
                        </h4>
                        <ul className="list-disc list-inside space-y-1">
                          {gig.requirements.map((req: string, i: number) => (
                            <li
                              key={i}
                              className={cn(
                                "text-sm",
                                isDarkMode
                                  ? "text-slate-300"
                                  : "text-slate-600",
                              )}
                            >
                              {req}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="details" className="space-y-4">
                    {gig.bandCategory && gig.bandCategory.length > 0 && (
                      <div>
                        <h4
                          className={cn(
                            "font-semibold mb-2",
                            isDarkMode ? "text-white" : "text-slate-900",
                          )}
                        >
                          Band Roles
                        </h4>
                        <div className="space-y-2">
                          {gig.bandCategory.map((role: any, i: number) => (
                            <div
                              key={i}
                              className={cn(
                                "p-3 rounded-lg border",
                                isDarkMode
                                  ? "bg-slate-800/50 border-slate-700"
                                  : "bg-slate-50 border-slate-200",
                              )}
                            >
                              <div className="flex justify-between">
                                <span className="font-medium">{role.role}</span>
                                <Badge variant="outline">
                                  {role.filledSlots || 0}/{role.maxSlots} filled
                                </Badge>
                              </div>
                              {role.description && (
                                <p className="text-xs mt-1 text-slate-500">
                                  {role.description}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {gig.tags && gig.tags.length > 0 && (
                      <div>
                        <h4
                          className={cn(
                            "font-semibold mb-2",
                            isDarkMode ? "text-white" : "text-slate-900",
                          )}
                        >
                          Tags
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {gig.tags.map((tag: string, i: number) => (
                            <Badge
                              key={i}
                              variant="secondary"
                              className="text-xs"
                            >
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="poster" className="space-y-4">
                    {gig.poster && (
                      <div className="flex items-start gap-4">
                        <Avatar className="w-16 h-16">
                          <AvatarImage src={gig.poster.picture} />
                          <AvatarFallback className="text-lg">
                            {gig.poster.firstname?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4
                            className={cn(
                              "font-semibold",
                              isDarkMode ? "text-white" : "text-slate-900",
                            )}
                          >
                            {gig.poster.firstname} {gig.poster.lastname}
                          </h4>
                          <TrustStarsDisplay
                            trustStars={gig.poster.trustStars || 0}
                            size="sm"
                          />

                          <div className="flex gap-2 mt-3">
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-2"
                            >
                              <MessageSquare className="w-4 h-4" />
                              Message
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-2"
                            >
                              <Eye className="w-4 h-4" />
                              View Profile
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </TabsContent>
                </ScrollArea>
              </Tabs>
            </div>
          </div>

          {/* Footer with actions */}
          <div
            className={cn(
              "p-4 border-t",
              isDarkMode ? "border-slate-800" : "border-slate-200",
            )}
          >
            <div className="flex gap-3">
              <Button className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                <MessageSquare className="w-4 h-4 mr-2" />
                Contact Host
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleShare}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Link
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const CompactGigCard = ({
  gig,
  onViewDetails,
}: {
  gig: any;
  onViewDetails?: (gig: any) => void;
}) => {
  const { isDarkMode } = useThemeColors();
  const router = useRouter();
  const [showActions, setShowActions] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const dateStatus = useMemo(() => {
    const gigDate = new Date(gig.date);
    const now = new Date();
    const today = new Date(now.setHours(0, 0, 0, 0));

    return {
      isToday: gigDate.toDateString() === today.toDateString(),
      isPast: gigDate < today,
      isFuture: gigDate > now,
    };
  }, [gig.date]);

  const getStatusColor = () => {
    if (gig.isTaken) return "bg-slate-500";
    if (gig.isPending) return "bg-amber-500";
    if (dateStatus.isToday) return "bg-emerald-500";
    if (dateStatus.isFuture) return "bg-blue-500";
    return "bg-slate-400";
  };

  const getStatusLabel = () => {
    if (gig.isTaken) return "Completed";
    if (gig.isPending) return "Pending";
    if (dateStatus.isToday) return "Today";
    if (dateStatus.isFuture) return "Upcoming";
    return "Past";
  };

  // Determine gig type based on bussinesscat
  const gigType = gig.bussinesscat?.toLowerCase() || "";

  const isVocalistGig = gigType === "vocalist";
  const isMcGig = gigType === "mc";
  const isDjGig = gigType === "dj";
  const isPersonalGig = gigType === "personal";
  const isFullBandGig = gigType === "full";
  const isBandCreationGig = gigType === "other";
  const isRegularGig =
    isVocalistGig || isMcGig || isDjGig || isPersonalGig || isFullBandGig;

  // Calculate metrics
  const interestedCount = isRegularGig ? gig.interestedUsers?.length || 0 : 0;
  const bandRoleApplicantsCount = isBandCreationGig
    ? gig.bandCategory?.reduce(
        (total: number, role: any) => total + (role.applicants?.length || 0),
        0,
      ) || 0
    : 0;
  const bandApplicationsCount = isFullBandGig ? gig.bookCount?.length || 0 : 0;

  // Get primary info icon
  const getPrimaryInfo = () => {
    if (isBandCreationGig && bandRoleApplicantsCount > 0) {
      return {
        icon: Users,
        count: bandRoleApplicantsCount,
        label: "roles",
        color: "text-indigo-500",
      };
    }
    if (isFullBandGig && bandApplicationsCount > 0) {
      return {
        icon: Users2,
        count: bandApplicationsCount,
        label: "bands",
        color: "text-purple-500",
      };
    }
    if (interestedCount > 0) {
      return {
        icon: Heart,
        count: interestedCount,
        label: "interested",
        color: "text-rose-500",
      };
    }
    return null;
  };

  const primaryInfo = getPrimaryInfo();
  const PrimaryIcon = primaryInfo?.icon || Music;

  const handleMoreClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowActions(!showActions);
  };

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(gig);
    } else {
      router.push(`/hub/gigs/${gig._id}`);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/hub/gigs/client/edit/${gig._id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative cursor-pointer"
      onClick={handleViewDetails}
    >
      <Card
        className={cn(
          "overflow-hidden border-2 transition-all duration-200",
          isDarkMode
            ? "bg-slate-900/90 border-slate-800 hover:border-slate-700"
            : "bg-white border-slate-200 hover:border-slate-300",
          isHovered &&
            (isDarkMode ? "shadow-lg shadow-slate-800/50" : "shadow-lg"),
        )}
      >
        {/* Status indicator line */}
        <div className={cn("h-1 w-full", getStatusColor())} />

        <CardContent className="p-3">
          <div className="flex items-start gap-2">
            {/* Icon/Avatar */}
            <Avatar className="w-10 h-10 rounded-lg shrink-0">
              <AvatarImage src={gig.logo} />
              <AvatarFallback
                className={cn(
                  "text-lg",
                  isDarkMode ? "bg-slate-800" : "bg-slate-200",
                )}
              >
                {gig.title?.charAt(0)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              {/* Title and Status */}
              <div className="flex items-start justify-between gap-1">
                <h3
                  className={cn(
                    "font-semibold text-sm truncate max-w-[100px]",
                    isDarkMode ? "text-white" : "text-slate-900",
                  )}
                >
                  {gig.title}
                </h3>
                <Badge
                  className={cn(
                    "text-[8px] px-1.5 py-0 h-4",
                    isDarkMode ? "bg-slate-800" : "bg-slate-100",
                  )}
                >
                  {getStatusLabel()}
                </Badge>
              </div>

              {/* Date & Location - One line */}
              <div className="flex items-center gap-1 mt-1 text-[10px]">
                <Calendar className="w-2.5 h-2.5 text-slate-400" />
                <span
                  className={isDarkMode ? "text-slate-400" : "text-slate-500"}
                >
                  {new Date(gig.date).toLocaleDateString()}
                </span>
                {gig.location && (
                  <>
                    <span className="text-slate-400">•</span>
                    <MapPin className="w-2.5 h-2.5 text-slate-400" />
                    <span className="truncate max-w-[60px]">
                      {gig.location.split(",")[0]}
                    </span>
                  </>
                )}
              </div>

              {/* Info Icons Row */}
              <div className="flex items-center gap-2 mt-2">
                {/* Primary info icon */}
                {primaryInfo && (
                  <div className="flex items-center gap-0.5">
                    <PrimaryIcon className={cn("w-3 h-3", primaryInfo.color)} />
                    <span
                      className={cn("text-xs font-medium", primaryInfo.color)}
                    >
                      {primaryInfo.count}
                    </span>
                  </div>
                )}

                {/* Views */}
                <div className="flex items-center gap-0.5">
                  <Eye className="w-3 h-3 text-slate-400" />
                  <span className="text-xs text-slate-500">
                    {gig.viewCount?.length || 0}
                  </span>
                </div>

                {/* Price - if exists */}
                {gig.price > 0 && (
                  <div className="flex items-center gap-0.5 ml-auto">
                    <DollarSign className="w-3 h-3 text-emerald-500" />
                    <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                      {gig.price.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* More button - Netflix style */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleMoreClick}
              className={cn(
                "p-1 rounded-full transition-colors shrink-0",
                isDarkMode
                  ? "hover:bg-slate-800 text-slate-400 hover:text-white"
                  : "hover:bg-slate-200 text-slate-500 hover:text-slate-900",
                showActions &&
                  (isDarkMode
                    ? "bg-slate-800 text-white"
                    : "bg-slate-200 text-slate-900"),
              )}
            >
              <MoreHorizontal className="w-4 h-4" />
            </motion.button>
          </div>

          {/* Netflix-style action menu */}
          <AnimatePresence>
            {showActions && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-1 mt-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleViewDetails}
                        className={cn(
                          "flex-1 p-1.5 rounded-md text-xs flex items-center justify-center gap-1",
                          isDarkMode
                            ? "bg-slate-800 hover:bg-slate-700 text-slate-300"
                            : "bg-slate-100 hover:bg-slate-200 text-slate-600",
                        )}
                      >
                        <Eye className="w-3 h-3" />
                        <span>Details</span>
                      </motion.button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      View full details
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleEdit}
                        className={cn(
                          "flex-1 p-1.5 rounded-md text-xs flex items-center justify-center gap-1",
                          isDarkMode
                            ? "bg-blue-500/20 hover:bg-blue-500/30 text-blue-400"
                            : "bg-blue-100 hover:bg-blue-200 text-blue-600",
                        )}
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit</span>
                      </motion.button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Edit this gig</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigator.clipboard.writeText(
                            window.location.origin + `/hub/gigs/${gig._id}`,
                          );
                          toast.success("Link copied!");
                        }}
                        className={cn(
                          "flex-1 p-1.5 rounded-md text-xs flex items-center justify-center gap-1",
                          isDarkMode
                            ? "bg-purple-500/20 hover:bg-purple-500/30 text-purple-400"
                            : "bg-purple-100 hover:bg-purple-200 text-purple-600",
                        )}
                      >
                        <Copy className="w-3 h-3" />
                        <span>Share</span>
                      </motion.button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      Copy share link
                    </TooltipContent>
                  </Tooltip>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export const MyGigs = ({ user }: { user: any }) => {
  const router = useRouter();
  const { colors, isDarkMode } = useThemeColors();

  // State
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [displayMode, setDisplayMode] = useState<DisplayMode>("grid");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showHeader, setShowHeader] = useState(false);
  const [legendOpen, setLegendOpen] = useState(false);
  const [filterAnimationKey, setFilterAnimationKey] = useState(0);

  // Filter states
  const [viewFilter, setViewFilter] = useState<ViewFilter>("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>("all");

  // Refs for horizontal scroll
  const statsScrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const [selectedGig, setSelectedGig] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleViewDetails = (gig: any) => {
    router.push("/hub/gigs?tab=pre-booking");
  };
  // Check scroll position for arrows
  const checkScroll = () => {
    if (statsScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = statsScrollRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    const scrollEl = statsScrollRef.current;
    if (scrollEl) {
      scrollEl.addEventListener("scroll", checkScroll);
      checkScroll();
      window.addEventListener("resize", checkScroll);
    }
    return () => {
      if (scrollEl) scrollEl.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, []);

  // Get user's gigs
  const { gigs, isLoading } = useGigs(user?._id);

  // Calculate stats with enhanced fields
  const stats = useMemo(() => {
    if (!gigs) {
      return {
        total: 0,
        active: 0,
        completed: 0,
        pending: 0,
        upcoming: 0,
        past: 0,
        today: 0,
        client: 0,
        musician: 0,
        paid: 0,
        pendingPayment: 0,
        totalEarnings: 0,
        averageRating: 0,
        clientsScore: 0,
      };
    }

    const now = new Date();
    const today = new Date(now.setHours(0, 0, 0, 0));

    const activeGigs = gigs.filter((gig) => gig.isActive && !gig.isTaken);
    const takenGigs = gigs.filter((gig) => gig.isTaken);
    const pendingGigs = gigs.filter((gig) => gig.isPending);

    // Date-based stats
    const upcoming = gigs.filter((gig) => {
      const gigDate = new Date(gig.date);
      return gigDate > now && !gig.isTaken;
    }).length;

    const past = gigs.filter((gig) => {
      const gigDate = new Date(gig.date);
      return gigDate < today;
    }).length;

    const todayGigs = gigs.filter((gig) => {
      const gigDate = new Date(gig.date);
      return gigDate.toDateString() === today.toDateString();
    }).length;

    // Role-based stats
    const client = gigs.filter((gig) => gig.postedBy === user?._id).length;
    const musician = gigs.filter((gig) => gig.bookedBy === user?._id).length;

    // Payment stats
    const paid = gigs.filter((gig) => gig.paymentStatus === "paid").length;
    const pendingPayment = gigs.filter(
      (gig) => gig.paymentStatus === "pending",
    ).length;

    const totalEarnings = gigs
      .filter((gig) => gig.paymentStatus === "paid")
      .reduce((sum, gig) => sum + (gig.price || 0), 0);

    const averageRating =
      gigs.length > 0
        ? gigs.reduce((sum, gig) => sum + (gig.gigRating || 0), 0) / gigs.length
        : 0;

    const clientsScore = user?.trustStars || 0;

    return {
      total: gigs.length,
      active: activeGigs.length,
      completed: takenGigs.length,
      pending: pendingGigs.length,
      upcoming,
      past,
      today: todayGigs,
      client,
      musician,
      paid,
      pendingPayment,
      totalEarnings,
      averageRating: parseFloat(averageRating.toFixed(1)),
      clientsScore: clientsScore || 0,
    };
  }, [gigs, user]);

  // Gig counts for UI
  const gigCounts = useMemo(() => {
    if (!gigs)
      return {
        total: 0,
        available: 0,
        withInterests: 0,
        withApplications: 0,
        taken: 0,
        pending: 0,
        draft: 0,
      };

    return {
      total: gigs.length,
      available: gigs.filter((gig) => {
        const isAvailable = gig.isActive && !gig.isTaken;
        const noInterests =
          !gig.interestedUsers || gig.interestedUsers.length === 0;
        const noApplications =
          !gig.appliedUsers || gig.appliedUsers.length === 0;
        const noBookCount = !gig.bookCount || gig.bookCount.length === 0;

        let noBandBookings = true;
        if (gig.bandCategory && gig.bandCategory.length > 0) {
          noBandBookings = gig.bandCategory.every(
            (role: any) =>
              role.filledSlots === 0 &&
              (!role.applicants || role.applicants.length === 0),
          );
        }

        return (
          isAvailable &&
          noInterests &&
          noApplications &&
          noBookCount &&
          noBandBookings
        );
      }).length,

      withInterests: gigs.filter((gig) => {
        const isAvailable = gig.isActive && !gig.isTaken;
        const hasInterests =
          gig.interestedUsers && gig.interestedUsers.length > 0;
        const noApplications =
          !gig.appliedUsers || gig.appliedUsers.length === 0;
        return isAvailable && hasInterests && noApplications;
      }).length,

      withApplications: gigs.filter((gig) => {
        const isAvailable = gig.isActive && !gig.isTaken;
        const hasApplications = gig.appliedUsers && gig.appliedUsers.length > 0;
        return isAvailable && hasApplications;
      }).length,

      taken: gigs.filter((gig) => gig.isTaken).length,
      pending: gigs.filter((gig) => gig.isPending).length,
      draft: gigs.filter((gig) => !gig.isActive).length,
    };
  }, [gigs]);

  // Filter gigs
  const filteredGigs = useMemo(() => {
    if (!gigs) return [];

    let filtered = gigs;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (gig) =>
          gig.title?.toLowerCase().includes(query) ||
          gig.description?.toLowerCase().includes(query) ||
          gig.location?.toLowerCase().includes(query) ||
          gig.tags?.some((tag: string) => tag.toLowerCase().includes(query)),
      );
    }

    // View filter (role)
    if (viewFilter !== "all" && user) {
      filtered = filtered.filter((gig) => {
        if (viewFilter === "client") return gig.postedBy === user._id;
        if (viewFilter === "musician") return gig.bookedBy === user._id;
        return true;
      });
    }

    // Date filter
    if (dateFilter !== "all") {
      const now = new Date();
      const today = new Date(now.setHours(0, 0, 0, 0));

      filtered = filtered.filter((gig) => {
        const gigDate = new Date(gig.date);
        if (dateFilter === "today") {
          return gigDate.toDateString() === today.toDateString();
        }
        if (dateFilter === "upcoming") {
          return gigDate > now && !gig.isTaken;
        }
        if (dateFilter === "past") {
          return gigDate < today;
        }
        return true;
      });
    }

    // Payment filter
    if (paymentFilter !== "all") {
      filtered = filtered.filter((gig) => {
        if (paymentFilter === "paid") return gig.paymentStatus === "paid";
        if (paymentFilter === "pending") return gig.paymentStatus === "pending";
        return true;
      });
    }

    // Status filter
    if (statusFilter !== "all") {
      switch (statusFilter) {
        case "active":
          filtered = filtered.filter((gig) => gig.isActive && !gig.isTaken);
          break;
        case "taken":
          filtered = filtered.filter((gig) => gig.isTaken);
          break;
        case "pending":
          filtered = filtered.filter((gig) => gig.isPending);
          break;
        case "draft":
          filtered = filtered.filter((gig) => !gig.isActive);
          break;
      }
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (b.date || b.createdAt) - (a.date || a.createdAt);
        case "oldest":
          return (a.date || a.createdAt) - (b.date || b.createdAt);
        case "price-high":
          return (b.price || 0) - (a.price || 0);
        case "price-low":
          return (a.price || 0) - (b.price || 0);
        case "popular":
          return (b.viewCount?.length || 0) - (a.viewCount?.length || 0);
        default:
          return (b.date || b.createdAt) - (a.date || a.createdAt);
      }
    });

    return filtered;
  }, [
    gigs,
    searchQuery,
    viewFilter,
    dateFilter,
    paymentFilter,
    statusFilter,
    sortBy,
    user,
  ]);

  // Handlers
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsRefreshing(false);
    toast.success("Gigs refreshed!");
  };

  const handleCreateGig = () => {
    router.push("/hub/gigs/client/create");
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setViewFilter("all");
    setDateFilter("all");
    setPaymentFilter("all");
    setStatusFilter("all");
    setFilterAnimationKey((prev) => prev + 1);
    toast.success("Filters cleared");
  };

  const handleViewFilterChange = (value: ViewFilter) => {
    setViewFilter(value);
    setFilterAnimationKey((prev) => prev + 1);
  };

  const handleDateFilterChange = (value: DateFilter) => {
    setDateFilter(value);
    setFilterAnimationKey((prev) => prev + 1);
  };

  const handlePaymentFilterChange = (value: PaymentFilter) => {
    setPaymentFilter(value);
    setFilterAnimationKey((prev) => prev + 1);
  };

  const handleDisplayModeChange = (mode: DisplayMode) => {
    setDisplayMode(mode);
  };

  // Render gigs function
  const renderGigs = () => {
    if (filteredGigs.length === 0) {
      return (
        <div className="col-span-full flex flex-col items-center justify-center py-12">
          <div
            className={cn(
              "w-20 h-20 rounded-full flex items-center justify-center mb-4",
              isDarkMode ? "bg-slate-800" : "bg-slate-100",
            )}
          >
            <Music
              className={cn(
                "w-8 h-8",
                isDarkMode ? "text-slate-400" : "text-slate-500",
              )}
            />
          </div>
          <h3
            className={cn(
              "text-lg font-medium mb-2",
              isDarkMode ? "text-white" : "text-slate-900",
            )}
          >
            No gigs found
          </h3>
          <p
            className={cn(
              "text-sm mb-4",
              isDarkMode ? "text-slate-400" : "text-slate-500",
            )}
          >
            Try adjusting your filters or create a new gig
          </p>
          <Button onClick={handleCreateGig} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Create New Gig
          </Button>
        </div>
      );
    }

    if (displayMode === "grid") {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredGigs.map((gig) => (
            <CompactGigCard
              key={gig._id}
              gig={gig}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      );
    }

    if (displayMode === "list") {
      return (
        <div className="space-y-3">
          {filteredGigs.map((gig) => (
            <CompactGigCard
              key={gig._id}
              gig={gig}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      );
    }

    // For other views, default to grid
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredGigs.map((gig) => (
          <CompactGigCard
            key={gig._id}
            gig={gig}
            onViewDetails={handleViewDetails}
          />
        ))}
      </div>
    );
  };

  // Loading skeleton
  if (isLoading.gigs) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-10 w-64 rounded-lg" />
        <div className="flex gap-4 overflow-x-auto pb-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-32 rounded-xl flex-shrink-0" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="h-full flex flex-col">
        {/* Sticky Header Section - Fixed at top - MATCHING BOOKEDGIPS STYLE */}
        <div
          className={cn(
            "sticky top-0 z-30 backdrop-blur-md border-b",
            isDarkMode
              ? "bg-slate-950/80 border-slate-800/50"
              : "bg-white/80 border-slate-200/50",
          )}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="px-3 py-2 md:px-6 md:py-3"
          >
            {/* Header with Chevron Toggle - More compact on mobile */}
            <div className="flex items-start justify-between gap-2">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex-1 min-w-0"
              >
                <div className="flex items-center gap-1.5 md:gap-2 mb-0.5">
                  <div
                    className={cn(
                      "p-1.5 md:p-2 rounded-lg shrink-0",
                      isDarkMode ? "bg-orange-500/20" : "bg-orange-100",
                    )}
                  >
                    <Briefcase
                      className={cn(
                        "w-4 h-4 md:w-5 md:h-5",
                        isDarkMode ? "text-orange-400" : "text-orange-600",
                      )}
                    />
                  </div>
                  <h2
                    className={cn(
                      "text-base md:text-xl font-bold tracking-tight truncate",
                      isDarkMode ? "text-white" : "text-slate-900",
                    )}
                  >
                    My Gigs
                  </h2>
                </div>
                <p
                  className={cn(
                    "text-xs truncate",
                    isDarkMode ? "text-slate-400" : "text-slate-500",
                  )}
                >
                  {showHeader
                    ? "Manage your gigs"
                    : `${filteredGigs.length} gigs found`}
                </p>
              </motion.div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={handleCreateGig}
                  size="sm"
                  className="h-8 px-3 text-xs gap-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white"
                >
                  <Plus className="w-3 h-3" />
                  <span className="hidden sm:inline">New Gig</span>
                </Button>

                {/* Header Collapse Button with Chevron - MATCHING BOOKEDGIPS */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowHeader(!showHeader)}
                  className={cn(
                    "p-1.5 md:p-2 rounded-full transition-all duration-200 shrink-0",
                    isDarkMode
                      ? "text-slate-400 hover:text-white hover:bg-slate-800"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-100",
                  )}
                >
                  {showHeader ? (
                    <ChevronUp className="w-4 h-4 md:w-5 md:h-5" />
                  ) : (
                    <ChevronDown className="w-4 h-4 md:w-5 md:h-5" />
                  )}
                </motion.button>
              </div>
            </div>

            {/* Expandable Stats - MATCHING BOOKEDGIPS STYLE */}
            <AnimatePresence>
              {showHeader && stats && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="pt-3 space-y-3">
                    {/* Stats Cards - Horizontal scroll on mobile - MATCHING BOOKEDGIPS */}
                    {stats && (
                      <>
                        {/* Desktop Grid - hidden on mobile */}
                        <div className="hidden md:grid grid-cols-4 lg:grid-cols-7 gap-2">
                          {Object.entries(stats).map(([key, value], index) => {
                            // Skip special stats that have their own cards
                            if (
                              key === "totalEarnings" ||
                              key === "averageRating" ||
                              key === "clientsScore"
                            ) {
                              return null;
                            }
                            return (
                              <motion.div
                                key={key}
                                custom={index}
                                variants={statsVariants}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <Card
                                  className={cn(
                                    "border shadow-sm transition-all duration-200",
                                    isDarkMode
                                      ? "bg-slate-900/80 border-slate-800"
                                      : "bg-white border-slate-200",
                                  )}
                                >
                                  <CardContent className="p-2 text-center">
                                    <p
                                      className={cn(
                                        "text-[10px] font-medium uppercase tracking-wider",
                                        isDarkMode
                                          ? "text-slate-400"
                                          : "text-slate-500",
                                      )}
                                    >
                                      {key === "total"
                                        ? "Total"
                                        : key === "active"
                                          ? "Active"
                                          : key === "completed"
                                            ? "Completed"
                                            : key === "pending"
                                              ? "Pending"
                                              : key === "upcoming"
                                                ? "Upcoming"
                                                : key === "past"
                                                  ? "Past"
                                                  : key === "today"
                                                    ? "Today"
                                                    : key === "client"
                                                      ? "Client"
                                                      : key === "musician"
                                                        ? "Artist"
                                                        : key === "paid"
                                                          ? "Paid"
                                                          : key ===
                                                              "pendingPayment"
                                                            ? "Due"
                                                            : key}
                                    </p>
                                    <p
                                      className={cn(
                                        "text-lg font-bold",
                                        isDarkMode
                                          ? "text-white"
                                          : "text-slate-900",
                                      )}
                                    >
                                      {value}
                                    </p>
                                  </CardContent>
                                </Card>
                              </motion.div>
                            );
                          })}
                        </div>

                        {/* Special Stats Row - Earnings, Rating, Score */}
                        <div className="hidden md:grid grid-cols-3 gap-2">
                          {/* Total Earnings */}
                          <Card
                            className={cn(
                              "border shadow-sm",
                              isDarkMode
                                ? "bg-gradient-to-br from-emerald-950/30 to-emerald-950/10 border-emerald-900/20"
                                : "bg-gradient-to-br from-emerald-50/50 to-emerald-50/30 border-emerald-200/50",
                            )}
                          >
                            <CardContent className="p-2 text-center">
                              <p
                                className={cn(
                                  "text-[10px] font-medium uppercase tracking-wider",
                                  isDarkMode
                                    ? "text-emerald-300/90"
                                    : "text-emerald-600/90",
                                )}
                              >
                                Earnings
                              </p>
                              <p
                                className={cn(
                                  "text-lg font-bold",
                                  isDarkMode
                                    ? "text-emerald-300"
                                    : "text-emerald-600",
                                )}
                              >
                                ${stats.totalEarnings.toLocaleString()}
                              </p>
                            </CardContent>
                          </Card>

                          {/* Average Rating */}
                          <Card
                            className={cn(
                              "border shadow-sm",
                              isDarkMode
                                ? "bg-gradient-to-br from-yellow-950/30 to-yellow-950/10 border-yellow-900/20"
                                : "bg-gradient-to-br from-yellow-50/50 to-yellow-50/30 border-yellow-200/50",
                            )}
                          >
                            <CardContent className="p-2 text-center">
                              <p
                                className={cn(
                                  "text-[10px] font-medium uppercase tracking-wider",
                                  isDarkMode
                                    ? "text-yellow-300/90"
                                    : "text-yellow-600/90",
                                )}
                              >
                                Rating
                              </p>
                              <div className="flex items-center justify-center gap-1">
                                <p
                                  className={cn(
                                    "text-lg font-bold",
                                    isDarkMode
                                      ? "text-yellow-300"
                                      : "text-yellow-600",
                                  )}
                                >
                                  {stats.averageRating}
                                </p>
                                <Star
                                  className={cn(
                                    "w-3 h-3",
                                    isDarkMode
                                      ? "fill-yellow-300/70 text-yellow-300/70"
                                      : "fill-yellow-500/70 text-yellow-500/70",
                                  )}
                                />
                              </div>
                            </CardContent>
                          </Card>

                          {/* Client Score */}
                          <Card
                            className={cn(
                              "border shadow-sm",
                              isDarkMode
                                ? "bg-gradient-to-br from-indigo-950/30 to-indigo-950/10 border-indigo-900/20"
                                : "bg-gradient-to-br from-indigo-50/50 to-indigo-50/30 border-indigo-200/50",
                            )}
                          >
                            <CardContent className="p-2 text-center">
                              <p
                                className={cn(
                                  "text-[10px] font-medium uppercase tracking-wider",
                                  isDarkMode
                                    ? "text-indigo-300/90"
                                    : "text-indigo-600/90",
                                )}
                              >
                                Score
                              </p>
                              <p
                                className={cn(
                                  "text-lg font-bold",
                                  isDarkMode
                                    ? "text-indigo-300"
                                    : "text-indigo-600",
                                )}
                              >
                                {stats.clientsScore}
                              </p>
                            </CardContent>
                          </Card>
                        </div>

                        {/* Mobile Horizontal Scroll Stats - MATCHING BOOKEDGIPS */}
                        <div className="md:hidden -mx-3 px-3 overflow-x-auto scrollbar-hide">
                          <div className="flex gap-2 pb-1 min-w-min">
                            {Object.entries(stats).map(
                              ([key, value], index) => {
                                let bgColor = !isDarkMode
                                  ? "bg-slate-100"
                                  : "bg-slate-800";
                                let textColor = isDarkMode
                                  ? "text-slate-400"
                                  : "text-slate-500";
                                let valueColor = isDarkMode
                                  ? "text-white"
                                  : "text-slate-900";

                                if (key === "totalEarnings") {
                                  bgColor = isDarkMode
                                    ? "bg-emerald-950/30"
                                    : "bg-emerald-50/70";
                                  textColor = isDarkMode
                                    ? "text-emerald-300/80"
                                    : "text-emerald-600/80";
                                  valueColor = isDarkMode
                                    ? "text-emerald-300"
                                    : "text-emerald-600";
                                } else if (key === "averageRating") {
                                  bgColor = isDarkMode
                                    ? "bg-yellow-950/30"
                                    : "bg-yellow-50/70";
                                  textColor = isDarkMode
                                    ? "text-yellow-300/80"
                                    : "text-yellow-600/80";
                                  valueColor = isDarkMode
                                    ? "text-yellow-300"
                                    : "text-yellow-600";
                                } else if (key === "clientsScore") {
                                  bgColor = isDarkMode
                                    ? "bg-indigo-950/30"
                                    : "bg-indigo-50/70";
                                  textColor = isDarkMode
                                    ? "text-indigo-300/80"
                                    : "text-indigo-600/80";
                                  valueColor = isDarkMode
                                    ? "text-indigo-300"
                                    : "text-indigo-600";
                                }

                                return (
                                  <div
                                    key={key}
                                    className={cn(
                                      "flex-shrink-0 px-3 py-1.5 rounded-full",
                                      bgColor,
                                    )}
                                  >
                                    <span className="text-xs font-medium whitespace-nowrap">
                                      <span className={cn("mr-1", textColor)}>
                                        {key === "total"
                                          ? "Total"
                                          : key === "active"
                                            ? "Active"
                                            : key === "completed"
                                              ? "Done"
                                              : key === "pending"
                                                ? "Pending"
                                                : key === "upcoming"
                                                  ? "Up"
                                                  : key === "past"
                                                    ? "Past"
                                                    : key === "today"
                                                      ? "Now"
                                                      : key === "client"
                                                        ? "Client"
                                                        : key === "musician"
                                                          ? "Art"
                                                          : key === "paid"
                                                            ? "Paid"
                                                            : key ===
                                                                "pendingPayment"
                                                              ? "Due"
                                                              : key ===
                                                                  "totalEarnings"
                                                                ? "💰"
                                                                : key ===
                                                                    "averageRating"
                                                                  ? "⭐"
                                                                  : key ===
                                                                      "clientsScore"
                                                                    ? "📊"
                                                                    : key}
                                        :
                                      </span>
                                      <span
                                        className={cn("font-bold", valueColor)}
                                      >
                                        {key === "totalEarnings"
                                          ? `$${value}`
                                          : value}
                                      </span>
                                    </span>
                                  </div>
                                );
                              },
                            )}
                          </div>
                        </div>

                        {/* Scroll hint for mobile - MATCHING BOOKEDGIPS */}
                        <div className="md:hidden flex items-center justify-center gap-1 mt-1">
                          <div className="flex gap-1">
                            <div className="w-1 h-1 rounded-full bg-slate-400/50 animate-pulse" />
                            <div className="w-1 h-1 rounded-full bg-slate-400/50 animate-pulse delay-150" />
                            <div className="w-1 h-1 rounded-full bg-slate-400/50 animate-pulse delay-300" />
                          </div>
                          <span className="text-[10px] text-slate-400/70">
                            scroll for more stats
                          </span>
                        </div>
                      </>
                    )}

                    {/* Search Bar - Compact - MATCHING BOOKEDGIPS */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                      <Input
                        placeholder="Search by title, location, or artist..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8 h-9 text-sm rounded-full"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery("")}
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                        >
                          <X className="w-3.5 h-3.5 text-slate-400" />
                        </button>
                      )}
                    </div>

                    {/* Filter Chips - Horizontal Scroll - MATCHING BOOKEDGIPS */}
                    <div className="overflow-x-auto scrollbar-hide -mx-3 px-3">
                      <div className="flex gap-2 pb-1 min-w-min">
                        {/* Role Filter Chip */}
                        <Select
                          value={viewFilter}
                          onValueChange={handleViewFilterChange}
                        >
                          <SelectTrigger
                            className={cn(
                              "w-auto h-8 rounded-full text-xs gap-1 px-3 border",
                              isDarkMode
                                ? "bg-slate-900/40 border-slate-800/30 text-slate-200/90 hover:bg-slate-800/40"
                                : "bg-white/60 border-slate-200/40 text-slate-700/90 hover:bg-slate-50/70",
                              viewFilter !== "all" &&
                                (isDarkMode
                                  ? "border-blue-500/50"
                                  : "border-blue-400"),
                            )}
                          >
                            <Users className="w-3.5 h-3.5 opacity-70" />
                            <SelectValue placeholder="Role" />
                          </SelectTrigger>
                          <SelectContent
                            className={cn(
                              "border",
                              isDarkMode
                                ? "bg-slate-900/90 border-slate-800/50 backdrop-blur-md"
                                : "bg-white/90 border-slate-200/50 backdrop-blur-md",
                            )}
                          >
                            <SelectItem value="all">All Roles</SelectItem>
                            <SelectItem value="client">Client</SelectItem>
                            <SelectItem value="musician">Artist</SelectItem>
                          </SelectContent>
                        </Select>

                        {/* Date Filter Chip */}
                        <Select
                          value={dateFilter}
                          onValueChange={handleDateFilterChange}
                        >
                          <SelectTrigger
                            className={cn(
                              "w-auto h-8 rounded-full text-xs gap-1 px-3 border",
                              isDarkMode
                                ? "bg-slate-900/40 border-slate-800/30 text-slate-200/90 hover:bg-slate-800/40"
                                : "bg-white/60 border-slate-200/40 text-slate-700/90 hover:bg-slate-50/70",
                              dateFilter !== "all" &&
                                (dateFilter === "today"
                                  ? isDarkMode
                                    ? "border-emerald-500/50"
                                    : "border-emerald-400"
                                  : dateFilter === "upcoming"
                                    ? isDarkMode
                                      ? "border-blue-500/50"
                                      : "border-blue-400"
                                    : isDarkMode
                                      ? "border-slate-500/50"
                                      : "border-slate-400"),
                            )}
                          >
                            <Calendar className="w-3.5 h-3.5 opacity-70" />
                            <SelectValue placeholder="Date" />
                          </SelectTrigger>
                          <SelectContent
                            className={cn(
                              "border",
                              isDarkMode
                                ? "bg-slate-900/90 border-slate-800/50 backdrop-blur-md"
                                : "bg-white/90 border-slate-200/50 backdrop-blur-md",
                            )}
                          >
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="today">Today</SelectItem>
                            <SelectItem value="upcoming">Upcoming</SelectItem>
                            <SelectItem value="past">Past</SelectItem>
                          </SelectContent>
                        </Select>

                        {/* Payment Filter Chip */}
                        <Select
                          value={paymentFilter}
                          onValueChange={handlePaymentFilterChange}
                        >
                          <SelectTrigger
                            className={cn(
                              "w-auto h-8 rounded-full text-xs gap-1 px-3 border",
                              isDarkMode
                                ? "bg-slate-900/40 border-slate-800/30 text-slate-200/90 hover:bg-slate-800/40"
                                : "bg-white/60 border-slate-200/40 text-slate-700/90 hover:bg-slate-50/70",
                              paymentFilter !== "all" &&
                                (paymentFilter === "paid"
                                  ? isDarkMode
                                    ? "border-emerald-500/50"
                                    : "border-emerald-400"
                                  : isDarkMode
                                    ? "border-amber-500/50"
                                    : "border-amber-400"),
                            )}
                          >
                            <DollarSign className="w-3.5 h-3.5 opacity-70" />
                            <SelectValue placeholder="Payment" />
                          </SelectTrigger>
                          <SelectContent
                            className={cn(
                              "border",
                              isDarkMode
                                ? "bg-slate-900/90 border-slate-800/50 backdrop-blur-md"
                                : "bg-white/90 border-slate-200/50 backdrop-blur-md",
                            )}
                          >
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="paid">Paid</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                          </SelectContent>
                        </Select>

                        {/* Refresh Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleRefresh}
                          disabled={isRefreshing}
                          className={cn(
                            "h-8 rounded-full gap-1 px-3 text-xs border",
                            isDarkMode
                              ? "bg-slate-900/40 border-slate-800/30 text-slate-300/90 hover:bg-slate-800/40"
                              : "bg-white/60 border-slate-200/40 text-slate-600/90 hover:bg-slate-100/70",
                          )}
                        >
                          <RefreshCw
                            className={cn(
                              "w-3.5 h-3.5",
                              isRefreshing && "animate-spin",
                              isDarkMode
                                ? "text-slate-400/70"
                                : "text-slate-500/70",
                            )}
                          />
                          <span className="hidden sm:inline">Refresh</span>
                        </Button>

                        {/* Clear Filters */}
                        {(searchQuery ||
                          viewFilter !== "all" ||
                          dateFilter !== "all" ||
                          paymentFilter !== "all") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleClearFilters}
                            className={cn(
                              "h-8 rounded-full gap-1 px-3 text-xs border border-rose-500/30",
                              isDarkMode
                                ? "bg-rose-950/20 text-rose-400/90 hover:bg-rose-950/40"
                                : "bg-rose-50/50 text-rose-600/90 hover:bg-rose-100/70",
                            )}
                          >
                            <X className="w-3.5 h-3.5 opacity-70" />
                            <span>Clear</span>
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Quick filter stats - MATCHING BOOKEDGIPS */}
                    <div className="flex items-center justify-between text-xs">
                      <span
                        className={cn(
                          "flex items-center gap-2 px-2 py-1 rounded-full border",
                          isDarkMode
                            ? "bg-slate-900/40 border-slate-800/30 text-slate-300/90"
                            : "bg-slate-100/50 border-slate-200/40 text-slate-600/90",
                        )}
                      >
                        <span className="font-semibold text-orange-500/90">
                          {filteredGigs.length}
                        </span>
                        <span className="opacity-70">of</span>
                        <span
                          className={cn(
                            "font-semibold",
                            isDarkMode ? "text-white/90" : "text-slate-900/90",
                          )}
                        >
                          {gigs?.length || 0}
                        </span>
                        <span className="opacity-70">gigs</span>
                      </span>

                      {(searchQuery ||
                        viewFilter !== "all" ||
                        dateFilter !== "all" ||
                        paymentFilter !== "all") && (
                        <button
                          onClick={handleClearFilters}
                          className="text-rose-500 hover:text-rose-600 font-medium"
                        >
                          Reset all
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* View Toggle - Below header - MATCHING BOOKEDGIPS */}
        <div className="px-3 md:px-6 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "text-xs font-medium",
                  isDarkMode ? "text-slate-400" : "text-slate-500",
                )}
              >
                View:
              </span>
              <div
                className={cn(
                  "flex p-0.5 rounded-lg",
                  isDarkMode ? "bg-slate-800/50" : "bg-slate-100",
                )}
              >
                {[
                  { mode: "grid", icon: Grid3x3 },
                  { mode: "list", icon: List },
                  { mode: "timeline", icon: Activity }, // Use ActivityIcon instead
                  { mode: "calendar", icon: CalendarDays },
                  { mode: "kanban", icon: Kanban },
                ].map(({ mode, icon: Icon }) => (
                  <Tooltip key={mode}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() =>
                          handleDisplayModeChange(mode as DisplayMode)
                        }
                        className={cn(
                          "p-1.5 rounded-md transition-all",
                          displayMode === mode
                            ? isDarkMode
                              ? "bg-blue-600 text-white"
                              : "bg-blue-500 text-white"
                            : isDarkMode
                              ? "text-slate-400 hover:text-white hover:bg-slate-700"
                              : "text-slate-500 hover:text-slate-900 hover:bg-slate-200",
                        )}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-xs">
                      {mode.charAt(0).toUpperCase() + mode.slice(1)} View
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </div>

            {/* Sort - MATCHING BOOKEDGIPS */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[120px] h-8 text-xs rounded-full">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent
                className={cn(
                  isDarkMode
                    ? "bg-slate-900 border-slate-800"
                    : "bg-white border-slate-200",
                )}
              >
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="price-high">Price: High</SelectItem>
                <SelectItem value="price-low">Price: Low</SelectItem>
                <SelectItem value="popular">Popular</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Scrollable Gig Cards Section */}
        <div className="flex-1 overflow-y-auto px-3 md:px-6 pb-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={`gig-list-${displayMode}-${filterAnimationKey}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="py-4"
            >
              {renderGigs()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Gradient Legend Button - Fixed at Bottom Right - MATCHING BOOKEDGIPS */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLegendOpen(true)}
          className={cn(
            "fixed bottom-4 right-4 z-50 gap-1.5 rounded-full",
            "backdrop-blur-md border",
            "transition-all duration-300",
            "hover:scale-110 active:scale-95",
            "shadow-lg hover:shadow-xl",
            "group",
            isDarkMode
              ? "bg-slate-900/80 border-slate-700/50 text-slate-300 hover:bg-slate-800 hover:text-white"
              : "bg-white/80 border-slate-200/50 text-slate-600 hover:bg-white hover:text-slate-900",
          )}
        >
          <div className="relative">
            <span
              className={cn(
                "absolute inset-0 rounded-full opacity-0 group-hover:opacity-100",
                "bg-gradient-to-r from-red-500/30 via-yellow-500/30 via-green-500/30 via-blue-500/30 to-purple-500/30",
                "animate-ping",
              )}
            />
            <Info className="w-4 h-4" />
          </div>
          <span className="hidden sm:inline text-xs">Guide</span>
        </Button>

        {/* Legend Dialog - MATCHING BOOKEDGIPS */}
        <Dialog open={legendOpen} onOpenChange={setLegendOpen}>
          <DialogContent
            className={cn(
              "sm:max-w-md p-0 overflow-hidden",
              isDarkMode
                ? "bg-slate-900 border-slate-800"
                : "bg-white border-slate-200",
            )}
          >
            <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
            <div className="p-4">
              <DialogHeader className="mb-3">
                <DialogTitle
                  className={cn(
                    "text-base font-bold",
                    isDarkMode ? "text-white" : "text-slate-900",
                  )}
                >
                  Status Legend
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {[
                  {
                    badge: "bg-green-100 text-green-800",
                    icon: "🎤",
                    text: "Gig happening today",
                  },
                  {
                    badge: "bg-blue-100 text-blue-800",
                    icon: "📅",
                    text: "Future gig",
                  },
                  {
                    badge: "bg-gray-100 text-gray-800",
                    icon: "✅",
                    text: "Past gig",
                  },
                  {
                    badge: "bg-green-100 text-green-800",
                    icon: "💰",
                    text: "Payment completed",
                  },
                  {
                    badge: "bg-yellow-100 text-yellow-800",
                    icon: "⏳",
                    text: "Payment pending",
                  },
                  {
                    badge: "bg-amber-100 text-amber-800",
                    icon: "⚠️",
                    text: "Cancel within 3 days",
                  },
                  {
                    badge: "bg-red-100 text-red-800",
                    icon: "🚨",
                    text: "Cancel within 24h",
                  },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <Badge className={cn(item.badge, "px-2 py-0")}>
                      {i === 0
                        ? "Today"
                        : i === 1
                          ? "Future"
                          : i === 2
                            ? "Past"
                            : i === 3
                              ? "Paid"
                              : i === 4
                                ? "Pending"
                                : i === 5
                                  ? "3d"
                                  : "24h"}
                    </Badge>
                    <span
                      className={
                        isDarkMode ? "text-slate-300" : "text-slate-600"
                      }
                    >
                      {item.icon} {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
        <AnimatePresence>
          {showModal && selectedGig && (
            <GigDetailModal
              gig={selectedGig}
              onClose={() => setShowModal(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </TooltipProvider>
  );
};

export default MyGigs;
