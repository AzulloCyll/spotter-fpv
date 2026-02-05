import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Typography } from '../atoms/Typography';
import { Icon, IconName } from '../atoms/Icon';

interface ActionCardProps {
    title: string;
    description: string;
    icon: IconName;
    color: string;
    onPress: () => void;
    styles: any;
}

const NavCard: React.FC<ActionCardProps> = ({ title, description, icon, color, onPress, styles }) => {
    const { theme } = useTheme();
    return (
        <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={styles.card}>
            <View style={[styles.iconBox, { backgroundColor: color + '15' }]}>
                <Icon name={icon} size={24} color={color} />
            </View>
            <View style={styles.content}>
                <Typography variant="h3" style={styles.title}>{title}</Typography>
                <Typography variant="bodySmall" color="textSecondary">{description}</Typography>
            </View>
            <Icon name="ChevronRight" size={18} color={theme.colors.border} />
        </TouchableOpacity>
    );
};

interface QuickNavigationProps {
    onNavigate: (screen: string) => void;
}

export const QuickNavigation: React.FC<QuickNavigationProps> = ({ onNavigate }) => {
    const { theme } = useTheme();
    const dynamicStyles = getStyles(theme);

    return (
        <View style={dynamicStyles.section}>
            <Typography variant="label" color="textSecondary" style={dynamicStyles.sectionTitle}>
                Szybki dostęp
            </Typography>

            <NavCard
                title="Eksploruj Spoty"
                description="Mapa najlepszych miejsc w okolicy"
                icon="Map"
                color={theme.colors.primary}
                onPress={() => onNavigate('Mapa')}
                styles={dynamicStyles}
            />

            <NavCard
                title="Pogoda dla FPV"
                description="Status Kp-Index i siła wiatru"
                icon="CloudSun"
                color="#0891B2"
                onPress={() => onNavigate('Pogoda')}
                styles={dynamicStyles}
            />

            <NavCard
                title="Czat Pilotów"
                description="Ustaw się na latanie z ekipą"
                icon="MessageCircle"
                color="#7C3AED"
                onPress={() => onNavigate('Czat')}
                styles={dynamicStyles}
            />
        </View>
    );
};

const getStyles = (theme: any) => StyleSheet.create({
    section: {
        paddingHorizontal: theme.spacing.lg - 4,
        marginTop: theme.spacing.sm + 2,
    },
    sectionTitle: {
        marginBottom: theme.spacing.md,
        paddingHorizontal: theme.spacing.xs,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        padding: 16,
        borderRadius: theme.borderRadius.md,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: theme.colors.border,
        ...theme.shadows.soft,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: theme.borderRadius.sm,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    content: {
        flex: 1,
    },
    title: {
        marginBottom: 2,
    }
});
