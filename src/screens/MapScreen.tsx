import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal, TouchableWithoutFeedback, Alert, ScrollView, Image, useWindowDimensions, Keyboard, Animated } from 'react-native';
import MapView, { PROVIDER_GOOGLE, MapType } from 'react-native-maps';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { MOCK_MAP_STYLE_ID } from '../constants/mockData';
import { useTheme } from '../theme/ThemeContext';
import { Typography } from '../components/atoms/Typography';
import { IconButton } from '../components/atoms/IconButton';
import { Input } from '../components/atoms/Input';
import { Icon } from '../components/atoms/Icon';
import { MOCK_SPOTS, Spot } from '../data/mockSpots';
import { SpotMarker } from '../components/molecules/SpotMarker';
import { useSpots } from '../context/SpotsContext';
import { SpotsSidebarPanel } from '../components/organisms/SpotsSidebarPanel';

// Memoize the Panel to prevent re-renders on keyboard open
const MemoizedSpotsSidebarPanel = memo(SpotsSidebarPanel);
import { AddSpotModal } from '../components/organisms/AddSpotModal';
import { DashboardSidebar } from '../components/organisms/DashboardSidebar';

const MAP_STYLES = [
  { id: 'standard', label: 'Standardowa', type: 'standard' as MapType, icon: 'Map' as const },
  { id: 'satellite', label: 'Satelita', type: 'satellite' as MapType, icon: 'Globe' as const },
  { id: 'hybrid', label: 'Hybrydowa', type: 'hybrid' as MapType, icon: 'Layers' as const },
  { id: 'dark', label: 'Ciemna', type: 'standard' as MapType, customStyle: true, icon: 'Moon' as const },
];

import { RootTabScreenProps } from '../navigation/types';

export default function MapScreen({ navigation, route }: RootTabScreenProps<'Mapa'>) {
  const { theme, isDark } = useTheme();
  const { spots, addSpot } = useSpots();
  const [activeStyleId, setActiveStyleId] = useState('hybrid');
  const [mapHeading, setMapHeading] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
  const [locationPermission, setLocationPermission] = useState<boolean>(false);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  // Simplified check to avoid keyboard flickering issues (keyboard reduces height, potentially breaking W > H logic if unstable)
  // We assume if width > 800, it's a tablet-like width (or landscape phone). 
  // We keep W > H check but maybe rely on width being determining factor for "Sidebar" mode.
  // Actually, let's just use width for stability during keyboard events.
  const isTabletLandscape = windowWidth > 800;
  const mapRef = useRef<MapView>(null);
  const [showSpotsModal, setShowSpotsModal] = useState(false);
  const insets = useSafeAreaInsets();

  const activeStyleConfig = MAP_STYLES.find(s => s.id === activeStyleId) || MAP_STYLES[0];
  const mapType = activeStyleConfig.type;

  const customStyle = activeStyleId === 'dark' || (activeStyleId === 'standard' && isDark)
    ? darkMapStyle
    : lightMapStyle;

  const dynamicStyles = getStyles(theme);
  const sidebarWidth = isTabletLandscape ? Math.min(windowWidth * 0.3, 400) : 0;
  const mapCenterRelativeToScreen = sidebarWidth + (windowWidth - sidebarWidth) / 2;

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Brak uprawnień', 'Nie możemy pokazać Twojej lokalizacji bez zgody.');
        return;
      }
      setLocationPermission(true);
      const location = await Location.getCurrentPositionAsync({});
      setUserLocation(location);
    })();
  }, []);

  useEffect(() => {
    if (route.params?.openList) {
      setShowSpotsModal(true);
      // Clear param so it doesn't reopen on every focus if we don't want to?
      // Actually standard behavior is fine, or we can setParams({ openList: undefined })
      navigation.setParams({ openList: undefined });
    }
  }, [route.params?.openList]);

  const handleSaveSpot = (spotData: Omit<Spot, 'id' | 'coordinates' | 'rating'>) => {
    const newLocation = userLocation ? {
      latitude: userLocation.coords.latitude,
      longitude: userLocation.coords.longitude,
    } : {
      latitude: 52.2297,
      longitude: 21.0122,
    };

    const newSpot: Spot = {
      id: Date.now().toString(),
      ...spotData,
      coordinates: newLocation,
      rating: 0,
    };

    addSpot(newSpot);
    mapRef.current?.animateToRegion({
      ...newLocation,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  };

  const handleStyleSelect = (style: typeof MAP_STYLES[0]) => {
    setActiveStyleId(style.id);
    setShowMenu(false);
  };

  const handleSpotPress = useCallback((spot: Spot) => {
    setSelectedSpot(spot);
    // Center map on spot so popup can be positioned relative to center
    mapRef.current?.animateToRegion({
      ...spot.coordinates,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  }, []);

  const handlePanelSpotSelect = useCallback((spot: Spot) => {
    handleSpotPress(spot);
    mapRef.current?.animateToRegion({
      ...spot.coordinates,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  }, [handleSpotPress]);

  const handlePanelClose = useCallback(() => setShowSpotsModal(false), []);

  const closeSpotDetails = () => {
    setSelectedSpot(null);
  };

  return (
    <View style={dynamicStyles.container}>
      {/* Main Layout Wrapper: Sidebar + Map area */}
      <View style={[dynamicStyles.contentWrapper, isTabletLandscape && { flexDirection: 'row' }]}>
        {isTabletLandscape && (
          <DashboardSidebar
            navigation={navigation}
            isTabletLandscape={isTabletLandscape}
            style={{ height: '100%', width: sidebarWidth, zIndex: 1500 }}
            onNavigate={(screen) => {
              if (screen === 'Mapa') setShowSpotsModal(!showSpotsModal);
              else navigation.navigate(screen as any);
            }}
          />
        )}

        <View style={{ flex: 1, position: 'relative', zIndex: 1 }}>
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={StyleSheet.absoluteFill}
            mapType={mapType}
            initialRegion={{
              latitude: 52.2297,
              longitude: 21.0122,
              latitudeDelta: 0.15,
              longitudeDelta: 0.15,
            }}
            customMapStyle={customStyle}
            zoomControlEnabled={false}
            showsUserLocation={locationPermission}
            showsMyLocationButton={false}
            showsCompass={false}
            // @ts-ignore - capture heading for smooth rotation
            onCameraChange={async (e: any) => {
              const h = e.nativeEvent?.camera?.heading ?? e.nativeEvent?.heading ?? e.heading;
              if (typeof h === 'number') {
                setMapHeading(h);
              } else {
                const camera = await mapRef.current?.getCamera();
                if (camera) setMapHeading(camera.heading);
              }
            }}
            onRegionChangeComplete={async () => {
              const camera = await mapRef.current?.getCamera();
              if (camera) setMapHeading(camera.heading);
            }}
            onUserLocationChange={(e) => {
              // optional: track user heading if needed, but map heading is camera based
            }}
          >
            {spots.map((spot) => (
              <SpotMarker
                key={spot.id}
                spot={spot}
                onPress={handleSpotPress}
              />
            ))}
          </MapView>
        </View>

        {isTabletLandscape && (
          <MemoizedSpotsSidebarPanel
            key="spots-panel"
            visible={showSpotsModal}
            onClose={handlePanelClose}
            spots={spots}
            onSpotSelect={handlePanelSpotSelect}
            style={{ left: sidebarWidth, zIndex: 1000 }}
          />
        )}
      </View>

      {/* Floating Buttons Group (Left: Add/Compass) */}
      <View style={{
        position: 'absolute',
        bottom: isTabletLandscape ? 40 : theme.spacing.xl + 90,
        left: isTabletLandscape ? sidebarWidth + 20 : 16,
        alignItems: 'center',
        zIndex: 10,
        elevation: 10,
      }}>
        <TouchableOpacity
          onPress={() => setShowAddModal(true)}
          style={[dynamicStyles.fab, { backgroundColor: theme.colors.primary + 'D9' }]}
        >
          <Icon name="Plus" size={32} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Floating Buttons Group (Right: Layers/Location) */}
      <View style={[dynamicStyles.fabContainer, isTabletLandscape && { right: 20, bottom: 40 }, { flexDirection: 'row', alignItems: 'flex-end', zIndex: 10 }]}>
        <TouchableOpacity
          onPress={() => setShowMenu(!showMenu)}
          style={[dynamicStyles.fab, {
            backgroundColor: showMenu
              ? theme.colors.primary
              : (isDark ? 'rgba(30, 41, 59, 0.85)' : 'rgba(255, 255, 255, 0.85)'),
            marginRight: 16,
            borderWidth: 1,
            borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
          }]}
        >
          <Icon name="Layers" size={26} color={showMenu ? "#FFFFFF" : theme.colors.primary} />
        </TouchableOpacity>

        {/* Location + Compass Column */}
        <View style={{ alignItems: 'center' }}>
          <TouchableOpacity
            style={[dynamicStyles.fab, {
              backgroundColor: isDark ? 'rgba(30, 41, 59, 0.3)' : 'rgba(255, 255, 255, 0.3)',
              marginBottom: 16,
              borderWidth: 1,
              borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            }]}
            onPress={() => {
              mapRef.current?.animateCamera({ heading: 0 });
              setMapHeading(0);
            }}
          >
            <View
              style={{
                transform: [{ rotate: `${-mapHeading}deg` }]
              }}
              pointerEvents="none"
            >
              <View style={{ width: 9, height: 48, alignItems: 'center' }}>
                <View style={{ width: 0, height: 0, borderLeftWidth: 9, borderRightWidth: 9, borderBottomWidth: 24, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: '#f33a3a' }} />
                <View style={{ width: 0, height: 0, borderLeftWidth: 9, borderRightWidth: 9, borderTopWidth: 24, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: '#e0e0e0' }} />
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={async () => {
              if (locationPermission) {
                const location = await Location.getCurrentPositionAsync({});
                mapRef.current?.animateToRegion({
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude,
                  latitudeDelta: 0.05,
                  longitudeDelta: 0.05,
                });
              }
            }}
            style={[dynamicStyles.fab, {
              backgroundColor: isDark ? 'rgba(30, 41, 59, 0.85)' : 'rgba(255, 255, 255, 0.85)',
              borderWidth: 1,
              borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
            }]}
          >
            <Icon name="Navigation" size={28} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Overlays: Modals, Popovers, Details */}
      <AddSpotModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleSaveSpot}
      />

      {selectedSpot && (
        <View style={isTabletLandscape
          ? [dynamicStyles.spotCardContainerTablet, { right: 20, left: 'auto' }]
          : dynamicStyles.spotCardContainer
        }>
          <TouchableWithoutFeedback onPress={closeSpotDetails}>
            <View style={dynamicStyles.spotCard}>
              <View style={[dynamicStyles.spotTypeBadge, { backgroundColor: theme.colors.primary }]}>
                <Typography variant="caption" style={{ color: '#fff' }}>{selectedSpot.type.toUpperCase()}</Typography>
              </View>
              <View style={dynamicStyles.spotHeader}>
                <View style={{ flex: 1, marginRight: 10 }}>
                  <Typography variant="h3" numberOfLines={1} ellipsizeMode="tail">{selectedSpot.name}</Typography>
                </View>
                <TouchableOpacity onPress={closeSpotDetails} style={{ padding: 4 }}>
                  <Icon name="X" size={20} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {selectedSpot.images && selectedSpot.images.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 12 }}>
                  {selectedSpot.images.map((img, index) => (
                    <Image key={index} source={{ uri: img }} style={{ width: 120, height: 80, borderRadius: 8, marginRight: 8 }} />
                  ))}
                </ScrollView>
              )}

              <Typography variant="body" color="textSecondary">{selectedSpot.description}</Typography>

              <View style={dynamicStyles.spotMeasures}>
                <View style={dynamicStyles.measureItem}>
                  <Icon name="Activity" size={16} color={theme.colors.warning} />
                  <Typography variant="caption">Trudność: {selectedSpot.difficulty}</Typography>
                </View>
                <View style={dynamicStyles.measureItem}>
                  <Icon name="Star" size={16} color={theme.colors.secondary} />
                  <Typography variant="caption">Ocena: {selectedSpot.rating}</Typography>
                </View>
              </View>

              <TouchableOpacity style={dynamicStyles.navigateButton}>
                <Typography variant="label" style={{ color: '#fff' }}>Nawiguj</Typography>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      )}

      {showMenu && (
        <>
          <TouchableWithoutFeedback onPress={() => setShowMenu(false)}>
            <View style={StyleSheet.absoluteFill} />
          </TouchableWithoutFeedback>
          <View style={{
            position: 'absolute',
            bottom: isTabletLandscape ? 105 : theme.spacing.xl + 155,
            right: isTabletLandscape ? 20 : 20, // Align with FABs
            width: 220,
            backgroundColor: theme.colors.surface,
            borderRadius: 16,
            padding: 8,
            zIndex: 2000,
            borderWidth: 1,
            borderColor: theme.colors.border,
            ...theme.shadows.medium,
          }}>
            <Typography variant="label" style={{ padding: 8 }}>Styl mapy</Typography>
            {MAP_STYLES.map((style) => (
              <TouchableOpacity
                key={style.id}
                onPress={() => handleStyleSelect(style)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 12,
                  borderRadius: 10,
                  backgroundColor: activeStyleId === style.id ? (isDark ? 'rgba(79, 70, 229, 0.2)' : 'rgba(79, 70, 229, 0.1)') : 'transparent',
                  marginBottom: 4,
                }}
              >
                <View style={{ marginRight: 12, opacity: activeStyleId === style.id ? 1 : 0.6 }}>
                  <Icon
                    name={style.icon}
                    size={20}
                    color={activeStyleId === style.id ? theme.colors.primary : theme.colors.text}
                  />
                </View>
                <Typography
                  variant="body"
                  color={activeStyleId === style.id ? "primary" : "text"}
                  style={{ fontWeight: activeStyleId === style.id ? '600' : '400' }}
                >
                  {style.label}
                </Typography>
                {activeStyleId === style.id && (
                  <View style={{ flex: 1, alignItems: 'flex-end' }}>
                    <Icon name="Check" size={16} color={theme.colors.primary} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}
    </View>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  topContainer: {
    position: 'absolute',
    // top handles via style prop with insets
    left: theme.spacing.lg - 4,
    right: theme.spacing.lg - 4,
    zIndex: 100,
  },
  searchBarContainer: {
    marginBottom: 0,
    ...theme.shadows.medium,
  },
  sideButtons: {
    position: 'absolute',
    right: theme.spacing.lg - 4,
    top: 100,
  },
  contentWrapper: {
    flex: 1,
  },
  sidebar: {
    width: '30%',
    maxWidth: 400,
    backgroundColor: theme.colors.background,
    borderRightWidth: 1,
    borderRightColor: theme.colors.border,
    overflow: 'hidden',
  },
  sidebarHeader: {
    padding: 15,
    paddingBottom: 4,
  },
  sidebarSearch: {
    paddingHorizontal: 15,
    marginBottom: theme.spacing.md,
  },
  sidebarContent: {
    flex: 1,
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    borderLeftWidth: 4,
    borderLeftColor: 'transparent',
  },
  fabContainer: {
    position: 'absolute',
    bottom: theme.spacing.xl + 90,
    right: theme.spacing.md,
  },
  sideButton: {
    backgroundColor: theme.colors.surface,
    ...theme.shadows.medium,
  },
  markerContainer: {
    padding: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  menuContent: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.borderRadius.lg + 4,
    borderTopRightRadius: theme.borderRadius.lg + 4,
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xl + 8,
  },
  menuTitle: {
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '600',
  },
  spotCardContainer: {
    position: 'absolute',
    bottom: theme.spacing.xl + 60,
    left: theme.spacing.md,
    maxWidth: 380,
    zIndex: 1000,
  },
  spotCardContainerTablet: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 360,
    justifyContent: 'center',
    zIndex: 1000,
  },
  spotCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    ...theme.shadows.strong,
  },
  spotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.xs,
  },
  spotTypeBadge: {
    position: 'absolute',
    top: -10,
    left: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  spotMeasures: {
    flexDirection: 'row',
    marginTop: theme.spacing.md,
  },
  measureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: theme.spacing.lg,
  },
  navigateButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: theme.spacing.lg,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  }
});

const lightMapStyle = [
  { "elementType": "geometry", "stylers": [{ "color": "#f5f5f5" }] },
  { "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#616161" }] },
  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#f5f5f5" }] },
  { "featureType": "poi", "elementType": "geometry", "stylers": [{ "color": "#eeeeee" }] },
  { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
  { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#ffffff" }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#c9c9c9" }] }
];

const darkMapStyle = [
  { "elementType": "geometry", "stylers": [{ "color": "#212121" }] },
  { "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#212121" }] },
  { "featureType": "administrative", "elementType": "geometry", "stylers": [{ "color": "#757575" }] },
  { "featureType": "poi", "elementType": "geometry", "stylers": [{ "color": "#2c2c2c" }] },
  { "featureType": "road", "elementType": "geometry.fill", "stylers": [{ "color": "#2c2c2c" }] },
  { "featureType": "road", "elementType": "labels.text.fill", "stylers": [{ "color": "#8a8a8a" }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#000000" }] }
];
