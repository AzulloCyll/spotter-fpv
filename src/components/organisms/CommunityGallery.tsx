import React, { useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Modal, StatusBar, Pressable, ActivityIndicator, Alert, FlatList, ListRenderItem } from 'react-native';
import { Skeleton } from '../atoms/Skeleton';
import { useTheme } from '../../theme/ThemeContext';
import { Typography } from '../atoms/Typography';
import { Icon } from '../atoms/Icon';
import { IconButton } from '../atoms/IconButton';

import { useGalleryStorage, PhotoItem } from '../../hooks/useGalleryStorage';

export const CommunityGallery: React.FC = () => {
    const { theme, isDark } = useTheme();
    const { photos, isUploading, addPhoto, toggleLike, getFilesDebug } = useGalleryStorage();
    const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem | null>(null);

    // Połącz prawdziwe zdjęcia z placeholderem ładowania
    const displayData = isUploading
        ? [...photos, { id: 'loading-placeholder', uri: '', likes: 0, isLiked: false } as PhotoItem]
        : photos;

    // Synchronizacja zaznaczonego zdjęcia z głównym stanem (dla lajków w modalu)
    const activePhoto = selectedPhoto ? photos.find(p => p.id === selectedPhoto.id) || selectedPhoto : null;

    const checkLocalStorage = async () => {
        const files = await getFilesDebug();
        if (files.length > 0) {
            Alert.alert(
                'Status Pamięci Lokalnej',
                `Folder: /gallery/\nPlików: ${files.length}\n\nLista plików:\n${files.slice(0, 10).join('\n')}${files.length > 10 ? '\n...' : ''}`
            );
        } else {
            Alert.alert('Status', 'Folder jest jeszcze pusty lub nie został utworzony.');
        }
    };

    const dynamicStyles = getStyles(theme);

    const renderPhotoItem: ListRenderItem<PhotoItem> = ({ item }) => {
        if (item.id === 'loading-placeholder') {
            return (
                <View style={dynamicStyles.photoContainer}>
                    <Skeleton width="100%" height="100%" borderRadius={16} />
                    <View style={dynamicStyles.loadingOverlay}>
                        <ActivityIndicator size="small" color={theme.colors.primary} />
                    </View>
                </View>
            );
        }

        return (
            <TouchableOpacity
                activeOpacity={0.8}
                style={dynamicStyles.photoContainer}
                onPress={() => setSelectedPhoto(item)}
            >
                <Image source={{ uri: item.uri }} style={dynamicStyles.photo} />
                <View style={dynamicStyles.photoOverlay}>
                    <View style={dynamicStyles.likeBadge}>
                        <Icon
                            name="Heart"
                            size={10}
                            color={theme.colors.white}
                            fill={item.isLiked ? theme.colors.error : theme.colors.white}
                        />
                        <Typography variant="caption" style={{ color: theme.colors.white, marginLeft: 4, fontSize: 10 }}>
                            {item.likes}
                        </Typography>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={dynamicStyles.container}>
            <View style={dynamicStyles.header}>
                <Pressable onLongPress={checkLocalStorage} delayLongPress={2000}>
                    <Typography variant="label" color="textSecondary" style={dynamicStyles.label}>GALERIA SPOŁECZNOŚCI</Typography>
                </Pressable>
                <TouchableOpacity
                    style={[
                        dynamicStyles.addButton,
                        { backgroundColor: isDark ? theme.colors.primary + '25' : theme.colors.primary + '15' }
                    ]}
                    onPress={addPhoto}
                    disabled={isUploading}
                >
                    <Icon name="Plus" size={16} color={theme.colors.primary} />
                    <Typography variant="bodySmall" color="primary" weight="700" style={{ marginLeft: 4 }}>
                        {isUploading ? 'DODAWANIE...' : 'DODAJ ZDJĘCIE'}
                    </Typography>
                </TouchableOpacity>
            </View>

            <FlatList
                data={displayData}
                renderItem={renderPhotoItem}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={dynamicStyles.scrollContent}
                ListEmptyComponent={!isUploading ? (
                    <View style={[dynamicStyles.photoContainer, dynamicStyles.emptyContainer, { backgroundColor: isDark ? theme.colors.white + '08' : theme.colors.border + '33' }]}>
                        <View style={{ opacity: 0.5 }}>
                            <Icon name="Image" size={28} color={theme.colors.textSecondary} />
                        </View>
                        <Typography variant="caption" color="textSecondary" style={{ marginTop: 8, opacity: 0.7 }}>Brak zdjęć</Typography>
                    </View>
                ) : null}
            />

            <Modal
                visible={!!selectedPhoto}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setSelectedPhoto(null)}
            >
                <StatusBar barStyle="light-content" backgroundColor={theme.colors.black} />
                <View style={dynamicStyles.modalOverlay}>
                    <Pressable
                        style={dynamicStyles.modalBackground}
                        onPress={() => setSelectedPhoto(null)}
                    />

                    <View style={dynamicStyles.modalContent}>
                        {activePhoto && (
                            <Image
                                source={{ uri: activePhoto.uri }}
                                style={dynamicStyles.fullPhoto}
                                resizeMode="contain"
                            />
                        )}

                        <View style={dynamicStyles.modalHeader}>
                            <IconButton
                                icon={<Icon name="X" color={theme.colors.white} />}
                                onPress={() => setSelectedPhoto(null)}
                                variant="glass"
                                round
                                size={40}
                            />
                        </View>

                        <View style={dynamicStyles.modalFooter}>
                            <TouchableOpacity
                                style={[dynamicStyles.modalAction, activePhoto?.isLiked && { backgroundColor: theme.colors.error + '33' }]}
                                onPress={() => activePhoto && toggleLike(activePhoto.id)}
                            >
                                <Icon
                                    name="Heart"
                                    size={24}
                                    color={activePhoto?.isLiked ? theme.colors.error : theme.colors.white}
                                    fill={activePhoto?.isLiked ? theme.colors.error : "transparent"}
                                />
                                <Typography variant="body" style={{ color: theme.colors.white, marginLeft: 8 }}>
                                    {activePhoto?.isLiked ? 'Polubiono' : 'Lubię to'} ({activePhoto?.likes})
                                </Typography>
                            </TouchableOpacity>
                            <TouchableOpacity style={dynamicStyles.modalAction}>
                                <Icon name="Share2" size={24} color={theme.colors.white} />
                                <Typography variant="body" style={{ color: theme.colors.white, marginLeft: 8 }}>Udostępnij</Typography>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const getStyles = (theme: any) => StyleSheet.create({
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
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    scrollContent: {
        paddingHorizontal: 10,
    },
    photoContainer: {
        width: 140,
        height: 100,
        marginRight: 10,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: theme.colors.border,
    },
    emptyContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 0,
        width: 140,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
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
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.95)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalBackground: {
        ...StyleSheet.absoluteFillObject,
    },
    modalContent: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullPhoto: {
        width: '100%',
        height: '80%',
    },
    modalHeader: {
        position: 'absolute',
        top: 50,
        right: 20,
    },
    modalFooter: {
        position: 'absolute',
        bottom: 50,
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-around',
        paddingHorizontal: 40,
    },
    modalAction: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 20,
    }
});
