// components/followers/FollowersStats.tsx
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface FollowersStatsProps {
  stats: {
    total: number;
    musicians: number;
    clients: number;
    bookers: number;
    proUsers: number;
  };
  colors: any;
}

export default function FollowersStats({ stats, colors }: FollowersStatsProps) {
  const statItems = [
    { value: stats.total, label: "Total", color: colors.primaryBg },
    { value: stats.musicians, label: "Musicians", color: "bg-purple-500" },
    { value: stats.clients, label: "Clients", color: "bg-green-500" },
    { value: stats.bookers, label: "bookers", color: "bg-red-500" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="flex flex-wrap gap-2 md:gap-4 mt-4 md:mt-6 mb-4"
    >
      {statItems.map((stat, index) => (
        <div
          key={stat.label}
          className={cn(
            "px-3 py-2 md:px-4 md:py-3 rounded-xl border-2 flex-1 min-w-[100px]",
            colors.card,
            colors.border,
            "flex items-center gap-2 md:gap-3",
          )}
        >
          <div
            className={cn("w-2 h-2 md:w-3 md:h-3 rounded-full", stat.color)}
          ></div>
          <div className="min-w-0">
            <p
              className={cn(
                "text-lg md:text-xl font-bold truncate",
                colors.text,
              )}
            >
              {stat.value}
            </p>
            <p className={cn("text-xs md:text-sm truncate", colors.textMuted)}>
              {stat.label}
            </p>
          </div>
        </div>
      ))}
    </motion.div>
  );
}
