COMPLETE TRUST SCORE SYSTEM DOCUMENTATION
📊 OVERVIEW

The Trust Score System is a dynamic scoring mechanism that evaluates users based on their activity, profile completeness, and reliability. Instead of storing boolean flags for each feature, it uses score thresholds to determine feature eligibility.
🎯 CORE CONCEPT

Instead of: canCreateBand: true/false (stored in database)
We use: score: 75 + FEATURE_THRESHOLDS.canCreateBand: 70
Result: If score >= 70 AND user is musician → canCreateBand = true
🏗️ ARCHITECTURE

1. Score Calculation Flow
   text

User Action (complete gig)
→ Update user stats
→ Calculate new trust score
→ Check feature thresholds
→ Auto-unlock features

2. Data Flow
   text

┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ User │ │ Trust │ │ Feature │
│ Actions │───▶│ Score │───▶│ Access │
│ │ │ Calculation│ │ Check │
└─────────────┘ └─────────────┘ └─────────────┘

⚙️ HOW IT WORKS
Phase 1: Score Calculation

When a user completes an action (gig, profile update, etc.):
typescript

// 1. Update user stats
await ctx.db.patch(userId, {
completedGigsCount: user.completedGigsCount + 1
});

// 2. Recalculate trust score
const result = await updateUserTrust(ctx, userId);
// This calculates score based on all factors

Phase 2: Score Breakdown

The score is calculated from these categories:
Category Points Example
Profile 0-30 points Name, city, phone, bio
Activity 0-25 points Completed gigs, ratings, followers
Verification 0-20 points M-Pesa, phone verification
Account Age 0-10 points Older accounts get more points
Role-specific 0-15 points Musician/Client/Booker specific
Penalties -0-30 points Reports, cancellations, spam
Phase 3: Feature Unlocking

Based on the calculated score:
typescript

const FEATURE_THRESHOLDS = {
canPostBasicGigs: 10, // Very easy
canMessageUsers: 20, // Basic trust
canVerifiedBadge: 40, // Auto-verification
canCompete: 45, // In-app competitions
canAccessAnalytics: 50, // See stats
canPostPremiumGigs: 55, // Higher budget gigs
canBeDual: 60, // Be both client & musician
canCreateBand: 70, // Create/manage bands
canHireTeams: 75, // Hire multiple musicians
canVerifyOthers: 80, // Vouch for others
canModerate: 85, // Community moderation
canBetaFeatures: 90, // Early access
};

🎮 REAL-WORLD EXAMPLES
Example 1: New Musician Completes First Gig
text

Starting: Score = 15
Action: Complete gig (+3 points)
Result: Score = 18
Features unlocked: canPostBasicGigs ✓

Example 2: Active Musician Reaches Key Milestone
text

Starting: Score = 68
Action: Complete 5th gig (+3), get 5-star rating (+10)
Result: Score = 78
Features unlocked: canCreateBand ✓, canHireTeams ✓
Auto-action: "band_leader" badge added to profile

Example 3: Client Spamming Gigs
text

Starting: Score = 50
Action: Post 10 gigs, complete 1 (-10 spam penalty)
Result: Score = 40
Features lost: canPostPremiumGigs ✗

🔧 KEY COMPONENTS

1. updateUserTrust() - The Core Function
   typescript

// This ONE function does everything:
export async function updateUserTrust(ctx, userId) {
// 1. Get user
const user = await ctx.db.get(userId);

// 2. Calculate new score
const result = await calculateTrustScore(ctx, userId);

// 3. Check feature eligibility
const featureEligibility = getFeatureEligibility(result.score, user);

// 4. Apply auto-unlocks
const updates = {
trustScore: result.score,
trustTier: result.tier,
// Auto-verification at score 40+
...(featureEligibility.canVerifiedBadge && !user.verified ? {
verified: true,
verifiedAt: Date.now()
} : {}),
// Track band creation milestone
...(featureEligibility.canCreateBand && !user.bandCreationUnlockedAt ? {
bandCreationUnlockedAt: Date.now()
} : {}),
};

// 5. Save updates
await ctx.db.patch(userId, updates);

return result;
}

2. When to Call It

Call updateUserTrust() after ANY of these:

    ✅ Gig completion

    ✅ Profile update (name, bio, etc.)

    ✅ Rating received

    ✅ Payment method added

    ✅ Account suspension lifted

    ✅ Manual refresh requested

🎯 FEATURE ACCESS CHECK
Before (Old System):
typescript

// Check database boolean
if (user.canCreateBand) {
// Show "Create Band" button
}

After (New System):
typescript

// Check score threshold
const canCreateBand = user.isMusician &&
(user.trustScore || 0) >= 70;

if (canCreateBand) {
// Show "Create Band" button
}

In Practice:
typescript

// Simple hook usage
const { canCreateBand } = useTrustScore();

return (

  <div>
    {canCreateBand ? (
      <button>Create Band</button>
    ) : (
      <p>Reach trust score 70 to create bands</p>
    )}
  </div>
);

📈 SCORING DETAILS
For Musicians:
text

+3 points per completed gig (max 15 points)
+5-10 points for high ratings
+5 points for talent bio
+5 points for instruments listed
+5 points for quick response time

For Clients:
text

+20 points for 100% gig completion rate
+10 points for corporate client type
+5 points for organization name
+5-10 points for high ratings

For Everyone:
text

+15 points for M-Pesa phone number
+5 points for profile picture
+5 points for city/phone/name
+1-10 points for account age
+2-10 points for followers

Penalties:
text

-5 points per report (max -30)
-3 points per gig cancellation (max -20)
-10-20 points for spam behavior
-30 points if suspended
-100% if banned (score = 0)

🚀 IMPLEMENTATION STEPS
Step 1: After Gig Completion
typescript

// In your gigs.ts file
export const completeGig = mutation({
handler: async (ctx, { gigId }) => {
// 1. Mark gig as completed
await ctx.db.patch(gigId, { status: "completed" });

    // 2. Update musician's gig count
    const musician = await ctx.db.get(gig.musicianId);
    await ctx.db.patch(gig.musicianId, {
      completedGigsCount: (musician.completedGigsCount || 0) + 1
    });

    // 3. UPDATE TRUST SCORE - THIS IS CRITICAL!
    await updateUserTrust(ctx, gig.musicianId);

    // 4. Update client if applicable
    if (gig.clientId) {
      await updateUserTrust(ctx, gig.clientId);
    }

}
});

Step 2: In Your UI
typescript

// hooks/useTrustScore.ts
export function useTrustScore() {
const { user } = useCurrentUser();

const trustData = useQuery(
api.controllers.trustScore.getTrustScore,
user?.\_id ? { userId: user.\_id } : "skip"
);

return {
score: trustData?.score || 0,
tier: trustData?.tier || "new",
canCreateBand: trustData?.featureEligibility?.canCreateBand || false,
canCompete: trustData?.featureEligibility?.canCompete || false,
isLoading: !user || trustData === undefined,
};
}

Step 3: Feature Gating
typescript

// components/BandCreationButton.tsx
const BandCreationButton = () => {
const { canCreateBand, score } = useTrustScore();

if (canCreateBand) {
return <button>Create Band</button>;
}

return (
<Tooltip>
<button disabled>Create Band</button>
<TooltipContent>
Requires trust score 70. Your score: {score}
</TooltipContent>
</Tooltip>
);
};

🔄 AUTO-UNLOCK FEATURES

1.  Auto-Verification

    At score ≥ 40: User automatically gets verified: true

    Badge "verified" added to profile

    No manual verification needed

2.  Band Creation Milestone

    At score ≥ 70 AND user is musician:

        bandCreationUnlockedAt timestamp recorded

        "band_leader" badge added

        Can now create/manage bands

3.  Dual Role Access

    At score ≥ 60: User can be both client AND musician

    No more choosing one role forever

📊 MONITORING & ANALYTICS
What You Can Track:
typescript

// Average scores by role
const avgMusicianScore = 68
const avgClientScore = 52
const avgBookerScore = 71

// Feature adoption rates
const bandsCreated = users.filter(u => u.bandCreationUnlockedAt).length
const dualRoleUsers = users.filter(u => u.dualRoleUnlockedAt).length
const autoVerified = users.filter(u => u.verificationMethod === "trust_score_auto").length

// Score distribution
const scores = {
"0-30": 15%, // New users
"31-50": 25%, // Basic users  
 "51-70": 40%, // Verified users
"71-90": 18%, // Trusted users
"91-100": 2%, // Elite users
}

🎯 SUMMARY: WHY THIS SYSTEM ROCKS
✅ Benefits:

    No database bloat - No canX boolean fields

    Dynamic - Scores update automatically

    Transparent - Clear thresholds (score ≥ X for feature Y)

    Fair - Active users get rewarded

    Scalable - Add new features by adding thresholds

    Self-correcting - Bad behavior lowers score

✅ Real Results:

    User completes gig → Score increases

    Score hits 40 → Auto-verified ✓

    Score hits 70 → Can create bands ✓

    User spams → Score decreases → Features locked ✗

    User improves → Score increases → Features restored ✓

✅ Simple Rule:

Higher score = More features unlocked automatically
🚨 COMMON PITFALLS TO AVOID
❌ DON'T:

    Store feature booleans in database

    Call updateUserTrust too frequently (once per significant action)

    Forget to call it after gig completion

    Hardcode thresholds in UI (use the queries)

✅ DO:

    Call updateUserTrust after gigs, profile updates, ratings

    Use the provided hooks for feature checks

    Show users their progress to next feature

    Celebrate milestones (badges, notifications)

📞 NEED HELP?
Quick Debug Checklist:

    ✅ Is updateUserTrust being called after actions?

    ✅ Are user stats (completedGigsCount) updating?

    ✅ Is the score recalculating?

    ✅ Are features unlocking at correct thresholds?

Test User Flow:

    New musician signs up → Score: ~15

    Completes profile → Score: ~35

    Completes 2 gigs → Score: ~45

    Gets 5-star rating → Score: ~55

    Completes 3 more gigs → Score: ~70

    RESULT: Can create bands! 🎉

Bottom Line: This system replaces manual feature flags with automated, score-based unlocks. Users earn trust through good behavior, and the system rewards them with more features automatically. It's self-regulating, transparent, and scales beautifully as you add new features.
