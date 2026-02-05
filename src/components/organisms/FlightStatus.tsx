import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Typography } from '../atoms/Typography';
import { Card } from '../atoms/Card';
import { Icon } from '../atoms/Icon';
import { Badge } from '../atoms/Badge';
import { MOCK_BATTERY, MOCK_GPS_POSITION, MOCK_IS_LINK_ACTIVE, MOCK_VTX_TEMP, MOCK_WEATHER_DATA } from '../../constants/mockData';

export const FlightStatus: React.FC = () => {
    const { theme } = useTheme();
    const isLinkActive = MOCK_IS_LINK_ACTIVE;
    const battery = MOCK_BATTERY;
    const gps = MOCK_GPS_POSITION;
    const weather = MOCK_WEATHER_DATA;
    const vtxTemp = MOCK_VTX_TEMP;

    const dynamicStyles = getStyles(theme);

    return (
        <View style={dynamicStyles.wrapper}>
            <Card style={dynamicStyles.container}>
                <View style={[dynamicStyles.iconBox, { backgroundColor: isLinkActive ? theme.colors.success + '15' : theme.colors.error + '15' }]}>
                    <Icon name="ShieldCheck" color={isLinkActive ? theme.colors.success : theme.colors.error} size={24} />
                </View>
                <View style={dynamicStyles.content}>
                    <View style={dynamicStyles.topRow}>
                        <Typography variant="h3" style={{ fontSize: 18 }}>
                            {isLinkActive ? "Gotowy do startu" : "Oczekiwanie na link"}
                        </Typography>
                        <Badge
                            label={isLinkActive ? "SYSTEM OK" : "DISARMED"}
                            variant={isLinkActive ? "success" : "error"}
                            pulse={isLinkActive}
                        />
                    </View>
                    <Typography variant="bodySmall" color="textSecondary">
                        GPS: {gps.satellites} sat • Kp: {weather.kpIndex} • VTX: {vtxTemp}°C • {battery.voltage}V
                    </Typography>
                </View>
            </Card>
        </View>
    );
};

const getStyles = (theme: any) => StyleSheet.create({
    wrapper: {
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 18,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.md,
        ...theme.shadows.soft,
        shadowOpacity: 0.06,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: theme.borderRadius.sm,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    content: {
        flex: 1,
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 2,
    },
});
