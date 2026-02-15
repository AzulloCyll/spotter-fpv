import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Keyboard, Platform, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Input } from '../atoms/Input';
import { Icon } from '../atoms/Icon';
import { Typography } from '../atoms/Typography';
import { Spot } from '../../data/mockSpots';

interface MapSearchBarProps {
    spots: Spot[];
    onSpotSelect: (spot: Spot) => void;
}

export const MapSearchBar: React.FC<MapSearchBarProps> = ({ spots, onSpotSelect }) => {
    const { theme } = useTheme();
    // const insets = useSafeAreaInsets(); // Managed by parent
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <View
            style={{
                width: '100%',
                backgroundColor: 'transparent',
            }}
            pointerEvents="box-none"
        >
            <View
                style={{
                    backgroundColor: theme.colors.surface,
                    borderRadius: theme.borderRadius.md,
                    ...theme.shadows.medium,
                }}
                pointerEvents="auto"
            >
                <Input
                    placeholder="Szukaj spotów..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    icon={<Icon name="Search" color={theme.colors.textSecondary} size={20} />}
                    containerStyle={{ marginBottom: 0, height: 50, borderRadius: theme.borderRadius.md }}
                />
            </View>

            {searchQuery.length > 0 && (
                <View style={styles(theme).searchResultsContainer}>
                    <ScrollView style={{ maxHeight: 200 }} keyboardShouldPersistTaps="handled">
                        {spots
                            .filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
                            .map((spot, index, array) => (
                                <TouchableOpacity
                                    key={spot.id}
                                    style={[
                                        styles(theme).searchResultItem,
                                        index === array.length - 1 && { borderBottomWidth: 0 }
                                    ]}
                                    onPress={() => {
                                        setSearchQuery('');
                                        Keyboard.dismiss();
                                        onSpotSelect(spot);
                                    }}
                                >
                                    <View style={{ marginRight: 8 }}>
                                        <Icon name="MapPin" size={16} color={theme.colors.textSecondary} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Typography variant="bodySmall" style={{ fontWeight: '600' }}>{spot.name}</Typography>
                                        <Typography variant="caption" color="textSecondary" numberOfLines={1}>
                                            {spot.type.toUpperCase()} • {spot.difficulty}
                                        </Typography>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        {spots.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                            <View style={{ padding: 12, alignItems: 'center' }}>
                                <Typography variant="caption" color="textSecondary">Brak wyników</Typography>
                            </View>
                        )}
                    </ScrollView>
                </View>
            )}
        </View>
    );
};

const styles = (theme: any) => StyleSheet.create({
    searchResultsContainer: {
        marginTop: 4,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.md,
        ...theme.shadows.medium,
        overflow: 'hidden',
    },
    searchResultItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    }
});
