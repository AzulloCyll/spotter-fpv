import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, useWindowDimensions, TouchableWithoutFeedback } from 'react-native';
import { Map as MapView, Marker } from 'pigeon-maps';
import { MOCK_MAP_STYLE_ID } from '../constants/mockData';
import { useTheme } from '../theme/ThemeContext';
import { Typography } from '../components/atoms/Typography';
import { Icon } from '../components/atoms/Icon';

// Custom providers for different modes
const providers = {
  osm: (x: number, y: number, z: number) => `https://tile.openstreetmap.org/${z}/${x}/${y}.png`,
  light: (x: number, y: number, z: number, dpr?: number) =>
    `https://a.basemaps.cartocdn.com/light_all/${z}/${x}/${y}${dpr && dpr >= 2 ? '@2x' : ''}.png`,
  dark: (x: number, y: number, z: number, dpr?: number) =>
    `https://a.basemaps.cartocdn.com/dark_all/${z}/${x}/${y}${dpr && dpr >= 2 ? '@2x' : ''}.png`,
  voyager: (x: number, y: number, z: number, dpr?: number) =>
    `https://a.basemaps.cartocdn.com/rastertiles/voyager/${z}/${x}/${y}${dpr && dpr >= 2 ? '@2x' : ''}.png`,
};

const WEB_STYLES = [
  { id: 'light', label: 'Jasna', provider: providers.light },
  { id: 'dark', label: 'Ciemna', provider: providers.dark },
  { id: 'voyager', label: 'Voyager', provider: providers.voyager },
  { id: 'osm', label: 'OpenStreetMap', provider: providers.osm },
];

export default function MapScreen() {
  const { theme, isDark } = useTheme();
  const { height: windowHeight } = useWindowDimensions();
  const [center, setCenter] = useState<[number, number]>([52.2297, 21.0122]); // Warsaw
  const [zoom, setZoom] = useState(12);
  const [activeStyleId, setActiveStyleId] = useState(MOCK_MAP_STYLE_ID);
  const [showMenu, setShowMenu] = useState(false);

  // Default provider adapts to theme if no specific style is forcefully selected?
  // Current implementation has manual selection. Let's make the "default" logic smarter if needed,
  // but for now, if the user picks a style, they pick a style.
  // HOWEVER, we might want the initial load to respect the theme if it's 'dark'?
  // But MOCK_MAP_STYLE_ID is 'standard' (light map usually).
  // Let's stick to manual selection for now to not overcomplicate, but fix the UI styling.

  const activeProvider = WEB_STYLES.find(s => s.id === activeStyleId)?.provider || providers.light;

  const dynamicStyles = getStyles(theme);

  return (
    <View style={dynamicStyles.container}>
      <View style={dynamicStyles.mapContainer}>
        <MapView
          height={windowHeight}
          center={center}
          zoom={zoom}
          onBoundsChanged={({ center, zoom }) => {
            setCenter(center);
            setZoom(zoom);
          }}
          provider={activeProvider}
          metaWheelZoom={true}
        >
          <Marker
            width={40}
            anchor={[52.2297, 21.0122]}
          >
            <Icon name="MapPin" color={theme.colors.success} size={32} />
          </Marker>
        </MapView>
      </View>

      {/* Górna wyszukiwarka */}
      <View style={dynamicStyles.searchBar}>
        <Icon name="Search" color={theme.colors.textSecondary} size={20} />
        <View style={dynamicStyles.searchPlaceholder}>
          <Typography color="textSecondary">Szukaj spotów...</Typography>
        </View>
      </View>

      {/* Przyciski boczne */}
      <View style={dynamicStyles.sideButtons}>
        <TouchableOpacity
          style={dynamicStyles.sideButton}
          onPress={() => setShowMenu(!showMenu)}
        >
          <Icon name="Layers" color={theme.colors.primary} size={24} />
        </TouchableOpacity>
      </View>

      {/* Menu wyboru stylu (Web specific overlay) */}
      {showMenu && (
        <View style={dynamicStyles.webMenu}>
          <Typography variant="h3" style={dynamicStyles.menuTitle}>Styl mapy</Typography>
          {WEB_STYLES.map((style) => (
            <TouchableOpacity
              key={style.id}
              style={dynamicStyles.menuItem}
              onPress={() => {
                setActiveStyleId(style.id);
                setShowMenu(false);
              }}
            >
              <Typography
                color={activeStyleId === style.id ? "primary" : "text"}
                style={dynamicStyles.menuItemText}
              >
                {style.label}
              </Typography>
              {activeStyleId === style.id && (
                <Icon name="Check" color={theme.colors.primary} size={20} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Overlay to close menu when clicking outside */}
      {showMenu && (
        <TouchableWithoutFeedback onPress={() => setShowMenu(false)}>
          <View style={dynamicStyles.fullScreenOverlay} />
        </TouchableWithoutFeedback>
      )}
    </View>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  mapContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    overflow: 'hidden',
  },
  searchBar: {
    position: 'absolute',
    top: theme.spacing.xl + 8,
    left: theme.spacing.lg - 4,
    right: theme.spacing.lg - 4,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md - 1,
    borderRadius: theme.borderRadius.md + 2,
    flexDirection: 'row',
    alignItems: 'center',
    ...theme.shadows.medium,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  searchPlaceholder: {
    marginLeft: 10,
  },
  sideButtons: {
    position: 'absolute',
    right: 20,
    top: 120,
    zIndex: 10,
  },
  sideButton: {
    backgroundColor: theme.colors.surface,
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  webMenu: {
    position: 'absolute',
    right: 80,
    top: 120,
    backgroundColor: theme.colors.surface,
    padding: 20,
    borderRadius: 16,
    width: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    zIndex: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  menuTitle: {
    marginBottom: 15,
    fontSize: 18,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: '600',
  },
  fullScreenOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 5,
  }
});
