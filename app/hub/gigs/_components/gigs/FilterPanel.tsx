// components/gig/FiltersPanel.tsx
import React, { useState, useEffect, useRef } from "react";
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

const FiltersPanel: React.FC<FiltersPanelProps> = ({
  isOpen,
  onClose,
  onApplyFilters,
  currentFilters = {},
  availableCategories = [],
  availableLocations = [],
}) => {
  const { colors } = useThemeColors();

  const [localFilters, setLocalFilters] = useState({
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
    ...currentFilters,
  });

  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    talent: true,
    price: true,
    location: true,
    requirements: false,
    advanced: false,
  });

  const [isLoading, setIsLoading] = useState(false);

  // Talent types
  const talentTypes = [
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

  // Status options
  const statusOptions = [
    { id: "all", label: "All Status" },
    { id: "available", label: "Available" },
    { id: "booked", label: "Booked" },
    { id: "pending", label: "Pending" },
  ];

  // Price ranges
  const priceRanges = [
    { id: "all", label: "Any Price" },
    { id: "0-500", label: "Under $500" },
    { id: "500-1000", label: "$500 - $1,000" },
    { id: "1000-2500", label: "$1,000 - $2,500" },
    { id: "2500-5000", label: "$2,500 - $5,000" },
    { id: "5000+", label: "$5,000+" },
  ];

  // Event types
  const eventTypes = [
    { id: "all", label: "Any Event" },
    { id: "wedding", label: "Wedding" },
    { id: "corporate", label: "Corporate" },
    { id: "concert", label: "Concert" },
    { id: "festival", label: "Festival" },
    { id: "party", label: "Party" },
    { id: "club", label: "Club" },
    { id: "private", label: "Private" },
  ];

  // Days of week
  const daysOfWeek = [
    { id: "monday", label: "Monday", short: "Mon" },
    { id: "tuesday", label: "Tuesday", short: "Tue" },
    { id: "wednesday", label: "Wednesday", short: "Wed" },
    { id: "thursday", label: "Thursday", short: "Thu" },
    { id: "friday", label: "Friday", short: "Fri" },
    { id: "saturday", label: "Saturday", short: "Sat" },
    { id: "sunday", label: "Sunday", short: "Sun" },
  ];

  // Initialize with current filters
  useEffect(() => {
    if (isOpen) {
      setLocalFilters((prev: any) => ({
        ...prev,
        ...currentFilters,
      }));
    }
  }, [isOpen, currentFilters]);

  // Add refs to track scroll position
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);

  // ... rest of your state ...
  const handleResetFilters = () => {
    const resetFilters = {
      search: "",
      category: "all",
      location: "all",
      talentTypes: [] as string[],
      priceRange: "all",
      status: "all",
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
      eventType: "all",
      audienceSize: "",
      duration: "",
      timeOfDay: "",
      dayOfWeek: [] as string[],
      language: [] as string[],
      genre: [] as string[],
      instruments: [] as string[],
    };

    setLocalFilters(resetFilters);
    toast.info("All filters have been reset");
  };
  // Save scroll position before state changes
  const saveScrollPosition = () => {
    if (scrollAreaRef.current) {
      setScrollPosition(scrollAreaRef.current.scrollTop);
    }
  };

  // Restore scroll position after render
  useEffect(() => {
    if (scrollAreaRef.current && scrollPosition > 0) {
      scrollAreaRef.current.scrollTop = scrollPosition;
    }
  });

  // components/gig/FiltersPanel.tsx
  // Fix the arrow function syntax errors:

  // WRONG: (prev:any => ...)
  // CORRECT: ((prev: any) => ...)

  // In your useEffect:
  useEffect(() => {
    if (isOpen) {
      setLocalFilters((prev: any) => ({
        ...prev,
        ...currentFilters,
      }));
    }
  }, [isOpen, currentFilters]);

  // Initialize with current filters - FIXED
  useEffect(() => {
    if (isOpen) {
      setLocalFilters((prev: any) => ({
        ...prev,
        ...currentFilters,
      }));
    }
  }, [isOpen, currentFilters]);

  // Update handleFilterChange to save scroll position - FIXED
  const handleFilterChange = (key: string, value: any) => {
    saveScrollPosition(); // Save before state change
    setLocalFilters((prev: any) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Update handleArrayFilterChange to save scroll position - FIXED
  const handleArrayFilterChange = (key: string, itemId: string) => {
    saveScrollPosition(); // Save before state change
    setLocalFilters((prev: any) => {
      const currentArray = (prev[key as keyof typeof prev] as string[]) || [];
      const newArray = currentArray.includes(itemId)
        ? currentArray.filter((id) => id !== itemId)
        : [...currentArray, itemId];
      return {
        ...prev,
        [key]: newArray,
      };
    });
  };

  // Update your toggleSection function - FIXED
  const toggleSection = (sectionId: string) => {
    saveScrollPosition(); // Save before state change
    setExpandedSections((prev: any) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const handleApplyFilters = () => {
    setIsLoading(true);

    // Simulate API call delay
    setTimeout(() => {
      onApplyFilters(localFilters);
      setIsLoading(false);
      toast.success("Filters applied successfully!");
    }, 500);
  };

  const getActiveFiltersCount = () => {
    let count = 0;

    if (localFilters.search) count++;
    if (localFilters.category !== "all") count++;
    if (localFilters.location !== "all") count++;
    if (localFilters.talentTypes.length > 0) count++;
    if (localFilters.priceRange) count++;
    if (localFilters.status) count++;
    if (localFilters.negotiable) count++;
    if (localFilters.dateRange) count++;
    if (localFilters.priceMin > 0 || localFilters.priceMax < 10000) count++;
    if (localFilters.rating > 0) count++;
    if (localFilters.distance < 50) count++;
    if (localFilters.experienceLevel.length > 0) count++;
    if (localFilters.equipmentRequired) count++;
    if (localFilters.travelIncluded) count++;
    if (localFilters.depositRequired) count++;
    if (localFilters.urgency) count++;
    if (localFilters.clientType) count++;
    if (localFilters.eventType) count++;
    if (localFilters.audienceSize) count++;
    if (localFilters.duration) count++;
    if (localFilters.timeOfDay) count++;
    if (localFilters.dayOfWeek.length > 0) count++;
    if (localFilters.language.length > 0) count++;
    if (localFilters.genre.length > 0) count++;
    if (localFilters.instruments.length > 0) count++;

    return count;
  };

  const FilterSection = ({
    title,
    icon: Icon,
    isOpen,
    onToggle,
    children,
    badge,
  }: {
    title: string;
    icon: any;
    isOpen: boolean;
    onToggle: () => void;
    children: React.ReactNode;
    badge?: string;
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
  );

  const renderTalentTypeGrid = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {talentTypes.map((talent) => {
        const Icon = talent.icon;
        const isSelected = localFilters.talentTypes.includes(talent.id);

        return (
          <button
            key={talent.id}
            onClick={() => handleArrayFilterChange("talentTypes", talent.id)}
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
            {talent.description && (
              <span
                className={cn(
                  "text-xs text-center",
                  isSelected ? "text-white/80" : colors.textMuted,
                )}
              >
                {talent.description}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );

  const renderDayOfWeekPills = () => (
    <div className="flex flex-wrap gap-2">
      {daysOfWeek.map((day) => {
        const isSelected = localFilters.dayOfWeek.includes(day.id);
        return (
          <button
            key={day.id}
            onClick={() => handleArrayFilterChange("dayOfWeek", day.id)}
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
            style={{
              color: isSelected ? colors.primaryContrast : colors.text,
            }}
          >
            {day.short}
          </button>
        );
      })}
    </div>
  );

  const renderActiveFilters = () => {
    const activeFilters = [];

    if (localFilters.search)
      activeFilters.push(`Search: "${localFilters.search}"`);
    if (localFilters.category !== "all")
      activeFilters.push(`Category: ${localFilters.category}`);
    if (localFilters.location !== "all")
      activeFilters.push(`Location: ${localFilters.location}`);
    if (localFilters.talentTypes.length > 0)
      activeFilters.push(`${localFilters.talentTypes.length} talent types`);
    if (localFilters.priceRange)
      activeFilters.push(`Price: ${localFilters.priceRange}`);
    if (localFilters.status)
      activeFilters.push(`Status: ${localFilters.status}`);
    if (localFilters.negotiable) activeFilters.push(`Negotiable only`);
    if (localFilters.dayOfWeek.length > 0)
      activeFilters.push(`${localFilters.dayOfWeek.length} days selected`);

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
            onClick={handleResetFilters}
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
  };

  return (
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
            className="fixed left-0 top-0 h-full w-full max-w-md z-50 overflow-hidden shadow-2xl"
            style={{ backgroundColor: colors.background }}
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
                  <X className="w-5 h-5" style={{ color: colors.textMuted }} />
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="h-[calc(100%-180px)] overflow-y-auto">
              <ScrollArea
                className="h-full"
                ref={scrollAreaRef}
                onScroll={(e) => {
                  // You can optionally save scroll position on scroll
                  const target = e.target as HTMLDivElement;
                  setScrollPosition(target.scrollTop);
                }}
              >
                <div className="p-6">
                  {/* Active Filters Display */}
                  {renderActiveFilters()}

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
                    badge={`${localFilters.talentTypes.length} selected`}
                  >
                    {renderTalentTypeGrid()}
                  </FilterSection>

                  {/* Price & Budget */}
                  <FilterSection
                    title="Price & Budget"
                    icon={DollarSign}
                    isOpen={expandedSections.price}
                    onToggle={() => toggleSection("price")}
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
                          {statusOptions.map((status) => (
                            <SelectItem key={status.id} value={status.id}>
                              {" "}
                              {/* Now status.id is never empty */}
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {/* Price Range Select - Fix example */}
                      <Select
                        value={localFilters.priceRange}
                        onValueChange={(value) => {
                          saveScrollPosition();
                          handleFilterChange("priceRange", value);
                        }}
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
                          {priceRanges.map((range) => (
                            <SelectItem key={range.id} value={range.id}>
                              {" "}
                              {/* Now range.id is never empty */}
                              {range.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {/* Event Type Select - Fix example */}
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
                          {eventTypes.map((event) => (
                            <SelectItem key={event.id} value={event.id}>
                              {" "}
                              {/* Now event.id is never empty */}
                              {event.label}
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

                      <div className="grid grid-cols-2 gap-4">
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

                        <div className="flex items-center space-x-2">
                          <Switch
                            id="depositRequired"
                            checked={localFilters.depositRequired}
                            onCheckedChange={(checked) =>
                              handleFilterChange("depositRequired", checked)
                            }
                            style={{
                              backgroundColor: localFilters.depositRequired
                                ? colors.primary
                                : colors.border,
                            }}
                          />
                          <Label
                            htmlFor="depositRequired"
                            className="text-sm"
                            style={{ color: colors.text }}
                          >
                            Deposit Required
                          </Label>
                        </div>
                      </div>
                    </div>
                  </FilterSection>

                  {/* Location & Date */}
                  <FilterSection
                    title="Location & Date"
                    icon={MapPin}
                    isOpen={expandedSections.location}
                    onToggle={() => toggleSection("location")}
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
                        {renderDayOfWeekPills()}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
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

                        <div className="flex items-center space-x-2">
                          <Switch
                            id="travelIncluded"
                            checked={localFilters.travelIncluded}
                            onCheckedChange={(checked) =>
                              handleFilterChange("travelIncluded", checked)
                            }
                            style={{
                              backgroundColor: localFilters.travelIncluded
                                ? colors.primary
                                : colors.border,
                            }}
                          />
                          <Label
                            htmlFor="travelIncluded"
                            className="text-sm"
                            style={{ color: colors.text }}
                          >
                            Travel Included
                          </Label>
                        </div>
                      </div>
                    </div>
                  </FilterSection>

                  {/* Event Details */}
                  <FilterSection
                    title="Event Details"
                    icon={Calendar}
                    isOpen={expandedSections.requirements}
                    onToggle={() => toggleSection("requirements")}
                  >
                    <div className="space-y-4">
                      <div>
                        <Label
                          className="text-sm mb-2 block"
                          style={{ color: colors.text }}
                        >
                          Event Type
                        </Label>
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
                            {eventTypes.map((event) => (
                              <SelectItem key={event.id} value={event.id}>
                                {event.label}
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
                          Status
                        </Label>
                        <Select
                          value={localFilters.status}
                          onValueChange={(value) => {
                            saveScrollPosition();
                            handleFilterChange("status", value);
                          }}
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
                            {statusOptions.map((status) => (
                              <SelectItem key={status.id} value={status.id}>
                                {status.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

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
            </div>

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
                  disabled={getActiveFiltersCount() === 0}
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
                      Apply Filters ({getActiveFiltersCount()})
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default FiltersPanel;
