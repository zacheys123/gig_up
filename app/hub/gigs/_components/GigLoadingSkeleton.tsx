// components/gigs/GigsLoadingSkeleton.tsx
import React from "react";

export const GigsLoadingSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex-1">
              <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-64 mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-96 animate-pulse"></div>
            </div>

            {/* Stats Skeleton */}
            <div className="flex flex-wrap gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 animate-pulse"
                >
                  <div className="h-7 bg-gray-300 dark:bg-gray-700 rounded w-12 mb-1"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Role Badge Skeleton */}
          <div className="flex items-center gap-2 mb-6">
            <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
          </div>
        </div>

        {/* Tab Navigation Skeleton */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
          <div className="flex space-x-8 overflow-x-auto scrollbar-hide">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="py-4 animate-pulse flex-shrink-0">
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-20"></div>
              </div>
            ))}
          </div>
        </div>
        {/* Main Content Skeleton */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          {/* Section Header Skeleton */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex-1">
                <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-64 mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-96 animate-pulse"></div>
              </div>
              <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded w-48 animate-pulse"></div>
            </div>
          </div>

          {/* Gig Cards Skeleton */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <GigCardSkeleton key={i} />
              ))}
            </div>

            {/* Empty State Skeleton */}
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12 text-center animate-pulse">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
              <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-64 mx-auto mb-2"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-96 mx-auto mb-6"></div>
              <div className="flex justify-center gap-3">
                <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded w-32"></div>
                <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded w-32"></div>
              </div>
            </div>

            {/* Stats Skeleton */}
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg animate-pulse"
                >
                  <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-16 mx-auto mb-2"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-20 mx-auto"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Individual Gig Card Skeleton
const GigCardSkeleton: React.FC = () => {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 animate-pulse">
      {/* Card Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded-full flex-shrink-0"></div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
          </div>
          <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>

      {/* Card Details */}
      <div className="space-y-2 mb-4">
        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded"></div>
        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-2/3"></div>
        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded flex-1"></div>
        <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded flex-1"></div>
      </div>
    </div>
  );
};

// Compact Skeleton for Smaller Load States
export const CompactGigsSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div className="flex-1">
          <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-48 mb-2"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-64"></div>
        </div>
        <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded w-32"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="border border-gray-200 dark:border-gray-700 rounded p-4"
          >
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
            <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Table Row Skeleton for List Views
export const GigTableRowSkeleton: React.FC = () => {
  return (
    <div className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
      <div className="flex items-center p-4 animate-pulse">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
          <div className="flex-1 min-w-0">
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-32 mb-2"></div>
            <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-24"></div>
          </div>
        </div>
        <div className="flex items-center gap-6 flex-1">
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-20"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-24"></div>
        </div>
        <div className="flex gap-2">
          <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-20"></div>
          <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-20"></div>
        </div>
      </div>
    </div>
  );
};

// Stats Cards Skeleton
export const GigStatsSkeleton: React.FC = () => {
  return (
    <div className="flex flex-wrap gap-4 animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
        >
          <div className="h-7 bg-gray-300 dark:bg-gray-700 rounded w-12 mb-1"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
        </div>
      ))}
    </div>
  );
};
