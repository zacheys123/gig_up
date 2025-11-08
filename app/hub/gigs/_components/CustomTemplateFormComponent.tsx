// app/hub/gigs/_components/CustomTemplateForm.tsx - OPTIMIZED
"use client";

import React, { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { X, Music, Calendar, MapPin, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { useThemeColors } from "@/hooks/useTheme";

interface CustomTemplateFormProps {
  user: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

// Memoize gig types to prevent recreation
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
  { value: "other", label: "✨ Other" },
];

export const CustomTemplateForm: React.FC<CustomTemplateFormProps> = React.memo(
  ({ user, onSubmit, onCancel, isLoading = false }) => {
    const { colors } = useThemeColors();
    const [formData, setFormData] = useState({
      title: "",
      description: "",
      date: "",
      venue: "",
      budget: "",
      gigType: "",
      setlist: "",
    });

    // Memoize form submission handler
    const handleSubmit = useCallback(
      (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
      },
      [formData, onSubmit]
    );

    // Memoize field change handler
    const handleChange = useCallback((field: string, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }, []);

    // Memoize form validation
    const isFormValid = useMemo(() => {
      return (
        formData.title &&
        formData.gigType &&
        formData.date &&
        formData.venue &&
        formData.budget &&
        formData.description
      );
    }, [formData]);

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className={cn("text-2xl font-bold", colors.text)}>
            Create Custom Gig Template
          </h3>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Gig Title */}
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

          {/* Gig Type */}
          <div className="space-y-2">
            <Label className={cn("text-sm font-medium", colors.text)}>
              Gig Type *
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
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

          {/* Date and Venue */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                required
                className={cn(colors.border, "focus:ring-blue-500")}
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="venue"
                className={cn("text-sm font-medium", colors.text)}
              >
                <MapPin className="w-4 h-4 inline mr-2" />
                Venue *
              </Label>
              <Input
                id="venue"
                placeholder="e.g., Nairobi National Theatre"
                value={formData.venue}
                onChange={(e) => handleChange("venue", e.target.value)}
                required
                className={cn(colors.border, "focus:ring-blue-500")}
              />
            </div>
          </div>

          {/* Budget */}
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
              type="text"
              placeholder="e.g., 25,000"
              value={formData.budget}
              onChange={(e) => handleChange("budget", e.target.value)}
              required
              className={cn(colors.border, "focus:ring-blue-500")}
            />
            <p className={cn("text-xs", colors.textMuted)}>
              Enter the total budget in Kenyan Shillings
            </p>
          </div>

          {/* Description */}
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
              rows={4}
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              required
              className={cn(colors.border, "focus:ring-blue-500")}
            />
          </div>

          {/* Setlist (Optional) */}
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
              rows={3}
              value={formData.setlist}
              onChange={(e) => handleChange("setlist", e.target.value)}
              className={cn(colors.border, "focus:ring-blue-500")}
            />
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-purple-500 hover:bg-purple-600"
              disabled={isLoading || !isFormValid}
            >
              {isLoading ? "Creating..." : "Create Custom Template"}
            </Button>
          </div>
        </form>
      </div>
    );
  }
);

CustomTemplateForm.displayName = "CustomTemplateForm";
