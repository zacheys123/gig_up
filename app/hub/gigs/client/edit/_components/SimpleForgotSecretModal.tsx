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
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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
        return (
          <LockKeyhole className="w-8 h-8 md:w-12 md:h-12 text-blue-500" />
        );
      case "email":
        return <Mail className="w-8 h-8 md:w-12 md:h-12 text-orange-500" />;
      case "security":
        return <Shield className="w-8 h-8 md:w-12 md:h-12 text-purple-500" />;
      case "newSecret":
        return <Key className="w-8 h-8 md:w-12 md:h-12 text-green-500" />;
      case "success":
        return (
          <CheckCircle className="w-8 h-8 md:w-12 md:h-12 text-emerald-500" />
        );
      default:
        return <Lock className="w-8 h-8 md:w-12 md:h-12 text-blue-500" />;
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case "trySecret":
        return isMobile ? "Secret Key" : "Enter Secret Key";
      case "email":
        return isMobile ? "Verify" : "Verify Identity";
      case "security":
        return isMobile ? "Security" : "Security Question";
      case "newSecret":
        return isMobile ? "New Key" : "New Secret Key";
      case "success":
        return "Success!";
      default:
        return "Recover Access";
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case "trySecret":
        return "Enter your gig secret key";
      case "email":
        return "Verify your identity";
      case "security":
        return "Answer security question";
      case "newSecret":
        return "Create a new secret key";
      case "success":
        return "Access restored!";
      default:
        return "Recover access to your gig";
    }
  };
  // Define steps array outside the component or at the top of the component
  const steps = [
    {
      key: "trySecret",
      label: isMobile ? "Key" : "Try Key",
    },
    {
      key: "email",
      label: isMobile ? "ID" : "Verify",
    },
    {
      key: "security",
      label: isMobile ? "Q" : "Security",
    },
    {
      key: "newSecret",
      label: isMobile ? "New" : "New Key",
    },
    { key: "success", label: "Done" },
  ];

  const getProgressSteps = () => {
    const currentIndex = steps.findIndex((s) => s.key === step);

    return (
      <div className="flex items-center justify-between md:justify-center mb-4 md:mb-6 px-2">
        {steps.map((stepItem, index) => (
          <div key={stepItem.key} className="flex items-center">
            <div
              className={cn(
                "w-7 h-7 md:w-10 md:h-10 rounded-full flex items-center justify-center text-xs md:text-sm font-medium transition-all",
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
                  "w-6 md:w-12 h-1 mx-1 md:mx-2 transition-all",
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
      {/* Main Dialog - Smaller on mobile */}
      <DialogContent
        className={cn(
          "w-[90vw] max-w-sm p-0 overflow-hidden rounded-xl",
          colors.background,
          colors.border,
        )}
      >
        {/* Sleek Header - More compact padding */}
        <div className={cn("p-3 md:p-5", colors.gradientPrimary)}>
          <DialogHeader>
            <div className="flex items-start gap-2 md:gap-3">
              <div
                className={cn(
                  "w-10 h-10 md:w-12 md:h-12 rounded-lg shrink-0",
                  colors.overlay,
                  "flex items-center justify-center",
                )}
              >
                {getStepIcon()}
              </div>
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-base md:text-lg font-bold text-white truncate">
                  {getStepTitle()}
                </DialogTitle>
                <DialogDescription className="text-xs text-blue-100 truncate">
                  {getStepDescription()}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          {gigTitle && (
            <div className="mt-1 text-xs text-blue-200 truncate">
              {gigTitle}
            </div>
          )}
        </div>

        {/* Progress Steps - More compact */}
        <div className="px-3 pt-3 md:px-5 md:pt-4">{getProgressSteps()}</div>

        {/* Step Content - Compact spacing */}
        <div
          className={cn(
            "px-3 pb-3 md:px-5 md:pb-4 max-h-[70vh] overflow-y-auto",
            colors.background,
          )}
        >
          {step === "trySecret" && (
            <div className="space-y-3">
              <div
                className={cn(
                  "p-3 rounded-lg",
                  colors.border,
                  colors.backgroundMuted,
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
                    <Lock className="w-3 h-3 text-white" />
                  </div>
                  <h3 className={cn("font-bold text-sm", colors.text)}>
                    Enter Key
                  </h3>
                </div>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Label className={cn("text-xs font-medium", colors.text)}>
                        Secret Key
                      </Label>
                      <span className="text-[10px] text-slate-500">
                        case-sensitive
                      </span>
                    </div>

                    <div className="relative">
                      <Input
                        value={secretInput}
                        onChange={(e) => setSecretInput(e.target.value)}
                        type={showSecret ? "text" : "password"}
                        className={cn(
                          "h-9 pr-16 text-sm rounded-lg",
                          colors.border,
                          colors.background,
                        )}
                        placeholder="Enter key..."
                      />
                      <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setShowSecret(!showSecret)}
                          className="p-1 rounded-md"
                        >
                          {showSecret ? (
                            <EyeOff className="w-3.5 h-3.5" />
                          ) : (
                            <Eye className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleTrySecret}
                    disabled={isLoading || !secretInput}
                    className="w-full h-9 text-sm bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      "Verify Key"
                    )}
                  </Button>
                </div>
              </div>
              <div className="text-center">
                <button
                  onClick={() => setStep("email")}
                  className="text-xs text-blue-600 hover:text-blue-700"
                >
                  Forgot key? Use recovery
                </button>
              </div>
            </div>
          )}

          {step === "email" && (
            <div className="space-y-3">
              <div
                className={cn(
                  "p-3 rounded-lg",
                  colors.border,
                  colors.backgroundMuted,
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500">
                    <Mail className="w-3 h-3 text-white" />
                  </div>
                  <h3 className={cn("font-bold text-sm", colors.text)}>
                    Verify Email
                  </h3>
                </div>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label className={cn("text-xs font-medium", colors.text)}>
                      Email Address
                    </Label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={cn(
                        "h-9 text-sm rounded-lg",
                        colors.border,
                        colors.background,
                      )}
                      placeholder="your@email.com"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setStep("trySecret")}
                      className="flex-1 h-9 text-xs"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleEmailSubmit}
                      disabled={isLoading || !email}
                      className="flex-1 h-9 text-xs bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white"
                    >
                      {isLoading ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        "Verify"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === "security" && (
            <div className="space-y-3">
              <div
                className={cn(
                  "p-3 rounded-lg",
                  colors.border,
                  colors.backgroundMuted,
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
                    <Shield className="w-3 h-3 text-white" />
                  </div>
                  <h3 className={cn("font-bold text-sm", colors.text)}>
                    Security Question
                  </h3>
                </div>
                <div className="space-y-3">
                  <div className={cn("p-2 rounded-lg text-xs", colors.border)}>
                    {securityQuestion}
                  </div>
                  <div className="space-y-1">
                    <Label className={cn("text-xs font-medium", colors.text)}>
                      Your Answer
                    </Label>
                    <div className="relative">
                      <Input
                        value={securityAnswer}
                        onChange={(e) => setSecurityAnswer(e.target.value)}
                        type={showSecurityAnswer ? "text" : "password"}
                        className={cn(
                          "h-9 pr-8 text-sm rounded-lg",
                          colors.border,
                          colors.background,
                        )}
                        placeholder="Enter answer..."
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowSecurityAnswer(!showSecurityAnswer)
                        }
                        className="absolute right-2 top-1/2 -translate-y-1/2"
                      >
                        {showSecurityAnswer ? (
                          <EyeOff className="w-3.5 h-3.5" />
                        ) : (
                          <Eye className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setStep("email")}
                      className="flex-1 h-9 text-xs"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleSecuritySubmit}
                      disabled={isLoading || !securityAnswer}
                      className="flex-1 h-9 text-xs bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                    >
                      {isLoading ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        "Verify"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === "newSecret" && (
            <div className="space-y-3">
              <div
                className={cn(
                  "p-3 rounded-lg",
                  colors.border,
                  colors.backgroundMuted,
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500">
                    <Key className="w-3 h-3 text-white" />
                  </div>
                  <h3 className={cn("font-bold text-sm", colors.text)}>
                    New Secret Key
                  </h3>
                </div>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Label className={cn("text-xs font-medium", colors.text)}>
                        New Key
                      </Label>
                      <button
                        onClick={generateRandomSecret}
                        className="text-xs text-blue-500"
                      >
                        <Sparkles className="w-3 h-3 inline mr-1" />
                        Generate
                      </button>
                    </div>
                    <div className="relative">
                      <Input
                        value={newSecret}
                        onChange={(e) => setNewSecret(e.target.value)}
                        type={showNewSecret ? "text" : "password"}
                        className={cn(
                          "h-9 pr-8 text-sm rounded-lg",
                          colors.border,
                          colors.background,
                        )}
                        placeholder="New secret key..."
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewSecret(!showNewSecret)}
                        className="absolute right-2 top-1/2 -translate-y-1/2"
                      >
                        {showNewSecret ? (
                          <EyeOff className="w-3.5 h-3.5" />
                        ) : (
                          <Eye className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className={cn("text-xs font-medium", colors.text)}>
                      Confirm Key
                    </Label>
                    <Input
                      value={confirmSecret}
                      onChange={(e) => setConfirmSecret(e.target.value)}
                      type={showNewSecret ? "text" : "password"}
                      className={cn(
                        "h-9 text-sm rounded-lg",
                        colors.border,
                        colors.background,
                      )}
                      placeholder="Confirm secret key..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setStep("security")}
                      className="flex-1 h-9 text-xs"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleResetSecret}
                      disabled={
                        isLoading ||
                        !newSecret ||
                        !confirmSecret ||
                        newSecret !== confirmSecret ||
                        newSecret.length < 8
                      }
                      className="flex-1 h-9 text-xs bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                    >
                      {isLoading ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        "Set Key"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === "success" && (
            <div className="space-y-3">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 mb-2">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <h3 className={cn("font-bold text-base", colors.text)}>
                  Success!
                </h3>
                <p className={cn("text-xs mt-1", colors.textMuted)}>
                  Your secret key has been reset
                </p>
              </div>

              <div
                className={cn(
                  "p-3 rounded-lg",
                  colors.border,
                  colors.backgroundMuted,
                )}
              >
                <Label
                  className={cn("text-xs font-medium mb-2 block", colors.text)}
                >
                  Your New Secret Key
                </Label>
                <div className="flex gap-2">
                  <div
                    className={cn(
                      "flex-1 p-2 rounded-lg text-xs font-mono break-all",
                      colors.border,
                      colors.background,
                    )}
                  >
                    {generatedSecret}
                  </div>
                  <Button
                    onClick={() => copyToClipboard(generatedSecret)}
                    className={cn(
                      "px-3 h-9",
                      copied
                        ? "bg-emerald-600 hover:bg-emerald-700"
                        : "bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700",
                      "text-white",
                    )}
                  >
                    {copied ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setStep("trySecret");
                    setGeneratedSecret("");
                    setNewSecret("");
                    setConfirmSecret("");
                  }}
                  className="flex-1 h-9 text-xs"
                >
                  Reset Another
                </Button>
                <Button
                  onClick={() => {
                    onSuccess();
                    onClose();
                  }}
                  className="flex-1 h-9 text-xs bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
                >
                  Continue
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
