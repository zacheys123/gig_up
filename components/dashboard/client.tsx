"use client";
import GigChart from "./GigChart";
import { RoleStatusCard } from "./RoleStatusCard";
import { UsageMeter } from "./UsageMeter";
import {
  Calendar,
  DollarSign,
  Music,
  Star,
  Rocket,
  Shield,
  Zap,
  Gem,
  Crown,
  Target,
  TrendingUp,
  Users,
  Award,
  BarChart,
  CheckCircle,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import ClientDashboardSkeleton from "../skeletons/ClientDashboardSkeletons";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useCurrentUser } from "@/hooks/useCurrentUser";

// Use Convex's generated types
type Gig = Doc<"gigs">;
type User = Doc<"users">;

interface GigWithUsers extends Gig {
  postedByUser: User | null;
  bookedByUser: User | null;
}

interface ClientDashboardProps {
  gigsPosted?: number;
  total?: number;
  isPro: boolean;
  isLoading?: boolean;
}

export function ClientDashboard({
  gigsPosted = 0,
  total = 0,
  isPro,
  isLoading = false,
}: ClientDashboardProps) {
  const { userId } = useAuth();
  const { user } = useCurrentUser();
  const gigs = useQuery(api.controllers.gigs.getGigsWithUsers);
  const router = useRouter();
  const [hasData, setHasData] = useState(false);
  const [userTier, setUserTier] = useState<
    "free" | "pro" | "premium" | "elite"
  >("free");

  // Safely get user's gigs
  const userGigs =
    gigs?.filter((gig: GigWithUsers) => gig.postedByUser?.clerkId === userId) ||
    [];

  // Safely calculate statistics with fallback to 0
  const gigsBookedAndCompleted =
    gigs?.filter(
      (gig: GigWithUsers) =>
        gig.postedByUser?.clerkId === userId && gig.isTaken,
    ).length || 0;

  const upcoming =
    gigs?.filter(
      (gig: GigWithUsers) =>
        gig.postedByUser?.clerkId === userId && gig.isPending,
    ).length || 0;

  // Determine user's actual tier from user data
  useEffect(() => {
    if (user?.tier) {
      setUserTier(user.tier as "free" | "pro" | "premium" | "elite");
    } else {
      const tier = isPro ? "premium" : "free";
      setUserTier(tier);
    }
  }, [user, isPro]);

  // Check if user has any data
  useEffect(() => {
    // Use userGigs instead of gigs?.filter directly
    setHasData(userGigs.length > 0 || gigsPosted > 0 || total > 0);
  }, [userGigs, gigsPosted, total]);

  const loading = gigs === undefined || isLoading;

  // Tier information with improved styling
  const tierInfo = {
    free: {
      name: "Free",
      icon: <Shield className="text-gray-400" size={24} />,
      gradient: "from-gray-500 to-gray-700",
      badgeGradient: "from-gray-500/20 to-gray-700/20",
      bgColor: "bg-gradient-to-br from-gray-900 to-gray-950",
      borderColor: "border-gray-800",
      textColor: "text-gray-400",
      accentColor: "text-gray-300",
      features: [
        { text: "3 gigs per month", icon: <CheckCircle className="w-4 h-4" /> },
        { text: "Basic analytics", icon: <BarChart className="w-4 h-4" /> },
        { text: "Standard support", icon: <Users className="w-4 h-4" /> },
      ],
      nextTier: "Pro",
      description: "Perfect for getting started",
    },
    pro: {
      name: "Pro",
      icon: <Zap className="text-blue-400" size={24} />,
      gradient: "from-blue-500 to-cyan-600",
      badgeGradient: "from-blue-500/20 to-cyan-600/20",
      bgColor: "bg-gradient-to-br from-blue-950/90 to-cyan-950/90",
      borderColor: "border-blue-800",
      textColor: "text-blue-400",
      accentColor: "text-cyan-300",
      features: [
        { text: "Unlimited gigs", icon: <Sparkles className="w-4 h-4" /> },
        {
          text: "Advanced analytics",
          icon: <TrendingUp className="w-4 h-4" />,
        },
        { text: "Priority support", icon: <Award className="w-4 h-4" /> },
      ],
      nextTier: "Premium",
      description: "For serious event planners",
    },
    premium: {
      name: "Premium",
      icon: <Gem className="text-purple-400" size={24} />,
      gradient: "from-purple-500 to-pink-600",
      badgeGradient: "from-purple-500/20 to-pink-600/20",
      bgColor: "bg-gradient-to-br from-purple-950/90 to-pink-950/90",
      borderColor: "border-purple-800",
      textColor: "text-purple-400",
      accentColor: "text-pink-300",
      features: [
        { text: "Everything in Pro +", icon: <Crown className="w-4 h-4" /> },
        { text: "Dedicated manager", icon: <Users className="w-4 h-4" /> },
        { text: "Custom reports", icon: <BarChart className="w-4 h-4" /> },
      ],
      nextTier: "Elite",
      description: "Premium experience with exclusive perks",
    },
    elite: {
      name: "Elite",
      icon: <Crown className="text-yellow-400" size={24} />,
      gradient: "from-yellow-500 to-orange-600",
      badgeGradient: "from-yellow-500/20 to-orange-600/20",
      bgColor: "bg-gradient-to-br from-yellow-950/90 to-orange-950/90",
      borderColor: "border-yellow-800",
      textColor: "text-yellow-400",
      accentColor: "text-orange-300",
      features: [
        { text: "VIP support 24/7", icon: <Award className="w-4 h-4" /> },
        { text: "Custom solutions", icon: <Sparkles className="w-4 h-4" /> },
        { text: "Early feature access", icon: <Rocket className="w-4 h-4" /> },
      ],
      nextTier: null,
      description: "Top-tier experience for power users",
    },
  };

  // Show skeleton while loading
  if (loading) {
    return <ClientDashboardSkeleton isPro={isPro} />;
  }

  const currentTier = tierInfo[userTier];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950 text-white">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 space-y-8 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Tier Hero Banner */}
        <div
          className={cn(
            "rounded-3xl p-8 border backdrop-blur-xl",
            currentTier.bgColor,
            currentTier.borderColor,
          )}
        >
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <div
                  className={cn(
                    "p-4 rounded-2xl bg-gradient-to-r",
                    currentTier.gradient,
                  )}
                >
                  {currentTier.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium px-3 py-1 rounded-full bg-black/50">
                      CURRENT PLAN
                    </span>
                    <span className="text-xs px-2 py-1 rounded-full bg-white/10">
                      {user?.roleType
                        ? `${user.roleType.toUpperCase()} ACCOUNT`
                        : "USER"}
                    </span>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">
                    Welcome to{" "}
                    <span
                      className={cn(
                        "bg-gradient-to-r bg-clip-text text-transparent",
                        currentTier.gradient,
                      )}
                    >
                      {currentTier.name} Tier
                    </span>
                  </h1>
                  <p className={cn("text-lg mb-6", currentTier.textColor)}>
                    {currentTier.description}
                  </p>
                </div>
              </div>

              {/* Tier Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {currentTier.features.map((feature, index) => (
                  <div
                    key={index}
                    className={cn(
                      "p-4 rounded-xl border backdrop-blur-sm flex items-center gap-3",
                      currentTier.borderColor,
                      "bg-black/30",
                    )}
                  >
                    <div
                      className={cn(
                        "p-2 rounded-lg",
                        currentTier.badgeGradient,
                      )}
                    >
                      {feature.icon}
                    </div>
                    <span className="font-medium">{feature.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Upgrade Section */}
            <div className="lg:w-96 space-y-6">
              {currentTier.nextTier && (
                <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <ArrowRight className="text-green-400" />
                    Ready for the Next Level?
                  </h3>
                  <p className="text-gray-300 mb-6">
                    Upgrade to {currentTier.nextTier} for even more powerful
                    features and exclusive benefits.
                  </p>
                  <Button
                    onClick={() => router.push("/dashboard/billing")}
                    className={cn(
                      "w-full bg-gradient-to-r hover:scale-[1.02] transition-transform duration-300",
                      currentTier.gradient,
                      "text-white py-6 text-lg font-semibold rounded-xl",
                    )}
                  >
                    Upgrade to {currentTier.nextTier}
                  </Button>
                </div>
              )}

              {/* Quick Stats */}
              <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                <h3 className="text-lg font-bold mb-4">Quick Stats</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Current Plan</span>
                    <span
                      className={cn("font-semibold", currentTier.accentColor)}
                    >
                      {currentTier.name}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Gig Limit</span>
                    <span className="font-semibold">
                      {userTier === "free" ? "3/month" : "Unlimited"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Support</span>
                    <span className="font-semibold">
                      {userTier === "free"
                        ? "Standard"
                        : userTier === "pro"
                          ? "Priority"
                          : userTier === "premium"
                            ? "Dedicated"
                            : "VIP"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Usage & Activity */}
          <div className="lg:col-span-2 space-y-8">
            {/* Welcome/No Data Banner */}
            {!hasData && (
              <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 backdrop-blur-lg rounded-2xl p-8 border border-blue-800/30 relative overflow-hidden">
                <div className="absolute top-4 right-4">
                  <Sparkles className="text-yellow-400 w-8 h-8 animate-pulse" />
                </div>
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600">
                      <Rocket className="text-white" size={28} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">
                        Ready to Launch? 🚀
                      </h3>
                      <p className="text-blue-200">
                        {userTier === "free"
                          ? "Start with your first gig! Free tier includes 3 gigs per month."
                          : `As ${currentTier.name} member, you're ready to use premium features.`}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => router.push("/hub/gigs/client/create")}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                  >
                    Create Your First Gig
                  </Button>
                </div>
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-gray-900/80 to-gray-950/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-800 relative overflow-hidden group hover:border-purple-800/50 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold">Usage Overview</h3>
                    <div className="p-2 rounded-lg bg-purple-500/10">
                      <TrendingUp className="w-5 h-5 text-purple-400" />
                    </div>
                  </div>
                  <UsageMeter
                    current={gigsPosted || 0}
                    max={userTier === "free" ? 3 : 999}
                    label={`${gigsPosted} of ${userTier === "free" ? "3" : "∞"} gigs posted`}
                  />
                  <p className="text-sm text-gray-400 mt-4">
                    {userTier === "free"
                      ? "Upgrade to Pro for unlimited gigs"
                      : "You have unlimited gig posting"}
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-gray-900/80 to-gray-950/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-800 relative overflow-hidden group hover:border-blue-800/50 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold">Activity Trend</h3>
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <BarChart className="w-5 h-5 text-blue-400" />
                    </div>
                  </div>
                  {hasData ? (
                    <GigChart />
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-500/10 flex items-center justify-center">
                        <Music className="w-8 h-8 text-blue-400" />
                      </div>
                      <p className="text-gray-300 font-medium">
                        No activity yet
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Your activity chart will appear here
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Main Header */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl md:text-3xl font-bold">
                    Event Management Dashboard
                  </h1>
                  <p className="text-gray-400">
                    Real-time overview of your gigs and spending
                  </p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-sm">Live Updates</span>
                </div>
              </div>
            </div>

            {/* Status Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <RoleStatusCard
                title="Gigs Posted"
                value={gigsPosted}
                icon={
                  <div className="p-3 rounded-full bg-purple-500/10">
                    <Music className="text-purple-400" size={20} />
                  </div>
                }
                trend={gigsPosted > 0 ? "up" : "steady"}
              />
              <RoleStatusCard
                title="Completed"
                value={gigsBookedAndCompleted || 0}
                icon={
                  <div className="p-3 rounded-full bg-green-500/10">
                    <CheckCircle className="text-green-400" size={20} />
                  </div>
                }
                trend={gigsBookedAndCompleted > 0 ? "up" : "steady"}
              />
              <RoleStatusCard
                title="Total Spent"
                value={total}
                format="currency"
                icon={
                  <div className="p-3 rounded-full bg-blue-500/10">
                    <DollarSign className="text-blue-400" size={20} />
                  </div>
                }
                trend={total > 0 ? "up" : "steady"}
              />
              <RoleStatusCard
                title="Upcoming"
                value={upcoming || 0}
                icon={
                  <div className="p-3 rounded-full bg-amber-500/10">
                    <Calendar className="text-amber-400" size={20} />
                  </div>
                }
                trend={upcoming > 0 ? "up" : "steady"}
              />
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Tier Comparison */}
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-950/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-800">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-400" />
                Plan Comparison
              </h3>
              <div className="space-y-4">
                {Object.entries(tierInfo).map(([key, tier]) => (
                  <div
                    key={key}
                    className={cn(
                      "p-4 rounded-xl border transition-all",
                      userTier === key
                        ? "bg-gradient-to-r from-white/10 to-white/5 border-purple-600"
                        : "bg-black/20 border-gray-700 hover:border-gray-600",
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {tier.icon}
                        <span className="font-semibold">{tier.name}</span>
                      </div>
                      {userTier === key && (
                        <span className="px-2 py-1 text-xs rounded-full bg-gradient-to-r from-purple-600 to-pink-600">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 mb-3">
                      {tier.description}
                    </p>
                    <div className="space-y-2">
                      {tier.features.slice(0, 2).map((feature, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 text-sm"
                        >
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span>{feature.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-950/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-800">
              <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button
                  onClick={() => router.push("/hub/gigs/client/create")}
                  className="w-full justify-start bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <PlusIcon className="w-5 h-5 mr-2" />
                  Create New Gig
                </Button>
                <Button
                  onClick={() => router.push("/dashboard/analytics")}
                  variant="outline"
                  className="w-full justify-start border-gray-700 hover:bg-white/5"
                >
                  <BarChart className="w-5 h-5 mr-2" />
                  View Analytics
                </Button>
                <Button
                  onClick={() => router.push("/dashboard/billing")}
                  variant="outline"
                  className="w-full justify-start border-gray-700 hover:bg-white/5"
                >
                  <DollarSign className="w-5 h-5 mr-2" />
                  Billing & Plans
                </Button>
              </div>
            </div>

            {/* Tips & Tricks */}
            <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 backdrop-blur-lg rounded-2xl p-6 border border-blue-800/30">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-400" />
                Pro Tips
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5"></div>
                  <span>Complete your profile to improve trust score</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-purple-500 mt-1.5"></div>
                  <span>Use high-quality images for better gig visibility</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5"></div>
                  <span>Respond quickly to messages for better ratings</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Enhanced version with better loading state management
export function ClientDashboardWithLoading({
  gigsPosted = 0,
  total = 0,
  isPro,
  isLoading = false,
  isDataLoading = false,
}: {
  gigsPosted?: number;
  total?: number;
  isPro: boolean;
  isLoading?: boolean;
  isDataLoading?: boolean;
}) {
  const { userId } = useAuth();
  const gigs = useQuery(api.controllers.gigs.getGigsWithUsers);
  const router = useRouter();

  // Show full skeleton during initial load
  if (isLoading) {
    return <ClientDashboardSkeleton isPro={isPro} />;
  }

  // Show quick skeleton during data refresh
  if (isDataLoading) {
    return (
      <div className="relative">
        <ClientDashboardSkeleton isPro={isPro} />
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-2xl backdrop-blur-lg">
          <div className="text-center">
            <div className="w-12 h-12 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <div className="text-white text-sm font-medium">
              Refreshing data...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ClientDashboard
      gigsPosted={gigsPosted}
      total={total}
      isPro={isPro}
      isLoading={false}
    />
  );
}

// Plus Icon Component
function PlusIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 4v16m8-8H4"
      />
    </svg>
  );
}
