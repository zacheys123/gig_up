"use client";
import { Switch } from "@/components/ui/switch";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { cn } from "@/lib/utils";
import { ArrowRight, Trash2 } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import {
  User,
  Bell,
  Lock,
  CreditCard,
  X,
  Check,
  Sun,
  Moon,
  Info,
  HelpCircle,
  LogOut,
} from "react-feather";
import { useThemeToggle } from "@/hooks/useTheme";
import { useThemeColors } from "@/hooks/useTheme";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useClerk, useUser } from "@clerk/nextjs";
import { PrivacySettings } from "@/components/settings/PrivacySettings";
import { useRouter } from "next/navigation";
import { Loader2, AlertTriangle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
// Types
type SettingItem = {
  label: string;
  action: () => void;
  isDanger?: boolean;
  isNavigation?: boolean;
};

type SettingsSection = {
  title: string;
  icon: React.ReactNode;
  items: SettingItem[];
};

type ModalType =
  | "deleteaccount"
  | "2fa"
  | "login-activity"
  | "devices"
  | "payments"
  | "privacy";

const SettingPage = () => {
  const router = useRouter();
  const { user } = useCurrentUser();
  const { isDarkMode: darkMode, toggleDarkMode } = useThemeToggle();
  const { colors } = useThemeColors();
  // State
  const [activeModal, setActiveModal] = useState<ModalType | null>(null);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const [notifications, setNotifications] = useState({
    push: true,
    email: true,
    sms: false,
    marketing: false,
  });

  const [formData, setFormData] = useState({
    phoneNumber: "",
  });

  // Settings sections configuration - UPDATED
  // In your main settings page - UPDATE THIS SECTION
  const settingsSections: SettingsSection[] = [
    {
      title: "Account",
      icon: <User size={18} className="mr-3" />,
      items: [
        {
          label: "Email Preferences",
          action: () => alert("Email preferences modal coming soon"),
        },
        {
          label: "Delete Account",
          action: () => openModal("deleteaccount"),
          isDanger: true,
        },
      ],
    },
    {
      title: "Notifications",
      icon: <Bell size={18} className="mr-3" />,
      items: [
        {
          label: "Notification Preferences",
          action: () => router.push("/settings/notification"), // CHANGED: Redirect to notifications page
          isNavigation: true, // CHANGED: Now it's navigation
        },
        {
          label: "SMS Alerts",
          action: () => alert("coming soon"),
          isNavigation: false,
        },
      ],
    },
    {
      title: "Privacy",
      icon: <Lock size={18} className="mr-3" />,
      items: [
        {
          label: "Privacy Settings",
          action: () => openModal("privacy"),
          isNavigation: true,
        },
        {
          label: "Blocked Users",
          action: () => alert("Blocked users management coming soon"),
        },
      ],
    },
    {
      title: "Billing",
      icon: <CreditCard size={18} className="mr-3" />,
      items: [
        {
          label: "Payment Methods",
          action: () => openModal("payments"),
        },
        {
          label: "Billing History",
          action: () => alert("Billing history modal coming soon"),
        },
        {
          label: "Subscription Plan",
          action: () => alert("Subscription plan modal coming soon"),
        },
      ],
    },
  ];

  // Modal handlers
  const openModal = (modalName: ModalType) => setActiveModal(modalName);
  const closeModal = () => setActiveModal(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggleChange = (name: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  // Delete Account Modal
  const DeleteAccountModal = () => {
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState("");
    const [username, setUsername] = useState("");
    const [confirmChecked, setConfirmChecked] = useState(false);
    const [deletionSteps, setDeletionSteps] = useState<string[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const { user: clerkUser } = useUser();
    const { signOut } = useClerk();
    const deleteUserAccount = useMutation(
      api.controllers.user.deleteUserAccount
    );

    useEffect(() => {
      inputRef.current?.focus();
    }, []);

    const usernameMatches = username === user?.username;
    const canDelete = usernameMatches && confirmChecked && !isDeleting;

    const handleDeleteAccount = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!canDelete) return;

      setIsDeleting(true);
      setError("");
      setDeletionSteps(["Starting account deletion..."]);

      try {
        if (!user) throw new Error("No user found");
        if (!clerkUser?.id) throw new Error("No authentication user found");

        setDeletionSteps((prev) => [
          ...prev,
          "Deleting your data from our database...",
        ]);

        const convexResult = await deleteUserAccount({
          userId: clerkUser.id,
          username: user.username,
        });

        if (!convexResult.success) {
          throw new Error(
            convexResult.success || "Failed to delete data from database"
          );
        }

        setDeletionSteps((prev) => [
          ...prev,
          "Deleting your authentication account...",
        ]);

        await clerkUser.delete();

        setDeletionSteps((prev) => [...prev, "Account deleted successfully!"]);

        setDeletionSteps((prev) => [...prev, "Signing out and redirecting..."]);

        await new Promise((resolve) => setTimeout(resolve, 1500));

        await signOut(() => {
          router.push("/");
        });
      } catch (err: any) {
        console.error("Delete account error:", err);
        setError(
          err.message ||
            "Failed to delete account. Please try again or contact support."
        );
        setIsDeleting(false);
      }
    };

    return (
      <div className="space-y-8">
        {/* Modern Warning Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-50/80 via-white to-orange-50/60 dark:from-red-950/20 dark:via-gray-900 dark:to-orange-950/10 border border-red-200/60 dark:border-red-800/30 shadow-xl">
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-orange-500/5" />

          {/* Decorative Elements */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-red-400/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-orange-400/10 rounded-full blur-3xl" />

          <div className="relative p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 shadow-lg shadow-red-500/20">
                  <AlertTriangle
                    className="w-6 h-6 text-white"
                    strokeWidth={2.5}
                  />
                </div>
                <div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                    Delete Account
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Permanent action • No recovery possible
                  </p>
                </div>
              </div>

              <span className="inline-flex items-center px-4 py-2 rounded-full bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 font-semibold text-sm tracking-wide border border-red-300/50 dark:border-red-700/50">
                ⚠️ IRREVERSIBLE
              </span>
            </div>

            {/* Stats Grid */}
            <div className="mb-6">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                Everything below will be permanently removed:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  { text: "Personal Profile", icon: "👤" },
                  { text: "Gigs & Applications", icon: "💼" },
                  { text: "Chat History", icon: "💬" },
                  { text: "Notifications", icon: "🔔" },
                  { text: "Payment History", icon: "💰" },
                  { text: "Connections", icon: "🤝" },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-lg bg-white/50 dark:bg-gray-800/30 border border-gray-200/50 dark:border-gray-700/30 hover:border-red-300/50 dark:hover:border-red-700/30 transition-colors"
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Final Warning */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-red-500/10 to-orange-500/5 border border-red-300/30 dark:border-red-700/30">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
                    <span className="text-lg">🚨</span>
                  </div>
                </div>
                <div>
                  <p className="font-bold text-red-700 dark:text-red-300">
                    Immediate & Permanent
                  </p>
                  <p className="text-sm text-red-600/80 dark:text-red-400/80 mt-1">
                    This action will delete all your data instantly. There is no
                    undo button.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        {isDeleting && deletionSteps.length > 0 && (
          <div className="rounded-2xl bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 border border-gray-200/60 dark:border-gray-700/40 shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin" />
                </div>
                <div className="absolute -inset-2 bg-blue-500/10 rounded-full animate-ping" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white">
                  Deleting Account
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  This may take a moment...
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {deletionSteps.map((step, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-800/30 transition-colors"
                >
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      index === deletionSteps.length - 1
                        ? "bg-blue-500/20 border border-blue-500/30"
                        : "bg-green-500/20 border border-green-500/30"
                    }`}
                  >
                    {index === deletionSteps.length - 1 ? (
                      <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-pulse" />
                    ) : (
                      <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p
                      className={`font-medium ${
                        index === deletionSteps.length - 1
                          ? "text-blue-700 dark:text-blue-300"
                          : "text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {step}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Step {index + 1} of {deletionSteps.length}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Confirmation Form */}
        {!isDeleting && (
          <form onSubmit={handleDeleteAccount} className="space-y-8">
            {/* Username Verification */}
            <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-700/40 shadow-lg p-6">
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Verify your identity
                </label>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Type your username exactly as shown to confirm this action
                </p>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <Input
                    ref={inputRef}
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your Username"
                    className={`h-12 text-base px-4 rounded-xl transition-all duration-300 text-gray-900 dark:text-white ${
                      username && !usernameMatches
                        ? "border-2 border-red-500 focus:ring-4 focus:ring-red-500/15 focus:border-red-500 bg-gradient-to-r from-red-50/80 to-red-100/30 dark:from-red-950/20 dark:to-red-900/10"
                        : "border-2 border-gray-300 dark:border-gray-700 focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 bg-white dark:bg-gray-900"
                    } ${
                      usernameMatches
                        ? "border-green-500 focus:border-green-500 focus:ring-green-500/15 bg-gradient-to-r from-green-50/80 to-green-100/30 dark:from-green-950/20 dark:to-green-900/10"
                        : ""
                    }`}
                    disabled={isDeleting}
                  />

                  {username && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div
                        className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                          usernameMatches
                            ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
                            : "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300"
                        }`}
                      >
                        {usernameMatches ? (
                          <>
                            <Check className="w-4 h-4" />
                            Verified
                          </>
                        ) : (
                          <>
                            <X className="w-4 h-4" />
                            Mismatch
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Final Consent */}
            <div className="rounded-2xl bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 border border-gray-200/60 dark:border-gray-700/40 shadow-lg p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  <div className="relative">
                    <Checkbox
                      id="confirm-deletion"
                      checked={confirmChecked}
                      onCheckedChange={(checked) =>
                        setConfirmChecked(checked === true)
                      }
                      className="
      peer
      w-8 h-8
      rounded-xl
      border-2
      border-gray-300/80
      dark:border-gray-600/80
      bg-white/90
      dark:bg-gray-900/90
      backdrop-blur-sm
      shadow-lg
      shadow-gray-200/50
      dark:shadow-gray-900/50
      transition-all
      duration-400
      ease-out-cubic
      hover:border-red-400
      hover:shadow-xl
      hover:shadow-red-200/30
      dark:hover:shadow-red-900/20
      hover:scale-110
      focus:ring-4
      focus:ring-red-500/25
      focus:outline-none
      disabled:opacity-60
      disabled:cursor-not-allowed
      disabled:hover:scale-100
      disabled:hover:border-gray-300
      disabled:hover:shadow-lg
      data-[state=checked]:border-transparent
      data-[state=checked]:bg-gradient-to-br
      data-[state=checked]:from-red-600
      data-[state=checked]:to-orange-600
      data-[state=checked]:shadow-2xl
      data-[state=checked]:shadow-red-500/40
      data-[state=checked]:scale-110
    "
                      disabled={isDeleting}
                    />

                    {/* Custom check icon with animation */}
                    <div
                      className="
    absolute
    left-1/2
    top-1/2
    -translate-x-1/2
    -translate-y-1/2
    pointer-events-none
    transition-all
    duration-300
    ease-out-back
    opacity-0
    scale-50
    peer-data-[state=checked]:opacity-100
    peer-data-[state=checked]:scale-100
  "
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="drop-shadow-sm"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>

                    {/* Pulsing ring effect when checked */}
                    <div
                      className="
    absolute
    inset-0
    rounded-xl
    border-2
    border-transparent
    pointer-events-none
    transition-all
    duration-500
    opacity-0
    scale-100
    peer-data-[state=checked]:border-red-400/50
    peer-data-[state=checked]:opacity-100
    peer-data-[state=checked]:scale-125
    peer-data-[state=checked]:animate-pulse
  "
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <label
                    htmlFor="confirm-deletion"
                    className="block text-lg font-bold text-gray-900 dark:text-white cursor-pointer"
                  >
                    I understand and accept the consequences
                  </label>
                  <div className="space-y-2">
                    <p className="text-gray-700 dark:text-gray-300">
                      By checking this box, I confirm that:
                    </p>
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                        All my data will be permanently erased
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                        This action cannot be undone or recovered
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />I
                        will lose access to all my content permanently
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="rounded-xl bg-gradient-to-r from-red-50 to-red-100/50 dark:from-red-900/20 dark:to-red-900/10 border border-red-200 dark:border-red-800/30 p-4 animate-in fade-in">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-red-800 dark:text-red-300">
                      Deletion Failed
                    </p>
                    <p className="text-sm text-red-700/80 dark:text-red-400/80 mt-1">
                      {error}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                type="button"
                onClick={closeModal}
                variant="outline"
                className="flex-1 h-12 text-base rounded-xl border-gray-300 hover:text-gray-100 dark:hover:bg-gray-800 bg-blue-500 transition-colors"
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={!canDelete}
                className="flex-1 h-12 text-base rounded-xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-500/20 hover:shadow-red-500/30 transition-all duration-200"
              >
                {isDeleting ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Deleting Account...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Trash2 className="w-5 h-5" />
                    <span className="font-semibold">
                      Permanently Delete Account
                    </span>
                  </div>
                )}
              </Button>
            </div>

            {/* Safety Note */}
            <div className="text-center pt-4">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Need help? Contact our support team before proceeding.
              </p>
            </div>
          </form>
        )}
      </div>
    );
  };

  // Two-Factor Authentication Modal
  const TwoFactorModal = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h4 className={cn("font-medium", colors.text)}>
            Two-Factor Authentication
          </h4>
          <p className={cn("text-sm mt-1", colors.textSecondary)}>
            {twoFactorEnabled
              ? "Currently enabled"
              : "Add extra security to your account"}
          </p>
        </div>
        <button
          onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
          className={cn(
            "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
            twoFactorEnabled ? colors.primaryBg : colors.border
          )}
        >
          <span
            className={cn(
              "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
              twoFactorEnabled ? "translate-x-6" : "translate-x-1"
            )}
          />
        </button>
      </div>

      {twoFactorEnabled && (
        <div className={cn("p-4 rounded-lg", colors.background)}>
          <div className="flex items-center space-x-3 mb-4">
            <div className={cn("p-3 rounded-lg", colors.backgroundMuted)}>
              <Lock size={20} className={colors.primary} />
            </div>
            <div>
              <h4 className={cn("font-medium", colors.text)}>
                Authenticator App
              </h4>
              <p className={cn("text-sm", colors.textSecondary)}>
                Use an app like Google Authenticator
              </p>
            </div>
          </div>

          <div className={cn("p-3 rounded-lg", colors.backgroundMuted)}>
            <div className="flex justify-between items-center mb-4">
              <span className={cn("font-mono text-lg", colors.text)}>
                7B5N 3K9P 2L8M
              </span>
              <button className={cn("text-sm font-medium", colors.primary)}>
                Copy
              </button>
            </div>
            <div className="bg-white p-2 rounded flex justify-center">
              <div className="w-32 h-32 bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500 text-xs">QR Code</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end space-x-3 pt-4">
        <button
          onClick={closeModal}
          className={cn(
            "px-4 py-2 rounded-lg border font-medium",
            colors.border,
            colors.textSecondary,
            colors.background
          )}
        >
          {twoFactorEnabled ? "Close" : "Cancel"}
        </button>
        {!twoFactorEnabled && (
          <button
            onClick={() => setTwoFactorEnabled(true)}
            className={cn(
              "px-4 py-2 rounded-lg font-medium",
              colors.primaryBg,
              colors.textInverted
            )}
          >
            Enable 2FA
          </button>
        )}
      </div>
    </div>
  );

  // Login Activity Modal
  const LoginActivityModal = () => (
    <div>
      <div className="space-y-4">
        {[
          {
            device: "Chrome • Windows",
            location: "New York, US",
            time: "1 day ago",
          },
          {
            device: "Safari • iPhone",
            location: "San Francisco, US",
            time: "2 days ago",
          },
          {
            device: "Firefox • Mac",
            location: "London, UK",
            time: "1 week ago",
          },
        ].map((session, index) => (
          <div
            key={index}
            className={cn(
              "flex items-center justify-between p-3 rounded-lg",
              colors.background
            )}
          >
            <div>
              <p className={cn("font-medium", colors.text)}>{session.device}</p>
              <p className={cn("text-sm", colors.textSecondary)}>
                {session.location} • {session.time}
              </p>
            </div>
            <button
              className={cn(
                "text-sm font-medium hover:opacity-80",
                colors.destructive
              )}
            >
              Log out
            </button>
          </div>
        ))}
      </div>
      <div className="flex justify-end pt-6">
        <button
          onClick={closeModal}
          className={cn(
            "px-4 py-2 rounded-lg font-medium",
            colors.primaryBg,
            colors.textInverted
          )}
        >
          Close
        </button>
      </div>
    </div>
  );

  // Connected Devices Modal
  const ConnectedDevicesModal = () => (
    <div>
      <div className="space-y-4">
        {[
          {
            device: "iPhone 13",
            status: "Currently active",
            lastActive: "Now",
          },
          {
            device: "MacBook Pro",
            status: "Last active 2 hours ago",
            lastActive: "2 hours ago",
          },
          {
            device: "iPad Pro",
            status: "Last active 1 day ago",
            lastActive: "1 day ago",
          },
        ].map((device, index) => (
          <div
            key={index}
            className={cn(
              "flex items-center justify-between p-3 rounded-lg",
              colors.background
            )}
          >
            <div>
              <p className={cn("font-medium", colors.text)}>{device.device}</p>
              <p className={cn("text-sm", colors.textSecondary)}>
                {device.status}
              </p>
            </div>
            <button
              className={cn(
                "text-sm font-medium hover:opacity-80",
                colors.destructive
              )}
            >
              Disconnect
            </button>
          </div>
        ))}
      </div>
      <div className="flex justify-end pt-6">
        <button
          onClick={closeModal}
          className={cn(
            "px-4 py-2 rounded-lg font-medium",
            colors.primaryBg,
            colors.textInverted
          )}
        >
          Close
        </button>
      </div>
    </div>
  );

  // Payment Methods Modal
  const PaymentsModal = () => (
    <div>
      <div className="space-y-4">
        <div className={cn("p-4 rounded-lg", colors.background)}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={cn("p-2 rounded mr-3", colors.primaryBg)}>
                <CreditCard size={18} className="text-white" />
              </div>
              <div>
                <p className={cn("font-medium", colors.text)}>Visa •••• 4242</p>
                <p className={cn("text-sm", colors.textSecondary)}>
                  Expires 04/2025
                </p>
              </div>
            </div>
            <button
              className={cn(
                "text-sm font-medium hover:opacity-80",
                colors.destructive
              )}
            >
              Remove
            </button>
          </div>
        </div>

        <div className={cn("p-4 rounded-lg", colors.background)}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={cn("p-2 rounded mr-3", colors.border)}>
                <CreditCard size={18} className="text-white" />
              </div>
              <div>
                <p className={cn("font-medium", colors.text)}>
                  Mastercard •••• 8888
                </p>
                <p className={cn("text-sm", colors.textSecondary)}>
                  Expires 08/2024
                </p>
              </div>
            </div>
            <button
              className={cn(
                "text-sm font-medium hover:opacity-80",
                colors.destructive
              )}
            >
              Remove
            </button>
          </div>
        </div>

        <button
          className={cn(
            "w-full p-3 border-2 border-dashed rounded-lg transition-colors",
            colors.border,
            colors.textSecondary
          )}
        >
          + Add New Payment Method
        </button>
      </div>
      <div className="flex justify-end pt-6">
        <button
          onClick={closeModal}
          className={cn(
            "px-4 py-2 rounded-lg font-medium",
            colors.primaryBg,
            colors.textInverted
          )}
        >
          Close
        </button>
      </div>
    </div>
  );

  const PrivacyModal = () => (
    <div>
      <PrivacySettings user={user} />
      <div className="flex justify-end pt-6">
        <button
          onClick={closeModal}
          className={cn(
            "px-4 py-2 rounded-lg font-medium",
            colors.primaryBg,
            colors.textInverted
          )}
        >
          Close
        </button>
      </div>
    </div>
  );

  // Modal content mapping
  const modalContent = {
    deleteaccount: {
      title: "Delete Account",
      component: <DeleteAccountModal />,
    },
    "2fa": {
      title: "Two-Factor Authentication",
      component: <TwoFactorModal />,
    },
    "login-activity": {
      title: "Login Activity",
      component: <LoginActivityModal />,
    },
    devices: {
      title: "Connected Devices",
      component: <ConnectedDevicesModal />,
    },
    payments: {
      title: "Payment Methods",
      component: <PaymentsModal />,
    },

    privacy: {
      title: "Privacy Settings",
      component: <PrivacyModal />,
    },
  } as const;

  // Safe modal access
  const getModalContent = (modalType: ModalType) => {
    return modalContent[modalType];
  };

  return (
    <div className={cn("max-w-4xl mx-auto p-6", colors.text)}>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className={cn("text-3xl font-bold", colors.primary)}>Settings</h1>
        <button
          onClick={() => toggleDarkMode()}
          className={cn(
            "flex items-center px-4 py-2 rounded-lg",
            colors.background,
            colors.text
          )}
        >
          {darkMode ? (
            <Sun size={18} className="mr-2" />
          ) : (
            <Moon size={18} className="mr-2" />
          )}
          {darkMode ? "Light Mode" : "Dark Mode"}
        </button>
      </div>

      {/* Settings Sections */}
      <div className="space-y-8">
        {settingsSections.map((section, index) => (
          <div
            key={index}
            className={cn("rounded-xl p-6 shadow-lg", colors.card)}
          >
            <div className="flex items-center mb-4">
              <span className={colors.textSecondary}>{section.icon}</span>
              <h2 className="text-xl font-semibold">{section.title}</h2>
            </div>

            <div className="space-y-3">
              {section.items.map((item, itemIndex) => (
                <div
                  key={itemIndex}
                  className={cn(
                    "flex justify-between items-center p-4 rounded-lg transition-colors cursor-pointer group",
                    item.isDanger
                      ? colors.destructiveBg
                      : item.isNavigation
                        ? cn("bg-blue-800/30 hover:bg-blue-800/40", colors.text)
                        : colors.hoverBg
                  )}
                  onClick={item.action}
                >
                  <span className="font-medium">{item.label}</span>
                  <div className="flex items-center">
                    {item.isNavigation ? (
                      <ArrowRight
                        size={16}
                        className={cn(
                          "ml-2 group-hover:translate-x-1 transition-transform",
                          colors.primary
                        )}
                      />
                    ) : (
                      <Info
                        size={16}
                        className={cn("ml-2", colors.textSecondary)}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Actions */}
      <div
        className={cn(
          "mt-10 flex justify-between items-center pt-6 border-t",
          colors.border
        )}
      >
        <button
          className={cn(
            "flex items-center hover:opacity-80",
            colors.textSecondary
          )}
        >
          <HelpCircle size={16} className="mr-2" />
          Help Center
        </button>
        <button
          className={cn(
            "flex items-center px-4 py-2 rounded-lg",
            colors.destructiveBg,
            colors.destructive
          )}
        >
          <LogOut size={16} className="mr-2" />
          Log Out
        </button>
      </div>

      {/* Modal */}
      {activeModal && (
        <div
          className={cn(
            "fixed inset-0 flex items-center justify-center z-50 p-4",
            colors.overlay
          )}
        >
          <div
            className={cn(
              "rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto", // Increased max-width for better layout
              colors.card
            )}
          >
            <div
              className={cn(
                "sticky top-0 p-6 pb-4 flex justify-between items-center border-b rounded-t-xl",
                colors.card,
                colors.border
              )}
            >
              <h3 className="text-xl font-bold">
                {getModalContent(activeModal).title}
              </h3>
              <button
                onClick={closeModal}
                className={cn(
                  "p-1 rounded-full hover:opacity-70",
                  colors.textSecondary
                )}
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">{getModalContent(activeModal).component}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingPage;
