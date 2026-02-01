import React from 'react';
import { ScrollView, StyleSheet, View, SafeAreaView } from 'react-native';
import { theme } from '../theme';
import { WeatherSummary } from '../components/organisms/WeatherSummary';
import { QuickNavigation } from '../components/organisms/QuickNavigation';
import { TopBar } from '../components/organisms/TopBar';
import { FlightStatus } from '../components/organisms/FlightStatus';

export default function HomeScreen({ navigation }: any) {
  return (
    <View style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.topSpacer} />
        {/* Organizm: TopBar z Profilem i Alertami */}
        <TopBar />

        {/* Organizm: Status Lotu w stylu HUD */}
        <FlightStatus />

        {/* Organizm: Statystyki Pogodowe */}
        <WeatherSummary />

        {/* Organizm: Szybka Nawigacja */}
        <QuickNavigation onNavigate={(screen: string) => navigation.navigate(screen)} />

        {/* Dolny padding dla lepszego scrolla */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
  },
  topSpacer: {
    height: 80, // Zmniejszony odstęp pod mniejszy TopBar
  }
});
