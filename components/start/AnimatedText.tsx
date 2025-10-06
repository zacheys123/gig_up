"use client";
import { motion } from "framer-motion";

type AnimatedTextProps = {
  text: string;
  delay?: number;
  characterDelay?: number;
};

export function AnimatedText({
  text,
  delay = 0,
  characterDelay = 0.05,
}: AnimatedTextProps) {
  return (
    <span className="inline-block">
      {text.split("").map((char, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: delay + index * characterDelay,
            type: "spring",
            stiffness: 200,
            damping: 12,
          }}
          className="inline-block"
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </span>
  );
}
