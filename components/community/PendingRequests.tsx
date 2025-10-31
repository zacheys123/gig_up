// components/PendingRequests.tsx
import React from "react";
import { useDeputies } from "@/hooks/useDeputies";
import { Id } from "@/convex/_generated/dataModel";

interface PendingRequestsProps {
  user: any;
}

export const PendingRequests: React.FC<PendingRequestsProps> = ({ user }) => {
  const {
    pendingRequests,
    respondToDeputyRequest,
    isLoading,
    hasPendingRequests,
    totalPending,
    totalDeputies,
  } = useDeputies(user._id as Id<"users">);

  const handleRespond = async (
    principalId: Id<"users">,
    status: "accepted" | "rejected"
  ) => {
    const result = await respondToDeputyRequest(principalId, status);
    if (!result.success) {
      alert(`Failed to respond: ${result.error}`);
    }
  };

  if (!hasPendingRequests) {
    return (
      <div className="space-y-6">
        <Header title="Pending Deputy Requests" count={totalPending} />
        <EmptyState
          title="No pending requests"
          message="You'll see deputy requests from other musicians here."
        />
        <StatsSection
          totalDeputies={totalDeputies}
          totalPending={totalPending}
          referredGigs={user.confirmedReferredGigs || 0}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Header title="Pending Deputy Requests" count={totalPending} />

      <div className="space-y-4">
        {pendingRequests.map(({ principal, request }) => (
          <RequestCard
            key={principal._id}
            principal={principal}
            request={request}
            onRespond={handleRespond}
            isLoading={isLoading(`respond-${principal._id}`)}
          />
        ))}
      </div>

      <StatsSection
        totalDeputies={totalDeputies}
        totalPending={totalPending}
        referredGigs={user.confirmedReferredGigs || 0}
      />
    </div>
  );
};

const RequestCard: React.FC<{
  principal: any;
  request: any;
  onRespond: (id: Id<"users">, status: "accepted" | "rejected") => void;
  isLoading: boolean;
}> = React.memo(({ principal, request, onRespond, isLoading }) => (
  <div className="border rounded-lg p-6 bg-white shadow-sm">
    <div className="flex items-start justify-between">
      <div className="flex items-start gap-4 flex-1">
        <img
          src={principal.picture || "/default-avatar.png"}
          alt={principal.username}
          className="w-12 h-12 rounded-full"
        />

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-lg">
              {principal.firstname} {principal.lastname}
            </h3>
            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
              Request
            </span>
          </div>

          <p className="text-gray-600 mb-1">@{principal.username}</p>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-medium">Wants you as their:</span>
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {request.forTheirSkill}
              </span>
            </div>

            <InfoField label="For gig type" value={request.gigType} />
            <InfoField label="Their instrument" value={principal.instrument} />
            <InfoField label="Location" value={principal.city} />
          </div>

          <PrincipalStats principal={principal} />
        </div>
      </div>

      <ActionButtons
        principalId={principal._id}
        onRespond={onRespond}
        isLoading={isLoading}
      />
    </div>

    <RequestDate date={request.dateAdded} />
  </div>
));

const PrincipalStats: React.FC<{ principal: any }> = ({ principal }) => (
  <div className="flex gap-4 mt-3 text-xs text-gray-600">
    <StatItem icon="⭐" value={principal.avgRating} />
    <StatItem icon="🎵" value={principal.completedGigsCount} label="gigs" />
    <StatItem icon="🏆" value={principal.reliabilityScore} label="% reliable" />
  </div>
);

const StatItem: React.FC<{ icon: string; value?: number; label?: string }> = ({
  icon,
  value,
  label,
}) =>
  value ? (
    <div className="flex items-center gap-1">
      <span>
        {icon} {value}
      </span>
      {label && <span>{label}</span>}
    </div>
  ) : null;

const ActionButtons: React.FC<{
  principalId: Id<"users">;
  onRespond: (id: Id<"users">, status: "accepted" | "rejected") => void;
  isLoading: boolean;
}> = ({ principalId, onRespond, isLoading }) => (
  <div className="flex flex-col gap-2 ml-4">
    <button
      onClick={() => onRespond(principalId, "accepted")}
      disabled={isLoading}
      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium disabled:opacity-50"
    >
      Accept
    </button>
    <button
      onClick={() => onRespond(principalId, "rejected")}
      disabled={isLoading}
      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium disabled:opacity-50"
    >
      Decline
    </button>
  </div>
);

const RequestDate: React.FC<{ date: number }> = ({ date }) => (
  <div className="mt-4 pt-4 border-t border-gray-200">
    <p className="text-xs text-gray-500">
      Request sent {new Date(date).toLocaleDateString()}
    </p>
  </div>
);

const StatsSection: React.FC<{
  totalDeputies: number;
  totalPending: number;
  referredGigs: number;
}> = ({ totalDeputies, totalPending, referredGigs }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <StatCard
      icon="👥"
      label="Active Deputies"
      value={totalDeputies}
      color="blue"
    />
    <StatCard
      icon="⏳"
      label="Pending Requests"
      value={totalPending}
      color="yellow"
    />
    <StatCard
      icon="✅"
      label="Successful Referrals"
      value={referredGigs}
      color="green"
    />
  </div>
);

const StatCard: React.FC<{
  icon: string;
  label: string;
  value: number;
  color: "blue" | "yellow" | "green";
}> = ({ icon, label, value, color }) => {
  const colors = {
    blue: { bg: "bg-blue-50", iconBg: "bg-blue-100", text: "text-blue-600" },
    yellow: {
      bg: "bg-yellow-50",
      iconBg: "bg-yellow-100",
      text: "text-yellow-600",
    },
    green: {
      bg: "bg-green-50",
      iconBg: "bg-green-100",
      text: "text-green-600",
    },
  };

  const { bg, iconBg, text } = colors[color];

  return (
    <div className={`${bg} p-4 rounded-lg`}>
      <div className="flex items-center gap-3">
        <div className={`p-2 ${iconBg} rounded-lg`}>
          <span className="text-lg">{icon}</span>
        </div>
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className={`text-2xl font-bold ${text}`}>{value}</p>
        </div>
      </div>
    </div>
  );
};

// Reusable components
const Header: React.FC<{ title: string; count: number }> = ({
  title,
  count,
}) => (
  <div className="flex justify-between items-center">
    <h2 className="text-2xl font-bold">{title}</h2>
    <p className="text-gray-600">{count} pending requests</p>
  </div>
);

const InfoField: React.FC<{ label: string; value?: string }> = ({
  label,
  value,
}) =>
  value ? (
    <div className="flex items-center gap-2">
      <span className="font-medium">{label}:</span>
      <span>{value}</span>
    </div>
  ) : null;

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
          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
        />
      </svg>
    </div>
    <h3 className="text-lg font-medium mb-2">{title}</h3>
    <p className="text-gray-600">{message}</p>
  </div>
);
