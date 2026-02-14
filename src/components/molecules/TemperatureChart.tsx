import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Typography } from '../atoms/Typography';
import { Icon } from '../atoms/Icon';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';

interface TemperatureEntry {
    time: string;
    temp: number;
    feelsLike: number;
}

interface TemperatureChartProps {
    forecast: TemperatureEntry[];
}

export const TemperatureChart: React.FC<TemperatureChartProps> = ({ forecast }) => {
    const { theme } = useTheme();
    const chartHeight = 80;
    const [chartWidth, setChartWidth] = useState(0);

    // Dynamic scaling with buffer so lines don't touch header
    const temps = forecast.flatMap(f => [f.temp, f.feelsLike]);
    const rawMin = Math.min(...temps);
    const rawMax = Math.max(...temps);
    const minVal = Math.floor(rawMin) - 1;
    const maxVal = Math.ceil(rawMax) + 2;
    const range = Math.max(maxVal - minVal, 5);

    // Grid
    const gridSteps = 3;
    const gridStepValue = range / gridSteps;
    const gridLevels = Array.from({ length: gridSteps + 1 }, (_, i) => minVal + i * gridStepValue);

    const generatePath = (key: 'temp' | 'feelsLike') => {
        if (forecast.length < 2 || chartWidth === 0) return '';
        // Inset so the line starts/ends at center of first/last label column
        const colPad = chartWidth / (forecast.length * 2);
        const drawWidth = chartWidth - 2 * colPad;
        const points = forecast.map((item, i) => {
            const x = colPad + (i / (forecast.length - 1)) * drawWidth;
            const val = key === 'temp' ? item.temp : item.feelsLike;
            const y = chartHeight - ((val - minVal) / range) * chartHeight;
            return `${x},${y}`;
        });
        return `M ${points.join(' L ')}`;
    };

    const tempPath = generatePath('temp');
    const feelsLikePath = generatePath('feelsLike');
    // Close fill path at the edges of the drawn area (colPad inset)
    const colPad = chartWidth > 0 ? chartWidth / (forecast.length * 2) : 0;
    const drawWidth = chartWidth - 2 * colPad;
    const fillPath = chartWidth > 0 ? `${tempPath} L ${colPad + drawWidth},${chartHeight} L ${colPad},${chartHeight} Z` : '';

    return (
        <View style={styles.container}>
            {/* Header - styled like other charts */}
            <View style={[styles.chartHeader, {
                borderBottomColor: theme.colors.border,
                backgroundColor: theme.colors.primary + '15',
                marginBottom: 12,
                paddingHorizontal: 20,
                paddingTop: 8,
                paddingBottom: 8,
                paddingRight: 25,
            }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Icon name="Thermometer" size={18} color={theme.colors.primary} />
                    <Typography variant="h3" style={{ marginLeft: 8 }}>Temperatura</Typography>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                    <Typography variant="label" style={{ fontSize: 10, fontWeight: '800', lineHeight: 12 }}>Temp [°C]</Typography>
                    <Typography variant="caption" color="textSecondary" style={{ fontSize: 11, lineHeight: 12 }}>Odczuwalna [°C]</Typography>
                </View>
            </View>

            {/* Chart Content - column layout like WindChart */}
            <View style={styles.chartContainer}>
                {/* Values Row - styled like WindChart speed/gust */}
                <View style={styles.valuesRow}>
                    {forecast.map((item, index) => (
                        <View key={index} style={styles.valuesColumn}>
                            {/* Temp - styled like wind speed (h3, 13, 800) */}
                            <Typography variant="h3" style={{ fontSize: 13, fontWeight: '800', lineHeight: 16 }}>
                                {item.temp.toFixed(1)}°
                            </Typography>
                            {/* FeelsLike - styled like wind gust (caption, textSecondary, 11) */}
                            <Typography variant="caption" color="textSecondary" style={{ fontSize: 11, lineHeight: 12 }}>
                                {item.feelsLike.toFixed(1)}°
                            </Typography>
                        </View>
                    ))}
                </View>
                {/* Chart area with full-width grid lines */}
                <View style={[styles.chartAreaWrapper, { height: chartHeight }]}>
                    {/* Grid lines - full width like PrecipitationChart */}
                    <View style={StyleSheet.absoluteFill} pointerEvents="none">
                        {gridLevels.map((level) => {
                            const norm = (level - minVal) / range;
                            const bottom = norm * chartHeight;
                            if (bottom < 0 || bottom > chartHeight) return null;
                            return (
                                <View key={level} style={[styles.gridLine, { bottom, borderColor: theme.colors.border }]} />
                            );
                        })}
                    </View>

                    {/* Grid labels - positioned at left like PrecipitationChart */}
                    <View style={StyleSheet.absoluteFill} pointerEvents="none">
                        {gridLevels.map((level) => {
                            const norm = (level - minVal) / range;
                            const bottom = norm * chartHeight;
                            if (bottom < 0 || bottom > chartHeight) return null;
                            return (
                                <View key={level} style={[styles.gridLabelWrapper, { bottom: bottom - 3 }]}>
                                    <Typography variant="caption" style={{ color: theme.colors.textSecondary, fontSize: 10, fontWeight: '500', opacity: 0.5 }}>
                                        {Math.round(level)}°
                                    </Typography>
                                </View>
                            );
                        })}
                    </View>

                    {/* SVG - inside padded area */}
                    <View
                        style={styles.svgArea}
                        onLayout={(e) => setChartWidth(e.nativeEvent.layout.width)}
                    >
                        {chartWidth > 0 && (
                            <Svg height={chartHeight} width={chartWidth} style={StyleSheet.absoluteFill}>
                                <Defs>
                                    <LinearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                                        <Stop offset="0" stopColor={theme.colors.primary} stopOpacity="0.1" />
                                        <Stop offset="1" stopColor={theme.colors.primary} stopOpacity="0" />
                                    </LinearGradient>
                                </Defs>
                                <Path d={fillPath} fill="url(#tempGrad)" />
                                <Path
                                    d={feelsLikePath}
                                    stroke={theme.colors.textSecondary}
                                    strokeWidth={1.5}
                                    fill="none"
                                    strokeDasharray="4, 4"
                                    opacity={0.6}
                                />
                                <Path d={tempPath} stroke={theme.colors.primary} strokeWidth={2} fill="none" />
                            </Svg>
                        )}
                    </View>
                </View>

                {/* Time Row - styled like PrecipitationChart time */}
                <View style={styles.timeRow}>
                    {forecast.map((item, index) => (
                        <View key={index} style={styles.timeColumn}>
                            <Typography variant="label" color="textSecondary" style={{ fontSize: 13, marginTop: 4, fontWeight: '600' }}>
                                {item.time}
                            </Typography>
                        </View>
                    ))}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingTop: 0,
        paddingBottom: 16,
    },
    chartHeader: {
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingBottom: 12,
        borderBottomWidth: 0.5,
    },
    chartContainer: {
        paddingHorizontal: 20,
    },
    valuesRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 2,
    },
    valuesColumn: {
        alignItems: 'center',
        flex: 1,
        height: 35, // Fixed height to align - same as WindChart
        justifyContent: 'flex-end',
    },
    chartAreaWrapper: {
        position: 'relative',
        marginHorizontal: -20, // Extend grid lines to full width (cancel parent padding)
    },
    svgArea: {
        flex: 1,
        marginHorizontal: 20, // Re-add padding for SVG content
    },
    gridLine: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: 1,
        borderStyle: 'dashed',
        borderWidth: 0.5,
    },
    gridLabelWrapper: {
        position: 'absolute',
        left: 10,
    },
    timeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    timeColumn: {
        alignItems: 'center',
        flex: 1,
    },
});
