"use client";
import { cn } from "@/lib/utils";

// app/hub/gigs/_components/InstantGigs.tsx - UPDATED WITH PROPER LIMITS INTEGRATION

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  memo,
  useRef,
} from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Edit,
  Crown,
  Zap,
  Users,
  TrendingUp,
  BookOpen,
  CheckCircle,
} from "lucide-react";
// Create this new component in the same file or import it
export const NormalGigsTab = memo(
  ({ user, colors }: { user: any; colors: any }) => {
    const handleCreateNormalGig = useCallback(() => {
      // Redirect to your normal gig creation page
      window.location.href = "/hub/gigs/client/create"; // Adjust path as needed
    }, []);

    return (
      <div
        className={cn("rounded-2xl p-6", colors.card, colors.border, "border")}
      >
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-green-500 to-blue-500 rounded-2xl flex items-center justify-center">
            <Plus className="w-10 h-10 text-white" />
          </div>
          <h2 className={cn("text-3xl font-bold mb-4", colors.text)}>
            Create Normal Gig
          </h2>
          <p className={cn("text-lg mb-6 max-w-2xl mx-auto", colors.textMuted)}>
            Traditional gig creation with full customization and manual musician
            selection
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Left Column - Features */}
          <div className="space-y-6">
            <div>
              <h3 className={cn("text-xl font-bold mb-4", colors.text)}>
                Traditional Approach
              </h3>
              <div className="space-y-3">
                {[
                  "Full gig customization",
                  "Manual musician selection",
                  "Flexible scheduling",
                  "Custom pricing negotiation",
                  "Detailed requirements",
                  "Direct messaging with musicians",
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className={cn("text-sm", colors.text)}>
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* When to Use */}
            <div className={cn("rounded-xl p-4", colors.backgroundMuted)}>
              <h4 className={cn("font-semibold mb-3", colors.text)}>
                💡 Perfect for:
              </h4>
              <div className="space-y-2 text-sm">
                <div className={cn("flex items-center gap-2", colors.text)}>
                  <span>• Unique or one-time events</span>
                </div>
                <div className={cn("flex items-center gap-2", colors.text)}>
                  <span>• Specific musician requirements</span>
                </div>
                <div className={cn("flex items-center gap-2", colors.text)}>
                  <span>• Complex event details</span>
                </div>
                <div className={cn("flex items-center gap-2", colors.text)}>
                  <span>• Custom pricing negotiations</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Action & Comparison */}
          <div className="space-y-6">
            {/* Create Button */}
            <div className="text-center">
              <Button
                onClick={handleCreateNormalGig}
                className={cn(
                  "w-full py-6 text-lg font-semibold",
                  "bg-gradient-to-r from-green-500 to-blue-500",
                  "hover:from-green-600 hover:to-blue-600",
                  "text-white shadow-lg hover:shadow-xl",
                  "transition-all duration-300 hover:scale-105"
                )}
                size="lg"
              >
                <Plus className="w-6 h-6 mr-3" />
                Create Normal Gig
              </Button>
              <p className={cn("text-sm mt-3", colors.textMuted)}>
                Available to all users - Free, Pro, and Premium
              </p>
            </div>

            {/* Comparison */}
            <div className={cn("rounded-xl p-4 border", colors.border)}>
              <h4 className={cn("font-semibold mb-3 text-center", colors.text)}>
                ⚡ Instant vs 📝 Normal
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className={cn(colors.text)}>Speed:</span>
                  <div className="flex gap-2">
                    <span className="text-green-600 font-semibold">5 min</span>
                    <span className="text-blue-600 font-semibold">
                      15-30 min
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className={cn(colors.text)}>Flexibility:</span>
                  <div className="flex gap-2">
                    <span className="text-green-600 font-semibold">
                      Standard
                    </span>
                    <span className="text-blue-600 font-semibold">Full</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className={cn(colors.text)}>Musician Selection:</span>
                  <div className="flex gap-2">
                    <span className="text-green-600 font-semibold">Auto</span>
                    <span className="text-blue-600 font-semibold">Manual</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className={cn(colors.text)}>Best For:</span>
                  <div className="flex gap-2">
                    <span className="text-green-600 font-semibold">
                      Recurring
                    </span>
                    <span className="text-blue-600 font-semibold">Unique</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

NormalGigsTab.displayName = "NormalGigsTab";
