
export type ArbitrageMode = 'CEX' | 'DEX';

export const CEX_EXCHANGES = [
  'Binance', 
  'Gate.io', 
  'Bybit', 
  'MEXC', 
  'KuCoin', 
  'OKX',
  'Huobi',
  'Bitget'
];

export const DEX_EXCHANGES = [
  'Uniswap V3', 
  'Curve', 
  'PancakeSwap', 
  'Balancer', 
  'SushiSwap', 
  '1inch', 
  'Raydium', 
  'Jupiter'
];

export type Exchange = string;

export interface TokenPrice {
  symbol: string;
  price: number;
  exchange: Exchange;
  liquidity: number;
  lastUpdated: string;
  volatility24h?: number;
}

export interface RawMarketData {
  token: string;
  prices: TokenPrice[];
}

export interface AIAnalysisResult {
  confidenceScore: number; // 0-100
  estimatedGasFees: number;
  netProfitPotential: number;
  reasoning: string;
  executionStrategy: string; // e.g., "Flash Loan via Aave"
  riskLevel: 'Low' | 'Medium' | 'High';
  actionRecommendation: 'SNIPE' | 'HOLD' | 'IGNORE';
  processingTimeMs: number;
}

export interface ArbitrageOpportunity {
  id: string;
  tokenSymbol: string;
  buyAt: Exchange;
  sellAt: Exchange;
  buyPrice: number;
  sellPrice: number;
  amount: number; // Simulated trade size
  spreadPercentage: number;
  grossProfit: number;
  aiAnalysis: AIAnalysisResult;
  mode: ArbitrageMode;
}

export interface DashboardMetrics {
  totalScanned: number;
  opportunitiesFound: number;
  potentialProfit: number;
  activeGasPrice: number; // in Gwei
  networkStatus: 'Optimal' | 'Congested' | 'Volatile';
  scannedExchanges: number;
}

export interface ExecutionLog {
  step: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  details?: string;
  timestamp: string;
}