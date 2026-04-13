import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, Alert, Switch, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../theme';
import { useApp } from '../context/AppContext';

export default function SettingsScreen() {
  const { state, setApiKey, dispatch } = useApp();
  const [apiKeyInput, setApiKeyInput] = useState(state.apiKey || '');
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSaveKey = async () => {
    const trimmed = apiKeyInput.trim();
    if (!trimmed.startsWith('sk-ant-')) {
      Alert.alert('Invalid Key', 'Claude API keys should start with "sk-ant-". Please check your key.');
      return;
    }
    await setApiKey(trimmed);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    Alert.alert('Saved!', 'Your Claude API key has been saved.');
  };

  const handleClearKey = () => {
    Alert.alert('Clear API Key?', 'This will remove your API key and disable AI features.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear', style: 'destructive',
        onPress: async () => {
          await setApiKey('');
          setApiKeyInput('');
        },
      },
    ]);
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data?',
      'This will reset your watchlist and portfolio to defaults. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear', style: 'destructive',
          onPress: () => {
            dispatch({ type: 'LOAD_STATE', payload: {
              watchlist: ['bitcoin', 'ethereum', 'solana'],
              portfolio: [],
            }});
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
        </View>

        {/* AI Configuration */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="sparkles" size={18} color={colors.primary} />
            <Text style={styles.sectionTitle}>AI Configuration</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Add your Claude API key to enable AI-powered price analysis, market predictions, and the AI chat assistant.
          </Text>

          <View style={styles.apiKeyCard}>
            <Text style={styles.inputLabel}>Claude API Key</Text>
            <View style={styles.apiKeyInput}>
              <TextInput
                style={styles.keyInput}
                placeholder="sk-ant-api..."
                placeholderTextColor={colors.text.tertiary}
                value={apiKeyInput}
                onChangeText={setApiKeyInput}
                secureTextEntry={!showKey}
                autoCorrect={false}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowKey(!showKey)} style={styles.eyeBtn}>
                <Ionicons
                  name={showKey ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color={colors.text.secondary}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.keyActions}>
              <TouchableOpacity
                style={[styles.saveKeyBtn, saved && styles.savedKeyBtn]}
                onPress={handleSaveKey}
              >
                <Ionicons
                  name={saved ? 'checkmark-circle' : 'save-outline'}
                  size={16}
                  color="#fff"
                />
                <Text style={styles.saveKeyText}>{saved ? 'Saved!' : 'Save Key'}</Text>
              </TouchableOpacity>
              {state.apiKey ? (
                <TouchableOpacity style={styles.clearKeyBtn} onPress={handleClearKey}>
                  <Text style={styles.clearKeyText}>Clear</Text>
                </TouchableOpacity>
              ) : null}
            </View>

            {state.apiKey ? (
              <View style={styles.keyStatus}>
                <View style={styles.keyStatusDot} />
                <Text style={styles.keyStatusText}>API key configured — AI features enabled</Text>
              </View>
            ) : (
              <View style={[styles.keyStatus, { gap: spacing.xs }]}>
                <Ionicons name="alert-circle-outline" size={14} color={colors.warning} />
                <Text style={[styles.keyStatusText, { color: colors.warning }]}>No API key — AI features disabled</Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={styles.linkBtn}
            onPress={() => Linking.openURL('https://console.anthropic.com/account/keys')}
          >
            <Ionicons name="open-outline" size={16} color={colors.primary} />
            <Text style={styles.linkText}>Get your API key at console.anthropic.com</Text>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle" size={18} color={colors.secondary} />
            <Text style={styles.sectionTitle}>About</Text>
          </View>

          {[
            { label: 'App Version', value: '1.0.0' },
            { label: 'Data Source', value: 'CoinGecko API (Free)' },
            { label: 'AI Provider', value: 'Claude by Anthropic' },
            { label: 'Price Update', value: 'Every 60 seconds' },
          ].map((item, i) => (
            <View key={i} style={styles.infoRow}>
              <Text style={styles.infoLabel}>{item.label}</Text>
              <Text style={styles.infoValue}>{item.value}</Text>
            </View>
          ))}
        </View>

        {/* Watchlist Info */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="list" size={18} color={colors.text.secondary} />
            <Text style={styles.sectionTitle}>Your Data</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tracked Coins</Text>
            <Text style={styles.infoValue}>{state.watchlist.length}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Portfolio Entries</Text>
            <Text style={styles.infoValue}>{state.portfolio.length}</Text>
          </View>

          <TouchableOpacity style={styles.dangerBtn} onPress={handleClearData}>
            <Ionicons name="trash-outline" size={16} color={colors.negative} />
            <Text style={styles.dangerBtnText}>Reset to Defaults</Text>
          </TouchableOpacity>
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Ionicons name="warning-outline" size={16} color={colors.text.tertiary} />
          <Text style={styles.disclaimerText}>
            CryptoTracker AI provides market data and AI-generated insights for informational purposes only. Nothing here constitutes financial advice. Cryptocurrency investments are highly volatile and risky. Always do your own research.
          </Text>
        </View>

        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.md, paddingVertical: spacing.md },
  title: { ...typography.h2, color: colors.text.primary },
  section: {
    backgroundColor: colors.surface, marginHorizontal: spacing.md, marginBottom: spacing.md,
    borderRadius: borderRadius.lg, padding: spacing.md,
    borderWidth: 1, borderColor: colors.border,
  },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  sectionTitle: { ...typography.h4, color: colors.text.primary },
  sectionDescription: {
    ...typography.body, color: colors.text.secondary,
    lineHeight: 20, marginBottom: spacing.md,
  },
  apiKeyCard: {
    backgroundColor: colors.surfaceElevated, borderRadius: borderRadius.md,
    padding: spacing.md, marginBottom: spacing.sm,
  },
  inputLabel: {
    ...typography.caption, color: colors.text.secondary,
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.xs,
  },
  apiKeyInput: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.background, borderRadius: borderRadius.sm,
    borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: spacing.md, marginBottom: spacing.sm,
  },
  keyInput: { flex: 1, ...typography.body, color: colors.text.primary, paddingVertical: spacing.sm },
  eyeBtn: { padding: 4 },
  keyActions: { flexDirection: 'row', gap: spacing.sm },
  saveKeyBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: spacing.xs, backgroundColor: colors.primary,
    paddingVertical: spacing.sm, borderRadius: borderRadius.sm,
  },
  savedKeyBtn: { backgroundColor: colors.positive },
  saveKeyText: { ...typography.body, color: '#fff', fontWeight: '600' },
  clearKeyBtn: {
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm, borderWidth: 1, borderColor: colors.negative,
  },
  clearKeyText: { ...typography.body, color: colors.negative, fontWeight: '600' },
  keyStatus: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.xs },
  keyStatusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.positive },
  keyStatusText: { ...typography.caption, color: colors.positive },
  linkBtn: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    paddingVertical: spacing.sm,
  },
  linkText: { ...typography.body, color: colors.primary },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  infoLabel: { ...typography.body, color: colors.text.secondary },
  infoValue: { ...typography.body, color: colors.text.primary, fontWeight: '600' },
  dangerBtn: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    paddingVertical: spacing.sm, marginTop: spacing.sm,
  },
  dangerBtnText: { ...typography.body, color: colors.negative },
  disclaimer: {
    flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm,
    marginHorizontal: spacing.md, marginBottom: spacing.md,
  },
  disclaimerText: {
    ...typography.small, color: colors.text.tertiary, flex: 1, lineHeight: 18,
  },
});
