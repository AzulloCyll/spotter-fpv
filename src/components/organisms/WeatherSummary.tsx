import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Wind, Droplets, Navigation } from 'lucide-react-native';
import { theme } from '../../theme';
import { StatBox } from '../molecules/StatBox';

export const WeatherSummary: React.FC = () => {
    return (
        <View style={styles.container}>
            <StatBox
                icon={<Wind color={theme.colors.accent} size={24} />}
                value="12 km/h"
                label="Wiatr"
            />
            <StatBox
                icon={<Droplets color={theme.colors.accent} size={24} />}
                value="45%"
                label="Wilgotność"
            />
            <StatBox
                icon={<Navigation color={theme.colors.accent} size={24} />}
                value="5"
                label="Spoty w pobliżu"
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
