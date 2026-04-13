import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Modal, TextInput, Alert, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, typography, borderRadius } from '../theme';
import { fetchCoinDetails, fetchHistoricalData } from '../services/coinGeckoApi';
import { getAIInsights } from '../services/claudeAI';
import { formatPrice, formatPercentage, formatMarketCap, formatCurrency } from '../utils/formatters';
import { useApp } from '../context/AppContext';
import PriceChart from '../components/PriceChart';
import AIInsight from '../components/AIInsight';

export default function CryptoDetailScreen({ route, navigation }) {
  const { coinId, coinName } = route.params;
  const { state, dispatch } = useApp();

  const [coin, setCoin] = useState(null);
  const [historical, setHistorical] = useState(null);
  const [chartLoading, setChartLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [aiInsight, setAiInsight] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [portfolioModal, setPortfolioModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');

  const isWatched = state.watchlist.includes(coinId);
  const portfolioEntry = state.portfolio.find(p => p.coinId === coinId);

  const loadCoin = useCallback(async () => {
    try {
      const [details, hist] = await Promise.all([
        fetchCoinDetails(coinId),
        fetchHistoricalData(coinId, 7),
      ]);
      setCoin(details);
      setHistorical(hist);
    } catch (err) {
      Alert.alert('Error', 'Failed to load coin data.');
    } finally {
      setLoading(false);
    }
  }, [coinId]);

  useEffect(() => { loadCoin(); }, [loadCoin]);

  const loadHistorical = async (days) => {
    setChartLoading(true);
    try {
      const hist = await fetchHistoricalData(coinId, days);
      setHistorical(hist);
    } catch (err) {
      console.error(err);
    } finally {
      setChartLoading(false);
    }
  };

  const loadAIInsight = async () => {
    if (!state.apiKey) {
      setAiError('No API key configured. Please add your Claude API key in Settings.');
      return;
    }
    setAiLoading(true);
    setAiError(null);
    try {
      const marketData = coin?.market_data || {};
      const coinForAI = {
        name: coin?.name,
        symbol: coin?.symbol,
        current_price: marketData.current_price?.usd,
        price_change_percentage_24h: marketData.price_change_percentage_24h,
        price_change_percentage_7d_in_currency: marketData.price_change_percentage_7d_in_currency?.usd,
        market_cap: marketData.market_cap?.usd,
        total_volume: marketData.total_volume?.usd,
        ath: marketData.ath?.usd,
        atl: marketData.atl?.usd,
      };
      const insight = await getAIInsights(coinForAI, historical?.prices || [], state.apiKey);
      setAiInsight(insight);
    } catch (err) {
      setAiError(err.message || 'Failed to get AI analysis.');
    } finally {
      setAiLoading(false);
    }
  };

  const toggleWatchlist = () => {
    if (isWatched) {
      Alert.alert('Remove from Watchlist?', `Remove ${coinName} from your watchlist?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => dispatch({ type: 'REMOVE_FROM_WATCHLIST', coinId }) },
      ]);
    } else {
      dispatch({ type: 'ADD_TO_WATCHLIST', coinId });
    }
  };

  const savePortfolio = () => {
    const amt = parseFloat(amount);
    const price = parseFloat(purchasePrice);
    if (isNaN(amt) || amt <= 0) { Alert.alert('Invalid', 'Enter a valid amount.'); return; }
    dispatch({
      type: 'ADD_PORTFOLIO_ENTRY',
      payload: {
        coinId,
        symbol: coin?.symbol || '',
        name: coinName,
        image: coin?.image?.small,
        amount: amt,
        purchasePrice: isNaN(price) ? (coin?.market_data?.current_price?.usd || 0) : price,
        addedAt: Date.now(),
      },
    });
    setPortfolioModal(false);
    setAmount('');
    setPurchasePrice('');
    Alert.alert('Added to Portfolio', `${amt} ${(coin?.symbol || '').toUpperCase()} added.`);
  };

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading {coinName}...</Text>
      </View>
    );
  }

  const md = coin?.market_data || {};
  const price = md.current_price?.usd || 0;
  const change24h = md.price_change_percentage_24h || 0;
  const isPositive = change24h >= 0;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Header */}
        <LinearGradient
          colors={isPositive ? ['#0A0A0F', '#0A1A0A'] : ['#0A0A0F', '#1A0A0A']}
          style={styles.hero}
        >
          <View style={styles.heroHeader}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={22} color={colors.text.primary} />
            </TouchableOpacity>
            <View style={styles.heroCoinInfo}>
              {coin?.image?.small && <Image source={{ uri: coin.image.small }} style={styles.coinIcon} />}
              <View>
                <Text style={styles.coinName}>{coinName}</Text>
                <Text style={styles.coinSymbol}>{(coin?.symbol || '').toUpperCase()}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={toggleWatchlist} style={styles.watchlistBtn}>
              <Ionicons
                name={isWatched ? 'star' : 'star-outline'}
                size={24}
                color={isWatched ? '#FFD700' : colors.text.secondary}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.priceSection}>
            <Text style={styles.price}>{formatPrice(price)}</Text>
            <View style={[styles.changeChip,
              { backgroundColor: isPositive ? 'rgba(0,200,81,0.15)' : 'rgba(255,68,68,0.15)' }]}>
              <Ionicons
                name={isPositive ? 'trending-up' : 'trending-down'}
                size={14}
                color={isPositive ? colors.positive : colors.negative}
              />
              <Text style={[styles.changeText, { color: isPositive ? colors.positive : colors.negative }]}>
                {formatPercentage(change24h)}
              </Text>
            </View>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => setPortfolioModal(true)}
            >
              <Ionicons name="add-circle-outline" size={18} color={colors.primary} />
              <Text style={styles.actionBtnText}>
                {portfolioEntry ? 'Update Holdings' : 'Add to Portfolio'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={loadAIInsight}>
              <Ionicons name="sparkles" size={18} color={colors.secondary} />
              <Text style={[styles.actionBtnText, { color: colors.secondary }]}>AI Analysis</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Price Chart */}
        <PriceChart
          historicalData={historical}
          loading={chartLoading}
          isPositive={isPositive}
          onPeriodChange={loadHistorical}
        />

        {/* Market Stats */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Market Statistics</Text>
          <View style={styles.statsGrid}>
            {[
              { label: 'Market Cap', value: formatMarketCap(md.market_cap?.usd) },
              { label: '24h Volume', value: formatMarketCap(md.total_volume?.usd) },
              { label: '24h High', value: formatPrice(md.high_24h?.usd) },
              { label: '24h Low', value: formatPrice(md.low_24h?.usd) },
              { label: 'All-Time High', value: formatPrice(md.ath?.usd) },
              { label: 'ATH Change', value: formatPercentage(md.ath_change_percentage?.usd), color: md.ath_change_percentage?.usd >= 0 ? colors.positive : colors.negative },
              { label: 'All-Time Low', value: formatPrice(md.atl?.usd) },
              { label: 'Circulating Supply', value: md.circulating_supply ? `${(md.circulating_supply / 1e6).toFixed(2)}M` : 'N/A' },
            ].map((stat, i) => (
              <View key={i} style={styles.statItem}>
                <Text style={styles.statLabel}>{stat.label}</Text>
                <Text style={[styles.statValue, stat.color && { color: stat.color }]}>{stat.value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Portfolio Holdings */}
        {portfolioEntry && (
          <View style={styles.holdingsCard}>
            <View style={styles.holdingsHeader}>
              <Text style={styles.holdingsTitle}>Your Holdings</Text>
              <TouchableOpacity onPress={() => dispatch({ type: 'REMOVE_PORTFOLIO_ENTRY', coinId })}>
                <Ionicons name="trash-outline" size={18} color={colors.negative} />
              </TouchableOpacity>
            </View>
            <View style={styles.holdingsRow}>
              <View style={styles.holdingsStat}>
                <Text style={styles.holdingsLabel}>Amount</Text>
                <Text style={styles.holdingsValue}>
                  {portfolioEntry.amount} {(coin?.symbol || '').toUpperCase()}
                </Text>
              </View>
              <View style={styles.holdingsStat}>
                <Text style={styles.holdingsLabel}>Current Value</Text>
                <Text style={styles.holdingsValue}>{formatCurrency(portfolioEntry.amount * price)}</Text>
              </View>
              <View style={styles.holdingsStat}>
                <Text style={styles.holdingsLabel}>Avg Buy Price</Text>
                <Text style={styles.holdingsValue}>{formatPrice(portfolioEntry.purchasePrice)}</Text>
              </View>
            </View>
          </View>
        )}

        {/* AI Insight */}
        <AIInsight
          insight={aiInsight}
          loading={aiLoading}
          error={aiError}
          onRefresh={loadAIInsight}
        />

        <View style={{ height: spacing.xl }} />
      </ScrollView>

      {/* Portfolio Modal */}
      <Modal visible={portfolioModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add {coinName} Holdings</Text>
            <Text style={styles.modalSubtitle}>Track your investment performance</Text>

            <Text style={styles.inputLabel}>Amount ({(coin?.symbol || '').toUpperCase()})</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 0.5"
              placeholderTextColor={colors.text.tertiary}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
            />

            <Text style={styles.inputLabel}>Purchase Price (USD) — optional</Text>
            <TextInput
              style={styles.input}
              placeholder={`Current: ${formatPrice(price)}`}
              placeholderTextColor={colors.text.tertiary}
              value={purchasePrice}
              onChangeText={setPurchasePrice}
              keyboardType="decimal-pad"
            />

            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setPortfolioModal(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={savePortfolio}>
                <Text style={styles.saveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loadingScreen: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background, gap: spacing.md },
  loadingText: { ...typography.body, color: colors.text.secondary },
  hero: { padding: spacing.md, paddingTop: spacing.sm },
  heroHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  backBtn: { padding: 4, marginRight: spacing.sm },
  heroCoinInfo: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 },
  coinIcon: { width: 36, height: 36, borderRadius: 18 },
  coinName: { ...typography.h3, color: colors.text.primary },
  coinSymbol: { ...typography.caption, color: colors.text.secondary },
  watchlistBtn: { padding: 4 },
  priceSection: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md },
  price: { ...typography.h1, color: colors.text.primary },
  changeChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: spacing.sm, paddingVertical: 5, borderRadius: borderRadius.sm,
  },
  changeText: { ...typography.body, fontWeight: '700' },
  actionRow: { flexDirection: 'row', gap: spacing.sm },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: spacing.xs, backgroundColor: colors.surfaceElevated,
    paddingVertical: spacing.sm, borderRadius: borderRadius.md,
    borderWidth: 1, borderColor: colors.border,
  },
  actionBtnText: { ...typography.body, color: colors.primary, fontWeight: '600' },
  statsCard: {
    backgroundColor: colors.surface, marginHorizontal: spacing.md, marginVertical: spacing.sm,
    borderRadius: borderRadius.lg, padding: spacing.md,
    borderWidth: 1, borderColor: colors.border,
  },
  statsTitle: { ...typography.h4, color: colors.text.primary, marginBottom: spacing.md },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  statItem: { width: '50%', paddingVertical: spacing.sm, paddingRight: spacing.sm },
  statLabel: { ...typography.caption, color: colors.text.secondary, marginBottom: 3 },
  statValue: { ...typography.body, color: colors.text.primary, fontWeight: '600' },
  holdingsCard: {
    backgroundColor: colors.surface, marginHorizontal: spacing.md, marginVertical: spacing.sm,
    borderRadius: borderRadius.lg, padding: spacing.md,
    borderWidth: 1, borderColor: 'rgba(108,92,231,0.3)',
  },
  holdingsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  holdingsTitle: { ...typography.h4, color: colors.text.primary },
  holdingsRow: { flexDirection: 'row' },
  holdingsStat: { flex: 1 },
  holdingsLabel: { ...typography.caption, color: colors.text.secondary, marginBottom: 3 },
  holdingsValue: { ...typography.body, color: colors.text.primary, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: spacing.xl, paddingBottom: spacing.xxl,
  },
  modalTitle: { ...typography.h3, color: colors.text.primary, marginBottom: 4 },
  modalSubtitle: { ...typography.body, color: colors.text.secondary, marginBottom: spacing.lg },
  inputLabel: { ...typography.caption, color: colors.text.secondary, marginBottom: spacing.xs, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    backgroundColor: colors.surfaceElevated, borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    ...typography.body, color: colors.text.primary,
    borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md,
  },
  modalBtns: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm },
  cancelBtn: {
    flex: 1, paddingVertical: spacing.md, alignItems: 'center',
    borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border,
  },
  cancelBtnText: { ...typography.body, color: colors.text.secondary, fontWeight: '600' },
  saveBtn: { flex: 1, paddingVertical: spacing.md, alignItems: 'center', borderRadius: borderRadius.md, backgroundColor: colors.primary },
  saveBtnText: { ...typography.body, color: '#fff', fontWeight: '700' },
});
