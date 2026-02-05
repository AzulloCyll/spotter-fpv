import React, { createContext, useContext, useState, ReactNode } from 'react';
import { theme as lightTheme, Theme } from './index';

// Simple dark theme derivation or definition
export const darkTheme: Theme = {
    ...lightTheme,
    colors: {
        ...lightTheme.colors,
        primary: "#3B82F6",
        background: "#0F172A",
        surface: "#1E293B",
        text: "#F8FAFC",
        textSecondary: "#94A3B8",
        border: "#334155",
        iconBg: "#1E293B",
    },
};

type ThemeContextType = {
    theme: Theme;
    isDark: boolean;
    toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isDark, setIsDark] = useState(false);
    const theme = isDark ? darkTheme : lightTheme;

    const toggleTheme = () => setIsDark(!isDark);

    return (
        <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
