export const instruments = () => {
  const mydata = [
    {
      id: 0,
      val: "Select Instrument",
      name: "Select Instrument",
    },
    {
      id: 1,
      val: "Piano",
      name: "piano",
    },
    {
      id: 2,
      val: "Guitar",
      name: "guitar",
    },
    {
      id: 3,
      val: "Bass",
      name: "bass",
    },
    {
      id: 4,
      val: "Saxophone",
      name: "saxophone",
    },
    {
      id: 5,
      val: "Trumpet",
      name: "trumpet",
    },
    {
      id: 6,
      val: "Trombone",
      name: "trombone",
    },
    {
      id: 7,
      val: "Drums",
      name: "drums",
    },
    {
      id: 8,
      val: "Ukulele",
      name: "ukulele",
    },
    {
      id: 9,
      val: "Violin",
      name: "violin",
    },
    {
      id: 10,
      val: "Cello",
      name: "cello",
    },
    {
      id: 11,
      val: "Vocalist",
      name: "vocalist",
    },
  ];
  return mydata;
};

export const experiences = () => {
  const mydata = [
    {
      id: 0,
      val: "Choose Experience",
      name: "Choose Experience",
    },
    {
      id: 1,
      val: "No Experience",
      name: "noexp",
    },
    {
      id: 2,
      val: "1yrs",
      name: "one-year",
    },
    {
      id: 3,
      val: "2-5yrs",
      name: "two-to-five-years",
    },
    {
      id: 4,
      val: "5-10yrs",
      name: "five-to-10 yrs",
    },
    {
      id: 5,
      val: "more than 10",
      name: "more-than-10yrs",
    },
  ];
  return mydata;
};

export const days = () => {
  const mydata = [
    {
      id: 0 + "noday",
      val: "",
      name: "No Day",
    },
    {
      id: 0,
      val: "Monday",
      name: "Monday",
    },
    {
      id: 1,
      val: "Tuesday",
      name: "Tuesday",
    },
    {
      id: 2,
      val: "wednesday",
      name: "Wednesday",
    },
    {
      id: 3,
      val: "Thursday",
      name: "Thursday",
    },
    {
      id: 4,
      val: "Friday",
      name: "Friday",
    },
    {
      id: 5,
      val: "Saturday",
      name: "Saturday",
    },
    {
      id: 6,
      val: "Sunday",
      name: "Sunday",
    },
  ];
  return mydata;
};

export const WORD_LIST = [
  "REACT",
  "DEVELOP",
  "COMPONENT",
  "HOOK",
  "STATE",
  "PROPS",
  "CONTEXT",
  "EFFECT",
  "MEMO",
  "REF",
  "ROUTER",
  "ANIMATION",
  "FRAMER",
  "MOTION",
  "TYPESCRIPT",
  "JAVASCRIPT",
];

// hooks/themeColors.ts
// hooks/themeColors.ts
export const colors = (isDarkMode: boolean) => ({
  // Background colors
  background: isDarkMode ? "bg-gray-900" : "bg-white",
  backgroundMuted: isDarkMode ? "bg-gray-800" : "bg-gray-50",

  // Text colors
  text: isDarkMode ? "text-gray-100" : "text-gray-900",
  textMuted: isDarkMode ? "text-gray-400" : "text-gray-600",
  textInverted: isDarkMode ? "text-gray-900" : "text-white",

  // Primary colors
  primary: isDarkMode ? "text-orange-400" : "text-orange-600",
  primaryBg: isDarkMode ? "bg-orange-400" : "bg-orange-600",
  primaryBgHover: isDarkMode ? "hover:bg-orange-300" : "hover:bg-orange-700",

  // Border colors
  border: isDarkMode ? "border-gray-700" : "border-gray-200",
  borderMuted: isDarkMode ? "border-gray-600" : "border-gray-300",

  // Interactive states
  hoverBg: isDarkMode ? "hover:bg-gray-800" : "hover:bg-gray-100",
  activeBg: isDarkMode ? "bg-gray-800" : "bg-gray-100",

  // Specific component colors
  navBackground: isDarkMode ? "bg-gray-900" : "bg-white",
  navBorder: isDarkMode ? "border-gray-700" : "border-gray-200",
  navText: isDarkMode ? "text-gray-100" : "text-gray-900",
  navHover: isDarkMode ? "hover:bg-gray-800" : "hover:bg-gray-50",

  // Card colors
  card: isDarkMode ? "bg-gray-800" : "bg-white",
  cardBorder: isDarkMode ? "border-gray-700" : "border-gray-200",

  // Destructive colors
  destructive: isDarkMode ? "text-red-400" : "text-red-600",
  destructiveBg: isDarkMode ? "bg-red-900/20" : "bg-red-50",
  destructiveHover: isDarkMode ? "hover:bg-red-900/30" : "hover:bg-red-100",

  // Warning colors
  warning: isDarkMode
    ? "bg-amber-900/20 border-amber-800 text-amber-200 hover:bg-amber-900/30"
    : "bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100",
  warningText: isDarkMode ? "text-amber-400" : "text-amber-600",
  warningBg: isDarkMode ? "bg-amber-900/20" : "bg-amber-50",
  warningBorder: isDarkMode ? "border-amber-800" : "border-amber-200",
  warningHover: isDarkMode ? "hover:bg-amber-900/30" : "hover:bg-amber-100",

  // Success colors
  successText: isDarkMode ? "text-green-400" : "text-green-600",
  successBg: isDarkMode ? "bg-green-900/20" : "bg-green-50",
  successBorder: isDarkMode ? "border-green-700" : "border-green-200",

  // Secondary background
  secondaryBackground: isDarkMode ? "bg-gray-800" : "bg-gray-100",

  // Hover background
  hoverBackground: isDarkMode ? "bg-gray-700" : "bg-gray-200",

  // Additional background variants
  backgroundSecondary: isDarkMode ? "bg-gray-800" : "bg-gray-50",

  // Additional text variants
  textSecondary: isDarkMode ? "text-gray-300" : "text-gray-700",

  // Additional border variants
  borderSecondary: isDarkMode ? "border-gray-600" : "border-gray-300",

  // Additional state colors
  focusBg: isDarkMode ? "focus:bg-gray-800" : "focus:bg-gray-100",
  focusBorder: isDarkMode ? "focus:border-gray-600" : "focus:border-gray-400",

  // Additional semantic colors
  infoText: isDarkMode ? "text-blue-400" : "text-blue-600",
  infoBg: isDarkMode ? "bg-blue-900/20" : "bg-blue-50",
  infoBorder: isDarkMode ? "border-blue-700" : "border-blue-200",

  // Gradient backgrounds
  gradientPrimary: isDarkMode
    ? "bg-gradient-to-r from-orange-500 to-red-500"
    : "bg-gradient-to-r from-orange-400 to-red-400",
  gradientSecondary: isDarkMode
    ? "bg-gradient-to-br from-gray-900 via-gray-800 to-black"
    : "bg-gradient-to-br from-gray-50 via-white to-gray-100",

  // Shadow colors
  shadow: isDarkMode ? "shadow-gray-900/50" : "shadow-gray-400/20",

  // Overlay colors
  overlay: isDarkMode ? "bg-black/50" : "bg-white/50",

  // Disabled states
  disabledText: isDarkMode ? "text-gray-500" : "text-gray-400",
  disabledBg: isDarkMode ? "bg-gray-700" : "bg-gray-200",
  disabledBorder: isDarkMode ? "border-gray-600" : "border-gray-300",

  danger: isDarkMode
    ? "bg-red-900/20 border-red-800 text-red-200 hover:bg-red-900/30"
    : "bg-red-50 border-red-200 text-red-800 hover:bg-red-100",

  skeleton: isDarkMode ? "border-gray-600/30" : "border-gray-300",

  // Additional primary color variants
  primaryBorder: isDarkMode ? "border-orange-400" : "border-orange-600",
  primaryHover: isDarkMode ? "hover:text-orange-300" : "hover:text-orange-700",
  primaryFocus: isDarkMode ? "focus:ring-orange-400" : "focus:ring-orange-600",

  // Additional inverted variants
  bgInverted: isDarkMode ? "bg-white" : "bg-gray-900",
  borderInverted: isDarkMode ? "border-white" : "border-gray-900",

  // Additional utility colors
  accent: isDarkMode ? "text-purple-400" : "text-purple-600",
  accentBg: isDarkMode ? "bg-purple-400" : "bg-purple-600",
  accentHover: isDarkMode ? "hover:bg-purple-300" : "hover:bg-purple-700",
});
