import { useState } from 'react';

export default function RetailSandbox() {
  const [decision, setDecision] = useState('Hire more checkout staff during peak evening hours');
  const [budget, setBudget] = useState(50000);
  const [shiftHours, setShiftHours] = useState(20);
  const [staffIncrease, setStaffIncrease] = useState(2);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const runSimulation = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision, budget, shift_hours: shiftHours, staff_increase: staffIncrease })
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent">
            Strategy Sandbox Simulator
          </h2>
          <p className="text-slate-400 text-sm mt-1">Simulate financial and operational impacts of managerial decisions.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8">
        <div className="bg-[#0c0c0e]/60 backdrop-blur-md border border-[#1a1a24]/80 rounded-2xl p-6 shadow-lg space-y-6">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wide">Managerial Decision</label>
            <input 
              type="text" 
              value={decision}
              onChange={(e) => setDecision(e.target.value)}
              className="w-full bg-[#0a0a0c] border border-[#1a1a24]/80 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500/50 transition-colors"
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide">Budget Allocation (PKR)</label>
              <span className="text-orange-400 text-xs font-bold">{budget.toLocaleString()}</span>
            </div>
            <input 
              type="range" 
              min="0" max="500000" step="10000"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full accent-orange-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide">Extra Staff Allocated</label>
              <span className="text-orange-400 text-xs font-bold">{staffIncrease} people</span>
            </div>
            <input 
              type="range" 
              min="0" max="10" step="1"
              value={staffIncrease}
              onChange={(e) => setStaffIncrease(Number(e.target.value))}
              className="w-full accent-orange-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide">Shift Hours Adjusted</label>
              <span className="text-orange-400 text-xs font-bold">{shiftHours} hrs</span>
            </div>
            <input 
              type="range" 
              min="0" max="100" step="5"
              value={shiftHours}
              onChange={(e) => setShiftHours(Number(e.target.value))}
              className="w-full accent-orange-500 cursor-pointer"
            />
          </div>

          <button 
            onClick={runSimulation}
            disabled={loading}
            className="w-full py-2.5 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-bold text-xs rounded-xl shadow-lg transition-all disabled:opacity-50 mt-4 cursor-pointer"
          >
            {loading ? 'Running AI Simulation...' : 'Simulate Operational Impact'}
          </button>
        </div>

        {result && (
          <div className="bg-[#0c0c0e]/60 backdrop-blur-md border border-[#1a1a24]/80 rounded-2xl p-6 shadow-lg flex flex-col">
            <h3 className="text-md font-bold text-white mb-4">Simulation Results</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-[#121216]/50 p-4 rounded-xl border border-[#1a1a24]/80">
                <p className="text-[10px] text-slate-500 mb-1 uppercase font-semibold tracking-wider">Feasibility Score</p>
                <div className="flex items-end space-x-2">
                  <span className={`text-2xl font-bold ${result.feasibility_score > 70 ? 'text-emerald-400' : 'text-orange-400'}`}>
                    {result.feasibility_score}%
                  </span>
                </div>
              </div>
              <div className="bg-[#121216]/50 p-4 rounded-xl border border-[#1a1a24]/80">
                <p className="text-[10px] text-slate-500 mb-1 uppercase font-semibold tracking-wider">Queue Wait Time</p>
                <p className="text-sm font-bold text-orange-400 mt-1">{result.wait_time_impact}</p>
              </div>
              <div className="bg-[#121216]/50 p-4 rounded-xl border border-[#1a1a24]/80 col-span-2">
                <p className="text-[10px] text-slate-500 mb-1 uppercase font-semibold tracking-wider">Projected Weekly Revenue Impact</p>
                <p className="text-md font-bold text-emerald-400 mt-1">{result.revenue_impact}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <h4 className="text-emerald-400 font-bold text-xs mb-2 uppercase tracking-wide">Advantages</h4>
                <ul className="space-y-1">
                  {result.pros.map((p: string, i: number) => (
                    <li key={i} className="text-[11px] text-slate-300 flex items-start"><span className="mr-1.5 text-emerald-500 font-bold">+</span>{p}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-orange-400 font-bold text-xs mb-2 uppercase tracking-wide">Risks</h4>
                <ul className="space-y-1">
                  {result.cons.map((c: string, i: number) => (
                    <li key={i} className="text-[11px] text-slate-300 flex items-start"><span className="mr-1.5 text-orange-500 font-bold">-</span>{c}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-auto border-t border-[#1a1a24]/80 pt-4">
              <h4 className="text-slate-200 font-bold text-xs mb-2 uppercase tracking-wide">Implementation Plan</h4>
              <ul className="space-y-1.5">
                {result.implementation_steps.map((step: string, i: number) => (
                  <li key={i} className="text-[11px] text-slate-400 flex space-x-2">
                    <span className="text-slate-500 font-bold">{i+1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
        
        {!result && !loading && (
          <div className="bg-[#0c0c0e]/30 border border-[#1a1a24]/60 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-slate-500 min-h-[400px]">
            <svg className="w-12 h-12 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v5.25c0 .621-.504 1.125-1.125 1.125h-2.25A1.125 1.125 0 013 18.375v-5.25zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125v-9.75zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v14.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
            <p className="text-xs">Adjust sliders and run simulation to forecast impact.</p>
          </div>
        )}
      </div>
    </div>
  );
}
