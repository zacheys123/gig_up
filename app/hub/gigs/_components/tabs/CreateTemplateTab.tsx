// app/hub/gigs/_components/tabs/CreateTemplateTab.tsx - UPDATED WITH TIER SYSTEM
"use client";

import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useThemeColors } from "@/hooks/useTheme";
import { GigTemplate } from "@/convex/instantGigsTypes";

// Add these imports at the top of CreateTemplateTab.tsx
import { useRouter } from "next/navigation";
import ConfirmPrompt from "@/components/ConfirmPrompt"; // Adjust path as needed

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

// Helper function to check user tier access
const canAccessTier = (userTier: string, requiredTier: string) => {
  const tierLevels = { free: 0, pro: 1, premium: 2 };
  return (
    tierLevels[userTier as keyof typeof tierLevels] >=
    tierLevels[requiredTier as keyof typeof tierLevels]
  );
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
  }: any) => {
    const userTier = user?.tier || "free";
    const isUsingTemplate = !!selectedExample && !editingTemplate;

    // Simple tier-based locking
    const isFreeUser = userTier === "free";
    const lockedForFreeUsers = isUsingTemplate && isFreeUser;

    // Fields that should be locked for free template users
    const LOCKED_FIELDS = ["title", "gigType", "budget", "duration", "setlist"];

    const isFieldLocked = (fieldName: string) =>
      lockedForFreeUsers && LOCKED_FIELDS.includes(fieldName);

    return (
      <div
        className={cn("rounded-2xl p-6", colors.card, colors.border, "border")}
      >
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

        {lockedForFreeUsers && (
          <div
            className={cn(
              "mb-6 p-4 rounded-xl border-2 border-dashed text-center",
              colors.border,
              colors.backgroundMuted
            )}
          >
            <Crown className={cn("w-8 h-8 mx-auto mb-2", colors.warningText)} />
            <h4 className={cn("font-bold mb-2", colors.text)}>
              Upgrade to Pro to Customize
            </h4>
            <p className={cn("text-sm mb-3", colors.textMuted)}>
              Free users can use templates as-is. Upgrade to Pro to unlock field
              customization.
            </p>

            <Button
              onClick={() => showUpgradePrompt("pro")}
              className="bg-green-500 hover:bg-green-600"
            >
              <Crown className="w-4 h-4 mr-2" />
              Upgrade to Pro
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
                  Gig Title {isFieldLocked("title") && "🔒"}
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
                  Gig Type {isFieldLocked("gigType") && "🔒"}
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

              {/* Keep Date and Venue editable for all */}
              <div className="space-y-2">
                <Label
                  htmlFor="date"
                  className={cn("text-sm font-medium", colors.text)}
                >
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Date (Optional)
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleChange("date", e.target.value)}
                  className={cn(colors.border, "focus:ring-blue-500")}
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
                  Budget (KES) {isFieldLocked("budget") && "🔒"}
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
                      "bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                  )}
                />
                {isFieldLocked("budget") ? (
                  <p className={cn("text-xs", colors.textMuted)}>
                    Budget locked for free users. Upgrade to Pro to customize.
                  </p>
                ) : (
                  <p className={cn("text-xs", colors.textMuted)}>
                    Typical rates: Wedding KES 25-40K • Corporate KES 30-60K •
                    Private Party KES 20-35K
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="duration"
                  className={cn("text-sm font-medium", colors.text)}
                >
                  <Clock className="w-4 h-4 inline mr-2" />
                  Duration {isFieldLocked("duration") && "🔒"}
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

              {/* Keep Start Time editable for all */}
              <div className="space-y-2">
                <Label
                  htmlFor="fromTime"
                  className={cn("text-sm font-medium", colors.text)}
                >
                  <Clock className="w-4 h-4 inline mr-2" />
                  Start Time
                </Label>
                <Input
                  id="fromTime"
                  placeholder="e.g., 7pm"
                  value={formData.fromTime}
                  onChange={(e) => handleChange("fromTime", e.target.value)}
                  className={cn(colors.border, "focus:ring-blue-500")}
                />
              </div>

              {/* Keep Description editable for all */}
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

              {/* Setlist field with locking */}
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
              className="flex-1 bg-blue-500 hover:bg-blue-600"
              disabled={
                !formData.title ||
                !formData.gigType ||
                !formData.budget ||
                !formData.duration ||
                !formData.description
              }
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

TemplateForm.displayName = "TemplateForm";
// Scratch Interface Component - Premium Tier
const ScratchInterface = memo(
  ({
    handleBackToDefault,
    colors,
    user,
    onStartScratch,
    showUpgradePrompt,
  }: any) => {
    const userTier = user?.tier || "free";
    const canUseScratch = canAccessTier(userTier, "premium");

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

// Updated GuidedInterface with proper tier system
const GuidedInterface = memo(
  ({
    useExampleTemplate,
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
        className={cn(
          "rounded-2xl lg:rounded-3xl p-4 sm:p-6 lg:p-8",
          colors.card,
          colors.border,
          "border",
          colors.shadow
        )}
      >
        {/* Enhanced Header */}
        <div className="text-center mb-8 lg:mb-12">
          <div
            className={cn(
              "w-16 h-16 lg:w-20 lg:h-20 mx-auto mb-4 lg:mb-6 rounded-2xl lg:rounded-3xl flex items-center justify-center",
              colors.primaryBg,
              colors.shadow
            )}
          >
            <Lightbulb className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
          </div>
          <h2
            className={cn(
              "text-2xl lg:text-3xl font-bold mb-3 lg:mb-4",
              colors.text
            )}
          >
            Choose Your Creation Style
          </h2>
          <p
            className={cn(
              "text-base lg:text-lg max-w-2xl mx-auto leading-relaxed px-2",
              colors.textMuted
            )}
          >
            Start with templates or unlock advanced creation options
          </p>

          {/* User Tier Badge */}
          <div className="mt-4 flex justify-center">
            <div
              className={cn(
                "px-3 py-1.5 lg:px-4 lg:py-2 rounded-full text-xs lg:text-sm font-medium",
                colors.shadow,
                userTier === "premium"
                  ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white"
                  : userTier === "pro"
                    ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                    : cn(colors.primaryBg, colors.textInverted)
              )}
            >
              {userTier === "premium"
                ? "🎉 Premium"
                : userTier === "pro"
                  ? "⚡ Pro"
                  : "✨ Free Plan"}
            </div>
          </div>
        </div>

        {/* Three Column Layout for Tiers */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8 mb-8 lg:mb-12">
          {/* Free Tier - Templates */}
          <div className="space-y-4 lg:space-y-6">
            <div className="flex items-center gap-3 mb-4 lg:mb-6">
              <div
                className={cn(
                  "w-2 h-2 lg:w-3 lg:h-3 rounded-full flex-shrink-0",
                  colors.primaryBg
                )}
              ></div>
              <h3
                className={cn("text-lg lg:text-xl font-semibold", colors.text)}
              >
                Professional Templates
              </h3>
              <span
                className={cn(
                  "px-2 py-1 rounded-full text-xs font-bold bg-blue-500 text-white"
                )}
              >
                FREE
              </span>
            </div>

            {/* Template cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-3 lg:gap-4">
              {EXAMPLE_TEMPLATES.map((template) => {
                const canUseTemplate = canAccessTier(
                  userTier,
                  template.tier || "free"
                );

                return (
                  <div
                    key={template.id}
                    onClick={() =>
                      canUseTemplate
                        ? useExampleTemplate(template)
                        : showUpgradePrompt(
                            template.tier as "pro" | "premium",
                            template.title
                          )
                    }
                    className={cn(
                      "border rounded-xl p-4 cursor-pointer transition-all duration-200 group relative",
                      colors.border,
                      colors.card,
                      colors.shadow,
                      canUseTemplate
                        ? "hover:scale-[1.02] hover:shadow-md " +
                            colors.backgroundMuted
                        : "opacity-60 cursor-not-allowed"
                    )}
                  >
                    {/* Tier Badge for Premium Templates */}
                    {template.tier !== "free" && (
                      <div
                        className={cn(
                          "absolute -top-2 -right-2 px-2 py-1 rounded-full text-xs font-bold",
                          template.tier === "pro" && "bg-green-500 text-white",
                          template.tier === "premium" &&
                            "bg-amber-500 text-white"
                        )}
                      >
                        {template.tier?.toUpperCase()}
                      </div>
                    )}

                    {/* Lock Icon for unavailable templates */}
                    {!canUseTemplate && (
                      <div className="absolute top-2 left-2">
                        <Lock className={cn("w-4 h-4", colors.textMuted)} />
                      </div>
                    )}

                    <div className="flex items-start gap-3 mb-3">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center",
                          colors.backgroundMuted,
                          colors.border,
                          canUseTemplate &&
                            "group-hover:scale-110 transition-transform duration-200"
                        )}
                      >
                        <span className="text-lg">{template.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3
                          className={cn(
                            "font-semibold text-base mb-1",
                            canUseTemplate
                              ? "group-hover:text-blue-600 transition-colors " +
                                  colors.text
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

                    <div className="flex justify-between items-center text-sm mb-3">
                      <div className="flex items-center gap-2">
                        <Clock className={cn("w-4 h-4", colors.primary)} />
                        <span className={cn("font-medium", colors.text)}>
                          {template.duration}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className={cn("w-4 h-4", colors.primary)} />
                        <span className={cn("font-medium", colors.text)}>
                          Start @{template.fromTime}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <DollarSign
                          className={cn("w-4 h-4", colors.successText)}
                        />
                        <span className={cn("font-medium", colors.text)}>
                          {template.budget.split(" - ")[0]}+
                        </span>
                      </div>
                    </div>

                    <Button
                      className={cn(
                        "w-full mt-2 transition-all duration-200 transform",
                        canUseTemplate
                          ? "group-hover:scale-105 " +
                              colors.primaryBg +
                              " " +
                              colors.primaryBgHover +
                              " " +
                              colors.textInverted
                          : "bg-gray-400 text-gray-800 cursor-not-allowed"
                      )}
                      disabled={!canUseTemplate}
                    >
                      {canUseTemplate
                        ? "Use Template"
                        : `Upgrade to ${template.tier}`}
                      {canUseTemplate && (
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>

            {/* Free Tier Benefits */}
            <div
              className={cn(
                "rounded-2xl p-4 border-2 border-dashed",
                colors.border,
                colors.backgroundMuted
              )}
            >
              <h4 className={cn("font-semibold mb-3 text-sm", colors.text)}>
                Free Plan Includes:
              </h4>
              <div className="space-y-2 text-xs">
                {[
                  "Access to 50+ professional templates",
                  "Basic template customization",
                  "Up to 5 saved templates",
                  "Standard email support",
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle
                      className={cn(
                        "w-3 h-3 flex-shrink-0",
                        colors.successText
                      )}
                    />
                    <span className={colors.text}>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pro Tier - Custom Creation */}
          <div className="space-y-4 lg:space-y-6">
            <div className="flex items-center gap-3 mb-4 lg:mb-6">
              <div
                className={cn(
                  "w-2 h-2 lg:w-3 lg:h-3 rounded-full flex-shrink-0",
                  colors.successBg
                )}
              ></div>
              <h3
                className={cn("text-lg lg:text-xl font-semibold", colors.text)}
              >
                Custom Creation
              </h3>
              <span
                className={cn(
                  "px-2 py-1 rounded-full text-xs font-bold",
                  canUseCustom
                    ? "bg-green-500 text-white"
                    : "bg-gray-400 text-gray-800"
                )}
              >
                PRO
              </span>
            </div>

            <div
              onClick={() =>
                canUseCustom ? handleStartCustom() : showUpgradePrompt("pro")
              }
              className={cn(
                "border rounded-xl lg:rounded-2xl p-6 lg:p-8 cursor-pointer transition-all duration-300 group h-full",
                colors.border,
                colors.card,
                "hover:scale-[1.02] hover:shadow-lg",
                canUseCustom ? colors.hoverBg : "opacity-60 cursor-not-allowed"
              )}
            >
              {!canUseCustom && (
                <div className="absolute top-4 left-4">
                  <Lock className={cn("w-5 h-5", colors.textMuted)} />
                </div>
              )}

              <div className="text-center mb-6">
                <div
                  className={cn(
                    "w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center",
                    canUseCustom
                      ? "bg-green-100 dark:bg-green-900/30"
                      : "bg-gray-100 dark:bg-gray-800"
                  )}
                >
                  <Settings
                    className={cn(
                      "w-8 h-8",
                      canUseCustom
                        ? "text-green-600 dark:text-green-400"
                        : "text-gray-400"
                    )}
                  />
                </div>
                <h3
                  className={cn(
                    "text-2xl font-bold mb-3",
                    canUseCustom ? colors.successText : colors.text
                  )}
                >
                  Custom Creation
                </h3>
                <p className={cn("text-lg leading-relaxed", colors.textMuted)}>
                  {canUseCustom
                    ? "Advanced customization with template foundation"
                    : "Upgrade to Pro for advanced customization"}
                </p>
              </div>

              <div className="space-y-3 mb-6">
                {[
                  "Modify any template extensively",
                  "Advanced field options",
                  "Save custom variations",
                  "Priority template access",
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full flex-shrink-0",
                        canUseCustom ? "bg-green-500" : "bg-gray-400"
                      )}
                    ></div>
                    <span className={cn("text-xs", colors.textMuted)}>
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              <Button
                className={cn(
                  "w-full font-semibold py-3",
                  canUseCustom
                    ? "bg-green-500 hover:bg-green-600 text-white"
                    : "bg-gray-400 text-gray-800 cursor-not-allowed"
                )}
                size="lg"
                disabled={!canUseCustom}
              >
                {canUseCustom ? (
                  <>
                    <Settings className="w-5 h-5 mr-2" />
                    Start Custom Creation
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5 mr-2" />
                    Upgrade to Pro
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Premium Tier - Start from Scratch */}
          <div className="space-y-4 lg:space-y-6">
            <div className="flex items-center gap-3 mb-4 lg:mb-6">
              <div
                className={cn(
                  "w-2 h-2 lg:w-3 lg:h-3 rounded-full flex-shrink-0",
                  colors.warningBg
                )}
              ></div>
              <h3
                className={cn("text-lg lg:text-xl font-semibold", colors.text)}
              >
                Start from Scratch
              </h3>
              <span
                className={cn(
                  "px-2 py-1 rounded-full text-xs font-bold",
                  canUseScratch
                    ? "bg-amber-500 text-white"
                    : "bg-gray-400 text-gray-800"
                )}
              >
                PREMIUM
              </span>
            </div>

            <div
              onClick={() =>
                canUseScratch
                  ? handleStartScratch()
                  : showUpgradePrompt("premium")
              }
              className={cn(
                "border rounded-xl lg:rounded-2xl p-6 lg:p-8 cursor-pointer transition-all duration-300 group h-full",
                colors.border,
                colors.card,
                "hover:scale-[1.02] hover:shadow-lg",
                canUseScratch ? colors.hoverBg : "opacity-60 cursor-not-allowed"
              )}
            >
              {!canUseScratch && (
                <div className="absolute top-4 left-4">
                  <Lock className={cn("w-5 h-5", colors.textMuted)} />
                </div>
              )}

              <div className="text-center mb-6">
                <div
                  className={cn(
                    "w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center",
                    canUseScratch
                      ? "bg-amber-100 dark:bg-amber-900/30"
                      : "bg-gray-100 dark:bg-gray-800"
                  )}
                >
                  <Sparkles
                    className={cn(
                      "w-8 h-8",
                      canUseScratch
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-gray-400"
                    )}
                  />
                </div>
                <h3
                  className={cn(
                    "text-2xl font-bold mb-3",
                    canUseScratch ? colors.warningText : colors.text
                  )}
                >
                  Start from Scratch
                </h3>
                <p className={cn("text-lg leading-relaxed", colors.textMuted)}>
                  {canUseScratch
                    ? "Complete creative freedom from blank canvas"
                    : "Upgrade to Premium for complete creative freedom"}
                </p>
              </div>

              <div className="space-y-3 mb-6">
                {[
                  "Blank canvas experience",
                  "Total design control",
                  "Advanced customization",
                  "White-glove support",
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full flex-shrink-0",
                        canUseScratch ? "bg-amber-500" : "bg-gray-400"
                      )}
                    ></div>
                    <span className={cn("text-xs", colors.textMuted)}>
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              <Button
                className={cn(
                  "w-full font-semibold py-3",
                  canUseScratch
                    ? "bg-amber-500 hover:bg-amber-600 text-white"
                    : "bg-gray-400 text-gray-800 cursor-not-allowed"
                )}
                size="lg"
                disabled={!canUseScratch}
              >
                {canUseScratch ? (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Start from Scratch
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5 mr-2" />
                    Upgrade to Premium
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Professional Footer */}
        <div
          className={cn(
            "text-center p-6 rounded-2xl border-2 border-dashed",
            colors.border,
            colors.backgroundMuted,
            colors.shadow
          )}
        >
          <div className="flex items-center justify-center gap-3 mb-3">
            <Shield className={cn("w-6 h-6", colors.successText)} />
            <h4 className={cn("text-lg font-semibold", colors.text)}>
              {userTier === "premium" ? "Premium Support" : "Ready for More?"}
            </h4>
          </div>
          <p className={cn("text-sm mb-4 max-w-md mx-auto", colors.textMuted)}>
            {userTier === "premium"
              ? "Get dedicated support and advanced features with your Premium account."
              : "Upgrade to unlock advanced template creation and priority support."}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="outline"
              className={cn(
                colors.border,
                colors.hoverBg,
                colors.text,
                colors.shadow
              )}
            >
              <HelpCircle className="w-4 h-4 mr-2" />
              {userTier === "premium" ? "Contact Support" : "View Features"}
            </Button>

            {userTier !== "premium" && (
              <Button
                onClick={() => showUpgradePrompt("premium")}
                className={cn(
                  colors.primaryBg,
                  colors.primaryBgHover,
                  colors.textInverted,
                  colors.shadow,
                  "hover:shadow-lg"
                )}
              >
                <Crown className="w-4 h-4 mr-2" />
                Upgrade Now
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
  }) => {
    const router = useRouter(); // Add this line
    const { colors } = useThemeColors();
    const userTier = user?.tier || "free";

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

    // Sync with mode prop changes - only run when mode prop actually changes
    useEffect(() => {
      // Only sync when the mode prop changes, not on every render
      if (
        mode === "scratch" &&
        canAccessTier(userTier, "premium") &&
        creationMode !== "scratch"
      ) {
        setCreationMode("scratch");
      } else if (
        mode === "custom" &&
        canAccessTier(userTier, "pro") &&
        creationMode !== "custom"
      ) {
        setCreationMode("custom");
      } else if (mode === "guided" && creationMode !== "guided") {
        setCreationMode("guided");
      }
    }, [mode]); // Only depend on mode prop, not creationMode or userTier
    // Add state for confirm prompt
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
      [userTier, showUpgradePrompt]
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
      if (!canAccessTier(userTier, "premium")) {
        showUpgradePrompt("premium");
        return;
      }
      setCreationMode("scratch");
    }, [userTier, showUpgradePrompt]);
    const handleStartCustom = useCallback(() => {
      if (!canAccessTier(userTier, "pro")) {
        showUpgradePrompt("pro");
        return;
      }
      setCreationMode("custom");
    }, [userTier, showUpgradePrompt]);
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
      ]
    );

    const guidedInterfaceProps = useMemo(
      () => ({
        useExampleTemplate,
        handleStartCustom,
        handleStartScratch,
        colors,
        user,
        showUpgradePrompt, // Add this line
      }),
      [
        useExampleTemplate,
        handleStartCustom,
        handleStartScratch,
        colors,
        user,
        showUpgradePrompt,
      ]
    );

    const scratchInterfaceProps = useMemo(
      () => ({
        handleBackToDefault,
        colors,
        user,
        onStartScratch: handleStartScratchForm,
        showUpgradePrompt,
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
