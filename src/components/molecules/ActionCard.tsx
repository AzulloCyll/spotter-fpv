import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Typography } from '../atoms/Typography';
import { theme } from '../../theme';

interface ActionCardProps {
    icon: React.ReactNode;
    iconBgColor: string;
    title: string;
    description: string;
    onPress: () => void;
}

export const ActionCard: React.FC<ActionCardProps> = ({
    icon,
    iconBgColor,
    title,
    description,
    onPress
}) => {
    return (
        <TouchableOpacity style={styles.card} onPress={onPress}>
            <View style={[styles.iconCircle, { backgroundColor: iconBgColor }]}>
                {icon}
            </View>
            <View style={styles.cardContent}>
                <Typography variant="h2">{title}</Typography>
                <Typography variant="caption" color="textSecondary" style={styles.desc}>
                    {description}
                </Typography>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: theme.colors.surface,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderRadius: 20,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#333',
    },
    iconCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardContent: {
        marginLeft: 15,
        flex: 1,
    },
    desc: {
        marginTop: 2,
    }
});
