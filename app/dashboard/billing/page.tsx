"use client";
import { UsageMeter } from "@/components/dashboard/UsageMeter";
import { MobileUsageMeter } from "@/components/dashboard/MobileUsageMeter";
import GigChart from "@/components/dashboard/GigChart";
import BillingComponent from "@/components/dashboard/BillingComponent";
import { useAuth, UserButton } from "@clerk/nextjs";
import { motion } from "framer-motion";
import {
  Sparkles,
  Zap,
  CreditCard,
  BarChart2,
  RefreshCw,
  Briefcase,
} from "lucide-react";
import GigLoader from "@/components/(main)/GigLoader";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import BillingPageSkeleton from "@/components/skeletons/BillingPageSkeleton";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export default function BillingPage() {
  const { userId, isLoaded: authLoaded } = useAuth();
  const { user } = useCurrentUser();

  // Get subscription directly from Convex
  const subscription = useQuery(
    api.controllers.subscription.getSubscription,
    userId ? { clerkId: userId } : "skip",
  );

  if (!authLoaded || (userId && subscription === undefined)) {
    return <BillingPageSkeleton />;
  }

  // If no subscription data found
  if (!subscription) {
    return (
      <div className="fixed inset-0 flex flex-col overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="flex-1 overflow-y-auto p-4 md:p-8 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-xl font-bold text-white mb-4">
              No Subscription Data
            </h1>
            <p className="text-gray-400">
              Unable to load your subscription information.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const getUserRoleIcon = () => {
    if (user?.isMusician) return <Zap className="w-6 h-6 text-amber-400" />;
    if (user?.isClient) return <BarChart2 className="w-6 h-6 text-blue-400" />;
    if (user?.isBooker)
      return <Briefcase className="w-6 h-6 text-purple-400" />;
    return <CreditCard className="w-6 h-6 text-gray-400" />;
  };

  const getUserRoleLabel = () => {
    if (user?.isMusician) return "Artist";
    if (user?.isClient) return "Client";
    if (user?.isBooker) return "Booker";
    return "User";
  };

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 md:space-y-10">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-between items-center"
        >
          <div className="flex items-center gap-3">
            {getUserRoleIcon()}
            <div>
              <h1 className="text-xl md:text-3xl font-bold text-white flex items-center gap-2">
                <span>Billing & Subscription</span>
              </h1>
              <p className="text-sm md:text-base text-gray-400 mt-1">
                Manage your plan, payment methods, and usage analytics
                {user && (
                  <span className="ml-2 text-amber-400">
                    ({getUserRoleLabel()})
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 text-sm bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-lg transition-all">
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
            <UserButton />
          </div>
        </motion.div>

        {/* Billing Component - Pass subscription data */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <BillingComponent />
        </motion.div>

        {/* Usage Tracking Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="space-y-6"
        >
          <div className="flex items-center gap-3">
            <BarChart2 className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-semibold text-white">
              Usage Analytics
            </h2>
          </div>

          {/* Show usage based on subscription tier and user role */}
          <div className="hidden md:grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              whileHover={{ y: -5 }}
              className="space-y-6 p-6 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700"
            >
              <div className="space-y-1">
                <h3 className="text-lg font-medium text-white">
                  {subscription.tier === "pro"
                    ? "Pro Benefits"
                    : "Monthly Limits"}
                </h3>
                <p className="text-sm text-gray-400">
                  {subscription.tier === "pro"
                    ? "Enjoy unlimited access with your Pro plan"
                    : "Your current usage against plan limits"}
                </p>
              </div>
              <div className="space-y-5">
                {subscription.tier === "pro" ? (
                  <>
                    <UsageMeter current={-1} max={-1} label="Gig Postings" />
                    <UsageMeter
                      current={-1}
                      max={-1}
                      label={
                        user?.isBooker ? "Events Managed" : "Gig Applications"
                      }
                    />
                  </>
                ) : (
                  <>
                    <UsageMeter current={2} max={3} label="Gig Postings" />
                    <UsageMeter
                      current={1}
                      max={5}
                      label={
                        user?.isBooker ? "Events Managed" : "Gig Applications"
                      }
                    />
                  </>
                )}
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="p-6 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700"
            >
              <div className="space-y-1 mb-4">
                <h3 className="text-lg font-medium text-white">
                  Activity Overview
                </h3>
                <p className="text-sm text-gray-400">
                  {user?.isBooker
                    ? "Your event management trends"
                    : "Your gig posting trends over time"}
                </p>
              </div>
              <GigChart />
            </motion.div>
          </div>
        </motion.div>

        {/* Show upgrade tip only for free users */}
        {subscription.tier === "free" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mt-8 p-4 bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-xl border border-blue-800/50"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Sparkles className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-white">Pro Tip</h3>
                <p className="text-sm text-gray-300 mt-1">
                  Upgrade to Pro for unlimited{" "}
                  {user?.isBooker ? "event management" : "gig postings"},
                  premium analytics, and priority support. Get 20% off your
                  first 3 months with code{" "}
                  <span className="font-mono bg-gray-800 px-2 py-1 rounded text-blue-300">
                    PRO20
                  </span>
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
