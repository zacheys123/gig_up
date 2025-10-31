// components/DeputySearch.tsx
import React, { useState, useMemo } from "react";
import { useDeputies } from "@/hooks/useDeputies";
import { Id } from "@/convex/_generated/dataModel";

interface DeputySearchProps {
  user: any;
}

export const DeputySearch: React.FC<DeputySearchProps> = ({ user }) => {
  const [filters, setFilters] = useState({
    search: "",
    skill: "",
    city: "",
    instrument: "",
  });

  const { deputies, sendDeputyRequest, isLoading } = useDeputies(
    user._id as Id<"users">
  );

  // Filter deputies based on search criteria
  const filteredDeputies = useMemo(() => {
    return deputies.filter((deputy) => {
      const matchesSearch =
        !filters.search ||
        deputy.firstname
          ?.toLowerCase()
          .includes(filters.search.toLowerCase()) ||
        deputy.lastname?.toLowerCase().includes(filters.search.toLowerCase()) ||
        deputy.username.toLowerCase().includes(filters.search.toLowerCase());

      const matchesSkill =
        !filters.skill ||
        deputy.roleType?.toLowerCase().includes(filters.skill.toLowerCase()) ||
        deputy.existingRelationship?.forTheirSkill
          .toLowerCase()
          .includes(filters.skill.toLowerCase());

      const matchesCity =
        !filters.city ||
        deputy.city?.toLowerCase().includes(filters.city.toLowerCase());

      const matchesInstrument =
        !filters.instrument ||
        deputy.instrument
          ?.toLowerCase()
          .includes(filters.instrument.toLowerCase());

      return matchesSearch && matchesSkill && matchesCity && matchesInstrument;
    });
  }, [deputies, filters]);

  const handleSendRequest = async (deputyId: Id<"users">, skill: string) => {
    const result = await sendDeputyRequest(deputyId, skill);
    if (result.success) {
      // You can add toast notification here
      console.log("Request sent successfully");
    } else {
      alert(`Failed to send request: ${result.error}`);
    }
  };

  const updateFilter = (key: keyof typeof filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Search Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SearchInput
          placeholder="Search by name, username..."
          value={filters.search}
          onChange={(value) => updateFilter("search", value)}
        />
        <SearchInput
          placeholder="Skill (DJ, Vocalist...)"
          value={filters.skill}
          onChange={(value) => updateFilter("skill", value)}
        />
        <SearchInput
          placeholder="City"
          value={filters.city}
          onChange={(value) => updateFilter("city", value)}
        />
        <SearchInput
          placeholder="Instrument"
          value={filters.instrument}
          onChange={(value) => updateFilter("instrument", value)}
        />
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDeputies.map((deputy) => (
          <DeputyCard
            key={deputy._id}
            deputy={deputy}
            onSendRequest={handleSendRequest}
            isLoading={isLoading(`send-${deputy._id}`)}
          />
        ))}
      </div>

      {filteredDeputies.length === 0 && (
        <EmptyState
          title="No deputies found"
          message="Try adjusting your search filters"
        />
      )}
    </div>
  );
};

// Sub-components for better reusability and performance
const SearchInput: React.FC<{
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}> = ({ placeholder, value, onChange }) => (
  <input
    type="text"
    placeholder={placeholder}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
  />
);

const DeputyCard: React.FC<{
  deputy: any;
  onSendRequest: (id: Id<"users">, skill: string) => void;
  isLoading: boolean;
}> = React.memo(({ deputy, onSendRequest, isLoading }) => {
  const skill = deputy.roleType || deputy.instrument || "Musician";

  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-3">
        <img
          src={deputy.picture || "/default-avatar.png"}
          alt={deputy.username}
          className="w-12 h-12 rounded-full"
        />
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold truncate">
            {deputy.firstname} {deputy.lastname}
          </h3>
          <p className="text-gray-600 text-sm truncate">@{deputy.username}</p>
        </div>
      </div>

      <div className="space-y-2 mb-4 text-sm">
        <InfoRow label="Instrument" value={deputy.instrument} />
        <InfoRow label="Role" value={deputy.roleType} />
        <InfoRow label="Location" value={deputy.city} />
        <InfoRow label="Backs up" value={`${deputy.backupCount} principals`} />
      </div>

      {deputy.existingRelationship ? (
        <StatusBadge status={deputy.existingRelationship.status} />
      ) : (
        <button
          onClick={() => onSendRequest(deputy._id, skill)}
          disabled={isLoading}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Sending..." : "Ask to be Deputy"}
        </button>
      )}
    </div>
  );
});

const InfoRow: React.FC<{ label: string; value?: string }> = ({
  label,
  value,
}) =>
  value ? (
    <div className="flex justify-between">
      <span className="text-gray-600">{label}:</span>
      <span className="font-medium">{value}</span>
    </div>
  ) : null;

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const styles = {
    pending: "bg-yellow-100 text-yellow-800",
    accepted: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs ${styles[status as keyof typeof styles]}`}
    >
      {status}
    </span>
  );
};

const EmptyState: React.FC<{ title: string; message: string }> = ({
  title,
  message,
}) => (
  <div className="text-center py-12 border-2 border-dashed rounded-lg">
    <div className="text-gray-400 mb-4">
      <svg
        className="w-16 h-16 mx-auto"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    </div>
    <h3 className="text-lg font-medium mb-2">{title}</h3>
    <p className="text-gray-600">{message}</p>
  </div>
);
