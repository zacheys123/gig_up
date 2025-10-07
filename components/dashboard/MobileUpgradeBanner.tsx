// components/dashboard/MobileUpgradeBanner.tsx
"use client";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";

export function MobileUpgradeBanner() {
  const { userId } = useAuth();

  const { subscription } = useSubscription(userId as string);

  const isPro = subscription?.isPro ?? false;

  return (
    <div
      className={`fixed top-4 left-0 right-0 px-4 z-10 md:hidde ${
        isPro && "hidden"
      }`}
    >
      <div className="bg-gradient-to-r from-orange-900/80 to-amber-900/50 border border-orange-800 rounded-lg p-3 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="pr-2">
            <p className="text-xs font-medium text-white">Upgrade to Pro</p>
            <p className="text-xs text-orange-200">Unlock all features</p>
          </div>
          <Link
            href="/dashboard/billing"
            className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 rounded text-xs font-medium whitespace-nowrap"
          >
            Upgrade
          </Link>
        </div>
      </div>
    </div>
  );
}
