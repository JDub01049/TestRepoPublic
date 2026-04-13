import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, Image, RefreshControl, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, typography, borderRadius } from '../theme';
import { fetchMultiplePrices } from '../services/coinGeckoApi';
import { getPortfolioAnalysis } from '../services/claudeAI';
import { formatPrice, formatCurrency, formatPercentage } from '../utils/formatters';
import { useApp } from '../context/AppContext';
import AIInsight from '../components/AIInsight';

export default function PortfolioScreen({ navigation }) {
  const { state, dispatch } = useApp();
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [aiInsight, setAiInsight] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);

  const loadPrices = async (isRefresh = false) => {
    if (!state.portfolio.length) return;
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const ids = state.portfolio.map(p => p.coinId);
      const data = await fetchMultiplePrices(ids);
      setPrices(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadPrices(); }, [state.portfolio.length]);

  const getPortfolioStats = () => {
    let totalValue = 0;
    let totalCost = 0;
    const holdings = state.portfolio.map(item => {
      const currentPrice = prices[item.coinId]?.usd || 0;
      const value = item.amount * currentPrice;
      const cost = item.amount * (item.purchasePrice || 0);
      const pnl = value - cost;
      const pnlPct = cost > 0 ? (pnl / cost) * 100 : 0;
      totalValue += value;
      totalCost += cost;
      return { ...item, currentPrice, value, cost, pnl, pnlPct };
    });
    const totalPnl = totalValue - totalCost;
    const totalPnlPct = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;
    return { holdings, totalValue, totalCost, totalPnl, totalPnlPct };
  };

  const runAIAnalysis = async () => {
    if (!state.apiKey) {
      setAiError('No Claude API key. Add it in Settings.');
      return;
    }
    setAiLoading(true);
    setAiError(null);
    try {
      const { holdings, totalValue } = getPortfolioStats();
      const summary = holdings.map(h => ({
        name: h.name,
        symbol: (h.symbol || '').toUpperCase(),
        amount: h.amount,
        price: h.currentPrice,
        value: h.value.toFixed(2),
        change24h: (prices[h.coinId]?.usd_24h_change || 0).toFixed(2),
      }));
      const insight = await getPortfolioAnalysis(summary, totalValue, state.apiKey);
      setAiInsight(insight);
    } catch (err) {
      setAiError(err.message || 'AI analysis failed.');
    } finally {
      setAiLoading(false);
    }
  };

  const { holdings, totalValue, totalPnl, totalPnlPct } = getPortfolioStats();
  const isProfit = totalPnl >= 0;

  if (state.portfolio.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Portfolio</Text>
        </View>
        <View style={styles.center}>
          <Ionicons name="wallet-outline" size={64} color={colors.text.tertiary} />
          <Text style={styles.emptyTitle}>No Holdings Yet</Text>
          <Text style={styles.emptySubtitle}>
            Open a coin from your watchlist and tap "Add to Portfolio" to track your investments
          </Text>
          <TouchableOpacity
            style={styles.goToWatchlistBtn}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.goToWatchlistText}>Go to Watchlist</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={holdings}
        keyExtractor={item => item.coinId}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => loadPrices(true)} tintColor={colors.primary} />
        }
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <Text style={styles.title}>Portfolio</Text>
              {loading && <ActivityIndicator size="small" color={colors.primary} />}
            </View>

            {/* Summary Card */}
            <LinearGradient
              colors={isProfit ? ['#0D1F0D', '#1A3A1A'] : ['#1F0D0D', '#3A1A1A']}
              style={styles.summaryCard}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            >
              <Text style={styles.summaryLabel}>TOTAL VALUE</Text>
              <Text style={styles.summaryValue}>{formatCurrency(totalValue)}</Text>
              <View style={styles.pnlRow}>
                <Ionicons
                  name={isProfit ? 'trending-up' : 'trending-down'}
                  size={16}
                  color={isProfit ? colors.positive : colors.negative}
                />
                <Text style={[styles.pnlText, { color: isProfit ? colors.positive : colors.negative }]}>
                  {isProfit ? '+' : ''}{formatCurrency(totalPnl)} ({formatPercentage(totalPnlPct)})
                </Text>
                <Text style={styles.pnlLabel}>All Time</Text>
              </View>
            </LinearGradient>

            {/* AI Analysis */}
            <AIInsight
              insight={aiInsight}
              loading={aiLoading}
              error={aiError}
              onRefresh={runAIAnalysis}
            />

            <Text style={styles.holdingsHeader}>Holdings ({holdings.length})</Text>
          </>
        }
        renderItem={({ item }) => {
          const isItemProfit = item.pnl >= 0;
          return (
            <TouchableOpacity
              style={styles.holdingCard}
              onPress={() => navigation.navigate('Home', {
                screen: 'CryptoDetail',
                params: { coinId: item.coinId, coinName: item.name },
              })}
              activeOpacity={0.75}
            >
              <View style={styles.holdingLeft}>
                {item.image ? (
                  <Image source={{ uri: item.image }} style={styles.holdingIcon} />
                ) : (
                  <View style={[styles.holdingIcon, styles.holdingIconFallback]}>
                    <Text style={styles.holdingIconText}>{(item.symbol || '?')[0].toUpperCase()}</Text>
                  </View>
                )}
                <View>
                  <Text style={styles.holdingName}>{item.name}</Text>
                  <Text style={styles.holdingAmount}>
                    {item.amount} {(item.symbol || '').toUpperCase()}
                  </Text>
                </View>
              </View>
              <View style={styles.holdingRight}>
                <Text style={styles.holdingValue}>{formatCurrency(item.value)}</Text>
                <Text style={[
                  styles.holdingPnl,
                  { color: isItemProfit ? colors.positive : colors.negative }
                ]}>
                  {isItemProfit ? '+' : ''}{formatCurrency(item.pnl)} ({formatPercentage(item.pnlPct)})
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.md, paddingVertical: spacing.md,
  },
  title: { ...typography.h2, color: colors.text.primary },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl, gap: spacing.md },
  emptyTitle: { ...typography.h3, color: colors.text.primary },
  emptySubtitle: { ...typography.body, color: colors.text.secondary, textAlign: 'center', lineHeight: 22 },
  goToWatchlistBtn: {
    backgroundColor: colors.primary, paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm, borderRadius: borderRadius.full, marginTop: spacing.sm,
  },
  goToWatchlistText: { ...typography.body, color: '#fff', fontWeight: '600' },
  summaryCard: {
    marginHorizontal: spacing.md, marginBottom: spacing.sm,
    borderRadius: borderRadius.lg, padding: spacing.lg,
  },
  summaryLabel: { ...typography.small, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 1 },
  summaryValue: { ...typography.h1, color: '#fff', marginVertical: 6 },
  pnlRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  pnlText: { ...typography.body, fontWeight: '700' },
  pnlLabel: { ...typography.caption, color: 'rgba(255,255,255,0.5)', marginLeft: 4 },
  holdingsHeader: {
    ...typography.h4, color: colors.text.secondary,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  holdingCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.surface, marginHorizontal: spacing.md, marginVertical: 4,
    padding: spacing.md, borderRadius: borderRadius.lg,
    borderWidth: 1, borderColor: colors.border,
  },
  holdingLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 },
  holdingIcon: { width: 42, height: 42, borderRadius: 21 },
  holdingIconFallback: { backgroundColor: colors.surfaceElevated, justifyContent: 'center', alignItems: 'center' },
  holdingIconText: { ...typography.h4, color: colors.text.primary },
  holdingName: { ...typography.h4, color: colors.text.primary },
  holdingAmount: { ...typography.caption, color: colors.text.secondary, marginTop: 2 },
  holdingRight: { alignItems: 'flex-end' },
  holdingValue: { ...typography.h4, color: colors.text.primary },
  holdingPnl: { ...typography.caption, fontWeight: '600', marginTop: 2 },
});
