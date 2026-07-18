import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
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

const COLUMN_WIDTH = 68;
const VALUES_ROW_HEIGHT = 37; // valuesColumn height (35) + marginBottom (2)

export const TemperatureChart: React.FC<TemperatureChartProps> = ({ forecast }) => {
  const { theme } = useTheme();
  const chartHeight = 80;
  const chartWidth = forecast.length * COLUMN_WIDTH;

  // Dynamic scaling with buffer so lines don't touch header
  const temps = forecast.flatMap((f) => [f.temp, f.feelsLike]);
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
    if (forecast.length < 2) return '';
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
  const colPad = chartWidth / (forecast.length * 2);
  const drawWidth = chartWidth - 2 * colPad;
  const fillPath = tempPath
    ? `${tempPath} L ${colPad + drawWidth},${chartHeight} L ${colPad},${chartHeight} Z`
    : '';

  return (
    <View style={styles.container}>
      {/* Header - styled like other charts */}
      <View
        style={[
          styles.chartHeader,
          {
            borderBottomColor: theme.colors.border,
            backgroundColor: theme.colors.primary + '15',
            marginBottom: 12,
            paddingHorizontal: 20,
            paddingTop: 8,
            paddingBottom: 8,
            paddingRight: 25,
          },
        ]}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Icon name="Thermometer" size={18} color={theme.colors.primary} />
          <Typography variant="h3" style={{ marginLeft: 8 }}>
            Temperatura
          </Typography>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Typography variant="label" style={{ fontSize: 10, fontWeight: '800', lineHeight: 12 }}>
            Temp [°C]
          </Typography>
          <Typography
            variant="caption"
            color="textSecondary"
            style={{ fontSize: 11, lineHeight: 12 }}
          >
            Odczuwalna [°C]
          </Typography>
        </View>
      </View>

      {/* Chart wrapper: grid lines/labels stay fixed, only data scrolls (same as PrecipitationChart) */}
      <View style={styles.chartWrapper}>
        <View
          style={[styles.gridOverlay, { top: VALUES_ROW_HEIGHT, height: chartHeight }]}
          pointerEvents="none"
        >
          {gridLevels.map((level) => {
            const norm = (level - minVal) / range;
            const bottom = norm * chartHeight;
            if (bottom < 0 || bottom > chartHeight) return null;
            return (
              <View
                key={level}
                style={[styles.gridLine, { bottom, borderColor: theme.colors.border }]}
              />
            );
          })}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chartContainer}
        >
          <View style={{ width: chartWidth }}>
            {/* Values Row - styled like WindChart speed/gust */}
            <View style={styles.valuesRow}>
              {forecast.map((item, index) => (
                <View key={index} style={[styles.valuesColumn, { width: COLUMN_WIDTH }]}>
                  <Typography
                    variant="h3"
                    style={{ fontSize: 13, fontWeight: '800', lineHeight: 16 }}
                  >
                    {item.temp.toFixed(1)}°
                  </Typography>
                  <Typography
                    variant="caption"
                    color="textSecondary"
                    style={{ fontSize: 11, lineHeight: 12 }}
                  >
                    {item.feelsLike.toFixed(1)}°
                  </Typography>
                </View>
              ))}
            </View>

            {/* Chart area - data only, grid rendered as fixed overlay above */}
            <View style={[styles.chartAreaWrapper, { height: chartHeight }]}>
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
            </View>

            {/* Time Row - styled like PrecipitationChart time */}
            <View style={styles.timeRow}>
              {forecast.map((item, index) => (
                <View key={index} style={[styles.timeColumn, { width: COLUMN_WIDTH }]}>
                  <Typography
                    variant="label"
                    color="textSecondary"
                    style={{ fontSize: 13, marginTop: 4, fontWeight: '600' }}
                  >
                    {item.time}
                  </Typography>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>

        <View
          style={[styles.gridOverlay, { top: VALUES_ROW_HEIGHT, height: chartHeight }]}
          pointerEvents="none"
        >
          {gridLevels.map((level) => {
            const norm = (level - minVal) / range;
            const bottom = norm * chartHeight;
            if (bottom < 0 || bottom > chartHeight) return null;
            return (
              <View
                key={level}
                style={[
                  styles.gridLabelWrapper,
                  { bottom: bottom - 3, backgroundColor: theme.colors.surface },
                ]}
              >
                <Typography
                  variant="caption"
                  style={{
                    color: theme.colors.textSecondary,
                    fontSize: 10,
                    fontWeight: '500',
                    opacity: 0.7,
                  }}
                >
                  {Math.round(level)}°
                </Typography>
              </View>
            );
          })}
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
  chartWrapper: {
    position: 'relative',
  },
  gridOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  chartContainer: {
    paddingHorizontal: 20,
  },
  valuesRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  valuesColumn: {
    alignItems: 'center',
    height: 35, // Fixed height to align - same as WindChart
    justifyContent: 'flex-end',
  },
  chartAreaWrapper: {
    position: 'relative',
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
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  timeRow: {
    flexDirection: 'row',
  },
  timeColumn: {
    alignItems: 'center',
  },
});
