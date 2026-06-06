import { useState, useEffect } from 'react';

export default function BusinessSettings({ userEmail }: { userEmail: string }) {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  const [activeSubTab, setActiveSubTab] = useState<'credentials' | 'layout'>('credentials');

  // Credentials State
  const [smtpEmail, setSmtpEmail] = useState('');
  const [smtpPassword, setSmtpPassword] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPassword, setCustomerPassword] = useState('');
  const [staffEmail, setStaffEmail] = useState('');

  // Layout State (simplified to numbers)
  const [aislesCount, setAislesCount] = useState(3);
  const [slotsPerAisle, setSlotsPerAisle] = useState(4);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`/api/settings?email=${encodeURIComponent(userEmail)}`);
        const data = await res.json();
        if (data.smtp_email) {
          setSmtpEmail(data.smtp_email || '');
          setSmtpPassword(data.smtp_password || '');
          setCustomerEmail(data.customer_email || '');
          setCustomerPassword(data.customer_password || '');
          setStaffEmail(data.staff_email || '');
        }
        if (data.layout_config && typeof data.layout_config === 'object') {
          setAislesCount(data.layout_config.aisles_count !== undefined ? data.layout_config.aisles_count : 3);
          setSlotsPerAisle(data.layout_config.slots_per_aisle !== undefined ? data.layout_config.slots_per_aisle : 4);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setFetching(false);
      }
    };
    fetchSettings();
  }, [userEmail]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          smtp_email: smtpEmail,
          smtp_password: smtpPassword,
          customer_email: customerEmail,
          customer_password: customerPassword,
          staff_email: staffEmail,
          layout_config: {
            aisles_count: aislesCount,
            slots_per_aisle: slotsPerAisle
          }
        })
      });
      const data = await res.json();
      alert(data.message || "Settings saved successfully!");
    } catch (err) {
      alert("Error saving settings");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="p-8 text-slate-400">Loading settings...</div>;

  return (
    <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500 text-slate-200">
      <div className="bg-[#0c0c0e]/80 backdrop-blur-md border border-[#1e1e24] rounded-2xl p-8 shadow-2xl">
        
        {/* Module Header */}
        <div className="flex items-center justify-between mb-8 border-b border-[#1e1e24] pb-5">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
              <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Business Control Center</h2>
              <p className="text-xs text-slate-400 mt-0.5">Manage credentials, API configurations, and physical store layout settings.</p>
            </div>
          </div>

          {/* Glassmorphic Tabs */}
          <div className="flex bg-[#121216]/80 p-0.5 rounded-xl border border-[#1e1e24]">
            <button
              onClick={() => setActiveSubTab('credentials')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeSubTab === 'credentials' 
                  ? 'bg-indigo-600 text-white shadow-lg' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              System Credentials
            </button>
            <button
              onClick={() => setActiveSubTab('layout')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeSubTab === 'layout' 
                  ? 'bg-indigo-600 text-white shadow-lg' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Store Layout Config
            </button>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          
          {/* TAB 1: CREDENTIALS */}
          {activeSubTab === 'credentials' && (
            <div className="space-y-6">
              <div className="p-6 rounded-xl bg-[#121216] border border-[#1e1e24] space-y-4">
                <h3 className="font-semibold text-slate-300 text-sm uppercase tracking-wider mb-2">Support Agent Configuration</h3>
                <p className="text-xs text-slate-500 mb-4">This is the email account the AI will monitor for incoming queries and use to send auto-replies.</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">IMAP/SMTP Email</label>
                    <input required type="email" value={smtpEmail} onChange={e=>setSmtpEmail(e.target.value)} className="w-full bg-[#0a0a0c] border border-slate-700/50 rounded-lg px-4 py-2 text-sm text-slate-250 focus:outline-none focus:border-indigo-500 transition-colors" placeholder="support@yourbusiness.com" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">App Password (16-char)</label>
                    <input required type="password" value={smtpPassword} onChange={e=>setSmtpPassword(e.target.value)} className="w-full bg-[#0a0a0c] border border-slate-700/50 rounded-lg px-4 py-2 text-sm text-slate-250 focus:outline-none focus:border-indigo-500 transition-colors" placeholder="••••••••••••••••" />
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-xl bg-[#121216] border border-[#1e1e24] space-y-4">
                <h3 className="font-semibold text-slate-300 text-sm uppercase tracking-wider mb-2">Escalation Routing</h3>
                <p className="text-xs text-slate-500 mb-4">Unsolvable or angry queries will be automatically forwarded to this human staff address.</p>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Staff / Manager Email</label>
                  <input required type="email" value={staffEmail} onChange={e=>setStaffEmail(e.target.value)} className="w-full bg-[#0a0a0c] border border-slate-700/50 rounded-lg px-4 py-2 text-sm text-slate-250 focus:outline-none focus:border-indigo-500 transition-colors" placeholder="manager@yourbusiness.com" />
                </div>
              </div>

              <div className="p-6 rounded-xl bg-[#121216] border border-[#1e1e24] space-y-4">
                <h3 className="font-semibold text-slate-300 text-sm uppercase tracking-wider mb-2">Testing Sandbox (Customer Simulator)</h3>
                <p className="text-xs text-slate-500 mb-4">Credentials used to generate mock incoming customer emails for testing the AI.</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Customer Email</label>
                    <input required type="email" value={customerEmail} onChange={e=>setCustomerEmail(e.target.value)} className="w-full bg-[#0a0a0c] border border-slate-700/50 rounded-lg px-4 py-2 text-sm text-slate-250 focus:outline-none focus:border-indigo-500 transition-colors" placeholder="testcustomer@gmail.com" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Customer App Password</label>
                    <input required type="password" value={customerPassword} onChange={e=>setCustomerPassword(e.target.value)} className="w-full bg-[#0a0a0c] border border-slate-700/50 rounded-lg px-4 py-2 text-sm text-slate-250 focus:outline-none focus:border-indigo-500 transition-colors" placeholder="••••••••••••••••" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: STORE LAYOUT CONFIG */}
          {activeSubTab === 'layout' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="p-5 bg-indigo-500/5 border border-indigo-500/20 rounded-xl text-xs leading-relaxed text-indigo-300">
                💡 <strong>Dynamic Floor Planner:</strong> Set the physical layout parameters of your store. The AI will automatically analyze your inventory categories and purchase frequencies to fit them into the optimal shelves, alerting you if any categories overflow your current store capacity.
              </div>

              <div className="p-6 rounded-xl bg-[#121216] border border-[#1e1e24] space-y-6">
                <h3 className="font-semibold text-slate-300 text-sm uppercase tracking-wider">Store Capacity Config</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">Number of Aisles / Lines</label>
                    <p className="text-[10px] text-slate-500 mb-3 leading-relaxed">How many physical shelving lines are set up in your store?</p>
                    <input
                      required
                      type="number"
                      min="1"
                      max="12"
                      value={aislesCount}
                      onChange={e => setAislesCount(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full bg-[#0a0a0c] border border-slate-700/50 rounded-lg px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">Capacity per Aisle (Slots / Items)</label>
                    <p className="text-[10px] text-slate-500 mb-3 leading-relaxed">How many distinct product categories can each aisle accommodate?</p>
                    <input
                      required
                      type="number"
                      min="1"
                      max="8"
                      value={slotsPerAisle}
                      onChange={e => setSlotsPerAisle(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full bg-[#0a0a0c] border border-slate-700/50 rounded-lg px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Form Submit Footer */}
          <div className="flex justify-end pt-4 border-t border-[#1e1e24] mt-6">
            <button 
              disabled={loading} 
              type="submit" 
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Saving Layout...' : 'Save Configuration'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
