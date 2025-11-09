// app/hub/gigs/_components/tabs/CreateTemplateTab.tsx - UPDATED
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useThemeColors } from "@/hooks/useTheme";
import { GigTemplate } from "@/convex/instantGigsTypes";

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

// Clear mode separation
const MODE_FLOW = {
  guided: {
    description: "Start with professional templates",
    showTemplates: true,
    showCustomOption: true,
    allowScratch: false,
  },
  scratch: {
    description: "Build completely from scratch",
    showTemplates: false,
    showCustomOption: false,
    allowScratch: true,
  },
  custom: {
    description: "Editing or customizing",
    showTemplates: false,
    showCustomOption: false,
    allowScratch: false,
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

// Memoize TemplateForm component
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
  }: any) => {
    const isPremiumUser = user?.tier === "premium";
    const isProUser = user?.tier === "pro";
    const canUseAdvancedFeatures = isPremiumUser || isProUser;

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
                  ? "Customize Template"
                  : creationMode === "scratch"
                    ? "Start from Scratch"
                    : "Create Custom Template"}
            </h3>
            <p className={cn("text-sm", colors.textMuted)}>
              {editingTemplate
                ? "Update your template details"
                : selectedExample
                  ? "Modify the example to fit your needs"
                  : creationMode === "scratch"
                    ? "Build your perfect template from the ground up"
                    : "Design your perfect gig template once, use it forever"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              <div className="space-y-2">
                <Label
                  htmlFor="title"
                  className={cn("text-sm font-medium", colors.text)}
                >
                  Gig Title *
                </Label>
                <Input
                  id="title"
                  placeholder="e.g., Saturday Night Jazz Session"
                  value={formData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  required
                  className={cn(colors.border, "focus:ring-blue-500")}
                />
              </div>

              <div className="space-y-2">
                <Label className={cn("text-sm font-medium", colors.text)}>
                  Gig Type *
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {GIG_TYPES.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => handleChange("gigType", type.value)}
                      className={cn(
                        "border rounded-lg p-3 text-sm text-left transition-all",
                        colors.border,
                        formData.gigType === type.value
                          ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950/20 border-blue-500"
                          : cn(colors.hoverBg, "hover:border-blue-300")
                      )}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

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
                  Budget (KES) *
                </Label>
                <Input
                  id="budget"
                  placeholder="e.g., 25,000"
                  value={formData.budget}
                  onChange={(e) => handleChange("budget", e.target.value)}
                  required
                  className={cn(colors.border, "focus:ring-blue-500")}
                />
                <p className={cn("text-xs", colors.textMuted)}>
                  Typical rates: Wedding KES 25-40K • Corporate KES 30-60K •
                  Private Party KES 20-35K
                </p>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="duration"
                  className={cn("text-sm font-medium", colors.text)}
                >
                  <Clock className="w-4 h-4 inline mr-2" />
                  Duration *
                </Label>
                <Input
                  id="duration"
                  placeholder="e.g., 2-3 hours"
                  value={formData.duration}
                  onChange={(e) => handleChange("duration", e.target.value)}
                  required
                  className={cn(colors.border, "focus:ring-blue-500")}
                />
              </div>

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
                  Setlist/Song Requests (Optional)
                </Label>
                <Textarea
                  id="setlist"
                  placeholder="List any specific songs or musical requirements..."
                  rows={2}
                  value={formData.setlist}
                  onChange={(e) => handleChange("setlist", e.target.value)}
                  className={cn(colors.border, "focus:ring-blue-500")}
                />
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
                  ? "Save Customized Template"
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

// New Scratch Interface Component
const ScratchInterface = memo(
  ({ handleBackToDefault, colors, user, onStartScratch }: any) => {
    const isPremiumUser = user?.tier === "premium";
    const isProUser = user?.tier === "pro";
    const canUseAdvancedFeatures = isPremiumUser || isProUser;

    const handleStartCreating = () => {
      if (!canUseAdvancedFeatures) {
        alert(
          "Start from scratch is available for Premium users only. Please upgrade your account."
        );
        return;
      }
      onStartScratch(); // This should transition to the form
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
              Build your perfect template from the ground up
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
            onClick={handleStartCreating} // Use the fixed handler
            className={cn(
              "bg-blue-500 hover:bg-blue-600 text-white px-8 py-3",
              colors.shadow
            )}
            size="lg"
            disabled={!canUseAdvancedFeatures}
          >
            <Plus className="w-5 h-5 mr-2" />
            Begin Creating
          </Button>

          {!canUseAdvancedFeatures && (
            <div className="mt-4 text-center">
              <p className={cn("text-sm", colors.textMuted)}>
                Upgrade to Premium to access Start from Scratch feature
              </p>
              <Button
                onClick={() => alert("Redirecting to upgrade page...")}
                className="mt-2"
                variant="outline"
                size="sm"
              >
                <Crown className="w-4 h-4 mr-2" />
                Upgrade Now
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

// Updated GuidedInterface component
const GuidedInterface = memo(
  ({ useExampleTemplate, handleStartFromScratch, colors, user }: any) => {
    const isPremiumUser = user?.tier === "premium";
    const isProUser = user?.tier === "pro";
    const canUseAdvancedFeatures = isPremiumUser || isProUser;

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
            Choose Your Template Style
          </h2>
          <p
            className={cn(
              "text-base lg:text-lg max-w-2xl mx-auto leading-relaxed px-2",
              colors.textMuted
            )}
          >
            Start with professionally designed templates or create your own from
            scratch
          </p>

          {/* User Tier Badge */}
          <div className="mt-4 flex justify-center">
            <div
              className={cn(
                "px-3 py-1.5 lg:px-4 lg:py-2 rounded-full text-xs lg:text-sm font-medium",
                colors.shadow,
                canUseAdvancedFeatures
                  ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                  : cn(colors.primaryBg, colors.textInverted)
              )}
            >
              {canUseAdvancedFeatures ? "🎉 Premium Access" : "✨ Free Plan"}
            </div>
          </div>
        </div>

        {/* Professional Template Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8 mb-8 lg:mb-12">
          {/* Example Templates Column */}
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
                Professional Templates{" "}
                <span className={cn("text-sm ml-2", colors.primary)}>
                  (Free)
                </span>
              </h3>
            </div>

            {/* Template cards with subtle shadows */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2 gap-3 lg:gap-4">
              {EXAMPLE_TEMPLATES.map((template) => (
                <div
                  key={template.id}
                  onClick={() => useExampleTemplate(template)}
                  className={cn(
                    "border rounded-xl p-4 cursor-pointer transition-all duration-200 group",
                    colors.border,
                    colors.card,
                    colors.shadow,
                    "hover:scale-[1.02] hover:shadow-md",
                    colors.backgroundMuted
                  )}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        colors.backgroundMuted,
                        colors.border,
                        colors.shadow,
                        "group-hover:scale-110 transition-transform duration-200"
                      )}
                    >
                      <span className="text-lg">{template.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3
                        className={cn(
                          "font-semibold text-base mb-1 group-hover:text-blue-600 transition-colors",
                          colors.text
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
                      "w-full mt-2 transition-all duration-200 transform group-hover:scale-105",
                      "text-sm py-2",
                      colors.primaryBg,
                      colors.primaryBgHover,
                      colors.textInverted,
                      colors.shadow
                    )}
                  >
                    Use Template
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Start from Scratch Column */}
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
                Start from Scratch{" "}
                {!canUseAdvancedFeatures && (
                  <span className={cn("text-sm ml-2", colors.primary)}>
                    (Premium)
                  </span>
                )}
              </h3>
            </div>

            <div
              onClick={handleStartFromScratch}
              className={cn(
                "border rounded-xl lg:rounded-2xl p-6 lg:p-8 cursor-pointer transition-all duration-300 group",
                colors.border,
                colors.card,
                colors.shadow,
                "hover:scale-[1.02] hover:shadow-lg",
                canUseAdvancedFeatures
                  ? colors.hoverBg
                  : "opacity-60 cursor-not-allowed"
              )}
            >
              {/* Premium Badge */}
              <div className="absolute top-4 right-4">
                <div
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium",
                    colors.shadow,
                    canUseAdvancedFeatures
                      ? cn(colors.primaryBg, colors.textInverted)
                      : cn(
                          colors.backgroundMuted,
                          colors.textMuted,
                          colors.border
                        )
                  )}
                >
                  {canUseAdvancedFeatures ? "PREMIUM" : "UPGRADE"}
                </div>
              </div>

              {/* Lock Icon for non-premium users */}
              {!canUseAdvancedFeatures && (
                <div className="absolute top-4 left-4">
                  <Lock className={cn("w-5 h-5", colors.textMuted)} />
                </div>
              )}

              <div className="text-center mb-6">
                <div
                  className={cn(
                    "w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center",
                    colors.shadow,
                    canUseAdvancedFeatures
                      ? colors.primaryBg
                      : colors.backgroundMuted
                  )}
                >
                  {canUseAdvancedFeatures ? (
                    <Sparkles className="w-8 h-8 text-white" />
                  ) : (
                    <Lock className={cn("w-8 h-8", colors.textMuted)} />
                  )}
                </div>
                <h3
                  className={cn(
                    "text-2xl font-bold mb-3",
                    canUseAdvancedFeatures ? colors.primary : colors.text
                  )}
                >
                  Start from Scratch
                </h3>
                <p className={cn("text-lg leading-relaxed", colors.textMuted)}>
                  {canUseAdvancedFeatures
                    ? "Build completely from scratch with no templates"
                    : "Upgrade to Premium for advanced creation tools"}
                </p>
              </div>

              {/* Key Difference Highlight */}
              <div
                className={cn(
                  "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm mb-6 mx-auto flex justify-center",
                  canUseAdvancedFeatures
                    ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                    : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                )}
              >
                <Shield className="w-4 h-4" />
                No templates • Complete freedom
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {[
                  {
                    icon: "🎨",
                    title: "Complete Freedom",
                    desc: "No predefined structures",
                  },
                  {
                    icon: "⚡",
                    title: "Pure Custom",
                    desc: "Every field your choice",
                  },
                  {
                    icon: "🔧",
                    title: "Advanced Control",
                    desc: "For unique needs",
                  },
                  {
                    icon: "🎯",
                    title: "Total Precision",
                    desc: "Exact requirements",
                  },
                ].map((feature, index) => (
                  <div
                    key={index}
                    className={cn(
                      "text-center p-4 rounded-xl border",
                      colors.backgroundMuted,
                      colors.border,
                      colors.shadow
                    )}
                  >
                    <div className="text-2xl mb-2">{feature.icon}</div>
                    <div
                      className={cn("font-semibold text-sm mb-1", colors.text)}
                    >
                      {feature.title}
                    </div>
                    <div className={cn("text-xs", colors.textMuted)}>
                      {feature.desc}
                    </div>
                  </div>
                ))}
              </div>

              {/* Enhanced CTA */}
              <Button
                className={cn(
                  "w-full font-semibold py-3",
                  "transform hover:scale-105 transition-all duration-300",
                  colors.shadow,
                  "hover:shadow-lg",
                  canUseAdvancedFeatures
                    ? cn(
                        colors.primaryBg,
                        colors.primaryBgHover,
                        colors.textInverted
                      )
                    : cn("bg-gray-400 text-gray-800 cursor-not-allowed")
                )}
                size="lg"
                disabled={!canUseAdvancedFeatures}
              >
                {canUseAdvancedFeatures ? (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Start from Blank Canvas
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5 mr-2" />
                    Upgrade to Unlock
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </div>

            {/* Free User Benefits */}
            {!canUseAdvancedFeatures && (
              <div
                className={cn(
                  "rounded-2xl p-6 border-2 border-dashed",
                  colors.border,
                  colors.backgroundMuted,
                  colors.shadow
                )}
              >
                <div className="text-center mb-4">
                  <Star
                    className={cn("w-8 h-8 mx-auto mb-2", colors.primary)}
                  />
                  <h4 className={cn("font-semibold mb-2", colors.text)}>
                    Free Plan Includes
                  </h4>
                </div>
                <div className="space-y-2 text-sm">
                  {[
                    "Access to all professional templates",
                    "Basic template customization",
                    "Up to 5 saved templates",
                    "Standard email support",
                  ].map((benefit, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircle
                        className={cn(
                          "w-4 h-4 flex-shrink-0",
                          colors.successText
                        )}
                      />
                      <span className={colors.text}>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
              {canUseAdvancedFeatures ? "Premium Support" : "Ready for More?"}
            </h4>
          </div>
          <p className={cn("text-sm mb-4 max-w-md mx-auto", colors.textMuted)}>
            {canUseAdvancedFeatures
              ? "Get dedicated support and advanced features with your Premium account."
              : "Upgrade to Premium for advanced template creation and priority support."}
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
              {canUseAdvancedFeatures ? "Contact Support" : "View Features"}
            </Button>
            {!canUseAdvancedFeatures && (
              <Button
                onClick={() => alert("Redirecting to upgrade page...")}
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

// Memoize DefaultInterface component
const DefaultInterface = memo(
  ({
    existingTemplates,
    useExampleTemplate,
    handleStartGuided,
    handleStartScratch,
    colors,
    user,
  }: any) => {
    const isPremiumUser = user?.tier === "premium";
    const isProUser = user?.tier === "pro";
    const canUseAdvancedFeatures = isPremiumUser || isProUser;

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Guided Creation Card */}
          <div
            onClick={handleStartGuided}
            className={cn(
              "border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 group",
              colors.border,
              "hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20"
            )}
          >
            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <BookOpen className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className={cn("font-bold text-xl mb-2", colors.text)}>
              Use Templates
            </h3>
            <p className={cn("text-sm mb-4", colors.textMuted)}>
              Start with professionally designed templates for common event
              types
            </p>
            <div className={cn("text-xs", colors.textMuted)}>
              Perfect for weddings, corporate events, parties, and more
            </div>
            <Button className="w-full mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
              Start with Templates
            </Button>
          </div>

          {/* Start from Scratch Card */}
          <div
            onClick={handleStartScratch}
            className={cn(
              "border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 group",
              colors.border,
              canUseAdvancedFeatures
                ? "hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-950/20"
                : "opacity-60 cursor-not-allowed"
            )}
          >
            {!canUseAdvancedFeatures && (
              <div className="absolute top-4 right-4">
                <Lock className={cn("w-5 h-5", colors.textMuted)} />
              </div>
            )}
            <div
              className={cn(
                "w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform",
                canUseAdvancedFeatures
                  ? "bg-purple-100 dark:bg-purple-900/30"
                  : "bg-gray-100 dark:bg-gray-800"
              )}
            >
              <Sparkles
                className={cn(
                  "w-8 h-8",
                  canUseAdvancedFeatures
                    ? "text-purple-600 dark:text-purple-400"
                    : "text-gray-400"
                )}
              />
            </div>
            <h3 className={cn("font-bold text-xl mb-2", colors.text)}>
              Start from Scratch
            </h3>
            <p className={cn("text-sm mb-4", colors.textMuted)}>
              {canUseAdvancedFeatures
                ? "Build completely from scratch with no templates"
                : "Upgrade to Premium for advanced creation"}
            </p>
            <div className={cn("text-xs", colors.textMuted)}>
              {canUseAdvancedFeatures
                ? "For unique events and specific requirements"
                : "Premium feature - upgrade to unlock"}
            </div>
            <Button
              className={cn(
                "w-full mt-4 opacity-0 group-hover:opacity-100 transition-opacity",
                !canUseAdvancedFeatures && "cursor-not-allowed"
              )}
              variant={canUseAdvancedFeatures ? "default" : "outline"}
              disabled={!canUseAdvancedFeatures}
            >
              {canUseAdvancedFeatures
                ? "Start from Scratch"
                : "Premium Feature"}
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
    const { colors } = useThemeColors();
    const [creationMode, setCreationMode] = useState<
      "guided" | "scratch" | "custom"
    >(
      editingTemplate
        ? "custom"
        : mode === "scratch"
          ? "scratch"
          : mode === "guided"
            ? "guided"
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

    useEffect(() => {
      if (mode === "scratch" && creationMode !== "scratch") {
        setCreationMode("scratch");
      } else if (mode === "guided" && creationMode !== "guided") {
        setCreationMode("guided");
      } else if (mode === "custom" && creationMode !== "custom") {
        setCreationMode("custom");
      }
    }, [mode, creationMode]);

    // Memoize event handlers
    const useExampleTemplate = useCallback((template: any) => {
      setSelectedExample(template.id);
      setFormData({
        title: template.title,
        description: template.description,
        date: "",
        venue: "",
        budget: template.budget.split(" - ")[0],
        gigType: template.gigType,
        duration: template.duration,
        fromTime: template.fromTime || "",
        setlist: "",
      });
      setCreationMode("custom");
    }, []);

    const handleStartFromScratch = useCallback(() => {
      const isPremiumUser = user?.tier === "premium";
      const isProUser = user?.tier === "pro";
      const canUseAdvancedFeatures = isPremiumUser || isProUser;

      if (!canUseAdvancedFeatures) {
        alert(
          "Start from scratch is available for Premium users only. Please upgrade your account."
        );
        return;
      }

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
      setCreationMode("scratch");
    }, [user]);

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

    // Memoize template props to prevent unnecessary re-renders
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
      ]
    );

    const guidedInterfaceProps = useMemo(
      () => ({
        useExampleTemplate,
        handleStartFromScratch,
        colors,
        user,
      }),
      [useExampleTemplate, handleStartFromScratch, colors, user]
    );

    const scratchInterfaceProps = useMemo(
      () => ({
        handleBackToDefault,
        colors,
        user,
        onStartScratch: handleStartScratchForm,
      }),
      [handleBackToDefault, colors, user, handleStartScratchForm]
    );

    const defaultInterfaceProps = useMemo(
      () => ({
        existingTemplates: memoizedExistingTemplates,
        useExampleTemplate,
        handleStartGuided,
        handleStartScratch: handleStartFromScratch,
        colors,
        user,
      }),
      [
        memoizedExistingTemplates,
        useExampleTemplate,
        handleStartGuided,
        handleStartFromScratch,
        colors,
        user,
      ]
    );

    // Main render with clear mode separation
    if (creationMode === "custom") {
      return <TemplateForm {...templateFormProps} />;
    }

    if (creationMode === "scratch") {
      return <ScratchInterface {...scratchInterfaceProps} />;
    }

    if (creationMode === "guided") {
      return <GuidedInterface {...guidedInterfaceProps} />;
    }

    return <DefaultInterface {...defaultInterfaceProps} />;
  }
);

CreateTemplateTab.displayName = "CreateTemplateTab";
