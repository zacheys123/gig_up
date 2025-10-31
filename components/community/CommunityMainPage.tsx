// app/community/page.tsx
"use client";
import React, { useState } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { VideoFeed } from "./CommunityFeed";
import { DeputySearch } from "./DeputySearch";
import { MyDeputies } from "./MyDeputies";
import { PendingRequests } from "./PendingRequests";

const CommunityMainPage = () => {
  const [activeTab, setActiveTab] = useState("videos");
  const { user } = useCurrentUser();

  const renderActiveTab = () => {
    switch (activeTab) {
      case "videos":
        return <VideoFeed currentUserId={user?._id} />;
      case "deputies":
        return <DeputySearch user={user} />;
      case "my-deputies":
        return <MyDeputies user={user} />;
      case "requests":
        return <PendingRequests user={user} />;
      case "gigs":
        return <PendingRequests user={user} />;
      default:
        return <VideoFeed currentUserId={user?._id} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Community Hub
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Connect with musicians, share performances, and build your network
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            {[
              { id: "videos", label: "🎵 Videos" },
              { id: "deputies", label: "👥 Find Deputies" },
              { id: "my-deputies", label: "🤝 My Deputies" },
              { id: "requests", label: "📥 Requests" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div>{renderActiveTab()}</div>
      </div>
    </div>
  );
};

export default CommunityMainPage;
