// components/start/loaders/firstTimeLoader.tsx
import { motion } from "framer-motion";

export function FirstTimLoader({ phase }: { phase: number; progress: number }) {
  const phases = [
    { emoji: "🎸", text: "Welcome to GigUp!" },
    { emoji: "🚀", text: "Setting up your profile" },
    { emoji: "🎵", text: "Preparing your music space" },
    { emoji: "🌟", text: "Almost there..." },
    { emoji: "✅", text: "Ready to rock!" }
  ];

  const currentPhase = phases[phase] || phases[phases.length - 1];

  return (
    <div className="text-center text-white">
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        className="text-6xl mb-6"
      >
        {currentPhase.emoji}
      </motion.div>
      <h2 className="text-3xl font-bold mb-4">
        {currentPhase.text}
      </h2>
      <p className="text-gray-400 text-lg">
        Your music journey starts here
      </p>
    </div>
  );
}