import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Typography } from '../atoms/Typography';
import { Icon } from '../atoms/Icon';
import { Badge } from '../atoms/Badge';
import { MOCK_BATTERY, MOCK_GPS_POSITION, MOCK_IS_LINK_ACTIVE, MOCK_VTX_TEMP, MOCK_WEATHER_DATA } from '../../constants/mockData';

export const FlightStatus: React.FC<{ dark?: boolean }> = ({ dark }) => {
    const { theme } = useTheme();
    const isLinkActive = MOCK_IS_LINK_ACTIVE;
    const battery = MOCK_BATTERY;
    const gps = MOCK_GPS_POSITION;
    const weather = MOCK_WEATHER_DATA;
    const vtxTemp = MOCK_VTX_TEMP;

    const textColor = dark ? '#FFFFFF' : theme.colors.text;
    const secondaryColor = dark ? 'rgba(255,255,255,0.7)' : theme.colors.textSecondary;

    const dynamicStyles = getStyles(theme);

    return (
        <View style={dynamicStyles.wrapper}>
            <View style={dynamicStyles.container}>
                <View style={[
                    dynamicStyles.iconBox,
                    {
                        backgroundColor: 'transparent',
                    }
                ]}>
                    <Icon name="Radar" color={isLinkActive ? theme.colors.success : theme.colors.error} size={64} strokeWidth={1.2} />
                </View>

                <Typography variant="h3" style={[dynamicStyles.title, { color: isLinkActive ? theme.colors.success : textColor }]}>
                    {isLinkActive ? "Gotowy do startu" : "Oczekiwanie na link"}
                </Typography>

                <Typography variant="bodySmall" style={[dynamicStyles.telemetry, { color: secondaryColor }]}>
                    GPS: {gps.satellites} • {battery.voltage}V • {vtxTemp}°C • Kp: {weather.kpIndex}
                </Typography>

                <View style={dynamicStyles.bottomRow}>
                    <Badge
                        label={isLinkActive ? "SYSTEM OK" : "DISARMED"}
                        variant={isLinkActive ? "green" : "error"}
                        pulse={isLinkActive}
                    />
                </View>
            </View>
        </View>
    );
};

const getStyles = (theme: any) => StyleSheet.create({
    wrapper: {
        paddingHorizontal: 8,
        marginBottom: 32,
        marginTop: 20,
    },
    container: {
        alignItems: 'center',
        paddingVertical: 16,
    },
    iconBox: {
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    title: {
        fontSize: 22,
        fontWeight: '800',
        marginBottom: 12,
        textAlign: 'center',
    },
    telemetry: {
        fontWeight: '600',
        textAlign: 'center',
        letterSpacing: 0.5,
        marginBottom: 12,
    },
    bottomRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
});
