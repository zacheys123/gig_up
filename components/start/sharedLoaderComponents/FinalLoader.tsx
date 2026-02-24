"use client";
import { motion } from "framer-motion";

export const FinalLoader = () => (
  <div className="flex flex-col items-center space-y-6">
    <motion.div
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center">
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
    <div className="text-center space-y-2">
      <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">
        Ready to go!
      </h3>
      <p className="text-gray-400">Taking you to your dashboard...</p>
    </div>
  </div>
);
