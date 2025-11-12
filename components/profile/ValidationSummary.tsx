import { useThemeColors } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { VALIDATION_MESSAGES, ValidationError } from "@/types/validation";
import { motion } from "framer-motion";
import { Briefcase, ChevronRight, X, Star, TrendingUp } from "lucide-react";

export const ValidationSummary = ({
  errors,
  onFieldClick,
}: {
  errors: ValidationError[];
  onFieldClick: (field: string) => void;
}) => {
  const { colors } = useThemeColors();

  if (errors.length === 0) return null;

  const highPriorityErrors = errors.filter(
    (error) => error.importance === "high"
  );
  const mediumPriorityWarnings = errors.filter(
    (error) => error.importance === "medium"
  );

  // Separate recommendations from other medium priority warnings
  const recommendations = errors.filter(
    (error) => error.type === "recommendation"
  );
  const otherWarnings = mediumPriorityWarnings.filter(
    (error) => error.type !== "recommendation"
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-lg border p-4 mb-6 shadow-sm",
        colors.border,
        colors.card
      )}
    >
      <div className="flex items-start gap-3 mb-4">
        <div
          className={cn(
            "p-2 rounded-full",
            highPriorityErrors.length > 0
              ? colors.destructive
              : recommendations.length > 0
                ? "bg-amber-500 text-white"
                : colors.warningText
          )}
        >
          {highPriorityErrors.length > 0 ? (
            <X size={20} />
          ) : recommendations.length > 0 ? (
            <TrendingUp size={20} />
          ) : (
            <Briefcase size={20} />
          )}
        </div>
        <div className="flex-1">
          <h3 className={cn("font-semibold text-lg mb-1", colors.text)}>
            {highPriorityErrors.length > 0
              ? "Complete Your Profile to Continue"
              : recommendations.length > 0
                ? "Boost Your Profile"
                : "Profile Recommendations"}
          </h3>
          <p className={cn("text-sm", colors.textMuted)}>
            {highPriorityErrors.length > 0
              ? "Please address these required fields to unlock all platform features"
              : recommendations.length > 0
                ? "Small improvements can significantly increase your booking chances"
                : "Improve your profile to get more bookings and visibility"}
          </p>
        </div>
      </div>

      {/* High Priority Errors */}
      {highPriorityErrors.length > 0 && (
        <div className="space-y-3 mb-4">
          <h4 className={cn("font-medium text-sm mb-2", colors.text)}>
            Required Fields
          </h4>
          {highPriorityErrors.map((error, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => onFieldClick(error.field)}
              className={cn(
                "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-200",
                "hover:shadow-md hover:scale-[1.02]",
                colors.danger,
                colors.border
              )}
            >
              <div
                className={cn(
                  "flex-shrink-0 w-2 h-2 rounded-full mt-2",
                  "bg-current"
                )}
              />
              <div className="flex-1 min-w-0">
                <p className={cn("text-sm font-medium mb-1", "text-current")}>
                  {getFieldDisplayName(error.field)}
                </p>
                <p
                  className={cn(
                    "text-sm leading-relaxed",
                    "text-current opacity-90"
                  )}
                >
                  {error.message}
                </p>
              </div>
              <ChevronRight
                size={16}
                className={cn("flex-shrink-0 mt-1", "text-current")}
              />
            </motion.div>
          ))}
        </div>
      )}

      {/* Recommendations (Special styling for rates and other recommendations) */}
      {recommendations.length > 0 && (
        <div className="space-y-3 mb-4">
          <h4
            className={cn(
              "font-medium text-sm mb-2 flex items-center gap-2",
              colors.text
            )}
          >
            <Star className="h-4 w-4 text-amber-500" />
            Boost Your Bookings
          </h4>
          {recommendations.map((recommendation, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => onFieldClick(recommendation.field)}
              className={cn(
                "flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all duration-200",
                "hover:shadow-md hover:scale-[1.02]",
                "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20",
                colors.text
              )}
            >
              <div className="flex-shrink-0 w-2 h-2 rounded-full mt-2 bg-amber-500" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p
                    className={cn(
                      "text-sm font-medium",
                      "text-amber-800 dark:text-amber-300"
                    )}
                  >
                    {getFieldDisplayName(recommendation.field)}
                  </p>
                  {recommendation.field === "rates" && (
                    <span className="px-2 py-1 text-xs bg-amber-500 text-white rounded-full font-medium">
                      +3x Bookings
                    </span>
                  )}
                </div>
                <p
                  className={cn(
                    "text-sm leading-relaxed",
                    "text-amber-700 dark:text-amber-400"
                  )}
                >
                  {recommendation.message}
                </p>
                {/* Additional benefits for rates */}
                {recommendation.field === "rates" && (
                  <div className="mt-2 grid grid-cols-1 gap-1 text-xs">
                    <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500">
                      <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                      <span>Get 3x more booking requests</span>
                    </div>
                    <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500">
                      <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                      <span>Faster client decisions</span>
                    </div>
                    <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500">
                      <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                      <span>Professional appearance</span>
                    </div>
                  </div>
                )}
              </div>
              <ChevronRight
                size={16}
                className={cn(
                  "flex-shrink-0 mt-1",
                  "text-amber-600 dark:text-amber-400"
                )}
              />
            </motion.div>
          ))}
        </div>
      )}

      {/* Other Medium Priority Warnings */}
      {otherWarnings.length > 0 && (
        <div className="space-y-3">
          <h4 className={cn("font-medium text-sm mb-2", colors.text)}>
            Recommendations
          </h4>
          {otherWarnings.map((warning, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => onFieldClick(warning.field)}
              className={cn(
                "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-200",
                "hover:shadow-md hover:scale-[1.02]",
                colors.warning,
                colors.border
              )}
            >
              <div
                className={cn(
                  "flex-shrink-0 w-2 h-2 rounded-full mt-2",
                  "bg-current"
                )}
              />
              <div className="flex-1 min-w-0">
                <p className={cn("text-sm font-medium mb-1", "text-current")}>
                  {getFieldDisplayName(warning.field)}
                </p>
                <p
                  className={cn(
                    "text-sm leading-relaxed",
                    "text-current opacity-90"
                  )}
                >
                  {warning.message}
                </p>
              </div>
              <ChevronRight
                size={16}
                className={cn("flex-shrink-0 mt-1", "text-current")}
              />
            </motion.div>
          ))}
        </div>
      )}

      {/* Progress Indicator */}
      <div className={cn("mt-4 pt-4 border-t", colors.border)}>
        <div className="flex items-center justify-between text-sm">
          <span className={cn(colors.textMuted)}>Profile Completion</span>
          <span className={cn("font-medium", colors.text)}>
            {calculateCompletionPercentage(errors)}% Complete
          </span>
        </div>
        <div
          className={cn(
            "w-full rounded-full h-2 mt-2",
            colors.secondaryBackground
          )}
        >
          <div
            className={cn(
              "h-2 rounded-full transition-all duration-500",
              highPriorityErrors.length > 0
                ? colors.warning
                : recommendations.length > 0
                  ? "bg-amber-500"
                  : "bg-green-500"
            )}
            style={{ width: `${calculateCompletionPercentage(errors)}%` }}
          />
        </div>
        {recommendations.length > 0 && highPriorityErrors.length === 0 && (
          <p
            className={cn(
              "text-xs mt-2 text-center",
              "text-amber-600 dark:text-amber-400"
            )}
          >
            Great start! Adding rates could boost your bookings significantly.
          </p>
        )}
      </div>
    </motion.div>
  );
};

// In ValidationSummary component
export const getFieldDisplayName = (field: string): string => {
  const displayNames: Record<string, string> = {
    phone: "Phone Number",
    dateOfBirth: "Date of Birth",
    rates: "Performance Rates",
    videos: "Performance Videos",
    profile: "Profile Information",
    firstname: "First Name",
    lastname: "Last Name",
    city: "City",
    talentbio: "Bio",
    instrument: "Primary Instrument",
    experience: "Experience Level",
    roleType: "Role Type",
    djGenre: "DJ Genre",
    mcType: "MC Type",
    vocalistGenre: "Vocal Genre",
    bookerSkills: "Booker Skills",
    organization: "Company/Organization",
    teacherSpecialization: "Teaching Specialization",
    teachingStyle: "Teaching Style",
    lessonFormat: "Lesson Format",
    studentAgeGroup: "Student Age Group",
  };
  return displayNames[field] || field;
};

// Helper function to calculate completion percentage
const calculateCompletionPercentage = (errors: ValidationError[]): number => {
  const totalFields = 12; // Adjust based on your actual required fields
  const highPriorityErrors = errors.filter(
    (error) => error.importance === "high"
  ).length;
  const completion = Math.max(
    0,
    ((totalFields - highPriorityErrors) / totalFields) * 100
  );
  return Math.round(completion);
};

export const validateKenyanPhone = (
  phone: string
): { isValid: boolean; formatted?: string; error?: string } => {
  if (!phone || phone.trim() === "") {
    return { isValid: false, error: "Phone number is required" };
  }

  const cleaned = phone.replace(/[^\d+]/g, "");

  const patterns = {
    local: /^(07\d{8}|01\d{8})$/,
    international: /^\+2547\d{8}$/,
    formatted:
      /^(07\d{1}[\s-]?\d{3}[\s-]?\d{3,4}|01\d{1}[\s-]?\d{3}[\s-]?\d{3,4})$/,
  };

  const isValid =
    patterns.local.test(cleaned) ||
    patterns.international.test(cleaned) ||
    patterns.formatted.test(phone);

  if (!isValid) {
    return {
      isValid: false,
      error: "Please enter a valid Kenyan phone number",
    };
  }

  let formatted = cleaned;
  if (patterns.international.test(cleaned)) {
    formatted = "0" + cleaned.slice(4);
  }
  if (patterns.local.test(formatted)) {
    formatted = formatted.replace(/(\d{3})(\d{3})(\d{3,4})/, "$1 $2 $3");
  }

  return { isValid: true, formatted };
};
