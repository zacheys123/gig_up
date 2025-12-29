// components/TrustBadge.tsx
export function TrustBadge({ tier, score }: { tier: string; score: number }) {
  const config = {
    new: { color: "gray", label: "New User", icon: "👋" },
    basic: { color: "blue", label: "Basic", icon: "⭐" },
    verified: { color: "green", label: "Verified", icon: "✅" },
    trusted: { color: "purple", label: "Trusted", icon: "🤝" },
    elite: { color: "gold", label: "Elite", icon: "👑" },
  }[tier];

  return (
    <div
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full bg-${config?.color}-100 text-${config?.color}-800 text-sm`}
    >
      <span>{config?.icon}</span>
      <span className="font-medium">{config?.label}</span>
      <span className="text-xs opacity-75">({score})</span>
    </div>
  );
}

export function TrustScoreProgress({
  current,
  target,
}: {
  current: number;
  target: number;
}) {
  const percentage = Math.min(100, (current / target) * 100);

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span>Trust Score</span>
        <span className="font-medium">
          {current}/{target}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="h-2 rounded-full bg-green-500 transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
