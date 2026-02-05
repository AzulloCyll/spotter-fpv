import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, type ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Typography } from './Typography';

interface BadgeProps {
    label: string;
    variant?: 'success' | 'error' | 'warning' | 'info' | 'primary';
    pulse?: boolean;
    style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
    label,
    variant = 'info',
    pulse = false,
    style
}) => {
    const { theme } = useTheme();
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (pulse) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.2,
                        duration: 800,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 800,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        } else {
            pulseAnim.setValue(1);
        }
    }, [pulse]);

    const getColor = () => {
        switch (variant) {
            case 'success': return theme.colors.success;
            case 'error': return theme.colors.error;
            case 'warning': return theme.colors.warning;
            case 'primary': return theme.colors.primary;
            default: return theme.colors.textSecondary;
        }
    };

    const color = getColor();
    const dynamicStyles = getStyles(theme);

    return (
        <View style={[dynamicStyles.container, { backgroundColor: color + '15', borderColor: color + '30' }, style]}>
            {pulse && (
                <Animated.View
                    style={[
                        dynamicStyles.dot,
                        { backgroundColor: color, transform: [{ scale: pulseAnim }] }
                    ]}
                />
            )}
            {!pulse && <View style={[dynamicStyles.dot, { backgroundColor: color }]} />}
            <Typography
                variant="label"
                style={{ color, fontSize: 10, marginBottom: 0 }}
            >
                {label}
            </Typography>
        </View>
    );
};

const getStyles = (theme: any) => StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: theme.borderRadius.full,
        borderWidth: 1,
        alignSelf: 'flex-start',
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 6,
    }
});
