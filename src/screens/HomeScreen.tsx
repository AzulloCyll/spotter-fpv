import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { DashboardSidebar } from '../components/organisms/DashboardSidebar';
import { FeaturedSpot } from '../components/organisms/FeaturedSpot';
import { PilotActivity } from '../components/organisms/PilotActivity';
import { CommunityGallery } from '../components/organisms/CommunityGallery';
import { Typography } from '../components/atoms/Typography';
import { useIsTablet } from '../hooks/useIsTablet';

import { RootTabScreenProps } from '../navigation/types';

export default function HomeScreen({ navigation }: RootTabScreenProps<'Start'>) {
  const { theme } = useTheme();
  const { isTabletLandscape } = useIsTablet();
  const dynamicStyles = getStyles(theme);

  return (
    <View style={dynamicStyles.safeArea}>
      <View style={[dynamicStyles.mainWrapper, isTabletLandscape && { flexDirection: 'row' }]}>
        {/* DASHBOARD COLUMN (30%) */}
        <DashboardSidebar
          navigation={navigation}
          isTabletLandscape={isTabletLandscape}
          style={isTabletLandscape ? { width: '35%', maxWidth: 480, flex: 0 } : { flex: 1 }}
        />

        {/* PRAWA STRONA (CENTRUM DOWODZENIA) */}
        {isTabletLandscape && (
          <View style={[dynamicStyles.rightPanel, { backgroundColor: theme.colors.background }]}>
            <View style={dynamicStyles.rightContent}>
              <View style={styles.welcomeHeader}>
                <Typography variant="h1" style={{ fontSize: 26, color: theme.colors.text }}>
                  Centrum Dowodzenia
                </Typography>
                <Typography variant="bodySmall" color="textSecondary">
                  Wszystko czego potrzebujesz przed dzisiejszym lotem
                </Typography>
              </View>

              <View style={[styles.mainGrid, { flex: 1 }]}>
                {/* Kolumna Lewa: Spot i Statystyki - teraz szersza */}
                <View style={{ flex: 1.5 }}>
                  <FeaturedSpot />
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
  },
});

const getStyles = (theme: any) =>
  StyleSheet.create({
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
    },
  });
