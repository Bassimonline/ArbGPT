
import React from 'react';
import { DashboardMetrics as MetricsType } from '../types';
import { Activity, DollarSign, Search, Gauge } from 'lucide-react';

interface Props {
  metrics: MetricsType;
}

const MetricCard: React.FC<{ 
  title: string; 
  value: string | number; 
  subValue?: string;
  icon: React.ReactNode; 
  colorClass: string;
}> = ({ title, value, subValue, icon, colorClass }) => (
  <div className="glass-panel p-5 rounded-xl border-t border-white/5 hover:border-emerald-500/30 transition-all duration-300 relative overflow-hidden group bg-slate-900/50">
    <div className={`absolute top-0 right-0 p-24 opacity-5 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110 ${colorClass.replace('text-', 'bg-')}`}></div>
    
    <div className="flex justify-between items-start relative z-10">
      <div>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">{title}</p>
        <h3 className="text-2xl lg:text-3xl font-bold text-white font-mono tracking-tight">{value}</h3>
        {subValue && <p className="text-xs text-emerald-400 mt-1 font-medium">{subValue}</p>}
      </div>
      <div className={`p-3 rounded-lg bg-white/5 backdrop-blur-md border border-white/5 ${colorClass}`}>
        {icon}
      </div>
    </div>
  </div>
);

export const DashboardMetrics: React.FC<Props> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <MetricCard 
        title="Markets Scanned" 
        value={metrics.totalScanned}
        subValue="Global Liquidity Pools" 
        icon={<Search size={20} />}
        colorClass="text-blue-400"
      />
      <MetricCard 
        title="Active Opps" 
        value={metrics.opportunitiesFound} 
        subValue="Ready to Snipe"
        icon={<Activity size={20} />}
        colorClass="text-emerald-400"
      />
      <MetricCard 
        title="Potential Profit" 
        value={`$${metrics.potentialProfit.toFixed(2)}`} 
        subValue="+12.5% vs Last Hour"
        icon={<DollarSign size={20} />}
        colorClass="text-yellow-400"
      />
      <MetricCard 
        title="Network Gas" 
        value={`${metrics.activeGasPrice} Gwei`}
        subValue={metrics.networkStatus}
        icon={<Gauge size={20} />}
        colorClass={metrics.networkStatus === 'Optimal' ? "text-green-400" : "text-red-400"}
      />
    </div>
  );
};
