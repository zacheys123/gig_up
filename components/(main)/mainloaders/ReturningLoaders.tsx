// components/start/loaders/ReturningLoader.tsx
import { motion } from "framer-motion";

export function ReturningExperience({ phase,  }: { phase: number; }) {
  const messages = [
    "Welcome back!",
    "Loading your profile...",
    "Almost ready..."
  ];

  return (
    <div className="text-center text-white">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="text-4xl font-bold mb-4"
      >
        🎵
      </motion.div>
      <h2 className="text-2xl font-bold mb-2">
        {messages[phase] || "Ready!"}
      </h2>
      <p className="text-gray-400">
        Great to see you again!
      </p>
    </div>
  );
}