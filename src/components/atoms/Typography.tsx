import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { theme } from '../../theme';

interface TypographyProps extends TextProps {
    variant?: 'h1' | 'h2' | 'body' | 'caption';
    color?: keyof typeof theme.colors;
}

export const Typography: React.FC<TypographyProps> = ({
    variant = 'body',
    color = 'text',
    style,
    children,
    ...props
}) => {
    return (
        <Text
            style={[
                styles[variant],
                { color: theme.colors[color] },
                style
            ]}
            {...props}
        >
            {children}
        </Text>
    );
};

const styles = StyleSheet.create({
    h1: {
        fontSize: 28,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    h2: {
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    body: {
        fontSize: 16,
    },
    caption: {
        fontSize: 12,
    },
});
