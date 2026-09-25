import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Typography } from '../atoms/Typography';
import { Icon, IconName } from '../atoms/Icon';
import type { FlightAssessment, FlightStatusLevel } from '../../utils/flightConditions';

interface GoNoGoIndicatorProps {
  assessment: FlightAssessment;
}

const LEVEL_TEXT: Record<FlightStatusLevel, { title: string; subtitle: string; icon: IconName }> = {
  go: { title: 'GO', subtitle: 'Warunki w normie', icon: 'CheckCircle2' },
  caution: { title: 'UWAGA', subtitle: 'Leć ostrożnie', icon: 'AlertTriangle' },
  nogo: { title: 'NO-GO', subtitle: 'Nie startuj', icon: 'XCircle' },
};

export const GoNoGoIndicator: React.FC<GoNoGoIndicatorProps> = ({ assessment }) => {
  const { theme } = useTheme();

  const levelColor = (level: FlightStatusLevel) =>
    level === 'go'
      ? theme.colors.green
      : level === 'caution'
        ? theme.colors.warning
        : theme.colors.error;

  const color = levelColor(assessment.level);
  const text = LEVEL_TEXT[assessment.level];
  const hasMissing = assessment.factors.some((f) => f.missing);

  return (
    <View style={[styles.container, { borderColor: color + '60', backgroundColor: color + '12' }]}>
      <View style={styles.header}>
        <Icon name={text.icon} size={28} color={color} />
        <View style={{ marginLeft: 10, flex: 1 }}>
          <Typography variant="h2" style={{ color, lineHeight: 30 }}>
            {text.title}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            {text.subtitle}
            {hasMissing ? ' • część danych niedostępna' : ''}
          </Typography>
        </View>
      </View>

      <View style={styles.factors}>
        {assessment.factors.map((factor) => (
          <View key={factor.key} style={styles.factorRow}>
            <View style={[styles.dot, { backgroundColor: levelColor(factor.level) }]} />
            <Typography variant="label" style={{ flex: 1, fontSize: 13 }}>
              {factor.label}
            </Typography>
            <Typography
              variant="label"
              color={factor.missing ? 'textSecondary' : 'text'}
              style={{ fontSize: 13, fontWeight: '700' }}
            >
              {factor.value}
            </Typography>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  factors: {
    gap: 6,
  },
  factorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
});
