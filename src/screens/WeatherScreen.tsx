import React from 'react';
import { View, StyleSheet, ScrollView, type ViewStyle } from 'react-native';
import { theme } from '../theme';
import { Typography } from '../components/atoms/Typography';
import { Card } from '../components/atoms/Card';
import { Badge } from '../components/atoms/Badge';
import { IconButton } from '../components/atoms/IconButton';
import { Icon } from '../components/atoms/Icon';
import { useNavigation } from '@react-navigation/native';
import { MOCK_WEATHER_DATA, MOCK_LOCATION } from '../constants/mockData';

interface WeatherStatProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  desc: string;
  style?: ViewStyle;
}

const WeatherStat: React.FC<WeatherStatProps> = ({ icon, label, value, desc, style }) => (
  <View style={[styles.statItem, style]}>
    <View style={styles.statIcon}>{icon}</View>
    <View>
      <Typography variant="label" color="textSecondary">{label}</Typography>
      <Typography variant="h3">{value}</Typography>
      <Typography variant="caption" color="textSecondary">{desc}</Typography>
    </View>
  </View>
);

export default function WeatherScreen() {
  const navigation = useNavigation();
  const weather = MOCK_WEATHER_DATA;
  const location = MOCK_LOCATION;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <IconButton
          icon={<Icon name="ArrowLeft" />}
          onPress={() => navigation.goBack()}
          variant="ghost"
        />
        <View style={styles.locationInfo}>
          <Typography variant="h3">{location.name}</Typography>
          <Typography variant="caption" color="textSecondary">Ostatnia aktualizacja: przed chwilą</Typography>
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Card style={styles.mainCard}>
          <View style={styles.mainTemp}>
            <View>
              <Typography variant="h1" style={{ fontSize: 52, fontWeight: '800' }}>{weather.temp}°</Typography>
              <Badge
                label={`KP-INDEX: ${weather.kpIndex}`}
                variant={weather.kpIndex < 4 ? "success" : "warning"}
                pulse={weather.kpIndex > 4}
              />
            </View>
            <View style={styles.mainMeta}>
              <Typography variant="h3">{weather.condition}</Typography>
              <Typography variant="bodySmall" color="textSecondary">Odczuwalna: {weather.feelsLike}°C</Typography>
              <Typography variant="bodySmall" color="textSecondary">Opady: {weather.precipitation}%</Typography>
            </View>
          </View>
        </Card>

        <View style={styles.sectionTitle}>
          <Typography variant="label" color="textSecondary">Parametry Lotnicze</Typography>
        </View>

        <View style={styles.statsGrid}>
          <WeatherStat
            icon={<Icon name="Wind" size={20} color={theme.colors.primary} />}
            label="Wiatr"
            value={`${weather.windSpeed} km/h`}
            desc={`Porywy do ${weather.windGusts}`}
          />
          <WeatherStat
            icon={<Icon name="Droplets" size={20} color={theme.colors.primary} />}
            label="Wilgotność"
            value={`${weather.precipitation}%`}
            desc="Słabe opady"
          />
          <WeatherStat
            icon={<Icon name="Sun" size={20} color={theme.colors.primary} />}
            label="UV Index"
            value={weather.uvIndex.toString()}
            desc="Umiarkowany"
          />
          <WeatherStat
            icon={<Icon name="Navigation" size={20} color={theme.colors.primary} />}
            label="Widoczność"
            value={`${weather.visibility} km`}
            desc="Bardzo dobra"
          />
        </View>

        <Card style={styles.tipCard}>
          <Typography variant="h3" style={{ marginBottom: 6 }}>Wskazówka pilota</Typography>
          <Typography variant="bodySmall" color="textSecondary">
            Kp-Index jest stabilny. Warunki idealne na latanie przy samym gruncie (proxy), wiatr może znosić na większych wysokościach.
          </Typography>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
  },
  locationInfo: {
    marginLeft: 10,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  mainCard: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    ...theme.shadows.soft,
  },
  mainTemp: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mainMeta: {
    alignItems: 'flex-end',
  },
  sectionTitle: {
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statItem: {
    width: '48%',
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: theme.borderRadius.md,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    ...theme.shadows.soft,
  },
  statIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  tipCard: {
    padding: theme.spacing.lg - 4,
    backgroundColor: theme.colors.iconBg,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
  }
});
