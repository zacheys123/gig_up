"use client";
import GigChart from "./GigChart";
import { RoleStatusCard } from "./RoleStatusCard";
import { UsageMeter } from "./UsageMeter";
import { Calendar, DollarSign, Music, Star, Rocket } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

import { Doc } from "@/convex/_generated/dataModel";

// Use Convex's generated types
type Gig = Doc<"gigs">;
type User = Doc<"users">;

interface GigWithUsers extends Gig {
  postedByUser: User | null;
  bookedByUser: User | null;
}
interface ClientDashboardProps {
  gigsPosted?: number;
  total?: number;
  isPro: boolean;
}

export function ClientDashboard({
  gigsPosted = 0,
  total = 0,
  isPro,
}: ClientDashboardProps) {
  const { userId } = useAuth();
  const gigs = useQuery(api.controllers.gigs.getGigsWithUsers); // Use the new query
  const router = useRouter();

  // Now you can access postedByUser.clerkId
  const gigsBookedAndCompleted = gigs?.filter(
    (gig: GigWithUsers) => gig.postedByUser?.clerkId === userId && gig.isTaken
  ).length;

  const upcoming = gigs?.filter(
    (gig: GigWithUsers) => gig.postedByUser?.clerkId === userId && gig.isPending
  ).length;

  const loading = gigs === undefined;

  return (
    <div className="space-y-10 p-4 md:p-6 lg:p-10 bg-gradient-to-br from-[#0f0f0f] to-[#1a1a1a] text-white min-h-screen">
      {/* Pro or Free Badge */}
      {isPro ? (
        <>
          {/* Pro Badge and Cards */}
          <div className="flex items-center gap-3 bg-gradient-to-r from-purple-600/20 to-purple-900/10 border border-purple-700/50 p-4 rounded-2xl shadow-md backdrop-blur-md">
            <Star className="text-yellow-400 animate-pulse" />
            <span className="text-sm font-medium tracking-wide text-purple-200">
              You're a{" "}
              <span className="text-yellow-300 font-semibold">Pro</span> member
              – Enjoy priority posting and analytics!
            </span>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl border border-slate-700 shadow-lg hover:shadow-xl transition-all hover:border-purple-500/40 relative overflow-hidden">
              <div className="absolute inset-0 bg-purple-500/10 blur-sm opacity-20 pointer-events-none rounded-2xl"></div>
              <h3 className="text-lg font-semibold mb-4">Your Usage</h3>
              <UsageMeter current={2} max={3} label="Gig Postings" />
            </div>

            <div className="p-6 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl border border-gray-700 shadow-lg hover:shadow-xl transition-all hover:border-blue-500/40 relative overflow-hidden">
              <div className="absolute inset-0 bg-blue-500/10 blur-sm opacity-20 pointer-events-none rounded-2xl"></div>
              <h3 className="text-lg font-semibold mb-4">Your Activity</h3>
              <GigChart />
            </div>
          </div>

          {/* Header */}
          <div className="space-y-2 group mt-6">
            <h1 className="text-3xl font-bold relative inline-block">
              Event Management
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500 group-hover:w-full"></span>
            </h1>
            <p className="text-sm text-gray-400">
              Overview of your gigs and spending
            </p>
          </div>

          {/* Status Cards ONLY for Pro */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {!loading && (
              <>
                <RoleStatusCard
                  title="Gigs Posted This Month"
                  value={gigsPosted}
                  icon={
                    <div className="p-3 rounded-full bg-purple-500/10 backdrop-blur-sm">
                      <Music className="text-purple-400" size={20} />
                    </div>
                  }
                  trend="up"
                />
                <RoleStatusCard
                  title="Gigs Booked and Completed"
                  value={gigsBookedAndCompleted || 0}
                  icon={
                    <div className="p-3 rounded-full bg-purple-500/10 backdrop-blur-sm">
                      <Music className="text-purple-400" size={20} />
                    </div>
                  }
                  trend="up"
                />
              </>
            )}

            <RoleStatusCard
              title="Total Spent"
              value={total}
              format="currency"
              icon={
                <div className="p-3 rounded-full bg-green-500/10 backdrop-blur-sm">
                  <DollarSign className="text-green-400" size={20} />
                </div>
              }
              trend="steady"
            />

            <RoleStatusCard
              title="Upcoming Events"
              value={upcoming || 0}
              icon={
                <div className="p-3 rounded-full bg-blue-500/10 backdrop-blur-sm">
                  <Calendar className="text-blue-400" size={20} />
                </div>
              }
              trend="down"
            />
          </div>
        </>
      ) : (
        <>
          {/* Free User Upgrade Prompt */}
          <div className="bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 border border-gray-600 p-6 rounded-2xl text-center space-y-4 shadow-md">
            <h2 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
              <Rocket className="text-pink-400" /> Upgrade to Pro
            </h2>
            <p className="text-gray-300 text-sm">
              Unlock full access to analytics, unlimited gig postings, premium
              visibility and priority booking!
            </p>
            <Button
              onClick={() => router.push("/dashboard/billing")}
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-6 py-2 rounded-lg font-semibold shadow-md transition"
            >
              Upgrade Now
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
