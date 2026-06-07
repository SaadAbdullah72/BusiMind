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
      <div className="bg-gradient-to-b from-[#0e0e12]/90 to-[#0c0c0f]/95 border border-[#1e1e26] rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none"></div>
        {/* Module Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 border-b border-[#1e1e24] pb-5 gap-4">
          <div className="flex items-center gap-3.5">
            <div>
              <h2 className="text-xl font-bold text-slate-100 uppercase tracking-wide">Business Control Center</h2>
              <p className="text-xs text-slate-500 mt-0.5 uppercase tracking-widest font-semibold">Manage credentials, API configurations, and physical store layout settings.</p>
            </div>
          </div>

          <div className="flex bg-[#121216]/80 p-0.5 rounded-xl border border-[#1e1e24] shrink-0">
            <button
              onClick={() => setActiveSubTab('credentials')}
              type="button"
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer uppercase tracking-wider ${
                activeSubTab === 'credentials' 
                  ? 'bg-slate-850 text-white shadow-lg border border-slate-700/50' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              System Credentials
            </button>
            <button
              onClick={() => setActiveSubTab('layout')}
              type="button"
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer uppercase tracking-wider ${
                activeSubTab === 'layout' 
                  ? 'bg-slate-850 text-white shadow-lg border border-slate-700/50' 
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
              <div className="p-6 rounded-xl bg-gradient-to-b from-[#0c0c0e]/90 to-[#121217]/50 border border-slate-800/60 shadow-md space-y-4">
                <h3 className="font-extrabold text-slate-350 text-xs uppercase tracking-wider mb-2">Support Agent Configuration</h3>
                <p className="text-[11px] text-slate-500 mb-4 leading-relaxed font-semibold uppercase tracking-wider">This is the email account the AI will monitor for incoming queries and use to send auto-replies.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">IMAP/SMTP Email</label>
                    <input required type="email" value={smtpEmail} onChange={e=>setSmtpEmail(e.target.value)} className="w-full bg-[#050508]/80 border border-slate-700/50 rounded-lg px-4 py-2 text-sm text-slate-250 focus:outline-none focus:border-indigo-500/50 transition-colors" placeholder="support@yourbusiness.com" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">App Password (16-char)</label>
                    <input required type="password" value={smtpPassword} onChange={e=>setSmtpPassword(e.target.value)} className="w-full bg-[#050508]/80 border border-slate-700/50 rounded-lg px-4 py-2 text-sm text-slate-250 focus:outline-none focus:border-indigo-500/50 transition-colors" placeholder="••••••••••••••••" />
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-xl bg-gradient-to-b from-[#0c0c0e]/90 to-[#121217]/50 border border-slate-800/60 shadow-md space-y-4">
                <h3 className="font-extrabold text-slate-350 text-xs uppercase tracking-wider mb-2">Escalation Routing</h3>
                <p className="text-[11px] text-slate-500 mb-4 leading-relaxed font-semibold uppercase tracking-wider">Unsolvable or angry queries will be automatically forwarded to this human staff address.</p>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Staff / Manager Email</label>
                  <input required type="email" value={staffEmail} onChange={e=>setStaffEmail(e.target.value)} className="w-full bg-[#050508]/80 border border-slate-700/50 rounded-lg px-4 py-2 text-sm text-slate-250 focus:outline-none focus:border-indigo-500/50 transition-colors" placeholder="manager@yourbusiness.com" />
                </div>
              </div>

              <div className="p-6 rounded-xl bg-gradient-to-b from-[#0c0c0e]/90 to-[#121217]/50 border border-slate-800/60 shadow-md space-y-4">
                <h3 className="font-extrabold text-slate-350 text-xs uppercase tracking-wider mb-2">Testing Sandbox (Customer Simulator)</h3>
                <p className="text-[11px] text-slate-500 mb-4 leading-relaxed font-semibold uppercase tracking-wider">Credentials used to generate mock incoming customer emails for testing the AI.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Customer Email</label>
                    <input required type="email" value={customerEmail} onChange={e=>setCustomerEmail(e.target.value)} className="w-full bg-[#050508]/80 border border-slate-700/50 rounded-lg px-4 py-2 text-sm text-slate-250 focus:outline-none focus:border-indigo-500/50 transition-colors" placeholder="testcustomer@gmail.com" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Customer App Password</label>
                    <input required type="password" value={customerPassword} onChange={e=>setCustomerPassword(e.target.value)} className="w-full bg-[#050508]/80 border border-slate-700/50 rounded-lg px-4 py-2 text-sm text-slate-250 focus:outline-none focus:border-indigo-500/50 transition-colors" placeholder="••••••••••••••••" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: STORE LAYOUT CONFIG */}
          {activeSubTab === 'layout' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="p-4 bg-[#121217]/70 border border-slate-800/80 rounded-xl text-[11px] leading-relaxed text-slate-400 flex items-start gap-2.5 shadow-sm">
                <span>
                  <strong className="text-slate-300">Dynamic Floor Planner:</strong> Set the physical layout parameters of your store. The AI will automatically analyze your inventory categories and purchase frequencies to fit them into the optimal shelves, alerting you if any categories overflow your current store capacity.
                </span>
              </div>

              <div className="p-6 rounded-xl bg-gradient-to-b from-[#0c0c0e]/90 to-[#121217]/50 border border-slate-800/60 shadow-md space-y-6">
                <h3 className="font-extrabold text-slate-350 text-xs uppercase tracking-wider">Store Capacity Config</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-400 mb-2 uppercase tracking-widest">Number of Aisles / Lines</label>
                    <p className="text-[10px] text-slate-550 mb-3 leading-relaxed font-semibold">How many physical shelving lines are set up in your store?</p>
                    <input
                      required
                      type="number"
                      min="1"
                      max="12"
                      value={aislesCount}
                      onChange={e => setAislesCount(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full bg-[#050508]/80 border border-slate-700/50 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50 transition-colors font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-400 mb-2 uppercase tracking-widest">Capacity per Aisle (Slots / Items)</label>
                    <p className="text-[10px] text-slate-550 mb-3 leading-relaxed font-semibold">How many distinct product categories can each aisle accommodate?</p>
                    <input
                      required
                      type="number"
                      min="1"
                      max="8"
                      value={slotsPerAisle}
                      onChange={e => setSlotsPerAisle(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full bg-[#050508]/80 border border-slate-700/50 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50 transition-colors font-bold"
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
              className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl text-xs font-extrabold transition-all shadow-[0_0_12px_rgba(99,102,241,0.2)] hover:shadow-[0_0_18px_rgba(99,102,241,0.35)] transform hover:-translate-y-0.5 border-none cursor-pointer uppercase tracking-wider disabled:opacity-50"
            >
              {loading ? 'Saving Layout...' : 'Save Configuration'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
