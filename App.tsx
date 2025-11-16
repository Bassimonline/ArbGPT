
import React, { useState, useCallback, useEffect } from 'react';
import { fetchMarketData } from './services/marketDataService';
import { analyzeArbitrageOpportunities } from './services/geminiService';
import { ArbitrageOpportunity, DashboardMetrics, ArbitrageMode } from './types';
import { DashboardMetrics as DashboardMetricsComponent } from './components/DashboardMetrics';
import { OpportunityCard } from './components/OpportunityCard';
import { ExecutionModal } from './components/ExecutionModal';
import { SettingsModal } from './components/SettingsModal';
import { RefreshCw, Brain, Wifi, WifiOff, AlertTriangle, Wallet, Settings, Building2, Network, Zap, Globe, Server } from 'lucide-react';

const App: React.FC = () => {
  const [opportunities, setOpportunities] = useState<ArbitrageOpportunity[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [activeOpportunity, setActiveOpportunity] = useState<ArbitrageOpportunity | null>(null);
  const [scanStep, setScanStep] = useState<string>("");
  const [isLive, setIsLive] = useState(false);
  const [corsError, setCorsError] = useState(false);
  
  // Core State
  const [mode, setMode] = useState<ArbitrageMode>('CEX');
  const [cmcApiKey, setCmcApiKey] = useState<string>('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalScanned: 0,
    opportunitiesFound: 0,
    potentialProfit: 0,
    activeGasPrice: 0, 
    networkStatus: 'Optimal',
    scannedExchanges: 0
  });

  // Load API Key on Mount
  useEffect(() => {
    const storedKey = localStorage.getItem('cmc_api_key');
    if (storedKey) setCmcApiKey(storedKey);
  }, []);

  // Reset opportunities when switching modes
  useEffect(() => {
    setOpportunities([]);
    setMetrics(prev => ({ ...prev, opportunitiesFound: 0, potentialProfit: 0 }));
    setCorsError(false);
  }, [mode]);

  const handleSaveKey = (key: string) => {
    setCmcApiKey(key);
    localStorage.setItem('cmc_api_key', key);
    setCorsError(false); // Reset error on new key
  };

  const handleScan = useCallback(async () => {
    if (isScanning) return;
    setIsScanning(true);
    setCorsError(false);
    setScanStep("INITIALIZING_NODES");
    
    try {
      // Real data pipeline
      setScanStep(cmcApiKey ? "CONNECTING_CMC_PRO_API" : "SIMULATING_FEED");
      
      // 1. Fetch Market Data
      const { data: rawData, isLive: liveStatus, error } = await fetchMarketData(mode, cmcApiKey);
      setIsLive(liveStatus);
      
      if (error === "CORS_ERROR") {
        setCorsError(true);
        // We still continue with fallback data (returned by service) but warn user
      }

      setScanStep("ANALYZING_SPREADS");
      
      // Update basic metrics immediately from raw data
      const scannedCount = rawData.length * rawData.reduce((acc, item) => acc + item.prices.length, 0) / Math.max(1, rawData.length);
      
      setMetrics(prev => ({ 
        ...prev, 
        totalScanned: Math.floor(scannedCount) + (mode === 'CEX' ? 450 : 200), 
        activeGasPrice: mode === 'DEX' ? Math.floor(Math.random() * 5) + 12 : 0,
        scannedExchanges: mode === 'CEX' ? 8 : 12
      })); 

      // 2. AI Analysis
      setScanStep("GEMINI_PROCESSING");
      const results = await analyzeArbitrageOpportunities(rawData, mode);
      
      setOpportunities(results);
      
      // 3. Update Metrics
      const totalProfit = results.reduce((acc, curr) => acc + Math.max(0, curr.aiAnalysis.netProfitPotential), 0);
      setMetrics(prev => ({
        ...prev,
        opportunitiesFound: results.length,
        potentialProfit: totalProfit,
        networkStatus: results.length > 5 ? 'Volatile' : 'Optimal'
      }));
      
      setLastUpdated(new Date().toLocaleTimeString());
      setScanStep("COMPLETE");

    } catch (error) {
      console.error("Scan failed", error);
    } finally {
      setIsScanning(false);
    }
  }, [isScanning, cmcApiKey, mode]);

  const isCEX = mode === 'CEX';

  return (
    <div className="min-h-screen bg-black text-slate-200 selection:bg-emerald-500/30 font-sans pb-12">
      {/* Modals */}
      {activeOpportunity && (
        <ExecutionModal 
          opportunity={activeOpportunity} 
          onClose={() => setActiveOpportunity(null)} 
        />
      )}
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSaveKey}
        currentKey={cmcApiKey}
      />

      {/* Navbar */}
      <nav className="sticky top-0 z-40 border-b border-white/5 bg-black/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                <Brain className="text-black" size={20} />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">Arb<span className="text-emerald-400">GPT</span> <span className="text-[10px] align-top text-slate-500 font-mono ml-1 opacity-60">PRO</span></span>
            </div>
            
            {/* Mode Switcher - Desktop */}
            <div className="hidden md:flex items-center gap-2 p-1 bg-slate-900 rounded-xl border border-white/10">
              <button 
                onClick={() => setMode('CEX')}
                className={`px-6 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${isCEX ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
              >
                <Building2 size={14} />
                CEX ARBITRAGE
              </button>
              <button 
                onClick={() => setMode('DEX')}
                className={`px-6 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${!isCEX ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
              >
                <Network size={14} />
                DEX ARBITRAGE
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border ${isLive ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400' : 'border-yellow-500/20 bg-yellow-500/10 text-yellow-400'}`}>
                {isLive ? <Wifi size={14} /> : <WifiOff size={14} />}
                <span className="text-[10px] font-bold tracking-wider">{isLive ? 'LIVE FEED' : 'SIMULATION'}</span>
              </div>

              <button 
                onClick={() => setIsSettingsOpen(true)}
                className={`p-2 rounded-lg transition-colors ${cmcApiKey ? 'text-emerald-400 bg-emerald-400/10' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                title="API Configuration"
              >
                <Settings size={20} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* CORS Error Toast */}
        {corsError && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3 animate-in slide-in-from-top-2">
            <AlertTriangle className="text-red-500 flex-shrink-0" size={20} />
            <div>
              <h3 className="text-sm font-bold text-red-400">CORS Restriction Detected</h3>
              <p className="text-xs text-slate-400 mt-1">
                Browser blocked the call to CoinMarketCap. To see <strong>Real Data</strong>, you must use a CORS Unblocker extension or run this app in a backend environment. Falling back to simulation.
              </p>
            </div>
          </div>
        )}

        {/* Mobile Mode Switcher */}
        <div className="md:hidden mb-6 p-1 bg-slate-900 rounded-lg border border-white/10 flex">
          <button 
            onClick={() => setMode('CEX')}
            className={`flex-1 py-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${isCEX ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
          >
            <Building2 size={14} /> CEX
          </button>
          <button 
            onClick={() => setMode('DEX')}
            className={`flex-1 py-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${!isCEX ? 'bg-purple-600 text-white' : 'text-slate-400'}`}
          >
            <Network size={14} /> DEX
          </button>
        </div>

        {/* Hero / Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-6">
          <div>
            <div className="inline-flex items-center gap-3 px-3 py-1.5 rounded-full bg-slate-900 border border-white/10 text-[10px] font-mono text-slate-400 mb-4">
              <div className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${isCEX ? 'bg-blue-500 animate-pulse' : 'bg-purple-500 animate-pulse'}`}></span>
                <span className="font-bold text-white">{isCEX ? 'CEX MODE' : 'DEX MODE'}</span>
              </div>
              <span className="text-slate-700">|</span>
              <span>TARGETS: {isCEX ? 'BINANCE, BYBIT, GATE.IO, MEXC' : 'UNISWAP, CURVE, PANCAKESWAP'}</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight mb-3">
              {isCEX ? 'Centralized' : 'Decentralized'} <span className={`neon-text ${isCEX ? 'text-blue-500' : 'text-purple-500'}`}>Sniper</span>
            </h1>
            <p className="text-slate-400 max-w-xl leading-relaxed text-sm md:text-base">
              Advanced arbitrage engine using <span className={isLive ? "text-emerald-400 font-bold" : "text-slate-400"}>{isLive ? "LIVE CMC PRO DATA" : "Simulated Feeds"}</span> to detect millisecond price dislocations.
            </p>
          </div>
          
          <div className="flex flex-col items-end gap-2 w-full md:w-auto">
            {lastUpdated && (
               <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                 <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-500' : 'bg-yellow-500'}`}></div>
                 Last Update: {lastUpdated}
               </div>
            )}
            <button 
              onClick={handleScan}
              disabled={isScanning}
              className={`w-full md:w-auto flex items-center justify-center gap-3 px-10 py-4 rounded-xl font-bold text-white shadow-lg transition-all relative overflow-hidden group ${
                isScanning 
                  ? 'bg-slate-900 cursor-wait border border-slate-800' 
                  : isCEX 
                    ? 'bg-blue-600 hover:bg-blue-500 hover:shadow-blue-500/25 border border-blue-500/50' 
                    : 'bg-purple-600 hover:bg-purple-500 hover:shadow-purple-500/25 border border-purple-500/50'
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <RefreshCw size={20} className={isScanning ? "animate-spin" : ""} />
              {isScanning ? (
                <span className="font-mono uppercase tracking-widest text-xs">{scanStep}</span>
              ) : (
                "INITIATE SCAN"
              )}
            </button>
          </div>
        </div>

        {/* Metrics Dashboard */}
        <DashboardMetricsComponent metrics={metrics} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Opportunities List (Takes up 2/3) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Zap className={isCEX ? "text-blue-500" : "text-purple-500"} size={20} />
                Live Opportunities
              </h2>
              {opportunities.length > 0 && (
                <span className={`px-3 py-1 text-[10px] font-bold rounded-full border uppercase tracking-wider ${
                  isCEX 
                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
                    : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                }`}>
                  {opportunities.length} Signals Active
                </span>
              )}
            </div>

            {opportunities.length === 0 && !isScanning ? (
              <div className="glass-panel p-16 rounded-xl text-center border-dashed border border-slate-800 bg-slate-900/20">
                <div className="w-20 h-20 bg-slate-900/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/5">
                   <Globe className="text-slate-700" size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-300 mb-2">Scanner Ready</h3>
                <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
                  Awaiting command to query {isCEX ? 'Centralized Exchange APIs' : 'Decentralized Liquidity Pools'}. 
                  <br />Select a mode and start the engine.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {opportunities.map(opp => (
                  <OpportunityCard 
                    key={opp.id} 
                    data={opp} 
                    onSnipe={() => setActiveOpportunity(opp)}
                  />
                ))}
              </div>
            )}
            
            {isScanning && opportunities.length === 0 && (
               <div className="grid grid-cols-1 gap-4">
                 {[1,2,3].map(i => (
                   <div key={i} className="h-48 bg-slate-900/50 rounded-xl border border-white/5 animate-pulse relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
                   </div>
                 ))}
               </div>
            )}
          </div>

          {/* Sidebar / Logic Panel */}
          <div className="space-y-6">
            <div className={`glass-panel p-6 rounded-xl border bg-slate-900/40 ${isCEX ? 'border-blue-900/20' : 'border-purple-900/20'}`}>
              <h3 className="font-bold text-white mb-5 flex items-center gap-2 text-sm uppercase tracking-wider">
                <Server size={16} className={isCEX ? "text-blue-500" : "text-purple-500"} />
                Processing Logic
              </h3>
              <div className="space-y-6 relative">
                 <div className={`absolute left-[11px] top-2 bottom-2 w-px ${isCEX ? 'bg-blue-500/20' : 'bg-purple-500/20'}`}></div>
                 
                 <div className="flex gap-4 relative z-10">
                   <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold mt-0.5 border bg-black ${isCEX ? 'border-blue-500 text-blue-400' : 'border-purple-500 text-purple-400'}`}>01</div>
                   <div>
                     <h4 className="text-xs font-bold text-slate-300 uppercase">Fetch</h4>
                     <p className="text-xs text-slate-500 leading-relaxed mt-1">
                       {isCEX 
                         ? "Aggregating Order Books: Binance, Gate.io, Bybit, MEXC." 
                         : "Querying AMM Pools: Uniswap, Curve, PancakeSwap."}
                     </p>
                   </div>
                 </div>
                 
                 <div className="flex gap-4 relative z-10">
                   <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold mt-0.5 border bg-black ${isCEX ? 'border-blue-500 text-blue-400' : 'border-purple-500 text-purple-400'}`}>02</div>
                   <div>
                     <h4 className="text-xs font-bold text-slate-300 uppercase">Compute</h4>
                     <p className="text-xs text-slate-500 leading-relaxed mt-1">
                       {isCEX 
                         ? "Calculating withdrawal fees vs. spread delta." 
                         : "Estimating gas (L1/L2) and slippage impact."}
                     </p>
                   </div>
                 </div>
                 
                 <div className="flex gap-4 relative z-10">
                   <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold mt-0.5 border bg-black ${isCEX ? 'border-blue-500 text-blue-400' : 'border-purple-500 text-purple-400'}`}>03</div>
                   <div>
                     <h4 className="text-xs font-bold text-slate-300 uppercase">Execute</h4>
                     <p className="text-xs text-slate-500 leading-relaxed mt-1">
                       AI ranks opportunities by Net Profit & Confidence Score.
                     </p>
                   </div>
                 </div>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-xl border border-white/5 bg-gradient-to-b from-slate-900 to-black">
               <h3 className="font-bold text-white mb-2 text-xs uppercase tracking-wider text-slate-400">Estimated Holdings</h3>
               <div className="flex items-baseline gap-1 mb-4">
                 <span className="text-3xl font-mono font-bold text-white">$0.00</span>
                 <span className="text-xs text-slate-600">USDT</span>
               </div>
               <button className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 border border-white/10">
                 <Wallet size={14} />
                 CONNECT WALLET
               </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;
