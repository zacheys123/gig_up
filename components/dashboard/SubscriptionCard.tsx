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
  Calendar,
  Users,
  FileText,
  Wand2,
  Palette,
  Globe,
  Shield,
  Headphones,
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

// Tier-specific feature highlights
const TIER_FEATURES = {
  free: {
    templates: "5+ Free Templates",
    creation: "Guided Creation",
    customization: "Basic Fields",
    support: "Standard Support",
    icon: Star,
    color: "from-gray-400 to-gray-600",
  },
  pro: {
    templates: "50+ Pro Templates",
    creation: "Custom Creation",
    customization: "Advanced Fields",
    support: "Priority Support",
    icon: Crown,
    color: "from-green-500 to-emerald-600",
  },
  premium: {
    templates: "All Templates + Scratch",
    creation: "Start from Scratch",
    customization: "Complete Freedom",
    support: "White-Glove Support",
    icon: Trophy,
    color: "from-blue-500 to-purple-600",
  },
  elite: {
    templates: "Everything + AI Features",
    creation: "AI-Powered Creation",
    customization: "Unlimited Everything",
    support: "Dedicated Manager",
    icon: Gem,
    color: "from-purple-600 to-pink-600",
  },
};

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
    api.controllers.subscription.updateSubscription,
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

        subscriptionSuccess(tierName === "free" ? "downgraded" : "upgraded");
        console.log("Subscription updated successfully!");
      }
    } catch (error) {
      console.error("Failed to update subscription:", error);
      subscriptionError(
        "update",
        error instanceof Error ? error.message : undefined,
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
        iconColor: "text-purple-200",
        badgeColor: "from-purple-500 to-pink-600",
        glow: "shadow-purple-500/25",
        tierFeatures: TIER_FEATURES.elite,
      };
    } else if (tierName.includes("premium")) {
      return {
        gradient: "from-blue-600 via-purple-500 to-indigo-600",
        icon: Trophy,
        iconColor: "text-blue-200",
        badgeColor: "from-blue-500 to-purple-600",
        glow: "shadow-blue-500/25",
        tierFeatures: TIER_FEATURES.premium,
      };
    } else if (tierName.includes("pro")) {
      return {
        gradient: "from-green-500 via-emerald-500 to-teal-600",
        icon: Crown,
        iconColor: "text-green-200",
        badgeColor: "from-green-500 to-teal-600",
        glow: "shadow-green-500/25",
        tierFeatures: TIER_FEATURES.pro,
        popular: plan.popular,
      };
    } else {
      return {
        gradient: "from-gray-400 to-gray-600",
        icon: Star,
        iconColor: "text-gray-300",
        badgeColor: "from-gray-400 to-gray-500",
        glow: "shadow-gray-400/20",
        tierFeatures: TIER_FEATURES.free,
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
        className={`relative w-full rounded-3xl border transition-all duration-300 overflow-hidden group
          ${
            isPaidPlan
              ? `min-h-[520px] bg-gradient-to-br ${tierConfig.gradient} text-white shadow-2xl ${tierConfig.glow} border-transparent`
              : `${colors.card} ${colors.border} shadow-xl ${colors.shadow}`
          } 
          ${isCurrentPlan ? "ring-3 ring-green-400 ring-opacity-50" : ""}
          ${plan.comingSoon ? "opacity-60 grayscale cursor-not-allowed" : "cursor-pointer"}
          p-6 sm:p-8
          min-h-[480px] sm:min-h-[520px] lg:min-h-[560px]
          flex flex-col
        `}
      >
        {/* Animated background gradient for paid plans */}
        {isPaidPlan && (
          <div className="absolute inset-0 bg-gradient-to-br opacity-10 from-white/20 to-transparent" />
        )}

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] bg-[length:20px_20px] opacity-20" />

        {/* Coming Soon Overlay */}
        {plan.comingSoon && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-30 flex items-center justify-center rounded-3xl">
            <div className="text-center p-6">
              <Lock className="w-16 h-16 text-white mb-4 mx-auto opacity-80" />
              <span className="text-white font-bold text-xl tracking-wide">
                Coming Soon
              </span>
              <p className="text-white/70 text-sm mt-2 max-w-xs">
                We're working on something amazing
              </p>
            </div>
          </div>
        )}

        {/* Popular Badge */}
        {tierConfig.popular && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            className="absolute -top-3 -right-3 z-20"
          >
            <div
              className={`bg-gradient-to-r ${tierConfig.badgeColor} text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 shadow-lg rotate-12`}
            >
              <Sparkles className="w-3 h-3" />
              <span className="text-xs">MOST POPULAR</span>
            </div>
          </motion.div>
        )}

        {/* Current Plan Badge */}
        {isCurrentPlan && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-20"
          >
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 shadow-lg">
              <Check className="w-3 h-3" />
              <span className="text-xs">CURRENT PLAN</span>
            </div>
          </motion.div>
        )}

        {/* Header Section */}
        <div className="text-center mb-6 relative z-20">
          <motion.div className="flex items-center justify-center gap-3 mb-4">
            <div
              className={`p-3 rounded-2xl ${
                isPaidPlan
                  ? "bg-white/20 backdrop-blur-sm border border-white/30"
                  : `${colors.backgroundMuted} ${colors.border} border`
              }`}
            >
              <TierIcon
                className={`w-6 h-6 sm:w-7 sm:h-7 ${
                  isPaidPlan ? tierConfig.iconColor : colors.textMuted
                }`}
              />
            </div>
            <h3
              className={`font-bold tracking-tight
              ${isPaidPlan ? "text-white" : colors.text} 
              text-xl sm:text-xl
            `}
            >
              {plan.name}
            </h3>
          </motion.div>

          <div className="mb-2">
            <span
              className={`font-black tracking-tight
              ${isPaidPlan ? "text-white" : colors.primary}
              text-3xl sm:text-4xl
            `}
            >
              {plan.price}
            </span>
            {isPaidPlan && (
              <span
                className={`font-medium ml-2
                ${isPaidPlan ? "text-white/80" : colors.textMuted}
                text-base
              `}
              >
                /month
              </span>
            )}
          </div>

          {isPaidPlan && (
            <p
              className={`text-sm ${isPaidPlan ? "text-white/70" : colors.textMuted}`}
            >
              Cancel anytime • No hidden fees
            </p>
          )}
        </div>

        {/* Tier Feature Highlights */}
        <div className="grid grid-cols-2 gap-3 mb-6 relative z-20">
          {[
            { icon: FileText, label: tierConfig.tierFeatures.templates },
            { icon: Wand2, label: tierConfig.tierFeatures.creation },
            { icon: Palette, label: tierConfig.tierFeatures.customization },
            { icon: Headphones, label: tierConfig.tierFeatures.support },
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center gap-2 p-2 rounded-xl text-xs font-medium ${
                isPaidPlan
                  ? "bg-white/10 backdrop-blur-sm border border-white/20"
                  : `${colors.backgroundMuted} ${colors.border} border`
              }`}
            >
              <item.icon
                className={`w-3 h-3 flex-shrink-0 ${
                  isPaidPlan ? "text-white/80" : colors.textMuted
                }`}
              />
              <span
                className={`leading-tight ${
                  isPaidPlan ? "text-white/90" : colors.text
                }`}
              >
                {item.label}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Features List */}
        <div className="space-y-3 mb-6 flex-1 relative z-20">
          {plan.features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-start gap-3 p-3 rounded-xl transition-all duration-200 group hover:scale-[1.02]"
            >
              <div
                className={`p-1.5 rounded-full flex-shrink-0 mt-0.5 ${
                  isPaidPlan
                    ? "bg-green-400/20 border border-green-400/30"
                    : "bg-green-100 border border-green-200"
                }`}
              >
                <Check
                  className={`w-3 h-3 ${
                    isPaidPlan ? "text-green-300" : "text-green-600"
                  }`}
                />
              </div>
              <span
                className={`leading-relaxed font-medium text-sm
                ${isPaidPlan ? "text-gray-100" : colors.text}
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
            scale: isLoading || isCurrentPlan || plan.comingSoon ? 1 : 1.05,
            y: isLoading || isCurrentPlan || plan.comingSoon ? 0 : -2,
          }}
          whileTap={{
            scale: isLoading || isCurrentPlan || plan.comingSoon ? 1 : 0.95,
          }}
          className={`w-full rounded-2xl font-bold transition-all duration-300 relative overflow-hidden group
            ${
              isCurrentPlan
                ? "bg-gray-300 text-gray-500 cursor-not-allowed shadow-inner"
                : plan.comingSoon
                  ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                  : isPaidPlan
                    ? "bg-white text-gray-900 hover:bg-gray-50 shadow-lg hover:shadow-xl border border-white/30"
                    : `bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:from-orange-600 hover:to-pink-600 shadow-lg hover:shadow-xl`
            } 
            disabled:opacity-50 disabled:cursor-not-allowed
            py-4 px-6
            text-base font-semibold
          `}
        >
          {/* Button shimmer effect */}
          {!isCurrentPlan && !plan.comingSoon && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
          )}

          {isLoading ? (
            <div className="flex items-center justify-center gap-3 relative z-10">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="font-semibold">Processing...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-3 relative z-10">
              <span className="font-semibold tracking-wide">
                {plan.comingSoon ? "Coming Soon" : plan.cta}
              </span>
              {isPaidPlan && !isCurrentPlan && !plan.comingSoon && (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <TierIcon className="w-5 h-5" />
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
            className="text-center mt-4"
          >
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white/90 px-3 py-1.5 rounded-full text-xs font-medium border border-white/30">
              <Sparkles className="w-3 h-3" />
              {plan.name.includes("Elite")
                ? "🎉 Save 30% vs monthly"
                : plan.name.includes("Premium")
                  ? "🎉 Save 25% vs monthly"
                  : "🎉 Save 20% vs monthly"}
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
            tierConfig={tierConfig}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// Enhanced Confirmation Modal
function ConfirmationModal({
  plan,
  isLoading,
  onConfirm,
  onCancel,
  colors,
  tierConfig,
}: any) {
  const getTierIcon = (tierName: string) => {
    if (tierName.includes("Elite")) return Gem;
    if (tierName.includes("Premium")) return Trophy;
    if (tierName.includes("Pro")) return Crown;
    return Star;
  };

  const TierIcon = getTierIcon(plan.name);
  const isUpgrade = !plan.name.includes("Free");

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
        className={`relative w-full max-w-md rounded-3xl shadow-2xl ${colors.card} ${colors.border} border overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header with Gradient */}
        <div
          className={`bg-gradient-to-r ${tierConfig.gradient} p-6 text-white`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold">
                Confirm {isUpgrade ? "Upgrade" : "Downgrade"}
              </h3>
            </div>
            <button
              onClick={onCancel}
              className="p-2 rounded-full hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <TierIcon className="w-8 h-8 text-yellow-500" />
              <span className={`text-xl font-bold ${colors.primary}`}>
                {plan.name}
              </span>
            </div>

            <p className={`text-lg font-semibold mb-2 ${colors.text}`}>
              {plan.price}
              {isUpgrade && <span className="text-sm ml-1">/month</span>}
            </p>

            <p className={`mb-4 ${colors.textMuted}`}>
              {isUpgrade
                ? `You're about to upgrade to ${plan.name}`
                : "You're about to downgrade to the Free plan"}
            </p>
          </div>

          {/* Key Features Highlight */}
          <div
            className={`rounded-2xl p-4 mb-6 ${colors.infoBg} ${colors.infoBorder} border`}
          >
            <h4
              className={`font-semibold ${colors.infoText} mb-3 flex items-center gap-2`}
            >
              <Check className="w-4 h-4" />
              What you'll unlock:
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {[
                tierConfig.tierFeatures.templates,
                tierConfig.tierFeatures.creation,
                tierConfig.tierFeatures.customization,
                tierConfig.tierFeatures.support,
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                  <span className={colors.textMuted}>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div
            className={`text-xs ${colors.textMuted} text-center mb-6 p-3 rounded-xl ${colors.backgroundMuted}`}
          >
            {isUpgrade
              ? "Your subscription will auto-renew monthly. You can cancel anytime."
              : "Your premium features will be disabled immediately."}
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
              className={`flex-1 py-3 px-4 rounded-xl font-semibold bg-gradient-to-r ${tierConfig.gradient} text-white 
                shadow-lg hover:shadow-xl
                transition-all duration-200 hover:scale-105 active:scale-95
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </div>
              ) : (
                `Confirm ${isUpgrade ? "Upgrade" : "Downgrade"}`
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
