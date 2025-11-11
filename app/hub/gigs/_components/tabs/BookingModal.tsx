// app/hub/gigs/_components/tabs/BookingModal.tsx - ENHANCED WITH PRO TAB METRICS
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
  Award,
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
  musicians?: EnhancedMusician[];
}

// Import the same configuration from ProMusiciansTab
const TIER_CONFIG = {
  elite: {
    label: "Elite",
    color: "bg-yellow-500 text-yellow-900",
    icon: Crown,
  },
  premium: {
    label: "Premium",
    color: "bg-purple-500 text-purple-900",
    icon: Zap,
  },
  pro: { label: "Pro", color: "bg-blue-500 text-blue-900", icon: Star },
  free: { label: "Free", color: "bg-gray-500 text-gray-900", icon: null },
};

const INSTRUMENT_ICONS: Record<string, string> = {
  // Strings
  violin: "🎻",
  viola: "🎻",
  cello: "🎻",
  "double bass": "🎻",
  harp: "🎵",
  guitar: "🎸",
  bass: "🎸",
  "electric guitar": "🎸",
  "acoustic guitar": "🎸",
  ukulele: "🎵",
  mandolin: "🎵",
  banjo: "🎵",
  // Woodwinds
  flute: "🎵",
  clarinet: "🎷",
  saxophone: "🎷",
  oboe: "🎵",
  bassoon: "🎵",
  recorder: "🎵",
  // Brass
  trumpet: "🎺",
  trombone: "🎺",
  "french horn": "🎺",
  tuba: "🎺",
  cornet: "🎺",
  flugelhorn: "🎺",
  // Percussion
  drums: "🥁",
  percussion: "🥁",
  djembe: "🥁",
  congas: "🥁",
  bongos: "🥁",
  marimba: "🎵",
  xylophone: "🎵",
  timpani: "🥁",
  cymbals: "🥁",
  triangle: "🎵",
  tambourine: "🥁",
  // Keyboards
  piano: "🎹",
  keyboard: "🎹",
  organ: "🎹",
  synthesizer: "🎹",
  accordion: "🎵",
  harpsichord: "🎹",
  // Vocals
  vocalist: "🎤",
  soprano: "🎤",
  alto: "🎤",
  tenor: "🎤",
  "backing vocals": "🎤",
  choir: "👥",
  // Electronic
  dj: "🎧",
  producer: "🎧",
  electronic: "🎧",
  "drum machine": "🎧",
  sampler: "🎧",
  controller: "🎧",
  // Default fallback
  default: "🎵",
};

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
    <div className="flex items-center justify-between p-4 border-b">
      <div>
        <h2 className={cn("text-lg font-bold", colors.text)}>Book Musician</h2>
        <p className={cn("text-xs", colors.textMuted)}>
          Select template and confirm booking
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="w-8 h-8 hover:bg-red-50 hover:text-red-600"
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  )
);

ModalHeader.displayName = "ModalHeader";

const MusicianCard = memo(
  ({
    musician,
    isSelected,
    onSelect,
    selectedGigType,
  }: {
    musician: EnhancedMusician;
    isSelected: boolean;
    onSelect: () => void;
    selectedGigType?: string;
  }) => {
    const { colors, isDarkMode } = useThemeColors();

    const displayName =
      musician.firstname && musician.lastname
        ? `${musician.firstname} ${musician.lastname}`
        : musician.username || "Musician";

    const instrument =
      musician.instrument || musician.roleType || "Professional Musician";
    const rating = musician.avgRating?.toFixed(1) || "New";
    const gigsCount = musician.completedGigsCount || 0;
    const city = musician.city || "Nairobi";
    const reliability = musician.reliabilityScore || 0;

    const getInitials = (name: string) => {
      return name
        .split(" ")
        .map((part) => part.charAt(0))
        .join("")
        .toUpperCase()
        .slice(0, 2);
    };

    const getTierBadge = (tier: string) => {
      const config =
        TIER_CONFIG[tier as keyof typeof TIER_CONFIG] || TIER_CONFIG.free;
      const Icon = config.icon;
      return (
        <div
          className={cn(
            "flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-semibold border",
            tier === "pro"
              ? "bg-gradient-to-r from-amber-400 to-orange-400 text-amber-900 border-amber-300 dark:border-amber-600"
              : tier === "premium"
                ? "bg-gradient-to-r from-purple-400 to-pink-400 text-purple-900 border-purple-300 dark:border-purple-600"
                : cn(colors.warningBg, colors.warningBorder, colors.text)
          )}
        >
          {Icon && <Icon className="w-2.5 h-2.5" />}
          {config.label}
        </div>
      );
    };

    const instrumentIcon = musician.instrument
      ? INSTRUMENT_ICONS[musician.instrument.toLowerCase()] || "🎵"
      : "🎵";

    // Enhanced tags with compatibility
    const tags = useMemo(() => {
      const tagList = [];

      // Show compatibility warning first if incompatible
      if (selectedGigType && musician.isCompatible === false) {
        tagList.push("Not Typical");
      }

      if (musician.verified) tagList.push("Verified");
      if (musician.completedGigsCount && musician.completedGigsCount > 10)
        tagList.push("Experienced");
      if (musician.reliabilityScore && musician.reliabilityScore > 90)
        tagList.push("Reliable");
      if (musician.avgRating && musician.avgRating > 4.5)
        tagList.push("Top Rated");
      if (musician.isOptimalForGigType) tagList.push("Optimal");
      return tagList.slice(0, 2); // Show only 2 most important tags
    }, [musician, selectedGigType]);

    return (
      <div
        onClick={onSelect}
        className={cn(
          "border rounded-lg p-3 transition-all duration-200 group cursor-pointer",
          "flex items-center gap-3 max-w-[95%]", // Compact flex layout
          colors.card,
          colors.border,
          // Dim incompatible musicians
          selectedGigType &&
            musician.isCompatible === false &&
            "opacity-60 grayscale-[20%]",
          isSelected
            ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950/20 border-blue-500 shadow-lg"
            : cn(
                colors.hoverBg,
                "hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md",
                "hover:scale-[1.02] transform-gpu",
                musician.isOptimalForGigType &&
                  "ring-1 ring-green-500 dark:ring-green-400 ring-opacity-50"
              )
        )}
      >
        {/* Compact Avatar */}
        <div className="flex-shrink-0 relative">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm">
            {getInitials(displayName)}
          </div>
          {musician.verified && (
            <div
              className={cn(
                "absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center shadow-sm border",
                colors.textInverted,
                colors.border
              )}
            >
              <Check className="w-2 h-2" />
            </div>
          )}
          {/* Optimal Match Dot */}
          {musician.isOptimalForGigType && (
            <div
              className={cn(
                "absolute -top-1 -left-1 w-2 h-2 bg-green-500 rounded-full border shadow-sm",
                colors.border
              )}
            ></div>
          )}
          {/* Compatibility Warning Dot */}
          {selectedGigType && musician.isCompatible === false && (
            <div
              className={cn(
                "absolute -top-1 -left-1 w-2 h-2 bg-amber-500 rounded-full border shadow-sm",
                colors.border
              )}
            ></div>
          )}
        </div>

        {/* Compact Info */}
        <div className="flex-1 min-w-0">
          {/* Header Row */}
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <h4 className={cn("font-semibold text-sm truncate", colors.text)}>
                {displayName}
              </h4>
              {musician.tier !== "free" && (
                <Crown className="w-3 h-3 text-amber-500 flex-shrink-0" />
              )}
              {isSelected && (
                <Check className="w-3 h-3 text-blue-500 dark:text-blue-400 flex-shrink-0" />
              )}
            </div>

            {/* Rate Display */}
            <div
              className={cn(
                "font-bold text-sm flex-shrink-0 ml-2",
                colors.text
              )}
            >
              <span className={colors.textMuted}>MyRate</span> &nbsp;
              {musician.displayRate}$
              {selectedGigType && musician.isCompatible === false && (
                <div className={cn("text-xs", colors.warningText)}>
                  Atypical
                </div>
              )}
            </div>
          </div>

          {/* Instrument and Rating */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm">{instrumentIcon}</span>
            <span
              className={cn(
                "text-xs font-medium truncate flex-1",
                colors.textMuted,
                selectedGigType &&
                  musician.isCompatible === false &&
                  colors.warningText
              )}
            >
              {instrument}
              {selectedGigType &&
                musician.isCompatible === false &&
                " • Unconventional"}
            </span>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className={cn("text-xs font-medium", colors.text)}>
                {rating}
              </span>
            </div>
          </div>

          {/* Stats and Tags Row */}
          <div className="flex items-center justify-between">
            {/* Location and Experience */}
            <div className="flex items-center gap-3 text-xs flex-1">
              <div className="flex items-center gap-1">
                <MapPin className={cn("w-3 h-3", colors.primary)} />
                <span className={colors.textMuted}>{city}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className={cn("w-3 h-3", colors.successText)} />
                <span className={colors.textMuted}>{gigsCount} gigs</span>
              </div>
              {reliability > 0 && (
                <div className="flex items-center gap-1">
                  <Zap className={cn("w-3 h-3", colors.infoText)} />
                  <span className={colors.textMuted}>{reliability}%</span>
                </div>
              )}
            </div>

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className={cn(
                      "px-1.5 py-0.5 text-xs rounded-full font-medium",
                      tag === "Not Typical"
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                        : colors.warningBg,
                      colors.warningBorder,
                      colors.text
                    )}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Bottom Row - Tier and Compatibility */}
          <div className="flex items-center justify-between mt-1">
            {/* Tier Badge */}
            {getTierBadge(musician.tier)}

            {/* Compatibility Badge */}
            {musician.gigTypeCompatibility && (
              <div
                className={cn(
                  "flex-shrink-0 px-2 py-1 rounded-full text-xs font-bold border",
                  musician.isCompatible === false
                    ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                    : musician.gigTypeCompatibility >= 80
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800"
                      : musician.gigTypeCompatibility >= 60
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                        : cn(
                            colors.warningBg,
                            colors.warningBorder,
                            colors.text
                          )
                )}
              >
                {musician.gigTypeCompatibility}% Match
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);
MusicianCard.displayName = "MusicianCard";
// TemplateList Component
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
      <div className="flex items-center justify-between mb-3">
        <h4 className={cn("font-bold text-sm", colors.text)}>
          Select Template
        </h4>
        <Badge variant="outline" className={cn("text-xs", colors.textMuted)}>
          {templates.length} available
        </Badge>
      </div>

      <div className="space-y-2 max-h-40 overflow-y-auto pr-2 scrollbar-thin">
        {templates.map((template: GigTemplate) => (
          <div
            key={template.id}
            onClick={() => setSelectedTemplate(template.id)}
            className={cn(
              "border rounded-lg p-3 cursor-pointer transition-all duration-200",
              colors.border,
              selectedTemplate === template.id
                ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950/20 border-blue-500"
                : cn(colors.card, "hover:border-blue-300 hover:shadow-sm")
            )}
          >
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <span className="text-lg">{template.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h5 className={cn("font-medium text-sm truncate", colors.text)}>
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
                <Check className="w-4 h-4 text-blue-500 flex-shrink-0" />
              )}
            </div>
          </div>
        ))}
      </div>

      {templates.length === 0 && (
        <div
          className={cn(
            "text-center py-6 border-2 border-dashed rounded-lg",
            colors.border
          )}
        >
          <Music className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className={cn("text-sm", colors.textMuted)}>
            No templates available
          </p>
        </div>
      )}
    </div>
  )
);

TemplateList.displayName = "TemplateList";

// TemplatePreview Component
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
            "rounded-xl p-6 text-center border-2 border-dashed",
            colors.border
          )}
        >
          <Music className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className={cn("text-sm", colors.textMuted)}>
            Select a template to preview booking details
          </p>
        </div>
      );
    }

    const gigTypeRate = musician.displayRate;
    const isOptimal = musician.isOptimalForGigType;
    const compatibilityScore = musician.gigTypeCompatibility;

    return (
      <div
        className={cn(
          "rounded-xl p-4 border",
          colors.border,
          "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20"
        )}
      >
        <div className="flex items-center gap-3 mb-3">
          <span className="text-xl">{selectedTemplateData.icon}</span>
          <div className="flex-1">
            <h5 className={cn("font-bold text-sm", colors.text)}>
              {selectedTemplateData.title}
            </h5>
            <p className={cn("text-xs", colors.textMuted)}>
              {selectedTemplateData.gigType} • {selectedTemplateData.duration}
            </p>
          </div>
        </div>

        <div className="space-y-3 text-sm">
          {/* Date */}
          {selectedTemplateData.date && (
            <div className="flex items-center gap-2">
              <Calendar className="w-3 h-3 text-blue-500" />
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

          {/* Duration & Budget */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Clock className="w-3 h-3 text-green-500" />
              <div>
                <div className={cn("text-xs", colors.textMuted)}>Duration</div>
                <div className={cn("font-medium", colors.text)}>
                  {selectedTemplateData.duration}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-3 h-3 text-amber-500" />
              <div>
                <div className={cn("text-xs", colors.textMuted)}>Budget</div>
                <div className={cn("font-bold", colors.text)}>
                  {selectedTemplateData.budget} KES
                </div>
              </div>
            </div>
          </div>

          {/* Rate & Compatibility */}
          <div className="flex items-center gap-2">
            <DollarSign className="w-3 h-3 text-amber-500" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <div className={cn("text-xs", colors.textMuted)}>
                  Musician's Rate
                </div>
                {isOptimal && (
                  <Badge className="bg-green-500 text-white text-xs">
                    Optimal Match
                  </Badge>
                )}
              </div>
              <div className={cn("font-bold", colors.text)}>{gigTypeRate}</div>
              {compatibilityScore && (
                <div className={cn("text-xs mt-1", colors.textMuted)}>
                  {compatibilityScore}% compatibility
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {selectedTemplateData.description && (
            <div className="pt-2 border-t">
              <div className={cn("text-xs font-medium mb-1", colors.textMuted)}>
                Description
              </div>
              <p className={cn("text-xs leading-relaxed", colors.text)}>
                {selectedTemplateData.description}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }
);

TemplatePreview.displayName = "TemplatePreview";

// ActionButtons Component
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
    <div className="flex gap-2 pt-3 border-t">
      <Button
        variant="outline"
        onClick={onClose}
        className="flex-1 text-sm"
        disabled={isLoading}
        size="sm"
      >
        Cancel
      </Button>
      <Button
        onClick={() => selectedTemplate && onSubmitBooking(selectedTemplate)}
        disabled={!selectedTemplate || isLoading}
        className={cn(
          "flex-1 text-sm transition-all duration-200",
          selectedTemplate && !isLoading
            ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
            : "bg-gray-400 cursor-not-allowed"
        )}
        size="sm"
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Sending...
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Award className="w-3 h-3" />
            Send Request
          </div>
        )}
      </Button>
    </div>
  )
);

ActionButtons.displayName = "ActionButtons";

// Main BookingModal Component - WITH NUMBERED STEPS
export const BookingModal: React.FC<BookingModalProps> = memo(
  ({
    isOpen,
    onClose,
    musician,
    templates,
    onSubmitBooking,
    isLoading,
    musicians = [],
  }) => {
    const { colors } = useThemeColors();
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(
      null
    );
    const [selectedMusician, setSelectedMusician] =
      useState<EnhancedMusician | null>(null);
    const [showMusicianList, setShowMusicianList] = useState(false);

    const selectedTemplateData = useMemo(
      () => templates.find((t) => t.id === selectedTemplate),
      [templates, selectedTemplate]
    );

    const handleSubmit = useCallback(() => {
      if (selectedTemplate && selectedMusician) {
        onSubmitBooking(selectedTemplate);
      }
    }, [selectedTemplate, selectedMusician, onSubmitBooking]);

    const handleClose = useCallback(() => {
      setSelectedTemplate(null);
      setSelectedMusician(null);
      setShowMusicianList(false);
      onClose();
    }, [onClose]);

    // Clean reset - no pre-selection
    React.useEffect(() => {
      if (isOpen) {
        setSelectedTemplate(null);
        setSelectedMusician(null);
        setShowMusicianList(false);
      }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div
          className={cn(
            "rounded-xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col",
            colors.card,
            colors.border,
            "border shadow-2xl"
          )}
        >
          <ModalHeader
            onClose={handleClose}
            musician={selectedMusician}
            colors={colors}
          />

          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
              {/* Left Column - Selection */}
              <div className="space-y-4">
                {/* STEP 1: Template Selection (Always Visible) */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className={cn("font-bold text-sm", colors.text)}>
                      1. Select Template
                    </h4>
                    <Badge
                      variant="outline"
                      className={cn("text-xs", colors.textMuted)}
                    >
                      {templates.length} available
                    </Badge>
                  </div>

                  <TemplateList
                    templates={templates}
                    selectedTemplate={selectedTemplate}
                    setSelectedTemplate={setSelectedTemplate}
                    colors={colors}
                  />
                </div>

                {/* STEP 2: Musician Selection (Only shown after template is selected) */}
                {selectedTemplate && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className={cn("font-bold text-sm", colors.text)}>
                        2. Select Musician
                      </h4>
                      <Badge
                        variant="outline"
                        className={cn("text-xs", colors.textMuted)}
                      >
                        {musicians.length} available
                      </Badge>
                    </div>

                    {/* Selected Musician Preview (ONLY shown after user manually selects a musician) */}
                    {selectedMusician && (
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className={cn(
                              "text-xs font-medium",
                              colors.textMuted
                            )}
                          >
                            Selected Musician:
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedMusician(null);
                              setShowMusicianList(true);
                            }}
                            className="text-xs h-6 px-2"
                          >
                            Change
                          </Button>
                        </div>
                        <MusicianCard
                          musician={selectedMusician}
                          isSelected={true}
                          onSelect={() => setShowMusicianList(true)}
                        />
                      </div>
                    )}

                    {/* Musician List (shown when "Choose Musician" button is clicked) */}
                    {showMusicianList && (
                      <div className="space-y-2 max-h-64 overflow-y-auto pr-2 scrollbar-thin">
                        {musicians.length > 0 ? (
                          musicians.map((m) => (
                            <MusicianCard
                              key={m._id}
                              musician={m}
                              isSelected={selectedMusician?._id === m._id}
                              onSelect={() => {
                                setSelectedMusician(m);
                                setShowMusicianList(false);
                              }}
                            />
                          ))
                        ) : (
                          <div
                            className={cn(
                              "text-center py-8 border-2 border-dashed rounded-lg",
                              colors.border
                            )}
                          >
                            <Users className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                            <p className={cn("text-sm", colors.textMuted)}>
                              No musicians available
                            </p>
                            <p className={cn("text-xs mt-1", colors.textMuted)}>
                              Please check back later
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Choose Musician Button (shown when template is selected but no musician chosen yet) */}
                    {!selectedMusician && !showMusicianList && (
                      <Button
                        variant="outline"
                        onClick={() => setShowMusicianList(true)}
                        className={cn(
                          "w-full border-2 border-dashed hover:border-solid",
                          colors.border,
                          colors.hoverBg
                        )}
                        size="sm"
                      >
                        <Users className="w-4 h-4 mr-2" />
                        Choose Musician
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {/* Right Column - Preview */}
              <div className="space-y-4">
                <div>
                  <h4 className={cn("font-bold text-sm mb-3", colors.text)}>
                    {selectedTemplate && selectedMusician
                      ? "3. Booking Summary"
                      : selectedTemplate
                        ? "2. Choose a Musician"
                        : "1. Select a Template"}
                  </h4>

                  {selectedTemplate && selectedMusician ? (
                    <TemplatePreview
                      selectedTemplateData={selectedTemplateData}
                      musician={selectedMusician}
                      colors={colors}
                    />
                  ) : selectedTemplate ? (
                    <div
                      className={cn(
                        "rounded-xl p-6 text-center border-2 border-dashed",
                        colors.border,
                        "bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20"
                      )}
                    >
                      <Users className="w-12 h-12 mx-auto mb-3 text-amber-400" />
                      <h5 className={cn("font-semibold mb-2", colors.text)}>
                        Step 2: Choose a Musician
                      </h5>
                      <p className={cn("text-sm", colors.textMuted)}>
                        Click "Choose Musician" to browse available musicians
                        for your selected template
                      </p>
                    </div>
                  ) : (
                    <div
                      className={cn(
                        "rounded-xl p-6 text-center border-2 border-dashed",
                        colors.border,
                        "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20"
                      )}
                    >
                      <Music className="w-12 h-12 mx-auto mb-3 text-blue-400" />
                      <h5 className={cn("font-semibold mb-2", colors.text)}>
                        Step 1: Select a Template
                      </h5>
                      <p className={cn("text-sm", colors.textMuted)}>
                        Choose a template from the left to begin the booking
                        process
                      </p>
                    </div>
                  )}
                </div>

                {/* STEP 3: Action Buttons (Only shown when both template and musician are selected) */}
                {selectedTemplate && selectedMusician && (
                  <div>
                    <h4 className={cn("font-bold text-sm mb-3", colors.text)}>
                      3. Confirm Booking
                    </h4>
                    <ActionButtons
                      onClose={handleClose}
                      selectedTemplate={selectedTemplate}
                      onSubmitBooking={handleSubmit}
                      isLoading={isLoading}
                      colors={colors}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Contextual Footer */}
          <div
            className={cn(
              "p-3 border-t text-center",
              colors.border,
              colors.backgroundMuted
            )}
          >
            <p className={cn("text-xs", colors.textMuted)}>
              {selectedTemplate && selectedMusician
                ? "3. Ready to book! Review details and send request"
                : selectedTemplate
                  ? "2. Click 'Choose Musician' to select an artist"
                  : "1. Start by selecting a template above"}
            </p>
          </div>
        </div>
      </div>
    );
  }
);

BookingModal.displayName = "BookingModal";
