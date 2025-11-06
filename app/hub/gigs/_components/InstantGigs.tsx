// app/hub/gigs/_components/InstantGigs.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, Search, Users, Star, Crown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useThemeColors } from "@/hooks/useTheme";
import { GigSectionHeader } from "./GigSectionHeader";

export const InstantGigs = ({ user }: { user: any }) => {
  const router = useRouter();
  const { colors } = useThemeColors();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Pre-defined templates
  const gigTemplates = [
    {
      id: "wedding",
      title: "💒 Wedding Ceremony",
      description: "Elegant music for wedding ceremonies",
      duration: "2-3 hours",
      budget: "$300-600",
      popular: true,
      icon: "💒",
    },
    {
      id: "corporate",
      title: "🏢 Corporate Event",
      description: "Professional background music for corporate functions",
      duration: "3-4 hours",
      budget: "$400-800",
      popular: true,
      icon: "🏢",
    },
    {
      id: "private-party",
      title: "🎉 Private Party",
      description: "Entertainment for birthdays, anniversaries, celebrations",
      duration: "2-4 hours",
      budget: "$250-500",
      icon: "🎉",
    },
    {
      id: "concert",
      title: "🎤 Concert/Show",
      description: "Live performance for concerts and shows",
      duration: "1-2 hours",
      budget: "$500-1000",
      icon: "🎤",
    },
    {
      id: "restaurant",
      title: "🍽️ Restaurant/Lounge",
      description: "Ambient music for dining establishments",
      duration: "3-5 hours",
      budget: "$200-400",
      icon: "🍽️",
    },
    {
      id: "custom",
      title: "➕ Custom Template",
      description: "Create your own gig template from scratch",
      duration: "Flexible",
      budget: "Custom",
      custom: true,
      icon: "➕",
    },
  ];

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
  };

  const handleCreateGig = () => {
    if (selectedTemplate) {
      setIsCreating(true);
      // Simulate API call or navigation
      setTimeout(() => {
        const template = gigTemplates.find((t) => t.id === selectedTemplate);
        if (template?.custom) {
          router.push("/hub/gigs?tab=instant-gigs&create=custom");
        } else {
          router.push(`/search?template=${selectedTemplate}&type=instant-gig`);
        }
        setIsCreating(false);
      }, 1000);
    }
  };

  const selectedTemplateData = gigTemplates.find(
    (t) => t.id === selectedTemplate
  );

  return (
    <div className="space-y-6">
      {/* Gig Section Header */}
      <GigSectionHeader
        title="Instant Gigs"
        description="Create gig templates and invite specific musicians directly"
        user={user}
        type="urgent-gigs"
        stats={{
          total: gigTemplates.length - 1, // Exclude custom template
          active: 0,
          completed: 0,
          pending: 0,
        }}
        onAction={(action) => {
          if (action === "create-urgent") {
            router.push("/hub/gigs?tab=instant-gigs&create=custom");
          }
        }}
      />

      {/* Main Content */}
      <div
        className={cn("rounded-2xl p-6", colors.card, colors.border, "border")}
      >
        {/* Template Selection Grid */}
        <div className="mb-8">
          <h3 className={cn("text-xl font-bold mb-4", colors.text)}>
            Select a Template
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {gigTemplates.map((template) => (
              <div
                key={template.id}
                onClick={() => handleTemplateSelect(template.id)}
                className={cn(
                  "border rounded-2xl p-5 cursor-pointer transition-all duration-200",
                  colors.border,
                  "group relative",
                  selectedTemplate === template.id
                    ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950/20 border-blue-500"
                    : cn(colors.hoverBg, "hover:border-amber-400")
                )}
              >
                {/* Selection Indicator */}
                {selectedTemplate === template.id && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}

                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{template.icon}</span>
                    <h4 className={cn("font-bold", colors.text)}>
                      {template.title}
                    </h4>
                  </div>
                  {template.popular && (
                    <span className="px-2 py-1 bg-amber-500 text-white text-xs rounded-full">
                      Popular
                    </span>
                  )}
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

                {selectedTemplate === template.id && (
                  <Button
                    className="w-full mt-4"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCreateGig();
                    }}
                    disabled={isCreating}
                  >
                    {isCreating ? "Creating..." : "Use This Template"}
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Selected Template Preview */}
        {selectedTemplateData && (
          <div
            className={cn(
              "rounded-2xl p-6 mb-6 border",
              colors.border,
              "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20"
            )}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className={cn("text-lg font-bold mb-2", colors.text)}>
                  Selected: {selectedTemplateData.title}
                </h3>
                <p className={cn("text-sm", colors.textMuted)}>
                  Ready to create your gig with this template
                </p>
              </div>
              <Button
                onClick={handleCreateGig}
                disabled={isCreating}
                className="bg-blue-500 hover:bg-blue-600"
              >
                {isCreating ? (
                  <>Creating...</>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Gig
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Premium Musician Section */}
        <div className={cn("rounded-2xl p-6 mb-6", colors.backgroundMuted)}>
          <div className="flex items-center gap-3 mb-4">
            <Crown className="w-6 h-6 text-amber-500" />
            <h3 className={cn("font-bold text-xl", colors.text)}>
              Featured Premium Musicians
            </h3>
          </div>
          <p className={cn("text-sm mb-4", colors.textMuted)}>
            Top-rated verified musicians available for instant booking
          </p>
          <Button
            onClick={() => router.push("/search?tier=premium&type=instant-gig")}
            className="bg-amber-500 hover:bg-amber-600"
          >
            <Star className="w-4 h-4 mr-2" />
            Browse Premium Musicians
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className={cn("p-4 rounded-xl", colors.backgroundMuted)}>
            <div className={cn("text-2xl font-bold", colors.text)}>
              {gigTemplates.length - 1}
            </div>
            <div className={cn("text-sm", colors.textMuted)}>Templates</div>
          </div>
          <div className={cn("p-4 rounded-xl", colors.backgroundMuted)}>
            <div className={cn("text-2xl font-bold", colors.text)}>0</div>
            <div className={cn("text-sm", colors.textMuted)}>Sent Invites</div>
          </div>
          <div className={cn("p-4 rounded-xl", colors.backgroundMuted)}>
            <div className={cn("text-2xl font-bold", colors.text)}>0</div>
            <div className={cn("text-sm", colors.textMuted)}>Accepted</div>
          </div>
        </div>
      </div>
    </div>
  );
};
