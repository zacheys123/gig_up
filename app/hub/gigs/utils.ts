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
export const isUserQualifiedForRole = (user: any, role: any): boolean => {
  if (!user || !role) {
    console.log("❌ Missing user or role");
    return false;
  }

  if (role.filledSlots >= role.maxSlots) {
    console.log(
      `❌ Role "${role.role}" is full (${role.filledSlots}/${role.maxSlots})`,
    );
    return false;
  }

  const roleName = (role.role || "").toLowerCase().trim();
  const userInstrument = (user.instrument || "").toLowerCase().trim();
  const userRoleType = (user.roleType || "").toLowerCase().trim();

  console.log(`=== Qualification Check ===`);
  console.log(`Role: "${role.role}" (${roleName})`);
  console.log(`User instrument: "${user.instrument}" -> "${userInstrument}"`);
  console.log(`User roleType: "${user.roleType}" -> "${userRoleType}"`);

  const instrumentMatch = userInstrument === roleName;
  const roleTypeMatch = userRoleType === roleName;

  console.log(`Instrument exact match: ${instrumentMatch}`);
  console.log(`RoleType exact match: ${roleTypeMatch}`);

  const qualified = instrumentMatch || roleTypeMatch;
  console.log(`Result: ${qualified ? "✅ QUALIFIED" : "❌ NOT QUALIFIED"}\n`);

  return qualified;
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
