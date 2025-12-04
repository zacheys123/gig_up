// components/TrialDebug.tsx
"use client";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useCheckTrial } from "@/hooks/useCheckTrial";
import { getTrialDurationMs } from "@/lib/trial";

const TRIAL_DURATION_MS = getTrialDurationMs();

export const TrialDebug = () => {
  const { user } = useCurrentUser();
  const { isInGracePeriod, daysLeft, isFirstMonthEnd } = useCheckTrial();

  if (!user) return <div>No user found</div>;

  // Calculate grace period manually for comparison
  const userCreationTime = user._creationTime;
  const trialEndTime = userCreationTime + TRIAL_DURATION_MS;
  const currentTime = Date.now();
  const manualIsInGracePeriod = currentTime < trialEndTime;
  const manualDaysLeft = Math.ceil(
    (trialEndTime - currentTime) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="p-4 border rounded-lg bg-red-50">
      <h3 className="font-bold mb-4">🔍 TRIAL DEBUG COMPARISON</h3>

      <div className="grid grid-cols-2 gap-4">
        {/* useCheckTrial Results */}
        <div>
          <h4 className="font-semibold mb-2">useCheckTrial Hook</h4>
          <div className="text-sm space-y-1">
            <div>
              <strong>isInGracePeriod:</strong>{" "}
              {isInGracePeriod ? "✅ TRUE" : "❌ FALSE"}
            </div>
            <div>
              <strong>daysLeft:</strong> {daysLeft}
            </div>
            <div>
              <strong>isFirstMonthEnd:</strong>{" "}
              {isFirstMonthEnd ? "✅ TRUE" : "❌ FALSE"}
            </div>
            <div>
              <strong>User Tier:</strong> {user.tier}
            </div>
          </div>
        </div>

        {/* Manual Calculation */}
        <div>
          <h4 className="font-semibold mb-2">Manual Calculation</h4>
          <div className="text-sm space-y-1">
            <div>
              <strong>isInGracePeriod:</strong>{" "}
              {manualIsInGracePeriod ? "✅ TRUE" : "❌ FALSE"}
            </div>
            <div>
              <strong>daysLeft:</strong> {manualDaysLeft}
            </div>
            <div>
              <strong>User Creation:</strong>{" "}
              {new Date(userCreationTime).toISOString()}
            </div>
            <div>
              <strong>Trial Ends:</strong>{" "}
              {new Date(trialEndTime).toISOString()}
            </div>
            <div>
              <strong>Current Time:</strong>{" "}
              {new Date(currentTime).toISOString()}
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Results */}
      <div className="mt-4 p-2 border-t">
        <h4 className="font-semibold mb-2">COMPARISON RESULTS</h4>
        <div className="text-sm space-y-1">
          <div>
            <strong>Grace Period Match:</strong>
            {isInGracePeriod === manualIsInGracePeriod
              ? " ✅ MATCH"
              : " ❌ MISMATCH"}
          </div>
          <div>
            <strong>Days Left Match:</strong>
            {daysLeft === manualDaysLeft
              ? " ✅ MATCH"
              : ` ❌ MISMATCH (Hook: ${daysLeft}, Manual: ${manualDaysLeft})`}
          </div>
        </div>
      </div>
    </div>
  );
};
