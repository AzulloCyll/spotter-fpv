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
    green: string;
    border: string;
    iconBg: string;
    white: string;
    black: string;
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
    card: any;
  };
}

export const lightTheme: Theme = {
  colors: {
    primary: "#002887",
    secondary: "#ffffff",
    background: "#FFFFFF",
    surface: "#ffffff",
    text: "#002887",
    textSecondary: "#5084C4",
    accent: "#0284C7",
    error: "#E11D48",
    success: "#0284C7",
    warning: "#F59E0B",
    green: "#22C55E",
    border: "#dde9f5ff",
    iconBg: "#73b9ff",
    white: "#FFFFFF",
    black: "#000000",
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
    card: {
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.22,
      shadowRadius: 2.22,
      elevation: 3,
    },
  },
};

export const darkTheme: Theme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    primary: "#563df3",
    secondary: "#0F172A",
    background: "#0F172A",
    surface: "#1E293B",
    text: "#F8FAFC",
    textSecondary: "#CBD5E1", // Jaśniejszy tekst pomocniczy
    border: "#334155",
    iconBg: "#1E293B",
    white: "#FFFFFF",
    black: "#000000",
  },
};

export const theme = lightTheme;
