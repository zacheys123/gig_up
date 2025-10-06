"use client";

import { AnimatedText } from "../AnimatedText";

export const TextReveal = () => (
  <div className="text-center">
    <div className="text-4xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">
      <AnimatedText text="gigUp" />
    </div>
    <div className="text-gray-400 max-w-md">
      <AnimatedText text="Welcome back! Getting things ready..." delay={0.5} />
    </div>
  </div>
);
