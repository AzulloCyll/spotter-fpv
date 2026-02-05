import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal, TouchableWithoutFeedback } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker, MapType } from 'react-native-maps';
import { MOCK_MAP_STYLE_ID } from '../constants/mockData';
import { useTheme } from '../theme/ThemeContext';
import { Typography } from '../components/atoms/Typography';
import { Badge } from '../components/atoms/Badge';
import { IconButton } from '../components/atoms/IconButton';
import { Input } from '../components/atoms/Input';
import { Icon } from '../components/atoms/Icon';

const MAP_STYLES = [
  { id: 'standard', label: 'Standardowa', type: 'standard' as MapType },
  { id: 'satellite', label: 'Satelita', type: 'satellite' as MapType },
  { id: 'hybrid', label: 'Hybrydowa', type: 'hybrid' as MapType },
  { id: 'dark', label: 'Ciemna', type: 'standard' as MapType, customStyle: true },
];

export default function MapScreen() {
  const { theme, isDark } = useTheme();
  const [activeStyleId, setActiveStyleId] = useState(MOCK_MAP_STYLE_ID);
  const [showMenu, setShowMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const activeStyleConfig = MAP_STYLES.find(s => s.id === activeStyleId) || MAP_STYLES[0];
  const mapType = activeStyleConfig.type;

  // Custom map style logic: Dark specific, or Standard adapting to system theme
  const customStyle = activeStyleId === 'dark' || (activeStyleId === 'standard' && isDark)
    ? darkMapStyle
    : lightMapStyle;

  const handleStyleSelect = (style: typeof MAP_STYLES[0]) => {
    setActiveStyleId(style.id);
    setShowMenu(false);
  };

  const dynamicStyles = getStyles(theme);

  return (
    <View style={dynamicStyles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={dynamicStyles.map}
        mapType={mapType}
        initialRegion={{
          latitude: 52.2297,
          longitude: 21.0122,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        customMapStyle={customStyle}
        zoomControlEnabled={false}
      >
        <Marker
          coordinate={{ latitude: 52.2297, longitude: 21.0122 }}
          title="Spot FPV Warszawa"
          description="Fajny park do freestyle"
        >
          <View style={dynamicStyles.markerContainer}>
            <Icon name="MapPin" color={theme.colors.success} size={32} />
          </View>
        </Marker>
      </MapView>

      {/* Górna wyszukiwarka */}
      <View style={dynamicStyles.topContainer}>
        <Input
          placeholder="Szukaj spotów..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          icon={<Icon name="Search" color={theme.colors.textSecondary} size={20} />}
          containerStyle={dynamicStyles.searchBarContainer}
        />
      </View>

      {/* Przyciski boczne */}
      <View style={dynamicStyles.sideButtons}>
        <IconButton
          icon={<Icon name="Layers" size={24} />}
          onPress={() => setShowMenu(true)}
          style={dynamicStyles.sideButton}
        />
      </View>

      {/* Menu wyboru stylu */}
      <Modal
        visible={showMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowMenu(false)}>
          <View style={dynamicStyles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={dynamicStyles.menuContent}>
                <Typography variant="h3" style={dynamicStyles.menuTitle}>Styl mapy</Typography>
                {MAP_STYLES.map((style) => (
                  <TouchableOpacity
                    key={style.id}
                    style={dynamicStyles.menuItem}
                    onPress={() => handleStyleSelect(style)}
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
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
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
    top: theme.spacing.xl + 18,
    left: theme.spacing.lg - 4,
    right: theme.spacing.lg - 4,
  },
  searchBarContainer: {
    marginBottom: 0,
    ...theme.shadows.medium,
  },
  sideButtons: {
    position: 'absolute',
    right: theme.spacing.lg - 4,
    top: theme.spacing.xl * 4 + 2,
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
  { "featureType": "poi", "elementType": "geometry", "stylers": [{ "color": "#181818" }] },
  { "featureType": "road", "elementType": "geometry.fill", "stylers": [{ "color": "#2c2c2c" }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#000000" }] }
];
