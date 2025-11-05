// components/DeputySearch.tsx
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useThemeColors } from "@/hooks/useTheme";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { BsInstagram, BsYoutube } from "react-icons/bs";
import { ComprehensiveRating } from "../ui/ComprehensiveRating";

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
  });

  const { colors } = useThemeColors();
  const { deputies, sendDeputyRequest, isLoading } = useDeputies(
    user._id as Id<"users">
  );

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
        !activeFilters.instrument
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

      return matchesSearch && matchesSkill && matchesCity && matchesInstrument;
    });
  }, [deputies, searchQuery, activeFilters]);

  const handleSendRequest = async (deputyId: Id<"users">, skill: string) => {
    const result = await sendDeputyRequest(deputyId, skill);
    if (result.success) {
      // You can add toast notification here
      toast.success("Successfully sent a deputy request");
      console.log("Request sent successfully");
    } else {
      alert(`Failed to send request: ${result.error}`);
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
    };
  }, [deputies]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className={cn("text-3xl font-bold", colors.text)}>
          Find Your Deputy
        </h1>
        <p className={cn("text-lg", colors.textMuted)}>
          Search by name, skill, instrument, location, or anything else
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
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
            </div>
          )}
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className={cn("text-sm", colors.textMuted)}>
          {filteredDeputies.length}{" "}
          {filteredDeputies.length === 1 ? "deputy" : "deputies"} found
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
        {filteredDeputies.map((deputy) => (
          <DeputyCard
            key={deputy._id}
            deputy={deputy}
            onSendRequest={handleSendRequest}
            isLoading={isLoading(`send-${deputy._id}`)}
          />
        ))}
      </div>

      {filteredDeputies.length === 0 && (
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

// Modern Deputy Card (same as before, but included for completeness)
// Modern Deputy Card with improved rejection handling
const DeputyCard: React.FC<{
  deputy: any;
  onSendRequest: (id: Id<"users">, skill: string) => void;
  isLoading: boolean;
}> = React.memo(({ deputy, onSendRequest, isLoading }) => {
  const { colors } = useThemeColors();
  const skill = deputy.roleType || deputy.instrument || "Musician";

  const socialLinks = [
    {
      icon: <Mail className="w-4 h-4" />,
      url: deputy.email ? `mailto:${deputy.email}` : null,
    },
    {
      icon: <BsInstagram className="w-4 h-4" />,
      url:
        deputy.musicianhandles.platform === "instagram" &&
        deputy.musicianhandles.handle,
    },
    {
      icon: <BsYoutube className="w-4 h-4" />,
      url:
        deputy.musicianhandles.platform === "youtube" &&
        deputy.musicianhandles.handle,
    },
    { icon: <LinkIcon className="w-4 h-4" />, url: deputy.website },
  ].filter((link) => link.url);

  // Determine the relationship status
  const hasPendingRequest = deputy.existingRelationship?.status === "pending";
  const hasAcceptedRequest = deputy.existingRelationship?.status === "accepted";
  const hasRejectedRequest = deputy.existingRelationship?.status === "rejected";
  const noRelationship = !deputy.existingRelationship;

  return (
    <div
      className={cn(
        "group relative rounded-2xl border transition-all duration-300 hover:shadow-xl",
        "hover:scale-[1.02] hover:-translate-y-1",
        colors.border,
        colors.card
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative p-6 space-y-4">
        <div className="flex jusstify-between items-center ">
          <div className="flex items-start gap-4 ">
            <div className="relative ">
              <img
                src={deputy.picture || "/default-avatar.png"}
                alt={deputy.username}
                className="w-16 h-16 rounded-2xl border-2 border-white shadow-lg"
              />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className={cn("font-bold text-lg truncate", colors.text)}>
                {deputy.firstname} {deputy.lastname}
              </h3>
              <p className={cn("text-sm truncate mb-2", colors.textMuted)}>
                @{deputy.username}
              </p>

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
          {/* <ComprehensiveRating
            rating={deputy.rating}
            size="sm"
            className="mt-2"
          /> */}
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
            value={`Backs up ${deputy.backupCount || 0} Musicians`}
          />
          {deputy.bio && (
            <div className="text-sm">
              <p className={cn("line-clamp-2", colors.textMuted)}>
                {deputy.bio}
              </p>
            </div>
          )}
        </div>

        <div className="pt-2">
          {hasPendingRequest ? (
            <StatusBadge status="pending" />
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
                disabled={isLoading}
                variant="outline"
                className="w-full"
              >
                {isLoading ? (
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
              disabled={isLoading}
              className={cn(
                "w-full rounded-xl py-3 font-semibold transition-all duration-200",
                "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600",
                "text-white shadow-lg hover:shadow-xl",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              )}
            >
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
});

// InfoRow Component (same as before)
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

// StatusBadge Component (same as before)
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
