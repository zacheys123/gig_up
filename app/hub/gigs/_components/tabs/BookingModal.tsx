// app/hub/gigs/_components/tabs/BookingModal.tsx - COMPLETE WITH PROPER TYPING
"use client";

import React, { useState, useMemo, useCallback, memo } from "react";
import { Button } from "@/components/ui/button";
import {
  X,
  Star,
  Crown,
  Calendar,
  MapPin,
  DollarSign,
  Clock,
  Music,
  Check,
  Target,
  Users,
  FileText,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useThemeColors } from "@/hooks/useTheme";
import { GigTemplate } from "@/convex/instantGigsTypes";
import { EnhancedMusician } from "@/types/musician";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  musician: EnhancedMusician | null;
  templates: GigTemplate[];
  onSubmitBooking: (templateId: string) => void;
  isLoading: boolean;
}

// Memoize ModalHeader component
const ModalHeader = memo(
  ({
    onClose,
    musician,
    colors,
  }: {
    onClose: () => void;
    musician: EnhancedMusician | null;
    colors: any;
  }) => (
    <div className="flex items-center justify-between p-6 border-b">
      <div>
        <h2 className={cn("text-2xl font-bold", colors.text)}>
          Request to Book
        </h2>
        <p className={cn("text-sm", colors.textMuted)}>
          Select a template and send booking request to {musician?.firstname}{" "}
          {musician?.lastname}
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="hover:bg-red-50 hover:text-red-600 transition-colors"
      >
        <X className="w-5 h-5" />
      </Button>
    </div>
  )
);

ModalHeader.displayName = "ModalHeader";

// Memoize MusicianInfo component
const MusicianInfo = memo(
  ({ musician, colors }: { musician: EnhancedMusician; colors: any }) => {
    const displayName =
      musician.firstname && musician.lastname
        ? `${musician.firstname} ${musician.lastname}`
        : musician.username || "Musician";

    return (
      <div
        className={cn(
          "rounded-xl p-6 border",
          colors.border,
          "bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20"
        )}
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
              {musician.firstname?.[0]}
              {musician.lastname?.[0] || musician.username?.[0] || "M"}
            </div>
            {musician.verified && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-md">
                <Check className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className={cn("font-bold text-lg", colors.text)}>
                {displayName}
              </h3>
              {musician.tier !== "free" && (
                <Crown className="w-5 h-5 text-amber-500" />
              )}
            </div>
            <p className={cn("text-sm mb-2", colors.textMuted)}>
              {musician.instrument ||
                musician.roleType ||
                "Professional Musician"}
            </p>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className={cn("text-sm font-medium", colors.text)}>
                {musician.avgRating?.toFixed(1) || "New"} •{" "}
                {musician.allreviews?.length || 0} reviews
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-500" />
            <div>
              <div className={cn("text-xs", colors.textMuted)}>Location</div>
              <div className={cn("font-medium", colors.text)}>
                {musician.city || "Nairobi"}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-green-500" />
            <div>
              <div className={cn("text-xs", colors.textMuted)}>Experience</div>
              <div className={cn("font-medium", colors.text)}>
                {musician.completedGigsCount || 0} gigs
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-purple-500" />
            <div>
              <div className={cn("text-xs", colors.textMuted)}>Reliability</div>
              <div className={cn("font-medium", colors.text)}>
                {musician.reliabilityScore || 95}%
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-500" />
            <div>
              <div className={cn("text-xs", colors.textMuted)}>Tier</div>
              <div className={cn("font-medium", colors.text)}>
                {musician.tier?.toUpperCase() || "PRO"}
              </div>
            </div>
          </div>
        </div>

        {musician.musiciangenres && musician.musiciangenres.length > 0 && (
          <div className="mt-4">
            <div className={cn("text-xs font-medium mb-2", colors.textMuted)}>
              Genres
            </div>
            <div className="flex flex-wrap gap-1">
              {musician.musiciangenres
                .slice(0, 3)
                .map((genre: string, index: number) => (
                  <span
                    key={index}
                    className={cn(
                      "px-2 py-1 text-xs rounded-full border",
                      colors.border,
                      "bg-white/50 dark:bg-gray-800/50"
                    )}
                  >
                    {genre}
                  </span>
                ))}
              {musician.musiciangenres.length > 3 && (
                <span className={cn("px-2 py-1 text-xs", colors.textMuted)}>
                  +{musician.musiciangenres.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
);

MusicianInfo.displayName = "MusicianInfo";

// Memoize TemplateList component with auto-scroll
const TemplateList = memo(
  ({
    templates,
    selectedTemplate,
    setSelectedTemplate,
    colors,
  }: {
    templates: GigTemplate[];
    selectedTemplate: string | null;
    setSelectedTemplate: (templateId: string) => void;
    colors: any;
  }) => (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h4 className={cn("font-bold", colors.text)}>Select Template</h4>
        <Badge variant="outline" className={cn("text-xs", colors.textMuted)}>
          {templates.length} available
        </Badge>
      </div>

      {/* Scrollable templates container */}
      <div className="space-y-3 max-h-64 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800">
        {templates.map((template: GigTemplate) => (
          <div
            key={template.id}
            onClick={() => setSelectedTemplate(template.id)}
            className={cn(
              "border rounded-xl p-4 cursor-pointer transition-all duration-200 group",
              colors.border,
              selectedTemplate === template.id
                ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950/20 border-blue-500 shadow-md"
                : cn(
                    colors.hoverBg,
                    "hover:border-blue-300 hover:shadow-sm",
                    "hover:scale-[1.02] transform-gpu"
                  )
            )}
          >
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <span className="text-2xl">{template.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h5 className={cn("font-medium truncate", colors.text)}>
                  {template.title}
                </h5>
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="w-3 h-3 text-gray-500" />
                  <span className={cn("text-xs", colors.textMuted)}>
                    {template.duration}
                  </span>
                  <span className="text-gray-300">•</span>
                  <DollarSign className="w-3 h-3 text-gray-500" />
                  <span className={cn("text-xs font-medium", colors.text)}>
                    {template.budget} KES
                  </span>
                </div>
                {template.gigType && (
                  <div className="mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {template.gigType}
                    </Badge>
                  </div>
                )}
              </div>
              {selectedTemplate === template.id && (
                <div className="flex-shrink-0">
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {templates.length === 0 && (
        <div
          className={cn(
            "text-center py-8 border-2 border-dashed rounded-xl",
            colors.border
          )}
        >
          <Music className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p className={cn("text-sm mb-2", colors.textMuted)}>
            No templates available
          </p>
          <p className={cn("text-xs", colors.textMuted)}>
            Create a template first to book this musician
          </p>
        </div>
      )}
    </div>
  )
);

TemplateList.displayName = "TemplateList";

// COMPLETE TemplatePreview component with gig type context
const TemplatePreview = memo(
  ({
    selectedTemplateData,
    musician,
    colors,
  }: {
    selectedTemplateData: GigTemplate | undefined;
    musician: EnhancedMusician;
    colors: any;
  }) => {
    if (!selectedTemplateData) {
      return (
        <div
          className={cn(
            "rounded-xl p-8 text-center border-2 border-dashed",
            colors.border
          )}
        >
          <Music className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p className={cn("text-sm", colors.textMuted)}>
            Select a template to preview booking details
          </p>
        </div>
      );
    }

    // Get gig-type specific rate
    const gigTypeRate = musician.displayRate;
    const isOptimal = musician.isOptimalForGigType;
    const compatibilityScore = musician.gigTypeCompatibility;

    return (
      <div
        className={cn(
          "rounded-xl p-6 border",
          colors.border,
          "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20"
        )}
      >
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">{selectedTemplateData.icon}</span>
          <div className="flex-1">
            <h5 className={cn("font-bold text-lg", colors.text)}>
              {selectedTemplateData.title}
            </h5>
            <p className={cn("text-sm", colors.textMuted)}>
              {selectedTemplateData.gigType} • {selectedTemplateData.duration}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Date */}
          {selectedTemplateData.date && (
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-blue-500" />
              <div>
                <div className={cn("text-xs", colors.textMuted)}>
                  Event Date
                </div>
                <div className={cn("font-medium", colors.text)}>
                  {selectedTemplateData.date}
                </div>
              </div>
            </div>
          )}

          {/* Venue */}
          {selectedTemplateData.venue && (
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-red-500" />
              <div>
                <div className={cn("text-xs", colors.textMuted)}>Venue</div>
                <div className={cn("font-medium", colors.text)}>
                  {selectedTemplateData.venue}
                </div>
              </div>
            </div>
          )}

          {/* Duration */}
          <div className="flex items-center gap-3">
            <Clock className="w-4 h-4 text-green-500" />
            <div>
              <div className={cn("text-xs", colors.textMuted)}>Duration</div>
              <div className={cn("font-medium", colors.text)}>
                {selectedTemplateData.duration}
              </div>
            </div>
          </div>

          {/* Enhanced Rate Display with Gig Type Context */}
          <div className="flex items-center gap-3">
            <DollarSign className="w-4 h-4 text-amber-500" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <div className={cn("text-xs", colors.textMuted)}>
                  Rate for {selectedTemplateData.gigType}
                </div>
                {isOptimal && (
                  <Badge className="bg-green-500 text-white text-xs">
                    Optimal Match
                  </Badge>
                )}
              </div>
              <div className={cn("font-bold text-lg", colors.text)}>
                {gigTypeRate}
              </div>
              {compatibilityScore && (
                <div className={cn("text-xs mt-1", colors.textMuted)}>
                  {compatibilityScore}% compatibility with this event type
                </div>
              )}
            </div>
          </div>

          {/* Setlist */}
          {selectedTemplateData.setlist && (
            <div className="flex items-start gap-3">
              <Music className="w-4 h-4 text-purple-500 mt-1" />
              <div>
                <div className={cn("text-xs", colors.textMuted)}>Setlist</div>
                <div className={cn("text-sm mt-1", colors.text)}>
                  {selectedTemplateData.setlist}
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          {selectedTemplateData.description && (
            <div className="pt-4 border-t">
              <div className={cn("text-xs font-medium mb-2", colors.textMuted)}>
                Description
              </div>
              <p className={cn("text-sm leading-relaxed", colors.text)}>
                {selectedTemplateData.description}
              </p>
            </div>
          )}

          {/* Compatibility Indicator */}
          {selectedTemplateData.gigType && (
            <div
              className={cn(
                "mt-4 p-3 rounded-lg border",
                isOptimal
                  ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
                  : "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800"
              )}
            >
              <div className="flex items-start gap-2 text-sm">
                {isOptimal ? (
                  <>
                    <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className={colors.text}>
                      <strong>Perfect match!</strong> This musician specializes
                      in {selectedTemplateData.gigType} events and has high
                      compatibility with your requirements.
                    </span>
                  </>
                ) : (
                  <>
                    <Target className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span className={colors.text}>
                      <strong>Good match</strong> for{" "}
                      {selectedTemplateData.gigType} events. This musician has
                      relevant experience for your event type.
                    </span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
);

TemplatePreview.displayName = "TemplatePreview";

// Memoize ActionButtons component
const ActionButtons = memo(
  ({
    onClose,
    selectedTemplate,
    onSubmitBooking,
    isLoading,
    colors,
  }: {
    onClose: () => void;
    selectedTemplate: string | null;
    onSubmitBooking: (templateId: string) => void;
    isLoading: boolean;
    colors: any;
  }) => (
    <div className="flex gap-3 pt-4 border-t">
      <Button
        variant="outline"
        onClick={onClose}
        className="flex-1"
        disabled={isLoading}
      >
        Cancel
      </Button>
      <Button
        onClick={() => selectedTemplate && onSubmitBooking(selectedTemplate)}
        disabled={!selectedTemplate || isLoading}
        className={cn(
          "flex-1 transition-all duration-200",
          selectedTemplate && !isLoading
            ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg hover:shadow-xl"
            : "bg-gray-400 cursor-not-allowed"
        )}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Sending Request...
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4" />
            Send Booking Request
          </div>
        )}
      </Button>
    </div>
  )
);

ActionButtons.displayName = "ActionButtons";

export const BookingModal: React.FC<BookingModalProps> = memo(
  ({ isOpen, onClose, musician, templates, onSubmitBooking, isLoading }) => {
    const { colors } = useThemeColors();
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(
      null
    );

    // Memoize selected template data
    const selectedTemplateData = useMemo(
      () => templates.find((t) => t.id === selectedTemplate),
      [templates, selectedTemplate]
    );

    // Memoize event handlers
    const handleSetSelectedTemplate = useCallback((templateId: string) => {
      setSelectedTemplate(templateId);
    }, []);

    const handleSubmit = useCallback(() => {
      if (selectedTemplate) {
        onSubmitBooking(selectedTemplate);
      }
    }, [selectedTemplate, onSubmitBooking]);

    // Reset selected template when modal closes
    const handleClose = useCallback(() => {
      setSelectedTemplate(null);
      onClose();
    }, [onClose]);

    if (!isOpen || !musician) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div
          className={cn(
            "rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col",
            colors.card,
            colors.border,
            "border shadow-2xl"
          )}
        >
          <ModalHeader
            onClose={handleClose}
            musician={musician}
            colors={colors}
          />

          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
              {/* Left Column - Musician Info and Templates */}
              <div className="space-y-6">
                <MusicianInfo musician={musician} colors={colors} />
                <TemplateList
                  templates={templates}
                  selectedTemplate={selectedTemplate}
                  setSelectedTemplate={handleSetSelectedTemplate}
                  colors={colors}
                />
              </div>

              {/* Right Column - Template Preview */}
              <div className="space-y-6">
                <div>
                  <h4 className={cn("font-bold text-lg mb-4", colors.text)}>
                    Booking Summary
                  </h4>
                  <TemplatePreview
                    selectedTemplateData={selectedTemplateData}
                    musician={musician}
                    colors={colors}
                  />
                </div>

                <ActionButtons
                  onClose={handleClose}
                  selectedTemplate={selectedTemplate}
                  onSubmitBooking={handleSubmit}
                  isLoading={isLoading}
                  colors={colors}
                />
              </div>
            </div>
          </div>

          {/* Footer with additional info */}
          <div
            className={cn(
              "p-4 border-t text-center",
              colors.border,
              colors.backgroundMuted
            )}
          >
            <p className={cn("text-xs", colors.textMuted)}>
              💡 Pro tip: Musicians respond faster to detailed templates with
              clear requirements
            </p>
          </div>
        </div>
      </div>
    );
  }
);

BookingModal.displayName = "BookingModal";
