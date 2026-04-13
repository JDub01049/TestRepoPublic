import Anthropic from '@anthropic-ai/sdk';

const SYSTEM_PROMPT = `You are an expert cryptocurrency analyst and AI assistant specializing in Bitcoin and altcoin market analysis. You provide:

1. Technical analysis based on price data and market trends
2. Sentiment analysis and price predictions
3. Risk assessments and investment insights
4. Portfolio recommendations

Your analysis is data-driven, clear, and balanced — presenting both bullish and bearish perspectives. Always remind users that crypto markets are highly volatile and your analysis is not financial advice.`;

const getClient = (apiKey) => new Anthropic({
  apiKey,
  dangerouslyAllowBrowser: true,
});

export const getAIInsights = async (coinData, historicalPrices, apiKey) => {
  if (!apiKey) throw new Error('Claude API key not configured. Add it in Settings.');

  const client = getClient(apiKey);

  const recentPrices = (historicalPrices || []).slice(-14).map(([ts, price]) => ({
    date: new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    price: Number(price).toFixed(2),
  }));

  const prompt = `Analyze ${coinData.name} (${(coinData.symbol || '').toUpperCase()}):

Current Price: $${coinData.current_price}
24h Change: ${(coinData.price_change_percentage_24h || 0).toFixed(2)}%
7d Change: ${(coinData.price_change_percentage_7d_in_currency || 0).toFixed(2)}%
Market Cap: $${(coinData.market_cap || 0).toLocaleString()}
24h Volume: $${(coinData.total_volume || 0).toLocaleString()}
All-Time High: $${coinData.ath || 'N/A'}
All-Time Low: $${coinData.atl || 'N/A'}
Recent Price History (last 14 days):
${recentPrices.map(p => `  ${p.date}: $${p.price}`).join('\n')}

Provide a concise analysis with these sections:
**Market Sentiment:** (Bullish/Bearish/Neutral + 1-2 sentence explanation)
**7-Day Price Outlook:** (Price range prediction + key levels)
**Key Factors:** (2-3 bullet points of key drivers)
**Risk Level:** (High/Medium/Low + brief reasoning)
**Trader Insight:** (One actionable insight for traders)`;

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 800,
    system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
    messages: [{ role: 'user', content: prompt }],
  });

  return response.content[0].text;
};

export const chatWithAI = async (messages, apiKey) => {
  if (!apiKey) throw new Error('Claude API key not configured. Add it in Settings.');

  const client = getClient(apiKey);

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
    messages,
  });

  return response.content[0].text;
};

export const getPortfolioAnalysis = async (portfolioSummary, totalValue, apiKey) => {
  if (!apiKey) throw new Error('Claude API key not configured. Add it in Settings.');

  const client = getClient(apiKey);

  const prompt = `Analyze this crypto portfolio (Total Value: $${totalValue.toFixed(2)}):

${portfolioSummary.map(h => `• ${h.name} (${h.symbol}): ${h.amount} units @ $${h.price} = $${h.value} (${h.change24h}% 24h)`).join('\n')}

Provide:
**Portfolio Health:** Diversification and balance assessment
**Risk Level:** Overall portfolio risk
**Performance Drivers:** Top assets affecting returns
**Rebalancing Tip:** One specific recommendation
**Outlook:** Brief market outlook for this portfolio

Be concise and actionable.`;

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 800,
    system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
    messages: [{ role: 'user', content: prompt }],
  });

  return response.content[0].text;
};
