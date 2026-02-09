import React from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Typography } from '../atoms/Typography';
import { Avatar } from '../atoms/Avatar';
import { Icon } from '../atoms/Icon';

const MOCK_ACTIVITY = [
    { id: '1', pilot: 'Piotr_FPV', action: 'napisał', message: 'Ktoś dziś lata na Bemowie? Pogoda wygląda idealnie!', time: '2m', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=150&auto=format&fit=crop' },
    { id: '2', pilot: 'Droniarz', action: 'odpowiedział', message: 'Będę za 20 minut, biorę 5 pakietów. Widzimy się przy lądowisku!', time: '1m', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop' },
    { id: '3', pilot: 'Marek_Wing', action: 'osiągnął 142 km/h', spot: 'Bemowo', time: '15m', avatar: 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?q=80&w=150&auto=format&fit=crop' },
    { id: '4', pilot: 'Sky_King', action: 'dodał zdjęcie', spot: 'Zegrze', time: '1h', image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=400&auto=format&fit=crop', avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=150&auto=format&fit=crop' },
    { id: '5', pilot: 'FPV_Racer', action: 'dołączył do rozmowy', message: 'Uważajcie na wiatr od zachodu, na górze trochę rzuca.', time: '30m', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop' },
    { id: '6', pilot: 'Cinematic_Flow', action: 'wrzucił film 4K', spot: 'Tatry', time: '3h', image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=400&auto=format&fit=crop', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=150&auto=format&fit=crop' },
];

export const PilotActivity: React.FC = () => {
    const { theme, isDark } = useTheme();

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Typography variant="label" color="textSecondary" style={styles.label}>OSTATNIA AKTYWNOŚĆ</Typography>
                <Typography variant="bodySmall" color="primary" weight="700">CZAT</Typography>
            </View>

            <ScrollView
                style={styles.list}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ gap: 10, paddingBottom: 20 }}
            >
                {MOCK_ACTIVITY.map((item) => (
                    <View key={item.id} style={[styles.item, isDark && { backgroundColor: 'rgba(255,255,255,0.05)' }]}>
                        <Avatar size={34} source={item.avatar} />
                        <View style={styles.content}>
                            <View style={styles.itemHeader}>
                                <Typography variant="h3" style={{ fontWeight: '700', fontSize: 13, color: theme.colors.text }}>
                                    {item.pilot} <Typography variant="bodySmall" color="textSecondary" style={{ fontWeight: '400' }}>{item.action}</Typography>
                                </Typography>
                                <Typography variant="caption" color="textSecondary" style={{ fontSize: 10 }}>
                                    {item.time}
                                </Typography>
                            </View>

                            {item.spot && !item.message && (
                                <Typography variant="caption" color="textSecondary" style={{ fontSize: 11, marginBottom: 4 }}>
                                    {item.spot}
                                </Typography>
                            )}

                            {item.message && (
                                <View style={[styles.messageBubble, isDark && { backgroundColor: 'rgba(255,255,255,0.08)' }]}>
                                    <Typography variant="bodySmall" style={[styles.messageText, { color: theme.colors.text }]}>
                                        {item.message}
                                    </Typography>
                                </View>
                            )}
                        </View>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 15,
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    label: {
        letterSpacing: 1.2,
        fontSize: 10,
    },
    list: {
        flex: 1,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: 'rgba(255,255,255,0.4)',
        padding: 10,
        borderRadius: 16,
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 2,
    },
    content: {
        flex: 1,
        marginLeft: 10,
    },
    messageBubble: {
        backgroundColor: 'rgba(255,255,255,0.6)',
        padding: 8,
        borderRadius: 12,
        borderTopLeftRadius: 2,
        marginTop: 4,
    },
    messageText: {
        fontSize: 13,
        lineHeight: 18,
    },
    activityImage: {
        width: '100%',
        height: 80,
        borderRadius: 8,
        marginTop: 6,
        backgroundColor: '#eee',
    },
});
