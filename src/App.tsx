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

/**
 * Main Application Component
 * 
 * Manages global application state including user authentication, active navigation tab,
 * and handles the core Operation Diagnostic Scan logic via Server-Sent Events (SSE).
 * Also renders the global layout, top header, and sidebar navigation.
 */
export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('isLoggedIn') === 'true');
  const [userEmail, setUserEmail] = useState<string | null>(localStorage.getItem('userEmail'));

  const [activeTab, setActiveTab] = useState<'dashboard' | 'datasync' | 'support' | 'settings' | 'chatbot' | 'hr'>('dashboard');
  const [kpis, setKpis] = useState(defaultKPIs);
  const [swot, setSwot] = useState(defaultSWOT);
  const [scanResult, setScanResult] = useState<any>(null);

  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState<any>(null);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);


  /**
   * Initializes and manages the diagnostic scan stream via SSE.
   * Connects to `/api/stream`, parsing the incoming JSON payload and updating 
   * global states (KPIs, SWOT, and progressive scan results).
   */
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
    <div className="min-h-screen bg-[#030303] text-slate-200 font-sans relative overflow-hidden flex flex-col" style={{
      backgroundImage: "url('/bg-corporate.png')",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    }}>
      {/* Background Ambience Layer */}
      <div className="absolute inset-0 bg-[#030303]/70 backdrop-blur-[2px] z-0"></div>
      
      {/* Top Header */}
      <header className="bg-[#0c0c0e]/80 backdrop-blur-md border-b border-[#1c1c22]/80 px-4 md:px-6 py-3 md:py-4 flex flex-wrap items-center justify-between shadow-lg sticky top-0 z-40 relative">
        <div className="flex items-center space-x-3.5 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center space-x-3.5">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-slate-300 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-transparent rounded-xl flex items-center justify-center overflow-hidden">
               <div className="logo-scene w-8 h-8 md:w-10 md:h-10">
                 <div className="logo-3d-object">
                   {/* Edges */}
                   {Array.from({ length: 6 }).map((_, i) => (
                     <div key={`edge-${i}`} className="logo-face" style={{ transform: `translateZ(${i - 3}px)` }}>
                       <div className="w-full h-full rounded-full border-[2px] border-orange-600 bg-transparent" />
                     </div>
                   ))}
                   {/* Front */}
                   <div className="logo-face" style={{ transform: 'translateZ(3.5px)' }}>
                     <div className="w-full h-full rounded-full border border-orange-400 bg-[#050505] flex items-center justify-center">
                       <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                         <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.974 0-5.699-.5-8.15-1.353m16.3 0C19.349 11.025 15.86 12 12 12s-7.349-.975-10.15-2.853M12 12v9" />
                       </svg>
                     </div>
                   </div>
                   {/* Back */}
                   <div className="logo-face" style={{ transform: 'translateZ(-3.5px) rotateY(180deg)' }}>
                     <div className="w-full h-full rounded-full border border-orange-400 bg-[#050505] flex items-center justify-center">
                       <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                         <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.974 0-5.699-.5-8.15-1.353m16.3 0C19.349 11.025 15.86 12 12 12s-7.349-.975-10.15-2.853M12 12v9" />
                       </svg>
                     </div>
                   </div>
                 </div>
               </div>
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold text-slate-100 tracking-tight leading-none">
                RetailMind AI
              </h1>
              <span className="text-[9px] md:text-[10px] text-slate-500 font-semibold tracking-widest uppercase block mt-1">
                Corporate Intelligence Hub
              </span>
            </div>
          </div>
          <div className="md:hidden">
            <button
              onClick={handleSignOut}
              className="px-3 py-1.5 bg-red-500/10 border border-red-500/30 rounded-lg text-[10px] font-bold text-red-400"
            >
              Sign Out
            </button>
          </div>
        </div>

        <div className="hidden md:flex items-center space-x-4 flex-wrap gap-2 md:flex-nowrap mt-3 md:mt-0">
          {userEmail && (
            <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 bg-[#121216]/60 border border-[#1a1a24]/80 rounded-xl">
              <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></div>
              <span className="text-xs text-slate-350 font-medium">{userEmail}</span>
            </div>
          )}

          {progress && (
            <div className="px-3 py-1.5 md:px-4 md:py-2 bg-[#0c0c0e]/80 border border-indigo-500/30 rounded-xl shadow-lg flex items-center space-x-2 md:space-x-3 w-full md:w-auto">
              <span className="animate-pulse w-2 h-2 rounded-full bg-indigo-500 shrink-0"></span>
              <span className="text-[10px] md:text-xs text-slate-300 font-medium truncate">
                <span className="text-indigo-400 font-bold">[{progress.agent}]</span> {progress.status}
              </span>
            </div>
          )}

          <button
            onClick={handleSignOut}
            className="hidden md:block px-3.5 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 rounded-xl text-xs font-bold transition-all text-red-400 hover:text-red-300 cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Core Layout */}
      <div className="flex flex-1 overflow-hidden relative z-10 flex-col md:flex-row">
        {/* Sidebar Nav */}
        <aside className={`${isMobileMenuOpen ? 'flex' : 'hidden'} md:flex absolute md:relative z-50 w-64 h-full bg-[#08080a]/95 md:bg-[#08080a]/60 backdrop-blur-xl border-r border-[#1a1a24]/80 p-5 flex-col justify-between shrink-0 shadow-2xl overflow-y-auto transition-transform`}>
          <div className="space-y-6">
            <div>
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest pl-2 block mb-3">Data Integration</span>
              <nav className="space-y-1">
                <button 
                  onClick={() => { setActiveTab('datasync'); setIsMobileMenuOpen(false); }} 
                  className={`w-full text-left px-4 py-2.5 rounded-lg transition-all cursor-pointer text-xs font-semibold ${
                    activeTab === 'datasync' 
                      ? 'bg-slate-800 text-slate-100' 
                      : 'text-slate-400 hover:bg-[#121216] hover:text-slate-200'
                  }`}
                >
                  Data Sync Hub
                </button>
              </nav>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest pl-2 block mb-3">Intelligence Center</span>
              <nav className="space-y-1">
                <button 
                  onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }} 
                  className={`w-full text-left px-4 py-2.5 rounded-lg transition-all cursor-pointer text-xs font-semibold ${
                    activeTab === 'dashboard' 
                      ? 'bg-slate-800 text-slate-100' 
                      : 'text-slate-400 hover:bg-[#121216] hover:text-slate-200'
                  }`}
                >
                  Live Dashboard
                </button>

                <button 
                  onClick={() => { setActiveTab('chatbot'); setIsMobileMenuOpen(false); }} 
                  className={`w-full text-left px-4 py-2.5 rounded-lg transition-all cursor-pointer text-xs font-semibold ${
                    activeTab === 'chatbot' 
                      ? 'bg-slate-800 text-slate-100' 
                      : 'text-slate-400 hover:bg-[#121216] hover:text-slate-200'
                  }`}
                >
                  Operations Chatbot
                </button>
              </nav>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest pl-2 block mb-3">System Operations</span>
              <nav className="space-y-1">
                <button 
                  onClick={() => { setActiveTab('support'); setIsMobileMenuOpen(false); }} 
                  className={`w-full text-left px-4 py-2.5 rounded-lg transition-all cursor-pointer text-xs font-semibold ${
                    activeTab === 'support' 
                      ? 'bg-slate-800 text-slate-100' 
                      : 'text-slate-400 hover:bg-[#121216] hover:text-slate-200'
                  }`}
                >
                  Support Engine
                </button>



                <button 
                  onClick={() => { setActiveTab('settings'); setIsMobileMenuOpen(false); }} 
                  className={`w-full text-left px-4 py-2.5 rounded-lg transition-all cursor-pointer text-xs font-semibold ${
                    activeTab === 'settings' 
                      ? 'bg-slate-800 text-slate-100' 
                      : 'text-slate-400 hover:bg-[#121216] hover:text-slate-200'
                  }`}
                >
                  Settings
                </button>
              </nav>
            </div>
          </div>
          <div className="mt-8 bg-[#0c0c0e]/80 p-4 border border-[#1a1a24]/80 rounded-xl">
             <div className="text-[10px] text-slate-500 mb-2 font-bold uppercase tracking-wider">Inventory Health</div>
             <div className="w-full bg-[#1b1b22] rounded-full h-1.5 mb-1.5">
               <div className="bg-gradient-to-r from-orange-500 to-amber-400 h-1.5 rounded-full shadow-[0_0_8px_rgba(249,115,22,0.4)]" style={{ width: '85%' }}></div>
             </div>
             <div className="text-[10px] text-slate-500 flex justify-between font-semibold">
               <span>Optimal</span>
               <span className="text-orange-400 font-bold">85%</span>
             </div>
          </div>
        </aside>

        {/* Content View Workspace */}
        <main className="flex-1 overflow-y-auto p-2 md:p-8 relative w-full bg-[#030303]/60 backdrop-blur-md">
          <div className="max-w-6xl mx-auto w-full h-full pb-20 overflow-x-hidden">
            {activeTab !== 'dashboard' && (
              <div className="mb-6">
                <button 
                  onClick={() => setActiveTab('dashboard')}
                  className="text-slate-400 hover:text-slate-200 text-xs font-bold uppercase tracking-widest cursor-pointer transition-colors"
                >
                  &larr; Back to Dashboard
                </button>
              </div>
            )}
            
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
                layoutConfig={scanResult?.layout_config}
                overflowCategories={scanResult?.overflow_categories}
                extraLinesNeeded={scanResult?.extra_lines_needed}
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
