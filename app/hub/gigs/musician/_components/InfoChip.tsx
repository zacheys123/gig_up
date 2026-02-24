// components/ui/InfoChip.tsx
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface InfoChipProps {
  icon: LucideIcon;
  label: string;
  value: string;
  color: "blue" | "emerald" | "amber" | "purple" | "rose";
  isDarkMode: boolean;
}

export const InfoChip = ({
  icon: Icon,
  label,
  value,
  color,
  isDarkMode,
}: InfoChipProps) => {
  const colorClasses = {
    blue: {
      bg: isDarkMode ? "bg-blue-500/10" : "bg-blue-50",
      border: isDarkMode ? "border-blue-500/30" : "border-blue-200",
      text: isDarkMode ? "text-blue-300" : "text-blue-700",
      icon: "text-blue-500",
    },
    emerald: {
      bg: isDarkMode ? "bg-emerald-500/10" : "bg-emerald-50",
      border: isDarkMode ? "border-emerald-500/30" : "border-emerald-200",
      text: isDarkMode ? "text-emerald-300" : "text-emerald-700",
      icon: "text-emerald-500",
    },
    amber: {
      bg: isDarkMode ? "bg-amber-500/10" : "bg-amber-50",
      border: isDarkMode ? "border-amber-500/30" : "border-amber-200",
      text: isDarkMode ? "text-amber-300" : "text-amber-700",
      icon: "text-amber-500",
    },
    purple: {
      bg: isDarkMode ? "bg-purple-500/10" : "bg-purple-50",
      border: isDarkMode ? "border-purple-500/30" : "border-purple-200",
      text: isDarkMode ? "text-purple-300" : "text-purple-700",
      icon: "text-purple-500",
    },
    rose: {
      bg: isDarkMode ? "bg-rose-500/10" : "bg-rose-50",
      border: isDarkMode ? "border-rose-500/30" : "border-rose-200",
      text: isDarkMode ? "text-rose-300" : "text-rose-700",
      icon: "text-rose-500",
    },
  };

  const classes = colorClasses[color];

  return (
    <div
      className={cn(
        "p-3 rounded-xl border transition-all hover:shadow-md",
        classes.bg,
        classes.border,
      )}
    >
      <div className="flex items-center gap-2 mb-1">
        <Icon className={cn("w-4 h-4", classes.icon)} />
        <span className={cn("text-xs font-medium", classes.text)}>{label}</span>
      </div>
      <p
        className={cn(
          "text-sm font-semibold truncate",
          isDarkMode ? "text-white" : "text-slate-900",
        )}
      >
        {value}
      </p>
    </div>
  );
};
