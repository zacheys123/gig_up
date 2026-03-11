// components/ManualConfetti.tsx
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ConfettiPiece {
  id: number;
  left: number;
  width: number;
  height: number;
  background: string;
  rotation: number;
  delay: number;
  duration: number;
}

interface ManualConfettiProps {
  active: boolean;
  duration?: number;
  pieceCount?: number;
  colors?: string[];
  onComplete?: () => void;
}

export const ManualConfetti: React.FC<ManualConfettiProps> = ({
  active,
  duration = 3000,
  pieceCount = 100,
  colors = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#ec4899"],
  onComplete,
}) => {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    if (active) {
      // Generate confetti pieces
      const newPieces: ConfettiPiece[] = [];
      for (let i = 0; i < pieceCount; i++) {
        newPieces.push({
          id: i,
          left: Math.random() * 100, // random horizontal position
          width: Math.random() * 8 + 4, // 4-12px
          height: Math.random() * 12 + 6, // 6-18px
          background: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * 360,
          delay: Math.random() * 0.5, // 0-0.5s delay
          duration: Math.random() * 2 + 1.5, // 1.5-3.5s
        });
      }
      setPieces(newPieces);

      // Clean up after duration
      const timer = setTimeout(() => {
        setPieces([]);
        onComplete?.();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      setPieces([]);
    }
  }, [active, duration, pieceCount, colors, onComplete]);

  if (!active || pieces.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <AnimatePresence>
        {pieces.map((piece) => (
          <motion.div
            key={piece.id}
            initial={{
              opacity: 1,
              x: `${piece.left}vw`,
              y: -20,
              rotate: 0,
            }}
            animate={{
              opacity: 0,
              x: `${piece.left + (Math.random() * 20 - 10)}vw`,
              y: "100vh",
              rotate: piece.rotation * (Math.random() > 0.5 ? 2 : -2),
            }}
            transition={{
              duration: piece.duration,
              delay: piece.delay,
              ease: [0.23, 0.98, 0.32, 1], // custom easing for natural fall
            }}
            style={{
              position: 'absolute',
              width: piece.width,
              height: piece.height,
              background: piece.background,
              borderRadius: Math.random() > 0.5 ? '2px' : '50%',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};