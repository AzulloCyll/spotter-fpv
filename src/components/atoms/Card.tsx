import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../../theme';

interface CardProps {
    children: React.ReactNode;
    style?: ViewStyle;
    variant?: 'outline' | 'glass';
}

export const Card: React.FC<CardProps> = ({ children, style, variant = 'outline' }) => {
    return (
        <View style={[styles.card, styles[variant], style]}>
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        padding: 15,
        borderRadius: 20,
    },
    outline: {
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: '#333',
    },
    glass: {
        backgroundColor: theme.colors.glass,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    }
});
