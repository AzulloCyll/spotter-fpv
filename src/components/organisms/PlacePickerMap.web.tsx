import React from 'react';
import { Map as MapView } from 'pigeon-maps';

import { useTheme } from '../../theme/ThemeContext';
import type { PlacePickerMapProps } from './PlacePickerMap';

const tileProvider =
  (style: 'light_all' | 'dark_all') => (x: number, y: number, z: number, dpr?: number) =>
    `https://a.basemaps.cartocdn.com/${style}/${z}/${x}/${y}${dpr && dpr >= 2 ? '@2x' : ''}.png`;

const lightTiles = tileProvider('light_all');
const darkTiles = tileProvider('dark_all');

// Web map of the place picker: pigeon-maps, like MapScreen.web.tsx. It sizes itself to its parent.
export const PlacePickerMap: React.FC<PlacePickerMapProps> = ({
  initialCenter,
  onCenterChange,
}) => {
  const { isDark } = useTheme();

  return (
    <MapView
      defaultCenter={[initialCenter.latitude, initialCenter.longitude]}
      defaultZoom={12}
      provider={isDark ? darkTiles : lightTiles}
      onBoundsChanged={({ center }) =>
        onCenterChange({ latitude: center[0], longitude: center[1] })
      }
    />
  );
};
