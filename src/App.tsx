import { useState } from 'react';
import './index.css';

// Component imports
import RetailOverview from './components/RetailOverview';
import SupportEngine from './components/SupportEngine';
import LoginScreen from './components/LoginScreen';
import DataSyncHub from './components/DataSyncHub';
import BusinessSettings from './components/BusinessSettings';
import OperationsChatbot from './components/OperationsChatbot';

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
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('isLoggedIn') === 'true');
  const [userEmail, setUserEmail] = useState<string | null>(localStorage.getItem('userEmail'));

  const [activeTab, setActiveTab] = useState<'dashboard' | 'datasync' | 'support' | 'settings' | 'chatbot'>('dashboard');
  const [kpis, setKpis] = useState(defaultKPIs);
  const [swot, setSwot] = useState(defaultSWOT);
  const [scanResult, setScanResult] = useState<any>(null);

  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState<any>(null);


  const runDiagnosticScan = () => {
    setScanning(true);
    setProgress({ agent: 'Initializing', status: 'Connecting to diagnostics stream...' });
    
    const eventSource = new EventSource(`/api/stream?email=${encodeURIComponent(userEmail || '')}`);
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.agent === 'Error') {
        alert(`Diagnostic Scan Error: ${data.status}`);
        setScanning(false);
        setProgress(null);
        eventSource.close();
      } else if (data.status === 'complete') {
        setKpis(data.result.kpis);
        setSwot(data.result.swot);
        setScanResult(data.result);
        
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

  if (!isLoggedIn) {
    return <LoginScreen onLoginSuccess={(email) => {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userEmail', email);
      setIsLoggedIn(true);
      setUserEmail(email);
    }} />;
  }

  const handleSignOut = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    setIsLoggedIn(false);
    setUserEmail(null);
  };

  return (
    <div 
      className="min-h-screen text-slate-100 flex flex-col font-sans antialiased"
      style={{
        backgroundImage: 'url(/retailmind_bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        backgroundColor: '#050505',
      }}
    >
      <div className="absolute inset-0 bg-[#050505]/85 backdrop-blur-[2px] z-0"></div>
      
      {/* Top Header */}
      <header className="bg-[#0c0c0e]/80 backdrop-blur-md border-b border-[#1c1c22]/80 px-6 py-4 flex items-center justify-between shadow-lg sticky top-0 z-40 relative">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/10 overflow-hidden">
             <img src="/retailmind_logo.png" alt="RetailMind Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent leading-none">
              RetailMind AI
            </h1>
            <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase block mt-1">
              Supermarket Intelligence Engine
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4 flex-wrap gap-2 md:flex-nowrap">
          {userEmail && (
            <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 bg-[#121216] border border-[#1e1e24] rounded-xl">
              <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></div>
              <span className="text-xs text-slate-300 font-medium">{userEmail}</span>
            </div>
          )}

          {progress && (
            <div className="px-4 py-2 bg-[#121216] border border-orange-500/30 rounded-xl shadow-lg flex items-center space-x-3">
              <svg className="animate-spin h-4 w-4 text-orange-400" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-xs text-slate-300 font-medium">
                <span className="text-orange-400 font-bold">[{progress.agent}]</span> {progress.status}
              </span>
            </div>
          )}

          <button
            onClick={handleSignOut}
            className="px-3.5 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 rounded-xl text-xs font-bold transition-all text-red-400 hover:text-red-300 cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Core Layout */}
      <div className="flex flex-1 overflow-hidden relative z-10">
        {/* Sidebar Nav */}
        <aside className="w-64 bg-[#0c0c0e]/60 backdrop-blur-xl border-r border-[#1c1c22]/80 p-5 flex flex-col justify-between shrink-0 shadow-2xl overflow-y-auto">
          <div className="space-y-6">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-2">Data Sync</span>
              <nav className="space-y-1 mt-2">
                <button onClick={() => setActiveTab('datasync')} className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all ${activeTab === 'datasync' ? 'bg-[#121216] border border-[#1e1e24] shadow-lg text-slate-100' : 'text-slate-400 hover:bg-[#121216]/50 hover:text-slate-200'}`}>
                  <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                  <span className="font-semibold text-xs">Data Sync Hub</span>
                </button>
              </nav>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-2">Intelligence Modules</span>
              <nav className="space-y-1 mt-2">
                <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-orange-500/10 border border-orange-500/30 text-orange-400 shadow-lg' : 'text-slate-400 hover:bg-[#121216]/50 hover:text-slate-200'}`}>
                  <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                  <span className="font-semibold text-xs">Operations Dashboard</span>
                </button>

                <button onClick={() => setActiveTab('chatbot')} className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all ${activeTab === 'chatbot' ? 'bg-orange-500/10 border border-orange-500/30 text-orange-400 shadow-lg' : 'text-slate-400 hover:bg-[#121216]/50 hover:text-slate-200'}`}>
                  <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
                  <span className="font-semibold text-xs">AI Operations Chatbot</span>
                </button>
              </nav>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-2">System</span>
              <nav className="space-y-1 mt-2">
                <button onClick={() => setActiveTab('support')} className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all ${activeTab === 'support' ? 'bg-blue-500/10 border border-blue-500/30 text-blue-400 shadow-lg' : 'text-slate-400 hover:bg-[#121216]/50 hover:text-slate-200'}`}>
                  <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                  <span className="font-semibold text-xs">Support Engine AI</span>
                </button>

                <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all ${activeTab === 'settings' ? 'bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 shadow-lg' : 'text-slate-400 hover:bg-[#121216]/50 hover:text-slate-200'}`}>
                  <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                  <span className="font-semibold text-xs">Business Settings</span>
                </button>
              </nav>
            </div>
          </div>

          <div className="bg-[#121216]/60 border border-[#1e1e24] rounded-2xl p-4.5 mt-auto">
             <div className="text-xs text-slate-400 mb-2 font-medium">Inventory Health</div>
             <div className="w-full bg-[#1b1b22] rounded-full h-2 mb-1">
               <div className="bg-gradient-to-r from-orange-500 to-amber-400 h-2 rounded-full" style={{ width: '85%' }}></div>
             </div>
             <div className="text-[10px] text-slate-500 flex justify-between">
               <span>Optimal</span>
               <span className="text-orange-400 font-bold">85%</span>
             </div>
          </div>
        </aside>

        {/* Content View Workspace */}
        <main className="flex-1 overflow-y-auto p-8 relative">
          <div className="max-w-6xl mx-auto w-full h-full pb-20">
            {activeTab === 'datasync' && (
              <DataSyncHub 
                userEmail={userEmail || ''} 
                onUploadSuccess={(type) => {
                  console.log(`${type} uploaded successfully`);
                }}
              />
            )}
            {activeTab === 'dashboard' && (
              <RetailOverview
                kpis={kpis}
                swot={swot}
                onScanComplete={runDiagnosticScan}
                scanning={scanning}
                depletionRisks={scanResult?.depletion_risks}
                layoutRecommendations={scanResult?.layout_recommendations}
              />
            )}
            {activeTab === 'chatbot' && <OperationsChatbot userEmail={userEmail || ''} />}
            {activeTab === 'support' && <SupportEngine userEmail={userEmail || ''} />}
            {activeTab === 'settings' && <BusinessSettings userEmail={userEmail || ''} />}
          </div>
        </main>
      </div>
    </div>
  );
}
