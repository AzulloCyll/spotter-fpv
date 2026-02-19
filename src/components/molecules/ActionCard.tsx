import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Typography } from '../atoms/Typography';
import { theme } from '../../theme';

interface ActionCardProps {
  icon: React.ReactNode;
  iconBgColor: string;
  title: string;
  description: string;
  onPress: () => void;
}

export const ActionCard: React.FC<ActionCardProps> = ({
  icon,
  iconBgColor,
  title,
  description,
  onPress,
}) => {
  return (
    <TouchableOpacity activeOpacity={0.7} style={styles.card} onPress={onPress}>
      <View style={[styles.iconCircle, { backgroundColor: iconBgColor }]}>{icon}</View>
      <View style={styles.cardContent}>
        <Typography variant="h3">{title}</Typography>
        <Typography variant="bodySmall" color="textSecondary">
          {description}
        </Typography>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm + 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    marginLeft: theme.spacing.md,
    flex: 1,
  },
});
