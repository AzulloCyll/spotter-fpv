import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Typography } from '../atoms/Typography';
import { LinearGradient } from 'expo-linear-gradient';

interface KpEntry {
    hour: string;
    value: number;
}

interface KpIndexChartProps {
    forecast: KpEntry[];
}

export const KpIndexChart: React.FC<KpIndexChartProps> = ({ forecast }) => {
    const { theme, isDark } = useTheme();

    const getKpColor = (value: number) => {
        if (value < 4) return theme.colors.green;
        if (value < 5) return theme.colors.warning;
        return theme.colors.error;
    };

    const maxVal = Math.max(...forecast.map(f => f.value), 9); // Kp scale is 0-9
    const chartHeight = 80;

    return (
        <View style={styles.container}>
            <View style={styles.chartHeader}>
                <Typography variant="h3">Aktywność Geomagnetyczna</Typography>
                <Typography variant="caption" color="textSecondary">Prognoza Kp-Index (24h)</Typography>
            </View>

            <View style={styles.chartArea}>
                {forecast.map((item, index) => {
                    const barHeight = (item.value / 9) * chartHeight;
                    const isNow = index === 1; // Mark second item as "Now" for demo

                    return (
                        <View key={item.hour} style={styles.barColumn}>
                            <View style={[styles.barContainer, { height: chartHeight }]}>
                                <View
                                    style={[
                                        styles.bar,
                                        {
                                            height: barHeight,
                                            backgroundColor: getKpColor(item.value),
                                            opacity: isNow ? 1 : 0.6
                                        }
                                    ]}
                                />
                                {isNow && (
                                    <View style={[styles.nowIndicator, { bottom: barHeight + 4 }]}>
                                        <View style={[styles.dot, { backgroundColor: theme.colors.primary }]} />
                                    </View>
                                )}
                            </View>
                            <Typography variant="label" color="textSecondary" style={{ fontSize: 8, marginTop: 8 }}>
                                {item.hour}
                            </Typography>
                        </View>
                    );
                })}
            </View>

            <View style={styles.legend}>
                <View style={styles.legendItem}>
                    <View style={[styles.legendColor, { backgroundColor: theme.colors.green }]} />
                    <Typography variant="caption" color="textSecondary">Bezpiecznie (0-3)</Typography>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendColor, { backgroundColor: theme.colors.warning }]} />
                    <Typography variant="caption" color="textSecondary">Uwaga (4)</Typography>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendColor, { backgroundColor: theme.colors.error }]} />
                    <Typography variant="caption" color="textSecondary">Burza (5+)</Typography>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 10,
    },
    chartHeader: {
        marginBottom: 10,
    },
    chartArea: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        height: 110,
        paddingHorizontal: 10,
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
    },
    nowIndicator: {
        position: 'absolute',
        alignItems: 'center',
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    legend: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
        paddingHorizontal: 10,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    legendColor: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    }
});
