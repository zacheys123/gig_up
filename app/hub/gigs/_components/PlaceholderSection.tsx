// components/gigs/PlaceholderSection.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, Search, Users, Calendar, DollarSign } from "lucide-react";
import { Book } from "react-feather";

interface PlaceholderSectionProps {
  title: string;
  description: string;
  user: any;
  type: string;
}

export const PlaceholderSection: React.FC<PlaceholderSectionProps> = ({
  title,
  description,
  user,
  type,
}) => {
  const getActionButtons = () => {
    switch (type) {
      case "all-gigs":
        return (
          <div className="flex gap-3">
            <Button className="bg-blue-500 hover:bg-blue-600">
              <Search className="w-4 h-4 mr-2" />
              Search Gigs
            </Button>
            <Button variant="outline">
              <Users className="w-4 h-4 mr-2" />
              Filter by Type
            </Button>
          </div>
        );

      case "my-gigs":
        return (
          <Button className="bg-green-500 hover:bg-green-600">
            <Plus className="w-4 h-4 mr-2" />
            Create New Gig
          </Button>
        );

      case "pending-gigs":
        return (
          <Button variant="outline">
            <Calendar className="w-4 h-4 mr-2" />
            View Calendar
          </Button>
        );

      case "booked-gigs":
        return (
          <Button variant="outline">
            <DollarSign className="w-4 h-4 mr-2" />
            Track Payments
          </Button>
        );

      case "pre-booking":
        return (
          <div className="flex gap-3">
            <Button className="bg-purple-500 hover:bg-purple-600">
              <Users className="w-4 h-4 mr-2" />
              View Applicants
            </Button>
            <Button variant="outline">Message All</Button>
          </div>
        );

      case "booker-applications":
        return (
          <Button className="bg-orange-500 hover:bg-orange-600">
            <Search className="w-4 h-4 mr-2" />
            Find New Gigs
          </Button>
        );

      case "active-projects":
        return (
          <Button className="bg-indigo-500 hover:bg-indigo-600">
            <Users className="w-4 h-4 mr-2" />
            Manage Crew
          </Button>
        );

      case "crew-management":
        return (
          <Button className="bg-teal-500 hover:bg-teal-600">
            <Plus className="w-4 h-4 mr-2" />
            Add Musicians
          </Button>
        );
      case "urgent-gigs":
        return (
          <Button className="bg-teal-500 hover:bg-teal-600">
            <Book className="w-4 h-4 mr-2" />
            create urgent Gigs
          </Button>
        );
      case "my-invites":
        return (
          <Button className="bg-teal-500 hover:bg-teal-600">
            <Plus className="w-4 h-4 mr-2" />
            All invited Gigs
          </Button>
        );

      default:
        return <Button variant="outline">Explore Features</Button>;
    }
  };

  const getSampleData = () => {
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
          { title: "Hotel Lounge", applied: "3 days ago", status: "Viewed" },
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
          { title: "Sample Item 1", detail: "Information will appear here" },
          { title: "Sample Item 2", detail: "Content loading soon" },
          { title: "Sample Item 3", detail: "Data will be displayed here" },
        ];
    }
  };

  const sampleData = getSampleData();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {title}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {description}
            </p>
          </div>
          {getActionButtons()}
        </div>
      </div>

      {/* Sample Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {sampleData.map((item, index) => (
            <div
              key={index}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              {"title" in item ? (
                <>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {item.title}
                  </h3>
                  <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
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
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {item.name}
                  </h3>
                  <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
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
        <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
          <div className="w-24 h-24 mx-auto mb-4 text-gray-400">
            {type.includes("gigs") && (
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            )}
            {type.includes("payment") && (
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                />
              </svg>
            )}
            {type.includes("applications") && (
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            )}
            {type.includes("crew") && (
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            )}
          </div>
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {title} Content
          </h4>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
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

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              0
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Active
            </div>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              0
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Completed
            </div>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              0
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Pending
            </div>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              $0
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
