import React, { useState } from 'react';
import { View, Modal, StyleSheet, TouchableWithoutFeedback, TextInput, TouchableOpacity } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Typography } from '../atoms/Typography';
import { IconButton } from '../atoms/IconButton';
import { Icon } from '../atoms/Icon';
import { Spot, SpotType } from '../../data/mockSpots';
import * as ImagePicker from 'expo-image-picker';
import { Image, ScrollView } from 'react-native';

interface AddSpotModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (spotData: Omit<Spot, 'id' | 'coordinates' | 'rating'>) => void;
}

const SPOT_TYPES: SpotType[] = ['bando', 'nature', 'park', 'urban'];
const DIFFICULTIES = ['easy', 'medium', 'hard', 'extreme'] as const;

export const AddSpotModal: React.FC<AddSpotModalProps> = ({ visible, onClose, onSave }) => {
    const { theme } = useTheme();
    const styles = getStyles(theme);

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState<SpotType>('park');
    const [difficulty, setDifficulty] = useState<typeof DIFFICULTIES[number]>('easy');
    const [images, setImages] = useState<string[]>([]);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled) {
            setImages([...images, result.assets[0].uri]);
        }
    };

    const removeImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
    };

    const handleSave = () => {
        if (!name || !description) return; // Simple validation
        onSave({
            name,
            description,
            type,
            difficulty,
            images,
        });
        // Reset form
        setName('');
        setDescription('');
        setType('park');
        setDifficulty('easy');
        setImages([]);
        onClose();
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <View style={styles.modalContent}>
                            <View style={styles.header}>
                                <Typography variant="h3">Dodaj Nowy Spot</Typography>
                                <TouchableOpacity onPress={onClose} style={{ padding: 4 }}>
                                    <Icon name="X" size={24} color={theme.colors.textSecondary} />
                                </TouchableOpacity>
                            </View>

                            <Typography variant="label" style={styles.label}>Nazwa miejsca</Typography>
                            <TextInput
                                style={styles.input}
                                value={name}
                                onChangeText={setName}
                                placeholder="Np. Opuszczona hala"
                                placeholderTextColor={theme.colors.textSecondary}
                            />

                            <Typography variant="label" style={styles.label}>Opis</Typography>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                value={description}
                                onChangeText={setDescription}
                                placeholder="Opisz to miejsce..."
                                placeholderTextColor={theme.colors.textSecondary}
                                multiline
                            />

                            <Typography variant="label" style={styles.label}>Typ</Typography>
                            <View style={styles.chipsContainer}>
                                {SPOT_TYPES.map((t) => (
                                    <TouchableWithoutFeedback key={t} onPress={() => setType(t)}>
                                        <View style={[styles.chip, type === t && styles.activeChip]}>
                                            <Typography variant="caption" style={{ color: type === t ? '#fff' : theme.colors.text }}>
                                                {t.toUpperCase()}
                                            </Typography>
                                        </View>
                                    </TouchableWithoutFeedback>
                                ))}
                            </View>

                            <Typography variant="label" style={styles.label}>Trudność</Typography>
                            <View style={styles.chipsContainer}>
                                {DIFFICULTIES.map((d) => (
                                    <TouchableWithoutFeedback key={d} onPress={() => setDifficulty(d)}>
                                        <View style={[styles.chip, difficulty === d && styles.activeChip]}>
                                            <Typography variant="caption" style={{ color: difficulty === d ? '#fff' : theme.colors.text }}>
                                                {d.toUpperCase()}
                                            </Typography>
                                        </View>
                                    </TouchableWithoutFeedback>
                                ))}
                            </View>

                            <Typography variant="label" style={styles.label}>Zdjęcia</Typography>
                            <View style={{ marginBottom: 16 }}>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 4, paddingVertical: 8, gap: 12 }}>
                                    <TouchableOpacity
                                        style={styles.addImageButton}
                                        onPress={pickImage}
                                    >
                                        <Icon name="Plus" size={24} color={theme.colors.textSecondary} />
                                        <Typography variant="caption" color="textSecondary">Dodaj</Typography>
                                    </TouchableOpacity>

                                    {images.map((uri, index) => (
                                        <View key={index} style={styles.imageContainer}>
                                            <Image source={{ uri }} style={styles.imagePreview} />
                                            <TouchableOpacity
                                                style={styles.removeImageBadge}
                                                onPress={() => removeImage(index)}
                                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                            >
                                                <Icon name="X" size={10} color="#fff" />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </ScrollView>
                            </View>

                            <TouchableWithoutFeedback onPress={handleSave}>
                                <View style={styles.saveButton}>
                                    <Typography variant="label" style={{ color: '#fff', fontSize: 14 }}>ZAPISZ SPOT</Typography>
                                </View>
                            </TouchableWithoutFeedback>

                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const getStyles = (theme: any) => StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center', // Center vertically
        alignItems: 'center', // Center horizontally
        padding: 20, // Add padding to float
    },
    modalContent: {
        width: '100%',
        maxWidth: 500, // Increased from 340 to fit chips in one line
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.lg,
        ...theme.shadows.strong,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.md,
    },
    label: {
        marginBottom: theme.spacing.xs,
        color: theme.colors.textSecondary,
    },
    input: {
        backgroundColor: theme.colors.background,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.sm,
        paddingHorizontal: theme.spacing.md,
        fontSize: 14,
        color: theme.colors.text,
        marginBottom: theme.spacing.sm,
        ...theme.typography.body,
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    chipsContainer: {
        flexDirection: 'row',
        flexWrap: 'nowrap', // Force single line
        gap: 8,
        marginBottom: theme.spacing.md,
        justifyContent: 'space-between', // Distribute chips
    },
    chip: {
        flex: 1, // Make all chips equal width
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.surface,
    },
    activeChip: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    saveButton: {
        backgroundColor: theme.colors.primary,
        borderRadius: theme.borderRadius.md,
        paddingVertical: 12,
        alignItems: 'center',
        marginTop: theme.spacing.sm,
    },
    addImageButton: {
        width: 80,
        height: 80,
        borderRadius: theme.borderRadius.md,
        backgroundColor: theme.colors.background,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: theme.colors.border,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageContainer: {
        width: 80,
        height: 80,
        position: 'relative',
        overflow: 'visible', // Ensure badge isn't clipped
    },
    imagePreview: {
        width: 80,
        height: 80,
        borderRadius: theme.borderRadius.md,
    },
    removeImageBadge: {
        position: 'absolute',
        top: -6,
        right: -6,
        backgroundColor: theme.colors.error,
        width: 22,
        height: 22,
        borderRadius: 11,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: theme.colors.surface,
        zIndex: 10, // Ensure it's above other elements
    },
});
