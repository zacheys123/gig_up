// components/gigs/GigSectionHeader.tsx
"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, Search, Users, Calendar, DollarSign, Book } from "lucide-react";
import { cn } from "@/lib/utils";
import { useThemeColors } from "@/hooks/useTheme";

interface GigSectionHeaderProps {
  title: string;
  description: string;
  user: any;
  type: string;
  stats?: {
    active?: number;
    completed?: number;
    pending?: number;
    total?: number | string;
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

  // Default actions based on type
  const getDefaultActions = () => {
    switch (type) {
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

      case "pending-gigs":
        return (
          <Button variant="outline" onClick={() => onAction?.("calendar")}>
            <Calendar className="w-4 h-4 mr-2" />
            View Calendar
          </Button>
        );

      case "booked-gigs":
        return (
          <Button variant="outline" onClick={() => onAction?.("payments")}>
            <DollarSign className="w-4 h-4 mr-2" />
            Track Payments
          </Button>
        );

      case "pre-booking":
        return (
          <div className="flex gap-3">
            <Button
              className="bg-purple-500 hover:bg-purple-600"
              onClick={() => onAction?.("view-applicants")}
            >
              <Users className="w-4 h-4 mr-2" />
              View Applicants
            </Button>
            <Button variant="outline" onClick={() => onAction?.("message-all")}>
              Message All
            </Button>
          </div>
        );

      case "booker-applications":
        return (
          <Button
            className="bg-orange-500 hover:bg-orange-600"
            onClick={() => onAction?.("find-gigs")}
          >
            <Search className="w-4 h-4 mr-2" />
            Find New Gigs
          </Button>
        );

      case "active-projects":
        return (
          <Button
            className="bg-indigo-500 hover:bg-indigo-600"
            onClick={() => onAction?.("manage-crew")}
          >
            <Users className="w-4 h-4 mr-2" />
            Manage Crew
          </Button>
        );

      case "crew-management":
        return (
          <Button
            className="bg-teal-500 hover:bg-teal-600"
            onClick={() => onAction?.("add-musicians")}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Musicians
          </Button>
        );

      case "urgent-gigs":
        return (
          <Button
            className="bg-teal-500 hover:bg-teal-600"
            onClick={() => onAction?.("create-urgent")}
          >
            <Book className="w-4 h-4 mr-2" />
            Create Urgent Gigs
          </Button>
        );

      case "my-invites":
        return (
          <Button
            className="bg-teal-500 hover:bg-teal-600"
            onClick={() => onAction?.("view-invites")}
          >
            <Plus className="w-4 h-4 mr-2" />
            All Invited Gigs
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

  // Default sample data based on type
  const getDefaultSampleData = () => {
    switch (type) {
      case "all-gigs":
        return [
          {
            title: "Weekend Jazz Festival",
            type: "Festival",
            budget: "$800",
            applicants: 12,
          },
          {
            title: "Corporate Event - Piano",
            type: "Corporate",
            budget: "$500",
            applicants: 8,
          },
          {
            title: "Wedding Ceremony",
            type: "Wedding",
            budget: "$600",
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

      case "pending-gigs":
        return [
          {
            title: "Jazz Club Weekend",
            applied: "2 days ago",
            status: "Under Review",
          },
          {
            title: "University Concert",
            applied: "1 week ago",
            status: "Pending",
          },
          {
            title: "Hotel Lounge",
            applied: "3 days ago",
            status: "Viewed",
          },
        ];

      case "pre-booking":
        return [
          {
            name: "John Doe",
            role: "Guitarist",
            rating: "4.8",
            applied: "2 hours ago",
          },
          {
            name: "Sarah Wilson",
            role: "Booker",
            rating: "4.9",
            applied: "1 day ago",
          },
          {
            name: "Mike Chen",
            role: "Drummer",
            rating: "4.7",
            applied: "3 hours ago",
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

  const displaySampleData = sampleData || getDefaultSampleData();
  const displayActions = actions || getDefaultActions();

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
                  "border rounded-lg p-4 hover:shadow-md transition-shadow",
                  colors.border
                )}
              >
                {"title" in item ? (
                  <>
                    <h3 className={cn("font-semibold mb-2", colors.text)}>
                      {item.title}
                    </h3>
                    <div className={cn("space-y-1 text-sm", colors.textMuted)}>
                      {"type" in item && <div>Type: {item.type}</div>}
                      {"budget" in item && <div>Budget: {item.budget}</div>}
                      {"applicants" in item && (
                        <div>Applicants: {item.applicants}</div>
                      )}
                      {"status" in item && <div>Status: {item.status}</div>}
                      {"applied" in item && <div>Applied: {item.applied}</div>}
                      {"date" in item && <div>Date: {item.date}</div>}
                      {"detail" in item && <div>{item.detail}</div>}
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

          {/* Empty State Illustration */}
          <div
            className={cn(
              "text-center py-12 border-2 border-dashed rounded-lg",
              colors.border
            )}
          >
            <div className="w-24 h-24 mx-auto mb-4 text-gray-400">
              {/* Icons remain the same */}
              {type.includes("gigs") && <CalendarIcon />}
              {type.includes("payment") && <DollarSignIcon />}
              {type.includes("applications") && <ApplicationsIcon />}
              {type.includes("crew") && <CrewIcon />}
            </div>
            <h4 className={cn("text-lg font-medium mb-2", colors.text)}>
              {title} Content
            </h4>
            <p className={cn("max-w-md mx-auto", colors.textMuted)}>
              This section will display {description.toLowerCase()}. The actual
              content and functionality will be implemented here.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Button variant="outline" size="sm">
                Learn More
              </Button>
              <Button size="sm">Get Started</Button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Section */}
      {showStats && (
        <div className={cn("p-6 border-t", colors.border)}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard value={stats.active ?? 0} label="Active" color="blue" />
            <StatCard
              value={stats.completed ?? 0}
              label="Completed"
              color="green"
            />
            <StatCard
              value={stats.pending ?? 0}
              label="Pending"
              color="amber"
            />
            <StatCard
              value={stats.total ?? "$0"}
              label="Total"
              color="purple"
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Helper component for stats
const StatCard: React.FC<{
  value: number | string;
  label: string;
  color: string;
}> = ({ value, label, color }) => {
  const { colors } = useThemeColors();

  const colorClasses = {
    blue: "text-blue-600 dark:text-blue-400",
    green: "text-green-600 dark:text-green-400",
    amber: "text-amber-600 dark:text-amber-400",
    purple: "text-purple-600 dark:text-purple-400",
  };

  return (
    <div className={cn("text-center p-4 rounded-xl", colors.backgroundMuted)}>
      <div
        className={cn(
          "text-2xl font-bold",
          colorClasses[color as keyof typeof colorClasses]
        )}
      >
        {value}
      </div>
      <div className={cn("text-sm", colors.textMuted)}>{label}</div>
    </div>
  );
};

// Icon components (you can replace these with your actual icons)
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
