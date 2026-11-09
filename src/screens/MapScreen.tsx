import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Alert,
  ScrollView,
  Image,
  Linking,
  Platform,
} from 'react-native';
import { LeafletMap, LeafletMapRef } from '../components/organisms/LeafletMap';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import * as Location from 'expo-location';
import { useTheme } from '../theme/ThemeContext';
import { Typography } from '../components/atoms/Typography';
import { Icon } from '../components/atoms/Icon';
import { Spot } from '../data/mockSpots';
import { useSpots } from '../context/SpotsContext';
import { SpotsSidebarPanel } from '../components/organisms/SpotsSidebarPanel';

import { AddSpotModal } from '../components/organisms/AddSpotModal';
import { SpotImageViewer } from '../components/organisms/SpotImageViewer';
import { DashboardSidebar } from '../components/organisms/DashboardSidebar';

import { MAP_STYLES, MAP_LAYERS } from '../constants/mapStyles';
import { useIsTablet } from '../hooks/useIsTablet';
import { appleMapsRouteUrl, googleMapsRouteUrl } from '../utils/navigation';
import { DEFAULT_MAP_CENTER, LOCATION_PROBLEM_TEXT, type Coordinates } from '../utils/location';

import { RootTabScreenProps } from '../navigation/types';

// Memoize the Panel to prevent re-renders on keyboard open
const MemoizedSpotsSidebarPanel = React.memo(SpotsSidebarPanel);

export default function MapScreen({ navigation, route }: RootTabScreenProps<'Mapa'>) {
  const { theme, isDark } = useTheme();
  const { spots, addSpot, canAddSpots } = useSpots();
  const [activeStyleId, setActiveStyleId] = useState('hybrid');
  const [showOFM, setShowOFM] = useState(false);
  const [showRain, setShowRain] = useState(false);
  const [showWind, setShowWind] = useState(false);

  const { isTabletLandscape, sidebarWidth } = useIsTablet();

  const [showMenu, setShowMenu] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const [locationPermission, setLocationPermission] = useState<boolean>(false);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);

  const mapRef = useRef<LeafletMapRef>(null);
  const [showSpotsModal, setShowSpotsModal] = useState(false);
  const measuredTabBarHeight = useBottomTabBarHeight();
  const tabBarHeight = isTabletLandscape ? 0 : measuredTabBarHeight;

  const dynamicStyles = getStyles(theme, tabBarHeight);
  // const mapCenterRelativeToScreen = sidebarWidth + (windowWidth - sidebarWidth) / 2;

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        const text = LOCATION_PROBLEM_TEXT.denied;
        Alert.alert(text.title, text.message);
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

  // Centre of the visible map; a new spot is placed there (as on web).
  const mapCenterRef = useRef<Coordinates>(DEFAULT_MAP_CENTER);
  // True once the map reported a move; from then on only MAP_MOVE sets the centre.
  const mapMovedRef = useRef(false);

  // Fallback for the location arriving before any MAP_MOVE. The map's own jump to the
  // user sends MAP_MOVE too, and it skips the jump when the pilot already moved the map.
  useEffect(() => {
    if (userLocation && !mapMovedRef.current) {
      mapCenterRef.current = {
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude,
      };
    }
  }, [userLocation]);

  // A dark mode change reloads the map page at its first centre (the default, as the
  // location comes later) without MAP_MOVE; a jump to the user, if any, reports itself.
  const isFirstThemeRef = useRef(true);
  useEffect(() => {
    if (isFirstThemeRef.current) {
      isFirstThemeRef.current = false;
      return;
    }
    mapCenterRef.current = DEFAULT_MAP_CENTER;
    mapMovedRef.current = false;
  }, [isDark]);

  const handleSaveSpot = (spotData: Omit<Spot, 'id' | 'coordinates' | 'rating'>) => {
    const newLocation = { ...mapCenterRef.current };

    const newSpot: Spot = {
      id: Date.now().toString(),
      ...spotData,
      coordinates: newLocation,
      rating: 0,
    };

    addSpot(newSpot);
    mapRef.current?.animateTo(newLocation.latitude, newLocation.longitude, 15);
  };

  const handleSpotPress = useCallback((spot: Spot) => {
    setSelectedSpot(spot);
    // Center map on spot so popup can be positioned relative to center
    mapRef.current?.animateTo(spot.coordinates.latitude, spot.coordinates.longitude, 15);
  }, []);

  const handlePanelSpotSelect = useCallback(
    (spot: Spot) => {
      handleSpotPress(spot);
      mapRef.current?.animateTo(spot.coordinates.latitude, spot.coordinates.longitude, 15);
    },
    [handleSpotPress],
  );

  const handlePanelClose = useCallback(() => setShowSpotsModal(false), []);

  const closeSpotDetails = () => {
    setSelectedSpot(null);
  };

  const navigateToSpot = (spot: Spot) => {
    const { latitude, longitude } = spot.coordinates;
    const url = Platform.select({
      ios: appleMapsRouteUrl(latitude, longitude),
      default: googleMapsRouteUrl(latitude, longitude),
    });
    Linking.openURL(url).catch(() => {
      Alert.alert(
        'Nie można otworzyć map',
        'Nie udało się uruchomić aplikacji map na tym telefonie.',
      );
    });
  };

  return (
    <View style={dynamicStyles.container}>
      {/* Main Layout Wrapper: Sidebar + Map area */}
      <View style={[dynamicStyles.contentWrapper, isTabletLandscape && { flexDirection: 'row' }]}>
        {isTabletLandscape && (
          <DashboardSidebar
            navigation={navigation}
            isTabletLandscape={isTabletLandscape}
            style={{ height: '100%', width: sidebarWidth, zIndex: 2000 }}
            onNavigate={(screen) => {
              if (screen === 'Mapa') setShowSpotsModal(!showSpotsModal);
              else navigation.navigate(screen as any);
            }}
          />
        )}

        <View style={{ flex: 1, position: 'relative', zIndex: 1 }}>
          <LeafletMap
            ref={mapRef}
            initialRegion={{
              latitude: userLocation?.coords.latitude ?? DEFAULT_MAP_CENTER.latitude,
              longitude: userLocation?.coords.longitude ?? DEFAULT_MAP_CENTER.longitude,
              latitudeDelta: 0.15,
              longitudeDelta: 0.15,
            }}
            spots={spots}
            activeStyleId={activeStyleId}
            showOFM={showOFM}
            showRain={showRain}
            showWind={showWind}
            isDark={isDark}
            onMarkerPress={handleSpotPress}
            onMapMove={(center) => {
              mapMovedRef.current = true;
              mapCenterRef.current = { latitude: center.lat, longitude: center.lng };
            }}
          />
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
      <View
        style={{
          position: 'absolute',
          bottom: isTabletLandscape ? 40 : tabBarHeight + theme.spacing.xl + 20,
          left: isTabletLandscape ? sidebarWidth + 20 : 16,
          alignItems: 'center',
          zIndex: 10,
          elevation: 10,
        }}
      >
        <TouchableOpacity
          onPress={() => setShowAddModal(true)}
          // Blocked until saved spots load, so a new spot cannot overwrite them.
          disabled={!canAddSpots}
          style={[
            dynamicStyles.fab,
            { backgroundColor: theme.colors.primary + 'D9' },
            !canAddSpots && { opacity: 0.5 },
          ]}
        >
          <Icon name="Plus" size={32} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Floating Buttons Group (Right: Layers/Location) */}
      <View
        style={[
          dynamicStyles.fabContainer,
          isTabletLandscape && { right: 20, bottom: 40 },
          { flexDirection: 'row', alignItems: 'flex-end', zIndex: 10 },
        ]}
      >
        <TouchableOpacity
          onPress={() => setShowMenu(!showMenu)}
          style={[
            dynamicStyles.fab,
            {
              backgroundColor: showMenu
                ? theme.colors.primary
                : isDark
                  ? 'rgba(30, 41, 59, 0.85)'
                  : 'rgba(255, 255, 255, 0.85)',
              marginRight: 16,
              borderWidth: 1,
              borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
            },
          ]}
        >
          <Icon name="Layers" size={26} color={showMenu ? '#FFFFFF' : theme.colors.primary} />
        </TouchableOpacity>

        {/* Location + Compass Column */}
        <View style={{ alignItems: 'center' }}>
          <TouchableOpacity
            onPress={async () => {
              if (locationPermission) {
                const location = await Location.getCurrentPositionAsync({});
                mapRef.current?.animateTo(location.coords.latitude, location.coords.longitude, 13);
              }
            }}
            style={[
              dynamicStyles.fab,
              {
                backgroundColor: isDark ? 'rgba(30, 41, 59, 0.85)' : 'rgba(255, 255, 255, 0.85)',
                borderWidth: 1,
                borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
              },
            ]}
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

      <SpotImageViewer
        images={selectedSpot?.images ?? []}
        initialIndex={selectedSpot ? viewerIndex : null}
        onClose={() => setViewerIndex(null)}
      />

      {selectedSpot && (
        <View
          style={
            isTabletLandscape
              ? [dynamicStyles.spotCardContainerTablet, { right: 20, left: 'auto' }]
              : dynamicStyles.spotCardContainer
          }
        >
          <TouchableWithoutFeedback onPress={closeSpotDetails}>
            <View style={dynamicStyles.spotCard}>
              <View
                style={[dynamicStyles.spotTypeBadge, { backgroundColor: theme.colors.primary }]}
              >
                <Typography variant="caption" style={{ color: '#fff' }}>
                  {selectedSpot.type.toUpperCase()}
                </Typography>
              </View>
              <View style={dynamicStyles.spotHeader}>
                <View style={{ flex: 1, marginRight: 10 }}>
                  <Typography variant="h3" numberOfLines={1} ellipsizeMode="tail">
                    {selectedSpot.name}
                  </Typography>
                </View>
                <TouchableOpacity onPress={closeSpotDetails} style={{ padding: 4 }}>
                  <Icon name="X" size={20} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {selectedSpot.images && selectedSpot.images.length > 0 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{ marginVertical: 12 }}
                >
                  {selectedSpot.images.map((img: string, index: number, all: string[]) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => setViewerIndex(index)}
                      accessibilityRole="button"
                      accessibilityLabel={`Powiększ zdjęcie ${index + 1} z ${all.length}`}
                    >
                      <Image
                        source={{ uri: img }}
                        style={{ width: 120, height: 80, borderRadius: 8, marginRight: 8 }}
                      />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}

              <Typography variant="body" color="textSecondary">
                {selectedSpot.description}
              </Typography>

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
          </TouchableWithoutFeedback>
        </View>
      )}

      {showMenu && (
        <>
          <TouchableWithoutFeedback onPress={() => setShowMenu(false)}>
            <View style={StyleSheet.absoluteFill} />
          </TouchableWithoutFeedback>
          <View
            style={{
              position: 'absolute',
              bottom: isTabletLandscape ? 105 : tabBarHeight + theme.spacing.xl + 85,
              right: 20,
              width: 240,
              backgroundColor: theme.colors.surface,
              borderRadius: 16,
              padding: 8,
              zIndex: 2000,
              borderWidth: 1,
              borderColor: theme.colors.border,
              ...theme.shadows.medium,
            }}
          >
            <Typography variant="label" style={{ padding: 8, opacity: 0.6 }}>
              Styl bazowy
            </Typography>
            {MAP_STYLES.map((style) => (
              <TouchableOpacity
                key={style.id}
                onPress={() => setActiveStyleId(style.id)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 10,
                  borderRadius: 10,
                  backgroundColor:
                    activeStyleId === style.id
                      ? isDark
                        ? 'rgba(79, 70, 229, 0.2)'
                        : 'rgba(79, 70, 229, 0.1)'
                      : 'transparent',
                  marginBottom: 2,
                }}
              >
                <View style={{ marginRight: 12 }}>
                  <Icon
                    name={style.icon}
                    size={18}
                    color={
                      activeStyleId === style.id ? theme.colors.primary : theme.colors.textSecondary
                    }
                  />
                </View>
                <Typography
                  variant="bodySmall"
                  style={{ fontWeight: activeStyleId === style.id ? '700' : '400', flex: 1 }}
                >
                  {style.label}
                </Typography>
                {activeStyleId === style.id && (
                  <Icon name="Check" size={14} color={theme.colors.primary} />
                )}
              </TouchableOpacity>
            ))}

            <View
              style={{
                height: 1,
                backgroundColor: theme.colors.border,
                marginVertical: 8,
                marginHorizontal: 8,
              }}
            />

            <Typography variant="label" style={{ padding: 8, opacity: 0.6 }}>
              Warstwy dodatkowe
            </Typography>
            {MAP_LAYERS.map((layer) => {
              const isActive =
                (layer.id === 'ofm' && showOFM) ||
                (layer.id === 'rain' && showRain) ||
                (layer.id === 'wind' && showWind);
              const toggle = () => {
                if (layer.id === 'ofm') setShowOFM(!showOFM);
                if (layer.id === 'rain') setShowRain(!showRain);
                if (layer.id === 'wind') setShowWind(!showWind);
              };

              return (
                <TouchableOpacity
                  key={layer.id}
                  onPress={toggle}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 10,
                    borderRadius: 10,
                    backgroundColor: isActive
                      ? isDark
                        ? 'rgba(34, 197, 94, 0.15)'
                        : 'rgba(34, 197, 94, 0.1)'
                      : 'transparent',
                    marginBottom: 2,
                  }}
                >
                  <View style={{ marginRight: 12 }}>
                    <Icon
                      name={layer.icon}
                      size={18}
                      color={isActive ? theme.colors.green : theme.colors.textSecondary}
                    />
                  </View>
                  <Typography
                    variant="bodySmall"
                    style={{ fontWeight: isActive ? '700' : '400', flex: 1 }}
                  >
                    {layer.label}
                  </Typography>
                  <View
                    style={{
                      width: 34,
                      height: 20,
                      borderRadius: 10,
                      backgroundColor: isActive ? theme.colors.green : theme.colors.border,
                      padding: 2,
                      justifyContent: 'center',
                      alignItems: isActive ? 'flex-end' : 'flex-start',
                    }}
                  >
                    <View
                      style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: '#fff' }}
                    />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </>
      )}
    </View>
  );
}

// Bottom offsets sit above the tab bar (tabBarHeight is 0 on tablet landscape)
const getStyles = (theme: any, tabBarHeight: number) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    map: {
      ...StyleSheet.absoluteFill,
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
      bottom: tabBarHeight + theme.spacing.xl + 20,
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
      bottom: tabBarHeight + theme.spacing.xl - 10,
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
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
    },
  });
