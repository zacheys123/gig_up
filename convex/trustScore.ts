// convex/trustTiers.ts - UPDATED VERSION
export const TRUST_TIERS = {
  newcomer: {
    minScore: 0,
    maxScore: 39,
    name: "Newcomer",
    emoji: "🌱",
    color: "text-gray-600 border-gray-600 bg-gray-600",
    bgColor: "bg-gray-100",
    description: "Just getting started on the platform",
    requirements: [
      "Recently joined",
      "Building their profile",
      "Earning first reviews",
    ],
    clientMessage: "New talent - Give them a chance!",
    musicianMessage: "Complete your profile and book your first gig!",
    features: ["Access to browse gigs", "Basic profile creation"],
    benefits: ["Welcome resources", "Basic support"],
  },

  basic: {
    minScore: 40,
    maxScore: 59,
    name: "Rising Star",
    emoji: "⭐",
    color: "text-blue-600 border-blue-600 bg-blue-600",
    bgColor: "bg-blue-100",
    description: "Active musician building reputation",
    requirements: [
      "Profile 50%+ complete",
      "At least 1 completed gig",
      "Phone verified",
      "No major issues",
    ],
    clientMessage: "Reliable beginner - Good for simple gigs",
    musicianMessage: "Book 3+ gigs to reach Verified tier",
    features: ["Basic messaging", "Apply for standard gigs"],
    benefits: ["Standard search ranking", "Messaging access"],
  },

  verified: {
    minScore: 60,
    maxScore: 74,
    name: "Verified",
    emoji: "✅",
    color: "text-green-600 border-green-600 bg-green-600",
    bgColor: "bg-green-100",
    description: "Trusted musician with proven track record",
    requirements: [
      "Identity verified",
      "3+ completed gigs",
      "4.0+ average rating",
      "Responsive to messages",
      "Payment method added",
    ],
    clientMessage: "Trusted professional - Safe choice",
    musicianMessage: "You're a trusted musician!",
    features: ["Premium gig access", "Direct client contact"],
    benefits: ["Verified badge", "Basic analytics"],
  },

  trusted: {
    minScore: 75,
    maxScore: 89,
    name: "Trusted Member",
    emoji: "🤝",
    color: "text-purple-600 border-purple-600 bg-purple-600",
    bgColor: "bg-purple-100",
    description: "Elite musician with excellent reputation",
    requirements: [
      "10+ completed gigs",
      "4.5+ average rating",
      "70%+ response rate",
      "Earned $500+ on platform",
      "No cancellations in last 30 days",
    ],
    clientMessage: "Elite performer - Highly recommended",
    musicianMessage: "You can now create bands and book for others!",
    features: ["Create bands", "Booker privileges", "Featured placement"],
    benefits: [
      "Higher search ranking",
      "Priority support",
      "Advanced analytics",
    ],
  },

  elite: {
    minScore: 90,
    maxScore: 100,
    name: "Elite Partner",
    emoji: "🏆",
    color: "text-yellow-600 border-yellow-600 bg-yellow-600",
    bgColor: "bg-yellow-100",
    description: "Top-tier professional musician",
    requirements: [
      "25+ completed gigs",
      "4.8+ average rating",
      "90%+ response rate",
      "Earned $2000+ on platform",
      "Featured in recommendations",
    ],
    clientMessage: "Star performer - Best of the best",
    musicianMessage: "You're a platform star!",
    features: ["Instant payouts", "Priority support", "Exclusive gigs"],
    benefits: [
      "Top search placement",
      "Dedicated account manager",
      "Premium promotion",
    ],
  },
};

export type TrustTier = (typeof TRUST_TIERS)[keyof typeof TRUST_TIERS];
export type TierName = keyof typeof TRUST_TIERS;

export function getTrustTier(score: number): TrustTier {
  const normalizedScore = Math.min(Math.max(score, 0), 100);

  if (normalizedScore >= 90) return TRUST_TIERS.elite;
  if (normalizedScore >= 75) return TRUST_TIERS.trusted;
  if (normalizedScore >= 60) return TRUST_TIERS.verified;
  if (normalizedScore >= 40) return TRUST_TIERS.basic;
  return TRUST_TIERS.newcomer;
}

export function getNextTier(score: number): TrustTier | null {
  const tiers = [40, 60, 75, 90];
  const nextScore = tiers.find((t) => t > score);
  return nextScore ? getTrustTier(nextScore) : null;
}

export function getTierProgress(score: number): number {
  const tier = getTrustTier(score);
  const nextTier = getNextTier(score);

  if (!nextTier) return 100;

  const tierRange = nextTier.minScore - tier.minScore;
  const progressInTier = score - tier.minScore;

  return Math.min((progressInTier / tierRange) * 100, 100);
}
