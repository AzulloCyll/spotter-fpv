import React from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Typography } from '../atoms/Typography';
import { Icon } from '../atoms/Icon';

const MOCK_PHOTOS = [
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1473968512647-3e447244af8f?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1501854140801-50d01698950b?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1534067783941-51c9c23ecefd?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?q=80&w=400&auto=format&fit=crop',
];

export const CommunityGallery: React.FC = () => {
    const { theme } = useTheme();

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Typography variant="label" color="textSecondary" style={styles.label}>GALERIA SPOŁECZNOŚCI</Typography>
                <TouchableOpacity style={styles.addButton}>
                    <Icon name="Plus" size={16} color={theme.colors.primary} />
                    <Typography variant="bodySmall" color="primary" weight="700" style={{ marginLeft: 4 }}>DODAJ ZDJĘCIE</Typography>
                </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
                {MOCK_PHOTOS.map((uri, index) => (
                    <TouchableOpacity key={index} activeOpacity={0.8} style={styles.photoContainer}>
                        <Image source={{ uri }} style={styles.photo} />
                        <View style={styles.photoOverlay}>
                            <View style={styles.likeBadge}>
                                <Icon name="Heart" size={10} color="#fff" fill="#fff" />
                                <Typography variant="caption" style={{ color: '#fff', marginLeft: 4, fontSize: 10 }}>{Math.floor(Math.random() * 50) + 10}</Typography>
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    label: {
        letterSpacing: 1.2,
        fontSize: 10,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.6)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    scroll: {
        marginHorizontal: -10,
        paddingHorizontal: 10,
    },
    photoContainer: {
        width: 140,
        height: 100,
        marginRight: 10,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: '#eee',
    },
    photo: {
        width: '100%',
        height: '100%',
    },
    photoOverlay: {
        position: 'absolute',
        bottom: 6,
        right: 6,
    },
    likeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.4)',
        paddingHorizontal: 4,
        paddingVertical: 2,
        borderRadius: 4,
    }
});
