// app/hub/gigs/_components/tabs/CreateTemplateTab.tsx - UPDATED WITH TIER SYSTEM
"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  memo,
  useRef,
} from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Music,
  Calendar,
  MapPin,
  BookOpen,
  ArrowLeft,
  Lightbulb,
  Plus,
  ArrowRight,
  Clock,
  DollarSign,
  CheckCircle,
  Wand2,
  Shield,
  HelpCircle,
  Sparkles,
  Lock,
  Crown,
  Star,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useThemeColors } from "@/hooks/useTheme";
import { GigTemplate } from "@/convex/instantGigsTypes";

// Add these imports at the top of CreateTemplateTab.tsx
import { useRouter } from "next/navigation";
import ConfirmPrompt from "@/components/ConfirmPrompt"; // Adjust path as needed
import { useCheckTrial } from "@/hooks/useCheckTrial";

// Add this interface for prompt data
interface PromptData {
  isOpen: boolean;
  title: string;
  message: string;
  requiredTier: "pro" | "premium";
  templateName?: string;
}
interface CreateTemplateTabProps {
  onCreateTemplate: (
    template: Omit<GigTemplate, "id" | "status" | "createdAt">
  ) => void;
  onUpdateTemplate?: (
    templateId: string,
    updates: Partial<GigTemplate>
  ) => void;
  user: any;
  existingTemplates: GigTemplate[];
  mode: "default" | "guided" | "scratch" | "custom";
  onFormClose: () => void;
  isLoading: boolean;
  editingTemplate?: GigTemplate | null;
  templateLimitInfo?: {
    // This is defined as optional
    current: number;
    max: number | null;
    reached: boolean;
  };
}

// Clear mode separation with tier requirements
const MODE_FLOW = {
  guided: {
    description: "Start with professional templates",
    showTemplates: true,
    tier: "free",
  },
  custom: {
    description: "Advanced customization with template foundation",
    showTemplates: false,
    tier: "pro",
  },
  scratch: {
    description: "Complete creative freedom from blank canvas",
    showTemplates: false,
    tier: "premium",
  },
} as const;

const EXAMPLE_TEMPLATES = [
  {
    id: "wedding-example",
    title: "Wedding Ceremony",
    description: "Elegant musical accompaniment for ceremonies and receptions",
    duration: "3-4 hours",
    fromTime: "10am",
    budget: "KES 25,000 - 40,000",
    icon: "💒",
    gigType: "wedding",
    tier: "free",
  },
  {
    id: "corporate-example",
    title: "Corporate Event",
    description: "Professional entertainment for business functions and galas",
    duration: "4 hours",
    fromTime: "6pm",
    budget: "KES 35,000 - 60,000",
    icon: "🏢",
    gigType: "corporate",
    tier: "free",
  },
  {
    id: "private-party-example",
    title: "Private Party",
    description: "Customized entertainment for birthdays and celebrations",
    duration: "3-4 hours",
    fromTime: "1pm",
    budget: "KES 20,000 - 35,000",
    icon: "🎉",
    gigType: "private-party",
    tier: "pro",
  },
  {
    id: "concert-example",
    title: "Concert/Show",
    description: "Dynamic performances for live shows and events",
    duration: "2-3 hours",
    fromTime: "9pm",
    budget: "KES 30,000 - 50,000",
    icon: "🎤",
    gigType: "concert",
    tier: "pro",
  },
  {
    id: "restaurant-example",
    title: "Restaurant/Lounge",
    description: "Atmospheric music for dining and social venues",
    duration: "4 hours",
    budget: "KES 15,000 - 25,000",
    fromTime: "4pm",
    icon: "🍽️",
    gigType: "restaurant",
    tier: "free",
  },
  {
    id: "church-example",
    title: "Church Service",
    description: "Inspirational music for worship services and events",
    duration: "2-3 hours",
    fromTime: "7am",
    budget: "KES 10,000 - 20,000",
    icon: "⛪",
    gigType: "church",
    tier: "free",
  },
  {
    id: "festival-example",
    title: "Festival",
    description: "High-energy performances for large audience events",
    duration: "1-2 hours",
    fromTime: "4pm",
    budget: "KES 40,000 - 80,000",
    icon: "🎪",
    gigType: "festival",
    tier: "premium",
  },
  {
    id: "club-example",
    title: "Club Night",
    description: "Energetic sets for nightlife and social events",
    duration: "4 hours",
    fromTime: "8pm",
    budget: "KES 20,000 - 35,000",
    icon: "🎭",
    gigType: "club",
    tier: "pro",
  },
  {
    id: "recording-example",
    title: "Recording Session",
    description: "Professional musicians for studio recording projects",
    duration: "4-6 hours",
    fromTime: "4pm",
    budget: "KES 25,000 - 45,000",
    icon: "🎹",
    gigType: "recording",
    tier: "pro",
  },
  {
    id: "individual-example",
    title: "Solo Musician",
    description: "Versatile individual performers for any occasion",
    duration: "3-4 hours",
    fromTime: "12am",
    budget: "KES 5,000 - 20,000",
    icon: "✨",
    gigType: "individual",
    tier: "free",
  },
];

const GIG_TYPES = [
  { value: "wedding", label: "💒 Wedding" },
  { value: "corporate", label: "🏢 Corporate Event" },
  { value: "private-party", label: "🎉 Private Party" },
  { value: "concert", label: "🎤 Concert/Show" },
  { value: "restaurant", label: "🍽️ Restaurant/Lounge" },
  { value: "church", label: "⛪ Church Service" },
  { value: "festival", label: "🎪 Festival" },
  { value: "club", label: "🎭 Club Night" },
  { value: "recording", label: "🎹 Recording Session" },
  { value: "individual", label: "✨ individual" },
  { value: "other", label: "✨ Other" },
];

// Helper function to check user tier access with grace period exception
const canAccessTier = (
  userTier: string,
  requiredTier: string,
  isInGracePeriod: boolean = false
) => {
  const tierLevels = { free: 0, pro: 1, premium: 2, elite: 3 };

  // Grace period restrictions
  const isRequestingPremiumOrElite =
    requiredTier === "premium" || requiredTier === "elite";
  if (isInGracePeriod && isRequestingPremiumOrElite) {
    return false; // No premium/elite access during grace period
  }

  // Grace period benefits - free users get Pro access
  let effectiveTier = userTier;
  const isFreeUser = userTier === "free";
  if (isInGracePeriod && isFreeUser) {
    effectiveTier = "pro"; // Upgrade free users to Pro during grace period
  }

  // Check if effective tier can access required tier
  const userTierLevel = tierLevels[effectiveTier as keyof typeof tierLevels];
  const requiredTierLevel = tierLevels[requiredTier as keyof typeof tierLevels];

  return userTierLevel >= requiredTierLevel;
};

// In the TemplateForm component, update the form fields:
const TemplateForm = memo(
  ({
    formData,
    creationMode,
    editingTemplate,
    selectedExample,
    handleSubmit,
    handleChange,
    handleBackToGuided,
    handleBackToDefault,
    colors,
    user,
    showUpgradePrompt,
    isInGracePeriod,
  }: any) => {
    const userTier = user?.tier || "free";
    const isUsingTemplate = !!selectedExample && !editingTemplate;

    // CORRECTED: Only show upgrade banner for free users using templates (not in grace period)
    const isFreeUser = userTier === "free";
    const lockedForFreeUsers =
      isUsingTemplate && isFreeUser && !isInGracePeriod;
    // But only lock fields for free users NOT in grace period
    const showUpgradeBanner =
      isUsingTemplate && (isFreeUser || isInGracePeriod);
    const LOCKED_FIELDS = ["title", "gigType", "budget", "duration", "setlist"];
    const isFieldLocked = (fieldName: string) =>
      lockedForFreeUsers && LOCKED_FIELDS.includes(fieldName);

    // Add form validation
    const isFormValid = useMemo(() => {
      return (
        formData.title?.trim() &&
        formData.gigType &&
        formData.budget?.trim() &&
        formData.duration?.trim() &&
        formData.description?.trim() &&
        formData.date &&
        formData.fromTime?.trim()
      );
    }, [formData]);

    // Validate budget format (optional but recommended)
    const isBudgetValid = useMemo(() => {
      if (!formData.budget) return false;
      // Allow formats like: 25,000 or 25000 or KES 25,000
      const budgetRegex = /^(KES\s?)?(\d{1,3}(,\d{3})*|\d+)$/;
      return budgetRegex.test(formData.budget.trim());
    }, [formData.budget]);

    return (
      <div
        className={cn("rounded-2xl p-6", colors.card, colors.border, "border")}
      >
        {/* Header section unchanged */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={
              creationMode === "guided"
                ? handleBackToGuided
                : handleBackToDefault
            }
            className={cn(
              "p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors",
              colors.text
            )}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h3 className={cn("text-xl font-bold", colors.text)}>
              {editingTemplate
                ? "Edit Template"
                : selectedExample
                  ? lockedForFreeUsers
                    ? "Use Template"
                    : "Customize Template"
                  : creationMode === "scratch"
                    ? "Start from Scratch"
                    : "Custom Creation"}
            </h3>
            <p className={cn("text-sm", colors.textMuted)}>
              {editingTemplate
                ? "Update your template details"
                : selectedExample
                  ? lockedForFreeUsers
                    ? "Free users can use templates as-is. Upgrade to customize."
                    : "Modify the example to fit your needs"
                  : creationMode === "scratch"
                    ? "Build your perfect template from the ground up"
                    : "Advanced customization with template foundation"}
            </p>
          </div>
        </div>

        {showUpgradeBanner && (
          <div
            className={cn(
              "mb-6 p-4 rounded-xl border-2 border-dashed text-center",
              colors.border,
              colors.backgroundMuted
            )}
          >
            <Crown className={cn("w-8 h-8 mx-auto mb-2", colors.warningText)} />
            <h4>Upgrade to Pro {isInGracePeriod && "(Before Trial Ends)"}</h4>
            <p>
              {isInGracePeriod
                ? "You're enjoying Pro features during trial. Upgrade to keep customizing templates permanently."
                : "Free users can use templates as-is. Upgrade to Pro to unlock field customization."}
            </p>
            <Button onClick={() => showUpgradePrompt("pro")}>
              <Crown className="w-4 h-4 mr-2" />
              Upgrade to Pro {isInGracePeriod && "(Special Offer)"}
            </Button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              <div className="space-y-2">
                <Label
                  htmlFor="title"
                  className={cn("text-sm font-medium", colors.text)}
                >
                  Gig Title {isFieldLocked("title") && "🔒"} *
                </Label>
                <Input
                  id="title"
                  placeholder="e.g., Saturday Night Jazz Session"
                  value={formData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  required
                  readOnly={isFieldLocked("title")}
                  className={cn(
                    colors.border,
                    "focus:ring-blue-500",
                    isFieldLocked("title") &&
                      "bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                  )}
                />
                {isFieldLocked("title") && (
                  <p className={cn("text-xs", colors.textMuted)}>
                    Title locked for free users. Upgrade to Pro to customize.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className={cn("text-sm font-medium", colors.text)}>
                  Gig Type {isFieldLocked("gigType") && "🔒"} *
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {GIG_TYPES.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => handleChange("gigType", type.value)}
                      disabled={isFieldLocked("gigType")}
                      className={cn(
                        "border rounded-lg p-3 text-sm text-left transition-all",
                        colors.border,
                        formData.gigType === type.value
                          ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950/20 border-blue-500"
                          : cn(colors.hoverBg, "hover:border-blue-300"),
                        isFieldLocked("gigType") &&
                          "opacity-60 cursor-not-allowed"
                      )}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
                {isFieldLocked("gigType") && (
                  <p className={cn("text-xs", colors.textMuted)}>
                    Gig type locked for free users. Upgrade to Pro to customize.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="date"
                  className={cn("text-sm font-medium", colors.text)}
                >
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Date *
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleChange("date", e.target.value)}
                  className={cn(colors.border, "focus:ring-blue-500")}
                  required
                  min={new Date().toISOString().split("T")[0]} // Prevent past dates
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="venue"
                  className={cn("text-sm font-medium", colors.text)}
                >
                  <MapPin className="w-4 h-4 inline mr-2" />
                  Venue (Optional)
                </Label>
                <Input
                  id="venue"
                  placeholder="e.g., Nairobi National Theatre"
                  value={formData.venue}
                  onChange={(e) => handleChange("venue", e.target.value)}
                  className={cn(colors.border, "focus:ring-blue-500")}
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div className="space-y-2">
                <Label
                  htmlFor="budget"
                  className={cn("text-sm font-medium", colors.text)}
                >
                  <DollarSign className="w-4 h-4 inline mr-2" />
                  Budget (KES) {isFieldLocked("budget") && "🔒"} *
                </Label>
                <Input
                  id="budget"
                  placeholder="e.g., 25,000"
                  value={formData.budget}
                  onChange={(e) => handleChange("budget", e.target.value)}
                  required
                  readOnly={isFieldLocked("budget")}
                  className={cn(
                    colors.border,
                    "focus:ring-blue-500",
                    isFieldLocked("budget") &&
                      "bg-gray-100 dark:bg-gray-800 cursor-not-allowed",
                    !isBudgetValid && formData.budget && "border-red-500"
                  )}
                />
                {isFieldLocked("budget") ? (
                  <p className={cn("text-xs", colors.textMuted)}>
                    Budget locked for free users. Upgrade to Pro to customize.
                  </p>
                ) : (
                  <>
                    <p className={cn("text-xs", colors.textMuted)}>
                      Typical rates: Wedding KES 25-40K • Corporate KES 30-60K •
                      Private Party KES 20-35K
                    </p>
                    {!isBudgetValid && formData.budget && (
                      <p className="text-xs text-red-500">
                        Please enter a valid budget (e.g., 25,000 or 25000)
                      </p>
                    )}
                  </>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="duration"
                  className={cn("text-sm font-medium", colors.text)}
                >
                  <Clock className="w-4 h-4 inline mr-2" />
                  Duration {isFieldLocked("duration") && "🔒"} *
                </Label>
                <Input
                  id="duration"
                  placeholder="e.g., 2-3 hours"
                  value={formData.duration}
                  onChange={(e) => handleChange("duration", e.target.value)}
                  required
                  readOnly={isFieldLocked("duration")}
                  className={cn(
                    colors.border,
                    "focus:ring-blue-500",
                    isFieldLocked("duration") &&
                      "bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                  )}
                />
                {isFieldLocked("duration") && (
                  <p className={cn("text-xs", colors.textMuted)}>
                    Duration locked for free users. Upgrade to Pro to customize.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="fromTime"
                  className={cn("text-sm font-medium", colors.text)}
                >
                  <Clock className="w-4 h-4 inline mr-2" />
                  Start Time *
                </Label>
                <Input
                  id="fromTime"
                  placeholder="e.g., 7pm or 19:00"
                  value={formData.fromTime}
                  onChange={(e) => handleChange("fromTime", e.target.value)}
                  className={cn(colors.border, "focus:ring-blue-500")}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="description"
                  className={cn("text-sm font-medium", colors.text)}
                >
                  Description *
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe the gig, including style of music, audience, special requirements..."
                  rows={3}
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  required
                  className={cn(colors.border, "focus:ring-blue-500")}
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="setlist"
                  className={cn("text-sm font-medium", colors.text)}
                >
                  <Music className="w-4 h-4 inline mr-2" />
                  Setlist/Song Requests (Optional){" "}
                  {isFieldLocked("setlist") && "🔒"}
                </Label>
                <Textarea
                  id="setlist"
                  placeholder="List any specific songs or musical requirements..."
                  rows={2}
                  value={formData.setlist}
                  onChange={(e) => handleChange("setlist", e.target.value)}
                  readOnly={isFieldLocked("setlist")}
                  className={cn(
                    colors.border,
                    "focus:ring-blue-500",
                    isFieldLocked("setlist") &&
                      "bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                  )}
                />
                {isFieldLocked("setlist") && (
                  <p className={cn("text-xs", colors.textMuted)}>
                    Setlist locked for free users. Upgrade to Pro to customize.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={
                creationMode === "guided"
                  ? handleBackToGuided
                  : handleBackToDefault
              }
              className="flex-1"
            >
              {creationMode === "guided" ? "Back to Templates" : "Cancel"}
            </Button>
            <Button
              type="submit"
              className={cn(
                "flex-1 transition-all duration-200",
                colors.primaryBg,
                colors.textInverted,
                "hover:scale-105 hover:shadow-lg",
                "active:scale-95",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
              )}
              disabled={!isFormValid || (!isBudgetValid && formData.budget)}
            >
              {editingTemplate
                ? "Update Template"
                : selectedExample
                  ? lockedForFreeUsers
                    ? "Use Template As-Is"
                    : "Save Customized Template"
                  : creationMode === "scratch"
                    ? "Create Template"
                    : "Save as Template"}
            </Button>
          </div>
        </form>
      </div>
    );
  }
);
const ScratchInterface = memo(
  ({
    handleBackToDefault,
    colors,
    user,
    onStartScratch,
    showUpgradePrompt,
    isInGracePeriod,
  }: any) => {
    const userTier = user?.tier || "free";
    const canUseScratch = canAccessTier(userTier, "premium", isInGracePeriod);

    const handleStartCreating = () => {
      if (!canUseScratch) {
        showUpgradePrompt("premium");
        return;
      }
      onStartScratch();
    };

    return (
      <div
        className={cn("rounded-2xl p-6", colors.card, colors.border, "border")}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={handleBackToDefault}
            className={cn(
              "p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors",
              colors.text
            )}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h3 className={cn("text-xl font-bold", colors.text)}>
              Start from Scratch
            </h3>
            <p className={cn("text-sm", colors.textMuted)}>
              Complete creative freedom from blank canvas
            </p>
          </div>
        </div>

        {/* Empty State - No Templates! */}
        <div
          className={cn(
            "border-2 border-dashed rounded-2xl p-12 text-center",
            colors.border,
            colors.backgroundMuted
          )}
        >
          <div className="w-20 h-20 mx-auto mb-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-blue-600 dark:text-blue-400" />
          </div>

          <h4 className={cn("text-2xl font-bold mb-4", colors.text)}>
            Blank Canvas
          </h4>

          <p className={cn("text-lg mb-6 max-w-md mx-auto", colors.textMuted)}>
            You've chosen to start from scratch. No templates, no examples -
            just your vision.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 max-w-2xl mx-auto">
            {[
              {
                icon: "🎨",
                title: "Complete Freedom",
                desc: "No predefined structures",
              },
              {
                icon: "⚡",
                title: "Pure Customization",
                desc: "Every field is your choice",
              },
              {
                icon: "🚀",
                title: "Advanced Control",
                desc: "For unique requirements",
              },
            ].map((item, index) => (
              <div
                key={index}
                className={cn(
                  "p-4 rounded-xl text-center",
                  colors.backgroundMuted,
                  colors.border,
                  "border"
                )}
              >
                <div className="text-2xl mb-2">{item.icon}</div>
                <div className={cn("font-semibold mb-1", colors.text)}>
                  {item.title}
                </div>
                <div className={cn("text-sm", colors.textMuted)}>
                  {item.desc}
                </div>
              </div>
            ))}
          </div>

          <Button
            onClick={handleStartCreating}
            className={cn(
              "bg-blue-500 hover:bg-blue-600 text-white px-8 py-3",
              colors.shadow
            )}
            size="lg"
            disabled={!canUseScratch}
          >
            <Plus className="w-5 h-5 mr-2" />
            Begin Creating
          </Button>

          {!canUseScratch && (
            <div className="mt-4 text-center">
              <p className={cn("text-sm", colors.textMuted)}>
                Upgrade to Premium to access Start from Scratch feature
              </p>
              <Button
                onClick={() => showUpgradePrompt("premium")}
                className="mt-2"
                variant="outline"
                size="sm"
              >
                <Crown className="w-4 h-4 mr-2" />
                Upgrade to Premium
              </Button>
            </div>
          )}
        </div>

        {/* Tips for Scratch Users */}
        <div className={cn("rounded-2xl p-4 mt-6", colors.backgroundMuted)}>
          <div className="flex items-center gap-2 text-sm">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <span className={cn("font-medium", colors.text)}>Pro Tip:</span>
            <span className={colors.textMuted}>
              Starting from scratch works best for unique event types,
              specialized requirements, or when you have very specific
              preferences.
            </span>
          </div>
        </div>
      </div>
    );
  }
);

ScratchInterface.displayName = "ScratchInterface";

const GuidedInterface = memo(
  ({
    useExampleTemplate,
    handleStartCustom,
    handleStartScratch,
    colors,
    user,
    showUpgradePrompt,
    isInGracePeriod,
    existingTemplates = [], // Default to empty array
    templateLimitInfo = { current: 0, max: 3, reached: false }, // Default values
  }: any) => {
    const userTier = user?.tier || "free";
    const canUseCustom = canAccessTier(userTier, "pro");
    const canUseScratch = canAccessTier(userTier, "premium");

    const effectiveTemplateLimitInfo = templateLimitInfo || {
      current: existingTemplates.length,
      max: 3, // Default free limit
      reached: existingTemplates.length >= 3,
    };

    // Use templateLimitInfo directly instead of recalculating
    const currentCount = templateLimitInfo.current
      ? templateLimitInfo.current
      : effectiveTemplateLimitInfo.current;
    const currentLimit = templateLimitInfo.max
      ? templateLimitInfo.max
      : effectiveTemplateLimitInfo.max;
    const hasReachedLimit = templateLimitInfo.reached
      ? templateLimitInfo.reached
      : effectiveTemplateLimitInfo.reached;

    console.log("🔍 [GUIDED INTERFACE DEBUG]:", {
      userTier,
      currentCount,
      currentLimit,
      hasReachedLimit,
      isInGracePeriod,
      templateLimitInfo,
    });

    const templatesScrollRef = useRef<HTMLDivElement>(null);

    const scrollTemplates = (direction: "left" | "right") => {
      if (templatesScrollRef.current) {
        const scrollAmount = 300;
        templatesScrollRef.current.scrollBy({
          left: direction === "right" ? scrollAmount : -scrollAmount,
          behavior: "smooth",
        });
      }
    };

    // Handle template usage with limit check
    const handleUseTemplate = useCallback(
      (template: any) => {
        console.log("🔄 [USE TEMPLATE]:", {
          template: template.title,
          hasReachedLimit,
          currentCount,
          currentLimit,
        });

        if (hasReachedLimit) {
          console.log(
            "🚫 [USE TEMPLATE]: Limit reached, showing upgrade prompt"
          );
          showUpgradePrompt("pro");
          return;
        }

        const canUseTemplate = canAccessTier(userTier, template.tier || "free");

        if (!canUseTemplate) {
          console.log(
            "🚫 [USE TEMPLATE]: Tier restriction, showing upgrade prompt"
          );
          showUpgradePrompt(template.tier as "pro" | "premium", template.title);
          return;
        }

        console.log("✅ [USE TEMPLATE]: Proceeding with template usage");
        useExampleTemplate(template);
      },
      [
        hasReachedLimit,
        userTier,
        showUpgradePrompt,
        useExampleTemplate,
        currentCount,
        currentLimit,
      ]
    );

    return (
      <div
        className={cn(
          "rounded-2xl lg:rounded-3xl p-6 sm:p-8 lg:p-12",
          colors.card,
          colors.border,
          "border",
          "shadow-lg"
        )}
      >
        {/* Template Limit Alert - SHOW WHEN LIMIT REACHED */}
        {hasReachedLimit && (
          <MaxTemplatesAlert
            currentCount={currentCount}
            maxLimit={currentLimit}
            userTier={userTier}
            colors={colors}
            onUpgrade={() => showUpgradePrompt("pro")}
            isInGracePeriod={isInGracePeriod}
          />
        )}

        {/* Template Usage Indicator - SHOW WHEN NEARING LIMIT */}
        {!hasReachedLimit && currentCount > 0 && (
          <div
            className={cn(
              "rounded-xl p-4 mb-8 border",
              colors.border,
              colors.backgroundMuted,
              currentCount >= currentLimit * 0.8 &&
                "border-amber-200 dark:border-amber-800"
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    currentCount >= currentLimit * 0.8
                      ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                      : "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                  )}
                >
                  {currentCount >= currentLimit * 0.8 ? (
                    <Lock className="w-5 h-5" />
                  ) : (
                    <CheckCircle className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h4 className={cn("font-semibold", colors.text)}>
                    {currentCount >= currentLimit * 0.8
                      ? "Almost at Template Limit"
                      : "Template Usage"}
                  </h4>
                  <p className={cn("text-sm", colors.textMuted)}>
                    {currentCount} of {currentLimit} templates used
                    {currentCount >= currentLimit * 0.8 &&
                      " - Upgrade for more"}
                  </p>
                </div>
              </div>

              {/* Progress Circle */}
              <div className="relative w-12 h-12">
                <svg
                  className="w-12 h-12 transform -rotate-90"
                  viewBox="0 0 36 36"
                >
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
                      currentCount >= currentLimit * 0.8 ? "#f59e0b" : "#10b981"
                    }
                    strokeWidth="3"
                    strokeDasharray="100, 100"
                    strokeDashoffset={100 - (currentCount / currentLimit) * 100}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span
                    className={cn(
                      "text-xs font-bold",
                      currentCount >= currentLimit * 0.8
                        ? "text-amber-600"
                        : "text-green-600"
                    )}
                  >
                    {Math.round((currentCount / currentLimit) * 100)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Upgrade Prompt for users nearing limit */}
            {currentCount >= currentLimit * 0.8 && !hasReachedLimit && (
              <div className="mt-3 pt-3 border-t border-amber-200 dark:border-amber-800">
                <div className="flex items-center justify-between">
                  <span className={cn("text-sm", colors.textMuted)}>
                    {currentLimit - currentCount} template
                    {currentLimit - currentCount !== 1 ? "s" : ""} remaining
                  </span>
                  <Button
                    onClick={() => showUpgradePrompt("pro")}
                    size="sm"
                    className={cn(
                      "bg-amber-500 hover:bg-amber-600 text-white",
                      "text-xs font-semibold"
                    )}
                  >
                    <Crown className="w-3 h-3 mr-1" />
                    Upgrade
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Enhanced Header */}
        <div className="text-center mb-12 lg:mb-16">
          <div
            className={cn(
              "w-20 h-20 lg:w-24 lg:h-24 mx-auto mb-6 lg:mb-8 rounded-2xl flex items-center justify-center",
              colors.primaryBg,
              "shadow-md"
            )}
          >
            <Lightbulb className="w-10 h-10 lg:w-12 lg:h-12 text-white" />
          </div>
          <h2
            className={cn(
              "text-3xl lg:text-4xl font-bold mb-4 lg:mb-6",
              colors.text
            )}
          >
            Choose Your Creation Style
          </h2>
          <p
            className={cn(
              "text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed px-4",
              colors.textMuted
            )}
          >
            Start with professional templates or unlock advanced creation tools
          </p>

          {/* User Tier Badge with Template Count */}
          <div className="mt-6 flex justify-center items-center gap-4">
            <div
              className={cn(
                "px-4 py-2.5 lg:px-6 lg:py-3 rounded-full text-sm lg:text-base font-semibold",
                colors.shadow,
                userTier === "premium"
                  ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white"
                  : userTier === "pro"
                    ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                    : cn(colors.primaryBg, colors.textInverted)
              )}
            >
              {userTier === "premium"
                ? "🎉 Premium Member"
                : userTier === "pro"
                  ? "⚡ Pro Plan"
                  : "✨ Free Plan"}
            </div>

            {/* Template Count Badge */}
            <div
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium",
                colors.backgroundMuted,
                colors.text
              )}
            >
              📋 {currentCount}/{currentLimit} Templates
            </div>
          </div>
        </div>

        {/* Three Column Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 lg:gap-12 mb-12 lg:mb-16">
          {/* Free Tier - Templates Section */}
          <div className="space-y-6 lg:space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 lg:mb-8">
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    "w-3 h-3 lg:w-4 lg:h-4 rounded-full flex-shrink-0",
                    colors.primaryBg
                  )}
                ></div>
                <div>
                  <h3
                    className={cn("text-xl lg:text-2xl font-bold", colors.text)}
                  >
                    Professional Templates
                  </h3>
                  <p className={cn("text-sm mt-1", colors.textMuted)}>
                    Quick start with pre-designed options
                  </p>
                </div>
              </div>

              {/* Scroll Indicators */}
              <div className="flex items-center gap-2 lg:hidden">
                <button
                  onClick={() => scrollTemplates("left")}
                  className={cn(
                    "p-2 rounded-lg transition-all duration-200",
                    colors.border,
                    colors.hoverBg,
                    "hover:scale-110"
                  )}
                >
                  <ChevronLeft className={cn("w-5 h-5", colors.text)} />
                </button>
                <button
                  onClick={() => scrollTemplates("right")}
                  className={cn(
                    "p-2 rounded-lg transition-all duration-200",
                    colors.border,
                    colors.hoverBg,
                    "hover:scale-110"
                  )}
                >
                  <ChevronRight className={cn("w-5 h-5", colors.text)} />
                </button>
              </div>
            </div>

            {/* Template Cards Container with Internal Scroll */}
            <div className="relative">
              {/* Scrollable Container */}
              <div
                ref={templatesScrollRef}
                className={cn(
                  "flex lg:grid lg:grid-cols-2 xl:grid-cols-3 gap-4",
                  "overflow-x-auto lg:overflow-y-auto",
                  "snap-x snap-mandatory lg:snap-none",
                  "scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent",
                  "max-h-[600px]", // Limit height for internal scrolling on desktop
                  "pb-4 lg:pb-0", // Padding for scrollbar on mobile
                  "min-h-0" // Prevent height issues
                )}
                style={{
                  scrollbarWidth: "thin",
                  scrollbarColor: "#d1d5db #f3f4f6",
                }}
              >
                {EXAMPLE_TEMPLATES.map((template) => {
                  const canUseTemplate = canAccessTier(
                    userTier,
                    template.tier || "free"
                  );

                  return (
                    <div
                      key={template.id}
                      className={cn(
                        "border rounded-xl p-5 cursor-pointer transition-all duration-300 group relative",
                        "w-[270px] lg:w-[95%] lg:min-w-0", // Fixed width for mobile, flexible for desktop
                        "snap-start flex-shrink-0 lg:flex-shrink", // Only shrink on mobile
                        colors.border,
                        colors.card,
                        "shadow-md hover:shadow-lg",
                        "hover:scale-[1.02] transform-gpu",
                        canUseTemplate && !hasReachedLimit
                          ? cn(
                              colors.hoverBg,
                              "hover:border-blue-300 dark:hover:border-blue-600"
                            )
                          : "opacity-60 cursor-not-allowed"
                      )}
                      onClick={() => handleUseTemplate(template)}
                    >
                      {/* Tier Badge */}
                      {template.tier !== "free" && (
                        <div
                          className={cn(
                            "absolute -top-2 -right-2 px-3 py-1.5 rounded-full text-xs font-bold",
                            "shadow-md",
                            template.tier === "pro" &&
                              "bg-green-500 text-white",
                            template.tier === "premium" &&
                              "bg-amber-500 text-white"
                          )}
                        >
                          {template.tier?.toUpperCase()}
                        </div>
                      )}

                      {/* Lock Icon */}
                      {(!canUseTemplate || hasReachedLimit) && (
                        <div className="absolute top-3 left-3">
                          <Lock className={cn("w-4 h-4", colors.textMuted)} />
                        </div>
                      )}

                      {/* Limit Reached Overlay */}
                      {hasReachedLimit && (
                        <div className="absolute inset-0 bg-white/80 dark:bg-black/80 rounded-xl flex items-center justify-center z-10">
                          <div className="text-center p-4">
                            <Lock className="w-8 h-8 text-red-500 mx-auto mb-2" />
                            <p
                              className={cn(
                                "text-sm font-semibold",
                                colors.text
                              )}
                            >
                              Template Limit Reached
                            </p>
                            <p className={cn("text-xs", colors.textMuted)}>
                              Upgrade to create more
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Template Content */}
                      <div className="flex items-start gap-4 mb-4">
                        <div
                          className={cn(
                            "w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0",
                            colors.backgroundMuted,
                            colors.border,
                            canUseTemplate &&
                              !hasReachedLimit &&
                              "group-hover:scale-110 transition-transform duration-300"
                          )}
                        >
                          <span className="text-xl">{template.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3
                            className={cn(
                              "font-semibold text-lg mb-2 truncate",
                              canUseTemplate && !hasReachedLimit
                                ? cn(
                                    colors.text,
                                    "group-hover:text-blue-600 transition-colors"
                                  )
                                : colors.textMuted
                            )}
                          >
                            {template.title}
                          </h3>
                          <p
                            className={cn(
                              "text-sm leading-relaxed line-clamp-2",
                              colors.textMuted
                            )}
                          >
                            {template.description}
                          </p>
                        </div>
                      </div>

                      {/* Metadata */}
                      <div className="flex flex-wrap gap-3 text-sm mb-4">
                        <div
                          className={cn(
                            "flex items-center gap-2 px-2.5 py-1.5 rounded-lg",
                            colors.backgroundMuted
                          )}
                        >
                          <Clock
                            className={cn("w-3.5 h-3.5", colors.primary)}
                          />
                          <span
                            className={cn("font-medium text-xs", colors.text)}
                          >
                            {template.duration}
                          </span>
                        </div>
                        <div
                          className={cn(
                            "flex items-center gap-2 px-2.5 py-1.5 rounded-lg",
                            colors.backgroundMuted
                          )}
                        >
                          <DollarSign
                            className={cn("w-3.5 h-3.5", colors.successText)}
                          />
                          <span
                            className={cn("font-medium text-xs", colors.text)}
                          >
                            {template.budget.split(" - ")[0]}+
                          </span>
                        </div>
                      </div>

                      {/* Button */}
                      <Button
                        className={cn(
                          "w-full text-sm font-medium py-3 rounded-lg transition-all duration-300",
                          canUseTemplate && !hasReachedLimit
                            ? cn(
                                colors.primaryBg,
                                colors.primaryBgHover,
                                colors.textInverted,
                                "hover:scale-105"
                              )
                            : hasReachedLimit
                              ? cn(
                                  "bg-gradient-to-r from-red-500 to-orange-600 text-white",
                                  "hover:scale-105"
                                )
                              : cn(
                                  "bg-gradient-to-r from-orange-500 to-amber-600 text-white",
                                  "hover:scale-105"
                                )
                        )}
                        disabled={!canUseTemplate || hasReachedLimit}
                      >
                        {hasReachedLimit ? (
                          <>
                            <Lock className="w-4 h-4 mr-2" />
                            Limit Reached
                          </>
                        ) : canUseTemplate ? (
                          <>
                            Use Template
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                          </>
                        ) : (
                          <>
                            <Lock className="w-4 h-4 mr-2" />
                            Upgrade to {template.tier}
                          </>
                        )}
                      </Button>
                    </div>
                  );
                })}
              </div>

              {/* Mobile Scroll Indicators */}
              <div className="lg:hidden flex items-center justify-center gap-4 mt-4">
                <button
                  onClick={() => scrollTemplates("left")}
                  className={cn(
                    "p-3 rounded-full transition-all duration-200",
                    colors.border,
                    colors.hoverBg,
                    "hover:scale-110"
                  )}
                >
                  <ChevronLeft className={cn("w-5 h-5", colors.text)} />
                </button>

                <div
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium",
                    colors.backgroundMuted,
                    colors.text
                  )}
                >
                  Scroll for more templates
                </div>

                <button
                  onClick={() => scrollTemplates("right")}
                  className={cn(
                    "p-3 rounded-full transition-all duration-200",
                    colors.border,
                    colors.hoverBg,
                    "hover:scale-110"
                  )}
                >
                  <ChevronRight className={cn("w-5 h-5", colors.text)} />
                </button>
              </div>
            </div>

            {/* Free Tier Benefits */}
            <div
              className={cn(
                "rounded-xl p-5 border",
                colors.border,
                colors.backgroundMuted
              )}
            >
              <h4
                className={cn(
                  "font-semibold text-lg mb-4 flex items-center gap-2",
                  colors.text
                )}
              >
                <CheckCircle className={cn("w-5 h-5", colors.successText)} />
                Free Plan Includes:
              </h4>
              <div className="space-y-3">
                {[
                  `Access to ${currentLimit} templates`,
                  "Basic template customization",
                  `Up to ${currentLimit} saved templates`,
                  "Standard email support",
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full flex-shrink-0",
                        colors.successBg
                      )}
                    ></div>
                    <span className={cn("text-sm", colors.text)}>
                      {benefit}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Rest of your Pro and Premium tier sections remain the same */}
          {/* ... */}
        </div>

        {/* Footer */}
        <div
          className={cn(
            "text-center p-8 rounded-2xl border",
            colors.border,
            colors.backgroundMuted,
            "shadow-md"
          )}
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            <Shield className={cn("w-8 h-8", colors.successText)} />
            <h4 className={cn("text-2xl font-bold", colors.text)}>
              {userTier === "premium"
                ? "Premium Experience"
                : "Ready for More?"}
            </h4>
          </div>
          <p className={cn("text-lg mb-6 max-w-2xl mx-auto", colors.textMuted)}>
            {hasReachedLimit
              ? "You've reached your template limit. Upgrade to unlock unlimited templates and advanced features."
              : userTier === "premium"
                ? "You're enjoying our highest tier with dedicated support and all advanced features."
                : "Upgrade to unlock powerful creation tools, more templates, and priority support."}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="outline"
              className={cn(
                "px-8 py-3 rounded-lg font-semibold transition-all duration-300",
                colors.border,
                colors.hoverBg,
                colors.text,
                "hover:scale-105"
              )}
              size="lg"
            >
              <HelpCircle className="w-5 h-5 mr-3" />
              {userTier === "premium" ? "Contact Support" : "View All Features"}
            </Button>

            {(userTier !== "premium" || hasReachedLimit) && (
              <Button
                onClick={() => showUpgradePrompt("pro")}
                className={cn(
                  "px-8 py-3 rounded-lg font-semibold transition-all duration-300",
                  colors.primaryBg,
                  colors.primaryBgHover,
                  colors.textInverted,
                  "hover:scale-105"
                )}
                size="lg"
              >
                <Crown className="w-5 h-5 mr-3" />
                {hasReachedLimit
                  ? "Upgrade for More Templates"
                  : "Upgrade to Pro"}
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }
);
GuidedInterface.displayName = "GuidedInterface";
// Default Interface Component
const DefaultInterface = memo(
  ({
    existingTemplates,
    useExampleTemplate,
    handleStartGuided,
    handleStartCustom,
    handleStartScratch,
    colors,
    user,
    showUpgradePrompt,
  }: any) => {
    const userTier = user?.tier || "free";
    const canUseCustom = canAccessTier(userTier, "pro");
    const canUseScratch = canAccessTier(userTier, "premium");

    return (
      <div
        className={cn("rounded-2xl p-6", colors.card, colors.border, "border")}
      >
        {/* Welcome Section for New Users */}
        {existingTemplates.length === 0 && (
          <div
            className={cn(
              "rounded-2xl p-6 mb-8 text-center",
              colors.backgroundMuted
            )}
          >
            <Lightbulb className="w-12 h-12 mx-auto mb-4 text-amber-500" />
            <h2 className={cn("text-2xl font-bold mb-2", colors.text)}>
              Create Your First Template
            </h2>
            <p className={cn("text-lg mb-4", colors.textMuted)}>
              Design a reusable gig template to quickly book musicians for
              similar events
            </p>
          </div>
        )}

        {/* Creation Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Free Tier - Templates */}
          <div
            onClick={handleStartGuided}
            className={cn(
              "border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 group h-full flex flex-col",
              colors.border,
              "hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20"
            )}
          >
            <div className="flex-1">
              <div className="w-12 h-12 mx-auto mb-4 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div
                className={cn(
                  "px-2 py-1 rounded-full text-xs font-bold bg-blue-500 text-white inline-block mb-3"
                )}
              >
                FREE
              </div>
              <h3 className={cn("font-bold text-lg mb-2", colors.text)}>
                Use Templates
              </h3>
              <p className={cn("text-sm mb-4", colors.textMuted)}>
                Start with professionally designed templates
              </p>
              <div className={cn("text-xs space-y-1", colors.textMuted)}>
                <div>• 50+ pre-built templates</div>
                <div>• Quick setup</div>
                <div>• Best practices included</div>
              </div>
            </div>
            <Button
              className="w-full mt-4 opacity-0 group-hover:opacity-100 transition-opacity"
              size="sm"
            >
              Start with Templates
            </Button>
          </div>

          {/* Pro Tier - Custom Creation */}
          <div
            onClick={() =>
              canUseCustom ? handleStartCustom() : showUpgradePrompt("pro")
            }
            className={cn(
              "border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 group h-full flex flex-col",
              colors.border,
              canUseCustom
                ? "hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-950/20"
                : "opacity-60 cursor-not-allowed"
            )}
          >
            {!canUseCustom && (
              <div className="absolute top-4 right-4">
                <Lock className={cn("w-4 h-4", colors.textMuted)} />
              </div>
            )}
            <div className="flex-1">
              <div
                className={cn(
                  "w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform",
                  canUseCustom
                    ? "bg-green-100 dark:bg-green-900/30"
                    : "bg-gray-100 dark:bg-gray-800"
                )}
              >
                <Settings
                  className={cn(
                    "w-6 h-6",
                    canUseCustom
                      ? "text-green-600 dark:text-green-400"
                      : "text-gray-400"
                  )}
                />
              </div>
              <div
                className={cn(
                  "px-2 py-1 rounded-full text-xs font-bold inline-block mb-3",
                  canUseCustom
                    ? "bg-green-500 text-white"
                    : "bg-gray-400 text-gray-800"
                )}
              >
                PRO
              </div>
              <h3 className={cn("font-bold text-lg mb-2", colors.text)}>
                Custom Creation
              </h3>
              <p className={cn("text-sm mb-4", colors.textMuted)}>
                {canUseCustom
                  ? "Advanced customization with template foundation"
                  : "Upgrade to Pro for advanced features"}
              </p>
              <div className={cn("text-xs space-y-1", colors.textMuted)}>
                <div>• Modify templates extensively</div>
                <div>• Advanced field options</div>
                <div>• Save custom variations</div>
              </div>
            </div>
            <Button
              className={cn(
                "w-full mt-4 opacity-0 group-hover:opacity-100 transition-opacity",
                !canUseCustom && "cursor-not-allowed"
              )}
              variant={canUseCustom ? "default" : "outline"}
              size="sm"
              disabled={!canUseCustom}
            >
              {canUseCustom ? "Custom Creation" : "Upgrade to Pro"}
            </Button>
          </div>

          {/* Premium Tier - Start from Scratch */}
          <div
            onClick={() =>
              canUseScratch
                ? handleStartScratch()
                : showUpgradePrompt("premium")
            }
            className={cn(
              "border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 group h-full flex flex-col",
              colors.border,
              canUseScratch
                ? "hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/20"
                : "opacity-60 cursor-not-allowed"
            )}
          >
            {!canUseScratch && (
              <div className="absolute top-4 right-4">
                <Lock className={cn("w-4 h-4", colors.textMuted)} />
              </div>
            )}
            <div className="flex-1">
              <div
                className={cn(
                  "w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform",
                  canUseScratch
                    ? "bg-amber-100 dark:bg-amber-900/30"
                    : "bg-gray-100 dark:bg-gray-800"
                )}
              >
                <Sparkles
                  className={cn(
                    "w-6 h-6",
                    canUseScratch
                      ? "text-amber-600 dark:text-amber-400"
                      : "text-gray-400"
                  )}
                />
              </div>
              <div
                className={cn(
                  "px-2 py-1 rounded-full text-xs font-bold inline-block mb-3",
                  canUseScratch
                    ? "bg-amber-500 text-white"
                    : "bg-gray-400 text-gray-800"
                )}
              >
                PREMIUM
              </div>
              <h3 className={cn("font-bold text-lg mb-2", colors.text)}>
                Start from Scratch
              </h3>
              <p className={cn("text-sm mb-4", colors.textMuted)}>
                {canUseScratch
                  ? "Complete creative freedom"
                  : "Upgrade to Premium for complete freedom"}
              </p>
              <div className={cn("text-xs space-y-1", colors.textMuted)}>
                <div>• Blank canvas experience</div>
                <div>• Total design control</div>
                <div>• Advanced customization</div>
              </div>
            </div>
            <Button
              className={cn(
                "w-full mt-4 opacity-0 group-hover:opacity-100 transition-opacity",
                !canUseScratch && "cursor-not-allowed"
              )}
              variant={canUseScratch ? "default" : "outline"}
              size="sm"
              disabled={!canUseScratch}
            >
              {canUseScratch ? "Start from Scratch" : "Upgrade to Premium"}
            </Button>
          </div>
        </div>

        {/* Tips for Existing Users */}
        {existingTemplates.length > 0 && (
          <div className={cn("rounded-2xl p-4 mt-6", colors.backgroundMuted)}>
            <div className="flex items-center gap-2 text-sm">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <span className={cn("font-medium", colors.text)}>Pro Tip:</span>
              <span className={colors.textMuted}>
                You have {existingTemplates.length} template
                {existingTemplates.length !== 1 ? "s" : ""}. Create variations
                for different event types or musician categories.
              </span>
            </div>
          </div>
        )}
      </div>
    );
  }
);

DefaultInterface.displayName = "DefaultInterface";

export const CreateTemplateTab: React.FC<CreateTemplateTabProps> = memo(
  ({
    onCreateTemplate,
    onUpdateTemplate,
    user,
    existingTemplates,
    mode,
    onFormClose,
    isLoading,
    editingTemplate,
    templateLimitInfo, // ADD THIS - actually receive the prop
  }) => {
    const router = useRouter(); // Add this line
    const { colors } = useThemeColors();
    const userTier = user?.tier || "free";
    const { isInGracePeriod } = useCheckTrial(); // Add this line
    const [creationMode, setCreationMode] = useState<
      "guided" | "scratch" | "custom"
    >(
      editingTemplate
        ? "custom"
        : mode === "scratch" && canAccessTier(userTier, "premium")
          ? "scratch"
          : mode === "custom" && canAccessTier(userTier, "pro")
            ? "custom"
            : "guided" // default to guided
    );
    const [selectedExample, setSelectedExample] = useState<string | null>(null);

    useEffect(() => {
      console.log("🔍 [CREATE TAB DEBUG]:", {
        templateLimitInfo,
        existingTemplatesCount: existingTemplates.length,
        userTier: user?.tier,
        isInGracePeriod,
      });
    }, [templateLimitInfo, existingTemplates, user?.tier, isInGracePeriod]);
    // Memoize form data state
    const [formData, setFormData] = useState({
      title: "",
      description: "",
      date: "",
      venue: "",
      budget: "",
      gigType: "",
      duration: "",
      fromTime: "",
      setlist: "",
    });

    // Memoize existing templates to prevent unnecessary re-renders
    const memoizedExistingTemplates = useMemo(
      () => existingTemplates,
      [existingTemplates.length]
    );

    // Initialize form with editing template data
    useEffect(() => {
      if (editingTemplate) {
        setFormData({
          title: editingTemplate.title,
          description: editingTemplate.description,
          date: editingTemplate.date,
          venue: editingTemplate.venue,
          budget: editingTemplate.budget,
          gigType: editingTemplate.gigType,
          duration: editingTemplate.duration,
          fromTime: editingTemplate.fromTime || "",
          setlist: editingTemplate.setlist || "",
        });
        setCreationMode("custom");
      }
    }, [editingTemplate]);
    useEffect(() => {
      if (selectedExample) return;

      if (
        mode === "scratch" &&
        canAccessTier(userTier, "premium", isInGracePeriod) && // Add isInGracePeriod
        creationMode !== "scratch"
      ) {
        setCreationMode("scratch");
      } else if (
        mode === "custom" &&
        canAccessTier(userTier, "pro", isInGracePeriod) && // Add isInGracePeriod
        creationMode !== "custom"
      ) {
        setCreationMode("custom");
      } else if (mode === "guided" && creationMode !== "guided") {
        setCreationMode("guided");
      }
    }, [mode, isInGracePeriod]);
    const [promptData, setPromptData] = useState<PromptData>({
      isOpen: false,
      title: "",
      message: "",
      requiredTier: "pro",
      templateName: "",
    });
    // Add this helper function inside the CreateTemplateTab component
    const showUpgradePrompt = useCallback(
      (requiredTier: "pro" | "premium", templateName?: string) => {
        const tierNames = {
          pro: "Pro",
          premium: "Premium",
        };

        const tierBenefits = {
          pro: [
            "Custom template creation",
            "Advanced field customization",
            "Priority template access",
            "Save custom variations",
          ],
          premium: [
            "Start from scratch feature",
            "Complete creative freedom",
            "Advanced customization options",
            "White-glove support",
          ],
        };

        setPromptData({
          isOpen: true,
          title: `Upgrade to ${tierNames[requiredTier]}`,
          message: `This feature requires ${tierNames[requiredTier]} tier. Upgrade to unlock:`,
          requiredTier,
          templateName,
        });
      },
      []
    );
    const useExampleTemplate = useCallback(
      (template: any) => {
        console.log("useExampleTemplate called with:", template);
        const canUseTemplate = canAccessTier(userTier, template.tier || "free");

        if (!canUseTemplate) {
          showUpgradePrompt(template.tier as "pro" | "premium", template.title);
          return;
        }

        console.log("Setting selectedExample to:", template.id);
        setSelectedExample(template.id);
        setFormData({
          title: template.title,
          description: template.description,
          date: "",
          venue: "",
          budget: template.budget,
          gigType: template.gigType,
          duration: template.duration,
          fromTime: template.fromTime || "",
          setlist: "",
        });
        console.log("Setting creationMode to: custom");
        setCreationMode("custom");
      },
      [userTier, showUpgradePrompt, isInGracePeriod]
    );

    // Also add debugging to see state changes
    useEffect(() => {
      console.log(
        "State updated - creationMode:",
        creationMode,
        "selectedExample:",
        selectedExample
      );
    }, [creationMode, selectedExample]);

    const handleStartScratch = useCallback(() => {
      if (!canAccessTier(userTier, "premium", isInGracePeriod)) {
        showUpgradePrompt("premium");
        return;
      }
      setCreationMode("scratch");
    }, [userTier, showUpgradePrompt, isInGracePeriod]);
    const handleStartCustom = useCallback(() => {
      if (!canAccessTier(userTier, "pro", isInGracePeriod)) {
        showUpgradePrompt("pro");
        return;
      }
      setCreationMode("custom");
    }, [userTier, showUpgradePrompt, isInGracePeriod]);
    const handleStartScratchForm = useCallback(() => {
      setCreationMode("custom");
    }, []);

    const handleStartGuided = useCallback(() => {
      setCreationMode("guided");
    }, []);

    const handleSubmit = useCallback(
      (e: React.FormEvent) => {
        e.preventDefault();

        const templateData = {
          ...formData,
          icon:
            GIG_TYPES.find((t) => t.value === formData.gigType)?.label.split(
              " "
            )[0] || "✨",
        };

        if (editingTemplate && onUpdateTemplate) {
          onUpdateTemplate(editingTemplate.id, templateData);
        } else {
          onCreateTemplate(templateData);
        }

        handleFormClose();
      },
      [formData, editingTemplate, onUpdateTemplate, onCreateTemplate]
    );

    const handleFormClose = useCallback(() => {
      setSelectedExample(null);
      setFormData({
        title: "",
        description: "",
        date: "",
        venue: "",
        budget: "",
        gigType: "",
        duration: "",
        fromTime: "",
        setlist: "",
      });
      setCreationMode("guided");
      onFormClose();
    }, [onFormClose]);

    const handleChange = useCallback((field: string, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }, []);

    const handleBackToGuided = useCallback(() => {
      setSelectedExample(null);
      setFormData({
        title: "",
        description: "",
        date: "",
        venue: "",
        budget: "",
        gigType: "",
        duration: "",
        fromTime: "",
        setlist: "",
      });
      setCreationMode("guided");
    }, []);

    const handleBackToDefault = useCallback(() => {
      setSelectedExample(null);
      setFormData({
        title: "",
        description: "",
        date: "",
        venue: "",
        budget: "",
        gigType: "",
        duration: "",
        fromTime: "",
        setlist: "",
      });
      setCreationMode("guided");
      onFormClose();
    }, [onFormClose]);

    const templateFormProps = useMemo(
      () => ({
        formData,
        creationMode,
        editingTemplate,
        selectedExample,
        handleSubmit,
        handleChange,
        handleBackToGuided,
        handleBackToDefault,
        colors,
        user,
        showUpgradePrompt, // Add this line - you're missing it!
        isInGracePeriod, // Add this line
      }),
      [
        formData,
        creationMode,
        editingTemplate,
        selectedExample,
        handleSubmit,
        handleChange,
        handleBackToGuided,
        handleBackToDefault,
        colors,
        user,
        showUpgradePrompt, // Add this here too
        isInGracePeriod, // Add this
      ]
    );

    // In your CreateTemplateTab component, update the guidedInterfaceProps:
    const guidedInterfaceProps = useMemo(
      () => ({
        useExampleTemplate,
        handleStartCustom,
        handleStartScratch,
        colors,
        user,
        showUpgradePrompt,
        isInGracePeriod,
        existingTemplates: memoizedExistingTemplates, // ADD THIS
        templateLimitInfo, // ADD THIS - you need to get this from useTemplates
      }),
      [
        useExampleTemplate,
        handleStartCustom,
        handleStartScratch,
        colors,
        user,
        showUpgradePrompt,
        isInGracePeriod,
        memoizedExistingTemplates, // ADD THIS
        templateLimitInfo, // ADD THIS
      ]
    );

    const scratchInterfaceProps = useMemo(
      () => ({
        handleBackToDefault,
        colors,
        user,
        onStartScratch: handleStartScratchForm,
        showUpgradePrompt,
        isInGracePeriod, // Add this prop
      }),
      [
        handleBackToDefault,
        colors,
        user,
        handleStartScratchForm,
        showUpgradePrompt,
      ]
    );

    // Update the defaultInterfaceProps to include showUpgradePrompt:
    const defaultInterfaceProps = useMemo(
      () => ({
        existingTemplates: memoizedExistingTemplates,
        useExampleTemplate,
        handleStartGuided,
        handleStartCustom,
        handleStartScratch,
        colors,
        user,
        showUpgradePrompt, // Add this line
        isInGracePeriod, // Add this prop
      }),
      [
        memoizedExistingTemplates,
        useExampleTemplate,
        handleStartGuided,
        handleStartCustom,
        handleStartScratch,
        colors,
        user,
        showUpgradePrompt,
      ]
    );

    return (
      <>
        {(() => {
          switch (creationMode) {
            case "custom":
              return <TemplateForm {...templateFormProps} />;
            case "scratch":
              return <ScratchInterface {...scratchInterfaceProps} />;
            case "guided":
              return <GuidedInterface {...guidedInterfaceProps} />;
            default:
              return <DefaultInterface {...defaultInterfaceProps} />;
          }
        })()}

        {/* Confirm Prompt */}
        <ConfirmPrompt
          isOpen={promptData.isOpen}
          onClose={() => setPromptData((prev) => ({ ...prev, isOpen: false }))}
          onConfirm={() => {
            router.push(`/dashboard/billing?tier=${promptData.requiredTier}`);
          }}
          onCancel={() => setPromptData((prev) => ({ ...prev, isOpen: false }))}
          title={promptData.title}
          question={promptData.message}
          userInfo={{
            id: user._id,
            name: user.firstname + " " + user.lastname,
            username: user.username,
            image: user.picture,
            type: user.isMusician ? "musician" : "client",
            instrument: user.instrument,
            city: user.city,
          }}
          confirmText={`Upgrade to ${promptData.requiredTier === "pro" ? "Pro" : "Premium"}`}
          cancelText="Maybe Later"
          variant="info"
        />
      </>
    );
  }
);

CreateTemplateTab.displayName = "CreateTemplateTab";

// Add this interface for the max templates UI
interface MaxTemplatesAlertProps {
  currentCount: number;
  maxLimit: number;
  userTier: string;
  colors: any;
  onUpgrade: () => void;
  isInGracePeriod?: boolean;
}

const MaxTemplatesAlert = memo(
  ({
    currentCount,
    maxLimit,
    userTier,
    colors,
    onUpgrade,
    isInGracePeriod = false,
  }: MaxTemplatesAlertProps) => {
    const remaining = maxLimit - currentCount;
    const usagePercentage = (currentCount / maxLimit) * 100;

    return (
      <div
        className={cn(
          "rounded-2xl p-6 mb-8 border-2",
          colors.border,
          colors.card,
          "relative overflow-hidden"
        )}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500"></div>
        </div>

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div
              className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center",
                "bg-red-100 dark:bg-red-900/30",
                "border border-red-200 dark:border-red-800"
              )}
            >
              <Lock className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className={cn("text-xl font-bold", colors.text)}>
                Template Limit Reached
              </h3>
              <p className={cn("text-sm", colors.textMuted)}>
                {isInGracePeriod
                  ? "Trial period template limit reached"
                  : "Free plan template limit reached"}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className={cn("text-sm font-medium", colors.text)}>
                Templates Used
              </span>
              <span className={cn("text-sm font-bold", colors.text)}>
                {currentCount} / {maxLimit}
              </span>
            </div>
            <div
              className={cn("w-full h-3 rounded-full", colors.backgroundMuted)}
            >
              <div
                className={cn(
                  "h-3 rounded-full transition-all duration-500",
                  usagePercentage >= 100
                    ? "bg-gradient-to-r from-red-500 to-orange-500"
                    : usagePercentage >= 80
                      ? "bg-gradient-to-r from-orange-500 to-amber-500"
                      : "bg-gradient-to-r from-green-500 to-emerald-500"
                )}
                style={{ width: `${Math.min(usagePercentage, 100)}%` }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className={cn("text-xs", colors.textMuted)}>
                {usagePercentage >= 100
                  ? "Limit exceeded"
                  : `${remaining} template${remaining !== 1 ? "s" : ""} remaining`}
              </span>
              <span
                className={cn(
                  "text-xs font-medium",
                  usagePercentage >= 100 ? "text-red-500" : colors.textMuted
                )}
              >
                {usagePercentage >= 100 ? "❌ Full" : "✅ Available"}
              </span>
            </div>
          </div>

          {/* Upgrade Message */}
          <div className={cn("rounded-xl p-4 mb-4", colors.backgroundMuted)}>
            <div className="flex items-start gap-3">
              <Crown className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className={cn("font-semibold mb-2", colors.text)}>
                  {isInGracePeriod
                    ? "Upgrade to Keep Your Templates"
                    : "Upgrade to Create More Templates"}
                </h4>
                <p className={cn("text-sm mb-3", colors.textMuted)}>
                  {isInGracePeriod
                    ? "Your trial period has limited template creation. Upgrade now to unlock unlimited templates and keep all your existing ones."
                    : `Free users can create up to ${maxLimit} templates. Upgrade to Pro for unlimited template creation.`}
                </p>

                {/* Feature Comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className={cn("w-2 h-2 rounded-full", colors.disabledBg)}
                    />
                    <span className={cn(colors.textMuted)}>
                      Free: {maxLimit} templates
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className={cn("w-2 h-2 rounded-full", colors.successBg)}
                    />
                    <span className={cn(colors.text)}>
                      Pro: Unlimited templates
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className={cn("w-2 h-2 rounded-full", colors.disabledBg)}
                    />
                    <span className={cn(colors.textMuted)}>
                      Free: Basic features
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className={cn("w-2 h-2 rounded-full", colors.successBg)}
                    />
                    <span className={cn(colors.text)}>
                      Pro: Advanced customization
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={onUpgrade}
              className={cn(
                "flex-1 py-3 font-semibold",
                "bg-gradient-to-r from-green-500 to-emerald-600",
                "hover:from-green-600 hover:to-emerald-700",
                "text-white shadow-lg hover:shadow-xl",
                "transition-all duration-300 hover:scale-105"
              )}
              size="lg"
            >
              <Crown className="w-5 h-5 mr-2" />
              Upgrade to Pro
              {isInGracePeriod && " (Special Offer)"}
            </Button>

            <Button
              variant="outline"
              className={cn(
                "flex-1 py-3 font-semibold",
                colors.border,
                colors.hoverBg,
                colors.text,
                "transition-all duration-300 hover:scale-105"
              )}
              size="lg"
              onClick={() => window.open("/pricing", "_blank")}
            >
              <Zap className="w-5 h-5 mr-2" />
              View Pricing
            </Button>
          </div>

          {/* Special Offer Badge for Trial Users */}
          {isInGracePeriod && (
            <div
              className={cn(
                "absolute -top-2 -right-2 px-3 py-1 rounded-full",
                "bg-gradient-to-r from-amber-500 to-orange-500",
                "text-white text-xs font-bold shadow-lg"
              )}
            >
              🎁 TRIAL OFFER
            </div>
          )}
        </div>
      </div>
    );
  }
);

MaxTemplatesAlert.displayName = "MaxTemplatesAlert";
