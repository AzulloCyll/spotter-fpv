import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Typography } from '../atoms/Typography';
import { Icon } from '../atoms/Icon';

interface WindEntry {
    time: string;
    speed: number;
    gust: number;
    direction: number;
}

interface WindChartProps {
    forecast: WindEntry[];
}

export const WindChart: React.FC<WindChartProps> = ({ forecast }) => {
    const { theme } = useTheme();

    return (
        <View style={styles.container}>
            <View style={styles.chartHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Icon name="Wind" size={18} color={theme.colors.primary} />
                    <Typography variant="h3" style={{ marginLeft: 8 }}>Wiatr</Typography>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                    <Typography variant="label" style={{ fontSize: 10, fontWeight: '800', lineHeight: 12 }}>Średnia</Typography>
                    <Typography variant="caption" color="textSecondary" style={{ fontSize: 11, lineHeight: 12 }}>Porywy</Typography>
                </View>
            </View>

            <View style={styles.chartContainer}>
                {forecast.map((item, index) => {
                    return (
                        <View key={index} style={styles.column}>

                            {/* Values */}
                            <View style={styles.valuesContainer}>
                                <Typography variant="h3" style={{ fontSize: 13, fontWeight: '800', lineHeight: 16 }}>
                                    {Math.round(item.speed)} km/h
                                </Typography>
                                <Typography variant="caption" color="textSecondary" style={{ fontSize: 11, lineHeight: 12 }}>
                                    {Math.round(item.gust)} km/h
                                </Typography>
                            </View>

                            {/* Direction Arrow */}
                            <View style={styles.directionArea}>
                                <View style={{
                                    transform: [{ rotate: `${item.direction}deg` }],
                                    // backgroundColor: theme.colors.surface,
                                    // borderRadius: 12,
                                    // padding: 4,
                                    // ...theme.shadows.soft
                                }}>
                                    <Icon name="ArrowDown" size={24} color={theme.colors.primary} strokeWidth={1.5} />
                                </View>
                            </View>

                            {/* Time */}
                            <Typography variant="label" color="textSecondary" style={{ fontSize: 13, marginTop: 2, fontWeight: '600' }}>
                                {item.time}
                            </Typography>
                        </View>
                    );
                })}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
    },
    chartHeader: {
        marginBottom: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 12,
    },
    chartContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        paddingBottom: 0
    },
    column: {
        alignItems: 'center',
        flex: 1,
    },
    valuesContainer: {
        alignItems: 'center',
        marginBottom: 2,
        height: 35, // Fixed height to align
        justifyContent: 'flex-end'
    },
    directionArea: {
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 0
    },
});
