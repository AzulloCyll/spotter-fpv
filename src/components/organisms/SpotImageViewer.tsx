import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Modal,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Typography } from '../atoms/Typography';
import { Icon } from '../atoms/Icon';

interface SpotImageViewerProps {
  images: string[];
  /** Index of the photo to open on; `null` keeps the viewer closed. */
  initialIndex: number | null;
  onClose: () => void;
}

export const SpotImageViewer: React.FC<SpotImageViewerProps> = ({
  images,
  initialIndex,
  onClose,
}) => {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList<string>>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const visible = initialIndex !== null;

  useEffect(() => {
    if (initialIndex !== null) setCurrentIndex(initialIndex);
  }, [initialIndex]);

  // Keep the same photo in view after rotation or a window resize.
  useEffect(() => {
    if (!visible) return;
    listRef.current?.scrollToIndex({ index: currentIndex, animated: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width]);

  // onMomentumScrollEnd does not fire on react-native-web, so track the index while scrolling.
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(Math.min(Math.max(index, 0), images.length - 1));
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        {visible && (
          <FlatList
            ref={listRef}
            data={images}
            keyExtractor={(uri, index) => `${index}-${uri}`}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={initialIndex}
            getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            renderItem={({ item }) => (
              <View style={{ width, height }}>
                <Image source={{ uri: item }} style={styles.image} resizeMode="contain" />
              </View>
            )}
          />
        )}

        <View style={[styles.topBar, { top: insets.top + 12 }]} pointerEvents="box-none">
          <View style={styles.counter}>
            <Typography variant="label" style={styles.counterText}>
              {currentIndex + 1}/{images.length}
            </Typography>
          </View>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
            accessibilityLabel="Zamknij podgląd"
          >
            <Icon name="X" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: '#000',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  topBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  counter: {
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  counterText: {
    color: '#fff',
  },
  closeButton: {
    backgroundColor: 'rgba(0,0,0,0.55)',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
