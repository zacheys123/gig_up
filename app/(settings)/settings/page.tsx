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
import { useRouter } from "next/navigation";
import { useThemeToggle } from "@/hooks/useTheme";
import { useThemeColors } from "@/hooks/useTheme";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useClerk, useUser } from "@clerk/nextjs";
import { PrivacySettings } from "@/components/settings/PrivacySettings";
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
  | "notifications"
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

  // Settings sections configuration
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
          action: () => router.push("/settings/notification"),
          isNavigation: true,
        },
        {
          label: "Push Notifications",
          action: () => alert("Push notifications modal coming soon"),
        },
        {
          label: "Email Notifications",
          action: () => alert("Email notifications modal coming soon"),
        },
        {
          label: "SMS Alerts",
          action: () => alert("SMS alerts modal coming soon"),
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

  // Notification Toggle Component
  const NotificationToggle = ({
    name,
    label,
  }: {
    name: keyof typeof notifications;
    label: string;
  }) => (
    <div className="flex items-center justify-between py-3">
      <span className={cn("font-medium text-sm", colors.textSecondary)}>
        {label}
      </span>
      <div className="flex items-center gap-2">
        <Switch
          checked={notifications[name]}
          onCheckedChange={() => handleToggleChange(name)}
          className={cn(
            notifications[name] ? colors.primaryBg : colors.backgroundMuted
          )}
        />
      </div>
    </div>
  );

  // Notifications Modal
  const NotificationsModal = () => (
    <div className="space-y-4">
      <NotificationToggle name="push" label="Push Notifications" />
      <NotificationToggle name="email" label="Email Notifications" />
      <NotificationToggle name="sms" label="SMS Alerts" />
      <NotificationToggle name="marketing" label="Marketing Communications" />

      <div className="pt-4">
        <label
          className={cn("block text-sm font-medium mb-1", colors.textSecondary)}
        >
          SMS Phone Number
        </label>
        <input
          type="tel"
          name="phoneNumber"
          value={formData.phoneNumber}
          onChange={handleInputChange}
          className={cn(
            "w-full rounded-lg px-4 py-2 focus:ring-2 focus:border-transparent",
            colors.background,
            colors.text
          )}
          placeholder="+1 (___) ___-____"
          disabled={!notifications.sms}
        />
      </div>

      <div className="flex justify-end space-x-3 pt-6">
        <button
          type="button"
          onClick={closeModal}
          className={cn(
            "px-4 py-2 rounded-lg border font-medium",
            colors.border,
            colors.textSecondary,
            colors.background
          )}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => {
            alert("Notification preferences saved!");
            closeModal();
          }}
          className={cn(
            "px-4 py-2 rounded-lg font-medium",
            colors.primaryBg,
            colors.textInverted
          )}
        >
          Save Preferences
        </button>
      </div>
    </div>
  );

  // Delete Account Modal
  const DeleteAccountModal = () => {
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState("");
    const [username, setUsername] = useState("");
    const [confirmChecked, setConfirmChecked] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      inputRef.current?.focus();
    }, []);

    const usernameMatches = username === user?.username;

    // Inside the component
    const { user: clerkUser } = useUser();
    const { signOut } = useClerk();
    const deleteUserAccount = useMutation(
      api.controllers.user.deleteUserAccount
    );

    const handleDeleteAccount = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsDeleting(true);
      setError("");

      try {
        if (!user) throw new Error("No user found");

        // 1. Delete from Convex
        await deleteUserAccount({ userId: clerkUser?.id ? clerkUser.id : "" });

        // 2. Delete from Clerk using their API
        await clerkUser?.delete();

        // 3. This will automatically sign out and redirect
        // No need to call signOut() separately
      } catch (err) {
        setError((err as Error).message || "Failed to delete account");
        setIsDeleting(false);
      }
    };

    return (
      <form onSubmit={handleDeleteAccount}>
        <div className="space-y-6">
          <div
            className={cn(
              "rounded-lg p-4 border",
              colors.destructiveBg,
              colors.warningBorder
            )}
          >
            <h4
              className={cn("font-bold flex items-center", colors.destructive)}
            >
              <Info size={18} className="mr-2" />
              Dangerous Action
            </h4>
            <p className={cn("text-sm mt-1", colors.warningText)}>
              This will permanently delete your account and all associated data.
              This action cannot be undone.
            </p>
          </div>

          <div>
            <label
              className={cn(
                "block text-sm font-medium mb-1",
                colors.textSecondary
              )}
            >
              Enter your username to confirm
            </label>
            <input
              ref={inputRef}
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={cn(
                "w-full rounded-lg px-4 py-2 focus:ring-2",
                colors.background,
                colors.text
              )}
              placeholder="Your username"
              required
            />
            {username && !usernameMatches && (
              <p className={cn("text-sm mt-1", colors.destructive)}>
                Username does not match
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={confirmChecked}
              onChange={(e) => setConfirmChecked(e.target.checked)}
              id="confirm"
              className={colors.destructive}
            />
            <label
              htmlFor="confirm"
              className={cn("text-sm", colors.textSecondary)}
            >
              I understand this action cannot be undone
            </label>
          </div>

          {error && (
            <div className={cn("text-sm", colors.destructive)}>{error}</div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={closeModal}
              className={cn(
                "px-4 py-2 rounded-lg border font-medium",
                colors.border,
                colors.textSecondary,
                colors.background
              )}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!usernameMatches || !confirmChecked || isDeleting}
              className={cn(
                "px-4 py-2 rounded-lg font-medium disabled:cursor-not-allowed",
                isDeleting ? colors.disabledBg : colors.destructiveBg,
                colors.textInverted,
                (!usernameMatches || !confirmChecked) && "opacity-50"
              )}
            >
              {isDeleting ? "Deleting..." : "Permanently Delete Account"}
            </button>
          </div>
        </div>
      </form>
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
    notifications: {
      title: "Notification Preferences",
      component: <NotificationsModal />,
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
              "rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto",
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
