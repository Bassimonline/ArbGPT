import React, { useState, useEffect } from 'react';
import { X, Key, Save, AlertTriangle, ExternalLink } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (key: string) => void;
  currentKey: string;
}

export const SettingsModal: React.FC<Props> = ({ isOpen, onClose, onSave, currentKey }) => {
  const [apiKey, setApiKey] = useState(currentKey);
  
  useEffect(() => {
    setApiKey(currentKey);
  }, [currentKey]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(apiKey);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-5 border-b border-white/10 flex justify-between items-center bg-slate-950">
          <h2 className="font-bold text-white flex items-center gap-2">
            <Key size={18} className="text-emerald-400" />
            API Configuration
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">CoinMarketCap API Key</label>
            <input 
              type="text" 
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your CMC Pro API Key..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none font-mono text-sm"
            />
            <div className="flex justify-between text-xs mt-1">
              <p className="text-slate-500">Key is stored locally in your browser.</p>
              <a 
                href="https://coinmarketcap.com/api/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-emerald-500 hover:underline flex items-center gap-1"
              >
                Get Key <ExternalLink size={10} />
              </a>
            </div>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 flex gap-3 items-start">
            <AlertTriangle size={16} className="text-yellow-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-yellow-200/80 leading-relaxed">
              <strong>Note on CORS:</strong> CoinMarketCap's API may block direct browser requests. If the fetch fails, the app will automatically use high-fidelity simulation mode based on market averages.
            </p>
          </div>

          <div className="pt-2">
            <button 
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-emerald-900/20 active:scale-95 flex items-center justify-center gap-2"
            >
              <Save size={18} />
              Save Configuration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};