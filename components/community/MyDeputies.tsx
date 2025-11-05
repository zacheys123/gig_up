// components/MyDeputies.tsx
import React, { useState } from "react";
import { useDeputies } from "@/hooks/useDeputies";
import { Id } from "@/convex/_generated/dataModel";
import { EmptyState } from "./EmptyState";
import { cn } from "@/lib/utils";
import { useThemeColors } from "@/hooks/useTheme";
import {
  Edit3,
  Trash2,
  Save,
  X,
  Users,
  MapPin,
  Music,
  Calendar,
  CheckCircle2,
  UserCheck,
  Shield,
  BookOpen,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface MyDeputiesProps {
  user: any;
}

export const MyDeputies: React.FC<MyDeputiesProps> = ({ user }) => {
  const [editingDeputy, setEditingDeputy] = useState<any | null>(null);
  const { colors } = useThemeColors();
  const {
    myDeputies,
    removeDeputy,
    updateDeputySettings,
    isLoading,
    hasDeputies,
    totalDeputies,
  } = useDeputies(user._id as Id<"users">);

  const handleRemove = async (deputyId: Id<"users">) => {
    if (
      confirm("Are you sure you want to remove this deputy from your team?")
    ) {
      const result = await removeDeputy(deputyId);
      if (result.success) {
        toast.success("Deputy removed successfully");
      } else {
        toast.error(`Failed to remove deputy: ${result.error}`);
      }
    }
  };

  const handleToggleBookable = async (
    deputyId: Id<"users">,
    currentValue: boolean
  ) => {
    const result = await updateDeputySettings(deputyId, {
      canBeBooked: !currentValue,
    });

    if (result.success) {
      toast.success(
        `Deputy ${!currentValue ? "enabled" : "disabled"} for direct booking`
      );
    } else {
      toast.error("Failed to update booking status");
    }
  };

  const handleOpenEditModal = (deputy: any) => {
    setEditingDeputy({
      ...deputy,
      settings: {
        canBeBooked: deputy?.relationship.canBeBooked ?? true,
        note: deputy?.relationship.note || "",
        gigType: deputy?.relationship.gigType || "",
      },
    });
  };

  const handleCloseEditModal = () => {
    setEditingDeputy(null);
  };

  const handleSaveSettings = async (updates: any) => {
    if (!editingDeputy) return;

    const result = await updateDeputySettings(editingDeputy._id, updates);
    if (result.success) {
      toast.success("Deputy settings updated");
      handleCloseEditModal();
    } else {
      toast.error("Failed to update settings");
    }
  };

  if (!hasDeputies) {
    return (
      <EmptyState
        title="No Team Members Yet"
        message="Build your team by adding trusted musicians as deputies to cover gigs when you're unavailable."
        action={() => (window.location.href = "/community?tab=deputies")}
        actionText="Find Deputies"
        icon={<Users className="w-12 h-12" />}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className={cn("rounded-2xl p-8 border", colors.border, colors.card)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className={cn(
                "p-3 rounded-xl",
                "bg-gradient-to-br from-amber-500 to-orange-500"
              )}
            >
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className={cn("text-3xl font-bold", colors.text)}>My Team</h1>
              <p className={cn("text-lg mt-2", colors.textMuted)}>
                Manage your trusted deputies and their settings
              </p>
            </div>
          </div>
          <div className="text-right">
            <div
              className={cn(
                "px-4 py-2 rounded-full border text-sm font-medium",
                colors.border,
                colors.text
              )}
            >
              <span className="font-bold text-amber-600">{totalDeputies}</span>
              <span className={cn("ml-1", colors.textMuted)}>
                {totalDeputies === 1 ? "trusted deputy" : "trusted deputies"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Deputies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {myDeputies.map((deputy) => (
          <DeputyManagementCard
            key={deputy?._id}
            deputy={deputy}
            isLoading={
              isLoading(`remove-${deputy?._id}`) ||
              isLoading(`update-${deputy?._id}`)
            }
            onEdit={() => handleOpenEditModal(deputy)}
            onRemove={() => handleRemove(deputy?._id as Id<"users">)}
            onToggleBookable={handleToggleBookable}
          />
        ))}
      </div>

      {/* Edit Modal */}
      {editingDeputy && (
        <EditModal
          deputy={editingDeputy}
          settings={editingDeputy.settings}
          onSave={handleSaveSettings}
          onClose={handleCloseEditModal}
          isLoading={isLoading(`update-${editingDeputy._id}`)}
        />
      )}
    </div>
  );
};

const DeputyManagementCard: React.FC<{
  deputy: any;
  isLoading: boolean;
  onEdit: () => void;
  onRemove: () => void;
  onToggleBookable: (id: Id<"users">, currentValue: boolean) => void;
}> = ({ deputy, isLoading, onEdit, onRemove, onToggleBookable }) => {
  const { colors } = useThemeColors();

  const handleDirectToggle = () => {
    onToggleBookable(deputy?._id, deputy?.relationship.canBeBooked);
  };

  return (
    <div
      className={cn(
        "group relative rounded-2xl border transition-all duration-300 hover:shadow-xl",
        "hover:scale-[1.02] hover:-translate-y-1",
        colors.border,
        colors.card
      )}
    >
      {/* Background Gradient Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative p-6">
        <DeputyHeader
          deputy={deputy}
          onToggleBookable={handleDirectToggle}
          isLoading={isLoading}
        />
        <DeputyInfo deputy={deputy} />
        <ActionButtons
          onEdit={onEdit}
          onRemove={onRemove}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

const DeputyHeader: React.FC<{
  deputy: any;
  onToggleBookable: () => void;
  isLoading: boolean;
}> = ({ deputy, onToggleBookable, isLoading }) => {
  const { colors } = useThemeColors();

  return (
    <div className="flex items-start gap-4 mb-6">
      <div className="relative">
        <img
          src={deputy?.picture || "/default-avatar.png"}
          alt={deputy?.username}
          className="w-16 h-16 rounded-2xl border-2 border-white shadow-lg"
        />
        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
          <CheckCircle2 className="w-3 h-3 text-white" />
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className={cn("font-bold text-lg truncate", colors.text)}>
            {deputy?.firstname} {deputy?.lastname}
          </h3>
          <button
            onClick={onToggleBookable}
            disabled={isLoading}
            className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border transition-all duration-200",
              "hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed",
              deputy?.relationship.canBeBooked
                ? "bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20"
                : "bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/20"
            )}
          >
            {deputy?.relationship.canBeBooked ? (
              <ToggleRight className="w-3 h-3" />
            ) : (
              <ToggleLeft className="w-3 h-3" />
            )}
            {deputy?.relationship.canBeBooked ? "Bookable" : "Unavailable"}
          </button>
        </div>
        <p className={cn("text-sm truncate mb-2", colors.textMuted)}>
          @{deputy?.username}
        </p>

        {/* Role Badge */}
        <Badge
          variant="secondary"
          className="bg-amber-500/10 text-amber-600 border-amber-500/20"
        >
          <UserCheck className="w-3 h-3 mr-1" />
          {deputy?.relationship?.forMySkill}
        </Badge>
      </div>
    </div>
  );
};

const DeputyInfo: React.FC<{ deputy: any }> = ({ deputy }) => {
  const { colors } = useThemeColors();

  return (
    <div className="space-y-4 mb-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <InfoField
          icon={<Music className="w-4 h-4" />}
          label="Instrument"
          value={deputy?.instrument}
        />
        <InfoField
          icon={<MapPin className="w-4 h-4" />}
          label="Location"
          value={deputy?.city}
        />
        <InfoField
          icon={<Users className="w-4 h-4" />}
          label="Experience"
          value={`BackUp to ${deputy?.backupCount || 0} musicians`}
        />
      </div>

      {/* Quick Status Info */}
      <div
        className={cn(
          "p-3 rounded-xl border text-sm",
          colors.border,
          deputy?.relationship.canBeBooked
            ? "bg-green-500/5 text-green-700"
            : "bg-amber-500/5 text-amber-700"
        )}
      >
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4" />
          <span className="font-medium">
            {deputy?.relationship.canBeBooked
              ? "Available for direct bookings"
              : "Not available for direct bookings"}
          </span>
        </div>
      </div>

      {/* Gig Type */}
      {deputy?.relationship.gigType && (
        <div className="flex items-center gap-2">
          <Calendar className={cn("w-4 h-4", colors.textMuted)} />
          <span className={cn("text-sm font-medium", colors.text)}>
            {deputy.relationship.gigType}
          </span>
        </div>
      )}

      {/* Personal Note */}
      {deputy?.relationship.note && (
        <div
          className={cn(
            "p-3 rounded-xl border",
            colors.border,
            "bg-amber-500/5"
          )}
        >
          <div className="flex items-start gap-2">
            <BookOpen
              className={cn("w-4 h-4 mt-0.5 flex-shrink-0", colors.textMuted)}
            />
            <p className={cn("text-sm italic leading-relaxed", colors.text)}>
              "{deputy.relationship.note}"
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

const InfoField: React.FC<{
  icon: React.ReactNode;
  label: string;
  value?: string;
  valueClassName?: string;
}> = ({ icon, label, value, valueClassName = "" }) => {
  const { colors } = useThemeColors();

  return value ? (
    <div className="flex items-center gap-2">
      <div className={cn("p-1.5 rounded-lg", colors.backgroundMuted)}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className={cn("text-xs", colors.textMuted)}>{label}</div>
        <div
          className={cn(
            "text-sm font-medium truncate",
            colors.text,
            valueClassName
          )}
        >
          {value}
        </div>
      </div>
    </div>
  ) : null;
};

const ActionButtons: React.FC<{
  onEdit: () => void;
  onRemove: () => void;
  isLoading: boolean;
}> = ({ onEdit, onRemove, isLoading }) => (
  <div className="flex gap-2">
    <Button
      onClick={onEdit}
      disabled={isLoading}
      variant="outline"
      className="flex-1 gap-2"
    >
      <Edit3 className="w-4 h-4" />
      Edit Settings
    </Button>
    <Button
      onClick={onRemove}
      disabled={isLoading}
      variant="outline"
      className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 gap-2"
    >
      <Trash2 className="w-4 h-4" />
      Remove
    </Button>
  </div>
);

// NEW: Edit Modal Component
const EditModal: React.FC<{
  deputy: any;
  settings: any;
  onSave: (updates: any) => void;
  onClose: () => void;
  isLoading: boolean;
}> = ({ deputy, settings, onSave, onClose, isLoading }) => {
  const { colors } = useThemeColors();
  const [localSettings, setLocalSettings] = useState(settings);

  const handleSave = () => {
    onSave(localSettings);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div
        className={cn(
          "relative w-full max-w-md rounded-2xl border shadow-2xl animate-in zoom-in-95",
          colors.border,
          colors.card
        )}
      >
        {/* Modal Header */}
        <div
          className={cn(
            "flex items-center justify-between p-6 border-b",
            colors.border
          )}
        >
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "p-2 rounded-lg",
                "bg-gradient-to-br from-amber-500 to-orange-500"
              )}
            >
              <Edit3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className={cn("text-xl font-bold", colors.text)}>
                Edit Deputy Settings
              </h2>
              <p className={cn("text-sm", colors.textMuted)}>
                {deputy?.firstname} {deputy?.lastname}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={cn(
              "p-2 rounded-lg transition-colors",
              "hover:bg-gray-100 dark:hover:bg-gray-800",
              colors.textMuted
            )}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Deputy Info Summary */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
            <img
              src={deputy?.picture || "/default-avatar.png"}
              alt={deputy?.username}
              className="w-12 h-12 rounded-xl"
            />
            <div>
              <h3 className={cn("font-semibold", colors.text)}>
                {deputy?.firstname} {deputy?.lastname}
              </h3>
              <p className={cn("text-sm", colors.textMuted)}>
                @{deputy?.username} • {deputy?.relationship.forMySkill}
              </p>
            </div>
          </div>

          {/* Settings Form */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="canBeBooked" className="text-base font-medium">
                  Allow Direct Booking
                </Label>
                <p className={cn("text-sm", colors.textMuted)}>
                  Let clients book this deputy directly for gigs
                </p>
              </div>
              <Switch
                id="canBeBooked"
                checked={localSettings.canBeBooked}
                onCheckedChange={(checked) =>
                  setLocalSettings({ ...localSettings, canBeBooked: checked })
                }
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="gigType" className="text-base font-medium">
                Preferred Gig Types
              </Label>
              <p className={cn("text-sm", colors.textMuted)}>
                Specify the types of gigs this deputy is best suited for
              </p>
              <Input
                id="gigType"
                value={localSettings.gigType}
                onChange={(e) =>
                  setLocalSettings({
                    ...localSettings,
                    gigType: e.target.value,
                  })
                }
                placeholder="e.g., Wedding, Corporate, Concert, Club"
                className="rounded-lg"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="note" className="text-base font-medium">
                Personal Note
              </Label>
              <p className={cn("text-sm", colors.textMuted)}>
                Add a private note about this deputy (only you can see this)
              </p>
              <Textarea
                id="note"
                value={localSettings.note}
                onChange={(e) =>
                  setLocalSettings({ ...localSettings, note: e.target.value })
                }
                placeholder="e.g., Great with jazz standards, available weekends, prefers acoustic settings..."
                rows={4}
                className="rounded-lg resize-none"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className={cn("flex gap-3 p-6 border-t", colors.border)}>
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="flex-1 gap-2 bg-amber-500 hover:bg-amber-600"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};
