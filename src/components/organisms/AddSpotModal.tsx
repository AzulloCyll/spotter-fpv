import React, { useState } from 'react';
import { View, Modal, StyleSheet, TouchableWithoutFeedback, TextInput } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Typography } from '../atoms/Typography';
import { IconButton } from '../atoms/IconButton';
import { Icon } from '../atoms/Icon';
import { Spot, SpotType } from '../../data/mockSpots';

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

    const handleSave = () => {
        if (!name || !description) return; // Simple validation
        onSave({
            name,
            description,
            type,
            difficulty,
        });
        // Reset form
        setName('');
        setDescription('');
        setType('park');
        setDifficulty('easy');
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
                                <IconButton icon={<Icon name="X" size={24} />} onPress={onClose} variant="ghost" />
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
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: theme.colors.surface,
        borderTopLeftRadius: theme.borderRadius.lg,
        borderTopRightRadius: theme.borderRadius.lg,
        padding: theme.spacing.lg,
        paddingBottom: theme.spacing.xl + 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.lg,
    },
    label: {
        marginBottom: theme.spacing.xs,
        color: theme.colors.textSecondary,
    },
    input: {
        backgroundColor: theme.colors.background,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        color: theme.colors.text,
        marginBottom: theme.spacing.md,
        ...theme.typography.body,
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    chipsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: theme.spacing.md,
    },
    chip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
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
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: theme.spacing.md,
    },
});
