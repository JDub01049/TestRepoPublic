import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, typography, borderRadius } from '../theme';

export default function AIInsight({ insight, loading, error, onRefresh, compact = false }) {
  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Ionicons name="sparkles" size={18} color={colors.primary} />
          <Text style={styles.title}>AI Analysis</Text>
        </View>
        <View style={styles.loadingBox}>
          <ActivityIndicator color={colors.primary} size="small" />
          <Text style={styles.loadingText}>Analyzing market data...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Ionicons name="sparkles" size={18} color={colors.primary} />
          <Text style={styles.title}>AI Analysis</Text>
          {onRefresh && (
            <TouchableOpacity onPress={onRefresh} style={styles.refreshBtn}>
              <Ionicons name="refresh" size={16} color={colors.primary} />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle-outline" size={24} color={colors.warning} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </View>
    );
  }

  if (!insight) {
    return (
      <TouchableOpacity style={styles.container} onPress={onRefresh} activeOpacity={0.8}>
        <LinearGradient
          colors={['#1C1C2E', '#2D1B69']}
          style={styles.emptyGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="sparkles" size={32} color={colors.primary} />
          <Text style={styles.emptyTitle}>AI-Powered Analysis</Text>
          <Text style={styles.emptySubtitle}>Get price predictions and market insights powered by Claude AI</Text>
          <View style={styles.analyzeBtn}>
            <Text style={styles.analyzeBtnText}>Analyze Now</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  // Parse insight sections from markdown-style text
  const sections = parseInsight(insight);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <LinearGradient colors={[colors.primary, '#4A90D9']} style={styles.iconGradient}>
          <Ionicons name="sparkles" size={14} color="#fff" />
        </LinearGradient>
        <Text style={styles.title}>AI Analysis</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Claude AI</Text>
        </View>
        {onRefresh && (
          <TouchableOpacity onPress={onRefresh} style={styles.refreshBtn}>
            <Ionicons name="refresh" size={16} color={colors.text.secondary} />
          </TouchableOpacity>
        )}
      </View>

      {sections.length > 0 ? (
        sections.map((section, i) => (
          <View key={i} style={styles.section}>
            {section.heading && (
              <Text style={styles.sectionHeading}>{section.heading}</Text>
            )}
            <Text style={styles.sectionBody}>{section.body}</Text>
          </View>
        ))
      ) : (
        <Text style={styles.rawText}>{insight}</Text>
      )}

      <Text style={styles.disclaimer}>
        * AI analysis is for informational purposes only. Not financial advice.
      </Text>
    </View>
  );
}

function parseInsight(text) {
  const lines = text.split('\n').filter(l => l.trim());
  const sections = [];
  let current = null;

  for (const line of lines) {
    const headingMatch = line.match(/^\*{1,2}([^*]+)\*{1,2}:?\s*(.*)/);
    if (headingMatch) {
      if (current) sections.push(current);
      current = {
        heading: headingMatch[1].trim(),
        body: headingMatch[2].trim(),
      };
    } else if (current) {
      current.body += (current.body ? ' ' : '') + line.trim();
    } else {
      sections.push({ heading: null, body: line.trim() });
    }
  }
  if (current) sections.push(current);
  return sections.filter(s => s.body);
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  iconGradient: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: { ...typography.h4, color: colors.text.primary, flex: 1 },
  badge: {
    backgroundColor: 'rgba(108,92,231,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(108,92,231,0.4)',
  },
  badgeText: { ...typography.small, color: colors.primary, fontWeight: '600' },
  refreshBtn: { padding: 4 },
  loadingBox: {
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  loadingText: { ...typography.body, color: colors.text.secondary },
  errorBox: {
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  errorText: { ...typography.body, color: colors.text.secondary, flex: 1 },
  emptyGradient: {
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  emptyTitle: { ...typography.h3, color: colors.text.primary, marginTop: spacing.sm },
  emptySubtitle: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  analyzeBtn: {
    marginTop: spacing.sm,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  analyzeBtnText: { ...typography.body, color: '#fff', fontWeight: '700' },
  section: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionHeading: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  sectionBody: { ...typography.body, color: colors.text.primary, lineHeight: 20 },
  rawText: {
    ...typography.body,
    color: colors.text.primary,
    padding: spacing.md,
    lineHeight: 22,
  },
  disclaimer: {
    ...typography.small,
    color: colors.text.tertiary,
    padding: spacing.md,
    textAlign: 'center',
  },
});
