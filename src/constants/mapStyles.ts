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
  { id: 'wind', label: 'Wiatr', icon: 'Wind' as const },
];

export const WEATHER_API_RAIN_URL = `https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${process.env.EXPO_PUBLIC_WEATHER_API_KEY}`;
export const WEATHER_API_WIND_URL = `https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=${process.env.EXPO_PUBLIC_WEATHER_API_KEY}`;
