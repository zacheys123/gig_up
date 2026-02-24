// components/PracticeTools.tsx - UPDATED WITH YOUR THEME
"use client";

import { useState, useEffect, useRef } from "react";
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
  Zap,
  Award,
  Brain,
  Music2,
  ChevronRight,
  CheckCircle,
  RefreshCw,
  Download,
  Share2,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useThemeColors } from "@/hooks/useTheme";

const practiceSessions = [
  {
    id: "scales",
    name: "Scale Practice",
    duration: 15,
    description: "Master major and minor scales with interactive exercises",
    difficulty: "beginner",
    icon: <Music className="h-6 w-6" />,
    color: "blue",
    progress: 65,
  },
  {
    id: "arpeggios",
    name: "Arpeggio Drills",
    duration: 20,
    description: "Improve finger agility and speed across all keys",
    difficulty: "intermediate",
    icon: <TrendingUp className="h-6 w-6" />,
    color: "purple",
    progress: 40,
  },
  {
    id: "timing",
    name: "Timing & Rhythm",
    duration: 25,
    description: "Develop perfect timing with adjustable metronome",
    difficulty: "intermediate",
    icon: <Clock className="h-6 w-6" />,
    color: "green",
    progress: 85,
  },
  {
    id: "ear_training",
    name: "Ear Training",
    duration: 30,
    description: "Identify chords, intervals, and melodies by ear",
    difficulty: "advanced",
    icon: <Volume2 className="h-6 w-6" />,
    color: "orange",
    progress: 25,
  },
  {
    id: "repertoire",
    name: "Repertoire Practice",
    duration: 45,
    description: "Work on your performance pieces with feedback",
    difficulty: "all",
    icon: <Target className="h-6 w-6" />,
    color: "red",
    progress: 90,
  },
  {
    id: "sight_reading",
    name: "Sight Reading",
    duration: 20,
    description: "Improve your music reading skills with new pieces daily",
    difficulty: "intermediate",
    icon: <Music2 className="h-6 w-6" />,
    color: "indigo",
    progress: 55,
  },
  {
    id: "technique",
    name: "Technique Builder",
    duration: 35,
    description: "Advanced technical exercises for virtuosity",
    difficulty: "advanced",
    icon: <Zap className="h-6 w-6" />,
    color: "amber",
    progress: 30,
  },
  {
    id: "improvisation",
    name: "Improvisation",
    duration: 40,
    description: "Learn to improvise over chord progressions",
    difficulty: "advanced",
    icon: <Brain className="h-6 w-6" />,
    color: "pink",
    progress: 20,
  },
];

const colorClasses: Record<string, any> = {
  blue: {
    bg: "bg-blue-500",
    bgLight: "bg-blue-100 dark:bg-blue-900/20",
    text: "text-blue-600 dark:text-blue-400",
    border: "border-blue-300 dark:border-blue-700",
    gradient: "from-blue-500 to-cyan-500",
  },
  purple: {
    bg: "bg-purple-500",
    bgLight: "bg-purple-100 dark:bg-purple-900/20",
    text: "text-purple-600 dark:text-purple-400",
    border: "border-purple-300 dark:border-purple-700",
    gradient: "from-purple-500 to-pink-500",
  },
  green: {
    bg: "bg-green-500",
    bgLight: "bg-green-100 dark:bg-green-900/20",
    text: "text-green-600 dark:text-green-400",
    border: "border-green-300 dark:border-green-700",
    gradient: "from-green-500 to-emerald-500",
  },
  orange: {
    bg: "bg-orange-500",
    bgLight: "bg-orange-100 dark:bg-orange-900/20",
    text: "text-orange-600 dark:text-orange-400",
    border: "border-orange-300 dark:border-orange-700",
    gradient: "from-orange-500 to-red-500",
  },
  red: {
    bg: "bg-red-500",
    bgLight: "bg-red-100 dark:bg-red-900/20",
    text: "text-red-600 dark:text-red-400",
    border: "border-red-300 dark:border-red-700",
    gradient: "from-red-500 to-rose-500",
  },
  indigo: {
    bg: "bg-indigo-500",
    bgLight: "bg-indigo-100 dark:bg-indigo-900/20",
    text: "text-indigo-600 dark:text-indigo-400",
    border: "border-indigo-300 dark:border-indigo-700",
    gradient: "from-indigo-500 to-violet-500",
  },
  amber: {
    bg: "bg-amber-500",
    bgLight: "bg-amber-100 dark:bg-amber-900/20",
    text: "text-amber-600 dark:text-amber-400",
    border: "border-amber-300 dark:border-amber-700",
    gradient: "from-amber-500 to-yellow-500",
  },
  pink: {
    bg: "bg-pink-500",
    bgLight: "bg-pink-100 dark:bg-pink-900/20",
    text: "text-pink-600 dark:text-pink-400",
    border: "border-pink-300 dark:border-pink-700",
    gradient: "from-pink-500 to-rose-500",
  },
};

export const PracticeTools: React.FC = () => {
  const { colors, isDarkMode } = useThemeColors();
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedTab, setSelectedTab] = useState<
    "sessions" | "history" | "stats"
  >("sessions");
  const [practiceHistory, setPracticeHistory] = useState<
    Array<{ date: string; duration: number; session: string; score: number }>
  >([
    {
      date: "2024-01-15T10:30:00",
      duration: 1500,
      session: "scales",
      score: 85,
    },
    {
      date: "2024-01-14T15:45:00",
      duration: 2400,
      session: "arpeggios",
      score: 72,
    },
    {
      date: "2024-01-13T09:15:00",
      duration: 1800,
      session: "timing",
      score: 91,
    },
    {
      date: "2024-01-12T14:20:00",
      duration: 2700,
      session: "ear_training",
      score: 68,
    },
    {
      date: "2024-01-11T16:30:00",
      duration: 3600,
      session: "repertoire",
      score: 95,
    },
  ]);

  const audioContextRef = useRef<AudioContext | null>(null);
  const metronomeRef = useRef<any>(null);

  const startSession = (sessionId: string, duration: number) => {
    setActiveSession(sessionId);
    setTimeRemaining(duration * 60);
    setIsPlaying(true);
    startMetronome();
  };

  const stopSession = () => {
    if (activeSession) {
      const session = practiceSessions.find((s) => s.id === activeSession);
      const score = Math.floor(Math.random() * 30) + 70; // Simulated score

      setPracticeHistory((prev) => [
        {
          date: new Date().toISOString(),
          duration: timeRemaining,
          session: activeSession,
          score,
        },
        ...prev,
      ]);

      stopMetronome();
    }
    setActiveSession(null);
    setIsPlaying(false);
    setTimeRemaining(0);
  };

  const startMetronome = () => {
    // Simple metronome implementation
    if (typeof window !== "undefined") {
      try {
        audioContextRef.current = new (
          window.AudioContext || (window as any).webkitAudioContext
        )();
        const oscillator = audioContextRef.current.createOscillator();
        const gainNode = audioContextRef.current.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContextRef.current.destination);

        oscillator.frequency.value = 880;
        gainNode.gain.value = 0.1;

        oscillator.start();

        metronomeRef.current = setInterval(() => {
          gainNode.gain.setValueAtTime(
            0.3,
            audioContextRef.current!.currentTime,
          );
          gainNode.gain.exponentialRampToValueAtTime(
            0.01,
            audioContextRef.current!.currentTime + 0.1,
          );
        }, 60000 / 120); // 120 BPM
      } catch (error) {
        console.log("Metronome requires user interaction first");
      }
    }
  };

  const stopMetronome = () => {
    if (metronomeRef.current) {
      clearInterval(metronomeRef.current);
      metronomeRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
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
      stopMetronome();
    };
  }, [isPlaying, timeRemaining]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const totalPracticeTime = practiceHistory.reduce(
    (total, entry) => total + entry.duration,
    0,
  );
  const averageScore =
    practiceHistory.length > 0
      ? Math.round(
          practiceHistory.reduce((sum, entry) => sum + entry.score, 0) /
            practiceHistory.length,
        )
      : 0;

  const getSessionStats = (sessionId: string) => {
    const sessionHistory = practiceHistory.filter(
      (entry) => entry.session === sessionId,
    );
    const totalTime = sessionHistory.reduce(
      (sum, entry) => sum + entry.duration,
      0,
    );
    const avgScore =
      sessionHistory.length > 0
        ? Math.round(
            sessionHistory.reduce((sum, entry) => sum + entry.score, 0) /
              sessionHistory.length,
          )
        : 0;

    return { totalTime, avgScore, count: sessionHistory.length };
  };

  return (
    <div className="space-y-8 p-4 md:p-6">
      {/* Header */}
      <div
        className={cn(
          "rounded-2xl p-6 md:p-8",
          "bg-gradient-to-br from-orange-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900",
          colors.cardBorder,
        )}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500">
                <Music className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Practice Tools
              </h1>
            </div>
            <p className={cn("text-lg md:text-xl mb-6", colors.textMuted)}>
              Smart practice sessions with metronome, progress tracking, and
              personalized feedback
            </p>

            <div className="flex flex-wrap gap-3">
              <span
                className={cn(
                  "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold",
                  "bg-gradient-to-r from-blue-500 to-cyan-500 text-white",
                )}
              >
                <Music className="h-4 w-4" />
                For Instrumentalists
              </span>
              <span
                className={cn(
                  "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold",
                  colors.backgroundMuted,
                  colors.textSecondary,
                )}
              >
                <Award className="h-4 w-4" />
                {practiceHistory.length} Sessions
              </span>
            </div>
          </div>

          <div className="text-center">
            <div className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              {formatTime(totalPracticeTime)}
            </div>
            <p className={cn("text-sm mt-2", colors.textMuted)}>
              Total Practice Time
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          className={cn(
            "rounded-xl p-5 border",
            colors.card,
            colors.cardBorder,
          )}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/20">
              <Timer className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {formatTime(totalPracticeTime)}
              </div>
              <div className={cn("text-sm", colors.textMuted)}>
                Total Practice
              </div>
            </div>
          </div>
        </div>

        <div
          className={cn(
            "rounded-xl p-5 border",
            colors.card,
            colors.cardBorder,
          )}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/20">
              <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {practiceHistory.length}
              </div>
              <div className={cn("text-sm", colors.textMuted)}>Sessions</div>
            </div>
          </div>
        </div>

        <div
          className={cn(
            "rounded-xl p-5 border",
            colors.card,
            colors.cardBorder,
          )}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/20">
              <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {averageScore}%
              </div>
              <div className={cn("text-sm", colors.textMuted)}>Avg. Score</div>
            </div>
          </div>
        </div>

        <div
          className={cn(
            "rounded-xl p-5 border",
            colors.card,
            colors.cardBorder,
          )}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-amber-100 dark:bg-amber-900/20">
              <Award className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                14
              </div>
              <div className={cn("text-sm", colors.textMuted)}>Day Streak</div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Session */}
      {activeSession && (
        <div
          className={cn(
            "rounded-2xl p-6 border animate-in slide-in-from-bottom-4",
            "bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20",
            "border-blue-200 dark:border-blue-700 shadow-lg",
          )}
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
                  {practiceSessions.find((s) => s.id === activeSession)?.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {practiceSessions.find((s) => s.id === activeSession)?.name}
                </h3>
              </div>
              <p className={cn("text-lg", colors.textMuted)}>
                Active Practice Session •{" "}
                {practiceSessions.find((s) => s.id === activeSession)?.duration}{" "}
                minutes
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  {formatTime(timeRemaining)}
                </div>
                <div className={cn("text-sm", colors.textMuted)}>Remaining</div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-4 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-lg hover:shadow-xl transition-all"
                >
                  {isPlaying ? (
                    <Pause className="h-6 w-6 text-white" />
                  ) : (
                    <Play className="h-6 w-6 text-white" />
                  )}
                </button>
                <button
                  onClick={stopSession}
                  className="px-6 py-4 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl font-semibold hover:from-red-600 hover:to-rose-600 shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                >
                  End Session
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className={cn("font-medium", colors.textMuted)}>
                Session Progress
              </span>
              <span className="font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                {Math.round(
                  (1 -
                    timeRemaining /
                      ((practiceSessions.find((s) => s.id === activeSession)
                        ?.duration || 1) *
                        60)) *
                    100,
                )}
                %
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div
                className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2.5 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.round((1 - timeRemaining / ((practiceSessions.find((s) => s.id === activeSession)?.duration || 1) * 60)) * 100)}%`,
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex border-b">
        <button
          onClick={() => setSelectedTab("sessions")}
          className={cn(
            "flex-1 py-3 px-4 font-semibold border-b-2 transition-all",
            selectedTab === "sessions"
              ? "border-blue-500 text-blue-600 dark:text-blue-400"
              : cn("border-transparent", colors.textMuted, colors.hoverBg),
          )}
        >
          <div className="flex items-center justify-center gap-2">
            <Music className="h-5 w-5" />
            Practice Sessions
          </div>
        </button>
        <button
          onClick={() => setSelectedTab("history")}
          className={cn(
            "flex-1 py-3 px-4 font-semibold border-b-2 transition-all",
            selectedTab === "history"
              ? "border-purple-500 text-purple-600 dark:text-purple-400"
              : cn("border-transparent", colors.textMuted, colors.hoverBg),
          )}
        >
          <div className="flex items-center justify-center gap-2">
            <Clock className="h-5 w-5" />
            History
          </div>
        </button>
        <button
          onClick={() => setSelectedTab("stats")}
          className={cn(
            "flex-1 py-3 px-4 font-semibold border-b-2 transition-all",
            selectedTab === "stats"
              ? "border-green-500 text-green-600 dark:text-green-400"
              : cn("border-transparent", colors.textMuted, colors.hoverBg),
          )}
        >
          <div className="flex items-center justify-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Statistics
          </div>
        </button>
      </div>

      {/* Tab Content */}
      {selectedTab === "sessions" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {practiceSessions.map((session) => {
            const color = colorClasses[session.color];
            const stats = getSessionStats(session.id);
            const isActive = activeSession === session.id;

            return (
              <div
                key={session.id}
                className={cn(
                  "rounded-xl border p-5 transition-all duration-300 hover:scale-[1.02] group",
                  isActive
                    ? cn("border-blue-500 shadow-xl", colors.card)
                    : cn(
                        "border-gray-200 dark:border-gray-700",
                        colors.card,
                        "hover:shadow-lg",
                      ),
                )}
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={cn("p-3 rounded-lg shadow-sm", color.bgLight)}
                  >
                    <div className={color.text}>{session.icon}</div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={cn(
                        "px-2.5 py-1 rounded-full text-xs font-bold",
                        session.difficulty === "beginner"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : session.difficulty === "intermediate"
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                            : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
                      )}
                    >
                      {session.difficulty}
                    </span>

                    {stats.count > 0 && (
                      <div className="text-xs font-medium bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 px-2 py-1 rounded">
                        {stats.count}x
                      </div>
                    )}
                  </div>
                </div>

                <h4 className={cn("text-lg font-bold mb-2", colors.text)}>
                  {session.name}
                </h4>
                <p
                  className={cn("text-sm mb-4 line-clamp-2", colors.textMuted)}
                >
                  {session.description}
                </p>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Timer className="h-4 w-4 text-gray-500" />
                      <span className={colors.textSecondary}>
                        {session.duration} min
                      </span>
                    </div>

                    {stats.count > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                          <div
                            className={cn("h-1.5 rounded-full", color.bg)}
                            style={{
                              width: `${Math.min(100, session.progress)}%`,
                            }}
                          />
                        </div>
                        <span className={cn("text-xs font-medium", color.text)}>
                          {session.progress}%
                        </span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => startSession(session.id, session.duration)}
                    disabled={activeSession !== null && !isActive}
                    className={cn(
                      "w-full py-2.5 rounded-lg font-semibold transition-all flex items-center justify-center gap-2",
                      isActive
                        ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                        : activeSession
                          ? "bg-gray-100 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
                          : cn(
                              "bg-gradient-to-r",
                              color.gradient,
                              "text-white hover:shadow-md hover:scale-105",
                            ),
                    )}
                  >
                    {isActive ? (
                      <>
                        <Pause className="h-4 w-4" />
                        In Progress
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4" />
                        Start Session
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedTab === "history" && (
        <div
          className={cn("rounded-xl border", colors.card, colors.cardBorder)}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Practice History
              </h3>
              <div className="flex gap-2">
                <button
                  className={cn(
                    "px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2",
                    colors.backgroundMuted,
                    colors.textSecondary,
                  )}
                >
                  <Download className="h-4 w-4" />
                  Export
                </button>
                <button
                  className={cn(
                    "px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2",
                    colors.backgroundMuted,
                    colors.textSecondary,
                  )}
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </button>
              </div>
            </div>

            {practiceHistory.length > 0 ? (
              <div className="space-y-3">
                {practiceHistory.map((entry, index) => {
                  const session = practiceSessions.find(
                    (s) => s.id === entry.session,
                  );
                  const color = session
                    ? colorClasses[session.color]
                    : colorClasses.blue;

                  return (
                    <div
                      key={index}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-lg border",
                        colors.backgroundMuted,
                        colors.border,
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn("p-3 rounded-lg", color.bgLight)}>
                          <div className={color.text}>
                            {session?.icon || <Music className="h-5 w-5" />}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {session?.name || "Practice Session"}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(entry.date).toLocaleDateString("en-US", {
                              weekday: "long",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="font-bold text-gray-900 dark:text-white">
                            {formatTime(entry.duration)}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Duration
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                            {entry.score}%
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Score
                          </div>
                        </div>

                        <div
                          className={cn(
                            "px-3 py-1 rounded-full text-xs font-medium",
                            entry.score >= 90
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                              : entry.score >= 70
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                                : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
                          )}
                        >
                          {entry.score >= 90
                            ? "Excellent"
                            : entry.score >= 70
                              ? "Good"
                              : "Needs Work"}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="inline-flex p-4 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
                  <Clock className="h-8 w-8 text-gray-500" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No Practice History
                </h4>
                <p className={cn("mb-6", colors.textMuted)}>
                  Start your first practice session to see your history here
                </p>
                <button
                  onClick={() =>
                    startSession(
                      practiceSessions[0].id,
                      practiceSessions[0].duration,
                    )
                  }
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all"
                >
                  Start First Session
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {selectedTab === "stats" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div
              className={cn(
                "rounded-xl border p-6",
                colors.card,
                colors.cardBorder,
              )}
            >
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Session Distribution
              </h4>
              <div className="space-y-4">
                {practiceSessions.slice(0, 4).map((session) => {
                  const stats = getSessionStats(session.id);
                  const color = colorClasses[session.color];
                  const percentage =
                    totalPracticeTime > 0
                      ? Math.round((stats.totalTime / totalPracticeTime) * 100)
                      : 0;

                  return (
                    <div key={session.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn("p-2 rounded", color.bgLight)}>
                            <div className={color.text}>{session.icon}</div>
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {session.name}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-gray-900 dark:text-white">
                            {formatTime(stats.totalTime)}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {percentage}% of total
                          </div>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={cn("h-2 rounded-full", color.bg)}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div
              className={cn(
                "rounded-xl border p-6",
                colors.card,
                colors.cardBorder,
              )}
            >
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Progress Over Time
              </h4>
              <div className="h-64 flex items-end justify-between">
                {[1, 2, 3, 4, 5, 6, 7].map((day) => {
                  const height = Math.random() * 80 + 20;
                  return (
                    <div key={day} className="flex flex-col items-center gap-2">
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Day {day}
                      </div>
                      <div
                        className="w-8 rounded-t bg-gradient-to-t from-blue-500 to-cyan-500"
                        style={{ height: `${height}%` }}
                      />
                      <div className="text-xs font-semibold text-gray-900 dark:text-white">
                        {Math.round(height)}%
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div
            className={cn(
              "rounded-xl border p-6",
              colors.card,
              colors.cardBorder,
            )}
          >
            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Practice Insights
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4">
                <div className="inline-flex p-3 rounded-full bg-green-100 dark:bg-green-900/20 mb-3">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h5 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Best Session
                </h5>
                <p className={cn("text-sm", colors.textMuted)}>
                  Timing & Rhythm (91% score)
                </p>
              </div>

              <div className="text-center p-4">
                <div className="inline-flex p-3 rounded-full bg-blue-100 dark:bg-blue-900/20 mb-3">
                  <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h5 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Focus Area
                </h5>
                <p className={cn("text-sm", colors.textMuted)}>
                  Ear Training (needs improvement)
                </p>
              </div>

              <div className="text-center p-4">
                <div className="inline-flex p-3 rounded-full bg-purple-100 dark:bg-purple-900/20 mb-3">
                  <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h5 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Consistency
                </h5>
                <p className={cn("text-sm", colors.textMuted)}>
                  14-day streak (keep going!)
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div
        className={cn(
          "rounded-xl border p-6",
          "bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900",
          colors.cardBorder,
        )}
      >
        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            className={cn(
              "p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all hover:scale-105",
              colors.card,
              colors.cardBorder,
              colors.hoverBg,
            )}
          >
            <RefreshCw className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <span className="font-semibold text-gray-900 dark:text-white">
              Reset Progress
            </span>
          </button>

          <button
            className={cn(
              "p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all hover:scale-105",
              colors.card,
              colors.cardBorder,
              colors.hoverBg,
            )}
          >
            <Settings className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            <span className="font-semibold text-gray-900 dark:text-white">
              Settings
            </span>
          </button>

          <button
            className={cn(
              "p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all hover:scale-105",
              colors.card,
              colors.cardBorder,
              colors.hoverBg,
            )}
          >
            <Download className="h-6 w-6 text-green-600 dark:text-green-400" />
            <span className="font-semibold text-gray-900 dark:text-white">
              Export Data
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
