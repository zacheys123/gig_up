"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";

type MusicalNote = "C" | "D" | "E" | "F" | "G" | "A" | "B";

const NOTES: MusicalNote[] = ["C", "D", "E", "F", "G", "A", "B"];
const NOTE_COLORS: Record<MusicalNote, string> = {
  C: "bg-red-500",
  D: "bg-orange-500",
  E: "bg-yellow-500",
  F: "bg-green-500",
  G: "bg-blue-500",
  A: "bg-indigo-500",
  B: "bg-purple-500",
};
const FREQUENCY_MAP: Record<MusicalNote, number> = {
  C: 261.63,
  D: 293.66,
  E: 329.63,
  F: 349.23,
  G: 392.0,
  A: 440.0,
  B: 493.88,
};

export function LoadingGame({ isLoading }: { isLoading: boolean }) {
  const [activeNote, setActiveNote] = useState<MusicalNote | null>(null);
  const [score, setScore] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Play a note sound
  const playNote = useCallback((note: MusicalNote) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext!)();
    }

    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();

    oscillator.type = "sine";
    oscillator.frequency.value = FREQUENCY_MAP[note];
    gainNode.gain.value = 0.2;

    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);

    oscillator.start();
    gainNode.gain.exponentialRampToValueAtTime(
      0.001,
      audioContextRef.current.currentTime + 0.3
    );
    oscillator.stop(audioContextRef.current.currentTime + 0.3);
  }, []);

  // Flash random notes while loading
  useEffect(() => {
    if (!isLoading) return;

    const interval = setInterval(() => {
      const randomNote = NOTES[Math.floor(Math.random() * NOTES.length)];
      setActiveNote(randomNote);
      playNote(randomNote);

      setTimeout(() => setActiveNote(null), 500);
    }, 800);

    return () => clearInterval(interval);
  }, [isLoading, playNote]);

  // Handle note click
  const handleNoteClick = (note: MusicalNote) => {
    if (activeNote === note) {
      setScore(score + 10);
      playNote(note);
      setActiveNote(null);
    }
  };

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex flex-col items-center justify-center">
      <h2 className="text-xl font-bold text-white mb-4">Loading...</h2>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {NOTES.map((note) => (
          <motion.button
            key={note}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`${
              NOTE_COLORS[note]
            } w-16 h-16 rounded-lg flex items-center justify-center text-white font-bold text-xl transition-all ${
              activeNote === note ? "ring-4 ring-white scale-110" : ""
            }`}
            onClick={() => handleNoteClick(note)}
          >
            {note}
          </motion.button>
        ))}
      </div>

      <div className="text-white">
        Score: <span className="font-bold">{score}</span>
      </div>

      <p className="text-gray-400 mt-4 text-sm">
        Tap the flashing notes to score!
      </p>
    </div>
  );
}
