import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Map as MapIcon, CloudSun, MessageCircle } from 'lucide-react-native';
import { theme } from '../../theme';
import { Typography } from '../atoms/Typography';
import { ActionCard } from '../molecules/ActionCard';

interface QuickNavigationProps {
    onNavigate: (screen: string) => void;
}

export const QuickNavigation: React.FC<QuickNavigationProps> = ({ onNavigate }) => {
    return (
        <View style={styles.section}>
            <Typography variant="h2" style={styles.sectionTitle}>SZYBKI START</Typography>

            <ActionCard
                title="Mapa Spotów"
                description="Znajdź najlepsze miejsca do latania"
                icon={<MapIcon color={theme.colors.primary} size={28} />}
                iconBgColor="rgba(255, 77, 0, 0.2)"
                onPress={() => onNavigate('Map')}
            />

            <ActionCard
                title="Pogoda FPV"
                description="Sprawdź Kp-Index i prognozę godzinową"
                icon={<CloudSun color={theme.colors.accent} size={28} />}
                iconBgColor="rgba(0, 240, 255, 0.1)"
                onPress={() => onNavigate('Weather')}
            />

            <ActionCard
                title="Czat Pilotów"
                description="Ustaw się na wspólne latanie"
                icon={<MessageCircle color="#fff" size={28} />}
                iconBgColor="rgba(255, 255, 255, 0.1)"
                onPress={() => onNavigate('Chat')}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    section: {
        paddingHorizontal: 20,
    },
    sectionTitle: {
        marginBottom: 15,
        fontSize: 14,
        letterSpacing: 1.5,
    },
});
