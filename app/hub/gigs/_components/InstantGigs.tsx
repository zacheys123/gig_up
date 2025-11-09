// app/hub/gigs/_components/InstantGigs.tsx - UPDATED WITH PROPER THEME USAGE
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
import { Plus, Edit, Crown, Zap, Users, TrendingUp } from "lucide-react";
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

// Memoize tab configuration
const TAB_CONFIG = [
  {
    id: "create",
    label: "🎵 Create Template",
    icon: Plus,
    description: "Design reusable gig templates",
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

// Memoize TabButton component
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
          "flex flex-col items-center gap-2 px-4 py-4 rounded-xl text-sm font-medium transition-all duration-200 flex-1 justify-center group",
          isActive
            ? cn(
                "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg",
                colors.textInverted
              )
            : cn(
                colors.border,
                colors.hoverBg,
                "border hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md"
              )
        )}
      >
        <Icon
          className={cn(
            "w-5 h-5 transition-transform duration-200",
            isActive
              ? "text-white scale-110"
              : cn("text-blue-600 dark:text-blue-400 group-hover:scale-110")
          )}
        />
        <div className="text-center">
          <div
            className={cn(
              "font-medium transition-colors duration-200",
              isActive ? "text-white" : colors.text
            )}
          >
            {tab.label}
          </div>
          <div
            className={cn(
              "text-xs mt-1 transition-colors duration-200",
              isActive ? "text-blue-100 dark:text-blue-200" : colors.textMuted
            )}
          >
            {tab.description}
          </div>
        </div>
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

  // State management with guided/custom flows
  const [activeTab, setActiveTab] = useState<
    "create" | "templates" | "musicians"
  >("create");

  //

  // Fixed scroll function
  const scrollToMusicians = useCallback(() => {
    // Switch to create tab first (where the templates are)
    setActiveTab("musicians");

    // Wait for tab switch and content to render, then scroll
    setTimeout(() => {
      if (musicianTemplatesRef.current) {
        musicianTemplatesRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      } else {
        // Fallback: scroll to top of the component
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }
    }, 300); // Increased delay to ensure content is rendered
  }, []);

  const scrollToTemplates = useCallback(() => {
    // Switch to create tab first (where the templates are)
    setActiveTab("create");

    // Wait for tab switch and content to render, then scroll
    setTimeout(() => {
      if (createTemplatesRef.current) {
        createTemplatesRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      } else {
        // Fallback: scroll to top of the component
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }
    }, 300); // Increased delay to ensure content is rendered
  }, []);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedMusician, setSelectedMusician] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [createTabMode, setCreateTabMode] = useState<
    "default" | "guided" | "custom" | "scratch"
  >("default");
  const [editingTemplate, setEditingTemplate] = useState<GigTemplate | null>(
    null
  );

  // Memoize user ID to prevent hook re-runs
  const userId = useMemo(() => user?._id, [user?._id]);

  // Use optimized hooks
  const {
    templates,
    isLoading: templatesLoading,
    createTemplate,
    updateTemplate,
    deleteTemplate,
  } = useTemplates(userId);

  const { stats, createGig } = useInstantGigs(userId);

  // Memoize templates data
  const memoizedTemplates = useMemo(() => templates, [templates?.length]);

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
      !hasSeenOnboarding &&
      memoizedTemplates.length === 0 &&
      !templatesLoading &&
      !showOnboarding
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
    setSelectedMusician(musician);
    setShowBookingModal(true);
  }, []);

  const handleSubmitBooking = useCallback(
    async (templateId: string) => {
      setIsLoading(true);
      try {
        const template = memoizedTemplates.find((t) => t.id === templateId);
        if (!template || !selectedMusician) return;

        await createGig({
          title: template.title,
          description: template.description,
          date: template.date,
          venue: template.venue,
          budget: template.budget,
          gigType: template.gigType,
          duration: template.duration,
          setlist: template.setlist,
          clientId: userId,
          clientName: user.name,
          invitedMusicianId: selectedMusician.id,
          musicianName: selectedMusician.name,
        });

        setShowBookingModal(false);
        setSelectedMusician(null);
      } catch (error) {
        console.error("Error submitting booking:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [memoizedTemplates, selectedMusician, createGig, userId, user.name]
  );

  const handleTabChange = useCallback(
    (tabId: "create" | "templates" | "musicians") => {
      setActiveTab(tabId);
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
            <CreateTemplateTab
              onCreateTemplate={handleCreateTemplate}
              onUpdateTemplate={
                editingTemplate ? handleUpdateTemplate : undefined
              }
              user={user}
              existingTemplates={memoizedTemplates}
              mode={createTabMode} // This now includes "scratch"
              onFormClose={handleCancelEdit}
              isLoading={templatesLoading}
              editingTemplate={editingTemplate}
            />
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
  ]);

  return (
    <div className="space-y-6">
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={handleCloseOnboarding}
        onGuidedCreation={handleGuidedCreation}
        onCustomCreation={handleCustomCreation}
        onScratchCreation={handleScratchCreation} // This should work now
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
          title="Instant Gigs"
          description="Book premium musicians in minutes, not days"
          user={user}
          type="instant-gigs"
          stats={{
            total: stats?.total || 0,
            accepted: stats?.accepted || 0,
            pending: stats?.pending || 0,
            deputySuggested: stats?.deputySuggested || 0,
            templates: memoizedTemplates?.length || 0,
          }}
          onScrollToTemplates={scrollToTemplates} // Add this prop
          // In your InstantGigs component, update the actions prop:
          actions={
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 lg:items-end">
              <Button
                onClick={scrollToTemplates} // Use the scroll function directly
                className={cn(
                  "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300",
                  colors.textInverted
                )}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Template
              </Button>
              <Button
                variant="outline"
                onClick={scrollToMusicians} // Use the scroll function directly
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
    </div>
  );
});

InstantGigs.displayName = "InstantGigs";
