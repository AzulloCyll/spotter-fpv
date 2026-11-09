import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Typography } from './Typography';

interface DemoBadgeProps {
  style?: ViewStyle;
}

/** Small marker for blocks that show sample data, not real data. */
export const DemoBadge: React.FC<DemoBadgeProps> = ({ style }) => {
  const { theme } = useTheme();
  const color = theme.colors.warning;

  return (
    <View
      accessibilityLabel="Dane demonstracyjne"
      style={[styles.container, { borderColor: color, backgroundColor: color + '26' }, style]}
    >
      <Typography
        variant="label"
        style={{ color, fontSize: 9, fontWeight: '800', marginBottom: 0, letterSpacing: 0.8 }}
      >
        DEMO
      </Typography>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
});
