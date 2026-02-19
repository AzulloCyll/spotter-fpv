import React from 'react';
import { TouchableOpacity, ActivityIndicator, type ViewStyle, type TextStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Typography } from './Typography';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  isLoading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  isLoading = false,
  disabled = false,
  style,
  textStyle,
  icon,
}) => {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || isLoading}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 12,
          paddingHorizontal: 24,
          borderRadius: theme.borderRadius.md,
          backgroundColor:
            variant === 'outline'
              ? 'transparent'
              : variant === 'danger'
                ? theme.colors.error
                : variant === 'secondary'
                  ? theme.colors.surface
                  : theme.colors.primary,
          borderWidth: variant === 'outline' ? 1 : 0,
          borderColor: variant === 'outline' ? theme.colors.primary : 'transparent',
          minHeight: 48,
        },
        disabled && { opacity: 0.6 },
        style,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'secondary' ? theme.colors.primary : '#FFF'}
        />
      ) : (
        <>
          {icon}
          <Typography
            variant="label"
            style={[
              {
                color:
                  variant === 'outline' || variant === 'secondary' ? theme.colors.primary : '#FFF',
                marginLeft: icon ? 8 : 0,
                fontWeight: '600',
              },
              textStyle,
            ]}
          >
            {label}
          </Typography>
        </>
      )}
    </TouchableOpacity>
  );
};
