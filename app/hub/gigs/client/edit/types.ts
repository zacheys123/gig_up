// app/types/talent.ts
export interface TalentModalData {
  // MC
  mcType?: string;
  mcLanguages?: string[];
  mcExperience?: string;
  mcStyle?: string;

  // DJ
  djGenre?: string[];
  djEquipment?: string[];
  djExperience?: string;
  djSetup?: string;

  // Vocalist
  vocalistGenre?: string[];
  vocalistRange?: string;
  vocalistType?: string;
  vocalistExperience?: string;
  vocalistStyle?: string;
}

export const talentCategories = {
  mc: {
    types: [
      "Event MC",
      "Wedding MC",
      "Corporate MC",
      "Club MC",
      "Concert MC",
      "Radio MC",
      "TV Host",
      "Sports MC",
      "Award Ceremony MC",
      "Conference Moderator",
      "Custom MC Type",
    ],
    languages: [
      "English",
      "Swahili",
      "French",
      "Spanish",
      "Arabic",
      "German",
      "Portuguese",
      "Chinese",
      "Hindi",
      "Japanese",
      "Korean",
      "Italian",
      "Russian",
      "Local Dialects",
      "Other Language",
    ],
    styles: [
      "Energetic",
      "Professional",
      "Funny",
      "Formal",
      "Casual",
      "Interactive",
      "Bilingual",
      "Multilingual",
      "Other Style",
    ],
  },

  dj: {
    genres: [
      "Hip Hop",
      "R&B",
      "Reggae",
      "Afrobeats",
      "Dancehall",
      "Amapiano",
      "House",
      "Techno",
      "Trance",
      "EDM",
      "Pop",
      "Rock",
      "Jazz",
      "Classical",
      "Gospel",
      "Country",
      "Latin",
      "Electronic",
      "Disco",
      "Funk",
      "Other Genre",
    ],
    equipment: [
      "DJ Controller",
      "Turntables",
      "CDJs",
      "Mixer",
      "PA System",
      "Laptop",
      "Speakers",
      "Lights",
      "Fog Machine",
      "Microphone",
      "Subwoofers",
      "Monitors",
      "Headphones",
      "Other Equipment",
    ],
    setups: [
      "Mobile DJ Setup",
      "Club Setup",
      "Festival Setup",
      "Basic Setup",
      "Premium Setup",
      "Custom Setup",
    ],
  },

  vocalist: {
    genres: [
      "Pop",
      "Rock",
      "Jazz",
      "R&B",
      "Soul",
      "Gospel",
      "Blues",
      "Country",
      "Classical",
      "Musical Theater",
      "Hip Hop",
      "Reggae",
      "Afrobeats",
      "Dancehall",
      "Latin",
      "Folk",
      "Metal",
      "Alternative",
      "Indie",
      "Acoustic",
      "Other Genre",
    ],
    ranges: [
      "Soprano",
      "Mezzo-Soprano",
      "Alto",
      "Countertenor",
      "Tenor",
      "Baritone",
      "Bass",
      "Custom Range",
    ],
    types: [
      "Lead Vocalist",
      "Backup Vocalist",
      "Harmony Vocalist",
      "Background Vocalist",
      "Featured Vocalist",
      "Other Type",
    ],
    styles: [
      "Smooth",
      "Powerful",
      "Soft",
      "Soulful",
      "Operatic",
      "Rock",
      "Jazz",
      "R&B",
      "Gospel",
      "Other Style",
    ],
  },
};

export const experienceLevels = [
  "Beginner (< 1 year)",
  "Intermediate (1-3 years)",
  "Advanced (3-5 years)",
  "Expert (5+ years)",
  "Professional",
  "Custom Experience",
];
