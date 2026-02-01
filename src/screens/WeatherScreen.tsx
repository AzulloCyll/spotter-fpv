import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Wind, Eye, Sun, Gauge } from 'lucide-react-native';
import { theme } from '../theme';

const WeatherCard = ({ title, value, unit, icon: Icon, color }) => (
  <View style={styles.card}>
    <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
      <Icon color={color} size={24} />
    </View>
    <View>
      <Text style={styles.cardLabel}>{title}</Text>
      <Text style={styles.cardValue}>{value} <Text style={styles.cardUnit}>{unit}</Text></Text>
    </View>
  </View>
);

export default function WeatherScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Warunki lotu</Text>
      
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.statusBanner}>
          <Text style={styles.statusText}>WARUNKI DOBRE DO LOTU</Text>
        </View>

        <View style={styles.grid}>
          <WeatherCard title="Wiatr" value="12" unit="km/h" icon={Wind} color="#00F0FF" />
          <WeatherCard title="Widoczność" value="10" unit="km" icon={Eye} color="#4CD964" />
          <WeatherCard title="Indeks KP" value="2" unit="low" icon={Gauge} color="#FFD600" />
          <WeatherCard title="UV" value="Low" unit="" icon={Sun} color="#FF4D00" />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 20,
  },
  statusBanner: {
    backgroundColor: '#4CD96420',
    borderColor: '#4CD964',
    borderWidth: 1,
    padding: 15,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    marginBottom: 20,
  },
  statusText: {
    color: '#4CD964',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: theme.colors.surface,
    padding: 15,
    borderRadius: theme.borderRadius.md,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    padding: 10,
    borderRadius: 10,
    marginRight: 12,
  },
  cardLabel: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    marginBottom: 2,
  },
  cardValue: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardUnit: {
    fontSize: 12,
    fontWeight: 'normal',
    color: theme.colors.textSecondary,
  },
});
