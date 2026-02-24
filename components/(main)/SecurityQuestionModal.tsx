// components/modals/SecurityQuestionSetupModal.tsx - UPDATED
"use client";

import { useState } from "react";
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
  Cpu,
  Sparkles,
  Zap,
  Crown,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useThemeColors } from "@/hooks/useTheme";
import { motion } from "framer-motion";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Id } from "@/convex/_generated/dataModel";

interface SecurityQuestionSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userRole?: "musician" | "client" | "booker";
}

// Simple gradient palette for better readability
const SIMPLE_PALETTE = {
  primary: "from-blue-500 to-cyan-500",
  secondary: "from-purple-500 to-pink-500",
  success: "from-green-500 to-emerald-500",
  warning: "from-amber-500 to-orange-500",
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
  const [isCustom, setIsCustom] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { colors, isDarkMode } = useThemeColors();

  const updateSecurity = useMutation(
    api.controllers.user.updateSecurityQuestion,
  );
  const { user } = useCurrentUser();
  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const question = isCustom ? customQuestion.trim() : selectedQuestion;

    if (!question) {
      toast.error("Please select or enter a security question");
      return;
    }

    if (!answer.trim()) {
      toast.error("Please enter your answer");
      return;
    }

    if (answer.length < 3) {
      toast.error("Answer must be at least 3 characters");
      return;
    }

    setIsLoading(true);
    try {
      await updateSecurity({
        securityQuestion: question,
        securityAnswer: answer.trim(),
        clerkId: user?.clerkId || "",
      });

      toast.success("Security question set successfully!");
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to set security question");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSnooze = (hours: number) => {
    const snoozeTime = new Date(Date.now() + hours * 60 * 60 * 1000);
    localStorage.setItem("security_reminder_snooze", snoozeTime.toISOString());
    toast.success(`Reminder snoozed for ${hours} hours`);
    onClose();
  };

  const handleSkip = () => {
    localStorage.setItem("security_question_skipped", "true");
    toast.info("You can set up security later in your profile settings");
    onClose();
  };

  const generateCustomQuestion = () => {
    const suggestions = [
      "What was your favorite teacher's last name?",
      "What street did you grow up on?",
      "What was your first concert?",
      "What is your favorite sports team?",
      "What was your first job?",
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
          title: "Protect Gigs",
          description: "Secure your event postings from unauthorized changes",
        },
        {
          icon: Key,
          title: "Recover Access",
          description: "Regain access if you forget gig secret keys",
        },
        {
          icon: Users,
          title: "Build Trust",
          description: "Show musicians you take security seriously",
        },
        {
          icon: Building,
          title: "Prevent Issues",
          description: "Stop unauthorized booking modifications",
        },
      ];
    } else {
      return [
        {
          icon: FileText,
          title: "Secure Auditions",
          description: "Protect your music submissions and materials",
        },
        {
          icon: Calendar,
          title: "Performance Safety",
          description: "Keep your gig schedules and details secure",
        },
        {
          icon: Key,
          title: "Gig Recovery",
          description: "Recover access to your booked performances",
        },
        {
          icon: Award,
          title: "Build Credibility",
          description: "Show venues you're a professional artist",
        },
      ];
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden p-0 ">
        {/* Main Container - Simpler Design */}
        <div
          className={cn(
            "relative ",
            isDarkMode
              ? "bg-gradient-to-b from-gray-900 to-gray-800"
              : "bg-gradient-to-b from-white to-gray-50",
          )}
        >
          {/* Header */}
          <div className={`bg-gradient-to-r ${SIMPLE_PALETTE.primary} p-8`}>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-white">
                  Secure Your Account
                </DialogTitle>
                <DialogDescription className="text-blue-100">
                  Protect your gigs with a security question
                </DialogDescription>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-blue-200">
              <Clock className="w-4 h-4" />
              <span>Reminder appears every 5 minutes for your protection</span>
            </div>
          </div>

          {/* Content Area - Better Scroll */}
          <div className="p-6 max-h-[calc(85vh-200px)] overflow-y-auto">
            <div className="space-y-6">
              {/* Quick Benefits */}
              <div
                className={cn(
                  "rounded-xl p-5 border",
                  isDarkMode
                    ? "bg-gray-800/50 border-gray-700"
                    : "bg-blue-50/50 border-blue-100",
                )}
              >
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-blue-500" />
                  Why This Matters
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {getUserBenefits().map((benefit, index) => (
                    <div
                      key={index}
                      className={cn(
                        "p-3 rounded-lg flex items-start gap-3",
                        isDarkMode
                          ? "bg-gray-800/80 hover:bg-gray-700/80"
                          : "bg-white hover:bg-blue-50",
                      )}
                    >
                      <div
                        className={`p-2 rounded-lg bg-gradient-to-r ${SIMPLE_PALETTE.primary}`}
                      >
                        <benefit.icon className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{benefit.title}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {benefit.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Main Form */}
              <div
                className={cn(
                  "rounded-xl p-5 border",
                  isDarkMode
                    ? "bg-gray-800/30 border-gray-700"
                    : "bg-white border-gray-200",
                )}
              >
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Question Type Toggle */}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg">Security Question</h3>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={!isCustom ? "default" : "outline"}
                        size="sm"
                        onClick={() => setIsCustom(false)}
                        className={cn(
                          "px-3",
                          !isCustom &&
                            `bg-gradient-to-r ${SIMPLE_PALETTE.primary}`,
                        )}
                      >
                        Choose One
                      </Button>
                      <Button
                        type="button"
                        variant={isCustom ? "default" : "outline"}
                        size="sm"
                        onClick={() => setIsCustom(true)}
                        className={cn(
                          "px-3",
                          isCustom &&
                            `bg-gradient-to-r ${SIMPLE_PALETTE.secondary}`,
                        )}
                      >
                        Custom
                      </Button>
                    </div>
                  </div>

                  {/* Question Selection */}
                  {isCustom ? (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="custom-question" className="mb-2 block">
                          Your Custom Question
                        </Label>
                        <div className="flex gap-2 mb-3">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={generateCustomQuestion}
                            className="text-sm"
                          >
                            <Sparkles className="w-4 h-4 mr-2" />
                            Suggest a Question
                          </Button>
                        </div>
                        <Textarea
                          id="custom-question"
                          placeholder="Type your own security question..."
                          value={customQuestion}
                          onChange={(e) => setCustomQuestion(e.target.value)}
                          className="min-h-[80px] resize-none"
                          required
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Label>Select a Security Question</Label>
                      <Select
                        value={selectedQuestion}
                        onValueChange={setSelectedQuestion}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Choose a question..." />
                        </SelectTrigger>
                        <SelectContent>
                          {SECURITY_QUESTIONS.map((question, index) => (
                            <SelectItem key={index} value={question}>
                              {question}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-gray-500">
                        Choose a question only you know the answer to
                      </p>
                    </div>
                  )}

                  {/* Answer Input */}
                  <div className="space-y-4">
                    <Label htmlFor="answer">Your Answer</Label>
                    <div className="relative">
                      <Input
                        id="answer"
                        type={showAnswer ? "text" : "password"}
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        placeholder="Enter your answer..."
                        className="pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowAnswer(!showAnswer)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showAnswer ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <p className="text-sm text-gray-500">
                      This helps recover access if you forget gig secrets. Case
                      doesn't matter.
                    </p>
                  </div>

                  {/* Security Tips */}
                  <div
                    className={cn(
                      "p-4 rounded-lg border",
                      isDarkMode
                        ? "bg-amber-900/20 border-amber-800"
                        : "bg-amber-50 border-amber-200",
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-amber-700 dark:text-amber-300 mb-2">
                          Security Tips
                        </h4>
                        <ul className="text-sm text-amber-600 dark:text-amber-400 space-y-1">
                          <li>• Pick an answer that's easy to remember</li>
                          <li>• Avoid answers that others could guess</li>
                          <li>• Don't use the same answer everywhere</li>
                          <li>• Your answer is kept private and secure</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Main Action Button - NOW VISIBLE! */}
                  <div className="pt-4">
                    <Button
                      type="submit"
                      className={cn(
                        "w-full py-6 text-base font-semibold",
                        `bg-gradient-to-r ${SIMPLE_PALETTE.primary} hover:opacity-90`,
                      )}
                      disabled={
                        isLoading || (!isCustom && !selectedQuestion) || !answer
                      }
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Setting Up Security...
                        </>
                      ) : (
                        <>
                          <Shield className="w-5 h-5 mr-2" />
                          Activate Account Security
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Footer - Secondary Actions */}
          <div
            className={cn(
              "p-6 border-t mb-10",
              isDarkMode
                ? "border-gray-700 bg-gray-900/50"
                : "border-gray-200 bg-gray-50",
            )}
          >
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p>This helps protect your gigs and bookings</p>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => handleSnooze(1)}
                  className="text-sm"
                  disabled={isLoading}
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Remind Later
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleSkip}
                  className="text-sm text-gray-600 hover:text-gray-800"
                  disabled={isLoading}
                >
                  Skip for Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
