// app/hub/gigs/_components/PaymentHistory.tsx
import React, { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { PaymentHub } from "@/components/payments/PaymentHub";
import { format } from "date-fns";
import {
  DollarSign,
  CheckCircle,
  AlertCircle,
  Clock,
  ChevronRight,
  Search,
  Wallet,
  Calendar,
  Music,
  User,
  MapPin,
  Phone,
  Mail,
  Star,
  Shield,
  TrendingUp,
  Award,
  Bell,
  Filter,
  X,
  Play,
  Pause,
  MoreVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";

interface PaymentHistoryProps {
  user: any;
  isDarkMode: boolean; // Pass dark mode from parent
}

export const PaymentHistory = ({ user, isDarkMode }: PaymentHistoryProps) => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const userGigs = useQuery(
    api.controllers.payments.getUserGigsWithPaymentStatus,
    {
      userId: user._id,
      includeAll: true,
    },
  );
  const searchParams = useSearchParams();
  const router = useRouter();
  const [selectedGigId, setSelectedGigId] = useState<Id<"gigs"> | null>(null);
  const [autoConfirm, setAutoConfirm] = useState(false);

  useEffect(() => {
    const gigId = searchParams.get("gigId");
    const action = searchParams.get("action");

    if (gigId && action === "confirm") {
      setSelectedGigId(gigId as Id<"gigs">);
      setAutoConfirm(true);
    }
  }, [searchParams]);
  if (!userGigs) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="relative">
          <div
            className={cn(
              "w-12 h-12 border-4 rounded-full animate-spin",
              isDarkMode
                ? "border-blue-800/30 border-t-blue-500"
                : "border-blue-200 border-t-blue-600",
            )}
          />
        </div>
      </div>
    );
  }

  // Filter ONLY gigs where user is booked (musician) or has active role
  const bookedGigs = userGigs.filter((gig) => {
    const isBookedMusician = gig.bookedBy === user._id;
    const isInBandRole = gig.bandCategory?.some((role: any) =>
      role.bookedUsers?.includes(user._id),
    );
    const isClientWithBooking = gig.postedBy === user._id && gig.isTaken;

    // Only show gigs where user is actively booked
    return isBookedMusician || isInBandRole || isClientWithBooking;
  });

  // Filter by search and status
  const filteredGigs = bookedGigs.filter((gig) => {
    if (search && !gig.title.toLowerCase().includes(search.toLowerCase()))
      return false;
    if (statusFilter === "all") return true;
    if (statusFilter === "verified")
      return gig.paymentVerification?.match === true;
    if (statusFilter === "pending") {
      return (
        (gig.musicianConfirmPayment || gig.clientConfirmPayment) &&
        !gig.paymentVerification?.match
      );
    }
    if (statusFilter === "awaiting") {
      return (
        gig.isTaken && !gig.musicianConfirmPayment && !gig.clientConfirmPayment
      );
    }
    if (statusFilter === "disputed") return gig.paymentStatus === "disputed";
    return true;
  });

  // Get unique status counts for filters
  const statusCounts = {
    all: bookedGigs.length,
    verified: bookedGigs.filter((g) => g.paymentVerification?.match).length,
    pending: bookedGigs.filter(
      (g) =>
        (g.musicianConfirmPayment || g.clientConfirmPayment) &&
        !g.paymentVerification?.match,
    ).length,
    awaiting: bookedGigs.filter(
      (g) => g.isTaken && !g.musicianConfirmPayment && !g.clientConfirmPayment,
    ).length,
    disputed: bookedGigs.filter((g) => g.paymentStatus === "disputed").length,
  };
  // In your return, when showing PaymentHub, pass autoConfirm prop
  if (selectedGigId) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedGigId(null);
              setAutoConfirm(false);
              // Remove params from URL when going back
              router.push("/hub/gigs?tab=payments");
            }}
            className={cn(
              "gap-1",
              isDarkMode ? "hover:bg-slate-800" : "hover:bg-slate-100",
            )}
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            Back to Gigs
          </Button>
        </div>
        <PaymentHub
          gigId={selectedGigId}
          userId={user._id}
          autoOpenConfirm={autoConfirm} // Pass the prop
        />
      </motion.div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1
            className={cn(
              "text-2xl font-bold flex items-center gap-2",
              isDarkMode ? "text-white" : "text-slate-900",
            )}
          >
            <Wallet
              className={cn(
                "w-6 h-6",
                isDarkMode ? "text-blue-400" : "text-blue-600",
              )}
            />
            My Booked Gigs
          </h1>
          <p
            className={cn(
              "text-sm mt-1",
              isDarkMode ? "text-slate-400" : "text-slate-500",
            )}
          >
            You have {bookedGigs.length} active{" "}
            {bookedGigs.length === 1 ? "booking" : "bookings"}
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setViewMode("grid")}
            className={cn(
              "px-3",
              viewMode === "grid" &&
                (isDarkMode
                  ? "bg-slate-800 text-white"
                  : "bg-slate-100 text-slate-900"),
            )}
          >
            <div className="grid grid-cols-2 gap-0.5 mr-2">
              <div
                className={cn(
                  "w-1 h-1 rounded-full",
                  isDarkMode ? "bg-current" : "bg-current",
                )}
              />
              <div
                className={cn(
                  "w-1 h-1 rounded-full",
                  isDarkMode ? "bg-current" : "bg-current",
                )}
              />
              <div
                className={cn(
                  "w-1 h-1 rounded-full",
                  isDarkMode ? "bg-current" : "bg-current",
                )}
              />
              <div
                className={cn(
                  "w-1 h-1 rounded-full",
                  isDarkMode ? "bg-current" : "bg-current",
                )}
              />
            </div>
            Grid
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setViewMode("list")}
            className={cn(
              "px-3",
              viewMode === "list" &&
                (isDarkMode
                  ? "bg-slate-800 text-white"
                  : "bg-slate-100 text-slate-900"),
            )}
          >
            <div className="flex flex-col gap-0.5 mr-2">
              <div
                className={cn(
                  "w-3 h-0.5 rounded-full",
                  isDarkMode ? "bg-current" : "bg-current",
                )}
              />
              <div
                className={cn(
                  "w-3 h-0.5 rounded-full",
                  isDarkMode ? "bg-current" : "bg-current",
                )}
              />
              <div
                className={cn(
                  "w-3 h-0.5 rounded-full",
                  isDarkMode ? "bg-current" : "bg-current",
                )}
              />
            </div>
            List
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div
        className={cn(
          "rounded-xl border p-1 flex items-center gap-2 transition-colors",
          isDarkMode
            ? "bg-slate-900/50 border-slate-800 focus-within:border-blue-500/50"
            : "bg-white border-slate-200 focus-within:border-blue-500",
        )}
      >
        <Search
          className={cn(
            "w-4 h-4 ml-2",
            isDarkMode ? "text-slate-500" : "text-slate-400",
          )}
        />
        <Input
          placeholder="Search your gigs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={cn(
            "border-0 bg-transparent p-0 h-9 focus-visible:ring-0",
            isDarkMode
              ? "text-white placeholder:text-slate-500"
              : "text-slate-900 placeholder:text-slate-400",
          )}
        />
        {search && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSearch("")}
            className="h-7 w-7 p-0 mr-1"
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>

      {/* Status Filters - Compact Chips */}
      <div className="flex flex-wrap gap-1.5">
        {[
          { id: "all", label: "All", count: statusCounts.all, color: "blue" },
          {
            id: "verified",
            label: "Verified",
            count: statusCounts.verified,
            color: "green",
          },
          {
            id: "pending",
            label: "Pending",
            count: statusCounts.pending,
            color: "yellow",
          },
          {
            id: "awaiting",
            label: "Awaiting",
            count: statusCounts.awaiting,
            color: "purple",
          },
          {
            id: "disputed",
            label: "Disputed",
            count: statusCounts.disputed,
            color: "red",
          },
        ].map((status) => (
          <button
            key={status.id}
            onClick={() => setStatusFilter(status.id)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
              "flex items-center gap-1.5",
              statusFilter === status.id
                ? cn(
                    "text-white shadow-sm",
                    status.color === "blue" && "bg-blue-500",
                    status.color === "green" && "bg-green-500",
                    status.color === "yellow" && "bg-yellow-500",
                    status.color === "purple" && "bg-purple-500",
                    status.color === "red" && "bg-red-500",
                  )
                : cn(
                    isDarkMode
                      ? "bg-slate-800/50 text-slate-300 hover:bg-slate-800"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200",
                  ),
            )}
          >
            <span>{status.label}</span>
            <span
              className={cn(
                "text-[10px] px-1.5 py-0.5 rounded-full",
                statusFilter === status.id
                  ? "bg-white/20 text-white"
                  : isDarkMode
                    ? "bg-slate-700 text-slate-400"
                    : "bg-white text-slate-500",
              )}
            >
              {status.count}
            </span>
          </button>
        ))}
      </div>

      {/* Gigs Grid/List */}
      <AnimatePresence mode="wait">
        {filteredGigs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={cn(
              "flex flex-col items-center justify-center py-16 px-4 rounded-2xl border-2 border-dashed",
              isDarkMode ? "border-slate-800" : "border-slate-200",
            )}
          >
            <div
              className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center mb-4",
                isDarkMode ? "bg-slate-800" : "bg-slate-100",
              )}
            >
              <Calendar
                className={cn(
                  "w-8 h-8",
                  isDarkMode ? "text-slate-600" : "text-slate-400",
                )}
              />
            </div>
            <h3
              className={cn(
                "text-lg font-semibold mb-1",
                isDarkMode ? "text-white" : "text-slate-900",
              )}
            >
              No gigs found
            </h3>
            <p
              className={cn(
                "text-sm text-center",
                isDarkMode ? "text-slate-400" : "text-slate-500",
              )}
            >
              {search
                ? "No gigs match your search criteria"
                : "You don't have any booked gigs yet"}
            </p>
          </motion.div>
        ) : (
          <motion.div
            key={viewMode + statusFilter + search}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cn(
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
                : "flex flex-col gap-2",
            )}
          >
            {filteredGigs.map((gig, index) => {
              // Determine user's role in this specific gig
              const isUserMusician =
                gig.bookedBy === user._id ||
                gig.bandCategory?.some((r: any) =>
                  r.bookedUsers?.includes(user._id),
                );
              const isUserClient = gig.postedBy === user._id;

              const amount = isUserMusician
                ? gig.musicianConfirmPayment?.amount || gig.price
                : gig.clientConfirmPayment?.amount || gig.price;

              // Get status config
              const getStatusConfig = () => {
                if (gig.paymentVerification?.match) {
                  return {
                    label: "Verified",
                    icon: CheckCircle,
                    color: "text-green-500",
                    bg: isDarkMode ? "bg-green-500/10" : "bg-green-50",
                    border: isDarkMode
                      ? "border-green-500/20"
                      : "border-green-200",
                  };
                }
                if (gig.paymentStatus === "disputed") {
                  return {
                    label: "Disputed",
                    icon: AlertCircle,
                    color: "text-red-500",
                    bg: isDarkMode ? "bg-red-500/10" : "bg-red-50",
                    border: isDarkMode ? "border-red-500/20" : "border-red-200",
                  };
                }
                if (gig.musicianConfirmPayment && gig.clientConfirmPayment) {
                  return {
                    label: "Verifying",
                    icon: Clock,
                    color: "text-yellow-500",
                    bg: isDarkMode ? "bg-yellow-500/10" : "bg-yellow-50",
                    border: isDarkMode
                      ? "border-yellow-500/20"
                      : "border-yellow-200",
                  };
                }
                if (gig.musicianConfirmPayment || gig.clientConfirmPayment) {
                  return {
                    label: isUserMusician ? "You Confirmed" : "They Confirmed",
                    icon: CheckCircle,
                    color: "text-blue-500",
                    bg: isDarkMode ? "bg-blue-500/10" : "bg-blue-50",
                    border: isDarkMode
                      ? "border-blue-500/20"
                      : "border-blue-200",
                  };
                }
                return {
                  label: "Awaiting",
                  icon: Clock,
                  color: "text-purple-500",
                  bg: isDarkMode ? "bg-purple-500/10" : "bg-purple-50",
                  border: isDarkMode
                    ? "border-purple-500/20"
                    : "border-purple-200",
                };
              };

              const status = getStatusConfig();
              const StatusIcon = status.icon;

              // Grid View Card
              if (viewMode === "grid") {
                return (
                  <motion.div
                    key={gig._id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.03 }}
                    whileHover={{ y: -2 }}
                    onClick={() => setSelectedGigId(gig._id)}
                    className={cn(
                      "rounded-xl border p-4 cursor-pointer transition-all",
                      isDarkMode
                        ? "bg-slate-900 border-slate-800 hover:border-slate-700"
                        : "bg-white border-slate-200 hover:border-slate-300",
                      "hover:shadow-md",
                    )}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3
                          className={cn(
                            "font-semibold text-sm truncate",
                            isDarkMode ? "text-white" : "text-slate-900",
                          )}
                        >
                          {gig.title}
                        </h3>
                        <div className="flex items-center gap-1 mt-1">
                          <Calendar
                            className={cn(
                              "w-3 h-3",
                              isDarkMode ? "text-slate-600" : "text-slate-400",
                            )}
                          />
                          <span
                            className={cn(
                              "text-xs",
                              isDarkMode ? "text-slate-400" : "text-slate-500",
                            )}
                          >
                            {format(gig.date, "MMM d, yyyy")}
                          </span>
                        </div>
                      </div>

                      {/* Role Badge */}
                      <div
                        className={cn(
                          "w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0",
                          isDarkMode ? "bg-slate-800" : "bg-slate-100",
                        )}
                      >
                        {isUserMusician ? (
                          <Music
                            className={cn(
                              "w-3.5 h-3.5",
                              isDarkMode ? "text-blue-400" : "text-blue-600",
                            )}
                          />
                        ) : (
                          <User
                            className={cn(
                              "w-3.5 h-3.5",
                              isDarkMode
                                ? "text-purple-400"
                                : "text-purple-600",
                            )}
                          />
                        )}
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="mb-3">
                      <p
                        className={cn(
                          "text-xs mb-0.5",
                          isDarkMode ? "text-slate-500" : "text-slate-400",
                        )}
                      >
                        Amount
                      </p>
                      <p
                        className={cn(
                          "text-lg font-bold",
                          isDarkMode ? "text-white" : "text-slate-900",
                        )}
                      >
                        KES {amount?.toLocaleString() || "0"}
                      </p>
                    </div>

                    {/* Status Badge */}
                    <div
                      className={cn(
                        "flex items-center justify-between pt-3 border-t",
                        isDarkMode ? "border-slate-800" : "border-slate-100",
                      )}
                    >
                      <div
                        className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1",
                          status.bg,
                          status.border,
                          status.color,
                        )}
                      >
                        <StatusIcon className="w-3 h-3" />
                        <span>{status.label}</span>
                      </div>

                      {gig.musicianConfirmPayment?.extractedData && (
                        <div className="flex items-center gap-1">
                          <Shield
                            className={cn(
                              "w-3 h-3",
                              isDarkMode ? "text-slate-600" : "text-slate-400",
                            )}
                          />
                          <span
                            className={cn(
                              "text-[10px] font-medium",
                              gig.musicianConfirmPayment.extractedData
                                .confidence >= 90
                                ? "text-green-500"
                                : gig.musicianConfirmPayment.extractedData
                                      .confidence >= 70
                                  ? "text-yellow-500"
                                  : "text-red-500",
                            )}
                          >
                            {
                              gig.musicianConfirmPayment.extractedData
                                .confidence
                            }
                            %
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              }

              // List View Card
              return (
                <motion.div
                  key={gig._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.02 }}
                  onClick={() => setSelectedGigId(gig._id)}
                  className={cn(
                    "rounded-xl border p-3 cursor-pointer transition-all",
                    "flex items-center gap-3",
                    isDarkMode
                      ? "bg-slate-900 border-slate-800 hover:bg-slate-800/50"
                      : "bg-white border-slate-200 hover:bg-slate-50",
                  )}
                >
                  {/* Status Indicator */}
                  <div
                    className={cn(
                      "w-1 h-10 rounded-full",
                      status.color === "text-green-500" &&
                        (isDarkMode ? "bg-green-500/50" : "bg-green-500"),
                      status.color === "text-red-500" &&
                        (isDarkMode ? "bg-red-500/50" : "bg-red-500"),
                      status.color === "text-yellow-500" &&
                        (isDarkMode ? "bg-yellow-500/50" : "bg-yellow-500"),
                      status.color === "text-blue-500" &&
                        (isDarkMode ? "bg-blue-500/50" : "bg-blue-500"),
                      status.color === "text-purple-500" &&
                        (isDarkMode ? "bg-purple-500/50" : "bg-purple-500"),
                    )}
                  />

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3
                        className={cn(
                          "font-medium text-sm truncate",
                          isDarkMode ? "text-white" : "text-slate-900",
                        )}
                      >
                        {gig.title}
                      </h3>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] h-5 px-1.5",
                          isDarkMode ? "border-slate-700" : "border-slate-200",
                        )}
                      >
                        {isUserMusician ? "Musician" : "Client"}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex items-center gap-1">
                        <Calendar
                          className={cn(
                            "w-3 h-3",
                            isDarkMode ? "text-slate-600" : "text-slate-400",
                          )}
                        />
                        <span
                          className={cn(
                            "text-xs",
                            isDarkMode ? "text-slate-400" : "text-slate-500",
                          )}
                        >
                          {format(gig.date, "MMM d")}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <Wallet
                          className={cn(
                            "w-3 h-3",
                            isDarkMode ? "text-slate-600" : "text-slate-400",
                          )}
                        />
                        <span
                          className={cn(
                            "text-xs font-medium",
                            isDarkMode ? "text-white" : "text-slate-900",
                          )}
                        >
                          KES {amount?.toLocaleString() || "0"}
                        </span>
                      </div>

                      {gig.musicianConfirmPayment?.extractedData && (
                        <div className="flex items-center gap-1">
                          <Shield
                            className={cn(
                              "w-3 h-3",
                              isDarkMode ? "text-slate-600" : "text-slate-400",
                            )}
                          />
                          <span
                            className={cn(
                              "text-[10px]",
                              gig.musicianConfirmPayment.extractedData
                                .confidence >= 90
                                ? "text-green-500"
                                : gig.musicianConfirmPayment.extractedData
                                      .confidence >= 70
                                  ? "text-yellow-500"
                                  : "text-red-500",
                            )}
                          >
                            {
                              gig.musicianConfirmPayment.extractedData
                                .confidence
                            }
                            % OCR
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status Icon */}
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center",
                      status.bg,
                    )}
                  >
                    <StatusIcon className={cn("w-4 h-4", status.color)} />
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
