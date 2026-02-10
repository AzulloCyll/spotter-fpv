import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Typography } from '../components/atoms/Typography';
import { Badge } from '../components/atoms/Badge';
import { IconButton } from '../components/atoms/IconButton';
import { Divider } from '../components/atoms/Divider';
import { DataTile } from '../components/molecules/DataTile';
import { Icon } from '../components/atoms/Icon';
import { useNavigation } from '@react-navigation/native';
import { SidebarNav } from '../components/organisms/SidebarNav';
import { FlightStatus } from '../components/organisms/FlightStatus';
import { WeatherSummary } from '../components/organisms/WeatherSummary';
import { QuickNavigation } from '../components/organisms/QuickNavigation';
import { TopBar } from '../components/organisms/TopBar';
import { LinearGradient } from 'expo-linear-gradient';
import {
    MOCK_BATTERY,
    MOCK_SIGNAL,
    MOCK_GPS_POSITION,
    MOCK_IS_LINK_ACTIVE,
    MOCK_VTX_TEMP,
    MOCK_CPU_RES
} from '../constants/mockData';

import { RootTabParamList } from '../navigation/types';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

export default function TelemetryScreen() {
    const navigation = useNavigation<BottomTabNavigationProp<RootTabParamList>>();
    const { theme, isDark } = useTheme();
    const { width: windowWidth, height: windowHeight } = useWindowDimensions();
    const isTabletLandscape = windowWidth > windowHeight && windowWidth > 800;
    const dynamicStyles = getStyles(theme);

    // Mock Global State
    const battery = MOCK_BATTERY;
    const signal = MOCK_SIGNAL;
    const gps = MOCK_GPS_POSITION;
    const isLinkActive = MOCK_IS_LINK_ACTIVE;
    const vtxTemp = MOCK_VTX_TEMP;
    const cpuRes = MOCK_CPU_RES;

    return (
        <View style={dynamicStyles.container}>
            <View style={[dynamicStyles.mainWrapper, isTabletLandscape && { flexDirection: 'row' }]}>

                {/* DASHBOARD COLUMN (Tablet Landscape) */}
                {isTabletLandscape && (
                    <View style={[dynamicStyles.sidebar, { flex: 1 }]}>
                        <LinearGradient
                            colors={[theme.colors.background, theme.colors.primary + '15']}
                            style={StyleSheet.absoluteFillObject}
                        />
                        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                            <View style={{ height: 60 }} />
                            <TopBar />

                            <View style={{ paddingHorizontal: 15 }}>
                                <FlightStatus />
                                <WeatherSummary />
                                <QuickNavigation onNavigate={(screen) => navigation.navigate(screen as any)} />
                            </View>
                            <View style={{ height: 60 }} />
                        </ScrollView>
                        <SidebarNav />
                    </View>
                )}

                {/* PRAWY PANEL (Telemetria) */}
                <View style={{ flex: 1 }}>
                    <View style={dynamicStyles.header}>
                        {!isTabletLandscape && (
                            <IconButton
                                icon={<Icon name="ArrowLeft" />}
                                onPress={() => navigation.goBack()}
                                variant="ghost"
                                style={dynamicStyles.backButton}
                            />
                        )}
                        <View>
                            <Typography variant="h2" weight="800">Telemetria</Typography>
                            <Badge
                                label={isLinkActive ? "LINK AKTYWNY" : "BRAK LINKU"}
                                variant={isLinkActive ? "success" : "error"}
                                pulse={isLinkActive}
                                style={{ marginTop: 4 }}
                            />
                        </View>
                    </View>

                    <ScrollView style={dynamicStyles.content} showsVerticalScrollIndicator={false}>
                        <View style={dynamicStyles.powerSection}>
                            <View style={dynamicStyles.powerCard}>
                                <View style={dynamicStyles.powerItem}>
                                    <Typography variant="label" color="textSecondary">Napięcie</Typography>
                                    <View style={dynamicStyles.bigValueRow}>
                                        <Typography variant="h1" style={dynamicStyles.bigValue}>{battery.voltage}</Typography>
                                        <Typography variant="h2" color="textSecondary" style={dynamicStyles.bigUnit}>V</Typography>
                                    </View>
                                </View>
                                <Divider vertical style={{ height: 40 }} />
                                <View style={dynamicStyles.powerItem}>
                                    <Typography variant="label" color="textSecondary">Pobór mocy</Typography>
                                    <View style={dynamicStyles.bigValueRow}>
                                        <Typography variant="h1" style={dynamicStyles.bigValue}>{battery.current}</Typography>
                                        <Typography variant="h2" color="textSecondary" style={dynamicStyles.bigUnit}>A</Typography>
                                    </View>
                                </View>
                            </View>
                            <View style={dynamicStyles.progressBarBg}>
                                <View style={[dynamicStyles.progressBarFill, { width: `${battery.percentage}%` }]} />
                            </View>
                        </View>

                        <View style={dynamicStyles.gridSection}>
                            <View style={dynamicStyles.gridRow}>
                                <DataTile icon={<Icon name="Signal" />} label="Sygnał RSSI" value={signal.rssi.toString()} unit="dBm" />
                                <DataTile icon={<Icon name="Activity" />} label="Jakość LQ" value={signal.lq.toString()} unit="%" />
                            </View>
                            <View style={dynamicStyles.gridRow}>
                                <DataTile icon={<Icon name="Satellite" />} label="Satelity" value={gps.satellites.toString()} />
                                <DataTile icon={<Icon name="Gauge" />} label="Prędkość" value={gps.speed.toString()} unit="km/h" />
                            </View>
                            <View style={dynamicStyles.gridRow}>
                                <DataTile icon={<Icon name="Navigation2" />} label="Wysokość" value={gps.altitude.toString()} unit="m" />
                                <DataTile icon={<Icon name="Compass" />} label="Kurs" value={gps.course.toString()} unit="°" />
                            </View>
                            <View style={dynamicStyles.gridRow}>
                                <DataTile icon={<Icon name="Thermometer" />} label="VTX Temp" value={vtxTemp.toString()} unit="°C" isCritical={vtxTemp > 80} />
                                <DataTile icon={<Icon name="Cpu" />} label="CPU Res" value={cpuRes.toString()} unit="%" />
                            </View>
                        </View>

                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => navigation.navigate('Mapa')}
                            style={dynamicStyles.gpsBar}
                        >
                            <View style={dynamicStyles.gpsIconContainer}>
                                <Icon name="Navigation2" color={theme.colors.primary} size={40} strokeWidth={1.2} />
                            </View>
                            <View style={dynamicStyles.gpsContent}>
                                <Typography variant="body" color="textSecondary" style={dynamicStyles.gpsLabel}>Ostatnia znana pozycja</Typography>
                                <Typography variant="h2" style={dynamicStyles.gpsCoords}>{gps.lat.toFixed(6)}, {gps.lng.toFixed(6)}</Typography>
                            </View>
                            <View style={dynamicStyles.gpsAction}>
                                <Typography variant="label" color="primary" weight="900" style={{ fontSize: 12 }}>MAPA</Typography>
                            </View>
                        </TouchableOpacity>

                        <View style={{ height: 40 }} />
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
    header: {
        paddingTop: 60,
        paddingHorizontal: 24,
        paddingBottom: 24,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
    },
    backButton: {
        marginRight: theme.spacing.sm + 2,
    },
    content: {
        flex: 1,
        paddingHorizontal: theme.spacing.lg - 4,
    },
    powerSection: {
        marginTop: 20,
        marginBottom: 24,
    },
    powerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: theme.colors.surface,
        padding: 24,
        borderRadius: theme.borderRadius.md,
        ...theme.shadows.soft,
    },
    powerItem: {
        flex: 1,
        alignItems: 'center',
    },
    bigValueRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginTop: 4,
    },
    bigValue: {
        fontSize: 36,
        fontWeight: '800',
        color: theme.colors.text,
    },
    bigUnit: {
        fontSize: 18,
        marginLeft: 4,
        fontWeight: '600',
    },
    progressBarBg: {
        height: 4,
        backgroundColor: theme.colors.border,
        borderRadius: theme.borderRadius.xs,
        marginTop: 16,
        marginHorizontal: 12,
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: theme.colors.success,
        borderRadius: theme.borderRadius.xs,
    },
    gridSection: {
        marginBottom: 20,
    },
    gridRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    gpsBar: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 20,
        paddingHorizontal: 4,
    },
    gpsIconContainer: {
        width: 50,
        marginRight: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    gpsContent: {
        flex: 1,
    },
    gpsLabel: {
        marginBottom: 2,
    },
    gpsCoords: {
        fontSize: 20,
        fontWeight: '800',
        color: theme.colors.text,
        fontVariant: ['tabular-nums'],
    },
    gpsAction: {
        paddingLeft: theme.spacing.sm,
        borderLeftWidth: 1,
        borderLeftColor: theme.colors.border,
        height: '100%',
        justifyContent: 'center',
    }
});
