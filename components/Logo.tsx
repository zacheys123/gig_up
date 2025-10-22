"use client";
import { useThemeColors } from "@/hooks/useTheme";
import { motion } from "framer-motion";
import Link from "next/link";
import React from "react";

const Logo = () => {
  const { colors } = useThemeColors();
  return (
    <Link href="/" className="flex items-center space-x-2">
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center space-x-2"
      >
        <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">G</span>
        </div>
        <span className={"text-xl font-bold " + colors.textMuted}>GigUp</span>
      </motion.div>
    </Link>
  );
};

export default Logo;
