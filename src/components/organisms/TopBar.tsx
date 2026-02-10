import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Typography } from '../atoms/Typography';
import { Avatar } from '../atoms/Avatar';
import { Icon } from '../atoms/Icon';
import { useNavigation } from '@react-navigation/native';
import { TelemetryStatus } from '../molecules/TelemetryStatus';

export const TopBar: React.FC = () => {
    const navigation = useNavigation<any>();
    const { theme, isDark, toggleTheme } = useTheme();
    const dynamicStyles = getStyles(theme);
    const textColor = isDark ? '#FFFFFF' : theme.colors.text;
    const secondaryColor = isDark ? 'rgba(255,255,255,0.7)' : theme.colors.textSecondary;

    return (
        <View style={dynamicStyles.container}>
            <View style={dynamicStyles.leftSection}>
                <Avatar size={48} />
                <View style={dynamicStyles.greeting}>
                    <Typography variant="caption" color={isDark ? "white" : "textSecondary"}>Witaj,</Typography>
                    <Typography variant="h3" style={{ color: textColor }}>Pilot FPV</Typography>
                </View>
            </View>

            <View style={dynamicStyles.rightSection}>
                <TelemetryStatus />

                <TouchableOpacity
                    style={dynamicStyles.iconButton}
                    activeOpacity={0.7}
                    onPress={toggleTheme}
                >
                    <Icon name={isDark ? "Sun" : "Moon"} size={24} color={secondaryColor} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={dynamicStyles.hudButton}
                    activeOpacity={0.7}
                    onPress={() => navigation.navigate('Telemetria')}
                >
                    <Icon name="Gauge" size={24} color={secondaryColor} />
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
        paddingHorizontal: theme.spacing.md - 4,
        paddingTop: 15,
        paddingBottom: theme.spacing.md - 1,
        backgroundColor: 'transparent',
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
        marginTop: -10,
    },
    iconButton: {
        padding: theme.spacing.xs,
    },
    hudButton: {
        padding: theme.spacing.xs,
        marginLeft: theme.spacing.md,
    },
});
