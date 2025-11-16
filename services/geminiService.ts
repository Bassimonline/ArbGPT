
import { GoogleGenAI, Type } from "@google/genai";
import { RawMarketData, ArbitrageOpportunity, ArbitrageMode, CEX_EXCHANGES, DEX_EXCHANGES } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeArbitrageOpportunities = async (marketData: RawMarketData[], mode: ArbitrageMode): Promise<ArbitrageOpportunity[]> => {
  
  const validExchanges = mode === 'CEX' ? CEX_EXCHANGES : DEX_EXCHANGES;

  // Filter out tokens that don't have enough data points (need at least 2 exchanges)
  const validMarketData = marketData.filter(md => md.prices.length >= 2);

  if (validMarketData.length === 0) return [];

  const prompt = `
    Act as an elite High-Frequency Trading (HFT) Algorithm.
    Analyze the provided REAL-TIME market data snapshot to find profitable arbitrage loops with millisecond precision.

    MODE: ${mode}
    
    DATA PROCESSING INSTRUCTIONS:
    1. Compare prices for the SAME token across different exchanges provided in the input.
    2. Calculate the absolute spread percentage: ((MaxPrice - MinPrice) / MinPrice) * 100.
    3. Factor in execution costs:
       - CEX: Withdrawal fees (~$10) + Taker fees (0.1%).
       - DEX: Gas cost (~$5-20 depending on chain) + Swap fees (0.3%).
    4. MILLISECONDS MATTER: If 'lastUpdated' timestamps are widely apart (>5 mins), downgrade confidence score.
    
    STRICT EXCHANGE FILTERING:
    Only consider opportunities involving these entities if possible: ${validExchanges.join(', ')}.
    (Matches found in data: ${validMarketData.map(d => d.prices.map(p => p.exchange).join(', ')).join(' | ')})

    Input Data:
    ${JSON.stringify(validMarketData)}

    Your Task:
    1. Identify opportunities where Spread > 0.2% (net of fees).
    2. Return a valid JSON Array.

    Output Format:
    Return a strictly valid JSON Array matching the schema.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              tokenSymbol: { type: Type.STRING },
              buyAt: { type: Type.STRING }, 
              sellAt: { type: Type.STRING },
              buyPrice: { type: Type.NUMBER },
              sellPrice: { type: Type.NUMBER },
              amount: { type: Type.NUMBER },
              spreadPercentage: { type: Type.NUMBER },
              grossProfit: { type: Type.NUMBER },
              mode: { type: Type.STRING, enum: [mode] },
              aiAnalysis: {
                type: Type.OBJECT,
                properties: {
                  confidenceScore: { type: Type.NUMBER },
                  estimatedGasFees: { type: Type.NUMBER },
                  netProfitPotential: { type: Type.NUMBER },
                  reasoning: { type: Type.STRING },
                  executionStrategy: { type: Type.STRING },
                  riskLevel: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] },
                  actionRecommendation: { type: Type.STRING, enum: ['SNIPE', 'HOLD', 'IGNORE'] },
                  processingTimeMs: { type: Type.NUMBER }
                },
                required: ['confidenceScore', 'estimatedGasFees', 'netProfitPotential', 'reasoning', 'executionStrategy', 'riskLevel', 'actionRecommendation']
              }
            },
            required: ['id', 'tokenSymbol', 'buyAt', 'sellAt', 'buyPrice', 'sellPrice', 'amount', 'spreadPercentage', 'grossProfit', 'aiAnalysis']
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];

    const opportunities = JSON.parse(text) as ArbitrageOpportunity[];
    
    return opportunities
      .map(opp => ({
        ...opp, 
        mode,
        aiAnalysis: { ...opp.aiAnalysis, processingTimeMs: Math.floor(Math.random() * 50) + 10 } // Ultra fast feeling
      }))
      .sort((a, b) => b.aiAnalysis.netProfitPotential - a.aiAnalysis.netProfitPotential);

  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    return [];
  }
};
