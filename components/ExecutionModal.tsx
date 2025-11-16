import React, { useEffect, useState } from 'react';
import { ExecutionLog, ArbitrageOpportunity } from '../types';
import { CheckCircle, Loader2, XCircle, Terminal } from 'lucide-react';

interface Props {
  opportunity: ArbitrageOpportunity;
  onClose: () => void;
}

export const ExecutionModal: React.FC<Props> = ({ opportunity, onClose }) => {
  const [logs, setLogs] = useState<ExecutionLog[]>([]);
  const [completed, setCompleted] = useState(false);

  // Simulation Steps
  useEffect(() => {
    const steps = [
      { msg: "Initializing Flash Loan Contract...", delay: 800 },
      { msg: `Borrowing ${opportunity.amount.toFixed(2)} ${opportunity.tokenSymbol} from Aave V3 Pool...`, delay: 1800 },
      { msg: `Executing Buy Order on ${opportunity.buyAt} @ $${opportunity.buyPrice.toFixed(2)}...`, delay: 2800 },
      { msg: "Bridging Assets via LayerZero...", delay: 4500 },
      { msg: `Executing Sell Order on ${opportunity.sellAt} @ $${opportunity.sellPrice.toFixed(2)}...`, delay: 5800 },
      { msg: "Repaying Flash Loan + 0.09% Fee...", delay: 6500 },
      { msg: "Verifying Transaction Finality...", delay: 7200 },
      { msg: `PROFIT SECURED: $${opportunity.aiAnalysis.netProfitPotential.toFixed(2)}`, delay: 8000 }
    ];

    let timeouts: ReturnType<typeof setTimeout>[] = [];

    steps.forEach((step, index) => {
      const timeout = setTimeout(() => {
        setLogs(prev => [...prev, {
          step: step.msg,
          status: index === steps.length - 1 ? 'completed' : 'processing',
          timestamp: new Date().toLocaleTimeString(),
        }]);
        
        if (index === steps.length - 1) {
          setCompleted(true);
        }
      }, step.delay);
      timeouts.push(timeout);
    });

    return () => timeouts.forEach(clearTimeout);
  }, [opportunity]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-emerald-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        
        {/* Header */}
        <div className="bg-slate-950 p-4 border-b border-white/10 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="animate-pulse w-2 h-2 bg-emerald-500 rounded-full"></div>
            <h2 className="font-mono font-bold text-white">EXECUTION TERMINAL</h2>
          </div>
          <button onClick={onClose} disabled={!completed} className={`text-xs font-bold px-3 py-1 rounded transition-colors ${completed ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-slate-800/50 text-slate-500 cursor-not-allowed'}`}>
            CLOSE
          </button>
        </div>

        {/* Terminal Window */}
        <div className="flex-grow p-6 font-mono text-sm overflow-y-auto space-y-3 bg-slate-950/50 min-h-[300px]">
          {logs.map((log, i) => (
            <div key={i} className="flex gap-3 items-start animate-in fade-in slide-in-from-bottom-2 duration-300">
              <span className="text-slate-600 text-xs mt-0.5">{log.timestamp}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                   {i === logs.length - 1 && !completed ? (
                     <Loader2 size={14} className="animate-spin text-emerald-500" />
                   ) : (
                     <CheckCircle size={14} className="text-emerald-500" />
                   )}
                   <span className={i === logs.length - 1 ? "text-emerald-400 font-bold" : "text-slate-300"}>
                     {log.step}
                   </span>
                </div>
              </div>
            </div>
          ))}
          
          {logs.length === 0 && (
            <div className="text-slate-500 flex items-center gap-2">
              <Loader2 size={14} className="animate-spin" />
              <span>Establishing connection to blockchain node...</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-900 border-t border-white/5">
          <div className="flex justify-between items-center text-xs text-slate-500 mb-2">
            <span>TARGET: {opportunity.tokenSymbol}</span>
            <span>ROUTE: {opportunity.buyAt} -&gt; {opportunity.sellAt}</span>
          </div>
          <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
             <div 
               className="bg-emerald-500 h-full transition-all duration-500 ease-out"
               style={{ width: `${(logs.length / 8) * 100}%` }}
             ></div>
          </div>
        </div>
      </div>
    </div>
  );
};