// components/followers/FollowerCard.tsx
import { motion } from "framer-motion";
import {
  MapPin,
  Music,
  Crown,
  MoreHorizontal,
  UserX,
  Eye,
  Share2,
  Sparkles,
  UserCheck,
  MessageCircle,
  Video,
  Mic2,
  Star,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import FollowButton from "@/components/pages/FollowButton";
import { ChatIcon } from "@/components/chat/ChatIcon";
import { cn } from "@/lib/utils";
import { useMutation } from "convex/react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useChat } from "@/app/context/ChatContext";
import { useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { OnlineBadge } from "@/components/chat/OnlineBadge";

interface Follower {
  _id: any;
  clerkId: string;
  firstname?: string;
  lastname?: string;
  username: string;
  picture?: string;
  city?: string;
  instrument?: string;
  isMusician: boolean;
  isClient: boolean;
  isBooker: boolean;
  tier: string;
  talentbio?: string;
  followers: number;
  followings: number;
  mutualFollowers?: number;
  lastActive?: number;
  isPrivate?: boolean;
  verified?: boolean;
  rating?: number;
  gigsCompleted?: number;
}

interface FollowerCardProps {
  follower: Follower;
  colors: any;
  highlightedFollower: string | null;
  handleAction: (action: string, follower: Follower) => void;
  breakpoint: "mobile" | "tablet" | "desktop";
}

// Instagram/TikTok Inspired Card Design
const ModernFollowerCard = ({
  follower,
  colors,
  highlightedFollower,
  handleAction,
  breakpoint,
}: FollowerCardProps) => {
  const { openChat } = useChat();
  const { user: currentUser } = useCurrentUser();
  const router = useRouter();
  const getOrCreateChat = useMutation(
    api.controllers.chat.getOrCreateDirectChat
  );

  // const handleStartChat = async (userId: string) => {
  //   console.log("=== CHAT DEBUG ===");
  //   console.log("Current user:", currentUser);
  //   console.log("Target user ID:", userId);

  //   if (!currentUser?._id) {
  //     console.log("❌ No current user - cannot start chat");
  //     return;
  //   }

  //   try {
  //     const typedUserId = userId as Id<"users">;
  //     console.log(
  //       "Creating chat between:",
  //       currentUser._id,
  //       "and",
  //       typedUserId
  //     );

  //     const chatId = await getOrCreateChat({
  //       user1Id: currentUser._id,
  //       user2Id: typedUserId,
  //     });

  //     console.log("✅ Chat created with ID:", chatId);

  //     router.push(`/chat/${chatId}`, { scroll: false });
  //     openChat(chatId);

  //     console.log("✅ Chat opened and URL updated");
  //   } catch (error) {
  //     console.error("❌ Failed to start chat:", error);
  //   }
  // };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 25,
      }}
      className={cn(
        "group relative rounded-2xl transition-all duration-500 overflow-hidden",
        "backdrop-blur-sm border",
        colors.card,
        colors.border,
        "shadow-lg hover:shadow-2xl",
        highlightedFollower === follower._id &&
          cn(
            "ring-2 ring-opacity-50",
            colors.accent === "amber"
              ? "ring-amber-400"
              : colors.accent === "blue"
                ? "ring-blue-400"
                : "ring-amber-400"
          )
      )}
    >
      {/* Premium Gradient Border Effect */}
      <div
        className={cn(
          "absolute inset-0 rounded-2xl bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-500",
          follower.tier === "pro"
            ? cn(
                "from-amber-400/20 via-purple-400/20 to-pink-400/20",
                colors.accent === "blue" &&
                  "from-blue-400/20 via-purple-400/20 to-indigo-400/20",
                colors.accent === "green" &&
                  "from-emerald-400/20 via-teal-400/20 to-cyan-400/20"
              )
            : cn(
                "from-blue-400/10 via-green-400/10 to-cyan-400/10",
                colors.accent === "amber" &&
                  "from-amber-400/10 via-orange-400/10 to-red-400/10",
                colors.accent === "green" &&
                  "from-emerald-400/10 via-teal-400/10 to-cyan-400/10"
              )
        )}
      />

      {/* Main Content */}
      <div className="relative z-10 p-5">
        {/* Header Section */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Avatar with Online Status */}
            <Link href={`/profile/${follower.username}`}>
              <div className="relative">
                <div
                  className={cn(
                    "relative rounded-xl border-2 transition-all duration-300 group-hover:scale-110",
                    "p-0.5",
                    highlightedFollower === follower._id
                      ? cn(
                          "border-amber-400",
                          colors.accent === "blue" && "border-blue-400",
                          colors.accent === "green" && "border-emerald-400"
                        )
                      : cn("border-transparent", colors.gradientPrimary)
                  )}
                >
                  <div className={cn("rounded-xl p-0.5", colors.card)}>
                    <Avatar className="w-12 h-12 rounded-xl">
                      <AvatarImage
                        src={follower.picture}
                        className="rounded-xl"
                      />
                      <AvatarFallback
                        className={cn(
                          "rounded-xl text-sm font-bold",
                          colors.secondaryBackground,
                          colors.text
                        )}
                      >
                        {follower.firstname?.[0]}
                        {follower.lastname?.[0]}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>

                {/* Online Status */}
                <OnlineBadge userId={follower._id} />

                {/* Pro Badge */}
                {follower.tier === "pro" && (
                  <div
                    className={cn(
                      "absolute -top-1 -right-1 rounded-full p-1 shadow-lg",
                      colors.gradientPrimary
                    )}
                  >
                    <Crown className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
            </Link>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Link href={`/profile/${follower.username}`}>
                  <h3
                    className={cn(
                      "font-bold text-base hover:text-amber-600 dark:hover:text-amber-400 transition-colors truncate",
                      colors.text
                    )}
                  >
                    {follower.firstname} {follower.lastname}
                  </h3>
                </Link>
                {follower.verified && (
                  <CheckCircle className="w-4 h-4 text-blue-500 fill-current" />
                )}
              </div>
              <p className={cn("text-sm truncate mb-2", colors.textMuted)}>
                @{follower.username}
              </p>

              {/* Stats Row */}
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <span className={cn("font-semibold", colors.text)}>
                    {follower.followers.toLocaleString()}
                  </span>
                  <span className={colors.textMuted}>followers</span>
                </div>
                {follower.mutualFollowers && follower.mutualFollowers > 0 && (
                  <div className="flex items-center gap-1">
                    <span className={cn("font-semibold", colors.primary)}>
                      {follower.mutualFollowers} mutual
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "rounded-lg transition-all duration-300",
                  colors.hoverBg,
                  "hover:bg-opacity-80",
                  colors.border,
                  "border"
                )}
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className={cn(
                "rounded-xl backdrop-blur-sm border",
                colors.card,
                colors.border
              )}
            >
              <DropdownMenuItem
                onClick={() => handleAction("view-profile", follower)}
                className={cn("rounded-lg gap-2", colors.hoverBg)}
              >
                <Eye className="w-4 h-4" />
                View Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                className={cn("rounded-lg p-0", colors.hoverBg)}
              >
                <ChatIcon
                  userId={follower._id}
                  variant="ghost"
                  className="w-full justify-start hover:bg-transparent px-3 py-2"
                >
                  Message
                </ChatIcon>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleAction("share", follower)}
                className={cn("rounded-lg gap-2", colors.hoverBg)}
              >
                <Share2 className="w-4 h-4" />
                Share
              </DropdownMenuItem>
              <DropdownMenuSeparator className={colors.border} />
              <DropdownMenuItem
                onClick={() => handleAction("remove", follower)}
                className={cn(
                  "rounded-lg gap-2",
                  colors.destructive,
                  colors.destructiveHover
                )}
              >
                <UserX className="w-4 h-4" />
                Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Bio Section */}
        {follower.talentbio && (
          <p
            className={cn(
              "text-sm leading-relaxed mb-4 line-clamp-2",
              colors.textMuted
            )}
          >
            {follower.talentbio}
          </p>
        )}

        {/* Tags & Specialties */}
        <div className="flex flex-wrap gap-2 mb-4">
          {/* Role Badge */}
          <Badge
            variant={follower.isMusician ? "default" : "secondary"}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium border-0",
              follower.isMusician
                ? cn(
                    "bg-purple-500/10 text-purple-700 dark:text-purple-300",
                    colors.accent === "blue" &&
                      "bg-blue-500/10 text-blue-700 dark:text-blue-300",
                    colors.accent === "green" &&
                      "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                  )
                : cn(
                    "bg-green-500/10 text-green-700 dark:text-green-300",
                    colors.accent === "amber" &&
                      "bg-amber-500/10 text-amber-700 dark:text-amber-300",
                    colors.accent === "blue" &&
                      "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300"
                  )
            )}
          >
            {follower.isMusician ? (
              <>
                <Mic2 className="w-3 h-3 mr-1" /> Musician
              </>
            ) : (
              <>
                <Video className="w-3 h-3 mr-1" /> Client
              </>
            )}
          </Badge>

          {/* Location */}
          {follower.city && (
            <Badge
              variant="outline"
              className={cn(
                "rounded-full px-3 py-1 text-xs",
                colors.border,
                "bg-blue-500/5 text-blue-700 dark:text-blue-300"
              )}
            >
              <MapPin className="w-3 h-3 mr-1 text-blue-500" />
              {follower.city}
            </Badge>
          )}

          {/* Instrument */}
          {follower.instrument && (
            <Badge
              variant="outline"
              className={cn(
                "rounded-full px-3 py-1 text-xs",
                colors.border,
                "bg-purple-500/5 text-purple-700 dark:text-purple-300"
              )}
            >
              <Music className="w-3 h-3 mr-1 text-purple-500" />
              {follower.instrument}
            </Badge>
          )}

          {/* Rating */}
          {follower.rating && (
            <Badge
              variant="outline"
              className={cn(
                "rounded-full px-3 py-1 text-xs",
                colors.border,
                "bg-amber-500/5 text-amber-700 dark:text-amber-300"
              )}
            >
              <Star className="w-3 h-3 mr-1 text-amber-500 fill-amber-500" />
              {follower.rating}
            </Badge>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-4 border-t">
          <FollowButton
            _id={follower._id}
            variant="default"
            size="sm"
            className={cn(
              "flex-1 rounded-lg transition-all duration-300",
              colors.primaryBg,
              colors.primaryBgHover,
              "text-white font-semibold shadow-lg hover:shadow-xl",
              "border-0 hover:scale-105"
            )}
          />
        </div>
      </div>

      {/* Highlight Animation */}
      {highlightedFollower === follower._id && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className={cn(
            "absolute inset-0 rounded-2xl bg-gradient-to-r",
            colors.accent === "amber"
              ? "from-amber-400/10 to-orange-500/10"
              : colors.accent === "blue"
                ? "from-blue-400/10 to-cyan-500/10"
                : "from-emerald-400/10 to-teal-500/10"
          )}
        >
          <div className="absolute top-3 right-3">
            <Badge
              className={cn(
                "gap-1.5 text-white border-0 shadow-lg",
                colors.gradientPrimary
              )}
            >
              <Sparkles className="w-3 h-3" />
              New
            </Badge>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

// Responsive variants with proper styling
const MobileFollowerCard = (props: FollowerCardProps) => (
  <div className="p-2">
    <ModernFollowerCard {...props} breakpoint="mobile" />
  </div>
);

const TabletFollowerCard = (props: FollowerCardProps) => (
  <div className="p-2">
    <ModernFollowerCard {...props} breakpoint="tablet" />
  </div>
);

const DesktopFollowerCard = (props: FollowerCardProps) => (
  <div className="p-2">
    <ModernFollowerCard {...props} breakpoint="desktop" />
  </div>
);

// Main FollowerCard Component
export default function FollowerCard(props: FollowerCardProps) {
  switch (props.breakpoint) {
    case "mobile":
      return <MobileFollowerCard {...props} />;
    case "tablet":
      return <TabletFollowerCard {...props} />;
    case "desktop":
      return <DesktopFollowerCard {...props} />;
    default:
      return <DesktopFollowerCard {...props} />;
  }
}
