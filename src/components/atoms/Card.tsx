import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

interface CardProps {
    children: React.ReactNode;
    style?: ViewStyle;
    variant?: 'outline' | 'glass' | 'tinted';
}

export const Card: React.FC<CardProps> = ({ children, style, variant = 'outline' }) => {
    const { theme } = useTheme();
    const dynamicStyles = getStyles(theme);

    return (
        <View style={[dynamicStyles.card, dynamicStyles[variant], style]}>
            {children}
        </View>
    );
};

const getStyles = (theme: any) => StyleSheet.create({
    card: {
        padding: 15,
        borderRadius: 24,
    },
    outline: {
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
        shadowColor: theme.shadows.soft.shadowColor,
        shadowOffset: theme.shadows.soft.shadowOffset,
        shadowOpacity: theme.shadows.soft.shadowOpacity,
        shadowRadius: theme.shadows.soft.shadowRadius,
        elevation: theme.shadows.soft.elevation,
    },
    glass: {
        backgroundColor: theme.isDark ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.7)',
        borderWidth: 1,
        borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.3)',
    },
    tinted: {
        backgroundColor: theme.colors.primary + '08',
        borderWidth: 1,
        borderColor: theme.colors.primary + '14',
    }
});
