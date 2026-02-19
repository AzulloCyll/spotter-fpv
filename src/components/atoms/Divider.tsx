import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

interface DividerProps {
  style?: ViewStyle;
  vertical?: boolean;
  color?: string;
}

export const Divider: React.FC<DividerProps> = ({ style, vertical = false, color }) => {
  const { theme } = useTheme();
  const dividerColor = color || theme.colors.border;

  return (
    <View
      style={[
        vertical ? styles.vertical : styles.horizontal,
        { backgroundColor: dividerColor },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  horizontal: {
    height: 1,
    width: '100%',
  },
  vertical: {
    width: 1,
    height: '100%',
  },
});
