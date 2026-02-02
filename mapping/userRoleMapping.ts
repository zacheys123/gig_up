// utils/userRoleMatching.ts

import { Doc } from "@/convex/_generated/dataModel";
import { instrumentRoleMappings } from "./instrementMapping";
import { isUserQualifiedForRole } from "@/app/hub/gigs/utils";

type User = Doc<"users">;

interface BandRole {
  role: string;
  filledSlots: number;
  maxSlots: number;
  requiredSkills?: string[];
}
// utils/userRoleMatching.ts
// Helper to normalize skill names
const normalizeSkill = (skill: string): string => {
  return skill
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, "") // Remove special characters
    .replace(/\s+/g, "_"); // Replace spaces with underscores
};

// Helper to get all user skills
const getAllNormalizedUserSkills = (user: User): string[] => {
  const skills: string[] = [];

  // Add role type
  if (user.roleType) {
    skills.push(normalizeSkill(user.roleType));
  }

  // Add instruments - handle both single string and array
  if (user.instrument) {
    if (Array.isArray(user.instrument)) {
      skills.push(...user.instrument.map(normalizeSkill));
    } else {
      skills.push(normalizeSkill(user.instrument));
    }

    // Also add mapped variations for common instruments
    const instrumentVariations = getInstrumentVariations(user.instrument);
    skills.push(...instrumentVariations.map(normalizeSkill));
  }

  // Add genre if relevant
  if (user.musiciangenres) {
    skills.push(...user.musiciangenres.map(normalizeSkill));
  }

  // // Add other relevant skills from user profile
  // if (user.otherSkills && Array.isArray(user.otherSkills)) {
  //   skills.push(...user.otherSkills.map(normalizeSkill));
  // }

  return [...new Set(skills)]; // Remove duplicates
};

// Get instrument variations (e.g., piano -> keyboard, keyboardist, etc.)
const getInstrumentVariations = (instrument: string | string[]): string[] => {
  const instruments = Array.isArray(instrument) ? instrument : [instrument];
  const variations = new Set<string>();

  instruments.forEach((instr) => {
    const normalized = instr.toLowerCase().trim();

    // Piano/keyboard mappings
    if (normalized.includes("piano") || normalized.includes("keyboard")) {
      variations.add("piano");
      variations.add("keyboard");
      variations.add("keyboardist");
      variations.add("pianist");
      variations.add("keys");
    }

    // Guitar mappings
    if (normalized.includes("guitar")) {
      variations.add("guitar");
      variations.add("guitarist");
      variations.add("guitar_player");
    }

    // Vocal mappings
    if (normalized.includes("vocal") || normalized.includes("sing")) {
      variations.add("vocalist");
      variations.add("singer");
      variations.add("vocals");
    }

    // Drum mappings
    if (normalized.includes("drum") || normalized.includes("percussion")) {
      variations.add("drummer");
      variations.add("drums");
      variations.add("percussionist");
    }

    // Bass mappings
    if (normalized.includes("bass")) {
      variations.add("bassist");
      variations.add("bass_guitar");
      variations.add("bass_player");
    }
  });

  return Array.from(variations);
};

// Check if skills are equivalent
const areSkillsEquivalent = (
  userSkill: string,
  requiredSkill: string,
): boolean => {
  // Direct match
  if (userSkill === requiredSkill) return true;

  // Check for inclusion
  if (userSkill.includes(requiredSkill) || requiredSkill.includes(userSkill)) {
    return true;
  }

  // Check synonyms
  const userSynonyms = getSkillSynonyms(userSkill);
  const requiredSynonyms = getSkillSynonyms(requiredSkill);

  return userSynonyms.some(
    (syn) =>
      requiredSynonyms.includes(syn) ||
      syn.includes(requiredSkill) ||
      requiredSkill.includes(syn),
  );
};

// Enhanced skill synonyms
const getSkillSynonyms = (skill: string): string[] => {
  const synonymsMap: Record<string, string[]> = {
    // Piano/Keyboard
    piano: ["keyboard", "keyboardist", "pianist", "keys", "keyboard_player"],
    keyboard: ["piano", "pianist", "keys", "keyboardist", "keyboard_player"],
    pianist: ["keyboardist", "piano_player", "keys_player"],
    keyboardist: ["pianist", "keyboard_player", "piano_player"],

    // Guitar
    guitar: [
      "guitarist",
      "guitar_player",
      "string_instrument",
      "acoustic_guitar",
      "electric_guitar",
    ],
    guitarist: ["guitar_player", "guitar", "string_player"],

    // Vocals
    vocalist: [
      "singer",
      "vocals",
      "voice",
      "lead_vocalist",
      "backing_vocalist",
    ],
    singer: ["vocalist", "vocals", "voice"],

    // Drums
    drums: ["drummer", "percussion", "drum_set", "percussionist"],
    drummer: ["percussionist", "drum_player"],

    // Bass
    bass: ["bassist", "bass_guitar", "bass_player", "electric_bass"],
    bassist: ["bass_player", "bass_guitarist"],

    // MC
    mc: ["emcee", "host", "presenter", "master_of_ceremonies", "announcer"],
    emcee: ["mc", "host", "presenter"],

    // DJ
    dj: ["disc_jockey", "turntable", "mixer", "selector", "deejay"],

    // Saxophone
    saxophone: ["sax", "saxophonist", "sax_player"],
    sax: ["saxophone", "saxophonist"],

    // Violin
    violin: ["violinist", "fiddle", "string_player"],
    violinist: ["violin_player", "fiddler"],
  };

  return synonymsMap[skill] || [];
};

export const getAvailableRolesForUser = (
  user: User,
  bandRoles: BandRole[],
): BandRole[] => {
  return bandRoles.filter(
    (role) =>
      role.filledSlots < role.maxSlots && isUserQualifiedForRole(user, role),
  );
};
