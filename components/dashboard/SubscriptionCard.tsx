"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useSubscriptionStore } from "@/app/stores/useSubscriptionStore";
import {
  Check,
  Loader2,
  Crown,
  Star,
  Zap,
  Sparkles,
  X,
  AlertCircle,
} from "lucide-react";
import { useThemeColors } from "@/hooks/useTheme";

interface SubscriptionCardProps {
  plan: {
    name: string;
    price: string;
    features: string[];
    cta: string;
    current: boolean;
  };
}

export function SubscriptionCard({ plan }: SubscriptionCardProps) {
  const { userId } = useAuth();
  const { colors } = useThemeColors();
  const { setSubscription } = useSubscriptionStore();
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const updateSubscription = useMutation(
    api.controllers.subscription.updateSubscription
  );

  const handleSubscriptionClick = () => {
    if (plan.name.toLowerCase().includes("pro") && !plan.current) {
      setShowConfirmation(true);
    } else {
      handleSubscription();
    }
  };

  const handleSubscription = async () => {
    if (!userId) return;

    setIsLoading(true);
    setShowConfirmation(false);

    try {
      const nextBillingDate = Date.now() + 30 * 24 * 60 * 60 * 1000;

      const result = await updateSubscription({
        clerkId: userId,
        tier: plan.name.toLowerCase().includes("pro") ? "pro" : "free",
        tierStatus: "active",
        nextBillingDate,
      });

      if (result.success) {
        setSubscription({
          tier: plan.name.toLowerCase().includes("pro") ? "pro" : "free",
          status: "active",
          currentPeriodStart: Date.now(),
          currentPeriodEnd: nextBillingDate,
          cancelAtPeriodEnd: false,
          nextBillingDate,
        });

        console.log("Subscription updated successfully!");
      }
    } catch (error) {
      console.error("Failed to update subscription:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const isProPlan = plan.name.toLowerCase().includes("pro");
  const isCurrentPlan = plan.current;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`relative w-full rounded-2xl border transition-all duration-300 overflow-hidden group
          ${
            isProPlan
              ? " min-h-[460px] bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500 text-white shadow-lg shadow-purple-500/20 border-transparent"
              : `${colors.card} ${colors.border} shadow-lg`
          } 
          ${isCurrentPlan ? "ring-2 ring-green-400" : ""}
          p-4 sm:p-6 md:p-8 lg:p-8
          min-h-[360px] sm:min-h-[520px] md:min-h-[560px]
        `}
      >
        {/* Animated background gradient for Pro plan */}
        {isProPlan && (
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-pink-500/20 to-orange-500/20" />
        )}

        {/* Premium Badge - Responsive positioning */}
        {isProPlan && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            className="absolute -top-2 sm:-top-3 left-1 transform  z-10 pt-5"
          >
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs font-bold flex  items-center gap-1 shadow-lg mt-4">
              <Sparkles className="w-3 h-3 sm:w-3 sm:h-3" />
              <span className="text-xs sm:text-sm">POPULAR</span>
            </div>
          </motion.div>
        )}

        {/* Current Plan Badge */}
        {isCurrentPlan && (
          <div className="absolute -top-2 sm:-top-3 left-1 transform z-10 my-4">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg">
              <Check className="w-3 h-3" />
              <span className="text-xs">CURRENT</span>
            </div>
          </div>
        )}

        {/* Header - Responsive spacing */}
        <div className="text-center mb-4 sm:mb-6 md:mb-8 relative z-20">
          <motion.div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            {isProPlan ? (
              <div className="p-2 sm:p-3 bg-white/20 rounded-xl sm:rounded-2xl backdrop-blur-sm">
                <Crown className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-yellow-300" />
              </div>
            ) : (
              <div
                className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl ${colors.backgroundMuted}`}
              >
                <Star className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-gray-400" />
              </div>
            )}
            <h3
              className={`font-bold 
              ${isProPlan ? "text-white" : colors.text} 
              text-lg sm:text-xl md:text-2xl lg:text-2xl
            `}
            >
              {plan.name}
            </h3>
          </motion.div>

          <div className="mb-1 sm:mb-2">
            <span
              className={`font-black 
              ${isProPlan ? "text-white" : colors.primary}
              text-2xl sm:text-3xl md:text-4xl lg:text-4xl
            `}
            >
              {plan.price}
            </span>
            {plan.price !== "$0" && (
              <span
                className={`font-medium ml-1
                ${isProPlan ? "text-yellow-100" : colors.textMuted}
                text-sm sm:text-base md:text-base
              `}
              >
                /month
              </span>
            )}
          </div>

          {plan.price !== "$0" && (
            <p
              className={`text-xs sm:text-sm ${isProPlan ? "text-purple-100" : colors.textMuted}`}
            >
              Cancel anytime
            </p>
          )}
        </div>

        {/* Features List - Optimized for mobile */}
        <div className="space-y-2 sm:space-y-3 md:space-y-4 mb-4 sm:mb-6 md:mb-8 relative z-20">
          {plan.features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg transition-all duration-200 hover:bg-white/5"
            >
              <div
                className={`p-1 sm:p-1.5 rounded-full flex-shrink-0 mt-0.5
                ${isProPlan ? "bg-green-500/20" : "bg-green-100"}
              `}
              >
                <Check
                  className={`w-3 h-3 sm:w-4 sm:h-4
                  ${isProPlan ? "text-green-300" : "text-green-600"}
                `}
                />
              </div>
              <span
                className={`leading-relaxed font-medium
                ${isProPlan ? "text-gray-100" : colors.text}
                text-xs sm:text-sm md:text-sm
                line-clamp-2
              `}
              >
                {feature}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Action Button - Responsive sizing */}
        <motion.button
          onClick={handleSubscriptionClick}
          disabled={isLoading || isCurrentPlan}
          whileHover={{ scale: isLoading || isCurrentPlan ? 1 : 1.03 }}
          whileTap={{ scale: isLoading || isCurrentPlan ? 1 : 0.97 }}
          className={`w-full rounded-xl font-bold transition-all duration-300 relative overflow-hidden group
            ${
              isCurrentPlan
                ? "bg-gray-300 text-gray-500 cursor-not-allowed shadow-inner"
                : isProPlan
                  ? "bg-white text-purple-600 hover:bg-gray-50 shadow-md hover:shadow-lg"
                  : `bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:from-orange-600 hover:to-pink-600 shadow-md hover:shadow-lg`
            } 
            disabled:opacity-50 disabled:cursor-not-allowed
            py-3 sm:py-3 md:py-4 lg:py-4
            px-4 sm:px-4 md:px-6 lg:px-6
            text-sm sm:text-sm md:text-base lg:text-base
          `}
        >
          {/* Button shimmer effect */}
          {!isCurrentPlan && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
          )}

          {isLoading ? (
            <div className="flex items-center justify-center gap-2 sm:gap-3 relative z-10">
              <Loader2 className="w-4 h-4 sm:w-4 sm:h-4 animate-spin" />
              <span className="font-semibold text-xs sm:text-sm">
                Processing...
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 sm:gap-3 relative z-10 ">
              <span className="font-semibold text-xs sm:text-sm">
                {plan.cta}
              </span>
              {isProPlan && !isCurrentPlan && (
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Crown className="w-4 h-4 sm:w-4 sm:h-4" />
                </motion.div>
              )}
            </div>
          )}
        </motion.button>

        {/* Savings badge for Pro plan - Mobile optimized */}
        {isProPlan && !isCurrentPlan && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute -bottom-1 sm:-bottom-2 left-1/2 transform -translate-x-1/2  mt-[20px]"
          >
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-2 sm:px-3 py-1 rounded-full text-xs font-semibold shadow-lg whitespace-nowrap">
              🎉 Save 20%
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowConfirmation(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className={`relative w-full max-w-md rounded-2xl shadow-2xl ${colors.card} ${colors.border} border`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-500/20 rounded-full">
                    <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <h3 className={`text-xl font-bold ${colors.text}`}>
                    Confirm Upgrade
                  </h3>
                </div>
                <button
                  onClick={() => setShowConfirmation(false)}
                  className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${colors.textMuted}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Crown className="w-8 h-8 text-yellow-500" />
                    <span className={`text-2xl font-bold ${colors.primary}`}>
                      Pro Plan
                    </span>
                  </div>

                  <p className={`text-lg font-semibold mb-2 ${colors.text}`}>
                    {plan.price}
                  </p>

                  <p className={`mb-4 ${colors.textMuted}`}>
                    You're about to upgrade to our Pro plan
                  </p>
                </div>

                <div
                  className={`bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6`}
                >
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4
                        className={`font-semibold text-blue-800 dark:text-blue-300 mb-1`}
                      >
                        What you'll get:
                      </h4>
                      <ul className={`text-sm space-y-1 ${colors.textMuted}`}>
                        {plan.features.slice(0, 3).map((feature, index) => (
                          <li key={index}>• {feature}</li>
                        ))}
                        {plan.features.length > 3 && (
                          <li className="font-semibold text-blue-600 dark:text-blue-400">
                            + {plan.features.length - 3} more features
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className={`text-xs ${colors.textMuted} text-center mb-6`}>
                  Your subscription will auto-renew monthly. You can cancel
                  anytime.
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowConfirmation(false)}
                    className={`flex-1 py-3 px-4 rounded-xl font-semibold border transition-all duration-200 
                      ${colors.border} ${colors.hoverBg} ${colors.text}
                      hover:scale-105 active:scale-95
                    `}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubscription}
                    disabled={isLoading}
                    className="flex-1 py-3 px-4 rounded-xl font-semibold bg-gradient-to-r from-green-500 to-emerald-600 text-white 
                      hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl
                      transition-all duration-200 hover:scale-105 active:scale-95
                      disabled:opacity-50 disabled:cursor-not-allowed
                    "
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                      </div>
                    ) : (
                      `Confirm Upgrade`
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
