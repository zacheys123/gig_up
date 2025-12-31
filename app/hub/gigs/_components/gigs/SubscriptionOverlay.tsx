type Subscribed = {
  isSubscribed: boolean;
};
interface SubscriptionProps {
  type: "automatic" | "regular" | "create" | string | null;
  isSubscribed: Subscribed;
}
const SubscriptionOverlay = ({ type, isSubscribed }: SubscriptionProps) => {
  if (isSubscribed) return null; // No overlay for subscribed users

  // Different styling for "create" vs other options
  const isCreateOption = type === "create";

  return (
    <div
      className={`
        absolute inset-0 z-20 flex items-center justify-center rounded-xl p-4
        ${
          isCreateOption
            ? "bg-white/30 backdrop-blur-[1px]"
            : "bg-white/80 backdrop-blur-sm"
        }
      `}
    >
      <div
        className={`
          p-4 rounded-xl shadow-lg w-full max-w-xs
          ${
            isCreateOption
              ? "bg-gray-100/90 border border-gray-200" // Subtle for create
              : "bg-gradient-to-br from-blue-600 to-blue-800 border border-blue-400/30"
          } // Pro style for others
        `}
      >
        {isCreateOption ? (
          // Subtle upsell for create option
          <div className="text-center">
            <p className="text-sm text-gray-700 font-medium">
              Free users limited to 3 gigs
            </p>
            <button
              onClick={() => console.log("Upgrade clicked")}
              className="mt-2 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-3 py-1 rounded-lg transition-colors"
            >
              Upgrade for unlimited
            </button>
          </div>
        ) : (
          // Full Pro upsell for other options
          <div className="text-center">
            <div className="flex justify-center mb-2">
              <div className="bg-yellow-400/20 p-1.5 rounded-lg">
                <CrownIcon className="w-4 h-4 text-yellow-500" />
              </div>
            </div>
            <p className="text-sm font-semibold text-white">
              Pro feature: {type} scheduling
            </p>
            <button
              onClick={() => console.log("Upgrade clicked")}
              className="mt-2 text-xs bg-gradient-to-r from-yellow-400 to-yellow-500 text-blue-900 font-medium px-3 py-1.5 rounded-lg shadow-sm"
            >
              Upgrade to Pro
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
export default SubscriptionOverlay;

// Small crown icon component
const CrownIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
    />
  </svg>
);
