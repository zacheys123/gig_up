// app/hub/gigs/_components/tabs/ProMusiciansTab.tsx - COMPLETE OPTIMIZED VERSION
"use client";

import React, { useState, useMemo, useCallback, memo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Star,
  Crown,
  MapPin,
  Music,
  Award,
  Check,
  Eye,
  Search,
  Zap,
  Target,
  Filter,
  X,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useThemeColors } from "@/hooks/useTheme";
import { useProMusicians, useMusicianSearch } from "@/hooks/useProMusicians";
import { EnhancedMusician } from "@/types/musician";
import { Skeleton } from "@/components/ui/skeleton";
import { GIG_TYPES } from "@/convex/gigTypes";
import { TrustStarsDisplay } from "@/components/trust/TrustStarsDisplay";
import { TrustBasedRateDisplay } from "@/components/trust/TrustStars";

interface ProMusiciansTabProps {
  onRequestToBook: (musician: EnhancedMusician) => void;
  user: any;
  hasTemplates: boolean;
}

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
  pro: { label: "Pro", color: "bg-blue-500 text-white", icon: Star },
  free: { label: "Free", color: "bg-gray-300 text-gray-900", icon: null },
};

const CITIES = ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret"];
const INSTRUMENTS = [
  // Strings
  "violin",
  "viola",
  "cello",
  "double bass",
  "harp",
  "guitar",
  "bass",
  "electric guitar",
  "acoustic guitar",
  "ukulele",
  "mandolin",
  "banjo",

  // Woodwinds
  "flute",
  "clarinet",
  "saxophone",
  "oboe",
  "bassoon",
  "recorder",

  // Brass
  "trumpet",
  "trombone",
  "french horn",
  "tuba",
  "cornet",
  "flugelhorn",

  // Percussion
  "drums",
  "percussion",
  "djembe",
  "congas",
  "bongos",
  "marimba",
  "xylophone",
  "timpani",
  "cymbals",
  "triangle",
  "tambourine",

  // Keyboards
  "piano",
  "keyboard",
  "organ",
  "synthesizer",
  "accordion",
  "harpsichord",

  // Vocals
  "vocalist",
  "soprano",
  "alto",
  "tenor",
  "backing vocals",
  "choir",

  // Electronic
  "dj",
  "producer",
  "electronic",
  "drum machine",
  "sampler",
  "controller",

  // World Instruments
  "sitar",
  "tabla",
  "kora",
  "didgeridoo",
  "steel drums",
  "kalimba",
  "erhu",
  "shakuhachi",
  "bagpipes",

  // Ensembles & Roles
  "string quartet",
  "jazz trio",
  "band",
  "orchestra",
  "mc",
  "conductor",
  "composer",
  "music director",
  "session musician",
  "entertainer",
];
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

  // World Instruments
  sitar: "🎵",
  tabla: "🥁",
  kora: "🎵",
  didgeridoo: "🎵",
  "steel drums": "🥁",
  kalimba: "🎵",
  erhu: "🎻",
  shakuhachi: "🎵",
  bagpipes: "🎵",

  // Ensembles & Roles
  "string quartet": "🎻",
  "jazz trio": "🎷",
  band: "🎸",
  orchestra: "🎵",
  mc: "🎤",
  conductor: "🎼",
  composer: "🎼",
  "music director": "🎼",
  "session musician": "🎵",
  entertainer: "🎭",

  // Default fallback
  default: "🎵",
};

// Skeleton Loader Component
const MusicianCardSkeleton = memo(() => (
  <div className="rounded-2xl p-6 border border-gray-200 dark:border-gray-700 animate-pulse">
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-full"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-24"></div>
          <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded w-16"></div>
        </div>
      </div>
      <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded w-16"></div>
    </div>
    <div className="space-y-3">
      <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded w-3/4"></div>
      <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded w-1/2"></div>
      <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded"></div>
    </div>
  </div>
));

MusicianCardSkeleton.displayName = "MusicianCardSkeleton";

// Memoize MusicianCard component with proper typing
const MusicianCard = memo(
  ({
    musician,
    onRequestToBook,
    getTierBadge,
    selectedGigType,
  }: {
    musician: EnhancedMusician;
    onRequestToBook: (musician: EnhancedMusician) => void;
    getTierBadge: (tier: string) => React.ReactNode;
    selectedGigType?: string;
  }) => {
    const { colors } = useThemeColors();

    const displayName = useMemo(
      () =>
        musician.firstname && musician.lastname
          ? `${musician.firstname} ${musician.lastname}`
          : musician.username || "Musician",
      [musician.firstname, musician.lastname, musician.username]
    );

    const displayGenres = useMemo(
      () =>
        musician.musiciangenres ||
        [musician.musiciangenres || "Various Genres"].filter(Boolean),
      [musician.musiciangenres, musician.musiciangenres]
    );

    // Enhanced tags with gigType context and compatibility
    const tags = useMemo(() => {
      const tagList = [];

      // Show compatibility warning first if incompatible
      if (selectedGigType && musician.isCompatible === false) {
        tagList.push("Not Typical");
      }

      // Priority tags based on gigType matching
      if (musician.isOptimalForGigType) tagList.push("Optimal Match");
      if (musician.verified) tagList.push("Verified");

      // Experience tags
      if (musician.completedGigsCount && musician.completedGigsCount > 10)
        tagList.push("Experienced");
      if (musician.completedGigsCount && musician.completedGigsCount > 50)
        tagList.push("Veteran");

      // Performance tags
      if (musician.reliabilityScore && musician.reliabilityScore > 90)
        tagList.push("Highly Reliable");
      if (musician.avgRating && musician.avgRating > 4.5)
        tagList.push("Top Rated");
      if (musician.avgRating && musician.avgRating > 4.8) tagList.push("Elite");

      return tagList.slice(0, 3);
    }, [
      musician.verified,
      musician.completedGigsCount,
      musician.reliabilityScore,
      musician.avgRating,
      musician.isOptimalForGigType,
      musician.isCompatible,
      selectedGigType,
    ]);

    const instrumentIcon = musician.instrument
      ? INSTRUMENT_ICONS[musician.instrument.toLowerCase()] || "🎵"
      : "🎵";

    // Get instrument-gigType compatibility display
    const compatibilityDisplay = useMemo(() => {
      if (!selectedGigType) return null;

      const compatibility = musician.gigTypeCompatibility;
      if (!compatibility) return null;

      return {
        score: compatibility,
        label:
          compatibility >= 80
            ? "Perfect Fit"
            : compatibility >= 60
              ? "Good Fit"
              : "Available",
        color:
          compatibility >= 80
            ? "green"
            : compatibility >= 60
              ? "blue"
              : "amber",
      };
    }, [selectedGigType, musician.gigTypeCompatibility]);

    return (
      <div
        className={cn(
          "rounded-2xl p-6 border transition-all duration-200 hover:shadow-lg relative group cursor-pointer",
          colors.card,
          colors.border,
          "hover:scale-[1.02] transform-gpu",
          colors.hoverBg,
          musician.isOptimalForGigType &&
            "ring-2 ring-green-500 dark:ring-green-400",
          // Dim incompatible musicians
          selectedGigType &&
            musician.isCompatible === false &&
            "opacity-60 grayscale-[20%]"
        )}
      >
        {" "}
        <div
          className="absolute top-4 right-4"
          title="Trust Score: Platform reliability"
        >
          <TrustStarsDisplay
            trustStars={musician.trustStars || 0.5}
            size="sm"
            showScore={true}
            showTier={false}
          />
        </div>
        {/* Compatibility Warning */}
        {selectedGigType && musician.isCompatible === false && (
          <div className="absolute -top-2 -right-2">
            <div
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold",
                "bg-amber-500 text-white shadow-sm"
              )}
            >
              <AlertTriangle className="w-3 h-3" />
              Atypical
            </div>
          </div>
        )}
        {/* Optimal Match Badge */}
        {musician.isOptimalForGigType && (
          <div className="absolute -top-2 -right-2">
            <div
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold",
                "bg-green-500 text-white shadow-sm"
              )}
            >
              <Target className="w-3 h-3" />
              Optimal
            </div>
          </div>
        )}
        {/* Compatibility Score */}
        {compatibilityDisplay && (
          <div className="absolute -top-2 -left-2">
            <div
              className={cn(
                "px-2 py-1 rounded-full text-xs font-semibold border shadow-sm",
                compatibilityDisplay.color === "green"
                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800"
                  : compatibilityDisplay.color === "blue"
                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                    : cn(colors.warningBg, colors.warningBorder, colors.text)
              )}
            >
              {compatibilityDisplay.score}% {compatibilityDisplay.label}
            </div>
          </div>
        )}
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                {musician.firstname?.[0]}
                {musician.lastname?.[0] || musician.username?.[0] || "M"}
              </div>
              {musician.verified && (
                <div
                  className={cn(
                    "absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center shadow-md border",
                    colors.border
                  )}
                >
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className={cn("font-bold", colors.text)}>{displayName}</h4>
                {musician.tier !== "free" && (
                  <Crown className="w-4 h-4 text-amber-500" />
                )}
              </div>
            </div>
          </div>
          <div className="mt-2">
            <TrustBasedRateDisplay
              musician={musician}
              selectedGigType={selectedGigType}
              roleType={musician.roleType}
              compact={true}
            />
          </div>
          {musician.canBeBookedDirectly && (
            <div className="mt-3">
              <div
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2",
                  "bg-green-500/10 text-green-600 border-green-500/20 border"
                )}
              >
                <CheckCircle className="w-3 h-3" />
                <span>Direct Booking Available</span>
              </div>
            </div>
          )}
        </div>
        {/* Instrument and Role with gigType context */}
        <div className="flex items-center gap-2 text-sm mb-3">
          <span className="text-lg">{instrumentIcon}</span>
          <span className={colors.text}>
            {musician.instrument
              ? musician.instrument
              : musician.roleType === "dj"
                ? "Deejay"
                : musician.roleType === "mc"
                  ? "EMCee"
                  : musician.roleType === "vocalist"
                    ? "Vocalist"
                    : "Various Instruments"}
            {selectedGigType && musician.isCompatible === false && (
              <span className={cn("text-xs ml-2", colors.warningText)}>
                • Unconventional
              </span>
            )}
          </span>
        </div>
        {/* Location */}
        {musician.city && (
          <div className="flex items-center gap-2 text-sm mb-4">
            <MapPin className={cn("w-3 h-3", colors.primary)} />
            <span className={colors.textMuted}>{musician.city}</span>
          </div>
        )}
        {/* Genres - Show genres relevant to the selected gigType */}
        <div className="flex flex-wrap gap-1 mb-3">
          {displayGenres.slice(0, 3).map((genre: string, index: number) => (
            <span
              key={index}
              className={cn(
                "px-2 py-1 text-xs rounded-full border",
                colors.border,
                colors.textMuted,
                // Highlight genres that match the gigType context
                selectedGigType &&
                  genre.toLowerCase().includes(selectedGigType.toLowerCase()) &&
                  cn(colors.warningBg, colors.text)
              )}
            >
              {genre}
            </span>
          ))}
          {displayGenres.length > 3 && (
            <span
              className={cn(
                "px-2 py-1 text-xs rounded-full border",
                colors.border,
                colors.textMuted
              )}
            >
              +{displayGenres.length - 3}
            </span>
          )}
        </div>
        {/* Enhanced Tags with gigType context */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {tags.map((tag) => (
              <span
                key={tag}
                className={cn(
                  "px-2 py-1 text-xs rounded-full font-medium border",
                  tag === "Optimal Match"
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800"
                    : tag === "Not Typical"
                      ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                      : tag === "Elite" || tag === "Top Rated"
                        ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800"
                        : cn(
                            colors.warningBg,
                            colors.warningBorder,
                            colors.text
                          )
                )}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        {/* Stats with gigType context */}
        <div
          className={cn("flex justify-between text-xs mb-4", colors.textMuted)}
        >
          <div className="flex flex-col items-center">
            <span className="font-semibold">
              {musician.completedGigsCount || 0}
            </span>
            <span className="text-xs">gigs</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-semibold">
              {musician.followers?.length || 0}
            </span>
            <span className="text-xs">followers</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-semibold">
              {musician.reliabilityScore || 0}%
            </span>
            <span className="text-xs">reliable</span>
          </div>
        </div>
        {/* // Action Button with gigType context */}
        <Button
          onClick={() => onRequestToBook(musician)}
          className={cn(
            "w-full group-hover:scale-105 transition-transform font-semibold",
            colors.primaryBg,
            colors.primaryBgHover,
            colors.textInverted,
            musician.isOptimalForGigType && "ring-2 ring-green-300",
            // Style differently for incompatible musicians
            selectedGigType &&
              musician.isCompatible === false &&
              "bg-gray-400 hover:bg-gray-500 dark:bg-gray-600 dark:hover:bg-gray-700"
          )}
          disabled={selectedGigType ? musician.isCompatible === false : false} // FIXED: Explicit boolean
        >
          <Award className="w-4 h-4 mr-2" />
          {selectedGigType && musician.isCompatible === false
            ? "Not Typical Choice"
            : selectedGigType
              ? `Book for ${selectedGigType}`
              : "Request to Book"}
        </Button>
      </div>
    );
  }
);

MusicianCard.displayName = "MusicianCard";

// Filter Badge Component
const FilterBadge = memo(
  ({ label, onRemove }: { label: string; onRemove: () => void }) => (
    <Badge variant="secondary" className="flex items-center gap-1 text-xs">
      {label}
      <button
        onClick={onRemove}
        className="ml-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full p-0.5"
      >
        <X className="w-3 h-3" />
      </button>
    </Badge>
  )
);

FilterBadge.displayName = "FilterBadge";

export const ProMusiciansTab: React.FC<ProMusiciansTabProps> = memo(
  ({ onRequestToBook, user, hasTemplates }) => {
    const { colors } = useThemeColors();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCity, setSelectedCity] = useState("");
    const [selectedInstrument, setSelectedInstrument] = useState("");
    const [selectedGigType, setSelectedGigType] = useState("");
    const [showFilters, setShowFilters] = useState(false);

    const [selectedSortBy, setSelectedSortBy] = useState<
      "trust" | "rating" | "experience" | "recent" | "rate"
    >("trust");
    // Debounced search query
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

    useEffect(() => {
      const timer = setTimeout(() => {
        setDebouncedSearchQuery(searchQuery);
      }, 300);

      return () => clearTimeout(timer);
    }, [searchQuery]);
    // In ProMusiciansTab.tsx, update the filterOptions to convert string to number:

    const filterOptions = useMemo(
      () => ({
        city: selectedCity || undefined,
        instrument: selectedInstrument || undefined,
        gigType: selectedGigType || undefined,
        // REMOVE minTrustStars entirely
        availableOnly: false,
        sortBy: selectedSortBy,
      }),
      [
        selectedCity,
        selectedInstrument,
        selectedGigType,
        // Remove selectedMinTrustStars
        selectedSortBy,
      ]
    );

    const handleSortByChange = useCallback(
      (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedSortBy(
          e.target.value as
            | "trust"
            | "rating"
            | "experience"
            | "recent"
            | "rate"
        );
      },
      []
    );

    const { musicians, featuredMusicians, isLoading, isEmpty } =
      useProMusicians(filterOptions);
    const { results: searchResults, isLoading: isSearching } =
      useMusicianSearch(debouncedSearchQuery, selectedCity, selectedInstrument);
    // Add this transformation function inside ProMusiciansTab component
    const transformMusicianData = useCallback(
      (data: any[]): EnhancedMusician[] => {
        if (!data) return [];

        return data.map((item) => ({
          ...item,
          // Fix the rateConfidence type
          rateConfidence:
            item.rateConfidence === "high" ||
            item.rateConfidence === "medium" ||
            item.rateConfidence === "low"
              ? (item.rateConfidence as "high" | "medium" | "low")
              : undefined,
          // Ensure other optional properties have correct defaults
          isOptimalForGigType: item.isOptimalForGigType ?? false,
          isCompatible: item.isCompatible ?? true,
          gigTypeCompatibility: item.gigTypeCompatibility ?? 0,
          trustStars: item.trustStars ?? 0.5,
          displayRate: item.displayRate || "$0",
        }));
      },
      []
    );

    // Transform the musicians data
    const displayMusicians = useMemo(() => {
      const source = debouncedSearchQuery ? searchResults : musicians;
      return transformMusicianData(source);
    }, [debouncedSearchQuery, searchResults, musicians, transformMusicianData]);

    const featuredMusiciansTransformed = useMemo(() => {
      return transformMusicianData(featuredMusicians);
    }, [featuredMusicians, transformMusicianData]);

    const activeFilters = useMemo(() => {
      const filters = [];
      if (selectedCity) filters.push(`City: ${selectedCity}`);
      if (selectedInstrument) filters.push(`Instrument: ${selectedInstrument}`);
      if (selectedGigType) {
        const gigTypeLabel = GIG_TYPES.find(
          (g) => g.value === selectedGigType
        )?.label;
        if (gigTypeLabel) filters.push(`Event: ${gigTypeLabel}`);
      }
      if (debouncedSearchQuery)
        filters.push(`Search: "${debouncedSearchQuery}"`);
      // Remove minTrustStars from active filters
      return filters;
    }, [
      selectedCity,
      selectedInstrument,
      selectedGigType,
      debouncedSearchQuery,
      // Remove selectedMinTrustStars
    ]);

    const getTierBadge = useCallback((tier: string) => {
      const config =
        TIER_CONFIG[tier as keyof typeof TIER_CONFIG] || TIER_CONFIG.free;
      const Icon = config.icon;
      return (
        <Badge className={cn("text-xs font-semibold", config.color)}>
          {Icon && <Icon className="w-3 h-3 mr-1" />}
          {config.label}
        </Badge>
      );
    }, []);

    const handleCityChange = useCallback(
      (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedCity(e.target.value);
      },
      []
    );

    const handleInstrumentChange = useCallback(
      (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedInstrument(e.target.value);
      },
      []
    );

    const handleGigTypeChange = useCallback(
      (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedGigType(e.target.value);
      },
      []
    );

    const handleSearchChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
      },
      []
    );

    const clearAllFilters = useCallback(() => {
      setSelectedCity("");
      setSelectedInstrument("");
      setSelectedGigType("");
      setSearchQuery("");
      setDebouncedSearchQuery("");
    }, []);

    const removeFilter = useCallback((filterToRemove: string) => {
      if (filterToRemove.startsWith("City:")) {
        setSelectedCity("");
      } else if (filterToRemove.startsWith("Instrument:")) {
        setSelectedInstrument("");
      } else if (filterToRemove.startsWith("Event:")) {
        setSelectedGigType("");
      } else if (filterToRemove.startsWith("Search:")) {
        setSearchQuery("");
        setDebouncedSearchQuery("");
      }
    }, []);

    // Show empty state if no templates exist
    if (!hasTemplates) {
      return (
        <div
          className={cn(
            "rounded-2xl p-8 text-center",
            colors.card,
            colors.border,
            "border"
          )}
        >
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center">
            <Music className="w-12 h-12 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className={cn("text-2xl font-bold mb-3", colors.text)}>
            Create a Template First
          </h3>
          <p className={cn("text-lg mb-6 max-w-md mx-auto", colors.textMuted)}>
            You need to create a gig template before you can browse and book
            premium musicians
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => (window.location.hash = "create")}
              className="bg-blue-500 hover:bg-blue-600"
            >
              <Music className="w-4 h-4 mr-2" />
              Create Your First Template
            </Button>
            <Button variant="outline">
              <Eye className="w-4 h-4 mr-2" />
              Browse Musicians First
            </Button>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-4 max-w-md mx-auto">
            <div
              className={cn(
                "p-4 rounded-xl text-center",
                colors.backgroundMuted
              )}
            >
              <div className={cn("text-xl font-bold", colors.text)}>50+</div>
              <div className={cn("text-xs", colors.textMuted)}>
                Pro Musicians
              </div>
            </div>
            <div
              className={cn(
                "p-4 rounded-xl text-center",
                colors.backgroundMuted
              )}
            >
              <div className={cn("text-xl font-bold", colors.text)}>4.8</div>
              <div className={cn("text-xs", colors.textMuted)}>Avg Rating</div>
            </div>
            <div
              className={cn(
                "p-4 rounded-xl text-center",
                colors.backgroundMuted
              )}
            >
              <div className={cn("text-xl font-bold", colors.text)}>24h</div>
              <div className={cn("text-xs", colors.textMuted)}>
                Avg Response
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Crown className="w-6 h-6 text-amber-500" />
            <div>
              <h3 className={cn("text-xl font-bold", colors.text)}>
                Premium Musicians
              </h3>
              <p className={cn("text-sm", colors.textMuted)}>
                {selectedGigType
                  ? `Top musicians for ${GIG_TYPES.find((g) => g.value === selectedGigType)?.label}`
                  : "Top-rated verified musicians available for instant booking"}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
            {activeFilters.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {activeFilters.length}
              </Badge>
            )}
          </Button>
        </div>

        {/* Active Filters */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className={cn("text-sm", colors.textMuted)}>
              Active filters:
            </span>
            {activeFilters.map((filter, index) => (
              <FilterBadge
                key={index}
                label={filter}
                onRemove={() => removeFilter(filter)}
              />
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-xs h-6"
            >
              Clear all
            </Button>
          </div>
        )}

        {/* Search and Filters */}
        <div
          className={cn(
            "p-4 rounded-2xl transition-all duration-200",
            colors.backgroundMuted,
            colors.border,
            "border",
            showFilters ? colors.secondaryBackground : ""
          )}
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search musicians by name, instrument, genre..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-10"
              />
            </div>

            {/* Collapsible Filters */}
            <div
              className={cn(
                "grid gap-4 transition-all duration-200",
                showFilters
                  ? "grid-cols-1 sm:grid-cols-3 opacity-100"
                  : "grid-cols-0 opacity-0 h-0 overflow-hidden"
              )}
            >
              <select
                value={selectedCity}
                onChange={handleCityChange}
                className={cn(
                  "px-3 py-2 rounded-lg border bg-transparent transition-colors",
                  colors.border,
                  colors.text,
                  "hover:border-blue-300 focus:border-blue-500"
                )}
              >
                <option value="">All Cities</option>
                {CITIES.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
              <select
                value={selectedInstrument}
                onChange={handleInstrumentChange}
                className={cn(
                  "px-3 py-2 rounded-lg border bg-transparent transition-colors",
                  colors.border,
                  colors.text,
                  "hover:border-blue-300 focus:border-blue-500"
                )}
              >
                <option value="">All Instruments</option>
                {INSTRUMENTS.map((instrument) => (
                  <option key={instrument} value={instrument}>
                    {instrument.charAt(0).toUpperCase() + instrument.slice(1)}
                  </option>
                ))}
              </select>
              {/* Gig Type Filter */}
              <select
                value={selectedGigType}
                onChange={handleGigTypeChange}
                className={cn(
                  "px-3 py-2 rounded-lg border bg-transparent transition-colors",
                  colors.border,
                  colors.text,
                  "hover:border-blue-300 focus:border-blue-500"
                )}
              >
                <option value="">All Gig Types</option>
                {GIG_TYPES.map((gigType) => (
                  <option key={gigType.value} value={gigType.value}>
                    {gigType.label}
                  </option>
                ))}
              </select>

              {/* Sorting Filter */}
              <select
                value={selectedSortBy}
                onChange={handleSortByChange} // Use the typed handler
                className={cn(
                  "px-3 py-2 rounded-lg border bg-transparent transition-colors",
                  colors.border,
                  colors.text,
                  "hover:border-blue-300 focus:border-blue-500"
                )}
              >
                <option value="trust">Sort by Trust</option>
                <option value="rating">Sort by Rating</option>
                <option value="experience">Sort by Experience</option>
                <option value="rate">Sort by Rate (Lowest)</option>
                <option value="recent">Sort by Recent</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {(isLoading || isSearching) && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <MusicianCardSkeleton key={index} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isSearching && displayMusicians.length === 0 && (
          <div
            className={cn(
              "rounded-2xl p-8 text-center",
              colors.card,
              colors.border,
              "border"
            )}
          >
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center">
              <Music className="w-12 h-12 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className={cn("text-2xl font-bold mb-3", colors.text)}>
              {debouncedSearchQuery
                ? "No Musicians Found"
                : "No Musicians Available Yet"}
            </h3>
            <p
              className={cn("text-lg mb-6 max-w-md mx-auto", colors.textMuted)}
            >
              {debouncedSearchQuery
                ? "Try adjusting your search terms or filters to find more musicians."
                : "We're working on getting more musicians onboarded. Check back soon!"}
            </p>
            {debouncedSearchQuery && (
              <Button
                onClick={clearAllFilters}
                className="bg-blue-500 hover:bg-blue-600"
              >
                Clear Search & Filters
              </Button>
            )}
          </div>
        )}

        {/* Featured Musicians Section */}
        {!isLoading &&
          !debouncedSearchQuery &&
          featuredMusiciansTransformed.length > 0 &&
          !selectedGigType && (
            <div>
              <h3 className={cn("text-lg font-semibold mb-4", colors.text)}>
                🏆 Featured Musicians
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 p-4">
                {featuredMusiciansTransformed.map((musician) => (
                  <MusicianCard
                    key={musician._id}
                    musician={musician}
                    onRequestToBook={onRequestToBook}
                    getTierBadge={getTierBadge}
                    selectedGigType={selectedGigType}
                  />
                ))}
              </div>
            </div>
          )}

        {/* All Pro Musicians */}
        {!isLoading && !isSearching && displayMusicians.length > 0 && (
          <div>
            <h3 className={cn("text-lg font-semibold mb-4", colors.text)}>
              {selectedGigType
                ? `Musicians for ${GIG_TYPES.find((g) => g.value === selectedGigType)?.label}`
                : debouncedSearchQuery
                  ? "Search Results"
                  : "All Pro Musicians"}
              <span
                className={cn("text-sm font-normal ml-2", colors.textMuted)}
              >
                ({displayMusicians.length}{" "}
                {displayMusicians.length === 1 ? "musician" : "musicians"})
              </span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayMusicians.map((musician) => (
                <MusicianCard
                  key={musician._id}
                  musician={musician}
                  onRequestToBook={onRequestToBook}
                  getTierBadge={getTierBadge}
                  selectedGigType={selectedGigType}
                />
              ))}
            </div>
          </div>
        )}

        {/* Load More Section */}
        {!isLoading && !isSearching && displayMusicians.length > 0 && (
          <div className="mt-8 pt-6 border-t flex items-center justify-between">
            <div className={cn("text-sm", colors.textMuted)}>
              Showing {displayMusicians.length} musicians
              {selectedCity && ` in ${selectedCity}`}
              {selectedGigType && ` for ${selectedGigType} events`}
            </div>
            <Button variant="outline" size="sm">
              Load More
            </Button>
          </div>
        )}
      </div>
    );
  }
);

ProMusiciansTab.displayName = "ProMusiciansTab";
