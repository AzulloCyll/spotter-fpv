import React from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity } from 'react-native';
import { Send } from 'lucide-react-native';
import { theme } from '../theme';

const MOCK_MESSAGES = [
  { id: '1', user: 'SkyWalker', text: 'Ktoś dzisiaj lata na Bemowie?', time: '14:20' },
  { id: '2', user: 'PropKiller', text: 'Ja będę za godzinę, biorę 5-calówkę.', time: '14:22' },
  { id: '3', user: 'DroneMaster', text: 'Uważajcie, mocno wieje powyżej 50m.', time: '14:25' },
];

export default function ChatScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Globalny Chat</Text>
      
      <FlatList
        data={MOCK_MESSAGES}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.messageBubble}>
            <View style={styles.messageHeader}>
              <Text style={styles.userName}>{item.user}</Text>
              <Text style={styles.time}>{item.time}</Text>
            </View>
            <Text style={styles.messageText}>{item.text}</Text>
          </View>
        )}
        style={styles.list}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Napisz do pilotów..."
          placeholderTextColor={theme.colors.textSecondary}
        />
        <TouchableOpacity style={styles.sendButton}>
          <Send color="white" size={20} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingTop: 60,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  list: {
    paddingHorizontal: 20,
  },
  messageBubble: {
    backgroundColor: theme.colors.surface,
    padding: 15,
    borderRadius: theme.borderRadius.md,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  userName: {
    color: theme.colors.primary,
    fontWeight: 'bold',
    fontSize: 14,
  },
  time: {
    color: theme.colors.textSecondary,
    fontSize: 11,
  },
  messageText: {
    color: theme.colors.text,
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: theme.colors.secondary,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
    padding: 12,
    borderRadius: theme.borderRadius.sm,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: theme.colors.primary,
    padding: 12,
    borderRadius: theme.borderRadius.sm,
  }
});
