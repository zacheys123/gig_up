// convex/verifyUtil.ts
/**
 * Simple normalization for security answers
 * This is NOT cryptographic hashing, just normalization
 */
export const normalizeSecurityAnswer = (answer: string): string => {
  return answer
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ") // Normalize spaces
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // Remove accents
};

export const verifySecurityAnswer = (
  inputAnswer: string,
  storedAnswer: string
): boolean => {
  if (!storedAnswer) return false;
  const normalizedInput = normalizeSecurityAnswer(inputAnswer);
  return normalizedInput === storedAnswer;
};

export const generateRandomSecret = (): string => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const length = 8;
  let result = "";

  // Simple random using Math.random
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
};
