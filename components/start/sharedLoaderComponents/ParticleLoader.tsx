"use client";
import { motion } from "framer-motion";

export const ParticleLoader = () => (
  <div className="relative w-full h-64">
    {[...Array(30)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-2 h-2 rounded-full bg-white"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          opacity: 0,
        }}
        animate={{
          opacity: [0, 0.8, 0],
          scale: [0.5, 1.5, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          delay: Math.random() * 2,
        }}
      />
    ))}
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="text-white text-lg font-medium">
        Preparing your workspace...
      </div>
    </div>
  </div>
);
