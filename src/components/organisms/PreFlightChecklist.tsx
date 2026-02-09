import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Typography } from '../atoms/Typography';
import { Icon } from '../atoms/Icon';
import { Card } from '../atoms/Card';

const CHECKLIST_ITEMS = [
    { id: '1', label: 'Śmigła dokręcone i nieuszkodzone' },
    { id: '2', label: 'Bateria zabezpieczona i zbalansowana' },
    { id: '3', label: 'VTx ustawiony na poprawny kanał' },
    { id: '4', label: 'Gogle i aparatura włączone' },
    { id: '5', label: 'Karta SD w nagrywarce' },
    { id: '6', label: 'Fail-safe przetestowany' },
];

export const PreFlightChecklist: React.FC = () => {
    const { theme } = useTheme();
    const [checkedIds, setCheckedIds] = useState<string[]>([]);

    const toggleItem = (id: string) => {
        setCheckedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    return (
        <Card style={styles.container}>
            <View style={styles.header}>
                <Icon name="ClipboardCheck" color={theme.colors.primary} size={20} />
                <Typography variant="h3" style={styles.title}>Pre-flight Checklist</Typography>
            </View>

            <View style={styles.list}>
                {CHECKLIST_ITEMS.map((item) => {
                    const isChecked = checkedIds.includes(item.id);
                    return (
                        <TouchableOpacity
                            key={item.id}
                            style={styles.item}
                            onPress={() => toggleItem(item.id)}
                            activeOpacity={0.7}
                        >
                            <View style={[
                                styles.checkbox,
                                { borderColor: isChecked ? theme.colors.success : theme.colors.border },
                                isChecked && { backgroundColor: theme.colors.success }
                            ]}>
                                {isChecked && <Icon name="Check" size={10} color="#FFFFFF" />}
                            </View>
                            <Typography
                                variant="caption"
                                color={isChecked ? "textSecondary" : "text"}
                                style={[styles.label, isChecked && { textDecorationLine: 'line-through' }]}
                            >
                                {item.label}
                            </Typography>
                        </TouchableOpacity>
                    );
                })}
            </View>

            <TouchableOpacity
                style={styles.resetButton}
                onPress={() => setCheckedIds([])}
            >
                <Typography variant="label" color="primary" weight="700">RESETUJ</Typography>
            </TouchableOpacity>
        </Card>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 15,
        marginTop: 10,
        borderRadius: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    title: {
        marginLeft: 8,
        fontSize: 16,
    },
    list: {
        gap: 6,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 2,
    },
    checkbox: {
        width: 16,
        height: 16,
        borderRadius: 4,
        borderWidth: 1.5,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    label: {
        fontSize: 12,
    },
    resetButton: {
        marginTop: 10,
        alignSelf: 'center',
    }
});
