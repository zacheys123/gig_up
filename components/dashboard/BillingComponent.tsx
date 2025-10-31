"use client";
import React from "react";
import { SubscriptionCard } from "./SubscriptionCard";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useAuth } from "@clerk/nextjs";
import { useSubscriptionStore } from "@/app/stores/useSubscriptionStore";
import { motion } from "framer-motion";
import BillingComponentSkeleton from "../skeletons/BillingComponentSkeleton";

const BillingComponent = () => {
  const { user, isLoading } = useCurrentUser();
  const { getPlansForUser } = useSubscriptionStore();

  // Updated to include booker role
  const plans = getPlansForUser(
    user?.isMusician,
    user?.isClient,
    user?.isBooker
  );

  if (isLoading) {
    return <BillingComponentSkeleton />;
  }
  return (
    <div className="w-full">
      {/* Responsive grid with perfect mobile spacing */}
      <div
        className="grid grid-cols-1 gap-4 sm:gap-6 md:gap-8 
        max-w-sm mx-auto 
        sm:max-w-2xl 
        md:max-w-4xl 
        lg:max-w-5xl
        sm:grid-cols-2
        px-4 sm:px-6 lg:px-8
      "
      >
        {user &&
          plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="w-full"
            >
              <SubscriptionCard plan={plan} />
            </motion.div>
          ))}
      </div>
    </div>
  );
};

export default BillingComponent;
