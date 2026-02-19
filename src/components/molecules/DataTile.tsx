import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Typography } from '../atoms/Typography';

interface DataTileProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit?: string;
  color?: string;
  isCritical?: boolean;
  style?: ViewStyle;
}

export const DataTile: React.FC<DataTileProps> = ({
  icon,
  label,
  value,
  unit,
  color,
  isCritical,
  style,
}) => {
  const { theme } = useTheme();
  const dynamicStyles = getStyles(theme);

  return (
    <View style={[dynamicStyles.container, style]}>
      <View style={dynamicStyles.iconContainer}>
        {React.cloneElement(icon as React.ReactElement<any>, {
          size: 32,
          color: isCritical ? theme.colors.error : theme.colors.primary,
          strokeWidth: 1.2,
        })}
      </View>
      <View style={dynamicStyles.content}>
        <View style={dynamicStyles.valueRow}>
          <Typography
            variant="h3"
            style={[dynamicStyles.value, isCritical && { color: theme.colors.error }]}
          >
            {value}
          </Typography>
          {unit && (
            <Typography variant="caption" color="textSecondary" style={dynamicStyles.unit}>
              {unit}
            </Typography>
          )}
        </View>
        <Typography variant="bodySmall" style={dynamicStyles.label}>
          {label}
        </Typography>
      </View>
    </View>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      width: '48%',
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      paddingVertical: theme.spacing.md - 2,
      paddingHorizontal: theme.spacing.md - 4,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      ...theme.shadows.soft,
    },
    iconContainer: {
      width: 42,
      marginRight: theme.spacing.sm,
      justifyContent: 'center',
      alignItems: 'center',
    },
    content: {
      flex: 1,
    },
    label: {
      fontSize: 12,
      fontWeight: '500',
      marginTop: 0,
      marginBottom: 0,
      color: theme.colors.textSecondary,
      textTransform: 'none',
    },
    valueRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
    },
    value: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.colors.text,
    },
    unit: {
      fontSize: 13,
      marginLeft: theme.spacing.xs - 1,
      fontWeight: '600',
      opacity: 0.7,
    },
  });
