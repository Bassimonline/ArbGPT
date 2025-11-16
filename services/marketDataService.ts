
import { Exchange, RawMarketData, TokenPrice, ArbitrageMode, CEX_EXCHANGES, DEX_EXCHANGES } from '../types';

// CoinMarketCap IDs for high-volume tokens to reduce API lookup overhead
const CMC_IDS: Record<string, string> = {
  'BTC': '1',
  'ETH': '1027',
  'SOL': '5426',
  'BNB': '1839',
  'XRP': '52',
  'ADA': '2010',
  'AVAX': '5805',
  'DOGE': '74',
  'LINK': '1975',
  'UNI': '7083',
  'MATIC': '3890',
  'SHIB': '5994',
  'LTC': '2',
  'ARB': '11841',
  'PEPE': '24478'
};

// Fallback base prices only used if API fails completely
const FALLBACK_BASE_PRICES: Record<string, number> = {
  'BTC': 64200, 'ETH': 3450, 'SOL': 145, 'AVAX': 35, 'MATIC': 0.65,
  'LINK': 14.20, 'UNI': 7.50, 'ARB': 1.12, 'PEPE': 0.0000075
};

// Helper to generate exchange spreads if API fails (Fallback mode)
const generateFallbackPrices = (token: string, basePrice: number, mode: ArbitrageMode): TokenPrice[] => {
  const targetExchanges = mode === 'CEX' ? CEX_EXCHANGES : DEX_EXCHANGES;
  
  return targetExchanges.map(exchange => {
    const isDex = mode === 'DEX';
    const baseVolatility = isDex ? 0.045 : 0.012; 
    const specificMultiplier = (Math.random() * 0.004) + 0.998; // Tight spread
    const marketShock = Math.random() > 0.92 ? (Math.random() > 0.5 ? 1.03 : 0.97) : 1;

    return {
      symbol: token,
      price: basePrice * marketShock * specificMultiplier,
      exchange: exchange,
      liquidity: Math.floor(Math.random() * 5000000) + 10000,
      lastUpdated: new Date().toISOString(),
      volatility24h: (Math.random() * 5) + 2
    };
  });
};

export const fetchMarketData = async (mode: ArbitrageMode, apiKey?: string): Promise<{ data: RawMarketData[], isLive: boolean, error?: string }> => {
  
  // 1. REAL DATA FETCHING
  if (apiKey) {
    try {
      console.log(`Fetching live ${mode} data from CMC...`);
      
      // We need market pairs to see the price difference between exchanges.
      // Endpoint: /v2/cryptocurrency/market-pairs/latest
      // We will fetch for top 5 tokens to avoid hitting rate limits (Credit cost is high for market-pairs)
      const targetTokens = ['BTC', 'ETH', 'SOL', 'ARB', 'PEPE']; 
      const marketDataPromises = targetTokens.map(async (symbol) => {
        const id = CMC_IDS[symbol];
        if (!id) return null;

        const url = `https://pro-api.coinmarketcap.com/v2/cryptocurrency/market-pairs/latest?id=${id}&start=1&limit=50&convert=USD`;
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'X-CMC_PRO_API_KEY': apiKey,
            'Accept': 'application/json'
          }
        });

        if (!response.ok) {
           throw new Error(`CMC API Error: ${response.statusText}`);
        }

        const json = await response.json();
        const pairs = json.data[id]; // CMC v2 structure

        // Filter and Transform
        const validExchanges = mode === 'CEX' ? CEX_EXCHANGES : DEX_EXCHANGES;
        
        const prices: TokenPrice[] = pairs
          .filter((p: any) => {
             // Fuzzy match exchange name
             const exName = p.exchange.name;
             return validExchanges.some(valid => exName.toLowerCase().includes(valid.toLowerCase()));
          })
          .map((p: any) => ({
            symbol: symbol,
            price: p.quote.USD.price,
            exchange: p.exchange.name,
            liquidity: p.quote.USD.depth_negative_two ? p.quote.USD.depth_negative_two : 1000000, // Use 2% depth if available
            lastUpdated: p.quote.USD.last_updated,
            volatility24h: 0 // Not provided in this endpoint
          }));

        if (prices.length < 2) return null; // Need at least 2 points for arbitrage

        return {
          token: symbol,
          prices: prices
        };
      });

      const results = await Promise.all(marketDataPromises);
      const validResults = results.filter((r): r is RawMarketData => r !== null);

      if (validResults.length > 0) {
        return { data: validResults, isLive: true };
      } else {
        console.warn("Live data fetched but no matching exchanges found for current mode.");
        // Fallthrough to simulation if we got data but filtered everything out (rare)
      }

    } catch (error: any) {
      console.error("CMC API Failed:", error);
      // Return specific error to UI if it's likely CORS
      const isCors = error.name === 'TypeError' && error.message === 'Failed to fetch';
      if (isCors) {
         return { 
           data: generateFallbackData(mode), 
           isLive: false, 
           error: "CORS_ERROR" 
         };
      }
    }
  }

  // 2. FALLBACK SIMULATION (If no key or error)
  return { data: generateFallbackData(mode), isLive: false };
};

const generateFallbackData = (mode: ArbitrageMode): RawMarketData[] => {
  const tokens = Object.keys(FALLBACK_BASE_PRICES);
  return tokens.map(token => ({
    token,
    prices: generateFallbackPrices(token, FALLBACK_BASE_PRICES[token], mode)
  }));
};
