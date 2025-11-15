// components/gigs/GigSectionHeader.tsx - UPDATED WITH ANIMATED COLLAPSING
"use client";
import React, { useMemo, memo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Search,
  Users,
  Calendar,
  DollarSign,
  Book,
  Music,
  Zap,
  Star,
  CheckCircle,
  Clock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useThemeColors } from "@/hooks/useTheme";
import { HiTemplate } from "react-icons/hi";

interface GigSectionHeaderProps {
  title: string;
  description: string;
  user: any;
  type: string;
  stats?: {
    total?: number;
    used?: number;
    musicians?: number;
    bookings?: number;
    templates?: number;
    active?: number;
    completed?: number;
    pending?: number;
    accepted?: number;
    declined?: number;
    deputySuggested?: number;
  };
  actions?: React.ReactNode;
  children?: React.ReactNode;
  sampleData?: Array<any>;
  showStats?: boolean;
  showSampleData?: boolean;
  onAction?: (action: string) => void;
  onScrollToTemplates?: () => void;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

// Memoize icon components
const CalendarIcon = memo(() => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1}
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
));

const DollarSignIcon = memo(() => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1}
      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
    />
  </svg>
));

const ApplicationsIcon = memo(() => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1}
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
));

const CrewIcon = memo(() => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1}
      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
    />
  </svg>
));

CalendarIcon.displayName = "CalendarIcon";
DollarSignIcon.displayName = "DollarSignIcon";
ApplicationsIcon.displayName = "ApplicationsIcon";
CrewIcon.displayName = "CrewIcon";

// Responsive StatCard component
const StatCard: React.FC<{
  value: number | string;
  label: string;
  color: string;
  icon?: React.ComponentType<any>;
}> = memo(({ value, label, color, icon: Icon }) => {
  const { colors } = useThemeColors();

  const colorClasses = {
    blue: {
      text: colors.infoText,
      bg: colors.infoBg,
      hover: colors.hoverBg,
    },
    green: {
      text: colors.successText,
      bg: colors.successBg,
      hover: colors.hoverBg,
    },
    amber: {
      text: colors.warningText,
      bg: colors.warningBg,
      hover: colors.hoverBg,
    },
    purple: {
      text: colors.primary,
      bg: colors.card,
      hover: colors.hoverBg,
    },
  };

  const colorConfig =
    colorClasses[color as keyof typeof colorClasses] || colorClasses.blue;

  return (
    <div
      className={cn(
        "text-center p-3 sm:p-4 rounded-xl transition-all duration-200",
        "hover:scale-105 transform-gpu",
        "min-w-0 flex-1", // Flex basis for responsive behavior
        colorConfig.bg,
        colorConfig.hover
      )}
    >
      {Icon && (
        <div
          className={cn(
            "w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1 sm:mb-2 rounded-lg flex items-center justify-center",
            colorConfig.bg
          )}
        >
          <Icon className={cn("w-3 h-3 sm:w-4 sm:h-4", colorConfig.text)} />
        </div>
      )}
      <div
        className={cn(
          "text-lg sm:text-xl lg:text-2xl font-bold mb-1",
          colorConfig.text
        )}
      >
        {value}
      </div>
      <div className={cn("text-xs sm:text-sm font-medium", colors.textMuted)}>
        {label}
      </div>
    </div>
  );
});

StatCard.displayName = "StatCard";

export const GigSectionHeader: React.FC<GigSectionHeaderProps> = memo(
  ({
    title,
    description,
    user,
    type,
    stats = {},
    actions,
    children,
    sampleData,
    showStats = true,
    showSampleData = true,
    onAction,
    collapsible = false,
    defaultCollapsed = false,
  }) => {
    const { colors } = useThemeColors();
    const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
    const [isAnimating, setIsAnimating] = useState(false);

    const toggleCollapse = () => {
      if (isAnimating) return;

      setIsAnimating(true);
      setIsCollapsed(!isCollapsed);

      // Reset animation state after transition completes
      setTimeout(() => {
        setIsAnimating(false);
      }, 300);
    };

    // Responsive default actions
    const defaultActions = useMemo(() => {
      const baseActions = {
        "create-gigs": (
          <div className="flex flex-col xs:flex-row gap-2 sm:gap-3 w-full xs:w-auto">
            <Button
              className={cn(
                "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700",
                colors.textInverted,
                "text-sm sm:text-base",
                "w-full xs:w-auto justify-center"
              )}
              onClick={() => onAction?.("create")}
              size="sm"
            >
              <Zap className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
              <span className="truncate">Create Template</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => onAction?.("browse-musicians")}
              className={cn(
                colors.border,
                colors.hoverBg,
                "text-sm sm:text-base",
                "w-full xs:w-auto justify-center"
              )}
              size="sm"
            >
              <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
              <span className="truncate">Browse</span>
            </Button>
          </div>
        ),

        "all-gigs": (
          <div className="flex flex-col xs:flex-row gap-2 sm:gap-3 w-full xs:w-auto">
            <Button
              className={cn(
                "bg-blue-500 hover:bg-blue-600",
                colors.textInverted,
                "text-sm sm:text-base",
                "w-full xs:w-auto justify-center"
              )}
              onClick={() => onAction?.("search")}
              size="sm"
            >
              <Search className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
              <span className="truncate">Search</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => onAction?.("filter")}
              className={cn(
                colors.border,
                colors.hoverBg,
                "text-sm sm:text-base",
                "w-full xs:w-auto justify-center"
              )}
              size="sm"
            >
              <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
              <span className="truncate">Filter</span>
            </Button>
          </div>
        ),

        "my-gigs": (
          <Button
            className={cn(
              "bg-green-500 hover:bg-green-600",
              colors.textInverted,
              "text-sm sm:text-base",
              "w-full xs:w-auto justify-center"
            )}
            onClick={() => onAction?.("create")}
            size="sm"
          >
            <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
            <span className="truncate">Create Gig</span>
          </Button>
        ),

        "template-management": (
          <Button
            className={cn(
              "bg-teal-500 hover:bg-teal-600",
              colors.textInverted,
              "text-sm sm:text-base",
              "w-full xs:w-auto justify-center"
            )}
            onClick={() => onAction?.("create-template")}
            size="sm"
          >
            <HiTemplate className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
            <span className="truncate">New Template</span>
          </Button>
        ),
      };

      return (
        baseActions[type as keyof typeof baseActions] || (
          <Button
            variant="outline"
            onClick={() => onAction?.("explore")}
            className={cn(
              colors.border,
              colors.hoverBg,
              "text-sm sm:text-base",
              "w-full xs:w-auto justify-center"
            )}
            size="sm"
          >
            Explore
          </Button>
        )
      );
    }, [type, onAction, colors]);

    // Memoize sample data
    const defaultSampleData = useMemo(() => {
      switch (type) {
        case "create-gigs":
          return [
            {
              title: "Wedding Ceremony",
              type: "Wedding",
              budget: "KES 25,000 - 40,000",
              duration: "3-4 hours",
              fromTime: "3pm",
              icon: "💒",
            },
            {
              title: "Corporate Gala",
              type: "Corporate",
              budget: "KES 35,000 - 60,000",
              duration: "4 hours",
              fromTime: "11am",
              icon: "🏢",
            },
            {
              title: "Private Party",
              type: "Party",
              budget: "KES 20,000 - 35,000",
              duration: "3 hours",
              fromTime: "9pm",
              icon: "🎉",
            },
          ];

        case "all-gigs":
          return [
            {
              title: "Weekend Jazz Festival",
              type: "Festival",
              budget: "KES 40,000",
              applicants: 12,
            },
            {
              title: "Corporate Event - Piano",
              type: "Corporate",
              budget: "KES 25,000",
              applicants: 8,
            },
            {
              title: "Wedding Ceremony",
              type: "Wedding",
              budget: "KES 30,000",
              applicants: 15,
            },
          ];

        case "my-gigs":
          return [
            {
              title: "Summer Music Festival",
              status: "Active",
              applicants: 23,
              date: "2024-07-15",
            },
            {
              title: "Restaurant Background Music",
              status: "Draft",
              applicants: 0,
              date: "2024-08-01",
            },
            {
              title: "Private Party Band",
              status: "Completed",
              applicants: 18,
              date: "2024-06-20",
            },
          ];

        default:
          return [
            {
              title: "Sample Item 1",
              detail: "Information will appear here",
            },
            {
              title: "Sample Item 2",
              detail: "Content loading soon",
            },
            {
              title: "Sample Item 3",
              detail: "Data will be displayed here",
            },
          ];
      }
    }, [type]);

    // Stats calculation
    const relevantStats = useMemo(() => {
      switch (type) {
        case "create-gigs":
        case "instant-gigs":
          return [
            {
              value: stats?.templates ?? 0,
              label: "Templates",
              color: "blue",
              icon: HiTemplate,
            },
            {
              value: stats?.accepted ?? stats?.used ?? 0,
              label: "Accepted",
              color: "green",
              icon: Zap,
            },
            {
              value: stats?.pending ?? 0,
              label: "Pending",
              color: "amber",
              icon: Users,
            },
            {
              value: stats?.total ?? stats?.bookings ?? 0,
              label: "Total",
              color: "purple",
              icon: Calendar,
            },
          ];

        case "my-gigs":
          return [
            {
              value: stats?.active ?? stats?.total ?? 0,
              label: "Active",
              color: "blue",
              icon: Zap,
            },
            {
              value: stats?.completed ?? stats?.accepted ?? 0,
              label: "Completed",
              color: "green",
              icon: CheckCircle,
            },
            {
              value: stats?.pending ?? 0,
              label: "Pending",
              color: "amber",
              icon: Clock,
            },
            {
              value: stats?.total ?? 0,
              label: "Total",
              color: "purple",
              icon: Calendar,
            },
          ];

        default:
          return [
            {
              value: stats?.templates ?? stats?.active ?? 0,
              label: "Active",
              color: "blue",
              icon: HiTemplate,
            },
            {
              value: stats?.completed ?? stats?.accepted ?? 0,
              label: "Completed",
              color: "green",
              icon: CheckCircle,
            },
            {
              value: stats?.pending ?? 0,
              label: "Pending",
              color: "amber",
              icon: Clock,
            },
            {
              value: stats?.total ?? 0,
              label: "Total",
              color: "purple",
              icon: Calendar,
            },
          ];
      }
    }, [type, stats]);

    const displaySampleData = sampleData || defaultSampleData;
    const displayActions = actions ? actions : defaultActions;

    return (
      <div
        className={cn(
          "rounded-2xl",
          colors.card,
          colors.border,
          "border",
          "shadow-sm",
          "w-full",
          "transition-all duration-300", // Add transition to main container
          isCollapsed ? "pb-0" : "pb-4" // Remove bottom padding when collapsed
        )}
      >
        {/* Header - Always visible */}
        <div className={cn("p-4 sm:p-6 border-b", colors.border)}>
          <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                {!collapsible && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleCollapse}
                    disabled={isAnimating}
                    className={cn(
                      "p-1 h-8 w-8 sm:h-10 sm:w-10 rounded-lg transition-all duration-200 flex-shrink-0",
                      colors.hoverBg,
                      isAnimating && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {isCollapsed ? (
                      <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300" />
                    ) : (
                      <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300" />
                    )}
                  </Button>
                )}
                <div className="min-w-0 flex-1">
                  <h2
                    className={cn(
                      "text-xl sm:text-2xl lg:text-3xl font-bold truncate",
                      colors.text
                    )}
                  >
                    {title}
                  </h2>
                  <p
                    className={cn(
                      "mt-1 text-sm sm:text-base",
                      colors.textMuted,
                      "line-clamp-2 sm:line-clamp-3"
                    )}
                  >
                    {description}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions - Responsive positioning */}
            <div className="w-full xs:w-auto">{displayActions}</div>
          </div>
        </div>

        <div
          className={cn(
            "transition-all duration-300 ease-in-out overflow-hidden",
            isCollapsed
              ? "max-h-0 opacity-0 -translate-y-2 scale-y-0 origin-top"
              : "max-h-[2000px] opacity-100 translate-y-0 scale-y-100 origin-top"
          )}
        >
          {/* Custom Children Content */}
          {children && (
            <div className="p-4 sm:p-6 animate-in slide-in-from-top-5 duration-300">
              {children}
            </div>
          )}

          {/* Sample Data Grid */}
          {!children && showSampleData && (
            <div className="p-4 sm:p-6 animate-in slide-in-from-top-5 duration-300 delay-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                {displaySampleData.map((item, index) => (
                  <div
                    key={index}
                    className={cn(
                      "border rounded-xl p-4 sm:p-5 transition-all duration-200",
                      "hover:shadow-lg transform-gpu hover:scale-105",
                      colors.border,
                      colors.hoverBg,
                      "hover:border-blue-300",
                      "animate-in slide-in-from-top-5 duration-300",
                      `delay-${(index % 3) * 100 + 150}` // Stagger animation
                    )}
                  >
                    {"icon" in item && (
                      <div className="text-2xl mb-3">{item.icon}</div>
                    )}
                    {"title" in item ? (
                      <>
                        <h3
                          className={cn(
                            "font-semibold mb-2 text-base sm:text-lg truncate",
                            colors.text
                          )}
                        >
                          {item.title}
                        </h3>
                        <div
                          className={cn(
                            "space-y-2 text-xs sm:text-sm",
                            colors.textMuted
                          )}
                        >
                          {"type" in item && (
                            <div className="flex items-center gap-2">
                              <Music className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                              <span className="truncate">{item.type}</span>
                            </div>
                          )}
                          {"budget" in item && (
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                              <span className="truncate">{item.budget}</span>
                            </div>
                          )}
                          {"duration" in item && (
                            <div className="flex items-center gap-2">
                              <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                              <span className="truncate">{item.duration}</span>
                            </div>
                          )}
                          {"applicants" in item && (
                            <div className="flex items-center gap-2">
                              <Users className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                              <span>{item.applicants} applicants</span>
                            </div>
                          )}
                          {"status" in item && (
                            <div
                              className={cn(
                                "inline-block px-2 py-1 text-xs rounded-full mt-2",
                                item.status === "Active"
                                  ? cn(
                                      "bg-green-100 text-green-800",
                                      colors.successBg,
                                      colors.successText
                                    )
                                  : item.status === "Draft"
                                    ? cn(
                                        "bg-amber-100 text-amber-800",
                                        colors.warningBg,
                                        colors.warningText
                                      )
                                    : cn(
                                        "bg-blue-100 text-blue-800",
                                        colors.infoBg,
                                        colors.infoText
                                      )
                              )}
                            >
                              {item.status}
                            </div>
                          )}
                        </div>
                      </>
                    ) : "name" in item ? (
                      <>
                        <h3
                          className={cn(
                            "font-semibold mb-2 truncate",
                            colors.text
                          )}
                        >
                          {item.name}
                        </h3>
                        <div
                          className={cn(
                            "space-y-1 text-xs sm:text-sm",
                            colors.textMuted
                          )}
                        >
                          <div className="truncate">Role: {item.role}</div>
                          {"rating" in item && (
                            <div className="flex items-center gap-1">
                              <span>Rating:</span>
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400 flex-shrink-0" />
                              <span>{item.rating}</span>
                            </div>
                          )}
                          {"applied" in item && (
                            <div className="truncate">
                              Applied: {item.applied}
                            </div>
                          )}
                        </div>
                      </>
                    ) : null}
                  </div>
                ))}
              </div>

              {/* Empty State Illustration */}
              <div
                className={cn(
                  "text-center py-8 sm:py-12 border-2 border-dashed rounded-xl",
                  colors.border,
                  colors.backgroundMuted,
                  "animate-in slide-in-from-top-5 duration-300 delay-300"
                )}
              >
                <div
                  className={cn(
                    "w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4",
                    colors.infoText
                  )}
                >
                  {type === "create-gigs" ? (
                    <HiTemplate className="w-full h-full" />
                  ) : type.includes("gigs") ? (
                    <CalendarIcon />
                  ) : type.includes("payment") ? (
                    <DollarSignIcon />
                  ) : type.includes("applications") ? (
                    <ApplicationsIcon />
                  ) : (
                    <CrewIcon />
                  )}
                </div>
                <h4
                  className={cn(
                    "text-lg sm:text-xl font-semibold mb-2 px-4",
                    colors.text
                  )}
                >
                  {type === "create-gigs"
                    ? "Ready to Create Your First Template?"
                    : `${title} Content`}
                </h4>
                <p
                  className={cn(
                    "max-w-md mx-auto mb-6 px-4 text-sm sm:text-base",
                    colors.textMuted
                  )}
                >
                  {type === "create-gigs"
                    ? "Create custom gig templates and book premium musicians in seconds. Start with examples or build from scratch."
                    : `This section will display ${description.toLowerCase()}. The actual content and functionality will be implemented here.`}
                </p>
                <div className="flex flex-col xs:flex-row justify-center gap-3 px-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      colors.border,
                      colors.hoverBg,
                      "w-full xs:w-auto justify-center"
                    )}
                  >
                    Learn More
                  </Button>
                  <Button
                    size="sm"
                    className={cn(
                      "bg-blue-500 hover:bg-blue-600",
                      colors.textInverted,
                      "w-full xs:w-auto justify-center"
                    )}
                  >
                    Get Started
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Stats Section */}
          {showStats && (
            <div
              className={cn(
                "p-4 sm:p-6 border-t",
                colors.border,
                "animate-in slide-in-from-top-5 duration-300 delay-200"
              )}
            >
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {relevantStats.map((stat, index) => (
                  <StatCard
                    key={index}
                    value={stat.value}
                    label={stat.label}
                    color={stat.color}
                    icon={stat.icon}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
);

GigSectionHeader.displayName = "GigSectionHeader";
