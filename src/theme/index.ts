export const theme = {
  colors: {
    primary: "#FF4D00", // Vibrant orange - classic FPV vibe
    secondary: "#1A1A1A",
    background: "#0F0F0F",
    surface: "#1E1E1E",
    text: "#FFFFFF",
    textSecondary: "#A0A0A0",
    accent: "#00F0FF", // Cyan accent for "tech/HUD" feel
    glass: "rgba(255, 255, 255, 0.1)",
    error: "#FF3B3B",
    success: "#4CD964",
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 12,
    lg: 20,
    full: 99.9,
  },
} as const;

export type Theme = typeof theme;
