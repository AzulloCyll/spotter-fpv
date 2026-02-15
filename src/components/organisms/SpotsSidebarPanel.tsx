import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, FlatList, Keyboard, Animated, Dimensions, TextInput, PixelRatio } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Typography } from '../atoms/Typography';
import { Icon } from '../atoms/Icon';
import { Input } from '../atoms/Input';
import { Spot } from '../../data/mockSpots';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


const getIconName = (type: Spot['type']) => {
    switch (type) {
        case 'bando': return 'AlertTriangle';
        case 'nature': return 'TreePine';
        case 'park': return 'Flag';
        case 'urban': return 'Building2';
        default: return 'MapPin';
    }
};

const getIconColor = (type: Spot['type'], theme: any) => {
    switch (type) {
        case 'bando': return theme.colors.error;
        case 'nature': return theme.colors.green;
        case 'park': return theme.colors.warning;
        case 'urban': return theme.colors.accent; // Using accent (blue) for urban
        default: return theme.colors.primary;
    }
};

interface SpotsSidebarPanelProps {
    visible: boolean;
    onClose: () => void;
    spots: Spot[];
    onSpotSelect: (spot: Spot) => void;
}

export const SpotsSidebarPanel: React.FC<SpotsSidebarPanelProps> = ({ visible, onClose, spots, onSpotSelect }) => {
    const { theme, isDark } = useTheme();
    const insets = useSafeAreaInsets();
    const [searchQuery, setSearchQuery] = useState('');
    const slideAnim = useRef(new Animated.Value(-350)).current; // Start hidden (off-screen left)

    useEffect(() => {
        if (visible) {
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(slideAnim, {
                toValue: -350,
                duration: 250,
                useNativeDriver: true,
            }).start();
        }
    }, [visible]);

    const filteredSpots = spots.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.type.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderItem = ({ item }: { item: Spot }) => {
        const iconName = getIconName(item.type);
        const iconColor = getIconColor(item.type, theme);

        return (
            <TouchableOpacity
                style={[styles.item, { borderBottomColor: theme.colors.border }]}
                onPress={() => {
                    onSpotSelect(item);
                    // Optional: Close panel on select? User might want to browse. Let's keep it open or close based on preference?
                    // Usually for exploring, keeping it open is fine on tablet. 
                    // But passing onClose() if needed.
                }}
            >
                <View style={[
                    styles.iconBox,
                    {
                        backgroundColor: iconColor + '10',
                    }
                ]}>
                    <Icon name={iconName} size={20} color={iconColor} />
                </View>
                <View style={styles.content}>
                    <Typography variant="body" style={{ fontWeight: '600' }}>{item.name}</Typography>
                    <Typography variant="caption" color="textSecondary" numberOfLines={1}>
                        {item.type.toUpperCase()} • {item.difficulty} • {item.rating}★
                    </Typography>
                </View>
                <Icon name="ChevronRight" size={16} color={theme.colors.border} />
            </TouchableOpacity>
        );
    };

    // Removed optimization to ensure smooth closing animation
    // if (!visible && slideAnim._value === -350) return null;

    return (
        <Animated.View
            style={[
                styles.panel,
                {
                    backgroundColor: theme.colors.background,
                    borderRightColor: theme.colors.border,
                    transform: [{ translateX: slideAnim }],
                    zIndex: 20,
                }
            ]}
        >
            <View style={[styles.header, {
                paddingTop: 40,
                paddingHorizontal: 20,
                paddingBottom: 16,
                backgroundColor: theme.colors.primary + '08',
                borderBottomWidth: 1,
                borderBottomColor: theme.colors.primary + '20',
                position: 'relative'
            }]}>
                <View style={{ height: 28, justifyContent: 'center' }}>
                    <Typography variant="h3" color="primary">Eksploruj spoty</Typography>
                </View>
                <TouchableOpacity
                    onPress={onClose}
                    style={{
                        position: 'absolute',
                        right: 20,
                        top: 40,
                        height: 28,
                        justifyContent: 'center'
                    }}
                >
                    <Icon name="X" size={20} color={theme.colors.primary} />
                </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
                <Input
                    placeholder="Szukaj..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    icon={<Icon name="Search" size={20} color={theme.colors.textSecondary} />}
                    containerStyle={{ marginBottom: 0, height: 50, borderRadius: 12, backgroundColor: theme.colors.surface }}
                />
            </View>

            <FlatList
                data={filteredSpots}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Typography variant="caption" color="textSecondary">Nie znaleziono spotów</Typography>
                    </View>
                }
            />
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    panel: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0, // Will be positioned relative to its container. 
        // Logic: if rendered inside MapWrapper next to DashboardSidebar, 'left' 0 means start of map wrapper.
        // Wait, MapWrapper starts AFTER DashboardSidebar.
        // So left: 0 is correct.
        width: 320,
        borderRightWidth: 1,
        // Shadow for depth
        shadowColor: "#000",
        shadowOffset: { width: 2, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    closeBtn: {
        padding: 4,
    },
    searchContainer: {
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 100,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    content: {
        flex: 1,
    },
    empty: {
        padding: 20,
        alignItems: 'center',
    }
});
