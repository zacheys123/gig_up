import { toast } from "sonner";

// ADD these functions inside your component (but outside the return statement):
const showBookingFeedback = (
  type: "success" | "error" | "warning",
  title: string,
  description?: string,
  options?: any
) => {
  const icons = { success: "✅", error: "❌", warning: "⚠️" };
  if (type === "success") {
    toast.success(`${icons[type]} ${title}`, {
      description,
      duration: 4000,
      ...options,
    });
  } else if (type === "error") {
    toast.error(`${icons[type]} ${title}`, {
      description,
      duration: 5000,
      ...options,
    });
  } else {
    toast.warning(`${icons[type]} ${title}`, {
      description,
      duration: 4000,
      ...options,
    });
  }
};

const handleConvexError = (error: any, context: string = "booking") => {
  const errorMessage = error.message || "An unknown error occurred";
  const parts = errorMessage.split(":");
  const errorType = parts[0];

  console.log(`Error type: ${errorType}, Full message: ${errorMessage}`);

  if (errorType === "ROLE_FULL") {
    const roleName = parts[1] || "this position";
    const filled = parts[2] || "1";
    const total = parts[3] || "1";
    showBookingFeedback(
      "error",
      "Position Filled",
      `The "${roleName}" position is already full (${filled}/${total} slots)`
    );
  } else if (errorType === "PERMISSION_DENIED") {
    showBookingFeedback(
      "error",
      "Permission Denied",
      "Only the band leader can book musicians"
    );
  } else if (errorMessage.includes("already full")) {
    showBookingFeedback(
      "error",
      "Position Filled",
      "This band position has already been filled"
    );
  } else {
    showBookingFeedback(
      "error",
      "Action Failed",
      "Please try again or contact support"
    );
  }

  console.error(`Error in ${context}:`, error);
};
