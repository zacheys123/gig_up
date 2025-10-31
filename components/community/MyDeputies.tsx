// components/MyDeputies.tsx
import React, { useState } from "react";
import { useDeputies } from "@/hooks/useDeputies";
import { Id } from "@/convex/_generated/dataModel";
import { EmptyState } from "./EmptyState";

interface MyDeputiesProps {
  user: any;
}

export const MyDeputies: React.FC<MyDeputiesProps> = ({ user }) => {
  const [editingDeputy, setEditingDeputy] = useState<Id<"users"> | null>(null);
  const {
    myDeputies,
    removeDeputy,
    updateDeputySettings,
    isLoading,
    hasDeputies,
    totalDeputies,
  } = useDeputies(user._id as Id<"users">);

  const handleRemove = async (deputyId: Id<"users">) => {
    if (confirm("Are you sure you want to remove this deputy?")) {
      const result = await removeDeputy(deputyId);
      if (!result.success) {
        alert(`Failed to remove deputy: ${result.error}`);
      }
    }
  };

  if (!hasDeputies) {
    return (
      <EmptyState
        title="No deputies yet"
        message="Add trusted musicians as your deputies to cover gigs when you're unavailable."
        action={() => (window.location.href = "/community?tab=deputies")}
        actionText="Find Deputies"
      />
    );
  }

  return (
    <div className="space-y-6">
      <Header title="My Deputies" count={totalDeputies} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {myDeputies.map((deputy) => (
          <DeputyManagementCard
            key={deputy?._id}
            deputy={deputy}
            isEditing={editingDeputy === deputy?._id}
            isLoading={
              isLoading(`remove-${deputy?._id}`) ||
              isLoading(`update-${deputy?._id}`)
            }
            onEdit={() => setEditingDeputy(deputy?._id as Id<"users">)}
            onCancelEdit={() => setEditingDeputy(null)}
            onSaveSettings={updateDeputySettings}
            onRemove={() => handleRemove(deputy?._id as Id<"users">)}
          />
        ))}
      </div>
    </div>
  );
};

const DeputyManagementCard: React.FC<{
  deputy: any;
  isEditing: boolean;
  isLoading: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onSaveSettings: (id: Id<"users">, updates: any) => Promise<any>;
  onRemove: () => void;
}> = ({
  deputy,
  isEditing,
  isLoading,
  onEdit,
  onCancelEdit,
  onSaveSettings,
  onRemove,
}) => {
  const [settings, setSettings] = useState({
    canBeBooked: deputy?.relationship.canBeBooked ?? true,
    note: deputy?.relationship.note || "",
    gigType: deputy?.relationship.gigType || "",
  });

  const handleSave = async () => {
    const result = await onSaveSettings(deputy?._id, settings);
    if (result.success) {
      onCancelEdit();
    }
  };

  return (
    <div className="border rounded-lg p-6 bg-white shadow-sm">
      <DeputyHeader deputy={deputy} />
      <DeputyInfo deputy={deputy} />

      {!isEditing ? (
        <ActionButtons
          onEdit={onEdit}
          onRemove={onRemove}
          isLoading={isLoading}
        />
      ) : (
        <EditForm
          settings={settings}
          onChange={setSettings}
          onSave={handleSave}
          onCancel={onCancelEdit}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

const DeputyHeader: React.FC<{ deputy: any }> = ({ deputy }) => (
  <div className="flex items-center gap-4 mb-4">
    <img
      src={deputy?.picture || "/default-avatar.png"}
      alt={deputy?.username}
      className="w-16 h-16 rounded-full border-2 border-green-500"
    />
    <div className="flex-1">
      <h3 className="font-semibold text-lg truncate">
        {deputy?.firstname} {deputy?.lastname}
      </h3>
      <p className="text-gray-600 truncate">@{deputy?.username}</p>
      <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full mt-1">
        Active Deputy
      </span>
    </div>
  </div>
);

const DeputyInfo: React.FC<{ deputy: any }> = ({ deputy }) => (
  <div className="space-y-3 mb-4">
    <InfoField label="Role" value={deputy?.relationship.forMySkill} />
    <InfoField label="Gig Type" value={deputy?.relationship.gigType} />
    <InfoField
      label="Bookable"
      value={deputy?.relationship.canBeBooked ? "Yes" : "No"}
      valueClassName={
        deputy?.relationship.canBeBooked ? "text-green-600" : "text-gray-600"
      }
    />
    <InfoField label="Instrument" value={deputy?.instrument} />
    <InfoField label="Location" value={deputy?.city} />
    <InfoField label="Backs up" value={`${deputy?.backupCount} principals`} />

    {deputy?.relationship.note && (
      <div className="p-3 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-700 italic">
          "{deputy?.relationship.note}"
        </p>
      </div>
    )}
  </div>
);

const InfoField: React.FC<{
  label: string;
  value?: string;
  valueClassName?: string;
}> = ({ label, value, valueClassName = "" }) =>
  value ? (
    <div className="flex justify-between">
      <span className="text-sm text-gray-600">{label}:</span>
      <span className={`text-sm font-medium ${valueClassName}`}>{value}</span>
    </div>
  ) : null;

const ActionButtons: React.FC<{
  onEdit: () => void;
  onRemove: () => void;
  isLoading: boolean;
}> = ({ onEdit, onRemove, isLoading }) => (
  <div className="flex gap-2">
    <button
      onClick={onEdit}
      disabled={isLoading}
      className="flex-1 px-3 py-2 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 disabled:opacity-50"
    >
      Edit
    </button>
    <button
      onClick={onRemove}
      disabled={isLoading}
      className="flex-1 px-3 py-2 bg-red-500 text-white rounded text-sm hover:bg-red-600 disabled:opacity-50"
    >
      Remove
    </button>
  </div>
);

const EditForm: React.FC<{
  settings: any;
  onChange: (settings: any) => void;
  onSave: () => void;
  onCancel: () => void;
  isLoading: boolean;
}> = ({ settings, onChange, onSave, onCancel, isLoading }) => (
  <div className="mt-4 p-4 border-t border-gray-200">
    <h4 className="font-medium mb-3">Edit Deputy Settings</h4>
    <div className="space-y-3">
      <Checkbox
        label="Allow clients to book this deputy directly"
        checked={settings.canBeBooked}
        onChange={(checked) => onChange({ ...settings, canBeBooked: checked })}
      />
      <Input
        label="Gig Type"
        value={settings.gigType}
        onChange={(value) => onChange({ ...settings, gigType: value })}
        placeholder="e.g., Wedding, Corporate, Concert"
      />
      <Textarea
        label="Personal Note"
        value={settings.note}
        onChange={(value) => onChange({ ...settings, note: value })}
        placeholder="Add a note about this deputy?..."
      />
      <div className="flex gap-2">
        <button
          onClick={onSave}
          disabled={isLoading}
          className="flex-1 px-3 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:opacity-50"
        >
          Save
        </button>
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 px-3 py-2 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
);

const Checkbox: React.FC<{
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}> = ({ label, checked, onChange }) => (
  <div className="flex items-center gap-2">
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="rounded"
    />
    <label className="text-sm">{label}</label>
  </div>
);

const Input: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}> = ({ label, value, onChange, placeholder }) => (
  <div>
    <label className="block text-sm font-medium mb-1">{label}</label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full p-2 border rounded text-sm"
    />
  </div>
);

const Textarea: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}> = ({ label, value, onChange, placeholder }) => (
  <div>
    <label className="block text-sm font-medium mb-1">{label}</label>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={2}
      className="w-full p-2 border rounded text-sm"
    />
  </div>
);

const Header: React.FC<{ title: string; count: number }> = ({
  title,
  count,
}) => (
  <div className="flex justify-between items-center">
    <h2 className="text-2xl font-bold">{title}</h2>
    <p className="text-gray-600">{count} trusted deputies</p>
  </div>
);
