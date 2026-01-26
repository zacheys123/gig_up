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
  const [emailValidationState, setEmailValidationState] = useState<
    "valid" | "invalid" | null
  >(null);
  const [emailValidationMessage, setEmailValidationMessage] = useState("");
  const [secretValidationState, setSecretValidationState] = useState<
    "valid" | "invalid" | null
  >(null);
  const [showSecurityAnswer, setShowSecurityAnswer] = useState(false);
  const [securityValidationState, setSecurityValidationState] = useState<
    "valid" | "invalid" | null
  >(null);
  const [securityValidationMessage, setSecurityValidationMessage] =
    useState("");
  const [showNewSecret, setShowNewSecret] = useState(false);
  const [newSecretValidationState, setNewSecretValidationState] = useState<
    "valid" | "invalid" | null
  >(null);

  const gigInfo = useQuery(api.controllers.gigs.getGigBasicInfo, {
    gigId,
  });
  const verifySecret = useMutation(api.controllers.verifyGig.verifyGigSecret);
  const requestReset = useMutation(
    api.controllers.verifyGig.requestSecretReset,
  );
  const verifyAndReset = useMutation(
    api.controllers.verifyGig.verifySecurityAnswerAndReset,
  );

  useEffect(() => {
    if (isOpen && gigId && gigInfo) {
      setGigTitle(gigInfo.title || "Untitled Gig");
    }
  }, [isOpen, gigId, gigInfo]);

  const getPasswordStrength = (
    password: string,
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

  const generateRandomSecret = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let result = "";

    result += "ABCDEFGHIJKLMNOPQRSTUVWXYZ".charAt(
      Math.floor(Math.random() * 26),
    );
    result += "abcdefghijklmnopqrstuvwxyz".charAt(
      Math.floor(Math.random() * 26),
    );
    result += "0123456789".charAt(Math.floor(Math.random() * 10));
    result += "!@#$%^&*".charAt(Math.floor(Math.random() * 8));

    for (let i = 4; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    result = result
      .split("")
      .sort(() => Math.random() - 0.5)
      .join("");

    setNewSecret(result);
    setConfirmSecret(result);
  };

  const handleTrySecret = async () => {
    setIsLoading(true);
    setSecretValidationState(null);

    try {
      const isValid = await verifySecret({
        secretKey: secretInput as string,
        gigId: gigId as Id<"gigs">,
      });

      if (isValid) {
        setSecretValidationState("valid");
        setTimeout(() => {
          onSuccess();
        }, 1500);
      } else {
        setSecretValidationState("invalid");
        setTimeout(() => {
          setSecretValidationState(null);
        }, 3000);
      }
    } catch (error) {
      setSecretValidationState("invalid");
      setTimeout(() => {
        setSecretValidationState(null);
      }, 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSubmit = async () => {
    if (!email.trim()) {
      setEmailValidationState("invalid");
      setEmailValidationMessage("Please enter your email");
      return;
    }

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
          "No security question found. Please set up a security question in your account settings first.",
        );
        return;
      }

      setEmailValidationState("valid");
      setEmailValidationMessage(
        "Email verified! Redirecting to security question...",
      );

      setTimeout(() => {
        setStep("security");
        setEmailValidationState(null);
        setEmailValidationMessage("");
      }, 1500);
    } catch (error: any) {
      if (error.message.includes("Email does not match your account")) {
        setEmailValidationState("invalid");
        setEmailValidationMessage(
          "This email doesn't match your account. Please use the email associated with your account.",
        );
      } else if (error.message.includes("User account not found")) {
        setEmailValidationState("invalid");
        setEmailValidationMessage(
          "Account not found. Please make sure you're logged in with the correct account.",
        );
      } else if (error.message.includes("haven't set up a security question")) {
        setEmailValidationState("invalid");
        setEmailValidationMessage(
          "You haven't set up a security question. Please set one up in your account settings first.",
        );
      } else {
        setEmailValidationState("invalid");
        setEmailValidationMessage(
          error.message || "An error occurred. Please try again.",
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

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
      if (!hasExistingSecret) {
        const result = await verifyAndReset({
          gigId,
          securityAnswer: securityAnswer.trim(),
          clerkId: user?.clerkId || "",
        });

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

      setSecurityValidationState("valid");
      setSecurityValidationMessage(
        "Answer verified! Proceeding to set new secret...",
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
          "No security question found. Please contact support.",
        );
      } else {
        setSecurityValidationState("invalid");
        setSecurityValidationMessage(
          error.message || "An error occurred. Please try again.",
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

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
                  : cn(colors.backgroundMuted, colors.textMuted),
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
                    : colors.backgroundMuted,
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
      <DialogContent
        className={cn(
          "sm:max-w-lg p-0 overflow-hidden",
          colors.background,
          colors.border,
        )}
      >
        {/* Sleek Header */}
        <div className={cn("p-6", colors.gradientPrimary)}>
          <DialogHeader>
            <div className="flex items-center gap-4 mb-2">
              <div
                className={cn(
                  "w-14 h-14 rounded-xl",
                  colors.overlay,
                  "flex items-center justify-center",
                )}
              >
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
        <div
          className={cn(
            "px-6 pb-6 max-h-[60vh] overflow-y-auto",
            colors.background,
          )}
        >
          {step === "trySecret" && (
            <div className="space-y-6">
              <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5" />
                <div
                  className={cn(
                    "relative p-6 rounded-2xl",
                    colors.border,
                    colors.backgroundMuted,
                  )}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
                      <Lock className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className={cn("font-bold text-xl", colors.text)}>
                        Try Your Secret Key
                      </h3>
                      <p className={cn("text-sm mt-1", colors.textMuted)}>
                        Enter your secret key to continue editing
                      </p>
                    </div>
                  </div>

                  <p className={cn("mb-6", colors.textMuted)}>
                    If you remember your secret key, you can continue editing
                    immediately.
                  </p>

                  <div className="space-y-5">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label
                          htmlFor="secret"
                          className={cn("text-sm font-medium", colors.text)}
                        >
                          Secret Key
                        </Label>
                        <span className={cn("text-xs", colors.textMuted)}>
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
                            colors.border,
                            colors.background,
                            colors.text,
                            "placeholder:text-gray-500 dark:placeholder:text-gray-400",
                            // Validation states
                            secretValidationState === "valid" && [
                              "border-emerald-500 dark:border-emerald-400",
                              colors.successBg,
                              "focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500",
                            ],
                            secretValidationState === "invalid" && [
                              "border-red-500 dark:border-red-400",
                              colors.destructiveBg,
                              "focus:ring-2 focus:ring-red-500/20 focus:border-red-500",
                            ],
                            !secretValidationState && [
                              "focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500",
                            ],
                          )}
                          autoFocus
                          autoComplete="off"
                        />

                        <button
                          type="button"
                          onClick={() => setShowSecret(!showSecret)}
                          className={cn(
                            "absolute right-10 top-1/2 transform -translate-y-1/2 p-1.5 rounded-md transition-colors",
                            colors.hoverBg,
                          )}
                        >
                          {showSecret ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>

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

                      <div className="min-h-[20px]">
                        {secretValidationState === "invalid" && (
                          <p className="text-sm text-red-500 dark:text-red-400 flex items-center gap-1.5">
                            <XCircle className="w-4 h-4 flex-shrink-0" />
                            Incorrect secret key. Please try again or use
                            recovery.
                          </p>
                        )}

                        {secretValidationState === "valid" && (
                          <p className="text-sm text-emerald-500 dark:text-emerald-400 flex items-center gap-1.5">
                            <CheckCircle className="w-4 h-4 flex-shrink-0" />
                            Secret key verified! Redirecting...
                          </p>
                        )}
                      </div>
                    </div>

                    <Button
                      onClick={handleTrySecret}
                      className="w-full h-12 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold"
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
            <div className="space-y-6">
              <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-amber-500/5" />
                <div
                  className={cn(
                    "relative p-6 rounded-2xl",
                    colors.border,
                    colors.backgroundMuted,
                  )}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className={cn("font-bold text-xl", colors.text)}>
                        Account Recovery
                      </h3>
                      <p className={cn("text-sm mt-1", colors.textMuted)}>
                        Enter your account email
                      </p>
                    </div>
                  </div>

                  {user?.email && email === user?.email && (
                    <div
                      className={cn(
                        "mb-4 p-3 rounded-lg",
                        colors.infoBg,
                        colors.border,
                      )}
                    >
                      <p className="text-sm flex items-center gap-2">
                        <Info className="w-4 h-4" />
                        <span className={colors.infoText}>
                          Your account email:{" "}
                          <span className="font-medium">{user.email}</span>
                        </span>
                      </p>
                    </div>
                  )}

                  <p className={cn("mb-6", colors.textMuted)}>
                    Enter the email address associated with your account to
                    verify your identity.
                  </p>

                  <div className="space-y-5">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label
                          htmlFor="email"
                          className={cn("text-sm font-medium", colors.text)}
                        >
                          Email Address
                        </Label>
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
                            colors.border,
                            colors.background,
                            colors.text,
                            "placeholder:text-gray-500 dark:placeholder:text-gray-400",
                            emailValidationState === "valid" && [
                              "border-emerald-500 dark:border-emerald-400",
                              colors.successBg,
                              "focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500",
                            ],
                            emailValidationState === "invalid" && [
                              "border-red-500 dark:border-red-400",
                              colors.destructiveBg,
                              "focus:ring-2 focus:ring-red-500/20 focus:border-red-500",
                            ],
                            !emailValidationState && [
                              "focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500",
                            ],
                          )}
                          aria-invalid={emailValidationState === "invalid"}
                        />

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

                      <div className="min-h-[20px]">
                        {emailValidationState === "invalid" && (
                          <p className="text-sm text-red-500 dark:text-red-400 flex items-start gap-1.5">
                            <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <span>{emailValidationMessage}</span>
                          </p>
                        )}

                        {emailValidationState === "valid" && (
                          <p className="text-sm text-emerald-500 dark:text-emerald-400 flex items-start gap-1.5">
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
                          colors.border,
                          colors.text,
                          colors.hoverBg,
                        )}
                        disabled={isLoading}
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                      </Button>
                      <Button
                        onClick={handleEmailSubmit}
                        className="flex-1 h-12 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-semibold"
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

                    <div className={cn("text-xs pt-2", colors.textMuted)}>
                      <p>
                        ⓘ You must use the exact email address associated with
                        your account.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === "security" && (
            <div className="space-y-6">
              <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5" />
                <div
                  className={cn(
                    "relative p-6 rounded-2xl",
                    colors.border,
                    colors.backgroundMuted,
                  )}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className={cn("font-bold text-xl", colors.text)}>
                        Security Verification
                      </h3>
                      <p className={cn("text-sm mt-1", colors.textMuted)}>
                        Answer your security question
                      </p>
                    </div>
                  </div>

                  <p className={cn("mb-6", colors.textMuted)}>
                    Please answer the security question you set up when creating
                    your account.
                  </p>

                  <div className="space-y-6">
                    <div
                      className={cn(
                        "p-4 rounded-xl border",
                        colors.border,
                        colors.background,
                      )}
                    >
                      <div className="space-y-2">
                        <p
                          className={cn(
                            "text-xs font-medium uppercase tracking-wider",
                            colors.textMuted,
                          )}
                        >
                          Your Security Question
                        </p>
                        <p className={cn("text-lg font-semibold", colors.text)}>
                          {securityQuestion}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label
                          htmlFor="securityAnswer"
                          className={cn("text-sm font-medium", colors.text)}
                        >
                          Your Answer
                        </Label>
                        <span className={cn("text-xs", colors.textMuted)}>
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
                            colors.border,
                            colors.background,
                            colors.text,
                            "placeholder:text-gray-500 dark:placeholder:text-gray-400",
                            securityValidationState === "valid" && [
                              "border-emerald-500 dark:border-emerald-400",
                              colors.successBg,
                              "focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500",
                            ],
                            securityValidationState === "invalid" && [
                              "border-red-500 dark:border-red-400",
                              colors.destructiveBg,
                              "focus:ring-2 focus:ring-red-500/20 focus:border-red-500",
                            ],
                            !securityValidationState && [
                              "focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500",
                            ],
                          )}
                          autoFocus
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowSecurityAnswer(!showSecurityAnswer)
                          }
                          className={cn(
                            "absolute right-10 top-1/2 transform -translate-y-1/2 p-1.5 rounded-md transition-colors",
                            colors.hoverBg,
                          )}
                        >
                          {showSecurityAnswer ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>

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

                      <div className="min-h-[20px]">
                        {securityValidationState === "invalid" && (
                          <p className="text-sm text-red-500 dark:text-red-400 flex items-start gap-1.5">
                            <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <span>
                              {securityValidationMessage ||
                                "Incorrect answer. Please try again."}
                            </span>
                          </p>
                        )}

                        {securityValidationState === "valid" && (
                          <p className="text-sm text-emerald-500 dark:text-emerald-400 flex items-start gap-1.5">
                            <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <span>
                              {securityValidationMessage ||
                                "Answer verified! Proceeding..."}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>

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
                          colors.border,
                          colors.text,
                          colors.hoverBg,
                        )}
                        disabled={isLoading}
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                      </Button>
                      <Button
                        onClick={handleSecuritySubmit}
                        className="flex-1 h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold"
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

                    <div className={cn("text-xs pt-2", colors.textMuted)}>
                      <p>
                        ⓘ Your security answer is case-sensitive and must match
                        exactly what you set up.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div
                className={cn(
                  "p-4 rounded-xl border",
                  colors.border,
                  colors.background,
                )}
              >
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-500 dark:text-blue-400 mt-0.5" />
                  <div>
                    <h4 className={cn("font-semibold mb-2", colors.text)}>
                      About Security Questions
                    </h4>
                    <p className={cn("text-sm", colors.textMuted)}>
                      This extra layer of security ensures only you can access
                      your gigs, even if you forget your secret key.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === "newSecret" && (
            <div className="space-y-6">
              <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5" />
                <div
                  className={cn(
                    "relative p-6 rounded-2xl",
                    colors.border,
                    colors.backgroundMuted,
                  )}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500">
                      <Key className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className={cn("font-bold text-xl", colors.text)}>
                        Create New Secret Key
                      </h3>
                      <p className={cn("text-sm mt-1", colors.textMuted)}>
                        Set a new secret key for this gig
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div
                      className={cn(
                        "p-4 rounded-xl border",
                        colors.border,
                        colors.warningBg,
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-500 dark:text-amber-500 mt-0.5" />
                        <div>
                          <h5
                            className={cn(
                              "font-semibold mb-1",
                              colors.warningText,
                            )}
                          >
                            Important Notice
                          </h5>
                          <p className={cn("text-sm", colors.warningText)}>
                            Save this key securely. You'll need it for all
                            future edits. We cannot recover it if lost.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-5">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label
                            htmlFor="newSecret"
                            className={cn("text-sm font-medium", colors.text)}
                          >
                            New Secret Key
                          </Label>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={generateRandomSecret}
                            className="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
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
                              colors.border,
                              colors.background,
                              colors.text,
                              "placeholder:text-gray-500 dark:placeholder:text-gray-400",
                              newSecretValidationState === "valid" && [
                                "border-emerald-500 dark:border-emerald-400",
                                colors.successBg,
                                "focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500",
                              ],
                              newSecretValidationState === "invalid" && [
                                "border-red-500 dark:border-red-400",
                                colors.destructiveBg,
                                "focus:ring-2 focus:ring-red-500/20 focus:border-red-500",
                              ],
                              !newSecretValidationState && [
                                "focus:ring-2 focus:ring-green-500/20 focus:border-green-500",
                              ],
                              newSecret &&
                                newSecret.length < 8 && [
                                  "border-yellow-500 dark:border-yellow-400",
                                  colors.warningBg,
                                ],
                            )}
                          />

                          <button
                            type="button"
                            onClick={() => setShowNewSecret(!showNewSecret)}
                            className={cn(
                              "absolute right-10 top-1/2 transform -translate-y-1/2 p-1.5 rounded-md transition-colors",
                              colors.hoverBg,
                            )}
                          >
                            {showNewSecret ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>

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

                        {newSecret && newSecret.length < 8 && (
                          <p className="text-sm text-yellow-500 dark:text-yellow-500 flex items-center gap-1.5">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            Should be at least 8 characters
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="confirmSecret"
                          className={cn("text-sm font-medium", colors.text)}
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
                              colors.border,
                              colors.background,
                              colors.text,
                              "placeholder:text-gray-500 dark:placeholder:text-gray-400",
                              confirmSecret &&
                                newSecret !== confirmSecret && [
                                  "border-red-500 dark:border-red-400",
                                  colors.destructiveBg,
                                  "focus:ring-2 focus:ring-red-500/20",
                                ],
                              confirmSecret &&
                                newSecret === confirmSecret && [
                                  "border-emerald-500 dark:border-emerald-400",
                                  colors.successBg,
                                  "focus:ring-2 focus:ring-emerald-500/20",
                                ],
                              !confirmSecret && [
                                "focus:ring-2 focus:ring-green-500/20 focus:border-green-500",
                              ],
                            )}
                          />

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

                        <div className="min-h-[20px]">
                          {confirmSecret && newSecret !== confirmSecret && (
                            <p className="text-sm text-red-500 dark:text-red-400 flex items-center gap-1.5">
                              <XCircle className="w-4 h-4 flex-shrink-0" />
                              Keys don't match
                            </p>
                          )}
                          {confirmSecret && newSecret === confirmSecret && (
                            <p className="text-sm text-emerald-500 dark:text-emerald-400 flex items-center gap-1.5">
                              <CheckCircle className="w-4 h-4 flex-shrink-0" />
                              Keys match
                            </p>
                          )}
                        </div>
                      </div>

                      {newSecret && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className={cn("text-xs", colors.textMuted)}>
                              Strength
                            </span>
                            <span
                              className={cn(
                                "text-xs font-medium",
                                getPasswordStrength(newSecret) === "weak"
                                  ? "text-red-500"
                                  : getPasswordStrength(newSecret) === "medium"
                                    ? "text-yellow-500"
                                    : "text-emerald-500",
                              )}
                            >
                              {getPasswordStrength(newSecret).toUpperCase()}
                            </span>
                          </div>
                          <div
                            className={cn(
                              "h-1.5 w-full rounded-full overflow-hidden",
                              colors.backgroundMuted,
                            )}
                          >
                            <div
                              className={cn(
                                "h-full transition-all duration-300",
                                getPasswordStrength(newSecret) === "weak"
                                  ? "w-1/3 bg-red-500"
                                  : getPasswordStrength(newSecret) === "medium"
                                    ? "w-2/3 bg-yellow-500"
                                    : "w-full bg-emerald-500",
                              )}
                            />
                          </div>
                          <div className={cn("text-xs", colors.textMuted)}>
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

                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setStep("security");
                            setNewSecretValidationState(null);
                          }}
                          className={cn(
                            "flex-1 h-12",
                            colors.border,
                            colors.text,
                            colors.hoverBg,
                          )}
                          disabled={isLoading}
                        >
                          <ArrowLeft className="w-4 h-4 mr-2" />
                          Back
                        </Button>
                        <Button
                          onClick={handleResetSecret}
                          className="flex-1 h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold"
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

                      <div className={cn("text-xs pt-2", colors.textMuted)}>
                        <p>
                          ⓘ Make sure to save your secret key in a secure place.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === "success" && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="relative inline-block">
                  <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-emerald-500 to-green-500 flex items-center justify-center">
                    <CheckCircle className="w-12 h-12 text-white" />
                  </div>
                  <div className="absolute inset-0 rounded-full border-4 border-emerald-300 dark:border-emerald-600 animate-ping opacity-30" />
                </div>
                <h3 className={cn("text-2xl font-bold mt-6 mb-2", colors.text)}>
                  Success!
                </h3>
                <p className={cn(colors.textMuted)}>
                  Your secret key has been successfully reset
                </p>
              </div>

              <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-green-500/5" />
                <div
                  className={cn(
                    "relative p-6 rounded-2xl",
                    colors.border,
                    colors.backgroundMuted,
                  )}
                >
                  <div className="space-y-4">
                    <div>
                      <Label
                        className={cn(
                          "text-sm font-medium mb-3 block",
                          colors.text,
                        )}
                      >
                        Your New Secret Key
                      </Label>
                      <div className="flex items-stretch gap-3">
                        <div
                          className={cn(
                            "flex-1 p-4 border rounded-xl",
                            colors.border,
                            colors.background,
                          )}
                        >
                          <p className="font-mono text-lg text-center tracking-wider select-all">
                            {generatedSecret}
                          </p>
                        </div>
                        <Button
                          onClick={() => copyToClipboard(generatedSecret)}
                          className={cn(
                            "px-5 text-white font-semibold",
                            copied
                              ? "bg-emerald-600 hover:bg-emerald-700"
                              : "bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700",
                          )}
                        >
                          {copied ? (
                            <Check className="w-5 h-5" />
                          ) : (
                            <Copy className="w-5 h-5" />
                          )}
                        </Button>
                      </div>

                      {copied && (
                        <p className="text-sm text-emerald-500 dark:text-emerald-400 mt-2 text-center">
                          <Check className="w-4 h-4 inline mr-1" />
                          Copied to clipboard!
                        </p>
                      )}
                    </div>

                    <div
                      className={cn(
                        "p-4 rounded-xl border",
                        colors.border,
                        colors.warningBg,
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-500 dark:text-amber-500 mt-0.5" />
                        <div>
                          <h5
                            className={cn(
                              "font-semibold mb-2",
                              colors.warningText,
                            )}
                          >
                            Important Instructions
                          </h5>
                          <ul className="text-sm space-y-2">
                            <li className="flex items-center gap-2">
                              <div
                                className={cn(
                                  "w-1.5 h-1.5 rounded-full",
                                  colors.warningText,
                                )}
                              />
                              <span className={colors.warningText}>
                                Save this key in a secure password manager
                              </span>
                            </li>
                            <li className="flex items-center gap-2">
                              <div
                                className={cn(
                                  "w-1.5 h-1.5 rounded-full",
                                  colors.warningText,
                                )}
                              />
                              <span className={colors.warningText}>
                                Required for all future edits to this gig
                              </span>
                            </li>
                            <li className="flex items-center gap-2">
                              <div
                                className={cn(
                                  "w-1.5 h-1.5 rounded-full",
                                  colors.warningText,
                                )}
                              />
                              <span className={colors.warningText}>
                                Never share your secret key with anyone
                              </span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div
                      className={cn(
                        "p-4 rounded-xl border",
                        colors.border,
                        colors.infoBg,
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-blue-500 dark:text-blue-400 mt-0.5" />
                        <div>
                          <h6
                            className={cn("font-medium mb-1", colors.infoText)}
                          >
                            Next Steps
                          </h6>
                          <p className={cn("text-sm", colors.infoText)}>
                            You can now continue to edit your gig. Remember to
                            use this secret key whenever you need to make
                            changes.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setStep("trySecret");
                    setGeneratedSecret("");
                    setNewSecret("");
                    setConfirmSecret("");
                    setEmail("");
                    setSecurityAnswer("");
                    setEmailValidationState(null);
                    setSecurityValidationState(null);
                    setNewSecretValidationState(null);
                  }}
                  className={cn(
                    "flex-1 h-12",
                    colors.border,
                    colors.text,
                    colors.hoverBg,
                  )}
                >
                  Reset Another Key
                </Button>
                <Button
                  onClick={() => {
                    onSuccess();
                    onClose();
                  }}
                  className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold"
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Continue to Gig
                </Button>
              </div>

              <div className="text-center">
                <p className={cn("text-xs", colors.textMuted)}>
                  ⓘ This modal will close automatically when you click "Continue
                  to Gig"
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
