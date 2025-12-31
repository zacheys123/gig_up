Trust Score System Documentation
Overview

The Trust Score System is a dual-measurement reputation system that combines a detailed 0-100 numerical score with a user-friendly 0.5-5.0 star rating. This dual approach provides both precise calculation capabilities for the backend and intuitive display for users.
Dual Measurement System

1. Trust Score (0-100)

   Purpose: Detailed backend calculation and feature gating

   Range: 0-100 (higher is better)

   Usage: Algorithmic calculations, feature eligibility checks, data analysis

2. Trust Stars (0.5-5.0)

   Purpose: User-facing visual representation

   Range: 0.5-5.0 stars with half-star increments

   Usage: UI display, user comprehension, simplified feature requirements

How Scores Are Calculated
Scoring Categories (Section-Based System)

The 100-point score is divided into 6 categories with caps:
Category Max Points Description
Profile 25 points Basic profile completeness and verification
Activity 40 points Platform usage and engagement
Quality 20 points Performance metrics and ratings
Content 15 points User-generated content quality
Social 10 points Social connections and tier
Longevity 10 points Account age and activity history
TOTAL 100 points
Penalty System

Users can lose points for negative behaviors:
Penalty Reason Max Deduction Examples
Account Ban 100 points Immediate zero score
Suspension 20 points Temporary account suspension
Reports 15 points User reports from community
Gig Cancellations 10 points Canceling booked gigs
No-shows 20 points Missing scheduled gigs
Slow Responses 5 points Response time >72 hours
Late Payments 15 points Delayed payments
Disputes 12 points Payment/quality disputes
Low Ratings 15 points Average rating <3.0
Trust Tiers

Based on scores, users are categorized into 5 tiers:
Tier Score Range Stars Description
New 0-29 0.5-1.5⭐ New users getting started
Basic 30-49 2.0-2.5⭐ Active, basic profile complete
Verified 50-64 3.0-3.5⭐ Established, reliable members
Trusted 65-79 4.0-4.5⭐ Highly reliable, trusted members
Elite 80-100 5.0⭐ Top-rated professionals
FEATURE_SCORE_THRESHOLDS Explained

This is the core of feature gating - it determines what actions users can perform based on their trust score:
Feature Unlock Progression
typescript

export const FEATURE_SCORE_THRESHOLDS = {
canPostBasicGigs: 10, // New users can start posting gigs
canMessageUsers: 20, // Basic communication allowed
canVerifiedBadge: 40, // Auto-verification at this score
canCompete: 45, // Can join competitions
canAccessAnalytics: 50, // Access to performance analytics
canPostPremiumGigs: 55, // Can post high-value gigs
canBeDual: 60, // Can have multiple roles (musician+client)
canVideoCall: 65, // Can use video calls for interviews
canCreateBand: 70, // Musicians can create bands
canHireTeams: 75, // Can hire teams for large projects
canVerifyOthers: 80, // Can vouch for other users
canModerate: 85, // Can help moderate community
canBetaFeatures: 90, // Access to experimental features
};

Corresponding Star Thresholds

For UI display, these convert to star ratings:
typescript

export const FEATURE_STAR_THRESHOLDS = {
canPostBasicGigs: 1.0, // 1 star - basic posting
canMessageUsers: 2.0, // 2 stars - communication
canVerifiedBadge: 3.0, // 3 stars - auto-verified
canCompete: 3.5, // 3.5 stars - competition access
canPostPremiumGigs: 3.5, // 3.5 stars - premium gigs
canAccessAnalytics: 3.5, // 3.5 stars - analytics
canBeDual: 4.0, // 4 stars - dual roles
canVideoCall: 4.0, // 4 stars - video calls
canCreateBand: 4.5, // 4.5 stars - band creation
canHireTeams: 4.5, // 4.5 stars - team hiring
canVerifyOthers: 5.0, // 5 stars - verification power
canModerate: 5.0, // 5 stars - moderation rights
canBetaFeatures: 5.0, // 5 stars - beta access
};

How Points Are Earned (Detailed Breakdown)
Profile Points (25 max)

    First Name: 2 points

    Last Name: 2 points

    City: 2 points

    Phone: 2 points

    Profile Picture: 3 points

    M-Pesa Phone: 5 points (payment verification)

    Onboarding Complete: 2 points

    Role Type: 3 points (musician/client/booker)

Activity Points (40 max)

For Musicians:

    Each completed gig: 1.5 points (max 20 points)

    Fast response time (<24h): 3 points

For Clients:

    Each gig posted: 0.5 points (max 10 points)

For Bookers:

    Each artist managed: 1 point (max 10 points)

    Each band managed: 1.5 points (max 10 points)

    Each successful booking: 0.5 points (max 10 points)

Quality Points (20 max)

For Musicians (based on rating):

    4.8+ rating: 15 points

    4.5-4.79: 10 points

    4.0-4.49: 5 points

    3.5-3.99: 2 points

    Any rating: 1 point

For Clients (based on completion rate):

    100% completion: 15 points

    90-99%: 10 points

    80-89%: 7 points

    70-79%: 4 points

    60-69%: 2 points

    Any completions: 1 point

Content Points (15 max)

    Bio: 3 points

    Organization/Company: 2 points

    Skills/Genres: 2 points

    Instrument: 1 point

    Video presence: 2-5 points (based on count/engagement)

    Profile video: 2 points

    Gig videos: 1-2 points

Social Points (10 max)

    5+ followers: 1 point

    20+ followers: 1 point

    50+ followers: 2 points

    100+ followers: 4 points

    Tier bonuses: Free=1, Pro=2, Premium=3, Elite=5 points

Longevity Points (10 max)

Account Age:

    2+ years: 5 points

    1-2 years: 4 points

    6-12 months: 3 points

    3-6 months: 2 points

    1-3 months: 1 point

Recent Activity:

    Active today: 3 points

    Active this week: 2 points

    Active this month: 1 point

Auto-Features & Badges

The system automatically grants features and badges:
Auto-Verification

    Trigger: Score reaches 40

    Action: verified badge granted automatically

    Method: trust_score_auto

Band Creation

    Trigger: Musician score reaches 70

    Action: band_leader badge and band creation unlocked

    Timestamp: bandCreationUnlockedAt recorded

Video Calls

    Trigger: Score reaches 65

    Action: Video call feature unlocked

    Timestamp: videoCallUnlockedAt recorded

Real-World Examples
Example 1: New Musician (Score: 15)
text

Profile: First name (2) + City (2) + Phone (2) = 6
Activity: 0 gigs = 0
Quality: No ratings = 0
Content: No bio/videos = 0
Social: 0 followers = 0
Longevity: 1 month (1) + Active today (3) = 4
TOTAL: 10 points → 1.0 stars
Features: Can post basic gigs

Example 2: Established Client (Score: 52)
text

Profile: Complete (25)
Activity: 10 gigs posted (5)
Quality: 90% completion (10) + 4.7 rating (3) = 13
Content: Organization (2) = 2
Social: 30 followers (2) + Pro tier (2) = 4
Longevity: 2 years (5) + Active this week (2) = 7
Penalties: 1 cancellation (-2)
TOTAL: 52 points → 3.0 stars
Features: Verified, can access analytics, can compete

Example 3: Elite Musician (Score: 88)
text

Profile: Complete (25)
Activity: 25 gigs completed (20) + Fast responses (3) = 23
Quality: 4.9 rating (15)
Content: Bio (3) + Videos (8) = 11
Social: 150 followers (4) + Elite tier (5) = 9
Longevity: 3 years (5) + Daily activity (3) = 8
Penalties: None
TOTAL: 88 points → 5.0 stars
Features: ALL features unlocked, can verify others, can moderate

Usage in Application
Checking Feature Access
typescript

const { canAccess } = useTrustScore();

if (canAccess("canCreateBand")) {
// Show band creation button
}

if (canAccess("canVideoCall")) {
// Enable video call feature
}

Displaying Scores
typescript

const { trustScore, trustStars, tier } = useTrustScore();

// Show detailed score for analytics

<p>Detailed Score: {trustScore}/100</p>

// Show stars for users
<Stars rating={trustStars} />

// Show tier badge
<Badge variant={tier}>{tier.toUpperCase()}</Badge>

Improvement Tips
typescript

const { improvements } = useTrustScore();

improvements.map(improvement => (
<ImprovementTip 
    action={improvement.action}
    points={improvement.points}
    category={improvement.category}
  />
));

Business Benefits

    Reduced Risk: Higher trust = lower scam/fraud risk

    Quality Control: Encourages professional behavior

    User Retention: Clear progression path keeps users engaged

    Feature Monetization: Can tie premium features to trust levels

    Community Moderation: Trusted users help moderate

Technical Implementation Notes

    Real-time Updates: Scores recalculate on significant user actions

    Caching: Scores cached with trustScoreLastUpdated timestamp

    Bulk Operations: bulkInitializeTrustScores for migration

    Backward Compatibility: Maintains both old and new scoring systems

    Type Safety: Full TypeScript support with strict types

Monitoring & Analytics
typescript

// Track score distribution
const leaderboard = useQuery(api.controllers.trustScore.getTrustLeaderboard);

// Monitor feature adoption
const eligibleUsers = useQuery(
api.controllers.trustScore.getUsersEligibleForFeature,
{ feature: "canCreateBand" }
);

This system creates a virtuous cycle: good behavior → higher trust → more features → more opportunities → better behavior.

in my client how do i use the threshold like canCompete

You can use the trust score thresholds in your client application through the useTrustScore hook. Here's how:
Basic Usage:
typescript

// components/CompetitionEntry.tsx
import { useTrustScore } from "@/hooks/useTrustScore";
import { Button } from "@/components/ui/button";
import { Lock, Trophy } from "lucide-react";

export default function CompetitionEntry() {
const { trustStars, canAccess, trustScore, improvements } = useTrustScore();

if (!canAccess("canCompete")) {
return (

<div className="border rounded-lg p-6 bg-gradient-to-r from-gray-50 to-gray-100">
<div className="flex items-center justify-between mb-4">
<div className="flex items-center gap-3">
<div className="p-2 bg-amber-100 rounded-lg">
<Lock className="w-5 h-5 text-amber-600" />
</div>
<div>
<h3 className="font-semibold text-lg">Join Competition</h3>
<p className="text-sm text-gray-500">
Unlock competitions by improving your trust score
</p>
</div>
</div>
<div className="flex items-center gap-2">
<span className="text-2xl font-bold text-amber-600">
{trustStars.toFixed(1)}⭐
</span>
<span className="text-sm text-gray-500">/{FEATURE_STAR_THRESHOLDS.canCompete}⭐</span>
</div>
</div>

        <div className="space-y-4">
          <div className="bg-white rounded-lg p-4 border">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">Current Trust Score</span>
              <span className="font-bold">{trustScore}/100</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-amber-400 to-amber-600 h-2 rounded-full"
                style={{ width: `${(trustScore / FEATURE_SCORE_THRESHOLDS.canCompete) * 100}%` }}
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Need {FEATURE_SCORE_THRESHOLDS.canCompete} points to compete
              ({FEATURE_SCORE_THRESHOLDS.canCompete - trustScore} more points needed)
            </p>
          </div>

          <div className="bg-white rounded-lg p-4 border">
            <h4 className="font-medium mb-3">Quick ways to earn points:</h4>
            <div className="space-y-2">
              {improvements
                .filter(imp => imp.points >= 5)
                .slice(0, 3)
                .map((improvement, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span className="text-sm">{improvement.action}</span>
                    </div>
                    <span className="text-sm font-medium text-green-600">
                      +{improvement.points} pts
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    );

}

// User CAN compete
return (

<div className="border rounded-lg p-6 bg-gradient-to-r from-green-50 to-emerald-100">
<div className="flex items-center justify-between mb-6">
<div className="flex items-center gap-3">
<div className="p-2 bg-green-100 rounded-lg">
<Trophy className="w-6 h-6 text-green-600" />
</div>
<div>
<h3 className="font-bold text-xl">Join Competition</h3>
<p className="text-green-600">
Your trust score of {trustStars.toFixed(1)}⭐ qualifies you!
</p>
</div>
</div>
<div className="flex items-center gap-2">
<span className="text-3xl font-bold text-green-700">
{trustStars.toFixed(1)}⭐
</span>
</div>
</div>

      <Button className="w-full py-6 text-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
        Enter Competition Now
      </Button>
    </div>

);
}

Conditional UI Components:
typescript

// components/TrustBasedFeature.tsx
import { useTrustScore } from "@/hooks/useTrustScore";
import { Badge } from "@/components/ui/badge";

export function TrustBasedFeature({ featureName }: { featureName: FeatureName }) {
const { canAccess, trustStars, getStarsNeeded, getScoreNeeded } = useTrustScore();
const isEligible = canAccess(featureName);
const starsNeeded = getStarsNeeded(featureName);
const scoreNeeded = getScoreNeeded(featureName);

if (isEligible) {
return <FeatureContent />;
}

return (

<div className="relative">
{/_ Blurred overlay for locked content _/}
<div className="blur-sm pointer-events-none">
<FeatureContent />
</div>

      {/* Lock overlay */}
      <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
        <div className="bg-white p-6 rounded-lg max-w-sm text-center">
          <div className="text-4xl mb-2">🔒</div>
          <h3 className="font-bold text-lg mb-2">Feature Locked</h3>
          <p className="text-gray-600 mb-4">
            This feature requires {starsNeeded} stars ({scoreNeeded} points)
          </p>
          <div className="flex items-center justify-center gap-2 mb-4">
            <Badge variant="outline">Your Stars: {trustStars.toFixed(1)}⭐</Badge>
            <Badge variant="secondary">Required: {starsNeeded}⭐</Badge>
          </div>
          <Button variant="outline" onClick={() => router.push("/profile/improve")}>
            Improve Your Score
          </Button>
        </div>
      </div>
    </div>

);
}

Trust Score Dashboard:
typescript

// components/TrustDashboard.tsx
import { useTrustScore } from "@/hooks/useTrustScore";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TrustDashboard() {
const {
trustScore,
trustStars,
tier,
canAccess,
improvements,
nextFeature
} = useTrustScore();

// Define all features in order of thresholds
const features = [
{ name: "Post Basic Gigs", key: "canPostBasicGigs", score: 10 },
{ name: "Message Users", key: "canMessageUsers", score: 20 },
{ name: "Get Verified", key: "canVerifiedBadge", score: 40 },
{ name: "Enter Competitions", key: "canCompete", score: 45 },
{ name: "View Analytics", key: "canAccessAnalytics", score: 50 },
{ name: "Post Premium Gigs", key: "canPostPremiumGigs", score: 55 },
{ name: "Dual Role", key: "canBeDual", score: 60 },
{ name: "Video Calls", key: "canVideoCall", score: 65 },
{ name: "Create Bands", key: "canCreateBand", score: 70 },
{ name: "Hire Teams", key: "canHireTeams", score: 75 },
{ name: "Verify Others", key: "canVerifyOthers", score: 80 },
{ name: "Moderate", key: "canModerate", score: 85 },
{ name: "Beta Features", key: "canBetaFeatures", score: 90 },
];

return (

<div className="space-y-6">
{/_ Current Status Card _/}
<Card>
<CardHeader>
<CardTitle>Your Trust Status</CardTitle>
</CardHeader>
<CardContent>
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
<div className="text-center">
<div className="text-5xl font-bold mb-2">{trustStars.toFixed(1)}</div>
<div className="text-2xl">⭐</div>
<p className="text-sm text-gray-500 mt-2">Trust Stars</p>
</div>
<div className="text-center">
<div className="text-5xl font-bold mb-2">{trustScore}</div>
<div className="text-sm">/ 100</div>
<p className="text-sm text-gray-500 mt-2">Detailed Score</p>
</div>
<div className="text-center">
<div className="text-3xl font-bold mb-2 capitalize">{tier}</div>
<Badge variant={tier === "elite" ? "default" : "outline"}>
{tier.toUpperCase()} TIER
</Badge>
<p className="text-sm text-gray-500 mt-2">Current Tier</p>
</div>
</div>
</CardContent>
</Card>

      {/* Features Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Unlocks</CardTitle>
          {nextFeature && (
            <p className="text-sm text-gray-500">
              Next unlock: {nextFeature.feature} at {nextFeature.threshold} points
            </p>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {features.map((feature) => {
              const isUnlocked = canAccess(feature.key as FeatureName);
              const isNext = nextFeature?.feature === feature.key;

              return (
                <div key={feature.key} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {isUnlocked ? (
                      <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                        <Check className="w-4 h-4 text-green-600" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                        <Lock className="w-4 h-4 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <span className={`font-medium ${isNext ? "text-blue-600" : ""}`}>
                        {feature.name}
                      </span>
                      <p className="text-xs text-gray-500">
                        {feature.score} points required
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isNext && (
                      <Badge variant="outline" className="bg-blue-50">
                        Next
                      </Badge>
                    )}
                    <span className={`text-sm ${isUnlocked ? "text-green-600" : "text-gray-400"}`}>
                      {isUnlocked ? "Unlocked" : "Locked"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Progress Bar to Next Feature */}
      {nextFeature && (
        <Card>
          <CardHeader>
            <CardTitle>Progress to {nextFeature.feature}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Current: {trustScore} points</span>
                <span>Target: {nextFeature.threshold} points</span>
              </div>
              <Progress
                value={(trustScore / nextFeature.threshold) * 100}
                className="h-3"
              />
              <p className="text-center text-sm text-gray-600">
                {nextFeature.pointsNeeded} more points needed
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Improvement Tips */}
      {improvements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Improvement Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {improvements.slice(0, 4).map((tip, index) => (
                <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium">{tip.action}</span>
                    <Badge variant="secondary">+{tip.points}</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{tip.category}</p>
                  {tip.current !== undefined && tip.max !== undefined && (
                    <Progress
                      value={(tip.current / tip.max) * 100}
                      className="h-2"
                    />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>

);
}

Guard Components for Pages/Routes:
typescript

// components/TrustGuard.tsx
import { useTrustScore } from "@/hooks/useTrustScore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function TrustGuard({
children,
requiredFeature
}: {
children: React.ReactNode;
requiredFeature: FeatureName;
}) {
const { canAccess, trustStars } = useTrustScore();
const router = useRouter();

useEffect(() => {
if (!canAccess(requiredFeature)) {
router.push("/trust-required");
}
}, [canAccess, requiredFeature, router]);

if (!canAccess(requiredFeature)) {
return null; // Or loading skeleton
}

return <>{children}</>;
}

// Usage in page:
export default function CompetitionPage() {
return (
<TrustGuard requiredFeature="canCompete">
<CompetitionPageContent />
</TrustGuard>
);
}

API Integration Example:
typescript

// services/competitionService.ts
import { useTrustScore } from "@/hooks/useTrustScore";

export function useCompetition() {
const { canAccess, trustScore } = useTrustScore();

const enterCompetition = async (competitionId: string) => {
if (!canAccess("canCompete")) {
throw new Error(`You need at least ${FEATURE_SCORE_THRESHOLDS.canCompete} points to enter competitions. Current: ${trustScore}`);
}

    try {
      const response = await fetch(`/api/competitions/${competitionId}/enter`, {
        method: "POST",
      });
      return response.json();
    } catch (error) {
      throw error;
    }

};

return { enterCompetition };
}

Real-time Updates:
typescript

// components/TrustScoreBadge.tsx
import { useTrustScore } from "@/hooks/useTrustScore";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function TrustScoreBadge() {
const { trustStars, tier } = useTrustScore();

return (
<Tooltip>
<TooltipTrigger asChild>
<Badge 
          variant="outline" 
          className="cursor-pointer hover:bg-gray-50"
        >

<div className="flex items-center gap-1">
<span className="text-yellow-500">⭐</span>
<span>{trustStars.toFixed(1)}</span>
</div>
</Badge>
</TooltipTrigger>
<TooltipContent>
<div className="space-y-2">
<div className="font-semibold capitalize">{tier} Tier</div>
<div className="text-sm">
{trustStars.toFixed(1)} trust stars
</div>
<div className="text-xs text-gray-500">
Unlock features as your score improves
</div>
</div>
</TooltipContent>
</Tooltip>
);
}

// Navigation menu with trust indicators
export function NavigationMenu() {
const { canAccess } = useTrustScore();

return (

<nav>
<MenuItem href="/gigs">Gigs</MenuItem>
<MenuItem href="/messages">
Messages
{!canAccess("canMessageUsers") && (
<Badge variant="outline" size="sm" className="ml-2">
{FEATURE_STAR_THRESHOLDS.canMessageUsers}⭐ required
</Badge>
)}
</MenuItem>
<MenuItem href="/competitions">
Competitions
{!canAccess("canCompete") && (
<Badge variant="outline" size="sm" className="ml-2">
{FEATURE_STAR_THRESHOLDS.canCompete}⭐ required
</Badge>
)}
</MenuItem>
<MenuItem href="/bands">
Create Band
{!canAccess("canCreateBand") && (
<Badge variant="outline" size="sm" className="ml-2">
{FEATURE_STAR_THRESHOLDS.canCreateBand}⭐ required
</Badge>
)}
</MenuItem>
</nav>
);
}

Complete Feature-Based Component:
typescript

// components/CompetitionButton.tsx
import { useTrustScore } from "@/hooks/useTrustScore";
import { Button } from "@/components/ui/button";
import { Trophy, Lock } from "lucide-react";
import { useState } from "react";

export function CompetitionButton({ competitionId }: { competitionId: string }) {
const { canAccess, trustScore, trustStars, getScoreNeeded } = useTrustScore();
const [loading, setLoading] = useState(false);

const canCompete = canAccess("canCompete");
const scoreNeeded = getScoreNeeded("canCompete");

const handleEnterCompetition = async () => {
if (!canCompete) {
// Show improvement modal instead
return;
}

    setLoading(true);
    try {
      await enterCompetition(competitionId);
    } finally {
      setLoading(false);
    }

};

<!--
if (!canCompete) {
return (
<Button
variant="outline"
onClick={() => {
// Show trust improvement modal
modalStore.setTrustModalOpen(true);
}}
className="w-full justify-start" >
<Lock className="w-4 h-4 mr-2" />
Enter Competition

<div className="ml-auto flex items-center gap-1">
<span className="text-sm text-gray-500">Need</span>
<span className="text-amber-600 font-semibold">
{scoreNeeded}
</span>
<span className="text-sm text-gray-500">pts</span>
</div>
</Button>
);
}

return (
<Button
      onClick={handleEnterCompetition}
      disabled={loading}
      className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
    >
<Trophy className="w-4 h-4 mr-2" />
{loading ? "Entering..." : "Enter Competition"}

<div className="ml-auto flex items-center gap-1 bg-white/20 px-2 py-1 rounded">
<span className="text-xs">Your Score:</span>
<span className="font-bold">{trustScore}</span>
</div>
</Button>
);
} -->

Key Points:

    canAccess("canCompete") - Main method to check eligibility

    getScoreNeeded("canCompete") - Returns required score (45)

    getStarsNeeded("canCompete") - Returns required stars (3.5)

    Show locked UI when not eligible

    Provide improvement tips to help users reach threshold

    Real-time updates - scores update automatically

This creates a seamless user experience where trust requirements are clearly communicated and users are guided toward improving their scores to unlock features like competitions.

so if i have something new i just come here add add here like canBookTwoGigs {trustScore > 75 && (
<FeatureUnlockProgress 
        feature="canBookTwoGigs" 
        variant="mini" 
      />
)}

Yes, exactly! That's how you add new features. But you need to first define them in the trust score system. Here's the complete process:
Step 1: Add the feature to your types and thresholds
typescript

// types/trust.ts (or wherever your FeatureName is defined)
export type FeatureName =
| "canCreateBand"
| "canCompete"
| "canBeDual"
| "canVideoCall"
| "canPostPremiumGigs"
| "canAccessAnalytics"
| "canVerifiedBadge"
| "canPostBasicGigs"
| "canMessageUsers"
| "canHireTeams"
| "canVerifyOthers"
| "canModerate"
| "canBetaFeatures"
| "canBookTwoGigs"; // 👈 Add your new feature here

// Add to score thresholds
export const FEATURE_SCORE_THRESHOLDS: Record<FeatureName, number> = {
canPostBasicGigs: 10,
canMessageUsers: 20,
canVerifiedBadge: 40,
canCompete: 45,
canAccessAnalytics: 50,
canPostPremiumGigs: 55,
canBeDual: 60,
canVideoCall: 65,
canCreateBand: 70,
canHireTeams: 75,
canVerifyOthers: 80,
canModerate: 85,
canBetaFeatures: 90,
canBookTwoGigs: 75, // 👈 Set the score threshold (75 points)
} as const;

// Add to star thresholds
export const FEATURE_STAR_THRESHOLDS: Record<FeatureName, number> = {
canPostBasicGigs: 1.0,
canMessageUsers: 2.0,
canVerifiedBadge: 3.0,
canCompete: 3.5,
canAccessAnalytics: 3.5,
canPostPremiumGigs: 3.5,
canBeDual: 4.0,
canVideoCall: 4.0,
canCreateBand: 4.5,
canHireTeams: 4.5,
canVerifyOthers: 5.0,
canModerate: 5.0,
canBetaFeatures: 5.0,
canBookTwoGigs: 4.5, // 👈 4.5 stars required
} as const;

// Add description for UI
export const FEATURE_DESCRIPTIONS: Record<FeatureName, string> = {
canPostBasicGigs: "Post basic gig listings",
canMessageUsers: "Message other users",
canVerifiedBadge: "Get verified badge automatically",
canCompete: "Enter competitions",
canAccessAnalytics: "Access detailed analytics",
canPostPremiumGigs: "Post premium gigs",
canBeDual: "Have musician & client roles",
canVideoCall: "Use video calls for interviews",
canCreateBand: "Create and manage bands",
canHireTeams: "Hire teams for projects",
canVerifyOthers: "Vouch for other users",
canModerate: "Help moderate community",
canBetaFeatures: "Access beta features early",
canBookTwoGigs: "Book multiple gigs simultaneously", // 👈 Add description
} as const;

Step 2: Update your useTrustScore hook
typescript

// hooks/useTrustScore.ts
// Update the getScoreNeeded function
const getScoreNeeded = useCallback((feature: FeatureName): number => {
const thresholds = {
canPostBasicGigs: 10,
canMessageUsers: 20,
canVerifiedBadge: 40,
canCompete: 45,
canAccessAnalytics: 50,
canPostPremiumGigs: 55,
canBeDual: 60,
canVideoCall: 65,
canCreateBand: 70,
canHireTeams: 75,
canVerifyOthers: 80,
canModerate: 85,
canBetaFeatures: 90,
canBookTwoGigs: 75, // 👈 Add here too
};
return thresholds[feature];
}, []);

// Update getStarsNeeded function
const getStarsNeeded = useCallback((feature: FeatureName): number => {
const starThresholds = {
canPostBasicGigs: 1.0,
canMessageUsers: 2.0,
canVerifiedBadge: 3.0,
canCompete: 3.5,
canAccessAnalytics: 3.5,
canPostPremiumGigs: 3.5,
canBeDual: 4.0,
canVideoCall: 4.0,
canCreateBand: 4.5,
canHireTeams: 4.5,
canVerifyOthers: 5.0,
canModerate: 5.0,
canBetaFeatures: 5.0,
canBookTwoGigs: 4.5, // 👈 Add here too
};
return starThresholds[feature];
}, []);

Step 3: Add to Convex backend (if needed)
typescript

// convex/controllers/trustScore.ts
// Update the canUserAccessFeature mutation args
export const canUserAccessFeature = mutation({
args: {
clerkId: v.string(),
feature: v.union(
v.literal("canCreateBand"),
v.literal("canCompete"),
v.literal("canBeDual"),
v.literal("canVideoCall"),
v.literal("canPostPremiumGigs"),
v.literal("canAccessAnalytics"),
v.literal("canVerifiedBadge"),
v.literal("canPostBasicGigs"),
v.literal("canMessageUsers"),
v.literal("canHireTeams"),
v.literal("canVerifyOthers"),
v.literal("canModerate"),
v.literal("canBetaFeatures"),
v.literal("canBookTwoGigs") // 👈 Add here
),
},
handler: async (ctx, args) => {
// ... existing code
},
});

Step 4: Now you can use it in your sidebar!
typescript

<!-- // In your Sidebar component
<div className="space-y-2">
  {/* Show only for musicians/clients who need this feature */}
  {(user?.isMusician || user?.isClient) && (
    <FeatureUnlockProgress
      feature="canBookTwoGigs"
      variant="mini"
    />
  )}

  {/* Or based on score */}
  {trustScore > 60 && trustScore < 85 && (
    <FeatureUnlockProgress
      feature="canBookTwoGigs"
      variant="mini"
    />
  )}

  {/* Or show for everyone who doesn't have it yet */}
  {!canAccess("canBookTwoGigs") && (
    <FeatureUnlockProgress
      feature="canBookTwoGigs"
      variant="mini"
    />
  )}
</div>

Step 5: Use it in your application logic
typescript

// Anywhere in your app where you need to check this feature
import { useTrustScore } from "@/hooks/useTrustScore";

function GigBookingComponent() {
  const { canAccess } = useTrustScore();

  const handleBookGig = () => {
    if (canAccess("canBookTwoGigs")) {
      // Allow booking multiple gigs
      bookMultipleGigs();
    } else {
      // Show upgrade/trust message
      showTrustRequiredModal("canBookTwoGigs");
    }
  };

  return (
    <div>
      <Button
        onClick={handleBookGig}
        disabled={!canAccess("canBookTwoGigs")}
      >
        Book Multiple Gigs
      </Button>
    </div>
  );
} -->

Step 6: Add to your trust dashboard
typescript

// components/TrustDashboard.tsx
const features = [
// ... existing features
{ name: "Book Multiple Gigs", key: "canBookTwoGigs", score: 75, description: "Book up to 2 gigs at the same time" },
];

// In the dashboard rendering
<FeatureUnlockProgress feature="canBookTwoGigs" />

Quick Template for Adding New Features:

When you want to add a new feature, just follow this pattern:
typescript

// 1. Add to FeatureName type
export type FeatureName =
// ... existing features
| "yourNewFeature";

// 2. Add thresholds
export const FEATURE_SCORE_THRESHOLDS = {
// ... existing
yourNewFeature: 85, // Set your desired score threshold
};

export const FEATURE_STAR_THRESHOLDS = {
// ... existing
yourNewFeature: 4.5, // Set star equivalent
};

export const FEATURE_DESCRIPTIONS = {
// ... existing
yourNewFeature: "Your feature description for users",
};

// 3. Update hook functions (getScoreNeeded, getStarsNeeded)
// 4. Update Convex backend if using canUserAccessFeature
// 5. Use in your UI

Best Practices for Adding Features:

    Set appropriate thresholds:

        Basic features: 10-30 points

        Intermediate: 40-60 points

        Advanced: 65-80 points

        Elite: 85+ points

    Add relevant descriptions: Clear, user-friendly descriptions

    Update all places: Types, thresholds, hooks, backend

    Test the flow: Make sure canAccess() works correctly

    Consider user roles: Should this feature be available to musicians, clients, bookers, or all?

So yes, your understanding is correct! Once the feature is defined in the types and thresholds, you can use it anywhere in your app with FeatureUnlockProgress or canAccess() checks.
