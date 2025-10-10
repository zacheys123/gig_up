import { FaCheck, FaTimes } from "react-icons/fa";
import { IoShieldCheckmark } from "react-icons/io5";

interface PerformanceMetricsProps {
  completedGigsCount: number;
  cancelgigCount: number;
  reliabilityScore: number;
}

export const PerformanceMetrics = ({
  completedGigsCount,
  cancelgigCount,
  reliabilityScore,
}: PerformanceMetricsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div className="bg-blue-50 p-5 rounded-lg border border-blue-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-blue-600 font-medium">Completed</p>
            <p className="text-3xl font-bold text-blue-800 mt-1">
              {completedGigsCount || 0}
            </p>
          </div>
          <div className="bg-blue-100 p-2 rounded-full">
            <FaCheck className="text-blue-600" />
          </div>
        </div>
      </div>

      <div className="bg-red-50 p-5 rounded-lg border border-red-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-red-600 font-medium">Canceled</p>
            <p className="text-3xl font-bold text-red-800 mt-1">
              {cancelgigCount || 0}
            </p>
          </div>
          <div className="bg-red-100 p-2 rounded-full">
            <FaTimes className="text-red-600" />
          </div>
        </div>
      </div>

      <div className="bg-green-50 p-5 rounded-lg border border-green-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-green-600 font-medium">Reliability</p>
            <p className="text-3xl font-bold text-green-800 mt-1">
              {reliabilityScore.toFixed(0)}%
            </p>
          </div>
          <div className="bg-green-100 p-2 rounded-full">
            <IoShieldCheckmark className="text-green-600" />
          </div>
        </div>
      </div>
    </div>
  );
};
