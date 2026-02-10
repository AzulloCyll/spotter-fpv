import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Typography } from '../atoms/Typography';
import { Icon } from '../atoms/Icon';
import { MOCK_SIGNAL, MOCK_IS_LINK_ACTIVE } from '../../constants/mockData';

export const TelemetryStatus: React.FC = () => {
    const { theme, isDark } = useTheme();
    const pulseAnim = useRef(new Animated.Value(1)).current;

    const isLinkActive = MOCK_IS_LINK_ACTIVE;
    const signal = MOCK_SIGNAL;

    useEffect(() => {
        if (isLinkActive) {
            const pulse = Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 0.4,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ]);

            Animated.loop(pulse).start();
        } else {
            pulseAnim.setValue(1);
        }
    }, [isLinkActive]);

    const getSignalColor = () => {
        if (!isLinkActive) return theme.colors.error;
        if (signal.rssi > -60) return theme.colors.success;
        if (signal.rssi > -80) return theme.colors.warning;
        return theme.colors.error;
    };

    return (
        <View style={styles.container}>
            <View style={styles.iconWrapper}>
                <Animated.View
                    style={[
                        styles.pulseCircle,
                        {
                            backgroundColor: getSignalColor(),
                            opacity: pulseAnim,
                            transform: [{
                                scale: pulseAnim.interpolate({
                                    inputRange: [0.4, 1],
                                    outputRange: [1.5, 1]
                                })
                            }]
                        }
                    ]}
                />
                <View style={[styles.statusDot, { backgroundColor: getSignalColor() }]} />
            </View>

            <View style={styles.info}>
                <Typography variant="label" style={{ fontSize: 9, fontWeight: '800', color: isLinkActive ? theme.colors.text : theme.colors.error }}>
                    {isLinkActive ? 'LINK OK' : 'NO LINK'}
                </Typography>
                {isLinkActive && (
                    <Typography variant="caption" color="textSecondary" style={{ fontSize: 8, marginTop: -2 }}>
                        {signal.rssi} dBm
                    </Typography>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    iconWrapper: {
        width: 12,
        height: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 6,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        zIndex: 2,
    },
    pulseCircle: {
        position: 'absolute',
        width: 8,
        height: 8,
        borderRadius: 4,
        zIndex: 1,
    },
    info: {
        justifyContent: 'center',
    }
});
