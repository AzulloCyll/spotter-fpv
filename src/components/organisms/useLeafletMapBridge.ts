import { ForwardedRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';

import {
  OFM_TILE_URL,
  RAINVIEWER_INDEX_URL,
  WEATHER_API_WIND_URL,
} from '../../constants/mapStyles';
import { Spot } from '../../data/mockSpots';
import { MapCommand, parseMapMessage, toMarkerData } from '../../utils/mapMessages';
import { buildLeafletHtml } from './leafletMapHtml';

export interface LeafletMapRef {
  animateToByBounds: (sw: { lat: number; lng: number }, ne: { lat: number; lng: number }) => void;
  animateTo: (lat: number, lng: number, zoom?: number) => void;
}

export interface LeafletMapProps {
  initialRegion: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  spots: Spot[];
  activeStyleId: string;
  showOFM: boolean;
  showRain: boolean;
  showWind: boolean;
  isDark: boolean;
  onMarkerPress: (spot: Spot) => void;
  onMapMove?: (center: { lat: number; lng: number }, zoom: number) => void;
}

/**
 * The app side of the Leaflet page, shared by LeafletMap.tsx (WebView) and
 * LeafletMap.web.tsx (iframe). The platform file only supplies `send` (how a command
 * reaches the page) and calls `onPageLoad` and `handleMessage` from its own events.
 */
export function useLeafletMapBridge(
  props: LeafletMapProps,
  ref: ForwardedRef<LeafletMapRef>,
  send: (command: MapCommand) => void,
  parentOrigin?: string,
) {
  const {
    initialRegion,
    spots,
    activeStyleId,
    showOFM,
    showRain,
    showWind,
    isDark,
    onMarkerPress,
    onMapMove,
  } = props;

  // The page is built once around the first center; later changes of initialRegion
  // (the user's location arriving) are applied as a move, not a reload.
  const [initialCenter] = useState(() => ({
    latitude: initialRegion.latitude,
    longitude: initialRegion.longitude,
  }));
  // Latest location target, applied again on every page load (the first one, and a
  // reload after a dark mode change).
  const userTargetRef = useRef<{ lat: number; lng: number } | null>(null);

  // The page sets window.mapTouched on the pilot's gestures and on any explicit move
  // (setView, fitBounds); once set, the location handoff leaves the view alone.
  useImperativeHandle(ref, () => ({
    animateToByBounds: (sw, ne) => send({ type: 'fitBounds', sw, ne }),
    animateTo: (lat, lng, zoom) => send({ type: 'setView', lat, lng, zoom: zoom || 15 }),
  }));

  const moveToUserTarget = () => {
    const target = userTargetRef.current;
    if (target) send({ type: 'userTarget', ...target });
  };

  useEffect(() => {
    if (
      initialRegion.latitude === initialCenter.latitude &&
      initialRegion.longitude === initialCenter.longitude
    ) {
      return;
    }
    userTargetRef.current = { lat: initialRegion.latitude, lng: initialRegion.longitude };
    // If the page is still loading this is lost; onPageLoad applies the stored target then.
    moveToUserTarget();
  }, [initialRegion.latitude, initialRegion.longitude]);

  // A dark mode change rebuilds the page (and reloads it).
  const html = useMemo(
    () =>
      buildLeafletHtml({
        isDark,
        center: initialCenter,
        ofmTileUrl: OFM_TILE_URL,
        windTileUrl: WEATHER_API_WIND_URL,
        rainIndexUrl: RAINVIEWER_INDEX_URL,
        parentOrigin,
      }),
    [isDark, initialCenter, parentOrigin],
  );

  const layersCommand = (): MapCommand => ({
    type: 'layers',
    styleId: activeStyleId,
    ofm: showOFM,
    rain: showRain,
    wind: showWind,
  });

  const onPageLoad = () => {
    moveToUserTarget();
    send({ type: 'markers', markers: toMarkerData(spots) });
    send(layersCommand());
  };

  useEffect(() => {
    send(layersCommand());
  }, [activeStyleId, showOFM, showRain, showWind]);

  useEffect(() => {
    send({ type: 'markers', markers: toMarkerData(spots) });
  }, [spots]);

  const handleMessage = (raw: unknown) => {
    // The page runs third-party scripts: validate every message, and resolve a pressed
    // spot by id from the app's own list instead of trusting data from the page.
    const message = parseMapMessage(raw);
    if (!message) return;
    if (message.type === 'MARKER_PRESS') {
      const spot = spots.find((s) => s.id === message.id);
      if (spot) onMarkerPress(spot);
    } else if (onMapMove) {
      onMapMove(message.center, message.zoom);
    }
  };

  return { html, onPageLoad, handleMessage };
}
