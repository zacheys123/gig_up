"use client";
import { useState } from "react";
import {
  FiFilter,
  FiX,
  FiChevronDown,
  FiUserCheck,
  FiMusic,
  FiCheck,
  FiMapPin,
  FiTrendingUp,
  FiStar,
  FiUsers,
  FiHeadphones,
  FiVideo,
  FiList,
  FiCalendar,
  FiMessageCircle,
} from "react-icons/fi";
import { motion } from "framer-motion";
import { useThemeColors } from "@/hooks/useTheme";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface FilterState {
  roleType: string[];
  instrument: string[];
  discoveryType: string[];
  clientOnly: boolean;
  musicianOnly: boolean;
}

interface SearchFiltersProps {
  onFilterChange: (filters: FilterState) => void;
}

// Custom switch component
const CustomSwitch = ({
  checked,
  onCheckedChange,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) => {
  return (
    <button
      onClick={() => onCheckedChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
        checked
          ? "bg-yellow-500 focus:ring-yellow-500"
          : "bg-red-500 focus:ring-red-500"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
};

// Discovery features - fair, unbiased filtering
const discoveryFeatures = [
  {
    id: "new-talents",
    label: "New on GigUp",
    icon: <FiUsers className="w-4 h-4" />,
    description: "Recently joined musicians",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  {
    id: "featured-this-week",
    label: "Featured",
    icon: <FiStar className="w-4 h-4" />,
    description: "Weekly featured artists",
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
  },
  {
    id: "near-you",
    label: "Nearby",
    icon: <FiMapPin className="w-4 h-4" />,
    description: "Musicians in your area",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    id: "similar-style",
    label: "Similar Style",
    icon: <FiMusic className="w-4 h-4" />,
    description: "Matches your musical taste",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  {
    id: "trending-instruments",
    label: "Trending",
    icon: <FiTrendingUp className="w-4 h-4" />,
    description: "Popular instruments right now",
    color: "text-red-500",
    bgColor: "bg-red-500/10",
  },
];

// Primary discovery actions - what actually matters
const primaryDiscovery = [
  {
    id: "has-audio",
    label: "Listen to Music",
    icon: <FiHeadphones className="w-4 h-4" />,
    description: "Has audio samples",
  },
  {
    id: "has-videos",
    label: "Watch Performances",
    icon: <FiVideo className="w-4 h-4" />,
    description: "Has video demos",
  },
  {
    id: "has-repertoire",
    label: "See Repertoire",
    icon: <FiList className="w-4 h-4" />,
    description: "Has song list/genres",
  },
  {
    id: "is-available",
    label: "Check Availability",
    icon: <FiCalendar className="w-4 h-4" />,
    description: "Available for bookings",
  },
  {
    id: "quick-response",
    label: "Message Directly",
    icon: <FiMessageCircle className="w-4 h-4" />,
    description: "Quick responder",
  },
];

const SearchFilters = ({ onFilterChange }: SearchFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterState>({
    roleType: [],
    instrument: [],
    discoveryType: [],
    clientOnly: false,
    musicianOnly: false,
  });

  const { colors } = useThemeColors();

  // Available filter options - only objective criteria
  const roleTypes = ["instrumentalist", "vocalist", "dj", "mc"];
  const instruments = [
    "guitar",
    "piano",
    "drums",
    "bass",
    "violin",
    "saxophone",
    "trumpet",
  ];

  const toggleStringFilter = (
    category: "roleType" | "instrument" | "discoveryType",
    value: string
  ) => {
    const newFilters = { ...activeFilters };
    const index = newFilters[category].indexOf(value);

    if (index === -1) {
      newFilters[category].push(value);
    } else {
      newFilters[category].splice(index, 1);
    }

    setActiveFilters(newFilters);
    onFilterChange(newFilters);
  };

  const toggleBooleanFilter = (
    category: "clientOnly" | "musicianOnly",
    value: boolean
  ) => {
    const newFilters = {
      ...activeFilters,
      [category]: value,
      // Ensure only one of clientOnly/musicianOnly can be true at a time
      ...(category === "clientOnly" && value ? { musicianOnly: false } : {}),
      ...(category === "musicianOnly" && value ? { clientOnly: false } : {}),
    };

    setActiveFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters: FilterState = {
      roleType: [],
      instrument: [],
      discoveryType: [],
      clientOnly: false,
      musicianOnly: false,
    };
    setActiveFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const filterButtonStyle = {
    backgroundColor: colors.background,
    borderColor: colors.border,
    color: colors.text,
  };

  const filterButtonHoverStyle = {
    backgroundColor: colors.hoverBg,
    color: colors.text,
  };

  const dropdownStyle = {
    backgroundColor: colors.background,
    borderColor: colors.border,
  };

  const headerStyle = {
    backgroundColor: colors.background,
    borderColor: colors.border,
    color: colors.text,
  };

  const sectionStyle = {
    borderColor: colors.border,
  };

  const textStyle = {
    color: colors.text,
  };

  // Count active filters for the badge
  const activeFilterCount = Object.values(activeFilters).filter((v) =>
    Array.isArray(v) ? v.length > 0 : v === true
  ).length;

  return (
    <div className="relative my-3">
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={filterButtonStyle}
        className="flex items-center gap-2 px-4 py-2 mb-4 rounded-lg border hover:bg-gray-50 transition-colors shadow-sm hover:text-gray-900 ml-[100px] whitespace-nowrap mt-10 !ml-18"
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor =
            filterButtonHoverStyle.backgroundColor;
          e.currentTarget.style.color = filterButtonHoverStyle.color;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor =
            filterButtonStyle.backgroundColor;
          e.currentTarget.style.color = filterButtonStyle.color;
        }}
      >
        <FiFilter style={{ color: colors.textMuted }} />
        <span className="font-medium">Discover Musicians</span>
        {activeFilterCount > 0 && (
          <span
            className="text-xs text-white rounded-full w-5 h-5 flex items-center justify-center"
            style={{ backgroundColor: colors.primary }}
          >
            {activeFilterCount}
          </span>
        )}
        <FiChevronDown
          style={{ color: colors.textMuted }}
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <motion.div
          initial={{ y: "-500px", opacity: 0 }}
          animate={{ y: ["70px", "50px", "30px", "50px", 0], opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          exit={{
            y: [0, "30px", "50px", "-200px"],
            opacity: 1,
            transition: { duration: 1, delay: 0.78 },
          }}
          style={dropdownStyle}
          className={cn(
            "absolute right-0 mt-2 w-76 rounded-lg shadow-lg border z-50 overflow-hidden",
            colors.card
          )}
        >
          <div
            style={headerStyle}
            className="p-4 border-b flex justify-between items-center"
          >
            <div className="flex items-center gap-2">
              <h3 className="font-medium">Discovery Options</h3>
              {activeFilterCount > 0 && (
                <span className="text-xs bg-blue-500 text-white rounded-full px-2 py-1">
                  {activeFilterCount} active
                </span>
              )}
            </div>
            <button
              onClick={clearFilters}
              className="text-xs flex items-center gap-1"
              style={{ color: colors.primary }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = "0.7";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = "1";
              }}
            >
              <FiX size={14} /> Clear all
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {/* Account Type Toggles */}
            <div style={sectionStyle} className="p-4 border-b">
              <label className="flex items-center justify-between cursor-pointer mb-3">
                <div className="flex items-center gap-2">
                  <FiMusic style={{ color: colors.textMuted }} />
                  <span className="text-sm font-medium" style={textStyle}>
                    Musicians Only
                  </span>
                  {activeFilters.musicianOnly && (
                    <FiCheck size={14} style={{ color: colors.primary }} />
                  )}
                </div>
                <CustomSwitch
                  checked={activeFilters.musicianOnly}
                  onCheckedChange={(checked) =>
                    toggleBooleanFilter("musicianOnly", checked)
                  }
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-2">
                  <FiUserCheck style={{ color: colors.textMuted }} />
                  <span className="text-sm font-medium" style={textStyle}>
                    Clients Only
                  </span>
                  {activeFilters.clientOnly && (
                    <FiCheck size={14} style={{ color: colors.primary }} />
                  )}
                </div>
                <CustomSwitch
                  checked={activeFilters.clientOnly}
                  onCheckedChange={(checked) =>
                    toggleBooleanFilter("clientOnly", checked)
                  }
                />
              </label>
            </div>

            {/* Discovery Features */}
            <div style={sectionStyle} className="p-4 border-b">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium" style={textStyle}>
                  Discover By
                </h4>
                {activeFilters.discoveryType.length > 0 && (
                  <span className="text-xs" style={{ color: colors.primary }}>
                    {activeFilters.discoveryType.length} selected
                  </span>
                )}
              </div>
              <div className="space-y-2">
                {discoveryFeatures.map((feature) => {
                  const isSelected = activeFilters.discoveryType.includes(
                    feature.id
                  );
                  return (
                    <button
                      key={feature.id}
                      onClick={() =>
                        toggleStringFilter("discoveryType", feature.id)
                      }
                      className={cn(
                        "flex items-center gap-3 w-full p-3 rounded-lg border transition-all duration-200",
                        "hover:scale-[1.02] hover:shadow-sm",
                        isSelected ? "ring-2 ring-amber-500" : ""
                      )}
                      style={{
                        backgroundColor: isSelected
                          ? feature.bgColor
                          : colors.background,
                        borderColor: isSelected
                          ? colors.primary
                          : colors.border,
                      }}
                    >
                      <div className={cn("p-2 rounded-lg", feature.bgColor)}>
                        <div className={feature.color}>{feature.icon}</div>
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn("text-sm font-medium", colors.text)}
                          >
                            {feature.label}
                          </span>
                          {isSelected && (
                            <FiCheck size={14} className={feature.color} />
                          )}
                        </div>
                        <p className={cn("text-xs", colors.textMuted)}>
                          {feature.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Role Type Filter */}
            <div style={sectionStyle} className="p-4 border-b">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium" style={textStyle}>
                  Role Type
                </h4>
                {activeFilters.roleType.length > 0 && (
                  <span className="text-xs" style={{ color: colors.primary }}>
                    {activeFilters.roleType.length} selected
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {roleTypes.map((role) => {
                  const isSelected = activeFilters.roleType.includes(role);
                  return (
                    <button
                      key={role}
                      onClick={() => toggleStringFilter("roleType", role)}
                      className={cn(
                        "text-xs px-3 py-2 rounded-full border transition-colors relative",
                        "flex items-center justify-center gap-1",
                        isSelected
                          ? "ring-2 ring-amber-300 bg-amber-800 text-white"
                          : ""
                      )}
                      style={{
                        backgroundColor: isSelected
                          ? colors.primary + "20"
                          : colors.background,
                        color: isSelected ? colors.primary : colors.text,
                        borderColor: isSelected
                          ? colors.primary
                          : colors.border,
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.backgroundColor =
                            colors.hoverBg;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.backgroundColor =
                            colors.background;
                        }
                      }}
                    >
                      {isSelected && <FiCheck size={12} />}
                      <span>
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Instrument Filter */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium" style={textStyle}>
                  Instruments
                </h4>
                {activeFilters.instrument.length > 0 && (
                  <span className="text-xs" style={{ color: colors.primary }}>
                    {activeFilters.instrument.length} selected
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {instruments.map((instrument) => {
                  const isSelected =
                    activeFilters.instrument.includes(instrument);
                  return (
                    <button
                      key={instrument}
                      onClick={() =>
                        toggleStringFilter("instrument", instrument)
                      }
                      className={cn(
                        "text-xs px-3 py-2 rounded-full border transition-colors",
                        "flex items-center justify-center gap-1",
                        isSelected
                          ? "ring-2 ring-amber-300 bg-purple-300 text-black"
                          : ""
                      )}
                      style={{
                        backgroundColor: isSelected
                          ? colors.textSecondary + "20" || "#8B5CF620"
                          : colors.background,
                        color: isSelected
                          ? colors.textSecondary || "#8B5CF6"
                          : colors.text,
                        borderColor: isSelected
                          ? colors.textSecondary || "#8B5CF6"
                          : colors.border,
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.backgroundColor =
                            colors.hoverBg;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.backgroundColor =
                            colors.background;
                        }
                      }}
                    >
                      {isSelected && <FiCheck size={12} />}
                      <span>
                        {instrument.charAt(0).toUpperCase() +
                          instrument.slice(1)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Primary Discovery Info */}
            {/* <div
              style={sectionStyle}
              className="p-4 border-t bg-amber-50 dark:bg-amber-950/20"
            >
              <h4 className="text-sm font-medium mb-3 text-amber-800 dark:text-amber-200">
                What Really Matters
              </h4>
              <div className="space-y-2">
                {primaryDiscovery.map((action) => (
                  <div
                    key={action.id}
                    className="flex items-center gap-3 text-sm"
                  >
                    <div className="text-amber-600 dark:text-amber-400">
                      {action.icon}
                    </div>
                    <div>
                      <span className="text-amber-800 dark:text-amber-200 font-medium">
                        {action.label}:{" "}
                      </span>
                      <span className="text-amber-700 dark:text-amber-300">
                        {action.description}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div> */}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default SearchFilters;
