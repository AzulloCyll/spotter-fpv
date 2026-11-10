import React, { useEffect, useRef } from 'react';
import { View, Modal, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../../theme/ThemeContext';
import type { Theme } from '../../theme';
import type { Coordinates } from '../../utils/location';
import { Typography } from '../atoms/Typography';
import { Icon } from '../atoms/Icon';
import { PlacePickerMap } from './PlacePickerMap';

interface PlacePickerModalProps {
  visible: boolean;
  /** Where the map opens. */
  initialCenter: Coordinates;
  onClose: () => void;
  onConfirm: (center: Coordinates) => void;
}

/**
 * Full-screen map with a fixed crosshair: the pilot moves the map under it and confirms
 * the centre. The map is the shared Leaflet map (PlacePickerMap → LeafletMap).
 */
export const PlacePickerModal: React.FC<PlacePickerModalProps> = ({
  visible,
  initialCenter,
  onClose,
  onConfirm,
}) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = getStyles(theme);
  // Until the map reports a move, its centre is where it opened.
  const centerRef = useRef<Coordinates>(initialCenter);

  useEffect(() => {
    if (visible) centerRef.current = initialCenter;
    // Only on opening: initialCenter may change while the picker is open.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const handleConfirm = () => {
    onConfirm(centerRef.current);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <Typography variant="h3">Wybierz miejsce</Typography>
          <TouchableOpacity
            onPress={onClose}
            style={{ padding: 4 }}
            accessibilityRole="button"
            accessibilityLabel="Zamknij"
          >
            <Icon name="X" size={24} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.mapArea}>
          {visible && (
            <PlacePickerMap
              initialCenter={initialCenter}
              onCenterChange={(center) => {
                centerRef.current = center;
              }}
            />
          )}
          <View style={styles.crosshair} pointerEvents="none">
            <Icon name="Crosshair" size={44} color={theme.colors.error} strokeWidth={2.5} />
          </View>
        </View>

        <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
          <Typography variant="bodySmall" color="textSecondary" style={styles.hint}>
            Przesuń mapę, aby celownik wskazał miejsce, dla którego chcesz zobaczyć pogodę.
          </Typography>
          <TouchableOpacity
            onPress={handleConfirm}
            style={styles.confirmButton}
            accessibilityRole="button"
          >
            <Typography variant="label" style={{ color: '#fff', fontSize: 14 }}>
              Wybierz to miejsce
            </Typography>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const getStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    mapArea: {
      flex: 1,
      position: 'relative',
      overflow: 'hidden',
    },
    crosshair: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      justifyContent: 'center',
      alignItems: 'center',
    },
    footer: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    hint: {
      textAlign: 'center',
      marginBottom: 12,
    },
    confirmButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.md,
      paddingVertical: 12,
      alignItems: 'center',
    },
  });
