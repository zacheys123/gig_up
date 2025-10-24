"use client";
import { useEffect, useState } from "react";
import {
  X,
  Search,
  Users,
  Music,
  Briefcase,
  MapPin,
  Crown,
  UserPlus,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useThemeColors } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useUserCurrentChat } from "@/hooks/useCurrentUserChat";

interface MobileUserSearchPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onUserSelect: (userId: string) => void;
}

export default function MobileUserSearchPanel({
  isOpen,
  onClose,
  onUserSelect,
}: MobileUserSearchPanelProps) {
  const { colors } = useThemeColors();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    "all" | "musicians" | "clients"
  >("all");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const { smartCreateOrOpenChat, isLoading: isCreatingChat } =
    useUserCurrentChat();

  const { user: currentUser } = useCurrentUser();

  // Fetch all users for search
  const users = useQuery(api.controllers.user.getAllUsers);

  // Filter out current user and apply search/category filters
  const allUsers = users?.filter((user) => user?._id !== currentUser?._id);

  // Transition states
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Handle open/close transitions
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setIsClosing(false);
    } else {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setIsClosing(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Filter users based on search and category
  const filteredUsers = allUsers?.filter((user) => {
    const matchesSearch =
      user.firstname?.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
      user.lastname?.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
      user.username?.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
      user.instrument?.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
      user.city?.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
      user.roleType?.toLowerCase().includes(debouncedQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" ||
      (selectedCategory === "musicians" && user.isMusician) ||
      (selectedCategory === "clients" && user.isClient);

    return matchesSearch && matchesCategory;
  });

  const handleStartChat = async (userId: string) => {
    try {
      console.log("Starting chat with user:", userId);
      const result = await smartCreateOrOpenChat(userId);
      console.log("Chat creation result:", result);

      if (result) {
        toast.success("Chat started successfully!");
        onUserSelect(userId);
      } else {
        toast.error("Failed to create chat. Please try again.");
      }
    } catch (error) {
      console.error("Failed to create chat:", error);
      toast.error("Failed to start chat. Please try again.");
    }
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 250);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  if (!isVisible && !isClosing) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      {/* Backdrop with transition */}
      <div
        className={cn(
          "absolute inset-0 bg-black/50 backdrop-blur-md transition-all duration-300",
          isClosing ? "opacity-0" : "opacity-100"
        )}
        onClick={handleBackdropClick}
      />

      {/* Search Panel with transition */}
      <div
        className={cn(
          "relative w-full max-w-md h-[85vh] rounded-3xl shadow-2xl border flex flex-col transform transition-all duration-300",
          colors.card,
          colors.cardBorder,
          "backdrop-blur-sm bg-white/95",
          isClosing
            ? "opacity-0 scale-95 translate-y-4"
            : "opacity-100 scale-100 translate-y-0"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "p-2 rounded-2xl",
                colors.warningBg,
                colors.warningBorder
              )}
            >
              <Users className={cn("w-5 h-5", colors.warningText)} />
            </div>
            <div>
              <h3 className={cn("text-xl font-bold", colors.text)}>
                Find People
              </h3>
              <p className={cn("text-sm", colors.textMuted)}>
                Connect with musicians and clients
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="rounded-2xl hover:bg-red-500/10 hover:text-red-600 transition-colors duration-200"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Search Bar */}
        <div className="p-6 pb-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 transition-colors duration-200" />
            <Input
              placeholder="Search by name, username, location, or specialty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                "pl-11 pr-4 py-3 rounded-2xl border-0 transition-all duration-200",
                colors.backgroundMuted,
                "focus:ring-2 focus:ring-orange-500/20 focus:scale-[1.02]"
              )}
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="px-6 pb-4">
          <div className="flex gap-2">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("all")}
              className={cn(
                "rounded-full text-xs transition-all duration-200",
                selectedCategory === "all"
                  ? colors.primaryBg + " scale-105"
                  : "hover:scale-105"
              )}
            >
              <UserPlus className="w-3 h-3 mr-1 transition-transform duration-200" />
              All Users
            </Button>
            <Button
              variant={selectedCategory === "musicians" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("musicians")}
              className={cn(
                "rounded-full text-xs transition-all duration-200",
                selectedCategory === "musicians"
                  ? colors.primaryBg + " scale-105"
                  : "hover:scale-105"
              )}
            >
              <Music className="w-3 h-3 mr-1 transition-transform duration-200" />
              Musicians
            </Button>
            <Button
              variant={selectedCategory === "clients" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("clients")}
              className={cn(
                "rounded-full text-xs transition-all duration-200",
                selectedCategory === "clients"
                  ? colors.primaryBg + " scale-105"
                  : "hover:scale-105"
              )}
            >
              <Briefcase className="w-3 h-3 mr-1 transition-transform duration-200" />
              Clients
            </Button>
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {!allUsers ? (
            // Loading skeletons with staggered animation
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-2xl border animate-pulse",
                    colors.border
                  )}
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <Skeleton
                    className={cn("w-12 h-12 rounded-2xl", colors.skeleton)}
                  />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Skeleton
                        className={cn("h-4 w-32 rounded", colors.skeleton)}
                      />
                      <Skeleton
                        className={cn("h-3 w-16 rounded", colors.skeleton)}
                      />
                    </div>
                    <Skeleton
                      className={cn("h-3 w-48 rounded", colors.skeleton)}
                    />
                    <div className="flex gap-2">
                      <Skeleton
                        className={cn("h-5 w-20 rounded-full", colors.skeleton)}
                      />
                      <Skeleton
                        className={cn("h-5 w-24 rounded-full", colors.skeleton)}
                      />
                    </div>
                  </div>
                  <Skeleton
                    className={cn("w-20 h-9 rounded-xl", colors.skeleton)}
                  />
                </div>
              ))}
            </div>
          ) : filteredUsers?.length === 0 ? (
            // Empty state with fade-in
            <div className="flex flex-col items-center justify-center h-full text-center py-12 animate-in fade-in duration-500">
              <div
                className={cn(
                  "w-20 h-20 rounded-3xl flex items-center justify-center mb-4",
                  colors.warningBg,
                  colors.warningBorder
                )}
              >
                <Search className={cn("w-8 h-8", colors.warningText)} />
              </div>
              <h4 className={cn("font-bold text-lg mb-2", colors.text)}>
                No users found
              </h4>
              <p className={cn("text-sm max-w-xs", colors.textMuted)}>
                {debouncedQuery
                  ? "Try adjusting your search terms or browse different categories"
                  : "Start typing to search for users"}
              </p>
            </div>
          ) : (
            // User results with staggered animation
            <div className="space-y-3">
              {filteredUsers?.map((user, index) => (
                <div
                  key={user._id}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 animate-in slide-in-from-bottom-4",
                    colors.border,
                    "hover:shadow-lg hover:border-orange-200 hover:scale-[1.02]"
                  )}
                  style={{
                    animationDelay: `${Math.min(index * 50, 300)}ms`,
                    animationDuration: "400ms",
                  }}
                >
                  <div className="flex items-center gap-4">
                    {/* Avatar with tier badge */}
                    <div className="relative">
                      <Avatar className="w-14 h-14 rounded-2xl border-2 border-orange-200 transition-all duration-300 group-hover:scale-110">
                        <AvatarImage src={user.picture} />
                        <AvatarFallback
                          className={cn(
                            "text-base font-semibold rounded-2xl",
                            "bg-gradient-to-br from-orange-500/10 to-red-500/10"
                          )}
                        >
                          {user.firstname?.[0]}
                          {user.lastname?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      {user.tier !== "free" && (
                        <div className="absolute -top-1 -right-1 transition-transform duration-300 group-hover:scale-110">
                          <div
                            className={cn(
                              "w-6 h-6 rounded-full border-2 border-white flex items-center justify-center",
                              user.tier === "pro" && "bg-orange-500",
                              user.tier === "premium" && "bg-purple-500",
                              user.tier === "elite" && "bg-yellow-500"
                            )}
                          >
                            <Crown className="w-3 h-3 text-white" />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* User info */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h4
                          className={cn("font-semibold text-lg", colors.text)}
                        >
                          {user.firstname} {user.lastname}
                        </h4>
                        {user.verified && (
                          <CheckCircle2 className="w-4 h-4 text-blue-500 fill-blue-500" />
                        )}
                      </div>
                      <p className={cn("text-sm", colors.textMuted)}>
                        @{user.username}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {/* Role badge */}
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs transition-all duration-200 hover:scale-105",
                            user.isMusician
                              ? "border-purple-200 text-purple-700"
                              : "border-blue-200 text-blue-700"
                          )}
                        >
                          {user.isMusician ? (
                            <>
                              <Music className="w-3 h-3 mr-1" />
                              Musician
                            </>
                          ) : (
                            <>
                              <Briefcase className="w-3 h-3 mr-1" />
                              Client
                            </>
                          )}
                        </Badge>

                        {/* Tier badge */}
                        {user.tier !== "free" && (
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs transition-all duration-200 hover:scale-105",
                              user.tier === "pro" &&
                                "border-orange-200 text-orange-700",
                              user.tier === "premium" &&
                                "border-purple-200 text-purple-700",
                              user.tier === "elite" &&
                                "border-yellow-200 text-yellow-700"
                            )}
                          >
                            <Crown className="w-3 h-3 mr-1" />
                            {user.tier.charAt(0).toUpperCase() +
                              user.tier.slice(1)}
                          </Badge>
                        )}

                        {/* Location */}
                        {user.city && (
                          <Badge
                            variant="outline"
                            className="text-xs border-gray-200 text-gray-700 transition-all duration-200 hover:scale-105"
                          >
                            <MapPin className="w-3 h-3 mr-1" />
                            {user.city}
                          </Badge>
                        )}
                      </div>
                      {/* Specialization */}
                      {user.instrument && (
                        <p className={cn("text-sm", colors.textMuted)}>
                          {user.instrument}
                        </p>
                      )}
                      {/* Role Type */}
                      {user.roleType && (
                        <Badge
                          variant="outline"
                          className="text-xs border-gray-200 text-gray-700 transition-all duration-200 hover:scale-105"
                        >
                          <MapPin className="w-3 h-3 mr-1" />
                          {user.roleType}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Action button */}
                  <Button
                    onClick={() => handleStartChat(user._id)}
                    disabled={isCreatingChat}
                    className={cn(
                      "rounded-xl transition-all duration-300",
                      colors.primaryBg,
                      colors.primaryBgHover,
                      "text-white",
                      "hover:scale-105 active:scale-95",
                      "disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                    )}
                  >
                    {isCreatingChat ? "Starting..." : "Message"}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className={cn("p-4 border-t", colors.border)}>
          <div className="flex justify-between text-sm">
            <span className={colors.textMuted}>
              Showing {filteredUsers?.length || 0} of {allUsers?.length || 0}{" "}
              users
            </span>
            <div className="flex gap-4">
              <span className={cn("flex items-center gap-1", colors.textMuted)}>
                <Music className="w-3 h-3" />
                {allUsers?.filter((u) => u.isMusician).length} musicians
              </span>
              <span className={cn("flex items-center gap-1", colors.textMuted)}>
                <Briefcase className="w-3 h-3" />
                {allUsers?.filter((u) => u.isClient).length} clients
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
