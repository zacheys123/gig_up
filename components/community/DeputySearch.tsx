// components/DeputySearch.tsx - UPDATED WITH TRUST SCORING
import React, { useState, useMemo } from "react";
import { useDeputies } from "@/hooks/useDeputies";
import { Id } from "@/convex/_generated/dataModel";
import {
  Search,
  MapPin,
  Music,
  Users,
  UserCheck,
  Clock,
  CheckCircle,
  XCircle,
  Mail,
  Instagram,
  Youtube,
  Link as LinkIcon,
  Filter,
  X,
  Star,
  Shield,
  Award,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useThemeColors } from "@/hooks/useTheme";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { BsInstagram, BsYoutube } from "react-icons/bs";
import { ComprehensiveRating } from "../ui/ComprehensiveRating";
import { TrialDebug } from "../debug";
import { ChatIcon } from "../chat/ChatIcon";
import { useTrustScore } from "@/hooks/useTrustScore"; // ADD THIS IMPORT

interface DeputySearchProps {
  user: any;
}

export const DeputySearch: React.FC<DeputySearchProps> = ({ user }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    skill: "",
    city: "",
    instrument: "",
    minTrustStars: "", // NEW: Add trust filter
  });
  const [sortBy, setSortBy] = useState<string>("trust"); // NEW: Sorting option

  const { colors } = useThemeColors();
  const { deputies, sendDeputyRequest, isLoading, cancelDeputyRequest } =
    useDeputies(user._id as Id<"users">);
  const [cancelingDeputyId, setCancelingDeputyId] =
    useState<Id<"users"> | null>(null);

  // Get current user's trust for reference
  const { trustStars: currentUserTrustStars } = useTrustScore();

  // Filter deputies based on search criteria
  const filteredDeputies = useMemo(() => {
    return deputies.filter((deputy) => {
      const searchTerms = searchQuery
        .toLowerCase()
        .split(" ")
        .filter((term) => term.length > 0);

      // If no search query, show all
      if (
        searchTerms.length === 0 &&
        !activeFilters.skill &&
        !activeFilters.city &&
        !activeFilters.instrument &&
        !activeFilters.minTrustStars
      ) {
        return true;
      }

      // Check if deputy matches any search term
      const matchesSearch =
        searchTerms.length === 0 ||
        searchTerms.some(
          (term) =>
            deputy.firstname?.toLowerCase().includes(term) ||
            deputy.lastname?.toLowerCase().includes(term) ||
            deputy.username.toLowerCase().includes(term) ||
            deputy.roleType?.toLowerCase().includes(term) ||
            deputy.instrument?.toLowerCase().includes(term) ||
            deputy.city?.toLowerCase().includes(term) ||
            deputy.bio?.toLowerCase().includes(term) ||
            deputy.existingRelationship?.forTheirSkill
              ?.toLowerCase()
              .includes(term)
        );

      // Check active filters
      const matchesSkill =
        !activeFilters.skill ||
        deputy.roleType
          ?.toLowerCase()
          .includes(activeFilters.skill.toLowerCase()) ||
        deputy.existingRelationship?.forTheirSkill
          ?.toLowerCase()
          .includes(activeFilters.skill.toLowerCase());

      const matchesCity =
        !activeFilters.city ||
        deputy.city?.toLowerCase().includes(activeFilters.city.toLowerCase());

      const matchesInstrument =
        !activeFilters.instrument ||
        deputy.instrument
          ?.toLowerCase()
          .includes(activeFilters.instrument.toLowerCase());

      // NEW: Check trust filter
      const matchesTrust =
        !activeFilters.minTrustStars ||
        (deputy.trustStars || 0.5) >= parseFloat(activeFilters.minTrustStars);

      return (
        matchesSearch &&
        matchesSkill &&
        matchesCity &&
        matchesInstrument &&
        matchesTrust
      );
    });
  }, [deputies, searchQuery, activeFilters]);

  // Sort deputies based on selected criteria
  const sortedDeputies = useMemo(() => {
    const deputiesCopy = [...filteredDeputies];

    switch (sortBy) {
      case "trust":
        // Sort by trust stars (highest first), then by trust score
        return deputiesCopy.sort((a, b) => {
          const aStars = a.trustStars || 0.5;
          const bStars = b.trustStars || 0.5;
          if (bStars !== aStars) {
            return bStars - aStars;
          }
          // If stars are equal, sort by trust score
          const aScore = a.trustScore || 0;
          const bScore = b.trustScore || 0;
          return bScore - aScore;
        });

      case "experience":
        // Sort by backup count (most experienced first)
        return deputiesCopy.sort(
          (a, b) => (b.backupCount || 0) - (a.backupCount || 0)
        );

      case "rating":
        // Sort by avgRating (highest first)
        return deputiesCopy.sort(
          (a, b) => (b.avgRating || 0) - (a.avgRating || 0)
        );

      case "recent":
        // Sort by most recently active (you'd need lastActive field)
        return deputiesCopy;

      default:
        return deputiesCopy;
    }
  }, [filteredDeputies, sortBy]);

  const handleSendRequest = async (deputyId: Id<"users">, skill: string) => {
    // Find deputy to check trust
    const deputy = deputies.find((d) => d._id === deputyId);

    if (deputy) {
      const deputyTrustStars = deputy.trustStars || 0.5;

      // Check if deputy meets minimum trust
      if (deputyTrustStars < 2.0) {
        toast.error(
          `This deputy needs at least 2.0 trust stars to accept requests. Current: ${deputyTrustStars.toFixed(1)} stars`
        );
        return;
      }

      // Check if current user can add deputies
      if (currentUserTrustStars < 4.0) {
        toast.error(
          `You need at least 4.0 trust stars to add deputies. Current: ${currentUserTrustStars.toFixed(1)} stars`
        );
        return;
      }
    }

    const result = await sendDeputyRequest(deputyId, skill);
    if (result.success) {
      toast.success("Successfully sent a deputy request");
      console.log("Request sent successfully");
    } else {
      toast.error(result.error || "Failed to send request");
    }
  };

  const handleCancelRequest = async (deputyId: Id<"users">) => {
    setCancelingDeputyId(deputyId);
    try {
      const result = await cancelDeputyRequest(deputyId);
      if (result.success) {
        toast.success("Request cancelled");
      }
    } finally {
      setCancelingDeputyId(null);
    }
  };

  const updateFilter = (key: keyof typeof activeFilters, value: string) => {
    setActiveFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearAll = () => {
    setSearchQuery("");
    setActiveFilters({
      skill: "",
      city: "",
      instrument: "",
      minTrustStars: "",
    });
  };

  const removeFilter = (key: keyof typeof activeFilters) => {
    setActiveFilters((prev) => ({ ...prev, [key]: "" }));
  };

  const hasActiveFilters =
    Object.values(activeFilters).some((value) => value !== "") ||
    searchQuery !== "";

  // Extract unique values for filter suggestions
  const filterSuggestions = useMemo(() => {
    const skills = new Set<string>();
    const cities = new Set<string>();
    const instruments = new Set<string>();
    const trustLevels = ["1.0", "2.0", "3.0", "4.0", "5.0"]; // Trust star levels

    deputies.forEach((deputy) => {
      if (deputy.roleType) skills.add(deputy.roleType);
      if (deputy.existingRelationship?.forTheirSkill)
        skills.add(deputy.existingRelationship.forTheirSkill);
      if (deputy.city) cities.add(deputy.city);
      if (deputy.instrument) instruments.add(deputy.instrument);
    });

    return {
      skills: Array.from(skills),
      cities: Array.from(cities),
      instruments: Array.from(instruments),
      trustLevels, // Add trust levels
    };
  }, [deputies]);

  // Trust tier badge color mapping
  const getTrustTierColor = (trustStars: number = 0.5) => {
    if (trustStars >= 4.5)
      return "bg-purple-500/10 text-purple-600 border-purple-500/20";
    if (trustStars >= 4.0)
      return "bg-green-500/10 text-green-600 border-green-500/20";
    if (trustStars >= 3.0)
      return "bg-blue-500/10 text-blue-600 border-blue-500/20";
    if (trustStars >= 2.0)
      return "bg-amber-500/10 text-amber-600 border-amber-500/20";
    return "bg-gray-500/10 text-gray-600 border-gray-500/20";
  };

  const getTrustTierLabel = (trustStars: number = 0.5) => {
    if (trustStars >= 4.5) return "Elite";
    if (trustStars >= 4.0) return "Trusted";
    if (trustStars >= 3.0) return "Verified";
    if (trustStars >= 2.0) return "Basic";
    return "New";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className={cn("text-3xl font-bold", colors.text)}>
          Find Your Deputy
        </h1>
        <p className={cn("text-lg", colors.textMuted)}>
          Search by name, skill, instrument, location, or trust level
        </p>
      </div>

      {/* Unified Search */}
      <div className={cn("p-6 rounded-2xl border", colors.border, colors.card)}>
        <div className="space-y-4">
          {/* Main Search Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder="Search deputies by name, skill, instrument, city, bio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                "w-full pl-10 pr-24 py-4 rounded-xl border text-lg transition-all duration-200",
                "focus:ring-2 focus:ring-amber-500 focus:border-transparent",
                colors.border,
                colors.backgroundMuted,
                colors.text
              )}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  "flex items-center gap-2",
                  colors.border,
                  showFilters && "bg-amber-500 text-white border-amber-500"
                )}
              >
                <Filter className="w-4 h-4" />
                Filters
              </Button>
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2">
              {searchQuery && (
                <FilterBadge
                  label={`Search: "${searchQuery}"`}
                  onRemove={() => setSearchQuery("")}
                />
              )}
              {activeFilters.skill && (
                <FilterBadge
                  label={`Skill: ${activeFilters.skill}`}
                  onRemove={() => removeFilter("skill")}
                />
              )}
              {activeFilters.city && (
                <FilterBadge
                  label={`City: ${activeFilters.city}`}
                  onRemove={() => removeFilter("city")}
                />
              )}
              {activeFilters.instrument && (
                <FilterBadge
                  label={`Instrument: ${activeFilters.instrument}`}
                  onRemove={() => removeFilter("instrument")}
                />
              )}
              {activeFilters.minTrustStars && (
                <FilterBadge
                  label={`Min Trust: ${activeFilters.minTrustStars}★`}
                  onRemove={() => removeFilter("minTrustStars")}
                />
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAll}
                className="text-sm text-amber-600 hover:text-amber-700"
              >
                Clear All
              </Button>
            </div>
          )}

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
              <FilterSelect
                icon={<UserCheck className="w-4 h-4" />}
                placeholder="Filter by skill..."
                value={activeFilters.skill}
                options={filterSuggestions.skills}
                onChange={(value) => updateFilter("skill", value)}
              />
              <FilterSelect
                icon={<MapPin className="w-4 h-4" />}
                placeholder="Filter by city..."
                value={activeFilters.city}
                options={filterSuggestions.cities}
                onChange={(value) => updateFilter("city", value)}
              />
              <FilterSelect
                icon={<Music className="w-4 h-4" />}
                placeholder="Filter by instrument..."
                value={activeFilters.instrument}
                options={filterSuggestions.instruments}
                onChange={(value) => updateFilter("instrument", value)}
              />
              <FilterSelect
                icon={<Star className="w-4 h-4" />}
                placeholder="Min Trust Stars..."
                value={activeFilters.minTrustStars}
                options={filterSuggestions.trustLevels}
                onChange={(value) => updateFilter("minTrustStars", value)}
              />
            </div>
          )}

          {/* Sorting Controls */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <span className={cn("text-sm font-medium", colors.text)}>
                Sort by:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={cn(
                  "px-3 py-1.5 rounded-lg border text-sm",
                  colors.border,
                  colors.backgroundMuted,
                  colors.text
                )}
              >
                <option value="trust">Trust Score (Highest)</option>
                <option value="experience">Experience (Most)</option>
                <option value="rating">Rating (Highest)</option>
                <option value="recent">Most Recent</option>
              </select>
            </div>

            {/* Trust Requirements Info */}
            {currentUserTrustStars < 4.0 && (
              <div
                className={cn(
                  "text-sm px-3 py-1.5 rounded-lg border",
                  "bg-amber-500/10 text-amber-600 border-amber-500/20"
                )}
              >
                <div className="flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  <span>You need 4.0★ to add deputies</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className={cn("text-sm", colors.textMuted)}>
          {sortedDeputies.length}{" "}
          {sortedDeputies.length === 1 ? "deputy" : "deputies"} found
        </p>
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearAll}
            className={cn("text-sm", colors.border)}
          >
            <X className="w-4 h-4 mr-1" />
            Clear Filters
          </Button>
        )}
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {sortedDeputies.map((deputy) => (
          <DeputyCard
            key={deputy._id}
            deputy={deputy}
            onSendRequest={handleSendRequest}
            onCancelRequest={handleCancelRequest}
            isLoading={isLoading(`send-${deputy._id}`)}
            isCanceling={cancelingDeputyId === deputy._id}
            getTrustTierColor={getTrustTierColor}
            getTrustTierLabel={getTrustTierLabel}
            currentUserTrustStars={currentUserTrustStars}
          />
        ))}
      </div>

      {sortedDeputies.length === 0 && (
        <EmptyState
          title={
            hasActiveFilters ? "No matching deputies" : "No deputies available"
          }
          message={
            hasActiveFilters
              ? "Try adjusting your search terms or filters"
              : "Check back later for new deputy opportunities"
          }
          onClearFilters={hasActiveFilters ? clearAll : undefined}
        />
      )}
    </div>
  );
};

// Filter Badge Component
const FilterBadge: React.FC<{ label: string; onRemove: () => void }> = ({
  label,
  onRemove,
}) => (
  <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 text-amber-700 rounded-full text-sm">
    <span>{label}</span>
    <button
      onClick={onRemove}
      className="hover:bg-amber-500/20 rounded-full p-0.5 transition-colors"
    >
      <X className="w-3 h-3" />
    </button>
  </div>
);

// Filter Select Component
const FilterSelect: React.FC<{
  icon: React.ReactNode;
  placeholder: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}> = ({ icon, placeholder, value, options, onChange }) => {
  const { colors } = useThemeColors();

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        {icon}
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "w-full pl-10 pr-4 py-3 rounded-xl border appearance-none transition-all duration-200",
          "focus:ring-2 focus:ring-amber-500 focus:border-transparent",
          colors.border,
          colors.backgroundMuted,
          colors.text
        )}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
        <div className="w-2 h-2 border-r border-b border-current transform rotate-45" />
      </div>
    </div>
  );
};

// UPDATED Deputy Card with Trust Information
const DeputyCard: React.FC<{
  deputy: any;
  onSendRequest: (id: Id<"users">, skill: string) => void;
  isLoading: boolean;
  onCancelRequest: (id: Id<"users">) => void;
  isCanceling?: boolean;
  getTrustTierColor: (trustStars: number) => string;
  getTrustTierLabel: (trustStars: number) => string;
  currentUserTrustStars: number;
}> = React.memo(
  ({
    deputy,
    onSendRequest,
    isLoading,
    onCancelRequest,
    isCanceling,
    getTrustTierColor,
    getTrustTierLabel,
    currentUserTrustStars,
  }) => {
    const { colors } = useThemeColors();
    const skill =
      deputy.roleType === "instrumentalist"
        ? deputy.instrument
        : deputy.roleType === "vocalist"
          ? "vocalist"
          : deputy.roleType === "mc"
            ? "mc"
            : deputy.roleType === "dj"
              ? "dj"
              : "Musician";

    const socialLinks = [
      {
        icon: <Mail className="w-4 h-4" />,
        url: deputy.email ? `mailto:${deputy.email}` : null,
      },
      {
        icon: <BsInstagram className="w-4 h-4" />,
        url:
          deputy.musicianhandles?.platform === "instagram" &&
          deputy.musicianhandles?.handle,
      },
      {
        icon: <BsYoutube className="w-4 h-4" />,
        url:
          deputy.musicianhandles?.platform === "youtube" &&
          deputy.musicianhandles?.handle,
      },
      { icon: <LinkIcon className="w-4 h-4" />, url: deputy.website },
    ].filter((link) => link.url);

    // Determine the relationship status
    const hasPendingRequest = deputy.existingRelationship?.status === "pending";
    const hasAcceptedRequest =
      deputy.existingRelationship?.status === "accepted";
    const hasRejectedRequest =
      deputy.existingRelationship?.status === "rejected";
    const noRelationship = !deputy.existingRelationship;

    // Trust information
    const trustStars = deputy.trustStars || 0.5;
    const trustScore = deputy.trustScore || 0;
    const trustTier = getTrustTierLabel(trustStars);
    const trustTierColor = getTrustTierColor(trustStars);

    // Check eligibility
    const canCurrentUserAdd = currentUserTrustStars >= 4.0;
    const canDeputyAccept = trustStars >= 2.0;
    const canBeBookedDirectly = trustStars >= 3.0;

    // Render trust stars
    const renderTrustStars = () => {
      const stars = [];
      for (let i = 1; i <= 5; i++) {
        if (i <= Math.floor(trustStars)) {
          stars.push(
            <Star
              key={`full-${i}`}
              className="w-4 h-4 fill-amber-500 text-amber-500"
            />
          );
        } else if (i === Math.ceil(trustStars) && trustStars % 1 >= 0.5) {
          stars.push(
            <Star
              key={`half-${i}`}
              className="w-4 h-4 fill-amber-500/50 text-amber-500"
            />
          );
        } else {
          stars.push(
            <Star
              key={`empty-${i}`}
              className="w-4 h-4 fill-gray-300 text-gray-300"
            />
          );
        }
      }
      return stars;
    };

    return (
      <div
        className={cn(
          "group relative rounded-2xl border transition-all duration-300 hover:shadow-xl",
          "hover:scale-[1.02] hover:-translate-y-1",
          colors.border,
          colors.card
        )}
      >
        {/* Trust Level Indicator */}
        <div
          className={cn(
            "absolute -top-2 -right-2 z-10 px-2 py-1 rounded-full text-xs font-bold",
            trustTierColor
          )}
        >
          {trustTier}
        </div>

        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="relative p-6 space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-start gap-4">
              <div className="relative">
                <img
                  src={deputy.picture || "/default-avatar.png"}
                  alt={deputy.username}
                  className="w-16 h-16 rounded-2xl border-2 border-white shadow-lg"
                />
                {/* Trust Indicator Badge */}
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-amber-500 rounded-full border-2 border-white flex items-center justify-center">
                  <span className="text-xs font-bold text-white">
                    {Math.floor(trustStars)}
                  </span>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <h3 className={cn("font-bold text-lg truncate", colors.text)}>
                  {deputy.firstname} {deputy.lastname}
                </h3>
                <p className={cn("text-sm truncate mb-2", colors.textMuted)}>
                  @{deputy.username}
                </p>

                {/* Trust Stars Display */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-1">
                    {renderTrustStars()}
                  </div>
                  <span className="text-xs font-semibold text-amber-600">
                    {trustStars.toFixed(1)}
                  </span>
                  <span className={cn("text-xs", colors.textMuted)}>
                    Score: {trustScore}
                  </span>
                </div>

                {socialLinks.length > 0 && (
                  <div className="flex gap-2">
                    {socialLinks.map((link, index) => (
                      <a
                        key={index}
                        href={link.url || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          "p-1.5 rounded-lg transition-all duration-200",
                          "hover:bg-amber-500 hover:text-white",
                          colors.textMuted
                        )}
                      >
                        {link.icon}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <ComprehensiveRating
              rating={deputy.rating}
              size="sm"
              className="mt-2"
            />
          </div>

          {/* Trust Status Indicators */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div
              className={cn(
                "px-2 py-1 rounded flex items-center justify-center gap-1",
                canDeputyAccept
                  ? "bg-green-500/10 text-green-600"
                  : "bg-gray-500/10 text-gray-600"
              )}
            >
              <UserCheck className="w-3 h-3" />
              <span>{canDeputyAccept ? "Eligible" : "Needs 2.0★"}</span>
            </div>
            <div
              className={cn(
                "px-2 py-1 rounded flex items-center justify-center gap-1",
                canBeBookedDirectly
                  ? "bg-blue-500/10 text-blue-600"
                  : "bg-gray-500/10 text-gray-600"
              )}
            >
              <Shield className="w-3 h-3" />
              <span>{canBeBookedDirectly ? "Bookable" : "Needs 3.0★"}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {deputy.roleType && (
              <Badge
                variant="secondary"
                className="bg-amber-500/10 text-amber-600 border-amber-500/20"
              >
                {deputy.roleType}
              </Badge>
            )}
            {deputy.instrument && (
              <Badge
                variant="secondary"
                className="bg-blue-500/10 text-blue-600 border-blue-500/20"
              >
                <Music className="w-3 h-3 mr-1" />
                {deputy.instrument}
              </Badge>
            )}
            <ChatIcon variant="cozy" userId={deputy?._id} />
          </div>

          <div className="space-y-3">
            <InfoRow
              icon={<MapPin className="w-4 h-4" />}
              label="Location"
              value={deputy.city}
            />
            <InfoRow
              icon={<Users className="w-4 h-4" />}
              label="Experience"
              value={`Backs up ${deputy.backupCount || 0} musicians`}
            />
            {/* Trust Score Info */}
            <InfoRow
              icon={<TrendingUp className="w-4 h-4" />}
              label="Trust Score"
              value={trustScore}
            />
            {deputy.talentbio && (
              <div className="text-sm ">
                <p className={cn("line-clamp-2", colors.textMuted)}>
                  {deputy.talentbio}
                </p>
              </div>
            )}
          </div>

          <div className="pt-2">
            {hasPendingRequest ? (
              <div className="space-y-2">
                <StatusBadge status="pending" />
                <Button
                  onClick={() => onCancelRequest(deputy._id)}
                  disabled={isCanceling}
                  variant="outline"
                  className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  {isCanceling ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                      Cancelling...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <X className="w-4 h-4" />
                      Cancel Request
                    </div>
                  )}
                </Button>
              </div>
            ) : hasAcceptedRequest ? (
              <StatusBadge status="accepted" />
            ) : hasRejectedRequest ? (
              // Option 1: Show "Ask Again" for rejected requests
              <div className="space-y-2">
                <div
                  className={cn(
                    "text-xs text-center px-3 py-1 rounded-lg",
                    "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                  )}
                >
                  Previous request was declined
                </div>
                <Button
                  onClick={() => onSendRequest(deputy._id, skill)}
                  disabled={isLoading || !canCurrentUserAdd || !canDeputyAccept}
                  variant="outline"
                  className="w-full relative group/button"
                >
                  {!canCurrentUserAdd ? (
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      <span>You need 4.0★</span>
                    </div>
                  ) : !canDeputyAccept ? (
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      <span>Deputy needs 2.0★</span>
                    </div>
                  ) : isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                      Sending...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4" />
                      Ask Again
                    </div>
                  )}
                </Button>
              </div>
            ) : (
              // No relationship - show regular "Ask to be Deputy" button
              <Button
                onClick={() => onSendRequest(deputy._id, skill)}
                disabled={isLoading || !canCurrentUserAdd || !canDeputyAccept}
                className={cn(
                  "w-full rounded-xl py-3 font-semibold transition-all duration-200 relative",
                  "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600",
                  "text-white shadow-lg hover:shadow-xl",
                  (!canCurrentUserAdd || !canDeputyAccept) &&
                    "opacity-50 cursor-not-allowed"
                )}
              >
                {/* Tooltip for disabled state */}
                {(!canCurrentUserAdd || !canDeputyAccept) && (
                  <div className="absolute inset-0 flex items-center justify-center bg-amber-500/90 rounded-xl opacity-0 hover:opacity-100 transition-opacity">
                    <div className="text-xs p-2">
                      {!canCurrentUserAdd
                        ? `You need 4.0★ (You have ${currentUserTrustStars.toFixed(1)}★)`
                        : `Deputy needs 2.0★ (They have ${trustStars.toFixed(1)}★)`}
                    </div>
                  </div>
                )}

                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending Request...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4" />
                    Ask to be Deputy
                  </div>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }
);

// InfoRow Component
const InfoRow: React.FC<{
  icon: React.ReactNode;
  label: string;
  value?: string | number;
}> = ({ icon, label, value }) => {
  const { colors } = useThemeColors();

  return value ? (
    <div className="flex items-center gap-3">
      <div className={cn("p-1.5 rounded-lg", colors.backgroundMuted)}>
        {icon}
      </div>
      <div className="flex-1 flex justify-between items-center">
        <span className={cn("text-sm font-medium", colors.text)}>{label}:</span>
        <span className={cn("text-sm font-semibold", colors.text)}>
          {value}
        </span>
      </div>
    </div>
  ) : null;
};

// StatusBadge Component
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const statusConfig = {
    pending: {
      icon: <Clock className="w-3 h-3" />,
      style: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
    },
    accepted: {
      icon: <CheckCircle className="w-3 h-3" />,
      style: "bg-green-500/10 text-green-600 border-green-500/20",
    },
    rejected: {
      icon: <XCircle className="w-3 h-3" />,
      style: "bg-red-500/10 text-red-600 border-red-500/20",
    },
  };

  const config =
    statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

  return (
    <Badge
      variant="secondary"
      className={cn("w-full justify-center py-2.5 border", config.style)}
    >
      <div className="flex items-center gap-2">
        {config.icon}
        <span className="font-semibold capitalize">{status}</span>
      </div>
    </Badge>
  );
};

// Enhanced Empty State
const EmptyState: React.FC<{
  title: string;
  message: string;
  onClearFilters?: () => void;
}> = ({ title, message, onClearFilters }) => {
  const { colors } = useThemeColors();

  return (
    <div
      className={cn(
        "text-center py-16 border-2 border-dashed rounded-2xl",
        colors.border,
        colors.card
      )}
    >
      <div className="max-w-md mx-auto space-y-4">
        <div className="relative">
          <div className="w-20 h-20 mx-auto bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
            <Search className="w-10 h-10 text-white" />
          </div>
        </div>
        <div className="space-y-2">
          <h3 className={cn("text-xl font-bold", colors.text)}>{title}</h3>
          <p className={cn("text-sm", colors.textMuted)}>{message}</p>
        </div>
        {onClearFilters && (
          <Button
            onClick={onClearFilters}
            className="bg-amber-500 hover:bg-amber-600 text-white"
          >
            Clear Search & Filters
          </Button>
        )}
      </div>
    </div>
  );
};

export const DeputyCardSkeleton: React.FC = () => {
  const { colors } = useThemeColors();

  return (
    <div
      className={cn(
        "rounded-2xl border p-6 space-y-4",
        colors.border,
        colors.card
      )}
    >
      <div className="flex items-start gap-4">
        <Skeleton className="w-16 h-16 rounded-2xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-24" />
          <div className="flex gap-2">
            <Skeleton className="w-8 h-8 rounded-lg" />
            <Skeleton className="w-8 h-8 rounded-lg" />
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <Skeleton className="h-12 w-full rounded-xl" />
    </div>
  );
};
