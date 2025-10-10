import { FaStar } from "react-icons/fa";

interface RatingOverviewProps {
  directRating: number;
  gigBasedRating: number;
  combinedRating: number;
  totalReviews: number;
  ratingBreakdown: Record<number, number>;
  completedGigsCount: number;
}

export const RatingOverview = ({
  directRating,
  gigBasedRating,
  combinedRating,
  totalReviews,
  ratingBreakdown,
  completedGigsCount,
}: RatingOverviewProps) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Rating Overview</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Combined Rating */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-blue-600 mb-2">
            Overall Rating
          </h4>
          <div className="flex items-center gap-4">
            <div className="text-5xl font-bold text-blue-800">
              {combinedRating.toFixed(1)}
            </div>
            <div>
              <div className="flex mb-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaStar
                    key={star}
                    className={`text-xl ${
                      star <= Math.round(combinedRating)
                        ? "text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-600">
                Based on {totalReviews} reviews
              </p>
            </div>
          </div>
        </div>

        {/* Rating Breakdown */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-600 mb-3">
            Rating Distribution
          </h4>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center">
                <span className="w-8 text-sm text-gray-600">{rating}★</span>
                <div className="flex-1 mx-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full"
                      style={{
                        width: `${
                          (ratingBreakdown[rating] / totalReviews) * 100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
                <span className="text-sm text-gray-600 w-8 text-right">
                  {ratingBreakdown[rating]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Rating Sources */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-3 bg-indigo-50 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-indigo-700">
              Profile Reviews
            </span>
            <span className="text-lg font-bold text-indigo-800">
              {directRating.toFixed(1)}
            </span>
          </div>
          <div className="text-xs text-indigo-600 mt-1">
            {totalReviews} direct reviews
          </div>
        </div>

        <div className="p-3 bg-purple-50 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-purple-700">
              Gig Performance
            </span>
            <span className="text-lg font-bold text-purple-800">
              {gigBasedRating.toFixed(1)}
            </span>
          </div>
          <div className="text-xs text-purple-600 mt-1">
            {completedGigsCount} completed gigs
          </div>
        </div>
      </div>
    </div>
  );
};
