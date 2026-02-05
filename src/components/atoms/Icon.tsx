import React from 'react';
import * as LucideIcons from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';

export type IconName = keyof typeof LucideIcons;

interface IconProps {
    name: IconName;
    size?: number;
    color?: string;
    strokeWidth?: number;
}

export const Icon: React.FC<IconProps> = ({
    name,
    size = 24,
    color,
    strokeWidth = 2
}) => {
    const { theme } = useTheme();
    const iconColor = color || theme.colors.text;
    const LucideIcon = LucideIcons[name] as React.ElementType;

    if (!LucideIcon) {
        console.warn(`Icon "${name}" not found in lucide-react-native`);
        return null;
    }

    return <LucideIcon size={size} color={iconColor} strokeWidth={strokeWidth} />;
};
