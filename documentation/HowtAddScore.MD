Here's a step-by-step guide to add any new feature threshold to your trust score system:
📋 Complete Checklist to Add a New Feature
Step 1: Define the Feature Name & Threshold

Location: convex/trustHelper.ts
typescript

// 1. Add to ROLE_FEATURE_THRESHOLDS object
const ROLE_FEATURE_THRESHOLDS = {
musician: {
// ... existing features
canDoSomethingNew: 25, // Add your new feature here
// Example: canUseAdvancedAI: 30
},
teacher: {
// ... existing features
canDoSomethingNew: 20, // Different threshold for teachers
},
client: {
// ... existing features
canDoSomethingNew: 15, // Different threshold for clients
},
booker: {
// ... existing features
canDoSomethingNew: 10, // Different threshold for bookers
},
} as const;

Step 2: Update the FeatureName Type

Location: lib/trustScoreHelpers.ts
typescript

// 2. Add to FeatureName type
export type FeatureName =
| "canPostBasicGigs"
| "canMessageUsers"
// ... other features
| "canDoSomethingNew"; // Add your new feature here

Step 3: Add Feature Description (Optional but Recommended)

Location: lib/trustScoreHelpers.ts
typescript

// 3. Add to FEATURE_DESCRIPTIONS
export const FEATURE_DESCRIPTIONS: Record<FeatureName, string> = {
// ... existing descriptions
canDoSomethingNew: "Ability to do something new and amazing", // Add description
};

// 4. Add display name mapping
const getFeatureDisplayName = (key: string): string => {
const featureNames: Record<string, string> = {
// ... existing names
canDoSomethingNew: "Do Something New", // User-friendly name
};

return featureNames[key] || key.replace('can', '').replace(/([A-Z])/g, ' $1').trim();
};

Step 4: Update getFeatureEligibility Function

Location: convex/trustHelper.ts
typescript

// 5. Update getFeatureEligibility function
function getFeatureEligibility(score: number, user: Doc<"users">) {
// ... existing code

return {
// ... existing eligibility checks
canDoSomethingNew: score >= (thresholds.canDoSomethingNew || 999),
};
}

Step 5: Update Frontend Hook (useTrustScore)

Location: hooks/useTrustScore.ts
typescript

// 6. Add to DEFAULT_FEATURE_THRESHOLDS (if needed for frontend)
const DEFAULT_FEATURE_THRESHOLDS: Record<FeatureName, number> = {
// ... existing thresholds
canDoSomethingNew: 25, // Default threshold for frontend calculations
};

// 7. Add to getScoreNeeded function
const getScoreNeeded = useCallback((feature: FeatureName): number => {
const thresholds = {
// ... existing thresholds
canDoSomethingNew: 25,
};
return thresholds[feature];
}, []);

// 8. Add to getStarsNeeded function
const getStarsNeeded = useCallback((feature: FeatureName): number => {
const starThresholds = {
// ... existing star thresholds
canDoSomethingNew: 2.0, // Convert score to stars
};
return starThresholds[feature];
}, []);

// 9. Add individual convenience check
return {
// ... existing checks
canDoSomethingNew: canAccess("canDoSomethingNew"),
};

Step 6: Update Feature Display in UI

Location: Your UI component (e.g., Sidebar.tsx or TrustDashboard.tsx)
typescript

// 10. Add to feature lists where needed
const features = [
// ... existing features
{
name: "Do Something New",
key: "canDoSomethingNew",
score: 25
},
];

// 11. Add to getRoleSpecificFeatures if it's role-specific
export const getRoleSpecificFeatures = (user: any) => {
if (!user) return [];

let baseFeatures = [
// ... existing features
{ name: "Do Something New", key: "canDoSomethingNew", score: 25 },
];

// Role-specific adjustments
if (user.isMusician && user.roleType === "dj") {
// DJs get this feature at different threshold
baseFeatures = baseFeatures.map(f =>
f.key === "canDoSomethingNew"
? { ...f, score: 20 }
: f
);
}

return baseFeatures;
};

Step 7: Update Schema for Storage (Optional)

If you need to track when users unlock this feature:

Location: User schema in Convex
typescript

// In your user schema definition
export const userModel = defineTable({
// ... existing fields
featureUnlocks: v.optional(
v.object({
canDoSomethingNew: v.optional(v.number()), // Date when unlocked
})
),
});

Step 8: Add Feature Usage Logic

Location: Where you want to use the feature
typescript

// 12. Create a component that checks feature access
import { useTrustScore } from "@/hooks/useTrustScore";

function NewFeatureComponent() {
const { canDoSomethingNew, trustScore } = useTrustScore();

if (!canDoSomethingNew) {
return (

<div className="p-4 border rounded-lg bg-gray-50">
<h3 className="font-semibold">🔒 Feature Locked</h3>
<p className="text-sm text-gray-600">
You need trust score 25+ to use this feature.
Current: {trustScore}
</p>
<button
onClick={() => router.push("/trust/guide")}
className="mt-2 text-sm text-blue-600 hover:underline" >
Learn how to improve →
</button>
</div>
);
}

return (

<div className="p-4 border rounded-lg bg-green-50">
<h3 className="font-semibold">✨ New Feature</h3>
<p>You can now do something amazing!</p>
{/_ Your feature UI here _/}
</div>
);
}

Step 9: Update Backend Logic for Auto-Unlock

Location: convex/trustHelper.ts in updateUserTrust function
typescript

// 13. Add auto-unlock logic when score reaches threshold
export async function updateUserTrust(ctx: any, userId: Id<"users">) {
// ... existing code

// AUTO-UNLOCK: When score reaches threshold
if (featureEligibility.canDoSomethingNew && !user.featureUnlocks?.canDoSomethingNew) {
const currentUnlocks = user.featureUnlocks || {};
updates.featureUnlocks = {
...currentUnlocks,
canDoSomethingNew: Date.now(),
};

    // Optionally add badge
    const currentBadges = user.badges || [];
    if (!currentBadges.includes("something_new_expert")) {
      updates.badges = [...currentBadges, "something_new_expert"];
    }

}

await ctx.db.patch(userId, updates);
return result;
}

Step 10: Test Your New Feature

Create a test script:
typescript

// 14. Test component to verify everything works
"use client";

import { useTrustScore } from "@/hooks/useTrustScore";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export function FeatureTest() {
const { user } = useCurrentUser();
const { canDoSomethingNew, trustScore, getScoreNeeded } = useTrustScore();

return (

<div className="p-6 border rounded-xl bg-white shadow">
<h2 className="text-xl font-bold mb-4">🧪 Feature Test: Do Something New</h2>

      <div className="space-y-4">
        <div className="p-4 bg-gray-100 rounded-lg">
          <h3 className="font-semibold">User Info</h3>
          <p>Role: {user?.roleType || "Unknown"}</p>
          <p>Trust Score: {trustScore}</p>
        </div>

        <div className="p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold">Feature Status</h3>
          <p className={canDoSomethingNew ? "text-green-600" : "text-red-600"}>
            {canDoSomethingNew ? "✅ Unlocked" : "🔒 Locked"}
          </p>
          <p className="text-sm text-gray-600">
            Required: {getScoreNeeded("canDoSomethingNew")} points
          </p>
        </div>

        {canDoSomethingNew ? (
          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="font-semibold">Feature Activated! 🎉</h3>
            <p>You can now use this feature!</p>
          </div>
        ) : (
          <div className="p-4 bg-yellow-50 rounded-lg">
            <h3 className="font-semibold">How to Unlock</h3>
            <p>Improve your trust score by:</p>
            <ul className="text-sm text-gray-600 list-disc pl-5 mt-2">
              <li>Complete your profile</li>
              <li>Post gigs</li>
              <li>Get positive reviews</li>
            </ul>
          </div>
        )}
      </div>
    </div>

);
}

📊 Quick Reference Table
Step File What to Change
1 convex/trustHelper.ts Add to ROLE_FEATURE_THRESHOLDS
2 lib/trustScoreHelpers.ts Add to FeatureName type
3 lib/trustScoreHelpers.ts Add description in FEATURE_DESCRIPTIONS
4 convex/trustHelper.ts Update getFeatureEligibility
5 hooks/useTrustScore.ts Add to thresholds and convenience check
6 UI Components Add to feature lists
7 Schema Add tracking field (optional)
8 Feature Component Create usage logic
9 convex/trustHelper.ts Add auto-unlock logic
10 Test Create test component
🚀 Pro Tips:

    Start with simple features before adding complex ones

    Use consistent naming: canVerbNoun format (e.g., canCreatePlaylist)

    Test different roles: Make sure thresholds work for musicians, clients, teachers, bookers

    Add analytics: Track feature usage in your database

    Get user feedback: Before rolling out, test with real users

🐛 Common Issues & Fixes:

Issue: Feature not showing up
Fix: Check if you added it to ALL required places (steps 1-6)

Issue: Wrong threshold for specific role
Fix: Verify the role-specific threshold in step 1

Issue: TypeScript errors
Fix: Make sure FeatureName type includes your new feature

Issue: Feature shows but doesn't unlock
Fix: Check if trust score calculation is working properly

This step-by-step guide ensures you don't miss anything when adding new features to your trust score system!
