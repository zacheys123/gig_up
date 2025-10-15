// components/pages/ClientEducationModal.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useThemeColors } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import {
  X,
  Headphones,
  MessageCircle,
  Heart,
  Zap,
  Star,
  Music,
  Users,
  Clock,
  CheckCircle,
} from "lucide-react";

interface ClientEducationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDontShowAgain: () => void;
}

export default function ClientEducationModal({
  isOpen,
  onClose,
  onDontShowAgain,
}: ClientEducationModalProps) {
  const { colors } = useThemeColors();
  const [currentTip, setCurrentTip] = useState(0);

  const clientTips = [
    {
      icon: <Headphones className="w-6 h-6" />,
      title: "Listen First",
      description:
        "Always listen to audio/video samples before making judgments",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Fresh Energy",
      description: "New musicians often bring unique energy and enthusiasm",
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: "Compare & Connect",
      description: "Message multiple musicians to find the best fit",
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: "Chemistry Matters",
      description: "Consider personal connection, not just credentials",
      color: "text-pink-500",
      bgColor: "bg-pink-500/10",
    },
    {
      icon: <Music className="w-6 h-6" />,
      title: "Portfolio Over Resume",
      description: "Focus on their actual work, not claimed experience",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
  ];

  useEffect(() => {
    if (isOpen) {
      const timer = setInterval(() => {
        setCurrentTip((prev) => (prev + 1) % clientTips.length);
      }, 4000);
      return () => clearInterval(timer);
    }
  }, [isOpen]);

  const nextTip = () => {
    setCurrentTip((prev) => (prev + 1) % clientTips.length);
  };

  const prevTip = () => {
    setCurrentTip((prev) => (prev - 1 + clientTips.length) % clientTips.length);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className={cn(
            "relative w-full max-w-2xl rounded-3xl border shadow-2xl",
            colors.background,
            colors.border
          )}
        >
          {/* Header */}
          <div className="relative p-6 border-b">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "p-3 rounded-2xl bg-gradient-to-br from-amber-500/10 to-purple-500/10"
                )}
              >
                <Users className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <h2 className={cn("text-2xl font-bold", colors.text)}>
                  Finding the Right Musician
                </h2>
                <p className={cn("text-sm mt-1", colors.textMuted)}>
                  Tips for evaluating musicians fairly
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className={cn(
                "absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors",
                colors.textMuted
              )}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Current Tip */}
            <motion.div
              key={currentTip}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="text-center mb-8"
            >
              <div
                className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4",
                  clientTips[currentTip].bgColor
                )}
              >
                <div className={clientTips[currentTip].color}>
                  {clientTips[currentTip].icon}
                </div>
              </div>

              <h3 className={cn("text-xl font-semibold mb-2", colors.text)}>
                {clientTips[currentTip].title}
              </h3>

              <p className={cn("text-lg leading-relaxed", colors.textMuted)}>
                {clientTips[currentTip].description}
              </p>
            </motion.div>

            {/* Progress Dots */}
            <div className="flex justify-center gap-2 mb-6">
              {clientTips.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTip(index)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all duration-300",
                    index === currentTip
                      ? "bg-amber-500 w-6"
                      : "bg-gray-300 dark:bg-gray-600 hover:bg-amber-400"
                  )}
                />
              ))}
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center">
              <button
                onClick={prevTip}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg  transition-colors",
                  "group-hover:text-amber-600 dark:group-hover:text-amber-400",
                  colors.textMuted
                )}
              >
                <span>Previous</span>
              </button>

              <button
                onClick={nextTip}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg  transition-colors",
                  "group-hover:text-amber-600 dark:group-hover:text-amber-400",
                  colors.textMuted
                )}
              >
                <span>Next</span>
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t">
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
              <button
                onClick={onDontShowAgain}
                className={cn(
                  "text-sm hover:underline transition-colors",
                  colors.textMuted
                )}
              >
                Don't show this again
              </button>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className={cn(
                    "border-amber-500 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/20"
                  )}
                >
                  Close
                </Button>

                <Button
                  onClick={onClose}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                >
                  Start Exploring
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
