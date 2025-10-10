import {
  FaThumbsUp,
  FaExclamationTriangle,
  FaCheck,
  FaTimes,
} from "react-icons/fa";

export const PerformanceImpact = () => {
  return (
    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-100 mb-8">
      <h3 className="text-xl font-bold text-indigo-800 mb-4">
        Performance Impact
      </h3>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-semibold text-green-600 mb-3 flex items-center gap-2">
            <FaThumbsUp /> Benefits for Good Performance
          </h4>
          <ul className="space-y-3">
            <li className="flex items-start gap-2">
              <FaCheck className="text-green-500 mt-1 flex-shrink-0" />
              <span>Higher search ranking</span>
            </li>
            <li className="flex items-start gap-2">
              <FaCheck className="text-green-500 mt-1 flex-shrink-0" />
              <span>Access to premium gigs</span>
            </li>
            <li className="flex items-start gap-2">
              <FaCheck className="text-green-500 mt-1 flex-shrink-0" />
              <span>Verified badge on profile</span>
            </li>
            <li className="flex items-start gap-2">
              <FaCheck className="text-green-500 mt-1 flex-shrink-0" />
              <span>Reduced platform fees</span>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-red-600 mb-3 flex items-center gap-2">
            <FaExclamationTriangle /> Consequences for Poor Performance
          </h4>
          <ul className="space-y-3">
            <li className="flex items-start gap-2">
              <FaTimes className="text-red-500 mt-1 flex-shrink-0" />
              <span>Lower search visibility</span>
            </li>
            <li className="flex items-start gap-2">
              <FaTimes className="text-red-500 mt-1 flex-shrink-0" />
              <span>Temporary gig restrictions</span>
            </li>
            <li className="flex items-start gap-2">
              <FaTimes className="text-red-500 mt-1 flex-shrink-0" />
              <span>Warning labels on profile</span>
            </li>
            <li className="flex items-start gap-2">
              <FaTimes className="text-red-500 mt-1 flex-shrink-0" />
              <span>Increased platform fees</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
