"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { useThemeColors } from "@/hooks/useTheme";

interface SectionContainerProps {
  icon: ReactNode;
  title: string;
  children: ReactNode;
  action?: ReactNode;
  onClickHeader?: () => void;
  className?: string;
}

export const SectionContainer = ({
  icon,
  title,
  children,
  action,
  onClickHeader,
  className,
}: SectionContainerProps) => {
  const { colors } = useThemeColors();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-xl border p-6 transition-all duration-300 hover:shadow-lg",
        colors.card,
        colors.border,
        className
      )}
    >
      <div
        className={cn(
          "flex items-center justify-between mb-4",
          onClickHeader && "cursor-pointer"
        )}
        onClick={onClickHeader}
      >
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "p-2 rounded-lg bg-gradient-to-br from-amber-500/10 to-purple-500/10"
            )}
          >
            {icon}
          </div>
          <h3 className={cn("font-semibold text-lg", colors.text)}>{title}</h3>
        </div>
        {action}
      </div>
      {children}
    </motion.div>
  );
};
