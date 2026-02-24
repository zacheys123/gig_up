"use client";
import { useAllUsers } from "@/hooks/useAllUsers";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { UserProps } from "@/types/userinterfaces";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import UserListModal from "../gig/create/UserList";

const Musicians = ({ _id }: UserProps & { isMobile: boolean }) => {
  const { users: allusers, loading } = useAllUsers();
  const { user } = useCurrentUser();
  const router = useRouter();

  const NotCurrentUserAndNotClientIsMusician = allusers?.users?.filter(
    (myuser: UserProps) => {
      // Early return if user is not available
      if (!user) return false;

      // Basic filtering
      if (
        myuser?._id === _id ||
        !myuser?.instrument ||
        myuser?.isClient === true ||
        myuser?.isMusician !== true
      ) {
        return false;
      }

      // Role-based filtering
      switch (user?.user?.roleType) {
        case "instrumentalist":
          return myuser.roleType === "instrumentalist";
        case "dj":
          return myuser.roleType === "dj";
        case "mc":
          return myuser.roleType === "mc";
        case "vocalist":
          return myuser.roleType === "vocalist";
        default:
          return false;
      }
    },
  );

  const normalizeString = (str?: string) =>
    str
      ?.trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") || "";

  // console.log("Current user city:", user?.user?.city);
  // console.log("Current user instrument:", user?.user?.instrument);
  // console.log(
  //   "All musicians:",
  //   allusers?.users?.map((u: UserProps) => ({
  //     name: `${u.firstname} ${u.lastname}`,
  //     city: u.city,
  //     instrument: u.instrument,

  //     isMusician: u.isMusician,
  //   }))
  // );
  const CurrentMusicianAroundWhereIam = allusers?.users?.filter(
    (myuser: UserProps) => {
      if (!myuser?.isMusician) return false;

      const currentCity = normalizeString(user?.user?.city);
      const currentInstrument = normalizeString(user?.user?.instrument);
      const targetCity = normalizeString(myuser.city);
      const targetInstrument = normalizeString(myuser.instrument);

      // Match when both city and instrument exist in both users
      if (currentCity && currentInstrument) {
        return targetCity === currentCity;
      }

      // Fallback: match just city if instrument missing
      if (currentCity && !currentInstrument) {
        return targetCity === currentCity;
      }

      // Fallback: match just instrument if city missing
      if (!currentCity && currentInstrument) {
        return targetInstrument === currentInstrument;
      }

      return false;
    },
  );

  // const randomUser =
  //   NotCurrentUserOrClientIsmusucian[
  //     Math.floor(Math.random() * NotCurrentUserOrClientIsmusucian.length)
  //   ];
  const [showNearby, setShowNearByModal] = useState(false);
  const [modalData, setModalData] = useState<{
    title: string;
    users: UserProps[];
  }>({ title: "", users: [] });

  if (loading) {
    return (
      <div className="w-full max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col gap-6">
          <div className="h-8 w-64 bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg animate-pulse" />
          <div className="flex gap-4 overflow-x-auto pb-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex flex-col items-center min-w-[120px]">
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-gray-800 to-gray-700 animate-pulse" />
                <div className="h-4 w-16 mt-3 bg-gray-800 rounded animate-pulse" />
                <div className="h-3 w-12 mt-2 bg-gray-800 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-purple-400">
              Musicians Near You
            </h2>
            <p className="text-gray-400 mt-1">
              Connect with talented artists in your area
            </p>
          </div>

          <button
            onClick={() => {
              setModalData({
                title: "Nearby Musicians",
                users: CurrentMusicianAroundWhereIam || [],
              });
              setShowNearByModal(true);
            }}
            className="px-4 py-2 text-xs font-medium bg-gradient-to-br from-amber-500/20 to-purple-500/20 hover:from-amber-500/30 hover:to-purple-500/30 border border-amber-400/30 rounded-full text-amber-300 transition-all"
          >
            {CurrentMusicianAroundWhereIam?.length || 0} nearby
          </button>
        </div>

        <div className="relative">
          <div className="flex gap-4 pb-2 overflow-x-auto scrollbar-hide">
            {NotCurrentUserAndNotClientIsMusician?.map(
              (musician: UserProps) => (
                <motion.div
                  key={musician._id}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  whileHover={{ y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="flex flex-col items-center flex-shrink-0 w-24 cursor-pointer group"
                  onClick={() => router.push(`/search/${musician.username}`)}
                >
                  <div className="relative mb-3">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/30 to-purple-500/20 rounded-full blur-md group-hover:blur-lg transition-all duration-300 -z-10" />
                    <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 group-hover:border-amber-400 transition-all duration-300 overflow-hidden">
                      {musician.picture ? (
                        <Image
                          src={musician.picture}
                          alt={`${musician.firstname}'s profile`}
                          className="w-full h-full object-cover"
                          width={64}
                          height={64}
                        />
                      ) : (
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-purple-400">
                          {musician.firstname?.[0]}
                          {musician.lastname?.[0]}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-center w-full">
                    <h3 className="text-sm font-medium text-gray-200 truncate">
                      {musician.firstname}
                    </h3>
                    {musician.instrument && (
                      <p className="text-xs text-amber-400 mt-1 font-medium">
                        {musician.instrument}
                      </p>
                    )}
                  </div>
                </motion.div>
              ),
            )}
          </div>
        </div>
      </motion.div>

      <UserListModal
        isOpen={showNearby}
        onClose={() => setShowNearByModal(false)}
        title={modalData.title}
        users={modalData.users}
        dep="musician"
      />
    </div>
  );
};

export default Musicians;
