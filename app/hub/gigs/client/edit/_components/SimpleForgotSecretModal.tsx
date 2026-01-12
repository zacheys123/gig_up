// components/modals/SimpleForgotSecretModal.tsx
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
import { toast } from "sonner";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useThemeColors } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import {
  Mail,
  Lock,
  Shield,
  Eye,
  EyeOff,
  Key,
  HelpCircle,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Copy,
  Check,
  Loader2,
  ArrowRight,
  Sparkles,
  LockKeyhole,
  Info,
  AlertTriangle,
  XCircle,
} from "lucide-react";

interface SimpleForgotSecretModalProps {
  gigId: Id<"gigs">;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type StepType = "trySecret" | "email" | "security" | "newSecret" | "success";

export function SimpleForgotSecretModal({
  gigId,
  isOpen,
  onClose,
  onSuccess,
}: SimpleForgotSecretModalProps) {
  const { user } = useCurrentUser();
  const { colors, isDarkMode } = useThemeColors();
  const [step, setStep] = useState<StepType>("trySecret");
  const [email, setEmail] = useState(user?.email || "");
  const [secretInput, setSecretInput] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [newSecret, setNewSecret] = useState("");
  const [confirmSecret, setConfirmSecret] = useState("");
  const [securityQuestion, setSecurityQuestion] = useState("");
  const [hasExistingSecret, setHasExistingSecret] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [gigTitle, setGigTitle] = useState("");
  const [generatedSecret, setGeneratedSecret] = useState("");
  const [copied, setCopied] = useState(false);

  const gigInfo = useQuery(api.controllers.gigs.getGigBasicInfo, {
    gigId: gigId, // Pass the gigId as an argument
  });
  const verifySecret = useMutation(api.controllers.verifyGig.verifyGigSecret);
  const requestReset = useMutation(
    api.controllers.verifyGig.requestSecretReset
  );
  const verifyAndReset = useMutation(
    api.controllers.verifyGig.verifySecurityAnswerAndReset
  );

  // Fetch gig info when modal opens
  useEffect(() => {
    if (isOpen && gigId && gigInfo) {
      setGigTitle(gigInfo.title || "Untitled Gig");
    }
  }, [isOpen, gigId, gigInfo]);

  // Request reset via email
  // Add these states near your other useState declarations
  const [emailValidationState, setEmailValidationState] = useState<
    "valid" | "invalid" | null
  >(null);
  const [emailValidationMessage, setEmailValidationMessage] = useState("");

  // Update your handleEmailSubmit function
  // Update your handleEmailSubmit function to handle the specific error
  const handleEmailSubmit = async () => {
    if (!email.trim()) {
      setEmailValidationState("invalid");
      setEmailValidationMessage("Please enter your email");
      return;
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setEmailValidationState("invalid");
      setEmailValidationMessage("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    setEmailValidationState(null);
    setEmailValidationMessage("");

    try {
      const result = await requestReset({
        gigId,
        email: email.trim(),
        clerkId: user?.clerkId || "",
      });

      setSecurityQuestion(result.securityQuestion);
      setHasExistingSecret(result.hasSecret);

      if (!result.hasSecurityQuestion) {
        setEmailValidationState("invalid");
        setEmailValidationMessage(
          "No security question found. Please set up a security question in your account settings first."
        );
        return;
      }

      // Show success state briefly before moving to next step
      setEmailValidationState("valid");
      setEmailValidationMessage(
        "Email verified! Redirecting to security question..."
      );

      setTimeout(() => {
        setStep("security");
        setEmailValidationState(null);
        setEmailValidationMessage("");
      }, 1500);
    } catch (error: any) {
      // Check for specific error messages
      if (error.message.includes("Email does not match your account")) {
        setEmailValidationState("invalid");
        setEmailValidationMessage(
          "This email doesn't match your account. Please use the email associated with your account."
        );
      } else if (error.message.includes("User account not found")) {
        setEmailValidationState("invalid");
        setEmailValidationMessage(
          "Account not found. Please make sure you're logged in with the correct account."
        );
      } else if (error.message.includes("haven't set up a security question")) {
        setEmailValidationState("invalid");
        setEmailValidationMessage(
          "You haven't set up a security question. Please set one up in your account settings first."
        );
      } else {
        setEmailValidationState("invalid");
        setEmailValidationMessage(
          error.message || "An error occurred. Please try again."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Add useEffect to clear validation when email changes
  useEffect(() => {
    if (emailValidationState) {
      setEmailValidationState(null);
      setEmailValidationMessage("");
    }
  }, [email]);
  // Add this state
  const [secretValidationState, setSecretValidationState] = useState<
    "valid" | "invalid" | null
  >(null); // 'valid', 'invalid', or null

  // Update your handleTrySecret function
  const handleTrySecret = async () => {
    setIsLoading(true);
    setSecretValidationState(null);

    try {
      const isValid = await verifySecret({
        secretKey: secretInput as string,
        gigId: gigId as Id<"gigs">,
      }); // Your API call

      if (isValid) {
        setSecretValidationState("valid");
        // Redirect after a brief delay to show success state
        setTimeout(() => {
          onSuccess();
        }, 1500);
      } else {
        setSecretValidationState("invalid");
        // Clear error state after 3 seconds
        setTimeout(() => {
          setSecretValidationState(null);
        }, 3000);
      }
    } catch (error) {
      setSecretValidationState("invalid");
      // Clear error state after 3 seconds
      setTimeout(() => {
        setSecretValidationState(null);
      }, 3000);
    } finally {
      setIsLoading(false);
    }
  };

  // Also reset validation state when user types
  useEffect(() => {
    if (secretValidationState) {
      setSecretValidationState(null);
    }
  }, [secretInput]);
  // Verify security answer
  // In your SimpleForgotSecretModal component
  // Add near your other useState declarations
  const [showSecurityAnswer, setShowSecurityAnswer] = useState(false);
  const [securityValidationState, setSecurityValidationState] = useState<
    "valid" | "invalid" | null
  >(null);
  const [securityValidationMessage, setSecurityValidationMessage] =
    useState("");

  // Update your handleSecuritySubmit function
  const handleSecuritySubmit = async () => {
    if (!securityAnswer.trim()) {
      setSecurityValidationState("invalid");
      setSecurityValidationMessage("Please enter your security answer");
      return;
    }

    setIsLoading(true);
    setSecurityValidationState(null);
    setSecurityValidationMessage("");

    try {
      // If gig has no secret, we can just verify and finish
      if (!hasExistingSecret) {
        const result = await verifyAndReset({
          gigId,
          securityAnswer: securityAnswer.trim(),
          clerkId: user?.clerkId || "",
        });

        // Show success state
        setSecurityValidationState("valid");
        setSecurityValidationMessage("Answer verified! Setting up your gig...");

        if (result.newSecret) {
          setTimeout(() => {
            setGeneratedSecret(result.newSecret);
            setStep("success");
            setSecurityValidationState(null);
            setSecurityValidationMessage("");
          }, 1500);
        } else {
          setTimeout(() => {
            toast.success("Verified successfully!");
            onSuccess();
            onClose();
          }, 1500);
        }
        return;
      }

      // If gig has secret, show success state then move to next step
      setSecurityValidationState("valid");
      setSecurityValidationMessage(
        "Answer verified! Proceeding to set new secret..."
      );

      setTimeout(() => {
        setStep("newSecret");
        setSecurityValidationState(null);
        setSecurityValidationMessage("");
      }, 1500);
    } catch (error: any) {
      if (error.message.includes("Incorrect security answer")) {
        setSecurityValidationState("invalid");
        setSecurityValidationMessage("Incorrect answer. Please try again.");
      } else if (error.message.includes("No security question set")) {
        setSecurityValidationState("invalid");
        setSecurityValidationMessage(
          "No security question found. Please contact support."
        );
      } else {
        setSecurityValidationState("invalid");
        setSecurityValidationMessage(
          error.message || "An error occurred. Please try again."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Add useEffect to clear validation when answer changes
  useEffect(() => {
    if (securityValidationState && securityAnswer) {
      setSecurityValidationState(null);
      setSecurityValidationMessage("");
    }
  }, [securityAnswer]);

  // Reset secret with new one
  // Add near your other useState declarations
  const [showNewSecret, setShowNewSecret] = useState(false);
  const [newSecretValidationState, setNewSecretValidationState] = useState<
    "valid" | "invalid" | null
  >(null);

  // Add password strength helper function
  const getPasswordStrength = (
    password: string
  ): "weak" | "medium" | "strong" => {
    if (password.length < 8) return "weak";

    let score = 0;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (password.length >= 12) score++;

    if (score >= 4) return "strong";
    if (score >= 2) return "medium";
    return "weak";
  };

  // Update generateRandomSecret function to create stronger passwords
  const generateRandomSecret = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let result = "";

    // Ensure at least one of each type
    result += "ABCDEFGHIJKLMNOPQRSTUVWXYZ".charAt(
      Math.floor(Math.random() * 26)
    );
    result += "abcdefghijklmnopqrstuvwxyz".charAt(
      Math.floor(Math.random() * 26)
    );
    result += "0123456789".charAt(Math.floor(Math.random() * 10));
    result += "!@#$%^&*".charAt(Math.floor(Math.random() * 8));

    // Fill remaining characters
    for (let i = 4; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Shuffle the result
    result = result
      .split("")
      .sort(() => Math.random() - 0.5)
      .join("");

    setNewSecret(result);
    setConfirmSecret(result);
  };

  // Update handleResetSecret to show validation
  const handleResetSecret = async () => {
    if (!newSecret.trim()) {
      setNewSecretValidationState("invalid");
      return;
    }

    if (newSecret !== confirmSecret) {
      setNewSecretValidationState("invalid");
      return;
    }

    if (newSecret.length < 8) {
      setNewSecretValidationState("invalid");
      return;
    }

    setIsLoading(true);
    setNewSecretValidationState(null);

    try {
      const result = await verifyAndReset({
        gigId,
        securityAnswer: securityAnswer.trim(),
        newSecretKey: newSecret.trim(),
        clerkId: user?.clerkId || "",
      });

      setGeneratedSecret(result.newSecret || newSecret);
      setStep("success");
    } catch (error: any) {
      setNewSecretValidationState("invalid");
      toast.error(error.message || "Failed to reset secret");
    } finally {
      setIsLoading(false);
    }
  };

  // Copy secret to clipboard
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Secret copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy to clipboard");
    }
  };

  // Get step icon
  const getStepIcon = () => {
    switch (step) {
      case "trySecret":
        return <LockKeyhole className="w-12 h-12 text-blue-500" />;
      case "email":
        return <Mail className="w-12 h-12 text-orange-500" />;
      case "security":
        return <Shield className="w-12 h-12 text-purple-500" />;
      case "newSecret":
        return <Key className="w-12 h-12 text-green-500" />;
      case "success":
        return <CheckCircle className="w-12 h-12 text-emerald-500" />;
      default:
        return <Lock className="w-12 h-12 text-blue-500" />;
    }
  };

  // Get step title
  const getStepTitle = () => {
    switch (step) {
      case "trySecret":
        return "Enter Secret Key";
      case "email":
        return "Verify Identity";
      case "security":
        return "Security Question";
      case "newSecret":
        return "New Secret Key";
      case "success":
        return "Access Restored!";
      default:
        return "Recover Access";
    }
  };

  // Get step description
  const getStepDescription = () => {
    switch (step) {
      case "trySecret":
        return "Enter your gig secret key to continue editing";
      case "email":
        return "We'll send your security question to verify it's you";
      case "security":
        return "Answer your security question to continue";
      case "newSecret":
        return "Create a new secret key for this gig";
      case "success":
        return "Your new secret key has been set successfully";
      default:
        return "Recover access to your gig";
    }
  };

  // Get progress steps
  const getProgressSteps = () => {
    const steps = [
      { key: "trySecret", label: "Try Key", active: step === "trySecret" },
      { key: "email", label: "Verify", active: step === "email" },
      { key: "security", label: "Security", active: step === "security" },
      { key: "newSecret", label: "New Key", active: step === "newSecret" },
      { key: "success", label: "Done", active: step === "success" },
    ];

    const currentIndex = steps.findIndex((s) => s.active);

    return (
      <div className="flex items-center justify-center mb-6">
        {steps.map((stepItem, index) => (
          <div key={stepItem.key} className="flex items-center">
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                index <= currentIndex
                  ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-500"
              )}
            >
              {index + 1}
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "w-12 h-1 mx-2 transition-all",
                  index < currentIndex
                    ? "bg-gradient-to-r from-blue-500 to-cyan-500"
                    : "bg-gray-200 dark:bg-gray-700"
                )}
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
        {/* Clean Header */}
        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-6">
          <DialogHeader>
            <div className="flex items-center gap-4 mb-2">
              <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                {getStepIcon()}
              </div>
              <div className="flex-1">
                <DialogTitle className="text-2xl font-bold text-white">
                  {getStepTitle()}
                </DialogTitle>
                <DialogDescription className="text-blue-100">
                  {getStepDescription()}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          {gigTitle && (
            <div className="text-sm text-blue-200">
              Gig: <span className="font-medium">{gigTitle}</span>
            </div>
          )}
        </div>

        {/* Progress Indicator */}
        <div className="px-6 pt-6">{getProgressSteps()}</div>

        {/* Step Content */}
        <div className="px-6 pb-6 max-h-[60vh] overflow-y-auto bg-neutral-700/50">
          {step === "trySecret" && (
            <div className="space-y-8">
              {/* Main Card */}
              <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5" />
                <div
                  className={cn(
                    "relative p-6 rounded-2xl border backdrop-blur-sm m-4",
                    isDarkMode
                      ? "bg-gray-900/80 border-gray-700/50"
                      : "bg-neutral-700/20 p-3 rounded-lg border-blue-100"
                  )}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
                      <Lock className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl text-gray-900 dark:text-white">
                        Try Your Secret Key
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Enter your secret key to continue editing
                      </p>
                    </div>
                  </div>

                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    If you remember your secret key, you can continue editing
                    immediately.
                  </p>

                  <div className="space-y-5">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label
                          htmlFor="secret"
                          className={cn(
                            "text-sm font-medium",
                            !isDarkMode ? "text-gray-200" : "text-gray-900"
                          )}
                        >
                          Secret Key
                        </Label>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Case-sensitive
                        </span>
                      </div>

                      <div className="relative group">
                        <Input
                          id="secret"
                          type={showSecret ? "text" : "password"}
                          value={secretInput}
                          onChange={(e) => setSecretInput(e.target.value)}
                          placeholder="Enter your secret key"
                          className={cn(
                            "h-12 pr-12 font-mono tracking-wide transition-all duration-200",
                            isDarkMode
                              ? "bg-gray-800 border-gray-600 placeholder-gray-500 text-white"
                              : "bg-white border-gray-300 placeholder-gray-400 text-gray-900",
                            // Validation states
                            secretValidationState === "valid" && [
                              "border-emerald-500 dark:border-emerald-400",
                              isDarkMode
                                ? "bg-emerald-950/20 focus:bg-emerald-950/30"
                                : "bg-emerald-50 focus:bg-emerald-50/50",
                              "focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500",
                            ],
                            secretValidationState === "invalid" && [
                              "border-red-500 dark:border-red-400",
                              isDarkMode
                                ? "bg-red-950/20 focus:bg-red-950/30"
                                : "bg-red-50 focus:bg-red-50/50",
                              "focus:ring-2 focus:ring-red-500/20 focus:border-red-500",
                            ],
                            !secretValidationState && [
                              isDarkMode
                                ? "focus:border-blue-400 focus:bg-gray-900"
                                : "focus:border-blue-500 focus:bg-white",
                              "focus:ring-2 focus:ring-blue-500/20",
                            ]
                          )}
                          autoFocus
                          autoComplete="off"
                          aria-invalid={secretValidationState === "invalid"}
                          aria-describedby={
                            secretValidationState === "invalid"
                              ? "secret-error"
                              : secretValidationState === "valid"
                                ? "secret-success"
                                : undefined
                          }
                        />

                        {/* Eye toggle button */}
                        <button
                          type="button"
                          onClick={() => setShowSecret(!showSecret)}
                          className={cn(
                            "absolute right-10 top-1/2 transform -translate-y-1/2 p-1.5 rounded-md transition-colors",
                            isDarkMode
                              ? "hover:bg-gray-700/50"
                              : "hover:bg-gray-100/50",
                            secretValidationState === "valid" && [
                              isDarkMode
                                ? "text-emerald-400"
                                : "text-emerald-600",
                            ],
                            secretValidationState === "invalid" && [
                              isDarkMode ? "text-red-400" : "text-red-600",
                            ]
                          )}
                          aria-label={
                            showSecret ? "Hide secret" : "Show secret"
                          }
                        >
                          {showSecret ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>

                        {/* Validation icon */}
                        {secretValidationState && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            {secretValidationState === "valid" ? (
                              <CheckCircle className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-500 dark:text-red-400" />
                            )}
                          </div>
                        )}
                      </div>

                      {/* Validation messages */}
                      <div className="min-h-[20px]">
                        {secretValidationState === "invalid" && (
                          <p
                            id="secret-error"
                            className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 duration-200"
                          >
                            <XCircle className="w-4 h-4 flex-shrink-0" />
                            Incorrect secret key. Please try again or use
                            recovery.
                          </p>
                        )}

                        {secretValidationState === "valid" && (
                          <p
                            id="secret-success"
                            className="text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 duration-200"
                          >
                            <CheckCircle className="w-4 h-4 flex-shrink-0" />
                            Secret key verified! Redirecting...
                          </p>
                        )}
                      </div>
                    </div>

                    <Button
                      onClick={handleTrySecret}
                      className="w-full h-12 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all duration-200"
                      disabled={isLoading || !secretInput}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4 mr-2" />
                          Verify & Continue
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Recovery Option */}
              <div className="text-center">
                <div className="inline-flex items-center gap-2 p-3">
                  <Shield className="w-4 h-4 text-gray-400" />
                  <button
                    type="button"
                    onClick={() => setStep("email")}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors"
                  >
                    Forgot your key? Use security recovery
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === "email" && (
            <div className="space-y-8">
              <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-amber-500/5" />
                {step === "email" && (
                  <div className="space-y-8">
                    <div className="relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-amber-500/5" />
                      <div
                        className={cn(
                          "relative p-6 rounded-2xl border backdrop-blur-sm m-4",
                          isDarkMode
                            ? "bg-gray-900/80 border-gray-700/50"
                            : "bg-neutral-700/20 border-orange-100"
                        )}
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500">
                            <Shield className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-bold text-xl text-white dark:text-white">
                              Account Recovery
                            </h3>
                            <p
                              className={cn(
                                "text-sm mt-1",
                                isDarkMode ? "text-gray-400" : "text-gray-300"
                              )}
                            >
                              Enter your account email
                            </p>
                          </div>
                        </div>

                        {/* Display current user's email if available */}
                        {user?.email && email === user?.email && (
                          <div
                            className={cn(
                              "mb-4 p-3 rounded-lg",
                              isDarkMode
                                ? "bg-blue-900/30 border border-blue-800/50"
                                : "bg-blue-500/10 border border-blue-400/50"
                            )}
                          >
                            <p className="text-sm flex items-center gap-2">
                              <Info className="w-4 h-4" />
                              <span
                                className={
                                  isDarkMode ? "text-blue-300" : "text-blue-200"
                                }
                              >
                                Your account email:{" "}
                                <span className="font-medium">
                                  {user.email}
                                </span>
                              </span>
                            </p>
                          </div>
                        )}

                        <p
                          className={cn(
                            "mb-6",
                            isDarkMode ? "text-gray-300" : "text-gray-200"
                          )}
                        >
                          Enter the email address associated with your account
                          to verify your identity.
                        </p>

                        <div className="space-y-5">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label
                                htmlFor="email"
                                className={cn(
                                  "text-sm font-medium",
                                  isDarkMode ? "text-gray-200" : "text-gray-100"
                                )}
                              >
                                Email Address
                              </Label>
                              {/* {user?.email && (
                                <button
                                  type="button"
                                  onClick={() => setEmail(user.email || "")}
                                  className="text-xs text-blue-400 hover:text-blue-300 underline"
                                >
                                  Use account email
                                </button>
                              )} */}
                            </div>

                            <div className="relative">
                              <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => {
                                  setEmail(e.target.value);
                                  setEmailValidationState(null);
                                  setEmailValidationMessage("");
                                }}
                                placeholder="your@email.com"
                                className={cn(
                                  "h-12 pr-12 transition-all duration-200",
                                  isDarkMode
                                    ? "bg-gray-800 border-gray-600 placeholder-gray-500 text-white"
                                    : "bg-white/10 border-gray-400 placeholder-gray-300 text-white",
                                  // Validation states
                                  emailValidationState === "valid" && [
                                    "border-emerald-500 dark:border-emerald-400",
                                    isDarkMode
                                      ? "bg-emerald-950/20 focus:bg-emerald-950/30"
                                      : "bg-emerald-50/20 focus:bg-emerald-50/30",
                                    "focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500",
                                  ],
                                  emailValidationState === "invalid" && [
                                    "border-red-500 dark:border-red-400",
                                    isDarkMode
                                      ? "bg-red-950/20 focus:bg-red-950/30"
                                      : "bg-red-50/20 focus:bg-red-50/30",
                                    "focus:ring-2 focus:ring-red-500/20 focus:border-red-500",
                                  ],
                                  !emailValidationState && [
                                    isDarkMode
                                      ? "focus:border-orange-400 focus:bg-gray-900"
                                      : "focus:border-orange-500 focus:bg-white/20",
                                    "focus:ring-2 focus:ring-orange-500/20",
                                  ]
                                )}
                                aria-invalid={
                                  emailValidationState === "invalid"
                                }
                                aria-describedby={
                                  emailValidationState === "invalid"
                                    ? "email-error"
                                    : emailValidationState === "valid"
                                      ? "email-success"
                                      : undefined
                                }
                              />

                              {/* Validation icon */}
                              {emailValidationState && (
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                  {emailValidationState === "valid" ? (
                                    <CheckCircle className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                                  ) : (
                                    <XCircle className="w-5 h-5 text-red-500 dark:text-red-400" />
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Validation messages */}
                            <div className="min-h-[20px]">
                              {emailValidationState === "invalid" && (
                                <p
                                  id="email-error"
                                  className="text-sm text-red-400 dark:text-red-400 flex items-start gap-1.5 animate-in fade-in slide-in-from-top-1 duration-200"
                                >
                                  <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                  <span>{emailValidationMessage}</span>
                                </p>
                              )}

                              {emailValidationState === "valid" && (
                                <p
                                  id="email-success"
                                  className="text-sm text-emerald-400 dark:text-emerald-400 flex items-start gap-1.5 animate-in fade-in slide-in-from-top-1 duration-200"
                                >
                                  <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                  <span>{emailValidationMessage}</span>
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-3">
                            <Button
                              variant="outline"
                              onClick={() => {
                                setStep("trySecret");
                                setEmailValidationState(null);
                                setEmailValidationMessage("");
                              }}
                              className={cn(
                                "flex-1 h-12",
                                isDarkMode
                                  ? "border-gray-700 hover:bg-gray-900 text-gray-200"
                                  : "border-gray-400 hover:bg-gray-600/20 text-gray-100"
                              )}
                              disabled={isLoading}
                            >
                              <ArrowLeft className="w-4 h-4 mr-2" />
                              Back
                            </Button>
                            <Button
                              onClick={handleEmailSubmit}
                              className="flex-1 h-12 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-semibold shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 disabled:opacity-50"
                              disabled={
                                isLoading ||
                                !email.trim() ||
                                emailValidationState === "invalid"
                              }
                            >
                              {isLoading ? (
                                <>
                                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                  Verifying...
                                </>
                              ) : (
                                "Verify Email"
                              )}
                            </Button>
                          </div>

                          {/* Help text */}
                          <div
                            className={cn(
                              "text-xs pt-2",
                              isDarkMode ? "text-gray-400" : "text-gray-300"
                            )}
                          >
                            <p>
                              ⓘ You must use the exact email address associated
                              with your account when you created this gig.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === "security" && (
            <div className="space-y-8">
              <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5" />
                <div
                  className={cn(
                    "relative p-6 rounded-2xl border backdrop-blur-sm m-4",
                    isDarkMode
                      ? "bg-gray-900/80 border-gray-700/50"
                      : "bg-neutral-700/20 border-purple-100"
                  )}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl text-white dark:text-white">
                        Security Verification
                      </h3>
                      <p
                        className={cn(
                          "text-sm mt-1",
                          isDarkMode ? "text-gray-400" : "text-gray-300"
                        )}
                      >
                        Answer your security question
                      </p>
                    </div>
                  </div>

                  <p
                    className={cn(
                      "mb-6",
                      isDarkMode ? "text-gray-300" : "text-gray-200"
                    )}
                  >
                    Please answer the security question you set up when creating
                    your account.
                  </p>

                  <div className="space-y-6">
                    {/* Security Question Display */}
                    <div
                      className={cn(
                        "p-4 rounded-xl border",
                        isDarkMode
                          ? "bg-purple-900/20 border-purple-800/50"
                          : "bg-purple-500/10 border-purple-400/50"
                      )}
                    >
                      <div className="space-y-2">
                        <p
                          className={cn(
                            "text-xs font-medium uppercase tracking-wider",
                            isDarkMode ? "text-purple-400" : "text-purple-300"
                          )}
                        >
                          Your Security Question
                        </p>
                        <p
                          className={cn(
                            "text-lg font-semibold",
                            isDarkMode ? "text-white" : "text-white"
                          )}
                        >
                          {securityQuestion}
                        </p>
                      </div>
                    </div>

                    {/* Security Answer Input */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label
                          htmlFor="securityAnswer"
                          className={cn(
                            "text-sm font-medium",
                            isDarkMode ? "text-gray-200" : "text-gray-100"
                          )}
                        >
                          Your Answer
                        </Label>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Case-sensitive
                        </span>
                      </div>

                      <div className="relative">
                        <Input
                          id="securityAnswer"
                          type={showSecurityAnswer ? "text" : "password"}
                          value={securityAnswer}
                          onChange={(e) => {
                            setSecurityAnswer(e.target.value);
                            setSecurityValidationState(null);
                            setSecurityValidationMessage("");
                          }}
                          placeholder="Enter your answer..."
                          className={cn(
                            "h-12 pr-12 transition-all duration-200",
                            isDarkMode
                              ? "bg-gray-800 border-gray-600 placeholder-gray-500 text-white"
                              : "bg-white/10 border-gray-400 placeholder-gray-300 text-white",
                            // Validation states
                            securityValidationState === "valid" && [
                              "border-emerald-500 dark:border-emerald-400",
                              isDarkMode
                                ? "bg-emerald-950/20 focus:bg-emerald-950/30"
                                : "bg-emerald-50/20 focus:bg-emerald-50/30",
                              "focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500",
                            ],
                            securityValidationState === "invalid" && [
                              "border-red-500 dark:border-red-400",
                              isDarkMode
                                ? "bg-red-950/20 focus:bg-red-950/30"
                                : "bg-red-50/20 focus:bg-red-50/30",
                              "focus:ring-2 focus:ring-red-500/20 focus:border-red-500",
                            ],
                            !securityValidationState && [
                              isDarkMode
                                ? "focus:border-purple-400 focus:bg-gray-900"
                                : "focus:border-purple-500 focus:bg-white/20",
                              "focus:ring-2 focus:ring-purple-500/20",
                            ]
                          )}
                          autoFocus
                          aria-invalid={securityValidationState === "invalid"}
                          aria-describedby={
                            securityValidationState === "invalid"
                              ? "security-error"
                              : securityValidationState === "valid"
                                ? "security-success"
                                : undefined
                          }
                        />

                        {/* Eye toggle button */}
                        <button
                          type="button"
                          onClick={() =>
                            setShowSecurityAnswer(!showSecurityAnswer)
                          }
                          className={cn(
                            "absolute right-10 top-1/2 transform -translate-y-1/2 p-1.5 rounded-md transition-colors",
                            isDarkMode
                              ? "hover:bg-gray-700/50"
                              : "hover:bg-gray-100/50",
                            securityValidationState === "valid" && [
                              isDarkMode
                                ? "text-emerald-400"
                                : "text-emerald-600",
                            ],
                            securityValidationState === "invalid" && [
                              isDarkMode ? "text-red-400" : "text-red-600",
                            ]
                          )}
                          aria-label={
                            showSecurityAnswer ? "Hide answer" : "Show answer"
                          }
                        >
                          {showSecurityAnswer ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>

                        {/* Validation icon */}
                        {securityValidationState && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            {securityValidationState === "valid" ? (
                              <CheckCircle className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-500 dark:text-red-400" />
                            )}
                          </div>
                        )}
                      </div>

                      {/* Validation messages */}
                      <div className="min-h-[20px]">
                        {securityValidationState === "invalid" && (
                          <p
                            id="security-error"
                            className="text-sm text-red-400 dark:text-red-400 flex items-start gap-1.5 animate-in fade-in slide-in-from-top-1 duration-200"
                          >
                            <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <span>
                              {securityValidationMessage ||
                                "Incorrect answer. Please try again."}
                            </span>
                          </p>
                        )}

                        {securityValidationState === "valid" && (
                          <p
                            id="security-success"
                            className="text-sm text-emerald-400 dark:text-emerald-400 flex items-start gap-1.5 animate-in fade-in slide-in-from-top-1 duration-200"
                          >
                            <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <span>
                              {securityValidationMessage ||
                                "Answer verified! Proceeding..."}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setStep("email");
                          setSecurityValidationState(null);
                          setSecurityValidationMessage("");
                        }}
                        className={cn(
                          "flex-1 h-12",
                          isDarkMode
                            ? "border-gray-700 hover:bg-gray-900 text-gray-200"
                            : "border-gray-400 hover:bg-gray-600/20 text-gray-100"
                        )}
                        disabled={isLoading}
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                      </Button>
                      <Button
                        onClick={handleSecuritySubmit}
                        className="flex-1 h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 disabled:opacity-50"
                        disabled={
                          isLoading ||
                          !securityAnswer.trim() ||
                          securityValidationState === "invalid"
                        }
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Verifying...
                          </>
                        ) : (
                          "Verify Answer"
                        )}
                      </Button>
                    </div>

                    {/* Help Text */}
                    <div
                      className={cn(
                        "text-xs pt-2",
                        isDarkMode ? "text-gray-400" : "text-gray-300"
                      )}
                    >
                      <p>
                        ⓘ Your security answer is case-sensitive and must match
                        exactly what you set up.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Info Box */}
              <div
                className={cn(
                  "p-4 rounded-xl border m-4",
                  isDarkMode
                    ? "bg-blue-900/20 border-blue-800/50"
                    : "bg-blue-500/10 border-blue-400/50"
                )}
              >
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-400 dark:text-blue-400 mt-0.5" />
                  <div>
                    <h4
                      className={cn(
                        "font-semibold mb-2",
                        isDarkMode ? "text-blue-300" : "text-blue-200"
                      )}
                    >
                      About Security Questions
                    </h4>
                    <p
                      className={cn(
                        "text-sm",
                        isDarkMode ? "text-blue-400" : "text-blue-300"
                      )}
                    >
                      This extra layer of security ensures only you can access
                      your gigs, even if you forget your secret key. Your answer
                      is encrypted and never stored in plain text.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === "newSecret" && (
            <div className="space-y-8">
              <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5" />
                <div
                  className={cn(
                    "relative p-6 rounded-2xl border backdrop-blur-sm m-4",
                    isDarkMode
                      ? "bg-gray-900/80 border-gray-700/50"
                      : "bg-neutral-700/20 border-green-100"
                  )}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500">
                      <Key className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl text-white dark:text-white">
                        Create New Secret Key
                      </h3>
                      <p
                        className={cn(
                          "text-sm mt-1",
                          isDarkMode ? "text-gray-400" : "text-gray-300"
                        )}
                      >
                        Set a new secret key for this gig
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Warning */}
                    <div
                      className={cn(
                        "p-4 rounded-xl border",
                        isDarkMode
                          ? "bg-amber-900/30 border-amber-800/50"
                          : "bg-amber-500/10 border-amber-400/50"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-400 dark:text-amber-500 mt-0.5" />
                        <div>
                          <h5
                            className={cn(
                              "font-semibold mb-1",
                              isDarkMode ? "text-amber-400" : "text-amber-300"
                            )}
                          >
                            Important Notice
                          </h5>
                          <p
                            className={cn(
                              "text-sm",
                              isDarkMode ? "text-amber-500" : "text-amber-400"
                            )}
                          >
                            Save this key securely. You'll need it for all
                            future edits. We cannot recover it if lost.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-5">
                      {/* New Secret Input */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label
                            htmlFor="newSecret"
                            className={cn(
                              "text-sm font-medium",
                              isDarkMode ? "text-gray-200" : "text-gray-100"
                            )}
                          >
                            New Secret Key
                          </Label>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={generateRandomSecret}
                            className="text-sm text-blue-400 hover:text-blue-300 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            <Sparkles className="w-4 h-4 mr-2" />
                            Generate
                          </Button>
                        </div>

                        <div className="relative">
                          <Input
                            id="newSecret"
                            type={showNewSecret ? "text" : "password"}
                            value={newSecret}
                            onChange={(e) => {
                              setNewSecret(e.target.value);
                              setNewSecretValidationState(null);
                            }}
                            placeholder="Enter new secret key (min. 8 characters)"
                            className={cn(
                              "h-12 pr-12 font-mono tracking-wide transition-all duration-200",
                              isDarkMode
                                ? "bg-gray-800 border-gray-600 placeholder-gray-500 text-white"
                                : "bg-white/10 border-gray-400 placeholder-gray-300 text-white",
                              // Validation states
                              newSecretValidationState === "valid" && [
                                "border-emerald-500 dark:border-emerald-400",
                                isDarkMode
                                  ? "bg-emerald-950/20 focus:bg-emerald-950/30"
                                  : "bg-emerald-50/20 focus:bg-emerald-50/30",
                                "focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500",
                              ],
                              newSecretValidationState === "invalid" && [
                                "border-red-500 dark:border-red-400",
                                isDarkMode
                                  ? "bg-red-950/20 focus:bg-red-950/30"
                                  : "bg-red-50/20 focus:bg-red-50/30",
                                "focus:ring-2 focus:ring-red-500/20 focus:border-red-500",
                              ],
                              !newSecretValidationState && [
                                isDarkMode
                                  ? "focus:border-green-400 focus:bg-gray-900"
                                  : "focus:border-green-500 focus:bg-white/20",
                                "focus:ring-2 focus:ring-green-500/20",
                              ],
                              newSecret &&
                                newSecret.length < 8 && [
                                  "border-yellow-500 dark:border-yellow-400",
                                  isDarkMode
                                    ? "bg-yellow-950/20"
                                    : "bg-yellow-50/20",
                                ]
                            )}
                            aria-invalid={
                              newSecretValidationState === "invalid"
                            }
                            aria-describedby={
                              newSecretValidationState === "invalid"
                                ? "newSecret-error"
                                : newSecretValidationState === "valid"
                                  ? "newSecret-success"
                                  : undefined
                            }
                          />

                          {/* Eye toggle button */}
                          <button
                            type="button"
                            onClick={() => setShowNewSecret(!showNewSecret)}
                            className={cn(
                              "absolute right-10 top-1/2 transform -translate-y-1/2 p-1.5 rounded-md transition-colors",
                              isDarkMode
                                ? "hover:bg-gray-700/50"
                                : "hover:bg-gray-100/50",
                              newSecretValidationState === "valid" && [
                                isDarkMode
                                  ? "text-emerald-400"
                                  : "text-emerald-600",
                              ],
                              newSecretValidationState === "invalid" && [
                                isDarkMode ? "text-red-400" : "text-red-600",
                              ]
                            )}
                            aria-label={
                              showNewSecret ? "Hide secret" : "Show secret"
                            }
                          >
                            {showNewSecret ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>

                          {/* Validation icon */}
                          {newSecretValidationState && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              {newSecretValidationState === "valid" ? (
                                <CheckCircle className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                              ) : (
                                <XCircle className="w-5 h-5 text-red-500 dark:text-red-400" />
                              )}
                            </div>
                          )}
                        </div>

                        {/* Length warning */}
                        {newSecret && newSecret.length < 8 && (
                          <p className="text-sm text-yellow-400 dark:text-yellow-500 flex items-center gap-1.5">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            Should be at least 8 characters
                          </p>
                        )}
                      </div>

                      {/* Confirm Secret Input */}
                      <div className="space-y-2">
                        <Label
                          htmlFor="confirmSecret"
                          className={cn(
                            "text-sm font-medium",
                            isDarkMode ? "text-gray-200" : "text-gray-100"
                          )}
                        >
                          Confirm Secret Key
                        </Label>

                        <div className="relative">
                          <Input
                            id="confirmSecret"
                            type={showNewSecret ? "text" : "password"}
                            value={confirmSecret}
                            onChange={(e) => {
                              setConfirmSecret(e.target.value);
                              setNewSecretValidationState(null);
                            }}
                            placeholder="Re-enter the secret key"
                            className={cn(
                              "h-12 pr-12 font-mono tracking-wide transition-all duration-200",
                              isDarkMode
                                ? "bg-gray-800 border-gray-600 placeholder-gray-500 text-white"
                                : "bg-white/10 border-gray-400 placeholder-gray-300 text-white",
                              // Validation states
                              confirmSecret &&
                                newSecret !== confirmSecret && [
                                  "border-red-500 dark:border-red-400",
                                  isDarkMode
                                    ? "bg-red-950/20 focus:bg-red-950/30"
                                    : "bg-red-50/20 focus:bg-red-50/30",
                                  "focus:ring-2 focus:ring-red-500/20",
                                ],
                              confirmSecret &&
                                newSecret === confirmSecret && [
                                  "border-emerald-500 dark:border-emerald-400",
                                  isDarkMode
                                    ? "bg-emerald-950/20 focus:bg-emerald-950/30"
                                    : "bg-emerald-50/20 focus:bg-emerald-50/30",
                                  "focus:ring-2 focus:ring-emerald-500/20",
                                ],
                              !confirmSecret && [
                                isDarkMode
                                  ? "focus:border-green-400 focus:bg-gray-900"
                                  : "focus:border-green-500 focus:bg-white/20",
                                "focus:ring-2 focus:ring-green-500/20",
                              ]
                            )}
                          />

                          {/* Match indicator */}
                          {confirmSecret && newSecret === confirmSecret && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              <CheckCircle className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                            </div>
                          )}
                          {confirmSecret && newSecret !== confirmSecret && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              <XCircle className="w-5 h-5 text-red-500 dark:text-red-400" />
                            </div>
                          )}
                        </div>

                        {/* Match validation messages */}
                        <div className="min-h-[20px]">
                          {confirmSecret && newSecret !== confirmSecret && (
                            <p className="text-sm text-red-400 dark:text-red-400 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                              <XCircle className="w-4 h-4 flex-shrink-0" />
                              Keys don't match
                            </p>
                          )}
                          {confirmSecret && newSecret === confirmSecret && (
                            <p className="text-sm text-emerald-400 dark:text-emerald-400 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                              <CheckCircle className="w-4 h-4 flex-shrink-0" />
                              Keys match
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Strength indicator */}
                      {newSecret && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              Strength
                            </span>
                            <span
                              className={cn(
                                "text-xs font-medium",
                                getPasswordStrength(newSecret) === "weak"
                                  ? "text-red-400"
                                  : getPasswordStrength(newSecret) === "medium"
                                    ? "text-yellow-400"
                                    : "text-emerald-400"
                              )}
                            >
                              {getPasswordStrength(newSecret).toUpperCase()}
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-gray-700 dark:bg-gray-600 rounded-full overflow-hidden">
                            <div
                              className={cn(
                                "h-full transition-all duration-300",
                                getPasswordStrength(newSecret) === "weak"
                                  ? "w-1/3 bg-red-500"
                                  : getPasswordStrength(newSecret) === "medium"
                                    ? "w-2/3 bg-yellow-500"
                                    : "w-full bg-emerald-500"
                              )}
                            />
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {newSecret.length < 8
                              ? "Use at least 8 characters"
                              : !/[A-Z]/.test(newSecret)
                                ? "Add uppercase letters"
                                : !/[0-9]/.test(newSecret)
                                  ? "Add numbers"
                                  : !/[^A-Za-z0-9]/.test(newSecret)
                                    ? "Add special characters"
                                    : "Strong password"}
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setStep("security");
                            setNewSecretValidationState(null);
                          }}
                          className={cn(
                            "flex-1 h-12",
                            isDarkMode
                              ? "border-gray-700 hover:bg-gray-900 text-gray-200"
                              : "border-gray-400 hover:bg-gray-600/20 text-gray-100"
                          )}
                          disabled={isLoading}
                        >
                          <ArrowLeft className="w-4 h-4 mr-2" />
                          Back
                        </Button>
                        <Button
                          onClick={handleResetSecret}
                          className="flex-1 h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold shadow-lg shadow-green-500/20 hover:shadow-green-500/30 disabled:opacity-50"
                          disabled={
                            isLoading ||
                            !newSecret ||
                            !confirmSecret ||
                            newSecret !== confirmSecret ||
                            newSecret.length < 8
                          }
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                              Setting...
                            </>
                          ) : (
                            "Set New Key"
                          )}
                        </Button>
                      </div>

                      {/* Help Text */}
                      <div
                        className={cn(
                          "text-xs pt-2",
                          isDarkMode ? "text-gray-400" : "text-gray-300"
                        )}
                      >
                        <p>
                          ⓘ Make sure to save your secret key in a secure place.
                          You'll need it every time you want to edit this gig.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === "success" && (
            <div className="space-y-8">
              {/* Success Icon */}
              <div className="text-center">
                <div className="relative inline-block">
                  <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-emerald-500 to-green-500 flex items-center justify-center shadow-xl shadow-emerald-500/30">
                    <CheckCircle className="w-12 h-12 text-white" />
                  </div>
                  <div className="absolute inset-0 rounded-full border-4 border-emerald-200 dark:border-emerald-800 animate-ping opacity-20" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-6 mb-2">
                  Success!
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Your secret key has been successfully reset
                </p>
              </div>

              {/* Key Display */}
              <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-green-500/5" />
                <div
                  className={cn(
                    "relative p-6 rounded-2xl border backdrop-blur-sm",
                    isDarkMode
                      ? "bg-gray-900/80 border-gray-700/50"
                      : "bg-white/80 border-emerald-100"
                  )}
                >
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3 block">
                        Your New Secret Key
                      </Label>
                      <div className="flex items-stretch gap-3">
                        <div className="flex-1 p-4 bg-gray-50 dark:bg-gray-800 border border-emerald-300 dark:border-emerald-700 rounded-xl">
                          <p className="font-mono text-lg text-center text-gray-900 dark:text-white tracking-wider select-all">
                            {generatedSecret}
                          </p>
                        </div>
                        <Button
                          onClick={() => copyToClipboard(generatedSecret)}
                          className="px-5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30"
                          aria-label="Copy secret key"
                        >
                          {copied ? (
                            <Check className="w-5 h-5" />
                          ) : (
                            <Copy className="w-5 h-5" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Instructions */}
                    <div
                      className={cn(
                        "p-4 rounded-xl border",
                        isDarkMode
                          ? "bg-amber-900/30 border-amber-800/50"
                          : "bg-amber-50 border-amber-200"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5" />
                        <div>
                          <h5 className="font-semibold text-amber-700 dark:text-amber-400 mb-2">
                            Important Instructions
                          </h5>
                          <ul className="text-sm text-amber-600 dark:text-amber-500 space-y-2">
                            <li className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                              <span>
                                Save this key in a secure password manager
                              </span>
                            </li>
                            <li className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                              <span>
                                Required for all future edits to this gig
                              </span>
                            </li>
                            <li className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                              <span>
                                Never share your secret key with anyone
                              </span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setStep("trySecret");
                    setGeneratedSecret("");
                    setNewSecret("");
                    setConfirmSecret("");
                  }}
                  className="flex-1 h-12 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900"
                >
                  Reset Another
                </Button>
                <Button
                  onClick={() => {
                    onSuccess();
                    onClose();
                  }}
                  className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30"
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Continue to Gig
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
