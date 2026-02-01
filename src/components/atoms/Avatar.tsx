import React from 'react';
import { View, Image, StyleSheet, type ViewStyle } from 'react-native';
import { theme } from '../../theme';

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
    return (
        <View style={[styles.container, { width: size, height: size, borderRadius: size / 2 }, style]}>
            <Image
                source={{ uri: source }}
                style={[styles.image, { borderRadius: size / 2 }]}
            />
            <View style={styles.onlineBadge} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderWidth: 2,
        borderColor: theme.colors.primary,
        padding: 2,
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
        backgroundColor: theme.colors.success,
        borderWidth: 2,
        borderColor: theme.colors.background,
    }
});
