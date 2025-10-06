"use client";
import { motion } from "framer-motion";

export const GeometricLoader = () => (
  <div className="relative w-64 h-64">
    <motion.div
      className="absolute inset-0 border-4 border-purple-500 rounded-lg"
      animate={{
        rotate: 360,
        borderRadius: ["20%", "50%", "20%"],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "linear",
      }}
    />
    <motion.div
      className="absolute inset-4 border-4 border-blue-500 rounded-lg"
      animate={{
        rotate: -360,
        borderRadius: ["50%", "20%", "50%"],
      }}
      transition={{
        duration: 6,
        repeat: Infinity,
        ease: "linear",
      }}
    />
    <div className="absolute inset-0 flex items-center justify-center">
      <p className="text-white font-medium">Almost there...</p>
    </div>
  </div>
);
