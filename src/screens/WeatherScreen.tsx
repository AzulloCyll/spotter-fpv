import React from 'react';
import { View, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import { Typography } from '../components/atoms/Typography';
import { Card } from '../components/atoms/Card';
import { Badge } from '../components/atoms/Badge';
import { IconButton } from '../components/atoms/IconButton';
import { Icon } from '../components/atoms/Icon';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import { DashboardSidebar } from '../components/organisms/DashboardSidebar';
import { LinearGradient } from 'expo-linear-gradient';
import { MOCK_WEATHER_DATA, MOCK_LOCATION } from '../constants/mockData';

interface WeatherStatProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  desc: string;
  style?: any;
  dynamicStyles: any;
}

const WeatherStat: React.FC<WeatherStatProps> = ({ icon, label, value, desc, style, dynamicStyles }) => (
  <View style={[dynamicStyles.statItem, style]}>
    <View style={dynamicStyles.statIcon}>{icon}</View>
    <View>
      <Typography variant="label" color="textSecondary">{label}</Typography>
      <Typography variant="h3">{value}</Typography>
      <Typography variant="caption" color="textSecondary">{desc}</Typography>
    </View>
  </View>
);

import { RootTabParamList } from '../navigation/types';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

import { KpIndexChart } from '../components/molecules/KpIndexChart';
import { PrecipitationChart } from '../components/molecules/PrecipitationChart';
import { WindChart } from '../components/molecules/WindChart';

export default function WeatherScreen() {
  const navigation = useNavigation<BottomTabNavigationProp<RootTabParamList>>();
  const { theme, isDark } = useTheme();
  const weather = MOCK_WEATHER_DATA;
  const location = MOCK_LOCATION;
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const isTabletLandscape = windowWidth > windowHeight && windowWidth > 800;

  const dynamicStyles = getStyles(theme);
  const numColumns = isTabletLandscape ? 3 : (windowWidth > 800 ? 5 : 2);
  const itemWidth = `${(100 / numColumns) - 2}%` as any;

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
                icon={<Icon name="ArrowLeft" />}
                onPress={() => navigation.goBack()}
                variant="ghost"
              />
            )}
            <View style={dynamicStyles.headerContent}>
              <View style={dynamicStyles.locationRow}>
                <View>
                  <Typography variant="h3" color="textPrimary">{location.name}</Typography>
                  <Typography variant="caption" color="textSecondary">Szczegółowa prognoza lotnicza</Typography>
                </View>
                <View style={dynamicStyles.headerTemp}>
                  <Typography variant="h2" style={{ fontWeight: '800', marginRight: 8 }}>{weather.temp}°</Typography>
                  <Badge
                    label={`KP: ${weather.kpIndex}`}
                    variant={weather.kpIndex < 4 ? "success" : "warning"}
                  />
                </View>
              </View>
            </View>
          </View>

          <ScrollView
            style={dynamicStyles.content}
            contentContainerStyle={dynamicStyles.scrollContent}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <View style={dynamicStyles.statsGrid}>
              <WeatherStat
                dynamicStyles={dynamicStyles}
                style={{ width: itemWidth }}
                icon={<Icon name="Wind" size={18} color={theme.colors.primary} />}
                label="Wiatr"
                value={`${weather.windSpeed} km/h`}
                desc={`Porywy ${weather.windGusts}`}
              />
              <WeatherStat
                dynamicStyles={dynamicStyles}
                style={{ width: itemWidth }}
                icon={<Icon name="Droplets" size={18} color={theme.colors.primary} />}
                label="Wilgotność"
                value={`${weather.precipitation}%`}
                desc="Brak opadów"
              />
              <WeatherStat
                dynamicStyles={dynamicStyles}
                style={{ width: itemWidth }}
                icon={<Icon name="Sun" size={18} color={theme.colors.primary} />}
                label="UV Index"
                value={weather.uvIndex.toString()}
                desc="Umiarkowany"
              />
              <WeatherStat
                dynamicStyles={dynamicStyles}
                style={{ width: itemWidth }}
                icon={<Icon name="Navigation" size={18} color={theme.colors.primary} />}
                label="Widoczność"
                value={`${weather.visibility} km`}
                desc="Bardzo dobra"
              />
              <WeatherStat
                dynamicStyles={dynamicStyles}
                style={{ width: itemWidth }}
                icon={<Icon name="Thermometer" size={18} color={theme.colors.primary} />}
                label="Odczuwalna"
                value={`${weather.feelsLike}°`}
                desc={weather.condition}
              />
            </View>



            <Card style={dynamicStyles.chartCard}>
              <WindChart forecast={weather.windForecast} />
            </Card>

            <Card style={dynamicStyles.chartCard}>
              <PrecipitationChart forecast={weather.precipitationForecast} />
            </Card>

            <View style={dynamicStyles.tipBanner}>
              <Icon name="Lightbulb" size={16} color={theme.colors.primary} />
              <Typography variant="caption" color="textSecondary" style={{ marginLeft: 8, flex: 1 }}>
                KP jest stabilne. Idealne na latanie przy gruncie.
              </Typography>
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
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border + '33',
  },
  headerContent: {
    flex: 1,
    marginLeft: 10,
  },
  locationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTemp: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  statItem: {
    backgroundColor: theme.colors.surface,
    padding: 12,
    borderRadius: theme.borderRadius.md,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    ...theme.shadows.soft,
  },
  statIcon: {
    marginRight: 8,
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
