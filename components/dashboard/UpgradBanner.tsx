// components/dashboard/UpgradeBanner.tsx
import { cn } from "@/lib/utils";
import Link from "next/link";

interface UpgradeBannerProps {
  className?: string;
}

export function UpgradeBanner({ className }: UpgradeBannerProps) {
  return (
    <div
      className={cn(
        "bg-gradient-to-r from-orange-900/50 to-amber-900/30 border border-orange-800 rounded-lg p-4",
        className
      )}
    >
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h3 className="font-medium text-white">Unlock Pro Tier</h3>
          <p className="text-sm text-orange-200 mt-1">
            Create unlimited gigs, featured listings, and analytics.
          </p>
        </div>
        <Link
          href={`/dashboard/billing?dep=pro`}
          className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-md text-sm font-medium whitespace-nowrap"
        >
          Upgrade Now
        </Link>
      </div>
    </div>
  );
}
