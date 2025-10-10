import { FaAward, FaRegClock } from "react-icons/fa";
import { motion } from "framer-motion";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface Badge {
  name: string;
  icon: React.ReactNode;
  description: string;
  tier?: "bronze" | "silver" | "gold" | "platinum";
}

interface BadgesSectionProps {
  earnedBadges: Badge[];
  upcomingBadges: Badge[];
}

export const BadgesSection = ({
  earnedBadges,
  upcomingBadges,
}: BadgesSectionProps) => {
  const router = useRouter();

  return (
    <div className="bg-gray-50 p-6 rounded-lg shadow-sm mb-8">
      <h2 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-200 pb-3">
        Achievements & Status Badges
      </h2>

      {earnedBadges.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {earnedBadges.map((badge, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.03 }}
                className={`relative bg-white p-4 rounded-xl shadow-sm border-l-4 ${
                  badge.tier === "bronze"
                    ? "border-amber-700"
                    : badge.tier === "silver"
                      ? "border-gray-400"
                      : badge.tier === "gold"
                        ? "border-yellow-500"
                        : "border-purple-600"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`text-2xl ${
                      badge.tier === "bronze"
                        ? "text-amber-700"
                        : badge.tier === "silver"
                          ? "text-gray-500"
                          : badge.tier === "gold"
                            ? "text-yellow-500"
                            : "text-purple-600"
                    }`}
                  >
                    {badge.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                      {badge.name}
                      {badge.tier === "platinum" && (
                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                          PLATINUM
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {badge.description}
                    </p>
                  </div>
                </div>
                <div
                  className={`absolute top-2 right-2 text-xs font-medium ${
                    badge.tier === "bronze"
                      ? "text-amber-700"
                      : badge.tier === "silver"
                        ? "text-gray-500"
                        : badge.tier === "gold"
                          ? "text-yellow-500"
                          : "text-purple-600"
                  }`}
                >
                  {badge.tier?.toUpperCase()}
                </div>
              </motion.div>
            ))}
          </div>

          {upcomingBadges.length > 0 && (
            <div className="mt-10">
              <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <FaRegClock className="text-blue-500" />
                {`Upcoming Badges You're Close To Earning`}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {upcomingBadges.map((badge, index) => (
                  <div
                    key={index}
                    className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-gray-400 text-2xl">{badge.icon}</div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-700">
                          {badge.name}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                          {badge.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-8">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <FaAward className="text-gray-400 text-2xl" />
          </div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            No badges earned yet
          </h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Complete gigs, maintain good ratings, and build your reliability to
            start earning badges.
          </p>
          <Button
            variant="outline"
            className="mt-4 border-blue-500 text-blue-600 hover:bg-blue-50"
            onClick={() => router.push("/how-it-works")}
          >
            Learn how to earn badges
          </Button>
        </div>
      )}
    </div>
  );
};
