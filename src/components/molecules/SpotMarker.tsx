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
        case 'nature': return theme.colors.green; // Green for nature
        case 'park': return theme.colors.warning; // Yellow/Orange for parks
        case 'urban': return theme.colors.accent; // Blue for urban
        default: return theme.colors.primary;
    }
};

export const SpotMarker = ({ spot, onPress }: SpotMarkerProps) => {
    const { theme } = useTheme();
    const [tracksViewChanges, setTracksViewChanges] = React.useState(true);

    React.useEffect(() => {
        // Stop tracking after initial render to optimize performance
        // This delay ensures the icon font is loaded and rendered
        const timer = setTimeout(() => {
            setTracksViewChanges(false);
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    const iconColor = getIconColor(spot.type, theme);

    return (
        <Marker
            coordinate={spot.coordinates}

            onPress={() => onPress(spot)}
            tracksViewChanges={tracksViewChanges}
        >
            <View style={[styles.container, {
                backgroundColor: theme.colors.surface, // Solid background for map visibility
                // No border
            }]}>
                <Icon
                    name={getIconName(spot.type)}
                    size={20}
                    color={iconColor}
                />
            </View>
        </Marker>
    );
};

const styles = StyleSheet.create({
    container: {
        width: 40,
        height: 40,
        borderRadius: 20,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
