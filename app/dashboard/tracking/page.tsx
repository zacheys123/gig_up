import GigChart from "@/components/dashboard/GigChart";
import { RecentActivity } from "@/components/dashboard/RecentActivity";

export default function ProgressPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-white">Your Progress</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gray-900 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">Gig Activity</h2>
          <GigChart />
        </div>

        <div className="bg-gray-900 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">Recent Bookings</h2>
          <RecentActivity />
        </div>
      </div>
    </div>
  );
}
