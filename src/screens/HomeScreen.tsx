import React from 'react';
import { ScrollView, StyleSheet, View, SafeAreaView } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { WeatherSummary } from '../components/organisms/WeatherSummary';
import { QuickNavigation } from '../components/organisms/QuickNavigation';
import { TopBar } from '../components/organisms/TopBar';
import { FlightStatus } from '../components/organisms/FlightStatus';

export default function HomeScreen({ navigation }: any) {
  const { theme } = useTheme();
  const dynamicStyles = getStyles(theme);

  return (
    <View style={dynamicStyles.safeArea}>
      <ScrollView style={dynamicStyles.container} showsVerticalScrollIndicator={false}>
        <View style={dynamicStyles.topSpacer} />
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

const getStyles = (theme: any) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
  },
  topSpacer: {
    height: 80,
  }
});
