import { MapType } from 'react-native-maps';

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

export const WEATHER_API_RAIN_URL =
  'https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=***REMOVED***';
export const WEATHER_API_WIND_URL =
  'https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=***REMOVED***';

export const lightMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#f5f5f5' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#f5f5f5' }] },
  {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [{ color: '#eeeeee' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#757575' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#ffffff' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#c9c9c9' }],
  },
];

export const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#212121' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#212121' }] },
  {
    featureType: 'administrative',
    elementType: 'geometry',
    stylers: [{ color: '#757575' }],
  },
  {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [{ color: '#2c2c2c' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.fill',
    stylers: [{ color: '#2c2c2c' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#8a8a8a' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#000000' }],
  },
];
