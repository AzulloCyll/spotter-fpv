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
  const maxAmount = Math.max(...forecast.map((f) => f.amount), 2.0);

  return (
    <View style={styles.container}>
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
          <Icon name="Droplets" size={18} color={theme.colors.primary} />
          <Typography variant="h3" style={{ marginLeft: 8 }}>
            Opady
          </Typography>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Typography variant="label" style={{ fontSize: 10, fontWeight: '800', lineHeight: 12 }}>
            Ilość [mm]
          </Typography>
          <Typography
            variant="caption"
            color="textSecondary"
            style={{ fontSize: 11, lineHeight: 12 }}
          >
            Szansa [%]
          </Typography>
        </View>
      </View>

      <View style={styles.chartWrapper}>
        <View style={styles.gridBackground} pointerEvents="none">
          {[0.5, 1.0, 2.0].map((level) => {
            const bottom = 17 + (level / maxAmount) * chartHeight;
            if (bottom > 135) return null;
            return (
              <View
                key={level}
                style={[styles.gridLine, { bottom, borderColor: theme.colors.border }]}
              />
            );
          })}
        </View>

        <View style={styles.chartArea}>
          {forecast.map((item, index) => {
            const barHeight = (item.amount / maxAmount) * chartHeight;
            const hasProbability = item.probability > 0;
            const hasAmount = item.amount > 0;

            return (
              <View key={index} style={styles.barColumn}>
                <Typography
                  variant="caption"
                  style={{
                    fontSize: 13,
                    fontWeight: '800',
                    color: theme.colors.textSecondary,
                    marginBottom: 12,
                  }}
                >
                  {item.probability}%
                </Typography>

                <View style={[styles.barContainer, { height: chartHeight }]}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: hasAmount ? Math.max(barHeight, 6) : hasProbability ? 4 : 2,
                        backgroundColor: hasAmount
                          ? theme.colors.primary
                          : theme.colors.textSecondary,
                        opacity: hasAmount ? 1.0 : hasProbability ? 0.4 : 0.1,
                      },
                    ]}
                  />
                </View>

                <Typography
                  variant="label"
                  color="textSecondary"
                  style={{ fontSize: 13, marginTop: 4, fontWeight: '600' }}
                >
                  {item.time}
                </Typography>
              </View>
            );
          })}
        </View>

        <View style={styles.gridForeground} pointerEvents="none">
          {[0.5, 1.0, 2.0].map((level) => {
            const bottom = 17 + (level / maxAmount) * chartHeight;
            if (bottom > 135) return null;
            return (
              <View key={level} style={[styles.gridLabelWrapper, { bottom: bottom - 3 }]}>
                <Typography
                  variant="caption"
                  style={{
                    color: theme.colors.textSecondary,
                    fontSize: 10,
                    fontWeight: '500',
                    opacity: 0.5,
                  }}
                >
                  {level === 0.5 ? 'lekki' : level === 1.0 ? 'średni' : 'mocny'}
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
    height: 135,
  },
  chartArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 135,
    paddingHorizontal: 20,
    zIndex: 5,
  },
  gridBackground: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  gridForeground: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
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
  barColumn: {
    alignItems: 'center',
    flex: 1,
  },
  barContainer: {
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: '10%',
    borderRadius: 1,
  },
  amountLabelContainer: {
    width: 50,
    marginBottom: 2,
    alignItems: 'center',
  },
});
