import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { StatBox } from '../molecules/StatBox';
import { Icon } from '../atoms/Icon';
import { MOCK_WEATHER_DATA } from '../../constants/mockData';

export const WeatherSummary: React.FC = () => {
    const { theme } = useTheme();
    const weather = MOCK_WEATHER_DATA;

    return (
        <View style={styles.container}>
            <StatBox
                icon={<Icon name="Wind" color={theme.colors.success} size={28} />}
                value={weather.windSpeed.toString()}
                unit="km/h"
                label="Wiatr"
            />
            <StatBox
                icon={<Icon name="Droplets" color={theme.colors.success} size={28} />}
                value={weather.precipitation.toString()}
                unit="%"
                label="Opady"
            />
            <StatBox
                icon={<Icon name="Zap" color={theme.colors.accent} size={28} />}
                value={weather.kpIndex.toString()}
                unit="Kp"
                label="Kp-Index"
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginBottom: 40,
    },
});
