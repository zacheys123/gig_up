"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertCircle,
  Key,
  Lock,
  Unlock,
  RefreshCw,
  Mail,
  Shield,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle,
  Loader2,
  Sparkles,
  Fingerprint,
  Clock,
  UserCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { motion, AnimatePresence } from "framer-motion";
import { useThemeColors } from "@/hooks/useTheme";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const stepGradients = {
  enter: "from-orange-500/20 via-amber-500/10 to-yellow-500/5",
  forgot: "from-blue-500/20 via-cyan-500/10 to-sky-500/5",
  reset: "from-emerald-500/20 via-green-500/10 to-teal-500/5",
  success: "from-green-500/20 via-emerald-500/10 to-teal-500/5",
};

export const SecretKeyVerificationModal = React.memo(
  ({
    isOpen,
    onClose,
    onSuccess,
    gigId,
    userId,
  }: {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    gigId: Id<"gigs">;
    userId: Id<"users">;
  }) => {
    const router = useRouter();
    const { colors } = useThemeColors();
    const { user: currentUser } = useCurrentUser(); // Get current user for clerkId

    const [step, setStep] = useState<"enter" | "forgot" | "reset" | "success">(
      "enter"
    );
    const [secretKey, setSecretKey] = useState("");
    const [email, setEmail] = useState("");
    const [resetCode, setResetCode] = useState("");
    const [newSecretKey, setNewSecretKey] = useState("");
    const [confirmSecretKey, setConfirmSecretKey] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSecretKey, setShowSecretKey] = useState(false);
    const [showNewSecretKey, setShowNewSecretKey] = useState(false);
    const [showConfirmSecretKey, setShowConfirmSecretKey] = useState(false);
    const [attempts, setAttempts] = useState(0);
    const [lockUntil, setLockUntil] = useState<number | null>(null);
    const [resetToken, setResetToken] = useState<string | null>(null);
    const [isCheckingSecret, setIsCheckingSecret] = useState(true);

    const gig = useQuery(api.controllers.gigs.getGigById, { gigId });

    // Updated mutations to use clerkId
    const verifySecretKey = useMutation(
      api.controllers.verifyGig.verifyGigSecretKey
    );
    const requestSecretReset = useMutation(
      api.controllers.verifyGig.requestSecretKeyReset
    );
    const resetSecretKey = useMutation(
      api.controllers.verifyGig.resetSecretKey
    );
    const sendVerificationEmail = useMutation(
      api.controllers.email.sendSecretKeyResetEmail
    );

    useEffect(() => {
      if (gig) {
        setIsCheckingSecret(false);
        if (!gig.secret || gig.secret.trim() === "") {
          setTimeout(() => {
            onSuccess();
            onClose();
          }, 500);
        }
      }
    }, [gig, onSuccess, onClose]);

    useEffect(() => {
      if (lockUntil) {
        const interval = setInterval(() => {
          if (Date.now() >= lockUntil) {
            setLockUntil(null);
            setAttempts(0);
          }
        }, 1000);
        return () => clearInterval(interval);
      }
    }, [lockUntil]);

    const getLockoutDuration = useCallback((attemptCount: number) => {
      if (attemptCount >= 5) return 15 * 60 * 1000;
      if (attemptCount >= 3) return 5 * 60 * 1000;
      if (attemptCount >= 1) return 1 * 60 * 1000;
      return 0;
    }, []);

    const formatRemainingTime = useCallback((ms: number) => {
      const minutes = Math.floor(ms / 60000);
      const seconds = Math.floor((ms % 60000) / 1000);
      return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    }, []);

    // Updated to use clerkId
    const handleVerifySecretKey = useCallback(async () => {
      if (!currentUser?.clerkId) {
        toast.error("Please log in to verify");
        return;
      }

      if (lockUntil) {
        const remainingTime = lockUntil - Date.now();
        toast.error(
          `Too many attempts. Please wait ${formatRemainingTime(remainingTime)} before trying again.`
        );
        return;
      }

      if (!secretKey.trim()) {
        toast.error("Please enter the secret key");
        return;
      }

      setIsSubmitting(true);
      try {
        const isValid = await verifySecretKey({
          gigId,
          secretKey: secretKey.trim(),
          clerkId: currentUser.clerkId, // Pass clerkId instead of userId
        });

        if (isValid) {
          toast.success("Verification Successful!");
          onSuccess();
          onClose();
        } else {
          const newAttempts = attempts + 1;
          setAttempts(newAttempts);

          if (newAttempts >= 3) {
            const lockDuration = getLockoutDuration(newAttempts);
            setLockUntil(Date.now() + lockDuration);
            toast.error(
              `Too many attempts. Account locked for ${Math.ceil(lockDuration / 60000)} minutes.`
            );
          } else {
            toast.error(
              `Invalid key. ${3 - newAttempts} attempt${newAttempts === 2 ? "" : "s"} remaining.`
            );
          }
        }
      } catch (error) {
        console.error("Verification error:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Verification failed. Please check your connection and try again."
        );
      } finally {
        setIsSubmitting(false);
      }
    }, [
      secretKey,
      gigId,
      currentUser,
      attempts,
      lockUntil,
      verifySecretKey,
      onSuccess,
      onClose,
      getLockoutDuration,
      formatRemainingTime,
    ]);

    // Updated to use clerkId
    const handleForgotSecretKey = useCallback(async () => {
      if (!currentUser?.clerkId) {
        toast.error("Please log in to reset secret key");
        return;
      }

      if (!email.trim()) {
        toast.error("Please enter your registered email");
        return;
      }

      setIsSubmitting(true);
      try {
        if (!gig || gig.postedBy !== userId) {
          toast.error("You are not authorized to reset this secret key");
          return;
        }

        const token = await requestSecretReset({
          gigId,
          email: email.trim(),
          clerkId: currentUser.clerkId, // Pass clerkId instead of userId
        });

        if (token) {
          setResetToken(token);

          await sendVerificationEmail({
            toEmail: email.trim(),
            gigTitle: gig.title,
            resetToken: token,
            gigId,
          });

          setStep("reset");
          toast.success("Reset Email Sent!");
        } else {
          toast.error("Email verification failed. Please try again.");
        }
      } catch (error) {
        console.error("Reset request error:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to process reset request. Please try again."
        );
      } finally {
        setIsSubmitting(false);
      }
    }, [
      email,
      gig,
      gigId,
      userId,
      currentUser,
      requestSecretReset,
      sendVerificationEmail,
    ]);

    // Updated to use clerkId
    const handleResetSecretKey = useCallback(async () => {
      if (!currentUser?.clerkId) {
        toast.error("Please log in to reset secret key");
        return;
      }

      if (
        !resetCode.trim() ||
        !newSecretKey.trim() ||
        !confirmSecretKey.trim()
      ) {
        toast.error("Please fill all fields");
        return;
      }

      if (newSecretKey !== confirmSecretKey) {
        toast.error("New secret keys do not match");
        return;
      }

      if (newSecretKey.length < 6) {
        toast.error("Secret key must be at least 6 characters");
        return;
      }

      setIsSubmitting(true);
      try {
        const success = await resetSecretKey({
          gigId,
          resetToken: resetToken || "",
          resetCode: resetCode.trim(),
          newSecretKey: newSecretKey.trim(),
          clerkId: currentUser.clerkId, // Pass clerkId instead of userId
        });

        if (success) {
          toast.success("Key Reset Successful!");
          setStep("success");
          setTimeout(() => {
            onSuccess();
            onClose();
          }, 2000);
        } else {
          toast.error("Invalid reset code. Please try again.");
        }
      } catch (error) {
        console.error("Reset error:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to reset secret key. Please try again."
        );
      } finally {
        setIsSubmitting(false);
      }
    }, [
      resetCode,
      newSecretKey,
      confirmSecretKey,
      resetToken,
      gigId,
      currentUser,
      resetSecretKey,
      onSuccess,
      onClose,
    ]);

    const handleResendResetCode = useCallback(async () => {
      if (!email.trim()) return;

      try {
        await sendVerificationEmail({
          toEmail: email.trim(),
          gigTitle: gig?.title || "Your Gig",
          resetToken: resetToken || "",
          gigId,
        });
        toast.success("Reset code resent to your email!");
      } catch (error) {
        toast.error("Failed to resend reset code");
      }
    }, [email, gig, resetToken, gigId, sendVerificationEmail]);

    if (isCheckingSecret) {
      return (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent
            className={cn(
              "sm:max-w-md border-0 p-0 overflow-hidden",
              colors.background
            )}
          >
            <div className="p-8">
              <div className="text-center space-y-6">
                <motion.div
                  initial={{ scale: 0.5, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 15,
                  }}
                  className="relative"
                >
                  <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-orange-500/20 to-amber-500/20 flex items-center justify-center">
                    <Shield className="w-12 h-12 text-orange-500" />
                  </div>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="absolute inset-0 rounded-full border-2 border-orange-500/30 border-t-transparent"
                  />
                </motion.div>

                <div>
                  <h3 className={`text-2xl font-bold mb-2 ${colors.text}`}>
                    Security Check
                  </h3>
                  <p className={`text-sm ${colors.textMuted}`}>
                    Verifying gig security requirements
                  </p>
                </div>

                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                  <div className="space-y-1">
                    <div
                      className={`h-1 w-48 rounded-full overflow-hidden ${colors.backgroundSecondary}`}
                    >
                      <motion.div
                        className="h-full bg-gradient-to-r from-orange-500 to-amber-500"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                    </div>
                    <p className={`text-xs ${colors.textMuted}`}>
                      Analyzing...
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      );
    }

    if (gig && (!gig.secret || gig.secret.trim() === "")) {
      return null;
    }

    const renderContent = () => {
      const stepConfig = {
        enter: {
          icon: Lock,
          title: "Verify Ownership",
          description: `Enter the secret key for "${gig?.title}"`,
          color: "text-orange-500",
          bgColor: "bg-orange-500/10",
        },
        forgot: {
          icon: Key,
          title: "Reset Secret Key",
          description: "Enter your registered email for reset instructions",
          color: "text-blue-500",
          bgColor: "bg-blue-500/10",
        },
        reset: {
          icon: Shield,
          title: "Set New Key",
          description: "Create a new secure secret key",
          color: "text-emerald-500",
          bgColor: "bg-emerald-500/10",
        },
        success: {
          icon: CheckCircle,
          title: "Success!",
          description: "Your key has been reset successfully",
          color: "text-green-500",
          bgColor: "bg-green-500/10",
        },
      };

      const config = stepConfig[step];
      const Icon = config.icon;

      switch (step) {
        case "enter":
          return (
            <div className="space-y-6">
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0.9, y: 10 }}
                  animate={{ scale: 1, y: 0 }}
                  className="relative mb-4"
                >
                  <div
                    className={cn(
                      "w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-4",
                      config.bgColor,
                      "border",
                      colors.border
                    )}
                  >
                    <Icon className={cn("w-10 h-10", config.color)} />
                  </div>
                  <div className="absolute -top-2 -right-2">
                    <Badge
                      className={cn(
                        "px-2 py-1 text-xs font-medium",
                        "bg-gradient-to-r from-orange-500 to-amber-500 text-white"
                      )}
                    >
                      Required
                    </Badge>
                  </div>
                </motion.div>

                <h3 className={`text-2xl font-bold mb-2 ${colors.text}`}>
                  {config.title}
                </h3>
                <p className={`text-sm mb-1 ${colors.textMuted}`}>
                  {config.description}
                </p>
                <p className={`text-xs ${colors.textMuted}`}>
                  This ensures only authorized users can edit this gig
                </p>
              </div>

              <Separator className={colors.border} />

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className={`text-sm font-medium ${colors.text}`}>
                      <span className="flex items-center gap-2">
                        <Fingerprint className="w-4 h-4" />
                        Secret Key
                      </span>
                    </label>
                    {attempts > 0 && (
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs",
                          attempts >= 3
                            ? "border-red-500/30 text-red-500"
                            : "border-orange-500/30 text-orange-500"
                        )}
                      >
                        {attempts} attempt{attempts !== 1 ? "s" : ""}
                      </Badge>
                    )}
                  </div>

                  <div className="relative group">
                    <div
                      className={cn(
                        "absolute inset-0 rounded-xl blur-xl opacity-20 transition-opacity group-hover:opacity-30",
                        "bg-gradient-to-r from-orange-500 to-amber-500"
                      )}
                    />
                    <div className="relative">
                      <Key
                        className={cn(
                          "absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4",
                          colors.textMuted
                        )}
                      />
                      <Input
                        type={showSecretKey ? "text" : "password"}
                        value={secretKey}
                        onChange={(e) => setSecretKey(e.target.value)}
                        placeholder="Enter your secret key"
                        className={cn(
                          "pl-12 pr-12 h-12 rounded-xl border-2 transition-all",
                          colors.border,
                          colors.background,
                          colors.text,
                          "focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20",
                          lockUntil && "opacity-50 cursor-not-allowed"
                        )}
                        disabled={!!lockUntil}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleVerifySecretKey();
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowSecretKey(!showSecretKey)}
                        className={cn(
                          "absolute right-4 top-1/2 transform -translate-y-1/2 p-1.5 rounded-lg transition-colors",
                          colors.hoverBg
                        )}
                      >
                        {showSecretKey ? (
                          <EyeOff className="w-4 h-4 text-gray-400" />
                        ) : (
                          <Eye className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {lockUntil && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="overflow-hidden"
                  >
                    <div
                      className={cn(
                        "p-4 rounded-xl border",
                        "bg-gradient-to-r from-red-500/5 to-orange-500/5",
                        "border-red-500/30"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-red-500/20">
                          <Clock className="w-5 h-5 text-red-500" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-red-600">
                            Account Temporarily Locked
                          </p>
                          <p className="text-xs text-red-500/80 mt-1">
                            Too many failed attempts. Try again in{" "}
                            {formatRemainingTime(lockUntil - Date.now())}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div
                  className={cn(
                    "p-4 rounded-xl border",
                    colors.border,
                    colors.backgroundSecondary
                  )}
                >
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-orange-500 mt-0.5" />
                    <div>
                      <p className={`text-sm font-medium mb-1 ${colors.text}`}>
                        Security Reminder
                      </p>
                      <ul className={`text-xs space-y-1 ${colors.textMuted}`}>
                        <li>• Never share your secret key with anyone</li>
                        <li>• Keep it in a secure place</li>
                        <li>• Reset immediately if compromised</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-sm px-0 hover:text-orange-600"
                    onClick={() => setStep("forgot")}
                  >
                    <span className="flex items-center gap-2">
                      <Key className="w-4 h-4" />
                      Forgot your key?
                    </span>
                  </Button>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3].map((num) => (
                      <div
                        key={num}
                        className={cn(
                          "w-2 h-2 rounded-full",
                          attempts >= num
                            ? "bg-red-500"
                            : `${colors.borderMuted}`
                        )}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );

        case "forgot":
          return (
            <div className="space-y-6">
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className="relative mb-4"
                >
                  <div
                    className={cn(
                      "w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-4",
                      "bg-gradient-to-br from-blue-500/10 to-cyan-500/10",
                      "border border-blue-500/20"
                    )}
                  >
                    <Icon className="w-10 h-10 text-blue-500" />
                  </div>
                  <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-blue-500" />
                </motion.div>

                <h3 className={`text-2xl font-bold mb-2 ${colors.text}`}>
                  {config.title}
                </h3>
                <p className={`text-sm ${colors.textMuted}`}>
                  We'll send reset instructions to your email
                </p>
              </div>

              <Separator className={colors.border} />

              <div className="space-y-4">
                <div>
                  <label
                    className={`block text-sm font-medium mb-3 ${colors.text}`}
                  >
                    <span className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Registered Email
                    </span>
                  </label>
                  <div className="relative group">
                    <div
                      className={cn(
                        "absolute inset-0 rounded-xl blur-xl opacity-20 transition-opacity group-hover:opacity-30",
                        "bg-gradient-to-r from-blue-500 to-cyan-500"
                      )}
                    />
                    <div className="relative">
                      <Mail
                        className={cn(
                          "absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4",
                          colors.textMuted
                        )}
                      />
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className={cn(
                          "pl-12 h-12 rounded-xl border-2 transition-all",
                          colors.border,
                          colors.background,
                          colors.text,
                          "focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        )}
                      />
                    </div>
                  </div>
                  <p className={`text-xs ${colors.textMuted} mt-2`}>
                    Must match the email associated with this gig
                  </p>
                </div>

                <div
                  className={cn(
                    "p-4 rounded-xl border",
                    colors.border,
                    colors.backgroundSecondary
                  )}
                >
                  <div className="flex items-start gap-3">
                    <UserCheck className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                      <p className={`text-sm font-medium mb-1 ${colors.text}`}>
                        What to Expect
                      </p>
                      <ul className={`text-xs space-y-1 ${colors.textMuted}`}>
                        <li>• Reset code sent to your email</li>
                        <li>• Valid for 15 minutes</li>
                        <li>• Secure token-based verification</li>
                        <li>• No password required</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );

        case "reset":
          return (
            <div className="space-y-6">
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className="relative mb-4"
                >
                  <div
                    className={cn(
                      "w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-4",
                      "bg-gradient-to-br from-emerald-500/10 to-green-500/10",
                      "border border-emerald-500/20"
                    )}
                  >
                    <Icon className="w-10 h-10 text-emerald-500" />
                  </div>
                </motion.div>

                <h3 className={`text-2xl font-bold mb-2 ${colors.text}`}>
                  {config.title}
                </h3>
                <p className={`text-sm ${colors.textMuted}`}>
                  Enter the code from your email and create a new key
                </p>
              </div>

              <Separator className={colors.border} />

              <div className="space-y-4">
                <div>
                  <label
                    className={`block text-sm font-medium mb-3 ${colors.text}`}
                  >
                    <span className="flex items-center gap-2">
                      <Key className="w-4 h-4" />
                      Reset Code
                    </span>
                  </label>
                  <div className="relative group">
                    <div
                      className={cn(
                        "absolute inset-0 rounded-xl blur-xl opacity-20 transition-opacity group-hover:opacity-30",
                        "bg-gradient-to-r from-emerald-500 to-green-500"
                      )}
                    />
                    <div className="relative">
                      <Input
                        type="text"
                        value={resetCode}
                        onChange={(e) => setResetCode(e.target.value)}
                        placeholder="6-digit code from email"
                        maxLength={6}
                        className={cn(
                          "h-12 text-center text-xl font-mono rounded-xl border-2",
                          colors.border,
                          colors.background,
                          colors.text,
                          "focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                        )}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${colors.text}`}
                    >
                      New Secret Key
                    </label>
                    <div className="relative">
                      <Input
                        type={showNewSecretKey ? "text" : "password"}
                        value={newSecretKey}
                        onChange={(e) => setNewSecretKey(e.target.value)}
                        placeholder="At least 6 characters"
                        className={cn(
                          "pr-10 rounded-xl border-2",
                          colors.border,
                          colors.background,
                          colors.text,
                          "focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                        )}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewSecretKey(!showNewSecretKey)}
                        className={cn(
                          "absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 rounded-lg",
                          colors.hoverBg
                        )}
                      >
                        {showNewSecretKey ? (
                          <EyeOff className="w-4 h-4 text-gray-400" />
                        ) : (
                          <Eye className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${colors.text}`}
                    >
                      Confirm Secret Key
                    </label>
                    <div className="relative">
                      <Input
                        type={showConfirmSecretKey ? "text" : "password"}
                        value={confirmSecretKey}
                        onChange={(e) => setConfirmSecretKey(e.target.value)}
                        placeholder="Confirm your new key"
                        className={cn(
                          "pr-10 rounded-xl border-2",
                          colors.border,
                          colors.background,
                          colors.text,
                          "focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                        )}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmSecretKey(!showConfirmSecretKey)
                        }
                        className={cn(
                          "absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 rounded-lg",
                          colors.hoverBg
                        )}
                      >
                        {showConfirmSecretKey ? (
                          <EyeOff className="w-4 h-4 text-gray-400" />
                        ) : (
                          <Eye className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleResendResetCode}
                    className="text-sm"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Resend Code
                  </Button>
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    onClick={() => setStep("forgot")}
                  >
                    Change Email
                  </Button>
                </div>
              </div>
            </div>
          );

        case "success":
          return (
            <div className="text-center space-y-6">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 15,
                }}
                className="relative"
              >
                <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 flex items-center justify-center mb-4">
                  <CheckCircle className="w-12 h-12 text-green-500" />
                </div>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute inset-0 rounded-full border-2 border-green-500/30 border-t-transparent"
                />
              </motion.div>

              <div>
                <h3 className={`text-2xl font-bold mb-2 ${colors.text}`}>
                  Success!
                </h3>
                <p className={`text-sm mb-1 ${colors.textMuted}`}>
                  {config.description}
                </p>
                <p className={`text-xs ${colors.textMuted}`}>
                  You can now edit your gig securely
                </p>
              </div>

              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 2 }}
                className="h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
              />

              <div className="space-y-2">
                <p className={`text-sm ${colors.textMuted}`}>
                  This dialog will close automatically...
                </p>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3].map((dot) => (
                    <motion.div
                      key={dot}
                      className="w-2 h-2 rounded-full bg-green-500"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: dot * 0.2,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          );

        default:
          return null;
      }
    };

    const renderFooter = () => {
      switch (step) {
        case "enter":
          return (
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="flex-1"
                onClick={handleVerifySecretKey}
                disabled={
                  isSubmitting ||
                  !secretKey.trim() ||
                  !!lockUntil ||
                  !currentUser?.clerkId
                }
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Unlock className="w-4 h-4 mr-2" />
                    Verify & Continue
                  </>
                )}
              </Button>
            </div>
          );

        case "forgot":
          return (
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep("enter")}
                className="flex-1"
                disabled={isSubmitting}
              >
                Back
              </Button>
              <Button
                type="button"
                className="flex-1"
                onClick={handleForgotSecretKey}
                disabled={
                  isSubmitting || !email.trim() || !currentUser?.clerkId
                }
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Send Reset
                  </>
                )}
              </Button>
            </div>
          );

        case "reset":
          return (
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep("enter")}
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="flex-1"
                onClick={handleResetSecretKey}
                disabled={
                  isSubmitting ||
                  !resetCode ||
                  !newSecretKey ||
                  !confirmSecretKey ||
                  !currentUser?.clerkId
                }
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Reset Key
                  </>
                )}
              </Button>
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
            "sm:max-w-lg border-0 p-0 overflow-hidden",
            colors.background,
            "shadow-2xl"
          )}
        >
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-br opacity-10",
              stepGradients[step]
            )}
          />

          <div className="relative p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>

            {step !== "success" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8"
              >
                <Separator className={cn("mb-6", colors.border)} />
                {renderFooter()}
              </motion.div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }
);

SecretKeyVerificationModal.displayName = "SecretKeyVerificationModal";
