import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Marker } from 'react-native-maps';
import { Icon } from '../atoms/Icon'; // Assuming Icon component exists and handles vector icons
import { Spot } from '../../data/mockSpots';
import { useTheme } from '../../theme/ThemeContext';

interface SpotMarkerProps {
    spot: Spot;
    onPress: (spot: Spot) => void;
}

const getIconName = (type: Spot['type']) => {
    switch (type) {
        case 'bando': return 'AlertTriangle';
        case 'nature': return 'TreePine';
        case 'park': return 'Flag';
        case 'urban': return 'Building2';
        default: return 'MapPin';
    }
};

const getIconColor = (type: Spot['type'], theme: any) => {
    switch (type) {
        case 'bando': return theme.colors.error; // Red for danger/bando
        case 'nature': return theme.colors.success; // Green for nature
        case 'park': return theme.colors.warning; // Yellow/Orange for parks
        case 'urban': return theme.colors.info; // Blue for urban
        default: return theme.colors.primary;
    }
};

export const SpotMarker = ({ spot, onPress }: SpotMarkerProps) => {
    const { theme } = useTheme();

    return (
        <Marker
            coordinate={spot.coordinates}
            onPress={() => onPress(spot)}
            tracksViewChanges={false} // Optimization
        >
            <View style={[styles.container, { backgroundColor: theme.colors.surface, borderColor: getIconColor(spot.type, theme) }]}>
                <Icon
                    name={getIconName(spot.type)}
                    size={20}
                    color={getIconColor(spot.type, theme)}
                />
            </View>
        </Marker>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 6,
        borderRadius: 20,
        borderWidth: 2,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
