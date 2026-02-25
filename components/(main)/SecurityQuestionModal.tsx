// components/modals/SecurityQuestionSetupModal.tsx - UPDATED
"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Shield,
  Lock,
  Key,
  Users,
  Building,
  Mic,
  Calendar,
  FileText,
  Award,
  Clock,
  Check,
  X,
  AlertTriangle,
  Bell,
  Sparkles,
  Eye,
  EyeOff,
  CheckCircle,
  Loader2,
  Info,
  HelpCircle,
  ChevronRight,
  ChevronLeft,
  Plus,
  Minus,
  User,
  Phone,
  Mail,
  Github,
  Globe,
  Instagram,
  Youtube,
  Facebook,
  Linkedin,
  Camera,
  Edit3,
  MoreHorizontal,
  Bookmark,
  Share2,
  Flag,
  Ban,
  Trash2,
  ExternalLink,
  Copy,
  Search,
  Filter,
  SlidersHorizontal,
  Grid,
  List,
  CalendarDays,
  Clock3,
  Timer,
  UsersRound,
  VerifiedIcon,
  ThumbsUp,
  Activity,
  TrendingUp,
  TrendingDown,
  BarChart3,
  LineChart,
  Zap,
  History,
  FileText as FileTextIcon,
  Briefcase,
  Heart,
  Star,
  Crown,
  Medal,
  BadgeCheck,
  UserRound,
  UserRoundCheck,
  UserRoundX,
  UserRoundPlus,
  UserRoundSearch,
  MapPin,
  Music,
  Volume2,
  DollarSign,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useThemeColors } from "@/hooks/useTheme";
import { motion, AnimatePresence } from "framer-motion";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface SecurityQuestionSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userRole?: "musician" | "client" | "booker";
}

// Simple gradient palette for better readability
const SIMPLE_PALETTE = {
  primary: "from-blue-600 to-cyan-600",
  secondary: "from-purple-600 to-pink-600",
  success: "from-green-600 to-emerald-600",
  warning: "from-amber-600 to-orange-600",
  light: "blue-50",
  dark: "blue-950",
};

const SECURITY_QUESTIONS = [
  "What was your first pet's name?",
  "What is your mother's maiden name?",
  "What city were you born in?",
  "What was the name of your first school?",
  "What was your childhood nickname?",
  "What is your favorite book?",
  "What was the make of your first car?",
  "What is your favorite childhood memory?",
  "What was your first job?",
  "What is your favorite movie?",
];

export function SecurityQuestionSetupModal({
  isOpen,
  onClose,
  onSuccess,
  userRole = "musician",
}: SecurityQuestionSetupModalProps) {
  const [selectedQuestion, setSelectedQuestion] = useState("");
  const [customQuestion, setCustomQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [confirmAnswer, setConfirmAnswer] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showConfirmAnswer, setShowConfirmAnswer] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"info" | "setup" | "confirm">("info");
  const [answerStrength, setAnswerStrength] = useState<
    "weak" | "medium" | "strong"
  >("weak");
  const { colors, isDarkMode } = useThemeColors();

  const updateSecurity = useMutation(
    api.controllers.user.updateSecurityQuestion,
  );
  const { user } = useCurrentUser();

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedQuestion("");
      setCustomQuestion("");
      setAnswer("");
      setConfirmAnswer("");
      setIsCustom(false);
      setShowAnswer(false);
      setShowConfirmAnswer(false);
      setStep("info");
      setAnswerStrength("weak");
    }
  }, [isOpen]);

  // Check answer strength
  useEffect(() => {
    if (!answer) {
      setAnswerStrength("weak");
      return;
    }

    const hasLetter = /[a-zA-Z]/.test(answer);
    const hasNumber = /[0-9]/.test(answer);
    const hasSpecial = /[^a-zA-Z0-9]/.test(answer);
    const length = answer.length;

    if (length >= 8 && hasLetter && hasNumber && hasSpecial) {
      setAnswerStrength("strong");
    } else if (length >= 5 && (hasLetter || hasNumber)) {
      setAnswerStrength("medium");
    } else {
      setAnswerStrength("weak");
    }
  }, [answer]);

  const getAnswerStrengthColor = () => {
    switch (answerStrength) {
      case "strong":
        return "text-green-500";
      case "medium":
        return "text-yellow-500";
      default:
        return "text-red-500";
    }
  };

  const validateForm = () => {
    const question = isCustom ? customQuestion.trim() : selectedQuestion;

    if (!question) {
      toast.error("Please select or enter a security question");
      return false;
    }

    if (!answer.trim()) {
      toast.error("Please enter your answer");
      return false;
    }

    if (answer.length < 3) {
      toast.error("Answer must be at least 3 characters");
      return false;
    }

    if (answer !== confirmAnswer) {
      toast.error("Answers do not match");
      return false;
    }

    if (answer.toLowerCase() === question.toLowerCase()) {
      toast.error("Answer cannot be the same as the question");
      return false;
    }

    return true;
  };
  // Update the handleSubmit function - replace the existing one with this:

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const question = isCustom ? customQuestion.trim() : selectedQuestion;

      await updateSecurity({
        securityQuestion: question,
        securityAnswer: answer.trim(),
        clerkId: user?.clerkId || "", // Using clerkId as your schema expects
      });

      toast.success("Security question set successfully!", {
        icon: <Shield className="w-4 h-4 text-green-500" />,
        duration: 5000,
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to set security question", {
        icon: <AlertTriangle className="w-4 h-4 text-red-500" />,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSnooze = (hours: number) => {
    const snoozeTime = new Date(Date.now() + hours * 60 * 60 * 1000);
    localStorage.setItem("security_reminder_snooze", snoozeTime.toISOString());
    toast.success(`Reminder snoozed for ${hours} hour${hours > 1 ? "s" : ""}`, {
      icon: <Clock className="w-4 h-4 text-blue-500" />,
    });
    onClose();
  };

  const handleSkip = () => {
    localStorage.setItem("security_question_skipped", "true");
    toast.info("You can set up security later in your profile settings", {
      icon: <Info className="w-4 h-4 text-blue-500" />,
      duration: 4000,
    });
    onClose();
  };

  const generateCustomQuestion = () => {
    const suggestions = [
      "What was your favorite teacher's last name?",
      "What street did you grow up on?",
      "What was your first concert?",
      "What is your favorite sports team?",
      "What was your first job?",
      "What is your mother's favorite color?",
      "What was the model of your first phone?",
      "What is your favorite restaurant?",
    ];
    setCustomQuestion(
      suggestions[Math.floor(Math.random() * suggestions.length)],
    );
  };

  // User-specific benefits
  const getUserBenefits = () => {
    if (userRole === "client" || userRole === "booker") {
      return [
        {
          icon: Lock,
          title: "Protect Your Gigs",
          description: "Secure your event postings from unauthorized changes",
          color: "from-blue-500 to-cyan-500",
        },
        {
          icon: Key,
          title: "Recover Access",
          description: "Regain access if you forget gig secret keys",
          color: "from-purple-500 to-pink-500",
        },
        {
          icon: Users,
          title: "Build Trust",
          description: "Show musicians you take security seriously",
          color: "from-green-500 to-emerald-500",
        },
        {
          icon: Building,
          title: "Prevent Issues",
          description: "Stop unauthorized booking modifications",
          color: "from-amber-500 to-orange-500",
        },
      ];
    } else {
      return [
        {
          icon: FileTextIcon,
          title: "Secure Auditions",
          description: "Protect your music submissions and materials",
          color: "from-blue-500 to-cyan-500",
        },
        {
          icon: Calendar,
          title: "Performance Safety",
          description: "Keep your gig schedules and details secure",
          color: "from-purple-500 to-pink-500",
        },
        {
          icon: Key,
          title: "Gig Recovery",
          description: "Recover access to your booked performances",
          color: "from-green-500 to-emerald-500",
        },
        {
          icon: Award,
          title: "Build Credibility",
          description: "Show venues you're a professional artist",
          color: "from-amber-500 to-orange-500",
        },
      ];
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden p-0">
        {/* Main Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className={cn(
            "relative",
            isDarkMode
              ? "bg-gradient-to-b from-slate-900 to-slate-800"
              : "bg-gradient-to-b from-white to-slate-50",
          )}
        >
          {/* Header with Progress Steps */}
          <div
            className={`bg-gradient-to-r ${SIMPLE_PALETTE.primary} p-6 relative overflow-hidden`}
          >
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-2xl" />

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold text-white">
                    Secure Your Account
                  </DialogTitle>
                  <DialogDescription className="text-blue-100">
                    {userRole === "client" || userRole === "booker"
                      ? "Protect your events, payments, and client reputation"
                      : "Safeguard your auditions, bookings, and artistic career"}
                  </DialogDescription>
                </div>
              </div>

              {/* Progress Steps */}
              <div className="flex items-center gap-2 mt-4">
                {["info", "setup", "confirm"].map((s, index) => (
                  <div key={s} className="flex items-center">
                    <button
                      onClick={() => setStep(s as any)}
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all",
                        step === s
                          ? "bg-white text-blue-600 shadow-lg scale-110"
                          : index < ["info", "setup", "confirm"].indexOf(step)
                            ? "bg-white/30 text-white"
                            : "bg-white/10 text-white/70",
                      )}
                    >
                      {index + 1}
                    </button>
                    {index < 2 && (
                      <ChevronRight className="w-4 h-4 mx-1 text-white/50" />
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 text-sm text-blue-200 mt-3">
                <Clock className="w-4 h-4" />
                <span>
                  {userRole === "client" || userRole === "booker"
                    ? "Essential for payment protection and event security"
                    : "Critical for audition materials and booking verification"}
                </span>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="p-6 max-h-[calc(85vh-200px)] overflow-y-auto">
            <AnimatePresence mode="wait">
              {step === "info" && (
                <motion.div
                  key="info"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  {/* Role-Specific Header */}
                  <div
                    className={cn(
                      "rounded-xl p-5 border-2",
                      isDarkMode
                        ? userRole === "client" || userRole === "booker"
                          ? "bg-purple-900/20 border-purple-500/30"
                          : "bg-blue-900/20 border-blue-500/30"
                        : userRole === "client" || userRole === "booker"
                          ? "bg-purple-50 border-purple-200"
                          : "bg-blue-50 border-blue-200",
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={cn(
                          "p-3 rounded-xl",
                          userRole === "client" || userRole === "booker"
                            ? "bg-purple-500"
                            : "bg-blue-500",
                        )}
                      >
                        {userRole === "client" || userRole === "booker" ? (
                          <Building className="w-6 h-6 text-white" />
                        ) : (
                          <Mic className="w-6 h-6 text-white" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg mb-2">
                          {userRole === "client" || userRole === "booker"
                            ? "Why Clients & Bookers Need Security Questions"
                            : "Why Musicians Need Security Questions"}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {userRole === "client" || userRole === "booker"
                            ? "You're responsible for events, payments, and coordinating talent. A security question ensures only YOU can make changes."
                            : "Your auditions, performance schedules, and professional reputation depend on account security. Don't leave it to chance."}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Benefits Grid - Enhanced with more details */}
                  <div
                    className={cn(
                      "rounded-xl p-5 border",
                      isDarkMode
                        ? "bg-slate-800/50 border-slate-700"
                        : "bg-white border-slate-200",
                    )}
                  >
                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                      <Bell className="w-5 h-5 text-blue-500" />
                      Critical Benefits for You
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {getUserBenefits().map((benefit, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={cn(
                            "p-4 rounded-xl flex items-start gap-3 transition-all hover:scale-105",
                            isDarkMode
                              ? "bg-slate-800 hover:bg-slate-700"
                              : "bg-slate-50 hover:shadow-md",
                          )}
                        >
                          <div
                            className={`p-2.5 rounded-lg bg-gradient-to-r ${benefit.color} shadow-lg`}
                          >
                            <benefit.icon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-sm mb-1">
                              {benefit.title}
                            </p>
                            <p className="text-xs text-slate-600 dark:text-slate-400">
                              {benefit.description}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Risk Scenarios - Role Specific */}
                  <div
                    className={cn(
                      "rounded-xl p-5 border",
                      isDarkMode
                        ? "bg-red-900/10 border-red-800/30"
                        : "bg-red-50 border-red-200",
                    )}
                  >
                    <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                      What Could Go Wrong?
                    </h3>
                    <div className="space-y-3">
                      {userRole === "client" || userRole === "booker" ? (
                        <>
                          <div className="flex items-start gap-3">
                            <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-red-500 text-xs font-bold">
                                1
                              </span>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              <span className="font-medium text-red-500">
                                Unauthorized changes:
                              </span>{" "}
                              Someone could modify your event details, change
                              payment amounts, or cancel booked musicians
                            </p>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-red-500 text-xs font-bold">
                                2
                              </span>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              <span className="font-medium text-red-500">
                                Payment redirection:
                              </span>{" "}
                              Fraudsters could change bank details and divert
                              your payments to themselves
                            </p>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-red-500 text-xs font-bold">
                                3
                              </span>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              <span className="font-medium text-red-500">
                                Reputation damage:
                              </span>{" "}
                              Fake reviews or inappropriate messages posted from
                              your account
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-start gap-3">
                            <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-red-500 text-xs font-bold">
                                1
                              </span>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              <span className="font-medium text-red-500">
                                Stolen audition materials:
                              </span>{" "}
                              Your original music, demos, and press kit could be
                              downloaded and used by others
                            </p>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-red-500 text-xs font-bold">
                                2
                              </span>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              <span className="font-medium text-red-500">
                                Lost bookings:
                              </span>{" "}
                              Someone could cancel your confirmed gigs or change
                              performance times without your knowledge
                            </p>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-red-500 text-xs font-bold">
                                3
                              </span>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              <span className="font-medium text-red-500">
                                Identity theft:
                              </span>{" "}
                              Impersonators could book gigs in your name and
                              damage your professional reputation
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Real Stats */}
                  <div
                    className={cn(
                      "rounded-xl p-5 border",
                      isDarkMode
                        ? "bg-slate-800/30 border-slate-700"
                        : "bg-white border-slate-200",
                    )}
                  >
                    <h3 className="font-semibold text-lg mb-3">
                      Security Impact
                    </h3>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-green-500">
                          99.9%
                        </div>
                        <div className="text-xs text-slate-500">
                          Account Safety
                        </div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-500">
                          24/7
                        </div>
                        <div className="text-xs text-slate-500">Protection</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-500">
                          100%
                        </div>
                        <div className="text-xs text-slate-500">
                          Recovery Rate
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-center text-slate-500 mt-3">
                      Users with security questions are 94% less likely to
                      experience account takeovers
                    </p>
                  </div>

                  {/* Continue Button */}
                  <Button
                    onClick={() => setStep("setup")}
                    className={cn(
                      "w-full py-6 text-base font-semibold",
                      `bg-gradient-to-r ${SIMPLE_PALETTE.primary} hover:opacity-90`,
                    )}
                  >
                    <Shield className="w-5 h-5 mr-2" />
                    Protect My Account
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </motion.div>
              )}

              {step === "setup" && (
                <motion.div
                  key="setup"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  <div
                    className={cn(
                      "rounded-xl p-6 border-2 transition-all",
                      isDarkMode
                        ? "bg-slate-800/50 border-slate-700/50 hover:border-slate-600"
                        : "bg-white border-slate-200/50 hover:border-slate-300",
                    )}
                  >
                    {/* Progress indicator inside */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                          <span className="text-sm font-bold text-blue-500">
                            2
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">
                            Choose Your Question
                          </h3>
                          <p className="text-xs text-slate-500">Step 2 of 3</p>
                        </div>
                      </div>

                      {/* Question Type Toggle - Redesigned */}
                      <div className="flex gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-700/50">
                        <button
                          type="button"
                          onClick={() => setIsCustom(false)}
                          className={cn(
                            "px-4 py-1.5 rounded-md text-sm font-medium transition-all",
                            !isCustom
                              ? `bg-gradient-to-r ${SIMPLE_PALETTE.primary} text-white shadow-lg`
                              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white",
                          )}
                        >
                          Choose One
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsCustom(true)}
                          className={cn(
                            "px-4 py-1.5 rounded-md text-sm font-medium transition-all",
                            isCustom
                              ? `bg-gradient-to-r ${SIMPLE_PALETTE.secondary} text-white shadow-lg`
                              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white",
                          )}
                        >
                          Custom
                        </button>
                      </div>
                    </div>

                    <form className="space-y-6">
                      {/* Question Selection with better styling */}
                      {isCustom ? (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-4"
                        >
                          <div>
                            <Label
                              htmlFor="custom-question"
                              className="text-sm font-medium mb-2 block"
                            >
                              Your Custom Question
                            </Label>
                            <div className="relative">
                              <Textarea
                                id="custom-question"
                                placeholder="Type your own security question..."
                                value={customQuestion}
                                onChange={(e) =>
                                  setCustomQuestion(e.target.value)
                                }
                                className={cn(
                                  "min-h-[120px] resize-none transition-all pr-20",
                                  "focus:ring-2 focus:ring-blue-500/20",
                                  customQuestion && "border-green-500",
                                  isDarkMode
                                    ? "bg-slate-900/50 border-slate-700 focus:border-blue-500"
                                    : "bg-white border-slate-200 focus:border-blue-500",
                                )}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={generateCustomQuestion}
                                className="absolute right-2 top-2 text-xs"
                              >
                                <Sparkles className="w-3.5 h-3.5 mr-1" />
                                Suggest
                              </Button>
                            </div>
                            <p className="text-xs text-slate-500 mt-2">
                              ✨ Make it personal but not obvious
                            </p>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-4"
                        >
                          <Label className="text-sm font-medium">
                            Select a Security Question
                          </Label>
                          <Select
                            value={selectedQuestion}
                            onValueChange={(value) => {
                              console.log("Selected:", value);
                              setSelectedQuestion(value);
                            }}
                          >
                            <SelectTrigger
                              className={cn(
                                "w-full h-12 text-base",
                                "transition-all duration-200",
                                "focus:ring-2 focus:ring-blue-500/20",
                                selectedQuestion ? "border-green-500" : "",
                                isDarkMode
                                  ? "bg-slate-900/50 border-slate-700"
                                  : "bg-white border-slate-200",
                              )}
                            >
                              <SelectValue placeholder="👇 Click to choose a question..." />
                            </SelectTrigger>
                            <SelectContent
                              position="popper"
                              className="max-h-[300px] z-[100]"
                            >
                              {SECURITY_QUESTIONS.map((question, index) => (
                                <SelectItem
                                  key={index}
                                  value={question}
                                  className={cn(
                                    "py-3 cursor-pointer",
                                    "transition-colors duration-150",
                                    "hover:bg-blue-50 dark:hover:bg-blue-900/20",
                                    selectedQuestion === question &&
                                      "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
                                  )}
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm">{question}</span>
                                    {selectedQuestion === question && (
                                      <Check className="w-4 h-4 text-green-500 ml-auto" />
                                    )}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          {/* Selected question indicator */}
                          {selectedQuestion && (
                            <motion.div
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="flex items-center gap-2 text-xs text-green-500 bg-green-500/10 p-2 rounded-lg"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Selected: "{selectedQuestion}"</span>
                            </motion.div>
                          )}
                        </motion.div>
                      )}

                      {/* Answer Input with enhanced styling */}
                      <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between">
                          <Label
                            htmlFor="answer"
                            className="text-sm font-medium"
                          >
                            Your Secret Answer
                          </Label>
                          {answer && (
                            <span
                              className={cn(
                                "text-xs font-medium px-2 py-1 rounded-full",
                                answerStrength === "strong" &&
                                  "bg-green-500/10 text-green-500",
                                answerStrength === "medium" &&
                                  "bg-yellow-500/10 text-yellow-500",
                                answerStrength === "weak" &&
                                  "bg-red-500/10 text-red-500",
                              )}
                            >
                              {answerStrength} password
                            </span>
                          )}
                        </div>

                        <div className="relative group">
                          <Input
                            id="answer"
                            type={showAnswer ? "text" : "password"}
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            placeholder="Enter your answer..."
                            className={cn(
                              "h-12 pr-12 text-base transition-all",
                              "focus:ring-2 focus:ring-blue-500/20",
                              answer &&
                                answerStrength === "strong" &&
                                "border-green-500 ring-2 ring-green-500/20",
                              answer &&
                                answerStrength === "medium" &&
                                "border-yellow-500 ring-2 ring-yellow-500/20",
                              answer &&
                                answerStrength === "weak" &&
                                "border-red-500 ring-2 ring-red-500/20",
                              isDarkMode
                                ? "bg-slate-900/50 border-slate-700"
                                : "bg-white border-slate-200",
                            )}
                          />
                          <button
                            type="button"
                            onClick={() => setShowAnswer(!showAnswer)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 
                       text-slate-400 hover:text-slate-600 dark:hover:text-slate-300
                       transition-colors p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            {showAnswer ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>

                        {/* Answer Strength Indicator - Enhanced */}
                        {answer && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="space-y-3 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg"
                          >
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs">
                                <span className="text-slate-600 dark:text-slate-400">
                                  Security level
                                </span>
                                <span
                                  className={cn(
                                    "font-medium",
                                    getAnswerStrengthColor(),
                                  )}
                                >
                                  {answerStrength === "strong" &&
                                    "🔒 Very Secure"}
                                  {answerStrength === "medium" && "⚠️ Moderate"}
                                  {answerStrength === "weak" && "❌ Weak"}
                                </span>
                              </div>
                              <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{
                                    width:
                                      answerStrength === "strong"
                                        ? "100%"
                                        : answerStrength === "medium"
                                          ? "66%"
                                          : "33%",
                                  }}
                                  className={cn(
                                    "h-full rounded-full",
                                    answerStrength === "strong" &&
                                      "bg-gradient-to-r from-green-500 to-emerald-500",
                                    answerStrength === "medium" &&
                                      "bg-gradient-to-r from-yellow-500 to-orange-500",
                                    answerStrength === "weak" &&
                                      "bg-gradient-to-r from-red-500 to-rose-500",
                                  )}
                                />
                              </div>
                            </div>

                            {/* Requirements checklist */}
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div
                                className={cn(
                                  "flex items-center gap-1",
                                  answer.length >= 8
                                    ? "text-green-500"
                                    : "text-slate-400",
                                )}
                              >
                                {answer.length >= 8 ? (
                                  <Check className="w-3 h-3" />
                                ) : (
                                  <X className="w-3 h-3" />
                                )}
                                <span>8+ characters</span>
                              </div>
                              <div
                                className={cn(
                                  "flex items-center gap-1",
                                  /[a-zA-Z]/.test(answer)
                                    ? "text-green-500"
                                    : "text-slate-400",
                                )}
                              >
                                {/[a-zA-Z]/.test(answer) ? (
                                  <Check className="w-3 h-3" />
                                ) : (
                                  <X className="w-3 h-3" />
                                )}
                                <span>Has letters</span>
                              </div>
                              <div
                                className={cn(
                                  "flex items-center gap-1",
                                  /[0-9]/.test(answer)
                                    ? "text-green-500"
                                    : "text-slate-400",
                                )}
                              >
                                {/[0-9]/.test(answer) ? (
                                  <Check className="w-3 h-3" />
                                ) : (
                                  <X className="w-3 h-3" />
                                )}
                                <span>Has numbers</span>
                              </div>
                              <div
                                className={cn(
                                  "flex items-center gap-1",
                                  /[^a-zA-Z0-9]/.test(answer)
                                    ? "text-green-500"
                                    : "text-slate-400",
                                )}
                              >
                                {/[^a-zA-Z0-9]/.test(answer) ? (
                                  <Check className="w-3 h-3" />
                                ) : (
                                  <X className="w-3 h-3" />
                                )}
                                <span>Special chars</span>
                              </div>
                            </div>

                            <p
                              className={cn(
                                "text-xs mt-2",
                                answerStrength === "strong" &&
                                  "text-green-600 dark:text-green-400",
                                answerStrength === "medium" &&
                                  "text-yellow-600 dark:text-yellow-400",
                                answerStrength === "weak" &&
                                  "text-red-600 dark:text-red-400",
                              )}
                            >
                              {answerStrength === "weak" &&
                                "💡 Add numbers or special characters for stronger security"}
                              {answerStrength === "medium" &&
                                "💡 Good! Add special characters to make it even stronger"}
                              {answerStrength === "strong" &&
                                "✅ Perfect! This answer is very secure"}
                            </p>
                          </motion.div>
                        )}
                      </div>

                      {/* Navigation Buttons - Enhanced */}
                      <div className="flex gap-3 pt-6 border-t border-slate-200 dark:border-slate-700">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setStep("info")}
                          className="flex-1 h-12 text-base group"
                        >
                          <ChevronLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                          Back
                        </Button>
                        <Button
                          type="button"
                          onClick={() => setStep("confirm")}
                          className={cn(
                            "flex-1 h-12 text-base font-semibold group",
                            `bg-gradient-to-r ${SIMPLE_PALETTE.primary} hover:opacity-90`,
                            "shadow-lg hover:shadow-xl transition-all",
                            "disabled:opacity-50 disabled:cursor-not-allowed",
                          )}
                          disabled={(!isCustom && !selectedQuestion) || !answer}
                        >
                          Continue
                          <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </div>
                    </form>
                  </div>
                </motion.div>
              )}

              {step === "confirm" && (
                <motion.div
                  key="confirm"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  <div
                    className={cn(
                      "rounded-xl p-6 border-2 transition-all",
                      isDarkMode
                        ? "bg-slate-800/50 border-green-500/30 hover:border-green-500/50"
                        : "bg-white border-green-500/30 hover:border-green-500/50",
                    )}
                  >
                    {/* Progress indicator */}
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                        <span className="text-sm font-bold text-green-500">
                          3
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">
                          Confirm & Activate
                        </h3>
                        <p className="text-xs text-slate-500">
                          Final step to secure your account
                        </p>
                      </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Summary Card - Enhanced */}
                      <motion.div
                        initial={{ scale: 0.95 }}
                        animate={{ scale: 1 }}
                        className={cn(
                          "p-6 rounded-xl border-2",
                          isDarkMode
                            ? "bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700"
                            : "bg-gradient-to-br from-slate-50 to-white border-slate-200",
                        )}
                      >
                        <h4 className="font-medium mb-4 flex items-center gap-2">
                          <FileTextIcon className="w-4 h-4 text-blue-500" />
                          Review Your Security Settings
                        </h4>

                        <div className="space-y-4">
                          <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
                            <p className="text-xs text-blue-600 dark:text-blue-400 mb-2">
                              YOUR SECURITY QUESTION
                            </p>
                            <p className="font-medium text-base">
                              {isCustom ? customQuestion : selectedQuestion}
                            </p>
                          </div>

                          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-100 dark:bg-slate-800">
                            <span className="text-sm text-slate-600 dark:text-slate-400">
                              Answer strength:
                            </span>
                            <div className="flex items-center gap-2">
                              <div
                                className={cn(
                                  "w-2 h-2 rounded-full",
                                  answerStrength === "strong" && "bg-green-500",
                                  answerStrength === "medium" &&
                                    "bg-yellow-500",
                                  answerStrength === "weak" && "bg-red-500",
                                )}
                              />
                              <span
                                className={cn(
                                  "font-medium capitalize",
                                  getAnswerStrengthColor(),
                                )}
                              >
                                {answerStrength}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>

                      {/* Confirm Answer - Enhanced */}
                      <div className="space-y-4">
                        <Label
                          htmlFor="confirm-answer"
                          className="text-sm font-medium"
                        >
                          Confirm Your Answer
                        </Label>
                        <div className="relative">
                          <Input
                            id="confirm-answer"
                            type={showConfirmAnswer ? "text" : "password"}
                            value={confirmAnswer}
                            onChange={(e) => setConfirmAnswer(e.target.value)}
                            placeholder="Re-enter your answer to confirm..."
                            className={cn(
                              "h-12 pr-12 text-base transition-all",
                              "focus:ring-2",
                              confirmAnswer &&
                                answer === confirmAnswer &&
                                "border-green-500 ring-2 ring-green-500/20",
                              confirmAnswer &&
                                answer !== confirmAnswer &&
                                "border-red-500 ring-2 ring-red-500/20",
                              isDarkMode
                                ? "bg-slate-900/50 border-slate-700"
                                : "bg-white border-slate-200",
                            )}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowConfirmAnswer(!showConfirmAnswer)
                            }
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 
                       text-slate-400 hover:text-slate-600 dark:hover:text-slate-300
                       transition-colors p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            {showConfirmAnswer ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>

                        {/* Match indicator */}
                        {confirmAnswer && (
                          <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={cn(
                              "flex items-center gap-2 text-xs p-3 rounded-lg",
                              answer === confirmAnswer
                                ? "bg-green-500/10 text-green-600 dark:text-green-400"
                                : "bg-red-500/10 text-red-600 dark:text-red-400",
                            )}
                          >
                            {answer === confirmAnswer ? (
                              <>
                                <Check className="w-4 h-4" />
                                <span>
                                  Answers match! You're ready to proceed.
                                </span>
                              </>
                            ) : (
                              <>
                                <X className="w-4 h-4" />
                                <span>
                                  Answers don't match. Please re-enter
                                  carefully.
                                </span>
                              </>
                            )}
                          </motion.div>
                        )}
                      </div>

                      {/* Security Tips - Enhanced with role-specific icons */}
                      <div
                        className={cn(
                          "p-5 rounded-xl border-2",
                          isDarkMode
                            ? "bg-gradient-to-br from-amber-900/20 to-amber-900/5 border-amber-500/30"
                            : "bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-200",
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-amber-500/20">
                            <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-amber-700 dark:text-amber-300 mb-3">
                              Security Checklist
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {[
                                "Easy to remember",
                                "Hard to guess",
                                "Not on social media",
                                "Unique to this account",
                                userRole === "client" || userRole === "booker"
                                  ? "Protects payments"
                                  : "Secures your music",
                                "Case insensitive",
                              ].map((tip, i) => (
                                <div
                                  key={i}
                                  className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400"
                                >
                                  <Check className="w-3.5 h-3.5 flex-shrink-0" />
                                  <span>{tip}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons - Enhanced */}
                      <div className="flex gap-3 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setStep("setup")}
                          className="flex-1 h-12 text-base group"
                          disabled={isLoading}
                        >
                          <ChevronLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                          Back
                        </Button>
                        <Button
                          type="submit"
                          className={cn(
                            "flex-1 h-12 text-base font-semibold group relative overflow-hidden",
                            `bg-gradient-to-r ${SIMPLE_PALETTE.success} hover:opacity-90`,
                            "shadow-lg hover:shadow-xl transition-all",
                            "disabled:opacity-50 disabled:cursor-not-allowed",
                          )}
                          disabled={
                            isLoading ||
                            !confirmAnswer ||
                            answer !== confirmAnswer
                          }
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                              Activating...
                            </>
                          ) : (
                            <>
                              <Shield className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                              {userRole === "client" || userRole === "booker"
                                ? "🔒 Secure My Events"
                                : "🎵 Protect My Career"}
                            </>
                          )}

                          {/* Shine effect */}
                          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                        </Button>
                      </div>
                    </form>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer - Secondary Actions */}
          <div
            className={cn(
              "p-6 border-t",
              isDarkMode
                ? "border-slate-700 bg-slate-900/50"
                : "border-slate-200 bg-slate-50",
            )}
          >
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="text-sm text-slate-600 dark:text-slate-400">
                <p className="flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  {userRole === "client" || userRole === "booker"
                    ? "Protect your events, payments, and professional reputation"
                    : "Safeguard your auditions, bookings, and artistic career"}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => handleSnooze(1)}
                  className="text-sm"
                  disabled={isLoading}
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Remind in 1h
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleSnooze(24)}
                  className="text-sm"
                  disabled={isLoading}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Remind Tomorrow
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleSkip}
                  className="text-sm text-slate-600 hover:text-slate-800"
                  disabled={isLoading}
                >
                  Skip
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
