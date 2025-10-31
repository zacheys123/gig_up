// components/SubscriptionCard.tsx
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
  Lock,
  Trophy,
  Gem,
} from "lucide-react";
import { useThemeColors } from "@/hooks/useTheme";
import { useSubscriptionUpdates } from "@/hooks/useSubscriptionUpdates";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import SubscriptionCardSkeleton from "../skeletons/SubscriptionSkeleton";

interface SubscriptionCardProps {
  plan: {
    name: string;
    price: string;
    features: string[];
    cta: string;
    current: boolean;
    comingSoon?: boolean;
    popular?: boolean;
  };
}

export function SubscriptionCard({ plan }: SubscriptionCardProps) {
  const { userId } = useAuth();
  const { colors } = useThemeColors();
  const { setSubscription } = useSubscriptionStore();
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { user } = useCurrentUser();

  const isPro = user?.tier === "pro";
  const isPremium = user?.tier === "premium";
  const isElite = user?.tier === "elite";

  if (!user?.tier) return <SubscriptionCardSkeleton isPro={isPro} />;

  const { subscriptionSuccess, subscriptionError } = useSubscriptionUpdates();
  const updateSubscription = useMutation(
    api.controllers.subscription.updateSubscription
  );

  const handleSubscriptionClick = () => {
    if (plan.comingSoon) return;

    if (!plan.current && plan.name !== "Free Tier") {
      setShowConfirmation(true);
    } else if (!plan.current) {
      handleSubscription();
    }
  };

  const handleSubscription = async () => {
    if (!userId || plan.comingSoon) return;

    setIsLoading(true);
    setShowConfirmation(false);

    try {
      const nextBillingDate = Date.now() + 30 * 24 * 60 * 60 * 1000;
      const tierName = plan.name.toLowerCase().split(" ")[0] as
        | "free"
        | "pro"
        | "premium"
        | "elite";

      const result = await updateSubscription({
        clerkId: userId,
        tier: tierName,
        tierStatus: "active",
        nextBillingDate: tierName !== "free" ? nextBillingDate : undefined,
      });

      if (result.success) {
        setSubscription({
          tier: tierName,
          status: "active",
          currentPeriodStart: Date.now(),
          currentPeriodEnd: nextBillingDate,
          cancelAtPeriodEnd: false,
          nextBillingDate: tierName !== "free" ? nextBillingDate : undefined,
        });

        // Show success notification
        subscriptionSuccess(tierName === "free" ? "downgraded" : "upgraded");
        console.log("Subscription updated successfully!");
      }
    } catch (error) {
      console.error("Failed to update subscription:", error);
      subscriptionError(
        "update",
        error instanceof Error ? error.message : undefined
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getTierConfig = () => {
    const tierName = plan.name.toLowerCase();
    if (tierName.includes("elite")) {
      return {
        gradient: "from-purple-600 via-pink-500 to-red-500",
        icon: Gem,
        iconColor: "text-purple-300",
        badgeColor: "from-purple-500 to-pink-600",
      };
    } else if (tierName.includes("premium")) {
      return {
        gradient: "from-blue-600 via-purple-500 to-indigo-500",
        icon: Trophy,
        iconColor: "text-blue-300",
        badgeColor: "from-blue-500 to-purple-600",
      };
    } else if (tierName.includes("pro")) {
      return {
        gradient: "from-green-600 via-teal-500 to-cyan-500",
        icon: Crown,
        iconColor: "text-yellow-300",
        badgeColor: "from-green-500 to-teal-600",
        popular: plan.popular,
      };
    } else {
      return {
        gradient: "",
        icon: Star,
        iconColor: "text-gray-400",
        badgeColor: "",
      };
    }
  };

  const tierConfig = getTierConfig();
  const TierIcon = tierConfig.icon;
  const isPaidPlan =
    plan.price !== "Free" && !plan.price.toLowerCase().includes("free");
  const isCurrentPlan = plan.current;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: plan.comingSoon ? 1 : 1.02 }}
        whileTap={{ scale: plan.comingSoon ? 1 : 0.98 }}
        className={`relative w-full rounded-2xl border transition-all duration-300 overflow-hidden group
          ${
            isPaidPlan
              ? `min-h-[460px] bg-gradient-to-br ${tierConfig.gradient} text-white shadow-lg border-transparent`
              : `${colors.card} ${colors.border} shadow-lg`
          } 
          ${isCurrentPlan ? "ring-2 ring-green-400" : ""}
          ${plan.comingSoon ? "opacity-60 grayscale" : ""}
          p-4 sm:p-6 md:p-8 lg:p-8
          min-h-[360px] sm:min-h-[520px] md:min-h-[560px]
        `}
      >
        {/* Animated background gradient for paid plans */}
        {isPaidPlan && (
          <div
            className={`absolute inset-0 bg-gradient-to-br ${tierConfig.gradient}/20`}
          />
        )}

        {/* Coming Soon Overlay */}
        {plan.comingSoon && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-30 flex items-center justify-center">
            <div className="text-center p-4">
              <Lock className="w-12 h-12 text-white mb-2 mx-auto" />
              <span className="text-white font-bold text-lg">Coming Soon</span>
            </div>
          </div>
        )}

        {/* Popular Badge */}
        {tierConfig.popular && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            className="absolute -top-2 sm:-top-3 left-1 transform z-10 pt-5"
          >
            <div
              className={`bg-gradient-to-r ${tierConfig.badgeColor} text-white px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg mt-4`}
            >
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

        {/* Header */}
        <div className="text-center mb-4 sm:mb-6 md:mb-8 relative z-20">
          <motion.div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div
              className={`p-2 sm:p-3 ${isPaidPlan ? "bg-white/20 backdrop-blur-sm" : colors.backgroundMuted} rounded-xl sm:rounded-2xl`}
            >
              <TierIcon
                className={`w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 ${isPaidPlan ? tierConfig.iconColor : "text-gray-400"}`}
              />
            </div>
            <h3
              className={`font-bold 
              ${isPaidPlan ? "text-white" : colors.text} 
              text-lg sm:text-xl md:text-2xl lg:text-2xl
            `}
            >
              {plan.name}
            </h3>
          </motion.div>

          <div className="mb-1 sm:mb-2">
            <span
              className={`font-black 
              ${isPaidPlan ? "text-white" : colors.primary}
              text-2xl sm:text-3xl md:text-4xl lg:text-4xl
            `}
            >
              {plan.price}
            </span>
            {isPaidPlan && (
              <span
                className={`font-medium ml-1
                ${isPaidPlan ? "text-yellow-100" : colors.textMuted}
                text-sm sm:text-base md:text-base
              `}
              >
                /month
              </span>
            )}
          </div>

          {isPaidPlan && (
            <p
              className={`text-xs sm:text-sm ${isPaidPlan ? "text-purple-100" : colors.textMuted}`}
            >
              Cancel anytime
            </p>
          )}
        </div>

        {/* Features List */}
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
                ${isPaidPlan ? "bg-green-500/20" : "bg-green-100"}
              `}
              >
                <Check
                  className={`w-3 h-3 sm:w-4 sm:h-4
                  ${isPaidPlan ? "text-green-300" : "text-green-600"}
                `}
                />
              </div>
              <span
                className={`leading-relaxed font-medium
                ${isPaidPlan ? "text-gray-100" : colors.text}
                text-xs sm:text-sm md:text-sm
                line-clamp-2
              `}
              >
                {feature}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Action Button */}
        <motion.button
          onClick={handleSubscriptionClick}
          disabled={isLoading || isCurrentPlan || plan.comingSoon}
          whileHover={{
            scale: isLoading || isCurrentPlan || plan.comingSoon ? 1 : 1.03,
          }}
          whileTap={{
            scale: isLoading || isCurrentPlan || plan.comingSoon ? 1 : 0.97,
          }}
          className={`w-full rounded-xl font-bold transition-all duration-300 relative overflow-hidden group
            ${
              isCurrentPlan
                ? "bg-gray-300 text-gray-500 cursor-not-allowed shadow-inner"
                : plan.comingSoon
                  ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                  : isPaidPlan
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
          {!isCurrentPlan && !plan.comingSoon && (
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
            <div className="flex items-center justify-center gap-2 sm:gap-3 relative z-10">
              <span className="font-semibold text-xs sm:text-sm">
                {plan.comingSoon ? "Coming Soon" : plan.cta}
              </span>
              {isPaidPlan && !isCurrentPlan && !plan.comingSoon && (
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <TierIcon className="w-4 h-4 sm:w-4 sm:h-4" />
                </motion.div>
              )}
            </div>
          )}
        </motion.button>

        {/* Savings badge for paid plans */}
        {isPaidPlan && !isCurrentPlan && !plan.comingSoon && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute -bottom-1 sm:-bottom-2 left-1/2 transform -translate-x-1/2 mt-[20px]"
          >
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-2 sm:px-3 py-1 rounded-full text-xs font-semibold shadow-lg whitespace-nowrap">
              {plan.name.includes("Elite")
                ? "🎉 Save 30%"
                : plan.name.includes("Premium")
                  ? "🎉 Save 25%"
                  : "🎉 Save 20%"}
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmation && (
          <ConfirmationModal
            plan={plan}
            isLoading={isLoading}
            onConfirm={handleSubscription}
            onCancel={() => setShowConfirmation(false)}
            colors={colors}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// Separate Confirmation Modal Component for better organization
function ConfirmationModal({
  plan,
  isLoading,
  onConfirm,
  onCancel,
  colors,
}: any) {
  const getTierIcon = (tierName: string) => {
    if (tierName.includes("Elite")) return Gem;
    if (tierName.includes("Premium")) return Trophy;
    if (tierName.includes("Pro")) return Crown;
    return Star;
  };

  const TierIcon = getTierIcon(plan.name);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onCancel}
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
              Confirm {plan.name.includes("Free") ? "Downgrade" : "Upgrade"}
            </h3>
          </div>
          <button
            onClick={onCancel}
            className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${colors.textMuted}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-4">
              <TierIcon className="w-8 h-8 text-yellow-500" />
              <span className={`text-2xl font-bold ${colors.primary}`}>
                {plan.name}
              </span>
            </div>

            <p className={`text-lg font-semibold mb-2 ${colors.text}`}>
              {plan.price}
            </p>

            <p className={`mb-4 ${colors.textMuted}`}>
              {plan.name.includes("Free")
                ? "You're about to downgrade to the Free plan"
                : `You're about to upgrade to our ${plan.name}`}
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
                  {plan.features
                    .slice(0, 3)
                    .map((feature: string, index: number) => (
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
            {plan.name.includes("Free")
              ? "Your premium features will be disabled immediately."
              : "Your subscription will auto-renew monthly. You can cancel anytime."}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold border transition-all duration-200 
                ${colors.border} ${colors.hoverBg} ${colors.text}
                hover:scale-105 active:scale-95
              `}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
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
                `Confirm ${plan.name.includes("Free") ? "Downgrade" : "Upgrade"}`
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
