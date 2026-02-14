import React from 'react';
import { View, StyleSheet, ScrollView, useWindowDimensions, ActivityIndicator } from 'react-native';
import { Typography } from '../components/atoms/Typography';
import { Card } from '../components/atoms/Card';
import { Badge } from '../components/atoms/Badge';
import { IconButton } from '../components/atoms/IconButton';
import { Icon } from '../components/atoms/Icon';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import { DashboardSidebar } from '../components/organisms/DashboardSidebar';
import { LinearGradient } from 'expo-linear-gradient';
import { useWeather } from '../hooks/useWeather';

interface WeatherStatProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  style?: any;
  dynamicStyles: any;
}

const StatPill: React.FC<WeatherStatProps> = ({ icon, label, value, style, dynamicStyles }) => (
  <View style={[dynamicStyles.statPill, style]}>
    <View style={dynamicStyles.statIcon}>{icon}</View>
    <Typography variant="label" style={{ fontSize: 11, fontWeight: '700' }}>{value}</Typography>
  </View>
);

import { RootTabParamList } from '../navigation/types';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

import { KpIndexChart } from '../components/molecules/KpIndexChart';
import { PrecipitationChart } from '../components/molecules/PrecipitationChart';
import { WindChart } from '../components/molecules/WindChart';

import { TemperatureChart } from '../components/molecules/TemperatureChart';

export default function WeatherScreen() {
  const navigation = useNavigation<BottomTabNavigationProp<RootTabParamList>>();
  const { theme, isDark } = useTheme();

  const { weather, location, loading, error, refetch } = useWeather();

  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const isTabletLandscape = windowWidth > windowHeight && windowWidth > 800;

  const dynamicStyles = getStyles(theme);
  const numColumns = isTabletLandscape ? 3 : (windowWidth > 800 ? 5 : 2);
  const itemWidth = `${(100 / numColumns) - 2}%` as any;

  if (loading) {
    return (
      <View style={[dynamicStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Typography variant="body" color="textSecondary" style={{ marginTop: 16 }}>
          Pobieranie danych pogodowych...
        </Typography>
      </View>
    );
  }

  if (error || !weather || !location) {
    return (
      <View style={[dynamicStyles.container, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
        <Icon name="AlertTriangle" size={48} color={theme.colors.error} />
        <Typography variant="h3" style={{ marginTop: 16, textAlign: 'center' }}>
          Błąd pobierania pogody
        </Typography>
        <Typography variant="body" color="textSecondary" style={{ marginTop: 8, textAlign: 'center', marginBottom: 24 }}>
          {error || "Nie udało się pobrać danych locally."}
        </Typography>
        <IconButton
          icon={<Icon name="RefreshCw" />}
          onPress={refetch}
          variant="primary"
        />
        <Typography variant="label" color="primary" style={{ marginTop: 8 }}>
          Spróbuj ponownie
        </Typography>
      </View>
    );
  }

  return (
    <View style={dynamicStyles.container}>
      <View style={[dynamicStyles.mainWrapper, isTabletLandscape && { flexDirection: 'row' }]}>

        {isTabletLandscape && (
          <DashboardSidebar
            navigation={navigation}
            isTabletLandscape={isTabletLandscape}
            style={{ width: '30%', maxWidth: 400 }}
          />
        )}

        {/* PRAWY PANEL (Pogoda) */}
        <View style={{ flex: 1 }}>
          <View style={dynamicStyles.header}>
            {!isTabletLandscape && (
              <IconButton
                icon={<Icon name="ArrowLeft" color={theme.colors.primary} />}
                onPress={() => navigation.goBack()}
                variant="ghost"
              />
            )}
            <View style={dynamicStyles.headerContent}>
              <View style={dynamicStyles.locationContainer}>
                <Typography variant="h3" color="primary">{location.name}</Typography>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={dynamicStyles.headerStatsRow}
                contentContainerStyle={dynamicStyles.headerStatsRowContent}
              >
                {/* 1. Temp */}
                {/* 1. Temp */}
                <StatPill
                  dynamicStyles={dynamicStyles}
                  icon={<Icon name="Thermometer" size={12} color={theme.colors.primary} />}
                  label="Temp"
                  value={`${weather.temp}°C`}
                />

                {/* 2. Odczuwalna */}
                <StatPill
                  dynamicStyles={dynamicStyles}
                  icon={<Icon name="Thermometer" size={12} color={theme.colors.text} />}
                  label="Odczuwalna"
                  value={`Odcz. ${weather.feelsLike}°C`}
                />

                {/* 3. Opady */}
                <StatPill
                  dynamicStyles={dynamicStyles}
                  icon={<Icon name="CloudRain" size={12} color={theme.colors.text} />}
                  label="Opady"
                  value={`${weather.precipitation} mm`}
                />

                {/* 4. Wilgotność */}
                <StatPill
                  dynamicStyles={dynamicStyles}
                  icon={<Icon name="Droplets" size={12} color={theme.colors.text} />}
                  label="Wilgotność"
                  value={`${weather.humidity}%`}
                />

                {/* 5. Wiatr */}
                <StatPill
                  dynamicStyles={dynamicStyles}
                  icon={<Icon name="Wind" size={12} color={theme.colors.text} />}
                  label="Wiatr"
                  value={`${weather.windSpeed} km/h`}
                />
              </ScrollView>
            </View>
          </View>

          <ScrollView
            style={dynamicStyles.content}
            contentContainerStyle={dynamicStyles.scrollContent}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >

            <Typography variant="h2" style={{ paddingHorizontal: 20, marginBottom: 12, marginTop: 20, textAlign: 'center' }}>Prognoza godzinowa</Typography>



            <View style={{ marginBottom: 40 }}>
              <WindChart forecast={weather.windForecast} />
            </View>


            <View style={{ marginBottom: 40 }}>
              <PrecipitationChart forecast={weather.precipitationForecast} />
            </View>

            <View style={{ marginBottom: 40 }}>
              <TemperatureChart forecast={weather.tempForecast} />
            </View>

          </ScrollView>
        </View>
      </View>
    </View>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary + '08',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.primary + '20',
    gap: 8,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  locationContainer: {
    marginRight: 12,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 12,
    paddingBottom: 20,
  },
  mainWrapper: {
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
  headerStatsRow: {
    flexGrow: 0,
    marginTop: 0,
    marginHorizontal: 0,
    marginLeft: 'auto', // Push to right
  },
  headerStatsRowContent: {
    paddingHorizontal: 0,
    gap: 8,
    alignItems: 'center',
    justifyContent: 'flex-end', // Align items to right
  },
  statPill: {
    backgroundColor: theme.colors.surface,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 50, // Full rounded pill
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    height: 28, // Fixed height for consistent look
  },
  statIcon: {
    marginRight: 6,
  },
  chartCard: {
    padding: 12,
    marginBottom: 12,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 0,
    ...theme.shadows.card,
  },
  tipBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: theme.colors.primary + '10',
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary + '20',
  }
});
