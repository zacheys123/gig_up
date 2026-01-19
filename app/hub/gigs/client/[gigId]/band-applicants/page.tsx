// app/gigs/[gigId]/band-applicants/page.tsx
"use client";

import React, { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { motion, AnimatePresence } from "framer-motion";
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
  Calendar,
  Filter,
  X,
  Send,
  ChevronDown,
  Search,
  DollarSign,
  AlertCircle,
  UserPlus,
  UserMinus,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@clerk/nextjs";

// Helper function to convert Tailwind color classes to CSS values
const getColorValue = (colorClass: string): string => {
  // If it's already a hex/rgb value, return it
  if (colorClass?.startsWith("#") || colorClass?.startsWith("rgb")) {
    return colorClass;
  }

  // Map Tailwind colors to hex values
  const colorMap: Record<string, string> = {
    // Background colors
    "bg-white": "#ffffff",
    "bg-gray-50": "#f9fafb",
    "bg-gray-100": "#f3f4f6",
    "bg-gray-200": "#e5e7eb",
    "bg-gray-300": "#d1d5db",
    "bg-gray-400": "#9ca3af",
    "bg-gray-500": "#6b7280",
    "bg-gray-600": "#4b5563",
    "bg-gray-700": "#374151",
    "bg-gray-800": "#1f2937",
    "bg-gray-900": "#111827",
    "bg-black": "#000000",

    // Text colors
    "text-white": "#ffffff",
    "text-gray-100": "#f3f4f6",
    "text-gray-200": "#e5e7eb",
    "text-gray-300": "#d1d5db",
    "text-gray-400": "#9ca3af",
    "text-gray-500": "#6b7280",
    "text-gray-600": "#4b5563",
    "text-gray-700": "#374151",
    "text-gray-800": "#1f2937",
    "text-gray-900": "#111827",

    // Primary colors
    "text-orange-400": "#fb923c",
    "text-orange-500": "#f97316",
    "text-orange-600": "#ea580c",
    "bg-orange-50": "#fff7ed",
    "bg-orange-100": "#ffedd5",
    "bg-orange-200": "#fed7aa",
    "bg-orange-300": "#fdba74",
    "bg-orange-400": "#fb923c",
    "bg-orange-500": "#f97316",
    "bg-orange-600": "#ea580c",

    // Success colors
    "text-green-400": "#34d399",
    "text-green-500": "#10b981",
    "text-green-600": "#059669",
    "bg-green-50": "#f0fdf4",
    "bg-green-100": "#dcfce7",
    "bg-green-200": "#bbf7d0",
    "bg-green-300": "#86efac",
    "bg-green-400": "#4ade80",
    "bg-green-500": "#22c55e",
    "bg-green-600": "#16a34a",

    // Blue colors
    "text-blue-400": "#60a5fa",
    "text-blue-500": "#3b82f6",
    "text-blue-600": "#2563eb",
    "bg-blue-50": "#eff6ff",
    "bg-blue-100": "#dbeafe",
    "bg-blue-200": "#bfdbfe",
    "bg-blue-300": "#93c5fd",
    "bg-blue-400": "#60a5fa",
    "bg-blue-500": "#3b82f6",
    "bg-blue-600": "#2563eb",

    // Purple colors
    "text-purple-400": "#a78bfa",
    "text-purple-500": "#8b5cf6",
    "text-purple-600": "#7c3aed",
    "bg-purple-50": "#faf5ff",
    "bg-purple-100": "#f3e8ff",
    "bg-purple-200": "#e9d5ff",
    "bg-purple-300": "#d8b4fe",
    "bg-purple-400": "#c084fc",
    "bg-purple-500": "#a855f7",
    "bg-purple-600": "#9333ea",

    // Pink colors
    "text-pink-400": "#f472b6",
    "text-pink-500": "#ec4899",
    "text-pink-600": "#db2777",
    "bg-pink-50": "#fdf2f8",
    "bg-pink-100": "#fce7f3",
    "bg-pink-200": "#fbcfe8",
    "bg-pink-300": "#f9a8d4",
    "bg-pink-400": "#f472b6",
    "bg-pink-500": "#ec4899",
    "bg-pink-600": "#db2777",

    // Red/destructive
    "text-red-400": "#f87171",
    "text-red-500": "#ef4444",
    "text-red-600": "#dc2626",
    "bg-red-50": "#fef2f2",
    "bg-red-100": "#fee2e2",
    "bg-red-200": "#fecaca",
    "bg-red-300": "#fca5a5",
    "bg-red-400": "#f87171",
    "bg-red-500": "#ef4444",
    "bg-red-600": "#dc2626",
  };

  return colorMap[colorClass] || colorClass || "#000000";
};

// Helper to extract Tailwind class from color property
const extractColorClass = (colorProp: string): string => {
  if (!colorProp) return "";

  // If it's already a CSS value, return it
  if (colorProp.startsWith("#") || colorProp.startsWith("rgb")) {
    return colorProp;
  }

  // If it's a Tailwind class with opacity, handle it
  if (colorProp.includes("/")) {
    const [baseClass, opacity] = colorProp.split("/");
    const baseColor = getColorValue(baseClass);

    // Convert hex to rgba with opacity
    if (baseColor.startsWith("#")) {
      const r = parseInt(baseColor.slice(1, 3), 16);
      const g = parseInt(baseColor.slice(3, 5), 16);
      const b = parseInt(baseColor.slice(5, 7), 16);
      const alpha = parseFloat(opacity) / 100;
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
  }

  return getColorValue(colorProp);
};

export default function BandApplicantsPage() {
  const params = useParams();
  const router = useRouter();
  const { colors, isDarkMode, mounted } = useThemeColors();
  const { userId: clerkId } = useAuth();
  const gigId = params.gigId as Id<"gigs">;

  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [loadingBooking, setLoadingBooking] = useState(false);
  const [loadingUnbooking, setLoadingUnbooking] = useState(false);
  const [loadingRemoval, setLoadingRemoval] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Fetch gig data
  const gigData = useQuery(api.controllers.gigs.getGigWithApplicants, {
    gigId,
  });

  const { gig, applicants, bookedUsers, userDetails } = gigData || {};
  const roles = gig?.bandCategory || [];

  // Combine users
  const allUsers = useMemo(() => {
    if (!applicants || !bookedUsers) return [];

    const combined = [
      ...(applicants || []).map((a: any) => ({ ...a, isBooked: false })),
      ...(bookedUsers || []).map((b: any) => ({ ...b, isBooked: true })),
    ];

    return combined.sort((a, b) => {
      if (a.isBooked && !b.isBooked) return -1;
      if (!a.isBooked && b.isBooked) return 1;
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

  // Action handlers
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
      await bookForRole({
        gigId,
        userId: applicantUserId,
        bandRoleIndex,
        clerkId,
        reason: `Booked as ${bandRole}`,
      });
      toast.success(`Booked ${applicantName} as ${bandRole}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to book");
    } finally {
      setLoadingBooking(false);
    }
  };

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
      toast.success(`${userName} has been unbooked`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to unbook");
    } finally {
      setLoadingUnbooking(false);
    }
  };

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
      toast.success("Applicant removed");
    } catch (error) {
      toast.error("Failed to remove applicant");
    } finally {
      setLoadingRemoval(false);
    }
  };

  // Role colors using theme colors
  const getRoleColors = (roleIndex: number) => {
    const rolePalette = [
      {
        bg:
          colors.clientBg ||
          (isDarkMode ? "rgba(96, 165, 250, 0.15)" : "rgba(59, 130, 246, 0.1)"),
        text: colors.clientText || (isDarkMode ? "#93c5fd" : "#1d4ed8"),
        border:
          colors.clientBorder ||
          (isDarkMode ? "rgba(96, 165, 250, 0.3)" : "rgba(59, 130, 246, 0.3)"),
      },
      {
        bg:
          colors.bookerBg ||
          (isDarkMode ? "rgba(52, 211, 153, 0.15)" : "rgba(16, 185, 129, 0.1)"),
        text: colors.bookerText || (isDarkMode ? "#a7f3d0" : "#047857"),
        border:
          colors.bookerBorder ||
          (isDarkMode ? "rgba(52, 211, 153, 0.3)" : "rgba(16, 185, 129, 0.3)"),
      },
      {
        bg:
          colors.vocalistBg ||
          (isDarkMode
            ? "rgba(244, 114, 182, 0.15)"
            : "rgba(236, 72, 153, 0.1)"),
        text: colors.vocalistText || (isDarkMode ? "#fbcfe8" : "#be185d"),
        border:
          colors.vocalistBorder ||
          (isDarkMode ? "rgba(244, 114, 182, 0.3)" : "rgba(236, 72, 153, 0.3)"),
      },
      {
        bg:
          colors.djBg ||
          (isDarkMode
            ? "rgba(167, 139, 250, 0.15)"
            : "rgba(139, 92, 246, 0.1)"),
        text: colors.djText || (isDarkMode ? "#ddd6fe" : "#6d28d9"),
        border:
          colors.djBorder ||
          (isDarkMode ? "rgba(167, 139, 250, 0.3)" : "rgba(139, 92, 246, 0.3)"),
      },
      {
        bg:
          colors.mcBg ||
          (isDarkMode ? "rgba(251, 146, 60, 0.15)" : "rgba(249, 115, 22, 0.1)"),
        text: colors.mcText || (isDarkMode ? "#fed7aa" : "#c2410c"),
        border:
          colors.mcBorder ||
          (isDarkMode ? "rgba(251, 146, 60, 0.3)" : "rgba(249, 115, 22, 0.3)"),
      },
    ];
    return rolePalette[roleIndex % rolePalette.length] || rolePalette[0];
  };

  // Get CSS values from theme colors
  const themeColors = useMemo(() => {
    return {
      background: extractColorClass(
        colors.background || (isDarkMode ? "bg-gray-900" : "bg-white")
      ),
      text: extractColorClass(
        colors.text || (isDarkMode ? "text-gray-100" : "text-gray-900")
      ),
      textMuted: extractColorClass(
        colors.textMuted || (isDarkMode ? "text-gray-400" : "text-gray-600")
      ),
      primary: extractColorClass(colors.primary || "text-orange-500"),
      primaryBg: extractColorClass(colors.primaryBg || "bg-orange-500"),
      primaryContrast: extractColorClass(colors.primaryContrast || "#ffffff"),
      border: extractColorClass(
        colors.border || (isDarkMode ? "border-gray-700" : "border-gray-200")
      ),
      card: extractColorClass(
        colors.card || (isDarkMode ? "bg-gray-800" : "bg-white")
      ),
      destructive: extractColorClass(colors.destructive || "text-red-500"),
      success: extractColorClass(colors.success || "text-green-500"),
      info: extractColorClass(colors.infoText || "text-blue-500"),
      warning: extractColorClass(colors.warningText || "text-amber-500"),
    };
  }, [colors, isDarkMode]);

  // Filter and sort users
  const filteredUsers = useMemo(() => {
    if (!allUsers.length) return [];

    return allUsers
      .filter((user: any) => {
        if (selectedRole === "all") return true;
        return user.bandRole === selectedRole;
      })
      .filter((user: any) => {
        if (!searchQuery) return true;
        const userInfo = userDetails?.[user.userId];
        const name = userInfo?.firstname?.toLowerCase() || "";
        const username = userInfo?.username?.toLowerCase() || "";
        const role = user.bandRole?.toLowerCase() || "";
        const query = searchQuery.toLowerCase();
        return (
          name.includes(query) ||
          username.includes(query) ||
          role.includes(query)
        );
      })
      .sort((a: any, b: any) => {
        const aUser = userDetails?.[a.userId];
        const bUser = userDetails?.[b.userId];

        switch (sortBy) {
          case "rating":
            return (bUser?.avgRating || 0) - (aUser?.avgRating || 0);
          case "experience":
            return (
              (bUser?.completedGigsCount || 0) -
              (aUser?.completedGigsCount || 0)
            );
          case "newest":
          default:
            const aDate = a.bookedAt || a.appliedAt || 0;
            const bDate = b.bookedAt || b.appliedAt || 0;
            return bDate - aDate;
        }
      });
  }, [allUsers, selectedRole, sortBy, searchQuery, userDetails]);

  // Loading state
  if (!mounted || !gigData || !gig) {
    return (
      <div
        className="min-h-screen p-4 md:p-6 lg:p-8"
        style={{ backgroundColor: themeColors.background }}
      >
        <div className="animate-pulse space-y-6 max-w-7xl mx-auto">
          <div className="h-8 w-48 rounded-lg bg-gray-200 dark:bg-gray-800"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-32 rounded-lg bg-gray-100 dark:bg-gray-800"
              ></div>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="h-64 rounded-xl bg-gray-100 dark:bg-gray-800"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen p-4 md:p-6 lg:p-8 transition-colors duration-200"
      style={{
        backgroundColor: themeColors.background,
        color: themeColors.text,
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-6 gap-2 hover:scale-105 transition-transform"
            style={{
              backgroundColor: isDarkMode ? "#1f2937" : "#f9fafb",
              color: themeColors.text,
            }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                {gig.title}
              </h1>
              <p
                className="text-sm md:text-base"
                style={{ color: themeColors.textMuted }}
              >
                Band Applicants • {allUsers.length} Total
              </p>
            </div>
            <Badge
              className="px-3 py-1.5 md:px-4 md:py-2 text-sm md:text-base font-semibold"
              style={{
                backgroundColor: themeColors.primaryBg,
                color: themeColors.primaryContrast,
              }}
            >
              <Music className="w-3.5 h-3.5 md:w-4 md:h-4 mr-2" />
              {roles.length} Roles
            </Badge>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="mb-8">
          {/* Mobile Menu Button */}
          <div className="md:hidden mb-4">
            <Button
              variant="outline"
              className="w-full justify-between"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                backgroundColor: themeColors.card,
                borderColor: themeColors.border,
                color: themeColors.text,
              }}
            >
              <span>Filters & Sort</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${mobileMenuOpen ? "rotate-180" : ""}`}
              />
            </Button>
          </div>

          <div className={`${mobileMenuOpen ? "block" : "hidden"} md:block`}>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
                  style={{ color: themeColors.textMuted }}
                />
                <input
                  type="text"
                  placeholder="Search applicants..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: themeColors.card,
                    borderColor: themeColors.border,
                    color: themeColors.text,
                  }}
                />
              </div>

              {/* Role Tabs */}
              <div className="flex-1 md:flex-2">
                <Tabs value={selectedRole} onValueChange={setSelectedRole}>
                  <TabsList
                    className="w-full flex flex-wrap h-auto rounded-lg p-1"
                    style={{
                      backgroundColor: isDarkMode ? "#1f2937" : "#f9fafb",
                      border: `1px solid ${themeColors.border}`,
                    }}
                  >
                    <TabsTrigger
                      value="all"
                      className="flex-1 min-w-[120px] rounded-md px-3 py-2 text-sm transition-all"
                      style={{
                        backgroundColor:
                          selectedRole === "all"
                            ? themeColors.primaryBg
                            : "transparent",
                        color:
                          selectedRole === "all"
                            ? themeColors.primaryContrast
                            : themeColors.text,
                      }}
                    >
                      <Users className="w-3.5 h-3.5 mr-2 hidden sm:inline" />
                      All ({allUsers.length})
                    </TabsTrigger>
                    {roles.map((role: any, index: number) => {
                      const roleApplicants =
                        applicants?.filter(
                          (a: any) => a.bandRoleIndex === index
                        ) || [];
                      const roleBooked =
                        bookedUsers?.filter(
                          (b: any) => b.bandRoleIndex === index
                        ) || [];
                      const totalUsers =
                        roleApplicants.length + roleBooked.length;
                      const currentApplicants = roleApplicants.length;
                      const maxApplicants = role.maxApplicants || 20; // Default to 20 if not set
                      const roleColors = getRoleColors(index);

                      return (
                        <TabsTrigger
                          key={index}
                          value={role.role}
                          className="flex-1 min-w-[120px] rounded-md px-3 py-2 text-sm transition-all"
                          style={{
                            backgroundColor:
                              selectedRole === role.role
                                ? roleColors.bg
                                : "transparent",
                            color:
                              selectedRole === role.role
                                ? roleColors.text
                                : themeColors.text,
                            border:
                              selectedRole === role.role
                                ? `1px solid ${roleColors.border}`
                                : "none",
                          }}
                        >
                          <div className="flex flex-col items-center">
                            <span>{role.role}</span>
                            <span className="text-xs opacity-75">
                              {currentApplicants}/{maxApplicants}
                            </span>
                          </div>
                        </TabsTrigger>
                      );
                    })}
                  </TabsList>
                </Tabs>
              </div>

              {/* Sort & Filter */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border transition-all appearance-none cursor-pointer focus:outline-none"
                    style={{
                      backgroundColor: themeColors.card,
                      borderColor: themeColors.border,
                      color: themeColors.text,
                    }}
                  >
                    <option value="newest">Newest First</option>
                    <option value="rating">Highest Rating</option>
                    <option value="experience">Most Experience</option>
                  </select>
                  <ChevronDown
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none"
                    style={{ color: themeColors.textMuted }}
                  />
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-lg"
                  style={{
                    backgroundColor: themeColors.card,
                    borderColor: themeColors.border,
                    color: themeColors.text,
                  }}
                >
                  <Filter className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {roles.map((role: any, index: number) => {
            const roleApplicants =
              applicants?.filter((a: any) => a.bandRoleIndex === index) || [];
            const roleBooked =
              bookedUsers?.filter((b: any) => b.bandRoleIndex === index) || [];
            const roleColors = getRoleColors(index);
            const isSelected = selectedRole === role.role;
            const currentApplicants = roleApplicants.length;
            const maxApplicants = role.maxApplicants || 20;
            const applicantPercentage =
              maxApplicants > 0
                ? Math.min((currentApplicants / maxApplicants) * 100, 100)
                : 0;

            return (
              <Card
                key={index}
                className="cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md"
                onClick={() => setSelectedRole(role.role)}
                style={{
                  backgroundColor: themeColors.card,
                  borderColor: isSelected
                    ? roleColors.border
                    : themeColors.border,
                  borderLeftColor: roleColors.border,
                  borderLeftWidth: "4px",
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4
                        className="font-semibold text-sm"
                        style={{ color: themeColors.text }}
                      >
                        {role.role}
                      </h4>
                      <p
                        className="text-xs mt-1"
                        style={{ color: themeColors.textMuted }}
                      >
                        {roleBooked.length}/{role.maxSlots} booked
                      </p>
                    </div>
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{
                        backgroundColor: roleColors.bg,
                        color: roleColors.text,
                      }}
                    >
                      <Music className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Applicant Capacity Progress Bar */}
                  <div className="mt-3 mb-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span style={{ color: themeColors.textMuted }}>
                        Applications:
                      </span>
                      <span
                        style={{
                          color:
                            applicantPercentage >= 100
                              ? themeColors.destructive
                              : applicantPercentage >= 80
                                ? themeColors.warning
                                : themeColors.success,
                        }}
                      >
                        {currentApplicants}/{maxApplicants}
                      </span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${applicantPercentage}%`,
                          backgroundColor:
                            applicantPercentage >= 100
                              ? themeColors.destructive
                              : applicantPercentage >= 80
                                ? themeColors.warning
                                : themeColors.success,
                        }}
                      />
                    </div>
                    {applicantPercentage >= 100 && (
                      <div
                        className="text-xs text-center mt-1"
                        style={{ color: themeColors.destructive }}
                      >
                        <AlertCircle className="w-3 h-3 inline mr-1" />
                        Full
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span style={{ color: themeColors.textMuted }}>
                        Available Slots:
                      </span>
                      <span style={{ color: themeColors.success }}>
                        {Math.max(0, role.maxSlots - roleBooked.length)}
                      </span>
                    </div>
                    {role.price && (
                      <div className="flex justify-between text-xs">
                        <span style={{ color: themeColors.textMuted }}>
                          Rate:
                        </span>
                        <span style={{ color: themeColors.primary }}>
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

        {/* Applicants Grid */}
        <AnimatePresence>
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
          >
            {filteredUsers.map((user: any) => {
              const userInfo = userDetails?.[user.userId];
              if (!userInfo) return null;

              const role = roles[user.bandRoleIndex];
              const isBooked = user.isBooked;
              const roleColors = getRoleColors(user.bandRoleIndex);

              // Calculate capacity for this specific role - ADD THIS
              const roleApplicants =
                applicants?.filter(
                  (a: any) => a.bandRoleIndex === user.bandRoleIndex
                ) || [];
              const currentApplicants = roleApplicants.length;
              const maxApplicants = role?.maxApplicants || 20;

              return (
                <motion.div
                  key={user._id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  className="group"
                >
                  <Card
                    className="h-full overflow-hidden hover:shadow-lg transition-shadow"
                    style={{
                      backgroundColor: themeColors.card,
                      borderColor: themeColors.border,
                    }}
                  >
                    <CardContent className="p-4 md:p-5">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={userInfo.picture} />
                            <AvatarFallback
                              style={{
                                backgroundColor: roleColors.bg,
                                color: roleColors.text,
                              }}
                            >
                              {userInfo.firstname?.charAt(0) || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-1">
                              <h4
                                className="font-semibold text-sm"
                                style={{ color: themeColors.text }}
                              >
                                {userInfo.firstname || userInfo.username}
                              </h4>
                              {userInfo.verifiedIdentity && (
                                <CheckCircle
                                  className="w-3 h-3"
                                  style={{ color: themeColors.success }}
                                />
                              )}
                            </div>
                            <Badge
                              className="mt-1 text-xs"
                              style={{
                                backgroundColor: roleColors.bg,
                                color: roleColors.text,
                                borderColor: roleColors.border,
                              }}
                            >
                              {role?.role || user.bandRole}
                            </Badge>
                          </div>
                        </div>
                        <Badge
                          className="text-xs"
                          style={{
                            backgroundColor: isBooked
                              ? themeColors.success
                              : themeColors.info,
                            color: themeColors.primaryContrast,
                          }}
                        >
                          {isBooked ? "Booked" : "Applied"}
                        </Badge>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Star
                              className="w-3 h-3"
                              style={{ color: themeColors.warning }}
                            />
                            <span
                              className="text-xs"
                              style={{ color: themeColors.textMuted }}
                            >
                              Rating
                            </span>
                          </div>
                          <p
                            className="text-lg font-bold mt-1"
                            style={{ color: themeColors.text }}
                          >
                            {userInfo.avgRating?.toFixed(1) || "—"}
                          </p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Users
                              className="w-3 h-3"
                              style={{ color: themeColors.info }}
                            />
                            <span
                              className="text-xs"
                              style={{ color: themeColors.textMuted }}
                            >
                              Gigs
                            </span>
                          </div>
                          <p
                            className="text-lg font-bold mt-1"
                            style={{ color: themeColors.text }}
                          >
                            {userInfo.completedGigsCount || 0}
                          </p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <DollarSign
                              className="w-3 h-3"
                              style={{ color: themeColors.success }}
                            />
                            <span
                              className="text-xs"
                              style={{ color: themeColors.textMuted }}
                            >
                              Rate
                            </span>
                          </div>
                          <p
                            className="text-lg font-bold mt-1"
                            style={{ color: themeColors.text }}
                          >
                            ${role?.price || userInfo.rate?.baseRate || "—"}
                          </p>
                        </div>
                      </div>

                      {/* Role Capacity - ADD THIS SECTION HERE */}
                      {role && (
                        <div
                          className="mb-4 p-3 rounded-lg border"
                          style={{
                            backgroundColor: `${roleColors.bg}20`,
                            borderColor: roleColors.border,
                          }}
                        >
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-2">
                              <span
                                className="text-xs font-semibold"
                                style={{ color: themeColors.text }}
                              >
                                Role Capacity
                              </span>
                              <Badge
                                className="text-xs px-2 py-0.5"
                                style={{
                                  backgroundColor:
                                    currentApplicants >= maxApplicants
                                      ? themeColors.destructive
                                      : currentApplicants / maxApplicants >= 0.8
                                        ? themeColors.warning
                                        : themeColors.success,
                                  color: themeColors.primaryContrast,
                                }}
                              >
                                {currentApplicants >= maxApplicants
                                  ? "Full"
                                  : "Open"}
                              </Badge>
                            </div>
                            <span
                              className="text-xs font-medium"
                              style={{
                                color:
                                  currentApplicants >= maxApplicants
                                    ? themeColors.destructive
                                    : currentApplicants / maxApplicants >= 0.8
                                      ? themeColors.warning
                                      : themeColors.success,
                              }}
                            >
                              {currentApplicants}/{maxApplicants}
                            </span>
                          </div>

                          {/* Progress Bar */}
                          <div
                            className="h-2 rounded-full overflow-hidden mb-2"
                            style={{
                              backgroundColor: `${themeColors.textMuted}20`,
                            }}
                          >
                            <div
                              className="h-full rounded-full transition-all duration-300"
                              style={{
                                width: `${Math.min((currentApplicants / maxApplicants) * 100, 100)}%`,
                                backgroundColor:
                                  currentApplicants >= maxApplicants
                                    ? themeColors.destructive
                                    : currentApplicants / maxApplicants >= 0.8
                                      ? themeColors.warning
                                      : themeColors.success,
                              }}
                            />
                          </div>

                          <div className="flex justify-between text-xs">
                            <div
                              className="flex items-center gap-1"
                              style={{ color: themeColors.textMuted }}
                            >
                              {currentApplicants >= maxApplicants ? (
                                <>
                                  <UserMinus className="w-3 h-3" />
                                  <span>No more spots</span>
                                </>
                              ) : (
                                <>
                                  <UserPlus className="w-3 h-3" />
                                  <span>
                                    {maxApplicants - currentApplicants} spots
                                    left
                                  </span>
                                </>
                              )}
                            </div>
                            <span style={{ color: themeColors.textMuted }}>
                              {Math.round(
                                (currentApplicants / maxApplicants) * 100
                              )}
                              % filled
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Location & Date */}
                      <div className="flex items-center justify-between text-xs mb-5">
                        <div
                          className="flex items-center gap-1"
                          style={{ color: themeColors.textMuted }}
                        >
                          <MapPin className="w-3 h-3" />
                          <span>{userInfo.city || "Remote"}</span>
                        </div>
                        <div
                          className="flex items-center gap-1"
                          style={{ color: themeColors.textMuted }}
                        >
                          <Calendar className="w-3 h-3" />
                          <span>
                            {new Date(
                              user.bookedAt || user.appliedAt
                            ).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-2">
                        <Button
                          size="sm"
                          className="w-full group transition-all"
                          onClick={() => {
                            if (!isBooked) {
                              handleBookForRole(
                                user.userId,
                                user.bandRoleIndex,
                                role?.role || user.bandRole,
                                userInfo.firstname || userInfo.username
                              );
                            }
                          }}
                          disabled={isBooked || loadingBooking}
                          style={{
                            backgroundColor: themeColors.primaryBg,
                            color: themeColors.primaryContrast,
                            opacity: isBooked ? 0.7 : 1,
                          }}
                        >
                          {isBooked ? (
                            <>
                              <CheckCircle className="w-3.5 h-3.5 mr-2" />
                              Booked
                            </>
                          ) : (
                            <>
                              {loadingBooking ? (
                                <>
                                  <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                                  Booking...
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="w-3.5 h-3.5 mr-2" />
                                  Book Now
                                </>
                              )}
                            </>
                          )}
                        </Button>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() =>
                              router.push(`/profile/${user.userId}`)
                            }
                            style={{
                              backgroundColor: "transparent",
                              borderColor: themeColors.border,
                              color: themeColors.text,
                            }}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() =>
                              isBooked
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
                              isBooked ? loadingUnbooking : loadingRemoval
                            }
                            style={{
                              backgroundColor: "transparent",
                              borderColor: themeColors.destructive,
                              color: themeColors.destructive,
                            }}
                          >
                            {isBooked ? (
                              loadingUnbooking ? (
                                <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <XCircle className="w-3.5 h-3.5" />
                              )
                            ) : loadingRemoval ? (
                              <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <X className="w-3.5 h-3.5" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {/* Empty State */}
        {filteredUsers.length === 0 && (
          <div className="text-center py-12 md:py-16">
            <div
              className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6"
              style={{ backgroundColor: themeColors.textMuted + "20" }}
            >
              <Users
                className="w-10 h-10"
                style={{ color: themeColors.textMuted }}
              />
            </div>
            <h3
              className="text-lg md:text-xl font-semibold mb-2"
              style={{ color: themeColors.text }}
            >
              No applicants found
            </h3>
            <p
              className="text-sm md:text-base max-w-md mx-auto mb-6"
              style={{ color: themeColors.textMuted }}
            >
              {searchQuery
                ? "No results matching your search"
                : selectedRole === "all"
                  ? "No one has applied or been booked yet"
                  : `No ${selectedRole} applicants found`}
            </p>
            {searchQuery && (
              <Button
                variant="outline"
                onClick={() => setSearchQuery("")}
                className="gap-2"
                style={{
                  backgroundColor: "transparent",
                  borderColor: themeColors.border,
                  color: themeColors.text,
                }}
              >
                <X className="w-4 h-4" />
                Clear Search
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Mobile Action Bar */}
      <div
        className="md:hidden fixed bottom-0 left-0 right-0 p-4 border-t"
        style={{
          backgroundColor: themeColors.card,
          borderColor: themeColors.border,
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p
              className="text-sm font-semibold"
              style={{ color: themeColors.text }}
            >
              {filteredUsers.length}{" "}
              {filteredUsers.length === 1 ? "applicant" : "applicants"}
            </p>
            <p className="text-xs" style={{ color: themeColors.textMuted }}>
              {roles.length} roles
            </p>
          </div>
          <Button
            size="sm"
            style={{
              backgroundColor: themeColors.primaryBg,
              color: themeColors.primaryContrast,
            }}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>
    </div>
  );
}
