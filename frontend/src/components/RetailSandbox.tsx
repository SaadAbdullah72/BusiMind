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
          <h2 className="text-3xl font-bold bg-gradient-to-r from-sky-400 to-cyan-300 bg-clip-text text-transparent">
            Strategy Sandbox Simulator
          </h2>
          <p className="text-slate-400 text-sm mt-1">Simulate financial and operational impacts of managerial decisions.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8">
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-lg space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Managerial Decision</label>
            <input 
              type="text" 
              value={decision}
              onChange={(e) => setDecision(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-sky-500 transition-colors"
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-semibold text-slate-300">Budget Allocation (PKR)</label>
              <span className="text-sky-400 text-sm font-bold">{budget.toLocaleString()}</span>
            </div>
            <input 
              type="range" 
              min="0" max="500000" step="10000"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full accent-sky-500"
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-semibold text-slate-300">Extra Staff Allocated</label>
              <span className="text-sky-400 text-sm font-bold">{staffIncrease} people</span>
            </div>
            <input 
              type="range" 
              min="0" max="10" step="1"
              value={staffIncrease}
              onChange={(e) => setStaffIncrease(Number(e.target.value))}
              className="w-full accent-sky-500"
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-semibold text-slate-300">Shift Hours Adjusted</label>
              <span className="text-sky-400 text-sm font-bold">{shiftHours} hrs</span>
            </div>
            <input 
              type="range" 
              min="0" max="100" step="5"
              value={shiftHours}
              onChange={(e) => setShiftHours(Number(e.target.value))}
              className="w-full accent-sky-500"
            />
          </div>

          <button 
            onClick={runSimulation}
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-500 hover:to-cyan-400 text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-50 mt-4"
          >
            {loading ? 'Running AI Simulation...' : 'Simulate Operational Impact'}
          </button>
        </div>

        {result && (
          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col">
            <h3 className="text-xl font-bold text-white mb-4">Simulation Results</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                <p className="text-xs text-slate-400 mb-1">Feasibility Score</p>
                <div className="flex items-end space-x-2">
                  <span className={`text-3xl font-bold ${result.feasibility_score > 70 ? 'text-emerald-400' : 'text-orange-400'}`}>
                    {result.feasibility_score}%
                  </span>
                </div>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                <p className="text-xs text-slate-400 mb-1">Queue Wait Time</p>
                <p className="text-lg font-bold text-sky-400">{result.wait_time_impact}</p>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 col-span-2">
                <p className="text-xs text-slate-400 mb-1">Projected Weekly Revenue Impact</p>
                <p className="text-xl font-bold text-emerald-400">{result.revenue_impact}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <h4 className="text-emerald-400 font-bold text-sm mb-2">Advantages</h4>
                <ul className="space-y-1">
                  {result.pros.map((p: string, i: number) => (
                    <li key={i} className="text-xs text-slate-300 flex items-start"><span className="mr-1.5 text-emerald-500">+</span>{p}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-orange-400 font-bold text-sm mb-2">Risks</h4>
                <ul className="space-y-1">
                  {result.cons.map((c: string, i: number) => (
                    <li key={i} className="text-xs text-slate-300 flex items-start"><span className="mr-1.5 text-orange-500">-</span>{c}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-auto border-t border-slate-800 pt-4">
              <h4 className="text-slate-200 font-bold text-sm mb-2">Implementation Plan</h4>
              <ul className="space-y-2">
                {result.implementation_steps.map((step: string, i: number) => (
                  <li key={i} className="text-xs text-slate-400 flex space-x-2">
                    <span className="text-slate-500 font-bold">{i+1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
        
        {!result && !loading && (
          <div className="bg-slate-900/60 border border-slate-800 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-slate-500 min-h-[400px]">
            <svg className="w-16 h-16 mb-4 opacity-20" fill="currentColor" viewBox="0 0 20 20"><path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z"/></svg>
            <p>Adjust sliders and run simulation to forecast impact.</p>
          </div>
        )}
      </div>
    </div>
  );
}
