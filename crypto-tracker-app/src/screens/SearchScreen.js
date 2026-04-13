import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, ActivityIndicator, Image, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../theme';
import { searchCoins, fetchTopCoins } from '../services/coinGeckoApi';
import { useApp } from '../context/AppContext';

export default function SearchScreen({ navigation }) {
  const { state, dispatch } = useApp();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = useCallback(async (text) => {
    setQuery(text);
    if (!text.trim()) { setResults([]); setSearched(false); return; }
    setLoading(true);
    try {
      const data = await searchCoins(text);
      setResults(data.slice(0, 30));
      setSearched(true);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const addToWatchlist = (coin) => {
    if (state.watchlist.includes(coin.id)) {
      Alert.alert('Already Added', `${coin.name} is already in your watchlist.`);
      return;
    }
    dispatch({ type: 'ADD_TO_WATCHLIST', coinId: coin.id });
    Alert.alert('Added!', `${coin.name} added to your watchlist.`, [
      { text: 'Keep Adding' },
      { text: 'Go to Dashboard', onPress: () => navigation.goBack() },
    ]);
  };

  const removeFromWatchlist = (coinId) => {
    dispatch({ type: 'REMOVE_FROM_WATCHLIST', coinId });
  };

  const renderCoin = ({ item }) => {
    const isTracked = state.watchlist.includes(item.id);
    return (
      <View style={styles.resultItem}>
        <View style={styles.resultLeft}>
          {item.large || item.thumb ? (
            <Image source={{ uri: item.large || item.thumb }} style={styles.resultIcon} />
          ) : (
            <View style={[styles.resultIcon, styles.resultIconFallback]}>
              <Text style={styles.resultIconLetter}>{(item.symbol || '?')[0].toUpperCase()}</Text>
            </View>
          )}
          <View>
            <Text style={styles.resultName} numberOfLines={1}>{item.name}</Text>
            <View style={styles.resultMeta}>
              <Text style={styles.resultSymbol}>{(item.symbol || '').toUpperCase()}</Text>
              {item.market_cap_rank && (
                <View style={styles.rankPill}>
                  <Text style={styles.rankText}>#{item.market_cap_rank}</Text>
                </View>
              )}
            </View>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.addBtn, isTracked && styles.addedBtn]}
          onPress={() => isTracked ? removeFromWatchlist(item.id) : addToWatchlist(item)}
        >
          <Ionicons
            name={isTracked ? 'checkmark-circle' : 'add-circle-outline'}
            size={22}
            color={isTracked ? colors.positive : colors.primary}
          />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Add Crypto</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={colors.text.secondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search Bitcoin, Ethereum, Solana..."
          placeholderTextColor={colors.text.tertiary}
          value={query}
          onChangeText={handleSearch}
          autoFocus
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
        />
        {loading && <ActivityIndicator size="small" color={colors.primary} style={{ marginRight: spacing.sm }} />}
        {query.length > 0 && !loading && (
          <TouchableOpacity onPress={() => { setQuery(''); setResults([]); setSearched(false); }}>
            <Ionicons name="close-circle" size={20} color={colors.text.secondary} />
          </TouchableOpacity>
        )}
      </View>

      {!searched && !query && (
        <View style={styles.hint}>
          <Ionicons name="information-circle-outline" size={20} color={colors.text.tertiary} />
          <Text style={styles.hintText}>Search for any cryptocurrency by name or symbol</Text>
        </View>
      )}

      {searched && results.length === 0 && (
        <View style={styles.center}>
          <Ionicons name="search-outline" size={48} color={colors.text.tertiary} />
          <Text style={styles.noResults}>No coins found for "{query}"</Text>
        </View>
      )}

      <FlatList
        data={results}
        keyExtractor={item => item.id}
        renderItem={renderCoin}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.md, paddingTop: spacing.sm, paddingBottom: spacing.xs, gap: spacing.sm,
  },
  backBtn: { padding: 4 },
  title: { ...typography.h3, color: colors.text.primary },
  searchContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface, marginHorizontal: spacing.md, marginVertical: spacing.sm,
    borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: spacing.md, height: 50,
  },
  searchIcon: { marginRight: spacing.sm },
  searchInput: { flex: 1, ...typography.body, color: colors.text.primary },
  hint: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    paddingHorizontal: spacing.lg, marginTop: spacing.md,
  },
  hintText: { ...typography.body, color: colors.text.tertiary, flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.md },
  noResults: { ...typography.body, color: colors.text.secondary },
  resultItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.surface, marginHorizontal: spacing.md, marginVertical: 4,
    padding: spacing.md, borderRadius: borderRadius.lg,
    borderWidth: 1, borderColor: colors.border,
  },
  resultLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: spacing.md },
  resultIcon: { width: 40, height: 40, borderRadius: 20 },
  resultIconFallback: { backgroundColor: colors.surfaceElevated, justifyContent: 'center', alignItems: 'center' },
  resultIconLetter: { ...typography.h4, color: colors.text.primary },
  resultName: { ...typography.h4, color: colors.text.primary, maxWidth: 180 },
  resultMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  resultSymbol: { ...typography.caption, color: colors.text.secondary },
  rankPill: { backgroundColor: colors.surfaceElevated, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  rankText: { ...typography.small, color: colors.text.secondary },
  addBtn: { padding: 4 },
  addedBtn: {},
});
