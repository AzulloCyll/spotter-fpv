import React from 'react';
import { View, useWindowDimensions } from 'react-native';
import { Marker } from 'react-native-maps';
import { Icon } from '../atoms/Icon';
import { Spot } from '../../data/mockSpots';
import { useTheme } from '../../theme/ThemeContext';

interface SpotMarkerProps {
  spot: Spot;
  onPress: (spot: Spot) => void;
}

const getIconName = (type: Spot['type']) => {
  switch (type) {
    case 'bando':
      return 'AlertTriangle';
    case 'nature':
      return 'TreePine';
    case 'park':
      return 'Flag';
    case 'urban':
      return 'Building2';
    default:
      return 'MapPin';
  }
};

const getIconColor = (type: Spot['type'], theme: any) => {
  switch (type) {
    case 'bando':
      return theme.colors.error;
    case 'nature':
      return theme.colors.green;
    case 'park':
      return theme.colors.warning;
    case 'urban':
      return theme.colors.accent;
    default:
      return theme.colors.primary;
  }
};

export const SpotMarker = ({ spot, onPress }: SpotMarkerProps) => {
  const { theme } = useTheme();
  const { width: windowWidth } = useWindowDimensions();
  const [tracksViewChanges, setTracksViewChanges] = React.useState(true);

  React.useEffect(() => {
    // Stabilize rendering for 5 seconds to ensure Android captures the full view
    // after layout and icon loading are complete.
    const timer = setTimeout(() => {
      setTracksViewChanges(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const isPhone = windowWidth < 800;

  // Slightly enlarged sizes based on user feedback
  const markerSize = isPhone ? 30 : 42;
  const iconSize = isPhone ? 16 : 24;
  const iconColor = getIconColor(spot.type, theme);

  return (
    <Marker
      coordinate={spot.coordinates}
      onPress={() => onPress(spot)}
      tracksViewChanges={tracksViewChanges}
      anchor={{ x: 0.5, y: 0.5 }}
    >
      <View
        collapsable={false}
        style={{
          width: markerSize + 10, // Small buffer space
          height: markerSize + 10,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'transparent',
        }}
      >
        <View
          style={{
            width: markerSize,
            height: markerSize,
            borderRadius: markerSize / 2,
            backgroundColor: theme.colors.surface || '#FFFFFF',
            borderWidth: isPhone ? 1.5 : 2.5,
            borderColor: iconColor,
            alignItems: 'center',
            justifyContent: 'center',
            // Hardware layer forcing to fix clipping
            opacity: 0.99,
            overflow: 'visible',
          }}
        >
          <Icon name={getIconName(spot.type)} size={iconSize} color={iconColor} />
        </View>
      </View>
    </Marker>
  );
};
