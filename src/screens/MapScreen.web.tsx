import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  TouchableWithoutFeedback,
  ScrollView,
  Image,
} from 'react-native';
import { Map as MapView, Marker } from 'pigeon-maps';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useTheme } from '../theme/ThemeContext';
import { Typography } from '../components/atoms/Typography';
import { Icon } from '../components/atoms/Icon';
import { useSpots } from '../context/SpotsContext';
import { AddSpotModal } from '../components/organisms/AddSpotModal';
import { SpotImageViewer } from '../components/organisms/SpotImageViewer';
import { Spot } from '../data/mockSpots';
import { googleMapsRouteUrl } from '../utils/navigation';

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
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
  const { spots, addSpot, canAddSpots } = useSpots();
  const [center, setCenter] = useState<[number, number]>([52.2297, 21.0122]); // Warsaw
  const [zoom, setZoom] = useState(12);
  const [activeStyleId, setActiveStyleId] = useState(isDark ? 'dark' : 'light');

  useEffect(() => {
    setActiveStyleId(isDark ? 'dark' : 'light');
  }, [isDark]);
  const [showMenu, setShowMenu] = useState(false);
  const [showSpotList, setShowSpotList] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  const activeProvider =
    WEB_STYLES.find((s) => s.id === activeStyleId)?.provider || providers.light;

  // The tab bar is hidden in wide landscape windows (same rule as AppNavigator)
  const isTabletLandscape = windowWidth > windowHeight && windowWidth > 800;
  const tabBarHeight = useBottomTabBarHeight();

  const dynamicStyles = getStyles(theme, isTabletLandscape, tabBarHeight);

  const handleSaveSpot = (spotData: Omit<Spot, 'id' | 'coordinates' | 'rating'>) => {
    // Web implementation: simple geolocation or center of map
    const newLocation = {
      latitude: center[0],
      longitude: center[1],
    };

    const newSpot: Spot = {
      id: Date.now().toString(),
      ...spotData,
      coordinates: newLocation,
      rating: 0, // Default rating
    };

    addSpot(newSpot);
  };

  const navigateToSpot = (spot: Spot) => {
    const { latitude, longitude } = spot.coordinates;
    window.open(googleMapsRouteUrl(latitude, longitude), '_blank', 'noopener,noreferrer');
  };

  return (
    <View style={dynamicStyles.container}>
      <View style={dynamicStyles.mapContainer}>
        <MapView
          height={windowHeight}
          width={windowWidth}
          center={center}
          zoom={zoom}
          onBoundsChanged={({ center, zoom }) => {
            setCenter(center);
            setZoom(zoom);
          }}
          provider={activeProvider}
          metaWheelZoom
        >
          {spots.map((spot) => (
            <Marker
              key={spot.id}
              width={40}
              anchor={[spot.coordinates.latitude, spot.coordinates.longitude]}
            >
              <View
                // @ts-ignore - Direct DOM interaction for Web
                onClick={(e: any) => {
                  e.stopPropagation();
                  console.log('DOM Click:', spot.name);
                  setSelectedSpot(spot);
                }}
                style={{
                  width: 40,
                  height: 40,
                  justifyContent: 'center',
                  alignItems: 'center',
                  cursor: 'pointer',
                  // @ts-ignore
                  pointerEvents: 'auto',
                }}
              >
                <Icon name="MapPin" color={theme.colors.error} size={32} />
              </View>
            </Marker>
          ))}
        </MapView>
      </View>

      {/* Przyciski boczne */}
      <View style={dynamicStyles.sideButtons}>
        <TouchableOpacity
          style={dynamicStyles.sideButton}
          onPress={() => setShowSpotList(!showSpotList)}
        >
          <Icon name="List" color={theme.colors.primary} size={24} />
        </TouchableOpacity>
        <View style={{ height: 10 }} />
        <TouchableOpacity style={dynamicStyles.sideButton} onPress={() => setShowMenu(!showMenu)}>
          <Icon name="Layers" color={theme.colors.primary} size={24} />
        </TouchableOpacity>
      </View>

      {/* FAB - Dodawanie Spota */}
      <TouchableOpacity
        onPress={() => setShowAddModal(true)}
        // Blocked until saved spots load, so a new spot cannot overwrite them.
        disabled={!canAddSpots}
        style={[dynamicStyles.fab, !canAddSpots && { opacity: 0.5 }]}
        activeOpacity={0.8}
      >
        <Icon name="Plus" size={32} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Menu wyboru stylu (Web specific overlay) */}
      {showMenu && (
        <View style={dynamicStyles.webMenu}>
          <Typography variant="h3" style={dynamicStyles.menuTitle}>
            Styl mapy
          </Typography>
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
                color={activeStyleId === style.id ? 'primary' : 'text'}
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

      {/* Spot List Sidebar (Web) */}
      {showSpotList && (
        <View style={dynamicStyles.spotListContainer}>
          <View style={dynamicStyles.spotListHeader}>
            <Typography variant="h3">Dostępne Spoty</Typography>
            <TouchableOpacity onPress={() => setShowSpotList(false)}>
              <Icon name="X" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
          <ScrollView style={dynamicStyles.spotListContent}>
            {spots.map((spot) => (
              <TouchableOpacity
                key={spot.id}
                style={dynamicStyles.spotListItem}
                onPress={() => {
                  setSelectedSpot(spot);
                  setCenter([spot.coordinates.latitude, spot.coordinates.longitude]);
                  setZoom(15);
                  // Don't close the list, allow browsing
                }}
              >
                <View style={dynamicStyles.spotListItemContent}>
                  <Typography variant="body" style={{ fontWeight: 'bold' }}>
                    {spot.name}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {spot.type.toUpperCase()} • {spot.difficulty}
                  </Typography>
                </View>
                <Icon name="ChevronRight" size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <SpotImageViewer
        images={selectedSpot?.images ?? []}
        initialIndex={selectedSpot ? viewerIndex : null}
        onClose={() => setViewerIndex(null)}
      />

      {/* Spot Details Overlay (Web) */}
      {selectedSpot && (
        <View style={dynamicStyles.webSpotCard}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Typography variant="h3">{selectedSpot.name}</Typography>
            <TouchableOpacity onPress={() => setSelectedSpot(null)}>
              <Icon name="X" size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Galeria zdjęć (Web) */}
          {selectedSpot.images && selectedSpot.images.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator
              style={{ marginVertical: 12 }}
              contentContainerStyle={{ paddingRight: 20 }}
            >
              {selectedSpot.images.map((img, index, all) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setViewerIndex(index)}
                  accessibilityRole="button"
                  accessibilityLabel={`Powiększ zdjęcie ${index + 1} z ${all.length}`}
                >
                  <Image
                    source={{ uri: img }}
                    resizeMode="cover"
                    style={{
                      width: 120,
                      height: 80,
                      borderRadius: 8,
                      marginRight: 8,
                      backgroundColor: theme.colors.background,
                    }}
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          <Typography variant="body" style={{ marginTop: 8 }}>
            {selectedSpot.description}
          </Typography>
          <Typography variant="caption" style={{ marginTop: 8, color: theme.colors.textSecondary }}>
            Typ: {selectedSpot.type.toUpperCase()}
          </Typography>
          <TouchableOpacity
            style={dynamicStyles.navigateButton}
            onPress={() => navigateToSpot(selectedSpot)}
            accessibilityRole="button"
            accessibilityLabel={`Nawiguj do spotu ${selectedSpot.name}`}
          >
            <Typography variant="label" style={{ color: '#fff' }}>
              Nawiguj
            </Typography>
          </TouchableOpacity>
        </View>
      )}

      {/* Modal dodawania spota */}
      <AddSpotModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleSaveSpot}
      />

      {/* Overlay to close menu when clicking outside */}
      {showMenu && (
        <TouchableWithoutFeedback onPress={() => setShowMenu(false)}>
          <View style={dynamicStyles.fullScreenOverlay} />
        </TouchableWithoutFeedback>
      )}
    </View>
  );
}

// Bottom offsets sit above the tab bar; wide landscape keeps the old fixed values
const getStyles = (theme: any, isTabletLandscape: boolean, tabBarHeight: number) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    mapContainer: {
      ...StyleSheet.absoluteFill,
      backgroundColor: '#f5f5f5',
      overflow: 'hidden',
      zIndex: -1,
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
    fab: {
      position: 'absolute',
      bottom: isTabletLandscape ? theme.spacing.xl + 90 : tabBarHeight + theme.spacing.xl + 20,
      right: theme.spacing.md,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
      cursor: 'pointer', // Web specific
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
    navigateButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.md,
      paddingVertical: 12,
      alignItems: 'center',
      marginTop: theme.spacing.lg,
    },
    webSpotCard: {
      position: 'absolute',
      bottom: isTabletLandscape ? 100 : tabBarHeight + 30,
      left: 20,
      right: 20,
      backgroundColor: theme.colors.surface,
      padding: 20,
      borderRadius: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 10,
      elevation: 10,
      zIndex: 20,
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
    },
    spotListContainer: {
      position: 'absolute',
      left: 20,
      top: 100,
      bottom: isTabletLandscape ? 100 : tabBarHeight + 30,
      width: 300,
      backgroundColor: theme.colors.surface + 'CC', // 80% opacity
      // @ts-ignore
      backdropFilter: 'blur(10px)', // Web specific
      borderRadius: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 10,
      elevation: 10,
      zIndex: 30,
      display: 'flex',
      flexDirection: 'column',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    spotListHeader: {
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    spotListContent: {
      flex: 1,
    },
    spotListItem: {
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      cursor: 'pointer',
    },
    spotListItemContent: {
      flex: 1,
    },
  });
