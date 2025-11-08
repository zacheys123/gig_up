// app/hub/gigs/_components/tabs/ProMusiciansTab.tsx - OPTIMIZED
"use client";

import React, { useState, useMemo, useCallback, memo } from "react";
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
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useThemeColors } from "@/hooks/useTheme";
import { useProMusicians, useMusicianSearch } from "@/hooks/useProMusicians";

interface ProMusiciansTabProps {
  onRequestToBook: (musician: any) => void;
  user: any;
  hasTemplates: boolean;
}

// Memoize static configuration
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

const CITIES = ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret"];
const INSTRUMENTS = [
  "guitar",
  "piano",
  "drums",
  "violin",
  "saxophone",
  "vocalist",
  "dj",
  "mc",
  "bass",
];

const INSTRUMENT_ICONS: Record<string, string> = {
  guitar: "🎸",
  piano: "🎹",
  drums: "🥁",
  violin: "🎻",
  saxophone: "🎷",
  trumpet: "🎺",
  bass: "🎸",
  vocalist: "🎤",
  dj: "🎧",
  mc: "🎤",
};

// Memoize MusicianCard component
const MusicianCard = memo(
  ({ musician, onRequestToBook, getTierBadge }: any) => {
    const { colors } = useThemeColors();

    // Calculate display name
    const displayName = useMemo(
      () =>
        musician.firstname && musician.lastname
          ? `${musician.firstname} ${musician.lastname}`
          : musician.username || "Musician",
      [musician.firstname, musician.lastname, musician.username]
    );

    // Calculate rate based on tier or use default
    const displayRate = useMemo(() => {
      if (musician.rate?.regular) return musician.rate.regular;

      const tierRates = {
        elite: "KES 25,000+",
        premium: "KES 15,000+",
        pro: "KES 10,000+",
        free: "KES 5,000+",
      };

      return (
        tierRates[musician.tier as keyof typeof tierRates] || "Contact for rate"
      );
    }, [musician.tier, musician.rate]);

    // Get genres for display
    const displayGenres = useMemo(
      () =>
        musician.musiciangenres ||
        (musician.genres ? [musician.genres] : []) || ["Various Genres"],
      [musician.musiciangenres, musician.genres]
    );

    // Get tags based on musician data
    const tags = useMemo(() => {
      const tagList = [];
      if (musician.verified) tagList.push("Verified");
      if (musician.completedGigsCount > 10) tagList.push("Experienced");
      if (musician.reliabilityScore > 90) tagList.push("Highly Reliable");
      if (musician.avgRating > 4.5) tagList.push("Top Rated");
      return tagList.slice(0, 3);
    }, [
      musician.verified,
      musician.completedGigsCount,
      musician.reliabilityScore,
      musician.avgRating,
    ]);

    const instrumentIcon =
      INSTRUMENT_ICONS[musician.instrument?.toLowerCase()] || "🎵";

    return (
      <div
        className={cn(
          "rounded-2xl p-6 border transition-all duration-200 hover:shadow-lg",
          colors.card,
          colors.border,
          "hover:scale-[1.02] hover:border-amber-400 group"
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center text-white font-bold">
                {musician.firstname?.[0]}
                {musician.lastname?.[0] || musician.username?.[0] || "M"}
              </div>
              {musician.verified && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
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
              <div className="flex items-center gap-2 mt-1">
                {getTierBadge(musician.tier)}
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  {musician.avgRating?.toFixed(1) || "New"}
                </div>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className={cn("font-bold text-lg", colors.text)}>
              {displayRate}
            </div>
            <div className={cn("text-xs", colors.textMuted)}>per gig</div>
          </div>
        </div>

        {/* Instrument and Role */}
        <div className="flex items-center gap-2 text-sm mb-3">
          <span className="text-lg">{instrumentIcon}</span>
          <span className={colors.text}>
            {musician.instrument || musician.roleType || "Musician"}
          </span>
        </div>

        {/* Location */}
        {musician.city && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <MapPin className="w-3 h-3" />
            {musician.city}
          </div>
        )}

        {/* Genres */}
        <div className="flex flex-wrap gap-1 mb-3">
          {displayGenres.slice(0, 3).map((genre: string, index: number) => (
            <span
              key={index}
              className={cn(
                "px-2 py-1 text-xs rounded-full border",
                colors.border,
                colors.textMuted
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

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-4">
          {tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Stats */}
        <div className="flex justify-between text-xs text-muted-foreground mb-4">
          <span>{musician.completedGigsCount || 0} gigs</span>
          <span>{musician.followers?.length || 0} followers</span>
          <span>{musician.reliabilityScore || 0}% reliable</span>
        </div>

        {/* Action Button */}
        <Button
          onClick={() => onRequestToBook(musician)}
          className="w-full bg-amber-500 hover:bg-amber-600 group-hover:scale-105 transition-transform"
        >
          <Award className="w-4 h-4 mr-2" />
          Request to Book
        </Button>
      </div>
    );
  }
);

MusicianCard.displayName = "MusicianCard";

export const ProMusiciansTab: React.FC<ProMusiciansTabProps> = memo(
  ({ onRequestToBook, user, hasTemplates }) => {
    const { colors } = useThemeColors();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCity, setSelectedCity] = useState("");
    const [selectedInstrument, setSelectedInstrument] = useState("");

    // Memoize filter options
    const filterOptions = useMemo(
      () => ({
        city: selectedCity || undefined,
        instrument: selectedInstrument || undefined,
        minRating: 4.0,
      }),
      [selectedCity, selectedInstrument]
    );

    // Get featured musicians (premium/elite with high ratings)
    const { featuredMusicians, isLoading: featuredLoading } = useProMusicians({
      limit: 8,
    });

    // Get all pro musicians with filters
    const { musicians, isLoading } = useProMusicians(filterOptions);

    // Search results
    const { results: searchResults } = useMusicianSearch(
      searchQuery,
      selectedCity,
      selectedInstrument
    );

    // Memoize displayed musicians
    const displayMusicians = useMemo(
      () => (searchQuery ? searchResults : musicians),
      [searchQuery, searchResults, musicians]
    );

    // Memoize tier badge function
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

    // Memoize filter handlers
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

    const handleSearchChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
      },
      []
    );

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

          {/* Quick Stats Preview */}
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
        <div className="flex items-center gap-3">
          <Crown className="w-6 h-6 text-amber-500" />
          <div>
            <h3 className={cn("text-xl font-bold", colors.text)}>
              Premium Musicians
            </h3>
            <p className={cn("text-sm", colors.textMuted)}>
              Top-rated verified musicians available for instant booking
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div
          className={cn(
            "p-4 rounded-2xl",
            colors.card,
            colors.border,
            "border"
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

            <select
              value={selectedCity}
              onChange={handleCityChange}
              className={cn(
                "px-3 py-2 rounded-lg border bg-transparent",
                colors.border,
                colors.text
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
                "px-3 py-2 rounded-lg border bg-transparent",
                colors.border,
                colors.text
              )}
            >
              <option value="">All Instruments</option>
              {INSTRUMENTS.map((instrument) => (
                <option key={instrument} value={instrument}>
                  {instrument.charAt(0).toUpperCase() + instrument.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Featured Musicians Section */}
        {featuredMusicians.length > 0 && (
          <div>
            <h3 className={cn("text-lg font-semibold mb-4", colors.text)}>
              🏆 Featured Musicians
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {featuredMusicians.map((musician) => (
                <MusicianCard
                  key={musician._id}
                  musician={musician}
                  onRequestToBook={onRequestToBook}
                  getTierBadge={getTierBadge}
                />
              ))}
            </div>
          </div>
        )}

        {/* All Pro Musicians */}
        <div>
          <h3 className={cn("text-lg font-semibold mb-4", colors.text)}>
            {searchQuery ? "Search Results" : "All Pro Musicians"}
          </h3>

          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-muted-foreground">Loading musicians...</div>
            </div>
          ) : displayMusicians.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-muted-foreground text-center">
                {searchQuery
                  ? "No musicians found matching your search."
                  : "No pro musicians available."}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayMusicians.map((musician) => (
                <MusicianCard
                  key={musician._id}
                  musician={musician}
                  onRequestToBook={onRequestToBook}
                  getTierBadge={getTierBadge}
                />
              ))}
            </div>
          )}
        </div>

        {/* Stats Footer */}
        <div className="mt-8 pt-6 border-t flex items-center justify-between">
          <div className={cn("text-sm", colors.textMuted)}>
            Showing {displayMusicians.length} musicians in Kenya
            {selectedCity && ` in ${selectedCity}`}
          </div>
          <Button variant="outline" size="sm">
            Load More
          </Button>
        </div>
      </div>
    );
  }
);

ProMusiciansTab.displayName = "ProMusiciansTab";
