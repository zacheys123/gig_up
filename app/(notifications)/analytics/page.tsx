// app/notifications/page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function NotificationsPage() {
  const searchParams = useSearchParams();
  const [notificationData, setNotificationData] = useState(null);

  const type = searchParams.get("type");
  const viewerId = searchParams.get("viewerId");
  const viewerUsername = searchParams.get("viewerUsername");
  const source = searchParams.get("source");
  const action = searchParams.get("action");
  const gigId = searchParams.get("gigId");

  useEffect(() => {
    // You can fetch additional data based on the parameters
    if (type === "profile_view" && viewerId) {
      // Fetch viewer details or show profile view analytics
      fetchViewerAnalytics(viewerId);
    }

    if (type === "follow_request" && action === "pending") {
      // Show pending follow requests section
      showPendingRequests();
    }
  }, [type, viewerId, action]);

  const renderNotificationContent = () => {
    switch (type) {
      case "profile_view":
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Profile View Analytics</h1>
            <p>Someone viewed your profile:</p>
            <div className="mt-4 p-4 bg-gray-100 rounded-lg">
              <p>
                <strong>Viewer:</strong> {viewerUsername}
              </p>
              <p>
                <strong>Source:</strong> {source}
              </p>
              {/* Show profile view stats, recent viewers, etc. */}
            </div>
          </div>
        );

      case "follow_request":
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Follow Requests</h1>
            {action === "pending" && (
              <div>
                <p>Manage your pending follow requests</p>
                {/* Show pending requests component */}
              </div>
            )}
          </div>
        );

      case "gig_invite":
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Gig Invitation</h1>
            <p>You have a new gig invitation</p>
            {/* Show gig details and action buttons */}
          </div>
        );

      default:
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">All Notifications</h1>
            {/* Show general notifications list */}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8">
        {renderNotificationContent()}
      </div>
    </div>
  );
}
