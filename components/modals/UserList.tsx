// import Image from "next/image";
// import Modal from "./Modal";
// import { User } from "lucide-react";
// import { UserProps } from "@/types/userinterfaces";

// const UserListModal = ({
//   isOpen,
//   onClose,
//   title,
//   users,
//   dep,
// }: {
//   isOpen: boolean;
//   onClose: () => void;
//   title: string;
//   dep: string;
//   users:
//     | {
//         firstname: string;
//         email?: string;
//         picture: string;
//         lastname: string;
//         city: string;
//       }[]
//     | UserProps[];
// }) => {
//   console.log(users);
//   return (
//     <Modal isOpen={isOpen} onClose={onClose} title={title}>
//       <div className="max-h-[60vh] overflow-y-auto">
//         {users.length === 0 ? (
//           <p className="text-neutral-400 text-center py-4">
//             No {title.toLowerCase()} found
//           </p>
//         ) : (
//           <ul className="divide-y divide-neutral-700">
//             {users.map((user, index) => (
//               <li
//                 key={index}
//                 className="py-3 px-2 hover:bg-neutral-800/50 rounded"
//               >
//                 <div className="flex items-center gap-3">
//                   <div className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center">
//                     {user?.picture && user?.firstname ? (
//                       <Image
//                         src={user?.picture}
//                         alt={user?.firstname[0]}
//                         height={25}
//                         width={25}
//                         className="object-cover rounded-full"
//                       />
//                     ) : (
//                       <User size={16} className="text-neutral-400" />
//                     )}
//                   </div>
//                   <div className="flex justify-between items-center w-full">
//                     <div className="flex flex-col w-full">
//                       <p className="text-white font-medium">
//                         {user.firstname || "Unknown User"} {user?.lastname}
//                       </p>
//                       {user.email && (
//                         <p className="text-neutral-400 text-sm">{user.email}</p>
//                       )}{" "}
//                     </div>
//                     {user.city && (
//                       <p className="text-neutral-400 text-sm whitespace-nowrap">
//                         <span className="text-yellow-500 text-[10px]">
//                           Currently in:{" "}
//                         </span>
//                         {user.city}
//                       </p>
//                     )}
//                   </div>
//                 </div>
//               </li>
//             ))}
//           </ul>
//         )}
//       </div>
//     </Modal>
//   );
// };
// export default UserListModal;
"use client";
import Image from "next/image";
import Modal from "./Modal";
import { User, MessageSquare } from "lucide-react";
import { UserProps } from "@/types/userinterfaces";
import { useRouter } from "next/navigation";
import { IoAdd } from "react-icons/io5";
import { useState } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import {
  handleFollow,
  handleFollowing,
  handleUnfollow,
  handleUnFollowingCurrent,
} from "@/utils";
import { mutate } from "swr";
import CheckModal from "@/components/CheckModal";

const UserListModal = ({
  isOpen,
  onClose,
  title,
  users,
  dep,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  dep: string;
  users: UserProps[];
}) => {
  const router = useRouter();
  const { user: myuser } = useCurrentUser();

  const handleUserClick = (name: string) => {
    router.push(`/search/${name}`);
    onClose();
  };

  const [showX, setShowX] = useState(false);
  // //   const forget = () => forgetBookings(userId || "", currentgig);
  // const handleBookUser = (bookingId: string) => {
  //   setSelectedUser(bookingId);
  //   console.log(`User ${userId} booked. Others disqualified.`);
  //   bookgig(router, currentgig, userId || "", bookingId as string);
  // };

  // Define the onOpenX function
  const handleOpenX = () => {
    setShowX(false); // Reset the showX state
  };
  console.log(showX);
  const [modal, setModal] = useState<{
    type: "chat" | "video";
    user: UserProps;
  } | null>(null);
  const [follow, setFollow] = useState(false);
  const [isMutating, setIsMutating] = useState(false);

  // const handleFollow = async (friend) => {
  //   if (!friend?._id || !myuser?.user?._id || isMutating) return;
  //   setIsMutating(true);
  //   setFollow(true);
  //   try {
  //
  //   } catch (error) {
  //     setFollow(false);
  //
  //     console.error("Error following:", error);
  //   } finally {
  //     setIsMutating(false);
  //   }
  // };

  // const handleUnfollowClick = async (friend: UserProps) => {
  //   if (!friend?._id || !myuser?.user?._id || isMutating) return;
  //   setIsMutating(true);
  //   setFollow(true);
  //   try {
  //
  //   } catch (error) {
  //     setFollow(false);
  //
  //     console.error("Error following:", error);
  //   } finally {
  //     setIsMutating(false);
  //   }
  // };
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div
        className={
          dep === "musician"
            ? "max-h-[60vh] overflow-y-auto"
            : "fixed max-h-[60vh] overflow-y-auto"
        }
      >
        {users.length === 0 ? (
          <p className="text-neutral-400 text-center py-4">
            No {title.toLowerCase()} found
          </p>
        ) : (
          <ul className="divide-y divide-neutral-700">
            {users.map((user, index) => (
              <li
                key={index}
                className="py-3 px-2 hover:bg-neutral-800/50 rounded cursor-pointer"
                onClick={() => handleUserClick(user?.username)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center">
                    {user?.picture && user?.firstname ? (
                      <Image
                        src={user?.picture}
                        alt={user?.firstname[0]}
                        height={25}
                        width={25}
                        className="object-cover rounded-full"
                      />
                    ) : (
                      <User size={16} className="text-neutral-400" />
                    )}
                  </div>
                  <div className="flex justify-between items-center w-full">
                    <div className="flex flex-col w-full">
                      <p className="text-white font-medium">
                        {user.firstname || "Unknown User"} {user?.lastname}
                      </p>
                      {user.email && (
                        <p className="text-neutral-400 text-sm">{user.email}</p>
                      )}

                      <div className="flex items-center gap-2">
                        {user.city && dep === "musician" && (
                          <p className="text-neutral-400 text-sm whitespace-nowrap">
                            <span className="text-yellow-500 text-[10px]">
                              Currently in:{" "}
                            </span>
                            {user.city}
                          </p>
                        )}{" "}
                      </div>
                    </div>{" "}
                    <div className="flex flex-col gap-2 items-center">
                      {dep === "musician" && (
                        <button
                          className=" rounded-full hover:bg-neutral-700 bg-neutral-600 p-2 "
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle chat functionality here
                            alert("chat");
                          }}
                        >
                          <MessageSquare
                            size={16}
                            className="text-yellow-500"
                            onClick={() =>
                              setModal({
                                type: "chat",
                                user,
                              })
                            }
                          />
                        </button>
                      )}
                      {dep === "musician" && (
                        <div
                          className={`flex  gap-1 text-black rounded-xl title items-center px-2 py-1 ${
                            !user?.followers?.includes(myuser?.user?._id)
                              ? "bg-orange-300"
                              : "bg-neutral-400"
                          }`}
                        >
                          {!follow &&
                          user?.followers?.includes(myuser?.user?._id) ? (
                            <div
                              onClick={async (ev) => {
                                ev.preventDefault();
                                ev.stopPropagation();
                                setIsMutating(true);
                                if (
                                  !user?._id ||
                                  !myuser?.user?._id ||
                                  isMutating
                                )
                                  return;

                                setFollow((prev: boolean) => !prev);
                                setIsMutating(true);

                                try {
                                  const optimisticData = {
                                    ...user,
                                    user: {
                                      ...user,
                                      followers: [
                                        ...(user.followers || []),
                                        myuser?.user?._id,
                                      ],
                                    },
                                  };

                                  mutate(
                                    `/api/user/getuser/${user?.username}`,
                                    optimisticData,
                                    false
                                  );

                                  await Promise.all([
                                    handleUnfollow(user._id, myuser?.user),
                                    handleUnFollowingCurrent(
                                      user._id,
                                      myuser?.user
                                    ),
                                  ]);

                                  mutate(`/api/user/getuser/${user?.username}`);
                                } catch (error) {
                                  mutate(
                                    `/api/user/getuser/${user?.username}`,
                                    user,
                                    false
                                  );

                                  console.error("Error following:", error);
                                } finally {
                                  setIsMutating(false);
                                }
                              }}
                            >
                              Following
                            </div>
                          ) : (
                            <div
                              onClick={async (ev) => {
                                ev.preventDefault();
                                ev.stopPropagation();
                                console.log(user?.followers);
                                if (
                                  !user?._id ||
                                  !myuser?.user?._id ||
                                  isMutating
                                )
                                  return;
                                setFollow((prev: boolean) => !prev);
                                setIsMutating(true);

                                try {
                                  const optimisticData = {
                                    ...user,
                                    user: {
                                      ...user,
                                      followers: [
                                        ...(user.followers || []),
                                        myuser?.user?._id,
                                      ],
                                    },
                                  };

                                  mutate(
                                    `/api/user/getuser/${user?.username}`,
                                    optimisticData,
                                    false
                                  );

                                  await Promise.all([
                                    handleFollow(user._id, myuser?.user),
                                    handleFollowing(user._id, myuser?.user),
                                  ]);

                                  mutate(`/api/user/getuser/${user?.username}`);
                                } catch (error) {
                                  mutate(
                                    `/api/user/getuser/${user?.username}`,
                                    user,
                                    false
                                  );

                                  console.error("Error following:", error);
                                } finally {
                                  setIsMutating(false);
                                }
                              }}
                            >
                              <div className="flex items-center whitespace-nowrap justify-between px-2">
                                Follow
                                <IoAdd size="16" className="text-blue-500" />
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      {dep === "musician" && modal && (
        <CheckModal
          onClose={() => setModal(null)}
          modal={modal}
          user={myuser?.user}
          onOpenX={handleOpenX}
        />
      )}
    </Modal>
  );
};

export default UserListModal;
