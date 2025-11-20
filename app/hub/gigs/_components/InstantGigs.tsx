// app/hub/gigs/_components/InstantGigs.tsx - UPDATED WITH PROPER LIMITS INTEGRATION
"use client";

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  memo,
  useRef,
} from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Edit,
  Crown,
  Zap,
  Users,
  TrendingUp,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useThemeColors } from "@/hooks/useTheme";

import { CreateTemplateTab } from "./tabs/CreateTemplateTab";
import { useTemplates } from "@/hooks/useTemplates";
import { useInstantGigs } from "@/hooks/useInstantGigs";
import { GigTemplate } from "@/convex/instantGigsTypes";
import { OnboardingModal } from "./tabs/OnBoardingModal";
import { GigSectionHeader } from "./GigSectionHeader";
import { MyTemplatesTab } from "./tabs/MyTemplateTab";
import { ProMusiciansTab } from "./ProMusicianTab";
import { BookingModal } from "./tabs/BookingModal";
import { useProMusicians } from "@/hooks/useProMusicians";
import { EnhancedMusician } from "@/types/musician";
import ConfirmPrompt from "@/components/ConfirmPrompt";
import { NormalGigsTab } from "./gigs/NormalGigTab";

// Memoize tab configuration

const TAB_CONFIG = [
  {
    id: "create",
    label: "⚡ Instant Gigs",
    icon: Zap,
    description: "Template-based quick booking",
  },
  {
    id: "normal",
    label: "📝 Normal Gigs",
    icon: Plus,
    description: "Traditional gig creation",
  },
  {
    id: "templates",
    label: "📋 My Templates",
    icon: Edit,
    description: "Manage your saved templates",
  },
  {
    id: "musicians",
    label: "👑 Pro Musicians",
    icon: Crown,
    description: "Browse premium talent",
  },
];

// Memoize quick stats data
const QUICK_STATS = [
  { icon: Zap, label: "Instant Booking", value: "Under 5 mins" },
  { icon: Users, label: "Pro Musicians", value: "50+" },
  { icon: TrendingUp, label: "Success Rate", value: "95%" },
];

// Template limits configuration
const TIER_LIMITS = {
  free: {
    templates: 3,
    customTemplates: 0,
    scratchTemplates: 0,
    maxTemplates: 3,
  },
  pro: {
    templates: 50,
    customTemplates: 25,
    scratchTemplates: 0,
    maxTemplates: 50,
  },
  premium: {
    templates: 100,
    customTemplates: 50,
    scratchTemplates: 25,
    maxTemplates: 100,
  },
} as const;

// Template Usage Indicator Component
const TemplateUsageIndicator = memo(
  ({
    templateLimitInfo,
    userTier,
    colors,
  }: {
    templateLimitInfo: any;
    userTier: string;
    colors: any;
  }) => {
    if (!templateLimitInfo) return null;

    const { current, max, reached } = templateLimitInfo;
    const usagePercentage = (current / max) * 100;
    const remaining = max - current;

    return (
      <div
        className={cn(
          "rounded-xl p-4 mb-4 border",
          colors.border,
          colors.backgroundMuted,
          reached && "border-red-200 dark:border-red-800"
        )}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center",
                reached
                  ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                  : usagePercentage >= 80
                    ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                    : "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
              )}
            >
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h4 className={cn("font-semibold", colors.text)}>
                {reached ? "Template Limit Reached" : "Template Usage"}
              </h4>
              <p className={cn("text-sm", colors.textMuted)}>
                {current} of {max} templates used
                {reached && " - Upgrade for more"}
              </p>
            </div>
          </div>

          {/* Progress Circle */}
          <div className="relative w-12 h-12">
            <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
              <path
                d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke={colors.border}
                strokeWidth="3"
              />
              <path
                d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke={
                  reached
                    ? "#ef4444"
                    : usagePercentage >= 80
                      ? "#f59e0b"
                      : "#10b981"
                }
                strokeWidth="3"
                strokeDasharray="100, 100"
                strokeDashoffset={100 - usagePercentage}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                className={cn(
                  "text-xs font-bold",
                  reached
                    ? "text-red-600"
                    : usagePercentage >= 80
                      ? "text-amber-600"
                      : "text-green-600"
                )}
              >
                {Math.round(usagePercentage)}%
              </span>
            </div>
          </div>
        </div>

        {/* Upgrade prompt for users nearing or at limit */}
        {(reached || usagePercentage >= 80) && (
          <div
            className={cn(
              "mt-3 pt-3 border-t",
              reached
                ? "border-red-200 dark:border-red-800"
                : "border-amber-200 dark:border-amber-800"
            )}
          >
            <div className="flex items-center justify-between">
              <span className={cn("text-sm", colors.textMuted)}>
                {reached
                  ? "No templates remaining"
                  : `${remaining} template${remaining !== 1 ? "s" : ""} remaining`}
              </span>
              <Button
                onClick={() => window.open("/pricing", "_blank")}
                size="sm"
                className={cn(
                  reached
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-amber-500 hover:bg-amber-600 text-white",
                  "text-xs font-semibold"
                )}
              >
                <Crown className="w-3 h-3 mr-1" />
                {reached ? "Upgrade Now" : "Upgrade"}
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }
);

TemplateUsageIndicator.displayName = "TemplateUsageIndicator";

// Memoize QuickStat component
const QuickStat = memo(({ stat, colors }: any) => {
  const Icon = stat.icon;
  return (
    <div
      className={cn(
        "text-center p-4 rounded-xl border transition-all duration-200 hover:scale-105",
        colors.border,
        colors.backgroundMuted,
        "hover:shadow-md"
      )}
    >
      <Icon
        className={cn(
          "w-8 h-8 mx-auto mb-2",
          "text-blue-600 dark:text-blue-400"
        )}
      />
      <div className={cn("text-lg font-bold mb-1", colors.text)}>
        {stat.value}
      </div>
      <div className={cn("text-xs font-medium", colors.textMuted)}>
        {stat.label}
      </div>
    </div>
  );
});

QuickStat.displayName = "QuickStat";

const TabButton = memo(
  ({
    tab,
    isActive,
    onClick,
    colors,
  }: {
    tab: any;
    isActive: boolean;
    onClick: () => void;
    colors: any;
  }) => {
    const Icon = tab.icon;
    return (
      <button
        onClick={onClick}
        className={cn(
          // Base styles
          "flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 sm:py-4 rounded-xl",
          "text-xs sm:text-sm font-medium transition-all duration-200",
          "flex-1 min-w-0 justify-center group relative",
          "hover:scale-105 transform-gpu",

          // Mobile: horizontal layout, Desktop: can be vertical if needed
          "flex-row sm:flex-col",

          // Active state
          isActive
            ? cn(
                "bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg",
                "shadow-blue-500/25 dark:shadow-blue-600/25",
                "border border-transparent",
                colors.textInverted
              )
            : cn(
                // Inactive state
                "border hover:shadow-md",
                colors.border,
                colors.hoverBg,
                "hover:border-blue-300 dark:hover:border-blue-600",
                colors.text
              )
        )}
      >
        {/* Icon with responsive sizing */}
        <div
          className={cn(
            "flex-shrink-0 transition-all duration-200",
            "flex items-center justify-center",
            isActive ? "scale-110" : "group-hover:scale-105"
          )}
        >
          <Icon
            className={cn(
              "transition-colors duration-200",
              "w-4 h-4 sm:w-5 sm:h-5", // Responsive icon sizing
              isActive
                ? "text-white"
                : cn("text-blue-600 dark:text-blue-400", colors.textMuted)
            )}
          />
        </div>

        {/* Text content */}
        <div
          className={cn(
            "text-left sm:text-center min-w-0 flex-1",
            "flex flex-col gap-0.5 sm:gap-1"
          )}
        >
          {/* Main label */}
          <div
            className={cn(
              "font-semibold transition-colors duration-200",
              "truncate", // Prevent text overflow
              isActive ? "text-white" : colors.text
            )}
          >
            {tab.label}
          </div>

          {/* Description - hidden on very small screens, shown on mobile+ */}
          <div
            className={cn(
              "transition-colors duration-200",
              "hidden xs:block", // Hide on very small screens (below 320px)
              "text-xs leading-tight",
              isActive
                ? "text-blue-100 dark:text-blue-200"
                : cn(colors.textMuted, "opacity-80")
            )}
          >
            {tab.description}
          </div>
        </div>

        {/* Active indicator dot for mobile */}
        {isActive && (
          <>
            {/* Desktop active indicator */}
            <div
              className={cn(
                "absolute -top-1 -right-1 w-2 h-2 rounded-full bg-green-400",
                "hidden sm:block", // Only show on desktop
                "shadow-lg shadow-green-400/50"
              )}
            />

            {/* Mobile active indicator */}
            <div
              className={cn(
                "absolute -top-1 -right-1 w-2 h-2 rounded-full bg-green-400",
                "block sm:hidden", // Only show on mobile
                "shadow-lg shadow-green-400/50"
              )}
            />
          </>
        )}
      </button>
    );
  }
);

TabButton.displayName = "TabButton";

export const InstantGigs = React.memo(({ user }: { user: any }) => {
  const router = useRouter();
  const { colors } = useThemeColors();
  const createTemplatesRef = useRef<HTMLDivElement>(null);
  const musicianTemplatesRef = useRef<HTMLDivElement>(null);

  const normalGigsRef = useRef<HTMLDivElement>(null);

  // Update the activeTab state type
  const [activeTab, setActiveTab] = useState<
    "create" | "normal" | "templates" | "musicians"
  >("create");

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdGigData, setCreatedGigData] = useState<{
    musicianName: string;
    templateTitle: string;
    gigType: string;
  } | null>(null);

  // Fixed scroll function
  const scrollToMusicians = useCallback(() => {
    setActiveTab("musicians");
    setTimeout(() => {
      if (musicianTemplatesRef.current) {
        musicianTemplatesRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      } else {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }
    }, 300);
  }, []);

  const scrollToTemplates = useCallback(() => {
    setActiveTab("create");
    setTimeout(() => {
      if (createTemplatesRef.current) {
        createTemplatesRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      } else {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }
    }, 300);
  }, []);
  const scrollToNormal = useCallback(() => {
    setActiveTab("normal");
    setTimeout(() => {
      if (normalGigsRef.current) {
        normalGigsRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      } else {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }
    }, 300);
  }, []);

  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedMusician, setSelectedMusician] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [createTabMode, setCreateTabMode] = useState<
    "default" | "guided" | "custom" | "scratch" | "normal"
  >("default");
  const [editingTemplate, setEditingTemplate] = useState<GigTemplate | null>(
    null
  );

  // Memoize user ID to prevent hook re-runs
  const userId = useMemo(() => user?._id, [user?._id]);
  const userTier = useMemo(() => user?.tier || "free", [user?.tier]);

  const {
    templates,
    isLoading: templatesLoading,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    templateLimitInfo, // GET THIS FROM useTemplates
    refetchTemplates,
    isRefetching,
  } = useTemplates(userId);

  const { stats, createGig } = useInstantGigs(userId);

  // Memoize templates data
  const memoizedTemplates = useMemo(() => templates, [templates?.length]);

  const { musicians: proMusicians } = useProMusicians({
    limit: 50,
    availableOnly: false,
  });

  // Memoize musicians data for booking modal
  const memoizedMusicians = useMemo(() => proMusicians || [], [proMusicians]);

  // Calculate effective template limit info
  const effectiveTemplateLimitInfo = useMemo(() => {
    if (templateLimitInfo) {
      return templateLimitInfo;
    }

    const maxTemplates =
      TIER_LIMITS[userTier as keyof typeof TIER_LIMITS]?.maxTemplates || 3;
    const current = memoizedTemplates.length;

    return {
      current,
      max: maxTemplates,
      reached: current >= maxTemplates,
    };
  }, [templateLimitInfo, userTier, memoizedTemplates.length]);

  // Debug template limits
  useEffect(() => {
    console.log("🔍 [TEMPLATE LIMITS DEBUG]:", {
      userTier,
      templateLimitInfo,
      effectiveTemplateLimitInfo,
      templatesCount: memoizedTemplates.length,
      tierLimits: TIER_LIMITS[userTier as keyof typeof TIER_LIMITS],
    });
  }, [
    userTier,
    templateLimitInfo,
    effectiveTemplateLimitInfo,
    memoizedTemplates.length,
  ]);

  // In your InstantGigs component, add this useEffect for debugging:
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem(
      "instant_gigs_onboarding_seen"
    );
    console.log("Onboarding debug:", {
      hasSeenOnboarding,
      templatesLength: memoizedTemplates.length,
      templatesLoading,
      showOnboarding,
    });

    if (
      !hasSeenOnboarding ||
      (hasSeenOnboarding === null &&
        memoizedTemplates.length === 0 &&
        !templatesLoading &&
        !showOnboarding)
    ) {
      console.log("SHOWING ONBOARDING MODAL");
      setShowOnboarding(true);
    }
  }, [memoizedTemplates.length, templatesLoading, showOnboarding]);

  // FIXED: Modal handlers with proper state updates
  const handleCloseOnboarding = useCallback(() => {
    setShowOnboarding(false);
    localStorage.setItem("instant_gigs_onboarding_seen", "true");
  }, []);

  const handleScratchCreation = useCallback(() => {
    setShowOnboarding(false);
    setActiveTab("create");
    setCreateTabMode("scratch");
    localStorage.setItem("instant_gigs_onboarding_seen", "true");
  }, []);

  // UPDATE: Modify the onboarding handlers to include scratch
  const handleGuidedCreation = useCallback(() => {
    setShowOnboarding(false);
    setActiveTab("create");
    setCreateTabMode("guided");
    localStorage.setItem("instant_gigs_onboarding_seen", "true");
  }, []);
  const handleNormalCreation = useCallback(() => {
    console.log("🔄 Switching to NORMAL gig creation tab");

    // Close onboarding modal
    setShowOnboarding(false);

    // KEY FIX: Switch to the "normal" tab in the main navigation
    setActiveTab("normal"); // This should change from "create" to "normal"

    // Reset create tab mode since we're leaving the create tab
    setCreateTabMode("default");

    // Mark onboarding as seen
    localStorage.setItem("instant_gigs_onboarding_seen", "true");

    console.log(
      "✅ Normal gig creation activated - main tab should be 'normal'"
    );
  }, []);
  useEffect(() => {
    console.log("🔍 [TAB DEBUG]:", {
      activeTab,
      showOnboarding,
      createTabMode,
    });
  }, [activeTab, showOnboarding, createTabMode]);
  const handleCustomCreation = useCallback(() => {
    setShowOnboarding(false);
    setActiveTab("create");
    setCreateTabMode("custom");
    localStorage.setItem("instant_gigs_onboarding_seen", "true");
  }, []);

  // Memoize other event handlers
  const handleCreateTemplate = useCallback(
    async (templateData: any) => {
      await createTemplate(templateData);
      setActiveTab("templates");
      setCreateTabMode("default");
    },
    [createTemplate]
  );

  const handleUpdateTemplate = useCallback(
    async (templateId: string, updates: Partial<GigTemplate>) => {
      await updateTemplate(templateId, updates);
      setActiveTab("templates");
      setEditingTemplate(null);
      setCreateTabMode("default");
      setTimeout(() => {
        refetchTemplates();
      }, 1000);
    },
    [updateTemplate]
  );

  const handleStartEdit = useCallback((template: GigTemplate) => {
    setEditingTemplate(template);
    setActiveTab("create");
    setCreateTabMode("custom");
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingTemplate(null);
    setCreateTabMode("default");
  }, []);

  const handleDeleteTemplate = useCallback(
    async (templateId: string) => {
      await deleteTemplate(templateId);
    },
    [deleteTemplate]
  );

  const handleRequestToBook = useCallback((musician: any) => {
    console.log("🎵 handleRequestToBook called with:", musician);

    if (musician === null) {
      console.log("✅ Opening booking modal without pre-selected musician");
    } else if (musician && musician._id) {
      console.log(
        "✅ Opening booking modal with pre-selected musician:",
        musician.firstname
      );
    } else {
      console.error("❌ Invalid data passed to handleRequestToBook:", musician);
      return;
    }

    setSelectedMusician(musician);
    setShowBookingModal(true);
  }, []);

  const handleSubmitBooking = useCallback(
    async (templateId: string, selectedMusician: EnhancedMusician) => {
      setIsLoading(true);
      try {
        const template = memoizedTemplates.find((t) => t.id === templateId);
        if (!template || !selectedMusician) {
          console.error("❌ Missing template or musician data");
          return;
        }

        const musicianName =
          `${selectedMusician.firstname || ""} ${selectedMusician.lastname || ""}`.trim() ||
          selectedMusician.username ||
          "Musician";
        const clientName =
          `${user.firstname || ""} ${user.lastname || ""}`.trim() ||
          user.username ||
          "Client";

        const bookingData = {
          title: template.title,
          description: template.description,
          date: template.date,
          venue: template.venue,
          budget: template.budget,
          gigType: template.gigType,
          duration: template.duration,
          setlist: template.setlist || "",
          clientId: userId,
          clientName: clientName,
          invitedMusicianId: selectedMusician._id,
          musicianName: musicianName,
        };

        console.log("🚀 Sending booking data to backend:", bookingData);

        await createGig(bookingData);

        // SUCCESS: Show success modal
        setCreatedGigData({
          musicianName: musicianName,
          templateTitle: template.title,
          gigType: template.gigType,
        });
        setShowSuccessModal(true);

        // Close booking modal
        setShowBookingModal(false);
        setSelectedMusician(null);
      } catch (error) {
        console.error("Error submitting booking:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [memoizedTemplates, createGig, userId, user]
  );

  const handleTabChange = useCallback(
    (tabId: "create" | "normal" | "templates" | "musicians") => {
      console.log("🔄 Switching main tab to:", tabId);
      setActiveTab(tabId);

      // Only reset create tab stuff if we're switching to create tab
      if (tabId === "create") {
        setEditingTemplate(null);
        setCreateTabMode("default");
      }
    },
    []
  );
  const handleBookingModalClose = useCallback(() => {
    setShowBookingModal(false);
    setSelectedMusician(null);
  }, []);

  const handleShowTutorial = useCallback(() => {
    setShowOnboarding(true);
  }, []);

  // Memoize computed values
  const hasTemplates = useMemo(
    () => memoizedTemplates.length > 0,
    [memoizedTemplates.length]
  );

  const tabContent = useMemo(() => {
    switch (activeTab) {
      case "create":
        return (
          <div ref={createTemplatesRef}>
            {/* Template Usage Indicator */}
            <TemplateUsageIndicator
              templateLimitInfo={effectiveTemplateLimitInfo}
              userTier={userTier}
              colors={colors}
            />

            <CreateTemplateTab
              onCreateTemplate={handleCreateTemplate}
              onUpdateTemplate={
                editingTemplate ? handleUpdateTemplate : undefined
              }
              user={user}
              existingTemplates={memoizedTemplates}
              mode={createTabMode}
              onFormClose={handleCancelEdit}
              isLoading={templatesLoading}
              editingTemplate={editingTemplate}
              templateLimitInfo={effectiveTemplateLimitInfo}
            />
          </div>
        );

      case "normal":
        return (
          // ← ADD THIS RETURN
          <div ref={normalGigsRef}>
            <NormalGigsTab user={user} colors={colors} />{" "}
            {/* ← REMOVE THE SEMICOLON */}
          </div>
        );

      case "templates":
        return (
          <MyTemplatesTab
            templates={memoizedTemplates}
            onStartEdit={handleStartEdit}
            onDeleteTemplate={handleDeleteTemplate}
            onRequestToBook={handleRequestToBook}
            isLoading={templatesLoading}
            refetchTemplates={refetchTemplates}
            isRefetching={isRefetching}
            templateLimitInfo={effectiveTemplateLimitInfo}
          />
        );

      case "musicians":
        return (
          <div ref={musicianTemplatesRef}>
            <ProMusiciansTab
              onRequestToBook={handleRequestToBook}
              user={user}
              hasTemplates={hasTemplates}
            />
          </div>
        );

      default:
        return null;
    }
  }, [
    activeTab,
    createTabMode,
    editingTemplate,
    memoizedTemplates,
    templatesLoading,
    hasTemplates,
    handleCreateTemplate,
    handleUpdateTemplate,
    handleCancelEdit,
    handleStartEdit,
    handleDeleteTemplate,
    handleRequestToBook,
    user,
    effectiveTemplateLimitInfo,
    userTier,
    colors,
  ]);

  return (
    <div className="space-y-6">
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={handleCloseOnboarding}
        onGuidedCreation={handleGuidedCreation}
        onCustomCreation={handleCustomCreation}
        onScratchCreation={handleScratchCreation}
        onNormalCreation={handleNormalCreation}
        scrollToTemplates={scrollToTemplates}
        scrollToNormal={scrollToNormal}
      />

      {/* Enhanced Header Section */}
      <div
        className={cn(
          "rounded-2xl p-6",
          colors.card,
          colors.border,
          "border shadow-sm",
          colors.background
        )}
      >
        <GigSectionHeader
          title="Gig Creation Hub"
          description="Choose between instant template-based booking or traditional gig creation"
          user={user}
          type="instant-gigs"
          stats={{
            total: stats?.total || 0,
            accepted: stats?.accepted || 0,
            pending: stats?.pending || 0,
            deputySuggested: stats?.deputySuggested || 0,
            templates: memoizedTemplates?.length || 0,
          }}
          onScrollToTemplates={scrollToTemplates}
          actions={
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 lg:items-end">
              <Button
                onClick={scrollToTemplates}
                className={cn(
                  "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300",
                  colors.textInverted
                )}
              >
                <Zap className="w-4 h-4 mr-2" />
                Create Instant Gig
              </Button>
              <Button
                variant="outline"
                onClick={() => setActiveTab("normal")}
                className={cn(
                  "border-2 hover:border-green-300 transition-all duration-300",
                  colors.border,
                  colors.hoverBg
                )}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Normal Gig
              </Button>{" "}
              <Button
                variant="outline"
                onClick={scrollToMusicians}
                className={cn(
                  "border-2 hover:border-blue-300 transition-all duration-300",
                  colors.border,
                  colors.hoverBg
                )}
              >
                <Users className="w-4 h-4 mr-2" />
                Browse Musicians
              </Button>
            </div>
          }
        >
          {/* Your custom content remains the same */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className={cn("text-sm mb-6 max-w-2xl", colors.textMuted)}>
                    Create reusable templates, discover verified pro musicians,
                    and book instantly. Perfect for weddings, corporate events,
                    parties, and more.
                  </p>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 max-w-md">
                {QUICK_STATS.map((stat, index) => (
                  <QuickStat key={index} stat={stat} colors={colors} />
                ))}
              </div>
            </div>
          </div>
        </GigSectionHeader>
      </div>

      {/* Enhanced Tab Navigation */}
      <div
        className={cn(
          "rounded-2xl p-2",
          colors.card,
          colors.border,
          "border shadow-sm",
          colors.background
        )}
      >
        <div className="flex space-x-2">
          {TAB_CONFIG.map((tab) => (
            <TabButton
              key={tab.id}
              tab={tab}
              isActive={activeTab === tab.id}
              onClick={() => handleTabChange(tab.id as any)}
              colors={colors}
            />
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[500px]">{tabContent}</div>

      {/* Booking Modal */}
      <BookingModal
        isOpen={showBookingModal}
        onClose={handleBookingModalClose}
        musician={selectedMusician}
        templates={memoizedTemplates}
        onSubmitBooking={handleSubmitBooking}
        isLoading={isLoading}
        musicians={memoizedMusicians}
      />

      {/* Help Section */}
      {memoizedTemplates.length === 0 &&
        activeTab === "create" &&
        createTabMode === "default" && (
          <div
            className={cn(
              "rounded-2xl p-6 text-center",
              colors.card,
              colors.border,
              "border shadow-sm",
              colors.backgroundMuted
            )}
          >
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center shadow-lg">
              <Zap className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className={cn("text-xl font-bold mb-2", colors.text)}>
              Ready to Get Started?
            </h3>
            <p
              className={cn("text-sm mb-4 max-w-md mx-auto", colors.textMuted)}
            >
              Create your first template to start booking musicians instantly.
              Save time on recurring events and build your preferred musician
              network.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={() => handleTabChange("musicians")}
                variant="outline"
                size="sm"
                className={cn("border-2", colors.border, colors.hoverBg)}
              >
                Browse Musicians First
              </Button>
              <Button
                onClick={handleShowTutorial}
                variant="outline"
                size="sm"
                className={cn("border-2", colors.border, colors.hoverBg)}
              >
                View Tutorial Again
              </Button>
            </div>
          </div>
        )}

      <ConfirmPrompt
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        onConfirm={() => {
          router.push("/hub/gigs?tab=invites");
          setShowSuccessModal(false);
        }}
        onCancel={() => {
          setShowSuccessModal(false);
        }}
        title="🎉 Booking Request Sent!"
        question={`Your booking request for "${createdGigData?.templateTitle}" has been sent to ${createdGigData?.musicianName}. They'll respond shortly.`}
        userInfo={{
          id: selectedMusician?._id || "",
          name: createdGigData?.musicianName || "Musician",
          username: selectedMusician?.username,
          image: selectedMusician?.picture,
          type: "musician",
          instrument: selectedMusician?.instrument,
          city: selectedMusician?.city,
        }}
        confirmText="View My Invites"
        cancelText="Create Another Booking"
        variant="success"
        size="md"
      />
    </div>
  );
});

InstantGigs.displayName = "InstantGigs";
