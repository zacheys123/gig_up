"use client";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Switch } from "@/components/ui/switch"; // You might need to create this or use your existing switch
import { useThemeColors } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { useState } from "react";

export function PrivacySettings({ user }: { user: any }) {
  const updateUser = useMutation(
    api.controllers.user.updateUserPrivacySettings
  );
  const { colors, isDarkMode } = useThemeColors();
  const [isLoading, setIsLoading] = useState(false);

  const handlePrivacyChange = async (isPrivate: boolean) => {
    if (!user?.clerkId) return;

    setIsLoading(true);
    try {
      await updateUser({
        userId: user.clerkId,
        updates: { isPrivate },
      });
    } catch (error) {
      console.error("Failed to update privacy settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // If you don't have a Switch component, create a simple one:
  const SimpleSwitch = ({
    checked,
    onCheckedChange,
  }: {
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
  }) => (
    <button
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
        checked ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-700",
        isLoading && "opacity-50 cursor-not-allowed"
      )}
      disabled={isLoading}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
          checked ? "translate-x-6" : "translate-x-1"
        )}
      />
    </button>
  );

  return (
    <div
      className={cn(
        "space-y-6 p-6 rounded-lg border",
        colors.border,
        colors.card
      )}
    >
      <div>
        <h2 className={cn("text-xl font-semibold mb-2", colors.text)}>
          Privacy Settings
        </h2>
        <p className={cn("text-sm", colors.textMuted)}>
          Control who can see your content and follow you
        </p>
      </div>

      <div className="flex items-center justify-between p-4 rounded-lg border">
        <div className="flex-1">
          <h3 className={cn("font-semibold", colors.text)}>Private Account</h3>
          <p className={cn("text-sm mt-1", colors.textMuted)}>
            When enabled, users must request to follow you and approve your
            content
          </p>
          <ul className={cn("text-xs mt-2 space-y-1", colors.textMuted)}>
            <li>• Followers must be approved</li>
            <li>• Your posts are only visible to followers</li>
            <li>• Your profile is more secure</li>
          </ul>
        </div>
        <div className="ml-4">
          <SimpleSwitch
            checked={user?.isPrivate || false}
            onCheckedChange={handlePrivacyChange}
          />
        </div>
      </div>

      {/* Additional privacy settings can go here */}
      <div className={cn("p-4 rounded-lg border", colors.border)}>
        <h4 className={cn("font-medium mb-2", colors.text)}>
          Pending Follow Requests
        </h4>
        <p className={cn("text-sm", colors.textMuted)}>
          {user?.pendingFollowRequests?.length || 0} pending requests
        </p>
        {user?.pendingFollowRequests &&
          user.pendingFollowRequests.length > 0 && (
            <button
              className={cn(
                "mt-2 px-4 py-2 text-sm rounded-lg transition-colors",
                "bg-blue-500 hover:bg-blue-600 text-white"
              )}
              onClick={() => {
                // Navigate to follow requests management page
                window.location.href = "/settings/follow-requests";
              }}
            >
              Manage Requests
            </button>
          )}
      </div>
    </div>
  );
}
