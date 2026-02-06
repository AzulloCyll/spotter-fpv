import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography } from '../atoms/Typography';
import { useTheme } from '../../theme/ThemeContext';

interface StatBoxProps {
    icon: React.ReactNode;
    value: string;
    unit?: string;
    label: string;
    small?: boolean;
    color?: string;
}

export const StatBox: React.FC<StatBoxProps> = ({ icon, value, unit, label, small, color }) => {
    const { theme } = useTheme();
    const dynamicStyles = getStyles(theme);

    const isColored = !!color;
    const textColor = isColored ? color : theme.colors.text;

    return (
        <View style={[
            dynamicStyles.container,
            small ? dynamicStyles.containerSmall : null
        ]}>
            <View style={dynamicStyles.iconContainer}>
                {icon}
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                <Typography
                    variant="h3"
                    style={[{ fontSize: 24, fontWeight: '800', color: textColor }, small ? { fontSize: 18 } : null]}
                >
                    {value}
                </Typography>
                {unit && (
                    <Typography
                        variant="caption"
                        style={{ fontSize: 14, marginLeft: 2, fontWeight: '600', color: textColor }}
                    >
                        {unit}
                    </Typography>
                )}
            </View>
            <Typography
                variant="bodySmall"
                style={[dynamicStyles.label, { color: theme.colors.textSecondary, marginTop: 2 }]}
            >
                {label}
            </Typography>
        </View>
    );
};

const getStyles = (theme: any) => StyleSheet.create({
    container: {
        width: '31%',
        alignItems: 'center',
        paddingVertical: 10,
    },
    containerSmall: {
        paddingVertical: 8,
        paddingHorizontal: theme.spacing.sm,
    },
    iconContainer: {
        marginBottom: 8,
    },
    label: {
        textAlign: 'center',
        fontSize: 11,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    }
});
