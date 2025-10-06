"use client";

import { OnboardingModal } from "@/components/dashboard/onboarding";
import BallLoader from "@/components/loaders/BallLoader";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ClientDashboard } from "@/components/dashboard/client";
import { MusicianDashboard } from "@/components/dashboard/muscian";
import useStore from "../zustand/useStore";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { userId, isLoaded } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { subscriptiondata: data, setData } = useStore();

  useEffect(() => {
    if (!isLoaded) return;

    const fetchData = async () => {
      try {
        if (!userId) {
          router.push("/sign-in");
          return;
        }

        setLoading(true);
        const result = await fetch(`/api/user/subscription?clerkId=${userId}`);
        const mydata = await result.json();
        // const result = await getDashboardData(userId);
        console.log(mydata);
        setData(mydata);
      } catch (err) {
        console.error("Failed to load dashboard:", err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, isLoaded, router]);

  console.log(data);

  if (!isLoaded || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <div className="flex flex-col items-center w-full ">
          <BallLoader />
          <span className="text-yellow-400 font-mono">Loading ...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-300 backdrop-blur-sm bg-neutral-700/50 flex-col gap-4 ">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-4 border-lime-400 border-t-transparent rounded-full"
        />
        <h6 className="animate-pulse font-mono text-1xl  text-amber-500">
          {`Loading User's Data`}
        </h6>
      </div>
    );
  }

  return (
    <>
      {data?.user?.isMusician === true ? (
        <MusicianDashboard
          gigsBooked={data?.user?.gigsBooked ?? 0}
          earnings={data?.user?.userearnings ?? 0}
          firstLogin={data?.user?.firstLogin}
          onboarding={data?.user?.onboardingComplete}
        />
      ) : data?.user?.isClient === true ? (
        <ClientDashboard
          gigsPosted={data?.user?.gigsPosted}
          total={data?.user?.total}
          isPro={data?.subscription?.isPro}
        />
      ) : null}

      {/* {!data.subscription.isPro && (
        <div className="mb-6 bg-gradient-to-r from-orange-900/50 to-amber-900/30 p-4 rounded-lg">
          <p className="text-orange-300 text-sm md:text-base">
            Upgrade to Pro for unlimited features
          </p>
        </div>
      )} */}
      {data &&
        data?.user?.firstLogin === true &&
        data?.user?.onboardingComplete === false && <OnboardingModal />}
    </>
  );
}
