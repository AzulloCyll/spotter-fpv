import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Typography } from '../atoms/Typography';
import { Icon } from '../atoms/Icon';

interface PrecipitationEntry {
    time: string;
    amount: number;
    probability: number;
    type: 'rain' | 'snow' | 'none';
}

interface PrecipitationChartProps {
    forecast: PrecipitationEntry[];
}

export const PrecipitationChart: React.FC<PrecipitationChartProps> = ({ forecast }) => {
    const { theme } = useTheme();
    const chartHeight = 80;
    const maxAmount = Math.max(...forecast.map(f => f.amount), 2.0); // Minimum scale 2.0mm

    return (
        <View style={styles.container}>
            <View style={styles.chartHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Icon name="Droplets" size={18} color={theme.colors.primary} />
                    <Typography variant="h3" style={{ marginLeft: 8 }}>Opady (1.5h)</Typography>
                </View>
                <Typography variant="caption" color="textSecondary">mm / 15 min</Typography>
            </View>

            <View style={styles.chartArea}>
                {forecast.map((item, index) => {
                    const barHeight = (item.amount / maxAmount) * chartHeight;
                    const isRain = item.type === 'rain';

                    // Color based on probability and type
                    const barColor = item.amount > 0
                        ? (isRain ? theme.colors.primary : '#FFFFFF')
                        : theme.colors.border;

                    const opacity = item.amount > 0 ? 0.3 + (item.probability / 140) : 0.1;

                    return (
                        <View key={index} style={styles.barColumn}>
                            <View style={[styles.barContainer, { height: chartHeight }]}>
                                {item.amount > 0 && (
                                    <View style={{ marginBottom: 4 }}>
                                        <Typography variant="caption" style={{ fontSize: 9 }}>
                                            {item.amount.toFixed(1)}
                                        </Typography>
                                    </View>
                                )}
                                <View
                                    style={[
                                        styles.bar,
                                        {
                                            height: Math.max(barHeight, 4), // Min height for visibility
                                            backgroundColor: barColor,
                                            opacity: opacity
                                        }
                                    ]}
                                />
                            </View>
                            <Typography variant="label" color="textSecondary" style={{ fontSize: 13, marginTop: 4, fontWeight: '600' }}>
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
    chartArea: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        height: 90,
        paddingHorizontal: 12,
    },
    barColumn: {
        alignItems: 'center',
        flex: 1,
    },
    barContainer: {
        width: '60%',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    bar: {
        width: '100%',
        borderRadius: 4,
        minHeight: 2,
    },
});
