import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../theme';
import { formatPrice, formatPercentage } from '../utils/formatters';

export default function CryptoCard({ coin, onPress }) {
  const change = coin.price_change_percentage_24h;
  const isPositive = change >= 0;
  const changeColor = isPositive ? colors.positive : colors.negative;
  const changeBg = isPositive ? 'rgba(0,200,81,0.12)' : 'rgba(255,68,68,0.12)';

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.left}>
        {coin.image ? (
          <Image source={{ uri: coin.image }} style={styles.icon} />
        ) : (
          <View style={[styles.icon, styles.iconFallback]}>
            <Text style={styles.iconLetter}>{(coin.symbol || '?')[0].toUpperCase()}</Text>
          </View>
        )}
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>{coin.name}</Text>
          <View style={styles.meta}>
            {coin.market_cap_rank ? (
              <View style={styles.rankBadge}>
                <Text style={styles.rankText}>#{coin.market_cap_rank}</Text>
              </View>
            ) : null}
            <Text style={styles.symbol}>{(coin.symbol || '').toUpperCase()}</Text>
          </View>
        </View>
      </View>

      <View style={styles.right}>
        <Text style={styles.price}>{formatPrice(coin.current_price)}</Text>
        <View style={[styles.changePill, { backgroundColor: changeBg }]}>
          <Ionicons
            name={isPositive ? 'trending-up' : 'trending-down'}
            size={11}
            color={changeColor}
          />
          <Text style={[styles.changeText, { color: changeColor }]}>
            {formatPercentage(change)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    marginVertical: 4,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  left: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: spacing.sm },
  icon: { width: 44, height: 44, borderRadius: 22, marginRight: spacing.md },
  iconFallback: {
    backgroundColor: colors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconLetter: { ...typography.h4, color: colors.text.primary },
  info: { flex: 1 },
  name: { ...typography.h4, color: colors.text.primary, marginBottom: 3 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rankBadge: {
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  rankText: { ...typography.small, color: colors.text.secondary },
  symbol: { ...typography.caption, color: colors.text.secondary },
  right: { alignItems: 'flex-end', gap: 6 },
  price: { ...typography.h4, color: colors.text.primary },
  changePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
    gap: 3,
  },
  changeText: { ...typography.caption, fontWeight: '700' },
});
