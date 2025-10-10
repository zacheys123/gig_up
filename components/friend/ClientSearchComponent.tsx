"use client";
import { UserProps } from "@/types/userinterfaces";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { IoCheckmarkDone } from "react-icons/io5";
import { Button } from "../ui/button";
import { MdAdd } from "react-icons/md";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { BsFacebook, BsInstagram, BsTwitter } from "react-icons/bs";
import { ArrowLeftIcon, Music, Video } from "lucide-react";
import useStore from "@/app/zustand/useStore";
import {
  handleFollow,
  handleFollowing,
  handleUnfollow,
  handleUnFollowingCurrent,
} from "@/utils";
import { FaTiktok, FaYoutube } from "react-icons/fa";
import ReportButton from "../report/ReportButton";
import Image from "next/image";

type FriendProps = {
  user: UserProps;
};

const ClientSearchComponent = () => {
  const { userId } = useAuth();
  const { username } = useParams();
  const { follow, setFollow } = useStore();
  const [friend, setFriend] = useState<FriendProps>();
  const [loading, setLoading] = useState<boolean>(false);
  const [refetch, setRefetch] = useState<boolean>(false);
  const { user } = useCurrentUser();
  const router = useRouter();

  useEffect(() => {
    if (!username) {
      // Guard: Do not run the effect if `usernamme` is undefined or null
      return;
    }
    let isMounted = true;

    async function getFriend() {
      // fetch friend data from an API endpoint
      try {
        const response = await fetch(`/api/user/getuser/${username}`);
        const friendData = await response.json();
        console.log(friendData);
        if (isMounted) {
          setFriend(friendData);
        }
        return friendData;
      } catch (error: unknown) {
        console.error("Error fetching friend data:", error);
        // handle the error appropriately, e.g., redirect to a 404 page or show an error message to the user
        if (isMounted) {
          setFriend({
            user: {
              clerkId: "",
              firstname: "",
              lastname: "",
              experience: "",
              instrument: "",
              username: "",
              followers: [],
              followings: [],
              allreviews: [],
              myreviews: [],
              isClient: false,
              isMusician: false,
              videosProfile: [],
              organization: "",
              handles: "",
              bio: "",
              genre: "",
              refferences: [],
              roleType: "",
              djGenre: "",
              djEquipment: "",
              mcType: "",
              mcLanguage: "",
              talentbio: "",
              vocalistGenre: "",
              musiciangenres: [],
              musicianhandles: [{ platform: "", handle: "" }],
              firstLogin: true,
              onboardingComplete: false,
              lastActive: new Date(),
              createdAt: new Date(),
              updatedAt: new Date(),
              isBanned: false,
              banReason: "",
              bannedAt: new Date(),
              isAdmin: false,
              adminRole: "super",
              adminPermissions: [""],
              lastAdminAction: new Date(),
              adminNotes: "",
              banExpiresAt: new Date(), // New field for temporary ban
              banReference: "", // New fiel
              theme: "lightMode",
              savedGigs: [],
              favoriteGigs: [],
              bookingHistory: [],
              completedGigsCount: 0,
              reportsCount: 0,
              cancelgigCount: 0,
              likedVideos: [],
              mpesaPhoneNumber: "",
              rate: {
                regular: "",
                function: "",
                concert: "",
                corporate: "",
              },
            },
          });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    // Cleanup function to avoid setting state after component unmounts

    getFriend();
    return () => {
      isMounted = false;
    };
  }, [username, refetch]);

  const [optimisticFollow, setOptimisticFollow] = useState<boolean>(() => {
    const userId = user && user?.user?._id;
    if (!userId || !friend?.user?.followers) return false;

    // Handle both string and UserProps cases
    return friend?.user?.followers.some((follower) =>
      typeof follower === "string"
        ? follower === userId
        : follower?._id === userId
    );
  });

  console.log(friend?.user?.picture);
  const isFollowing = (() => {
    const userId = user && user?.user?._id;
    if (!userId || !friend?.user?.followers) return false;

    return friend?.user?.followers.some((follower) =>
      typeof follower === "string"
        ? follower === userId
        : follower?._id === userId
    );
  })();

  // import { useEffect, useState } from "react";

  // export function useSimpleToast() {
  //   const [toast, setToast] = useState<{
  //     message: string;
  //     type: "success" | "error";
  //     show: boolean;
  //   }>({ message: "", type: "success", show: false });

  //   const showToast = (
  //     message: string,
  //     type: "success" | "error" = "success"
  //   ) => {
  //     setToast({ message, type, show: true });
  //     setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3000);
  //   };

  //   return { toast, showToast };
  // }

  // Usage:
  // const { showToast } = useSimpleToast()
  // showToast('Report submitted!', 'success')
  if (loading) return <div>loading....</div>;
  return (
    <div className="overflow-y-auto h-screen w-full bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header Section */}
      <div className="relative h-64 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-b-3xl shadow-lg">
        <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
          <div className="w-32 h-32 rounded-full border-4 border-white bg-white shadow-xl flex items-center justify-center">
            {friend?.user?.picture ? (
              <Image
                src={friend.user.picture}
                alt="Profile"
                className="w-full h-full rounded-full object-cover"
                width={100}
                height={100}
              />
            ) : (
              <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white text-5xl font-bold">
                {friend?.user?.firstname?.charAt(0)}
                {friend?.user?.lastname?.charAt(0)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="mt-20 px-6 pb-10">
        {/* Name and Follow Button */}
        <div className="flex flex-col items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            {friend?.user?.firstname} {friend?.user?.lastname}
          </h1>
          <p className="text-gray-500 text-sm mb-4">
            {friend?.user?.experience} years of experience in{" "}
            {friend?.user?.instrument}
          </p>

          <div className="flex gap-4">
            {(friend && !follow && isFollowing) || optimisticFollow ? (
              <Button
                variant="outline"
                className="px-6 py-2 text-indigo-600 border-indigo-600 hover:bg-indigo-50"
                onClick={() => {
                  if (friend && friend?.user?._id) {
                    try {
                      handleUnfollow(friend?.user?._id, user?.user);
                      handleUnFollowingCurrent(friend?.user?._id, user?.user);
                      setRefetch((prev) => !prev);
                      setOptimisticFollow(false);
                      setFollow(false);
                    } catch (error) {
                      setOptimisticFollow(true);
                      setFollow(true);
                      console.error("Error following:", error);
                    }
                  }
                }}
              >
                <IoCheckmarkDone className="mr-2" />
                Following
              </Button>
            ) : (
              <Button
                className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-md"
                onClick={() => {
                  if (friend && friend?.user?._id) {
                    try {
                      handleFollow(friend?.user?._id, user?.user);
                      handleFollowing(friend?.user?._id, user?.user);
                      setRefetch((prev) => !prev);
                      setOptimisticFollow(true);
                      setFollow(true);
                    } catch (error) {
                      setOptimisticFollow(false);
                      setFollow(!follow);
                      console.error("Error following:", error);
                    }
                  }
                }}
              >
                <MdAdd className="mr-2" />
                Follow
              </Button>
            )}
            <ReportButton userId={friend?.user?._id ? friend?.user?._id : ""} />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex justify-center gap-6 mb-8">
          <button
            onClick={() => router.back()}
            className="flex flex-col items-center text-gray-600 hover:text-indigo-600 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-white shadow-sm border border-gray-200 flex items-center justify-center">
              <ArrowLeftIcon className="text-gray-500" size={18} />
            </div>
            <span className="text-xs mt-1">Back</span>
          </button>

          <button
            onClick={() =>
              router.push(
                user?.user?.isClient
                  ? `/create/${userId}`
                  : `/av_gigs/${userId}`
              )
            }
            className="flex flex-col items-center text-gray-600 hover:text-indigo-600 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-white shadow-sm border border-gray-200 flex items-center justify-center">
              <Music className="text-green-500" size={18} />
            </div>
            <span className="text-xs mt-1">Music</span>
          </button>

          <button
            onClick={() =>
              router.push(
                `/search/allvideos/${friend?.user?._id}/*${user?.user?.firstname}${user?.user?.lastname}`
              )
            }
            className="flex flex-col items-center text-gray-600 hover:text-indigo-600 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-white shadow-sm border border-gray-200 flex items-center justify-center">
              <Video className="text-pink-500" size={18} />
            </div>
            <span className="text-xs mt-1">Videos</span>
          </button>
        </div>

        {/* Profile Sections */}
        <div className="space-y-6">
          {/* Contact Info */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
              Contact Information
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-gray-800 font-medium">
                  {friend?.user?.email || "Not provided"}
                </p>
              </div>
              {friend?.user?.city && (
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="text-gray-800 font-medium">
                    {friend?.user?.city}
                  </p>
                </div>
              )}
            </div>
          </div>
          {friend?.user?.bio && (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4">
                <h2 className="text-lg font-semibold text-indigo-800 flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Professional Bio
                </h2>
              </div>
              <div className="p-6">
                <div className="prose prose-indigo max-w-none">
                  <p className="text-gray-700 whitespace-pre-line">
                    {friend?.user?.bio}
                  </p>
                </div>
                {friend?.user?.talentbio && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">
                      Specialties
                    </h3>
                    <p className="text-gray-600">{friend?.user?.talentbio}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Social Media */}
          {friend?.user?.handles && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
                Social Media
              </h2>
              <div className="flex justify-center gap-6">
                {friend?.user?.handles.split(",").map((handle, i) => (
                  <div key={i}>
                    {handle.includes("instagram") && (
                      <button
                        onClick={() =>
                          window.open(
                            handle.startsWith("http")
                              ? handle
                              : `https://${handle}`,
                            "_blank"
                          )
                        }
                        className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-yellow-500 text-white flex items-center justify-center shadow-md hover:shadow-lg transition-shadow"
                      >
                        <BsInstagram size={18} />
                      </button>
                    )}
                    {handle.includes("tiktok") && (
                      <button
                        onClick={() =>
                          window.open(
                            handle.startsWith("http")
                              ? handle
                              : `https://${handle}`,
                            "_blank"
                          )
                        }
                        className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center shadow-md hover:shadow-lg transition-shadow"
                      >
                        <FaTiktok size={18} />
                      </button>
                    )}
                    {handle.includes("youtube") && (
                      <button
                        onClick={() =>
                          window.open(
                            handle.startsWith("http")
                              ? handle
                              : `https://${handle}`,
                            "_blank"
                          )
                        }
                        className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center shadow-md hover:shadow-lg transition-shadow"
                      >
                        <FaYoutube size={18} />
                      </button>
                    )}
                    {handle.includes("x") && (
                      <button
                        onClick={() =>
                          window.open(
                            handle.startsWith("http")
                              ? handle
                              : `https://${handle}`,
                            "_blank"
                          )
                        }
                        className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center shadow-md hover:shadow-lg transition-shadow"
                      >
                        <BsTwitter size={18} />
                      </button>
                    )}
                    {handle.includes("facebook") && (
                      <button
                        onClick={() =>
                          window.open(
                            handle.startsWith("http")
                              ? handle
                              : `https://${handle}`,
                            "_blank"
                          )
                        }
                        className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md hover:shadow-lg transition-shadow"
                      >
                        <BsFacebook size={18} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Stats */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
              Statistics
            </h2>
            <div className="flex justify-around">
              <div className="text-center">
                <p className="text-2xl font-bold text-indigo-600">
                  {friend?.user?.followers?.length || 0}
                </p>
                <p className="text-sm text-gray-500">Followers</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {friend?.user?.followings?.length || 0}
                </p>
                <p className="text-sm text-gray-500">Following</p>
              </div>
            </div>
          </div>

          {/* Bio */}
          {friend?.user?.bio && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
                About
              </h2>
              <p className="text-gray-700">{friend?.user?.bio}</p>
            </div>
          )}

          {/* Organization */}
          {friend?.user?.organization && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
                Organization
              </h2>
              <p className="text-gray-700">{friend?.user?.organization}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-10 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} Gigup. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default ClientSearchComponent;
