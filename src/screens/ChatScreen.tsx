import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, useWindowDimensions } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Typography } from '../components/atoms/Typography';
import { IconButton } from '../components/atoms/IconButton';
import { Input } from '../components/atoms/Input';
import { Icon } from '../components/atoms/Icon';
import { SidebarNav } from '../components/organisms/SidebarNav';
import { FlightStatus } from '../components/organisms/FlightStatus';
import { WeatherSummary } from '../components/organisms/WeatherSummary';
import { QuickNavigation } from '../components/organisms/QuickNavigation';
import { TopBar } from '../components/organisms/TopBar';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { MOCK_MESSAGES } from '../constants/mockData';

export default function ChatScreen() {
  const { theme, isDark } = useTheme();
  const navigation = useNavigation<any>();
  const [message, setMessage] = useState('');
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const isTabletLandscape = windowWidth > windowHeight && windowWidth > 800;

  const dynamicStyles = getStyles(theme);

  return (
    <View style={dynamicStyles.container}>
      <View style={[dynamicStyles.mainWrapper, isTabletLandscape && { flexDirection: 'row' }]}>

        {/* DASHBOARD COLUMN (Tablet Landscape) */}
        {isTabletLandscape && (
          <View style={[dynamicStyles.sidebar, { flex: 1 }]}>
            <LinearGradient
              colors={[theme.colors.background, theme.colors.primary + '15']}
              style={StyleSheet.absoluteFillObject}
            />
            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
              <View style={{ height: 60 }} />
              <TopBar />

              <View style={{ paddingHorizontal: 15 }}>
                <FlightStatus />
                <WeatherSummary />
                <QuickNavigation onNavigate={(screen: string) => navigation.navigate(screen)} />
              </View>
              <View style={{ height: 60 }} />
            </ScrollView>

            <SidebarNav />
          </View>
        )}

        {/* PRAWY PANEL (Czat) */}
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={100}
        >
          <View style={dynamicStyles.header}>
            {!isTabletLandscape && (
              <IconButton
                icon={<Icon name="ArrowLeft" />}
                onPress={() => navigation.goBack()}
                variant="ghost"
              />
            )}
            <View style={dynamicStyles.groupInfo}>
              <Typography variant="h3">Warszawa FPV Team</Typography>
              <Typography variant="caption" color="textSecondary">12 pilotów aktywnych</Typography>
            </View>
          </View>

          <ScrollView
            style={dynamicStyles.chatArea}
            contentContainerStyle={dynamicStyles.messagesList}
            showsVerticalScrollIndicator={false}
          >
            {MOCK_MESSAGES.map((msg) => (
              <View
                key={msg.id}
                style={[
                  dynamicStyles.messageBubble,
                  msg.sender === 'Ty' ? dynamicStyles.myMessage : dynamicStyles.othersMessage
                ]}
              >
                {msg.sender !== 'Ty' && (
                  <Typography variant="label" style={{ marginBottom: 2, color: theme.colors.primary }}>{msg.sender}</Typography>
                )}
                <Typography variant="body">{msg.text}</Typography>
                <Typography variant="caption" color="textSecondary" style={dynamicStyles.timestamp}>
                  {msg.timestamp}
                </Typography>
              </View>
            ))}
          </ScrollView>

          <View style={dynamicStyles.inputArea}>
            <Input
              placeholder="Napisz do ekipy..."
              value={message}
              onChangeText={setMessage}
              containerStyle={{ flex: 1, marginBottom: 0 }}
            />
            <IconButton
              icon={<Icon name="Send" color="#fff" />}
              onPress={() => setMessage('')}
              style={dynamicStyles.sendButton}
            />
          </View>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  mainWrapper: {
    flex: 1,
  },
  sidebar: {
    width: '30%',
    maxWidth: 400,
    backgroundColor: theme.colors.background,
    borderRightWidth: 1,
    borderRightColor: theme.colors.border,
    overflow: 'hidden',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    ...theme.shadows.soft,
  },
  groupInfo: {
    marginLeft: 10,
  },
  chatArea: {
    flex: 1,
  },
  messagesList: {
    padding: 20,
    paddingBottom: 40,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
    ...theme.shadows.soft,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: theme.colors.primary + '20',
    borderTopRightRadius: 4,
  },
  othersMessage: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 4,
  },
  timestamp: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    paddingBottom: Platform.OS === 'ios' ? 40 : 15,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  sendButton: {
    backgroundColor: theme.colors.primary,
    marginLeft: 10,
    borderRadius: 12,
  }
});
