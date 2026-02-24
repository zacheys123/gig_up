"use client";
import { motion } from "framer-motion";

export function CompletionAnimation() {
  return (
    <div className="flex flex-col items-center space-y-6">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{
          scale: [1, 1.05, 1],
          opacity: 1,
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          repeatType: "mirror",
        }}
      >
        <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center shadow-lg">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      </motion.div>

      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-center space-y-2"
      >
        <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">
          Ready to go!
        </h3>
        <motion.p
          className="text-gray-400"
          animate={{
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
          }}
        >
          Taking you to your dashboard...
        </motion.p>
      </motion.div>

      {/* Floating particles */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute rounded-full bg-white"
          style={{
            width: `${Math.random() * 4 + 2}px`,
            height: `${Math.random() * 4 + 2}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            opacity: 0,
          }}
          animate={{
            y: [0, (Math.random() - 0.5) * 60],
            x: [0, (Math.random() - 0.5) * 40],
            opacity: [0, 0.6, 0],
            scale: [0.5, 1.5, 0.5],
          }}
          transition={{
            duration: 3 + Math.random() * 3,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  );
}
