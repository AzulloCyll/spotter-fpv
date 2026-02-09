import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Typography } from '../atoms/Typography';
import { Icon } from '../atoms/Icon';
import { useNavigation, useRoute } from '@react-navigation/native';

const NAV_ITEMS = [
    { name: 'Start', icon: 'House' as const, label: 'Start' },
    { name: 'Mapa', icon: 'Map' as const, label: 'Mapa' },
    { name: 'Pogoda', icon: 'CloudSun' as const, label: 'Pogoda' },
    { name: 'Czat', icon: 'MessageCircle' as const, label: 'Czat' },
];

export const SidebarNav: React.FC = () => {
    const { theme, isDark } = useTheme();
    const navigation = useNavigation<any>();
    const route = useRoute();

    return (
        <View style={styles.container}>
            {NAV_ITEMS.map((item) => {
                const isActive = route.name === item.name;
                const color = isActive
                    ? (isDark ? '#FFFFFF' : theme.colors.primary)
                    : (isDark ? '#FFFFFF40' : theme.colors.textSecondary);

                return (
                    <TouchableOpacity
                        key={item.name}
                        style={styles.navItem}
                        onPress={() => navigation.navigate(item.name)}
                    >
                        <Icon name={item.icon} color={color} size={32} strokeWidth={isActive ? 2 : 1.5} />
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 15,
        width: '100%',
        backgroundColor: 'transparent',
        marginTop: 'auto',
    },
    navItem: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 8,
        flex: 1,
    },
    label: {
        display: 'none',
    }
});
