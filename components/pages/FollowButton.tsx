import { useState } from "react";
import { IoMdAdd } from "react-icons/io";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import useStore from "@/app/zustand/useStore";
import { FetchResponse, UserProps } from "@/types/userinterfaces";

// The FollowButton component that supports optimistic UI updates
const FollowButton = ({
  _id,
  followers,
  myid,
}: {
  _id: string;
  followers?: string[] | UserProps[];
  myid?: string;
}) => {
  const { user } = useCurrentUser();
  const { setFollow, follow } = useStore();
  const router = useRouter();

  // Local state to handle the optimistic update
  const [optimisticFollow, setOptimisticFollow] = useState<boolean>(() => {
    const userId = user?.user?._id;
    if (!userId || !followers) return false;

    return followers?.some((follower) =>
      typeof follower === "string"
        ? follower === userId
        : follower._id === userId
    );
  });

  // Function to handle the follow action
  const handleFollow = async () => {
    // Optimistically set follow status
    setOptimisticFollow(true);
    setFollow(true); // Update global state as well

    try {
      const res = await fetch(`/api/user/follower/${_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ follower: user?.user?._id || myid }),
      });

      if (res.ok) {
        // Refresh the page or update the followers in the UI
        router.refresh();
      } else {
        throw new Error("Failed to follow");
      }
    } catch (error) {
      // Revert optimistic update on failure
      setOptimisticFollow(false);
      setFollow(!follow); // Update global state as well
      console.error("Error following:", error);
    }
  };

  // Function to handle unfollow action
  const handleUnfollow = async () => {
    // Optimistically set unfollow status
    setOptimisticFollow(false);
    setFollow(false); // Update global state as well

    try {
      const res = await fetch(`/api/user/unfollower/${_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ follower: user?.user?._id }),
      });

      if (res.ok) {
        // Refresh the page or update the followers in the UI
        router.refresh();
      } else {
        throw new Error("Failed to unfollow");
      }
    } catch (error) {
      // Revert optimistic update on failure
      setOptimisticFollow(true);
      setFollow(!follow); // Update global state as well
      console.error("Error unfollowing:", error);
    }
  };

  const handleUnFollowingCurrent = async () => {
    try {
      setFollow(false);
      const res = await fetch(`/api/user/unfollowing/${_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ following: user?.user?._id }),
      });
      const followingData: FetchResponse = await res.json();
      console.log(followingData);
    } catch (error) {
      console.log(error);
    }
  };
  const handleFollowing = async () => {
    try {
      const res = await fetch(`/api/user/following/${_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ following: user?.user?._id }),
      });
      const followingData: FetchResponse = await res.json();
      console.log(followingData);
      if (res.ok) {
        router.refresh();
      }
    } catch (error) {
      console.log(error);
    }
  };
  // useEffect(() => {
  //   console.log("Initial optimisticFollow:", optimisticFollow);
  //   console.log("Followers array:", followers);
  //   console.log("Current User ID:", user?.user?._id);
  // }, [optimisticFollow, followers, user]);
const isFollowing = (() => {
  const userId = user?.user?._id;
  if (!userId) return false;

  return followers?.some((follower) =>
    typeof follower === "string"
      ? follower === userId
      : follower._id === userId
  );
})();
  return (
    <div>
      {/* Conditional rendering based on optimistic follow state */}{" "}
      {(!follow && isFollowing) || optimisticFollow ? (
        <button
          onClick={() => {
            handleUnfollow();
            handleUnFollowingCurrent();
          }}
          className="flex items-center gap-1 text-gray-200 hover:text-red-800 text-[12px] p-1    bg-red-800  px-2 -py-6 rounded-md  min-w-[50px]"
        >
          following
        </button>
      ) : (
        <button
          onClick={() => {
            handleFollow();
            handleFollowing();
          }}
          className="flex items-center gap-1 text-green-700 hover:text-red-800 text-[12px] p-1     bg-neutral-200  px-2 -py-6 rounded-md  min-w-[50px]"
        >
          Follow <IoMdAdd style={{ fontSize: "16px" }} />
        </button>
      )}
    </div>
  );
};

export default FollowButton;
