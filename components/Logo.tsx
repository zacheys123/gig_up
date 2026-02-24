"use client";
import { useThemeColors } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Link from "next/link";
import React from "react";

const Logo = () => {
  const { colors } = useThemeColors();
  return (
    <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center space-x-2"
      >
        <div className="w-7 h-7 bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-xs">G</span>
        </div>
        <span
          className={cn("text-lg font-bold whitespace-nowrap", colors.text)}
        >
          gigUpp
        </span>
      </motion.div>
    </Link>
  );
};

export default Logo;
