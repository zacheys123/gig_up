"use client";
import { Switch } from "@/components/ui/switch";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
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

        // Step 1: Delete from Convex
        setDeletionSteps((prev) => [
          ...prev,
          "Deleting your data from our database...",
        ]);

        const convexResult = await deleteUserAccount({
          userId: clerkUser.id,
          username: user.username, // Pass username for verification
        });

        if (!convexResult.success) {
          throw new Error(
            convexResult.success || "Failed to delete data from database"
          );
        }

        // Step 2: Delete from Clerk
        setDeletionSteps((prev) => [
          ...prev,
          "Deleting your authentication account...",
        ]);

        // Use Clerk's delete method
        await clerkUser.delete();

        setDeletionSteps((prev) => [...prev, "Account deleted successfully!"]);

        // Step 3: Sign out and redirect
        setDeletionSteps((prev) => [...prev, "Signing out and redirecting..."]);

        // Small delay to show success message
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Sign out and redirect to home
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
      <div className="space-y-6">
        {/* Warning Banner */}
        <div
          className={cn(
            "rounded-lg p-4 border",
            colors.destructiveBg,
            colors.warningBorder,
            "animate-pulse"
          )}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <AlertTriangle className={cn("w-5 h-5", colors.destructive)} />
            </div>
            <div className="flex-1">
              <h4 className={cn("font-bold mb-1", colors.destructive)}>
                ⚠️ Permanent Account Deletion
              </h4>
              <ul className={cn("text-sm space-y-1", colors.warningText)}>
                <li>• All your personal data will be permanently erased</li>
                <li>• Your gigs, applications, and bookings will be removed</li>
                <li>• All messages and notifications will be deleted</li>
                <li>• This action cannot be undone</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Deletion Steps Progress */}
        {isDeleting && deletionSteps.length > 0 && (
          <div
            className={cn(
              "rounded-lg p-4",
              colors.backgroundMuted,
              "border border-dashed"
            )}
          >
            <div className="flex items-center gap-2 mb-3">
              <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
              <span className="font-medium">Deleting your account...</span>
            </div>
            <div className="space-y-2">
              {deletionSteps.map((step, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full",
                      index === deletionSteps.length - 1
                        ? "bg-blue-500 animate-pulse"
                        : "bg-green-500"
                    )}
                  />
                  <span
                    className={cn(
                      index === deletionSteps.length - 1
                        ? "font-medium"
                        : "opacity-70"
                    )}
                  >
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Confirmation Form */}
        {!isDeleting && (
          <form onSubmit={handleDeleteAccount} className="space-y-6">
            {/* Username Confirmation */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  className={cn("text-sm font-medium", colors.textSecondary)}
                >
                  Confirm your username
                </label>
                {username && (
                  <span
                    className={cn(
                      "text-xs font-medium px-2 py-1 rounded",
                      usernameMatches
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                        : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                    )}
                  >
                    {usernameMatches ? "✓ Matches" : "✗ Doesn't match"}
                  </span>
                )}
              </div>
              <Input
                ref={inputRef}
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={`Enter "${user?.username}" to confirm`}
                className={cn(
                  "transition-all duration-200 ",
                  colors.textMuted,
                  username &&
                    !usernameMatches &&
                    "border-red-500 focus:border-red-500"
                )}
                disabled={isDeleting}
              />
            </div>

            {/* Final Confirmation */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="confirm-deletion"
                  checked={confirmChecked}
                  onCheckedChange={(checked) =>
                    setConfirmChecked(checked === true)
                  }
                  className={cn(
                    "mt-0.5",
                    colors.destructive,
                    "data-[state=checked]:bg-destructive data-[state=checked]:text-white"
                  )}
                  disabled={isDeleting}
                />
                <div className="space-y-1">
                  <label
                    htmlFor="confirm-deletion"
                    className={cn(
                      "text-sm font-medium cursor-pointer",
                      colors.text
                    )}
                  >
                    I understand all consequences
                  </label>
                  <p className={cn("text-xs", colors.textMuted)}>
                    I confirm that I want to permanently delete my account and
                    all associated data. I understand this cannot be undone.
                  </p>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div
                className={cn(
                  "rounded-lg p-3 border",
                  "bg-red-50 dark:bg-red-900/20",
                  "border-red-200 dark:border-red-800",
                  "animate-in fade-in"
                )}
              >
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                  <span className="text-sm text-red-600 dark:text-red-400">
                    {error}
                  </span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                onClick={closeModal}
                variant="outline"
                className="min-w-[100px]"
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="destructive"
                className="min-w-[180px]"
                disabled={!canDelete}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Permanently Delete Account"
                )}
              </Button>
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
