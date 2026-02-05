import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Typography } from '../atoms/Typography';
import { Avatar } from '../atoms/Avatar';
import { Icon } from '../atoms/Icon';
import { useNavigation } from '@react-navigation/native';

export const TopBar: React.FC = () => {
    const navigation = useNavigation<any>();
    const { theme, isDark, toggleTheme } = useTheme();
    const dynamicStyles = getStyles(theme);

    return (
        <View style={dynamicStyles.container}>
            <View style={dynamicStyles.leftSection}>
                <Avatar size={48} />
                <View style={dynamicStyles.greeting}>
                    <Typography variant="caption" color="textSecondary">Witaj z powrotem,</Typography>
                    <Typography variant="h3">Pilot FPV</Typography>
                </View>
            </View>

            <View style={dynamicStyles.rightSection}>
                <TouchableOpacity
                    style={dynamicStyles.iconButton}
                    activeOpacity={0.7}
                    onPress={toggleTheme}
                >
                    <Icon name={isDark ? "Sun" : "Moon"} size={22} color={theme.colors.text} />
                </TouchableOpacity>

                <View style={dynamicStyles.separator} />

                <TouchableOpacity
                    style={dynamicStyles.hudButton}
                    activeOpacity={0.7}
                    onPress={() => navigation.navigate('Telemetria')}
                >
                    <Icon name="Hexagon" size={24} color={theme.colors.accent} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const getStyles = (theme: any) => StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.lg - 4,
        paddingTop: theme.spacing.md - 1,
        paddingBottom: theme.spacing.md - 1,
        backgroundColor: theme.colors.background,
    },
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    greeting: {
        marginLeft: theme.spacing.sm + 4,
    },
    rightSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconButton: {
        padding: theme.spacing.sm,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
        ...theme.shadows.soft,
    },
    hudButton: {
        padding: theme.spacing.sm,
    },
    separator: {
        width: 1,
        height: 20,
        backgroundColor: theme.colors.border,
        marginHorizontal: theme.spacing.sm + 2,
    }
});
