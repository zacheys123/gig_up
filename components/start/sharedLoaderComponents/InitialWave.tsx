"use client";
import { motion } from "framer-motion";

export const InitialWaveLoader = ({ progress }: { progress: number }) => (
  <div className="relative w-full h-full flex items-center justify-center">
    {/* Background gradient circles */}
    {[...Array(8)].map((_, i) => (
      <motion.div
        key={`circle-${i}`}
        className="absolute rounded-full"
        style={{
          width: `${60 + i * 40}px`,
          height: `${60 + i * 40}px`,
          background: `conic-gradient(from ${
            i * 45
          }deg, rgba(139, 92, 246, 0.2), rgba(99, 102, 241, 0.3), transparent 70%)`,
        }}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{
          scale: [0.8, 1.1, 0.9],
          opacity: [0, 0.6, 0.3],
          rotate: [0, i % 2 ? 180 : -180],
        }}
        transition={{
          duration: 4 + i * 0.5,
          repeat: Infinity,
          repeatType: "reverse",
          delay: i * 0.2,
          ease: "anticipate",
        }}
      />
    ))}

    {/* Pulse waves */}
    {[...Array(5)].map((_, i) => (
      <motion.div
        key={`wave-${i}`}
        className="absolute rounded-full border-2 border-opacity-10"
        style={{
          width: `${80 + i * 60}px`,
          height: `${80 + i * 60}px`,
          borderColor: i % 2 ? "#8b5cf6" : "#6366f1",
        }}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{
          scale: [0.8, 1.5, 0.8],
          opacity: [0.4, 0.8, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          delay: i * 0.3,
          ease: "easeOut",
        }}
      />
    ))}

    {/* Floating particles */}
    {[...Array(20)].map((_, i) => (
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
          y: [0, (Math.random() - 0.5) * 100],
          x: [0, (Math.random() - 0.5) * 50],
          opacity: [0, 0.8, 0],
          scale: [0.5, 1.5, 0.5],
        }}
        transition={{
          duration: 3 + Math.random() * 3,
          repeat: Infinity,
          delay: Math.random() * 2,
          ease: "easeInOut",
        }}
      />
    ))}

    {/* Main text container */}
    <motion.div
      className="relative z-20 text-center"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "backOut" }}
    >
      <motion.div
        className="text-5xl font-bold mb-4"
        style={{
          background:
            progress > 10
              ? "linear-gradient(45deg, #8b5cf6, #ec4899, #f59e0b)"
              : "linear-gradient(45deg, #8b5cf6, #6366f1)",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
          textShadow: "0 2px 10px rgba(139, 92, 246, 0.3)",
        }}
        animate={{
          scale: [1, 1.05, 1],
          letterSpacing: ["0em", "0.02em", "0em"],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
      >
        {progress > 10 ? "Welcome back" : "Welcome"}
      </motion.div>

      <motion.p
        className="text-gray-300 text-lg max-w-md mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
      >
        {progress > 10
          ? "We've missed you! Preparing your personalized experience..."
          : "Let's get started! Initializing your workspace..."}
      </motion.p>

      {/* Decorative elements */}
      <motion.div
        className="absolute -bottom-8 left-0 right-0 flex justify-center"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.7 }}
      >
        <motion.div
          className="h-1 rounded-full bg-gradient-to-r from-transparent via-purple-500 to-transparent"
          style={{ width: "60%" }}
          animate={{
            opacity: [0.3, 0.8, 0.3],
            width: ["50%", "70%", "50%"],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.div>
    </motion.div>

    {/* Floating decorative elements */}
    <motion.div
      className="absolute top-1/4 left-1/4 w-6 h-6 rounded-full bg-purple-400 blur-sm"
      animate={{
        y: [0, -20, 0],
        opacity: [0.3, 0.7, 0.3],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        delay: 0.5,
      }}
    />
    <motion.div
      className="absolute bottom-1/3 right-1/4 w-4 h-4 rounded-full bg-blue-400 blur-sm"
      animate={{
        y: [0, 20, 0],
        opacity: [0.3, 0.7, 0.3],
      }}
      transition={{
        duration: 5,
        repeat: Infinity,
        delay: 0.8,
      }}
    />
  </div>
);
