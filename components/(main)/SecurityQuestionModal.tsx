// components/modals/SecurityQuestionSetupModal.tsx - DARK NAVY THEME
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
  Eye,
  EyeOff,
  Loader2,
  AlertTriangle,
  Check,
  X,
  ChevronRight,
  ChevronLeft,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface SecurityQuestionSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userRole?: "musician" | "client" | "booker";
}

const SECURITY_QUESTIONS = [
  "What was your first pet's name?",
  "What is your mother's maiden name?",
  "What city were you born in?",
  "What was the name of your first school?",
  "What was your childhood nickname?",
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
  const [step, setStep] = useState<"info" | "setup">("info");

  const updateSecurity = useMutation(api.controllers.user.updateSecurityQuestion);
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
    }
  }, [isOpen]);

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

    if (answer.length < 2) {
      toast.error("Answer must be at least 2 characters");
      return false;
    }

    if (answer !== confirmAnswer) {
      toast.error("Answers do not match");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const question = isCustom ? customQuestion.trim() : selectedQuestion;

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

  const handleSkip = () => {
    localStorage.setItem("security_question_skipped", "true");
    toast.info("You can set this up later in settings");
    onClose();
  };

  const handleSnooze = () => {
    toast.info("We'll remind you next time");
    onClose();
  };

  // Simple role-based message
  const getRoleMessage = () => {
    switch (userRole) {
      case "musician":
        return "Protect your gigs and music submissions";
      case "client":
        return "Secure your events and payments";
      case "booker":
        return "Keep your bookings and contracts safe";
      default:
        return "Secure your account";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md w-full p-0 gap-0 bg-[#0B1120] border border-[#1F2A3F] shadow-2xl">
        {/* Simple Header - Dark Navy */}
        <div className="p-6 border-b border-[#1F2A3F] bg-[#0F172A]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <DialogTitle className="text-white">Set up security question</DialogTitle>
              <DialogDescription className="text-sm mt-1 text-gray-400">
                {getRoleMessage()}
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Content - Dark Navy */}
        <div className="p-6 max-h-[70vh] overflow-y-auto bg-[#0B1120]">
          {step === "info" ? (
            <div className="space-y-6">
              {/* Simple benefits */}
              <div className="space-y-3">
                <p className="text-sm text-gray-400">
                  A security question helps you:
                </p>
                <ul className="space-y-2 text-sm">
                  {[
                    "Recover your account if you forget your password",
                    "Prevent unauthorized access",
                    "Verify your identity for sensitive changes",
                    "Edit Gigs, Contracts, and Payments if you forget your password",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-gray-300">
                      <Check className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Simple stats - Dark Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-[#151F2E] rounded-lg text-center border border-[#1F2A3F]">
                  <div className="text-xl font-bold text-blue-400">99%</div>
                  <div className="text-xs text-gray-500">Recovery rate</div>
                </div>
                <div className="p-3 bg-[#151F2E] rounded-lg text-center border border-[#1F2A3F]">
                  <div className="text-xl font-bold text-green-400">2min</div>
                  <div className="text-xs text-gray-500">Setup time</div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col gap-2">
                <Button 
                  onClick={() => setStep("setup")} 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Set up security question
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={handleSkip} 
                  className="w-full text-gray-400 hover:text-white hover:bg-[#151F2E]"
                >
                  Skip for now
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Question type toggle - Dark */}
              <div className="flex gap-2 p-1 bg-[#151F2E] rounded-lg border border-[#1F2A3F]">
                <button
                  type="button"
                  onClick={() => setIsCustom(false)}
                  className={cn(
                    "flex-1 py-2 text-sm font-medium rounded-md transition-colors",
                    !isCustom
                      ? "bg-blue-600 text-white"
                      : "text-gray-400 hover:text-white"
                  )}
                >
                  Choose one
                </button>
                <button
                  type="button"
                  onClick={() => setIsCustom(true)}
                  className={cn(
                    "flex-1 py-2 text-sm font-medium rounded-md transition-colors",
                    isCustom
                      ? "bg-blue-600 text-white"
                      : "text-gray-400 hover:text-white"
                  )}
                >
                  Custom
                </button>
              </div>

              {/* Question field */}
              {isCustom ? (
                <div className="space-y-2">
                  <Label htmlFor="custom-question" className="text-gray-300">Your question</Label>
                  <Textarea
                    id="custom-question"
                    placeholder="Enter your own security question..."
                    value={customQuestion}
                    onChange={(e) => setCustomQuestion(e.target.value)}
                    className="min-h-200 resize-none bg-[#151F2E] border-[#1F2A3F] text-white placeholder:text-gray-600 focus:border-blue-500"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label className="text-gray-300">Select a question</Label>
                  <Select value={selectedQuestion} onValueChange={setSelectedQuestion}>
                    <SelectTrigger className="bg-[#151F2E] border-[#1F2A3F] text-white">
                      <SelectValue placeholder="Choose a question..." />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0F172A] border-[#1F2A3F] text-white">
                      {SECURITY_QUESTIONS.map((q, i) => (
                        <SelectItem 
                          key={i} 
                          value={q}
                          className="hover:bg-[#151F2E] focus:bg-[#151F2E] text-white"
                        >
                          {q}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Answer field */}
              <div className="space-y-2">
                <Label htmlFor="answer" className="text-gray-300">Your answer</Label>
                <div className="relative">
                  <Input
                    id="answer"
                    type={showAnswer ? "text" : "password"}
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Enter your answer"
                    className="pr-10 bg-[#151F2E] border-[#1F2A3F] text-white placeholder:text-gray-600 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAnswer(!showAnswer)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-400"
                  >
                    {showAnswer ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {answer && answer.length < 3 && (
                  <p className="text-xs text-amber-400 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Minimum 3 characters
                  </p>
                )}
              </div>

              {/* Confirm answer */}
              <div className="space-y-2">
                <Label htmlFor="confirm-answer" className="text-gray-300">Confirm answer</Label>
                <div className="relative">
                  <Input
                    id="confirm-answer"
                    type={showConfirmAnswer ? "text" : "password"}
                    value={confirmAnswer}
                    onChange={(e) => setConfirmAnswer(e.target.value)}
                    placeholder="Re-enter your answer"
                    className="pr-10 bg-[#151F2E] border-[#1F2A3F] text-white placeholder:text-gray-600 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmAnswer(!showConfirmAnswer)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-400"
                  >
                    {showConfirmAnswer ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmAnswer && answer !== confirmAnswer && (
                  <p className="text-xs text-red-400 flex items-center gap-1">
                    <X className="w-3 h-3" /> Answers don't match
                  </p>
                )}
                {confirmAnswer && answer === confirmAnswer && (
                  <p className="text-xs text-green-400 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Answers match
                  </p>
                )}
              </div>

              {/* Navigation */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep("info")}
                  className="flex-1 border-[#1F2A3F] bg-transparent text-gray-300 hover:bg-[#151F2E] hover:text-white"
                  disabled={isLoading}
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={isLoading || !answer || answer !== confirmAnswer}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save"
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Simple footer with snooze option - Dark */}
        {step === "info" && (
          <div className="p-4 border-t border-[#1F2A3F] bg-[#0F172A]">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSnooze}
              className="w-full text-xs text-gray-500 hover:text-gray-400 hover:bg-[#151F2E]"
            >
              <Clock className="w-3 h-3 mr-2" />
              Remind me later
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}