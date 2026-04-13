# CryptoTracker AI

A mobile AI-powered cryptocurrency tracker and prediction app built with Expo (React Native). Track Bitcoin and any other cryptocurrency with real-time prices, interactive charts, and Claude AI-powered market analysis.

## Features

- **Live Market Data** — Real-time prices for 100+ cryptocurrencies via CoinGecko API
- **Add Any Crypto** — Search and add any coin to your personal watchlist
- **Interactive Price Charts** — 1D / 7D / 30D / 90D / 1Y historical price charts
- **AI-Powered Analysis** — Market sentiment, price predictions, and insights via Claude AI
- **Portfolio Tracker** — Track your holdings with cost basis and P&L calculations
- **AI Chat Assistant** — Ask any crypto question and get intelligent answers
- **Market Overview** — BTC/ETH dominance, market cap, 24h volume stats
- **Dark Theme** — Sleek dark UI designed for crypto trading

## Screens

| Screen | Description |
|--------|-------------|
| **Markets** | Watchlist + Top 50 coins with live prices |
| **Coin Detail** | Price chart, market stats, AI analysis, portfolio entry |
| **Search** | Search 10,000+ coins to add to watchlist |
| **Portfolio** | Holdings tracker with P&L and AI portfolio analysis |
| **AI Chat** | Conversational AI assistant for crypto questions |
| **Settings** | Claude API key configuration |

## Setup

### Prerequisites
- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- Expo Go app on your mobile device (or iOS/Android simulator)

### Installation

```bash
cd crypto-tracker-app
npm install
npx expo start
```

Scan the QR code with Expo Go (Android) or the Camera app (iOS).

### Claude API Key (for AI features)

1. Go to [console.anthropic.com](https://console.anthropic.com/account/keys)
2. Create a new API key
3. Open the app → Settings tab → paste your key and tap **Save Key**

The API key is stored locally on your device only.

## Tech Stack

| Technology | Purpose |
|------------|---------|
| Expo / React Native | Mobile app framework |
| React Navigation | Screen navigation (bottom tabs + stack) |
| CoinGecko API | Free crypto price data |
| @anthropic-ai/sdk | Claude AI integration |
| react-native-chart-kit | Price charts |
| AsyncStorage | Local data persistence |
| expo-linear-gradient | Gradient UI elements |

## AI Features

The app uses **Claude Haiku** (fast, cost-effective) for all AI features:

- **Coin Analysis** — Market sentiment, 7-day outlook, key factors, risk level
- **Portfolio Analysis** — Diversification assessment, rebalancing suggestions
- **AI Chat** — Open-ended crypto Q&A with conversation history

All AI prompts use **prompt caching** for efficiency and lower API costs.

## Project Structure

```
crypto-tracker-app/
├── App.js                    # Navigation setup
├── src/
│   ├── context/
│   │   └── AppContext.js      # Global state (watchlist, portfolio, API key)
│   ├── services/
│   │   ├── coinGeckoApi.js   # CoinGecko API calls
│   │   └── claudeAI.js       # Claude AI integration
│   ├── screens/
│   │   ├── DashboardScreen.js
│   │   ├── CryptoDetailScreen.js
│   │   ├── SearchScreen.js
│   │   ├── PortfolioScreen.js
│   │   ├── AIAssistantScreen.js
│   │   └── SettingsScreen.js
│   ├── components/
│   │   ├── CryptoCard.js     # Coin list item
│   │   ├── PriceChart.js     # Line chart with period selector
│   │   └── AIInsight.js      # AI analysis display card
│   ├── theme/
│   │   └── index.js          # Colors, spacing, typography
│   └── utils/
│       └── formatters.js     # Price/percentage/date formatters
├── package.json
└── app.json
```

## Notes

- CoinGecko free API has rate limits (30 calls/min). Prices auto-refresh every 60 seconds.
- AI analysis requires a Claude API key (paid). Haiku is very affordable (~$0.001 per analysis).
- All data is stored locally on-device — no backend required.
