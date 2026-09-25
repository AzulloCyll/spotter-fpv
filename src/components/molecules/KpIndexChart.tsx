import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Typography } from '../atoms/Typography';
import { Icon } from '../atoms/Icon';

interface KpEntry {
  hour: string;
  value: number;
}

interface KpIndexChartProps {
  /** Okna 3-godzinne NOAA; pierwszy wpis to okno bieżące. */
  forecast: KpEntry[];
}

export const KpIndexChart: React.FC<KpIndexChartProps> = ({ forecast }) => {
  const { theme } = useTheme();

  const getKpColor = (value: number) => {
    if (value < 4) return theme.colors.green;
    if (value < 5) return theme.colors.warning;
    return theme.colors.error;
  };

  const chartHeight = 80;

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.chartHeader,
          {
            borderBottomColor: theme.colors.border,
            backgroundColor: theme.colors.primary + '15',
          },
        ]}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Icon name="Zap" size={18} color={theme.colors.primary} />
          <Typography variant="h3" style={{ marginLeft: 8 }}>
            Indeks Kp
          </Typography>
        </View>
        <Typography variant="caption" color="textSecondary" style={{ fontSize: 11 }}>
          Okna 3 h (NOAA)
        </Typography>
      </View>

      {forecast.length === 0 ? (
        <Typography
          variant="caption"
          color="textSecondary"
          style={{ textAlign: 'center', paddingVertical: 24 }}
        >
          Brak danych o aktywności geomagnetycznej
        </Typography>
      ) : (
        <View style={styles.chartArea}>
          {forecast.map((item, index) => {
            const barHeight = Math.max((item.value / 9) * chartHeight, 2);
            const isNow = index === 0;

            return (
              <View key={`${item.hour}-${index}`} style={styles.barColumn}>
                <Typography
                  variant="caption"
                  style={{
                    fontSize: 13,
                    fontWeight: '800',
                    color: isNow ? theme.colors.text : theme.colors.textSecondary,
                    marginBottom: 6,
                  }}
                >
                  {item.value.toFixed(1)}
                </Typography>
                <View style={[styles.barContainer, { height: chartHeight }]}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: barHeight,
                        backgroundColor: getKpColor(item.value),
                        opacity: isNow ? 1 : 0.6,
                      },
                    ]}
                  />
                </View>
                <Typography
                  variant="label"
                  color={isNow ? 'primary' : 'textSecondary'}
                  style={{ fontSize: 13, marginTop: 4, fontWeight: '600' }}
                >
                  {isNow ? 'Teraz' : item.hour}
                </Typography>
              </View>
            );
          })}
        </View>
      )}

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: theme.colors.green }]} />
          <Typography variant="caption" color="textSecondary">
            Spokojnie (0-3)
          </Typography>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: theme.colors.warning }]} />
          <Typography variant="caption" color="textSecondary">
            Uwaga (4)
          </Typography>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: theme.colors.error }]} />
          <Typography variant="caption" color="textSecondary">
            Burza (5+)
          </Typography>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 16,
  },
  chartHeader: {
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 8,
    paddingRight: 25,
    borderBottomWidth: 0.5,
  },
  chartArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
  },
  barContainer: {
    width: '40%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: '100%',
    borderRadius: 4,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingHorizontal: 20,
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
  },
});
