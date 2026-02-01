import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ShieldCheck, Activity } from 'lucide-react-native';
import { theme } from '../../theme';
import { Typography } from '../atoms/Typography';
import { Card } from '../atoms/Card';

export const FlightStatus: React.FC = () => {
    return (
        <View style={styles.wrapper}>
            <Card variant="glass" style={styles.container}>
                <View style={styles.left}>
                    <View style={styles.iconContainer}>
                        <ShieldCheck color={theme.colors.success} size={28} />
                    </View>
                    <View style={styles.textContainer}>
                        <Typography variant="h2">GOTOWY DO LOTU</Typography>
                        <Typography variant="caption" color="textSecondary">GPS: 12 satelitów • Kp-Index: 2</Typography>
                    </View>
                </View>
                <Activity color={theme.colors.primary} size={20} opacity={0.5} />
            </Card>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        paddingHorizontal: 20,
        marginBottom: 25,
    },
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        backgroundColor: 'rgba(76, 217, 100, 0.05)', // Subtle success tint
        borderColor: 'rgba(76, 217, 100, 0.2)',
    },
    left: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 45,
        height: 45,
        borderRadius: 12,
        backgroundColor: 'rgba(76, 217, 100, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    textContainer: {
        marginLeft: 15,
    }
});
