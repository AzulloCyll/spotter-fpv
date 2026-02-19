import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Typography } from '../atoms/Typography';
import { Icon, IconName } from '../atoms/Icon';
import { RootTabParamList } from '../../navigation/types';

interface ActionCardProps {
  title: string;
  description: string;
  icon: IconName;
  color: string;
  onPress: () => void;
  styles: any;
}

const NavCard: React.FC<ActionCardProps & { styles: any; dark?: boolean }> = ({
  title,
  description,
  icon,
  color,
  onPress,
  styles,
  dark,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.card,
        { elevation: 0, shadowOpacity: 0 },
        dark && {
          backgroundColor: 'rgba(0,0,0,0.3)',
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.1)',
        },
      ]}
    >
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 14,
          backgroundColor: color,
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: 16,
          overflow: 'hidden',
        }}
      >
        <Icon name={icon} size={24} color="#FFFFFF" />
      </View>
      <View style={styles.content}>
        <Typography variant="h3" style={[styles.title, dark && { color: '#FFFFFF' }]}>
          {title}
        </Typography>
        <Typography
          variant="bodySmall"
          color={dark ? 'white' : 'textSecondary'}
          style={dark && { opacity: 0.7 }}
        >
          {description}
        </Typography>
      </View>
      <Icon name="ChevronRight" size={20} color={color} />
    </TouchableOpacity>
  );
};

interface QuickNavigationProps {
  onNavigate: (screen: keyof RootTabParamList, params?: any) => void;
}

export const QuickNavigation: React.FC<QuickNavigationProps> = ({ onNavigate }) => {
  const { theme, isDark } = useTheme();
  const dynamicStyles = getStyles(theme);

  const navItems = [
    {
      title: 'Eksploruj Spoty',
      description: 'Mapa najlepszych miejsc w okolicy',
      icon: 'Map' as IconName,
      color: theme.colors.primary,
      screen: 'Mapa' as keyof RootTabParamList,
      params: { openList: true },
    },
    {
      title: 'Sprawdź warunki',
      description: 'Prognoza wiatru, opadów i temperatury',
      icon: 'CloudSun' as IconName,
      color: theme.colors.primary,
      screen: 'Pogoda' as keyof RootTabParamList,
    },
    {
      title: 'Czat Pilotów',
      description: 'Ustaw się na latanie z ekipą',
      icon: 'MessageCircle' as IconName,
      color: theme.colors.primary,
      screen: 'Czat' as keyof RootTabParamList,
    },
  ];

  return (
    <View style={dynamicStyles.section}>
      <Typography variant="label" color="textSecondary" style={dynamicStyles.sectionTitle}>
        Szybki dostęp
      </Typography>

      {navItems.map((item) => (
        <NavCard
          key={item.title}
          title={item.title}
          description={item.description}
          icon={item.icon}
          color={item.color}
          onPress={() => onNavigate(item.screen, (item as any).params)}
          styles={dynamicStyles}
          dark={isDark}
        />
      ))}
    </View>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    section: {
      paddingHorizontal: 0,
      marginTop: -10,
    },
    sectionTitle: {
      marginBottom: theme.spacing.md,
      fontSize: 13,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 1.2,
      textAlign: 'center',
    },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      marginBottom: 12,
      backgroundColor: '#FFFFFF',
      borderRadius: 24,
      elevation: 0,
      shadowOpacity: 0,
    },
    iconBox: {
      width: 44,
      height: 44,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
      overflow: 'hidden',
    },
    content: {
      flex: 1,
    },
    title: {
      fontSize: 16,
      fontWeight: '700',
      color: '#2C3E50',
      marginBottom: 2,
    },
  });
