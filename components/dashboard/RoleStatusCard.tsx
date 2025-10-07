"use client";
import { motion } from "framer-motion";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";

export function RoleStatusCard({
  title,
  value,
  format,
  trend,
  icon,
}: {
  title?: string;
  value: number;
  trend?: "up" | "down" | "steady";
  icon: React.ReactNode;
  format?: "currency" | "stars" | string;
}) {
  const formattedValue =
    format === "currency"
      ? new Intl.NumberFormat("en-KE", {
          style: "currency",
          currency: "KES",
        }).format(value)
      : value;

  const trendIcons = {
    up: <ArrowUp className="h-4 w-4 text-green-500" />,
    down: <ArrowDown className="h-4 w-4 text-red-500" />,
    steady: <Minus className="h-4 w-4 text-yellow-500" />,
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-gray-900/50 rounded-xl p-5 border border-gray-800/50 hover:border-gray-700 transition-all shadow-sm hover:shadow-md"
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            {title}
          </p>
          <div className="flex items-end gap-2 mt-2">
            <p className="text-3xl font-bold text-white">{formattedValue}</p>
            {format === "stars" && (
              <span className="text-sm text-yellow-400 mb-1">/ 5</span>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="p-3 rounded-full bg-gray-800/50 text-xl">{icon}</div>
          {trend && (
            <div
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                trend === "up"
                  ? "bg-green-900/30 text-green-400"
                  : trend === "down"
                  ? "bg-red-900/30 text-red-400"
                  : "bg-yellow-900/30 text-yellow-400"
              }`}
            >
              {trendIcons[trend]}
              {trend}
            </div>
          )}
        </div>
      </div>

      {format === "stars" && (
        <div className="mt-3 flex gap-1">
          {[...Array(5)].map((_, i) => (
            <StarIcon
              key={i}
              filled={i < Math.floor(value)}
              half={i === Math.floor(value) && value % 1 >= 0.5}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}

function StarIcon({ filled, half }: { filled: boolean; half?: boolean }) {
  return (
    <svg
      className={`w-4 h-4 ${filled ? "text-yellow-400" : "text-gray-600"}`}
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      {half ? (
        <path d="M10 1L12.39 6.3H18.78L14.17 9.6L16.56 14.9L10 11.6L3.44 14.9L5.83 9.6L1.22 6.3H7.61L10 1Z" />
      ) : filled ? (
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      ) : (
        <path
          stroke="currentColor"
          strokeWidth="0.5"
          d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
        />
      )}
    </svg>
  );
}
