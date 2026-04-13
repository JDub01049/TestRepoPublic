import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, ActivityIndicator, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, typography, borderRadius } from '../theme';
import { fetchTopCoins, fetchGlobalData } from '../services/coinGeckoApi';
import { formatPrice, formatPercentage, formatMarketCap, formatCurrency } from '../utils/formatters';
import { useApp } from '../context/AppContext';
import CryptoCard from '../components/CryptoCard';

export default function DashboardScreen({ navigation }) {
  const { state } = useApp();
  const [coins, setCoins] = useState([]);
  const [globalData, setGlobalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('watchlist');
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const [coinsData, global] = await Promise.all([
        fetchTopCoins('usd', 100),
        fetchGlobalData(),
      ]);
      setCoins(coinsData);
      setGlobalData(global);
    } catch (err) {
      setError('Failed to load market data. Pull down to retry.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, [loadData]);

  const onRefresh = () => { setRefreshing(true); loadData(); };

  const watchlistCoins = coins.filter(c => state.watchlist.includes(c.id));
  const displayCoins = activeTab === 'watchlist' ? watchlistCoins : coins.slice(0, 50);

  const totalPortfolioValue = state.portfolio.reduce((sum, item) => {
    const coin = coins.find(c => c.id === item.coinId);
    return sum + (coin ? coin.current_price * item.amount : 0);
  }, 0);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.appTitle}>CryptoTracker AI</Text>
          <Text style={styles.subtitle}>
            {globalData
              ? `Market Cap: ${formatMarketCap(globalData.total_market_cap?.usd)}`
              : 'Loading market...'}
          </Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('Search')}>
          <Ionicons name="add" size={24} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      {/* Portfolio Card */}
      {state.portfolio.length > 0 && (
        <LinearGradient
          colors={['#6C5CE7', '#4A90D9']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.portfolioCard}
        >
          <Text style={styles.portfolioLabel}>PORTFOLIO VALUE</Text>
          <Text style={styles.portfolioValue}>{formatCurrency(totalPortfolioValue)}</Text>
          <Text style={styles.portfolioMeta}>
            {state.portfolio.length} asset{state.portfolio.length !== 1 ? 's' : ''}
          </Text>
        </LinearGradient>
      )}

      {/* Market Pills */}
      {globalData && (
        <ScrollView
          horizontal showsHorizontalScrollIndicator={false}
          style={styles.pills} contentContainerStyle={styles.pillsContent}
        >
          {[
            { label: 'BTC Dom', value: `${globalData.market_cap_percentage?.btc?.toFixed(1)}%` },
            { label: 'ETH Dom', value: `${globalData.market_cap_percentage?.eth?.toFixed(1)}%` },
            { label: 'Active', value: (globalData.active_cryptocurrencies || 0).toLocaleString() },
            {
              label: '24h Change',
              value: formatPercentage(globalData.market_cap_change_percentage_24h_usd),
              color: globalData.market_cap_change_percentage_24h_usd >= 0 ? colors.positive : colors.negative,
            },
          ].map((pill, i) => (
            <View key={i} style={styles.pill}>
              <Text style={styles.pillLabel}>{pill.label}</Text>
              <Text style={[styles.pillValue, pill.color && { color: pill.color }]}>{pill.value}</Text>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Tab Selector */}
      <View style={styles.tabs}>
        {[['watchlist', `Watchlist (${state.watchlist.length})`], ['top50', 'Top 50']].map(([key, label]) => (
          <TouchableOpacity
            key={key}
            style={[styles.tab, activeTab === key && styles.activeTab]}
            onPress={() => setActiveTab(key)}
          >
            <Text style={[styles.tabText, activeTab === key && styles.activeTabText]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Fetching live prices...</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Ionicons name="cloud-offline-outline" size={48} color={colors.text.secondary} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={loadData}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : displayCoins.length === 0 && activeTab === 'watchlist' ? (
        <View style={styles.center}>
          <Ionicons name="eye-outline" size={64} color={colors.text.tertiary} />
          <Text style={styles.emptyTitle}>Watchlist is empty</Text>
          <Text style={styles.emptySubtitle}>Tap + to add cryptocurrencies</Text>
          <TouchableOpacity style={styles.addCryptoBtn} onPress={() => navigation.navigate('Search')}>
            <Ionicons name="add-circle-outline" size={18} color="#fff" />
            <Text style={styles.addCryptoBtnText}>Add Crypto</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={displayCoins}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <CryptoCard
              coin={item}
              onPress={() => navigation.navigate('CryptoDetail', { coinId: item.id, coinName: item.name })}
            />
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
          contentContainerStyle={{ paddingBottom: spacing.xl }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.md, paddingVertical: spacing.md,
  },
  appTitle: { ...typography.h2, color: colors.text.primary },
  subtitle: { ...typography.caption, color: colors.text.secondary, marginTop: 2 },
  addBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.surfaceElevated,
    justifyContent: 'center', alignItems: 'center',
  },
  portfolioCard: {
    marginHorizontal: spacing.md, marginBottom: spacing.sm,
    borderRadius: borderRadius.lg, padding: spacing.lg,
  },
  portfolioLabel: {
    ...typography.small, color: 'rgba(255,255,255,0.65)',
    textTransform: 'uppercase', letterSpacing: 1,
  },
  portfolioValue: { ...typography.h1, color: '#fff', marginVertical: 4 },
  portfolioMeta: { ...typography.caption, color: 'rgba(255,255,255,0.6)' },
  pills: { maxHeight: 58 },
  pillsContent: { paddingHorizontal: spacing.md, gap: spacing.sm, paddingBottom: 4 },
  pill: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.full, paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderWidth: 1, borderColor: colors.border, marginRight: spacing.xs,
  },
  pillLabel: { ...typography.small, color: colors.text.secondary },
  pillValue: { ...typography.caption, color: colors.text.primary, fontWeight: '700' },
  tabs: {
    flexDirection: 'row', marginHorizontal: spacing.md, marginVertical: spacing.sm,
    backgroundColor: colors.surfaceElevated, borderRadius: borderRadius.md, padding: 3,
  },
  tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: borderRadius.sm },
  activeTab: { backgroundColor: colors.primary },
  tabText: { ...typography.body, color: colors.text.secondary, fontWeight: '600' },
  activeTabText: { color: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.md, padding: spacing.xl },
  loadingText: { ...typography.body, color: colors.text.secondary },
  errorText: { ...typography.body, color: colors.text.secondary, textAlign: 'center' },
  retryBtn: { backgroundColor: colors.primary, paddingHorizontal: spacing.xl, paddingVertical: spacing.sm, borderRadius: borderRadius.full },
  retryText: { ...typography.body, color: '#fff', fontWeight: '600' },
  emptyTitle: { ...typography.h3, color: colors.text.primary },
  emptySubtitle: { ...typography.body, color: colors.text.secondary, textAlign: 'center' },
  addCryptoBtn: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    backgroundColor: colors.primary, paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm, borderRadius: borderRadius.full, marginTop: spacing.sm,
  },
  addCryptoBtnText: { ...typography.body, color: '#fff', fontWeight: '600' },
});
