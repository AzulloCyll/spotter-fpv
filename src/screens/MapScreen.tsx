import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal, TouchableWithoutFeedback, Alert, ScrollView, Image, useWindowDimensions, Keyboard } from 'react-native';
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
  { id: 'standard', label: 'Standardowa', type: 'standard' as MapType },
  { id: 'satellite', label: 'Satelita', type: 'satellite' as MapType },
  { id: 'hybrid', label: 'Hybrydowa', type: 'hybrid' as MapType },
  { id: 'dark', label: 'Ciemna', type: 'standard' as MapType, customStyle: true },
];

import { RootTabScreenProps } from '../navigation/types';

export default function MapScreen({ navigation, route }: RootTabScreenProps<'Mapa'>) {
  const { theme, isDark } = useTheme();
  const { spots, addSpot } = useSpots();
  const [activeStyleId, setActiveStyleId] = useState('hybrid');
  const [showMenu, setShowMenu] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
  const [searchQuery, setSearchQuery] = useState(''); // Used for Spots Modal (Explore)
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
      {/* Split View Content */}
      <View style={[dynamicStyles.contentWrapper, isTabletLandscape && { flexDirection: 'row' }]}>

        {/* Lewy Panel (Dashboard style z SG) */}
        {isTabletLandscape && (
          <DashboardSidebar
            navigation={navigation}
            isTabletLandscape={isTabletLandscape}
            style={{ flex: 1, height: '100%', maxWidth: 400 }}
            onNavigate={(screen) => {
              if (screen === 'Mapa') setShowSpotsModal(true);
              else navigation.navigate(screen as any);
            }}
          />
        )}

        <View style={{ flex: 1, position: 'relative' }}>
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
          >
            {spots.map((spot) => (
              <SpotMarker
                key={spot.id}
                spot={spot}
                onPress={handleSpotPress}
              />
            ))}
          </MapView>
          {isTabletLandscape && (
            <MemoizedSpotsSidebarPanel
              key="spots-panel"
              visible={showSpotsModal}
              onClose={handlePanelClose}
              spots={spots}
              onSpotSelect={handlePanelSpotSelect}
            />
          )}

          {!showSpotsModal && (
            <View
              style={{
                position: 'absolute',
                top: (insets.top || 40) + 10,
                left: 16,
                right: 16,
                zIndex: 10,
              }}
              pointerEvents="box-none"
            >
              <View
                style={{
                  backgroundColor: theme.colors.surface,
                  borderRadius: theme.borderRadius.md,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 3.84,
                  elevation: 5,
                }}
                pointerEvents="auto"
              >
                <Input
                  placeholder="Szukaj spotów..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  icon={<Icon name="Search" color={theme.colors.textSecondary} size={20} />}
                  containerStyle={{ marginBottom: 0, height: 50, borderRadius: theme.borderRadius.md, borderBottomWidth: 0 }}
                />
              </View>

              {searchQuery.length > 0 && (
                <View style={{
                  marginTop: 4,
                  backgroundColor: theme.colors.surface,
                  borderRadius: theme.borderRadius.md,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 3.84,
                  elevation: 5,
                  overflow: 'hidden',
                }}>
                  <ScrollView style={{ maxHeight: 200 }} keyboardShouldPersistTaps="handled">
                    {spots
                      .filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map((spot, index, array) => (
                        <TouchableOpacity
                          key={spot.id}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            padding: 12,
                            borderBottomWidth: index === array.length - 1 ? 0 : 1,
                            borderBottomColor: theme.colors.border,
                          }}
                          onPress={() => {
                            setSelectedSpot(spot);
                            setSearchQuery('');
                            Keyboard.dismiss();
                            mapRef.current?.animateToRegion({
                              ...spot.coordinates,
                              latitudeDelta: 0.01,
                              longitudeDelta: 0.01,
                            }, 1000);
                          }}
                        >
                          <View style={{ marginRight: 8 }}>
                            <Icon name="MapPin" size={16} color={theme.colors.textSecondary} />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Typography variant="bodySmall" style={{ fontWeight: '600' }}>{spot.name}</Typography>
                            <Typography variant="caption" color="textSecondary" numberOfLines={1}>
                              {spot.type.toUpperCase()} • {spot.difficulty}
                            </Typography>
                          </View>
                        </TouchableOpacity>
                      ))}
                    {spots.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                      <View style={{ padding: 12, alignItems: 'center' }}>
                        <Typography variant="caption" color="textSecondary">Brak wyników</Typography>
                      </View>
                    )}
                  </ScrollView>
                </View>
              )}
            </View>
          )}

          <View style={[dynamicStyles.sideButtons, isTabletLandscape && { right: 20 }]}>
            <IconButton
              icon={<Icon name="Navigation" size={24} />}
              onPress={async () => {
                if (locationPermission) {
                  const location = await Location.getCurrentPositionAsync({});
                  mapRef.current?.animateToRegion({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                  });
                } else {
                  Alert.alert('Brak uprawnień', 'Włącz lokalizację w ustawieniach.');
                }
              }}
              style={dynamicStyles.sideButton}
            />
            <IconButton
              icon={<Icon name="Layers" size={24} />}
              onPress={() => setShowMenu(true)}
              style={[dynamicStyles.sideButton, { marginTop: theme.spacing.md }]}
            />
          </View>

          <View style={[dynamicStyles.fabContainer, isTabletLandscape && { right: 20, bottom: 40 }, { flexDirection: 'row', alignItems: 'center' }]}>
            <TouchableOpacity
              onPress={() => setShowSpotsModal(!showSpotsModal)}
              style={[dynamicStyles.fab, { backgroundColor: theme.colors.surface, marginRight: 16 }]}
              activeOpacity={0.8}
            >
              <Icon name="List" size={24} color={theme.colors.text} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowAddModal(true)}
              style={dynamicStyles.fab}
              activeOpacity={0.8}
            >
              <Icon name="Plus" size={32} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <AddSpotModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleSaveSpot}
      />

      {selectedSpot && (
        <View style={dynamicStyles.spotCardContainer}>
          <TouchableWithoutFeedback onPress={closeSpotDetails}>
            <View style={dynamicStyles.spotCard}>
              <View style={[dynamicStyles.spotTypeBadge, { backgroundColor: theme.colors.primary }]}>
                <Typography variant="caption" style={{ color: '#fff' }}>{selectedSpot.type.toUpperCase()}</Typography>
              </View>
              <View style={dynamicStyles.spotHeader}>
                <Typography variant="h3">{selectedSpot.name}</Typography>
                <TouchableOpacity onPress={closeSpotDetails}>
                  <Icon name="X" size={20} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {selectedSpot.images && selectedSpot.images.length > 0 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{ marginVertical: 12 }}
                  contentContainerStyle={{ paddingRight: 20 }}
                >
                  {selectedSpot.images.map((img, index) => (
                    <Image
                      key={index}
                      source={{ uri: img }}
                      style={{
                        width: 120,
                        height: 80,
                        borderRadius: 8,
                        marginRight: 8,
                        backgroundColor: theme.colors.background
                      }}
                    />
                  ))}
                </ScrollView>
              )}

              <Typography variant="body" color="textSecondary" style={{ marginTop: 4 }}>
                {selectedSpot.description}
              </Typography>

              <View style={dynamicStyles.spotMeasures}>
                <View style={dynamicStyles.measureItem}>
                  <Icon name="Activity" size={16} color={theme.colors.warning} />
                  <Typography variant="caption" style={{ marginLeft: 4 }}>Trudność: {selectedSpot.difficulty}</Typography>
                </View>
                <View style={dynamicStyles.measureItem}>
                  <Icon name="Star" size={16} color={theme.colors.secondary} />
                  <Typography variant="caption" style={{ marginLeft: 4 }}>Ocena: {selectedSpot.rating}</Typography>
                </View>
              </View>

              <TouchableOpacity style={dynamicStyles.navigateButton}>
                <Typography variant="label" style={{ color: '#fff' }}>Nawiguj</Typography>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      )
      }

      {/* Menu wyboru stylu - Popover */}
      {showMenu && (
        <>
          {/* Backdrop to close menu on outside click */}
          <TouchableWithoutFeedback onPress={() => setShowMenu(false)}>
            <View style={StyleSheet.absoluteFill} />
          </TouchableWithoutFeedback>

          {/* Popover Menu */}
          <View style={{
            position: 'absolute',
            top: 100 + theme.spacing.md, // Aligned with the second button (Layers)
            right: theme.spacing.lg + 50, // To the left of the button
            backgroundColor: theme.colors.surface,
            borderRadius: theme.borderRadius.md,
            padding: 8,
            minWidth: 150,
            ...theme.shadows.medium,
            zIndex: 1000,
          }}>
            <Typography variant="label" color="textSecondary" style={{ marginBottom: 8, paddingHorizontal: 8 }}>Styl mapy</Typography>
            {MAP_STYLES.map((style) => (
              <TouchableOpacity
                key={style.id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 8,
                  paddingHorizontal: 8,
                  borderRadius: theme.borderRadius.sm,
                  backgroundColor: activeStyleId === style.id ? theme.colors.primary + '10' : 'transparent',
                }}
                onPress={() => handleStyleSelect(style)}
              >
                <View style={{ marginRight: 8 }}>
                  <Icon
                    name={style.id === 'dark' ? 'Moon' : style.id === 'satellite' ? 'Globe' : 'Map'}
                    size={16}
                    color={activeStyleId === style.id ? theme.colors.primary : theme.colors.textSecondary}
                  />
                </View>
                <Typography
                  variant="caption"
                  color={activeStyleId === style.id ? "primary" : "text"}
                  style={{ fontWeight: activeStyleId === style.id ? '600' : '400' }}
                >
                  {style.label}
                </Typography>
                {activeStyleId === style.id && (
                  <View style={{ flex: 1, alignItems: 'flex-end' }}>
                    <Icon name="Check" color={theme.colors.primary} size={14} />
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
    right: theme.spacing.md,
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
