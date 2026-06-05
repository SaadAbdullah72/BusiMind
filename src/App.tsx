import { useState, useRef } from 'react';
import './index.css';

// Component imports
import RetailOverview from './components/RetailOverview';
import ExpiryDesk from './components/ExpiryDesk';
import PricingGuard from './components/PricingGuard';
import ProcurementCenter from './components/ProcurementCenter';
import RetailSandbox from './components/RetailSandbox';

// Default initial state
const defaultKPIs = {
  total_revenue: '0 PKR',
  total_transactions: 0,
  bestseller: 'N/A',
  waste_risk_cost: '0 PKR',
  low_stock_count: 0,
  average_basket_value: '0 PKR'
};

const defaultSWOT = {
  strengths: ['Waiting for scan data...'],
  weaknesses: ['Waiting for scan data...'],
  opportunities: ['Waiting for scan data...'],
  threats: ['Waiting for scan data...'],
  action_steps: ['Run the Operations Diagnostic Scan']
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'expiry' | 'pricing' | 'procurement' | 'sandbox'>('dashboard');
  const [kpis, setKpis] = useState(defaultKPIs);
  const [swot, setSwot] = useState(defaultSWOT);
  const [expiryData, setExpiryData] = useState<any>(null);
  const [pricingData, setPricingData] = useState<any>(null);
  const [procurementData, setProcurementData] = useState<any>(null);

  const [uploading, setUploading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState<any>(null);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: file.name, content: text })
        });
        const data = await res.json();
        if (data.status === 'success') {
          setUploadedFile(file.name);
        } else {
          alert('Upload failed: ' + data.message);
        }
      } catch (err) {
        alert('Error uploading file to API.');
      } finally {
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.onerror = () => {
      alert('Error reading file');
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const runDiagnosticScan = () => {
    setScanning(true);
    setProgress({ agent: 'Initializing', status: 'Connecting to diagnostics stream...' });
    
    const eventSource = new EventSource('/api/stream');
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.status === 'complete') {
        setKpis(data.result.kpis);
        setSwot(data.result.swot);
        setExpiryData(data.result.expiry);
        setPricingData(data.result.pricing);
        setProcurementData(data.result.procurement);
        
        setScanning(false);
        setProgress(null);
        eventSource.close();
      } else {
        setProgress(data);
      }
    };

    eventSource.onerror = (err) => {
      console.error("EventSource error:", err);
      setScanning(false);
      setProgress(null);
      eventSource.close();
      alert("Failed to connect to diagnostic stream or connection interrupted.");
    };
  };

  return (
    <div 
      className="min-h-screen text-slate-100 flex flex-col font-sans antialiased"
      style={{
        backgroundImage: 'url(/retailmind_bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        backgroundColor: '#0f172a',
      }}
    >
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[2px] z-0"></div>
      
      {/* Top Header */}
      <header className="bg-slate-900/60 backdrop-blur-md border-b border-slate-800/80 px-6 py-4 flex items-center justify-between shadow-lg sticky top-0 z-40 relative">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20 overflow-hidden">
             <img src="/retailmind_logo.png" alt="RetailMind Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-sky-400 to-cyan-300 bg-clip-text text-transparent leading-none">
              RetailMind AI
            </h1>
            <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase block mt-1">
              Supermarket Intelligence Engine
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {progress && (
            <div className="px-4 py-2 bg-slate-800/80 border border-cyan-500/30 rounded-xl shadow-lg flex items-center space-x-3">
              <svg className="animate-spin h-4 w-4 text-cyan-400" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-xs text-slate-300 font-medium">
                <span className="text-cyan-400 font-bold">[{progress.agent}]</span> {progress.status}
              </span>
            </div>
          )}
          
          <input
            type="file"
            accept=".csv,.txt"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || scanning}
            className="px-4 py-2.5 bg-slate-800/80 hover:bg-slate-700 disabled:opacity-50 border border-slate-700 hover:border-slate-500 rounded-xl text-xs font-semibold transition-all shadow-md flex items-center space-x-2 text-slate-200"
          >
            {uploading ? (
              <span>Uploading Data...</span>
            ) : (
              <>
                <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
                </svg>
                <span>Upload POS Logs</span>
              </>
            )}
          </button>

          {uploadedFile && (
            <div className="px-3 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center space-x-2 animate-pulse">
              <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span className="text-xs text-emerald-300 font-semibold">{uploadedFile}</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Core Layout */}
      <div className="flex flex-1 overflow-hidden relative z-10">
        {/* Sidebar Nav */}
        <aside className="w-64 bg-slate-900/60 backdrop-blur-xl border-r border-slate-800/80 p-5 flex flex-col justify-between shrink-0 shadow-2xl">
          <div className="space-y-6">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-2">Intelligence Modules</span>
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-lg shadow-cyan-500/10'
                    : 'border border-transparent text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                <span>Overview Dashboard</span>
              </button>

              <button
                onClick={() => setActiveTab('expiry')}
                className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === 'expiry'
                    ? 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-lg shadow-cyan-500/10'
                    : 'border border-transparent text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <span>Expiry Optimizer</span>
              </button>

              <button
                onClick={() => setActiveTab('pricing')}
                className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === 'pricing'
                    ? 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-lg shadow-cyan-500/10'
                    : 'border border-transparent text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z"></path></svg>
                <span>Pricing Guard</span>
              </button>

              <button
                onClick={() => setActiveTab('procurement')}
                className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === 'procurement'
                    ? 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-lg shadow-cyan-500/10'
                    : 'border border-transparent text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                <span>Procurement Center</span>
              </button>

              <button
                onClick={() => setActiveTab('sandbox')}
                className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === 'sandbox'
                    ? 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-lg shadow-cyan-500/10'
                    : 'border border-transparent text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                <span>Strategy Sandbox</span>
              </button>
            </nav>
          </div>

          <div className="bg-slate-900/40 border border-slate-700/50 rounded-2xl p-4.5 mt-auto">
             <div className="text-xs text-slate-400 mb-2 font-medium">Inventory Health</div>
             <div className="w-full bg-slate-800 rounded-full h-2 mb-1">
               <div className="bg-gradient-to-r from-emerald-400 to-cyan-400 h-2 rounded-full" style={{ width: '85%' }}></div>
             </div>
             <div className="text-[10px] text-slate-500 flex justify-between">
               <span>Optimal</span>
               <span className="text-cyan-400 font-bold">85%</span>
             </div>
          </div>
        </aside>

        {/* Content View Workspace */}
        <main className="flex-1 overflow-y-auto p-8 relative">
          <div className="max-w-6xl mx-auto w-full h-full pb-20">
            {activeTab === 'dashboard' && (
              <RetailOverview
                kpis={kpis}
                swot={swot}
                onScanComplete={runDiagnosticScan}
                scanning={scanning}
              />
            )}
            {activeTab === 'expiry' && <ExpiryDesk expiryData={expiryData} />}
            {activeTab === 'pricing' && <PricingGuard pricingData={pricingData} />}
            {activeTab === 'procurement' && <ProcurementCenter procurementData={procurementData} />}
            {activeTab === 'sandbox' && <RetailSandbox />}
          </div>
        </main>
      </div>
    </div>
  );
}
