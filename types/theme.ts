export type StatusBarStyle = "light-content" | "dark-content";

export interface ColorScheme {
  bg: string;
  surface: string;
  text: string;
  textMuted: string;
  border: string;
  primary: string;
  success: string;
  warning: string;
  danger: string;
  shadow: string;
  accent: string;
  textTertiary: string;
  error: string;
  info: string;
  background: string;

  gradients: {
    background: [string, string, string];
    surface: [string, string, string];
    primary: [string, string, string];
    success: [string, string, string];
    warning: [string, string, string];
    danger: [string, string, string];
    muted: [string, string, string];
    empty: [string, string, string];
    premium: [string, string];
    premiumVertical: [string, string];
    glass: [string, string, string];
    sunset: [string, string];
    ocean: [string, string];
    forest: [string, string];
    lavender: [string, string];
    peach: [string, string];
  };
  backgrounds: {
    input: string;
    editInput: string;
    card: string;
    elevated: string;
    modal: string;
  };
  statusBarStyle: StatusBarStyle;
}

export interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  colors: ColorScheme;
}