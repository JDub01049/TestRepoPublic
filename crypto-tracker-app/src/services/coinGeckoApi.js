import axios from 'axios';

const BASE_URL = 'https://api.coingecko.com/api/v3';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Accept': 'application/json' },
});

export const fetchTopCoins = async (currency = 'usd', count = 100) => {
  const response = await api.get('/coins/markets', {
    params: {
      vs_currency: currency,
      order: 'market_cap_desc',
      per_page: count,
      page: 1,
      sparkline: true,
      price_change_percentage: '1h,24h,7d',
    },
  });
  return response.data;
};

export const fetchCoinDetails = async (coinId) => {
  const response = await api.get(`/coins/${coinId}`, {
    params: {
      localization: false,
      tickers: false,
      market_data: true,
      community_data: false,
      developer_data: false,
      sparkline: true,
    },
  });
  return response.data;
};

export const fetchHistoricalData = async (coinId, days = 7, currency = 'usd') => {
  const response = await api.get(`/coins/${coinId}/market_chart`, {
    params: {
      vs_currency: currency,
      days,
      interval: days <= 1 ? 'hourly' : 'daily',
    },
  });
  return response.data;
};

export const searchCoins = async (query) => {
  const response = await api.get('/search', { params: { query } });
  return response.data.coins;
};

export const fetchGlobalData = async () => {
  const response = await api.get('/global');
  return response.data.data;
};

export const fetchMultiplePrices = async (coinIds, currency = 'usd') => {
  const ids = Array.isArray(coinIds) ? coinIds.join(',') : coinIds;
  const response = await api.get('/simple/price', {
    params: {
      ids,
      vs_currencies: currency,
      include_24hr_change: true,
      include_market_cap: true,
      include_24hr_vol: true,
    },
  });
  return response.data;
};

export const fetchTrendingCoins = async () => {
  const response = await api.get('/search/trending');
  return response.data.coins.map(c => c.item);
};
