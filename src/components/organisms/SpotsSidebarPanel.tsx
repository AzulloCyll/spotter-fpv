import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Keyboard,
  Animated,
  TextInput,
  InteractionManager,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Typography } from '../atoms/Typography';
import { Icon } from '../atoms/Icon';
import { Input } from '../atoms/Input';
import { Spot } from '../../data/mockSpots';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const getIconName = (type: Spot['type']) => {
  switch (type) {
    case 'bando':
      return 'AlertTriangle';
    case 'nature':
      return 'TreePine';
    case 'park':
      return 'Flag';
    case 'urban':
      return 'Building2';
    default:
      return 'MapPin';
  }
};

const getIconColor = (type: Spot['type'], theme: any) => {
  switch (type) {
    case 'bando':
      return theme.colors.error;
    case 'nature':
      return theme.colors.green;
    case 'park':
      return theme.colors.warning;
    case 'urban':
      return theme.colors.accent; // Using accent (blue) for urban
    default:
      return theme.colors.primary;
  }
};

interface SpotsSidebarPanelProps {
  visible: boolean;
  onClose: () => void;
  spots: Spot[];
  onSpotSelect: (spot: Spot) => void;
  style?: any;
}

export const SpotsSidebarPanel: React.FC<SpotsSidebarPanelProps> = ({
  visible,
  onClose,
  spots,
  onSpotSelect,
  style,
}) => {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef<TextInput>(null);
  const slideAnim = useRef(new Animated.Value(-320)).current; // Start hidden (off-screen left) - matching 320 width

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        // Slower delay for keyboard to ensure UI is ready
        setTimeout(() => {
          inputRef.current?.focus();
        }, 100);
      });
    } else {
      Animated.timing(slideAnim, {
        toValue: -320,
        duration: 250,
        useNativeDriver: true,
      }).start();
      Keyboard.dismiss();
    }
  }, [visible, slideAnim]);

  const filteredSpots = spots.filter((s) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      s.name.toLowerCase().includes(query) ||
      s.type.toLowerCase().includes(query) ||
      s.difficulty.toLowerCase().includes(query)
    );
  });

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
        <View
          style={[
            styles.iconBox,
            {
              backgroundColor: iconColor + '10',
            },
          ]}
        >
          <Icon name={iconName} size={20} color={iconColor} />
        </View>
        <View style={styles.content}>
          <Typography variant="body" style={{ fontWeight: '600' }}>
            {item.name}
          </Typography>
          <Typography variant="caption" color="textSecondary" numberOfLines={1}>
            {item.type.toUpperCase()} • {item.difficulty} • {item.rating}★
          </Typography>
        </View>
        <Icon name="ChevronRight" size={16} color={theme.colors.textSecondary} />
      </TouchableOpacity>
    );
  };

  // Removed optimization to ensure smooth closing animation
  // if (!visible && slideAnim._value === -350) return null;

  return (
    <Animated.View
      pointerEvents={visible ? 'auto' : 'none'}
      style={[
        styles.panel,
        {
          backgroundColor: theme.colors.background,
          borderRightColor: theme.colors.border,
          transform: [{ translateX: slideAnim }],
          zIndex: 1001, // Ensure it's above the map container itself
          elevation: 1001,
        },
        style,
      ]}
    >
      <View
        style={[
          styles.header,
          {
            paddingTop: 40,
            paddingHorizontal: 20,
            paddingBottom: 16,
            backgroundColor: theme.colors.primary + '08',
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.primary + '20',
            position: 'relative',
          },
        ]}
      >
        <View style={{ height: 28, justifyContent: 'center' }}>
          <Typography variant="h3" color="primary">
            Eksploruj spoty
          </Typography>
        </View>
        <TouchableOpacity
          onPress={onClose}
          style={{
            position: 'absolute',
            right: 20,
            top: 40,
            height: 28,
            justifyContent: 'center',
          }}
        >
          <Icon name="X" size={20} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={[styles.searchContainer, { zIndex: 50 }]} pointerEvents="auto">
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
            borderRadius: 12,
            paddingHorizontal: 12,
            height: 48,
            borderWidth: 1,
            borderColor: theme.colors.border,
          }}
        >
          <Icon name="Search" size={18} color={theme.colors.textSecondary} />
          <TextInput
            ref={inputRef}
            style={{
              flex: 1,
              marginLeft: 8,
              color: theme.colors.text,
              fontSize: 16,
              height: '100%',
            }}
            placeholder="Szukaj..."
            placeholderTextColor={theme.colors.textSecondary}
            value={searchQuery}
            onChangeText={(text) => {
              console.log('Search query changed:', text);
              setSearchQuery(text);
            }}
            autoCapitalize="none"
            autoCorrect={false}
            spellCheck={false}
            underlineColorAndroid="transparent"
            keyboardType="default"
            returnKeyType="search"
            onSubmitEditing={() => Keyboard.dismiss()}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="X" size={16} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={filteredSpots}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <View style={styles.empty}>
            <Typography variant="caption" color="textSecondary">
              Nie znaleziono spotów
            </Typography>
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
    shadowColor: '#000',
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
  },
});
