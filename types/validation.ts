// Add these types and constants at the top of your component
export interface ValidationError {
  field: string;
  message: string;
  importance: "high" | "medium" | "low";
}

export const VALIDATION_MESSAGES = {
  // Phone Number
  phone: {
    required: "Phone number is required for clients to contact you about gigs.",
    invalid:
      "Please enter a valid Kenyan phone number (e.g., 0712 345 678, +254712345678)",
    format:
      "Kenyan numbers should start with 07, 01, or +254 followed by 9 digits",
  },
  // Date of Birth
  dateOfBirth: {
    required:
      "Date of birth is required to verify your age for gig eligibility and platform safety.",
    invalid:
      "Please provide a valid date of birth to ensure age-appropriate content and opportunities.",
  },

  // Rates
  rates: {
    required:
      "Performance rates help clients understand your pricing and book you confidently.",
    invalid:
      "Please set realistic rates to attract the right clients and opportunities.",
  },

  // Videos
  videos: {
    required:
      "Performance videos showcase your talent and significantly increase booking chances.",
    recommended:
      "Adding videos makes your profile 3x more likely to be booked by clients.",
  },

  // Profile Completeness
  profile: {
    incomplete:
      "Complete profiles get 5x more views and 2x more bookings than incomplete ones.",
  },
} as const;
