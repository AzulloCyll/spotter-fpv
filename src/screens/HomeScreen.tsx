import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { DashboardSidebar } from '../components/organisms/DashboardSidebar';
import { FeaturedSpot } from '../components/organisms/FeaturedSpot';
import { PilotActivity } from '../components/organisms/PilotActivity';
import { CommunityGallery } from '../components/organisms/CommunityGallery';
import { Typography } from '../components/atoms/Typography';
import { Icon } from '../components/atoms/Icon';
import { useIsTablet } from '../hooks/useIsTablet';

import { RootTabScreenProps } from '../navigation/types';

export default function HomeScreen({ navigation }: RootTabScreenProps<'Start'>) {
  const { theme, isDark } = useTheme();
  const { isTabletLandscape } = useIsTablet();
  const dynamicStyles = getStyles(theme);

  return (
    <View style={dynamicStyles.safeArea}>
      <View style={[dynamicStyles.mainWrapper, isTabletLandscape && { flexDirection: 'row' }]}>

        {/* DASHBOARD COLUMN (30%) */}
        <DashboardSidebar
          navigation={navigation}
          isTabletLandscape={isTabletLandscape}
          style={isTabletLandscape ? { width: '30%', maxWidth: 400, flex: 0 } : { flex: 1 }}
        />

        {/* PRAWA STRONA (CENTRUM DOWODZENIA) */}
        {isTabletLandscape && (
          <View style={[dynamicStyles.rightPanel, { backgroundColor: theme.colors.background }]}>
            <View style={dynamicStyles.rightContent}>
              <View style={styles.welcomeHeader}>
                <Typography variant="h1" style={{ fontSize: 26, color: theme.colors.text }}>Centrum Dowodzenia</Typography>
                <Typography variant="bodySmall" color="textSecondary">Wszystko czego potrzebujesz przed dzisiejszym lotem</Typography>
              </View>

              <View style={[styles.mainGrid, { flex: 1 }]}>
                {/* Kolumna Lewa: Spot i Statystyki - teraz szersza */}
                <View style={{ flex: 1.5 }}>
                  <FeaturedSpot />

                  <View style={styles.statsRow}>
                    <View style={[styles.quickStat, isDark && styles.quickStatDark]}>
                      <Icon name="Activity" size={18} color={theme.colors.primary} />
                      <View style={{ marginLeft: 10 }}>
                        <Typography variant="h3" style={{ fontSize: 16, color: theme.colors.text }}>12.5h</Typography>
                        <Typography variant="label" color="textSecondary" style={{ fontSize: 8 }}>Czas lotu</Typography>
                      </View>
                    </View>
                    <View style={[styles.quickStat, isDark && styles.quickStatDark]}>
                      <Icon name="MapPin" size={18} color={theme.colors.primary} />
                      <View style={{ marginLeft: 10 }}>
                        <Typography variant="h3" style={{ fontSize: 16, color: theme.colors.text }}>8</Typography>
                        <Typography variant="label" color="textSecondary" style={{ fontSize: 8 }}>Spoty</Typography>
                      </View>
                    </View>
                  </View>

                  <View style={[styles.notamCard, isDark && styles.notamCardDark, { marginTop: 12 }]}>
                    <View style={styles.notamHeader}>
                      <Icon name="AlertTriangle" size={16} color={theme.colors.warning} />
                      <Typography variant="h3" style={{ marginLeft: 8, fontSize: 14, color: isDark ? theme.colors.warning : '#B45309' }}>NOTAM: Bemowo</Typography>
                    </View>
                    <Typography variant="bodySmall" style={{ color: isDark ? theme.colors.textSecondary : '#92400E' }} numberOfLines={1}>
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
  quickStatDark: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderColor: 'rgba(255,255,255,0.1)',
  },
  notamCard: {
    marginTop: 15,
    padding: 15,
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  notamCardDark: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: 'rgba(245, 158, 11, 0.2)',
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
