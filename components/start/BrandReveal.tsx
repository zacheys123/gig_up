"use client";
import { motion } from "framer-motion";
import { AnimatedText } from "./AnimatedText";

type BrandRevealProps = {
  welcomeBack?: boolean;
};

export function BrandReveal({ welcomeBack = false }: BrandRevealProps) {
  return (
    <div className="text-center space-y-8">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, type: "spring" }}
        className="flex justify-center"
      >
        <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">
          <AnimatedText text="gigUp" />
        </div>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-gray-400 max-w-md mx-auto text-lg"
      >
        {welcomeBack ? (
          <AnimatedText
            text="Welcome back! Loading your preferences..."
            delay={0.6}
            characterDelay={0.03}
          />
        ) : (
          <AnimatedText
            text="Creating connections that matter"
            delay={0.6}
            characterDelay={0.03}
          />
        )}
      </motion.div>

      {/* Animated underline */}
      <motion.div
        className="mx-auto w-1/2 h-1 rounded-full bg-gradient-to-r from-transparent via-purple-500 to-transparent"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.8, duration: 1 }}
      />

      {/* Decorative elements */}
      {!welcomeBack && (
        <motion.div
          className="absolute top-1/4 left-1/4 w-8 h-8 rounded-full bg-purple-400 blur-sm opacity-70"
          animate={{
            y: [0, -15, 0],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            delay: 0.5,
          }}
        />
      )}

      <motion.div
        className="absolute bottom-1/3 right-1/4 w-6 h-6 rounded-full bg-blue-400 blur-sm opacity-70"
        animate={{
          y: [0, 15, 0],
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
}
