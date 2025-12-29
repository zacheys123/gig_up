// components/OnboardingModal.tsx
"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, DollarSign, Shield, Target, Home } from "lucide-react";
import Link from "next/link";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { Id } from "@/convex/_generated/dataModel";

export function OnboardingModal() {
  const [isOpen, setIsOpen] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const { user } = useCurrentUser();
  useEffect(() => {
    // Only open if user exists and onboarding is not complete
    if (user && !user.onboardingComplete) {
      setIsOpen(true);
    }
  }, [user]);
  const steps = [
    {
      icon: <User className="w-6 h-6" />,
      title: "Complete Your Profile",
      description:
        "Add your photo, instrument, and bio so clients can find you",
      action: "/profile?q=edit",
      buttonText: "Complete Profile",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: <DollarSign className="w-6 h-6" />,
      title: "Set Your Rates",
      description: "Define your pricing for different types of gigs",
      action: "/profile?q=rates",
      buttonText: "Set Rates",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Get Verified",
      description: "Verify your identity to build trust with clients",
      action: "/settings",
      buttonText: "Start Verification",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Understand Trust Scores",
      description: "Learn how trust scores help you get more bookings",
      action: "/dashboard/onboarding/trust-explained",
      buttonText: "Learn About Trust",
      color: "from-orange-500 to-amber-500",
    },
  ];
  const markUserAsOnBoarded = useMutation(
    api.controllers.user.markOnboardingComplete
  );
  const handleComplete = () => {
    // Mark onboarding as complete (you'll need to add this mutation)
    markUserAsOnBoarded({ userId: user?._id as Id<"users"> });
    setIsOpen(false);
  };

  const handleSkipToDashboard = () => {
    setIsOpen(false);
  };

  if (!isOpen) return null;

  const isProfileComplete = user?.firstname && user?.instrument;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-2xl rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-2xl overflow-hidden"
        >
          {/* Header with gradient */}
          <div className={`bg-gradient-to-r ${steps[currentStep].color} p-6`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  {steps[currentStep].icon}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    Welcome to GigUpp!
                  </h2>
                  <p className="text-white/80 text-sm mt-1">
                    Step {currentStep + 1} of {steps.length} • Let's get you
                    started
                  </p>
                </div>
              </div>
              <button
                onClick={handleSkipToDashboard}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-gray-200 dark:bg-gray-700">
            <div
              className={`h-full bg-gradient-to-r ${steps[currentStep].color} transition-all duration-300`}
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="text-center mb-8">
              <div
                className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${steps[currentStep].color} mb-4`}
              >
                <div className="text-white text-2xl">
                  {steps[currentStep].icon}
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                {steps[currentStep].title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                {steps[currentStep].description}
              </p>
            </div>

            {/* Step indicator */}
            <div className="flex justify-center gap-2 mb-8">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index <= currentStep
                      ? "bg-blue-500"
                      : "bg-gray-300 dark:bg-gray-600"
                  }`}
                />
              ))}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={steps[currentStep].action}
                className={`px-6 py-3 bg-gradient-to-r ${steps[currentStep].color} text-white font-semibold rounded-lg hover:opacity-90 transition-opacity text-center`}
                onClick={() => {
                  if (currentStep === steps.length - 1) {
                    handleComplete();
                  }
                }}
              >
                {steps[currentStep].buttonText}
              </Link>

              {currentStep < steps.length - 1 ? (
                <button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Next: {steps[currentStep + 1].title}
                </button>
              ) : (
                <Link
                  href={isProfileComplete ? "/dashboard" : "/profile/edit"}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-center"
                  onClick={handleComplete}
                >
                  {isProfileComplete
                    ? "Go to Dashboard"
                    : "Complete Profile First"}
                </Link>
              )}
            </div>
          </div>

          {/* Footer with quick actions */}
          <div className="px-8 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center justify-between">
              <button
                onClick={handleSkipToDashboard}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
                Skip to Dashboard
              </button>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {currentStep + 1}/{steps.length}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
