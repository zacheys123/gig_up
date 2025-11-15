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
  User,
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
// Add this after the GIG_TYPES array
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
// Upgrade Interface Component for free users
const UpgradeInterface = memo(({ colors, user, showUpgradePrompt }: any) => {
  const userTier = user?.tier || "free";

  const tierLimits = {
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
  };

  const features = {
    pro: [
      `${tierLimits.pro.templates}+ Professional Templates`,
      `${tierLimits.pro.customTemplates} Custom Templates`,
      "Advanced Field Customization",
      "Priority Booking Access",
      "Standard Email Support",
      "Template Analytics",
    ],
    premium: [
      `${tierLimits.premium.templates}+ Total Templates`,
      `${tierLimits.premium.customTemplates} Custom Templates`,
      `${tierLimits.premium.scratchTemplates} Scratch Templates`,
      "Complete Creative Freedom",
      "White-Glove Support",
      "Dedicated Account Manager",
      "Early Feature Access",
    ],
  };

  const pricing = {
    pro: {
      monthly: "KES 1,500",
      yearly: "KES 15,000",
      saving: "Save 17%",
    },
    premium: {
      monthly: "KES 3,500",
      yearly: "KES 35,000",
      saving: "Save 17%",
    },
  };

  return (
    <div
      className={cn("rounded-2xl p-6", colors.card, colors.border, "border")}
    >
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
          <Crown className="w-10 h-10 text-white" />
        </div>
        <h2 className={cn("text-3xl font-bold mb-4", colors.text)}>
          Unlock Instant Gigs
        </h2>
        <p className={cn("text-xl mb-8 max-w-2xl mx-auto", colors.textMuted)}>
          Upgrade to access professional templates, instant booking, and premium
          features
        </p>

        {/* Current Plan Badge */}
        <div
          className={cn(
            "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-6",
            colors.backgroundMuted,
            colors.text
          )}
        >
          <User className="w-4 h-4" />
          Current Plan: {userTier === "free" ? "Free" : userTier}
          <span
            className={cn(
              "text-xs px-2 py-1 rounded-full",
              colors.primaryBg,
              colors.textInverted
            )}
          >
            {tierLimits[userTier as keyof typeof tierLimits].maxTemplates}{" "}
            templates max
          </span>
        </div>
      </div>

      {/* Template Limits Overview */}
      <div
        className={cn(
          "rounded-2xl p-6 mb-8",
          colors.backgroundMuted,
          "border",
          colors.border
        )}
      >
        <h3 className={cn("text-xl font-bold mb-4 text-center", colors.text)}>
          Template Limits by Plan
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(tierLimits).map(([tier, limits]) => (
            <div
              key={tier}
              className={cn(
                "p-4 rounded-xl text-center border-2",
                colors.border,
                tier === userTier ? "ring-2 ring-blue-500 border-blue-500" : "",
                tier === "pro"
                  ? "border-green-200 dark:border-green-800"
                  : tier === "premium"
                    ? "border-amber-200 dark:border-amber-800"
                    : "border-gray-200 dark:border-gray-700"
              )}
            >
              <div
                className={cn(
                  "text-sm font-bold mb-2 px-3 py-1 rounded-full inline-block",
                  tier === "free"
                    ? cn(colors.primaryBg, colors.textInverted)
                    : tier === "pro"
                      ? "bg-green-500 text-white"
                      : "bg-amber-500 text-white"
                )}
              >
                {tier.toUpperCase()}
              </div>
              <div className={cn("text-2xl font-bold mb-1", colors.text)}>
                {limits.maxTemplates}
              </div>
              <div className={cn("text-sm", colors.textMuted)}>
                Total Templates
              </div>

              {/* Breakdown */}
              <div className="mt-3 space-y-1 text-xs">
                {limits.customTemplates > 0 && (
                  <div className="flex justify-between">
                    <span>Custom:</span>
                    <span className="font-semibold">
                      {limits.customTemplates}
                    </span>
                  </div>
                )}
                {limits.scratchTemplates > 0 && (
                  <div className="flex justify-between">
                    <span>Scratch:</span>
                    <span className="font-semibold">
                      {limits.scratchTemplates}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto mb-8">
        {/* Pro Card */}
        <div
          className={cn(
            "border-2 rounded-2xl p-8 transition-all duration-300 group",
            colors.border,
            colors.card,
            "hover:border-green-500 hover:shadow-xl hover:scale-105",
            "relative overflow-hidden"
          )}
        >
          {/* Popular Badge */}
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <div className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
              MOST POPULAR
            </div>
          </div>

          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Zap className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <div className="px-4 py-1 rounded-full text-sm font-bold bg-green-500 text-white inline-block mb-3">
              PRO
            </div>
            <h3 className={cn("font-bold text-2xl mb-3", colors.text)}>
              Professional
            </h3>

            {/* Template Limit Badge */}
            <div
              className={cn(
                "inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm mb-3",
                "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
              )}
            >
              <BookOpen className="w-3 h-3" />
              {tierLimits.pro.maxTemplates} templates included
            </div>

            {/* Pricing */}
            <div className="mb-4">
              <div className="flex items-baseline justify-center gap-2">
                <span className={cn("text-3xl font-bold", colors.text)}>
                  {pricing.pro.monthly}
                </span>
                <span className={cn("text-sm", colors.textMuted)}>/month</span>
              </div>
              <div className={cn("text-sm", colors.textMuted)}>
                {pricing.pro.yearly} yearly • {pricing.pro.saving}
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-3 mb-6">
            {features.pro.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className={cn("text-sm", colors.text)}>{feature}</span>
              </div>
            ))}
          </div>

          <Button
            onClick={() => showUpgradePrompt("pro")}
            className={cn(
              "w-full py-3 font-semibold",
              "bg-green-500 hover:bg-green-600 text-white",
              "transition-all duration-300 hover:scale-105"
            )}
            size="lg"
          >
            <Zap className="w-5 h-5 mr-2" />
            Upgrade to Pro
          </Button>
        </div>

        {/* Premium Card */}
        <div
          className={cn(
            "border-2 rounded-2xl p-8 transition-all duration-300 group",
            colors.border,
            colors.card,
            "hover:border-amber-500 hover:shadow-xl hover:scale-105",
            "relative"
          )}
        >
          {/* Premium Badge */}
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <div className="bg-amber-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
              BEST VALUE
            </div>
          </div>

          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Sparkles className="w-8 h-8 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="px-4 py-1 rounded-full text-sm font-bold bg-amber-500 text-white inline-block mb-3">
              PREMIUM
            </div>
            <h3 className={cn("font-bold text-2xl mb-3", colors.text)}>
              Complete Freedom
            </h3>

            {/* Template Limit Badge */}
            <div
              className={cn(
                "inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm mb-3",
                "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"
              )}
            >
              <BookOpen className="w-3 h-3" />
              {tierLimits.premium.maxTemplates} templates included
            </div>

            {/* Pricing */}
            <div className="mb-4">
              <div className="flex items-baseline justify-center gap-2">
                <span className={cn("text-3xl font-bold", colors.text)}>
                  {pricing.premium.monthly}
                </span>
                <span className={cn("text-sm", colors.textMuted)}>/month</span>
              </div>
              <div className={cn("text-sm", colors.textMuted)}>
                {pricing.premium.yearly} yearly • {pricing.premium.saving}
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-3 mb-6">
            {features.premium.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                <span className={cn("text-sm", colors.text)}>{feature}</span>
              </div>
            ))}
          </div>

          <Button
            onClick={() => showUpgradePrompt("premium")}
            className={cn(
              "w-full py-3 font-semibold",
              "bg-amber-500 hover:bg-amber-600 text-white",
              "transition-all duration-300 hover:scale-105"
            )}
            size="lg"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Upgrade to Premium
          </Button>
        </div>
      </div>

      {/* Detailed Feature Comparison Table */}
      <div
        className={cn(
          "rounded-2xl p-6 mb-8",
          colors.backgroundMuted,
          "border",
          colors.border
        )}
      >
        <h3 className={cn("text-xl font-bold mb-6 text-center", colors.text)}>
          Detailed Plan Comparison
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm">
          {/* Feature Column */}
          <div className="md:col-span-2">
            <div className={cn("font-semibold p-3", colors.text)}>
              Features & Limits
            </div>
            {[
              "Total Template Limit",
              "Professional Templates",
              "Custom Templates",
              "Scratch Templates",
              "Field Customization",
              "Start from Scratch",
              "Support Level",
              "Advanced Analytics",
              "Dedicated Manager",
            ].map((feature, index) => (
              <div
                key={index}
                className={cn("p-3 border-b", colors.border, colors.text)}
              >
                {feature}
              </div>
            ))}
          </div>

          {/* Free Column */}
          <div className="text-center">
            <div className={cn("font-semibold p-3", colors.text)}>Free</div>
            {[
              tierLimits.free.maxTemplates,
              "3 basic",
              "❌ No",
              "❌ No",
              "❌ Limited",
              "❌ No",
              "Basic Email",
              "❌ No",
              "❌ No",
            ].map((value, index) => (
              <div
                key={index}
                className={cn("p-3 border-b", colors.border, colors.textMuted)}
              >
                {value}
              </div>
            ))}
          </div>

          {/* Pro Column */}
          <div className="text-center">
            <div className={cn("font-semibold p-3 text-green-600")}>Pro</div>
            {[
              tierLimits.pro.maxTemplates,
              `${tierLimits.pro.templates}+`,
              `${tierLimits.pro.customTemplates}`,
              `${tierLimits.pro.scratchTemplates}`,
              "✅ Full",
              "❌ No",
              "Priority Email",
              "✅ Basic",
              "❌ No",
            ].map((value, index) => (
              <div
                key={index}
                className={cn("p-3 border-b", colors.border, colors.text)}
              >
                {value}
              </div>
            ))}
          </div>

          {/* Premium Column */}
          <div className="text-center">
            <div className={cn("font-semibold p-3 text-amber-600")}>
              Premium
            </div>
            {[
              tierLimits.premium.maxTemplates,
              `${tierLimits.premium.templates}+`,
              `${tierLimits.premium.customTemplates}`,
              `${tierLimits.premium.scratchTemplates}`,
              "✅ Advanced",
              "✅ Yes",
              "White-Glove",
              "✅ Advanced",
              "✅ Yes",
            ].map((value, index) => (
              <div
                key={index}
                className={cn("p-3 border-b", colors.border, colors.text)}
              >
                {value}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Template Usage Tips */}
      <div
        className={cn(
          "rounded-2xl p-6 mb-8",
          colors.primaryBg,
          colors.textInverted
        )}
      >
        <h3 className={cn("text-xl font-bold mb-4 text-center")}>
          Smart Template Management
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          {[
            {
              icon: "📊",
              title: "Track Usage",
              tip: "Monitor your template count and archive unused templates",
            },
            {
              icon: "🔄",
              title: "Reuse & Modify",
              tip: "Duplicate and modify existing templates to save limits",
            },
            {
              icon: "📈",
              title: "Upgrade Smart",
              tip: "Start with Pro, upgrade to Premium when you need more scratch templates",
            },
          ].map((item, index) => (
            <div key={index} className="text-center p-4">
              <div className="text-2xl mb-2">{item.icon}</div>
              <div className="font-semibold mb-2">{item.title}</div>
              <div className="opacity-90">{item.tip}</div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mt-8">
        <h3 className={cn("text-xl font-bold mb-6 text-center", colors.text)}>
          Frequently Asked Questions
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              question: "What happens when I reach my template limit?",
              answer:
                "You'll need to archive old templates before creating new ones, or upgrade to a higher plan for more capacity.",
            },
            {
              question: "Can I transfer templates between plans?",
              answer:
                "Yes, all your templates are preserved when you upgrade or downgrade your plan.",
            },
            {
              question: "Do template limits include archived templates?",
              answer:
                "No, only active templates count toward your limit. Archived templates don't use your allocation.",
            },
            {
              question: "Can I purchase additional templates?",
              answer:
                "Currently, template limits are tied to subscription plans. Upgrade to access more templates.",
            },
          ].map((faq, index) => (
            <div
              key={index}
              className={cn("p-4 rounded-xl", colors.backgroundMuted)}
            >
              <h4 className={cn("font-semibold mb-2", colors.text)}>
                {faq.question}
              </h4>
              <p className={cn("text-sm", colors.textMuted)}>{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div
        className={cn(
          "text-center mt-8 p-6 rounded-2xl",
          "bg-gradient-to-r from-blue-500 to-purple-600",
          "text-white"
        )}
      >
        <h3 className="text-2xl font-bold mb-2">Ready to Scale Your Gigs?</h3>
        <p className="mb-4 opacity-90">
          Join thousands of musicians using templates to streamline their
          booking process
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => showUpgradePrompt("pro")}
            className="bg-white text-green-600 hover:bg-gray-100 font-semibold"
            size="lg"
          >
            <Zap className="w-5 h-5 mr-2" />
            Start with Pro ({tierLimits.pro.maxTemplates} templates)
          </Button>
          <Button
            onClick={() => showUpgradePrompt("premium")}
            variant="outline"
            className="border-white text-white hover:bg-white hover:text-amber-600 font-semibold"
            size="lg"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Go Premium ({tierLimits.premium.maxTemplates} templates)
          </Button>
        </div>
      </div>
    </div>
  );
});

UpgradeInterface.displayName = "UpgradeInterface";
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
    existingTemplates = [],
    templateLimitInfo = { current: 0, max: 3, reached: false },
  }: any) => {
    const userTier = user?.tier || "free";
    const canUseCustom = canAccessTier(userTier, "pro");
    const canUseScratch = canAccessTier(userTier, "premium");

    const effectiveTemplateLimitInfo = templateLimitInfo || {
      current: existingTemplates.length,
      max: TIER_LIMITS[userTier as keyof typeof TIER_LIMITS]?.maxTemplates || 3,
      reached:
        existingTemplates.length >=
        (TIER_LIMITS[userTier as keyof typeof TIER_LIMITS]?.maxTemplates || 3),
    };

    const currentCount = templateLimitInfo.current
      ? templateLimitInfo.current
      : effectiveTemplateLimitInfo.current;
    const currentLimit = templateLimitInfo.max
      ? templateLimitInfo.max
      : effectiveTemplateLimitInfo.max;
    const hasReachedLimit = templateLimitInfo.reached
      ? templateLimitInfo.reached
      : effectiveTemplateLimitInfo.reached;

    // Handle template usage with limit check
    const handleUseTemplate = useCallback(
      (template: any) => {
        if (hasReachedLimit) {
          showUpgradePrompt("pro");
          return;
        }

        const canUseTemplate = canAccessTier(userTier, template.tier || "free");
        if (!canUseTemplate) {
          showUpgradePrompt(template.tier as "pro" | "premium", template.title);
          return;
        }

        useExampleTemplate(template);
      },
      [hasReachedLimit, userTier, showUpgradePrompt, useExampleTemplate]
    );

    if (!canAccessTier(userTier, "pro", isInGracePeriod)) {
      return (
        <div
          className={cn(
            "rounded-2xl p-6",
            colors.card,
            colors.border,
            "border"
          )}
        >
          <div className="text-center p-12">
            <Lock className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className={cn("text-2xl font-bold mb-4", colors.text)}>
              Templates Locked
            </h3>
            <p
              className={cn("text-lg mb-6 max-w-md mx-auto", colors.textMuted)}
            >
              Professional templates are available for Pro users and above.
              Upgrade to access 50+ pre-designed templates and streamline your
              booking process.
            </p>
            <Button
              onClick={() => showUpgradePrompt("pro")}
              className={cn(
                "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700",
                "text-white px-8 py-3 font-semibold"
              )}
              size="lg"
            >
              <Crown className="w-5 h-5 mr-2" />
              Upgrade to Unlock Templates
            </Button>
          </div>
        </div>
      );
    }

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
        {/* Template Limit Alert */}
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

        {/* Template Usage Indicator */}
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

              <div className="relative w-12 h-12">
                <svg
                  className="w-12 h-12 transform -rotate-90"
                  viewBox="0 0 36 36"
                >
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke={colors.border}
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
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

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 lg:gap-12 mb-12 lg:mb-16">
          {/* Templates Section */}
          <div className="xl:col-span-2 space-y-6 lg:space-y-8">
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
            </div>

            {/* Template Grid - FIXED RESPONSIVE LAYOUT */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {EXAMPLE_TEMPLATES.map((template) => {
                const canUseTemplate = canAccessTier(
                  userTier,
                  template.tier || "free"
                );

                return (
                  <div
                    key={template.id}
                    className={cn(
                      "border-2 rounded-2xl p-6 cursor-pointer transition-all duration-300 group relative",
                      "bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800",
                      "shadow-lg hover:shadow-2xl",
                      "hover:scale-[1.02] transform-gpu",
                      "border-gray-200 dark:border-gray-700",
                      canUseTemplate && !hasReachedLimit
                        ? cn(
                            "hover:border-blue-400 dark:hover:border-blue-500",
                            "hover:bg-gradient-to-br hover:from-blue-50 hover:to-white dark:hover:from-blue-950/20 dark:hover:to-gray-900"
                          )
                        : "opacity-70 cursor-not-allowed grayscale"
                    )}
                    onClick={() => handleUseTemplate(template)}
                  >
                    {/* Premium Tier Ribbon */}
                    {template.tier !== "free" && (
                      <div
                        className={cn(
                          "absolute -top-3 -right-3 px-4 py-2 rounded-full text-xs font-bold",
                          "shadow-lg transform rotate-3",
                          "backdrop-blur-sm bg-white/90 dark:bg-black/90",
                          "border",
                          template.tier === "pro"
                            ? "text-green-600 border-green-200 dark:border-green-800"
                            : "text-amber-600 border-amber-200 dark:border-amber-800"
                        )}
                      >
                        <div className="flex items-center gap-1">
                          <Crown className="w-3 h-3" />
                          <span>{template.tier?.toUpperCase()}</span>
                        </div>
                      </div>
                    )}

                    {/* Lock Overlay */}
                    {(!canUseTemplate || hasReachedLimit) && (
                      <div className="absolute inset-0 bg-white/90 dark:bg-black/90 rounded-2xl flex items-center justify-center z-10 backdrop-blur-sm">
                        <div className="text-center p-6">
                          <div
                            className={cn(
                              "w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center",
                              hasReachedLimit
                                ? "bg-red-100 dark:bg-red-900/30"
                                : "bg-amber-100 dark:bg-amber-900/30"
                            )}
                          >
                            <Lock
                              className={cn(
                                "w-8 h-8",
                                hasReachedLimit
                                  ? "text-red-500"
                                  : "text-amber-500"
                              )}
                            />
                          </div>
                          <h4
                            className={cn(
                              "font-bold text-lg mb-2",
                              colors.text
                            )}
                          >
                            {hasReachedLimit
                              ? "Template Limit Reached"
                              : "Upgrade Required"}
                          </h4>
                          <p className={cn("text-sm mb-4", colors.textMuted)}>
                            {hasReachedLimit
                              ? "You've reached your template limit"
                              : `Upgrade to ${template.tier} to use this template`}
                          </p>
                          <Button
                            size="sm"
                            className={cn(
                              hasReachedLimit
                                ? "bg-red-500 hover:bg-red-600 text-white"
                                : "bg-amber-500 hover:bg-amber-600 text-white"
                            )}
                          >
                            <Crown className="w-4 h-4 mr-2" />
                            {hasReachedLimit
                              ? "Upgrade Now"
                              : `Upgrade to ${template.tier}`}
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Template Content */}
                    <div className="flex items-start gap-4 mb-5">
                      <div
                        className={cn(
                          "w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0",
                          "bg-gradient-to-br from-blue-500 to-purple-600",
                          "shadow-lg",
                          canUseTemplate &&
                            !hasReachedLimit &&
                            "group-hover:scale-110 group-hover:rotate-6 transition-all duration-300"
                        )}
                      >
                        <span className="text-2xl text-white">
                          {template.icon}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3
                          className={cn(
                            "font-bold text-xl mb-2",
                            "bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent",
                            canUseTemplate &&
                              !hasReachedLimit &&
                              "group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300"
                          )}
                        >
                          {template.title}
                        </h3>
                        <p
                          className={cn(
                            "text-sm leading-relaxed line-clamp-2",
                            "text-gray-600 dark:text-gray-400"
                          )}
                        >
                          {template.description}
                        </p>
                      </div>
                    </div>

                    {/* Metadata Chips */}
                    <div className="flex flex-wrap gap-2 mb-5">
                      <div
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 rounded-lg",
                          "bg-blue-50 dark:bg-blue-950/30",
                          "border border-blue-200 dark:border-blue-800"
                        )}
                      >
                        <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span
                          className={cn(
                            "font-semibold text-sm",
                            "text-blue-700 dark:text-blue-300"
                          )}
                        >
                          {template.duration}
                        </span>
                      </div>
                      <div
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 rounded-lg",
                          "bg-green-50 dark:bg-green-950/30",
                          "border border-green-200 dark:border-green-800"
                        )}
                      >
                        <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
                        <span
                          className={cn(
                            "font-semibold text-sm",
                            "text-green-700 dark:text-green-300"
                          )}
                        >
                          {template.budget.split(" - ")[0]}+
                        </span>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <Button
                      className={cn(
                        "w-full text-base font-semibold py-4 rounded-xl transition-all duration-300",
                        "relative overflow-hidden group/btn",
                        canUseTemplate && !hasReachedLimit
                          ? cn(
                              "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700",
                              "text-white shadow-lg hover:shadow-xl",
                              "hover:scale-105"
                            )
                          : hasReachedLimit
                            ? cn(
                                "bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600",
                                "text-white shadow-lg hover:shadow-xl"
                              )
                            : cn(
                                "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600",
                                "text-white shadow-lg hover:shadow-xl"
                              )
                      )}
                      disabled={!canUseTemplate || hasReachedLimit}
                    >
                      <div
                        className={cn(
                          "absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent",
                          "translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000",
                          canUseTemplate && !hasReachedLimit
                            ? "block"
                            : "hidden"
                        )}
                      />
                      <span className="relative z-10 flex items-center justify-center">
                        {hasReachedLimit ? (
                          <>
                            <Lock className="w-5 h-5 mr-2" />
                            Limit Reached
                          </>
                        ) : canUseTemplate ? (
                          <>
                            Use Template
                            <ArrowRight className="w-5 h-5 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                          </>
                        ) : (
                          <>
                            <Crown className="w-5 h-5 mr-2" />
                            Upgrade to {template.tier}
                          </>
                        )}
                      </span>
                    </Button>
                  </div>
                );
              })}
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

          {/* Sidebar - Pro & Premium Features */}
          <div className="space-y-8">
            {/* Pro Features */}
            <div
              className={cn(
                "rounded-2xl p-6 border-2",
                "border-green-200 dark:border-green-800",
                colors.card
              )}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center">
                  <Zap className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <div className="px-3 py-1 rounded-full text-sm font-bold bg-green-500 text-white inline-block mb-3">
                  PRO
                </div>
                <h3 className={cn("text-xl font-bold mb-2", colors.text)}>
                  Upgrade to Pro
                </h3>
                <p className={cn("text-sm", colors.textMuted)}>
                  Unlock advanced template features
                </p>
              </div>
              <div className="space-y-3 mb-6">
                {[
                  "50+ professional templates",
                  "Custom template creation",
                  "Advanced field customization",
                  "Unlimited saved templates",
                  "Priority template access",
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className={cn("text-sm", colors.text)}>
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
              <Button
                onClick={() => showUpgradePrompt("pro")}
                className="w-full bg-green-500 hover:bg-green-600 text-white"
                size="lg"
              >
                <Crown className="w-5 h-5 mr-2" />
                Upgrade to Pro
              </Button>
            </div>

            {/* Premium Features */}
            <div
              className={cn(
                "rounded-2xl p-6 border-2",
                "border-amber-200 dark:border-amber-800",
                colors.card
              )}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="px-3 py-1 rounded-full text-sm font-bold bg-amber-500 text-white inline-block mb-3">
                  PREMIUM
                </div>
                <h3 className={cn("text-xl font-bold mb-2", colors.text)}>
                  Go Premium
                </h3>
                <p className={cn("text-sm", colors.textMuted)}>
                  Complete creative freedom
                </p>
              </div>
              <div className="space-y-3 mb-6">
                {[
                  "All Pro features included",
                  "Start from scratch creation",
                  "White-glove support",
                  "Early feature access",
                  "Dedicated account manager",
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                    <span className={cn("text-sm", colors.text)}>
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
              <Button
                onClick={() => showUpgradePrompt("premium")}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                size="lg"
              >
                <Crown className="w-5 h-5 mr-2" />
                Go Premium
              </Button>
            </div>
          </div>
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
    isInGracePeriod,
  }: any) => {
    const userTier = user?.tier || "free";
    const canUseCustom = canAccessTier(userTier, "pro");
    const canUseScratch = canAccessTier(userTier, "premium");
    const canUseTemplates = canAccessTier(userTier, "pro", isInGracePeriod);

    // If free user, show upgrade-focused interface
    if (!canUseTemplates) {
      return (
        <div
          className={cn(
            "rounded-2xl p-6",
            colors.card,
            colors.border,
            "border"
          )}
        >
          {/* Upgrade-focused interface for free users */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <Zap className="w-10 h-10 text-white" />
            </div>
            <h2 className={cn("text-3xl font-bold mb-4", colors.text)}>
              Unlock Instant Gigs
            </h2>
            <p
              className={cn("text-xl mb-8 max-w-2xl mx-auto", colors.textMuted)}
            >
              Upgrade to access professional templates, instant booking, and
              premium features
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Pro Upgrade Card */}
            <div
              className={cn(
                "border-2 rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 group",
                colors.border,
                colors.card,
                "hover:border-green-500 hover:scale-105"
              )}
              onClick={() => showUpgradePrompt("pro")}
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <BookOpen className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <div className="px-3 py-1 rounded-full text-sm font-bold bg-green-500 text-white inline-block mb-3">
                PRO
              </div>
              <h3 className={cn("font-bold text-xl mb-3", colors.text)}>
                Professional Templates
              </h3>
              <p className={cn("text-sm mb-4", colors.textMuted)}>
                Access 50+ pre-designed templates
              </p>
              <div className={cn("text-sm space-y-2 mb-4", colors.textMuted)}>
                <div>• 50+ professional templates</div>
                <div>• Instant musician matching</div>
                <div>• Customizable fields</div>
                <div>• Priority booking access</div>
              </div>
              <Button className="w-full bg-green-500 hover:bg-green-600 text-white">
                Upgrade to Pro
              </Button>
            </div>

            {/* Premium Upgrade Card */}
            <div
              className={cn(
                "border-2 rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 group",
                colors.border,
                colors.card,
                "hover:border-amber-500 hover:scale-105"
              )}
              onClick={() => showUpgradePrompt("premium")}
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Sparkles className="w-8 h-8 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="px-3 py-1 rounded-full text-sm font-bold bg-amber-500 text-white inline-block mb-3">
                PREMIUM
              </div>
              <h3 className={cn("font-bold text-xl mb-3", colors.text)}>
                Complete Freedom
              </h3>
              <p className={cn("text-sm mb-4", colors.textMuted)}>
                Start from scratch with advanced tools
              </p>
              <div className={cn("text-sm space-y-2 mb-4", colors.textMuted)}>
                <div>• Start from scratch</div>
                <div>• Advanced customization</div>
                <div>• White-glove support</div>
                <div>• Early feature access</div>
              </div>
              <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white">
                Upgrade to Premium
              </Button>
            </div>
          </div>
        </div>
      );
    }

    // Existing interface for Pro+ users...
    // ... your existing Pro+ interface code
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
    // Redirect free users away from template modes
    const canAccessTemplates = canAccessTier(userTier, "pro", isInGracePeriod);

    const [creationMode, setCreationMode] = useState<
      "guided" | "scratch" | "custom" | "upgrade"
    >(
      editingTemplate
        ? "custom"
        : mode === "scratch" && canAccessTier(userTier, "premium")
          ? "scratch"
          : mode === "custom" && canAccessTier(userTier, "pro")
            ? "custom"
            : canAccessTemplates
              ? "guided"
              : "upgrade" // New mode for free users
    );
    const [selectedExample, setSelectedExample] = useState<string | null>(null);

    useEffect(() => {
      if (
        !canAccessTemplates &&
        (mode === "guided" || creationMode === "guided")
      ) {
        setCreationMode("upgrade");
      }
    }, [canAccessTemplates, mode, creationMode]);
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
            case "upgrade":
              return (
                <UpgradeInterface
                  colors={colors}
                  user={user}
                  showUpgradePrompt={showUpgradePrompt}
                />
              );
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
