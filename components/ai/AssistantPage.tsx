// components/ai/GigUpAssistantPage.tsx
"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Send,
  Bot,
  User,
  X,
  Crown,
  AlertCircle,
  Clock,
  Zap,
  Rocket,
  Video,
  Users,
  BarChart3,
  Sparkles,
  MessageCircle,
  ArrowLeft,
} from "lucide-react";

import { useThemeColors } from "@/hooks/useTheme";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { cn } from "@/lib/utils";

import { useCheckTrial } from "@/hooks/useCheckTrial";
import { useRouter } from "next/navigation";
import { useGigUpAssistant } from "@/app/(ai)/useGigUpAssistant";
import { useAISuggestions } from "@/app/(ai)/useAISuggestions";

// Reuse the same interfaces and constants from your modal
interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  metadata?: {
    provider?: string;
    error?: boolean;
    platformVersion?: string;
  };
}

const PLATFORM_VERSIONS = {
  "v1.0": {
    name: "Basic Platform",
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    borderColor: "border-blue-200 dark:border-blue-800",
    gradient: "from-blue-500 to-blue-600",
    icon: Users,
    features: ["Basic gig posting", "Messaging", "Profiles"],
  },
  "v2.0": {
    name: "Producer Edition",
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-100 dark:bg-green-900/30",
    borderColor: "border-green-200 dark:border-green-800",
    gradient: "from-green-500 to-emerald-600",
    icon: Video,
    features: ["Multi-vendor events", "Video portfolios", "Advanced analytics"],
  },
  "v3.0": {
    name: "Collaboration Suite",
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
    borderColor: "border-purple-200 dark:border-purple-800",
    gradient: "from-purple-500 to-violet-600",
    icon: Rocket,
    features: ["Live streaming", "Royalty tracking", "Virtual events"],
  },
};

export function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [platformVersion, setPlatformVersion] = useState<
    "v1.0" | "v2.0" | "v3.0"
  >("v1.0");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { askQuestion, isLoading, questionUsage, timeUntilReset, tierLimits } =
    useGigUpAssistant();
  const { colors, mounted } = useThemeColors();
  const { questions: suggestedQuestions, isLoading: suggestionsLoading } =
    useAISuggestions();
  const { user } = useCurrentUser();
  const { isFirstMonthEnd } = useCheckTrial();
  const router = useRouter();

  // Countdown timer state
  const [countdown, setCountdown] = useState<{
    minutes: number;
    seconds: number;
  } | null>(null);

  // Get version-specific icon and colors
  const VersionIcon = PLATFORM_VERSIONS[platformVersion].icon;
  const versionInfo = PLATFORM_VERSIONS[platformVersion];

  // Update countdown every second
  useEffect(() => {
    if (!timeUntilReset?.totalMs) {
      setCountdown(null);
      return;
    }

    let mounted = true;

    const updateCountdown = () => {
      if (!mounted) return;

      const timeLeft = timeUntilReset.totalMs;

      if (timeLeft <= 0) {
        setCountdown(null);
        return;
      }

      const minutes = Math.floor(timeLeft / (60 * 1000));
      const seconds = Math.floor((timeLeft % (60 * 1000)) / 1000);

      if (mounted) {
        setCountdown({ minutes, seconds });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [timeUntilReset?.totalMs]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = async () => {
    if (!input.trim() || isLoading || !questionUsage.canAsk) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const response = await askQuestion(input, platformVersion);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.answer,
        role: "assistant",
        timestamp: new Date(),
        metadata: {
          provider: response.provider,
          error: response.error,
          platformVersion: response.platformVersion,
        },
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: getErrorMessage(error),
        role: "assistant",
        timestamp: new Date(),
        metadata: { error: true },
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const getErrorMessage = (error: any) => {
    if (error.message === "DAILY_LIMIT_EXCEEDED") {
      return `You've reached your limit of ${questionUsage.limit} questions. ${
        questionUsage.limit === tierLimits.free.dailyLimit
          ? "Upgrade to Pro for more questions!"
          : `Your limit will reset in ${countdown ? `${countdown.minutes}m ${countdown.seconds}s` : "a few minutes"}.`
      }`;
    }
    return "I'm having trouble connecting right now. Please try again later.";
  };

  const getResetMessage = () => {
    if (!countdown) return "Resetting soon...";

    if (countdown.minutes > 0) {
      return `Resets in ${countdown.minutes}m ${countdown.seconds}s`;
    }
    return `Resets in ${countdown.seconds}s`;
  };

  // Version-specific welcome messages
  const getWelcomeMessage = () => {
    const messages = {
      "v1.0":
        "Hi! I'm your GigUp assistant. Ask me about gig posting, messaging, and profiles!",
      "v2.0":
        "Hello! I'm here to help with multi-vendor events, video portfolios, and advanced analytics!",
      "v3.0":
        "Welcome! I can assist with live streaming, virtual events, and royalty tracking!",
    };
    return messages[platformVersion];
  };

  // Version-specific feature highlights
  const getFeatureHighlights = () => {
    const highlights = {
      "v1.0": [
        { icon: Users, text: "Connect with musicians & clients" },
        { icon: MessageCircle, text: "Direct messaging system" },
        { icon: BarChart3, text: "Basic performance tracking" },
      ],
      "v2.0": [
        { icon: Video, text: "Video portfolio uploads" },
        { icon: Users, text: "Multi-vendor event packages" },
        { icon: BarChart3, text: "Advanced analytics dashboard" },
      ],
      "v3.0": [
        { icon: Rocket, text: "Live streaming integration" },
        { icon: Zap, text: "Virtual event hosting" },
        { icon: Sparkles, text: "Royalty tracking & payments" },
      ],
    };
    return highlights[platformVersion];
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header for standalone page */}
      <div
        className={cn(
          "p-6 border-b-2",
          "bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
        )}
        style={{ borderColor: colors.border }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  GigUp Assistant
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Your AI-powered assistant for all things GigUp
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-6xl mx-auto p-6">
        <div
          className={cn(
            "rounded-3xl shadow-2xl flex flex-col border-2 backdrop-blur-sm",
            "h-[calc(100vh-200px)] min-h-[600px]"
          )}
          style={{
            backgroundColor: colors.card,
            borderColor: colors.border,
            boxShadow: "0 25px 80px rgba(0, 0, 0, 0.15)",
          }}
        >
          {/* Enhanced Header */}
          <div
            className={cn(
              "rounded-t-3xl p-6 flex justify-between items-center relative overflow-hidden",
              "bg-gradient-to-r from-orange-500 to-red-500"
            )}
          >
            {/* Background pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5" />

            <div className="flex items-center gap-4 relative z-10 flex-1">
              <div className="relative">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center">
                  <VersionIcon className="w-3 h-3 text-orange-600" />
                </div>
              </div>

              <div className="flex-1">
                {/* Top Row - Title and Basic Info */}
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-bold text-white text-xl">
                    GigUp Assistant
                  </h3>
                  <span
                    className={cn(
                      "px-3 py-1.5 text-sm rounded-full font-bold backdrop-blur-sm border border-white/20",
                      "bg-white/20 text-white"
                    )}
                  >
                    {platformVersion}
                  </span>
                  <span className="text-white/80 text-sm">
                    {versionInfo.name}
                  </span>
                </div>

                {/* Bottom Row - Stats */}
                <div className="flex items-center gap-4 flex-wrap">
                  {/* Usage */}
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full",
                        questionUsage.canAsk ? "bg-green-400" : "bg-amber-400"
                      )}
                    />
                    <span className="text-white text-sm font-medium">
                      {questionUsage.used}/{questionUsage.limit}
                    </span>
                    <span className="text-white/70 text-xs">questions</span>
                  </div>

                  {/* User Info */}
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-white/70" />
                    <span className="text-white text-sm capitalize">
                      {user?.isMusician
                        ? "musician"
                        : user?.isClient
                          ? "client"
                          : "guest"}
                    </span>
                  </div>

                  {/* Tier */}
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-white/70" />
                    <span className="text-white text-sm capitalize">
                      {user?.tier || (isFirstMonthEnd ? "trial" : "free")}
                    </span>
                  </div>

                  {/* Timer */}
                  {countdown && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-white/70" />
                      <span className="text-white text-sm">
                        {countdown.minutes > 0
                          ? `${countdown.minutes}m ${countdown.seconds}s`
                          : `${countdown.seconds}s`}
                      </span>
                    </div>
                  )}

                  {/* Progress */}
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-white/20 rounded-full h-1.5">
                      <div
                        className={cn(
                          "h-1.5 rounded-full transition-all duration-500",
                          questionUsage.used / questionUsage.limit < 0.7
                            ? "bg-green-400"
                            : questionUsage.used / questionUsage.limit < 0.9
                              ? "bg-amber-400"
                              : "bg-red-400"
                        )}
                        style={{
                          width: `${Math.min((questionUsage.used / questionUsage.limit) * 100, 100)}%`,
                        }}
                      />
                    </div>
                    <span className="text-white/70 text-xs">
                      {Math.round(
                        (questionUsage.used / questionUsage.limit) * 100
                      )}
                      %
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div
            className={cn(
              "flex-1 overflow-y-auto p-6 relative",
              "bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800"
            )}
          >
            {messages.length === 0 ? (
              <div className="text-center space-y-6 h-full flex flex-col justify-center">
                {/* Welcome Section */}
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div
                      className={cn(
                        "p-4 rounded-2xl flex items-center gap-3 backdrop-blur-sm border-2",
                        versionInfo.bgColor,
                        versionInfo.borderColor,
                        versionInfo.color,
                        "shadow-lg"
                      )}
                    >
                      <VersionIcon className="w-6 h-6" />
                      <span className="font-bold text-lg">
                        {versionInfo.name}
                      </span>
                    </div>
                  </div>

                  <p
                    className={cn(
                      "text-base leading-relaxed px-4",
                      colors.text
                    )}
                  >
                    {getWelcomeMessage()}
                  </p>

                  {/* Feature Highlights */}
                  <div className="grid grid-cols-1 gap-3 px-2">
                    {getFeatureHighlights().map((feature, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-xl text-sm font-medium transition-all duration-200",
                          "bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60",
                          "hover:shadow-md hover:scale-105",
                          colors.text
                        )}
                      >
                        <div
                          className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center",
                            versionInfo.bgColor,
                            versionInfo.color
                          )}
                        >
                          <feature.icon className="w-4 h-4" />
                        </div>
                        <span className="text-sm">{feature.text}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Suggested Questions */}
                <div className="space-y-3">
                  {suggestionsLoading
                    ? Array.from({ length: 4 }).map((_, index) => (
                        <div
                          key={index}
                          className={cn(
                            "w-full p-4 rounded-xl border-2 animate-pulse",
                            "bg-gray-200/50 dark:bg-gray-700/50 border-gray-300/50 dark:border-gray-600/50"
                          )}
                        >
                          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded" />
                        </div>
                      ))
                    : suggestedQuestions.map((question, index) => (
                        <motion.button
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          onClick={() => setInput(question)}
                          className={cn(
                            "w-full text-left p-4 rounded-xl text-sm font-medium transition-all duration-300",
                            "bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200/60 dark:border-gray-700/60",
                            "hover:shadow-lg hover:scale-105 hover:border-orange-300/50 dark:hover:border-orange-400/50",
                            "active:scale-95",
                            colors.textSecondary
                          )}
                        >
                          {question}
                        </motion.button>
                      ))}
                </div>

                {/* Usage Info */}
                <div
                  className={cn(
                    "text-xs px-4 py-3 rounded-xl",
                    "bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60"
                  )}
                >
                  {questionUsage.limit === tierLimits.free.dailyLimit && (
                    <span className={colors.textMuted}>
                      Free: {tierLimits.free.dailyLimit} questions every{" "}
                      {tierLimits.free.resetMinutes} minutes
                    </span>
                  )}
                  {questionUsage.limit === tierLimits.pro.dailyLimit && (
                    <span className={colors.textMuted}>
                      Pro: {tierLimits.pro.dailyLimit} questions every{" "}
                      {tierLimits.pro.resetMinutes} minutes
                    </span>
                  )}
                  {questionUsage.limit === tierLimits.trial.dailyLimit && (
                    <span className={colors.textMuted}>
                      Trial: {tierLimits.trial.dailyLimit} questions every{" "}
                      {tierLimits.trial.resetMinutes} minutes
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4 pb-4">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 ${
                      message.role === "user" ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg ${
                        message.role === "user"
                          ? "bg-gradient-to-br from-orange-500 to-red-500"
                          : "bg-gradient-to-br from-gray-600 to-gray-700 dark:from-gray-500 dark:to-gray-600"
                      }`}
                    >
                      {message.role === "user" ? (
                        <User className="w-5 h-5 text-white" />
                      ) : (
                        <Bot className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div
                      className={cn(
                        "px-4 py-3 rounded-2xl max-w-[80%] shadow-lg backdrop-blur-sm",
                        message.role === "user"
                          ? "bg-gradient-to-br from-orange-500 to-red-500 text-white"
                          : cn(
                              "bg-white/90 dark:bg-gray-800/90 border-2 border-gray-200/60 dark:border-gray-700/60",
                              colors.text
                            )
                      )}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {message.content}
                      </p>

                      {/* Message Metadata */}
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/20 dark:border-gray-600/50">
                        <div className="flex items-center gap-2">
                          {message.role === "assistant" &&
                            message.metadata?.provider &&
                            !message.metadata.error && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Powered by DeepSeek AI
                              </p>
                            )}

                          {message.metadata?.platformVersion && (
                            <span
                              className={cn(
                                "px-2 py-1 text-xs rounded-full font-medium border",
                                PLATFORM_VERSIONS[
                                  message.metadata
                                    .platformVersion as keyof typeof PLATFORM_VERSIONS
                                ]?.bgColor,
                                PLATFORM_VERSIONS[
                                  message.metadata
                                    .platformVersion as keyof typeof PLATFORM_VERSIONS
                                ]?.color,
                                "border-current/20"
                              )}
                            >
                              {message.metadata.platformVersion}
                            </span>
                          )}
                        </div>

                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {message.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {isLoading && (
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-gray-600 to-gray-700 dark:from-gray-500 dark:to-gray-600 flex items-center justify-center shadow-lg">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div
                      className={cn(
                        "px-4 py-3 rounded-2xl bg-white/90 dark:bg-gray-800/90 border-2 border-gray-200/60 dark:border-gray-700/60 shadow-lg backdrop-blur-sm"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex gap-1">
                          {[0, 1, 2].map((i) => (
                            <motion.div
                              key={i}
                              className="w-2 h-2 bg-orange-500 rounded-full"
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{
                                duration: 1,
                                repeat: Infinity,
                                delay: i * 0.2,
                              }}
                            />
                          ))}
                        </div>
                        <span
                          className={cn("text-sm font-medium", colors.text)}
                        >
                          Thinking...
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Area */}
          <div
            className={cn(
              "p-5 border-t-2",
              "bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
            )}
            style={{ borderColor: colors.border }}
          >
            {!questionUsage.canAsk && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "mb-4 p-4 rounded-xl flex items-center gap-3 text-sm font-medium",
                  "bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 border-2 border-amber-200/60 dark:border-amber-700/60",
                  "text-amber-800 dark:text-amber-200 shadow-lg"
                )}
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <div className="flex-1">
                  <p>Limit reached ({questionUsage.limit} questions)</p>
                  {countdown && (
                    <p className="text-xs mt-1 opacity-90">
                      Resets in{" "}
                      {countdown.minutes > 0
                        ? `${countdown.minutes}m ${countdown.seconds}s`
                        : `${countdown.seconds}s`}
                    </p>
                  )}
                </div>
              </motion.div>
            )}

            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder={
                  questionUsage.canAsk
                    ? `Ask about ${versionInfo.name.toLowerCase()}...`
                    : `Limit reached - resets in ${countdown ? `${countdown.minutes}m ${countdown.seconds}s` : "a few minutes"}`
                }
                className={cn(
                  "flex-1 px-4 py-3 rounded-xl text-sm border-2 focus:outline-none focus:ring-4 transition-all duration-200",
                  "bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-300/60 dark:border-gray-600/60",
                  "focus:border-orange-400 focus:ring-orange-200/50 dark:focus:ring-orange-400/30",
                  "placeholder-gray-500 dark:placeholder-gray-400",
                  !questionUsage.canAsk && "opacity-60 cursor-not-allowed",
                  colors.text
                )}
                disabled={!questionUsage.canAsk || isLoading}
              />
              <motion.button
                onClick={handleSend}
                disabled={!input.trim() || isLoading || !questionUsage.canAsk}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "p-3 rounded-xl transition-all duration-200 disabled:opacity-40",
                  "bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg",
                  "hover:shadow-xl disabled:hover:shadow-lg min-w-[50px]"
                )}
              >
                <Send className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Usage Progress */}
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className={cn("font-medium", colors.textMuted)}>
                {questionUsage.canAsk
                  ? `${questionUsage.limit - questionUsage.used} questions left`
                  : "Limit reached"}
              </span>

              {questionUsage.limit === tierLimits.free.dailyLimit && (
                <motion.button
                  onClick={() => (window.location.href = "/dashboard/billing")}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 font-medium",
                    "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md",
                    "hover:shadow-lg"
                  )}
                >
                  <Crown className="w-3 h-3" />
                  Upgrade for more
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
