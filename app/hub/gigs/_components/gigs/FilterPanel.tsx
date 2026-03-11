"use client";

// components/gig/FiltersPanel.tsx
import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  Search,
  Calendar,
  MapPin,
  DollarSign,
  Music,
  Users,
  Star,
  Check,
  SlidersHorizontal,
  Save,
  Loader2,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Activity,
  PieChart,
  Sparkles,
  Settings,
  Bookmark,
  Mic,
  Volume2,
  Guitar,
  Briefcase,
  User,
  Users2,
  Piano,
  Drum,
  Info,
  Shield,
  Heart,
  Building,
  Disc,
  Home,
  Hotel,
  Store,
  Image,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useThemeColors } from "@/hooks/useTheme";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";

interface FiltersPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: any) => void;
  currentFilters?: any;
  availableCategories?: string[];
  availableLocations?: string[];
}

// Constants outside component to prevent recreation
const TALENT_TYPES = [
  {
    id: "mc",
    label: "MC",
    icon: Mic,
    color: "red",
    description: "Master of Ceremonies",
  },
  {
    id: "dj",
    label: "DJ",
    icon: Volume2,
    color: "pink",
    description: "Disc Jockey",
  },
  {
    id: "vocalist",
    label: "Vocalist",
    icon: Music,
    color: "green",
    description: "Singer",
  },
  {
    id: "personal",
    label: "Individual",
    icon: User,
    color: "blue",
    description: "Solo performer",
  },
  {
    id: "full",
    label: "Full Band",
    icon: Users2,
    color: "orange",
    description: "Complete band",
  },
  {
    id: "other",
    label: "Create Band",
    icon: Briefcase,
    color: "purple",
    description: "Custom band setup",
  },
  {
    id: "guitarist",
    label: "Guitarist",
    icon: Guitar,
    color: "amber",
    description: "Guitar player",
  },
  {
    id: "pianist",
    label: "Pianist",
    icon: Piano,
    color: "indigo",
    description: "Piano player",
  },
  {
    id: "drummer",
    label: "Drummer",
    icon: Drum,
    color: "cyan",
    description: "Drum player",
  },
];

const STATUS_OPTIONS = [
  { id: "all", label: "All Status" },
  { id: "available", label: "Available" },
  { id: "booked", label: "Booked" },
  { id: "pending", label: "Pending" },
] as const;

const PRICE_RANGES = [
  { id: "all", label: "Any Price" },
  { id: "0-500", label: "Under $500" },
  { id: "500-1000", label: "$500 - $1,000" },
  { id: "1000-2500", label: "$1,000 - $2,500" },
  { id: "2500-5000", label: "$2,500 - $5,000" },
  { id: "5000+", label: "$5,000+" },
] as const;

const EVENT_TYPES = [
  { id: "all", label: "Any Event" },
  { id: "wedding", label: "Wedding" },
  { id: "corporate", label: "Corporate" },
  { id: "concert", label: "Concert" },
  { id: "festival", label: "Festival" },
  { id: "party", label: "Party" },
  { id: "club", label: "Club" },
  { id: "private", label: "Private" },
] as const;

const DAYS_OF_WEEK = [
  { id: "monday", label: "Monday", short: "Mon" },
  { id: "tuesday", label: "Tuesday", short: "Tue" },
  { id: "wednesday", label: "Wednesday", short: "Wed" },
  { id: "thursday", label: "Thursday", short: "Thu" },
  { id: "friday", label: "Friday", short: "Fri" },
  { id: "saturday", label: "Saturday", short: "Sat" },
  { id: "sunday", label: "Sunday", short: "Sun" },
] as const;

const DEFAULT_FILTERS = {
  search: "",
  category: "all",
  location: "all",
  talentTypes: [] as string[],
  priceRange: "",
  status: "",
  negotiable: false,
  showOnlyActive: true,
  sortBy: "newest",
  dateRange: "",
  priceMin: 0,
  priceMax: 10000,
  tags: [] as string[],
  rating: 0,
  distance: 50,
  experienceLevel: [] as string[],
  equipmentRequired: false,
  travelIncluded: false,
  depositRequired: false,
  urgency: "",
  clientType: "",
  eventType: "",
  audienceSize: "",
  duration: "",
  timeOfDay: "",
  dayOfWeek: [] as string[],
  language: [] as string[],
  genre: [] as string[],
  instruments: [] as string[],
};

// Memoized section component
const FilterSection = memo(
  ({
    title,
    icon: Icon,
    isOpen,
    onToggle,
    children,
    badge,
    colors,
  }: {
    title: string;
    icon: any;
    isOpen: boolean;
    onToggle: () => void;
    children: React.ReactNode;
    badge?: string;
    colors: any;
  }) => (
    <div
      className="rounded-xl border overflow-hidden mb-4"
      style={{ borderColor: colors.border }}
    >
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:opacity-80 transition-all"
        style={{ backgroundColor: colors.backgroundMuted }}
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          <div
            className="p-2 rounded-lg"
            style={{ backgroundColor: colors.card }}
          >
            <Icon className="w-4 h-4" style={{ color: colors.primary }} />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium" style={{ color: colors.text }}>
              {title}
            </span>
            {badge && (
              <Badge variant="outline" className="text-xs">
                {badge}
              </Badge>
            )}
          </div>
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4" style={{ color: colors.textMuted }} />
        ) : (
          <ChevronDown
            className="w-4 h-4"
            style={{ color: colors.textMuted }}
          />
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div
              className="p-4 border-t"
              style={{ borderColor: colors.border }}
            >
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  ),
);

FilterSection.displayName = "FilterSection";

// Memoized talent type grid
const TalentTypeGrid = memo(
  ({
    selectedTypes,
    onToggle,
    colors,
  }: {
    selectedTypes: string[];
    onToggle: (id: string) => void;
    colors: any;
  }) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {TALENT_TYPES.map((talent) => {
        const Icon = talent.icon;
        const isSelected = selectedTypes.includes(talent.id);

        return (
          <button
            key={talent.id}
            onClick={() => onToggle(talent.id)}
            className={cn(
              "p-3 rounded-lg border flex flex-col items-center gap-2 transition-all duration-200 hover:scale-105",
              isSelected
                ? "border-transparent shadow-lg bg-gradient-to-br from-orange-500 to-red-500 text-white"
                : "border-gray-200 dark:border-gray-800 hover:border-orange-500/50",
            )}
            style={{
              backgroundColor: isSelected ? undefined : colors.backgroundMuted,
              color: isSelected ? "white" : colors.text,
            }}
          >
            <Icon className="w-5 h-5" />
            <span className="text-sm font-medium text-center">
              {talent.label}
            </span>
          </button>
        );
      })}
    </div>
  ),
);

TalentTypeGrid.displayName = "TalentTypeGrid";

// Memoized day pills component
const DayPills = memo(
  ({
    selectedDays,
    onToggle,
    colors,
  }: {
    selectedDays: string[];
    onToggle: (id: string) => void;
    colors: any;
  }) => (
    <div className="flex flex-wrap gap-2">
      {DAYS_OF_WEEK.map((day) => {
        const isSelected = selectedDays.includes(day.id);
        return (
          <button
            key={day.id}
            onClick={() => onToggle(day.id)}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm font-medium transition-all",
              isSelected
                ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md"
                : cn(
                    "border",
                    colors.border,
                    colors.hoverBg,
                    "hover:border-orange-500/50",
                  ),
            )}
            style={{ color: isSelected ? colors.primaryContrast : colors.text }}
          >
            {day.short}
          </button>
        );
      })}
    </div>
  ),
);

DayPills.displayName = "DayPills";

// Memoized active filters display
const ActiveFiltersDisplay = memo(
  ({
    filters,
    onClearAll,
    colors,
  }: {
    filters: any;
    onClearAll: () => void;
    colors: any;
  }) => {
    const activeFilters = useMemo(() => {
      const filtersList = [];
      if (filters.search) filtersList.push(`Search: "${filters.search}"`);
      if (filters.category !== "all")
        filtersList.push(`Category: ${filters.category}`);
      if (filters.location !== "all")
        filtersList.push(`Location: ${filters.location}`);
      if (filters.talentTypes.length > 0)
        filtersList.push(`${filters.talentTypes.length} talent types`);
      if (filters.priceRange) filtersList.push(`Price: ${filters.priceRange}`);
      if (filters.status) filtersList.push(`Status: ${filters.status}`);
      if (filters.negotiable) filtersList.push(`Negotiable only`);
      if (filters.dayOfWeek.length > 0)
        filtersList.push(`${filters.dayOfWeek.length} days selected`);
      return filtersList;
    }, [filters]);

    if (activeFilters.length === 0) return null;

    return (
      <div
        className="mb-6 p-4 rounded-lg border"
        style={{ borderColor: colors.border }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4" style={{ color: colors.primary }} />
            <span
              className="text-sm font-medium"
              style={{ color: colors.text }}
            >
              Active Filters
            </span>
            <Badge variant="secondary">{activeFilters.length}</Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="gap-1 text-xs h-7"
            style={{ color: colors.textMuted }}
          >
            <RotateCcw className="w-3 h-3" />
            Clear All
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {activeFilters.map((filter, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {filter}
            </Badge>
          ))}
        </div>
      </div>
    );
  },
);

ActiveFiltersDisplay.displayName = "ActiveFiltersDisplay";

export const FiltersPanel: React.FC<FiltersPanelProps> = ({
  isOpen,
  onClose,
  onApplyFilters,
  currentFilters = {},
  availableCategories = [],
  availableLocations = [],
}) => {
  const { colors } = useThemeColors();
  const [localFilters, setLocalFilters] = useState(() => ({
    ...DEFAULT_FILTERS,
    ...currentFilters,
  }));

  const [isLoading, setIsLoading] = useState(false);

  // Reset filters when panel opens
  useEffect(() => {
    if (isOpen) {
      setLocalFilters((prev: any) => ({
        ...prev,
        ...currentFilters,
      }));
    }
  }, [isOpen, currentFilters]);

  // Memoized handlers
  const handleFilterChange = useCallback((key: string, value: any) => {
    setLocalFilters((prev: any) => {
      // Skip update if value hasn't changed
      if (prev[key as keyof typeof prev] === value) return prev;
      return { ...prev, [key]: value };
    });
  }, []);

  const handleArrayFilterChange = useCallback((key: string, itemId: string) => {
    setLocalFilters((prev: any) => {
      const currentArray = (prev[key as keyof typeof prev] as string[]) || [];
      // Skip update if array state hasn't changed
      const newArray = currentArray.includes(itemId)
        ? currentArray.filter((id) => id !== itemId)
        : [...currentArray, itemId];

      // Only update if array actually changed
      if (
        newArray.length === currentArray.length &&
        newArray.every((v, i) => v === currentArray[i])
      ) {
        return prev;
      }

      return { ...prev, [key]: newArray };
    });
  }, []);

  const [expandedSections, setExpandedSections] = useState({
    talent: false,
    price: false,
    location: false,
    requirements: false,
    advanced: false,
  });

  type SectionId = keyof typeof expandedSections;

  const toggleSection = useCallback((sectionId: SectionId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  }, []);

  const handleResetFilters = useCallback(() => {
    setLocalFilters(DEFAULT_FILTERS);
    toast.info("All filters have been reset");
  }, []);

  const handleApplyFilters = useCallback(() => {
    setIsLoading(true);
    // Simulate API call delay
    setTimeout(() => {
      onApplyFilters(localFilters);
      setIsLoading(false);
      toast.success("Filters applied successfully!");
    }, 500);
  }, [localFilters, onApplyFilters]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (localFilters.search) count++;
    if (localFilters.category !== "all") count++;
    if (localFilters.location !== "all") count++;
    if (localFilters.talentTypes.length > 0) count++;
    if (localFilters.priceRange) count++;
    if (localFilters.status) count++;
    if (localFilters.negotiable) count++;
    if (localFilters.dayOfWeek.length > 0) count++;
    return count;
  }, [localFilters]);

  // Memoized filter badge
  const talentBadge = useMemo(
    () =>
      localFilters.talentTypes.length > 0
        ? `${localFilters.talentTypes.length} selected`
        : undefined,
    [localFilters.talentTypes.length],
  );

  const dayBadge = useMemo(
    () =>
      localFilters.dayOfWeek.length > 0
        ? `${localFilters.dayOfWeek.length} days`
        : undefined,
    [localFilters.dayOfWeek.length],
  );

  return (
    <TooltipProvider>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
            />

            {/* Panel */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25 }}
              className={cn(
                "fixed left-0 top-0 h-full w-full max-w-md z-50 overflow-hidden shadow-2xl",
                colors.background,
              )}
            >
              {/* Header */}
              <div
                className="border-b p-6"
                style={{ borderColor: colors.border }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <SlidersHorizontal
                      className="w-6 h-6"
                      style={{ color: colors.primary }}
                    />
                    <div>
                      <h2
                        className="text-xl font-bold"
                        style={{ color: colors.text }}
                      >
                        Advanced Filters
                      </h2>
                      <p
                        className="text-sm mt-1"
                        style={{ color: colors.textMuted }}
                      >
                        Refine your gig search with precision
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg hover:opacity-80 transition-all"
                    style={{ backgroundColor: colors.hoverBg }}
                  >
                    <X
                      className="w-5 h-5"
                      style={{ color: colors.textMuted }}
                    />
                  </button>
                </div>
              </div>

              {/* Content Area */}
              <ScrollArea className="h-[calc(100%-180px)]">
                <div className="p-6">
                  <ActiveFiltersDisplay
                    filters={localFilters}
                    onClearAll={handleResetFilters}
                    colors={colors}
                  />

                  {/* Search */}
                  <div className="mb-6">
                    <div className="relative">
                      <Search
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
                        style={{ color: colors.textMuted }}
                      />
                      <Input
                        value={localFilters.search}
                        onChange={(e) =>
                          handleFilterChange("search", e.target.value)
                        }
                        placeholder="Search gigs by title, description, tags..."
                        className="pl-10"
                        style={{
                          borderColor: colors.border,
                          backgroundColor: colors.backgroundMuted,
                          color: colors.text,
                        }}
                      />
                      {localFilters.search && (
                        <button
                          onClick={() => handleFilterChange("search", "")}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:opacity-80"
                          style={{ color: colors.textMuted }}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Talent Type */}
                  <FilterSection
                    title="Talent Type"
                    icon={Users}
                    isOpen={expandedSections.talent}
                    onToggle={() => toggleSection("talent")}
                    badge={talentBadge}
                    colors={colors}
                  >
                    <TalentTypeGrid
                      selectedTypes={localFilters.talentTypes}
                      onToggle={(id) =>
                        handleArrayFilterChange("talentTypes", id)
                      }
                      colors={colors}
                    />
                  </FilterSection>

                  {/* Price & Budget */}
                  <FilterSection
                    title="Price & Budget"
                    icon={DollarSign}
                    isOpen={expandedSections.price}
                    onToggle={() => toggleSection("price")}
                    colors={colors}
                  >
                    <div className="space-y-4">
                      <Select
                        value={localFilters.status}
                        onValueChange={(value) =>
                          handleFilterChange("status", value)
                        }
                      >
                        <SelectTrigger
                          style={{
                            borderColor: colors.border,
                            backgroundColor: colors.background,
                            color: colors.text,
                          }}
                        >
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent
                          style={{
                            backgroundColor: colors.background,
                            borderColor: colors.border,
                          }}
                        >
                          {STATUS_OPTIONS.map((status) => (
                            <SelectItem key={status.id} value={status.id}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select
                        value={localFilters.priceRange}
                        onValueChange={(value) =>
                          handleFilterChange("priceRange", value)
                        }
                      >
                        <SelectTrigger
                          style={{
                            borderColor: colors.border,
                            backgroundColor: colors.background,
                            color: colors.text,
                          }}
                        >
                          <SelectValue placeholder="Select price range" />
                        </SelectTrigger>
                        <SelectContent
                          style={{
                            backgroundColor: colors.background,
                            borderColor: colors.border,
                          }}
                        >
                          {PRICE_RANGES.map((range) => (
                            <SelectItem key={range.id} value={range.id}>
                              {range.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span
                            className="text-sm"
                            style={{ color: colors.textMuted }}
                          >
                            Min: ${localFilters.priceMin.toLocaleString()}
                          </span>
                          <span
                            className="text-sm"
                            style={{ color: colors.textMuted }}
                          >
                            Max: ${localFilters.priceMax.toLocaleString()}
                          </span>
                        </div>
                        <Slider
                          value={[localFilters.priceMin, localFilters.priceMax]}
                          min={0}
                          max={10000}
                          step={100}
                          onValueChange={([min, max]) => {
                            handleFilterChange("priceMin", min);
                            handleFilterChange("priceMax", max);
                          }}
                          className="w-full"
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="negotiable"
                          checked={localFilters.negotiable}
                          onCheckedChange={(checked) =>
                            handleFilterChange("negotiable", checked)
                          }
                          style={{
                            backgroundColor: localFilters.negotiable
                              ? colors.primary
                              : colors.border,
                          }}
                        />
                        <Label
                          htmlFor="negotiable"
                          className="text-sm"
                          style={{ color: colors.text }}
                        >
                          Negotiable Only
                        </Label>
                      </div>
                    </div>
                  </FilterSection>

                  {/* Location & Date */}
                  <FilterSection
                    title="Location & Date"
                    icon={MapPin}
                    isOpen={expandedSections.location}
                    onToggle={() => toggleSection("location")}
                    colors={colors}
                  >
                    <div className="space-y-4">
                      <div>
                        <Label
                          className="text-sm mb-2 block"
                          style={{ color: colors.text }}
                        >
                          Location
                        </Label>
                        <Select
                          value={localFilters.location}
                          onValueChange={(value) =>
                            handleFilterChange("location", value)
                          }
                        >
                          <SelectTrigger
                            style={{
                              borderColor: colors.border,
                              backgroundColor: colors.background,
                              color: colors.text,
                            }}
                          >
                            <SelectValue placeholder="Select location" />
                          </SelectTrigger>
                          <SelectContent
                            style={{
                              backgroundColor: colors.background,
                              borderColor: colors.border,
                            }}
                          >
                            <SelectItem value="all">All Locations</SelectItem>
                            {availableLocations.map((location) => (
                              <SelectItem key={location} value={location}>
                                {location}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label
                          className="text-sm mb-2 block"
                          style={{ color: colors.text }}
                        >
                          Days of Week
                        </Label>
                        <DayPills
                          selectedDays={localFilters.dayOfWeek}
                          onToggle={(id) =>
                            handleArrayFilterChange("dayOfWeek", id)
                          }
                          colors={colors}
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="equipmentRequired"
                          checked={localFilters.equipmentRequired}
                          onCheckedChange={(checked) =>
                            handleFilterChange("equipmentRequired", checked)
                          }
                          style={{
                            backgroundColor: localFilters.equipmentRequired
                              ? colors.primary
                              : colors.border,
                          }}
                        />
                        <Label
                          htmlFor="equipmentRequired"
                          className="text-sm"
                          style={{ color: colors.text }}
                        >
                          Equipment Provided
                        </Label>
                      </div>
                    </div>
                  </FilterSection>

                  {/* Event Details */}
                  <FilterSection
                    title="Event Details"
                    icon={Calendar}
                    isOpen={expandedSections.requirements}
                    onToggle={() => toggleSection("requirements")}
                    colors={colors}
                  >
                    <div className="space-y-4">
                      <Select
                        value={localFilters.eventType}
                        onValueChange={(value) =>
                          handleFilterChange("eventType", value)
                        }
                      >
                        <SelectTrigger
                          style={{
                            borderColor: colors.border,
                            backgroundColor: colors.background,
                            color: colors.text,
                          }}
                        >
                          <SelectValue placeholder="Select event type" />
                        </SelectTrigger>
                        <SelectContent
                          style={{
                            backgroundColor: colors.background,
                            borderColor: colors.border,
                          }}
                        >
                          {EVENT_TYPES.map((event) => (
                            <SelectItem key={event.id} value={event.id}>
                              {event.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="showOnlyActive"
                          checked={localFilters.showOnlyActive}
                          onCheckedChange={(checked) =>
                            handleFilterChange("showOnlyActive", checked)
                          }
                          style={{
                            backgroundColor: localFilters.showOnlyActive
                              ? colors.primary
                              : colors.border,
                          }}
                        />
                        <Label
                          htmlFor="showOnlyActive"
                          className="text-sm"
                          style={{ color: colors.text }}
                        >
                          Show Active Gigs Only
                        </Label>
                      </div>
                    </div>
                  </FilterSection>

                  {/* Advanced Options */}
                  <FilterSection
                    title="Advanced Options"
                    icon={Settings}
                    isOpen={expandedSections.advanced}
                    onToggle={() => toggleSection("advanced")}
                    colors={colors}
                  >
                    <div className="space-y-4">
                      <div>
                        <Label
                          className="text-sm mb-2 block"
                          style={{ color: colors.text }}
                        >
                          Minimum Rating
                        </Label>
                        <div className="flex items-center gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => handleFilterChange("rating", star)}
                              className="text-xl transition-transform hover:scale-110"
                              style={{
                                color:
                                  star <= localFilters.rating
                                    ? "#fbbf24"
                                    : colors.textMuted,
                              }}
                            >
                              ★
                            </button>
                          ))}
                          <span
                            className="text-sm ml-2"
                            style={{ color: colors.text }}
                          >
                            {localFilters.rating}+
                          </span>
                        </div>
                      </div>

                      <div>
                        <Label
                          className="text-sm mb-2 block"
                          style={{ color: colors.text }}
                        >
                          Max Distance (km)
                        </Label>
                        <Slider
                          value={[localFilters.distance]}
                          min={0}
                          max={500}
                          step={10}
                          onValueChange={([value]) =>
                            handleFilterChange("distance", value)
                          }
                          className="w-full"
                        />
                        <div
                          className="flex justify-between text-sm mt-2"
                          style={{ color: colors.textMuted }}
                        >
                          <span>0 km</span>
                          <span>{localFilters.distance} km</span>
                          <span>500 km</span>
                        </div>
                      </div>
                    </div>
                  </FilterSection>
                </div>
              </ScrollArea>

              {/* Footer */}
              <div
                className="absolute bottom-0 left-0 right-0 border-t p-4"
                style={{
                  borderColor: colors.border,
                  backgroundColor: colors.background,
                }}
              >
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={handleResetFilters}
                    className="flex-1 gap-2"
                    style={{
                      borderColor: colors.border,
                      color: colors.text,
                    }}
                    disabled={activeFiltersCount === 0}
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reset All
                  </Button>
                  <Button
                    onClick={handleApplyFilters}
                    disabled={isLoading}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Applying...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        Apply Filters ({activeFiltersCount})
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </TooltipProvider>
  );
};

export default FiltersPanel;
