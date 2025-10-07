// components/dashboard/DownGradeBanner.tsx
import { cn } from "@/lib/utils";
import Link from "next/link";

interface DownGradeBannerProps {
  className?: string;
}

export function DownGradeBanner({ className }: DownGradeBannerProps) {
  return (
    <div
      className={cn(
        "bg-gradient-to-r from-orange-300/50 to-emerald-200/30 border border-yellow-500 rounded-lg p-4",
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
          href={`/dashboard/billing?dep=free`}
          className="px-4 py-2 bg-green-600 text-white hover:bg-orange-700 rounded-md text-sm font-medium whitespace-nowrap"
        >
          DownGrade Now
        </Link>
      </div>
    </div>
  );
}
