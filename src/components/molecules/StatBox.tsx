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

    return (
        <View style={[dynamicStyles.container, small ? dynamicStyles.containerSmall : null]}>
            <View style={dynamicStyles.iconContainer}>
                {icon}
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                <Typography
                    variant="h3"
                    style={[{ fontSize: 22, fontWeight: '800' }, small ? { fontSize: 18 } : null]}
                >
                    {value}
                </Typography>
                {unit && (
                    <Typography
                        variant="caption"
                        color="textSecondary"
                        style={{ fontSize: 14, marginLeft: 2, fontWeight: '600' }}
                    >
                        {unit}
                    </Typography>
                )}
            </View>
            <Typography
                variant="bodySmall"
                color="textSecondary"
                style={dynamicStyles.label}
            >
                {label}
            </Typography>
        </View>
    );
};

const getStyles = (theme: any) => StyleSheet.create({
    container: {
        backgroundColor: theme.colors.surface,
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.sm + 4,
        borderRadius: theme.borderRadius.md,
        width: '31%',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.border,
        ...theme.shadows.soft,
    },
    containerSmall: {
        paddingVertical: theme.spacing.sm + 4,
        paddingHorizontal: theme.spacing.sm,
    },
    iconContainer: {
        marginBottom: theme.spacing.sm,
    },
    label: {
        marginTop: theme.spacing.xs + 1,
        textAlign: 'center',
        fontSize: 12,
    }
});
