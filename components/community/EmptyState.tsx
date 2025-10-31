// components/EmptyState.tsx
import React from "react";

interface EmptyStateProps {
  title: string;
  message: string;
  action?: () => void;
  actionText?: string;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  message,
  action,
  actionText,
  icon,
}) => (
  <div className="text-center py-12 border-2 border-dashed rounded-lg">
    <div className="text-gray-400 mb-4">
      {icon || (
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
            d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      )}
    </div>
    <h3 className="text-lg font-medium mb-2">{title}</h3>
    <p className="text-gray-600 mb-4">{message}</p>
    {action && actionText && (
      <button
        onClick={action}
        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
      >
        {actionText}
      </button>
    )}
  </div>
);
