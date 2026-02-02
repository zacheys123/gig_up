import { Doc } from "@/convex/_generated/dataModel";
import { BandRoleSchema } from "@/types/gig";

// utils/roleMapping.ts
export const ROLE_MAPPING = {
  // Display name → Backend value
  "Lead Vocalist": "vocalist",
  "Backup Vocalist": "vocalist",
  Guitarist: "guitar",
  Bassist: "bass",
  Drummer: "drums",
  Percussionist: "drums",
  "Pianist/Keyboardist": "piano",
  Saxophonist: "saxophone",
  Trumpeter: "trumpet",
  Violinist: "violin",
  DJ: "dj",
  "MC/Host": "mc",
} as const;

// Get backend value
export const getBackendValue = (displayName: string): string => {
  return ROLE_MAPPING[displayName as keyof typeof ROLE_MAPPING] || displayName;
};

interface BandRole {
  role: string;
  filledSlots: number;
  maxSlots: number;
  requiredSkills?: string[];
}
// Simple exact match qualification
export const isUserQualifiedForRole = (
  user: Doc<"users">,
  bandRole: BandRole,
): boolean => {
  const backendRole = bandRole.role.toLowerCase(); // e.g., "guitar"
  const userInstrument = user.instrument?.toLowerCase() || "";
  const userRoleType = user.roleType?.toLowerCase() || "";

  // For vocal roles
  if (backendRole === "vocalist" && userRoleType === "vocalist") {
    return true;
  }

  // For DJ/MC
  if (["dj", "mc"].includes(backendRole)) {
    return userRoleType === backendRole;
  }

  // For instruments - exact match
  return userInstrument === backendRole;
};
// utils/index.ts - Add this function
export const getDisplayName = (backendValue: string): string => {
  const reverseMapping: Record<string, string> = {
    vocalist: "Lead Vocalist",
    guitar: "Guitarist",
    bass: "Bassist",
    drums: "Drummer",
    piano: "Pianist/Keyboardist",
    saxophone: "Saxophonist",
    trumpet: "Trumpeter",
    violin: "Violinist",
    dj: "DJ",
    mc: "MC/Host",
  };
  return reverseMapping[backendValue] || backendValue;
};
