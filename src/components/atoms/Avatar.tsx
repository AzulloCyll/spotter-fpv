import React from 'react';
import { View, Image, StyleSheet, type ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

interface AvatarProps {
    source?: string;
    size?: number;
    style?: ViewStyle;
}

export const Avatar: React.FC<AvatarProps> = ({
    source = 'https://i.pravatar.cc/150?u=fpv-pilot',
    size = 50,
    style
}) => {
    const { theme } = useTheme();
    const dynamicStyles = getStyles(theme);

    return (
        <View style={[dynamicStyles.container, { width: size, height: size, borderRadius: size / 2 }, style]}>
            <Image
                source={{ uri: source }}
                style={[dynamicStyles.image, { borderRadius: size / 2 }]}
            />
            <View style={dynamicStyles.onlineBadge} />
        </View>
    );
};

const getStyles = (theme: any) => StyleSheet.create({
    container: {
        // No border, clean look
    },
    image: {
        width: '100%',
        height: '100%',
    },
    onlineBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: theme.colors.green,
        borderWidth: 2,
        borderColor: theme.colors.background,
    }
});
