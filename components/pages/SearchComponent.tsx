"use client";
import { useAuth } from "@clerk/nextjs";
import { searchFunc } from "@/utils";
import MainUser from "./MainUser";
import { useAllUsers } from "@/hooks/useAllUsers";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { FiSearch, FiUsers } from "react-icons/fi";
import { calculateReliability } from "@/lib/reliability";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import SearchFilters from "./SearchFilters";
import { experiences } from "@/data";
import { useUserStore } from "@/app/stores";
import { UserProps } from "@/types/userTypes";
import { useThemeColors } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

const SearchComponent = () => {
  const { userId } = useAuth();
  const { searchQuery } = useUserStore();
  const { users } = useAllUsers();
  const { user: myuser } = useCurrentUser();
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeFilters, setActiveFilters] = useState({
    roleType: [] as string[],
    instrument: [] as string[],
    experience: [] as string[],
    clientOnly: false,
    musicianOnly: false,
  });

  const { colors, isDarkMode } = useThemeColors();

  // Get experience options for filtering (excluding "Choose Experience")
  const experienceOptions = experiences().filter((exp) => exp.id !== 0);

  // Auto-scroll to top when search changes
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [searchQuery]);

  const isMusician = myuser?.isMusician;

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

  // Apply additional filters
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

      // Experience filter
      if (activeFilters.experience.length > 0) {
        if (!user.experience) return false;

        const userExp = experienceOptions.find(
          (exp) => exp.val === user.experience
        );

        if (!userExp || !activeFilters.experience.includes(userExp.name)) {
          return false;
        }
      }

      return true;
    });
  };

  const finalFilteredUsers = applyAdditionalFilters(filteredUsers);

  const handleFilterChange = (filters: {
    roleType: string[];
    instrument: string[];
    experience: string[];
    musicianOnly: boolean;
    clientOnly: boolean;
  }) => {
    setActiveFilters(filters);
  };

  return (
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
              <div className={cn("flex items-center gap-2", colors.textMuted)}>
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
          {finalFilteredUsers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 pt-[50px]">
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
                  <MainUser {...user} />
                </motion.div>
              ))}
            </div>
          ) : (
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
                className={cn("text-sm text-center max-w-md", colors.textMuted)}
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
  );
};

export default SearchComponent;
