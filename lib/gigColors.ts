// Color Palettes organized by theme
export const colorPalettes = {
  // Modern & Vibrant
  vibrant: [
    "#FF6B6B",
    "#4ECDC4",
    "#FFD166",
    "#06D6A0",
    "#118AB2",
    "#EF476F",
    "#073B4C",
    "#FF9E6D",
    "#FFD93D",
    "#6BCF7F",
    "#4D96FF",
    "#845EC2",
  ],

  // Professional & Clean
  professional: [
    "#2D3047",
    "#419D78",
    "#E0A458",
    "#FF9B42",
    "#DB5461",
    "#8DAA9D",
    "#6B818C",
    "#1B2F33",
    "#28536B",
    "#7A6C5D",
    "#C0BDA5",
    "#EFE9E7",
  ],

  // Pastel & Soft
  pastel: [
    "#FFB6C1",
    "#FFDAC1",
    "#E2F0CB",
    "#B5EAD7",
    "#C7CEEA",
    "#FF9AA2",
    "#FFB7B2",
    "#FFDAC1",
    "#E2F0CB",
    "#B5EAD7",
    "#C7CEEA",
    "#F4C2C2",
  ],

  // Dark & Moody
  dark: [
    "#0D1B2A",
    "#1B263B",
    "#415A77",
    "#778DA9",
    "#E0E1DD",
    "#2E294E",
    "#3D348B",
    "#7678ED",
    "#F7B801",
    "#F18701",
    "#F35B04",
    "#4CC9F0",
  ],

  // Earthy & Natural
  earthy: [
    "#8B4513",
    "#A0522D",
    "#D2691E",
    "#CD853F",
    "#BC8F8F",
    "#556B2F",
    "#6B8E23",
    "#BDB76B",
    "#DAA520",
    "#F4A460",
    "#DEB887",
    "#8FBC8F",
  ],

  // Monochrome
  monochrome: [
    "#000000",
    "#1A1A1A",
    "#333333",
    "#4D4D4D",
    "#666666",
    "#808080",
    "#999999",
    "#B3B3B3",
    "#CCCCCC",
    "#E6E6E6",
    "#F2F2F2",
    "#FFFFFF",
  ],
};

// Categorized colors for specific uses
export const colorCategories = {
  // Primary colors (for main actions)
  primary: [
    "#007AFF", // iOS Blue
    "#FF9500", // iOS Orange
    "#4CD964", // iOS Green
    "#5856D6", // iOS Purple
    "#FF2D55", // iOS Pink
    "#5AC8FA", // iOS Sky Blue
  ],

  // Success/Positive colors
  success: [
    "#34C759", // Apple Green
    "#30D158", // iOS Green
    "#32D74B", // Bright Green
    "#64D2FF", // Light Blue
    "#5AC8FA", // iOS Blue
    "#0A84FF", // Deep Blue
  ],

  // Warning/Caution colors
  warning: [
    "#FF9500", // iOS Orange
    "#FF9F0A", // Bright Orange
    "#FFD60A", // Yellow
    "#FFD700", // Gold
    "#FFCC00", // Amber
    "#FFB347", // Light Orange
  ],

  // Danger/Error colors
  danger: [
    "#FF3B30", // iOS Red
    "#FF375F", // Pink Red
    "#FF453A", // Bright Red
    "#FF6B6B", // Coral
    "#FF3838", // Vibrant Red
    "#FF4757", // Modern Red
  ],

  // Background colors
  background: [
    "#F2F2F7", // iOS System Gray 6
    "#FFFFFF", // White
    "#1C1C1E", // Dark Gray
    "#000000", // Black
    "#F8F9FA", // Cultured
    "#E9ECEF", // Anti-flash White
  ],

  // Text colors
  text: [
    "#000000", // Black
    "#FFFFFF", // White
    "#1D1D1F", // Dark Gray
    "#3C3C43", // Medium Gray
    "#8E8E93", // Light Gray
    "#C7C7CC", // Lighter Gray
  ],
};

// All colors in a flat array (backward compatibility)
export const colors = [
  // Primary/Vibrant Colors
  "#007AFF",
  "#FF9500",
  "#4CD964",
  "#5856D6",
  "#FF2D55",
  "#5AC8FA",
  "#FF6B6B",
  "#4ECDC4",
  "#FFD166",
  "#06D6A0",
  "#118AB2",
  "#EF476F",

  // Professional Colors
  "#2D3047",
  "#419D78",
  "#E0A458",
  "#FF9B42",
  "#DB5461",
  "#8DAA9D",

  // Pastel Colors
  "#FFB6C1",
  "#FFDAC1",
  "#E2F0CB",
  "#B5EAD7",
  "#C7CEEA",
  "#FF9AA2",

  // Dark Colors
  "#0D1B2A",
  "#1B263B",
  "#415A77",
  "#778DA9",
  "#E0E1DD",
  "#2E294E",

  // Earthy Colors
  "#8B4513",
  "#A0522D",
  "#D2691E",
  "#CD853F",
  "#BC8F8F",
  "#556B2F",

  // Monochrome Colors
  "#000000",
  "#1A1A1A",
  "#333333",
  "#4D4D4D",
  "#666666",
  "#FFFFFF",
];

// Font families with better categorization
export const fontCategories = {
  modern: [
    "Inter",
    "SF Pro Display",
    "Roboto",
    "Open Sans",
    "Montserrat",
    "Poppins",
    "Manrope",
    "Outfit",
    "Work Sans",
    "Urbanist",
  ],

  classic: [
    "Georgia",
    "Times New Roman",
    "Palatino",
    "Garamond",
    "Baskerville",
    "Didot",
    "Hoefler Text",
    "Bookman",
    "Cambria",
  ],

  elegant: [
    "Playfair Display",
    "Cormorant",
    "EB Garamond",
    "Crimson Text",
    "Lora",
    "Merriweather",
    "Libre Baskerville",
    "Abril Fatface",
  ],

  creative: [
    "Pacifico",
    "Caveat",
    "Dancing Script",
    "Great Vibes",
    "Sacramento",
    "Parisienne",
    "Mr De Haviland",
    "Alex Brush",
  ],

  monospace: [
    "SF Mono",
    "Roboto Mono",
    "JetBrains Mono",
    "Fira Code",
    "Cascadia Code",
    "Source Code Pro",
    "Monaco",
    "Consolas",
  ],

  display: [
    "Bebas Neue",
    "Anton",
    "Oswald",
    "Raleway",
    "Kanit",
    "Titillium Web",
    "Alfa Slab One",
    "Righteous",
  ],
};

// All fonts in a flat array (backward compatibility)
export const fonts = [
  // Modern
  "Inter",
  "SF Pro Display",
  "Roboto",
  "Open Sans",
  "Montserrat",
  "Poppins",

  // Classic
  "Georgia",
  "Times New Roman",
  "Palatino",
  "Garamond",

  // Elegant
  "Playfair Display",
  "Cormorant",
  "EB Garamond",

  // Creative
  "Pacifico",
  "Caveat",
  "Dancing Script",

  // Monospace
  "SF Mono",
  "Roboto Mono",
  "Fira Code",

  // Display
  "Bebas Neue",
  "Oswald",
  "Raleway",
];

// Helper functions
export const getContrastColor = (hexColor: string): string => {
  // Remove the # if present
  const hex = hexColor.replace("#", "");

  // Convert to RGB
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Return black or white based on luminance
  return luminance > 0.5 ? "#000000" : "#FFFFFF";
};

export const getColorCategory = (color: string): string => {
  const hex = color.replace("#", "").toLowerCase();

  // Check vibrant colors
  const vibrant = [
    "ff6b6b",
    "4ecdc4",
    "ffd166",
    "06d6a0",
    "118ab2",
    "ef476f",
    "007aff",
    "ff9500",
    "4cd964",
    "5856d6",
    "ff2d55",
    "5ac8fa",
  ];

  // Check pastel colors
  const pastel = ["ffb6c1", "ffdac1", "e2f0cb", "b5ead7", "c7ceea", "ff9aa2"];

  // Check dark colors
  const dark = ["0d1b2a", "1b263b", "415a77", "778da9", "2e294e", "000000"];

  if (vibrant.includes(hex)) return "vibrant";
  if (pastel.includes(hex)) return "pastel";
  if (dark.includes(hex)) return "dark";

  return "professional";
};

export const getFontCategory = (font: string): string => {
  const lowerFont = font.toLowerCase();

  if (fontCategories.modern.some((f) => f.toLowerCase().includes(lowerFont)))
    return "modern";
  if (fontCategories.classic.some((f) => f.toLowerCase().includes(lowerFont)))
    return "classic";
  if (fontCategories.elegant.some((f) => f.toLowerCase().includes(lowerFont)))
    return "elegant";
  if (fontCategories.creative.some((f) => f.toLowerCase().includes(lowerFont)))
    return "creative";
  if (fontCategories.monospace.some((f) => f.toLowerCase().includes(lowerFont)))
    return "monospace";
  if (fontCategories.display.some((f) => f.toLowerCase().includes(lowerFont)))
    return "display";

  return "modern";
};
