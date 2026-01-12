// components/gigs/tabs/HistoryTab.tsx
import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  History,
  Bookmark,
  ShoppingBag,
  XCircle,
  Eye,
  User,
} from "lucide-react";
import clsx from "clsx";

interface HistoryTabProps {
  selectedGigData: any;
  formatTime: (timestamp: number) => string;
  getStatusColor: (status: string) => string;
}

export const HistoryTab: React.FC<HistoryTabProps> = ({
  selectedGigData,
  formatTime,
  getStatusColor,
}) => {
  return (
    <div className="space-y-4">
      {selectedGigData.gig.bookingHistory &&
      selectedGigData.gig.bookingHistory.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Application History</CardTitle>
            <CardDescription>
              Timeline of all actions taken on this gig
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {selectedGigData.gig.bookingHistory
                .sort((a: any, b: any) => b.timestamp - a.timestamp)
                .map((entry: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 pb-4 border-b last:border-0"
                  >
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                      {entry.status === "shortlisted" ? (
                        <Bookmark className="w-4 h-4 text-green-600" />
                      ) : entry.status === "booked" ? (
                        <ShoppingBag className="w-4 h-4 text-purple-600" />
                      ) : entry.status === "rejected" ? (
                        <XCircle className="w-4 h-4 text-red-600" />
                      ) : entry.status === "viewed" ? (
                        <Eye className="w-4 h-4 text-blue-600" />
                      ) : (
                        <User className="w-4 h-4 text-gray-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {selectedGigData.userDetails.get(entry.userId)
                            ?.firstname ||
                            selectedGigData.userDetails.get(entry.userId)
                              ?.username ||
                            "Unknown User"}
                        </span>
                        <Badge
                          className={clsx(
                            "text-xs",
                            getStatusColor(entry.status)
                          )}
                        >
                          {entry.status?.charAt(0).toUpperCase() +
                            entry.status?.slice(1)}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {formatTime(entry.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {entry.notes}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <History className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No history yet</h3>
            <p className="text-gray-500">
              Actions you take on applicants will appear here
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
