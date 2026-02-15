import React, { useState } from 'react';
import {
    View,
    TextInput,
    StyleSheet,
    type ViewStyle,
    type TextInputProps
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Typography } from './Typography';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
    containerStyle?: ViewStyle;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    icon,
    containerStyle,
    ...props
}) => {
    const { theme } = useTheme();
    const [isFocused, setIsFocused] = useState(false);
    const dynamicStyles = React.useMemo(() => getStyles(theme), [theme]);

    return (
        <View style={[dynamicStyles.container, containerStyle]}>
            {label && (
                <Typography variant="label" color="textSecondary" style={dynamicStyles.label}>
                    {label}
                </Typography>
            )}
            <View style={[
                dynamicStyles.inputContainer,
                isFocused && dynamicStyles.focused,
                error ? dynamicStyles.errorBorder : null
            ]}>
                {icon && <View style={dynamicStyles.iconContainer}>{icon}</View>}
                <TextInput
                    style={dynamicStyles.input}
                    placeholderTextColor={theme.colors.textSecondary}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    {...props}
                />
            </View>
            {error && (
                <Typography variant="caption" style={dynamicStyles.errorText}>
                    {error}
                </Typography>
            )}
        </View>
    );
};

const getStyles = (theme: any) => StyleSheet.create({
    container: {
        marginBottom: 16,
        width: '100%',
    },
    label: {
        marginBottom: 8,
        marginLeft: 4,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.md,
        borderWidth: 1.5,
        borderColor: theme.colors.border,
        paddingHorizontal: 12,
        height: 52,
    },
    focused: {
        borderColor: theme.colors.primary,
        ...theme.shadows.soft,
    },
    errorBorder: {
        borderColor: theme.colors.error,
    },
    iconContainer: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: theme.colors.text,
        height: '100%',
    },
    errorText: {
        color: theme.colors.error,
        marginTop: 4,
        marginLeft: 4,
    }
});
