// components/PracticeTools.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Play,
  Pause,
  Timer,
  Target,
  TrendingUp,
  Clock,
  Music,
  Repeat,
  Volume2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const practiceSessions = [
  {
    id: "scales",
    name: "Scale Practice",
    duration: 15,
    description: "Master major and minor scales",
    difficulty: "beginner",
    icon: <Music className="h-6 w-6" />,
  },
  {
    id: "arpeggios",
    name: "Arpeggio Drills",
    duration: 20,
    description: "Improve finger agility and speed",
    difficulty: "intermediate",
    icon: <TrendingUp className="h-6 w-6" />,
  },
  {
    id: "timing",
    name: "Timing & Rhythm",
    duration: 25,
    description: "Develop perfect timing with metronome",
    difficulty: "intermediate",
    icon: <Clock className="h-6 w-6" />,
  },
  {
    id: "ear_training",
    name: "Ear Training",
    duration: 30,
    description: "Identify chords and intervals by ear",
    difficulty: "advanced",
    icon: <Volume2 className="h-6 w-6" />,
  },
  {
    id: "repertoire",
    name: "Repertoire Practice",
    duration: 45,
    description: "Work on your performance pieces",
    difficulty: "all",
    icon: <Target className="h-6 w-6" />,
  },
];

export const PracticeTools: React.FC = () => {
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [practiceHistory, setPracticeHistory] = useState<
    Array<{ date: string; duration: number; session: string }>
  >([]);

  const startSession = (sessionId: string, duration: number) => {
    setActiveSession(sessionId);
    setTimeRemaining(duration * 60); // Convert minutes to seconds
    setIsPlaying(true);
  };

  const stopSession = () => {
    if (activeSession) {
      setPracticeHistory((prev) => [
        ...prev,
        {
          date: new Date().toISOString(),
          duration: timeRemaining,
          session: activeSession,
        },
      ]);
    }
    setActiveSession(null);
    setIsPlaying(false);
    setTimeRemaining(0);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isPlaying && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            stopSession();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, timeRemaining]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Practice Tools
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Smart practice sessions to improve your skills
          </p>
        </div>
        <div className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-full">
          <Music className="h-5 w-5" />
          <span className="font-semibold">Instrumentalist</span>
        </div>
      </div>

      {/* Active Session */}
      {activeSession && (
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-700 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {practiceSessions.find((s) => s.id === activeSession)?.name}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Active Practice Session
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {formatTime(timeRemaining)}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Remaining
                </div>
              </div>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-4 bg-blue-500 hover:bg-blue-600 rounded-full transition-colors"
              >
                {isPlaying ? (
                  <Pause className="h-6 w-6 text-white" />
                ) : (
                  <Play className="h-6 w-6 text-white" />
                )}
              </button>
              <button
                onClick={stopSession}
                className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors"
              >
                End Session
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Session Progress
              </span>
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                75% Complete
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full w-3/4"></div>
            </div>
          </div>
        </div>
      )}

      {/* Practice Sessions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {practiceSessions.map((session) => (
          <div
            key={session.id}
            className={cn(
              "rounded-xl border p-6 transition-all duration-200 hover:shadow-lg",
              activeSession === session.id
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-600"
            )}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                {session.icon}
              </div>
              <span
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium",
                  session.difficulty === "beginner"
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                    : session.difficulty === "intermediate"
                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                      : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                )}
              >
                {session.difficulty}
              </span>
            </div>

            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              {session.name}
            </h4>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              {session.description}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <Timer className="h-4 w-4" />
                <span className="text-sm">{session.duration} min</span>
              </div>

              <button
                onClick={() => startSession(session.id, session.duration)}
                disabled={activeSession !== null}
                className={cn(
                  "px-4 py-2 rounded-lg font-semibold transition-all",
                  activeSession === session.id
                    ? "bg-blue-500 text-white"
                    : activeSession
                      ? "bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600"
                )}
              >
                {activeSession === session.id ? "In Progress" : "Start"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Practice History */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Practice History
        </h3>
        {practiceHistory.length > 0 ? (
          <div className="space-y-3">
            {practiceHistory.slice(0, 5).map((entry, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Repeat className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {
                        practiceSessions.find((s) => s.id === entry.session)
                          ?.name
                      }
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(entry.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900 dark:text-white">
                    {formatTime(entry.duration)}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Duration
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="inline-flex p-4 bg-gray-200 dark:bg-gray-700 rounded-full mb-4">
              <Clock className="h-8 w-8 text-gray-500" />
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              No practice sessions recorded yet. Start your first session!
            </p>
          </div>
        )}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <Timer className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                2h 30m
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Total Practice Time
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                12
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Sessions Completed
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                85%
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Consistency Score
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
