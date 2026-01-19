// app/gigs/[gigId]/band-applicants/page.tsx
"use client";

import React, { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
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
  User,
  X,
  Send,
  ChevronRight,
  Sparkles,
  Building2,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@clerk/nextjs";

export default function BandApplicantsPage() {
  const params = useParams();
  const router = useRouter();
  const { colors, isDarkMode, mounted } = useThemeColors();
  const { userId: clerkId } = useAuth(); // Extract clerkId from useAuth
  const gigId = params.gigId as Id<"gigs">;

  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [loadingBooking, setLoadingBooking] = useState(false);
  const [loadingUnbooking, setLoadingUnbooking] = useState(false);
  const [loadingRemoval, setLoadingRemoval] = useState(false);

  // Fetch gig data with applicants AND booked users
  const gigData = useQuery(api.controllers.gigs.getGigWithApplicants, {
    gigId,
  });

  // Extract data from gigData
  const { gig, applicants, bookedUsers, userDetails, shortlisted } =
    gigData || {};
  const roles = gig?.bandCategory || [];

  // Combine applicants and booked users for display
  const allUsers = useMemo(() => {
    if (!applicants || !bookedUsers) return [];

    const combined = [
      ...(applicants || []).map((a: any) => ({ ...a, isBooked: false })),
      ...(bookedUsers || []).map((b: any) => ({ ...b, isBooked: true })),
    ];

    // Sort by: booked users first, then by date (newest first)
    return combined.sort((a, b) => {
      // Booked users first
      if (a.isBooked && !b.isBooked) return -1;
      if (!a.isBooked && b.isBooked) return 1;

      // Then by date (newest first)
      const aDate = a.bookedAt || a.appliedAt || 0;
      const bDate = b.bookedAt || b.appliedAt || 0;
      return bDate - aDate;
    });
  }, [applicants, bookedUsers]);

  const removeFromRole = useMutation(
    api.controllers.bookings.withdrawFromBandRole
  );
  const bookForRole = useMutation(api.controllers.bookings.bookForBandRole);
  const unbookFromRole = useMutation(
    api.controllers.bookings.unbookFromBandRole
  );

  // Handle book for role
  const handleBookForRole = async (
    applicantUserId: Id<"users">,
    bandRoleIndex: number,
    bandRole: string,
    applicantName: string
  ) => {
    if (!clerkId) {
      toast.error("Please sign in to book musicians");
      return;
    }

    setLoadingBooking(true);
    try {
      const result = await bookForRole({
        gigId,
        userId: applicantUserId,
        bandRoleIndex,
        clerkId,
        reason: `Booked as ${bandRole}`,
      });

      toast.success(
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-semibold">Successfully Booked!</p>
            <p className="text-sm opacity-90">
              {applicantName} is now booked as {bandRole}
            </p>
          </div>
        </div>
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to book musician",
        {
          style: {
            background: colors.destructiveBg,
            color: colors.destructive,
            borderColor: colors.destructive,
          },
        }
      );
    } finally {
      setLoadingBooking(false);
    }
  };

  // Handle unbook from role
  const handleUnbookFromRole = async (
    userId: Id<"users">,
    bandRoleIndex: number,
    userName: string
  ) => {
    if (!clerkId) {
      toast.error("Please sign in");
      return;
    }

    setLoadingUnbooking(true);
    try {
      await unbookFromRole({
        gigId,
        userId,
        bandRoleIndex,
        clerkId,
        reason: "Unbooked by band leader",
      });
      toast.success(`${userName} has been unbooked from the role`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to unbook musician"
      );
    } finally {
      setLoadingUnbooking(false);
    }
  };

  // Handle remove from applicants
  const handleRemoveFromRole = async (
    applicantId: string,
    bandRoleIndex: number,
    userId: Id<"users">
  ) => {
    setLoadingRemoval(true);
    try {
      await removeFromRole({
        gigId,
        bandRoleIndex,
        userId,
        reason: "Removed by band leader",
      });
      toast.success("Applicant removed from role");
    } catch (error) {
      toast.error("Failed to remove from role");
      console.error("Error removing from role:", error);
    } finally {
      setLoadingRemoval(false);
    }
  };

  if (!mounted || !gigData || !gig) {
    return (
      <div
        className="min-h-screen p-4 md:p-8"
        style={{ backgroundColor: isDarkMode ? "#111827" : "#ffffff" }}
      >
        <div className="animate-pulse space-y-6">
          <div
            className="h-12 w-64 rounded"
            style={{
              backgroundColor: isDarkMode
                ? colors.borderSecondary
                : colors.borderLight,
            }}
          ></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-80 rounded-lg"
                style={{
                  backgroundColor: isDarkMode
                    ? colors.cardBgStart
                    : colors.cardBgStart,
                }}
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Filter users based on selected role and sort
  const filteredUsers = allUsers
    .filter((user: any) => {
      if (selectedRole === "all") return true;
      return user.bandRole === selectedRole;
    })
    .sort((a: any, b: any) => {
      const aUserId = a.userId;
      const bUserId = b.userId;
      const aUser = userDetails?.[aUserId];
      const bUser = userDetails?.[bUserId];

      switch (sortBy) {
        case "newest":
          const aDate = a.bookedAt || a.appliedAt || 0;
          const bDate = b.bookedAt || b.appliedAt || 0;
          return bDate - aDate;

        case "rating":
          const aRating = aUser?.avgRating || 0;
          const bRating = bUser?.avgRating || 0;
          return bRating - aRating;

        case "experience":
          const aExp = aUser?.completedGigsCount || 0;
          const bExp = bUser?.completedGigsCount || 0;
          return bExp - aExp;

        default:
          return 0;
      }
    });

  // Helper function for role colors
  const getRoleColors = (roleIndex: number) => {
    const rolePalette = [
      {
        bg: "rgba(59, 130, 246, 0.1)",
        text: "#1d4ed8",
        border: "rgba(59, 130, 246, 0.3)",
      },
      {
        bg: "rgba(16, 185, 129, 0.1)",
        text: "#047857",
        border: "rgba(16, 185, 129, 0.3)",
      },
      {
        bg: "rgba(236, 72, 153, 0.1)",
        text: "#be185d",
        border: "rgba(236, 72, 153, 0.3)",
      },
      {
        bg: "rgba(139, 92, 246, 0.1)",
        text: "#6d28d9",
        border: "rgba(139, 92, 246, 0.3)",
      },
      {
        bg: "rgba(249, 115, 22, 0.1)",
        text: "#c2410c",
        border: "rgba(249, 115, 22, 0.3)",
      },
      {
        bg: "rgba(245, 158, 11, 0.1)",
        text: "#b45309",
        border: "rgba(245, 158, 11, 0.3)",
      },
    ];

    const darkModePalette = [
      {
        bg: "rgba(96, 165, 250, 0.15)",
        text: "#93c5fd",
        border: "rgba(96, 165, 250, 0.3)",
      },
      {
        bg: "rgba(52, 211, 153, 0.15)",
        text: "#a7f3d0",
        border: "rgba(52, 211, 153, 0.3)",
      },
      {
        bg: "rgba(244, 114, 182, 0.15)",
        text: "#fbcfe8",
        border: "rgba(244, 114, 182, 0.3)",
      },
      {
        bg: "rgba(167, 139, 250, 0.15)",
        text: "#ddd6fe",
        border: "rgba(167, 139, 250, 0.3)",
      },
      {
        bg: "rgba(251, 146, 60, 0.15)",
        text: "#fed7aa",
        border: "rgba(251, 146, 60, 0.3)",
      },
      {
        bg: "rgba(251, 191, 36, 0.15)",
        text: "#fde68a",
        border: "rgba(251, 191, 36, 0.3)",
      },
    ];

    const palette = isDarkMode ? darkModePalette : rolePalette;
    return palette[roleIndex % palette.length] || palette[0];
  };

  return (
    <div
      className="min-h-screen p-4 md:p-8 transition-colors duration-200"
      style={{
        backgroundColor: isDarkMode ? colors.background : colors.background,
        color: isDarkMode ? colors.text : colors.text,
      }}
    >
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6 gap-2"
          style={{
            backgroundColor: isDarkMode
              ? colors.secondaryBackground
              : colors.secondaryBackground,
            color: isDarkMode ? colors.text : colors.text,
          }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Gig
        </Button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1
              className="text-3xl font-bold mb-2"
              style={{ color: isDarkMode ? colors.text : colors.text }}
            >
              {gig.title}
            </h1>
            <p
              className="text-lg"
              style={{
                color: isDarkMode ? colors.textMuted : colors.textMuted,
              }}
            >
              Band Members • {allUsers.length} Total ({applicants?.length || 0}{" "}
              applicants, {bookedUsers?.length || 0} booked)
            </p>
          </div>
          <Badge
            className="px-4 py-2 text-lg font-semibold"
            style={{
              backgroundColor: isDarkMode ? colors.primaryBg : colors.primaryBg,
              color: colors.primaryContrast,
            }}
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
              <TabsList
                className="w-full md:w-auto"
                style={{
                  backgroundColor: isDarkMode
                    ? colors.backgroundMuted
                    : colors.backgroundMuted,
                  borderColor: isDarkMode ? colors.border : colors.border,
                }}
              >
                <TabsTrigger
                  value="all"
                  className="flex-1 md:flex-none"
                  style={{
                    backgroundColor:
                      selectedRole === "all" ? colors.primaryBg : "transparent",
                    color:
                      selectedRole === "all"
                        ? colors.primaryContrast
                        : colors.text,
                  }}
                >
                  <Users className="w-4 h-4 mr-2" />
                  All ({allUsers.length})
                </TabsTrigger>
                {roles.map((role: any, index: number) => {
                  const roleApplicants =
                    applicants?.filter((a: any) => a.bandRoleIndex === index) ||
                    [];
                  const roleBooked =
                    bookedUsers?.filter(
                      (b: any) => b.bandRoleIndex === index
                    ) || [];
                  const totalUsers = roleApplicants.length + roleBooked.length;
                  const roleColors = getRoleColors(index);

                  return (
                    <TabsTrigger
                      key={index}
                      value={role.role}
                      className="flex-1 md:flex-none"
                      style={{
                        backgroundColor:
                          selectedRole === role.role
                            ? roleColors.bg
                            : "transparent",
                        color:
                          selectedRole === role.role
                            ? roleColors.text
                            : colors.text,
                        borderColor: roleColors.border,
                      }}
                    >
                      {role.role} ({totalUsers})
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </Tabs>
          </div>

          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 rounded-lg border transition-colors"
              style={{
                backgroundColor: isDarkMode ? colors.card : colors.card,
                borderColor: isDarkMode ? colors.border : colors.border,
                color: isDarkMode ? colors.text : colors.text,
              }}
            >
              <option value="newest">Newest First</option>
              <option value="rating">Highest Rating</option>
              <option value="experience">Most Experienced</option>
              <option value="status">Status (Booked First)</option>
            </select>
            <Button
              variant="outline"
              size="icon"
              style={{
                backgroundColor: isDarkMode ? colors.card : colors.card,
                borderColor: isDarkMode ? colors.border : colors.border,
                color: isDarkMode ? colors.text : colors.text,
              }}
            >
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Role Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {roles.map((role: any, index: number) => {
            const roleApplicants =
              applicants?.filter((a: any) => a.bandRoleIndex === index) || [];
            const roleBooked =
              bookedUsers?.filter((b: any) => b.bandRoleIndex === index) || [];
            const roleColors = getRoleColors(index);

            return (
              <Card
                key={index}
                className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
                onClick={() => setSelectedRole(role.role)}
                style={{
                  backgroundColor: isDarkMode ? colors.card : colors.card,
                  borderColor: isDarkMode ? colors.border : colors.border,
                  borderWidth: selectedRole === role.role ? "2px" : "1px",
                  borderLeftColor: roleColors.border,
                  borderLeftWidth: "4px",
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{
                          backgroundColor: roleColors.bg,
                          color: roleColors.text,
                        }}
                      >
                        <Music className="w-5 h-5" />
                      </div>
                      <div>
                        <h4
                          className="font-bold"
                          style={{
                            color: isDarkMode ? colors.text : colors.text,
                          }}
                        >
                          {role.role}
                        </h4>
                        <p
                          className="text-xs"
                          style={{
                            color: isDarkMode
                              ? colors.textMuted
                              : colors.textMuted,
                          }}
                        >
                          {roleBooked.length}/{role.maxSlots} booked
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge
                        className="text-xs"
                        style={{
                          backgroundColor: colors.infoBg,
                          color: colors.infoText,
                          borderColor: colors.infoBorder,
                        }}
                      >
                        {roleApplicants.length} applicants
                      </Badge>
                      <Badge
                        className="text-xs"
                        style={{
                          backgroundColor: colors.successBg,
                          color: colors.successText,
                          borderColor: colors.successBorder,
                        }}
                      >
                        {roleBooked.length} booked
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span
                        style={{
                          color: isDarkMode
                            ? colors.textMuted
                            : colors.textMuted,
                        }}
                      >
                        Max Apps:
                      </span>
                      <span
                        className="font-semibold"
                        style={{ color: colors.infoText }}
                      >
                        {role.maxApplicants || 20}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span
                        style={{
                          color: isDarkMode
                            ? colors.textMuted
                            : colors.textMuted,
                        }}
                      >
                        Applicants:
                      </span>
                      <span
                        className="font-semibold"
                        style={{
                          color: isDarkMode ? colors.text : colors.text,
                        }}
                      >
                        {roleApplicants.length}/{role.maxApplicants || 20}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span
                        style={{
                          color: isDarkMode
                            ? colors.textMuted
                            : colors.textMuted,
                        }}
                      >
                        Booked:
                      </span>
                      <span
                        className="font-semibold"
                        style={{ color: colors.successText }}
                      >
                        {roleBooked.length}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span
                        style={{
                          color: isDarkMode
                            ? colors.textMuted
                            : colors.textMuted,
                        }}
                      >
                        Available:
                      </span>
                      <span
                        className="font-semibold"
                        style={{ color: colors.infoText }}
                      >
                        {Math.max(0, role.maxSlots - roleBooked.length)}
                      </span>
                    </div>
                    {role.price && (
                      <div className="flex justify-between text-sm">
                        <span
                          style={{
                            color: isDarkMode
                              ? colors.textMuted
                              : colors.textMuted,
                          }}
                        >
                          Rate:
                        </span>
                        <span
                          className="font-semibold"
                          style={{ color: colors.primary }}
                        >
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

      {/* Users Grid (Applicants + Booked Users) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6"
      >
        {filteredUsers.map((user: any) => {
          const userInfo = userDetails?.[user.userId];
          if (!userInfo) return null;

          const role = roles[user.bandRoleIndex];
          const isBookedForThisRole = user.isBooked;
          const roleColors = getRoleColors(user.bandRoleIndex);

          return (
            <motion.div
              key={user._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="group"
            >
              <Card
                className="h-full overflow-hidden hover:shadow-xl transition-all duration-300"
                style={{
                  backgroundColor: isDarkMode ? colors.card : colors.card,
                  borderColor: isDarkMode ? colors.border : colors.border,
                  backgroundImage: isDarkMode
                    ? `linear-gradient(135deg, ${colors.cardBgStart}, ${colors.cardBgEnd})`
                    : `linear-gradient(135deg, ${colors.cardBgStart}, ${colors.cardBgEnd})`,
                }}
              >
                <CardContent className="p-6">
                  {/* User Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={userInfo.picture} />
                        <AvatarFallback
                          style={{
                            background: isDarkMode
                              ? colors.gradientSecondary
                              : colors.gradientSecondary,
                            color: colors.primaryContrast,
                          }}
                        >
                          {userInfo.firstname?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4
                            className="font-bold"
                            style={{
                              color: isDarkMode ? colors.text : colors.text,
                            }}
                          >
                            {userInfo.firstname || userInfo.username}
                          </h4>
                          {userInfo.verifiedIdentity && (
                            <CheckCircle
                              className="w-4 h-4"
                              style={{ color: colors.successText }}
                            />
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant="outline"
                            className="text-xs"
                            style={{
                              backgroundColor: roleColors.bg,
                              color: roleColors.text,
                              borderColor: roleColors.border,
                            }}
                          >
                            {user.bandRole || "Band Member"}
                            {isBookedForThisRole && (
                              <CheckCircle className="w-3 h-3 ml-1" />
                            )}
                          </Badge>
                          {userInfo.trustTier &&
                            userInfo.trustTier !== "new" && (
                              <Badge
                                variant="secondary"
                                className="text-xs"
                                style={{
                                  backgroundColor: colors.warningBg,
                                  color: colors.warningText,
                                  borderColor: colors.warningBorder,
                                }}
                              >
                                <Award className="w-3 h-3 mr-1" />
                                {userInfo.trustTier}
                              </Badge>
                            )}
                          {isBookedForThisRole && (
                            <Badge
                              variant="secondary"
                              className="text-xs"
                              style={{
                                backgroundColor: colors.successBg,
                                color: colors.successText,
                                borderColor: colors.successBorder,
                              }}
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Booked
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <Badge
                      className="px-3 py-1"
                      style={{
                        backgroundColor: isBookedForThisRole
                          ? colors.successBg
                          : colors.infoBg,
                        color: isBookedForThisRole
                          ? colors.successText
                          : colors.infoText,
                        borderColor: isBookedForThisRole
                          ? colors.successBorder
                          : colors.infoBorder,
                      }}
                    >
                      {isBookedForThisRole ? "Booked" : "Applied"}
                    </Badge>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    <div
                      className="text-center p-3 rounded-lg"
                      style={{
                        backgroundColor: isDarkMode
                          ? colors.backgroundMuted
                          : colors.backgroundMuted,
                      }}
                    >
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Star
                          className="w-4 h-4"
                          style={{ color: colors.warningText }}
                        />
                        <span
                          className="text-xs"
                          style={{
                            color: isDarkMode
                              ? colors.textMuted
                              : colors.textMuted,
                          }}
                        >
                          Rating
                        </span>
                      </div>
                      <p
                        className="text-lg font-bold"
                        style={{
                          color: isDarkMode ? colors.text : colors.text,
                        }}
                      >
                        {userInfo.avgRating?.toFixed(1) || "4.5"}
                      </p>
                    </div>
                    <div
                      className="text-center p-3 rounded-lg"
                      style={{
                        backgroundColor: isDarkMode
                          ? colors.backgroundMuted
                          : colors.backgroundMuted,
                      }}
                    >
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Users
                          className="w-4 h-4"
                          style={{ color: colors.infoText }}
                        />
                        <span
                          className="text-xs"
                          style={{
                            color: isDarkMode
                              ? colors.textMuted
                              : colors.textMuted,
                          }}
                        >
                          Gigs
                        </span>
                      </div>
                      <p
                        className="text-lg font-bold"
                        style={{
                          color: isDarkMode ? colors.text : colors.text,
                        }}
                      >
                        {userInfo.completedGigsCount || 0}
                      </p>
                    </div>
                    <div
                      className="text-center p-3 rounded-lg"
                      style={{
                        backgroundColor: isDarkMode
                          ? colors.backgroundMuted
                          : colors.backgroundMuted,
                      }}
                    >
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <DollarSign
                          className="w-4 h-4"
                          style={{ color: colors.successText }}
                        />
                        <span
                          className="text-xs"
                          style={{
                            color: isDarkMode
                              ? colors.textMuted
                              : colors.textMuted,
                          }}
                        >
                          Rate
                        </span>
                      </div>
                      <p
                        className="text-lg font-bold"
                        style={{
                          color: isDarkMode ? colors.text : colors.text,
                        }}
                      >
                        ${userInfo.rate?.baseRate || role?.price || "Contact"}
                      </p>
                    </div>
                    {role && (
                      <div className="mt-2">
                        {(() => {
                          const roleApplicantsForThisRole =
                            applicants?.filter(
                              (a: any) => a.bandRoleIndex === user.bandRoleIndex
                            ) || [];
                          const applicantCount =
                            roleApplicantsForThisRole.length;
                          const maxApplicants = role.maxApplicants || 20;
                          const percentage = Math.min(
                            (applicantCount / maxApplicants) * 100,
                            100
                          );

                          return (
                            <>
                              <div className="flex justify-between text-xs mb-1">
                                <span>Application Capacity</span>
                                <span>{Math.round(percentage)}%</span>
                              </div>
                              <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all duration-300"
                                  style={{
                                    width: `${percentage}%`,
                                    backgroundColor:
                                      percentage >= 100
                                        ? colors.destructive
                                        : percentage >= 80
                                          ? colors.warningText
                                          : colors.successText,
                                  }}
                                />
                              </div>
                              <div className="text-xs text-center mt-1 text-gray-500">
                                {applicantCount}/{maxApplicants} applicants
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    )}
                  </div>

                  {/* Location & Time */}
                  <div className="flex items-center justify-between text-sm mb-6">
                    <div className="flex items-center gap-2">
                      <MapPin
                        className="w-4 h-4"
                        style={{
                          color: isDarkMode
                            ? colors.textMuted
                            : colors.textMuted,
                        }}
                      />
                      <span
                        style={{
                          color: isDarkMode
                            ? colors.textMuted
                            : colors.textMuted,
                        }}
                      >
                        {userInfo.city || "Remote"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar
                        className="w-4 h-4"
                        style={{
                          color: isDarkMode
                            ? colors.textMuted
                            : colors.textMuted,
                        }}
                      />
                      <span
                        style={{
                          color: isDarkMode
                            ? colors.textMuted
                            : colors.textMuted,
                        }}
                      >
                        {isBookedForThisRole ? "Booked " : "Applied "}
                        {new Date(
                          user.bookedAt || user.appliedAt
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Role Details */}
                  {role && (
                    <div
                      className="mb-6 p-3 rounded-lg"
                      style={{
                        backgroundColor: roleColors.bg,
                        borderColor: roleColors.border,
                        borderWidth: "1px",
                      }}
                    >
                      <h5
                        className="font-bold mb-2"
                        style={{
                          color: isDarkMode ? colors.text : colors.text,
                        }}
                      >
                        Role Details
                      </h5>
                      <div className="space-y-1 text-sm">
                        {role.description && (
                          <p
                            style={{
                              color: isDarkMode
                                ? colors.textMuted
                                : colors.textMuted,
                            }}
                          >
                            {role.description}
                          </p>
                        )}
                        {role.requiredSkills &&
                          role.requiredSkills.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {role.requiredSkills.map(
                                (skill: string, i: number) => (
                                  <Badge
                                    key={i}
                                    variant="secondary"
                                    className="text-xs"
                                    style={{
                                      backgroundColor: isDarkMode
                                        ? colors.background
                                        : colors.background,
                                      color: isDarkMode
                                        ? colors.text
                                        : colors.text,
                                      borderColor: isDarkMode
                                        ? colors.border
                                        : colors.border,
                                    }}
                                  >
                                    {skill}
                                  </Badge>
                                )
                              )}
                            </div>
                          )}
                      </div>
                    </div>
                  )}
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      {/* Profile Button */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 group hover:scale-[1.02] transition-all duration-200"
                        onClick={() => {
                          router.push(`/profile/${user.userId}`);
                        }}
                        style={{
                          backgroundColor: isDarkMode
                            ? colors.backgroundMuted
                            : colors.backgroundMuted,
                          borderColor: colors.border,
                          color: colors.text,
                          borderWidth: "1px",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = colors.primary;
                          e.currentTarget.style.color = colors.primary;
                          e.currentTarget.style.backgroundColor = isDarkMode
                            ? colors.background
                            : colors.background;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = colors.border;
                          e.currentTarget.style.color = colors.text;
                          e.currentTarget.style.backgroundColor = isDarkMode
                            ? colors.backgroundMuted
                            : colors.backgroundMuted;
                        }}
                      >
                        <Eye className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
                        <span>View Profile</span>
                      </Button>

                      {/* Book/Status Button */}
                      {isBookedForThisRole ? (
                        <Button
                          size="sm"
                          className="flex-1 cursor-default hover:scale-[1.02] transition-all duration-200"
                          style={{
                            background: `linear-gradient(135deg, ${colors.successBg} 0%, ${colors.success} 20%, ${colors.successBg} 100%)`,
                            color: colors.successText,
                            borderColor: colors.successBorder,
                            borderWidth: "1px",
                            fontWeight: "600",
                            boxShadow:
                              "0 2px 10px -2px rgba(var(--success-rgb), 0.2)",
                            backgroundSize: "200% 100%",
                            animation: "pulse 2s infinite",
                          }}
                          disabled={true}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          <span>Booked ✓</span>
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          className="flex-1 group relative overflow-hidden transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                          onClick={() =>
                            handleBookForRole(
                              user.userId,
                              user.bandRoleIndex,
                              user.bandRole,
                              userInfo.firstname || userInfo.username
                            )
                          }
                          disabled={loadingBooking}
                          style={{
                            background: loadingBooking
                              ? colors.primaryBg
                              : colors.successBg,
                            color: "white",
                            border: "none",
                            fontWeight: "600",
                            letterSpacing: "0.025em",
                            boxShadow: "0 4px 14px 0 rgba(59, 130, 246, 0.3)",
                            position: "relative",
                            overflow: "hidden",
                          }}
                        >
                          {/* Background overlay for better text visibility */}
                          <div
                            className="absolute inset-0"
                            style={{
                              background:
                                "linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.2))",
                            }}
                          />

                          {/* Shimmer effect on hover */}
                          {!loadingBooking && (
                            <div
                              className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
                              style={{
                                background:
                                  "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
                              }}
                            />
                          )}

                          {/* Content */}
                          <div className="relative flex items-center justify-center gap-2">
                            {loadingBooking ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span className="text-white font-medium">
                                  Booking...
                                </span>
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4 text-white" />
                                <span className="text-white font-semibold">
                                  Book Now
                                </span>
                                <ChevronRight className="w-3 h-3 text-white opacity-70" />
                              </>
                            )}
                          </div>
                        </Button>
                      )}
                    </div>

                    {/* Action Button (Unbook/Remove) */}
                    <Button
                      className="w-full group transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                      onClick={() =>
                        isBookedForThisRole
                          ? handleUnbookFromRole(
                              user.userId,
                              user.bandRoleIndex,
                              userInfo.firstname || userInfo.username
                            )
                          : handleRemoveFromRole(
                              user._id,
                              user.bandRoleIndex,
                              user.userId
                            )
                      }
                      disabled={
                        isBookedForThisRole ? loadingUnbooking : loadingRemoval
                      }
                      style={{
                        background: isBookedForThisRole
                          ? `linear-gradient(135deg, ${colors.destructiveBg} 0%, rgba(var(--destructive-rgb), 0.1) 100%)`
                          : `linear-gradient(135deg, ${colors.destructiveBg} 0%, rgba(var(--destructive-rgb), 0.1) 100%)`,
                        color: colors.destructive,
                        border: `1px solid ${colors.destructive || colors.destructive}`,
                        fontWeight: "500",
                        position: "relative",
                        overflow: "hidden",
                        transition: "all 0.3s ease",
                      }}
                      onMouseEnter={(e) => {
                        if (
                          !(isBookedForThisRole
                            ? loadingUnbooking
                            : loadingRemoval)
                        ) {
                          e.currentTarget.style.background = `linear-gradient(135deg, rgba(var(--destructive-rgb), 0.2) 0%, rgba(var(--destructive-rgb), 0.1) 100%)`;
                          e.currentTarget.style.boxShadow = `0 4px 12px -2px rgba(var(--destructive-rgb), 0.3)`;
                          e.currentTarget.style.color =
                            colors.destructive || colors.destructive;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (
                          !(isBookedForThisRole
                            ? loadingUnbooking
                            : loadingRemoval)
                        ) {
                          e.currentTarget.style.background = `linear-gradient(135deg, ${colors.destructiveBg} 0%, rgba(var(--destructive-rgb), 0.1) 100%)`;
                          e.currentTarget.style.boxShadow = "none";
                          e.currentTarget.style.color = colors.destructive;
                        }
                      }}
                    >
                      {/* Loading State */}
                      {isBookedForThisRole && loadingUnbooking ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          <span>Unbooking...</span>
                        </div>
                      ) : !isBookedForThisRole && loadingRemoval ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          <span>Removing...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2 group-hover:gap-3 transition-all duration-200">
                          {isBookedForThisRole ? (
                            <>
                              <XCircle className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                              <span>Cancel Booking</span>
                            </>
                          ) : (
                            <>
                              <X className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                              <span>Remove Applicant</span>
                            </>
                          )}
                        </div>
                      )}
                    </Button>

                    {/* Additional Action: Shortlist/Message */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1 text-xs group"
                        onClick={() => {
                          // Add shortlist functionality
                          toast.info("Added to shortlist");
                        }}
                        style={{
                          backgroundColor: isDarkMode
                            ? colors.backgroundMuted
                            : colors.backgroundMuted,
                          color: colors.textMuted,
                          border: `1px solid ${colors.border}`,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor =
                            colors.warningBg;
                          e.currentTarget.style.color = colors.warningText;
                          e.currentTarget.style.borderColor =
                            colors.warningBorder;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = isDarkMode
                            ? colors.backgroundMuted
                            : colors.backgroundMuted;
                          e.currentTarget.style.color = colors.textMuted;
                          e.currentTarget.style.borderColor = colors.border;
                        }}
                      >
                        <Bookmark className="w-3 h-3 mr-1 group-hover:fill-current" />
                        Shortlist
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1 text-xs group"
                        onClick={() => {
                          // Add message functionality
                          router.push(`/messages?user=${user.userId}`);
                        }}
                        style={{
                          backgroundColor: isDarkMode
                            ? colors.backgroundMuted
                            : colors.backgroundMuted,
                          color: colors.textMuted,
                          border: `1px solid ${colors.border}`,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = colors.infoBg;
                          e.currentTarget.style.color = colors.infoText;
                          e.currentTarget.style.borderColor = colors.infoBorder;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = isDarkMode
                            ? colors.backgroundMuted
                            : colors.backgroundMuted;
                          e.currentTarget.style.color = colors.textMuted;
                          e.currentTarget.style.borderColor = colors.border;
                        }}
                      >
                        <Send className="w-3 h-3 mr-1" />
                        Message
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Empty State */}
      {filteredUsers.length === 0 && (
        <div className="text-center py-16">
          <div
            className="w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6"
            style={{
              backgroundColor: isDarkMode
                ? colors.backgroundMuted
                : colors.backgroundMuted,
            }}
          >
            <Users
              className="w-12 h-12"
              style={{
                color: isDarkMode ? colors.textMuted : colors.textMuted,
              }}
            />
          </div>
          <h3
            className="text-xl font-bold mb-2"
            style={{ color: isDarkMode ? colors.text : colors.text }}
          >
            No users found
          </h3>
          <p
            className="max-w-md mx-auto mb-6"
            style={{ color: isDarkMode ? colors.textMuted : colors.textMuted }}
          >
            {selectedRole === "all"
              ? "No one has applied or been booked for this gig yet."
              : `No users for the ${selectedRole} role.`}
          </p>
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="gap-2"
            style={{
              backgroundColor: isDarkMode ? colors.card : colors.card,
              borderColor: isDarkMode ? colors.border : colors.border,
              color: isDarkMode ? colors.text : colors.text,
            }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Gig Overview
          </Button>
        </div>
      )}
    </div>
  );
}
