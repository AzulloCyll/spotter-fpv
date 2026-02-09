import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { StatBox } from '../molecules/StatBox';
import { Icon } from '../atoms/Icon';
import { MOCK_WEATHER_DATA } from '../../constants/mockData';

export const WeatherSummary: React.FC = () => {
    const { theme, isDark } = useTheme();
    const weather = MOCK_WEATHER_DATA;
    const iconColor = isDark ? 'rgba(255,255,255,0.8)' : theme.colors.textSecondary;
    const textColor = isDark ? '#FFFFFF' : theme.colors.primary;

    return (
        <View style={styles.container}>
            <StatBox
                icon={<Icon name="Wind" color={iconColor} size={40} strokeWidth={1.2} />}
                color={textColor}
                value={weather.windSpeed.toString()}
                unit="km/h"
                label="Wiatr"
                dark={isDark}
            />
            <StatBox
                icon={<Icon name="Droplets" color={iconColor} size={40} strokeWidth={1.2} />}
                color={textColor}
                value={weather.precipitation.toString()}
                unit="%"
                label="Opady"
                dark={isDark}
            />
            <StatBox
                icon={<Icon name="Zap" color={iconColor} size={40} strokeWidth={1.2} />}
                color={textColor}
                value={weather.kpIndex.toString()}
                unit="Kp"
                label="Kp-Index"
                dark={isDark}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        marginBottom: 50,
        marginTop: 0,
    },
});
