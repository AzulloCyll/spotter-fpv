// Rodzaj podkładu mapy. Wcześniej był to `MapType` z react-native-maps, ale
// mapę rysuje Leaflet w WebView, który tamtej biblioteki nie zna.
export type MapType = 'standard' | 'satellite' | 'hybrid';

export const OFM_TILE_URL =
  'https://nwy-tiles-api.prod.newaydata.com/tiles/{z}/{x}/{y}.png?path=latest/aero/latest';

export const MAP_STYLES = [
  {
    id: 'standard',
    label: 'Jasna',
    type: 'standard' as MapType,
    icon: 'Map' as const,
  },
  {
    id: 'dark',
    label: 'Ciemna',
    type: 'standard' as MapType,
    customStyle: true,
    icon: 'Moon' as const,
  },
  {
    id: 'satellite',
    label: 'Satelita',
    type: 'satellite' as MapType,
    icon: 'Globe' as const,
  },
  {
    id: 'hybrid',
    label: 'Hybrydowa',
    type: 'hybrid' as MapType,
    icon: 'Layers' as const,
  },
];

export const MAP_LAYERS = [
  { id: 'ofm', label: 'Strefy lotnicze', icon: 'Navigation' as const },
  { id: 'rain', label: 'Opady', icon: 'CloudRain' as const },
];

/**
 * Radar opadów z RainViewer. Bezkluczowy, w przeciwieństwie do kafli
 * OpenWeatherMap, których `appid` przy prefiksie EXPO_PUBLIC_ lądował
 * w bundlu aplikacji i dawał się z niej wydobyć.
 *
 * Adres kafla nie jest stały: trzeba najpierw pobrać stąd `radar.past`
 * i wziąć ścieżkę najnowszej klatki. Robi to skrypt mapy w WebView.
 */
export const RAINVIEWER_INDEX_URL = 'https://api.rainviewer.com/public/weather-maps.json';
