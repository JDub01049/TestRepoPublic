import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, typography, borderRadius } from '../theme';
import { chatWithAI } from '../services/claudeAI';
import { useApp } from '../context/AppContext';

const SUGGESTED_PROMPTS = [
  'What is the current Bitcoin outlook?',
  'Should I buy Ethereum now?',
  'Explain crypto market cycles',
  'What is DeFi and how does it work?',
  'How to manage crypto portfolio risk?',
  'What drives Bitcoin price movements?',
];

export default function AIAssistantScreen({ navigation }) {
  const { state } = useApp();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef(null);

  const sendMessage = async (text) => {
    const userMessage = text || input.trim();
    if (!userMessage) return;
    if (!state.apiKey) {
      setMessages(prev => [...prev,
        { role: 'user', content: userMessage, id: Date.now() },
        {
          role: 'assistant',
          content: 'Please add your Claude API key in Settings to use the AI assistant.',
          id: Date.now() + 1,
          isError: true,
        },
      ]);
      setInput('');
      return;
    }

    const newUserMsg = { role: 'user', content: userMessage, id: Date.now() };
    const updatedMessages = [...messages, newUserMsg];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      const apiMessages = updatedMessages.map(m => ({ role: m.role, content: m.content }));
      const response = await chatWithAI(apiMessages, state.apiKey);
      setMessages(prev => [...prev, { role: 'assistant', content: response, id: Date.now() }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Error: ${err.message}`,
        id: Date.now(),
        isError: true,
      }]);
    } finally {
      setLoading(false);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const clearChat = () => setMessages([]);

  const renderMessage = ({ item }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.messageRow, isUser && styles.messageRowUser]}>
        {!isUser && (
          <LinearGradient colors={[colors.primary, '#4A90D9']} style={styles.aiAvatar}>
            <Ionicons name="sparkles" size={14} color="#fff" />
          </LinearGradient>
        )}
        <View style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.aiBubble,
          item.isError && styles.errorBubble,
        ]}>
          <Text style={[styles.messageText, isUser && styles.userMessageText]}>
            {item.content}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <LinearGradient colors={[colors.primary, '#4A90D9']} style={styles.headerIcon}>
              <Ionicons name="sparkles" size={16} color="#fff" />
            </LinearGradient>
            <View>
              <Text style={styles.headerTitle}>AI Crypto Assistant</Text>
              <Text style={styles.headerSubtitle}>Powered by Claude AI</Text>
            </View>
          </View>
          {messages.length > 0 && (
            <TouchableOpacity onPress={clearChat} style={styles.clearBtn}>
              <Ionicons name="trash-outline" size={18} color={colors.text.secondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Messages or Welcome */}
        {messages.length === 0 ? (
          <View style={styles.welcome}>
            <LinearGradient
              colors={['rgba(108,92,231,0.15)', 'transparent']}
              style={styles.welcomeGradient}
            >
              <Ionicons name="logo-bitcoin" size={48} color={colors.bitcoin} />
              <Text style={styles.welcomeTitle}>Ask Me Anything</Text>
              <Text style={styles.welcomeSubtitle}>
                Get AI-powered insights about Bitcoin, altcoins, market trends, and portfolio strategy
              </Text>
            </LinearGradient>

            <Text style={styles.suggestionsLabel}>Suggested Questions</Text>
            <View style={styles.suggestions}>
              {SUGGESTED_PROMPTS.map((prompt, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.suggestionChip}
                  onPress={() => sendMessage(prompt)}
                >
                  <Text style={styles.suggestionText}>{prompt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={item => item.id.toString()}
            renderItem={renderMessage}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          />
        )}

        {/* Loading */}
        {loading && (
          <View style={styles.typingIndicator}>
            <LinearGradient colors={[colors.primary, '#4A90D9']} style={styles.aiAvatarSmall}>
              <Ionicons name="sparkles" size={12} color="#fff" />
            </LinearGradient>
            <View style={styles.typingDots}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.typingText}>Analyzing...</Text>
            </View>
          </View>
        )}

        {/* Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Ask about Bitcoin, market trends..."
            placeholderTextColor={colors.text.tertiary}
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={500}
            returnKeyType="send"
            onSubmitEditing={() => sendMessage()}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
            onPress={() => sendMessage()}
            disabled={!input.trim() || loading}
          >
            <Ionicons name="send" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  headerIcon: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { ...typography.h4, color: colors.text.primary },
  headerSubtitle: { ...typography.small, color: colors.text.secondary },
  clearBtn: { padding: 8 },
  welcome: { flex: 1 },
  welcomeGradient: {
    alignItems: 'center', padding: spacing.xl, gap: spacing.sm,
  },
  welcomeTitle: { ...typography.h2, color: colors.text.primary, marginTop: spacing.sm },
  welcomeSubtitle: {
    ...typography.body, color: colors.text.secondary,
    textAlign: 'center', lineHeight: 22, maxWidth: 280,
  },
  suggestionsLabel: {
    ...typography.caption, color: colors.text.secondary,
    paddingHorizontal: spacing.md, marginTop: spacing.sm,
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  suggestions: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: spacing.md, gap: spacing.sm, marginTop: spacing.sm,
  },
  suggestionChip: {
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderRadius: borderRadius.full, borderWidth: 1, borderColor: colors.border,
  },
  suggestionText: { ...typography.caption, color: colors.text.secondary },
  messagesList: { padding: spacing.md, gap: spacing.sm, paddingBottom: spacing.md },
  messageRow: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm, marginBottom: spacing.sm },
  messageRowUser: { flexDirection: 'row-reverse' },
  aiAvatar: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  messageBubble: { maxWidth: '80%', borderRadius: borderRadius.lg, padding: spacing.md },
  userBubble: { backgroundColor: colors.primary },
  aiBubble: { backgroundColor: colors.surfaceElevated, borderWidth: 1, borderColor: colors.border },
  errorBubble: { backgroundColor: 'rgba(255,68,68,0.1)', borderColor: colors.negative },
  messageText: { ...typography.body, color: colors.text.primary, lineHeight: 22 },
  userMessageText: { color: '#fff' },
  typingIndicator: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm, gap: spacing.sm,
  },
  aiAvatarSmall: { width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  typingDots: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  typingText: { ...typography.caption, color: colors.text.secondary },
  inputContainer: {
    flexDirection: 'row', alignItems: 'flex-end',
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderTopWidth: 1, borderTopColor: colors.border, gap: spacing.sm,
  },
  input: {
    flex: 1, backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.lg, paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    ...typography.body, color: colors.text.primary,
    borderWidth: 1, borderColor: colors.border, maxHeight: 100,
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center',
  },
  sendBtnDisabled: { backgroundColor: colors.surfaceElevated },
});
