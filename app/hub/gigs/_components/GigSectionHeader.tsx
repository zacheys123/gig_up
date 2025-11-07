// components/gigs/GigSectionHeader.tsx
"use client";
import React from "react";
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
    // New simplified stats
    total?: number;
    used?: number;
    musicians?: number;
    bookings?: number;
    templates?: number;

    // Legacy stats for backward compatibility
    active?: number;
    completed?: number;
    pending?: number;
  };
  actions?: React.ReactNode;
  children?: React.ReactNode;
  sampleData?: Array<any>;
  showStats?: boolean;
  showSampleData?: boolean;
  onAction?: (action: string) => void;
}

export const GigSectionHeader: React.FC<GigSectionHeaderProps> = ({
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
}) => {
  const { colors } = useThemeColors();

  // Default actions based on type - UPDATED FOR INSTANT GIGS
  const getDefaultActions = () => {
    switch (type) {
      case "urgent-gigs":
        return (
          <div className="flex gap-3">
            <Button
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              onClick={() => onAction?.("create-urgent")}
            >
              <Zap className="w-4 h-4 mr-2" />
              Create Template
            </Button>
            <Button
              variant="outline"
              onClick={() => onAction?.("browse-musicians")}
            >
              <Users className="w-4 h-4 mr-2" />
              Browse Musicians
            </Button>
          </div>
        );

      case "all-gigs":
        return (
          <div className="flex gap-3">
            <Button
              className="bg-blue-500 hover:bg-blue-600"
              onClick={() => onAction?.("search")}
            >
              <Search className="w-4 h-4 mr-2" />
              Search Gigs
            </Button>
            <Button variant="outline" onClick={() => onAction?.("filter")}>
              <Users className="w-4 h-4 mr-2" />
              Filter by Type
            </Button>
          </div>
        );

      case "my-gigs":
        return (
          <Button
            className="bg-green-500 hover:bg-green-600"
            onClick={() => onAction?.("create")}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Gig
          </Button>
        );

      case "template-management":
        return (
          <Button
            className="bg-teal-500 hover:bg-teal-600"
            onClick={() => onAction?.("create-template")}
          >
            <HiTemplate className="w-4 h-4 mr-2" />
            New Template
          </Button>
        );

      default:
        return (
          <Button variant="outline" onClick={() => onAction?.("explore")}>
            Explore Features
          </Button>
        );
    }
  };

  // Default sample data for instant gigs - UPDATED
  const getDefaultSampleData = () => {
    switch (type) {
      case "urgent-gigs":
        return [
          {
            title: "Wedding Ceremony",
            type: "Wedding",
            budget: "KES 25,000 - 40,000",
            duration: "3-4 hours",
            icon: "💒",
          },
          {
            title: "Corporate Gala",
            type: "Corporate",
            budget: "KES 35,000 - 60,000",
            duration: "4 hours",
            icon: "🏢",
          },
          {
            title: "Private Party",
            type: "Party",
            budget: "KES 20,000 - 35,000",
            duration: "3 hours",
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
  };
  // SIMPLE FIX - Update the default case
  const getRelevantStats = () => {
    switch (type) {
      case "urgent-gigs":
        return [
          {
            value: stats.templates ?? stats.total ?? 0,
            label: "Templates",
            color: "blue",
            icon: HiTemplate,
          },
          { value: stats.used ?? 0, label: "Used", color: "green", icon: Zap },
          {
            value: stats.musicians ?? 0,
            label: "Musicians",
            color: "purple",
            icon: Users,
          },
          {
            value: stats.bookings ?? 0,
            label: "Bookings",
            color: "amber",
            icon: Calendar,
          },
        ];
      default:
        // For other gig types, use available stats with sensible defaults
        return [
          {
            value: stats.templates ?? stats.active ?? 0,
            label: "Active",
            color: "blue",
            icon: HiTemplate,
          },
          {
            value: stats.used ?? 0,
            label: "Completed",
            color: "green",
            icon: Zap,
          },
          {
            value: stats.musicians ?? stats.pending ?? 0,
            label: "Pending",
            color: "amber",
            icon: Users,
          },
          {
            value: stats.bookings ?? stats.total ?? 0,
            label: "Total",
            color: "purple",
            icon: Calendar,
          },
        ];
    }
  };

  const displaySampleData = sampleData || getDefaultSampleData();
  const displayActions = actions || getDefaultActions();
  const relevantStats = getRelevantStats();

  return (
    <div className={cn("rounded-2xl", colors.card, colors.border, "border")}>
      {/* Header */}
      <div className={cn("p-6 border-b", colors.border)}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className={cn("text-2xl font-bold", colors.text)}>{title}</h2>
            <p className={cn("mt-1", colors.textMuted)}>{description}</p>
          </div>
          {displayActions}
        </div>
      </div>

      {/* Custom Children Content */}
      {children && <div className="p-6">{children}</div>}

      {/* Sample Data (only shown when no children and showSampleData is true) */}
      {!children && showSampleData && (
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {displaySampleData.map((item, index) => (
              <div
                key={index}
                className={cn(
                  "border rounded-xl p-5 hover:shadow-lg transition-all duration-200 hover:border-blue-300",
                  colors.border
                )}
              >
                {"icon" in item && (
                  <div className="text-2xl mb-3">{item.icon}</div>
                )}
                {"title" in item ? (
                  <>
                    <h3
                      className={cn("font-semibold mb-2 text-lg", colors.text)}
                    >
                      {item.title}
                    </h3>
                    <div className={cn("space-y-2 text-sm", colors.textMuted)}>
                      {"type" in item && (
                        <div className="flex items-center gap-2">
                          <Music className="w-4 h-4" />
                          <span>{item.type}</span>
                        </div>
                      )}
                      {"budget" in item && (
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          <span>{item.budget}</span>
                        </div>
                      )}
                      {"duration" in item && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{item.duration}</span>
                        </div>
                      )}
                      {"applicants" in item && (
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span>{item.applicants} applicants</span>
                        </div>
                      )}
                      {"status" in item && (
                        <div className="inline-block px-2 py-1 text-xs bg-amber-100 text-amber-800 rounded-full">
                          {item.status}
                        </div>
                      )}
                    </div>
                  </>
                ) : "name" in item ? (
                  <>
                    <h3 className={cn("font-semibold mb-2", colors.text)}>
                      {item.name}
                    </h3>
                    <div className={cn("space-y-1 text-sm", colors.textMuted)}>
                      <div>Role: {item.role}</div>
                      {"rating" in item && <div>Rating: ⭐ {item.rating}</div>}
                      {"applied" in item && <div>Applied: {item.applied}</div>}
                    </div>
                  </>
                ) : null}
              </div>
            ))}
          </div>

          {/* Empty State Illustration - UPDATED FOR INSTANT GIGS */}
          <div
            className={cn(
              "text-center py-12 border-2 border-dashed rounded-xl",
              colors.border,
              "bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20"
            )}
          >
            <div className="w-20 h-20 mx-auto mb-4 text-blue-500">
              {type === "urgent-gigs" ? (
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
            <h4 className={cn("text-xl font-semibold mb-2", colors.text)}>
              {type === "urgent-gigs"
                ? "Ready to Create Your First Template?"
                : `${title} Content`}
            </h4>
            <p className={cn("max-w-md mx-auto mb-6", colors.textMuted)}>
              {type === "urgent-gigs"
                ? "Create custom gig templates and book premium musicians in seconds. Start with examples or build from scratch."
                : `This section will display ${description.toLowerCase()}. The actual content and functionality will be implemented here.`}
            </p>
            <div className="flex justify-center gap-3">
              <Button variant="outline" size="sm">
                Learn More
              </Button>
              <Button size="sm" className="bg-blue-500 hover:bg-blue-600">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Section - UPDATED WITH NEW STATS */}
      {showStats && (
        <div className={cn("p-6 border-t", colors.border)}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
  );
};

// UPDATED: Enhanced StatCard with optional icons
const StatCard: React.FC<{
  value: number | string;
  label: string;
  color: string;
  icon?: React.ComponentType<any>;
}> = ({ value, label, color, icon: Icon }) => {
  const { colors } = useThemeColors();

  const colorClasses = {
    blue: "text-blue-600 dark:text-blue-400",
    green: "text-green-600 dark:text-green-400",
    amber: "text-amber-600 dark:text-amber-400",
    purple: "text-purple-600 dark:text-purple-400",
  };

  const bgColorClasses = {
    blue: "bg-blue-500/10",
    green: "bg-green-500/10",
    amber: "bg-amber-500/10",
    purple: "bg-purple-500/10",
  };

  return (
    <div
      className={cn(
        "text-center p-4 rounded-xl transition-all duration-200 hover:scale-105",
        bgColorClasses[color as keyof typeof bgColorClasses]
      )}
    >
      {Icon && (
        <div
          className={cn(
            "w-8 h-8 mx-auto mb-2 rounded-lg flex items-center justify-center",
            bgColorClasses[color as keyof typeof bgColorClasses]
          )}
        >
          <Icon
            className={cn(
              "w-4 h-4",
              colorClasses[color as keyof typeof colorClasses]
            )}
          />
        </div>
      )}
      <div
        className={cn(
          "text-2xl font-bold mb-1",
          colorClasses[color as keyof typeof colorClasses]
        )}
      >
        {value}
      </div>
      <div className={cn("text-sm font-medium", colors.textMuted)}>{label}</div>
    </div>
  );
};

// Icon components
const CalendarIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1}
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);

const DollarSignIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1}
      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
    />
  </svg>
);

const ApplicationsIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1}
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);

const CrewIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1}
      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
    />
  </svg>
);
