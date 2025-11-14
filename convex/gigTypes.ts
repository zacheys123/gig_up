// convex/controllers/gigTypes.ts - FIXED VERSION

// Main gig types definition
export const GIG_TYPES = [
  { value: "wedding", label: "💒 Wedding" },
  { value: "corporate", label: "🏢 Corporate Event" },
  { value: "private-party", label: "🎉 Private Party" },
  { value: "concert", label: "🎤 Concert/Show" },
  { value: "restaurant", label: "🍽️ Restaurant/Lounge" },
  { value: "church", label: "⛪ Church Service" },
  { value: "festival", label: "🎪 Festival" },
  { value: "club", label: "🎭 Club Night" },
  { value: "recording", label: "🎹 Recording Session" },
  { value: "music-lessons", label: "🎵 Music Lessons" },
  { value: "individual", label: "✨ Individual" },
  { value: "other", label: "✨ Other" },
];

// Type definitions
export type GigType =
  | "wedding"
  | "corporate"
  | "private-party"
  | "concert"
  | "restaurant"
  | "church"
  | "festival"
  | "club"
  | "recording"
  | "music-lessons"
  | "individual"
  | "other";

export interface GigTypeWithLabel {
  value: GigType;
  label: string;
}

// Type assertion to ensure our array matches the type
export const GIG_TYPES_ARRAY: GigTypeWithLabel[] =
  GIG_TYPES as GigTypeWithLabel[];

// Gig type to category mapping for the new rate structure
export const GIG_TYPE_CATEGORY_MAPPING: Record<GigType, string> = {
  wedding: "wedding",
  corporate: "corporate",
  "private-party": "private-party",
  concert: "concert",
  restaurant: "restaurant",
  church: "church",
  festival: "festival",
  club: "club",
  recording: "recording",
  "music-lessons": "music-lessons",
  individual: "individual",
  other: "other",
};

// Instrument compatibility matrix
export const INSTRUMENT_COMPATIBILITY: Record<
  GigType,
  Record<string, number>
> = {
  wedding: {
    violin: 100,
    piano: 95,
    vocalist: 90,
    guitar: 85,
    saxophone: 80,
    cello: 85,
    harp: 90,
    flute: 80,
    trumpet: 75,
    dj: 60,
  },
  corporate: {
    piano: 95,
    dj: 90,
    mc: 85,
    saxophone: 80,
    violin: 75,
    guitar: 70,
    vocalist: 75,
    bass: 65,
    drums: 60,
  },
  concert: {
    guitar: 100,
    drums: 95,
    bass: 90,
    vocalist: 85,
    piano: 80,
    saxophone: 75,
    violin: 70,
    keyboard: 85,
    dj: 50,
  },
  "private-party": {
    dj: 95,
    mc: 90,
    guitar: 85,
    vocalist: 80,
    saxophone: 75,
    piano: 80,
    drums: 85,
    bass: 80,
  },
  restaurant: {
    piano: 95,
    guitar: 90,
    violin: 85,
    saxophone: 80,
    vocalist: 75,
    cello: 80,
    flute: 75,
  },
  church: {
    piano: 95,
    violin: 90,
    vocalist: 85,
    organ: 95,
    guitar: 80,
    cello: 85,
    trumpet: 75,
  },
  festival: {
    dj: 95,
    guitar: 90,
    drums: 85,
    bass: 85,
    vocalist: 80,
    saxophone: 75,
    mc: 90,
  },
  club: {
    dj: 100,
    mc: 95,
    saxophone: 80,
    guitar: 75,
    drums: 70,
    bass: 70,
    vocalist: 75,
  },
  recording: {
    guitar: 95,
    piano: 90,
    bass: 90,
    drums: 85,
    violin: 80,
    vocalist: 85,
    saxophone: 75,
  },
  "music-lessons": {
    guitar: 100,
    piano: 100,
    violin: 100,
    vocalist: 100,
    drums: 100,
    bass: 100,
    saxophone: 100,
    trumpet: 100,
    flute: 100,
    cello: 100,
    music: 100,
  },
  individual: {
    guitar: 90,
    piano: 85,
    violin: 80,
    vocalist: 85,
    saxophone: 75,
  },
  other: {
    guitar: 80,
    piano: 80,
    violin: 75,
    vocalist: 75,
    dj: 70,
  },
};

export const OPTIMAL_INSTRUMENTS: Record<GigType, string[]> = {
  wedding: [
    "violin",
    "piano",
    "vocalist",
    "guitar",
    "harp",
    "cello",
    "string quartet",
    "organ",
    "flute",
    "trumpet",
    "choir",
  ],
  corporate: [
    "piano",
    "dj",
    "mc",
    "saxophone",
    "jazz trio",
    "guitar",
    "violin",
    "keyboard",
    "background music",
    "string quartet",
  ],
  concert: [
    "guitar",
    "drums",
    "bass",
    "vocalist",
    "keyboard",
    "piano",
    "saxophone",
    "trumpet",
    "violin",
    "backing vocals",
    "band",
  ],
  "private-party": [
    "dj",
    "mc",
    "guitar",
    "vocalist",
    "saxophone",
    "bass",
    "drums",
    "keyboard",
    "piano",
    "band",
    "entertainer",
  ],
  restaurant: [
    "piano",
    "guitar",
    "violin",
    "saxophone",
    "cello",
    "flute",
    "jazz trio",
    "keyboard",
    "harp",
    "background music",
  ],
  church: [
    "piano",
    "violin",
    "vocalist",
    "organ",
    "cello",
    "choir",
    "trumpet",
    "flute",
    "harp",
    "guitar",
  ],
  festival: [
    "dj",
    "guitar",
    "drums",
    "bass",
    "mc",
    "vocalist",
    "keyboard",
    "saxophone",
    "trumpet",
    "band",
    "backing vocals",
  ],
  club: [
    "dj",
    "mc",
    "saxophone",
    "trumpet",
    "bass",
    "drums",
    "keyboard",
    "vocalist",
    "guitar",
    "electronic",
  ],
  recording: [
    "guitar",
    "piano",
    "bass",
    "drums",
    "violin",
    "cello",
    "vocalist",
    "saxophone",
    "trumpet",
    "keyboard",
    "session musician",
  ],
  "music-lessons": [
    "guitar",
    "piano",
    "violin",
    "vocalist",
    "drums",
    "bass",
    "saxophone",
    "trumpet",
    "flute",
    "cello",
    "music",
    "theory",
    "composition",
    "keyboard",
    "ukulele",
  ],
  individual: [
    "guitar",
    "piano",
    "violin",
    "vocalist",
    "saxophone",
    "keyboard",
  ],
  other: ["guitar", "piano", "violin", "vocalist", "keyboard", "dj"],
};

export const INCOMPATIBLE_ROLE_COMBINATIONS: Record<GigType, string[]> = {
  wedding: ["dj", "electronic"],
  corporate: ["dj"],
  church: ["dj", "mc", "electronic"],
  restaurant: ["dj", "mc"],
  club: ["mc"],
  festival: [],
  concert: [],
  "private-party": [],
  recording: ["mc", "dj"],
  "music-lessons": [],
  individual: [],
  other: [],
};

export const ROLE_COMPATIBILITY: Record<string, Record<GigType, number>> = {
  dj: {
    wedding: 30,
    corporate: 70,
    "private-party": 90,
    concert: 50,
    restaurant: 20,
    church: 10,
    festival: 95,
    club: 100,
    recording: 60,
    "music-lessons": 5,
    individual: 40,
    other: 50,
  },
  mc: {
    wedding: 40,
    corporate: 75,
    "private-party": 85,
    concert: 60,
    restaurant: 25,
    church: 15,
    festival: 90,
    club: 100,
    recording: 30,
    "music-lessons": 5,
    individual: 50,
    other: 60,
  },
  vocalist: {
    wedding: 95,
    corporate: 75,
    "private-party": 85,
    concert: 90,
    restaurant: 80,
    church: 85,
    festival: 80,
    club: 70,
    recording: 85,
    "music-lessons": 90,
    individual: 85,
    other: 75,
  },
  instrumentalist: {
    wedding: 80,
    corporate: 75,
    "private-party": 80,
    concert: 90,
    restaurant: 80,
    church: 85,
    festival: 85,
    club: 70,
    recording: 90,
    "music-lessons": 95,
    individual: 80,
    other: 80,
  },
  teacher: {
    wedding: 10,
    corporate: 20,
    "private-party": 15,
    concert: 30,
    restaurant: 10,
    church: 20,
    festival: 25,
    club: 5,
    recording: 40,
    "music-lessons": 100,
    individual: 90,
    other: 50,
  },
};

// Utility functions with proper type safety
export const getGigTypeLabel = (gigType: GigType): string => {
  const gig = GIG_TYPES_ARRAY.find((g) => g.value === gigType);
  return gig?.label || "✨ Other";
};

export const isValidGigType = (gigType: string): gigType is GigType => {
  return GIG_TYPES_ARRAY.some((g) => g.value === gigType);
};

export const getGigTypeByValue = (
  value: string
): GigTypeWithLabel | undefined => {
  return GIG_TYPES_ARRAY.find((g) => g.value === value);
};

export const getGigTypesForRole = (role: string): GigTypeWithLabel[] => {
  const roleScores = ROLE_COMPATIBILITY[role.toLowerCase()];
  if (!roleScores) return GIG_TYPES_ARRAY;

  return GIG_TYPES_ARRAY.filter((gigType) => {
    const score = roleScores[gigType.value];
    return score !== undefined && score >= 50;
  }).sort((a, b) => {
    const scoreA = roleScores[a.value] || 0;
    const scoreB = roleScores[b.value] || 0;
    return scoreB - scoreA;
  });
};

export const getCategoryForGigType = (gigType: GigType): string => {
  return GIG_TYPE_CATEGORY_MAPPING[gigType] || "other";
};

export const getInstrumentCompatibility = (
  gigType: GigType,
  instrument: string
): number => {
  const compatibility = INSTRUMENT_COMPATIBILITY[gigType];
  if (!compatibility) return 50;

  return compatibility[instrument.toLowerCase()] || 50;
};

export const isInstrumentOptimalForGigType = (
  gigType: GigType,
  instrument: string
): boolean => {
  const instruments = OPTIMAL_INSTRUMENTS[gigType] || [];
  return instruments.includes(instrument.toLowerCase());
};

export const isRoleCompatibleWithGigType = (
  role: string,
  gigType: GigType
): boolean => {
  const incompatibleRoles = INCOMPATIBLE_ROLE_COMBINATIONS[gigType] || [];
  return !incompatibleRoles.includes(role.toLowerCase());
};

// Export all gig type values as an array for easy iteration
export const GIG_TYPE_VALUES: GigType[] = GIG_TYPES_ARRAY.map((g) => g.value);
