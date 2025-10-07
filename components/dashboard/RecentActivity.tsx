import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

const activities = [
  {
    id: 1,
    type: "booking",
    title: "Wedding Gig - Nairobi",
    date: "2023-06-15",
    status: "confirmed",
    amount: "KES 15,000",
  },
  {
    id: 2,
    type: "application",
    title: "Club Night - Mombasa",
    date: "2023-06-10",
    status: "pending",
  },
  {
    id: 3,
    type: "booking",
    title: "Corporate Event",
    date: "2023-06-05",
    status: "cancelled",
  },
];

export function RecentActivity() {
  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div
          key={activity.id}
          className="flex items-start gap-3 border-b border-gray-800 pb-4 last:border-0"
        >
          <div className="mt-1">
            {activity.status === "confirmed" ? (
              <CheckCircleIcon className="h-5 w-5 text-green-500" />
            ) : activity.status === "pending" ? (
              <ClockIcon className="h-5 w-5 text-yellow-500" />
            ) : (
              <XCircleIcon className="h-5 w-5 text-red-500" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-white">{activity.title}</h3>
            <p className="text-sm text-gray-400">
              {new Date(activity.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
              {activity.type === "booking" && (
                <span className="ml-2 text-orange-400">{activity.amount}</span>
              )}
            </p>
          </div>
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              activity.status === "confirmed"
                ? "bg-green-900/30 text-green-400"
                : activity.status === "pending"
                ? "bg-yellow-900/30 text-yellow-400"
                : "bg-red-900/30 text-red-400"
            }`}
          >
            {activity.status}
          </span>
        </div>
      ))}
    </div>
  );
}
