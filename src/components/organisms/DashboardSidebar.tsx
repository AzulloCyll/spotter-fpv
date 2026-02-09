import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { TopBar } from './TopBar';
import { FlightStatus } from './FlightStatus';
import { WeatherSummary } from './WeatherSummary';
import { QuickNavigation } from './QuickNavigation';
import { SidebarNav } from './SidebarNav';
import { Icon } from '../atoms/Icon';
import { LinearGradient } from 'expo-linear-gradient';

interface DashboardSidebarProps {
    navigation: any;
    isTabletLandscape: boolean;
    onNavigate?: (screen: string) => void;
    style?: any;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
    navigation,
    isTabletLandscape,
    onNavigate,
    style
}) => {
    const { theme, isDark } = useTheme();
    const dynamicStyles = getStyles(theme);

    const handleNavigate = (screen: string) => {
        if (onNavigate) {
            onNavigate(screen);
        } else {
            navigation.navigate(screen);
        }
    };

    return (
        <View style={[
            dynamicStyles.dashboardColumn,
            isTabletLandscape ? { width: '30%', maxWidth: 400, flex: 0 } : { flex: 1 },
            isDark && { backgroundColor: theme.colors.background, borderRightColor: 'rgba(255,255,255,0.1)' },
            style
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
                <TopBar />

                <View style={{ paddingHorizontal: isTabletLandscape ? 15 : theme.spacing.lg }}>
                    <FlightStatus />
                    <WeatherSummary />
                    <QuickNavigation onNavigate={handleNavigate} />
                </View>

                <View style={{ height: 60 }} />
            </ScrollView>

            {isTabletLandscape && <SidebarNav />}
        </View>
    );
};

const getStyles = (theme: any) => StyleSheet.create({
    container: {
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
});
