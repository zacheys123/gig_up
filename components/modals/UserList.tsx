"use client";
import Image from "next/image";
import Modal from "./Modal";
import { User, MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import { IoAdd, IoCheckmark } from "react-icons/io5";
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";

import { useAuth } from "@clerk/nextjs";
import CheckModal from "./CheckModal";

type UserProps = Doc<"users">;
interface UserListModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  dep: string;
  users: UserProps[];
}

const UserListModal = ({
  isOpen,
  onClose,
  title,
  users,
  dep,
}: UserListModalProps) => {
  const router = useRouter();
  const { userId: clerkId } = useAuth();

  // Get current user from Convex
  const currentUser = useQuery(
    api.controllers.user.getCurrentUser,
    clerkId ? { clerkId } : "skip"
  );

  // Convex mutations
  const followUserMutation = useMutation(api.controllers.user.followUser);
  const [isMutating, setIsMutating] = useState<string | null>(null);

  const [modal, setModal] = useState<{
    type: "chat" | "video";
    user: UserProps;
  } | null>(null);

  const handleUserClick = (username: string) => {
    router.push(`/search/${username}`);
    onClose();
  };

  const handleOpenX = () => {
    // Reset any state if needed
  };

  const handleFollowUser = async (user: UserProps) => {
    if (!user?._id || !currentUser?._id || isMutating) return;

    setIsMutating(user._id);
    try {
      // Convert string to Convex ID and call mutation
      const targetUserId = user._id as Id<"users">;
      await followUserMutation({ targetUserId });

      // No need for manual optimistic updates - Convex handles it automatically!
    } catch (error) {
      console.error("Error toggling follow:", error);
    } finally {
      setIsMutating(null);
    }
  };

  const handleChatClick = (e: React.MouseEvent, user: UserProps) => {
    e.stopPropagation();
    setModal({
      type: "chat",
      user,
    });
  };

  const isFollowing = (user: UserProps) => {
    return currentUser?.followings?.includes(user._id) || false;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div
        className={
          dep === "musician"
            ? "max-h-[60vh] overflow-y-auto"
            : "max-h-[60vh] overflow-y-auto"
        }
      >
        {users.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-neutral-400">No {title.toLowerCase()} found</p>
          </div>
        ) : (
          <ul className="divide-y divide-neutral-700">
            {users.map((user, index) => (
              <UserListItem
                key={user._id || index}
                user={user}
                dep={dep}
                isFollowing={isFollowing(user)}
                isMutating={isMutating === user._id}
                onUserClick={() => handleUserClick(user.username)}
                onFollowClick={(e) => handleFollowUser(user)}
                onChatClick={(e) => handleChatClick(e, user)}
                currentUserId={currentUser?._id}
              />
            ))}
          </ul>
        )}
      </div>

      {dep === "musician" && modal && (
        <CheckModal
          onClose={() => setModal(null)}
          modal={modal}
          user={currentUser}
          onOpenX={handleOpenX}
        />
      )}
    </Modal>
  );
};

interface UserListItemProps {
  user: UserProps;
  dep: string;
  isFollowing: boolean;
  isMutating: boolean;
  onUserClick: () => void;
  onFollowClick: (e: React.MouseEvent) => void;
  onChatClick: (e: React.MouseEvent) => void;
  currentUserId?: string;
}

const UserListItem = ({
  user,
  dep,
  isFollowing,
  isMutating,
  onUserClick,
  onFollowClick,
  onChatClick,
  currentUserId,
}: UserListItemProps) => {
  return (
    <li
      className="py-3 px-2 hover:bg-neutral-800/50 rounded cursor-pointer transition-colors duration-200"
      onClick={onUserClick}
    >
      <div className="flex items-center gap-3">
        {/* User Avatar */}
        <div className="flex-shrink-0">
          <UserAvatar user={user} />
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start w-full">
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium truncate">
                {user.firstname || "Unknown User"} {user.lastname}
              </p>
              {user.email && (
                <p className="text-neutral-400 text-sm truncate">
                  {user.email}
                </p>
              )}
              {user.city && dep === "musician" && (
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-neutral-400 text-sm truncate">
                    <span className="text-yellow-500 text-[10px]">
                      Currently in:{" "}
                    </span>
                    {user.city}
                  </p>
                </div>
              )}
              {user.instrument && dep === "musician" && (
                <p className="text-amber-400 text-xs mt-1 truncate">
                  {user.instrument}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 items-end pl-2">
              {dep === "musician" && (
                <>
                  <button
                    className="rounded-full hover:bg-neutral-700 bg-neutral-600 p-2 transition-colors duration-200"
                    onClick={onChatClick}
                    disabled={isMutating}
                  >
                    <MessageSquare size={16} className="text-yellow-500" />
                  </button>

                  <FollowButton
                    isFollowing={isFollowing}
                    isMutating={isMutating}
                    onClick={onFollowClick}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </li>
  );
};

const UserAvatar = ({ user }: { user: UserProps }) => {
  if (user.picture && user.firstname) {
    return (
      <div className="w-10 h-10 rounded-full bg-neutral-700 overflow-hidden">
        <Image
          src={user.picture}
          alt={`${user.firstname}'s avatar`}
          width={40}
          height={40}
          className="object-cover w-full h-full"
        />
      </div>
    );
  }

  return (
    <div className="w-10 h-10 rounded-full bg-neutral-700 flex items-center justify-center">
      <User size={20} className="text-neutral-400" />
    </div>
  );
};

interface FollowButtonProps {
  isFollowing: boolean;
  isMutating: boolean;
  onClick: (e: React.MouseEvent) => void;
}

const FollowButton = ({
  isFollowing,
  isMutating,
  onClick,
}: FollowButtonProps) => {
  const buttonClass = isFollowing
    ? "bg-neutral-400 hover:bg-neutral-500"
    : "bg-orange-300 hover:bg-orange-400";

  return (
    <button
      className={`flex items-center gap-1 text-black rounded-xl px-3 py-1.5 text-sm font-medium transition-all duration-200 min-w-[80px] justify-center ${
        isMutating ? "opacity-50 cursor-not-allowed" : ""
      } ${buttonClass}`}
      onClick={onClick}
      disabled={isMutating}
    >
      {isMutating ? (
        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      ) : isFollowing ? (
        <>
          <IoCheckmark size={14} className="text-blue-500" />
          <span>Following</span>
        </>
      ) : (
        <>
          <span>Follow</span>
          <IoAdd size={14} className="text-blue-500" />
        </>
      )}
    </button>
  );
};

export default UserListModal;
