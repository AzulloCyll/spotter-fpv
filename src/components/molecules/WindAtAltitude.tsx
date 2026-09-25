import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Typography } from '../atoms/Typography';
import { Icon } from '../atoms/Icon';

interface WindAtAltitudeProps {
  /** Średni wiatr w km/h; null = brak danych. */
  speed10m: number | null;
  speed80m: number | null;
  speed120m: number | null;
}

const formatSpeed = (v: number | null) => (v === null ? '—' : `${Math.round(v)}`);

/** Średni wiatr (bez porywów) na kilku wysokościach - Open-Meteo nie podaje porywów powyżej 10 m. */
export const WindAtAltitude: React.FC<WindAtAltitudeProps> = ({
  speed10m,
  speed80m,
  speed120m,
}) => {
  const { theme } = useTheme();
  const levels = [
    { label: '120 m', value: speed120m },
    { label: '80 m', value: speed80m },
    { label: '10 m', value: speed10m },
  ];

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
          <Icon name="Wind" size={18} color={theme.colors.primary} />
          <Typography variant="h3" style={{ marginLeft: 8 }}>
            Wiatr na wysokości
          </Typography>
        </View>
        <Typography variant="caption" color="textSecondary" style={{ fontSize: 11 }}>
          Średni, bieżąca godzina
        </Typography>
      </View>

      <View style={styles.row}>
        {levels.map((level) => (
          <View
            key={level.label}
            style={[
              styles.tile,
              { borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
            ]}
          >
            <Typography variant="caption" color="textSecondary">
              {level.label}
            </Typography>
            <Typography variant="h3" style={{ marginTop: 2 }}>
              {formatSpeed(level.value)}
            </Typography>
            <Typography variant="caption" color="textSecondary" style={{ fontSize: 11 }}>
              {level.value === null ? 'brak danych' : 'km/h'}
            </Typography>
          </View>
        ))}
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
  row: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
  },
  tile: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
});
