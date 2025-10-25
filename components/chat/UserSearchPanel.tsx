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
import { useUserCurrentChat } from "@/hooks/useCurrentUserChat";
import { UserListItem } from "./UserListItem";
import { toast } from "sonner";
import { useChatToasts } from "@/hooks/useToasts";
import { useAllUsersWithPresence } from "@/hooks/useAllUsers";

interface UserSearchPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onUserSelect: (userId: string, userName: string) => void;
  variant?: "modal" | "drawer";
}

export default function UserSearchPanel({
  isOpen,
  onClose,
  onUserSelect,
  variant = "modal",
}: UserSearchPanelProps) {
  const { colors } = useThemeColors();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    "all" | "musicians" | "clients"
  >("all");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const { smartCreateOrOpenChat, isLoading: isCreatingChat } =
    useUserCurrentChat();

  const allUsers = useAllUsersWithPresence();

  // Transition states for modal variant
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Handle open/close transitions for modal variant
  useEffect(() => {
    if (variant === "modal") {
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
    }
  }, [isOpen, variant]);

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
  const { showChatCreationPromise } = useChatToasts();
  const handleStartChat = async (userId: string) => {
    try {
      console.log("Starting chat with user:", userId);

      // Get user info for the toast message
      const user = allUsers?.find((u) => u._id === userId);
      const userName = user ? `${user.firstname} ${user.lastname}` : "User";

      // Use promise-based toast
      const result = await showChatCreationPromise(
        smartCreateOrOpenChat(userId),
        userName
      );

      if (result) {
        onUserSelect(userId, userName); // Pass the chat ID, not user ID
      }
      // No need for manual success toast - it's handled by showChatCreationPromise
    } catch (error) {
      console.error("Failed to create chat:", error);
      // Error is automatically handled by the promise toast
    }
  };

  const handleClose = () => {
    if (variant === "modal") {
      setIsClosing(true);
      setTimeout(() => {
        onClose();
      }, 250);
    } else {
      onClose();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && variant === "modal") {
      handleClose();
    }
  };

  // Close on escape key for modal variant
  useEffect(() => {
    if (variant === "modal") {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape" && isOpen) {
          handleClose();
        }
      };
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, variant]);

  // For drawer variant, just check isOpen
  if (variant === "drawer" && !isOpen) return null;

  // For modal variant, check visibility states
  if (variant === "modal" && !isVisible && !isClosing) return null;

  // Container classes based on variant
  const containerClasses = cn(
    variant === "modal"
      ? "fixed inset-0 z-[60] flex items-center justify-center p-4"
      : "w-full h-full"
  );

  const panelClasses = cn(
    "relative rounded-3xl shadow-2xl border flex flex-col backdrop-blur-sm bg-white/95",
    colors.card,
    colors.cardBorder,
    variant === "modal"
      ? cn(
          "w-full max-w-2xl h-[80vh] transform transition-all duration-300",
          isClosing
            ? "opacity-0 scale-95 translate-y-4"
            : "opacity-100 scale-100 translate-y-0"
        )
      : "w-full h-full"
  );

  return (
    <div className={containerClasses}>
      {/* Backdrop for modal variant only */}
      {variant === "modal" && (
        <div
          className={cn(
            "absolute inset-0 bg-black/50 backdrop-blur-md transition-all duration-300",
            isClosing ? "opacity-0" : "opacity-100"
          )}
          onClick={handleBackdropClick}
        />
      )}

      {/* Search Panel */}
      <div className={panelClasses}>
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
            className={cn(
              "rounded-2xl transition-colors duration-200",
              variant === "modal"
                ? "hover:bg-red-500/10 hover:text-red-600"
                : colors.hoverBg
            )}
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
              {[...Array(6)].map((_, i) => (
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
                <UserListItem
                  key={user._id}
                  user={user}
                  onStartChat={handleStartChat}
                  isCreatingChat={isCreatingChat}
                />
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
