import { IoMdAdd } from "react-icons/io";
import { useCurrentUser, useIsFollowing } from "@/hooks/useCurrentUser";
import { useSocialActions } from "@/hooks/useCurrentUser";
import { useThemeColors } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const FollowButton = ({ _id }: { _id: string }) => {
  const { user: currentUser } = useCurrentUser();
  const { toggleFollow } = useSocialActions();
  const { isDarkMode } = useThemeColors();

  const isFollowing = currentUser?.followings?.includes(_id) || false;
  const handleToggleFollow = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await toggleFollow(currentUser?.clerkId as string, _id);
    } catch (error) {
      console.error("Error toggling follow:", error);
    }
  };

  // Don't show follow button if user is viewing their own profile
  if (currentUser?._id === _id) {
    return null;
  }

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      {isFollowing ? (
        <button
          onClick={handleToggleFollow}
          className={cn(
            "flex items-center justify-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl",
            "border transition-all duration-200",
            "bg-transparent hover:bg-red-500/10",
            "text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300",
            "border-red-500/30 hover:border-red-500/50",
            "backdrop-blur-sm"
          )}
        >
          <span>Following</span>
        </button>
      ) : (
        <button
          onClick={handleToggleFollow}
          className={cn(
            "flex items-center justify-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl",
            "transition-all duration-200 shadow-sm",
            "bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600",
            "text-white hover:shadow-lg",
            isDarkMode
              ? "hover:shadow-blue-500/25"
              : "hover:shadow-blue-500/40",
            "backdrop-blur-sm"
          )}
        >
          <span>Follow</span>
          <IoMdAdd className="text-base" />
        </button>
      )}
    </motion.div>
  );
};

export default FollowButton;
