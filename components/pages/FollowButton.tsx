import { IoMdAdd } from "react-icons/io";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useSocialActions } from "@/hooks/useCurrentUser";

const FollowButton = ({
  _id,
  followers,
}: {
  _id: string;
  followers?: string[];
}) => {
  const { user: currentUser } = useCurrentUser();
  const { toggleFollow } = useSocialActions();

  // Check if current user is following this user
  const isFollowing = currentUser?.followings?.includes(_id) || false;

  const handleToggleFollow = async () => {
    try {
      await toggleFollow(_id);
      // Convex will automatically update the data and re-render the component
    } catch (error) {
      console.error("Error toggling follow:", error);
    }
  };

  // Don't show follow button if user is viewing their own profile
  if (currentUser?._id === _id) {
    return null;
  }

  return (
    <div>
      {isFollowing ? (
        <button
          onClick={handleToggleFollow}
          className="flex items-center gap-1 text-gray-200 hover:text-red-800 text-[12px] p-1 bg-red-800 px-2 -py-6 rounded-md min-w-[50px]"
        >
          following
        </button>
      ) : (
        <button
          onClick={handleToggleFollow}
          className="flex items-center gap-1 text-green-700 hover:text-red-800 text-[12px] p-1 bg-neutral-200 px-2 -py-6 rounded-md min-w-[50px]"
        >
          Follow <IoMdAdd style={{ fontSize: "16px" }} />
        </button>
      )}
    </div>
  );
};

export default FollowButton;
