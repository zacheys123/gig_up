// components/YourAvailabilityStatus.tsx
"use client";

import React from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useThemeColors } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { Calendar, Users, Shield } from "lucide-react";

interface AvailabilityStatusProps {
  user: any;
  bookableDeputies: any[];
  onAvailabilityChange: (available: boolean) => void;
  isLoading?: boolean;
}

export const AvailabilityStatus: React.FC<AvailabilityStatusProps> = ({
  user,
  bookableDeputies,
  onAvailabilityChange,
  isLoading = false,
}) => {
  const { colors } = useThemeColors();
  const isAvailable = user?.availability === "available";

  return (
    <div className={cn("p-6 rounded-2xl border", colors.border, colors.card)}>
      <div className="flex items-start justify-between">
        <div className="space-y-4 flex-1">
          {/* Your Status */}
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "p-2 rounded-lg",
                isAvailable
                  ? "bg-green-500/10 text-green-600"
                  : "bg-amber-500/10 text-amber-600"
              )}
            >
              <Calendar className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className={cn("font-bold text-lg", colors.text)}>
                {isAvailable ? "Accepting Bookings" : "Currently Unavailable"}
              </h3>
              <p className={cn("text-sm", colors.textMuted)}>
                {isAvailable
                  ? "Clients can book you directly"
                  : `Clients can book your ${bookableDeputies.length} available deputies`}
              </p>
            </div>
          </div>

          {/* Deputy Status */}
          <div className="flex items-center gap-3">
            <div
              className={cn("p-2 rounded-lg", "bg-blue-500/10 text-blue-600")}
            >
              <Users className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <span className={cn("font-medium", colors.text)}>
                  Deputy Coverage:
                </span>
                <Badge
                  variant={
                    bookableDeputies.length > 0 ? "default" : "secondary"
                  }
                >
                  {bookableDeputies.length} available
                </Badge>
              </div>
              <p className={cn("text-sm", colors.textMuted)}>
                {bookableDeputies.length > 0
                  ? "These deputies can be booked when you're unavailable"
                  : "No deputies available for booking"}
              </p>
            </div>
          </div>

          {/* Quick Tip */}
          <div className="flex items-center gap-2 text-sm p-3 bg-amber-500/5 rounded-lg">
            <Shield className="w-4 h-4 text-amber-500" />
            <span className={colors.textMuted}>
              Tip: Go unavailable when you're on vacation, sick, or fully booked
            </span>
          </div>
        </div>

        {/* Toggle Switch */}
        <div className="flex flex-col items-end gap-2">
          <Switch
            checked={isAvailable}
            onCheckedChange={onAvailabilityChange}
            disabled={isLoading}
            className="data-[state=checked]:bg-green-500"
          />
          <span className={cn("text-xs", colors.textMuted)}>
            {isAvailable ? "Available" : "Unavailable"}
          </span>
        </div>
      </div>
    </div>
  );
};
