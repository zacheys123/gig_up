// app/hub/gigs/_components/tabs/CreateTemplateTab.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Music,
  Calendar,
  MapPin,
  DollarSign,
  Clock,
  Lightbulb,
  BookOpen,
  ArrowLeft,
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
  ) => void; // NEW: Update function
  user: any;
  existingTemplates: GigTemplate[];
  mode: "default" | "guided" | "custom";
  onFormClose: () => void;
  isLoading: boolean;
  editingTemplate?: GigTemplate | null; // NEW: Template being edited
}

// Only two example templates for guidance
const exampleTemplates = [
  {
    id: "wedding-example",
    title: "Wedding Ceremony",
    description:
      "Elegant background music for wedding ceremony and cocktail hour. Looking for acoustic or jazz ensemble.",
    duration: "3-4 hours",
    budget: "KES 25,000 - 40,000",
    icon: "💒",
    gigType: "wedding",
  },
  {
    id: "corporate-example",
    title: "Corporate Gala Dinner",
    description:
      "Sophisticated background music for corporate event. Professional ensemble preferred.",
    duration: "4 hours",
    budget: "KES 35,000 - 60,000",
    icon: "🏢",
    gigType: "corporate",
  },
];

export const CreateTemplateTab: React.FC<CreateTemplateTabProps> = ({
  onCreateTemplate,
  onUpdateTemplate, // NEW
  user,
  existingTemplates,
  mode,
  onFormClose,
  isLoading,
  editingTemplate, // NEW
}) => {
  const { colors } = useThemeColors();
  const [showCustomForm, setShowCustomForm] = useState(
    mode === "custom" || !!editingTemplate
  );
  const [selectedExample, setSelectedExample] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    venue: "",
    budget: "",
    gigType: "",
    duration: "",
    setlist: "",
  });

  // NEW: Initialize form with editing template data
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
        setlist: editingTemplate.setlist || "",
      });
      setShowCustomForm(true);
    }
  }, [editingTemplate]);

  const gigTypes = [
    { value: "wedding", label: "💒 Wedding" },
    { value: "corporate", label: "🏢 Corporate Event" },
    { value: "private-party", label: "🎉 Private Party" },
    { value: "concert", label: "🎤 Concert/Show" },
    { value: "restaurant", label: "🍽️ Restaurant/Lounge" },
    { value: "church", label: "⛪ Church Service" },
    { value: "festival", label: "🎪 Festival" },
    { value: "club", label: "🎭 Club Night" },
    { value: "recording", label: "🎹 Recording Session" },
    { value: "other", label: "✨ Other" },
  ];

  // Handle mode changes from parent
  useEffect(() => {
    if (mode === "guided") {
      setShowCustomForm(false);
      setSelectedExample(null);
    } else if (mode === "custom") {
      setShowCustomForm(true);
      setSelectedExample(null);
      // Reset form for fresh start
      setFormData({
        title: "",
        description: "",
        date: "",
        venue: "",
        budget: "",
        gigType: "",
        duration: "",
        setlist: "",
      });
    } else {
      setShowCustomForm(false);
      setSelectedExample(null);
    }
  }, [mode]);

  const useExampleTemplate = (template: any) => {
    setSelectedExample(template.id);
    setFormData({
      title: template.title,
      description: template.description,
      date: "",
      venue: "",
      budget: template.budget.split(" - ")[0],
      gigType: template.gigType,
      duration: template.duration,
      setlist: "",
    });
    setShowCustomForm(true);
  };

  const handleCustomTemplate = () => {
    setSelectedExample(null);
    setFormData({
      title: "",
      description: "",
      date: "",
      venue: "",
      budget: "",
      gigType: "",
      duration: "",
      setlist: "",
    });
    setShowCustomForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const templateData = {
      ...formData,
      icon:
        gigTypes
          .find((t) => t.value === formData.gigType)
          ?.label.split(" ")[0] || "✨",
    };

    if (editingTemplate && onUpdateTemplate) {
      // NEW: Update existing template
      onUpdateTemplate(editingTemplate.id, templateData);
    } else {
      // Create new template
      onCreateTemplate(templateData);
    }

    handleFormClose();
  };

  const handleFormClose = () => {
    setShowCustomForm(false);
    setSelectedExample(null);
    setFormData({
      title: "",
      description: "",
      date: "",
      venue: "",
      budget: "",
      gigType: "",
      duration: "",
      setlist: "",
    });
    onFormClose();
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleBackToExamples = () => {
    setShowCustomForm(false);
    setSelectedExample(null);
    onFormClose();
  };
  const TemplateForm = () => (
    <div
      className={cn("rounded-2xl p-6", colors.card, colors.border, "border")}
    >
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={handleFormClose}
          className={cn(
            "p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800",
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
                {gigTypes.map((type) => (
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
            onClick={handleBackToExamples}
            className="flex-1"
          >
            {selectedExample ? "Back to Examples" : "Cancel"}
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
            {selectedExample ? "Save Customized Template" : "Save as Template"}
          </Button>
        </div>
      </form>
    </div>
  );

  // Show form directly if in custom mode or guided mode with selected example
  if (showCustomForm) {
    return <TemplateForm />;
  }

  // Guided Mode - Show examples with guidance
  if (mode === "guided") {
    return (
      <div
        className={cn("rounded-2xl p-6", colors.card, colors.border, "border")}
      >
        {/* Guided Header */}
        <div className="text-center mb-8">
          <Lightbulb className="w-16 h-16 mx-auto mb-4 text-amber-500" />
          <h2 className={cn("text-2xl font-bold mb-2", colors.text)}>
            Start with Examples
          </h2>
          <p className={cn("text-lg mb-4", colors.textMuted)}>
            Choose a template below and customize it for your needs
          </p>
        </div>

        {/* Example Templates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {exampleTemplates.map((template) => (
            <div
              key={template.id}
              onClick={() => useExampleTemplate(template)}
              className={cn(
                "border rounded-2xl p-6 cursor-pointer transition-all duration-200 group",
                colors.border,
                colors.hoverBg,
                "hover:border-blue-500 hover:shadow-lg"
              )}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{template.icon}</span>
                  <h3 className={cn("font-bold text-lg", colors.text)}>
                    {template.title}
                  </h3>
                </div>
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

              <Button className="w-full mt-4 bg-blue-500 hover:bg-blue-600">
                Use This Example
              </Button>
            </div>
          ))}
        </div>

        {/* Or create custom option */}
        <div className="text-center">
          <p className={cn("text-sm mb-4", colors.textMuted)}>
            Or create a completely custom template
          </p>
          <Button variant="outline" onClick={handleCustomTemplate}>
            Create Custom Template
          </Button>
        </div>
      </div>
    );
  }

  // Default Mode - Standard view for returning users
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
            Design a reusable gig template to quickly book musicians for similar
            events
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
          {exampleTemplates.map((template) => (
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
              {existingTemplates.length !== 1 ? "s" : ""}. Create variations for
              different event types or musician categories.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
