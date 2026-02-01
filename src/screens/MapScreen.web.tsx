import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Map, Marker, ZoomControl } from 'pigeon-maps';
import { stamenToner } from 'pigeon-maps/providers';
import { theme } from '../theme';

// Custom provider for dark mode maps (CartoDB Dark Matter)
const darkProvider = (x, y, z, dpr) => {
  return `https://a.basemaps.cartocdn.com/dark_all/${z}/${x}/${y}${dpr >= 2 ? '@2x' : ''}.png`;
};

export default function MapScreen() {
  const [center, setCenter] = useState([52.2297, 21.0122]); // Warsaw
  const [zoom, setZoom] = useState(12);

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        <Map
          height={null} // Important for flex
          center={center}
          zoom={zoom}
          onBoundsChanged={({ center, zoom }) => {
            setCenter(center);
            setZoom(zoom);
          }}
          provider={darkProvider}
          metaWheelZoom={true} // Cleaner zoom behavior
        >
          <ZoomControl />
          <Marker 
            width={50} 
            anchor={[52.2297, 21.0122]} 
            color={theme.colors.primary}
          />
        </Map>
      </View>
      
      <View style={styles.overlay}>
        <Text style={styles.title}>Spotter FPV (Web Native)</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  mapContainer: {
    flex: 1,
    backgroundColor: '#000', // Preventing white flash
    overflow: 'hidden',
  },
  overlay: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: theme.colors.glass,
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)', // For supported browsers
  },
  title: {
    color: theme.colors.primary,
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 0.5,
  }
});
