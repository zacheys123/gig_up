// app/hub/gigs/_components/UpgradeBanner.tsx
"use client";

import React, { memo } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useThemeColors } from "@/hooks/useTheme";
import {
  Crown,
  Lock,
  Zap,
  Users,
  Briefcase,
  UserCheck,
  Calendar,
  Target,
  TrendingUp,
  Star,
  CheckCircle,
  ArrowRight,
  Music,
  Megaphone,
  Building,
  PartyPopper,
} from "lucide-react";

interface UpgradeBannerProps {
  featureName: string;
  userTier: string;
  userRole: "musician" | "client" | "booker";
  onUpgrade?: (tier: "pro" | "premium") => void;
  isDarkMode?: boolean;
}

// Role-specific feature configurations
const getRoleFeatures = (
  role: "musician" | "client" | "booker",
  featureName: string,
) => {
  const baseFeatures = {
    musician: {
      "instant-gigs": {
        title: "Instant Booking Access",
        description: "Get booked instantly for premium gigs without waiting",
        icon: Zap,
        cycle: "Apply → Get Matched → Booked in 24h",
        features: [
          "Instant gig matching with clients",
          "Priority in booking algorithms",
          "Pre-negotiated rates & terms",
          "Auto-confirm recurring gigs",
          "Direct client communication",
          "Rating boost in search results",
        ],
        stats: [
          { value: "5x", label: "More Bookings" },
          { value: "24h", label: "Avg Response" },
          { value: "4.8★", label: "Avg Rating" },
        ],
      },
      "gig-invites": {
        title: "Premium Invite System",
        description: "Receive exclusive invites from top clients and venues",
        icon: UserCheck,
        cycle: "Invited → Review → Accept/Decline",
        features: [
          "Exclusive client invitations",
          "Priority in venue booking lists",
          "Advanced invite filtering",
          "Bulk response management",
          "Invite analytics & insights",
          "Direct booking without audition",
        ],
        stats: [
          { value: "50%", label: "More Invites" },
          { value: "2x", label: "Higher Pay" },
          { value: "VIP", label: "Access" },
        ],
      },
    },
    client: {
      "instant-gigs": {
        title: "Instant Gig Creation",
        description: "Book premium musicians in minutes, not days",
        icon: Zap,
        cycle: "Create Template → Match → Book in 5min",
        features: [
          "50+ professional gig templates",
          "Instant musician matching",
          "Pre-negotiated pricing",
          "Auto-scheduling & reminders",
          "Backup musician options",
          "Priority customer support",
        ],
        stats: [
          { value: "80%", label: "Time Saved" },
          { value: "50+", label: "Pro Musicians" },
          { value: "95%", label: "Success Rate" },
        ],
      },
      "gig-invites": {
        title: "Advanced Invite Management",
        description: "Send targeted invites to your preferred musicians",
        icon: UserCheck,
        cycle: "Create Invite → Send → Track Responses",
        features: [
          "Unlimited invite sending",
          "Advanced musician filtering",
          "Bulk invite management",
          "Response tracking & analytics",
          "Custom invite templates",
          "Priority musician notifications",
        ],
        stats: [
          { value: "3x", label: "Faster Booking" },
          { value: "90%", label: "Response Rate" },
          { value: "VIP", label: "Access" },
        ],
      },
      "crew-management": {
        title: "Professional Crew Management",
        description: "Build and manage your dream music crew",
        icon: Users,
        cycle: "Create Crew → Add Members → Manage Gigs",
        features: [
          "Unlimited crew creation",
          "Advanced member management",
          "Crew scheduling & availability",
          "Payment splitting tools",
          "Crew performance analytics",
          "Backup musician system",
        ],
        stats: [
          { value: "5", label: "Crews Max" },
          { value: "25", label: "Members Total" },
          { value: "Auto", label: "Scheduling" },
        ],
      },
    },
    booker: {
      applications: {
        title: "Advanced Application Management",
        description: "Streamline your gig application process",
        icon: Briefcase,
        cycle: "Post → Review → Hire Efficiently",
        features: [
          "Advanced applicant filtering",
          "Bulk application management",
          "Custom application forms",
          "Applicant rating system",
          "Automated responses",
          "Performance analytics",
        ],
        stats: [
          { value: "70%", label: "Time Saved" },
          { value: "3x", label: "More Hires" },
          { value: "Auto", label: "Filtering" },
        ],
      },
      "active-projects": {
        title: "Project Management Suite",
        description: "Manage all your music projects in one place",
        icon: Target,
        cycle: "Plan → Execute → Deliver Successfully",
        features: [
          "Unlimited project creation",
          "Team collaboration tools",
          "Project timeline tracking",
          "Budget management",
          "Client communication portal",
          "Performance analytics",
        ],
        stats: [
          { value: "10", label: "Projects" },
          { value: "50", label: "Team Members" },
          { value: "Real-time", label: "Updates" },
        ],
      },
      "crew-management": {
        title: "Professional Crew Management",
        description: "Build and manage talent crews for your projects",
        icon: Users,
        cycle: "Build Crew → Assign → Manage Projects",
        features: [
          "Multiple crew management",
          "Talent pool building",
          "Availability scheduling",
          "Payment processing",
          "Performance tracking",
          "Client rating system",
        ],
        stats: [
          { value: "10", label: "Crews Max" },
          { value: "100", label: "Talent Pool" },
          { value: "Smart", label: "Matching" },
        ],
      },
    },
  };

  const roleConfig = baseFeatures[role];
  const featureConfig = (roleConfig as any)[featureName];
  return featureConfig || baseFeatures.client["instant-gigs"];
};

const getEventExamples = (role: "musician" | "client" | "booker") => {
  if (role === "musician") {
    return [
      { icon: "💒", name: "Wedding Ceremonies", type: "High Pay" },
      { icon: "🏢", name: "Corporate Events", type: "Regular Work" },
      { icon: "🎪", name: "Music Festivals", type: "Exposure" },
      { icon: "🎭", name: "Club Nights", type: "Weekly Gigs" },
    ];
  }

  if (role === "client") {
    return [
      { icon: "💒", name: "Wedding Receptions", type: "Elegant Music" },
      { icon: "🏢", name: "Corporate Galas", type: "Professional" },
      { icon: "🎉", name: "Private Parties", type: "Custom Playlists" },
      { icon: "🍽️", name: "Restaurant Ambiance", type: "Background Music" },
    ];
  }

  return [
    { icon: "🎬", name: "Film Scoring", type: "Production Projects" },
    { icon: "🎤", name: "Concert Tours", type: "Large Scale" },
    { icon: "📺", name: "TV Commercials", type: "Studio Work" },
    { icon: "🏟️", name: "Stadium Events", type: "Major Productions" },
  ];
};

const StatItem = ({ value, label, colors, isDarkMode }: any) => (
  <div
    className={cn(
      "text-center p-3 rounded-xl border",
      colors.border,
      isDarkMode ? "bg-slate-800/50" : "bg-slate-50",
    )}
  >
    <div className={cn("text-xl font-bold mb-1", colors.text)}>{value}</div>
    <div className={cn("text-xs font-medium", colors.textMuted)}>{label}</div>
  </div>
);

const FeatureItem = ({ feature, colors, isDarkMode }: any) => (
  <div className="flex items-center gap-3 group">
    <CheckCircle
      className={cn(
        "w-4 h-4 flex-shrink-0 group-hover:scale-110 transition-transform",
        isDarkMode ? "text-green-400" : "text-green-500",
      )}
    />
    <span
      className={cn(
        "text-sm group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors",
        colors.text,
      )}
    >
      {feature}
    </span>
  </div>
);

const EventExample = ({ event, colors, isDarkMode }: any) => (
  <div
    className={cn(
      "text-center p-3 rounded-xl border",
      colors.border,
      isDarkMode ? "bg-slate-800/50" : "bg-slate-50",
    )}
  >
    <div className="text-2xl mb-2">{event.icon}</div>
    <div className={cn("text-sm font-semibold mb-1", colors.text)}>
      {event.name}
    </div>
    <div className={cn("text-xs", colors.textMuted)}>{event.type}</div>
  </div>
);

export const UpgradeBanner: React.FC<UpgradeBannerProps> = memo(
  ({ featureName, userTier, userRole, onUpgrade, isDarkMode }) => {
    const { colors } = useThemeColors();

    const feature = getRoleFeatures(userRole, featureName);
    const eventExamples = getEventExamples(userRole);
    const Icon = feature.icon;

    const handleUpgrade = (tier: "pro" | "premium") => {
      if (onUpgrade) {
        onUpgrade(tier);
      } else {
        window.open("/dashboard/billing", "_blank");
      }
    };

    return (
      <div
        className={cn(
          "rounded-2xl p-8 border-2 border-dashed transition-colors duration-300",
          isDarkMode
            ? "border-slate-700 bg-gradient-to-br from-slate-900/50 to-slate-800/30"
            : "border-slate-200 bg-gradient-to-br from-amber-50/50 to-orange-50/30",
        )}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Icon className="w-10 h-10 text-white" />
          </div>

          <div className="px-4 py-1 rounded-full text-sm font-bold bg-amber-500 text-white inline-block mb-3 shadow-md">
            PRO FEATURE
          </div>

          <h2 className={cn("text-3xl font-bold mb-3", colors.text)}>
            {feature.title}
          </h2>
          <p className={cn("text-lg mb-6 max-w-2xl mx-auto", colors.textMuted)}>
            {feature.description}
          </p>

          {/* Workflow Cycle */}
          <div
            className={cn(
              "rounded-xl p-4 mb-6 max-w-md mx-auto border",
              isDarkMode
                ? "bg-slate-800/50 border-slate-700"
                : "bg-white border-slate-200",
            )}
          >
            <div className="flex items-center justify-center gap-2 mb-3">
              <Target
                className={cn(
                  "w-5 h-5",
                  isDarkMode ? "text-amber-400" : "text-amber-500",
                )}
              />
              <span className={cn("font-semibold text-sm", colors.text)}>
                How It Works:
              </span>
            </div>
            <div className={cn("text-sm font-medium text-center", colors.text)}>
              {feature.cycle}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Left Column - Features & Stats */}
          <div className="space-y-6">
            {/* Key Features */}
            <div>
              <h3
                className={cn(
                  "text-xl font-bold mb-4 flex items-center gap-2",
                  colors.text,
                )}
              >
                <Star
                  className={cn(
                    "w-5 h-5",
                    isDarkMode ? "text-amber-400" : "text-amber-500",
                  )}
                />
                What You Get
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {feature.features.map((item: string, index: number) => (
                  <FeatureItem
                    key={index}
                    feature={item}
                    colors={colors}
                    isDarkMode={isDarkMode}
                  />
                ))}
              </div>
            </div>

            {/* Stats */}
            <div>
              <h3
                className={cn(
                  "text-xl font-bold mb-4 flex items-center gap-2",
                  colors.text,
                )}
              >
                <TrendingUp
                  className={cn(
                    "w-5 h-5",
                    isDarkMode ? "text-green-400" : "text-green-500",
                  )}
                />
                Performance Boost
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {feature.stats.map((stat: any, index: number) => (
                  <StatItem
                    key={index}
                    value={stat.value}
                    label={stat.label}
                    colors={colors}
                    isDarkMode={isDarkMode}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Event Examples & Upgrade Options */}
          <div className="space-y-6">
            {/* Event Examples */}
            <div>
              <h3
                className={cn(
                  "text-xl font-bold mb-4 flex items-center gap-2",
                  colors.text,
                )}
              >
                <Calendar
                  className={cn(
                    "w-5 h-5",
                    isDarkMode ? "text-blue-400" : "text-blue-500",
                  )}
                />
                Perfect For{" "}
                {userRole === "musician"
                  ? "These Gigs"
                  : userRole === "client"
                    ? "Your Events"
                    : "Your Projects"}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {eventExamples.map((event, index) => (
                  <EventExample
                    key={index}
                    event={event}
                    colors={colors}
                    isDarkMode={isDarkMode}
                  />
                ))}
              </div>
            </div>

            {/* Upgrade Options */}
            <div
              className={cn(
                "rounded-xl p-4 border",
                isDarkMode
                  ? "bg-slate-800/50 border-slate-700"
                  : "bg-white border-slate-200",
              )}
            >
              <h3
                className={cn(
                  "text-lg font-bold mb-3 text-center",
                  colors.text,
                )}
              >
                Choose Your Plan
              </h3>

              <div className="space-y-3">
                <Button
                  onClick={() => handleUpgrade("pro")}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                  size="lg"
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Upgrade to Pro
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>

                <Button
                  onClick={() => handleUpgrade("premium")}
                  variant="outline"
                  className={cn(
                    "w-full border-2 font-semibold transition-all",
                    isDarkMode
                      ? "border-amber-500 text-amber-400 hover:bg-amber-950/30"
                      : "border-amber-500 text-amber-600 hover:bg-amber-50",
                  )}
                  size="lg"
                >
                  <Crown className="w-5 h-5 mr-2" />
                  Go Premium
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>

              {/* Current Plan */}
              <div
                className={cn(
                  "mt-3 pt-3 border-t text-center text-sm",
                  isDarkMode ? "border-slate-700" : "border-slate-200",
                )}
              >
                <span className={colors.textMuted}>Current: </span>
                <span className={cn("font-semibold", colors.text)}>
                  {userTier === "free"
                    ? "Free Plan"
                    : userTier.charAt(0).toUpperCase() + userTier.slice(1)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div
          className={cn(
            "rounded-xl p-6 text-center",
            isDarkMode
              ? "bg-gradient-to-r from-blue-600 to-indigo-600"
              : "bg-gradient-to-r from-blue-500 to-indigo-500",
            "text-white shadow-xl",
          )}
        >
          <h4 className="text-xl font-bold mb-2">
            Ready to Level Up Your{" "}
            {userRole === "musician"
              ? "Music Career"
              : userRole === "client"
                ? "Events"
                : "Booking Business"}
            ?
          </h4>
          <p className="mb-4 opacity-90">
            Join thousands of {userRole}s who have transformed their{" "}
            {userRole === "musician"
              ? "booking process"
              : userRole === "client"
                ? "event planning"
                : "talent management"}{" "}
            with our premium features
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => handleUpgrade("pro")}
              className="bg-white text-green-600 hover:bg-gray-100 font-semibold shadow-md"
            >
              <Zap className="w-5 h-5 mr-2" />
              Start with Pro
            </Button>
            <Button
              onClick={() => window.open("/features", "_blank")}
              variant="outline"
              className={cn(
                "border-white text-white hover:bg-white hover:text-green-600",
              )}
            >
              Compare All Plans
            </Button>
          </div>
        </div>
      </div>
    );
  },
);

UpgradeBanner.displayName = "UpgradeBanner";
