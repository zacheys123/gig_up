// components/booking/HistoryTab.tsx
import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useThemeColors } from "@/hooks/useTheme";
import { useMediaQuery } from "@/hooks/use-media-query";

// UI Components
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TrustStarsDisplay } from "@/components/trust/TrustStarsDisplay";

// Icons
import {
  History,
  Clock,
  Eye,
  XCircle,
  Bookmark,
  ShoppingBag,
  UserPlus,
  UserMinus,
  DollarSign,
  ThumbsUp,
  ThumbsDown,
  TrendingUp,
  MessageSquare,
  CheckCircle,
  Star,
  Music,
  MapPin,
  Archive,
  UserCheck,
  UserX,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Info,
  Ban,
  Briefcase,
  Calendar,
  Heart,
} from "lucide-react";

interface HistoryTabProps {
  selectedGigData: any;
  formatTime: (timestamp: number) => string;
  getStatusColor: (status: string) => string;
  onViewProfile?: (userId: string) => void;
}

// Format notes to be more informative
const formatNotes = (notes: string, status: string) => {
  if (!notes) return null;

  const hasPrefix = /^(Rejected|Cancelled|Booked|Shortlisted):/i.test(notes);

  if (hasPrefix) return notes;

  switch (status?.toLowerCase()) {
    case "rejected":
      return `❌ Rejected: ${notes}`;
    case "cancelled":
      return `⚠️ Cancelled: ${notes}`;
    case "booked":
      return `✅ Booked: ${notes}`;
    case "shortlisted":
      return `⭐ Shortlisted: ${notes}`;
    default:
      return notes;
  }
};

// Get reason icon based on note content
const getReasonIcon = (notes: string) => {
  if (!notes) return <Info className="w-3 h-3" />;

  const lowerNotes = notes.toLowerCase();
  if (
    lowerNotes.includes("rate") ||
    lowerNotes.includes("price") ||
    lowerNotes.includes("budget")
  ) {
    return <DollarSign className="w-3 h-3 text-amber-500" />;
  }
  if (
    lowerNotes.includes("schedule") ||
    lowerNotes.includes("time") ||
    lowerNotes.includes("date")
  ) {
    return <Clock className="w-3 h-3 text-blue-500" />;
  }
  if (
    lowerNotes.includes("experience") ||
    lowerNotes.includes("skill") ||
    lowerNotes.includes("talent")
  ) {
    return <Star className="w-3 h-3 text-purple-500" />;
  }
  if (
    lowerNotes.includes("communicat") ||
    lowerNotes.includes("respond") ||
    lowerNotes.includes("message")
  ) {
    return <MessageSquare className="w-3 h-3 text-cyan-500" />;
  }
  if (
    lowerNotes.includes("location") ||
    lowerNotes.includes("distance") ||
    lowerNotes.includes("travel")
  ) {
    return <MapPin className="w-3 h-3 text-emerald-500" />;
  }
  if (
    lowerNotes.includes("conflict") ||
    lowerNotes.includes("disagree") ||
    lowerNotes.includes("issue")
  ) {
    return <AlertCircle className="w-3 h-3 text-red-500" />;
  }
  if (
    lowerNotes.includes("booked") ||
    lowerNotes.includes("hired") ||
    lowerNotes.includes("chose")
  ) {
    return <UserCheck className="w-3 h-3 text-green-500" />;
  }

  return <Info className="w-3 h-3 text-slate-400" />;
};

// Get role color utilities
const getRoleColor = (roleType?: string, isDarkMode?: boolean) => {
  if (!roleType) return isDarkMode ? "text-slate-300" : "text-slate-700";

  switch (roleType.toLowerCase()) {
    case "client":
      return isDarkMode ? "text-blue-400" : "text-blue-600";
    case "vocalist":
      return isDarkMode ? "text-pink-400" : "text-pink-600";
    case "dj":
      return isDarkMode ? "text-purple-400" : "text-purple-600";
    case "mc":
      return isDarkMode ? "text-orange-400" : "text-orange-600";
    case "musician":
    case "instrumentalist":
      return isDarkMode ? "text-amber-400" : "text-amber-600";
    case "booker":
      return isDarkMode ? "text-emerald-400" : "text-emerald-600";
    default:
      return isDarkMode ? "text-slate-300" : "text-slate-700";
  }
};

const getRoleBg = (roleType?: string, isDarkMode?: boolean) => {
  if (!roleType) return isDarkMode ? "bg-slate-800" : "bg-slate-100";

  switch (roleType.toLowerCase()) {
    case "client":
      return isDarkMode ? "bg-blue-900/30" : "bg-blue-50";
    case "vocalist":
      return isDarkMode ? "bg-pink-900/30" : "bg-pink-50";
    case "dj":
      return isDarkMode ? "bg-purple-900/30" : "bg-purple-50";
    case "mc":
      return isDarkMode ? "bg-orange-900/30" : "bg-orange-50";
    case "musician":
    case "instrumentalist":
      return isDarkMode ? "bg-amber-900/30" : "bg-amber-50";
    case "booker":
      return isDarkMode ? "bg-emerald-900/30" : "bg-emerald-50";
    default:
      return isDarkMode ? "bg-slate-800" : "bg-slate-100";
  }
};

const getRoleBorder = (roleType?: string, isDarkMode?: boolean) => {
  if (!roleType) return isDarkMode ? "border-slate-700" : "border-slate-200";

  switch (roleType.toLowerCase()) {
    case "client":
      return isDarkMode ? "border-blue-800" : "border-blue-200";
    case "vocalist":
      return isDarkMode ? "border-pink-800" : "border-pink-200";
    case "dj":
      return isDarkMode ? "border-purple-800" : "border-purple-200";
    case "mc":
      return isDarkMode ? "border-orange-800" : "border-orange-200";
    case "musician":
    case "instrumentalist":
      return isDarkMode ? "border-amber-800" : "border-amber-200";
    case "booker":
      return isDarkMode ? "border-emerald-800" : "border-emerald-200";
    default:
      return isDarkMode ? "border-slate-700" : "border-slate-200";
  }
};

// Format rate summary
const formatRateSummary = (userData?: any) => {
  const avgRate =
    userData?.rate?.baseRate ||
    userData?.rate?.averageRate ||
    userData?.averageRate ||
    0;

  let numericValue = 0;

  if (typeof avgRate === "number") {
    numericValue = avgRate;
  } else if (typeof avgRate === "string") {
    const cleaned = avgRate.replace(/[^\d.]/g, "");
    numericValue = parseFloat(cleaned) || 0;
  }

  const roundedValue = Math.ceil(numericValue / 1000) * 1000;
  return `KES ${roundedValue.toLocaleString()}`;
};

export const HistoryTab: React.FC<HistoryTabProps> = ({
  selectedGigData,
  formatTime,
  getStatusColor,
  onViewProfile,
}) => {
  const { colors, isDarkMode } = useThemeColors();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [activeHistoryTab, setActiveHistoryTab] = useState<
    "applicants" | "booking"
  >("applicants");
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [selectedApplicant, setSelectedApplicant] = useState<any>(null);

  // Get all history entries
  const bookingHistory = selectedGigData.gig.bookingHistory
    ? [...selectedGigData.gig.bookingHistory].sort(
        (a: any, b: any) => b.timestamp - a.timestamp,
      )
    : [];

  // Get cancelled/rejected applicants
  const cancelledRejectedApplicants =
    selectedGigData.applicants?.filter((applicant: any) =>
      ["cancelled", "rejected"].includes(applicant.status),
    ) || [];

  // Format relative time
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

  // Toggle expanded item
  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  // Get action icon for booking history
  const getActionIcon = (entry: any) => {
    const status = entry.status?.toLowerCase();
    switch (status) {
      case "shortlisted":
        return <Bookmark className="w-4 h-4 text-green-500" />;
      case "booked":
        return <ShoppingBag className="w-4 h-4 text-purple-500" />;
      case "rejected":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "cancelled":
        return <Ban className="w-4 h-4 text-orange-500" />;
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
      case "trending":
        return <TrendingUp className="w-4 h-4 text-violet-500" />;
      default:
        return <UserCheck className="w-4 h-4 text-gray-500" />;
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
        case "cancelled":
          return "bg-orange-900/30 border-orange-800";
        case "viewed":
          return "bg-blue-900/30 border-blue-800";
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
        case "cancelled":
          return "bg-orange-50 border-orange-200";
        case "viewed":
          return "bg-blue-50 border-blue-200";
        default:
          return "bg-gray-50 border-gray-200";
      }
    }
  };

  // Stats
  const stats = {
    cancelledRejected: cancelledRejectedApplicants.length,
    totalHistory: bookingHistory.length,
    booked: bookingHistory.filter((e: any) => e.status === "booked").length,
    shortlisted: bookingHistory.filter((e: any) => e.status === "shortlisted")
      .length,
    rejected: bookingHistory.filter((e: any) => e.status === "rejected").length,
    cancelled: bookingHistory.filter((e: any) => e.status === "cancelled")
      .length,
  };

  // Empty states
  if (cancelledRejectedApplicants.length === 0 && bookingHistory.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "text-center py-12 px-4 rounded-xl border-2 border-dashed",
          isDarkMode
            ? "bg-gray-900/50 border-gray-700"
            : "bg-gray-50 border-gray-200",
        )}
      >
        <div className="relative inline-block mb-4">
          <div
            className={cn(
              "w-20 h-20 rounded-full flex items-center justify-center mx-auto",
              isDarkMode
                ? "bg-gradient-to-br from-gray-800 to-gray-900"
                : "bg-gradient-to-br from-gray-100 to-gray-200",
            )}
          >
            <Archive className="w-10 h-10 text-gray-400" />
          </div>
        </div>
        <h3 className={cn("text-xl font-bold mb-2", colors.text)}>
          No History Yet
        </h3>
        <p className={cn("max-w-md mx-auto text-sm", colors.textMuted)}>
          Cancelled, rejected applicants and booking activity will appear here
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className={cn("text-lg font-bold", colors.text)}>
            History & Activity
          </h2>
          <p className={cn("text-xs", colors.textMuted)}>
            Track all past interactions and status changes
          </p>
        </div>

        {/* Quick stats pills */}
        <ScrollArea className="w-full sm:w-auto pb-2 sm:pb-0">
          <div className="flex gap-2 sm:flex-wrap min-w-max sm:min-w-0">
            <Badge
              variant="outline"
              className="bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30"
            >
              <XCircle className="w-3 h-3 mr-1" />
              {stats.rejected} Rejected
            </Badge>
            <Badge
              variant="outline"
              className="bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30"
            >
              <Ban className="w-3 h-3 mr-1" />
              {stats.cancelled} Cancelled
            </Badge>
            <Badge
              variant="outline"
              className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30"
            >
              <ShoppingBag className="w-3 h-3 mr-1" />
              {stats.booked} Booked
            </Badge>
            <Badge
              variant="outline"
              className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30"
            >
              <Bookmark className="w-3 h-3 mr-1" />
              {stats.shortlisted} Shortlisted
            </Badge>
          </div>
        </ScrollArea>
      </div>

      {/* Main Tabs */}
      {isMobile ? (
        // Mobile: Bottom tabs
        <div className="space-y-4">
          <div
            className={cn(
              "p-1 rounded-lg border flex",
              isDarkMode
                ? "bg-slate-800/50 border-slate-700"
                : "bg-slate-100 border-slate-200",
            )}
          >
            <button
              onClick={() => setActiveHistoryTab("applicants")}
              className={cn(
                "flex-1 py-2 px-3 rounded-md text-xs font-medium transition-all",
                activeHistoryTab === "applicants"
                  ? isDarkMode
                    ? "bg-blue-600 text-white"
                    : "bg-blue-500 text-white"
                  : isDarkMode
                    ? "text-slate-400"
                    : "text-slate-600",
              )}
            >
              <UserX className="w-3.5 h-3.5 mx-auto mb-1" />
              Rejected ({stats.cancelledRejected})
            </button>
            <button
              onClick={() => setActiveHistoryTab("booking")}
              className={cn(
                "flex-1 py-2 px-3 rounded-md text-xs font-medium transition-all",
                activeHistoryTab === "booking"
                  ? isDarkMode
                    ? "bg-blue-600 text-white"
                    : "bg-blue-500 text-white"
                  : isDarkMode
                    ? "text-slate-400"
                    : "text-slate-600",
              )}
            >
              <History className="w-3.5 h-3.5 mx-auto mb-1" />
              Timeline ({stats.totalHistory})
            </button>
          </div>

          {/* Mobile Content */}
          <div className="space-y-3">
            {activeHistoryTab === "applicants" ? (
              <ApplicantHistory
                applicants={cancelledRejectedApplicants}
                selectedGigData={selectedGigData}
                formatTime={formatTime}
                getStatusColor={getStatusColor}
                onViewProfile={onViewProfile}
                isDarkMode={isDarkMode}
                expandedItems={expandedItems}
                toggleExpanded={toggleExpanded}
                selectedApplicant={selectedApplicant}
                setSelectedApplicant={setSelectedApplicant}
                formatNotes={formatNotes}
                getReasonIcon={getReasonIcon}
                getRoleColor={getRoleColor}
                getRoleBg={getRoleBg}
                getRoleBorder={getRoleBorder}
                formatRateSummary={formatRateSummary}
              />
            ) : (
              <BookingHistory
                history={bookingHistory}
                selectedGigData={selectedGigData}
                formatRelativeTime={formatRelativeTime}
                getActionIcon={getActionIcon}
                getActionBgColor={getActionBgColor}
                isDarkMode={isDarkMode}
                expandedItems={expandedItems}
                toggleExpanded={toggleExpanded}
                formatNotes={formatNotes}
                onViewProfile={onViewProfile}
              />
            )}
          </div>
        </div>
      ) : (
        // Desktop: Regular tabs
        <Tabs defaultValue="applicants" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="applicants" className="gap-2">
              <UserX className="w-4 h-4" />
              Rejected/Cancelled
              {stats.cancelledRejected > 0 && (
                <Badge className="ml-1 bg-red-500 text-white text-xs">
                  {stats.cancelledRejected}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="booking" className="gap-2">
              <History className="w-4 h-4" />
              Booking Timeline
              {stats.totalHistory > 0 && (
                <Badge className="ml-1 bg-blue-500 text-white text-xs">
                  {stats.totalHistory}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="applicants" className="mt-4">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Left Side - Applicant Cards */}
              <div className="lg:w-2/3">
                <ApplicantHistory
                  applicants={cancelledRejectedApplicants}
                  selectedGigData={selectedGigData}
                  formatTime={formatTime}
                  getStatusColor={getStatusColor}
                  onViewProfile={onViewProfile}
                  isDarkMode={isDarkMode}
                  expandedItems={expandedItems}
                  toggleExpanded={toggleExpanded}
                  selectedApplicant={selectedApplicant}
                  setSelectedApplicant={setSelectedApplicant}
                  formatNotes={formatNotes}
                  getReasonIcon={getReasonIcon}
                  getRoleColor={getRoleColor}
                  getRoleBg={getRoleBg}
                  getRoleBorder={getRoleBorder}
                  formatRateSummary={formatRateSummary}
                />
              </div>

              {/* Right Panel - Selected Applicant Details */}
              <div className="lg:w-1/3">
                <Card
                  className={cn(
                    "sticky top-6",
                    isDarkMode ? "border-slate-700" : "border-slate-200",
                  )}
                >
                  <CardContent className="p-6">
                    {selectedApplicant ? (
                      <ApplicantDetails
                        applicant={selectedApplicant}
                        selectedGigData={selectedGigData}
                        onViewProfile={onViewProfile}
                        isDarkMode={isDarkMode}
                        formatRateSummary={formatRateSummary}
                        getRoleColor={getRoleColor}
                        getRoleBg={getRoleBg}
                        getRoleBorder={getRoleBorder}
                      />
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 mb-6">
                          <UserX className="w-10 h-10 text-gray-500" />
                        </div>
                        <h3 className="font-bold text-xl mb-2">
                          Select an Applicant
                        </h3>
                        <p className="text-gray-500 mb-6">
                          Click on any applicant card to view their detailed
                          profile
                        </p>
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/20 dark:to-red-900/20 text-orange-700 dark:text-orange-300">
                          <TrendingUp className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            {cancelledRejectedApplicants.length} applicants in
                            history
                          </span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="booking" className="mt-4">
            <BookingHistory
              history={bookingHistory}
              selectedGigData={selectedGigData}
              formatRelativeTime={formatRelativeTime}
              getActionIcon={getActionIcon}
              getActionBgColor={getActionBgColor}
              isDarkMode={isDarkMode}
              expandedItems={expandedItems}
              toggleExpanded={toggleExpanded}
              formatNotes={formatNotes}
              onViewProfile={onViewProfile}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

// Applicant History Sub-component - Same style as regular gig cards
const ApplicantHistory = ({
  applicants,
  selectedGigData,
  formatTime,
  getStatusColor,
  onViewProfile,
  isDarkMode,
  expandedItems,
  toggleExpanded,
  selectedApplicant,
  setSelectedApplicant,
  formatNotes,
  getReasonIcon,
  getRoleColor,
  getRoleBg,
  getRoleBorder,
  formatRateSummary,
}: any) => {
  if (applicants.length === 0) {
    return (
      <div
        className={cn(
          "text-center py-8 rounded-lg border",
          isDarkMode
            ? "bg-slate-800/50 border-slate-700"
            : "bg-slate-50 border-slate-200",
        )}
      >
        <UserCheck className="w-12 h-12 mx-auto mb-2 text-slate-400" />
        <p
          className={cn(
            "text-sm",
            isDarkMode ? "text-slate-400" : "text-slate-500",
          )}
        >
          No rejected or cancelled applicants
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {applicants.map((applicant: any) => {
        const user = selectedGigData.userDetails.get(applicant.userId);
        if (!user) return null;

        const itemId = `applicant-${applicant.userId}`;
        const isExpanded = expandedItems.has(itemId);
        const isSelected = selectedApplicant?.userId === applicant.userId;
        const formattedNotes = applicant.notes
          ? formatNotes(applicant.notes, applicant.status)
          : null;
        const reasonIcon = applicant.notes
          ? getReasonIcon(applicant.notes)
          : null;

        return (
          <motion.div
            key={applicant.userId}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
          >
            <Card
              className={cn(
                "cursor-pointer transition-all duration-200 overflow-hidden border",
                isSelected
                  ? isDarkMode
                    ? "ring-2 ring-orange-500 bg-gradient-to-br from-slate-900 to-slate-800"
                    : "ring-2 ring-orange-500 bg-gradient-to-br from-white to-slate-50"
                  : isDarkMode
                    ? "border-slate-800 bg-slate-900/50 hover:border-slate-700"
                    : "border-slate-200 bg-white hover:border-slate-300",
              )}
              onClick={() =>
                setSelectedApplicant(isSelected ? null : applicant)
              }
            >
              <CardContent className="p-3">
                {/* Minimal Card View */}
                <div className="flex items-center gap-2">
                  {/* Avatar */}
                  <Avatar className="w-10 h-10 border-2 border-white shadow-md flex-shrink-0">
                    <AvatarImage src={user.picture} />
                    <AvatarFallback
                      className={cn(
                        "bg-gradient-to-br text-white font-semibold text-sm",
                        user.roleType?.toLowerCase() === "vocalist"
                          ? "from-pink-500 to-rose-500"
                          : user.roleType?.toLowerCase() === "dj"
                            ? "from-purple-500 to-violet-500"
                            : user.roleType?.toLowerCase() === "mc"
                              ? "from-orange-500 to-amber-500"
                              : "from-blue-500 to-cyan-500",
                      )}
                    >
                      {user.firstname?.charAt(0)?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>

                  {/* Minimal Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <h4
                        className={cn(
                          "font-medium text-sm truncate max-w-[100px]",
                          isDarkMode ? "text-white" : "text-slate-900",
                        )}
                      >
                        {user.firstname} {user.lastname || user.username}
                      </h4>
                      {user.verifiedIdentity && (
                        <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                      )}
                    </div>

                    <div className="flex items-center gap-1 mt-0.5">
                      {/* Role Badge */}
                      <Badge
                        variant="outline"
                        className="text-[8px] px-1 py-0 h-4"
                        style={{
                          backgroundColor: getRoleBg(user.roleType, isDarkMode),
                          borderColor: getRoleBorder(user.roleType, isDarkMode),
                          color: getRoleColor(user.roleType, isDarkMode),
                        }}
                      >
                        {user.roleType || "Musician"}
                      </Badge>

                      {/* Status Badge */}
                      <Badge
                        className={cn(
                          "text-[8px] px-1 py-0 h-4",
                          getStatusColor(applicant.status),
                        )}
                      >
                        {applicant.status === "cancelled"
                          ? "CXL"
                          : applicant.status === "rejected"
                            ? "REJ"
                            : applicant.status}
                      </Badge>

                      {/* Time */}
                      <span
                        className={cn(
                          "text-[8px] ml-auto",
                          isDarkMode ? "text-slate-500" : "text-slate-400",
                        )}
                      >
                        {formatTime(applicant.appliedAt)}
                      </span>
                    </div>
                  </div>

                  {/* Expand/Collapse Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 rounded-full flex-shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpanded(itemId);
                    }}
                  >
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="h-3 w-3" />
                    </motion.div>
                  </Button>
                </div>

                {/* Reason Preview - Show on one line if not expanded */}
                {!isExpanded && applicant.notes && (
                  <div className="mt-1.5 pl-12">
                    <div className="flex items-center gap-1">
                      {reasonIcon}
                      <span
                        className={cn(
                          "text-[8px] truncate",
                          isDarkMode ? "text-slate-400" : "text-slate-500",
                        )}
                      >
                        {applicant.notes.length > 40
                          ? applicant.notes.substring(0, 40) + "..."
                          : applicant.notes}
                      </span>
                    </div>
                  </div>
                )}

                {/* Expanded View */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-3 mt-2 border-t border-slate-200 dark:border-slate-700 space-y-2">
                        {/* Quick Stats */}
                        <div className="grid grid-cols-4 gap-1">
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-0.5">
                              <Star className="w-2.5 h-2.5 text-yellow-500" />
                              <span className="text-[9px] font-bold">
                                <TrustStarsDisplay
                                  trustStars={
                                    user.trustStars?.toFixed(1) || "4.5"
                                  }
                                  size="sm"
                                  className="scale-75 -ml-1"
                                />
                              </span>
                            </div>
                            <span className="text-[7px] text-gray-500">
                              Rating
                            </span>
                          </div>

                          <div className="text-center">
                            <div className="flex items-center justify-center gap-0.5">
                              <Briefcase className="w-2.5 h-2.5 text-blue-500" />
                              <span className="text-[9px] font-bold">
                                {user.completedGigsCount || 0}
                              </span>
                            </div>
                            <span className="text-[7px] text-gray-500">
                              Gigs
                            </span>
                          </div>

                          <div className="text-center">
                            <div className="flex items-center justify-center gap-0.5">
                              <DollarSign className="w-2.5 h-2.5 text-green-500" />
                              <span className="text-[9px] font-bold truncate max-w-[30px]">
                                {formatRateSummary(user)
                                  .split(" ")[1]
                                  ?.slice(0, 3) || "N/A"}
                              </span>
                            </div>
                            <span className="text-[7px] text-gray-500">
                              Rate
                            </span>
                          </div>

                          <div className="text-center">
                            <div className="flex items-center justify-center gap-0.5">
                              <MapPin className="w-2.5 h-2.5 text-purple-500" />
                              <span className="text-[9px] font-bold truncate max-w-[25px]">
                                {user.city?.slice(0, 3) || "RMT"}
                              </span>
                            </div>
                            <span className="text-[7px] text-gray-500">
                              Loc
                            </span>
                          </div>
                        </div>

                        {/* Notes with Reason */}
                        {formattedNotes && (
                          <div
                            className={cn(
                              "p-2 rounded text-[9px] border",
                              isDarkMode
                                ? "bg-slate-800/50 border-slate-700"
                                : "bg-slate-50 border-slate-200",
                            )}
                          >
                            <p
                              className={
                                isDarkMode ? "text-slate-300" : "text-slate-600"
                              }
                            >
                              {formattedNotes}
                            </p>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-1 pt-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 text-[9px]"
                            onClick={(e) => {
                              e.stopPropagation();
                              onViewProfile?.(applicant.userId);
                            }}
                          >
                            <Eye className="w-2.5 h-2.5 mr-1" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 text-[9px]"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Add to shortlist action (if needed)
                            }}
                          >
                            <Heart className="w-2.5 h-2.5 mr-1" />
                            Re-add
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};

// Applicant Details Panel (Right Side)
const ApplicantDetails = ({
  applicant,
  selectedGigData,
  onViewProfile,
  isDarkMode,
  formatRateSummary,
  getRoleColor,
  getRoleBg,
  getRoleBorder,
}: any) => {
  const user = selectedGigData.userDetails.get(applicant.userId);
  if (!user) return null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Avatar className="w-14 h-14 border-4 border-white shadow-xl">
          <AvatarImage src={user.picture} />
          <AvatarFallback
            className={cn(
              "bg-gradient-to-br text-white font-bold text-lg",
              user.roleType?.toLowerCase() === "vocalist"
                ? "from-pink-500 to-rose-500"
                : user.roleType?.toLowerCase() === "dj"
                  ? "from-purple-500 to-violet-500"
                  : user.roleType?.toLowerCase() === "mc"
                    ? "from-orange-500 to-amber-500"
                    : "from-blue-500 to-cyan-500",
            )}
          >
            {user.firstname?.charAt(0)?.toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-lg">
              {user.firstname || user.username}
            </h2>
            {user.verifiedIdentity && (
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 text-xs">
                <CheckCircle className="w-3 h-3 mr-1" />
                Verified
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Badge
              className="text-xs font-medium"
              style={{
                backgroundColor: getRoleBg(user.roleType, isDarkMode),
                borderColor: getRoleBorder(user.roleType, isDarkMode),
                color: getRoleColor(user.roleType, isDarkMode),
              }}
            >
              {user.roleType || "Musician"}
            </Badge>
            <Badge
              className={cn(
                "text-xs",
                applicant.status === "rejected"
                  ? "bg-red-500/10 text-red-600"
                  : "bg-orange-500/10 text-orange-600",
              )}
            >
              {applicant.status === "rejected" ? "Rejected" : "Cancelled"}
            </Badge>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="text-center p-3 rounded-xl bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Star className="w-4 h-4 text-yellow-500" />
            <span className="text-base font-bold">
              {user.trustStars?.toFixed(1) || "4.5"}
            </span>
          </div>
          <p className="text-xs text-gray-500">Trust Rating</p>
        </div>

        <div className="text-center p-3 rounded-xl bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Briefcase className="w-4 h-4 text-blue-500" />
            <span className="text-base font-bold">
              {user.completedGigsCount || 0}
            </span>
          </div>
          <p className="text-xs text-gray-500">Gigs Done</p>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-2">
        <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center gap-2">
            <DollarSign className="w-3.5 h-3.5 text-green-500" />
            <span className="text-xs font-medium">Avg Rate</span>
          </div>
          <span className="font-bold text-sm">{formatRateSummary(user)}</span>
        </div>

        <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-purple-500" />
            <span className="text-xs font-medium">Location</span>
          </div>
          <span className="font-medium text-xs">{user.city || "Remote"}</span>
        </div>

        <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-orange-500" />
            <span className="text-xs font-medium">Applied</span>
          </div>
          <span className="font-medium text-xs">
            {new Date(applicant.appliedAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Notes */}
      {applicant.notes && (
        <div className="p-3 rounded-lg bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border border-red-200 dark:border-red-800">
          <h4 className="font-bold text-xs mb-1 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {applicant.status === "rejected"
              ? "Rejection Reason"
              : "Cancellation Reason"}
          </h4>
          <p className="text-xs">{applicant.notes}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-2 pt-2">
        <Button
          className="w-full h-9 text-sm"
          onClick={() => onViewProfile?.(applicant.userId)}
        >
          <Eye className="w-4 h-4 mr-2" />
          View Full Profile
        </Button>
      </div>
    </div>
  );
};

// Booking History Sub-component
const BookingHistory = ({
  history,
  selectedGigData,
  formatRelativeTime,
  getActionIcon,
  getActionBgColor,
  isDarkMode,
  expandedItems,
  toggleExpanded,
  formatNotes,
  onViewProfile,
}: any) => {
  if (history.length === 0) {
    return (
      <div
        className={cn(
          "text-center py-8 rounded-lg border",
          isDarkMode
            ? "bg-slate-800/50 border-slate-700"
            : "bg-slate-50 border-slate-200",
        )}
      >
        <History className="w-12 h-12 mx-auto mb-2 text-slate-400" />
        <p
          className={cn(
            "text-sm",
            isDarkMode ? "text-slate-400" : "text-slate-500",
          )}
        >
          No booking history yet
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {history.map((entry: any, index: number) => {
        const user = selectedGigData.userDetails.get(entry.userId);
        const itemId = `history-${entry.timestamp}-${index}`;
        const isExpanded = expandedItems.has(itemId);
        const formattedNotes = entry.notes
          ? formatNotes(entry.notes, entry.status)
          : null;

        return (
          <motion.div
            key={itemId}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
          >
            <Card
              className={cn(
                "overflow-hidden border",
                isDarkMode
                  ? "border-slate-800 bg-slate-900/50"
                  : "border-slate-200 bg-white",
                "hover:shadow-md transition-shadow",
              )}
            >
              <CardContent className="p-3">
                <div className="flex items-start gap-2">
                  <div
                    className={cn(
                      "p-1.5 rounded-lg shrink-0",
                      getActionBgColor(entry),
                    )}
                  >
                    {getActionIcon(entry)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <h4
                        className={cn(
                          "font-medium text-xs truncate max-w-[100px]",
                          isDarkMode ? "text-white" : "text-slate-900",
                        )}
                      >
                        {user?.firstname || user?.username || "Unknown User"}
                      </h4>
                      <Badge
                        className={cn(
                          "text-[8px] px-1 py-0 h-4",
                          entry.status === "booked"
                            ? "bg-purple-500/10 text-purple-600"
                            : entry.status === "shortlisted"
                              ? "bg-green-500/10 text-green-600"
                              : entry.status === "rejected"
                                ? "bg-red-500/10 text-red-600"
                                : entry.status === "cancelled"
                                  ? "bg-orange-500/10 text-orange-600"
                                  : "bg-blue-500/10 text-blue-600",
                        )}
                      >
                        {entry.status}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-1 mt-0.5">
                      <Clock className="w-2.5 h-2.5 text-slate-400" />
                      <span
                        className={cn(
                          "text-[8px]",
                          isDarkMode ? "text-slate-500" : "text-slate-400",
                        )}
                      >
                        {formatRelativeTime(entry.timestamp)}
                      </span>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleExpanded(itemId)}
                    className="h-5 w-5 p-0"
                  >
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="w-3 h-3" />
                    </motion.div>
                  </Button>
                </div>

                {/* Notes Preview */}
                {!isExpanded && entry.notes && (
                  <div className="mt-1.5 pl-7">
                    <p
                      className={cn(
                        "text-[8px] truncate",
                        isDarkMode ? "text-slate-400" : "text-slate-500",
                      )}
                    >
                      {entry.notes.length > 40
                        ? entry.notes.substring(0, 40) + "..."
                        : entry.notes}
                    </p>
                  </div>
                )}

                {/* Expanded Details */}
                <AnimatePresence>
                  {isExpanded && entry.notes && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                        <div
                          className={cn(
                            "p-2 rounded text-[9px]",
                            isDarkMode ? "bg-slate-800/50" : "bg-slate-50",
                          )}
                        >
                          <p
                            className={
                              isDarkMode ? "text-slate-300" : "text-slate-600"
                            }
                          >
                            {formattedNotes || entry.notes}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="w-full mt-2 h-6 text-[8px]"
                          onClick={() => onViewProfile?.(entry.userId)}
                        >
                          <Eye className="w-2.5 h-2.5 mr-1" />
                          View Profile
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};

export default HistoryTab;
