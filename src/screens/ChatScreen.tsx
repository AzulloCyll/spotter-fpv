import React, { useState } from 'react';
import { View, StyleSheet, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Typography } from '../components/atoms/Typography';
import { Avatar } from '../components/atoms/Avatar';
import { IconButton } from '../components/atoms/IconButton';
import { Input } from '../components/atoms/Input';
import { Icon } from '../components/atoms/Icon';

const MOCK_MESSAGES = [
  { id: '1', user: 'SkyWalker', text: 'Ktoś dzisiaj lata na Bemowie?', time: '14:20', isMe: false },
  { id: '2', user: 'PropKiller', text: 'Ja będę za godzinę, biorę 5-calówkę.', time: '14:22', isMe: false },
  { id: '3', user: 'DroneMaster', text: 'Uważajcie, mocno wieje powyżej 50m.', time: '14:25', isMe: false },
  { id: '4', user: 'Pilot FPV', text: 'Dzięki za info! Sprawdzę jeszcze Kp-Index.', time: '14:27', isMe: true },
];

export default function ChatScreen() {
  const { theme } = useTheme();
  const [message, setMessage] = useState('');
  const dynamicStyles = getStyles(theme);

  return (
    <KeyboardAvoidingView
      style={dynamicStyles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={dynamicStyles.header}>
        <View>
          <Typography variant="h1">Czat Pilotów</Typography>
          <View style={dynamicStyles.headerMeta}>
            <Icon name="Users" size={14} color={theme.colors.textSecondary} />
            <Typography variant="bodySmall" color="textSecondary" style={{ marginLeft: 4 }}>3 online</Typography>
            <View style={dynamicStyles.metaDivider} />
            <Icon name="MapPin" size={14} color={theme.colors.textSecondary} />
            <Typography variant="bodySmall" color="textSecondary" style={{ marginLeft: 4 }}>Bemowo</Typography>
          </View>
        </View>
      </View>

      <FlatList
        data={MOCK_MESSAGES}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={[dynamicStyles.msgRow, item.isMe ? dynamicStyles.myRow : null]}>
            {!item.isMe && <Avatar size={36} />}
            <View style={[
              dynamicStyles.bubble,
              item.isMe ? dynamicStyles.myBubble : dynamicStyles.otherBubble
            ]}>
              {!item.isMe && (
                <Typography variant="label" color="primary" style={dynamicStyles.userName}>
                  {item.user}
                </Typography>
              )}
              <Typography variant="body" style={item.isMe ? dynamicStyles.myText : dynamicStyles.otherText}>
                {item.text}
              </Typography>
              <Typography variant="caption" style={[dynamicStyles.time, item.isMe ? dynamicStyles.myTime : null]}>
                {item.time}
              </Typography>
            </View>
          </View>
        )}
        style={dynamicStyles.list}
        contentContainerStyle={dynamicStyles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <View style={dynamicStyles.inputArea}>
        <Input
          placeholder="Napisz wiadomość..."
          value={message}
          onChangeText={setMessage}
          containerStyle={{ flex: 1, marginBottom: 0 }}
          icon={<IconButton
            icon={<Icon name="Send" />}
            onPress={() => setMessage('')}
            variant="primary"
            size={40}
            round
          />}
          style={{ paddingRight: 50, color: theme.colors.text }}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 24,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  metaDivider: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.border,
    marginHorizontal: theme.spacing.sm + 2,
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: theme.spacing.lg - 4,
    paddingBottom: theme.spacing.xl - 2,
  },
  msgRow: {
    flexDirection: 'row',
    marginBottom: theme.spacing.lg - 4,
    alignItems: 'flex-end',
  },
  myRow: {
    justifyContent: 'flex-end',
  },
  bubble: {
    padding: 14,
    paddingHorizontal: 18,
    borderRadius: theme.borderRadius.md,
    maxWidth: '85%',
    marginLeft: 12,
  },
  otherBubble: {
    backgroundColor: theme.colors.surface,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.soft,
  },
  myBubble: {
    backgroundColor: theme.colors.primary,
    borderBottomRightRadius: 4,
    marginLeft: 0,
  },
  userName: {
    fontSize: 10,
    marginBottom: 4,
  },
  otherText: {
    color: theme.colors.text,
  },
  myText: {
    color: '#FFFFFF',
  },
  time: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    marginTop: 6,
    alignSelf: 'flex-end',
  },
  myTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  inputArea: {
    backgroundColor: theme.colors.surface,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    flexDirection: 'row',
    alignItems: 'center',
  }
});
