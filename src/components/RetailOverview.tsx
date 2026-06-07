import { useState } from 'react';
import StoreLayoutMap from './StoreLayoutMap';

/**
 * RetailOverview Component
 * 
 * The main dashboard view presenting live KPIs, AI-generated SWOT analysis, 
 * priority action steps, critical stock depletion risks, and physical store layout recommendations.
 * Acts as the visualization layer for the underlying Operations Diagnostic Scan results.
 */
export default function RetailOverview({ kpis, swot, onScanComplete, scanning, depletionRisks, layoutRecommendations, layoutConfig, overflowCategories, extraLinesNeeded }: any) {
  const [hoveredRec, setHoveredRec] = useState<any>(null);
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 md:gap-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 tracking-tight uppercase">
            Supermarket Operations
          </h2>
          <p className="text-slate-500 text-xs mt-1 font-medium">Live KPI and strategic analysis</p>
        </div>
        <button
          onClick={onScanComplete}
          disabled={scanning}
          className="px-5 py-2.5 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-[0_0_15px_rgba(249,115,22,0.25)] hover:shadow-[0_0_20px_rgba(249,115,22,0.4)] transition-all transform hover:-translate-y-0.5 border-none disabled:opacity-50 flex items-center gap-2 cursor-pointer uppercase tracking-wider"
        >
          {scanning ? (
            <>
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Scanning Operations...</span>
            </>
          ) : (
            <>
              <span>Run Diagnostic Scan</span>
            </>
          )}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-b from-[#0c0c0e]/70 to-[#171512]/85 backdrop-blur-md border border-orange-500/15 hover:border-orange-500/35 rounded-2xl p-5 relative overflow-hidden shadow-lg shadow-black/30 hover:shadow-orange-500/5 transition-all duration-300">
          <div className="absolute -bottom-10 -right-10 w-24 h-24 rounded-full bg-orange-500/10 blur-2xl pointer-events-none"></div>
          <p className="text-[11px] font-bold text-orange-400/80 mb-1.5 tracking-widest uppercase">Total Revenue</p>
          <p className="text-2xl font-black text-slate-100 tracking-tight">{kpis.total_revenue}</p>
          <p className="text-[10px] text-slate-500 mt-2 font-semibold uppercase tracking-wider">{kpis.total_transactions} transactions today</p>
        </div>

        <div className="bg-gradient-to-b from-[#0c0c0e]/70 to-[#171212]/85 backdrop-blur-md border border-rose-500/15 hover:border-rose-500/35 rounded-2xl p-5 relative overflow-hidden shadow-lg shadow-black/30 hover:shadow-rose-500/5 transition-all duration-300">
          <div className="absolute -bottom-10 -right-10 w-24 h-24 rounded-full bg-rose-500/10 blur-2xl pointer-events-none"></div>
          <p className="text-[11px] font-bold text-rose-400/80 mb-1.5 tracking-widest uppercase">Waste Risk Cost</p>
          <p className="text-2xl font-black text-slate-100 tracking-tight">{kpis.waste_risk_cost}</p>
          <p className="text-[10px] text-slate-500 mt-2 font-semibold uppercase tracking-wider">Due to approaching expiries</p>
        </div>

        <div className="bg-gradient-to-b from-[#0c0c0e]/70 to-[#121714]/85 backdrop-blur-md border border-emerald-500/15 hover:border-emerald-500/35 rounded-2xl p-5 relative overflow-hidden shadow-lg shadow-black/30 hover:shadow-emerald-500/5 transition-all duration-300">
          <div className="absolute -bottom-10 -right-10 w-24 h-24 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none"></div>
          <p className="text-[11px] font-bold text-emerald-400/80 mb-1.5 tracking-widest uppercase">Bestseller</p>
          <p className="text-lg font-extrabold text-slate-100 truncate">{kpis.bestseller}</p>
          <p className="text-[10px] text-slate-500 mt-2 font-semibold uppercase tracking-wider">Avg Basket: {kpis.average_basket_value}</p>
        </div>
      </div>

      {/* SWOT Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-b from-[#0c0c0e]/70 to-[#121714]/65 backdrop-blur-md border border-emerald-500/10 hover:border-emerald-500/20 rounded-2xl p-5 transition-all duration-300 shadow-md">
          <h3 className="text-emerald-400 font-extrabold text-[13px] mb-3 flex items-center gap-2 uppercase tracking-wider">
            Strengths
          </h3>
          <ul className="space-y-2">
            {swot.strengths.map((s: string, i: number) => (
              <li key={i} className="text-[12px] text-slate-300 flex items-start gap-2.5 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-[7px] shrink-0 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-gradient-to-b from-[#0c0c0e]/70 to-[#171212]/65 backdrop-blur-md border border-red-500/10 hover:border-red-500/20 rounded-2xl p-5 transition-all duration-300 shadow-md">
          <h3 className="text-rose-450 font-extrabold text-[13px] mb-3 flex items-center gap-2 uppercase tracking-wider text-rose-400">
            Weaknesses
          </h3>
          <ul className="space-y-2">
            {swot.weaknesses.map((w: string, i: number) => (
              <li key={i} className="text-[12px] text-slate-300 flex items-start gap-2.5 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-[7px] shrink-0 shadow-[0_0_8px_rgba(251,113,133,0.8)]" />
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-gradient-to-b from-[#0c0c0e]/70 to-[#121217]/65 backdrop-blur-md border border-indigo-500/10 hover:border-indigo-500/20 rounded-2xl p-5 transition-all duration-300 shadow-md">
          <h3 className="text-indigo-400 font-extrabold text-[13px] mb-3 flex items-center gap-2 uppercase tracking-wider">
            Opportunities
          </h3>
          <ul className="space-y-2">
            {swot.opportunities.map((o: string, i: number) => (
              <li key={i} className="text-[12px] text-slate-300 flex items-start gap-2.5 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-[7px] shrink-0 shadow-[0_0_8px_rgba(129,140,248,0.8)]" />
                <span>{o}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-gradient-to-b from-[#0c0c0e]/70 to-[#171512]/65 backdrop-blur-md border border-orange-500/10 hover:border-orange-500/20 rounded-2xl p-5 transition-all duration-300 shadow-md">
          <h3 className="text-orange-400 font-extrabold text-[13px] mb-3 flex items-center gap-2 uppercase tracking-wider">
            Threats
          </h3>
          <ul className="space-y-2">
            {swot.threats.map((t: string, i: number) => (
              <li key={i} className="text-[12px] text-slate-300 flex items-start gap-2.5 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-[7px] shrink-0 shadow-[0_0_8px_rgba(251,146,60,0.8)]" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Priority Action Steps */}
      <div className="bg-gradient-to-b from-[#0c0c0e]/70 to-[#121217]/65 backdrop-blur-md border border-indigo-500/10 hover:border-indigo-500/20 rounded-2xl p-5 shadow-lg">
        <h3 className="text-slate-100 font-extrabold text-[13px] mb-4 flex items-center gap-2 uppercase tracking-wider">
          Priority Action Steps
        </h3>
        <ul className="space-y-2.5">
          {swot.action_steps.map((a: string, i: number) => (
            <li key={i} className="bg-[#09090d]/80 p-3.5 rounded-xl text-[12px] text-slate-200 border border-slate-800/60 flex items-center gap-3.5 leading-relaxed hover:border-indigo-500/20 transition-all">
              <span className="w-6 h-6 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 shadow-[0_0_8px_rgba(99,102,241,0.3)]">{i+1}</span>
              <span>{a}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Depletion Risks */}
      {depletionRisks && depletionRisks.length > 0 && (
        <div className="bg-gradient-to-b from-[#0c0c0e]/80 to-[#171212]/80 backdrop-blur-md border border-rose-500/15 rounded-2xl p-5 shadow-xl transition-all duration-300">
          <h3 className="text-rose-450 font-extrabold text-[13px] mb-3.5 flex items-center gap-2 text-rose-400 uppercase tracking-wider">
            <svg className="w-4 h-4 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 13.036h.008v.008H12v-.008z" />
            </svg>
            Critical Stock Depletion Risks
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {depletionRisks.map((risk: any, i: number) => (
              <div key={i} className="bg-[#09090d]/80 p-4 rounded-xl border border-rose-500/10 hover:border-rose-500/30 transition-all">
                <div className="flex justify-between items-start mb-3">
                  <span className="font-bold text-slate-200 text-[12.5px]">{risk.name}</span>
                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${risk.status === 'Critical' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                    {risk.status}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2.5">
                  <div>
                    <p className="text-[9px] text-slate-500 font-bold mb-0.5 uppercase tracking-wider">Current Stock</p>
                    <p className="font-semibold text-slate-350 text-[11px]">{risk.stock} units</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-500 font-bold mb-0.5 uppercase tracking-wider">Sales Velocity</p>
                    <p className="font-semibold text-slate-350 text-[11px]">{risk.sales_velocity_daily}/day</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-500 font-bold mb-0.5 uppercase tracking-wider">Supplier SLA</p>
                    <p className="font-semibold text-slate-350 text-[11px]">{risk.supplier_lead_days}d lead</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-[#1a1a22] flex justify-between items-center text-[11px]">
                  <span className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Estimated Stockout:</span>
                  <span className={`font-black ${risk.status === 'Critical' ? 'text-red-400' : 'text-amber-400'}`}>{risk.days_left} Days</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Map + Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 h-full overflow-x-auto w-full">
          <StoreLayoutMap 
            layoutConfig={layoutConfig} 
            recommendations={layoutRecommendations}
            hoveredRec={hoveredRec} 
            overflowCategories={overflowCategories}
            extraLinesNeeded={extraLinesNeeded}
            onHoverRecChange={setHoveredRec}
          />
        </div>

        {/* AI Recommendations */}
        <div className="bg-gradient-to-b from-[#0c0c0e]/80 to-[#171412]/80 backdrop-blur-md border border-amber-500/15 rounded-2xl p-5 flex flex-col justify-between shadow-xl transition-all duration-300">
          <div>
            <h3 className="text-amber-400 font-extrabold text-[13px] mb-1 flex items-center gap-2 uppercase tracking-wider">
              <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
              </svg>
              AI Shelf Optimization
            </h3>
            <p className="text-[10px] text-slate-500 mb-4 font-semibold uppercase tracking-wider">Hover over any card to visualize paths on layout.</p>
            
            <div className="space-y-2.5 overflow-y-auto max-h-[380px] pr-1 scrollbar-thin">
              {layoutRecommendations && layoutRecommendations.length > 0 ? (
                layoutRecommendations.map((rec: any, i: number) => (
                  <div 
                    key={i} 
                    onMouseEnter={() => setHoveredRec(rec)}
                    onMouseLeave={() => setHoveredRec(null)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all duration-200 ${
                      hoveredRec === rec 
                        ? 'bg-amber-500/5 border-amber-500/35 shadow-md shadow-amber-500/2' 
                        : 'bg-[#09090d]/80 border-[#1a1a24] hover:border-[#2a2a35]'
                    }`}
                  >
                    <h4 className="font-bold text-slate-200 text-[11px] mb-1.5 uppercase tracking-wide">{rec.title}</h4>
                    <p className="text-[10.5px] text-slate-400 leading-relaxed">
                      <span className="text-amber-400 font-semibold">Insight: </span>{rec.reason}
                    </p>
                    <div className="bg-[#050508]/80 p-2.5 rounded-lg border border-[#1a1a22] mt-2.5 text-[10px] text-slate-400 leading-relaxed">
                      <span className="font-bold text-orange-400/80 uppercase tracking-wider block text-[8px] mb-1">Placement Strategy</span>
                      {rec.placement_tip}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-[11px] text-slate-650 py-10 text-center font-bold uppercase tracking-wider">
                  No layout recommendations available. Run a diagnostic scan.
                </div>
              )}
            </div>
          </div>
          
          <div className="border-t border-[#1a1a22] pt-3 mt-4 text-[9px] text-slate-500 text-center font-bold uppercase tracking-wider">
            Hover over cards to preview placement paths.
          </div>
        </div>
      </div>
    </div>
  );
}
