export const formatPrice = (price) => {
  if (price === null || price === undefined) return '$0.00';
  if (price >= 1000) {
    return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  if (price >= 1) return `$${price.toFixed(4)}`;
  if (price >= 0.01) return `$${price.toFixed(6)}`;
  return `$${price.toFixed(8)}`;
};

export const formatMarketCap = (value) => {
  if (!value) return 'N/A';
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  return `$${value.toFixed(2)}`;
};

export const formatPercentage = (pct) => {
  if (pct === null || pct === undefined) return '0.00%';
  const sign = pct >= 0 ? '+' : '';
  return `${sign}${pct.toFixed(2)}%`;
};

export const formatVolume = formatMarketCap;

export const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const formatNumber = (num) => {
  if (!num) return '0';
  return num.toLocaleString('en-US');
};

export const formatCurrency = (value, decimals = 2) => {
  if (!value && value !== 0) return '$0.00';
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
};
