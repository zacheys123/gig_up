// components/gigs/ClientPreBooking.tsx
"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion, AnimatePresence, Variants } from "framer-motion";

// UI Components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Icons
import {
  Search,
  Calendar,
  MapPin,
  DollarSign,
  ShoppingBag,
  Bookmark,
  Users,
  Users2,
  User,
  History,
  CheckCircle,
  Eye,
  Star,
  XCircle,
  Clock,
  Music,
  Sparkles,
  TrendingUp,
  ArrowRight,
  ChevronRight,
  Filter,
  MoreVertical,
  Zap,
  Mic,
  Volume2,
  Briefcase,
  Target,
  Award,
  Edit,
  Archive,
  AlertCircle,
  Grid3x3,
  List,
  Kanban,
  CalendarDays,
  Activity,
  ChevronUp,
  ChevronDown,
  X,
} from "lucide-react";

// Custom Components
import { ChatIcon } from "@/components/chat/ChatIcon";

// Tab Components
import { BandRolesTab } from "@/components/booking/BandGigWithRoleTab";
import { HistoryTab } from "@/components/booking/History";
import { RegularGigsTab } from "@/components/booking/RegularGigsTab";
// Types
import {
  Applicant,
  ShortlistedUser,
  GigWithApplicants,
  GigTabType,
} from "@/types/bookings";
import { ShortlistTab } from "@/components/booking/ShortlIstTab";
import { FullBandTab } from "@/components/booking/FullBandGig";
import { BookingOptionsSection } from "./BookingOptions";
import { PreBookingStats } from "./gigs/PreBookingStats";
import { useThemeColors } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";
import { getGigDateStatus } from "../helper/getGigDateStatus";

// Types
type DisplayMode = "grid" | "timeline" | "list" | "calendar" | "kanban";

interface ClientPreBookingProps {
  user: any;
}

export const ClientPreBooking: React.FC<ClientPreBookingProps> = ({ user }) => {
  const router = useRouter();
  const { userId: authClerkId } = useAuth();
  const { colors, isDarkMode } = useThemeColors();
  const isMobile = useMediaQuery("(max-width: 768px)");
  // Get preferences synchronously from localStorage first
  const getInitialTab = (): GigTabType => {
    try {
      // Try to get from localStorage as a fallback
      const savedPrefs = localStorage.getItem(`preferences_${user?._id}`);
      if (savedPrefs) {
        const parsed = JSON.parse(savedPrefs);
        if (parsed?.clientPreBooking?.activeGigTab) {
          return parsed.clientPreBooking.activeGigTab as GigTabType;
        }
      }
    } catch (e) {
      console.error("Error reading from localStorage:", e);
    }
    return "regular"; // default
  };
  // Tab states - initialize with saved preference
  const [activeGigTab, setActiveGigTab] = useState<GigTabType>(getInitialTab());
  const [activeTab, setActiveTab] = useState<"applicants" | "history">(
    "applicants",
  );
  const [applicantView, setApplicantView] = useState<"active" | "history">(
    "active",
  );
  const [displayMode, setDisplayMode] = useState<DisplayMode>("grid");
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [showHeader, setShowHeader] = useState(false);

  // Preferences
  const userPreferences = useQuery(
    api.controllers.userPrefferences.getUserPreferences,
    user?._id ? { userId: user._id } : "skip",
  );
  const updateComponentPrefs = useMutation(
    api.controllers.userPrefferences.updateComponentPreferences,
  );

  // Load preferences and update state if different
  useEffect(() => {
    if (userPreferences?.preferences?.clientPreBooking) {
      const prefs = userPreferences.preferences.clientPreBooking;

      // Only update if different from current state
      if (prefs.displayMode && prefs.displayMode !== displayMode) {
        setDisplayMode(prefs.displayMode as DisplayMode);
      }
      if (prefs.activeGigTab && prefs.activeGigTab !== activeGigTab) {
        setActiveGigTab(prefs.activeGigTab as GigTabType);
      }
      if (prefs.activeTab && prefs.activeTab !== activeTab) {
        setActiveTab(prefs.activeTab as "applicants" | "history");
      }
      if (prefs.applicantView && prefs.applicantView !== applicantView) {
        setApplicantView(prefs.applicantView as "active" | "history");
      }

      // Save to localStorage for next time
      try {
        localStorage.setItem(
          `preferences_${user?._id}`,
          JSON.stringify(userPreferences.preferences),
        );
      } catch (e) {
        console.error("Error saving to localStorage:", e);
      }

      setIsInitialLoad(false);
    }
  }, [userPreferences]);

  // Save to localStorage whenever preferences change
  useEffect(() => {
    if (!isInitialLoad && user?._id) {
      const prefs = {
        clientPreBooking: {
          displayMode,
          activeGigTab,
          activeTab,
          applicantView,
        },
      };

      try {
        localStorage.setItem(`preferences_${user?._id}`, JSON.stringify(prefs));
      } catch (e) {
        console.error("Error saving to localStorage:", e);
      }
    }
  }, [
    displayMode,
    activeGigTab,
    activeTab,
    applicantView,
    user?._id,
    isInitialLoad,
  ]);

  // Save display mode
  const handleDisplayModeChange = useCallback(
    async (mode: DisplayMode) => {
      setDisplayMode(mode);

      if (!user?._id) return;

      try {
        await updateComponentPrefs({
          userId: user._id,
          component: "clientPreBooking",
          settings: { displayMode: mode },
        });
      } catch (error) {
        console.error("Error saving display mode:", error);
      }
    },
    [user?._id, updateComponentPrefs],
  );

  // Save active gig tab
  const handleGigTabChange = useCallback(
    async (tab: GigTabType) => {
      setActiveGigTab(tab);
      setSelectedGig(null);
      setSearchTerm("");

      if (!user?._id) return;

      try {
        await updateComponentPrefs({
          userId: user._id,
          component: "clientPreBooking",
          settings: { activeGigTab: tab },
        });
      } catch (error) {
        console.error("Error saving gig tab:", error);
      }
    },
    [user?._id, updateComponentPrefs],
  );

  // Save active tab
  const handleTabChange = useCallback(
    async (tab: "applicants" | "history") => {
      setActiveTab(tab);

      if (!user?._id) return;

      try {
        await updateComponentPrefs({
          userId: user._id,
          component: "clientPreBooking",
          settings: { activeTab: tab },
        });
      } catch (error) {
        console.error("Error saving tab:", error);
      }
    },
    [user?._id, updateComponentPrefs],
  );

  // Save applicant view
  const handleApplicantViewChange = useCallback(
    async (view: "active" | "history") => {
      setApplicantView(view);

      if (!user?._id) return;

      try {
        await updateComponentPrefs({
          userId: user._id,
          component: "clientPreBooking",
          settings: { applicantView: view },
        });
      } catch (error) {
        console.error("Error saving applicant view:", error);
      }
    },
    [user?._id, updateComponentPrefs],
  );

  // Queries
  const userGigs = useQuery(
    api.controllers.gigs.getGigsByUser,
    user?.clerkId
      ? {
          clerkId: user?.clerkId,
          status: "all",
          gigType: "all",
        }
      : "skip",
  );

  const allUsers = useQuery(api.controllers.user.getAllUsers);

  // Mutations
  const addToShortlist = useMutation(api.controllers.prebooking.addToShortlist);
  const removeFromShortlist = useMutation(
    api.controllers.prebooking.removeFromShortlist,
  );
  const bookMusician = useMutation(api.controllers.prebooking.bookMusician);
  const removeApplicant = useMutation(
    api.controllers.prebooking.removeApplicant,
  );
  const markApplicantViewed = useMutation(
    api.controllers.prebooking.markApplicantViewed,
  );

  // State
  const [loading, setLoading] = useState(true);
  const [gigsWithApplicants, setGigsWithApplicants] = useState<
    GigWithApplicants[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGig, setSelectedGig] = useState<Id<"gigs"> | null>(null);
  const [showBookDialog, setShowBookDialog] = useState(false);
  const [selectedMusician, setSelectedMusician] = useState<{
    userId: Id<"users">;
    userName: string;
    source?: "regular" | "band-role" | "full-band" | "shortlisted";
    bandId?: Id<"bands">;
    bandRoleIndex?: number;
  } | null>(null);
  const [selectedBand, setSelectedBand] = useState<{
    bandId: Id<"bands">;
    bandName: string;
  } | null>(null);
  const [bookingPrice, setBookingPrice] = useState<number | "">("");

  // Add this stats calculation
  const stats = useMemo(() => {
    if (!userGigs) return null;

    const total = userGigs.length;
    const active = userGigs.filter((g) => !g.isTaken).length;
    const booked = userGigs.filter((g) => g.isTaken).length;
    const applications = userGigs.reduce((acc, gig) => {
      return acc + (gig.interestedUsers?.length || 0);
    }, 0);

    return {
      total,
      active,
      booked,
      applications,
    };
  }, [userGigs]);
  // Get tab counts
  const getTabCounts = () => {
    if (!userGigs)
      return { regular: 0, bandRoles: 0, fullBand: 0, shortlist: 0 };

    const counts = {
      regular: 0,
      bandRoles: 0,
      fullBand: 0,
      shortlist: 0,
    };

    userGigs.forEach((gig) => {
      const typedGig = gig as any;

      if (typedGig.isTaken) return;

      if (!typedGig.isClientBand) {
        const hasInterested =
          typedGig.interestedUsers && typedGig.interestedUsers.length > 0;
        if (hasInterested) counts.regular++;
      }

      if (typedGig.isClientBand && typedGig.bandCategory) {
        const hasRoleApplicants = typedGig.bandCategory.some(
          (role: any) => role.applicants && role.applicants.length > 0,
        );
        if (hasRoleApplicants) counts.bandRoles++;
      }

      if (typedGig.isClientBand) {
        const hasBandApplications =
          typedGig.bookCount && typedGig.bookCount.length > 0;
        if (hasBandApplications) counts.fullBand++;
      }

      const hasShortlisted =
        typedGig.shortlistedUsers && typedGig.shortlistedUsers.length > 0;
      if (hasShortlisted) counts.shortlist++;
    });

    return counts;
  };

  const tabCounts = getTabCounts();

  // Process gigs with proper null checks
  const processGigsWithApplicants = () => {
    if (!userGigs || !allUsers) {
      console.log("No gigs or users data available");
      return;
    }

    const userMap = new Map();
    allUsers.forEach((user) => {
      userMap.set(user._id, user);
    });

    const processedGigs = userGigs
      .filter((gig) => {
        const typedGig = gig as any;

        const interestedUsers = typedGig.interestedUsers || [];
        const shortlistedUsers = typedGig.shortlistedUsers || [];
        const bookCount = typedGig.bookCount || [];
        const bandCategory = typedGig.bandCategory || [];

        const hasInterested = interestedUsers.length > 0;
        const hasShortlisted = shortlistedUsers.length > 0;
        const hasBandApplications = bookCount.length > 0;
        const hasBandRoles = bandCategory.length > 0;
        const isNotTaken = !typedGig.isTaken;

        switch (activeGigTab) {
          case "regular":
            return !typedGig.isClientBand && hasInterested && isNotTaken;
          case "band-roles":
            return typedGig.isClientBand && hasBandRoles && isNotTaken;
          case "full-band":
            return typedGig.isClientBand && hasBandApplications && isNotTaken;
          case "shortlist":
            return hasShortlisted && isNotTaken;
          default:
            return false;
        }
      })
      .map((gig) => {
        const typedGig = gig as any;

        let applicants: Applicant[] = [];
        let shortlisted: ShortlistedUser[] = [];
        const bookingHistory = typedGig.bookingHistory || [];

        const interestedUsers = typedGig.interestedUsers || [];
        const shortlistedUsers = typedGig.shortlistedUsers || [];
        const bandCategory = typedGig.bandCategory || [];
        const bookCount = typedGig.bookCount || [];

        switch (activeGigTab) {
          case "regular":
            applicants = interestedUsers.map((userId: Id<"users">) => {
              const statusHistory = bookingHistory.filter(
                (entry: any) => entry.userId === userId,
              );

              let status: Applicant["status"] = "pending";

              const hasCancelled = statusHistory.some(
                (entry: any) => entry.status === "cancelled",
              );
              const hasRejected = statusHistory.some(
                (entry: any) => entry.status === "rejected",
              );

              if (hasCancelled) {
                status = "cancelled";
              } else if (hasRejected) {
                status = "rejected";
              } else {
                if (statusHistory.length > 0) {
                  const sortedHistory = [...statusHistory].sort(
                    (a, b) => (b.timestamp || 0) - (a.timestamp || 0),
                  );
                  const latestEntry = sortedHistory[0];

                  if (latestEntry.status === "booked") {
                    status = "booked";
                  } else if (
                    latestEntry.status === "updated" ||
                    latestEntry.status === "viewed"
                  ) {
                    status = "viewed";
                  }
                }

                if (status !== "booked") {
                  const isShortlisted = shortlistedUsers.some(
                    (item: any) => item.userId === userId,
                  );
                  if (isShortlisted) {
                    status = "shortlisted";
                  }
                }
              }

              return {
                userId,
                appliedAt: typedGig.createdAt,
                status,
                gigId: typedGig._id,
              };
            });
            break;

          case "band-roles":
            bandCategory.forEach((role: any, roleIndex: number) => {
              const roleApplicants = role.applicants || [];
              const roleBookedUsers = role.bookedUsers || [];

              roleApplicants.forEach((userId: Id<"users">) => {
                const statusHistory = bookingHistory.filter(
                  (entry: any) =>
                    entry.userId === userId &&
                    entry.bandRoleIndex === roleIndex,
                );

                let status: Applicant["status"] = "pending";

                const hasCancelled = statusHistory.some(
                  (entry: any) => entry.status === "cancelled",
                );
                const hasRejected = statusHistory.some(
                  (entry: any) => entry.status === "rejected",
                );

                if (hasCancelled) {
                  status = "cancelled";
                } else if (hasRejected) {
                  status = "rejected";
                } else {
                  if (statusHistory.length > 0) {
                    const sortedHistory = [...statusHistory].sort(
                      (a, b) => (b.timestamp || 0) - (a.timestamp || 0),
                    );
                    const latestEntry = sortedHistory[0];

                    if (latestEntry.status === "booked") {
                      status = "booked";
                    }
                  }

                  if (status !== "booked") {
                    const isShortlisted = shortlistedUsers.some(
                      (item: any) =>
                        item.userId === userId &&
                        item.bandRoleIndex === roleIndex,
                    );
                    if (isShortlisted) {
                      status = "shortlisted";
                    }
                  }
                }

                applicants.push({
                  userId,
                  appliedAt: typedGig.createdAt,
                  status,
                  gigId: typedGig._id,
                  bandRole: role.role,
                  bandRoleIndex: roleIndex,
                });
              });

              roleBookedUsers.forEach((userId: Id<"users">) => {
                const hasCancelled = bookingHistory.some(
                  (entry: any) =>
                    entry.userId === userId &&
                    entry.status === "cancelled" &&
                    entry.bandRoleIndex === roleIndex,
                );

                const hasRejected = bookingHistory.some(
                  (entry: any) =>
                    entry.userId === userId &&
                    entry.status === "rejected" &&
                    entry.bandRoleIndex === roleIndex,
                );

                let status: Applicant["status"] = "booked";

                if (hasCancelled) {
                  status = "cancelled";
                } else if (hasRejected) {
                  status = "rejected";
                }

                applicants.push({
                  userId,
                  appliedAt: typedGig.createdAt,
                  status,
                  gigId: typedGig._id,
                  bandRole: role.role,
                  bandRoleIndex: roleIndex,
                });
              });
            });
            break;

          case "full-band":
            bookCount.forEach((bandApplication: any) => {
              const bandId = bandApplication.bandId;

              const statusHistory = bookingHistory.filter(
                (entry: any) => entry.userId === bandId,
              );

              let status: Applicant["status"] = "pending";

              const hasCancelled = statusHistory.some(
                (entry: any) => entry.status === "cancelled",
              );
              const hasRejected = statusHistory.some(
                (entry: any) => entry.status === "rejected",
              );

              if (hasCancelled) {
                status = "cancelled";
              } else if (hasRejected) {
                status = "rejected";
              } else {
                if (statusHistory.length > 0) {
                  const sortedHistory = [...statusHistory].sort(
                    (a, b) => (b.timestamp || 0) - (a.timestamp || 0),
                  );
                  const latestEntry = sortedHistory[0];

                  if (latestEntry.status === "booked") {
                    status = "booked";
                  }
                }

                if (status !== "booked") {
                  const isShortlisted = shortlistedUsers.some(
                    (item: any) => item.userId === bandId,
                  );
                  if (isShortlisted) {
                    status = "shortlisted";
                  }
                }
              }

              applicants.push({
                userId: bandId,
                appliedAt: typedGig.createdAt,
                status,
                gigId: typedGig._id,
              });
            });
            break;
        }

        shortlisted = shortlistedUsers.map((item: any) => ({
          userId: item.userId,
          shortlistedAt: item.shortlistedAt,
          notes: item.notes,
          status: item.status || "active",
          bandRole: item.bandRole,
          bandRoleIndex: item.bandRoleIndex,
        }));

        return {
          gig: typedGig,
          applicants,
          shortlisted,
          userDetails: userMap,
        } as GigWithApplicants;
      })
      .filter((gigData) => {
        if (activeGigTab === "shortlist") {
          return gigData.shortlisted.length > 0;
        } else if (activeGigTab === "full-band") {
          return gigData.gig.bookCount && gigData.gig.bookCount.length > 0;
        }
        return gigData.applicants.length > 0;
      });

    setGigsWithApplicants(processedGigs);

    if (processedGigs.length > 0 && !selectedGig) {
      setSelectedGig(processedGigs[0].gig._id);
    }
  };

  // Handlers
  const handleAddToShortlist = async (
    gigId: Id<"gigs">,
    applicantId: Id<"users">,
    bandRole?: string,
    bandRoleIndex?: number,
  ) => {
    if (!user?.clerkId) {
      toast.error("Authentication required");
      return;
    }

    try {
      await addToShortlist({
        gigId,
        applicantId,
        notes: bandRole ? `Interested for ${bandRole} role` : undefined,
        clerkId: user?.clerkId,
        bandRole,
        bandRoleIndex,
      });
      toast.success(`Added to shortlist for ${bandRole || "gig"}!`);
      processGigsWithApplicants();
    } catch (error) {
      console.error("Failed to add to shortlist:", error);
      toast.error("Failed to add to shortlist");
    }
  };

  const handleRemoveFromShortlist = async (
    gigId: Id<"gigs">,
    applicantId: Id<"users">,
    bandRoleIndex?: number,
  ) => {
    if (!user?.clerkId) {
      toast.error("Authentication required");
      return;
    }

    try {
      await removeFromShortlist({
        gigId,
        applicantId,
        clerkId: user?.clerkId,
      });
      toast.success("Removed from shortlist");
      processGigsWithApplicants();
    } catch (error) {
      console.error("Failed to remove from shortlist:", error);
      toast.error("Failed to remove from shortlist");
    }
  };

  const handleBookMusician = (
    userId: Id<"users">,
    userName: string,
    source?: "regular" | "band-role" | "full-band" | "shortlisted",
    bandId?: Id<"bands">,
    bandRoleIndex?: number,
  ) => {
    setSelectedMusician({
      userId,
      userName,
      source: source || "regular",
      bandId,
      bandRoleIndex,
    });
    setSelectedBand(null);
    setBookingPrice("");
    setShowBookDialog(true);
  };

  const handleConfirmBooking = async () => {
    if (!selectedGig || !user?.clerkId) {
      toast.error("No gig selected or authentication required");
      return;
    }

    try {
      let source: "regular" | "band-role" | "full-band" | "shortlisted" =
        selectedMusician?.source || "regular";

      if (activeGigTab === "shortlist" && !selectedMusician?.source) {
        source = "shortlisted";
      }

      const bookingData: any = {
        gigId: selectedGig,
        source: source,
        agreedPrice: bookingPrice ? Number(bookingPrice) : undefined,
        notes: `Booked from ${activeGigTab} tab`,
        clerkId: user?.clerkId,
      };

      if (selectedMusician) {
        bookingData.musicianId = selectedMusician.userId;

        if (
          selectedMusician.source === "full-band" &&
          selectedMusician.bandId
        ) {
          bookingData.bandId = selectedMusician.bandId;
        }

        if (
          selectedMusician.source === "band-role" &&
          selectedMusician.bandRoleIndex !== undefined
        ) {
          bookingData.bandRoleIndex = selectedMusician.bandRoleIndex;
        }
      } else if (selectedBand) {
        bookingData.source = "full-band";
        bookingData.musicianId = selectedBand.bandId;
        bookingData.bandId = selectedBand.bandId;
      } else {
        toast.error("No musician or band selected");
        return;
      }

      await bookMusician(bookingData);

      toast.success(
        `Booked ${selectedMusician?.userName || selectedBand?.bandName || "Unknown"}!`,
      );

      setShowBookDialog(false);
      setSelectedMusician(null);
      setSelectedBand(null);
      processGigsWithApplicants();
    } catch (error: any) {
      console.error("Failed to book:", error);
      toast.error(error.message || "Failed to book");
    }
  };

  const handleViewProfile = async (
    gigId: Id<"gigs">,
    applicantId: Id<"users">,
  ) => {
    try {
      await markApplicantViewed({ gigId, applicantId });
      window.open(`/profile/${applicantId}`, "_blank");
    } catch (error) {
      console.error("Failed to mark as viewed:", error);
      window.open(`/profile/${applicantId}`, "_blank");
    }
  };

  useEffect(() => {
    if (userGigs !== undefined && allUsers !== undefined) {
      processGigsWithApplicants();
      setLoading(false);
    }
  }, [userGigs, allUsers, activeGigTab]);

  // Format helpers
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "shortlisted":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      case "viewed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "booked":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "cancelled":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "updated":
        return "bg-cyan-100 text-cyan-800 border-cyan-200";
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  // Get gig icon based on category
  const getGigIcon = (gig: any) => {
    if (gig.isClientBand) {
      if (gig.bandCategory?.length > 0) {
        return <Users className="w-5 h-5 text-purple-500" />;
      }
      return <Users2 className="w-5 h-5 text-blue-500" />;
    }

    if (gig.bussinesscat === "mc") {
      return <Mic className="w-5 h-5 text-red-500" />;
    }
    if (gig.bussinesscat === "dj") {
      return <Volume2 className="w-5 h-5 text-pink-500" />;
    }
    if (gig.bussinesscat === "vocalist") {
      return <Music className="w-5 h-5 text-green-500" />;
    }
    if (gig.bussinesscat === "full") {
      return <Users className="w-5 h-5 text-orange-500" />;
    }

    return <Music className="w-5 h-5 text-orange-500" />;
  };

  const getGigCategoryLabel = (gig: any) => {
    if (gig.isClientBand) {
      if (gig.bandCategory?.length > 0) {
        return "Band Creation";
      }
      return "Full Band";
    }

    switch (gig.bussinesscat) {
      case "mc":
        return "MC";
      case "dj":
        return "DJ";
      case "vocalist":
        return "Vocalist";
      case "full":
        return "Full Band";
      case "personal":
        return "Individual";
      default:
        return "Gig";
    }
  };

  const getGigCategoryColor = (gig: any) => {
    if (gig.isClientBand) {
      if (gig.bandCategory?.length > 0) {
        return "bg-purple-100 text-purple-800 border-purple-200";
      }
      return "bg-blue-100 text-blue-800 border-blue-200";
    }

    switch (gig.bussinesscat) {
      case "mc":
        return "bg-red-100 text-red-800 border-red-200";
      case "dj":
        return "bg-pink-100 text-pink-800 border-pink-200";
      case "vocalist":
        return "bg-green-100 text-green-800 border-green-200";
      case "full":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "personal":
        return "bg-cyan-100 text-cyan-800 border-cyan-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Get selected gig data
  const selectedGigData = selectedGig
    ? gigsWithApplicants.find((g) => g.gig._id === selectedGig)
    : gigsWithApplicants[0];

  // Split applicants into active and history
  const activeApplicants =
    selectedGigData?.applicants.filter((applicant) => {
      return !["cancelled", "rejected"].includes(applicant.status);
    }) || [];

  const historyApplicants =
    selectedGigData?.applicants.filter((applicant) => {
      return ["cancelled", "rejected"].includes(applicant.status);
    }) || [];

  // Apply search filter
  const filterBySearch = (applicant: Applicant) => {
    if (!searchTerm) return true;
    const user = selectedGigData?.userDetails.get(applicant.userId);
    const term = searchTerm.toLowerCase();
    return (
      user?.firstname?.toLowerCase().includes(term) ||
      user?.username?.toLowerCase().includes(term) ||
      user?.roleType?.toLowerCase().includes(term) ||
      applicant.bandRole?.toLowerCase().includes(term)
    );
  };

  const filteredActiveApplicants = activeApplicants.filter(filterBySearch);
  const filteredHistoryApplicants = historyApplicants.filter(filterBySearch);
  const filteredShortlist =
    selectedGigData?.shortlisted.filter((shortlistItem) => {
      if (!searchTerm) return true;
      const user = selectedGigData.userDetails.get(shortlistItem.userId);
      const term = searchTerm.toLowerCase();
      return (
        user?.firstname?.toLowerCase().includes(term) ||
        user?.username?.toLowerCase().includes(term) ||
        user?.roleType?.toLowerCase().includes(term) ||
        shortlistItem.bandRole?.toLowerCase().includes(term)
      );
    }) || [];

  // Get applicant count for gig card
  const getGigApplicantCount = (gigData: GigWithApplicants) => {
    switch (activeGigTab) {
      case "shortlist":
        return gigData.shortlisted.length;
      case "full-band":
        return gigData.gig.bookCount?.length || 0;
      default:
        return gigData.applicants.length;
    }
  };

  // Get gig status color
  const getGigStatusColor = (gig: any) => {
    if (gig.isTaken) return "bg-red-100 text-red-800";
    if (gig.isPending) return "bg-yellow-100 text-yellow-800";
    if (gig.bookCount?.length > 0) return "bg-purple-100 text-purple-800";
    return "bg-green-100 text-green-800";
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 400, damping: 30 },
    },
    hover: {
      scale: 1.02,
      transition: { type: "spring", stiffness: 400, damping: 20 },
    },
    tap: { scale: 0.98 },
  };

  // Add this - statsVariants for stats cards animation
  // Clear all filters and reset to default state
  const handleClearFilters = useCallback(() => {
    setSearchTerm("");
    setActiveGigTab("regular");
    setActiveTab("applicants");
    setApplicantView("active");

    // Optional: Reset selected gig if needed
    // setSelectedGig(null);

    // Optional: Show toast notification
    toast.success("All filters cleared", {
      icon: "🧹",
      duration: 2000,
    });
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="space-y-6">
          <ScrollArea>
            <div className="flex gap-3 pb-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton
                  key={i}
                  className="h-32 w-64 rounded-xl flex-shrink-0"
                />
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
          <Skeleton className="h-[400px] rounded-xl" />
        </div>
      </div>
    );
  }
  return (
    <TooltipProvider>
      <div className="h-full flex flex-col">
        {/* Sticky Header Section - Fixed at top */}
        <div className="sticky top-0 z-30 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="px-3 py-2 md:px-6 md:py-3"
          >
            {/* Header with Chevron Toggle - More compact on mobile */}
            <div className="flex items-start justify-between gap-2">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex-1 min-w-0"
              >
                <div className="flex items-center gap-1.5 md:gap-2 mb-0.5">
                  <div
                    className={cn(
                      "p-1.5 md:p-2 rounded-lg shrink-0",
                      isDarkMode ? "bg-blue-500/20" : "bg-blue-100",
                    )}
                  >
                    <Briefcase
                      className={cn(
                        "w-4 h-4 md:w-5 md:h-5",
                        isDarkMode ? "text-blue-400" : "text-blue-600",
                      )}
                    />
                  </div>
                  <h2
                    className={cn(
                      "text-base md:text-xl font-bold tracking-tight truncate",
                      isDarkMode ? "text-white" : "text-slate-900",
                    )}
                  >
                    Client Pre-Booking
                  </h2>
                </div>
                <p
                  className={cn(
                    "text-xs truncate",
                    isDarkMode ? "text-slate-400" : "text-slate-500",
                  )}
                >
                  {showHeader
                    ? "Manage applications & bookings"
                    : "Tap to expand filters"}
                </p>
              </motion.div>

              {/* Header Collapse Button with Chevron */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowHeader(!showHeader)}
                className={cn(
                  "p-1.5 md:p-2 rounded-full transition-all duration-200 shrink-0",
                  isDarkMode
                    ? "text-slate-400 hover:text-white hover:bg-slate-800"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-100",
                )}
              >
                {showHeader ? (
                  <ChevronUp className="w-4 h-4 md:w-5 md:h-5" />
                ) : (
                  <ChevronDown className="w-4 h-4 md:w-5 md:h-5" />
                )}
              </motion.button>
            </div>

            {/* Expandable Content */}
            <AnimatePresence>
              {showHeader && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="pt-3 space-y-3">
                    {/* Header Stats - Horizontal scroll on mobile */}
                    <div className="md:hidden -mx-3 px-3 overflow-x-auto scrollbar-hide">
                      <div className="flex gap-2 pb-1 min-w-min">
                        {stats &&
                          Object.entries(stats).map(([key, value], index) => (
                            <div
                              key={key}
                              className="flex-shrink-0 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800"
                            >
                              <span className="text-xs font-medium">
                                <span className="text-slate-500 dark:text-slate-400 mr-1">
                                  {key === "total"
                                    ? "Total"
                                    : key === "upcoming"
                                      ? "Up"
                                      : key === "past"
                                        ? "Past"
                                        : key === "today"
                                          ? "Now"
                                          : key === "client"
                                            ? "Client"
                                            : key === "musician"
                                              ? "Art"
                                              : key === "paid"
                                                ? "Paid"
                                                : key === "pendingPayment"
                                                  ? "Due"
                                                  : key}
                                  :
                                </span>
                                <span className="font-bold text-slate-900 dark:text-white">
                                  {value}
                                </span>
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* Desktop Stats - hidden on mobile */}
                    <div className="hidden md:block">
                      <PreBookingStats
                        userGigs={userGigs || []}
                        activeTab={activeGigTab}
                      />
                    </div>

                    {/* Tabs for gig types - Compact on mobile */}
                    <div className="overflow-x-auto scrollbar-hide -mx-3 px-3">
                      <div className="flex gap-1 pb-1 min-w-min">
                        {[
                          {
                            value: "regular",
                            label: "Regular",
                            count: tabCounts.regular,
                            color: "blue",
                          },
                          {
                            value: "band-roles",
                            label: "Band Roles",
                            count: tabCounts.bandRoles,
                            color: "purple",
                          },
                          {
                            value: "full-band",
                            label: "Full Band",
                            count: tabCounts.fullBand,
                            color: "green",
                          },
                          {
                            value: "shortlist",
                            label: "Shortlist",
                            count: tabCounts.shortlist,
                            color: "amber",
                          },
                        ].map((tab) => {
                          const isActive = activeGigTab === tab.value;
                          return (
                            <button
                              key={tab.value}
                              onClick={() =>
                                handleGigTabChange(tab.value as any)
                              }
                              className={cn(
                                "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors",
                                isActive
                                  ? isDarkMode
                                    ? `bg-${tab.color}-600 text-white`
                                    : `bg-${tab.color}-500 text-white`
                                  : isDarkMode
                                    ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200",
                              )}
                            >
                              {tab.label}
                              {tab.count > 0 && (
                                <span
                                  className={cn(
                                    "ml-1 px-1.5 py-0.5 rounded-full text-[10px]",
                                    isActive
                                      ? "bg-white/20 text-white"
                                      : isDarkMode
                                        ? "bg-slate-700 text-slate-300"
                                        : "bg-white text-slate-600",
                                  )}
                                >
                                  {tab.count}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Search Bar - Compact */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                      <Input
                        placeholder="Search gigs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 h-9 text-sm rounded-full"
                      />
                      {searchTerm && (
                        <button
                          onClick={() => setSearchTerm("")}
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                        >
                          <X className="w-3.5 h-3.5 text-slate-400" />
                        </button>
                      )}
                    </div>

                    {/* Quick filter stats */}
                    <div className="flex items-center justify-between text-xs">
                      <span
                        className={
                          isDarkMode ? "text-slate-400" : "text-slate-500"
                        }
                      >
                        {gigsWithApplicants.length} gigs available
                      </span>
                      {(searchTerm || activeGigTab !== "regular") && (
                        <button
                          onClick={handleClearFilters}
                          className="text-rose-500 hover:text-rose-600 font-medium"
                        >
                          Clear filters
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Main Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-3 md:px-6 pb-6">
          <div className="space-y-4 pt-3">
            {/* Horizontal Gig Cards */}
            {gigsWithApplicants.length > 0 ? (
              <ScrollArea className="w-full">
                <div className="flex gap-3 pb-2">
                  {gigsWithApplicants.map((gigData) => {
                    const isSelected = selectedGig === gigData.gig._id;
                    const applicantCount = getGigApplicantCount(gigData);
                    const dateStatus = getGigDateStatus?.(
                      gigData.gig.date,
                      gigData.gig.time,
                    ) || { isToday: false, exactPast: false };

                    return (
                      <motion.div
                        key={gigData.gig._id}
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        whileHover="hover"
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedGig(gigData.gig._id)}
                        className="flex-shrink-0 w-48 md:w-64"
                      >
                        <Card
                          className={cn(
                            "cursor-pointer transition-all duration-200 overflow-hidden border",
                            isSelected
                              ? isDarkMode
                                ? "ring-2 ring-blue-500 bg-gradient-to-br from-slate-900 to-slate-800"
                                : "ring-2 ring-blue-500 bg-gradient-to-br from-white to-slate-50"
                              : isDarkMode
                                ? "border-slate-800 bg-slate-900/50 hover:border-slate-700"
                                : "border-slate-200 bg-white hover:border-slate-300",
                          )}
                        >
                          {/* Status indicator line */}
                          <div
                            className={cn(
                              "h-1 w-full",
                              dateStatus.isToday
                                ? "bg-emerald-500"
                                : dateStatus.exactPast
                                  ? "bg-slate-500"
                                  : "bg-blue-500",
                            )}
                          />

                          <CardContent className="p-3">
                            {!isSelected ? (
                              <div className="text-center">
                                <div
                                  className={cn(
                                    "text-2xl font-bold mb-1",
                                    isDarkMode
                                      ? "text-white"
                                      : "text-slate-900",
                                  )}
                                >
                                  {applicantCount}
                                </div>
                                <div
                                  className={cn(
                                    "text-[10px] uppercase tracking-wider mb-1",
                                    isDarkMode
                                      ? "text-slate-400"
                                      : "text-slate-500",
                                  )}
                                >
                                  Applicants
                                </div>
                                <h3
                                  className={cn(
                                    "font-medium text-sm line-clamp-1 mb-1",
                                    isDarkMode
                                      ? "text-white"
                                      : "text-slate-900",
                                  )}
                                >
                                  {gigData.gig.title}
                                </h3>
                                <div
                                  className={cn(
                                    "text-[10px]",
                                    isDarkMode
                                      ? "text-slate-500"
                                      : "text-slate-400",
                                  )}
                                >
                                  {new Date(
                                    gigData.gig.date,
                                  ).toLocaleDateString()}
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <div
                                  className={cn(
                                    "border-b pb-2 text-center",
                                    isDarkMode
                                      ? "border-slate-700"
                                      : "border-slate-200",
                                  )}
                                >
                                  <div className="text-2xl font-bold text-blue-500">
                                    {applicantCount}
                                  </div>
                                  <div
                                    className={cn(
                                      "text-[10px] uppercase tracking-wider",
                                      isDarkMode
                                        ? "text-slate-400"
                                        : "text-slate-500",
                                    )}
                                  >
                                    Total Applicants
                                  </div>
                                </div>

                                <div>
                                  <h3
                                    className={cn(
                                      "font-semibold text-sm mb-1 line-clamp-1",
                                      isDarkMode
                                        ? "text-white"
                                        : "text-slate-900",
                                    )}
                                  >
                                    {gigData.gig.title}
                                  </h3>

                                  <div className="space-y-1 text-xs">
                                    {gigData.gig.time?.start &&
                                      gigData.gig.time?.end && (
                                        <div className="flex items-center gap-1">
                                          <Clock
                                            className={cn(
                                              "w-3 h-3 shrink-0",
                                              isDarkMode
                                                ? "text-slate-500"
                                                : "text-slate-400",
                                            )}
                                          />
                                          <span
                                            className={cn(
                                              "truncate text-[10px]",
                                              isDarkMode
                                                ? "text-slate-300"
                                                : "text-slate-600",
                                            )}
                                          >
                                            {gigData.gig.time.start}
                                            {
                                              gigData.gig.time.durationFrom
                                            } - {gigData.gig.time.end}
                                            {gigData.gig.time.durationTo}
                                          </span>
                                        </div>
                                      )}

                                    {gigData.gig.location && (
                                      <div className="flex items-center gap-1">
                                        <MapPin
                                          className={cn(
                                            "w-3 h-3 shrink-0",
                                            isDarkMode
                                              ? "text-slate-500"
                                              : "text-slate-400",
                                          )}
                                        />
                                        <span
                                          className={cn(
                                            "truncate text-[10px]",
                                            isDarkMode
                                              ? "text-slate-300"
                                              : "text-slate-600",
                                          )}
                                        >
                                          {gigData.gig.location}
                                        </span>
                                      </div>
                                    )}

                                    {gigData?.gig?.price &&
                                      gigData?.gig?.price > 0 && (
                                        <div className="flex items-center gap-1 font-semibold">
                                          <DollarSign className="w-3 h-3 text-emerald-500 shrink-0" />
                                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400">
                                            ${gigData.gig.price}
                                          </span>
                                        </div>
                                      )}
                                  </div>
                                </div>

                                {gigData.shortlisted.length > 0 && (
                                  <div
                                    className={cn(
                                      "flex items-center justify-between pt-1 border-t text-xs",
                                      isDarkMode
                                        ? "border-slate-700"
                                        : "border-slate-200",
                                    )}
                                  >
                                    <span
                                      className={cn(
                                        "text-[10px]",
                                        isDarkMode
                                          ? "text-slate-300"
                                          : "text-slate-600",
                                      )}
                                    >
                                      Shortlisted
                                    </span>
                                    <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 text-[10px] px-1.5 py-0.5">
                                      {gigData.shortlisted.length}
                                    </Badge>
                                  </div>
                                )}

                                <Badge
                                  className={cn(
                                    "w-full justify-center text-[10px] py-0.5",
                                    gigData.gig.isTaken
                                      ? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                                      : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
                                  )}
                                >
                                  {gigData.gig.isTaken ? "Booked" : "Active"}
                                </Badge>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            ) : (
              <Card
                className={cn(
                  "text-center p-6",
                  isDarkMode
                    ? "bg-slate-900/50 border-slate-800"
                    : "bg-white border-slate-200",
                )}
              >
                <CardContent className="space-y-2">
                  <div
                    className={cn(
                      "w-12 h-12 mx-auto rounded-full flex items-center justify-center",
                      isDarkMode ? "bg-slate-800" : "bg-slate-100",
                    )}
                  >
                    <Sparkles
                      className={cn(
                        "w-6 h-6",
                        isDarkMode ? "text-slate-400" : "text-slate-500",
                      )}
                    />
                  </div>
                  <div>
                    <h3
                      className={cn(
                        "font-medium text-sm mb-1",
                        isDarkMode ? "text-white" : "text-slate-900",
                      )}
                    >
                      No Gigs Found
                    </h3>
                    <p
                      className={cn(
                        "text-xs",
                        isDarkMode ? "text-slate-400" : "text-slate-500",
                      )}
                    >
                      Share your gigs or check back later
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* MAIN CONTENT AREA - Selected Gig Details */}
            {selectedGigData ? (
              <Card
                className={cn(
                  "border overflow-hidden",
                  isDarkMode
                    ? "bg-slate-900/50 border-slate-800"
                    : "bg-white border-slate-200",
                )}
              >
                {/* Top gradient bar */}
                <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

                <CardContent className="p-4 space-y-4">
                  {/* Gig Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className={cn(
                          "p-1.5 rounded-lg shrink-0",
                          isDarkMode ? "bg-slate-800" : "bg-slate-100",
                        )}
                      >
                        {getGigIcon(selectedGigData.gig)}
                      </div>
                      <div className="min-w-0">
                        <h1
                          className={cn(
                            "font-semibold text-sm truncate",
                            isDarkMode ? "text-white" : "text-slate-900",
                          )}
                        >
                          {selectedGigData.gig.title}
                        </h1>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge
                            className={cn(
                              "text-[10px] px-1.5 py-0.5",
                              selectedGigData.gig.isTaken
                                ? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                                : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
                            )}
                          >
                            {selectedGigData.gig.isTaken ? "Booked" : "Active"}
                          </Badge>
                          <div
                            className={cn(
                              "flex items-center gap-1 text-[10px]",
                              isDarkMode ? "text-slate-400" : "text-slate-500",
                            )}
                          >
                            <Calendar className="w-3 h-3" />
                            {formatDate(selectedGigData.gig.date)}
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        router.push(
                          `/hub/gigs/client/edit/${selectedGigData.gig._id}`,
                        );
                      }}
                      className={cn(
                        "h-7 px-2 text-xs gap-1 shrink-0",
                        isDarkMode
                          ? "border-blue-800/50 text-blue-400 hover:bg-blue-950/30"
                          : "border-blue-200 text-blue-600 hover:bg-blue-50",
                      )}
                    >
                      <Edit className="w-3 h-3" />
                      <span className="hidden sm:inline">Edit</span>
                    </Button>
                  </div>

                  {/* Gig Stats - Compact grid */}
                  <div className="grid grid-cols-4 gap-1">
                    {[
                      {
                        label: "Active",
                        value: activeApplicants.length,
                        icon: Users,
                        color: "blue",
                      },
                      {
                        label: "Shortlist",
                        value: selectedGigData.shortlisted.length,
                        icon: Bookmark,
                        color: "green",
                      },
                      {
                        label: "Budget",
                        value: `$${selectedGigData.gig.price || "0"}`,
                        icon: DollarSign,
                        color: "purple",
                      },
                      {
                        label: "History",
                        value: historyApplicants.length,
                        icon: Archive,
                        color: "gray",
                      },
                    ].map((stat, idx) => (
                      <div
                        key={idx}
                        className={cn(
                          "text-center p-2 rounded-lg",
                          isDarkMode
                            ? `bg-${stat.color}-900/20`
                            : `bg-${stat.color}-50`,
                        )}
                      >
                        <div className="flex items-center justify-center gap-1 mb-0.5">
                          <stat.icon
                            className={cn(
                              "w-3 h-3",
                              isDarkMode
                                ? `text-${stat.color}-400`
                                : `text-${stat.color}-500`,
                            )}
                          />
                          <span
                            className={cn(
                              "text-sm font-bold",
                              isDarkMode ? "text-white" : "text-slate-900",
                            )}
                          >
                            {stat.value}
                          </span>
                        </div>
                        <span
                          className={cn(
                            "text-[10px]",
                            isDarkMode ? "text-slate-400" : "text-slate-500",
                          )}
                        >
                          {stat.label}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Tab Content */}
                  {activeGigTab === "shortlist" ? (
                    <ShortlistTab
                      selectedGigData={selectedGigData}
                      filteredShortlist={filteredShortlist}
                      handleRemoveFromShortlist={handleRemoveFromShortlist}
                      handleViewProfile={handleViewProfile}
                      handleBookMusician={handleBookMusician}
                      formatTime={formatTime}
                    />
                  ) : (
                    <Tabs
                      value={activeTab}
                      onValueChange={(v: any) => handleTabChange(v)}
                      className="mt-2"
                    >
                      <TabsList
                        className={cn(
                          "grid grid-cols-2 p-0.5 h-8",
                          isDarkMode
                            ? "bg-slate-800/50 border border-slate-700/50"
                            : "bg-slate-100 border border-slate-200",
                        )}
                      >
                        <TabsTrigger value="applicants" className="text-xs h-7">
                          <Users className="w-3 h-3 mr-1" />
                          Applicants
                          {activeApplicants.length > 0 && (
                            <Badge className="ml-1 bg-blue-500 text-white text-[8px] px-1 py-0">
                              {activeApplicants.length}
                            </Badge>
                          )}
                        </TabsTrigger>
                        <TabsTrigger value="history" className="text-xs h-7">
                          <History className="w-3 h-3 mr-1" />
                          History
                          {historyApplicants.length > 0 && (
                            <Badge className="ml-1 bg-slate-500 text-white text-[8px] px-1 py-0">
                              {historyApplicants.length}
                            </Badge>
                          )}
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent
                        value="applicants"
                        className="space-y-3 mt-3"
                      >
                        {/* Applicant View Toggle */}
                        <div className="flex items-center gap-2">
                          <Button
                            variant={
                              applicantView === "active" ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => handleApplicantViewChange("active")}
                            className={cn(
                              "h-7 text-xs px-2",
                              applicantView === "active" && "bg-blue-600",
                            )}
                          >
                            <Users className="w-3 h-3 mr-1" />
                            Active ({filteredActiveApplicants.length})
                          </Button>
                          <Button
                            variant={
                              applicantView === "history"
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            onClick={() => handleApplicantViewChange("history")}
                            className={cn(
                              "h-7 text-xs px-2",
                              applicantView === "history" && "bg-slate-600",
                            )}
                          >
                            <Archive className="w-3 h-3 mr-1" />
                            History ({filteredHistoryApplicants.length})
                          </Button>
                        </div>

                        {/* Content based on view */}
                        {applicantView === "active" ? (
                          <>
                            {activeGigTab === "regular" && (
                              <RegularGigsTab
                                selectedGigData={{
                                  ...selectedGigData,
                                  applicants: filteredActiveApplicants,
                                }}
                                filteredApplicants={filteredActiveApplicants}
                                handleAddToShortlist={handleAddToShortlist}
                                handleRemoveFromShortlist={
                                  handleRemoveFromShortlist
                                }
                                handleViewProfile={handleViewProfile}
                                handleBookMusician={(
                                  userId: Id<"users">,
                                  userName: string,
                                ) =>
                                  handleBookMusician(
                                    userId,
                                    userName,
                                    "regular",
                                  )
                                }
                                getStatusColor={getStatusColor}
                              />
                            )}
                            {activeGigTab === "band-roles" && (
                              <BandRolesTab
                                selectedGigData={{
                                  ...selectedGigData,
                                  applicants: filteredActiveApplicants,
                                }}
                                filteredApplicants={filteredActiveApplicants}
                                clerkId={user?.clerkId!}
                              />
                            )}
                            {activeGigTab === "full-band" && (
                              <FullBandTab
                                selectedGigData={selectedGigData}
                                handleAddToShortlist={handleAddToShortlist}
                                handleRemoveFromShortlist={
                                  handleRemoveFromShortlist
                                }
                                handleViewProfile={handleViewProfile}
                                handleBookMusician={handleBookMusician}
                                getStatusColor={getStatusColor}
                              />
                            )}
                          </>
                        ) : (
                          /* History View */
                          <div className="space-y-2">
                            {filteredHistoryApplicants.length > 0 ? (
                              filteredHistoryApplicants.map((applicant) => {
                                const userData =
                                  selectedGigData.userDetails.get(
                                    applicant.userId,
                                  );
                                if (!userData) return null;

                                return (
                                  <Card
                                    key={applicant.userId}
                                    className={cn(
                                      "opacity-75 hover:opacity-100 transition-opacity",
                                      isDarkMode
                                        ? "bg-slate-900/50 border-slate-800"
                                        : "bg-white border-slate-200",
                                    )}
                                  >
                                    <CardContent className="p-3">
                                      <div className="flex items-center gap-2">
                                        <Avatar className="w-8 h-8">
                                          <AvatarImage src={userData.picture} />
                                          <AvatarFallback
                                            className={cn(
                                              "text-xs",
                                              isDarkMode
                                                ? "bg-slate-800 text-slate-300"
                                                : "bg-slate-200 text-slate-600",
                                            )}
                                          >
                                            {userData.firstname?.charAt(0) ||
                                              "U"}
                                          </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-1">
                                            <h4
                                              className={cn(
                                                "font-medium text-xs truncate",
                                                isDarkMode
                                                  ? "text-white"
                                                  : "text-slate-900",
                                              )}
                                            >
                                              {userData.firstname}{" "}
                                              {userData.username}
                                            </h4>
                                            {applicant.bandRole && (
                                              <Badge
                                                variant="outline"
                                                className="text-[8px] px-1 py-0"
                                              >
                                                {applicant.bandRole}
                                              </Badge>
                                            )}
                                          </div>
                                          <div className="flex items-center gap-1 mt-0.5">
                                            <Badge
                                              className={cn(
                                                "text-[8px] px-1 py-0",
                                                getStatusColor(
                                                  applicant.status,
                                                ),
                                              )}
                                            >
                                              {applicant.status === "cancelled"
                                                ? "Cancelled"
                                                : "Rejected"}
                                            </Badge>
                                            <span
                                              className={cn(
                                                "text-[8px]",
                                                isDarkMode
                                                  ? "text-slate-500"
                                                  : "text-slate-400",
                                              )}
                                            >
                                              {formatDate(applicant.appliedAt)}
                                            </span>
                                          </div>
                                        </div>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() =>
                                            handleViewProfile(
                                              selectedGigData.gig._id,
                                              applicant.userId,
                                            )
                                          }
                                          className="h-6 w-6 p-0"
                                        >
                                          <Eye className="w-3 h-3" />
                                        </Button>
                                      </div>
                                    </CardContent>
                                  </Card>
                                );
                              })
                            ) : (
                              <div
                                className={cn(
                                  "text-center py-6 text-xs",
                                  isDarkMode
                                    ? "text-slate-400"
                                    : "text-gray-500",
                                )}
                              >
                                <Archive className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                <p>No cancelled or rejected applicants</p>
                              </div>
                            )}
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="history">
                        <HistoryTab
                          selectedGigData={selectedGigData}
                          formatTime={formatTime}
                          getStatusColor={getStatusColor}
                        />
                      </TabsContent>
                    </Tabs>
                  )}
                </CardContent>
              </Card>
            ) : (
              // Empty State when no gig selected
              <Card
                className={cn(
                  "text-center py-8",
                  isDarkMode
                    ? "bg-slate-900/50 border-slate-800"
                    : "bg-white border-slate-200",
                )}
              >
                <CardContent className="space-y-3">
                  <div
                    className={cn(
                      "w-16 h-16 mx-auto rounded-full flex items-center justify-center",
                      isDarkMode ? "bg-slate-800" : "bg-slate-100",
                    )}
                  >
                    <Target
                      className={cn(
                        "w-8 h-8",
                        isDarkMode ? "text-slate-400" : "text-slate-500",
                      )}
                    />
                  </div>
                  <div>
                    <h3
                      className={cn(
                        "text-lg font-bold mb-1",
                        isDarkMode ? "text-white" : "text-slate-900",
                      )}
                    >
                      Select a Gig
                    </h3>
                    <p
                      className={cn(
                        "text-xs max-w-md mx-auto",
                        isDarkMode ? "text-slate-400" : "text-gray-500",
                      )}
                    >
                      Choose a gig from the cards above to view applicants
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Award
                      className={cn(
                        "w-4 h-4",
                        isDarkMode ? "text-slate-400" : "text-orange-500",
                      )}
                    />
                    <span
                      className={cn(
                        "text-xs font-medium",
                        isDarkMode ? "text-slate-300" : "text-gray-600",
                      )}
                    >
                      {gigsWithApplicants.length} gigs available
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Book Now Dialog */}
            <Dialog open={showBookDialog} onOpenChange={setShowBookDialog}>
              <DialogContent
                className={cn(
                  "sm:max-w-md",
                  isDarkMode
                    ? "bg-slate-900 border-slate-800"
                    : "bg-white border-slate-200",
                )}
              >
                <DialogHeader>
                  <DialogTitle
                    className={cn(
                      "text-base",
                      isDarkMode ? "text-white" : "text-slate-900",
                    )}
                  >
                    {selectedBand ? "Book Band" : "Book Musician"}
                  </DialogTitle>
                  <DialogDescription
                    className={cn(
                      "text-xs",
                      isDarkMode ? "text-slate-400" : "text-slate-500",
                    )}
                  >
                    Confirm booking for{" "}
                    {selectedBand?.bandName || selectedMusician?.userName}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 py-2">
                  <div
                    className={cn(
                      "p-3 rounded-lg border",
                      isDarkMode
                        ? "bg-gradient-to-r from-green-900/20 to-emerald-900/20 border-green-800/30"
                        : "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8 border-2 border-white shadow-lg">
                        <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-500 text-white text-xs">
                          {selectedBand?.bandName?.charAt(0) ||
                            selectedMusician?.userName?.charAt(0) ||
                            "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4
                          className={cn(
                            "font-semibold text-sm",
                            isDarkMode ? "text-white" : "text-slate-900",
                          )}
                        >
                          {selectedBand?.bandName || selectedMusician?.userName}
                        </h4>
                        <p
                          className={cn(
                            "text-xs",
                            isDarkMode ? "text-slate-400" : "text-gray-600",
                          )}
                        >
                          {selectedBand ? "Band" : "Musician"} ready to book
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label
                      className={cn(
                        "text-xs font-medium mb-1 block",
                        isDarkMode ? "text-slate-300" : "text-slate-700",
                      )}
                    >
                      Agreed Price (Optional)
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                      <Input
                        type="number"
                        placeholder="Enter price"
                        value={bookingPrice}
                        onChange={(e) =>
                          setBookingPrice(
                            e.target.value ? Number(e.target.value) : "",
                          )
                        }
                        className="pl-7 h-8 text-sm"
                      />
                    </div>
                  </div>

                  <div
                    className={cn(
                      "p-2 rounded-lg border",
                      isDarkMode
                        ? "bg-gradient-to-r from-blue-900/20 to-cyan-900/20 border-blue-800/30"
                        : "bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200",
                    )}
                  >
                    <div className="flex items-start gap-1">
                      <CheckCircle className="w-3 h-3 text-blue-600 mt-0.5 shrink-0" />
                      <p
                        className={cn(
                          "text-xs",
                          isDarkMode ? "text-blue-300" : "text-blue-800",
                        )}
                      >
                        {selectedBand
                          ? "Band members will be notified"
                          : "Musician will be notified"}
                      </p>
                    </div>
                  </div>
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowBookDialog(false);
                      setSelectedMusician(null);
                      setSelectedBand(null);
                    }}
                    className="w-full sm:w-auto h-8 text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleConfirmBooking}
                    className="w-full sm:w-auto h-8 text-xs bg-gradient-to-r from-purple-600 to-pink-600"
                  >
                    <ShoppingBag className="w-3 h-3 mr-1" />
                    Confirm
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Band Booking Options Section */}
            {selectedGigData?.gig.isClientBand &&
              selectedGigData?.gig.bandCategory &&
              selectedGigData?.gig.bandCategory.length > 0 && (
                <div
                  className={cn(
                    "mt-4 border-t pt-4",
                    isDarkMode ? "border-slate-800" : "border-slate-200",
                  )}
                >
                  <BookingOptionsSection
                    gigId={selectedGigData.gig._id}
                    clerkId={user?.clerkId!}
                    gig={selectedGigData.gig}
                    musiciansCount={selectedGigData.gig.bandCategory.reduce(
                      (total: number, role: any) =>
                        total + (role.bookedUsers?.length || 0),
                      0,
                    )}
                  />
                </div>
              )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};
