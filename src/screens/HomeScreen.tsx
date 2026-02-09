import React from 'react';
import { ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { WeatherSummary } from '../components/organisms/WeatherSummary';
import { QuickNavigation } from '../components/organisms/QuickNavigation';
import { TopBar } from '../components/organisms/TopBar';
import { FlightStatus } from '../components/organisms/FlightStatus';
import { LinearGradient } from 'expo-linear-gradient';
import { SidebarNav } from '../components/organisms/SidebarNav';
import { FeaturedSpot } from '../components/organisms/FeaturedSpot';
import { PilotActivity } from '../components/organisms/PilotActivity';
import { CommunityGallery } from '../components/organisms/CommunityGallery';
import { Typography } from '../components/atoms/Typography';
import { Icon } from '../components/atoms/Icon';

export default function HomeScreen({ navigation }: any) {
  const { theme, isDark } = useTheme();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const isTabletLandscape = windowWidth > windowHeight && windowWidth > 800;
  const dynamicStyles = getStyles(theme);

  return (
    <View style={dynamicStyles.safeArea}>
      <View style={[dynamicStyles.mainWrapper, isTabletLandscape && { flexDirection: 'row' }]}>

        {/* DASHBOARD COLUMN (30%) */}
        <View style={[
          dynamicStyles.dashboardColumn,
          isTabletLandscape ? { width: '30%', maxWidth: 400, flex: 0 } : { flex: 1 }
        ]}>
          <LinearGradient
            colors={[theme.colors.background, theme.colors.primary + '25']}
            style={StyleSheet.absoluteFillObject}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 0.8 }}
          />

          {/* Tło: Wektorowe chmury */}
          <View style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]} pointerEvents="none">
            {/* STREFA 1: Góra */}
            <View style={{ position: 'absolute', top: -50, left: -50, opacity: isDark ? 0.05 : 0.9 }}>
              <Icon name="Cloud" size={250} color="#FFFFFF" strokeWidth={1} fill="#FFFFFF" />
            </View>
            <View style={{ position: 'absolute', top: 30, right: -40, opacity: isDark ? 0.05 : 0.8 }}>
              <Icon name="Cloud" size={180} color="#FFFFFF" strokeWidth={1} fill="#FFFFFF" />
            </View>
            <View style={{ position: 'absolute', top: 100, left: '55%', opacity: isDark ? 0.03 : 0.6 }}>
              <Icon name="Cloud" size={50} color="#FFFFFF" strokeWidth={1} fill="#FFFFFF" />
            </View>

            {/* STREFA 2: Środek */}
            <View style={{ position: 'absolute', top: 180, left: 20, opacity: isDark ? 0.03 : 0.7 }}>
              <Icon name="Cloud" size={80} color="#FFFFFF" strokeWidth={1} fill="#FFFFFF" />
            </View>
            <View style={{ position: 'absolute', top: 220, right: 10, opacity: isDark ? 0.04 : 0.75 }}>
              <Icon name="Cloud" size={120} color="#FFFFFF" strokeWidth={1} fill="#FFFFFF" />
            </View>

            {/* STREFA 3: Dół */}
            <View style={{ position: 'absolute', top: 320, left: -50, opacity: isDark ? 0.03 : 0.7 }}>
              <Icon name="Cloud" size={200} color="#FFFFFF" strokeWidth={1} fill="#FFFFFF" />
            </View>
          </View>

          <ScrollView
            style={dynamicStyles.container}
            showsVerticalScrollIndicator={false}
            scrollEnabled={!isTabletLandscape}
          >
            <View style={dynamicStyles.topSpacer} />
            <TopBar dark={false} />

            <View style={{ paddingHorizontal: isTabletLandscape ? 15 : theme.spacing.lg }}>
              <FlightStatus dark={false} />
              <WeatherSummary dark={false} />
              <QuickNavigation onNavigate={(screen: string) => navigation.navigate(screen)} />
            </View>

            <View style={{ height: 60 }} />
          </ScrollView>

          {isTabletLandscape && <SidebarNav />}
        </View>

        {/* PRAWA STRONA (CENTRUM DOWODZENIA) */}
        {isTabletLandscape && (
          <View style={[dynamicStyles.rightPanel, { backgroundColor: '#FFFFFF' }]}>
            <View style={dynamicStyles.rightContent}>
              <View style={styles.welcomeHeader}>
                <Typography variant="h1" style={{ fontSize: 26 }}>Centrum Dowodzenia</Typography>
                <Typography variant="bodySmall" color="textSecondary">Wszystko czego potrzebujesz przed dzisiejszym lotem</Typography>
              </View>

              <View style={[styles.mainGrid, { flex: 1 }]}>
                {/* Kolumna Lewa: Spot i Statystyki - teraz szersza */}
                <View style={{ flex: 1.5 }}>
                  <FeaturedSpot />

                  <View style={styles.statsRow}>
                    <View style={styles.quickStat}>
                      <Icon name="Activity" size={18} color={theme.colors.primary} />
                      <View style={{ marginLeft: 10 }}>
                        <Typography variant="h3" style={{ fontSize: 16 }}>12.5h</Typography>
                        <Typography variant="label" color="textSecondary" style={{ fontSize: 8 }}>Czas lotu</Typography>
                      </View>
                    </View>
                    <View style={styles.quickStat}>
                      <Icon name="MapPin" size={18} color={theme.colors.primary} />
                      <View style={{ marginLeft: 10 }}>
                        <Typography variant="h3" style={{ fontSize: 16 }}>8</Typography>
                        <Typography variant="label" color="textSecondary" style={{ fontSize: 8 }}>Spoty</Typography>
                      </View>
                    </View>
                  </View>

                  <View style={[styles.notamCard, { marginTop: 12 }]}>
                    <View style={styles.notamHeader}>
                      <Icon name="AlertTriangle" size={16} color={theme.colors.warning} />
                      <Typography variant="h3" style={{ marginLeft: 8, fontSize: 14 }}>NOTAM: Bemowo</Typography>
                    </View>
                    <Typography variant="bodySmall" color="textSecondary" numberOfLines={1}>
                      Wzmożona aktywność lotnictwa ogólnego. Zachowaj ostrożność.
                    </Typography>
                  </View>
                </View>

                {/* Kolumna Prawa: Aktywność - zwężona */}
                <View style={{ flex: 0.8, marginLeft: 20, maxWidth: 350 }}>
                  <PilotActivity />
                </View>
              </View>

              <CommunityGallery />
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  welcomeHeader: {
    marginBottom: 10,
  },
  mainGrid: {
    flexDirection: 'row',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 15,
  },
  quickStat: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.6)',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  notamCard: {
    marginTop: 15,
    padding: 15,
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  notamHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  batteryInfo: {
    marginTop: 15,
    padding: 15,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  batteryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  batteryCell: {
    flex: 1,
  }
});

const getStyles = (theme: any) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
  },
  mainWrapper: {
    flex: 1,
  },
  dashboardColumn: {
    backgroundColor: '#F8FAFC',
    borderRightWidth: 1,
    borderRightColor: 'rgba(0,0,0,0.05)',
    overflow: 'hidden',
  },
  topSpacer: {
    height: 60,
  },
  rightPanel: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  rightContent: {
    flex: 1,
    padding: 15,
    paddingTop: 25,
  }
});
