// app/hub/gigs/_components/InstantGigs.tsx - ADD UPDATE HANDLER
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Crown } from "lucide-react";
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

export const InstantGigs = ({ user }: { user: any }) => {
  const router = useRouter();
  const { colors } = useThemeColors();
  const [activeTab, setActiveTab] = useState<
    "create" | "templates" | "musicians"
  >("create");
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedMusician, setSelectedMusician] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [createTabMode, setCreateTabMode] = useState<
    "default" | "guided" | "custom"
  >("default");
  const [editingTemplate, setEditingTemplate] = useState<GigTemplate | null>(
    null
  ); // NEW: For edit mode

  // Use optimized hooks
  const {
    templates,
    isLoading: templatesLoading,
    createTemplate,
    updateTemplate,
    deleteTemplate,
  } = useTemplates(user._id);
  const { stats, createGig } = useInstantGigs(user._id);
  const { featuredMusicians: proMusicians } = useProMusicians();
  // Check if user is new and show onboarding
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem(
      "instant_gigs_onboarding_seen"
    );
    if (!hasSeenOnboarding && templates.length === 0 && !templatesLoading) {
      setShowOnboarding(true);
    }
  }, [templates, templatesLoading]);

  const handleCreateTemplate = async (templateData: any) => {
    await createTemplate(templateData);
    setActiveTab("templates");
    setCreateTabMode("default");
  };

  // NEW: Handle template updates
  const handleUpdateTemplate = async (
    templateId: string,
    updates: Partial<GigTemplate>
  ) => {
    await updateTemplate(templateId, updates);
  };

  // NEW: Start editing a template
  const handleStartEdit = (template: GigTemplate) => {
    setEditingTemplate(template);
    setActiveTab("create");
    setCreateTabMode("custom");
  };

  // NEW: Cancel editing
  const handleCancelEdit = () => {
    setEditingTemplate(null);
    setCreateTabMode("default");
  };

  const handleDeleteTemplate = async (templateId: string) => {
    await deleteTemplate(templateId);
  };

  const handleRequestToBook = (musician: any) => {
    setSelectedMusician(musician);
    setShowBookingModal(true);
  };

  const handleSubmitBooking = async (templateId: string) => {
    setIsLoading(true);
    try {
      const template = templates.find((t) => t.id === templateId);
      if (!template || !selectedMusician) return;

      // Create the gig in Convex
      await createGig({
        title: template.title,
        description: template.description,
        date: template.date,
        venue: template.venue,
        budget: template.budget,
        gigType: template.gigType,
        duration: template.duration,
        setlist: template.setlist,
        clientId: user._id,
        clientName: user.name,
        invitedMusicianId: selectedMusician.id,
        musicianName: selectedMusician.name,
      });

      setShowBookingModal(false);
      setSelectedMusician(null);

      // Show success message
      console.log("Booking submitted successfully!");
    } catch (error) {
      console.error("Error submitting booking:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOnboardingComplete = () => {
    localStorage.setItem("instant_gigs_onboarding_seen", "true");
    setShowOnboarding(false);
  };

  const handleGuidedCreation = () => {
    setShowOnboarding(false);
    setActiveTab("create");
    setCreateTabMode("guided");
  };

  const handleCustomCreation = () => {
    setShowOnboarding(false);
    setActiveTab("create");
    setCreateTabMode("custom");
  };

  const handleFormClose = () => {
    setCreateTabMode("default");
    setEditingTemplate(null); // NEW: Reset editing state
  };

  const draftTemplates = templates;

  return (
    <div className="space-y-6">
      {/* Onboarding Modal */}
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={handleOnboardingComplete}
        onGuidedCreation={handleGuidedCreation}
        onCustomCreation={handleCustomCreation}
      />

      <GigSectionHeader
        title="Instant Gigs"
        description="Create templates and book premium musicians instantly"
        user={user}
        type="urgent-gigs"
        stats={{
          total: templates.length,
          used: templates.filter((t) => t.timesUsed && t.timesUsed > 0).length, // Templates actually used
          musicians: proMusicians.length, // Available musicians
          bookings: stats.total, // Actual gigs booked
        }}
        onAction={(action) => {
          if (action === "create-urgent") {
            setActiveTab("create");
            setCreateTabMode("custom");
          }
        }}
      />
      {/* Tabs Navigation */}
      <div
        className={cn("rounded-2xl p-1", colors.card, colors.border, "border")}
      >
        <div className="flex space-x-1">
          {[
            { id: "create", label: "🎵 Create Template", icon: Plus },
            { id: "templates", label: "📋 My Templates", icon: Edit },
            { id: "musicians", label: "👑 Pro Musicians", icon: Crown },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  if (tab.id === "create") {
                    setCreateTabMode("default");
                    setEditingTemplate(null); // NEW: Reset editing when switching tabs
                  }
                }}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 flex-1 justify-center",
                  activeTab === tab.id
                    ? "bg-blue-500 text-white shadow-lg shadow-blue-500/25"
                    : cn(colors.textMuted, "hover:" + colors.text)
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === "create" && (
          <CreateTemplateTab
            onCreateTemplate={handleCreateTemplate}
            onUpdateTemplate={
              editingTemplate ? handleUpdateTemplate : undefined
            } // NEW: Pass update function when editing
            user={user}
            existingTemplates={templates}
            mode={createTabMode}
            onFormClose={handleFormClose}
            isLoading={templatesLoading}
            editingTemplate={editingTemplate} // NEW: Pass the template being edited
          />
        )}

        {activeTab === "templates" && (
          <MyTemplatesTab
            templates={templates}
            onStartEdit={handleStartEdit} // NEW: Use start edit function
            onDeleteTemplate={handleDeleteTemplate}
            onRequestToBook={handleRequestToBook}
            isLoading={templatesLoading}
          />
        )}

        {activeTab === "musicians" && (
          <ProMusiciansTab
            onRequestToBook={handleRequestToBook}
            user={user}
            hasTemplates={templates.length > 0}
          />
        )}
      </div>
      {/* Booking Modal */}
      <BookingModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        musician={selectedMusician}
        templates={draftTemplates}
        onSubmitBooking={handleSubmitBooking}
        isLoading={isLoading}
      />
    </div>
  );
};
