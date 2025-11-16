
import React from 'react';
import { ArbitrageOpportunity } from '../types';
import { ArrowRight, Zap, TrendingUp, Layers, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Props {
  data: ArbitrageOpportunity;
  onSnipe: (id: string) => void;
}

export const OpportunityCard: React.FC<Props> = ({ data, onSnipe }) => {
  const { tokenSymbol, buyAt, sellAt, buyPrice, sellPrice, spreadPercentage, aiAnalysis } = data;
  
  const isHighConfidence = aiAnalysis.confidenceScore > 85;
  
  return (
    <div className="glass-panel rounded-xl p-0 overflow-hidden transition-all hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] border border-slate-800 hover:border-emerald-500/50 group bg-slate-900/60 flex flex-col h-full">
      
      {/* Header */}
      <div className="p-5 pb-4 relative border-b border-white/5">
        {isHighConfidence && (
           <div className="absolute top-0 right-0 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-1 rounded-bl-lg border-l border-b border-emerald-500/30 flex items-center gap-1">
             <CheckCircle2 size={12} />
             AI VERIFIED
           </div>
        )}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center border border-white/10 font-bold text-white">
              {tokenSymbol}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white leading-none">{tokenSymbol} Arbitrage</h3>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-xs font-mono text-slate-400">Spread:</span>
                <span className="text-sm font-mono font-bold text-emerald-400">+{spreadPercentage.toFixed(2)}%</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-400 mb-0.5">Net Profit</div>
            <div className="text-xl font-bold text-emerald-400 font-mono">${aiAnalysis.netProfitPotential.toFixed(2)}</div>
          </div>
        </div>

        {/* Route Visual */}
        <div className="flex items-center justify-between bg-slate-950/50 rounded-lg p-3 border border-white/5">
          <div className="flex flex-col items-start">
             <span className="text-[10px] text-slate-500 uppercase font-bold mb-1">Buy From</span>
             <span className="text-xs font-bold text-blue-300">{buyAt}</span>
             <span className="text-xs font-mono text-slate-400">${buyPrice.toFixed(4)}</span>
          </div>
          <div className="flex flex-col items-center px-2">
            <ArrowRight size={16} className="text-slate-600" />
            <span className="text-[10px] text-slate-600 font-mono mt-1">BRIDGE</span>
          </div>
          <div className="flex flex-col items-end">
             <span className="text-[10px] text-slate-500 uppercase font-bold mb-1">Sell At</span>
             <span className="text-xs font-bold text-purple-300">{sellAt}</span>
             <span className="text-xs font-mono text-slate-400">${sellPrice.toFixed(4)}</span>
          </div>
        </div>
      </div>

      {/* AI Analysis Body */}
      <div className="p-5 pt-4 flex-grow">
        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <Layers size={14} className="text-slate-500 mt-1" />
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Execution Strategy</p>
              <p className="text-sm text-slate-300 leading-relaxed">{aiAnalysis.executionStrategy}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <TrendingUp size={14} className="text-slate-500 mt-1" />
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">AI Reasoning</p>
              <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">{aiAnalysis.reasoning}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="bg-slate-800/30 p-2 rounded border border-white/5">
               <p className="text-[10px] text-slate-500">Confidence</p>
               <div className="w-full bg-slate-700 h-1.5 rounded-full mt-1">
                 <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${aiAnalysis.confidenceScore}%` }}></div>
               </div>
            </div>
            <div className="bg-slate-800/30 p-2 rounded border border-white/5">
               <p className="text-[10px] text-slate-500">Est. Gas</p>
               <p className="text-xs font-mono text-slate-300">${aiAnalysis.estimatedGasFees.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-4 border-t border-white/5 bg-slate-950/30">
        <button 
          onClick={() => onSnipe(data.id)}
          className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 rounded-lg transition-all active:scale-95 hover:shadow-[0_0_15px_rgba(16,185,129,0.4)]"
        >
          <Zap size={18} fill="currentColor" />
          SNIPE OPPORTUNITY
        </button>
      </div>
    </div>
  );
};
