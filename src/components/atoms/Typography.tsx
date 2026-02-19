import React from 'react';
import { Text, TextProps, TextStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

interface TypographyProps extends TextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'bodySmall' | 'caption' | 'label';
  color?: string; // Or dynamic key
  align?: TextStyle['textAlign'];
  weight?: TextStyle['fontWeight'];
  lineHeight?: number;
}

export const Typography: React.FC<TypographyProps> = ({
  variant = 'body',
  color = 'text',
  align = 'left',
  weight,
  lineHeight,
  style,
  children,
  ...props
}) => {
  const { theme } = useTheme();
  const typographyStyle = theme.typography[variant as keyof typeof theme.typography];
  const textColor = theme.colors[color as keyof typeof theme.colors] || color;

  return (
    <Text
      style={[
        typographyStyle as any,
        { color: textColor, textAlign: align },
        weight ? { fontWeight: weight } : null,
        lineHeight ? { lineHeight } : null,
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};
