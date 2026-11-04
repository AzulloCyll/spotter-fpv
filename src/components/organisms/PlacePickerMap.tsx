import React, { useState } from 'react';

import { useTheme } from '../../theme/ThemeContext';
import type { Coordinates } from '../../utils/location';
import { LeafletMap } from './LeafletMap';

export interface PlacePickerMapProps {
  initialCenter: Coordinates;
  onCenterChange: (center: Coordinates) => void;
}

// Native map of the place picker. The web build uses PlacePickerMap.web.tsx (pigeon-maps).
export const PlacePickerMap: React.FC<PlacePickerMapProps> = ({
  initialCenter,
  onCenterChange,
}) => {
  const { isDark } = useTheme();
  // Fixed for the picker's lifetime: LeafletMap rebuilds its page when the region changes.
  const [initialRegion] = useState(() => ({
    latitude: initialCenter.latitude,
    longitude: initialCenter.longitude,
    latitudeDelta: 0.15,
    longitudeDelta: 0.15,
  }));

  return (
    <LeafletMap
      initialRegion={initialRegion}
      spots={[]}
      // Satellite only: every carto layer ('standard', 'dark', the 'hybrid' labels) now
      // shows an "API KEY REQUIRED" watermark.
      activeStyleId="satellite"
      showOFM={false}
      showRain={false}
      showWind={false}
      isDark={isDark}
      onMarkerPress={() => {}}
      onMapMove={(center) => onCenterChange({ latitude: center.lat, longitude: center.lng })}
    />
  );
};
