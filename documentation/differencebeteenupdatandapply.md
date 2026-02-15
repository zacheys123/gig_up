Trust System Documentation
Overview

Your platform has a dual-layer trust system that combines:

    Direct trust adjustments - Manual/event-based score changes (via applyTrustScoreUpdate)

    Algorithmic trust calculation - Comprehensive profile-based scoring (via updateUserTrust)

Both systems work together and write to the same trustScoreHistory table for complete auditability.

1. updateUserTrust - Algorithmic Trust Calculation
   Purpose

Re-calculates a user's trust score based on their complete profile data using the calculateUserTrust algorithm.
How It Works
typescript

// Updates trust based on profile completeness, activity, and behavior
updateUserTrust(ctx, userId) → Promise<TrustScoreResult>

Key Features:

    Profile-based scoring: Analyzes user data (name, bio, experience, etc.)

    Milestone unlocking: Automatically grants features at certain score thresholds

    History logging: Records all algorithmic changes for transparency

Milestone Thresholds:

    Score 40+: Auto-verification badge

    Score 65+: Video call feature unlocked

    Score 70+ (musicians): Band creation feature unlocked

Flow:
Example Usage:
typescript

// After profile update
await updateUserTrust(ctx, userId);

// After booking completion  
await updateUserTrust(ctx, musicianId);
await updateUserTrust(ctx, clientId);

2. applyTrustScoreUpdate - Direct Trust Adjustments
   Purpose

Applies direct trust score changes for specific events (cancellations, completions, penalties, bonuses).
How It Works
typescript

// Direct trust score change
applyTrustScoreUpdate(ctx, {
userId: "user123",
amount: -20, // Negative for penalties, positive for bonuses
reason: "Late cancellation penalty",
context: "gig_booking_cancellation",
metadata: { gigId: "gig123", hoursUntilGig: 12 }
})

Use Cases:

    Penalties: Cancellations, no-shows, late payments

    Bonuses: On-time completion, positive reviews, referrals

    Manual adjustments: Admin actions, system corrections

Key Features:

    Immediate impact: Direct score change applied instantly

    Context tracking: Why the change happened

    Capped scores: Automatically clamps between 0-100

    Cascade effect: Also triggers algorithmic update

Flow:
Common Context Values:

    "gig_booking_cancellation" - Booking cancelled

    "gig_completion" - Gig successfully completed

    "review_received" - Received a review

    "on_time_payment" - Payment made on time

    "late_payment" - Late payment penalty

    "account_verification" - Account verified

    "referral_bonus" - Referral bonus

    "system_adjustment" - Admin/system adjustment

3. trustScoreHistory - Audit Trail
   Schema Structure:
   typescript

{
userId: "user123", // Which user
amount: -20, // Change amount
previousScore: 75, // Score before
newScore: 55, // Score after
reason: "Cancelled booking", // Human-readable reason
context: "gig_booking_cancellation", // Machine-readable context
gigId: "gig123", // Related gig (optional)
actionBy: "admin123", // Who initiated (optional)
note: "Last-minute cancellation", // Additional details
metadata: { // Structured data
gigTitle: "Wedding Gig",
hoursUntilGig: 12,
directBonus: -20
},
timestamp: 1739163065000, // When it happened
createdAt: 1739163065000 // Record creation time
}

Key Fields:

    amount: The raw change amount (can be positive or negative)

    context: Category of change for filtering/analytics

    metadata: Flexible storage for event-specific data

    timestamp vs createdAt: Both track when the event occurred/recorded

4.  How They Work Together
    Typical Workflow:

        Event occurs (e.g., musician cancels booking)

        Direct penalty applied via applyTrustScoreUpdate(-20)

        Algorithm runs via updateUserTrust()

        Two history entries created:

            Direct penalty entry

            Algorithmic recalculation entry

Example: Cancellation Scenario
typescript

// 1. User cancels booking (last-minute)
await applyTrustScoreUpdate(ctx, {
userId: musicianId,
amount: -20,
reason: "Last-minute cancellation penalty",
context: "gig_booking_cancellation",
metadata: {
gigId: gigId,
hoursUntilGig: 6,
note: "Cancelled 6 hours before gig"
}
});

// 2. Algorithm recalculates (called inside applyTrustScoreUpdate)
// This may adjust the score further based on the user's overall profile

// RESULT: Two trustScoreHistory entries:
// Entry 1: Direct -20 penalty
// Entry 2: Algorithmic adjustment (could be +/- based on other factors)

5.  Trust Tiers & Stars
    Trust Tiers:

        new (0-19): New users, limited features

        basic (20-39): Basic trust, some features

        verified (40-64): Auto-verified badge

        trusted (65-79): Video calls unlocked

        elite (80-100): All features, band creation for musicians

Trust Stars (0-5):

Visual representation of trust level, calculated from score:

    0 stars: 0-19

    1 star: 20-39

    2 stars: 40-59

    3 stars: 60-74

    4 stars: 75-89

    5 stars: 90-100

6. Feature Unlocking

Features are automatically unlocked at specific score thresholds:
Feature Score Required User Type Notes
Verified Badge 40+ All Auto-appears on profile
Video Calls 65+ All Can use video call feature
Band Creation 70+ Musicians Can create/manage bands 7. Best Practices
When to Call updateUserTrust:

    After profile updates

    After booking completion

    After review submission

    Periodic maintenance (weekly)

When to Call applyTrustScoreUpdate:

    Booking cancellations (penalties)

    Successful gig completions (bonuses)

    Admin actions

    System events (referrals, verifications)

Monitoring:

    Check trustScoreHistory for audit trails

    Use context field for filtering event types

    Monitor tier transitions for feature unlocks

8.  Troubleshooting
    Common Issues:

            Missing createdAt field: Always include createdAt: Date.now() in history entries

            Score not clamping: Direct adjustments should use Math.max(0, Math.min(100, score))

            Duplicate entries: Both functions log to history, so you'll see both direct and algorithmic changes

            Feature not unlocking: Check if user already has the feature unlocked (bandCreationUnlockedAt)

    Yes, absolutely! Each action sends completely different data to applyTrustScoreUpdate based on the specific context. Here's a comprehensive breakdown:
    Why Different Data for Each Action?

Your trust system needs to track WHY a score changed, not just that it changed. Different actions have:

    Different penalty/bonus amounts

    Different reasons

    Different metadata (gig info, timing, people involved)

    Different contexts for analytics

1. Cancellation Actions (Different Data Examples)
   A. Musician Cancels Regular Gig (removeInterestFromGig)
   typescript

await applyTrustScoreUpdate(ctx, {
userId: musicianId,
amount: -20, // Last-minute penalty
reason: "Cancelled gig booking (last-minute): Wedding Gig",
context: "gig_booking_cancellation",
metadata: {
gigId: gigId,
gigTitle: "Wedding Gig",
actionBy: musicianId, // Self-cancelled
note: "Cancelled by musician. Hours until gig: 6",
musicianName: "John Doe",
clientName: "Jane Smith",
hoursUntilGig: 6,
cancellationType: "musician_self_cancelled"
}
});

B. Client Cancels Musician from Band Role (unbookFromBandRole)
typescript

await applyTrustScoreUpdate(ctx, {
userId: musicianId,
amount: -20, // Last-minute penalty
reason: "Band booking cancelled by client (last-minute): Rock Festival",
context: "last_minute_band_booking_cancellation", // Different context!
metadata: {
gigId: gigId,
gigTitle: "Rock Festival",
actionBy: clientId, // Client cancelled musician
note: `Cancelled by ${clientName}. Hours until gig: 4`,
bandRole: "Lead Guitarist",
musicianName: "Mike Guitar",
clientName: "Event Organizer",
hoursUntilGig: 4,
cancellationSource: "booked_gigs_page",
bandRoleIndex: 2
}
});

C. Client Removes Musician Interest (removeUserInterest)
typescript

await applyTrustScoreUpdate(ctx, {
userId: musicianId,
amount: -5, // Smaller penalty - wasn't booked yet
reason: "Interest removed by gig owner: Corporate Event",
context: "interest_removed_by_client",
metadata: {
gigId: gigId,
gigTitle: "Corporate Event",
actionBy: clientId,
note: "Client removed musician from interested list",
musicianName: "Sam Singer",
clientName: "Corp Inc",
wasBooked: false, // Important distinction!
wasInterested: true
}
});

2. Positive Actions (Different Data Examples)
   A. Gig Successfully Completed
   typescript

await applyTrustScoreUpdate(ctx, {
userId: musicianId,
amount: 15, // Bonus for completion
reason: "Successfully completed gig: Jazz Night",
context: "gig_completion",
metadata: {
gigId: gigId,
gigTitle: "Jazz Night",
actionBy: clientId, // Client marked as complete
note: "Gig completed on time with positive feedback",
musicianName: "Jazz Player",
clientName: "Venue Owner",
onTime: true,
clientSatisfaction: 5
}
});

B. Received 5-Star Review
typescript

await applyTrustScoreUpdate(ctx, {
userId: musicianId,
amount: 10, // Bonus for good review
reason: "Received 5-star review from client",
context: "review_received",
metadata: {
reviewId: reviewId,
gigId: gigId,
gigTitle: "Wedding Performance",
actionBy: clientId,
note: "Excellent performance, highly recommended!",
rating: 5,
musicianName: "Wedding Singer",
clientName: "Happy Couple",
reviewText: "Amazing voice, very professional!"
}
});

C. On-Time Payment Received
typescript

await applyTrustScoreUpdate(ctx, {
userId: musicianId,
amount: 5, // Small bonus for timely payment
reason: "Payment received on time for gig",
context: "on_time_payment",
metadata: {
gigId: gigId,
gigTitle: "Club Gig",
paymentId: paymentId,
amount: 500,
currency: "USD",
musicianName: "DJ Mix",
clientName: "Club Owner",
paidOnTime: true,
paymentMethod: "stripe"
}
});

3. System & Admin Actions
   A. Account Verified by Admin
   typescript

await applyTrustScoreUpdate(ctx, {
userId: userId,
amount: 25, // Big bonus for verification
reason: "Account verified by administrator",
context: "account_verification",
metadata: {
actionBy: adminId,
note: "ID verified, phone confirmed",
verificationMethod: "manual_admin",
adminName: "Admin User",
verificationDate: Date.now()
}
});

B. Referral Bonus
typescript

await applyTrustScoreUpdate(ctx, {
userId: referrerId,
amount: 10, // Referral bonus
reason: "Successfully referred new user",
context: "referral_bonus",
metadata: {
referredUserId: newUserId,
actionBy: systemId, // Or adminId
note: "User John joined via referral link",
referralCode: "WELCOME20",
bonusAmount: 10
}
});

4. Real Examples from Your Codebase
   From removeInterestFromGig (Musician self-cancels):
   typescript

if (trustPenaltyApplied > 0) {
await applyTrustScoreUpdate(ctx, {
userId: userId,
amount: -trustPenaltyApplied,
reason: `Cancelled gig booking (${hoursDifference < 24 ? "last-minute" : "within 3 days"}): ${gig.title}`,
context: "gig_booking_cancellation",
metadata: {
gigId: gig.\_id,
gigTitle: gig.title,
actionBy: userId, // Self!
note: `Cancelled by musician. Hours until gig: ${Math.floor(hoursDifference)}`,
musicianName: user.firstname || user.username,
clientName: client.firstname || client.username,
hoursUntilGig: Math.floor(hoursDifference),
},
});
}

From unbookFromBandRole (Client cancels musician):
typescript

await ctx.db.insert("trustScoreHistory", {
userId: userId,
timestamp: now,
amount: -trustPenaltyApplied,
previousScore: musician.trustScore || 0,
newScore: Math.max(0, (musician.trustScore || 0) - trustPenaltyApplied),
reason: `Band booking cancelled by client (${hoursDifference < 24 ? "last-minute" : "within 3 days"}): ${gig.title}`,
context: "gig_booking_cancellation",
gigId: gig.\_id,
actionBy: clientUser.\_id, // Client!
note: `Cancelled by ${clientUser.firstname || clientUser.username}. Hours until gig: ${Math.floor(hoursDifference)}. Role: ${role.role}. Client: ${clientUser.firstname || clientUser.username}. Musician: ${musician.firstname || musician.username}`,
createdAt: now,
});

Key Differences in Data:
Action Who Amount Context Key Metadata
Musician cancels Self -10 to -20 gig_booking_cancellation actionBy: self, hoursUntilGig
Client cancels musician Client -10 to -20 gig_booking_cancellation actionBy: client, bandRole
Client removes interest Client -5 interest_removed_by_client wasBooked: false, wasInterested: true
Gig completed System/Client +15 gig_completion onTime: true, clientSatisfaction
Good review Client +10 review_received rating: 5, reviewText
Account verified Admin +25 account_verification verificationMethod, adminName
Why This Matters:

    Analytics: You can query by context to see:
    typescript

    // "How many last-minute cancellations do we have?"
    const cancellations = await ctx.db
      .query("trustScoreHistory")
      .withIndex("by_context", q => q.eq("context", "gig_booking_cancellation"))
      .collect();

    Transparency: Users can see exactly why their score changed

    Fairness: Different penalties for different offenses

    Debugging: When something goes wrong, you know exactly what happened

Best Practice Pattern:
typescript

async function handleAction(ctx, actionData) {
// 1. Determine penalty/bonus amount
const amount = calculateAmount(actionData);

// 2. Build context-specific reason
const reason = buildReason(actionData);

// 3. Gather relevant metadata
const metadata = gatherMetadata(actionData);

// 4. Apply trust update with all context
await applyTrustScoreUpdate(ctx, {
userId: actionData.userId,
amount: amount,
reason: reason,
context: actionData.contextType,
metadata: metadata
});
}

Summary: Yes, every action sends completely different data because:

    Different people are involved

    Different severity levels

    Different business logic

    Different analytics needs

    Different transparency requirements

This granular tracking is what makes your trust system powerful and fair!
