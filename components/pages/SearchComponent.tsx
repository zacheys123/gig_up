// components/pages/SearchComponent.tsx
"use client";
import { useAuth } from "@clerk/nextjs";
import { searchFunc } from "@/utils";
import MainUser from "./MainUser";
import { useAllUsers } from "@/hooks/useAllUsers";
import { motion, AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { FiSearch, FiUsers } from "react-icons/fi";
import { calculateReliability } from "@/lib/reliability";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import SearchFilters from "./SearchFilters";
import { useUserStore } from "@/app/stores";
import { UserProps } from "@/types/userTypes";
import { useThemeColors } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import ClientEducationModal from "./ClientEducationModal";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { SearchUserSkeletonGrid } from "../skeletons/SearchMainUserSkeleton";
import { debounce } from "lodash";

const SearchComponent = () => {
  const { userId } = useAuth();
  const { searchQuery } = useUserStore();
  const { users } = useAllUsers();
  const { user: myuser } = useCurrentUser();
  const containerRef = useRef<HTMLDivElement>(null);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (users) {
        setIsLoading(false);
      }
    }, 1000); // Minimum loading time for better UX

    return () => clearTimeout(timer);
  }, [users]);

  const [activeFilters, setActiveFilters] = useState({
    roleType: [] as string[],
    instrument: [] as string[],
    discoveryType: [] as string[], // Added this line
    clientOnly: false,
    musicianOnly: false,
  });

  // Featured user algorithm
  // More robust isFeaturedUser function
  const isFeaturedUser = (user: UserProps): boolean => {
    try {
      const views = user.profileViews?.totalCount || 0;
      const followers = Math.max(user.followers?.length || 1, 1); // Ensure at least 1 to avoid division by zero
      const engagementRate = views / followers;

      // Check if user is active (last active within last 7 days)
      let isActive = false;
      if (user.lastActive && typeof user.lastActive === "number") {
        isActive = Date.now() - user.lastActive < 7 * 24 * 60 * 60 * 1000;
      }

      // Featured criteria:
      // - At least 10 profile views
      // - Good engagement rate (views per follower)
      // - Active recently (within last 7 days)
      const isFeatured = views >= 10 && engagementRate > 0.3 && isActive;

      return isFeatured;
    } catch (error) {
      console.error(
        "Error calculating featured status for user:",
        user._id,
        error
      );
      return false;
    }
  };

  // Get trending instruments based on profile views
  const getTrendingInstruments = (users: UserProps[]): string[] => {
    const instrumentViews: Record<string, number> = {};

    users.forEach((user) => {
      if (user.instrument) {
        const views = user.profileViews?.totalCount || 0;
        instrumentViews[user.instrument] =
          (instrumentViews[user.instrument] || 0) + views;
      }
    });

    // Return top 3 trending instruments
    return Object.entries(instrumentViews)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([instrument]) => instrument);
  };

  // Fixed: Added discoveryType to activeFilters
  const applyAdditionalFilters = (users: UserProps[]) => {
    return users.filter((user) => {
      // Client/Musician filter
      if (activeFilters.clientOnly && !user.isClient) return false;
      if (activeFilters.musicianOnly && !user.isMusician) return false;

      // Role type filter
      if (
        activeFilters.roleType.length > 0 &&
        (!user.roleType || !activeFilters.roleType.includes(user.roleType))
      ) {
        return false;
      }

      // Instrument filter
      if (
        activeFilters.instrument.length > 0 &&
        (!user.instrument ||
          !activeFilters.instrument.includes(user.instrument))
      ) {
        return false;
      }

      // Discovery features - OR logic (any match)
      if (activeFilters.discoveryType.length > 0) {
        const matchesDiscovery = activeFilters.discoveryType.some(
          (discoveryType) => {
            switch (discoveryType) {
              case "new-talents":
                // Users joined in the last 30 days
                return (
                  user._creationTime &&
                  Date.now() - user._creationTime < 30 * 24 * 60 * 60 * 1000
                );

              case "featured-this-week":
                // Featured based on profile views and engagement
                return isFeaturedUser(user);

              case "near-you":
                return user.city === myuser?.city;

              case "similar-style":
                return user.musiciangenres?.some((genre) =>
                  myuser?.musiciangenres?.includes(genre)
                );

              case "trending-instruments":
                const trendingInstruments = getTrendingInstruments(users);
                return trendingInstruments.includes(user.instrument || "");

              default:
                return false;
            }
          }
        );

        if (!matchesDiscovery) return false;
      }

      return true;
    });
  };

  // Add modal state
  const [showClientEducation, setShowClientEducation] = useState(false);
  const [hasSeenModal, setHasSeenModal] = useState(false);

  const { colors, isDarkMode } = useThemeColors();

  // Show modal for clients on first visit
  useEffect(() => {
    if (myuser?.isClient && !myuser?.isMusician && !hasSeenModal) {
      const hasSeenBefore = localStorage.getItem("clientEducationSeen");
      if (!hasSeenBefore) {
        const timer = setTimeout(() => {
          setShowClientEducation(true);
        }, 1000); // Show after 1 second
        return () => clearTimeout(timer);
      }
    }
  }, [myuser, hasSeenModal]);

  // Auto-scroll to top when search changes
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [searchQuery]);

  // Process users with reliability data
  const processedUsers =
    users
      ?.filter((user: UserProps) => {
        const isNotCurrentUser = user.clerkId !== userId;
        const isNotAdmin = !user.isAdmin;

        return isNotCurrentUser && isNotAdmin;
      })
      .map((user: UserProps) => ({
        ...user,
        reliabilityScore: calculateReliability(
          user.completedGigsCount || 0,
          user.cancelgigCount || 0
        ),
      })) || [];

  // Filter users based on search
  const filteredUsers = searchQuery
    ? searchFunc(processedUsers, searchQuery)
    : processedUsers;

  // Apply additional filters - FIXED VERSION

  const finalFilteredUsers = applyAdditionalFilters(filteredUsers);

  // Fixed: Added discoveryType to handleFilterChange type
  const handleFilterChange = (filters: {
    roleType: string[];
    instrument: string[];
    discoveryType: string[]; // Added this line
    musicianOnly: boolean;
    clientOnly: boolean;
  }) => {
    setActiveFilters(filters);
  };

  // Modal handlers
  const handleCloseModal = () => {
    setShowClientEducation(false);
  };

  const handleDontShowAgain = () => {
    localStorage.setItem("clientEducationSeen", "true");
    setHasSeenModal(true);
    setShowClientEducation(false);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={cn("w-full h-[calc(100vh-80px)]", colors.gradientSecondary)}
      >
        <div
          ref={containerRef}
          className={cn(
            "overflow-y-auto h-full w-full py-6 px-4 sm:px-8 pb-24",
            "scrollbar-thin",
            isDarkMode
              ? "scrollbar-thumb-gray-700 scrollbar-track-transparent"
              : "scrollbar-thumb-gray-300 scrollbar-track-gray-100"
          )}
        >
          {/* Search and Filter Controls */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4"
          >
            <div className="flex items-center gap-2">
              <FiUsers className={cn("text-xl", colors.textMuted)} />
              <h2 className={cn("text-xl font-semibold", colors.text)}>
                {finalFilteredUsers.length}{" "}
                {finalFilteredUsers.length === 1 ? "Musician" : "Musicians"}
              </h2>
              {Object.values(activeFilters).flat().length > 0 && (
                <span className={cn("text-sm ml-2", colors.textMuted)}>
                  {`(${
                    Object.values(activeFilters).flat().length
                  } filter(s) active`}
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 w-full sm:w-auto">
              {searchQuery && (
                <div
                  className={cn("flex items-center gap-2", colors.textMuted)}
                >
                  <FiSearch />
                  <span className="text-sm">{`"${searchQuery}"`}</span>
                </div>
              )}

              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="fixed top-[115px] right-3 z-50 w-72"
              >
                <SearchFilters onFilterChange={handleFilterChange} />
              </motion.div>
            </div>
          </motion.div>

          {/* User Grid */}
          <AnimatePresence>
            {isLoading || (finalFilteredUsers.length < 0 && !users) ? (
              // Show skeletons while loading
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <SearchUserSkeletonGrid count={2} isDarkMode={isDarkMode} />
                  </motion.div>
                ))}
              </div>
            ) : finalFilteredUsers.length > 0 ? (
              // Show users when we have results
              <div
                className={cn(
                  "grid gap-4 sm:gap-6 pt-4 sm:pt-[50px]",
                  "grid-cols-1",
                  "sm:grid-cols-2",
                  "lg:grid-cols-3",
                  "xl:grid-cols-4",
                  "2xl:grid-cols-5"
                )}
              >
                {" "}
                {finalFilteredUsers.map((user: UserProps, index: number) => (
                  <motion.div
                    key={user._id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 25,
                      delay: index * 0.03,
                    }}
                  >
                    <MainUser {...user} isFeatured={isFeaturedUser(user)} />
                  </motion.div>
                ))}
              </div>
            ) : (
              // Show empty state when no results
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className={cn(
                  "flex flex-col items-center justify-center h-[50vh]",
                  colors.textMuted
                )}
              >
                <div className="relative mb-6">
                  <FiUsers
                    className={cn("text-6xl opacity-20", colors.textMuted)}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div
                      className={cn(
                        "w-16 h-16 rounded-full border-2 border-dashed animate-spin-slow",
                        colors.border
                      )}
                    ></div>
                  </div>
                </div>
                <h3
                  className={cn(
                    "text-2xl font-medium mb-2 text-center",
                    colors.text
                  )}
                >
                  {Object.values(activeFilters).flat().length > 0
                    ? "No musicians meet your criteria"
                    : "No musicians found"}
                </h3>
                <p
                  className={cn(
                    "text-sm text-center max-w-md",
                    colors.textMuted
                  )}
                >
                  {Object.values(activeFilters).flat().length > 0
                    ? "Try adjusting your filters."
                    : "Check back later or try a different search."}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
          {/* Loading state */}
          {!users && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    "rounded-2xl p-5 h-64 animate-pulse",
                    isDarkMode ? "bg-gray-800/50" : "bg-gray-200/50"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-full",
                        isDarkMode ? "bg-gray-700" : "bg-gray-300"
                      )}
                    ></div>
                    <div className="flex-1 space-y-2">
                      <div
                        className={cn(
                          "h-4 rounded w-3/4",
                          isDarkMode ? "bg-gray-700" : "bg-gray-300"
                        )}
                      ></div>
                      <div
                        className={cn(
                          "h-3 rounded w-1/2",
                          isDarkMode ? "bg-gray-700" : "bg-gray-300"
                        )}
                      ></div>
                    </div>
                  </div>
                  <div
                    className={cn(
                      "mt-4 h-8 rounded-lg",
                      isDarkMode ? "bg-gray-700" : "bg-gray-300"
                    )}
                  ></div>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <div
                      className={cn(
                        "h-16 rounded-lg",
                        isDarkMode ? "bg-gray-700" : "bg-gray-300"
                      )}
                    ></div>
                    <div
                      className={cn(
                        "h-16 rounded-lg",
                        isDarkMode ? "bg-gray-700" : "bg-gray-300"
                      )}
                    ></div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Client Education Modal */}
      <ClientEducationModal
        isOpen={showClientEducation}
        onClose={handleCloseModal}
        onDontShowAgain={handleDontShowAgain}
      />
    </>
  );
};

export default SearchComponent;
