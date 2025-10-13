"use client";
import { Switch } from "@/components/ui/switch";
import { useCurrentUser } from "@/hooks/useCurrentUser";
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

// Type definitions
type SettingItem = {
  label: string;
  action: () => void;
};

type SettingsSection = {
  title: string;
  icon: React.ReactNode;
  items: SettingItem[];
};

type ModalContent = {
  title: string;
  component: React.ReactNode;
};

type ModalType =
  | "deleteaccount"
  | "email"
  | "push"
  | "email-notifications"
  | "sms"
  | "2fa"
  | "login-activity"
  | "devices"
  | "payments"
  | "billing"
  | "subscription";

const SettingPage = () => {
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [activeModal, setActiveModal] = useState<ModalType | null>(null);
  const { user } = useCurrentUser();
  const [formData, setFormData] = useState({
    phoneNumber: "",
  });
  const [notifications, setNotifications] = useState({
    push: true,
    email: true,
    sms: false,
    marketing: false,
  });
  const [twoFactorEnabled, setTwoFactorEnabled] = useState<boolean>(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggleChange = (name: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const settingsSections: SettingsSection[] = [
    {
      title: "Account",
      icon: <User size={18} className="mr-3" />,
      items: [
        { label: "Email Preferences", action: () => openModal("email") },
        { label: "Delete Account", action: () => openModal("deleteaccount") },
      ],
    },
    {
      title: "Notifications",
      icon: <Bell size={18} className="mr-3" />,
      items: [
        { label: "Push Notifications", action: () => openModal("push") },
        {
          label: "Email Notifications",
          action: () => openModal("email-notifications"),
        },
        { label: "SMS Alerts", action: () => openModal("sms") },
      ],
    },
    {
      title: "Security",
      icon: <Lock size={18} className="mr-3" />,
      items: [
        { label: "Two-Factor Authentication", action: () => openModal("2fa") },
        { label: "Login Activity", action: () => openModal("login-activity") },
        { label: "Connected Devices", action: () => openModal("devices") },
      ],
    },
    {
      title: "Billing",
      icon: <CreditCard size={18} className="mr-3" />,
      items: [
        { label: "Payment Methods", action: () => openModal("payments") },
        { label: "Billing History", action: () => openModal("billing") },
        { label: "Subscription Plan", action: () => openModal("subscription") },
      ],
    },
  ];

  const openModal = (modalName: ModalType): void => {
    setActiveModal(modalName);
  };

  const closeModal = (): void => {
    setActiveModal(null);
  };

  // const handleSubmit = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   // Handle form submission here
  //   alert("Settings saved!");
  //   closeModal();
  // };

  // Modal components

  const DeleteAccountModal = () => {
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [username, setUsername] = useState("");
    const [confirmChecked, setConfirmChecked] = useState(false);

    const currentUsername = user?.user?.username;
    const usernameMatches = username === currentUsername;
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      inputRef.current?.focus();
    }, []);

    const handleDeleteAccount = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsDeleting(true);
      setError("");
      setSuccess("");
      try {
        const response = await fetch("/api/user/account/delete", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username }),
        });

        if (!response.ok) {
          throw new Error(await response.text());
        }
        const data: { message: string } = await response.json();
        setSuccess(data?.message);
        // Optionally show success message before redirect
        window.location.href = "/";
      } catch (err: unknown) {
        setError((err as Error).message || "Failed to delete account");
      } finally {
        setIsDeleting(false);
      }
    };

    return (
      <form
        onSubmit={handleDeleteAccount}
        aria-label="Delete account confirmation"
      >
        <div className="space-y-6">
          <div className="bg-red-900/20 border border-red-900/50 rounded-lg p-4">
            <h4 className="font-bold text-red-400 flex items-center">
              <Info size={18} className="mr-2" />
              Dangerous Action
            </h4>
            <p className="text-sm text-red-300 mt-1">
              This will permanently delete your account and all associated data.
              This action cannot be undone.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Enter your username to confirm
            </label>
            <input
              autoComplete="off"
              ref={inputRef}
              type="text"
              value={username}
              onChange={(ev) => setUsername(ev.target.value)}
              className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-red-500"
              placeholder="Your username"
              aria-required
            />
            {username && !usernameMatches && (
              <p className="text-red-400 text-sm mt-1">
                Username does not match
              </p>
            )}
            {username && usernameMatches && (
              <p className="text-emerald-400 text-sm mt-1">Username Verified</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={confirmChecked}
              onChange={(e) => setConfirmChecked(e.target.checked)}
              id="confirm"
              className="accent-red-600"
            />
            <label htmlFor="confirm" className="text-sm text-gray-300">
              I understand this action cannot be undone
            </label>
          </div>

          {error && <div className="text-red-400 text-sm">{error}</div>}
          {success && <div className="text-emerald-400 text-sm">{success}</div>}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!usernameMatches || isDeleting}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                usernameMatches && confirmChecked
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-red-900/50 cursor-not-allowed"
              }`}
            >
              {isDeleting ? "Deleting..." : "Permanently Delete Account"}
            </button>
          </div>
        </div>
      </form>
    );
  };

  const NotificationToggle = ({
    name,
    label,
  }: {
    name: keyof typeof notifications;
    label: string;
  }) => (
    <div className="flex items-center justify-between py-3">
      <span className="font-medium text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <Switch
          checked={notifications[name]}
          onCheckedChange={() => handleToggleChange(name)}
          className="data-[state=checked]:bg-rose-600 data-[state=unchecked]:bg-emerald-500"
        />
      </div>
    </div>
  );

  const NotificationsModal = () => (
    <div className="space-y-4">
      <NotificationToggle name="push" label="Push Notifications" />
      <NotificationToggle name="email" label="Email Notifications" />
      <NotificationToggle name="sms" label="SMS Alerts" />
      <NotificationToggle name="marketing" label="Marketing Communications" />

      <div className="pt-4">
        <label className="block text-sm font-medium text-gray-300 mb-1">
          SMS Phone Number
        </label>
        <input
          type="tel"
          name="phoneNumber"
          value={formData.phoneNumber}
          onChange={handleInputChange}
          className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="+1 (___) ___-____"
          disabled={!notifications.sms}
        />
      </div>

      <div className="flex justify-end space-x-3 pt-6">
        <button
          type="button"
          onClick={closeModal}
          className="px-4 py-2 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-700 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => {
            alert("Notification preferences saved!");
            closeModal();
          }}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
        >
          Save Preferences
        </button>
      </div>
    </div>
  );

  const TwoFactorModal = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium">Two-Factor Authentication</h4>
          <p className="text-sm text-gray-400 mt-1">
            {twoFactorEnabled
              ? "Currently enabled"
              : "Add an extra layer of security to your account"}
          </p>
        </div>
        <button
          onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            twoFactorEnabled ? "bg-blue-600" : "bg-gray-600"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              twoFactorEnabled ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {twoFactorEnabled && (
        <div className="bg-gray-700 p-4 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="bg-gray-800 p-3 rounded-lg">
              <svg
                className="w-6 h-6 text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
                />
              </svg>
            </div>
            <div>
              <h4 className="font-medium">Authenticator App</h4>
              <p className="text-sm text-gray-400">
                Use an app like Google Authenticator
              </p>
            </div>
          </div>

          <div className="mt-4 p-3 bg-gray-800 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-mono text-lg">7B5N 3K9P 2L8M</span>
              <button className="text-blue-400 text-sm font-medium">
                Copy
              </button>
            </div>
            <div className="flex justify-center my-4">
              <div className="bg-white p-2 rounded">
                {/* QR Code placeholder */}
                <div className="w-32 h-32 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500 text-xs">QR Code</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end space-x-3 pt-4">
        <button
          onClick={closeModal}
          className="px-4 py-2 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-700 transition-colors"
        >
          {twoFactorEnabled ? "Close" : "Cancel"}
        </button>
        {!twoFactorEnabled && (
          <button
            onClick={() => setTwoFactorEnabled(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
          >
            Enable 2FA
          </button>
        )}
      </div>
    </div>
  );

  const modalContent: Record<ModalType, ModalContent> = {
    deleteaccount: {
      title: "Delete Account",
      component: <DeleteAccountModal />,
    },
    email: {
      title: "Email Preferences",
      component: <NotificationsModal />,
    },
    push: {
      title: "Push Notifications",
      component: <NotificationsModal />,
    },
    "email-notifications": {
      title: "Email Notifications",
      component: <NotificationsModal />,
    },
    sms: {
      title: "SMS Alerts",
      component: <NotificationsModal />,
    },
    "2fa": {
      title: "Two-Factor Authentication",
      component: <TwoFactorModal />,
    },
    "login-activity": {
      title: "Login Activity",
      component: (
        <div>
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
              >
                <div>
                  <p className="font-medium">Chrome • Windows</p>
                  <p className="text-sm text-gray-400">
                    New York, US • {item} day ago
                  </p>
                </div>
                <button className="text-red-400 text-sm font-medium">
                  Log out
                </button>
              </div>
            ))}
          </div>
          <div className="flex justify-end pt-6">
            <button
              onClick={closeModal}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      ),
    },
    devices: {
      title: "Connected Devices",
      component: (
        <div>
          <div className="space-y-4">
            {["iPhone 13", "MacBook Pro", "iPad Pro"].map((device) => (
              <div
                key={device}
                className="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
              >
                <div>
                  <p className="font-medium">{device}</p>
                  <p className="text-sm text-gray-400">Currently active</p>
                </div>
                <button className="text-red-400 text-sm font-medium">
                  Disconnect
                </button>
              </div>
            ))}
          </div>
          <div className="flex justify-end pt-6">
            <button
              onClick={closeModal}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      ),
    },
    payments: {
      title: "Payment Methods",
      component: (
        <div>
          <div className="space-y-4">
            <div className="p-4 bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-blue-500 p-2 rounded mr-3">
                    <CreditCard size={18} className="text-white" />
                  </div>
                  <div>
                    <p className="font-medium">Visa •••• 4242</p>
                    <p className="text-sm text-gray-400">Expires 04/2025</p>
                  </div>
                </div>
                <button className="text-red-400 text-sm font-medium">
                  Remove
                </button>
              </div>
            </div>

            <button className="w-full p-3 border-2 border-dashed border-gray-600 rounded-lg text-gray-400 hover:text-white hover:border-gray-500 transition-colors">
              + Add New Payment Method
            </button>
          </div>
          <div className="flex justify-end pt-6">
            <button
              onClick={closeModal}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      ),
    },
    billing: {
      title: "Billing History",
      component: (
        <div>
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
              >
                <div>
                  <p className="font-medium">Pro Subscription</p>
                  <p className="text-sm text-gray-400">
                    {item} month ago • ${item * 9}.99
                  </p>
                </div>
                <button className="text-blue-400 text-sm font-medium">
                  Download
                </button>
              </div>
            ))}
          </div>
          <div className="flex justify-end pt-6">
            <button
              onClick={closeModal}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      ),
    },
    subscription: {
      title: "Subscription Plan",
      component: (
        <div>
          <div className="bg-gray-700 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium">Pro Plan</h4>
              <span className="px-2 py-1 bg-blue-900/30 text-blue-400 text-xs rounded">
                Active
              </span>
            </div>
            <p className="text-gray-400 text-sm">
              $9.99/month • Next billing date: June 15, 2023
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium">Available Plans</h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  name: "Basic",
                  price: "$0",
                  features: ["5 Gigs/month", "Basic support"],
                },
                {
                  name: "Pro",
                  price: "$9.99",
                  features: ["Unlimited Gigs", "Priority support", "Analytics"],
                  current: true,
                },
                {
                  name: "Business",
                  price: "$29.99",
                  features: [
                    "Unlimited Gigs",
                    "24/7 support",
                    "Advanced analytics",
                    "Team members",
                  ],
                },
              ].map((plan) => (
                <div
                  key={plan.name}
                  className={`p-4 rounded-lg border ${
                    plan.current
                      ? "border-blue-500 bg-blue-900/10"
                      : "border-gray-600 hover:border-gray-500"
                  } transition-colors cursor-pointer`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{plan.name}</h4>
                    <p className="text-lg font-bold">
                      {plan.price}
                      <span className="text-sm font-normal text-gray-400">
                        /mo
                      </span>
                    </p>
                  </div>
                  <ul className="space-y-2 mt-4">
                    {plan.features.map((feature, i) => (
                      <li
                        key={i}
                        className="flex items-center text-sm text-gray-300"
                      >
                        <Check size={14} className="mr-2 text-green-400" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <button
                    className={`w-full mt-4 py-2 rounded-lg ${
                      plan.current
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "bg-gray-600 hover:bg-gray-500"
                    } transition-colors`}
                  >
                    {plan.current ? "Current Plan" : "Upgrade"}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between pt-8">
            <button className="text-red-400 hover:text-red-300 transition-colors">
              Cancel Subscription
            </button>
            <button
              onClick={closeModal}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      ),
    },
  };

  return (
    <div className="max-w-4xl mx-auto p-6 text-white">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="flex items-center px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
        >
          {darkMode ? (
            <Sun size={18} className="mr-2" />
          ) : (
            <Moon size={18} className="mr-2" />
          )}
          {darkMode ? "Light Mode" : "Dark Mode"}
        </button>
      </div>

      <div className="space-y-8">
        {settingsSections.map((section, index) => (
          <div key={index} className="bg-gray-900 rounded-xl p-6 shadow-lg">
            <div className="flex items-center mb-4">
              {section.icon}
              <h2 className="text-xl font-semibold">{section.title}</h2>
            </div>
            <div className="space-y-3">
              {section.items.map((item, itemIndex) => (
                <div
                  key={itemIndex}
                  className={
                    item.label === "Delete Account"
                      ? "flex justify-between items-center p-4 bg-red-800 rounded-lg transition-colors cursor-pointer"
                      : "flex justify-between items-center p-4 hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
                  }
                  onClick={item.action}
                >
                  <span className="font-medium">{item.label}</span>
                  <div className="flex items-center">
                    <Info size={16} className="text-gray-400 ml-2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 flex justify-between items-center pt-6 border-t border-gray-800">
        <button className="flex items-center text-gray-400 hover:text-white transition-colors">
          <HelpCircle size={16} className="mr-2" />
          Help Center
        </button>
        <button className="flex items-center px-4 py-2 rounded-lg bg-red-900/30 hover:bg-red-900/40 text-red-400 transition-colors">
          <LogOut size={16} className="mr-2" />
          Log Out
        </button>
      </div>

      {/* Enhanced Modal */}
      {activeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-fade-in">
            <div className="sticky top-0 bg-gray-800 p-6 pb-4 flex justify-between items-center border-b border-gray-700">
              <h3 className="text-xl font-bold">
                {modalContent[activeModal].title}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">{modalContent[activeModal].component}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingPage;
