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
  Copy,
  Check,
  Loader2,
  Sparkles,
  LockKeyhole,
  Info,
  XCircle,
  Fingerprint,
  ChevronRight,
  Zap,
  ShieldCheck,
  Clock,
  Gift,
  Star,
  Rocket,
  Gem,
  Sparkle,
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
  const { colors, isDarkMode, theme } = useThemeColors();
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
    const iconProps = "w-5 h-5 md:w-6 md:h-6";
    switch (step) {
      case "trySecret":
        return <LockKeyhole className={iconProps} />;
      case "email":
        return <Mail className={iconProps} />;
      case "security":
        return <Shield className={iconProps} />;
      case "newSecret":
        return <Key className={iconProps} />;
      case "success":
        return <CheckCircle className={iconProps} />;
      default:
        return <Lock className={iconProps} />;
    }
  };

  const getStepGradient = () => {
    // Simple, clean gradients using theme colors
    const gradients = {
      trySecret: isDarkMode
        ? "from-blue-600/90 to-indigo-600/90"
        : "from-blue-500 to-indigo-500",
      email: isDarkMode
        ? "from-amber-600/90 to-orange-600/90"
        : "from-amber-500 to-orange-500",
      security: isDarkMode
        ? "from-purple-600/90 to-pink-600/90"
        : "from-purple-500 to-pink-500",
      newSecret: isDarkMode
        ? "from-emerald-600/90 to-teal-600/90"
        : "from-emerald-500 to-teal-500",
      success: isDarkMode
        ? "from-green-600/90 to-emerald-600/90"
        : "from-green-500 to-emerald-500",
    };

    return gradients[step as keyof typeof gradients] || gradients.trySecret;
  };

  const getStepTitle = () => {
    switch (step) {
      case "trySecret":
        return "Enter Secret Key";
      case "email":
        return "Verify Email";
      case "security":
        return "Security Question";
      case "newSecret":
        return "Create New Key";
      case "success":
        return "Access Restored";
      default:
        return "Recover Access";
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case "trySecret":
        return "Enter the secret key for this gig";
      case "email":
        return "Verify your identity to proceed";
      case "security":
        return "Answer your security question";
      case "newSecret":
        return "Create a new secure secret key";
      case "success":
        return "Your gig access has been restored";
      default:
        return "Recover access to your gig";
    }
  };

  const steps = [
    { key: "trySecret", icon: Lock, label: "Key" },
    { key: "email", icon: Mail, label: "Email" },
    { key: "security", icon: Shield, label: "Security" },
    { key: "newSecret", icon: Key, label: "New" },
    { key: "success", icon: Check, label: "Done" },
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === step);

  const renderStepContent = () => {
    switch (step) {
      case "trySecret":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label
                className={cn(
                  "text-sm",
                  isDarkMode ? "text-gray-300" : "text-gray-700",
                )}
              >
                Secret Key
              </Label>
              <div className="relative">
                <Input
                  type={showSecret ? "text" : "password"}
                  value={secretInput}
                  onChange={(e) => setSecretInput(e.target.value)}
                  placeholder="Enter your secret key"
                  className={cn(
                    "h-11 pr-20",
                    isDarkMode
                      ? "bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                      : "bg-white border-gray-200 text-gray-900 placeholder:text-gray-400",
                    secretValidationState === "invalid" && "border-red-500",
                    secretValidationState === "valid" && "border-green-500",
                  )}
                />
                {secretValidationState === "valid" && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Check className="w-4 h-4 text-green-500" />
                    Verified:Redirecting....
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showSecret ? (
                    <EyeOff
                      className={cn(
                        "w-4 h-4",
                        isDarkMode ? "text-gray-400" : "text-gray-500",
                      )}
                    />
                  ) : (
                    <Eye
                      className={cn(
                        "w-4 h-4",
                        isDarkMode ? "text-gray-400" : "text-gray-500",
                      )}
                    />
                  )}
                </button>
              </div>

              {secretValidationState === "invalid" && (
                <div className="flex items-center gap-2 text-sm text-red-500 mt-2">
                  <XCircle className="w-4 h-4" />
                  <span>Invalid key. Please try again.</span>
                </div>
              )}
            </div>

            <Button
              onClick={handleTrySecret}
              disabled={isLoading || !secretInput}
              className="w-full h-11"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Shield className="w-4 h-4 mr-2" />
              )}
              {isLoading ? "Verifying..." : "Verify Key"}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div
                  className={cn(
                    "w-full border-t",
                    isDarkMode ? "border-gray-700" : "border-gray-200",
                  )}
                />
              </div>
              <div className="relative flex justify-center text-xs">
                <span
                  className={cn(
                    "px-2",
                    isDarkMode
                      ? "bg-gray-900 text-gray-500"
                      : "bg-white text-gray-500",
                  )}
                >
                  or
                </span>
              </div>
            </div>

            <Button
              variant="link"
              onClick={() => setStep("email")}
              className="w-full h-11"
            >
              <HelpCircle className="w-4 h-4 mr-2" />
              <span className="text-blue-400 font-medium ">
                I forgot my key
              </span>
            </Button>
          </div>
        );

      case "email":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label
                className={cn(
                  "text-sm",
                  isDarkMode ? "text-gray-300" : "text-gray-700",
                )}
              >
                Email Address
              </Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className={cn(
                  "h-11",
                  isDarkMode
                    ? "bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                    : "bg-white border-gray-200 text-gray-900 placeholder:text-gray-400",
                  emailValidationState === "invalid" && "border-red-500",
                  emailValidationState === "valid" && "border-green-500",
                )}
              />
            </div>

            {emailValidationMessage && (
              <div
                className={cn(
                  "text-sm p-3 rounded-lg",
                  emailValidationState === "invalid"
                    ? isDarkMode
                      ? "bg-red-900/20 text-red-400"
                      : "bg-red-50 text-red-600"
                    : isDarkMode
                      ? "bg-green-900/20 text-green-400"
                      : "bg-green-50 text-green-600",
                )}
              >
                {emailValidationMessage}
              </div>
            )}

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep("trySecret")}
                className="flex-1 h-11"
              >
                Back
              </Button>
              <Button
                onClick={handleEmailSubmit}
                disabled={isLoading || !email}
                className="flex-1 h-11"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Continue"
                )}
              </Button>
            </div>
          </div>
        );

      case "security":
        return (
          <div className="space-y-4">
            <div
              className={cn(
                "p-4 rounded-lg",
                isDarkMode ? "bg-gray-800/50" : "bg-gray-50",
              )}
            >
              <p
                className={cn(
                  "text-xs mb-1",
                  isDarkMode ? "text-gray-400" : "text-gray-500",
                )}
              >
                Security Question
              </p>
              <p
                className={cn(
                  "text-sm",
                  isDarkMode ? "text-white" : "text-gray-900",
                )}
              >
                {securityQuestion}
              </p>
            </div>

            <div className="space-y-2">
              <Label
                className={cn(
                  "text-sm",
                  isDarkMode ? "text-gray-300" : "text-gray-700",
                )}
              >
                Your Answer
              </Label>
              <div className="relative">
                <Input
                  value={securityAnswer}
                  onChange={(e) => setSecurityAnswer(e.target.value)}
                  type={showSecurityAnswer ? "text" : "password"}
                  placeholder="Enter your answer"
                  className={cn(
                    "h-11 pr-12",
                    isDarkMode
                      ? "bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                      : "bg-white border-gray-200 text-gray-900 placeholder:text-gray-400",
                    securityValidationState === "invalid" && "border-red-500",
                    securityValidationState === "valid" && "border-green-500",
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowSecurityAnswer(!showSecurityAnswer)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showSecurityAnswer ? (
                    <EyeOff
                      className={cn(
                        "w-4 h-4",
                        isDarkMode ? "text-gray-400" : "text-gray-500",
                      )}
                    />
                  ) : (
                    <Eye
                      className={cn(
                        "w-4 h-4",
                        isDarkMode ? "text-gray-400" : "text-gray-500",
                      )}
                    />
                  )}
                </button>
              </div>
            </div>

            {securityValidationMessage && (
              <div
                className={cn(
                  "text-sm p-3 rounded-lg",
                  securityValidationState === "invalid"
                    ? isDarkMode
                      ? "bg-red-900/20 text-red-400"
                      : "bg-red-50 text-red-600"
                    : isDarkMode
                      ? "bg-green-900/20 text-green-400"
                      : "bg-green-50 text-green-600",
                )}
              >
                {securityValidationMessage}
              </div>
            )}

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep("email")}
                className="flex-1 h-11"
              >
                Back
              </Button>
              <Button
                variant={"destructive"}
                onClick={handleSecuritySubmit}
                disabled={isLoading || !securityAnswer}
                className="flex-1 h-11"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Verify"
                )}
              </Button>
            </div>
          </div>
        );

      case "newSecret":
        const strength = getPasswordStrength(newSecret);
        const strengthText = {
          weak: "Weak",
          medium: "Medium",
          strong: "Strong",
        };
        const strengthColor = {
          weak: isDarkMode ? "bg-red-600" : "bg-red-500",
          medium: isDarkMode ? "bg-yellow-600" : "bg-yellow-500",
          strong: isDarkMode ? "bg-green-600" : "bg-green-500",
        };

        return (
          <div className="space-y-4">
            {newSecret && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span
                    className={isDarkMode ? "text-gray-400" : "text-gray-500"}
                  >
                    Strength
                  </span>
                  <span
                    className={
                      strength === "weak"
                        ? "text-red-500"
                        : strength === "medium"
                          ? "text-yellow-500"
                          : "text-green-500"
                    }
                  >
                    {strengthText[strength]}
                  </span>
                </div>
                <div
                  className={cn(
                    "h-1.5 rounded-full overflow-hidden",
                    isDarkMode ? "bg-gray-700" : "bg-gray-200",
                  )}
                >
                  <div
                    className={cn(
                      "h-full rounded-full",
                      strengthColor[strength],
                    )}
                    style={{
                      width:
                        strength === "weak"
                          ? "33%"
                          : strength === "medium"
                            ? "66%"
                            : "100%",
                    }}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label
                  className={cn(
                    "text-sm",
                    isDarkMode ? "text-gray-300" : "text-gray-700",
                  )}
                >
                  New Secret Key
                </Label>
                <button
                  onClick={generateRandomSecret}
                  className={cn(
                    "text-xs flex items-center gap-1",
                    isDarkMode
                      ? "text-blue-400 hover:text-blue-300"
                      : "text-blue-600 hover:text-blue-700",
                  )}
                >
                  <Sparkles className="w-3 h-3" />
                  Generate
                </button>
              </div>
              <div className="relative">
                <Input
                  value={newSecret}
                  onChange={(e) => setNewSecret(e.target.value)}
                  type={showNewSecret ? "text" : "password"}
                  placeholder="Create a new secret key"
                  className={cn(
                    "h-11 pr-12 font-mono",
                    isDarkMode
                      ? "bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                      : "bg-white border-gray-200 text-gray-900 placeholder:text-gray-400",
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowNewSecret(!showNewSecret)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showNewSecret ? (
                    <EyeOff
                      className={cn(
                        "w-4 h-4",
                        isDarkMode ? "text-gray-400" : "text-gray-500",
                      )}
                    />
                  ) : (
                    <Eye
                      className={cn(
                        "w-4 h-4",
                        isDarkMode ? "text-gray-400" : "text-gray-500",
                      )}
                    />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label
                className={cn(
                  "text-sm",
                  isDarkMode ? "text-gray-300" : "text-gray-700",
                )}
              >
                Confirm Secret Key
              </Label>
              <Input
                value={confirmSecret}
                onChange={(e) => setConfirmSecret(e.target.value)}
                type={showNewSecret ? "text" : "password"}
                placeholder="Confirm your secret key"
                className={cn(
                  "h-11 font-mono",
                  isDarkMode
                    ? "bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                    : "bg-white border-gray-200 text-gray-900 placeholder:text-gray-400",
                  newSecret &&
                    confirmSecret &&
                    newSecret !== confirmSecret &&
                    "border-red-500",
                  newSecret &&
                    confirmSecret &&
                    newSecret === confirmSecret &&
                    "border-green-500",
                )}
              />
            </div>

            {newSecret && confirmSecret && newSecret !== confirmSecret && (
              <div className="text-sm text-red-500 flex items-center gap-2">
                <XCircle className="w-4 h-4" />
                <span>Keys don't match</span>
              </div>
            )}

            {newSecret && newSecret.length < 8 && (
              <div className="text-sm text-yellow-500 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>Minimum 8 characters</span>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setStep("security")}
                className="flex-1 h-11"
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
                className="flex-1 h-11"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Set Key"
                )}
              </Button>
            </div>
          </div>
        );

      case "success":
        return (
          <div className="space-y-4">
            <div className="flex flex-col items-center py-4">
              <div
                className={cn(
                  "w-16 h-16 rounded-full flex items-center justify-center mb-4",
                  isDarkMode ? "bg-green-600/20" : "bg-green-100",
                )}
              >
                <CheckCircle
                  className={cn(
                    "w-8 h-8",
                    isDarkMode ? "text-green-500" : "text-green-600",
                  )}
                />
              </div>
              <h3
                className={cn(
                  "text-lg font-semibold",
                  isDarkMode ? "text-white" : "text-gray-900",
                )}
              >
                Success!
              </h3>
              <p
                className={cn(
                  "text-sm text-center",
                  isDarkMode ? "text-gray-400" : "text-gray-500",
                )}
              >
                Your gig access has been restored
              </p>
            </div>

            <div
              className={cn(
                "p-4 rounded-lg",
                isDarkMode ? "bg-gray-800" : "bg-gray-50",
              )}
            >
              <Label
                className={cn(
                  "text-xs block mb-2",
                  isDarkMode ? "text-gray-400" : "text-gray-500",
                )}
              >
                Your New Secret Key
              </Label>
              <div className="flex gap-2">
                <div
                  className={cn(
                    "flex-1 p-3 rounded font-mono text-sm break-all",
                    isDarkMode
                      ? "bg-gray-900 text-white"
                      : "bg-white text-gray-900 border border-gray-200",
                  )}
                >
                  {generatedSecret}
                </div>
                <Button
                  onClick={() => copyToClipboard(generatedSecret)}
                  variant={copied ? "default" : "outline"}
                  className="px-3 h-11"
                >
                  {copied ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p
                className={cn(
                  "text-xs mt-2 flex items-center gap-1",
                  isDarkMode ? "text-gray-400" : "text-gray-500",
                )}
              >
                <Info className="w-3 h-3" />
                Save this key somewhere safe
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setStep("trySecret");
                  setGeneratedSecret("");
                  setNewSecret("");
                  setConfirmSecret("");
                }}
                className="flex-1 h-11"
              >
                Reset Another
              </Button>
              <Button
                onClick={() => {
                  onSuccess();
                  onClose();
                }}
                className="flex-1 h-11"
              >
                Continue
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={cn(
          "w-[95vw] max-w-md p-0 gap-0 overflow-hidden rounded-xl border",
          isDarkMode
            ? "bg-gray-900 border-gray-800"
            : "bg-white border-gray-200",
        )}
      >
        {/* Simple Header */}
        <div className={cn("p-5 bg-gradient-to-r", getStepGradient())}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center text-white">
              {getStepIcon()}
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-white">
                {getStepTitle()}
              </DialogTitle>
              <DialogDescription className="text-sm text-white/80">
                {getStepDescription()}
              </DialogDescription>
            </div>
          </div>
          {gigTitle && (
            <div className="mt-3 text-sm text-white/90 bg-white/10 rounded px-3 py-1.5 truncate">
              {gigTitle}
            </div>
          )}
        </div>

        {/* Simple Progress Steps */}
        <div className="px-5 pt-4">
          <div className="flex items-center justify-between">
            {steps.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={s.key} className="flex items-center">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-xs flex-col gap-15",
                      i <= currentStepIndex
                        ? isDarkMode
                          ? "bg-blue-600 text-white"
                          : "bg-blue-500 text-white"
                        : isDarkMode
                          ? "bg-gray-800 text-gray-600"
                          : "bg-gray-100 text-gray-400",
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {s.label}
                  </div>
                  {i < steps.length - 1 && (
                    <div
                      className={cn(
                        "w-12 h-0.5 mx-1",
                        i < currentStepIndex
                          ? isDarkMode
                            ? "bg-blue-600"
                            : "bg-blue-500"
                          : isDarkMode
                            ? "bg-gray-800"
                            : "bg-gray-200",
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-5">{renderStepContent()}</div>

        {/* Simple Footer */}
        <div className="px-5 pb-5">
          <div
            className={cn(
              "flex items-center justify-center gap-2 text-xs py-2",
              isDarkMode ? "text-gray-500" : "text-gray-400",
            )}
          >
            <Lock className="w-3 h-3" />
            <span>Encrypted</span>
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            <ShieldCheck className="w-3 h-3" />
            <span>Secure</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
