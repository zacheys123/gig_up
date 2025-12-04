"use client";

import { useState, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  SkipForward,
  Volume2,
  Timer,
  Crown,
  Lock,
} from "lucide-react";

import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useUserFeatureFlags } from "@/hooks/useUserFeatureFalgs";

interface WarmupExercise {
  id: string;
  name: string;
  duration: number; // in seconds
  description: string;
  instructions: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  premium?: boolean; // Mark premium-only exercises
}

const vocalExercises: WarmupExercise[] = [
  {
    id: "lip_trills",
    name: "Lip Trills",
    duration: 120,
    description: "Relax your vocal cords and improve breath control",
    instructions: [
      "Relax your lips and keep them loose",
      "Exhale steadily to create a bubbling sound",
      "Move through your vocal range from low to high",
      "Keep your jaw relaxed throughout",
    ],
    difficulty: "beginner",
  },
  {
    id: "sirens",
    name: "Vocal Sirens",
    duration: 90,
    description: "Smoothly glide through your vocal range",
    instructions: [
      "Start on a comfortable low note",
      "Glide smoothly up to your highest note",
      "Then glide back down without breaking",
      "Keep the sound consistent throughout",
    ],
    difficulty: "beginner",
  },
  {
    id: "scales",
    name: "Major Scales",
    duration: 180,
    description: "Practice pitch accuracy and control",
    instructions: [
      "Start on middle C",
      "Sing up the major scale: Do-Re-Mi-Fa-Sol-La-Ti-Do",
      "Then descend back down",
      "Focus on clean transitions between notes",
    ],
    difficulty: "intermediate",
  },
  {
    id: "arpeggios",
    name: "Arpeggio Exercises",
    duration: 150,
    description: "Improve agility and interval control",
    instructions: [
      "Sing: Do-Mi-Sol-Do (ascending arpeggio)",
      "Then: Do-Sol-Mi-Do (descending)",
      "Gradually increase speed",
      "Maintain consistent tone quality",
    ],
    difficulty: "advanced",
    premium: true, // Premium-only exercise
  },
  {
    id: "harmonics",
    name: "Vocal Harmonics",
    duration: 120,
    description: "Advanced harmonic control and overtone singing",
    instructions: [
      "Start with a fundamental pitch",
      "Shape your vocal tract to emphasize overtones",
      "Practice moving between different harmonics",
      "Maintain consistent breath support",
    ],
    difficulty: "advanced",
    premium: true, // Premium-only exercise
  },
  {
    id: "dynamic_control",
    name: "Dynamic Control",
    duration: 180,
    description: "Master volume control and dynamic expression",
    instructions: [
      "Start piano (soft) and crescendo to forte (loud)",
      "Practice sudden dynamic changes",
      "Work on sustained notes with dynamic variation",
      "Focus on consistent tone across dynamics",
    ],
    difficulty: "intermediate",
    premium: true, // Premium-only exercise
  },
];

export const VocalWarmups: React.FC = () => {
  const [currentExercise, setCurrentExercise] = useState<WarmupExercise | null>(
    null
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const { user } = useCurrentUser();

  const isPremiumUser = user?.tier === "premium" || user?.tier === "pro";

  const startExercise = (exercise: WarmupExercise) => {
    // Check if exercise is premium and user doesn't have access
    if (exercise.premium && !isPremiumUser) {
      return; // Don't start premium exercises for non-premium users
    }

    setCurrentExercise(exercise);
    setTimeRemaining(exercise.duration);
    setIsPlaying(true);
  };

  const stopExercise = () => {
    setIsPlaying(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const completeExercise = () => {
    if (currentExercise) {
      setCompletedExercises((prev) => [...prev, currentExercise.id]);
    }
    stopExercise();
    setCurrentExercise(null);
  };

  useEffect(() => {
    if (isPlaying && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            completeExercise();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPlaying, timeRemaining]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (currentExercise) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 border border-purple-500/30">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-semibold text-white">
              {currentExercise.name}
            </h3>
            {currentExercise.premium && (
              <span className="flex items-center gap-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full text-xs">
                <Crown className="h-3 w-3" />
                Premium
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-orange-400">
              <Timer className="h-5 w-5" />
              <span className="font-mono text-lg">
                {formatTime(timeRemaining)}
              </span>
            </div>
            <button
              onClick={isPlaying ? stopExercise : () => setIsPlaying(true)}
              className="p-3 bg-orange-500 rounded-full hover:bg-orange-600 transition-colors"
            >
              {isPlaying ? (
                <Pause className="h-6 w-6 text-white" />
              ) : (
                <Play className="h-6 w-6 text-white" />
              )}
            </button>
            <button
              onClick={completeExercise}
              className="p-3 bg-gray-700 rounded-full hover:bg-gray-600 transition-colors"
            >
              <SkipForward className="h-6 w-6 text-white" />
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-gray-300">{currentExercise.description}</p>

          <div className="bg-gray-700/50 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-3">Instructions:</h4>
            <ul className="space-y-2">
              {currentExercise.instructions.map((instruction, index) => (
                <li
                  key={index}
                  className="text-gray-300 text-sm flex items-start gap-2"
                >
                  <span className="text-orange-400 mt-1">•</span>
                  {instruction}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${
                currentExercise.difficulty === "beginner"
                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                  : currentExercise.difficulty === "intermediate"
                    ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                    : "bg-red-500/20 text-red-400 border border-red-500/30"
              }`}
            >
              {currentExercise.difficulty.toUpperCase()}
            </span>
            {currentExercise.premium && (
              <span className="flex items-center gap-1 bg-purple-500/20 text-purple-400 px-2 py-1 rounded text-xs border border-purple-500/30">
                <Crown className="h-3 w-3" />
                Premium Exercise
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Vocal Warmups</h2>
          <p className="text-gray-400">
            Professional vocal exercises to prepare your voice
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-purple-400">
            <Volume2 className="h-6 w-6" />
            <span className="text-sm">Premium Feature</span>
          </div>
          {isPremiumUser && (
            <span className="flex items-center gap-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm">
              <Crown className="h-4 w-4" />
              Premium Member
            </span>
          )}
        </div>
      </div>

      {!isPremiumUser && (
        <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-white mb-1">
                Unlock Premium Exercises
              </h4>
              <p className="text-gray-300 text-sm">
                Upgrade to access advanced vocal techniques and personalized
                routines
              </p>
            </div>
            <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:from-purple-600 hover:to-pink-600 transition-all">
              Upgrade Now
            </button>
          </div>
        </div>
      )}

      {completedExercises.length > 0 && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
          <p className="text-green-400 text-sm">
            Completed {completedExercises.length} exercise
            {completedExercises.length !== 1 ? "s" : ""} today! 🎵
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {vocalExercises.map((exercise) => {
          const isExerciseLocked = exercise.premium && !isPremiumUser;

          return (
            <div
              key={exercise.id}
              className={`rounded-lg p-5 border transition-all group ${
                isExerciseLocked
                  ? "bg-gray-800/50 border-gray-600 cursor-not-allowed opacity-60"
                  : "bg-gray-700/30 border-gray-600 hover:border-purple-500/50 hover:scale-105 cursor-pointer"
              }`}
              onClick={() => !isExerciseLocked && startExercise(exercise)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h3
                    className={`font-semibold transition-colors ${
                      isExerciseLocked
                        ? "text-gray-500"
                        : "text-white group-hover:text-purple-400"
                    }`}
                  >
                    {exercise.name}
                  </h3>
                  {exercise.premium && (
                    <span className="flex items-center gap-1 bg-purple-500/20 text-purple-400 px-2 py-1 rounded text-xs">
                      <Crown className="h-3 w-3" />
                      Premium
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {isExerciseLocked && (
                    <Lock className="h-4 w-4 text-gray-500" />
                  )}
                  <span className="text-xs text-gray-400 bg-gray-600 px-2 py-1 rounded">
                    {formatTime(exercise.duration)}
                  </span>
                </div>
              </div>

              <p
                className={`text-sm mb-3 ${
                  isExerciseLocked ? "text-gray-500" : "text-gray-300"
                }`}
              >
                {exercise.description}
              </p>

              <div className="flex items-center justify-between">
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    exercise.difficulty === "beginner"
                      ? "bg-green-500/20 text-green-400"
                      : exercise.difficulty === "intermediate"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-red-500/20 text-red-400"
                  } ${isExerciseLocked ? "opacity-50" : ""}`}
                >
                  {exercise.difficulty}
                </span>

                {completedExercises.includes(exercise.id) ? (
                  <span className="text-green-400 text-sm">✓ Completed</span>
                ) : isExerciseLocked ? (
                  <span className="text-gray-500 text-sm">Premium</span>
                ) : (
                  <span className="text-purple-400 text-sm">Start →</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress Section */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-600">
        <h3 className="text-lg font-semibold text-white mb-4">
          Your Warmup Progress
        </h3>
        <div className="space-y-3">
          {vocalExercises.map((exercise) => {
            const isExerciseLocked = exercise.premium && !isPremiumUser;

            return (
              <div
                key={exercise.id}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`text-sm ${
                      isExerciseLocked ? "text-gray-500" : "text-gray-300"
                    }`}
                  >
                    {exercise.name}
                  </span>
                  {exercise.premium && (
                    <Crown className="h-4 w-4 text-purple-400" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {isExerciseLocked ? (
                    <Lock className="h-4 w-4 text-gray-500" />
                  ) : completedExercises.includes(exercise.id) ? (
                    <span className="text-green-400 text-sm">
                      Completed today
                    </span>
                  ) : (
                    <span className="text-gray-500 text-sm">Not started</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Progress Summary */}
        <div className="mt-6 pt-4 border-t border-gray-700">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Total Progress</span>
            <span className="text-white">
              {completedExercises.length} / {vocalExercises.length} exercises
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
            <div
              className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-500"
              style={{
                width: `${(completedExercises.length / vocalExercises.length) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
