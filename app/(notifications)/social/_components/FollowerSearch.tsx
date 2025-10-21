// components/followers/FollowersSearch.tsx
import { motion, AnimatePresence } from "framer-motion";
import { Search, Music, Building, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FollowersSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterType: "all" | "musicians" | "clients";
  setFilterType: (type: "all" | "musicians" | "clients") => void;
  showMobileFilters: boolean;
  setShowMobileFilters: (show: boolean) => void;
  colors: any;
}

export default function FollowersSearch({
  searchQuery,
  setSearchQuery,
  filterType,
  setFilterType,
  showMobileFilters,
  setShowMobileFilters,
  colors,
}: FollowersSearchProps) {
  const filterOptions = [
    { key: "all" as const, label: "All" },
    { key: "musicians" as const, label: "Musicians", icon: Music },
    { key: "clients" as const, label: "Clients", icon: Building },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className={cn(
        "rounded-xl md:rounded-2xl p-4 md:p-6 mb-6 md:mb-8 border-2 backdrop-blur-sm",
        colors.card,
        colors.border,
        "bg-opacity-50"
      )}
    >
      <div className="flex flex-col gap-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
          <Input
            type="text"
            placeholder="Search followers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              "pl-10 pr-8 md:pl-12 md:pr-10 py-2 md:py-3 w-full rounded-lg md:rounded-xl text-base md:text-lg border-2",
              colors.background,
              colors.border,
              colors.text,
              "focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            )}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 md:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          )}
        </div>

        {/* Mobile Filter Toggle */}
        <div className="md:hidden">
          <Button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            variant="outline"
            className={cn(
              "w-full justify-between rounded-lg",
              colors.textMuted
            )}
          >
            <span>
              Filter:{" "}
              {filterType === "all"
                ? "All"
                : filterType === "musicians"
                  ? "Musicians"
                  : "Clients"}
            </span>
            <ChevronDown
              className={cn(
                "w-4 h-4 transition-transform",
                showMobileFilters && "rotate-180"
              )}
            />
          </Button>

          <AnimatePresence>
            {showMobileFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 overflow-hidden"
              >
                <div className="flex gap-2 p-1 rounded-lg bg-gray-100 dark:bg-gray-300">
                  {filterOptions.map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      onClick={() => {
                        setFilterType(key);
                        setShowMobileFilters(false);
                      }}
                      className={cn(
                        "flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-1",
                        filterType === key
                          ? key === "all"
                            ? cn("text-white shadow-sm", colors.primaryBg)
                            : key === "musicians"
                              ? "bg-purple-500 text-white shadow-sm"
                              : "bg-green-500 text-white shadow-sm"
                          : cn(colors.textMuted, colors.hoverBg)
                      )}
                    >
                      {Icon && <Icon className="w-3 h-3" />}
                      <span className="hidden xs:inline">{label}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Desktop Filter Tabs */}
        <div className="hidden md:flex gap-2 p-1 rounded-xl bg-gray-100 dark:bg-gray-200 w-fit">
          {filterOptions.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setFilterType(key)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                filterType === key
                  ? key === "all"
                    ? cn("text-white shadow-sm", colors.primaryBg)
                    : key === "musicians"
                      ? "bg-purple-500 text-white shadow-sm"
                      : "bg-green-500 text-white shadow-sm"
                  : cn(colors.textMuted, colors.hoverBg)
              )}
            >
              {Icon && <Icon className="w-4 h-4" />}
              {label}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
