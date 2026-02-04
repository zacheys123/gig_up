// utils/rateCalculator.ts
export interface RateCategory {
  name: string;
  rate: string;
  rateType?: string;
  description?: string;
}

export interface UserRate {
  baseRate?: string;
  rateType?: string;
  currency?: string;
  categories?: RateCategory[];
  negotiable?: boolean;
  // ... other fields
}

/**
 * Calculate average rate from user's rate categories
 * @param userRate - The user's rate object
 * @returns The average rate as a number, or null if no rates available
 */
export function calculateAverageRate(
  userRate?: UserRate | null,
): number | null {
  if (!userRate?.categories?.length) {
    return null;
  }

  let total = 0;
  let validRates = 0;

  for (const category of userRate.categories) {
    if (category.rate) {
      const rateValue = parseFloat(category.rate);
      if (!isNaN(rateValue) && rateValue > 0) {
        total += rateValue;
        validRates++;
      }
    }
  }

  return validRates > 0 ? Math.round(total / validRates) : null;
}

/**
 * Get the minimum rate from user's rate categories
 */
export function getMinimumRate(userRate?: UserRate | null): number | null {
  if (!userRate?.categories?.length) {
    return null;
  }

  let minRate: number | null = null;

  for (const category of userRate.categories) {
    if (category.rate) {
      const rateValue = parseFloat(category.rate);
      if (!isNaN(rateValue) && rateValue > 0) {
        if (minRate === null || rateValue < minRate) {
          minRate = rateValue;
        }
      }
    }
  }

  return minRate;
}

/**
 * Get the maximum rate from user's rate categories
 */
export function getMaximumRate(userRate?: UserRate | null): number | null {
  if (!userRate?.categories?.length) {
    return null;
  }

  let maxRate: number | null = null;

  for (const category of userRate.categories) {
    if (category.rate) {
      const rateValue = parseFloat(category.rate);
      if (!isNaN(rateValue) && rateValue > 0) {
        if (maxRate === null || rateValue > maxRate) {
          maxRate = rateValue;
        }
      }
    }
  }

  return maxRate;
}

/**
 * Format rate with KES as default currency
 */
export function formatRate(
  rate: number | null,
  currency: string = "KES",
): string {
  if (rate === null) return "N/A";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(rate);
}

/**
 * Format rate without currency symbol (just number with commas)
 */
export function formatRatePlain(rate: number | null): string {
  if (rate === null) return "N/A";

  return rate.toLocaleString("en-US");
}

/**
 * Format rate with KES abbreviation
 */
export function formatRateKES(rate: number | null): string {
  if (rate === null) return "N/A";

  if (rate >= 1000) {
    // Format as KSh 1,000 or 1k
    const inThousands = rate / 1000;
    if (inThousands >= 100) {
      return `KSh ${(rate / 1000).toFixed(0)}k`;
    } else if (inThousands >= 10) {
      return `KSh ${(rate / 1000).toFixed(1)}k`.replace(".0k", "k");
    }
  }

  return `KSh ${rate.toLocaleString("en-US")}`;
}

/**
 * Get a summary of all rates
 */
export function getRateSummary(userRate?: UserRate | null): {
  average: number | null;
  min: number | null;
  max: number | null;
  count: number;
  formattedAverage: string;
  formattedMin: string;
  formattedMax: string;
} {
  const average = calculateAverageRate(userRate);
  const min = getMinimumRate(userRate);
  const max = getMaximumRate(userRate);
  const count = userRate?.categories?.length || 0;
  const currency = userRate?.currency || "KES";

  return {
    average,
    min,
    max,
    count,
    formattedAverage: formatRate(average, currency),
    formattedMin: formatRate(min, currency),
    formattedMax: formatRate(max, currency),
  };
}

/**
 * Quick rate display for cards and lists
 */
export function getQuickRateDisplay(userRate?: UserRate | null): string {
  if (!userRate) return "Contact for rate";

  // Prefer baseRate if available
  if (userRate.baseRate) {
    const baseRateNum = parseFloat(userRate.baseRate);
    if (!isNaN(baseRateNum) && baseRateNum > 0) {
      return formatRateKES(baseRateNum);
    }
  }

  // Otherwise use average from categories
  const average = calculateAverageRate(userRate);
  if (average !== null) {
    return formatRateKES(average);
  }

  return "Contact for rate";
}

/**
 * Get rate for specific category
 */
export function getCategoryRate(
  categoryName: string,
  userRate?: UserRate | null,
): string | null {
  if (!userRate?.categories?.length) return null;

  const category = userRate.categories.find(
    (cat) => cat.name.toLowerCase() === categoryName.toLowerCase(),
  );

  return category?.rate || null;
}

/**
 * Check if user has negotiable rates
 */
export function isNegotiable(userRate?: UserRate | null): boolean {
  return userRate?.negotiable === true;
}

/**
 * Get all categories with their rates
 */
export function getAllCategoriesWithRates(userRate?: UserRate | null): Array<{
  name: string;
  rate: string;
  formattedRate: string;
  rateType?: string;
  description?: string;
}> {
  if (!userRate?.categories?.length) return [];

  return userRate.categories.map((cat) => ({
    ...cat,
    formattedRate: formatRateKES(parseFloat(cat.rate) || 0),
  }));
}
