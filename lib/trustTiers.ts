// lib/trustTiers.ts
export interface TrustTier {
  id: string;
  name: string;
  emoji: string;
  color: string;
  bgColor: string;
  minScore: number;
  maxScore: number;
  description: string;
  requirements: string[];
  features: string[];
  benefits: string[];
  clientMessage: string;
  musicianMessage: string;
}

export const TRUST_TIERS: Record<string, TrustTier> = {
  newcomer: {
    id: "newcomer",
    name: "Newcomer",
    emoji: "🌱",
    color: "text-gray-600 border-gray-600",
    bgColor: "bg-gray-100",
    minScore: 0,
    maxScore: 39,
    description: "Just getting started on the platform",
    requirements: [
      "Recently joined",
      "Building their profile",
      "Earning first reviews",
    ],
    features: ["Access to browse gigs", "Basic profile creation"],
    benefits: ["Welcome resources", "Basic support"],
    clientMessage: "New talent - Give them a chance!",
    musicianMessage: "Complete your profile and book your first gig!",
  },
  rising_star: {
    id: "rising_star",
    name: "Rising Star",
    emoji: "⭐",
    color: "text-blue-600 border-blue-600",
    bgColor: "bg-blue-100",
    minScore: 40,
    maxScore: 59,
    description: "Active musician building reputation",
    requirements: [
      "Profile 50%+ complete",
      "At least 1 completed gig",
      "Phone verified",
      "No major issues",
    ],
    features: ["Basic messaging", "Apply for standard gigs"],
    benefits: ["Standard search ranking", "Messaging access"],
    clientMessage: "Reliable beginner - Good for simple gigs",
    musicianMessage: "Book 3+ gigs to reach Verified tier",
  },
  verified: {
    id: "verified",
    name: "Verified",
    emoji: "✅",
    color: "text-green-600 border-green-600",
    bgColor: "bg-green-100",
    minScore: 60,
    maxScore: 74,
    description: "Trusted musician with proven track record",
    requirements: [
      "Identity verified",
      "3+ completed gigs",
      "4.0+ average rating",
      "Responsive to messages",
      "Payment method added",
    ],
    features: ["Premium gig access", "Direct client contact"],
    benefits: ["Verified badge", "Basic analytics"],
    clientMessage: "Trusted professional - Safe choice",
    musicianMessage: "You're a trusted musician!",
  },
  trusted_member: {
    id: "trusted_member",
    name: "Trusted Member",
    emoji: "🤝",
    color: "text-purple-600 border-purple-600",
    bgColor: "bg-purple-100",
    minScore: 75,
    maxScore: 89,
    description: "Elite musician with excellent reputation",
    requirements: [
      "10+ completed gigs",
      "4.5+ average rating",
      "70%+ response rate",
      "Earned $500+ on platform",
      "No cancellations in last 30 days",
    ],
    features: ["Create bands", "Booker privileges", "Featured placement"],
    benefits: [
      "Higher search ranking",
      "Priority support",
      "Advanced analytics",
    ],
    clientMessage: "Elite performer - Highly recommended",
    musicianMessage: "You can now create bands and book for others!",
  },
  elite_partner: {
    id: "elite_partner",
    name: "Elite Partner",
    emoji: "🏆",
    color: "text-yellow-600 border-yellow-600",
    bgColor: "bg-yellow-100",
    minScore: 90,
    maxScore: 100,
    description: "Top-tier professional musician",
    requirements: [
      "25+ completed gigs",
      "4.8+ average rating",
      "90%+ response rate",
      "Earned $2000+ on platform",
      "Featured in recommendations",
    ],
    features: ["Instant payouts", "Priority support", "Exclusive gigs"],
    benefits: [
      "Top search placement",
      "Dedicated account manager",
      "Premium promotion",
    ],
    clientMessage: "Star performer - Best of the best",
    musicianMessage: "You're a platform star!",
  },
};

export function getTrustTier(score: number): TrustTier {
  const normalizedScore = Math.min(Math.max(score, 0), 100);

  if (normalizedScore >= 90) return TRUST_TIERS.elite_partner;
  if (normalizedScore >= 75) return TRUST_TIERS.trusted_member;
  if (normalizedScore >= 60) return TRUST_TIERS.verified;
  if (normalizedScore >= 40) return TRUST_TIERS.rising_star;
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

export function calculateTrustScore(user: any): number {
  let score = 0;

  // Profile completeness (max 25 points)
  if (user?.picture) score += 5;
  if (user?.instrument) score += 5;
  if (user?.bio) score += 5;
  if (user?.sampleWork) score += 5;
  if (user?.firstname && user?.lastname) score += 5;

  // Verification (max 25 points)
  if (user?.phoneVerified) score += 10;
  if (user?.emailVerified) score += 5;
  if (user?.identityVerified) score += 10;

  // Activity (max 30 points)
  const gigsCompleted = user?.gigsCompleted || 0;
  score += Math.min(gigsCompleted, 10) * 2; // 2 points per gig, max 20

  const avgRating = user?.avgRating || 0;
  score += Math.min(avgRating, 5); // 1 point per star rating

  const responseRate = user?.responseRate || 0;
  score += responseRate > 90 ? 5 : responseRate > 70 ? 3 : 0;

  // Payment (max 10 points)
  if (user?.mpesaPhoneNumber) score += 10;

  // Social proof (max 10 points)
  const reviewCount = user?.reviewCount || 0;
  score += Math.min(reviewCount, 5);

  const followers = user?.followers || 0;
  score += followers > 50 ? 5 : followers > 20 ? 3 : 0;

  return Math.min(score, 100);
}
