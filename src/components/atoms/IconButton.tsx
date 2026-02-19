import React from 'react';
import { TouchableOpacity, StyleSheet, type ViewStyle, type StyleProp } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

interface IconButtonProps {
  icon: React.ReactNode;
  onPress: () => void;
  variant?: 'primary' | 'surface' | 'glass' | 'ghost';
  size?: number;
  round?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onPress,
  variant = 'surface',
  size = 44,
  round = false,
  style,
}) => {
  const { theme } = useTheme();
  const dynamicStyles = getStyles(theme);

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[
        dynamicStyles.button,
        dynamicStyles[variant],
        { width: size, height: size, borderRadius: round ? size / 2 : theme.borderRadius.sm },
        style,
      ]}
    >
      {React.cloneElement(icon as React.ReactElement<any>, {
        size: size * 0.5,
        color: variant === 'primary' ? '#FFFFFF' : theme.colors.primary,
      })}
    </TouchableOpacity>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    button: {
      justifyContent: 'center',
      alignItems: 'center',
      ...theme.shadows.soft,
    },
    primary: {
      backgroundColor: theme.colors.primary,
    },
    surface: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    glass: {
      backgroundColor: theme.isDark ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.8)',
      borderWidth: 1,
      borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.3)',
    },
    ghost: {
      backgroundColor: 'transparent',
      borderWidth: 0,
      elevation: 0,
      shadowOpacity: 0,
    },
  });
