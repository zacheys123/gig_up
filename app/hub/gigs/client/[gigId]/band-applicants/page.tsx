// app/gigs/[gigId]/band-applicants/page.tsx
"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useThemeColors } from "@/hooks/useTheme";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Users,
  Music,
  Star,
  MapPin,
  CheckCircle,
  Award,
  Eye,
  Bookmark,
  XCircle,
  ShoppingBag,
  Calendar,
  Clock,
  DollarSign,
  Filter,
} from "lucide-react";
import { toast } from "sonner";

export default function BandApplicantsPage() {
  const params = useParams();
  const router = useRouter();
  const { colors, isDarkMode } = useThemeColors();
  const gigId = params.gigId as Id<"gigs">;

  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");

  // Fetch gig data with applicants
  const gigData = useQuery(api.controllers.gigs.getGigWithApplicants, {
    gigId,
  });

  if (!gigData) {
    return (
      <div className="min-h-screen p-4 md:p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-12 w-64 bg-gray-200 dark:bg-gray-800 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-80 bg-gray-200 dark:bg-gray-800 rounded-lg"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const { gig, applicants, userDetails, shortlisted } = gigData;
  const filteredApplicants = applicants
    .filter((applicant: any) => {
      if (selectedRole === "all") return true;

      // Check if this is an individual applicant with bandRoleIndex
      if (
        applicant.bandRoleIndex !== undefined &&
        applicant.bandRoleIndex !== null
      ) {
        const role = gig.bandCategory?.[applicant.bandRoleIndex];
        return role?.role === selectedRole;
      }

      // Check if this is a band applicant with performingMembers
      if (
        applicant.performingMembers &&
        Array.isArray(applicant.performingMembers)
      ) {
        return applicant.performingMembers.some(
          (member: any) => member.role === selectedRole
        );
      }

      // Check if it has a bandRole property directly
      if (applicant.bandRole) {
        return applicant.bandRole === selectedRole;
      }

      return false;
    })
    .sort((a: any, b: any) => {
      // Get user ID for rating/experience lookup - handle both types
      const getUserId = (applicant: any): string | undefined => {
        // Individual applicants
        if (applicant.userId) return applicant.userId;
        // Band applicants
        if (applicant.appliedBy) return applicant.appliedBy;
        // Fallback for any other structure
        return undefined;
      };

      const aUserId = getUserId(a);
      const bUserId = getUserId(b);

      switch (sortBy) {
        case "newest":
          return (b.appliedAt || 0) - (a.appliedAt || 0);

        case "rating":
          const aUser = aUserId ? userDetails.get(aUserId) : undefined;
          const bUser = bUserId ? userDetails.get(bUserId) : undefined;
          const aRating = aUser?.avgRating || 0;
          const bRating = bUser?.avgRating || 0;
          return bRating - aRating;

        case "experience":
          const aExpUser = aUserId ? userDetails.get(aUserId) : undefined;
          const bExpUser = bUserId ? userDetails.get(bUserId) : undefined;
          const aExp = aExpUser?.completedGigsCount || 0;
          const bExp = bExpUser?.completedGigsCount || 0;
          return bExp - aExp;

        default:
          return 0;
      }
    });
  const roles = gig.bandCategory || [];

  return (
    <div className="min-h-screen p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Gig
        </Button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className={cn("text-3xl font-bold", colors.text)}>
              {gig.title}
            </h1>
            <p className={cn("text-lg", colors.textMuted)}>
              Band Applicants • {applicants.length} Total Applications
            </p>
          </div>
          <Badge
            className={cn(
              "px-4 py-2 text-lg",
              isDarkMode
                ? "bg-gradient-to-r from-purple-900/50 to-pink-900/50"
                : "bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800"
            )}
          >
            <Music className="w-4 h-4 mr-2" />
            {roles.length} Band Roles
          </Badge>
        </div>
      </div>

      {/* Filters and Tabs */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Tabs value={selectedRole} onValueChange={setSelectedRole}>
              <TabsList className="w-full md:w-auto">
                <TabsTrigger value="all" className="flex-1 md:flex-none">
                  <Users className="w-4 h-4 mr-2" />
                  All ({applicants.length})
                </TabsTrigger>
                {roles.map((role, index) => (
                  <TabsTrigger
                    key={index}
                    value={role.role}
                    className="flex-1 md:flex-none"
                  >
                    {role.role} (
                    {
                      applicants.filter((a: any) => {
                        // Check if individual applicant with bandRoleIndex
                        if (a.bandRoleIndex !== undefined) {
                          return a.bandRoleIndex === index;
                        }

                        // Check if band applicant with performingMembers
                        if (
                          a.performingMembers &&
                          Array.isArray(a.performingMembers)
                        ) {
                          return a.performingMembers.some((member: any) => {
                            // You might need to adjust this logic based on how roles match
                            // If performingMembers have 'role' field, use that
                            // Or if they have 'instrument' that matches the role
                            return (
                              member.role === role.role ||
                              member.instrument === role.role ||
                              member.bandRole === role.role
                            );
                          });
                        }

                        return false;
                      }).length
                    }
                    )
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={cn(
                "px-3 py-2 rounded-lg border",
                isDarkMode
                  ? "bg-gray-800 border-gray-700 text-white"
                  : "bg-white border-gray-300"
              )}
            >
              <option value="newest">Newest First</option>
              <option value="rating">Highest Rating</option>
              <option value="experience">Most Experienced</option>
            </select>
            <Button variant="outline" size="icon">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Role Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {roles.map((role, index) => {
            const roleApplicants = applicants.filter(
              (a) => a.bandRoleIndex === index
            );
            const roleShortlisted = shortlisted.filter(
              (s: any) => s.bandRoleIndex === index
            );

            return (
              <Card
                key={index}
                className={cn(
                  "cursor-pointer hover:shadow-lg transition-shadow",
                  selectedRole === role.role && "ring-2 ring-purple-500"
                )}
                onClick={() => setSelectedRole(role.role)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center",
                          isDarkMode
                            ? "bg-purple-900/30 text-purple-300"
                            : "bg-purple-100 text-purple-600"
                        )}
                      >
                        <Music className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className={cn("font-bold", colors.text)}>
                          {role.role}
                        </h4>
                        <p className={cn("text-xs", colors.textMuted)}>
                          {role.filledSlots}/{role.maxSlots} filled
                        </p>
                      </div>
                    </div>
                    <Badge
                      className={cn(
                        roleApplicants.length > 0
                          ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300"
                      )}
                    >
                      {roleApplicants.length}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Applicants:</span>
                      <span className="font-semibold">
                        {roleApplicants.length}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Shortlisted:</span>
                      <span className="font-semibold text-green-600">
                        {roleShortlisted.length}
                      </span>
                    </div>
                    {role.price && (
                      <div className="flex justify-between text-sm">
                        <span>Rate:</span>
                        <span className="font-semibold text-purple-600">
                          ${role.price}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Applicants Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filteredApplicants.map((applicant) => {
          const user = userDetails.get(applicant.userId);
          if (!user) return null;

          const isShortlisted = shortlisted.some(
            (s: any) => s.userId === applicant.userId
          );
          const role = roles[applicant.bandRoleIndex];

          return (
            <motion.div
              key={applicant._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="group"
            >
              <Card
                className={cn(
                  "h-full overflow-hidden hover:shadow-xl transition-all duration-300",
                  isDarkMode
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-gray-200"
                )}
              >
                <CardContent className="p-6">
                  {/* Applicant Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={user.picture} />
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                          {user.firstname?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className={cn("font-bold", colors.text)}>
                            {user.firstname || user.username}
                          </h4>
                          {user.verifiedIdentity && (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {role?.role || "Band Member"}
                          </Badge>
                          {user.trustTier && user.trustTier !== "new" && (
                            <Badge
                              variant="secondary"
                              className="text-xs bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800"
                            >
                              <Award className="w-3 h-3 mr-1" />
                              {user.trustTier}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <Badge
                      className={cn(
                        "px-3 py-1",
                        applicant.status === "booked"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/50"
                          : applicant.status === "shortlisted"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900/50"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-900/50"
                      )}
                    >
                      {applicant.status}
                    </Badge>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    <div
                      className={cn(
                        "text-center p-3 rounded-lg",
                        isDarkMode ? "bg-gray-700/50" : "bg-gray-50"
                      )}
                    >
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className={cn("text-xs", colors.textMuted)}>
                          Rating
                        </span>
                      </div>
                      <p className={cn("text-lg font-bold", colors.text)}>
                        {user.avgRating?.toFixed(1) || "4.5"}
                      </p>
                    </div>
                    <div
                      className={cn(
                        "text-center p-3 rounded-lg",
                        isDarkMode ? "bg-gray-700/50" : "bg-gray-50"
                      )}
                    >
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Users className="w-4 h-4 text-blue-500" />
                        <span className={cn("text-xs", colors.textMuted)}>
                          Gigs
                        </span>
                      </div>
                      <p className={cn("text-lg font-bold", colors.text)}>
                        {user.completedGigsCount || 0}
                      </p>
                    </div>
                    <div
                      className={cn(
                        "text-center p-3 rounded-lg",
                        isDarkMode ? "bg-gray-700/50" : "bg-gray-50"
                      )}
                    >
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <DollarSign className="w-4 h-4 text-green-500" />
                        <span className={cn("text-xs", colors.textMuted)}>
                          Rate
                        </span>
                      </div>
                      <p className={cn("text-lg font-bold", colors.text)}>
                        ${user.rate?.baseRate || "Contact"}
                      </p>
                    </div>
                  </div>

                  {/* Location & Time */}
                  <div className="flex items-center justify-between text-sm mb-6">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className={colors.textMuted}>
                        {user.city || "Remote"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className={colors.textMuted}>
                        {new Date(applicant.appliedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          // View profile
                        }}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Profile
                      </Button>
                      <Button
                        size="sm"
                        className={cn(
                          "flex-1",
                          isShortlisted
                            ? "bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
                            : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                        )}
                        onClick={() => {
                          // Toggle shortlist
                          toast.success(
                            isShortlisted
                              ? "Removed from shortlist"
                              : "Added to shortlist"
                          );
                        }}
                      >
                        {isShortlisted ? (
                          <>
                            <XCircle className="w-4 h-4 mr-2" />
                            Remove
                          </>
                        ) : (
                          <>
                            <Bookmark className="w-4 h-4 mr-2" />
                            Shortlist
                          </>
                        )}
                      </Button>
                    </div>
                    <Button
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      onClick={() => {
                        // Book musician
                        toast.success("Booking initiated!");
                      }}
                    >
                      <ShoppingBag className="w-4 h-4 mr-2" />
                      Book This Role
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Empty State */}
      {filteredApplicants.length === 0 && (
        <div className="text-center py-16">
          <div
            className={cn(
              "w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6",
              isDarkMode ? "bg-gray-800" : "bg-gray-100"
            )}
          >
            <Users className="w-12 h-12 text-gray-500" />
          </div>
          <h3 className={cn("text-xl font-bold mb-2", colors.text)}>
            No applicants found
          </h3>
          <p className={cn("max-w-md mx-auto mb-6", colors.textMuted)}>
            {selectedRole === "all"
              ? "No one has applied to this gig yet."
              : `No applicants for the ${selectedRole} role.`}
          </p>
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Gig Overview
          </Button>
        </div>
      )}
    </div>
  );
}
