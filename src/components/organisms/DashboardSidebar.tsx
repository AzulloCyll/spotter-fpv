import React from 'react';
import { View, StyleSheet, ScrollView, StyleProp, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useTheme } from '../../theme/ThemeContext';
import type { Theme } from '../../theme';
import { TopBar } from './TopBar';
import { FlightStatus } from './FlightStatus';
import { QuickNavigation } from './QuickNavigation';
import { SidebarNav } from './SidebarNav';
import { Icon } from '../atoms/Icon';
import { LinearGradient } from 'expo-linear-gradient';

import { RootTabParamList } from '../../navigation/types';

interface DashboardSidebarProps {
  // Only what the sidebar needs; method syntax keeps the typed tab navigator assignable.
  navigation: {
    navigate(
      screen: keyof RootTabParamList,
      params?: RootTabParamList[keyof RootTabParamList],
    ): void;
  };
  isTabletLandscape: boolean;
  onNavigate?: (
    screen: keyof RootTabParamList,
    params?: RootTabParamList[keyof RootTabParamList],
  ) => void;
  style?: StyleProp<ViewStyle>;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  navigation,
  isTabletLandscape,
  onNavigate,
  style,
}) => {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const dynamicStyles = getStyles(theme);
  const [topBarHeight, setTopBarHeight] = React.useState(insets.top + 78);

  const handleNavigate = (
    screen: keyof RootTabParamList,
    params?: RootTabParamList[keyof RootTabParamList],
  ) => {
    if (onNavigate) {
      onNavigate(screen, params);
    } else {
      navigation.navigate(screen, params);
    }
  };

  return (
    <View
      style={[
        dynamicStyles.dashboardColumn,
        // Not `flex: 0`: on web it becomes `flex: 0 1 0%`, which ignores the width and
        // collapses the column; grow/shrink 0 keeps the width on every platform.
        isTabletLandscape
          ? { width: '30%', maxWidth: 400, flexGrow: 0, flexShrink: 0 }
          : { flex: 1 },
        isDark && {
          backgroundColor: theme.colors.background,
          borderRightColor: theme.colors.border,
        },
        { zIndex: 1500, elevation: 1500 },
        style,
      ]}
    >
      <LinearGradient
        colors={[theme.colors.background, theme.colors.primary + '25']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.8 }}
      />

      {/* Tło: Wektorowe chmury */}
      <View style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]} pointerEvents="none">
        {/* STREFA 1: Góra */}
        <View style={{ position: 'absolute', top: -50, left: -50, opacity: isDark ? 0.05 : 0.9 }}>
          <Icon
            name="Cloud"
            size={250}
            color={theme.colors.white}
            strokeWidth={1}
            fill={theme.colors.white}
          />
        </View>
        <View style={{ position: 'absolute', top: 30, right: -40, opacity: isDark ? 0.05 : 0.8 }}>
          <Icon
            name="Cloud"
            size={180}
            color={theme.colors.white}
            strokeWidth={1}
            fill={theme.colors.white}
          />
        </View>
        <View style={{ position: 'absolute', top: 100, left: '55%', opacity: isDark ? 0.03 : 0.6 }}>
          <Icon
            name="Cloud"
            size={50}
            color={theme.colors.white}
            strokeWidth={1}
            fill={theme.colors.white}
          />
        </View>

        {/* STREFA 2: Środek */}
        <View style={{ position: 'absolute', top: 180, left: 20, opacity: isDark ? 0.03 : 0.7 }}>
          <Icon
            name="Cloud"
            size={80}
            color={theme.colors.white}
            strokeWidth={1}
            fill={theme.colors.white}
          />
        </View>
        <View style={{ position: 'absolute', top: 220, right: 10, opacity: isDark ? 0.04 : 0.75 }}>
          <Icon
            name="Cloud"
            size={120}
            color={theme.colors.white}
            strokeWidth={1}
            fill={theme.colors.white}
          />
        </View>

        {/* STREFA 3: Dół */}
        <View style={{ position: 'absolute', top: 320, left: -50, opacity: isDark ? 0.03 : 0.7 }}>
          <Icon
            name="Cloud"
            size={200}
            color={theme.colors.white}
            strokeWidth={1}
            fill={theme.colors.white}
          />
        </View>
      </View>

      <ScrollView
        style={dynamicStyles.container}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!isTabletLandscape}
      >
        <View style={{ height: topBarHeight }} />
        <TopBar onHeightChange={setTopBarHeight} />

        <View style={{ paddingHorizontal: isTabletLandscape ? 15 : theme.spacing.lg }}>
          <FlightStatus />
          <QuickNavigation onNavigate={handleNavigate} />
        </View>

        {/* Room for the tab bar, which overlays the screen (hidden on tablet landscape) */}
        <View style={{ height: isTabletLandscape ? 20 : tabBarHeight + 20 }} />
      </ScrollView>

      {isTabletLandscape && (
        <View style={{ paddingVertical: 4, paddingBottom: 8 }}>
          <SidebarNav />
        </View>
      )}
    </View>
  );
};

const getStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    dashboardColumn: {
      backgroundColor: theme.colors.background,
      borderRightWidth: 1,
      borderRightColor: theme.colors.border,
      overflow: 'hidden',
    },
  });
