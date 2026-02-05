export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    accent: string;
    error: string;
    success: string;
    warning: string;
    border: string;
    iconBg: string;
  };
  typography: {
    h1: any;
    h2: any;
    h3: any;
    body: any;
    bodySmall: any;
    caption: any;
    label: any;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  borderRadius: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    full: number;
  };
  shadows: {
    soft: any;
    medium: any;
  };
}

export const theme: Theme = {
  colors: {
    primary: "#2563EB",
    secondary: "#fcf8f8ff",
    background: "#F8FAFC",
    surface: "#FFFFFF",
    text: "#002887ff",
    textSecondary: "#818181ff",
    accent: "#059669",
    error: "#E11D48",
    success: "#059669",
    warning: "#F59E0B",
    border: "#F1F5F9",
    iconBg: "#F8FAFC",
  },
  typography: {
    h1: {
      fontSize: 28,
      fontWeight: "800",
      letterSpacing: -0.8,
      lineHeight: 34,
    },
    h2: {
      fontSize: 22,
      fontWeight: "700",
      letterSpacing: -0.5,
      lineHeight: 28,
    },
    h3: {
      fontSize: 18,
      fontWeight: "800",
      letterSpacing: -0.3,
      lineHeight: 24,
    },
    body: {
      fontSize: 15,
      fontWeight: "500",
      lineHeight: 22,
    },
    bodySmall: {
      fontSize: 13,
      fontWeight: "500",
      lineHeight: 18,
    },
    caption: {
      fontSize: 14,
      fontWeight: "500",
      lineHeight: 20,
    },
    label: {
      fontSize: 10,
      fontWeight: "800",
      letterSpacing: 1,
      textTransform: "uppercase",
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    xs: 6,
    sm: 10,
    md: 14,
    lg: 20,
    full: 999,
  },
  shadows: {
    soft: {
      shadowColor: "#1E293B",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.04,
      shadowRadius: 12,
      elevation: 2,
    },
    medium: {
      shadowColor: "#1E293B",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.08,
      shadowRadius: 16,
      elevation: 4,
    },
  },
};
