export function StatsCard({
  title,
  value,
  max,
  icon,
}: {
  title?: string;
  value: number;
  max: number;
  icon: React.ReactNode;
}) {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-gray-400">{title}</p>
          <p className="text-xl font-bold mt-1">
            {value}{" "}
            <span className="text-xs text-gray-500">
              / {max === Infinity ? "∞" : max}
            </span>
          </p>
        </div>
        <div className="p-2 rounded-full bg-gray-800">{icon}</div>
      </div>
      <div className="mt-3">
        <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-orange-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}
