export default function RetailOverview({ kpis, swot, onScanComplete, scanning, depletionRisks, layoutRecommendations }: any) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent">
            Supermarket Operations
          </h2>
          <p className="text-slate-400 text-sm mt-1">Live KPI and strategic analysis.</p>
        </div>
        <button
          onClick={onScanComplete}
          disabled={scanning}
          className="px-6 py-2.5 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/30 transition-all disabled:opacity-50 flex items-center space-x-2"
        >
          {scanning ? (
            <span className="flex items-center space-x-2">
              <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Scanning Operations...</span>
            </span>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
              <span>Run Diagnostic Scan</span>
            </>
          )}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-5">
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"/><path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd"/></svg>
          </div>
          <p className="text-sm font-semibold text-slate-400 mb-1">Total Revenue</p>
          <p className="text-3xl font-bold text-orange-400">{kpis.total_revenue}</p>
          <p className="text-xs text-slate-500 mt-2">{kpis.total_transactions} transactions today</p>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <p className="text-sm font-semibold text-slate-400 mb-1">Waste Risk Cost</p>
          <p className="text-3xl font-bold text-red-400">{kpis.waste_risk_cost}</p>
          <p className="text-xs text-slate-500 mt-2">Due to approaching expiries</p>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <p className="text-sm font-semibold text-slate-400 mb-1">Bestseller</p>
          <p className="text-2xl font-bold text-emerald-400 truncate">{kpis.bestseller}</p>
          <p className="text-xs text-slate-500 mt-2">Avg Basket: {kpis.average_basket_value}</p>
        </div>
      </div>

      {/* SWOT Board */}
      <div className="grid grid-cols-2 gap-5 mt-6">
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-5 shadow-lg">
          <h3 className="text-emerald-400 font-bold mb-3 flex items-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
            <span>Strengths</span>
          </h3>
          <ul className="space-y-2">
            {swot.strengths.map((s: string, i: number) => (
              <li key={i} className="text-sm text-slate-300 flex items-start space-x-2">
                <span className="text-emerald-500 mt-0.5">•</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-5 shadow-lg">
          <h3 className="text-red-400 font-bold mb-3 flex items-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            <span>Weaknesses</span>
          </h3>
          <ul className="space-y-2">
            {swot.weaknesses.map((w: string, i: number) => (
              <li key={i} className="text-sm text-slate-300 flex items-start space-x-2">
                <span className="text-red-500 mt-0.5">•</span>
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-5 shadow-lg">
          <h3 className="text-orange-400 font-bold mb-3 flex items-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
            <span>Opportunities</span>
          </h3>
          <ul className="space-y-2">
            {swot.opportunities.map((o: string, i: number) => (
              <li key={i} className="text-sm text-slate-300 flex items-start space-x-2">
                <span className="text-orange-500 mt-0.5">•</span>
                <span>{o}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-5 shadow-lg">
          <h3 className="text-orange-400 font-bold mb-3 flex items-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <span>Threats</span>
          </h3>
          <ul className="space-y-2">
            {swot.threats.map((t: string, i: number) => (
              <li key={i} className="text-sm text-slate-300 flex items-start space-x-2">
                <span className="text-orange-500 mt-0.5">•</span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-5 shadow-lg mt-5">
        <h3 className="text-indigo-400 font-bold mb-3 flex items-center space-x-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          <span>Priority Action Steps</span>
        </h3>
        <ul className="space-y-3">
          {swot.action_steps.map((a: string, i: number) => (
            <li key={i} className="bg-slate-850/50 p-3 rounded-xl text-sm text-slate-200 border border-slate-700/50 flex items-center space-x-3">
              <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">{i+1}</span>
              <span>{a}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Depletion Risks Section */}
      {depletionRisks && depletionRisks.length > 0 && (
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-5 shadow-lg mt-6">
          <h3 className="text-rose-400 font-bold mb-3 flex items-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            <span>Critical Stock Depletion Risks (Velocity vs. Lead Time)</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {depletionRisks.map((risk: any, i: number) => (
              <div key={i} className="bg-slate-850/50 p-4 rounded-xl border border-slate-700/40 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <span className="font-semibold text-slate-200 text-sm">{risk.name}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${risk.status === 'Critical' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
                      {risk.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-3 text-xs text-slate-400">
                    <div>
                      <p className="text-[10px] text-slate-500">Current Stock</p>
                      <p className="font-medium text-slate-300">{risk.stock} units</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500">Sales Velocity</p>
                      <p className="font-medium text-slate-300">{risk.sales_velocity_daily}/day</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500">Supplier SLA</p>
                      <p className="font-medium text-slate-300">{risk.supplier_lead_days} days lead</p>
                    </div>
                  </div>
                </div>
                <div className="mt-3.5 pt-3.5 border-t border-slate-800 flex justify-between items-center text-xs">
                  <span className="text-slate-400">Estimated Stockout In:</span>
                  <span className={`font-bold ${risk.status === 'Critical' ? 'text-red-400' : 'text-amber-400'}`}>{risk.days_left} Days</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Shelf Arrangement Recommendations */}
      {layoutRecommendations && layoutRecommendations.length > 0 && (
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-5 shadow-lg mt-6">
          <h3 className="text-amber-400 font-bold mb-3 flex items-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
            <span>AI Store Layout & Shelf Arrangement Suggestions</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {layoutRecommendations.map((rec: any, i: number) => (
              <div key={i} className="bg-[#121216]/50 p-4 rounded-xl border border-slate-700/40 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-slate-200 text-sm">{rec.title}</h4>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    <span className="text-amber-400 font-semibold">Insight: </span>{rec.reason}
                  </p>
                </div>
                <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-700/40 mt-4 text-[11px] text-slate-300 leading-normal">
                  <span className="font-bold text-orange-400 uppercase tracking-wider block text-[9px] mb-1">Placement Strategy</span>
                  {rec.placement_tip}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
