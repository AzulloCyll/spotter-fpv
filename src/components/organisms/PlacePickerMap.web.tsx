import React from 'react';
import { Map as MapView } from 'pigeon-maps';

import type { PlacePickerMapProps } from './PlacePickerMap';

// OpenStreetMap tiles, as offered by MapScreen.web.tsx; the carto tiles now need an API key.
const osmTiles = (x: number, y: number, z: number) =>
  `https://tile.openstreetmap.org/${z}/${x}/${y}.png`;

// Web map of the place picker: pigeon-maps, like MapScreen.web.tsx. It sizes itself to its parent.
export const PlacePickerMap: React.FC<PlacePickerMapProps> = ({
  initialCenter,
  onCenterChange,
}) => {
  return (
    <MapView
      defaultCenter={[initialCenter.latitude, initialCenter.longitude]}
      defaultZoom={12}
      provider={osmTiles}
      onBoundsChanged={({ center }) =>
        onCenterChange({ latitude: center[0], longitude: center[1] })
      }
    />
  );
};
