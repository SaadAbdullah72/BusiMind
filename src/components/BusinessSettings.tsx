import { useState, useEffect } from 'react';

interface Aisle {
  id: string;
  name: string;
  slots: string[]; // Array of size 4
}

const CATEGORIES = [
  "",
  "Cooking Oil",
  "Tea",
  "Sugar",
  "Flour",
  "Milk",
  "Yogurt",
  "Soap",
  "Detergent",
  "Soft Drinks",
  "Spices",
  "Snacks",
  "Confectionery",
  "Frozen Foods"
];

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

  // Layout State
  const [aisles, setAisles] = useState<Aisle[]>([
    { id: '1', name: 'Line 1', slots: ['Cooking Oil', 'Tea', 'Flour', 'Sugar'] },
    { id: '2', name: 'Line 2', slots: ['Milk', 'Yogurt', 'Soap', 'Detergent'] }
  ]);

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
        if (data.layout_config && Array.isArray(data.layout_config) && data.layout_config.length > 0) {
          setAisles(data.layout_config);
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
          layout_config: aisles
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

  const handleAddAisle = () => {
    const nextId = (aisles.length > 0 ? Math.max(...aisles.map(a => parseInt(a.id) || 0)) + 1 : 1).toString();
    setAisles(prev => [
      ...prev,
      { id: nextId, name: `Line ${nextId}`, slots: ['', '', '', ''] }
    ]);
  };

  const handleRemoveAisle = (id: string) => {
    setAisles(prev => prev.filter(a => a.id !== id));
  };

  const handleAisleNameChange = (id: string, name: string) => {
    setAisles(prev => prev.map(a => a.id === id ? { ...a, name } : a));
  };

  const handleSlotChange = (aisleId: string, slotIndex: number, category: string) => {
    setAisles(prev => prev.map(a => {
      if (a.id === aisleId) {
        const updatedSlots = [...a.slots];
        updatedSlots[slotIndex] = category;
        return { ...a, slots: updatedSlots };
      }
      return a;
    }));
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
          <div className="flex bg-[#121216]/80 p-1 rounded-xl border border-[#1e1e24]">
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
              Store Layout Planner
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

          {/* TAB 2: STORE LAYOUT PLANNER */}
          {activeSubTab === 'layout' && (
            <div className="space-y-6">
              <div className="p-5 bg-indigo-500/5 border border-indigo-500/20 rounded-xl text-xs leading-relaxed text-indigo-300">
                💡 <strong>How it works:</strong> Define your physical aisles/lines. Each line represents a shelving block containing 4 slots (Front Left, Front Right, Back Left, Back Right). The AI cross-references this layout with POS transaction co-occurrences to recommend high-affinity item groupings visually on the Dashboard!
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {aisles.map((aisle) => (
                  <div key={aisle.id} className="p-5 rounded-xl bg-[#121216] border border-[#1e1e24] flex flex-col justify-between">
                    <div>
                      {/* Aisle Name and Remove */}
                      <div className="flex justify-between items-center mb-4">
                        <input
                          type="text"
                          value={aisle.name}
                          onChange={(e) => handleAisleNameChange(aisle.id, e.target.value)}
                          className="bg-transparent font-bold text-sm text-slate-200 border-b border-transparent hover:border-slate-600 focus:border-indigo-500 focus:outline-none py-0.5 px-1 max-w-[150px]"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveAisle(aisle.id)}
                          className="p-1 text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
                          title="Remove Aisle"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>

                      {/* 2x2 Shelf Slots */}
                      <div className="grid grid-cols-2 gap-3 mt-2">
                        {/* Slot 0: Front Left */}
                        <div className="p-2.5 bg-[#0a0a0c] border border-slate-800 rounded-lg">
                          <span className="block text-[9px] font-bold text-indigo-400 tracking-wider uppercase mb-1">Front Left (Slot 1)</span>
                          <select
                            value={aisle.slots[0] || ""}
                            onChange={(e) => handleSlotChange(aisle.id, 0, e.target.value)}
                            className="w-full bg-[#121216] text-xs text-slate-300 border border-slate-700/40 rounded px-1.5 py-1 focus:outline-none focus:border-indigo-500"
                          >
                            {CATEGORIES.map(cat => (
                              <option key={cat} value={cat}>{cat || "Empty"}</option>
                            ))}
                          </select>
                        </div>

                        {/* Slot 1: Front Right */}
                        <div className="p-2.5 bg-[#0a0a0c] border border-slate-800 rounded-lg">
                          <span className="block text-[9px] font-bold text-indigo-400 tracking-wider uppercase mb-1">Front Right (Slot 2)</span>
                          <select
                            value={aisle.slots[1] || ""}
                            onChange={(e) => handleSlotChange(aisle.id, 1, e.target.value)}
                            className="w-full bg-[#121216] text-xs text-slate-300 border border-slate-700/40 rounded px-1.5 py-1 focus:outline-none focus:border-indigo-500"
                          >
                            {CATEGORIES.map(cat => (
                              <option key={cat} value={cat}>{cat || "Empty"}</option>
                            ))}
                          </select>
                        </div>

                        {/* Slot 2: Back Left */}
                        <div className="p-2.5 bg-[#0a0a0c] border border-slate-800 rounded-lg">
                          <span className="block text-[9px] font-bold text-indigo-400 tracking-wider uppercase mb-1">Back Left (Slot 3)</span>
                          <select
                            value={aisle.slots[2] || ""}
                            onChange={(e) => handleSlotChange(aisle.id, 2, e.target.value)}
                            className="w-full bg-[#121216] text-xs text-slate-300 border border-slate-700/40 rounded px-1.5 py-1 focus:outline-none focus:border-indigo-500"
                          >
                            {CATEGORIES.map(cat => (
                              <option key={cat} value={cat}>{cat || "Empty"}</option>
                            ))}
                          </select>
                        </div>

                        {/* Slot 3: Back Right */}
                        <div className="p-2.5 bg-[#0a0a0c] border border-slate-800 rounded-lg">
                          <span className="block text-[9px] font-bold text-indigo-400 tracking-wider uppercase mb-1">Back Right (Slot 4)</span>
                          <select
                            value={aisle.slots[3] || ""}
                            onChange={(e) => handleSlotChange(aisle.id, 3, e.target.value)}
                            className="w-full bg-[#121216] text-xs text-slate-300 border border-slate-700/40 rounded px-1.5 py-1 focus:outline-none focus:border-indigo-500"
                          >
                            {CATEGORIES.map(cat => (
                              <option key={cat} value={cat}>{cat || "Empty"}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Add Aisle Block */}
                <button
                  type="button"
                  onClick={handleAddAisle}
                  className="p-8 rounded-xl border border-dashed border-slate-850 hover:border-indigo-500/50 bg-[#121216]/30 hover:bg-[#121216]/60 flex flex-col items-center justify-center gap-3.5 transition-all group cursor-pointer text-slate-400 hover:text-indigo-400"
                >
                  <div className="w-10 h-10 rounded-full border border-dashed border-slate-750 group-hover:border-indigo-500/40 flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider">Add Aisle / Line</span>
                </button>
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
