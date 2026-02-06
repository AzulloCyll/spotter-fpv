import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
    View,
    type ViewStyle,
    type TextStyle
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Typography } from './Typography';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    icon?: React.ReactNode;
    loading?: boolean;
    disabled?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
    title,
    onPress,
    variant = 'primary',
    size = 'md',
    icon,
    loading = false,
    disabled = false,
    style,
    textStyle,
}) => {
    const { theme, isDark } = useTheme();
    const isPrimary = variant === 'primary';
    const isDanger = variant === 'danger';
    const dynamicStyles = getStyles(theme, isDark);

    return (
        <TouchableOpacity
            activeOpacity={0.7}
            onPress={onPress}
            disabled={disabled || loading}
            style={[
                dynamicStyles.button,
                dynamicStyles[variant],
                dynamicStyles[size],
                disabled && dynamicStyles.disabled,
                style
            ]}
        >
            {loading ? (
                <ActivityIndicator
                    color={variant === 'outline' || variant === 'ghost' ? theme.colors.primary : '#FFFFFF'}
                />
            ) : (
                <View style={dynamicStyles.content}>
                    {icon && <View style={dynamicStyles.iconContainer}>{icon}</View>}
                    <Typography
                        variant={size === 'sm' ? 'caption' : 'body'}
                        weight="700"
                        style={[
                            dynamicStyles.text,
                            (variant === 'outline' || variant === 'ghost') && { color: theme.colors.primary },
                            variant === 'secondary' && { color: isDark ? "#A5B4FC" : theme.colors.primary },
                            isDanger && { color: '#FFFFFF' },
                            textStyle
                        ]}
                    >
                        {title}
                    </Typography>
                </View>
            )}
        </TouchableOpacity>
    );
};

const getStyles = (theme: any, isDark: boolean) => StyleSheet.create({
    button: {
        borderRadius: theme.borderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',

    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        marginRight: 8,
    },
    text: {
        color: '#FFFFFF',
    },
    primary: {
        backgroundColor: theme.colors.primary,
        ...theme.shadows.soft,
    },
    secondary: {
        backgroundColor: theme.colors.secondary,
        borderWidth: 2,
        borderColor: isDark ? "#A5B4FC" : theme.colors.primary,
    },
    outline: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: theme.colors.primary,
    },
    ghost: {
        backgroundColor: 'transparent',
    },
    danger: {
        backgroundColor: theme.colors.error,
    },
    sm: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: theme.borderRadius.sm,
    },
    md: {
        paddingVertical: 14,
        paddingHorizontal: 24,
    },
    lg: {
        paddingVertical: 18,
        paddingHorizontal: 32,
        borderRadius: theme.borderRadius.lg,
    },
    disabled: {
        opacity: 0.5,
    }
});
