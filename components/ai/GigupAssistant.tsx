// components/ai/GigUpAssistant.tsx
"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
} from "lucide-react";

import { useThemeColors } from "@/hooks/useTheme";

import { useCurrentUser } from "@/hooks/useCurrentUser";
import { cn } from "@/lib/utils";
import { useGigUpAssistant } from "@/app/ai/useGigUpAssistant";
import { useAISuggestions } from "@/app/ai/useAISuggestions";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

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

// Version information
const PLATFORM_VERSIONS = {
  "v1.0": {
    name: "Basic Platform",
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    icon: Users,
    features: ["Basic gig posting", "Messaging", "Profiles"],
  },
  "v2.0": {
    name: "Producer Edition",
    color: "text-green-600",
    bgColor: "bg-green-100",
    icon: Video,
    features: ["Multi-vendor events", "Video portfolios", "Advanced analytics"],
  },
  "v3.0": {
    name: "Collaboration Suite",
    color: "text-purple-600",
    bgColor: "bg-purple-100",
    icon: Rocket,
    features: ["Live streaming", "Royalty tracking", "Virtual events"],
  },
};

export function GigUpAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [platformVersion, setPlatformVersion] = useState<
    "v1.0" | "v2.0" | "v3.0"
  >("v2.0");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { askQuestion, isLoading, questionUsage, timeUntilReset, tierLimits } =
    useGigUpAssistant();
  const { colors, mounted } = useThemeColors();
  const { questions: suggestedQuestions, isLoading: suggestionsLoading } =
    useAISuggestions();
  const { user } = useCurrentUser();

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
    if (!timeUntilReset) {
      setCountdown(null);
      return;
    }

    const updateCountdown = () => {
      const now = Date.now();
      const timeLeft = timeUntilReset.totalMs - (now - Date.now());

      if (timeLeft <= 0) {
        setCountdown(null);
        return;
      }

      const minutes = Math.floor(timeLeft / (60 * 1000));
      const seconds = Math.floor((timeLeft % (60 * 1000)) / 1000);
      setCountdown({ minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearTimeout(interval);
  }, [timeUntilReset]);

  //   // Auto-detect user's platform version based on features
  //   useEffect(() => {
  //     if (user) {
  //       // Simple logic to determine version - you can enhance this based on user features
  //       if (user.videosProfile) {
  //         setPlatformVersion('v2.0');
  //       } else if (user.hasLiveStreaming) {
  //         setPlatformVersion('v3.0');
  //       } else {
  //         setPlatformVersion('v1.0');
  //       }
  //     }
  //   }, [user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
        { icon: Send, text: "Direct messaging system" },
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
        { icon: BarChart3, text: "Royalty tracking & payments" },
      ],
    };
    return highlights[platformVersion];
  };

  if (!mounted) return null;

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full shadow-lg flex items-center justify-center group",
          colors.primaryBg,
          colors.textInverted,
          "border-2 border-white dark:border-gray-800"
        )}
      >
        <Bot className="w-6 h-6" />

        {/* Version badge */}
        <div
          className={cn(
            "absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold",
            versionInfo.bgColor,
            versionInfo.color
          )}
        >
          {platformVersion.replace("v", "")}
        </div>

        {/* Tooltip */}
        <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block">
          <div
            className={cn(
              "bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap",
              colors.textInverted
            )}
          >
            GigUp Assistant - {versionInfo.name}
          </div>
        </div>
      </motion.button>

      {/* Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed bottom-20 right-6 z-50 w-96 h-[500px] rounded-2xl shadow-2xl flex flex-col border"
            style={{
              backgroundColor: colors.card.replace("bg-", ""),
              borderColor: colors.border.replace("border-", ""),
            }}
          >
            {/* Header */}
            <div
              className={cn(
                "rounded-t-2xl p-4 flex justify-between items-center",
                colors.primaryBg
              )}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Bot className="w-6 h-6 text-white" />
                  <VersionIcon className="w-3 h-3 text-white absolute -bottom-1 -right-1" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-white">
                      GigUp Assistant
                    </h3>
                    <span
                      className={cn(
                        "px-2 py-0.5 text-xs rounded-full font-medium",
                        versionInfo.bgColor,
                        versionInfo.color
                      )}
                    >
                      {platformVersion}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/80">
                    <span>
                      {questionUsage.used}/{questionUsage.limit} questions
                    </span>
                    {countdown && (
                      <>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{getResetMessage()}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full hover:bg-white/20 transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Messages Area */}
            <div
              className={cn("flex-1 overflow-y-auto p-4", colors.background)}
            >
              {messages.length === 0 ? (
                <div className="text-center space-y-6 h-full flex flex-col justify-center">
                  {/* Version-specific welcome */}
                  <div className="space-y-3">
                    <div className="flex justify-center">
                      <div
                        className={cn(
                          "p-3 rounded-2xl flex items-center gap-2",
                          versionInfo.bgColor,
                          versionInfo.color
                        )}
                      >
                        <VersionIcon className="w-6 h-6" />
                        <span className="font-semibold">
                          {versionInfo.name}
                        </span>
                      </div>
                    </div>

                    <p className={cn("text-sm mb-2", colors.text)}>
                      {getWelcomeMessage()}
                    </p>

                    {/* Feature highlights */}
                    <div className="grid grid-cols-1 gap-2">
                      {getFeatureHighlights().map((feature, index) => (
                        <div
                          key={index}
                          className={cn(
                            "flex items-center gap-2 p-2 rounded-lg text-sm",
                            colors.hoverBg
                          )}
                        >
                          <feature.icon className="w-4 h-4" />
                          <span className={colors.text}>{feature.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Suggested questions */}
                  <div className="space-y-2">
                    {suggestionsLoading
                      ? // Loading skeleton for suggestions
                        Array.from({ length: 4 }).map((_, index) => (
                          <div
                            key={index}
                            className={cn(
                              "w-full p-3 rounded-lg text-sm border animate-pulse",
                              colors.border
                            )}
                          >
                            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                          </div>
                        ))
                      : // Actual suggestions
                        suggestedQuestions.map((question, index) => (
                          <motion.button
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => setInput(question)}
                            className={cn(
                              "w-full text-left p-3 rounded-lg text-sm transition-all border hover:scale-[1.02]",
                              colors.hoverBg,
                              colors.text,
                              colors.border
                            )}
                          >
                            {question}
                          </motion.button>
                        ))}
                  </div>

                  {/* Usage info */}
                  <div className={cn("text-xs", colors.textMuted)}>
                    {questionUsage.limit === tierLimits.free.dailyLimit && (
                      <>
                        Free: {tierLimits.free.dailyLimit} questions every{" "}
                        {tierLimits.free.resetMinutes} minutes
                      </>
                    )}
                    {questionUsage.limit === tierLimits.pro.dailyLimit && (
                      <>
                        Pro: {tierLimits.pro.dailyLimit} questions every{" "}
                        {tierLimits.pro.resetMinutes} minutes
                      </>
                    )}
                    {questionUsage.limit === tierLimits.trial.dailyLimit && (
                      <>
                        Trial: {tierLimits.trial.dailyLimit} questions every{" "}
                        {tierLimits.trial.resetMinutes} minutes
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-3 ${
                        message.role === "user"
                          ? "flex-row-reverse"
                          : "flex-row"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          message.role === "user"
                            ? colors.primaryBg
                            : "bg-gray-400"
                        }`}
                      >
                        {message.role === "user" ? (
                          <User className="w-4 h-4 text-white" />
                        ) : (
                          <Bot className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <div
                        className={cn(
                          "px-4 py-2 rounded-2xl max-w-[80%]",
                          message.role === "user"
                            ? cn(colors.primaryBg, "text-white")
                            : cn(
                                colors.card,
                                colors.text,
                                colors.border,
                                "border"
                              )
                        )}
                      >
                        <p className="text-sm whitespace-pre-wrap">
                          {message.content}
                        </p>

                        {/* Message metadata */}
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
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
                                  "px-1.5 py-0.5 text-xs rounded",
                                  PLATFORM_VERSIONS[
                                    message.metadata
                                      .platformVersion as keyof typeof PLATFORM_VERSIONS
                                  ]?.bgColor,
                                  PLATFORM_VERSIONS[
                                    message.metadata
                                      .platformVersion as keyof typeof PLATFORM_VERSIONS
                                  ]?.color
                                )}
                              >
                                {message.metadata.platformVersion}
                              </span>
                            )}
                          </div>

                          <span className="text-xs text-gray-400">
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
                      <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div
                        className={cn(
                          "px-4 py-2 rounded-2xl",
                          colors.card,
                          colors.border,
                          "border"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                            <div
                              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.1s" }}
                            />
                            <div
                              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.2s" }}
                            />
                          </div>
                          <span className={cn("text-sm", colors.textMuted)}>
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
            <div className={cn("p-4 border-t", colors.border)}>
              {!questionUsage.canAsk && (
                <div
                  className={cn(
                    "mb-3 p-3 rounded-lg flex items-center gap-2 text-sm",
                    colors.warningBg,
                    colors.warningBorder
                  )}
                >
                  <AlertCircle className="w-4 h-4" />
                  <div className="flex-1">
                    <p className={colors.warningText}>
                      Limit reached ({questionUsage.limit} questions)
                    </p>
                    {countdown && (
                      <p className={cn("text-xs mt-1", colors.warningText)}>
                        Resets in{" "}
                        {countdown.minutes > 0
                          ? `${countdown.minutes}m ${countdown.seconds}s`
                          : `${countdown.seconds}s`}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
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
                    "flex-1 px-3 py-2 rounded-lg text-sm border focus:outline-none focus:ring-2 focus:ring-offset-2",
                    colors.background,
                    colors.border,
                    colors.text,
                    "focus:ring-orange-500",
                    !questionUsage.canAsk && "opacity-50 cursor-not-allowed"
                  )}
                  disabled={!questionUsage.canAsk || isLoading}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading || !questionUsage.canAsk}
                  className={cn(
                    "p-2 rounded-lg transition-all duration-200 disabled:opacity-50",
                    colors.primaryBg,
                    colors.textInverted,
                    "hover:scale-105 active:scale-95"
                  )}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>

              {/* Usage progress and upgrade prompt */}
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className={colors.textMuted}>
                  {questionUsage.canAsk
                    ? `${questionUsage.limit - questionUsage.used} questions left`
                    : "Limit reached"}
                </span>

                {questionUsage.limit === tierLimits.free.dailyLimit && (
                  <button
                    onClick={() =>
                      (window.location.href = "/dashboard/billing")
                    }
                    className={cn(
                      "flex items-center gap-1 px-2 py-1 rounded transition-colors",
                      colors.primary,
                      colors.hoverBg
                    )}
                  >
                    <Crown className="w-3 h-3" />
                    Upgrade for more
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
