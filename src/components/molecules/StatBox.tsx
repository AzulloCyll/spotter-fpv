import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography } from '../atoms/Typography';
import { theme } from '../../theme';

interface StatBoxProps {
    icon: React.ReactNode;
    value: string;
    label: string;
}

export const StatBox: React.FC<StatBoxProps> = ({ icon, value, label }) => {
    return (
        <View style={styles.container}>
            {icon}
            <Typography variant="body" style={styles.value}>{value}</Typography>
            <Typography variant="caption" color="textSecondary">{label}</Typography>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: theme.colors.surface,
        padding: 15,
        borderRadius: 20,
        width: '30%',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#333',
    },
    value: {
        fontWeight: 'bold',
        marginTop: 8,
    }
});
