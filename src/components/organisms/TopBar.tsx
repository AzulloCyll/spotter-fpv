import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Bell, Search, Hexagon } from 'lucide-react-native';
import { theme } from '../../theme';
import { Typography } from '../atoms/Typography';
import { Avatar } from '../atoms/Avatar';

export const TopBar: React.FC = () => {
    return (
        <View style={styles.container}>
            <View style={styles.leftSection}>
                <Avatar size={45} />
                <View style={styles.greeting}>
                    <Typography variant="caption" color="textSecondary">Witaj z powrotem,</Typography>
                    <Typography variant="h2">Pilot FPV</Typography>
                </View>
            </View>

            <View style={styles.rightSection}>
                <TouchableOpacity style={styles.iconButton}>
                    <View style={styles.badge}>
                        <Typography variant="caption" style={styles.badgeText}>3</Typography>
                    </View>
                    <Bell color={theme.colors.text} size={22} />
                </TouchableOpacity>

                <View style={styles.separator} />

                <TouchableOpacity style={styles.hudButton}>
                    <Hexagon color={theme.colors.accent} size={24} fill="rgba(0, 240, 255, 0.1)" />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 15, // Reduced from 50
        paddingBottom: 15,
        backgroundColor: 'rgba(15, 15, 15, 0.95)',
    },
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    greeting: {
        marginLeft: 12,
    },
    rightSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconButton: {
        padding: 8,
        backgroundColor: theme.colors.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#333',
    },
    hudButton: {
        padding: 8,
    },
    separator: {
        width: 1,
        height: 20,
        backgroundColor: '#333',
        marginHorizontal: 10,
    },
    badge: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: theme.colors.primary,
        minWidth: 18,
        height: 18,
        borderRadius: 9,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
        borderWidth: 2,
        borderColor: theme.colors.background,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#fff',
    }
});
