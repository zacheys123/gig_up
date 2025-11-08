// app/hub/gigs/_components/tabs/CreateTemplateTab.tsx - OPTIMIZED
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
  mode: "default" | "guided" | "custom";
  onFormClose: () => void;
  isLoading: boolean;
  editingTemplate?: GigTemplate | null;
}

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
    internalMode,
    editingTemplate,
    selectedExample,
    handleSubmit,
    handleChange,
    handleBackToExamples,
    handleBackToDefault,
    colors,
  }: any) => {
    return (
      <div
        className={cn("rounded-2xl p-6", colors.card, colors.border, "border")}
      >
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={
              internalMode === "guided"
                ? handleBackToExamples
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
                  : "Create Custom Template"}
            </h3>
            <p className={cn("text-sm", colors.textMuted)}>
              {editingTemplate
                ? "Update your template details"
                : selectedExample
                  ? "Modify the example to fit your needs"
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
                  id="duration"
                  placeholder="e.g., 7pm"
                  value={formData.duration}
                  onChange={(e) => handleChange("fromTime", e.target.value)}
                  required
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
                internalMode === "guided"
                  ? handleBackToExamples
                  : handleBackToDefault
              }
              className="flex-1"
            >
              {internalMode === "guided" ? "Back to Examples" : "Cancel"}
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
                  : "Save as Template"}
            </Button>
          </div>
        </form>
      </div>
    );
  }
);

TemplateForm.displayName = "TemplateForm";

// Memoize GuidedInterface component
const GuidedInterface = memo(
  ({ useExampleTemplate, handleCustomTemplate, colors, user }: any) => {
    const isPremiumUser =
      user?.tier === "premium" || user?.subscription === "premium";
    const isProUser = user?.tier === "pro" || user?.subscription === "pro";
    const canUseAdvancedFeatures = isPremiumUser || isProUser;

    const handleCustomTemplateClick = () => {
      if (!canUseAdvancedFeatures) {
        alert(
          "Advanced template creation is available for Premium users. Please upgrade your account to access this feature."
        );
        return;
      }
      handleCustomTemplate();
    };

    const handleUpgradeClick = () => {
      alert("Redirecting to upgrade page...");
    };

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
            Start with professionally designed templates or create your own{" "}
            {canUseAdvancedFeatures ? "with advanced customization" : ""}
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
                {!canUseAdvancedFeatures && (
                  <span className={cn("text-sm ml-2", colors.primary)}>
                    (Free)
                  </span>
                )}
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

          {/* Custom Template Column */}
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
                Advanced Creation{" "}
                {!canUseAdvancedFeatures && (
                  <span className={cn("text-sm ml-2", colors.primary)}>
                    (Premium)
                  </span>
                )}
              </h3>
            </div>

            <div
              onClick={
                canUseAdvancedFeatures
                  ? handleCustomTemplateClick
                  : handleUpgradeClick
              }
              className={cn(
                "border rounded-xl lg:rounded-2xl p-6 lg:p-8 cursor-pointer transition-all duration-300 group",
                colors.border,
                colors.card,
                colors.shadow,
                "hover:scale-[1.02] hover:shadow-lg",
                colors.hoverBg
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
                    <Plus className="w-8 h-8 text-white" />
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
                  Custom Template
                </h3>
                <p className={cn("text-lg leading-relaxed", colors.textMuted)}>
                  {canUseAdvancedFeatures
                    ? "Build from scratch with complete creative control"
                    : "Upgrade to Premium for advanced template creation"}
                </p>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {[
                  {
                    icon: "🎨",
                    title: "Full Design",
                    desc: "Complete customization",
                  },
                  { icon: "⚡", title: "Advanced", desc: "Premium features" },
                  { icon: "🔧", title: "Flexible", desc: "Adapt to any event" },
                  { icon: "🎯", title: "Precise", desc: "Exact requirements" },
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

              {/* Benefits List */}
              <div className="space-y-3 mb-6">
                {[
                  "Unlimited customization options",
                  "Advanced pricing models",
                  "Custom requirement fields",
                  "Template duplication",
                  "Priority support access",
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    {canUseAdvancedFeatures ? (
                      <CheckCircle
                        className={cn(
                          "w-5 h-5 flex-shrink-0",
                          colors.successText
                        )}
                      />
                    ) : (
                      <Lock
                        className={cn(
                          "w-4 h-4 flex-shrink-0",
                          colors.textMuted
                        )}
                      />
                    )}
                    <span
                      className={cn(
                        "text-sm",
                        canUseAdvancedFeatures ? colors.text : colors.textMuted
                      )}
                    >
                      {benefit}
                    </span>
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
                    : cn(
                        colors.primaryBg,
                        colors.primaryBgHover,
                        colors.textInverted
                      )
                )}
                size="lg"
              >
                {canUseAdvancedFeatures ? (
                  <>
                    <Wand2 className="w-5 h-5 mr-2" />
                    Start Custom Creation
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                ) : (
                  <>
                    <Crown className="w-5 h-5 mr-2" />
                    Upgrade to Premium
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
                onClick={handleUpgradeClick}
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
    handleCustomTemplate,
    colors,
  }: any) => {
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

        {/* Example Templates Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-blue-500" />
            <h3 className={cn("font-bold", colors.text)}>Example Templates</h3>
          </div>
          <p className={cn("text-sm mb-4", colors.textMuted)}>
            Get started with these examples or create your own from scratch
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {EXAMPLE_TEMPLATES.map((template) => (
              <div
                key={template.id}
                onClick={() => useExampleTemplate(template)}
                className={cn(
                  "border rounded-2xl p-5 cursor-pointer transition-all duration-200 group",
                  colors.border,
                  colors.hoverBg,
                  "hover:border-blue-500 hover:shadow-lg"
                )}
              >
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-2xl">{template.icon}</span>
                  <h4 className={cn("font-bold", colors.text)}>
                    {template.title}
                  </h4>
                </div>

                <p className={cn("text-sm mb-4", colors.textMuted)}>
                  {template.description}
                </p>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className={colors.textMuted}>Duration:</span>
                    <span className={cn("font-medium", colors.text)}>
                      {template.duration}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={colors.textMuted}>Budget Range:</span>
                    <span className={cn("font-medium", colors.text)}>
                      {template.budget}
                    </span>
                  </div>
                </div>

                <Button className="w-full mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  Use as Example
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Custom Template Card */}
        <div
          onClick={handleCustomTemplate}
          className={cn(
            "border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 group",
            colors.border,
            "hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20"
          )}
        >
          <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
            <Lightbulb className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className={cn("font-bold text-xl mb-2", colors.text)}>
            Create Custom Template
          </h3>
          <p className={cn("text-sm mb-4", colors.textMuted)}>
            Design a completely custom gig template from scratch
          </p>
          <div className={cn("text-xs", colors.textMuted)}>
            Perfect for unique events, specific requirements, or recurring gigs
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
    const [internalMode, setInternalMode] = useState<
      "default" | "guided" | "custom"
    >(mode);
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
        setInternalMode("custom");
      }
    }, [editingTemplate]);

    // Sync with parent mode changes
    const syncMode = useCallback((newMode: "default" | "guided" | "custom") => {
      setInternalMode(newMode);

      if (newMode === "guided" || newMode === "custom") {
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
      } else {
        setSelectedExample(null);
      }
    }, []);

    // Use effect to sync with parent mode
    useEffect(() => {
      syncMode(mode);
    }, [mode, syncMode]);

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
      setInternalMode("custom");
    }, []);

    const handleCustomTemplate = useCallback(() => {
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
      setInternalMode("custom");
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
      setInternalMode("default");
      onFormClose();
    }, [onFormClose]);

    const handleChange = useCallback((field: string, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }, []);

    const handleBackToExamples = useCallback(() => {
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
      setInternalMode("guided");
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
      setInternalMode("default");
      onFormClose();
    }, [onFormClose]);

    // Memoize template props to prevent unnecessary re-renders
    const templateFormProps = useMemo(
      () => ({
        formData,
        internalMode,
        editingTemplate,
        selectedExample,
        handleSubmit,
        handleChange,
        handleBackToExamples,
        handleBackToDefault,
        colors,
      }),
      [
        formData,
        internalMode,
        editingTemplate,
        selectedExample,
        handleSubmit,
        handleChange,
        handleBackToExamples,
        handleBackToDefault,
        colors,
      ]
    );

    const guidedInterfaceProps = useMemo(
      () => ({
        useExampleTemplate,
        handleCustomTemplate,
        colors,
      }),
      [useExampleTemplate, handleCustomTemplate, colors]
    );

    const defaultInterfaceProps = useMemo(
      () => ({
        existingTemplates: memoizedExistingTemplates,
        useExampleTemplate,
        handleCustomTemplate,
        colors,
      }),
      [
        memoizedExistingTemplates,
        useExampleTemplate,
        handleCustomTemplate,
        colors,
      ]
    );

    // Main render with minimal conditional logic
    if (internalMode === "custom") {
      return <TemplateForm {...templateFormProps} />;
    }

    if (internalMode === "guided") {
      return <GuidedInterface {...guidedInterfaceProps} />;
    }

    return <DefaultInterface {...defaultInterfaceProps} />;
  }
);

CreateTemplateTab.displayName = "CreateTemplateTab";
