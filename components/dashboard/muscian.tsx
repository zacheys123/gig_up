"use client";

import { RoleStatusCard } from "./RoleStatusCard";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiAlertCircle,
  FiStar,
  FiTrendingUp,
  FiDollarSign,
  FiMusic,
  FiX,
  FiUserPlus,
  FiZap,
  FiBarChart2,
  FiAward,
} from "react-icons/fi";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useThemeColors } from "@/hooks/useTheme";
import { MusicianDashboardSkeleton } from "../skeletons/MusicianDashboardSkeleton";
import UpgradeModalSkeleton from "../skeletons/UpgradeModalSkeleton";
import { cn } from "@/lib/utils";

export function MusicianDashboard({
  gigsBooked,
  earnings,
  firstLogin,
  onboarding,
  isPro,
  isLoading = false,
}: {
  gigsBooked: number;
  earnings: number;
  firstLogin: boolean;
  onboarding: boolean;
  isPro: boolean;
  isLoading?: boolean;
}) {
  const { user, isLoading: userLoading } = useCurrentUser();
  const router = useRouter();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const { colors, isDarkMode } = useThemeColors();

  useEffect(() => {
    if (!firstLogin && onboarding) {
      const timer = setTimeout(() => {
        setShowUpgradeModal(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [firstLogin, onboarding]);

  const handleUpgradeProfile = () => {
    setIsModalLoading(true);
    router.push("/profile");
    setShowUpgradeModal(false);
    setIsModalLoading(false);
  };

  // Show skeleton while loading
  if (isLoading || userLoading) {
    return (
      <MusicianDashboardSkeleton
        isPro={isPro}
        showUpgradeModal={showUpgradeModal}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      className={cn(
        "space-y-6 p-6 rounded-3xl border-2 backdrop-blur-xl",
        "bg-gradient-to-br from-card/80 via-card/60 to-card/40",
        colors.border,
        "shadow-2xl shadow-black/5 dark:shadow-black/30",
        "relative overflow-hidden",
      )}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03]">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20" />
      </div>

      {/* Header Section */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 relative z-10">
        <div className="space-y-2">
          <motion.h1
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className={cn(
              "text-xl lg:text-3xl font-bold bg-gradient-to-r",
              "from-primary via-primary/80 to-accent bg-clip-text text-transparent",
              "leading-tight",
            )}
          >
            Performance Dashboard
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={cn("text-sm lg:text-base font-medium", colors.textMuted)}
          >
            Track your growth and manage your music career
          </motion.p>
        </div>

        <motion.div
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
          className={cn(
            "flex items-center gap-3 px-4 py-2.5 rounded-2xl border-2 backdrop-blur-sm",
            colors.border,
            "bg-gradient-to-r from-background/50 to-background/30",
            "shadow-lg shadow-black/5",
          )}
        >
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "w-2 h-2 rounded-full animate-pulse",
                isPro ? "bg-green-400" : "bg-blue-400",
              )}
            />
            <span className={cn("text-sm font-medium", colors.textMuted)}>
              Current Plan:
            </span>
          </div>
          <span
            className={cn(
              "px-3 py-1.5 text-xs font-bold rounded-full border-2 transition-all duration-300",
              isPro
                ? cn(
                    "bg-gradient-to-r from-green-500 to-emerald-500 text-white",
                    "border-green-400/50 shadow-lg shadow-green-500/25",
                  )
                : cn(
                    "bg-gradient-to-r from-blue-500 to-cyan-500 text-white",
                    "border-blue-400/50 shadow-lg shadow-blue-500/25",
                  ),
            )}
          >
            {isPro ? "PRO" : "FREE"}
          </span>
        </motion.div>
      </div>

      {/* Content Section */}
      <AnimatePresence mode="wait">
        {isPro ? (
          <motion.div
            key="pro-content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4, staggerChildren: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10"
          >
            <RoleStatusCard
              title="Gigs Booked"
              value={gigsBooked}
              trend="up"
              icon={<FiMusic className="text-purple-400" />}
            />
            <RoleStatusCard
              title="Total Earnings"
              value={earnings}
              format="currency"
              icon={<FiDollarSign className="text-green-400" />}
            />
            <RoleStatusCard
              title="Performance Rating"
              value={4.8}
              format="stars"
              trend="steady"
              icon={<FiStar className="text-amber-400" />}
            />
          </motion.div>
        ) : (
          <motion.div
            key="free-content"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.4, type: "spring" }}
            className={cn(
              "flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed text-center",
              "bg-gradient-to-br from-muted/30 to-muted/10 backdrop-blur-sm",
              colors.border,
              "relative overflow-hidden",
            )}
          >
            {/* Background Elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
            <div className="absolute top-4 right-4 w-8 h-8 bg-primary/10 rounded-full" />
            <div className="absolute bottom-4 left-4 w-6 h-6 bg-accent/10 rounded-full" />

            <div className="relative z-10 space-y-4 max-w-md">
              <div className="flex justify-center">
                <div
                  className={cn(
                    "p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10",
                    "border border-amber-400/20 shadow-lg shadow-amber-500/10",
                  )}
                >
                  <FiZap className="text-amber-400 text-xl" />
                </div>
              </div>

              <div className="space-y-3">
                <h3 className={cn("text-xl font-bold", colors.text)}>
                  Unlock Pro Analytics
                </h3>
                <p className={cn("text-sm leading-relaxed", colors.textMuted)}>
                  Upgrade to Pro and get detailed insights into your
                  performance, advanced booking analytics, and priority
                  visibility to attract more clients and grow your music career.
                </p>
              </div>

              <motion.button
                onClick={() => router.push("/dashboard/billing")}
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "px-6 py-3 rounded-2xl font-semibold text-white",
                  "bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70",
                  "shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30",
                  "transition-all duration-300 border border-primary/20",
                  "flex items-center gap-2",
                )}
              >
                <FiBarChart2 className="text-lg" />
                Upgrade to Pro
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Footer */}
      {isPro && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className={cn(
            "flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl",
            "bg-gradient-to-r from-muted/30 to-muted/10 backdrop-blur-sm",
            "border border-border/50",
            "relative z-10",
          )}
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <FiTrendingUp className="text-green-400 text-lg" />
              <span className={cn("text-sm font-medium", colors.text)}>
                Performance Trend
              </span>
            </div>
            <span className="text-green-400 text-sm font-semibold">
              +12% this month
            </span>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <FiAward className="text-amber-400" />
              <span className={cn("font-medium", colors.textMuted)}>
                Top 15% in Nairobi
              </span>
            </div>
            <div className="w-1 h-1 rounded-full bg-border" />
            <span className={cn("font-medium", colors.textMuted)}>
              Updated: {new Date().toLocaleTimeString()}
            </span>
          </div>
        </motion.div>
      )}

      {/* Upgrade Modal */}
      <AnimatePresence>
        {(showUpgradeModal && !user?.date) ||
          !user?.year ||
          (!user?.month && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
            >
              {isModalLoading ? (
                <UpgradeModalSkeleton />
              ) : (
                <motion.div
                  initial={{ scale: 0.9, y: 20, opacity: 0 }}
                  animate={{ scale: 1, y: 0, opacity: 1 }}
                  exit={{ scale: 0.9, y: 20, opacity: 0 }}
                  transition={{
                    duration: 0.4,
                    ease: [0.23, 1, 0.32, 1],
                  }}
                  className={cn(
                    "rounded-3xl w-full max-w-md overflow-hidden border-2 backdrop-blur-xl",
                    "bg-gradient-to-br from-card via-card/95 to-card/90",
                    colors.border,
                    "shadow-2xl shadow-black/20",
                  )}
                >
                  {/* Header */}
                  <div className="flex justify-between items-center p-6 border-b border-border/50">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "p-2 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10",
                          "border border-amber-400/20",
                        )}
                      >
                        <FiAlertCircle className="h-5 w-5 text-amber-400" />
                      </div>
                      <h3 className={cn("text-lg font-bold", colors.text)}>
                        Complete Your Profile
                      </h3>
                    </div>
                    <button
                      onClick={handleUpgradeProfile}
                      className={cn(
                        "p-2 rounded-xl transition-all duration-200",
                        "hover:bg-muted/50 active:scale-95",
                        colors.textMuted,
                      )}
                    >
                      <FiX className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-6">
                    <div className="space-y-4">
                      <p
                        className={cn(
                          "text-sm leading-relaxed",
                          colors.textMuted,
                        )}
                      >
                        Complete your profile to showcase your talent and
                        increase your booking chances. Musicians with complete
                        profiles receive up to{" "}
                        <span className="text-amber-400 font-semibold">
                          3× more bookings
                        </span>
                        .
                      </p>

                      {/* Progress Bar */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className={cn("font-medium", colors.text)}>
                            Profile Completion
                          </span>
                          <span
                            className={cn("font-semibold", colors.textMuted)}
                          >
                            67%
                          </span>
                        </div>
                        <div className="w-full bg-muted/50 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: "67%" }}
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleUpgradeProfile}
                      className={cn(
                        "w-full py-3.5 px-6 rounded-2xl font-semibold transition-all duration-300",
                        "bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70",
                        "text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30",
                        "hover:scale-[1.02] active:scale-[0.98] border border-primary/20",
                        "flex items-center justify-center gap-3",
                      )}
                    >
                      <FiUserPlus className="h-4 w-4" />
                      Complete Profile Now
                    </button>
                  </div>

                  {/* Footer */}
                  <div
                    className={cn(
                      "px-6 py-4 border-t border-border/50 text-center",
                      "bg-muted/20",
                    )}
                  >
                    <p className={cn("text-xs", colors.textMuted)}>
                      Takes only 2 minutes • Boost your visibility instantly
                    </p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
      </AnimatePresence>
    </motion.div>
  );
}

// Enhanced version with data loading states
export default function MusicianDashboardWithLoading({
  gigsBooked,
  earnings,
  firstLogin,
  onboarding,
  isPro,
  isLoading = false,
  isDataLoading = false,
}: {
  gigsBooked: number;
  earnings: number;
  firstLogin: boolean;
  onboarding: boolean;
  isPro: boolean;
  isLoading?: boolean;
  isDataLoading?: boolean;
}) {
  const { user, isLoading: userLoading } = useCurrentUser();

  // Show full skeleton during initial load
  if (isLoading || userLoading) {
    return <MusicianDashboardSkeleton isPro={isPro} showUpgradeModal={false} />;
  }

  // Show quick skeleton during data refresh
  if (isDataLoading) {
    return (
      <div className="relative">
        <MusicianDashboardSkeleton isPro={isPro} showUpgradeModal={false} />
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center rounded-3xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-white text-sm bg-black/40 px-4 py-2 rounded-xl border border-white/20"
          >
            Refreshing analytics...
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <MusicianDashboard
      gigsBooked={gigsBooked}
      earnings={earnings}
      firstLogin={firstLogin}
      onboarding={onboarding}
      isPro={isPro}
      isLoading={false}
    />
  );
}
